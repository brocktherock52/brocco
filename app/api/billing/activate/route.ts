import { auth } from '@/lib/auth';
import { BillingError, accessForSubscription, billingErrorResponse, getBillingAccess, ownedSubscriptions, sameOrigin, stripeRequest, type StripeInvoice, type StripeSubscription } from '@/lib/billing';

export const runtime = 'nodejs';

/** The only operation that ends a preview trial early. It requires an explicit
 * price-confirmation click and always updates the user's EXISTING subscription. */
export async function POST(req: Request): Promise<Response> {
  if (!sameOrigin(req)) return Response.json({ error: 'invalid_origin' }, { status: 403 });
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return Response.json({ error: 'unauthenticated' }, { status: 401 });
    let body: { confirm?: unknown; subscriptionId?: unknown; requestId?: unknown; price?: { amount?: unknown; currency?: unknown; interval?: unknown } };
    try { body = await req.json(); } catch { return Response.json({ error: 'invalid_json' }, { status: 400 }); }
    if (body.confirm !== true || typeof body.subscriptionId !== 'string') {
      return Response.json({ error: 'confirmation_required', detail: 'Confirm the plan price and immediate payment before ending your trial.' }, { status: 400 });
    }
    if (typeof body.requestId !== 'string' || !/^[a-zA-Z0-9-]{16,80}$/.test(body.requestId)) {
      return Response.json({ error: 'request_id_required', detail: 'Refresh the payment confirmation and try again.' }, { status: 400 });
    }
    const { subscriptions } = await ownedSubscriptions(session.user);
    const subscription = subscriptions.find((sub) => sub.id === body.subscriptionId);
    if (!subscription) return Response.json({ error: 'subscription_not_found' }, { status: 404 });
    const current = accessForSubscription(subscription);
    if (current.canUseTools) return Response.json(current, { headers: { 'Cache-Control': 'no-store' } });
    if (!current.price || body.price?.amount !== current.price.amount || body.price?.currency !== current.price.currency || body.price?.interval !== current.price.interval) {
      return Response.json({ error: 'price_changed', detail: 'Your plan price changed. Review the current amount before confirming payment.', access: current }, { status: 409 });
    }
    if (!['trialing', 'active', 'past_due', 'incomplete'].includes(subscription.status)) {
      return Response.json({ error: 'payment_required', detail: 'Complete or update your payment in billing to unlock tools.', access: current }, { status: 402 });
    }
    const idempotencyKey = `brocco-activate-${session.user.id}-${subscription.id}-${body.requestId}`;
    let updated = subscription;
    if (subscription.status === 'trialing') {
      // Await explicit invoice payment, including any 3DS challenge. Ending
      // the trial must not charge before we compare the actual invoice total.
      const form = new URLSearchParams({ trial_end: 'now', payment_behavior: 'default_incomplete', 'expand[]': 'latest_invoice' });
      updated = await stripeRequest<StripeSubscription>(`/subscriptions/${encodeURIComponent(subscription.id)}`, form,
        `brocco-end-trial-${session.user.id}-${subscription.id}-${subscription.trial_end}`);
    }
    let invoice = typeof updated.latest_invoice === 'string'
      ? await stripeRequest<StripeInvoice>(`/invoices/${encodeURIComponent(updated.latest_invoice)}`)
      : updated.latest_invoice;
    // Do not wait for Stripe's automatic invoice-collection delay. This is
    // the existing subscription's first paid invoice, never a second charge.
    if (invoice?.status === 'draft') {
      invoice = await stripeRequest<StripeInvoice>(`/invoices/${encodeURIComponent(invoice.id)}/finalize`,
        new URLSearchParams({ auto_advance: 'false' }), `brocco-finalize-${invoice.id}`);
    }
    if (invoice?.status === 'open') {
      // Disable background collection while the customer reviews this invoice.
      // This also covers recovery of an invoice created by an earlier request.
      if (invoice.auto_advance !== false) {
        invoice = await stripeRequest<StripeInvoice>(`/invoices/${encodeURIComponent(invoice.id)}`,
          new URLSearchParams({ auto_advance: 'false' }), `brocco-review-${invoice.id}`);
      }
      if (typeof invoice.amount_due !== 'number' || invoice.amount_due !== body.price?.amount || invoice.currency !== body.price?.currency) {
        const access = await getBillingAccess(session.user);
        return Response.json({ error: 'invoice_review_required', detail: 'Your invoice total differs from the displayed plan price. Review the exact amount on the secure invoice before paying. No payment was attempted.', access },
          { status: 409, headers: { 'Cache-Control': 'no-store' } });
      }
      try {
        await stripeRequest<StripeInvoice>(`/invoices/${encodeURIComponent(invoice.id)}/pay`,
          new URLSearchParams({ off_session: 'false' }), `${idempotencyKey}-pay`);
      } catch (error) {
        if (!(error instanceof BillingError) || error.status !== 402) throw error;
        // A decline or 3DS challenge stays locked. The re-read below supplies
        // Stripe's hosted invoice URL so the user can complete authentication.
      }
    }
    // Re-read Stripe rather than granting access from a successful HTTP update.
    // A pending/unpaid invoice, SCA challenge, or payment failure stays locked.
    const access = await getBillingAccess(session.user);
    return Response.json(access, { status: access.canUseTools ? 200 : 202, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return billingErrorResponse(error);
  }
}
