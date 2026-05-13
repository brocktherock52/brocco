/**
 * Drizzle + Neon Postgres connection.
 *
 * Reads DATABASE_URL from env. In dev set it in .env.local; in prod set it
 * on the Vercel project. The Neon serverless driver works in both Node
 * (route handlers running on Node runtime) and edge contexts, so this
 * single client serves the entire app.
 */
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Don't throw at import time during build; throw on first use instead so
  // the marketing pages still prerender without a database.
  // eslint-disable-next-line no-console
  console.warn('[db] DATABASE_URL is not set. Auth + threads routes will 500 until it is.');
}

const sql = neon(connectionString || 'postgres://invalid:invalid@localhost/invalid');

export const db = drizzle(sql, { schema });
export { schema };
