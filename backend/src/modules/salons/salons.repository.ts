import { and, eq, sql, desc, count } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { salons } from '../../db/schema.js';
import type { SalonListQuery } from './salons.schema.js';

export class SalonsRepository {
  async findAndCount(query: SalonListQuery) {
    const { district, search, page, limit } = query;
    const conditions = [];

    if (district) {
      conditions.push(eq(salons.district, district));
    }

    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        sql`(${salons.name} ILIKE ${searchPattern} OR ${salons.address} ILIKE ${searchPattern} OR array_to_string(${salons.services}, ',') ILIKE ${searchPattern})`,
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count matching conditions
    const countResult = await db.select({ total: count() }).from(salons).where(whereClause);
    const total = countResult[0]?.total || 0;

    // Get paginated data
    const data = await db
      .select()
      .from(salons)
      .where(whereClause)
      // High-quality sorting: highest rating first, fallback to highest review count, then id
      .orderBy(
        sql`${salons.rating} desc nulls last`,
        sql`${salons.reviewCount} desc nulls last`,
        salons.id,
      )
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      data,
      total,
    };
  }

  async findDistinctDistricts(): Promise<string[]> {
    const result = await db
      .selectDistinct({ district: salons.district })
      .from(salons)
      .orderBy(salons.district);

    return result.map((r) => r.district);
  }

  async findById(id: number) {
    const result = await db.select().from(salons).where(eq(salons.id, id)).limit(1);

    return result[0] || null;
  }

  async update(id: number, data: Partial<typeof salons.$inferInsert>) {
    const result = await db
      .update(salons)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(salons.id, id))
      .returning();

    return result[0] || null;
  }
}

export const salonsRepository = new SalonsRepository();
