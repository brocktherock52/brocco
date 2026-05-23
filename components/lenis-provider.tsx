'use client';

import { ReactLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Lenis smooth-scroll provider. Wraps the marketing site so wheel + touch
 * scroll has a buttery feel. Skip on interactive surfaces (/app, /billing,
 * /login, /signup, /checkout) where precise scroll matters for forms +
 * panels. Respects `prefers-reduced-motion` automatically.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const skip =
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
