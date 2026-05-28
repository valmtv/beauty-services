import { salonsRepository } from './salons.repository.js';
import type { SalonListQuery, SalonUpdateInput } from './salons.schema.js';
import { salons } from '../../db/schema.js';

export class SalonsService {
  async listSalons(query: SalonListQuery) {
    const { data, total } = await salonsRepository.findAndCount(query);
    const totalPages = Math.max(1, Math.ceil(total / query.limit));

    return {
      data,
      total,
      page: query.page,
      totalPages,
    };
  }

  async getDistinctDistricts(): Promise<string[]> {
    return salonsRepository.findDistinctDistricts();
  }

  async getSalonById(id: number) {
    return salonsRepository.findById(id);
  }

  async updateSalon(id: number, input: SalonUpdateInput) {
    const updateData = { ...input } as Record<string, unknown>;

    // Business Logic: If priceLevel is explicitly updated, derive the corresponding priceRange string
    if ('priceLevel' in input) {
      if (input.priceLevel === null || input.priceLevel === undefined) {
        updateData['priceRange'] = null;
      } else {
        switch (input.priceLevel) {
          case 1:
            updateData['priceRange'] = 'under 80 zł';
            break;
          case 2:
            updateData['priceRange'] = '80–200 zł';
            break;
          case 3:
            updateData['priceRange'] = '200–400 zł';
            break;
          case 4:
            updateData['priceRange'] = '400+ zł';
            break;
          default:
            updateData['priceRange'] = null;
        }
      }
    }

    return salonsRepository.update(id, updateData as Partial<typeof salons.$inferInsert>);
  }
}

export const salonsService = new SalonsService();
