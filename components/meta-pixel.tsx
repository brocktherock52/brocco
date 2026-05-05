'use client';

import Script from 'next/script';

/**
 * Meta (Facebook) Pixel client snippet.
 * Only renders when NEXT_PUBLIC_META_PIXEL_ID is set, so dev + previews
 * stay clean. PageView fires once on load. Custom events (ViewContent,
 * InitiateCheckout, Subscribe, Lead) are dispatched from the rest of
 * the app via window.fbq when the user crosses each funnel step.
 */
export function MetaPixel() {
  const id = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  if (!id) return null;
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
 *  is not loaded (dev / preview). */
export function trackPixel(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  // @ts-expect-error fbq global comes from the snippet above
  const fbq = window.fbq;
  if (typeof fbq !== 'function') return;
  fbq('track', event, params ?? {});
}
