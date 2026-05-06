'use client';

import { motion } from 'framer-motion';

/**
 * Site-wide breathing background. Two slow-pulsing radial glows that
 * shift position + opacity in a multi-second loop. Pinned to the
 * viewport so every page gets the same ambient feel without per-page
 * layout work. Pointer-events disabled, behind everything.
 */
export function BreathingBg() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-40 overflow-hidden">
      <motion.div
        className="absolute -left-24 top-[8%] h-[520px] w-[520px] rounded-full bg-cyan/[0.10] blur-[140px]"
        animate={{
          x: [0, 24, -16, 0],
          y: [0, -18, 14, 0],
          scale: [1, 1.06, 0.96, 1],
          opacity: [0.55, 0.85, 0.65, 0.55],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-32 top-[34%] h-[620px] w-[620px] rounded-full bg-brand/[0.10] blur-[160px]"
        animate={{
          x: [0, -22, 14, 0],
          y: [0, 22, -12, 0],
          scale: [1, 0.95, 1.08, 1],
          opacity: [0.5, 0.78, 0.6, 0.5],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-[42%] bottom-[-10%] h-[420px] w-[420px] rounded-full bg-violet-500/[0.07] blur-[140px]"
        animate={{
          x: [0, 30, -20, 0],
          scale: [1, 1.1, 0.95, 1],
          opacity: [0.4, 0.7, 0.55, 0.4],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
