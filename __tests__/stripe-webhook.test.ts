/* Smoke tests for the Stripe webhook route.
   Verifies the critical fixes from the eng review:
     - signature verification with constant-time compare
     - timestamp tolerance (replay protection)
     - idempotency on event.id
     - 503 when secret not configured
     - 400 when stripe-signature header missing
   Mocks Stripe's signature format: t=<timestamp>,v1=<hex-hmac>
*/
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { POST } from '@/app/api/stripe-webhook/route';

const SECRET = 'whsec_test_secret_do_not_use_in_prod';

async function signPayload(secret: string, payload: string, ts: number): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(`${ts}.${payload}`));
  const sigHex = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `t=${ts},v1=${sigHex}`;
}

function makeEvent(id = 'evt_test_1', type = 'checkout.session.completed') {
  return {
    id,
    type,
    data: { object: { id: 'cs_test_xyz', customer: 'cus_test', amount_total: 4900, currency: 'usd' } },
    created: Math.floor(Date.now() / 1000),
  };
}

function makeRequest(payload: string, signature: string): Request {
  return new Request('https://example.com/api/stripe-webhook', {
    method: 'POST',
    headers: { 'stripe-signature': signature, 'content-type': 'application/json' },
    body: payload,
  });
}

describe('POST /api/stripe-webhook', () => {
  const originalEnv = process.env.STRIPE_WEBHOOK_SECRET;

  beforeEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = SECRET;
  });

  afterEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = originalEnv;
    vi.useRealTimers();
  });

  it('503 when STRIPE_WEBHOOK_SECRET is not configured', async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const resp = await POST(makeRequest('{}', 't=1,v1=deadbeef'));
    expect(resp.status).toBe(503);
  });

  it('400 when stripe-signature header is missing', async () => {
    const req = new Request('https://example.com/api/stripe-webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    });
    const resp = await POST(req);
    expect(resp.status).toBe(400);
  });

  it('400 when signature is malformed', async () => {
    const resp = await POST(makeRequest('{}', 'garbage'));
    expect(resp.status).toBe(400);
  });

  it('400 when signature is invalid (HMAC mismatch)', async () => {
    const payload = JSON.stringify(makeEvent());
    const ts = Math.floor(Date.now() / 1000);
    const goodSig = await signPayload(SECRET, payload, ts);
    // Tamper with the v1 hex
    const tamperedSig = goodSig.replace(/v1=[a-f0-9]+/, 'v1=' + 'f'.repeat(64));
    const resp = await POST(makeRequest(payload, tamperedSig));
    expect(resp.status).toBe(400);
  });

  it('rejects events older than 5 minutes (replay protection)', async () => {
    const payload = JSON.stringify(makeEvent());
    const sixMinutesAgo = Math.floor(Date.now() / 1000) - 360;
    const sig = await signPayload(SECRET, payload, sixMinutesAgo);
    const resp = await POST(makeRequest(payload, sig));
    expect(resp.status).toBe(400);
    const text = await resp.text();
    expect(text).toMatch(/too old/i);
  });

  it('rejects future-dated events too', async () => {
    const payload = JSON.stringify(makeEvent());
    const futureTs = Math.floor(Date.now() / 1000) + 360;
    const sig = await signPayload(SECRET, payload, futureTs);
    const resp = await POST(makeRequest(payload, sig));
    expect(resp.status).toBe(400);
  });

  it('200 on valid signature within tolerance window', async () => {
    const payload = JSON.stringify(makeEvent('evt_valid_1'));
    const ts = Math.floor(Date.now() / 1000);
    const sig = await signPayload(SECRET, payload, ts);
    const resp = await POST(makeRequest(payload, sig));
    expect(resp.status).toBe(200);
  });

  it('idempotent: duplicate event.id returns 200 but does not double-process', async () => {
    const event = makeEvent('evt_dup_1');
    const payload = JSON.stringify(event);
    const ts = Math.floor(Date.now() / 1000);
    const sig = await signPayload(SECRET, payload, ts);

    const first = await POST(makeRequest(payload, sig));
    expect(first.status).toBe(200);

    // Resign with current time so the dedupe (not the timestamp window) is the gate.
    const ts2 = Math.floor(Date.now() / 1000);
    const sig2 = await signPayload(SECRET, payload, ts2);
    const second = await POST(makeRequest(payload, sig2));
    expect(second.status).toBe(200);
    const body = await second.text();
    expect(body).toMatch(/duplicate/i);
  });

  it('400 when body is not valid JSON', async () => {
    const payload = 'not json';
    const ts = Math.floor(Date.now() / 1000);
    const sig = await signPayload(SECRET, payload, ts);
    const resp = await POST(makeRequest(payload, sig));
    expect(resp.status).toBe(400);
  });

  it('handles subscription lifecycle events without throwing', async () => {
    for (const type of [
      'invoice.payment_succeeded',
      'invoice.payment_failed',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
    ]) {
      const payload = JSON.stringify(makeEvent(`evt_${type}`, type));
      const ts = Math.floor(Date.now() / 1000);
      const sig = await signPayload(SECRET, payload, ts);
      const resp = await POST(makeRequest(payload, sig));
      expect(resp.status, `event type ${type} should return 200`).toBe(200);
    }
  });
});
