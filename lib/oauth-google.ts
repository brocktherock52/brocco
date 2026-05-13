// Google OAuth helpers (shared by Gmail + Calendar routes).
// Reads GOOGLE_OAUTH_CLIENT_ID + GOOGLE_OAUTH_CLIENT_SECRET from env.
// User configures redirect URI to https://brocco.dev/api/oauth/google/callback
// in Google Cloud Console.

const GOOGLE_AUTH = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN = 'https://oauth2.googleapis.com/token';

const SCOPES = {
  gmail: [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/userinfo.email',
  ],
  calendar: [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email',
  ],
} as const;

export type GoogleProduct = keyof typeof SCOPES;

export function buildAuthUrl(product: GoogleProduct, redirectUri: string, state: string): string {
  const u = new URL(GOOGLE_AUTH);
  u.searchParams.set('client_id', process.env.GOOGLE_OAUTH_CLIENT_ID ?? '');
  u.searchParams.set('redirect_uri', redirectUri);
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('access_type', 'offline');
  u.searchParams.set('prompt', 'consent');
  u.searchParams.set('include_granted_scopes', 'true');
  u.searchParams.set('scope', SCOPES[product].join(' '));
  u.searchParams.set('state', state);
  return u.toString();
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: 'Bearer';
}

export async function exchangeCode(code: string, redirectUri: string): Promise<TokenResponse> {
  const params = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID ?? '',
    client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? '',
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });
  const r = await fetch(GOOGLE_TOKEN, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`google token exchange failed: ${r.status} ${t}`);
  }
  return (await r.json()) as TokenResponse;
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID ?? '',
    client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? '',
    grant_type: 'refresh_token',
  });
  const r = await fetch(GOOGLE_TOKEN, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  if (!r.ok) {
    throw new Error(`google token refresh failed: ${r.status}`);
  }
  return (await r.json()) as TokenResponse;
}
