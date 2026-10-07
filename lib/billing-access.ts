import { auth } from './auth';
import { BillingError, billingErrorResponse, getBillingAccess } from './billing';
import { emptyBillingAccess } from './billing-types';
import type { BillingAccess } from './billing-types';
import type { BillingUser } from './billing';

export async function readBillingAccess(headers: Headers) {
  const session = await auth.api.getSession({ headers });
  if (!session?.user) return emptyBillingAccess(false);
  return getBillingAccess(session.user);
}

export async function requireToolAccess(req: Request, onAllowed?: (user: BillingUser, access: BillingAccess) => Promise<Response | null>): Promise<Response | null> {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const access = session?.user ? await getBillingAccess(session.user) : emptyBillingAccess(false);
    if (access.canUseTools && session?.user) return onAllowed ? await onAllowed(session.user, access) : null;
    return Response.json({ error: access.authenticated ? 'subscription_required' : 'unauthenticated', detail: 'An active paid subscription is required to use tools. The trial includes dashboard preview only.', access }, {
      status: access.authenticated ? 402 : 401, headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return billingErrorResponse(error instanceof BillingError ? error : new BillingError('billing_unavailable', 'We could not verify your access. Please try again.'));
  }
}
