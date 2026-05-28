import { db } from './db.js';
import { salons } from '../../backend/src/db/schema.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SalonSnapshotItem {
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
}

async function seed() {
  console.log('🌱 Starting fallback database seeder using committed snapshot data...');
  const snapshotPath = path.resolve(__dirname, '../data/salons.json');

  if (!fs.existsSync(snapshotPath)) {
    console.error(`❌ Snapshot file not found at: ${snapshotPath}`);
    console.error('💡 Please verify that the file scripts/data/salons.json exists.');
    process.exit(1);
  }

  const rawData = fs.readFileSync(snapshotPath, 'utf-8');
  let salonsList: SalonSnapshotItem[] = [];

  try {
    salonsList = JSON.parse(rawData) as SalonSnapshotItem[];
  } catch (err) {
    console.error('❌ Failed to parse snapshot JSON file:', err);
    process.exit(1);
  }

  console.log(`📖 Loaded ${salonsList.length} salons from snapshot file.`);

  if (salonsList.length === 0) {
    console.log('⚠️ Snapshot is empty. Database remains unchanged.');
    return;
  }

  console.log('💾 Seeding/upserting records to PostgreSQL database via Drizzle ORM...');

  let seedSuccess = 0;
  for (const item of salonsList) {
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
      seedSuccess++;
    } catch (err) {
      console.error(`❌ DB Seeding failed for salon "${item.name}":`, err);
    }
  }

  console.log(
    `\n🎉 Seeding complete! Successfully seeded/upserted ${seedSuccess}/${salonsList.length} salons in PostgreSQL.`,
  );
  process.exit(0);
}

seed().catch((err) => {
  console.error('💥 Fatal error in seed script:', err);
  process.exit(1);
});
