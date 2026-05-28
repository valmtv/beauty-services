import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { config } from './config.js';
import { corsPlugin } from './plugins/cors.plugin.js';
import { swaggerPlugin } from './plugins/swagger.plugin.js';

import { z } from 'zod';

const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  },
}).withTypeProvider<ZodTypeProvider>();

// Setup Zod Validation compilers
fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

// Register core plugins
await fastify.register(corsPlugin);
await fastify.register(swaggerPlugin);

// Standard healthcheck route
fastify.get(
  '/health',
  {
    schema: {
      description: 'Healthcheck endpoint',
      response: {
        200: z.object({
          status: z.string(),
        }),
      },
    },
  },
  async () => {
    return { status: 'ok' };
  },
);

// Start server
const start = async () => {
  try {
    const address = await fastify.listen({
      port: config.PORT,
      host: '0.0.0.0', // Allow connections in docker environment
    });
    console.log(`🚀 Server listening at ${address}`);
    console.log(`📖 Swagger API Docs available at http://localhost:${config.PORT}/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
