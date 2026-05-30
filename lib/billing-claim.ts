/**
 * Server-side "claim" flow that links a completed Stripe Checkout to a real,
 * signed-in better-auth session.
 *
 * THE BUG THIS FIXES: checkout let a logged-out visitor pay, but nothing ever
 * created an account or an auth session, so after subscribing the app still
 * showed "sign in". Stripe and better-auth were completely disconnected
 * (the webhook was all TODOs, and /billing/success was a static page). After a
 * successful checkout Stripe redirects to /billing/success?session_id=...;
 * this module turns that session_id into an authenticated session.
 *
 * HOW: we re-fetch the Checkout Session from Stripe (so the email is
 * Stripe-verified and a forged session_id can't log someone in as another
 * user), upsert the user with the right plan, then mint a real better-auth
 * magic-link verification row and return its verify URL. Redirecting the
 * browser to that URL runs better-auth's own /api/auth/magic-link/verify
 * endpoint, which creates the session cookie and lands the user on /app , 
 * already signed in, no email round-trip (so it works even if email delivery
 * is down).
 *
 * COUPLING NOTE: we write the verification row in the exact shape better-auth's
 * magic-link plugin uses (identifier = the raw token, value = JSON {email,name})
 * because the plugin stores tokens in plaintext (storeToken: "plain", the
 * default, which lib/auth.ts does not override) and the verify endpoint looks
 * the row up by identifier. If that option is ever set to "hashed", this must
 * hash the token before storing. Ref:
 * node_modules/better-auth/dist/plugins/magic-link/index.mjs.
 */
import { db } from './db';
import { users, verifications } from './db/schema';

const STRIPE_API = 'https://api.stripe.com/v1';
const TOKEN_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export interface ClaimResult {
  ok: boolean;
  verifyUrl?: string;
  email?: string;
  plan?: string;
  reason?: string;
}

/** Map a Stripe price id back to our plan tier via the STRIPE_PRICE_* envs. */
function tierFromPrice(priceId: string | null | undefined): string | null {
  if (!priceId) return null;
  for (const tier of ['solo', 'team']) {
    for (const interval of ['monthly', 'annual']) {
      const env = process.env[`STRIPE_PRICE_${tier.toUpperCase()}_${interval.toUpperCase()}`];
      if (env && env === priceId) return tier;
    }
  }
  return null;
}

/** 32-char a-zA-Z token, matching the plugin's generateRandomString(32). */
function randomToken(len = 32): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < len; i++) out += TOKEN_ALPHABET[bytes[i] % TOKEN_ALPHABET.length];
  return out;
}

/**
 * Validate a Stripe checkout session and durably record the paying user.
 * Shared by the success-page claim flow and the webhook backstop so a buyer
 * gets an account + plan even if they close the tab before /billing/success
 * loads. Returns the verified email + plan, or null if the session isn't a
 * real completed checkout.
 */
export async function recordPaidCheckout(
  sessionId: string,
): Promise<{ email: string; tier: string } | null> {
  const apiKey = process.env.STRIPE_API_KEY;
  if (!apiKey) return null;
  if (!sessionId || !sessionId.startsWith('cs_')) return null;

  // Re-fetch from Stripe so the email is authoritative, never trust the URL.
  const resp = await fetch(
    `${STRIPE_API}/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=line_items`,
    { headers: { Authorization: `Bearer ${apiKey}` } },
  );
  if (!resp.ok) return null;
  const cs = (await resp.json()) as {
    status?: string;
    customer_details?: { email?: string };
    customer_email?: string;
    line_items?: { data?: { price?: { id?: string } }[] };
  };
  // A completed checkout (incl. trial subscriptions with no immediate charge)
  // has status "complete". That's the gate, not payment_status, which is
  // "no_payment_required" during a free trial.
  if (cs.status !== 'complete') return null;
  const email = (cs.customer_details?.email || cs.customer_email || '').trim().toLowerCase();
  if (!email) return null;
  const tier = tierFromPrice(cs.line_items?.data?.[0]?.price?.id) || 'solo';

  // Upsert the paying user with the right plan (covers brand-new buyers and
  // returning ones). better-auth's verify endpoint will find this row by email
  // and just create a session for it.
  await db
    .insert(users)
    .values({ email, plan: tier, emailVerified: true })
    .onConflictDoUpdate({
      target: users.email,
      set: { plan: tier, emailVerified: true, updatedAt: new Date() },
    });

  return { email, tier };
}

export async function claimCheckoutSession(sessionId: string): Promise<ClaimResult> {
  if (!process.env.STRIPE_API_KEY) return { ok: false, reason: 'stripe_unconfigured' };

  let paid: { email: string; tier: string } | null;
  try {
    paid = await recordPaidCheckout(sessionId);
  } catch (e) {
    console.error('[billing-claim] recordPaidCheckout failed', e);
    return { ok: false, reason: 'db_error' };
  }
  if (!paid) return { ok: false, reason: 'not_complete' };
  const { email, tier } = paid;

  // Mint a magic-link verification row in the plugin's native shape, then hand
  // back the verify URL. Redirecting the browser there signs the user in.
  const token = randomToken(32);
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://brocco.dev';
  try {
    await db.insert(verifications).values({
      id: crypto.randomUUID(),
      identifier: token,
      value: JSON.stringify({ email, name: '' }),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });
  } catch (e) {
    console.error('[billing-claim] verification insert failed', e);
    return { ok: false, reason: 'db_error', email };
  }
  const verifyUrl =
    `${base}/api/auth/magic-link/verify?token=${encodeURIComponent(token)}` +
    `&callbackURL=${encodeURIComponent('/app')}`;
  return { ok: true, verifyUrl, email, plan: tier };
}
