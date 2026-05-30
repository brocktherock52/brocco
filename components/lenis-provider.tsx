'use client';

import { ReactLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

/**
 * Lenis smooth-scroll provider. Wraps the marketing site so wheel scroll has a
 * buttery feel on desktop. Skip on interactive surfaces (/app, /billing,
 * /login, /signup, /checkout) where precise scroll matters for forms + panels.
 *
 * Skip on touch devices too. With syncTouch:false Lenis leaves touch scrolling
 * native anyway, so it adds nothing on phones/tablets, but its RAF loop fights
 * native momentum + the page's `scroll-behavior: smooth`, which showed up as
 * the viewport jittering back up and down mid-scroll on mobile. Wheel-only
 * smoothing (desktop) keeps the benefit without the bug.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // Default to "touch + not ready" so Lenis NEVER mounts during SSR or the
  // first client render. A session only opts into Lenis once we have positively
  // confirmed, on the client, that it is a non-touch (mouse) device. This stops
  // Lenis from briefly initializing on phones during hydration and leaving its
  // scroll transform/RAF behind.
  const [ready, setReady] = useState(false);
  const [isTouch, setIsTouch] = useState(true);

  useEffect(() => {
    // Any coarse pointer (phone/tablet) or a device reporting touch points skips
    // Lenis. The old guard required BOTH `hover: none` AND `pointer: coarse`, but
    // many Android browsers report `hover: hover`, so those phones slipped through
    // and ran Lenis, which eased the whole page incrementally on every scroll
    // (the "everything shifts down" jitter). `(pointer: coarse)` alone is a
    // reliable phone/tablet signal (a touch laptop's primary pointer is fine).
    const coarse = window.matchMedia('(pointer: coarse)');
    const compute = () =>
      coarse.matches || (navigator.maxTouchPoints ?? 0) > 0 || 'ontouchstart' in window;
    setIsTouch(compute());
    setReady(true);
    const update = () => setIsTouch(compute());
    coarse.addEventListener('change', update);
    return () => coarse.removeEventListener('change', update);
  }, []);

  const skip =
    !ready ||
    isTouch ||
    pathname?.startsWith('/app') ||
    pathname?.startsWith('/billing') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/signup') ||
    pathname?.startsWith('/checkout');

  if (skip) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.1,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        syncTouch: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
