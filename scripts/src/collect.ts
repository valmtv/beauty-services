import { db } from './db.js';
import { salons } from '../../backend/src/db/schema.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const GOOGLE_PLACES_API_KEY = process.env['GOOGLE_PLACES_API_KEY'];

export const DISTRICTS = [
  { name: 'Śródmieście', lat: 52.2297, lng: 21.0122 },
  { name: 'Mokotów', lat: 52.1945, lng: 21.03 },
  { name: 'Praga-Południe', lat: 52.2297, lng: 21.08 },
  { name: 'Ursynów', lat: 52.15, lng: 21.05 },
  { name: 'Wola', lat: 52.233, lng: 20.97 },
  { name: 'Bemowo', lat: 52.25, lng: 20.92 },
  { name: 'Bielany', lat: 52.29, lng: 20.96 },
  { name: 'Targówek', lat: 52.28, lng: 21.07 },
  { name: 'Białołęka', lat: 52.33, lng: 21.03 },
  { name: 'Praga-Północ', lat: 52.255, lng: 21.06 },
  { name: 'Żoliborz', lat: 52.27, lng: 20.99 },
  { name: 'Ochota', lat: 52.215, lng: 20.98 },
  { name: 'Włochy', lat: 52.19, lng: 20.93 },
  { name: 'Ursus', lat: 52.195, lng: 20.89 },
  { name: 'Wilanów', lat: 52.165, lng: 21.09 },
  { name: 'Wawer', lat: 52.2, lng: 21.15 },
  { name: 'Wesoła', lat: 52.24, lng: 21.2 },
  { name: 'Rembertów', lat: 52.26, lng: 21.17 },
];

function getClosestDistrict(lat: number, lng: number): string {
  let minDistance = Infinity;
  let closest = DISTRICTS[0]!.name;

  for (const d of DISTRICTS) {
    const dist = Math.sqrt((lat - d.lat) ** 2 + (lng - d.lng) ** 2);
    if (dist < minDistance) {
      minDistance = dist;
      closest = d.name;
    }
  }
  return closest;
}

function mapPriceRange(priceLevel: number | null): string | null {
  if (priceLevel === null || priceLevel === undefined) return null;
  switch (priceLevel) {
    case 1:
      return 'under 80 zł';
    case 2:
      return '80–200 zł';
    case 3:
      return '200–400 zł';
    case 4:
      return '400+ zł';
    default:
      return null;
  }
}

