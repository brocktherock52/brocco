'use client';

import { useEffect } from 'react';
import { trackPixel } from '@/components/meta-pixel';
import { trackEvent } from '@/components/posthog-provider';

/**
 * Fires the Subscribe conversion pixel (same payload SuccessTracker used) and
 * then redirects the browser to the better-auth magic-link verify URL. That
 * endpoint sets the session cookie and lands the now-signed-in user on /app.
 *
 * We keep the pixel here (rather than redirecting server-side) so the
 * client-side Meta Pixel + PostHog conversion still fire; the server-side CAPI
 * Subscribe event from the webhook dedupes against it via transaction_id.
 */
export function AutoSignin({ verifyUrl, sessionId }: { verifyUrl: string; sessionId: string }) {
  useEffect(() => {
    trackPixel('Subscribe', {
      content_category: 'subscription',
      content_name: 'brocco_paid',
      currency: 'USD',
      transaction_id: sessionId,
    });
    trackPixel('Lead', { content_name: 'subscribe' });
    trackEvent('subscribe', {
      transaction_id: sessionId,
      content_name: 'brocco_paid',
      currency: 'USD',
    });
    // Small delay so the pixel request is in flight before we navigate away.
    const t = setTimeout(() => {
      window.location.replace(verifyUrl);
    }, 700);
    return () => clearTimeout(t);
  }, [verifyUrl, sessionId]);
  return null;
}
