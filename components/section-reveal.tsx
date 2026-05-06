'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

/**
 * Wrap a section to give it a fluid scroll-reveal: content fades + lifts
 * as it enters the viewport, with a subtle stagger for child blocks.
 * Use sparingly — too many of these and the page feels jittery.
 */
export function SectionReveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
