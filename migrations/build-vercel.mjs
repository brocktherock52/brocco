import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

// Run the additive, idempotent schema update inside the deployment environment.
// Vercel keeps production credentials on its servers; never export them into logs.
await import('./apply-billing.mjs');
await import('./check-billing-webhook.mjs');
const require = createRequire(import.meta.url);
const build = spawnSync(process.execPath, [require.resolve('next/dist/bin/next'), 'build'], { stdio: 'inherit' });
process.exit(build.status ?? 1);
