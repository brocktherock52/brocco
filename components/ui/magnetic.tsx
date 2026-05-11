'use client';

import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  type MotionStyle,
} from 'framer-motion';
import { useRef, type ReactNode, type MouseEvent } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Common = {
  children: ReactNode;
  className?: string;
  strength?: number;
};

/**
 * Magnetic wrapper. The element drifts toward the cursor while the cursor
 * is inside it (with a soft spring), then snaps back on leave. Use for
 * primary CTAs. `strength` controls travel distance in px (default 16).
 */
function useMagnet(strength = 16) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (e: MouseEvent) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    x.set(dx * strength);
    y.set(dy * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return { ref, sx, sy, onMove, reset };
}

export function MagneticLink({
  href,
  children,
  className,
  strength = 14,
  external,
  onClick,
}: Common & {
  href: string;
  external?: boolean;
  onClick?: () => void;
}) {
  const { ref, sx, sy, onMove, reset } = useMagnet(strength);
  const external_props = external
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};
  return (
    <motion.span
      style={{ x: sx, y: sy, display: 'inline-flex' } as MotionStyle}
    >
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={cn('inline-flex items-center justify-center gap-2', className)}
        onMouseMove={onMove}
        onMouseLeave={reset}
        onClick={onClick}
        {...external_props}
      >
        {children}
      </Link>
    </motion.span>
  );
}

export function MagneticButton({
  children,
  className,
  strength = 14,
  onClick,
  disabled,
  type,
}: Common & {
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  const { ref, sx, sy, onMove, reset } = useMagnet(strength);
  return (
    <motion.span
      style={{ x: sx, y: sy, display: 'inline-flex' } as MotionStyle}
    >
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type || 'button'}
        disabled={disabled}
        onClick={onClick}
        onMouseMove={onMove}
        onMouseLeave={reset}
        className={cn('inline-flex items-center justify-center gap-2', className)}
      >
        {children}
      </button>
    </motion.span>
  );
}
