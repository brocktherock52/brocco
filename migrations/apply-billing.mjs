import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import nextEnv from '@next/env';
import { neon } from '@neondatabase/serverless';

nextEnv.loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL must be configured before applying the billing migration.');
const sql = neon(process.env.DATABASE_URL);
for (const migration of ['./2026-10-07-billing-usage.sql', './2026-10-07-checkout-claims.sql']) {
  const path = fileURLToPath(new URL(migration, import.meta.url));
  const source = await readFile(path, 'utf8');
  const statements = source.split(';').map((statement) => statement.trim()).filter((statement) => statement && !/^(BEGIN|COMMIT)$/i.test(statement));
  await sql.transaction(statements.map((statement) => sql.query(statement)));
}
console.log('Billing customer links, trial claims, and hosted usage tables are ready.');
