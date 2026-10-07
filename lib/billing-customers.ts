import { eq } from 'drizzle-orm';
import { db } from './db';
import { billingCustomers } from './db/schema';

export async function linkedCustomerIds(userId: string): Promise<string[]> {
  const rows = await db.select({ id: billingCustomers.customerId }).from(billingCustomers).where(eq(billingCustomers.userId, userId));
  return rows.map((row) => row.id);
}

export async function linkCustomer(userId: string, customerId: string): Promise<void> {
  await db.insert(billingCustomers).values({ userId, customerId }).onConflictDoNothing();
  const [owner] = await db.select({ userId: billingCustomers.userId }).from(billingCustomers).where(eq(billingCustomers.customerId, customerId)).limit(1);
  if (owner?.userId !== userId) throw new Error('Billing customer belongs to another account');
}
