'use client';

import { useMotionValue, animate, useTransform, useReducedMotion, motion } from 'framer-motion';
import { useEffect } from 'react';

/**
 * Animates a number to its target value with a tween. Pass a formatter
 * for currency / decimals / compact notation. Respects reduced-motion.
 */
export function AnimatedNumber({
  value,
  duration = 0.7,
  format = (v: number) => `${Math.round(v)}`,
  className,
}: {
  value: number;
  duration?: number;
  format?: (v: number) => string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const display = useTransform(mv, (latest) => format(latest));

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [value, duration, reduce, mv]);

  return <motion.span className={className}>{display}</motion.span>;
}
