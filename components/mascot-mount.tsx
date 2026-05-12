'use client';

/**
 * Client wrapper that dynamically imports the mascot with ssr:false.
 *
 * Why this exists: app/layout.tsx is a Server Component, and Next.js 15+
 * forbids using `dynamic(..., { ssr: false })` directly from a Server
 * Component. So we wrap it in this tiny Client Component, which is the
 * canonical Next.js pattern for "client-only component that touches browser
 * APIs and must not be SSR'd".
 *
 * The wrapper itself renders nothing on the server. On the client, after
 * hydration, it imports + mounts MascotDraggable.
 */

import dynamic from 'next/dynamic';

const MascotDraggable = dynamic(
  () => import('./mascot-draggable').then((m) => m.MascotDraggable),
  { ssr: false },
);

export function MascotMount() {
  return <MascotDraggable />;
}
