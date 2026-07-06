'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { hasConsent } from './cookie-consent';

/**
 * Meta (Facebook) Pixel client snippet.
 * Renders only when:
 *   - NEXT_PUBLIC_META_PIXEL_ID is set (no-op in dev / preview)
 *   - the user has accepted analytics cookies (GDPR posture)
 * PageView fires once on load. Custom events are dispatched from the rest of
 * the app via window.fbq + the trackPixel helper.
 */
export function MetaPixel() {
  const id = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const update = () => setAllowed(hasConsent('marketing'));
    update();
    window.addEventListener('brocco:consent-change', update);
    return () => window.removeEventListener('brocco:consent-change', update);
  }, []);
  if (!id) return null;
  if (!allowed) return null;
  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${id}');
fbq('track', 'PageView');`,
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

/** Helper: fire a Meta Pixel event from anywhere in the client. No-op if pixel
 *  is not loaded (dev / preview).
 *
 *  Pass `eventID` for events that ALSO fire server-side via the Conversions API
 *  (e.g. Subscribe / Purchase from the Stripe webhook). Meta dedups a browser
 *  event against its CAPI twin only when both carry the SAME event name AND the
 *  same eventID, and the pixel eventID MUST ride in fbq's 4th-argument options
 *  object, not inside the custom params. Putting it in params (as transaction_id)
 *  does not dedup and the conversion double-counts. */
export function trackPixel(
  event: string,
  params?: Record<string, unknown>,
  eventID?: string,
) {
  if (typeof window === 'undefined') return;
  // @ts-expect-error fbq global comes from the snippet above
  const fbq = window.fbq;
  if (typeof fbq !== 'function') return;
  if (eventID) {
    fbq('track', event, params ?? {}, { eventID });
  } else {
    fbq('track', event, params ?? {});
  }
}
