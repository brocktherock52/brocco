/**
 * /api/__test/last-magic-link
 *
 * Dev/test-only helper. Returns the most recent unconsumed magic-link
 * verification value for a given email, so the Playwright E2E test can
 * follow the link without needing a live email inbox.
 *
 * Hard-gated: returns 404 unless ALLOW_TEST_ENDPOINTS=1 is set. NEVER set
 * that flag in production.
 */
import { NextRequest, NextResponse } from 'next/server';
import { desc, like } from 'drizzle-orm';
import { db } from '@/lib/db';
import { verifications } from '@/lib/db/schema';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  // Hard production kill-switch. This endpoint returns a working magic-link
  // verify URL for any email, so it must NEVER be reachable in production no
  // matter what ALLOW_TEST_ENDPOINTS is set to (a stray flag, or a preview that
  // shares the prod DB, would otherwise be a universal account-takeover hole).
  if (process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  if (process.env.ALLOW_TEST_ENDPOINTS !== '1') {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const email = req.nextUrl.searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'email_required' }, { status: 400 });
  }

  // better-auth 1.6.11 magic-link stores the row as identifier = the raw token
  // and value = JSON {"email","name"} (NOT identifier = email). So match the
  // email inside `value` and use `identifier` as the token.
  const rows = await db
    .select()
    .from(verifications)
    .where(like(verifications.value, `%"email":"${email}"%`))
    .orderBy(desc(verifications.createdAt))
    .limit(1);

  if (rows.length === 0) {
    return NextResponse.json({ error: 'no_pending_link' }, { status: 404 });
  }

  const v = rows[0];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  // better-auth magic-link verification path. The token is the row identifier.
  const url = `${baseUrl}/api/auth/magic-link/verify?token=${encodeURIComponent(v.identifier)}&callbackURL=/app`;
  return NextResponse.json({ url, expiresAt: v.expiresAt });
}
