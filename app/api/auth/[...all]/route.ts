/**
 * Better-auth catch-all handler. Routes /api/auth/* through the configured
 * auth instance. Uses Node runtime because better-auth + the Neon driver
 * are happiest there.
 */
import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

export const { GET, POST } = toNextJsHandler(auth);
