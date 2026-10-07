import type { BetterAuthOptions } from 'better-auth';
import { decodeJwt, importPKCS8, SignJWT } from 'jose';

type AuthEnvironment = Record<string, string | undefined>;
export type SignInProvider = 'google' | 'apple';
export type SocialProviderAvailability = Record<SignInProvider, boolean>;

export function getAuthBaseURL(env: AuthEnvironment = process.env): string {
  return env.NEXT_PUBLIC_BASE_URL || env.BETTER_AUTH_URL || 'http://localhost:3000';
}

function supportsAppleWebSignIn(baseURL: string): boolean {
  try {
    const url = new URL(baseURL);
    return url.protocol === 'https:' &&
      url.hostname !== 'localhost' && !url.hostname.endsWith('.localhost') &&
      !/^[\d.]+$/.test(url.hostname) && !url.hostname.includes(':');
  } catch {
    return false;
  }
}

function hasUnexpiredAppleSecret(secret: string | undefined): secret is string {
  if (!secret) return false;
  try {
    const { exp } = decodeJwt(secret);
    return typeof exp === 'number' && exp > Math.floor(Date.now() / 1000) + 60;
  } catch {
    return false;
  }
}

/** Server-only credentials. Pass only getSocialProviderAvailability() to the UI. */
export function getSocialProviders(env: AuthEnvironment = process.env): NonNullable<BetterAuthOptions['socialProviders']> {
  const providers: NonNullable<BetterAuthOptions['socialProviders']> = {};
  const googleClientId = env.GOOGLE_CLIENT_ID?.trim();
  const googleClientSecret = env.GOOGLE_CLIENT_SECRET?.trim();
  if (googleClientId && googleClientSecret) {
    providers.google = { clientId: googleClientId, clientSecret: googleClientSecret };
  }

  const clientId = env.APPLE_CLIENT_ID?.trim();
  const teamId = env.APPLE_TEAM_ID?.trim();
  const keyId = env.APPLE_KEY_ID?.trim();
  const privateKey = env.APPLE_PRIVATE_KEY?.trim().replace(/\\n/g, '\n');
  if (clientId && supportsAppleWebSignIn(getAuthBaseURL(env))) {
    if (teamId && keyId && privateKey) {
      // Better Auth resolves async provider options per request. Mint short-lived
      // Apple secrets so a copied six-month JWT cannot silently expire in prod.
      providers.apple = async () => {
        const key = await importPKCS8(privateKey, 'ES256');
        const now = Math.floor(Date.now() / 1000);
        const clientSecret = await new SignJWT({})
          .setProtectedHeader({ alg: 'ES256', kid: keyId })
          .setIssuer(teamId)
          .setSubject(clientId)
          .setAudience('https://appleid.apple.com')
          .setIssuedAt(now)
          .setExpirationTime(now + 60 * 60)
          .sign(key);
        return { clientId, clientSecret };
      };
    } else if (hasUnexpiredAppleSecret(env.APPLE_CLIENT_SECRET)) {
      providers.apple = { clientId, clientSecret: env.APPLE_CLIENT_SECRET };
    }
  }
  return providers;
}

export function getSocialProviderAvailability(env: AuthEnvironment = process.env): SocialProviderAvailability {
  const providers = getSocialProviders(env);
  return { google: Boolean(providers.google), apple: Boolean(providers.apple) };
}
