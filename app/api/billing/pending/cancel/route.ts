import { billingErrorResponse, sameOrigin } from '@/lib/billing';
import { cancelPendingGuestCheckout } from '@/lib/billing-guest';
import { readCheckoutIntent } from '@/lib/checkout-intent';

export const runtime = 'nodejs';
export async function POST(req: Request): Promise<Response> {
  if (!sameOrigin(req)) return Response.json({ error: 'invalid_origin' }, { status: 403 });
  try {
    const body = await req.json();
    if (body.confirm !== true || typeof body.sessionId !== 'string') return Response.json({ error: 'confirmation_required' }, { status: 400 });
    await cancelPendingGuestCheckout(body.sessionId, readCheckoutIntent(req)?.id || null);
    return Response.json({ canceled: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return billingErrorResponse(error); }
}
