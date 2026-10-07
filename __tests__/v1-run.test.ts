/* Smoke tests for /api/v1/run.
   Covers the critical fixes from the eng review:
     - validation envelope on bad input
     - rate-limit envelope when cookie is set
     - 503 demo_offline when ANTHROPIC_API_KEY is not configured
     - request_id surfaced on every error
*/
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from '@/app/api/v1/run/route';
import { requireToolAccess } from '@/lib/billing-access';

vi.mock('@/lib/billing-access', () => ({ requireToolAccess: vi.fn(async () => null) }));

function makeRequest(body: unknown, cookie?: string): Request {
  const headers: HeadersInit = { 'content-type': 'application/json' };
  if (cookie) headers.cookie = cookie;
  return new Request('https://example.com/api/v1/run', {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('POST /api/v1/run', () => {
  const originalKey = process.env.ANTHROPIC_API_KEY;

  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test-fake';
    vi.mocked(requireToolAccess).mockResolvedValue(null);
  });

  afterEach(() => {
    process.env.ANTHROPIC_API_KEY = originalKey;
    vi.restoreAllMocks();
  });

  it('503 demo_offline when ANTHROPIC_API_KEY is not configured', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const resp = await POST(makeRequest({ prompt: 'hello world' }));
    expect(resp.status).toBe(503);
    const body = await resp.json();
    expect(body.code).toBe('demo_offline');
    expect(body.detail).toMatch(/Hosted AI/);
    expect(body.request_id).toMatch(/^req_/);
    expect(body.doc_url).toMatch(/demo_offline/);
  });

  it('does not apply the retired free-demo cookie limit to paid users', async () => {
    const resp = await POST(makeRequest({ prompt: 'hi' }, 'brocco_demo_used=1'));
    expect(resp.status).toBe(400);
    const body = await resp.json();
    expect(body.code).toBe('validation_failed');
    expect(body.request_id).toMatch(/^req_/);
  });

  it('400 invalid_json on malformed body', async () => {
    const resp = await POST(makeRequest('this is not json'));
    expect(resp.status).toBe(400);
    const body = await resp.json();
    expect(body.code).toBe('invalid_json');
  });

  it('400 validation_failed when prompt is too short', async () => {
    const resp = await POST(makeRequest({ prompt: 'hi' }));
    expect(resp.status).toBe(400);
    const body = await resp.json();
    expect(body.code).toBe('validation_failed');
    expect(body.detail).toMatch(/4-8000/);
    expect(body.detail).toMatch(/Got 2/);
  });

  it('400 validation_failed when prompt is too long', async () => {
    const resp = await POST(makeRequest({ prompt: 'x'.repeat(8001) }));
    expect(resp.status).toBe(400);
    const body = await resp.json();
    expect(body.code).toBe('validation_failed');
  });

  it('400 validation_failed when prompt is not a string', async () => {
    const resp = await POST(makeRequest({ prompt: 12345 }));
    expect(resp.status).toBe(400);
    const body = await resp.json();
    expect(body.code).toBe('validation_failed');
  });

  it('every error response surfaces X-Brocco-Request-Id header', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const resp = await POST(makeRequest({ prompt: 'hello world' }));
    expect(resp.headers.get('X-Brocco-Request-Id')).toMatch(/^req_/);
  });

  it('rejects unpaid execution before contacting any provider', async () => {
    vi.mocked(requireToolAccess).mockResolvedValue(Response.json({ error: 'subscription_required' }, { status: 402 }));
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const response = await POST(makeRequest({ prompt: 'Research competitors' }));
    expect(response.status).toBe(402);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('rejects unsupported agents and attachments instead of silently ignoring them', async () => {
    expect((await POST(makeRequest({ prompt: 'Research competitors', agent: 'unknown' }))).status).toBe(400);
    expect((await POST(makeRequest({ prompt: 'Research competitors', attachments: [{}] }))).status).toBe(400);
  });
});
