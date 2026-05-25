/* GET /api/proxy?url=https://... - simple read-only GET proxy with caps.
   SSRF protection uses the canonical lib/ssrf checkUrl (private v4/v6 ranges,
   link-local, IPv6 ULA) and does NOT follow redirects, so a public URL cannot
   302 into an internal address to bypass the check. */

import { checkUrl } from '@/lib/ssrf';

export const runtime = 'edge';

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url).searchParams.get('url');
  if (!url) return new Response('url query param required', { status: 400 });

  const check = checkUrl(url);
  if (!check.ok) {
    return new Response(`blocked: ${check.reason}`, { status: 403 });
  }
  const target = check.url!;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);

  try {
    const r = await fetch(target.toString(), {
      method: 'GET',
      headers: { 'User-Agent': 'Brocco-App/1.0 (+https://brocco-site.vercel.app)' },
      signal: ctrl.signal,
      redirect: 'manual',
    });
    // A redirect could point at an internal address; we do not follow it.
    if (r.status >= 300 && r.status < 400) {
      return new Response('upstream redirected; redirects are not followed', { status: 502 });
    }
    const reader = r.body?.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    if (reader) {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          total += value.byteLength;
          if (total > 500_000) break;
          chunks.push(value);
        }
      }
    }
    const buf = new Uint8Array(total);
    let off = 0;
    for (const c of chunks) {
      buf.set(c, off);
      off += c.byteLength;
    }
    const text = new TextDecoder().decode(buf);
    return new Response(text, {
      status: r.status,
      headers: {
        'Content-Type': r.headers.get('content-type') || 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Brocco-Proxy': '1',
      },
    });
  } catch (e) {
    return new Response(`proxy error: ${e instanceof Error ? e.message : String(e)}`, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
