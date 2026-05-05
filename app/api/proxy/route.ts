/* GET /api/proxy?url=https://... - simple read-only GET proxy with caps. */

export const runtime = 'edge';

const BLOCKED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '169.254.169.254'];

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url).searchParams.get('url');
  if (!url) return new Response('url query param required', { status: 400 });

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return new Response('invalid url', { status: 400 });
  }
  if (!['http:', 'https:'].includes(target.protocol)) {
    return new Response('only http(s) allowed', { status: 400 });
  }
  if (
    BLOCKED_HOSTS.includes(target.hostname) ||
    target.hostname.startsWith('192.168.') ||
    target.hostname.startsWith('10.')
  ) {
    return new Response('private host blocked', { status: 403 });
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);

  try {
    const r = await fetch(target.toString(), {
      method: 'GET',
      headers: { 'User-Agent': 'Brocco-App/1.0 (+https://brocco-site.vercel.app)' },
      signal: ctrl.signal,
      redirect: 'follow',
    });
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
