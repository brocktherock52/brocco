'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedGridProps {
  children: ReactNode;
  className?: string;
  staggerMs?: number;
}

export function AnimatedGrid({ children, className = '', staggerMs = 60 }: AnimatedGridProps) {
  return (
    <motion.ul
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: staggerMs / 1000 },
        },
      }}
      className={className}
    >
      {children}
    </motion.ul>
  );
}

export function AnimatedGridItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.li>
  );
}
