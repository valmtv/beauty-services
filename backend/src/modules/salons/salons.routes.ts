import type { FastifyInstance } from 'fastify';
import { salonsService } from './salons.service.js';
import {
  SalonListQuerySchema,
  SalonUpdateSchema,
  SalonListResponseSchema,
  DistinctDistrictsResponseSchema,
  SalonResponseSchema,
} from './salons.schema.js';
import { z } from 'zod';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';

export async function salonRoutes(fastify: FastifyInstance) {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();

  // GET /salons - Paginated listing with filtering/searching
  typedFastify.get(
    '/salons',
    {
      schema: {
        description:
          'Get a paginated list of beauty salons with district and keyword search filters',
        tags: ['salons'],
        querystring: SalonListQuerySchema,
        response: {
          200: SalonListResponseSchema,
        },
      },
    },
    async (request) => {
      return salonsService.listSalons(request.query);
    },
  );

  // GET /salons/districts - Unique district names
  typedFastify.get(
    '/salons/districts',
    {
      schema: {
        description: 'Get all distinct district names currently represented in the database',
        tags: ['salons'],
        response: {
          200: DistinctDistrictsResponseSchema,
        },
      },
    },
    async () => {
      return salonsService.getDistinctDistricts();
    },
  );

  // GET /salons/:id - Retrieve detailed salon info
  typedFastify.get(
    '/salons/:id',
    {
      schema: {
        description: 'Get full details of a specific beauty salon by its integer ID',
        tags: ['salons'],
        params: z.object({
          id: z.coerce.number().int().positive(),
        }),
        response: {
          200: SalonResponseSchema,
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const salon = await salonsService.getSalonById(id);
      if (!salon) {
        return reply.status(404).send({ message: `Salon with ID ${id} not found` });
      }
      return salon;
    },
  );

  // PATCH /salons/:id - Update editable fields of a specific salon
  typedFastify.patch(
    '/salons/:id',
    {
      schema: {
        description: 'Update the editable fields of a specific beauty salon',
        tags: ['salons'],
        params: z.object({
          id: z.coerce.number().int().positive(),
        }),
        body: SalonUpdateSchema,
        response: {
          200: SalonResponseSchema,
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const existing = await salonsService.getSalonById(id);
      if (!existing) {
        return reply.status(404).send({ message: `Salon with ID ${id} not found` });
      }

      const updated = await salonsService.updateSalon(id, request.body);
      if (!updated) {
        return reply.status(404).send({ message: `Salon with ID ${id} not found` });
      }
      return updated;
    },
  );
}
