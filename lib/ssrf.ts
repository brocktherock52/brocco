/* Server-Side Request Forgery (SSRF) protection.
   Blocks requests to private/internal addresses + non-http(s) schemes.
   Used by the http_get tool in /api/v1/run and by /api/proxy. */

const BLOCKED_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '169.254.169.254',
]);

const BLOCKED_PREFIXES = [
  '192.168.',
  '10.',
  '172.16.', '172.17.', '172.18.', '172.19.', '172.20.', '172.21.',
  '172.22.', '172.23.', '172.24.', '172.25.', '172.26.', '172.27.',
  '172.28.', '172.29.', '172.30.', '172.31.',
  'fc', 'fd',
];

export interface SsrfCheckResult {
  ok: boolean;
  reason?: string;
  url?: URL;
}

export function checkUrl(input: string): SsrfCheckResult {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return { ok: false, reason: 'invalid URL' };
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    return { ok: false, reason: `protocol ${url.protocol} not allowed (http/https only)` };
  }
  // URL.hostname keeps the brackets on IPv6 ([::1], [fc00::1], ...). Strip them
  // so the BLOCKED_HOSTS/PREFIXES checks behave the same for v4 and v6.
  const rawHost = url.hostname.toLowerCase();
  const host = rawHost.startsWith('[') && rawHost.endsWith(']')
    ? rawHost.slice(1, -1)
    : rawHost;
  if (BLOCKED_HOSTS.has(host)) {
    return { ok: false, reason: `host ${host} is blocked` };
  }
  for (const prefix of BLOCKED_PREFIXES) {
    if (host.startsWith(prefix)) {
      return { ok: false, reason: `private IP range ${prefix}* is blocked` };
    }
  }
  return { ok: true, url };
}
