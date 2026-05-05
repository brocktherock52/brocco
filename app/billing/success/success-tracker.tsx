'use client';

import { useEffect } from 'react';
import { trackPixel } from '@/components/meta-pixel';

/** Fires Meta Pixel "Subscribe" once on the success page. The matching
 *  server-side CAPI event is dispatched from app/api/stripe-webhook on
 *  checkout.session.completed. Both keys ride together for dedup. */
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
    // also a generic Lead for Meta's optimization
    trackPixel('Lead', { content_name: 'subscribe' });
  }, []);
  return null;
}
