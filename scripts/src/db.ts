import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../../backend/src/db/schema.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

let connectionString = process.env['DATABASE_URL'];

if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is missing.');
  process.exit(1);
}

// Security: Check if running locally on host and URL references the docker container service name.
// When running scripts on the host, the "postgres" host (within docker network) is not resolvable.
// Translate the service name to localhost and the container port 5432 to POSTGRES_PORT (e.g., 5433).
if (connectionString.includes('@postgres:5432')) {
  const hostPort = process.env['POSTGRES_PORT'] || '5432';
  console.log(
    `🔌 Translating container connection URL to localhost:${hostPort} for local execution`,
  );
  connectionString = connectionString.replace('@postgres:5432', `@localhost:${hostPort}`);
}

const { Pool } = pg;
const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });
