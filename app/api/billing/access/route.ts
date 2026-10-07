import { readBillingAccess } from '@/lib/billing-access';
import { billingErrorResponse } from '@/lib/billing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request): Promise<Response> {
  try {
    return Response.json(await readBillingAccess(req.headers), { headers: { 'Cache-Control': 'no-store, private' } });
  } catch (error) {
    return billingErrorResponse(error);
  }
}
