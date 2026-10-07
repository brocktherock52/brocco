import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { BillingError, publicAppUrl } from './billing';

const MAX_AGE = 60 * 60 * 24 * 30;
const AUDIENCE = 'brocco-checkout-intent-v1:';
export interface CheckoutIntent { id: string; expires: number; customerId?: string }

function signature(payload: string): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new BillingError('billing_unavailable', 'Secure checkout is temporarily unavailable.');
  return createHmac('sha256', secret).update(AUDIENCE + payload).digest('base64url');
}

export function checkoutCookieName(req: Request): string {
  return publicAppUrl(req).startsWith('https:') ? '__Host-brocco_checkout' : 'brocco_checkout';
}

export function readCheckoutIntent(req: Request): CheckoutIntent | null {
  const value = req.headers.get('cookie')?.split(';').map((part) => part.trim())
    .find((part) => part.startsWith(`${checkoutCookieName(req)}=`))?.split('=')[1];
  if (!value || value.length > 600) return null;
  const [payload, supplied, extra] = value.split('.');
  if (!payload || !supplied || extra || !/^[a-zA-Z0-9_-]+$/.test(supplied)) return null;
  const expected = signature(payload);
  if (supplied.length !== expected.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString()) as CheckoutIntent;
    return /^[a-f0-9]{48}$/.test(parsed.id) && (!parsed.customerId || /^cus_[a-zA-Z0-9]+$/.test(parsed.customerId)) && Number.isFinite(parsed.expires) && parsed.expires > Date.now() && parsed.expires <= Date.now() + MAX_AGE * 1000
      ? parsed : null;
  } catch { return null; }
}

/** Bootstrap the cookie before creating a customer, so retries share Stripe's
 * idempotency key. The token carries no email or authentication identity. */
export function prepareCheckoutIntent(req: Request): Response {
  const intent: CheckoutIntent = { id: randomBytes(24).toString('hex'), expires: Date.now() + MAX_AGE * 1000 };
  return checkoutIntentResponse(req, intent, { prepared: true });
}

export function checkoutIntentResponse(req: Request, intent: CheckoutIntent, body: unknown): Response {
  const payload = Buffer.from(JSON.stringify(intent)).toString('base64url');
  const value = `${payload}.${signature(payload)}`;
  return Response.json(body, { headers: {
    'Cache-Control': 'no-store',
    'Set-Cookie': `${checkoutCookieName(req)}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}${publicAppUrl(req).startsWith('https:') ? '; Secure' : ''}`,
  } });
}
