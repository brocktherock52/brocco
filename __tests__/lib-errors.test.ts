import { describe, it, expect } from 'vitest';
import { makeError, makeRequestId, errorResponse } from '@/lib/errors';

describe('lib/errors', () => {
  describe('makeRequestId', () => {
    it('generates a request id starting with req_', () => {
      const id = makeRequestId();
      expect(id).toMatch(/^req_/);
    });

    it('generates unique ids', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) ids.add(makeRequestId());
      expect(ids.size).toBe(100);
    });
  });

  describe('makeError', () => {
    it('produces a structured envelope', () => {
      const env = makeError('validation_failed', 'Prompt too short');
      expect(env.code).toBe('validation_failed');
      expect(env.detail).toBe('Prompt too short');
      expect(env.error).toBe('validation failed');
      expect(env.request_id).toMatch(/^req_/);
      expect(env.doc_url).toContain('#validation_failed');
    });

    it('respects an injected request id', () => {
      const env = makeError('rate_limit', 'too many', { requestId: 'req_test123' });
      expect(env.request_id).toBe('req_test123');
    });

    it('respects an injected doc url override', () => {
      const env = makeError('internal', 'oops', { docUrl: 'https://example.com/oops' });
      expect(env.doc_url).toBe('https://example.com/oops');
    });
  });

  describe('errorResponse', () => {
    it('returns appropriate HTTP status for each code', async () => {
      expect((await errorResponse('invalid_json', 'bad json')).status).toBe(400);
      expect((await errorResponse('validation_failed', 'bad input')).status).toBe(400);
      expect((await errorResponse('auth_failed', 'no auth')).status).toBe(401);
      expect((await errorResponse('ssrf_blocked', 'private ip')).status).toBe(403);
      expect((await errorResponse('rate_limit', 'too many')).status).toBe(429);
      expect((await errorResponse('upstream_rate_limit', '429 upstream')).status).toBe(429);
      expect((await errorResponse('internal', 'crash')).status).toBe(500);
      expect((await errorResponse('upstream_error', '5xx upstream')).status).toBe(502);
      expect((await errorResponse('demo_offline', 'no key')).status).toBe(503);
      expect((await errorResponse('timeout', '60s cap')).status).toBe(504);
    });

    it('sets the X-Brocco-Request-Id header', async () => {
      const resp = errorResponse('rate_limit', 'too many', { requestId: 'req_abc' });
      expect(resp.headers.get('X-Brocco-Request-Id')).toBe('req_abc');
    });

    it('returns a parseable JSON body with the envelope shape', async () => {
      const resp = errorResponse('validation_failed', 'bad', { requestId: 'req_xyz' });
      const body = await resp.json();
      expect(body.code).toBe('validation_failed');
      expect(body.detail).toBe('bad');
      expect(body.request_id).toBe('req_xyz');
      expect(body.doc_url).toMatch(/validation_failed/);
    });
  });
});
