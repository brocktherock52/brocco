// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/billing-customers', () => ({ linkedCustomerIds: vi.fn(), linkCustomer: vi.fn() }));
import { checkoutIntentResponse, prepareCheckoutIntent, readCheckoutIntent } from '@/lib/checkout-intent';

const origin = 'https://brocco.dev';
const request = (cookie?: string) => new Request(`${origin}/api/checkout/guest`, { headers: cookie ? { cookie } : undefined });
const cookieOf = (response: Response) => response.headers.get('set-cookie')!.split(';')[0];

beforeEach(() => {
  vi.stubEnv('AUTH_SECRET', 'test-only-secret-that-is-more-than-32-characters');
  vi.stubEnv('APP_URL', origin);
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-07T16:00:00Z'));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

describe('guest checkout browser proof', () => {
  it('uses a protected cookie that contains no account identity', async () => {
    const response = prepareCheckoutIntent(request());
    expect(await response.json()).toEqual({ prepared: true });
    expect(response.headers.get('set-cookie')).toMatch(/^__Host-brocco_checkout=/);
    for (const attribute of ['Path=/', 'HttpOnly', 'SameSite=Lax', 'Secure']) expect(response.headers.get('set-cookie')).toContain(attribute);
    expect(response.headers.get('set-cookie')).not.toContain('Domain=');
    const intent = readCheckoutIntent(request(cookieOf(response)));
    expect(intent?.id).toMatch(/^[a-f0-9]{48}$/);
    expect(Object.keys(intent!).sort()).toEqual(['expires', 'id']);
  });

  it('preserves the intent and fixed expiry when binding the Stripe customer', () => {
    const intent = readCheckoutIntent(request(cookieOf(prepareCheckoutIntent(request()))))!;
    vi.advanceTimersByTime(60_000);
    const response = checkoutIntentResponse(request(), { ...intent, customerId: 'cus_verified1' }, { url: 'https://checkout.stripe.com/c/pay/test' });
    expect(readCheckoutIntent(request(cookieOf(response)))).toEqual({ ...intent, customerId: 'cus_verified1' });
  });

  it('rejects a tampered payload, invalid signature bytes, and extra token parts', () => {
    const cookie = cookieOf(prepareCheckoutIntent(request()));
    const [nameAndPayload, signature] = cookie.split('.');
    const [name, payload] = nameAndPayload.split('=');
    const changed = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(payload, 'base64url').toString()), customerId: 'cus_attacker' })).toString('base64url');
    for (const forged of [`${name}=${changed}.${signature}`, `${nameAndPayload}.${'é'.repeat(43)}`, `${cookie}.extra`]) {
      expect(() => readCheckoutIntent(request(forged))).not.toThrow();
      expect(readCheckoutIntent(request(forged))).toBeNull();
    }
  });

  it('rejects expired browser proof and proof signed before secret rotation', () => {
    const cookie = cookieOf(prepareCheckoutIntent(request()));
    vi.advanceTimersByTime(30 * 24 * 60 * 60 * 1000 + 1);
    expect(readCheckoutIntent(request(cookie))).toBeNull();
    vi.setSystemTime(new Date('2026-10-07T16:00:00Z'));
    vi.stubEnv('AUTH_SECRET', 'a-different-test-only-secret-more-than-32-characters');
    expect(readCheckoutIntent(request(cookie))).toBeNull();
  });

  it('fails closed when the server signing secret is missing', () => {
    vi.stubEnv('AUTH_SECRET', '');
    expect(() => prepareCheckoutIntent(request())).toThrow('Secure checkout is temporarily unavailable.');
  });
});
