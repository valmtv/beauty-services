import { z } from 'zod';

export const SalonListQuerySchema = z.object({
  district: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(20),
});

export type SalonListQuery = z.infer<typeof SalonListQuerySchema>;

export const SalonUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  website: z.string().url().nullable().or(z.string().length(0)).optional(), // allow valid url or empty/null
  services: z.array(z.string()).optional(),
  priceLevel: z.number().int().min(1).max(4).nullable().optional(),
  district: z.string().min(1).optional(),
});

export type SalonUpdateInput = z.infer<typeof SalonUpdateSchema>;

export const SalonResponseSchema = z.object({
  id: z.number(),
  placeId: z.string(),
  name: z.string(),
  address: z.string(),
  district: z.string(),
  phone: z.string().nullable(),
  website: z.string().nullable(),
  rating: z.string().nullable(),
  reviewCount: z.number().nullable(),
  priceLevel: z.number().nullable(),
  priceRange: z.string().nullable(),
  services: z.array(z.string()).nullable(),
  lat: z.string().nullable(),
  lng: z.string().nullable(),
  updatedAt: z.date().nullable().or(z.string().nullable()),
});

export const SalonListResponseSchema = z.object({
  data: z.array(SalonResponseSchema),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
});

export const DistinctDistrictsResponseSchema = z.array(z.string());
