import { eq } from 'drizzle-orm';
import { db } from './db';
import { billingTrialClaims } from './db/schema';

export async function firstTrialClaim(userId: string): Promise<string | null> {
  const [row] = await db.select({ id: billingTrialClaims.subscriptionId }).from(billingTrialClaims).where(eq(billingTrialClaims.userId, userId)).limit(1);
  return row?.id || null;
}

export async function reserveTrialClaim(userId: string, subscriptionId: string): Promise<string> {
  await db.insert(billingTrialClaims).values({ userId, subscriptionId }).onConflictDoNothing();
  const existing = await firstTrialClaim(userId);
  if (!existing) throw new Error('Trial belongs to another account');
  return existing;
}
