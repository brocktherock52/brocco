import { NextResponse } from 'next/server';
import { exchangeCode } from '@/lib/oauth-google';

// Callback: /api/oauth/google/callback?code=...&state=...
// Verifies state, exchanges code for tokens, and (when KV is wired)
// persists refresh_token keyed by the authenticated user-id.
//
// For the v1 scaffold we log the success and redirect back to /app
// with a #connected=gmail (or calendar) hash so the dashboard can
// surface a "connected" toast.

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state') ?? '';
  const error = url.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${process.env.APP_URL ?? url.origin}/app#oauth_error=${error}`);
  }
  if (!code) {
    return NextResponse.json({ error: 'missing code' }, { status: 400 });
  }

  const cookieState = req.headers.get('cookie')?.match(/brocco_oauth_state=([^;]+)/)?.[1];
  if (!cookieState || cookieState !== state) {
    return NextResponse.json({ error: 'state mismatch' }, { status: 400 });
  }

  const product = state.split(':')[0]; // "gmail" or "calendar"
  const origin = process.env.APP_URL ?? url.origin;
  const redirectUri = `${origin}/api/oauth/google/callback`;

  try {
    const token = await exchangeCode(code, redirectUri);
    // TODO: persist token.refresh_token in KV keyed by user-id
    console.log('[oauth:google]', product, 'refresh_token present:', !!token.refresh_token);
  } catch (e) {
    return NextResponse.redirect(
      `${origin}/app#oauth_error=${encodeURIComponent(e instanceof Error ? e.message : 'unknown')}`,
    );
  }

  return NextResponse.redirect(`${origin}/app#connected=${product}`);
}
