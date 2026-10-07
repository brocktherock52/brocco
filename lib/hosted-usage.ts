import { sql } from 'drizzle-orm';
import { db } from './db';
import type { BillingPlan } from './billing-types';

export const HOSTED_LIMITS: Record<BillingPlan, { monthly: number; daily: number }> = {
  solo: { monthly: 2000, daily: 100 }, team: { monthly: 10000, daily: 500 }, wholesaler: { monthly: 1000, daily: 50 },
};

/** One atomic counter update prevents parallel agents and concurrent server
 * instances from overspending the same allowance. Missing storage fails closed. */
export async function reserveHostedRun(userId: string, plan: BillingPlan): Promise<Response | null> {
  const limit = HOSTED_LIMITS[plan];
  const day = new Date().toISOString().slice(0, 10);
  const month = day.slice(0, 7);
  try {
    const result = await db.execute(sql`
      INSERT INTO hosted_usage (user_id, month, runs, day, day_runs, updated_at)
      VALUES (${userId}::uuid, ${month}, 1, ${day}, 1, now())
      ON CONFLICT (user_id, month) DO UPDATE SET
        runs = hosted_usage.runs + 1,
        day = EXCLUDED.day,
        day_runs = CASE WHEN hosted_usage.day = EXCLUDED.day THEN hosted_usage.day_runs + 1 ELSE 1 END,
        updated_at = now()
      WHERE hosted_usage.runs < ${limit.monthly}
        AND (hosted_usage.day <> EXCLUDED.day OR hosted_usage.day_runs < ${limit.daily})
      RETURNING runs
    `);
    if (!result.rows.length) return Response.json({ error: 'hosted_limit_reached', detail: `Your plan includes ${limit.monthly.toLocaleString()} hosted agent runs per month, with up to ${limit.daily} per UTC day. Try again after reset or connect your own API key.` }, { status: 429, headers: { 'Cache-Control': 'no-store' } });
    return null;
  } catch {
    return Response.json({ error: 'hosted_unavailable', detail: 'Hosted run accounting is temporarily unavailable. Please retry or connect your own API key.' }, { status: 503 });
  }
}
