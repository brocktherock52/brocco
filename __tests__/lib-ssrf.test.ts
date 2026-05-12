import { describe, it, expect } from 'vitest';
import { checkUrl } from '@/lib/ssrf';

describe('lib/ssrf', () => {
  it('allows public https URLs', () => {
    const result = checkUrl('https://example.com/foo');
    expect(result.ok).toBe(true);
    expect(result.url?.hostname).toBe('example.com');
  });

  it('allows public http URLs', () => {
    expect(checkUrl('http://example.com').ok).toBe(true);
  });

  it('rejects invalid URLs', () => {
    expect(checkUrl('not a url').ok).toBe(false);
    expect(checkUrl('').ok).toBe(false);
  });

  it('rejects non-http(s) schemes', () => {
    expect(checkUrl('file:///etc/passwd').ok).toBe(false);
    expect(checkUrl('javascript:alert(1)').ok).toBe(false);
    expect(checkUrl('ftp://files.example.com').ok).toBe(false);
    expect(checkUrl('gopher://example.com').ok).toBe(false);
  });

  it('blocks loopback hosts', () => {
    expect(checkUrl('http://localhost/').ok).toBe(false);
    expect(checkUrl('http://127.0.0.1/').ok).toBe(false);
    expect(checkUrl('http://0.0.0.0/').ok).toBe(false);
    expect(checkUrl('http://[::1]/').ok).toBe(false);
  });

  it('blocks IPv6 private ranges (fc00::/7)', () => {
    // ULA (unique local addresses) — IPv6 equivalent of RFC1918
    expect(checkUrl('http://[fc00::1]/').ok).toBe(false);
    expect(checkUrl('http://[fd00::1]/').ok).toBe(false);
  });

  it('blocks AWS instance metadata endpoint', () => {
    expect(checkUrl('http://169.254.169.254/latest/meta-data/').ok).toBe(false);
  });

  it('blocks RFC1918 private IP ranges', () => {
    expect(checkUrl('http://10.0.0.1/').ok).toBe(false);
    expect(checkUrl('http://10.255.255.255/').ok).toBe(false);
    expect(checkUrl('http://192.168.1.1/').ok).toBe(false);
    expect(checkUrl('http://172.16.0.1/').ok).toBe(false);
    expect(checkUrl('http://172.31.0.1/').ok).toBe(false);
  });

  it('does NOT block public 172.32.x — that is not RFC1918', () => {
    expect(checkUrl('http://172.32.0.1/').ok).toBe(true);
    expect(checkUrl('http://172.15.0.1/').ok).toBe(true);
  });

  it('returns a structured reason for blocked URLs', () => {
    const r = checkUrl('http://localhost/');
    expect(r.ok).toBe(false);
    expect(r.reason).toBeDefined();
    expect(r.reason).toMatch(/blocked/i);
  });
});
