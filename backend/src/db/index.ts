import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { config } from '../config.js';
import * as schema from './schema.js';

const { Pool } = pg;

let connectionString = config.DATABASE_URL;

// If running locally outside Docker network, translate service name to localhost
if (connectionString.includes('@postgres:5432')) {
  const hostPort = process.env['POSTGRES_PORT'] || '5432';
  connectionString = connectionString.replace('@postgres:5432', `@localhost:${hostPort}`);
}

export const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });
