'use client';

import { useEffect } from 'react';
import { trackPixel } from '@/components/meta-pixel';
import { trackEvent } from '@/components/posthog-provider';

/**
 * Fires the Subscribe + Purchase conversion pixels (same payload SuccessTracker
 * used) and then redirects the browser to the better-auth magic-link verify URL.
 * That endpoint sets the session cookie and lands the now-signed-in user on /app.
 *
 * We keep the pixel here (rather than redirecting server-side) so the
 * client-side Meta Pixel + PostHog conversion still fire; the server-side CAPI
 * Subscribe event from the webhook dedupes against it via transaction_id.
 *
 * Purchase carries value + currency so Meta can run value-based bidding and
 * "Purchase" conversion campaigns (consultant note 2026-06-02). Value is the
 * plan's monthly price as a conversion proxy.
 */
export function AutoSignin({
  verifyUrl,
  sessionId,
  plan,
}: {
  verifyUrl: string;
  sessionId: string;
  plan?: string;
}) {
  useEffect(() => {
    const value = planValue(plan);
    trackPixel(
      'Subscribe',
      {
        content_category: 'subscription',
        content_name: 'brocco_paid',
        currency: 'USD',
        transaction_id: sessionId,
      },
      sessionId,
    );
    trackPixel(
      'Purchase',
      {
        content_category: 'subscription',
        content_name: plan ? `brocco_${plan}` : 'brocco_paid',
        currency: 'USD',
        value,
        transaction_id: sessionId,
      },
      sessionId,
    );
    trackPixel('Lead', { content_name: 'subscribe' });
    trackEvent('subscribe', {
      transaction_id: sessionId,
      content_name: 'brocco_paid',
      plan: plan ?? 'unknown',
      value,
      currency: 'USD',
    });
    // Small delay so the pixel request is in flight before we navigate away.
    const t = setTimeout(() => {
      window.location.replace(verifyUrl);
    }, 700);
    return () => clearTimeout(t);
  }, [verifyUrl, sessionId, plan]);
  return null;
}

/** Monthly list price per tier, used as the Meta Pixel Purchase conversion
 *  value. Kept in sync with the pricing ladder in components/pricing.tsx. */
export function planValue(plan?: string): number {
  switch (plan) {
    case 'team':
      return 199;
    case 'solo':
      return 49;
    default:
      return 49;
  }
}
