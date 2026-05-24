/* POST /api/consulting-intake - budget-qualified discovery intake for the
   Brocco Consulting (/consulting) page.

   Persistence is graceful-degrade by design: prod DB/email env may be unset,
   so this NEVER 500s on missing config. It always logs the lead to the server
   console (so it shows in Vercel logs) and returns { ok: true }. If
   RESEND_API_KEY is set, it ALSO sends a notification email to help@brocco.dev,
   guarded so a mail failure can never fail the request.

   Validation + a light per-IP in-memory throttle keep the endpoint sane
   without external infra. */

import { errorResponse, makeRequestId } from '@/lib/errors';

export const runtime = 'nodejs';

const NOTIFY_TO = 'help@brocco.dev';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLES = ['CEO / Founder', 'COO', 'CFO', 'CIO / CTO', 'VP / Director', 'Other'];
const SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];
const BUDGETS = ['< $15k', '$15k - $50k', '$50k - $150k', '$150k+', 'Not sure'];

interface IntakePayload {
  name: string;
  email: string;
  company: string;
  role: string;
  companySize: string;
  budget: string;
  automate: string;
}

/* Tiny in-memory rate limiter. Best-effort only (resets on cold start, not
   shared across edge regions) but enough to blunt accidental double-submits
   and trivial abuse. Structured so a Redis/KV backend can drop in later. */
const HITS = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (HITS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  HITS.set(ip, recent);
  // Opportunistic cleanup so the map does not grow unbounded.
  if (HITS.size > 5000) {
    for (const [k, v] of HITS) {
      if (v.every((t) => now - t >= WINDOW_MS)) HITS.delete(k);
    }
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

function validate(body: Record<string, unknown>): { ok: true; data: IntakePayload } | { ok: false; detail: string } {
  const data: IntakePayload = {
    name: str(body.name),
    email: str(body.email),
    company: str(body.company),
    role: str(body.role),
    companySize: str(body.companySize),
    budget: str(body.budget),
    automate: str(body.automate),
  };

  if (data.name.length < 2 || data.name.length > 120) return { ok: false, detail: 'name is required.' };
  if (!EMAIL_RE.test(data.email) || data.email.length > 200) return { ok: false, detail: 'a valid work email is required.' };
  if (data.company.length < 2 || data.company.length > 160) return { ok: false, detail: 'company is required.' };
  if (!ROLES.includes(data.role)) return { ok: false, detail: 'a valid role is required.' };
  if (!SIZES.includes(data.companySize)) return { ok: false, detail: 'a valid company size is required.' };
  if (!BUDGETS.includes(data.budget)) return { ok: false, detail: 'a valid budget band is required.' };
  if (data.automate.length < 10 || data.automate.length > 2000) return { ok: false, detail: 'please describe what to automate (10-2000 chars).' };

  return { ok: true, data };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function notify(data: IntakePayload, requestId: string): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  // No key -> no-op. The console log below is the system of record in that case.
  if (!resendKey) return;
  const from = process.env.EMAIL_FROM || 'Brocco <login@brocco.dev>';

  const rows: Array<[string, string]> = [
    ['Name', data.name],
    ['Email', data.email],
    ['Company', data.company],
    ['Role', data.role],
    ['Company size', data.companySize],
    ['Budget', data.budget],
    ['Automate', data.automate],
    ['Request ID', requestId],
  ];

  const html = `
    <div style="font-family:Inter,sans-serif;background:#0A0A0F;color:#E9EEF1;padding:32px;border-radius:12px;max-width:560px;margin:0 auto;">
      <h2 style="margin:0 0 16px 0;font-weight:600;">New consulting intake</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        ${rows
          .map(
            ([k, v]) => `
          <tr>
            <td style="padding:8px 12px 8px 0;color:#A8B0BC;vertical-align:top;white-space:nowrap;">${escapeHtml(k)}</td>
            <td style="padding:8px 0;color:#E9EEF1;">${escapeHtml(v).replace(/\n/g, '<br/>')}</td>
          </tr>`,
          )
          .join('')}
      </table>
    </div>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: NOTIFY_TO,
        reply_to: data.email,
        subject: `Consulting intake: ${data.company} (${data.budget})`,
        html,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      // eslint-disable-next-line no-console
      console.error('[consulting-intake] resend send failed', res.status, text.slice(0, 300));
    }
  } catch (e) {
    // Never let a mail failure surface to the visitor.
    // eslint-disable-next-line no-console
    console.error('[consulting-intake] notify error', e instanceof Error ? e.message : String(e));
  }
}

export async function POST(req: Request): Promise<Response> {
  const requestId = makeRequestId();

  if (rateLimited(clientIp(req))) {
    return errorResponse('rate_limit', 'Too many submissions. Please wait a minute and try again.', { requestId });
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

  const result = validate(raw as Record<string, unknown>);
  if (!result.ok) {
    return errorResponse('validation_failed', result.detail, { requestId });
  }

  const { data } = result;

  // Always log the lead so it is captured in server logs even with no DB.
  // eslint-disable-next-line no-console
  console.log(
    '[consulting-intake]',
    JSON.stringify({
      requestId,
      at: new Date().toISOString(),
      name: data.name,
      email: data.email,
      company: data.company,
      role: data.role,
      companySize: data.companySize,
      budget: data.budget,
      automate: data.automate.slice(0, 500),
    }),
  );

  // Best-effort notification. Awaited so serverless does not kill it early,
  // but it can never throw past here.
  await notify(data, requestId);

  return Response.json({ ok: true, request_id: requestId }, { headers: { 'X-Brocco-Request-Id': requestId } });
}