function deriveServices(name: string, types: string[]): string[] {
  const normalized = name.toLowerCase();

  const isHair =
    normalized.includes('fryzjer') ||
    normalized.includes('fryzury') ||
    normalized.includes('hair') ||
    normalized.includes('barber') ||
    normalized.includes('cięcie') ||
    normalized.includes('czesanie') ||
    normalized.includes('salon fryzjerski') ||
    types.includes('hair_care');

  const isNail =
    normalized.includes('paznokcie') ||
    normalized.includes('nails') ||
    normalized.includes('manicure') ||
    normalized.includes('pedicure') ||
    normalized.includes('paznokci') ||
    normalized.includes('hybryda');

  const isBrows =
    normalized.includes('makeup') ||
    normalized.includes('makijaż') ||
    normalized.includes('brwi') ||
    normalized.includes('rzęsy') ||
    normalized.includes('brows') ||
    normalized.includes('lashes') ||
    normalized.includes('laminacja');

  if (isHair) {
    return [
      'Strzyżenie damskie',
      'Strzyżenie męskie',
      'Modelowanie',
      'Koloryzacja',
      'Pielęgnacja włosów',
    ];
  } else if (isNail) {
    return ['Manicure hybrydowy', 'Pedicure', 'Przedłużanie paznokci', 'Stylizacja paznokci'];
  } else if (isBrows) {
    return ['Makijaż okazjonalny', 'Stylizacja brwi', 'Laminacja rzęs', 'Henna pudrowa'];
  } else {
    return [
      'Masaż twarzy',
      'Zabieg nawilżający',
      'Oczyszczanie skóry',
      'Stylizacja brwi',
      'Manicure klasyczny',
    ];
  }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface PlaceResult {
  place_id: string;
  name: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

async function collect() {
  if (!GOOGLE_PLACES_API_KEY) {
    console.error('❌ GOOGLE_PLACES_API_KEY environment variable is missing.');
    console.error(
      '💡 Please set your Google Places API key in .env or run "npm run seed" to populate using the committed snapshot fallback.',
    );
    process.exit(1);
  }

  console.log(
    '🚀 Warsaw Beauty Salon Explorer - Starting Data Collection using Google Places API...',
  );
  const uniquePlaceIds = new Set<string>();
  const collectedSalons: Array<{
    placeId: string;
    name: string;
    address: string;
    district: string;
    phone: string | null;
    website: string | null;
    rating: string | null;
    reviewCount: number | null;
    priceLevel: number | null;
    priceRange: string | null;
    services: string[];
    lat: string;
    lng: string;
  }> = [];

  const types = ['beauty_salon', 'hair_care'];

  for (const district of DISTRICTS) {
    console.log(`\n🔍 Searching in district: ${district.name}...`);

    for (const searchType of types) {
      let pageToken: string | undefined = undefined;
      let pagesFetched = 0;

      do {
        let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${district.lat},${district.lng}&radius=3000&type=${searchType}&key=${GOOGLE_PLACES_API_KEY}`;
        if (pageToken) {
          url += `&pagetoken=${pageToken}`;
          // Google Nearby Search requires a short delay before the next page token becomes valid
          await sleep(2000);
        }

        try {
          const response = await fetch(url);
          const data = (await response.json()) as {
            results: PlaceResult[];
            next_page_token?: string;
            status: string;
            error_message?: string;
          };

          if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            console.error('Full API response:', JSON.stringify(data, null, 2));
            break;
          }

          const results = data.results || [];
          for (const place of results) {
            if (!place.place_id || uniquePlaceIds.has(place.place_id)) {
              continue;
            }
            uniquePlaceIds.add(place.place_id);

            // Fetch rich details for each unique place
            await sleep(150); // Rate limit protection delay
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,price_level,geometry,types&key=${GOOGLE_PLACES_API_KEY}`;

            try {
              const detailsRes = await fetch(detailsUrl);
              const detailsData = (await detailsRes.json()) as {
                result?: {
                  name?: string;
                  formatted_address?: string;
                  formatted_phone_number?: string;
                  website?: string;
                  rating?: number;
                  user_ratings_total?: number;
                  price_level?: number;
                  geometry?: {
                    location?: {
                      lat?: number;
                      lng?: number;
                    };
                  };
                  types?: string[];
                };
                status: string;
                error_message?: string;
              };

              if (detailsData.status !== 'OK' || !detailsData.result) {
                console.error(
                  `⚠️ Details fetch failed for place_id ${place.place_id}: ${detailsData.status}`,
                );
                continue;
              }

              const res = detailsData.result;
              const name = res.name || place.name;
              const address = res.formatted_address || 'Warsaw, Poland';
              const lat = res.geometry?.location?.lat ?? place.geometry.location.lat;
              const lng = res.geometry?.location?.lng ?? place.geometry.location.lng;

              const calculatedDistrict = getClosestDistrict(lat, lng);
              const priceLevel = res.price_level ?? null;
              const priceRange = mapPriceRange(priceLevel);
              const services = deriveServices(name, res.types || []);

              const salonData = {
                placeId: place.place_id,
                name,
                address,
                district: calculatedDistrict,
                phone: res.formatted_phone_number || null,
                website: res.website || null,
                rating: res.rating ? res.rating.toFixed(1) : null,
                reviewCount: res.user_ratings_total || null,
                priceLevel,
                priceRange,
                services,
                lat: lat.toFixed(6),
                lng: lng.toFixed(6),
              };

              collectedSalons.push(salonData);
              console.log(
                `   ✨ Collected: "${name}" in ${calculatedDistrict} (${priceRange || 'Price unavailable'})`,
              );
            } catch (err) {
              console.error(`❌ Details request failed for place_id ${place.place_id}:`, err);
            }
          }

          pageToken = data.next_page_token;
          pagesFetched++;
        } catch (err) {
          console.error(`❌ Search request failed in ${district.name}:`, err);
          break;
        }
      } while (pageToken && pagesFetched < 3);
    }
  }

  console.log(
    `\n✅ Data Collection finished. Total unique places collected: ${collectedSalons.length}`,
  );

  if (collectedSalons.length === 0) {
    console.log('⚠️ No salons collected. Database remains unchanged.');
    return;
  }

  console.log('💾 Upserting collected records to PostgreSQL database via Drizzle ORM...');

  let upsertsSuccess = 0;
  for (const item of collectedSalons) {
    try {
      await db
        .insert(salons)
        .values({
          placeId: item.placeId,
          name: item.name,
          address: item.address,
          district: item.district,
          phone: item.phone,
          website: item.website,
          rating: item.rating,
          reviewCount: item.reviewCount,
          priceLevel: item.priceLevel,
          priceRange: item.priceRange,
          services: item.services,
          lat: item.lat,
          lng: item.lng,
        })
        .onConflictDoUpdate({
          target: salons.placeId,
          set: {
            name: item.name,
            address: item.address,
            district: item.district,
            phone: item.phone,
            website: item.website,
            rating: item.rating,
            reviewCount: item.reviewCount,
            priceLevel: item.priceLevel,
            priceRange: item.priceRange,
            services: item.services,
            lat: item.lat,
            lng: item.lng,
            updatedAt: new Date(),
          },
        });
      upsertsSuccess++;
    } catch (err) {
      console.error(`❌ DB Upsert failed for salon "${item.name}":`, err);
    }
  }

  console.log(
    `🎉 Database seeding/collection complete! Upserted ${upsertsSuccess}/${collectedSalons.length} salons.`,
  );

  // Self-update the snapshot file to ensure it's always high-fidelity if the user collects new data!
  const snapshotPath = path.resolve(__dirname, '../data/salons.json');
  try {
    const dataDir = path.dirname(snapshotPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(snapshotPath, JSON.stringify(collectedSalons, null, 2), 'utf-8');
    console.log(`📸 Updated data snapshot at: ${snapshotPath}`);
  } catch (err) {
    console.error('⚠️ Could not update local JSON snapshot file:', err);
  }
}

collect().catch((err) => {
  console.error('💥 Fatal error in collection script:', err);
  process.exit(1);
});
