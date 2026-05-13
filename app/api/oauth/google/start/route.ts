import { NextResponse } from 'next/server';
import { buildAuthUrl, type GoogleProduct } from '@/lib/oauth-google';

// Kickoff route: /api/oauth/google/start?product=gmail|calendar
// Redirects the browser to Google's consent screen. Returning user lands
// at /api/oauth/google/callback with `?code=...`.
//
// Setup: add GOOGLE_OAUTH_CLIENT_ID + GOOGLE_OAUTH_CLIENT_SECRET in
// Vercel env and register https://brocco.dev/api/oauth/google/callback
// as an authorized redirect URI in Google Cloud Console.

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const product = (url.searchParams.get('product') ?? 'gmail') as GoogleProduct;
  if (product !== 'gmail' && product !== 'calendar') {
    return NextResponse.json({ error: 'invalid product' }, { status: 400 });
  }
  if (!process.env.GOOGLE_OAUTH_CLIENT_ID) {
    return NextResponse.json(
      {
        error: 'oauth not configured',
        detail: 'Set GOOGLE_OAUTH_CLIENT_ID + GOOGLE_OAUTH_CLIENT_SECRET in Vercel env.',
      },
      { status: 503 },
    );
  }
  const origin = process.env.APP_URL ?? `${url.protocol}//${url.host}`;
  const redirectUri = `${origin}/api/oauth/google/callback`;
  const state = `${product}:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
  const target = buildAuthUrl(product, redirectUri, state);
  // Store state in a cookie so the callback can verify it
  const resp = NextResponse.redirect(target);
  resp.cookies.set('brocco_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  return resp;
}
