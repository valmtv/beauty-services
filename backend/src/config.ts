import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from monorepo root deterministically, regardless of process working directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

let databaseUrl = process.env['DATABASE_URL'] || '';

// If running locally outside Docker network (IS_DOCKER is not set), translate service name to localhost
if (process.env['IS_DOCKER'] !== 'true' && databaseUrl.includes('@postgres:5432')) {
  const hostPort = process.env['POSTGRES_PORT'] || '5432';
  databaseUrl = databaseUrl.replace('@postgres:5432', `@localhost:${hostPort}`);
}

const configSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  POSTGRES_PORT: z.coerce.number().default(5432),
  IS_DOCKER: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
});

const parsed = configSchema.safeParse({
  ...process.env,
  DATABASE_URL: databaseUrl,
});

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;
