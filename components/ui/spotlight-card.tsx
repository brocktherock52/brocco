'use client';

import { useMotionValue, motion, useMotionTemplate, useReducedMotion } from 'framer-motion';
import { useRef, type MouseEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Cursor-following spotlight overlay. Wraps any child and gives it a soft
 * radial highlight that tracks the pointer. Pairs well with `card` and
 * `card-hover` utility classes — the spotlight reads as a depth signal
 * without animating the card itself.
 *
 * Use `tilt` to add a subtle 3D rotation tied to cursor position.
 */
export function SpotlightCard({
  children,
  className,
  spotlightSize = 360,
  spotlightColor = 'rgba(167, 139, 250, 0.20)',
  tilt = false,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  spotlightSize?: number;
  spotlightColor?: string;
  tilt?: boolean;
  as?: 'div' | 'section' | 'article' | 'figure';
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(-9999);
  const my = useMotionValue(-9999);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mx.set(x);
    my.set(y);
    if (tilt && !reduce) {
      const px = (x / rect.width - 0.5) * 2;
      const py = (y / rect.height - 0.5) * 2;
      rx.set(py * -4);
      ry.set(px * 4);
    }
  };

  const handleLeave = () => {
    mx.set(-9999);
    my.set(-9999);
    rx.set(0);
    ry.set(0);
  };

  const background = useMotionTemplate`radial-gradient(${spotlightSize}px circle at ${mx}px ${my}px, ${spotlightColor}, transparent 60%)`;

  const Component = motion[Tag as 'div'];

  return (
    <Component
      ref={ref as any}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={tilt && !reduce ? { rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' } : undefined}
      className={cn('relative', className)}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity duration-300"
        style={{ background }}
      />
      <span className="relative z-10 block">{children}</span>
    </Component>
  );
}
