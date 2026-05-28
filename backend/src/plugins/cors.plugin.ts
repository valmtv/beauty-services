import fp from 'fastify-plugin';
import cors from '@fastify/cors';

export const corsPlugin = fp(async (fastify) => {
  await fastify.register(cors, {
    origin: true, // Allow all origins for this local exploration task
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });
});
