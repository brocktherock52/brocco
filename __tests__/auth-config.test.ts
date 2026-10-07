import { afterEach, describe, expect, it, vi } from 'vitest';
import { exportPKCS8, generateKeyPair, jwtVerify } from 'jose';
import { getSocialProviderAvailability, getSocialProviders } from '@/lib/auth-config';
import { getAuthCallbackURL, getAuthPageURL } from '@/lib/auth-redirect';

afterEach(() => vi.useRealTimers());

function appleSecret(exp: number) {
  return `${btoa(JSON.stringify({ alg: 'ES256' }))}.${btoa(JSON.stringify({ exp }))}.signature`;
}

describe('social sign-in configuration', () => {
  it('does not enable a provider with missing or partial credentials', () => {
    expect(getSocialProviderAvailability({})).toEqual({ google: false, apple: false });
    expect(getSocialProviderAvailability({ GOOGLE_CLIENT_ID: 'client', APPLE_CLIENT_ID: 'service' }))
      .toEqual({ google: false, apple: false });
    expect(getSocialProviderAvailability({ GOOGLE_CLIENT_ID: 'client', GOOGLE_CLIENT_SECRET: '  ' }).google).toBe(false);
  });

  it('enables Google from server credentials without exposing them in availability', () => {
    const env = { GOOGLE_CLIENT_ID: 'web-client', GOOGLE_CLIENT_SECRET: 'server-only-secret' };
    expect(getSocialProviders(env).google).toEqual({ clientId: 'web-client', clientSecret: 'server-only-secret' });
    expect(getSocialProviderAvailability(env)).toEqual({ google: true, apple: false });
    expect(getSocialProviderAvailability({ GOOGLE_OAUTH_CLIENT_ID: 'gmail-client', GOOGLE_OAUTH_CLIENT_SECRET: 'gmail-secret' }).google).toBe(false);
  });

  it('disables Apple on localhost, HTTP, IP addresses and expired/malformed JWTs', () => {
    const now = Math.floor(Date.now() / 1000);
    const env = { APPLE_CLIENT_ID: 'service', APPLE_CLIENT_SECRET: appleSecret(now + 3600) };
    for (const origin of ['http://localhost:3000', 'https://localhost', 'https://127.0.0.1', 'http://brocco.dev', 'invalid']) {
      expect(getSocialProviderAvailability({ ...env, NEXT_PUBLIC_BASE_URL: origin }).apple).toBe(false);
    }
    expect(getSocialProviderAvailability({ ...env, NEXT_PUBLIC_BASE_URL: 'https://brocco.dev' }).apple).toBe(true);
    for (const secret of [appleSecret(now - 60), appleSecret(now + 30), 'not-a-jwt']) {
      expect(getSocialProviderAvailability({ ...env, NEXT_PUBLIC_BASE_URL: 'https://brocco.dev', APPLE_CLIENT_SECRET: secret }).apple).toBe(false);
    }
  });

  it('generates valid Apple secrets per request and refreshes their expiry', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-07T16:00:00Z'));
    const { privateKey, publicKey } = await generateKeyPair('ES256', { extractable: true });
    const env = {
      NEXT_PUBLIC_BASE_URL: 'https://brocco.dev',
      APPLE_CLIENT_ID: 'dev.brocco.web',
      APPLE_TEAM_ID: 'TEAM123',
      APPLE_KEY_ID: 'KEY123',
      APPLE_PRIVATE_KEY: (await exportPKCS8(privateKey)).replace(/\n/g, '\\n'),
    };
    const apple = getSocialProviders(env).apple;
    expect(getSocialProviderAvailability(env).apple).toBe(true);
    if (typeof apple !== 'function') throw new Error('Expected rotating Apple provider configuration');
    const first = await apple();
    const verified = await jwtVerify(first.clientSecret!, publicKey, {
      issuer: env.APPLE_TEAM_ID,
      subject: env.APPLE_CLIENT_ID,
      audience: 'https://appleid.apple.com',
    });
    expect(verified.protectedHeader).toMatchObject({ alg: 'ES256', kid: env.APPLE_KEY_ID });
    expect(verified.payload.exp! - verified.payload.iat!).toBe(3600);
    vi.setSystemTime(new Date('2026-10-08T16:00:00Z'));
    const refreshed = await apple();
    const refreshedClaims = await jwtVerify(refreshed.clientSecret!, publicKey);
    expect(refreshedClaims.payload.exp! - verified.payload.exp!).toBe(86400);
  });
});

describe('auth destinations', () => {
  it('defaults new signup to onboarding and returning login to the dashboard', () => {
    expect(getAuthCallbackURL(undefined, 'signup')).toBe('/start');
    expect(getAuthCallbackURL(undefined, 'login')).toBe('/app');
  });

  it('preserves the chosen plan and internal destination across sign-in methods', () => {
    const callbackURL = '/start?plan=team&interval=annual#checkout';
    expect(getAuthCallbackURL(callbackURL, 'signup')).toBe(callbackURL);
    const signup = new URL(getAuthPageURL('signup', callbackURL), 'https://brocco.dev');
    const login = new URL(getAuthPageURL('login', signup.searchParams.get('callbackURL')!), 'https://brocco.dev');
    expect(getAuthCallbackURL(login.searchParams.get('callbackURL'), 'login')).toBe(callbackURL);
  });

  it.each([
    'https://evil.example', '//evil.example', '/\\evil.example', 'javascript:alert(1)',
    '/\nevil.example', '/%2f%2fevil.example', '/%5cevil.example', '/%00invalid',
    ['/app', 'https://evil.example'], null, {},
  ])('rejects external or ambiguous destination %j', (value) => {
    expect(getAuthCallbackURL(value, 'signup')).toBe('/start');
  });
});
