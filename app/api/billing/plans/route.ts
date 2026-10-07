import { billingErrorResponse, stripeRequest } from '@/lib/billing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  try {
    const plans = await Promise.all((['solo', 'team', 'wholesaler'] as const).flatMap((tier) =>
      (tier === 'wholesaler' ? ['monthly'] : ['monthly', 'annual']).map(async (interval) => {
        const id = process.env[`STRIPE_PRICE_${tier.toUpperCase()}_${interval.toUpperCase()}`];
        if (!id) return { tier, interval, amount: null, currency: null, available: false };
        const price = await stripeRequest<{ active: boolean; unit_amount: number | null; currency: string; recurring?: { interval: string } }>(`/prices/${encodeURIComponent(id)}`);
        return { tier, interval, amount: price.unit_amount, currency: price.currency,
          available: price.active && price.unit_amount !== null && price.recurring?.interval === (interval === 'annual' ? 'year' : 'month') };
      }),
    ));
    return Response.json({ plans, trialDays: 7, hostedAvailable: Boolean(process.env.ANTHROPIC_API_KEY) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return billingErrorResponse(error); }
}
