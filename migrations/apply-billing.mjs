import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import nextEnv from '@next/env';
import { neon } from '@neondatabase/serverless';

nextEnv.loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL must be configured before applying the billing migration.');
const path = fileURLToPath(new URL('./2026-10-07-billing-usage.sql', import.meta.url));
const source = await readFile(path, 'utf8');
const statements = source.split(';').map((statement) => statement.trim()).filter((statement) => statement && !/^(BEGIN|COMMIT)$/i.test(statement));
const sql = neon(process.env.DATABASE_URL);
await sql.transaction(statements.map((statement) => sql.query(statement)));
console.log('Billing customer links and hosted usage tables are ready.');
