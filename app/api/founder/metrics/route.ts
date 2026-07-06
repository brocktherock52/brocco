/**
 * /api/founder/metrics
 *   GET - founder-only business snapshot: users, paid breakdown, active
 *         sessions, signup cohorts, thread engagement, and MRR.
 *
 * Hard-gated server-side to FOUNDER_EMAIL. This is the real authorization
 * boundary: the /app/founder page is just a viewer, so even if its client
 * gate were bypassed, no data leaves the server without this check passing.
 *
 * MRR is computed from Stripe's live subscriptions when STRIPE_API_KEY is set
 * (authoritative, handles annual + multi-seat), and falls back to a DB-derived
 * estimate from the locally-stored plan tier otherwise.
 */
import { NextRequest, NextResponse } from 'next/server';
import { desc, gt, gte, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, sessions, threads } from '@/lib/db/schema';
import { isFounderEmail } from '@/lib/constants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Monthly list price per tier, in dollars. Mirrors components/pricing.tsx.
const TIER_MONTHLY: Record<string, number> = { solo: 49, team: 199 };

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

async function dbMetrics() {
  const now = new Date();
  const since = (days: number) => new Date(now.getTime() - days * 86_400_000);

  const [totalRow] = await db.select({ c: sql<number>`count(*)` }).from(users);

  const planRows = await db
    .select({ plan: users.plan, c: sql<number>`count(*)` })
    .from(users)
    .groupBy(users.plan);

  const byPlan: Record<string, number> = { free: 0, solo: 0, team: 0 };
  for (const r of planRows) byPlan[r.plan ?? 'free'] = num(r.c);

  const [signups1] = await db
    .select({ c: sql<number>`count(*)` })
    .from(users)
    .where(gte(users.createdAt, since(1)));
  const [signups7] = await db
    .select({ c: sql<number>`count(*)` })
    .from(users)
    .where(gte(users.createdAt, since(7)));
  const [signups30] = await db
    .select({ c: sql<number>`count(*)` })
    .from(users)
    .where(gte(users.createdAt, since(30)));

  // "Active" = holds a non-expired session. lastSeenAt is not reliably written,
  // so a live session is the most honest activity signal we have.
  const [activeSessionUsers] = await db
    .select({ c: sql<number>`count(distinct ${sessions.userId})` })
    .from(sessions)
    .where(gt(sessions.expiresAt, now));

  const [totalThreads] = await db.select({ c: sql<number>`count(*)` }).from(threads);
  const [threads7] = await db
    .select({ c: sql<number>`count(*)` })
    .from(threads)
    .where(gte(threads.createdAt, since(7)));

  // Full signup trail: every user, newest first (capped). The founder owns
  // this data and the route is founder-gated, so emails are fine to return.
  const recentSignups = await db
    .select({
      email: users.email,
      name: users.name,
      plan: users.plan,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(200);

  const paid = num(byPlan.solo) + num(byPlan.team);
  const estimateMrr = num(byPlan.solo) * TIER_MONTHLY.solo + num(byPlan.team) * TIER_MONTHLY.team;

  return {
    totalUsers: num(totalRow?.c),
    byPlan,
    paidUsers: paid,
    activeSessionUsers: num(activeSessionUsers?.c),
    signups: { d1: num(signups1?.c), d7: num(signups7?.c), d30: num(signups30?.c) },
    threads: { total: num(totalThreads?.c), d7: num(threads7?.c) },
    estimateMrr,
    recentSignups,
  };
}

interface StripeSubItem {
  quantity?: number;
  price?: {
    unit_amount?: number | null;
    recurring?: { interval?: string; interval_count?: number } | null;
  } | null;
}
interface StripeSub {
  id: string;
  status?: string;
  items?: { data?: StripeSubItem[] };
}

// Normalize one subscription item's amount to a monthly figure (USD).
function monthlyFromItem(item: StripeSubItem): number {
  const cents = num(item.price?.unit_amount);
  const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
  const interval = item.price?.recurring?.interval ?? 'month';
  const count = item.price?.recurring?.interval_count || 1;
  const dollars = (cents * qty) / 100;
  switch (interval) {
    case 'year':
      return dollars / (12 * count);
    case 'week':
      return (dollars * 52) / 12 / count;
    case 'day':
      return (dollars * 365) / 12 / count;
    case 'month':
    default:
      return dollars / count;
  }
}

interface StripeMrr {
  mrr: number; // monthly recurring revenue from ACTIVE (paying) subscriptions
  activeSubscriptions: number; // count of status=active subs
  trialing: number; // count of status=trialing subs (paying $0 right now)
  trialingMrr: number; // what the trials become worth when they convert
}

// Authoritative MRR from Stripe. Pages through ALL subscriptions and buckets by
// status: only `active` subs count toward MRR (the money actually recurring);
// `trialing` subs are reported separately because they pay $0 until they
// convert. This is why "2 paid users" (DB plan flag, set at trial start) can
// coexist with "$0 MRR" (no active paying sub yet). Returns null on error so
// the caller can fall back to the DB estimate.
async function stripeMrr(): Promise<StripeMrr | null> {
  const key = process.env.STRIPE_API_KEY;
  if (!key) return null;
  try {
    let mrr = 0;
    let trialingMrr = 0;
    let activeCount = 0;
    let trialingCount = 0;
    let startingAfter: string | null = null;
    for (let page = 0; page < 20; page++) {
      const params = new URLSearchParams({ status: 'all', limit: '100' });
      params.append('expand[]', 'data.items.data.price');
      if (startingAfter) params.set('starting_after', startingAfter);
      const resp = await fetch(`https://api.stripe.com/v1/subscriptions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${key}` },
        cache: 'no-store',
      });
      if (!resp.ok) return null;
      const json = (await resp.json()) as { data?: StripeSub[]; has_more?: boolean };
      const data = json.data ?? [];
      for (const sub of data) {
        const m = (sub.items?.data ?? []).reduce((acc, item) => acc + monthlyFromItem(item), 0);
        if (sub.status === 'active') {
          mrr += m;
          activeCount += 1;
        } else if (sub.status === 'trialing') {
          trialingMrr += m;
          trialingCount += 1;
        }
      }
      if (!json.has_more || data.length === 0) break;
      startingAfter = data[data.length - 1].id;
    }
    return {
      mrr: Math.round(mrr * 100) / 100,
      activeSubscriptions: activeCount,
      trialing: trialingCount,
      trialingMrr: Math.round(trialingMrr * 100) / 100,
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (!isFounderEmail(session.user.email)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  let dbm: Awaited<ReturnType<typeof dbMetrics>>;
  try {
    dbm = await dbMetrics();
  } catch (e) {
    return NextResponse.json(
      { error: 'db_error', message: e instanceof Error ? e.message : 'database query failed' },
      { status: 500 },
    );
  }

  const stripe = await stripeMrr();
  const mrr = stripe ? stripe.mrr : dbm.estimateMrr;
  const mrrSource = stripe ? 'stripe' : process.env.STRIPE_API_KEY ? 'estimate_stripe_error' : 'estimate';

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    mrr,
    arr: Math.round(mrr * 12 * 100) / 100,
    mrrSource,
    activeSubscriptions: stripe?.activeSubscriptions ?? dbm.paidUsers,
    trialing: stripe?.trialing ?? null,
    trialingMrr: stripe?.trialingMrr ?? null,
    totalUsers: dbm.totalUsers,
    paidUsers: dbm.paidUsers,
    byPlan: dbm.byPlan,
    activeSessionUsers: dbm.activeSessionUsers,
    signups: dbm.signups,
    threads: dbm.threads,
    recentSignups: dbm.recentSignups,
  });
}
