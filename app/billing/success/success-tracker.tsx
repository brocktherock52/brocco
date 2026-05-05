'use client';

import { useEffect } from 'react';
import { trackPixel } from '@/components/meta-pixel';
import { trackEvent } from '@/components/posthog-provider';

/** Fires Meta Pixel + PostHog "Subscribe" once on the success page. The
 *  matching server-side CAPI event is dispatched from app/api/stripe-webhook
 *  on checkout.session.completed. transaction_id rides on both for dedup. */
export function SuccessTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const sessionId = url.searchParams.get('session_id') || '';
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
  }, []);
  return null;
}
