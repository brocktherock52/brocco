'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Word-by-word entrance for display headlines. Pass an array of lines
 * (each line a string) and the component renders each word with a soft
 * upward fade. Holds children inline.
 *
 * Use `as` to pick the underlying element (h1 / h2 / span).
 */
export function TextReveal({
  text,
  className,
  as: Tag = 'span',
  delay = 0,
  stagger = 0.05,
  once = true,
}: {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'p';
  delay?: number;
  stagger?: number;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  const words = text.split(' ');

  const container: Variants = {
    hidden: {},
    visible: { transition: { delayChildren: delay, staggerChildren: reduce ? 0 : stagger } },
  };
  const word: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 14, filter: reduce ? 'none' : 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-40px' }}
      variants={container}
      className={cn('inline-block', className)}
    >
      {words.map((w, i) => (
        <motion.span key={i} variants={word} className="inline-block">
          {w}
          {i < words.length - 1 && ' '}
        </motion.span>
      ))}
    </motion.span>
  );
}
