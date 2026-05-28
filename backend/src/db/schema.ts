import { pgTable, serial, text, numeric, integer, timestamp } from 'drizzle-orm/pg-core';

export const salons = pgTable('salons', {
  id: serial('id').primaryKey(),
  placeId: text('place_id').unique().notNull(), // Google Place ID — deduplication key
  name: text('name').notNull(),
  address: text('address').notNull(),
  district: text('district').notNull(),
  phone: text('phone'),
  website: text('website'),
  rating: numeric('rating', { precision: 2, scale: 1 }),
  reviewCount: integer('review_count'),
  priceLevel: integer('price_level'), // 1–4 (Google scale)
  priceRange: text('price_range'), // Derived value e.g. "80–200 zł"
  services: text('services').array(), // Services list e.g. ["Haircut", "Color"]
  lat: numeric('lat', { precision: 9, scale: 6 }),
  lng: numeric('lng', { precision: 9, scale: 6 }),
  updatedAt: timestamp('updated_at').defaultNow(),
});
