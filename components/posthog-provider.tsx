'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { hasConsent } from './cookie-consent';

/**
 * PostHog client wiring. Gated on NEXT_PUBLIC_POSTHOG_KEY (no-op without it).
 * Initializes once on mount, captures $pageview on every route change, and
 * exports trackEvent() for use across the funnel.
 *
 * GDPR posture: only initializes after the user has accepted analytics
 * cookies via <CookieConsent />. If consent is "essential only", PostHog
 * stays uninitialized.
 */
export function PostHogProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    if (!hasConsent('analytics')) return;
    if (typeof window === 'undefined') return;
    if ((posthog as any).__loaded) return;

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false, // we capture manually for App Router
      autocapture: true,
      capture_pageleave: true,
      loaded: (ph) => {
        (ph as any).__loaded = true;
      },
    });
  }, []);

  // App Router pageview capture
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    if (!hasConsent('analytics')) return;
    if (!pathname) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    posthog.capture('$pageview', { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

/** Capture a custom funnel event. No-op if PostHog isn't initialized
 *  (no key, no consent, or load not yet finished). */
export function trackEvent(name: string, props?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  if (!hasConsent('analytics')) return;
  try {
    posthog.capture(name, props ?? {});
  } catch {
    /* swallow */
  }
}
