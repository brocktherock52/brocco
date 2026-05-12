'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * Fixed gradient progress bar pinned to the top of the viewport. Tracks
 * page scroll. Uses a spring on scaleX so the bar feels like it has
 * weight instead of snapping. Brand-to-cyan gradient matches the hero.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 28,
    mass: 0.4,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-brand via-brand-glow to-cyan"
      style={{ scaleX }}
    />
  );
}
