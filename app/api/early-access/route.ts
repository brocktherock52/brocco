/* POST /api/early-access - free-tier signup / early-access email capture.

   This is the conversion endpoint the automated social content machine drives
   to ("100 free runs -> brocco.dev"). North-star: first 100 signups.

   Persistence is graceful-degrade, matching /api/consulting-intake: it NEVER
   500s on missing config and never blocks the visitor.
     1. ALWAYS logs the lead to the server console (Vercel logs = system of
        record even with zero env configured).
     2. If AIRTABLE_TOKEN is set, ALSO writes a row to the "Brocco Signups"
        table so progress to 100 is queryable. (base/table baked in below.)
     3. If RESEND_API_KEY is set, ALSO emails a heads-up to help@brocco.dev.
   Any of (2)/(3) failing can never fail the request. */

import { errorResponse, makeRequestId } from '@/lib/errors';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOTIFY_TO = 'help@brocco.dev';

// "Brocco Signups" table (created in the connected Airtable base).
const AIRTABLE_BASE = 'apphwwUkuYiLXfldq';
const AIRTABLE_TABLE = 'tblKs2Dg2qpM0Ta5w';

const ALLOWED_SOURCES = new Set([
  'hero', 'signup-page', 'final-cta', 'pricing', 'nav', 'demo', 'unknown',
]);

// Tiny best-effort per-IP throttle (resets on cold start; blunts double-submits).
const HITS = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 6;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (HITS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  HITS.set(ip, recent);
  if (HITS.size > 5000) {
    for (const [k, v] of HITS) if (v.every((t) => now - t >= WINDOW_MS)) HITS.delete(k);
  }
  return recent.length > MAX_PER_WINDOW;
}

function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

async function toAirtable(email: string, source: string, referrer: string): Promise<void> {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) return; // console log is the system of record without it
  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_TABLE}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          typecast: true,
          records: [{
            fields: {
              Email: email,
              Source: source,
              Status: 'New',
              'Signed Up': new Date().toISOString(),
              Referrer: referrer.slice(0, 500),
            },
          }],
        }),
      },
    );
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      // eslint-disable-next-line no-console
      console.error('[early-access] airtable failed', res.status, text.slice(0, 300));
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[early-access] airtable error', e instanceof Error ? e.message : String(e));
  }
}

async function notify(email: string, source: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const from = process.env.EMAIL_FROM || 'Brocco <login@brocco.dev>';
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from, to: NOTIFY_TO, reply_to: email,
        subject: `new brocco signup: ${email}`,
        html: `<p>New free-tier signup.</p><p><b>${email}</b> via <b>${source}</b></p>`,
      }),
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[early-access] notify error', e instanceof Error ? e.message : String(e));
  }
}

export async function POST(req: Request): Promise<Response> {
  const requestId = makeRequestId();

  if (rateLimited(clientIp(req))) {
    return errorResponse('rate_limit', 'one sec, too many tries. wait a minute.', { requestId });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return errorResponse('invalid_json', 'Request body is not valid JSON.', { requestId });
  }
  if (typeof raw !== 'object' || raw === null) {
    return errorResponse('validation_failed', 'Request body must be a JSON object.', { requestId });
  }

  const body = raw as Record<string, unknown>;
  const email = str(body.email).toLowerCase();
  let source = str(body.source) || 'unknown';
  if (!ALLOWED_SOURCES.has(source)) source = 'unknown';
  const referrer = str(body.referrer);

  if (!EMAIL_RE.test(email) || email.length > 200) {
    return errorResponse('validation_failed', 'enter a valid email.', { requestId });
  }

  // System of record: always logged, visible in Vercel logs with zero config.
  // eslint-disable-next-line no-console
  console.log('[early-access]', JSON.stringify({ requestId, at: new Date().toISOString(), email, source, referrer: referrer.slice(0, 200) }));

  await Promise.all([toAirtable(email, source, referrer), notify(email, source)]);

  return Response.json(
    { ok: true, request_id: requestId },
    { headers: { 'X-Brocco-Request-Id': requestId } },
  );
}
