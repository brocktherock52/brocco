/**
 * Better-auth server-side instance.
 *
 * Configures the magic-link flow over our Drizzle/Neon database. The
 * sendMagicLink hook reads RESEND_API_KEY (preferred) or POSTMARK_API_TOKEN
 * (fallback) at runtime; if neither is set we log the link to the server
 * console so local dev still works.
 *
 * Env required in prod:
 *   AUTH_SECRET            - 32+ random bytes, signs the session cookie
 *   DATABASE_URL           - Neon postgres connection (used by lib/db)
 *   NEXT_PUBLIC_BASE_URL   - eg https://brocco.dev, used to build magic links
 *   RESEND_API_KEY         - to send mail via Resend (recommended)
 *   EMAIL_FROM             - eg "Brocco <login@brocco.dev>"
 */
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { magicLink } from 'better-auth/plugins';
import { db } from './db';
import {
  users,
  sessions,
  accounts,
  verifications,
} from './db/schema';

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.BETTER_AUTH_URL ||
  'http://localhost:3000';

// True when we're serving over HTTPS (prod). We pin the secure-cookie decision
// off this rather than letting better-auth sniff the per-request protocol:
// behind Vercel's proxy the internal hop can look like http, which made
// better-auth SET a non-secure cookie name (better-auth.session_token) on some
// requests and look for the secure name (__Secure-better-auth.session_token)
// on others. That set/read prefix mismatch is why the session "did not stick."
// Pinning it to the public base URL's protocol makes the name deterministic.
const IS_HTTPS = BASE_URL.startsWith('https://');

async function sendMagicLinkEmail(email: string, url: string) {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'Brocco <login@brocco.dev>';
  const isProd = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';

  if (!resendKey) {
    if (isProd) {
      // Don't silently swallow in prod. The UI was showing "check your inbox"
      // while the email was never sent. Surface this as a real error so the
      // login form can render an actionable message.
      // eslint-disable-next-line no-console
      console.error('[auth] RESEND_API_KEY missing in production. Magic link NOT sent.');
      throw new Error(
        'Email transport is not configured. Please contact help@brocco.dev or set RESEND_API_KEY in Vercel project settings.',
      );
    }
    // eslint-disable-next-line no-console
    console.log(`[auth] (dev fallback) magic link for ${email}: ${url}`);
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: 'Your brocco.dev sign-in link',
      html: `
        <div style="font-family:Inter,sans-serif;background:#0A0A0F;color:#e7e7ea;padding:32px;border-radius:12px;max-width:480px;margin:0 auto;">
          <h2 style="margin:0 0 12px 0;font-weight:600;">sign in to brocco</h2>
          <p style="color:#a1a1aa;line-height:1.6;">click the link below to log in. it expires in 5 minutes and is single-use.</p>
          <p style="margin:28px 0;"><a href="${url}" style="display:inline-block;background:linear-gradient(90deg,#a78bfa,#67e8f9);color:#0A0A0F;font-weight:600;padding:12px 20px;border-radius:999px;text-decoration:none;">open brocco</a></p>
          <p style="color:#71717a;font-size:12px;line-height:1.6;">if you didn't ask for this, ignore the email. nothing happens until you click.</p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    // eslint-disable-next-line no-console
    console.error('[auth] resend send failed', body);
    throw new Error('Could not send the sign-in email. Please try again or contact help@brocco.dev.');
  }
}

export const auth = betterAuth({
  baseURL: BASE_URL,
  secret: process.env.AUTH_SECRET || 'dev-only-insecure-secret-change-me',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  emailAndPassword: {
    enabled: false,
  },
  user: {
    additionalFields: {
      plan: { type: 'string', defaultValue: 'free', required: false },
      lastSeenAt: { type: 'date', required: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh once a day
    // Cache the session in a short-lived signed cookie so getSession resolves
    // immediately after the magic-link callback without a race on the DB read.
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  advanced: {
    // Generate UUIDs for primary keys IN APP CODE. CRITICAL for two reasons:
    //   1. users.id / threads.id are Postgres `uuid` columns, but better-auth's
    //      default id generator returns a base32 string, which Postgres rejects
    //      on a uuid column ("invalid input syntax for type uuid").
    //   2. sessions.id / accounts.id / verifications.id are `text` PKs with NO
    //      DB default. The string form `generateId: "uuid"` makes better-auth
    //      insert `default` for the id and rely on the DB to fill it, which
    //      null-violates those text columns.
    // A FUNCTION (not the string "uuid") makes better-auth generate and SUPPLY a
    // real uuid string for EVERY table's id, which satisfies both the uuid
    // columns and the text columns. Without this, the magic-link verify step
    // 500'd on createUser/createSession and NO user could finish signing in.
    database: {
      generateId: () => crypto.randomUUID(),
    },
    // Deterministic secure-cookie decision (see IS_HTTPS note above). Without
    // this, the proxy protocol sniff could disagree between set and read and
    // the browser would never present the cookie back, so the session looked
    // like it never persisted.
    useSecureCookies: IS_HTTPS,
    defaultCookieAttributes: {
      sameSite: 'lax', // same-site magic-link callback, lax is correct + sticky
      secure: IS_HTTPS,
      httpOnly: true,
      path: '/',
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail(email, url);
      },
      expiresIn: 60 * 5, // 5 minutes
    }),
  ],
  trustedOrigins: [
    BASE_URL,
    'http://localhost:3000',
    'https://brocco.dev',
    'https://brocco-site.vercel.app',
  ],
});

export type Auth = typeof auth;
