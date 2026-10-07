import type { BillingAccess } from './billing-types';
export type { BillingAccess } from './billing-types';

export async function fetchBillingAccess(): Promise<BillingAccess> {
  const response = await fetch('/api/billing/access', { cache: 'no-store' });
  const data = await response.json();
  if (!response.ok && response.status !== 401) {
    throw new Error(data.detail || 'We could not check your subscription. Please retry.');
  }
  return data;
}

export function formatSubscriptionPrice(price: BillingAccess['price']): string | null {
  if (!price || !Number.isFinite(price.amount)) return null;
  const amount = new Intl.NumberFormat('en-US', { style: 'currency', currency: price.currency }).format(price.amount / 100);
  return `${amount}/${price.interval}`;
}
