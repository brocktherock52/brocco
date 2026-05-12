'use client';

/**
 * ScrollMarquee — full-bleed editorial display type that scrolls horizontally
 * driven by the page's vertical scroll position. Used as a section separator
 * between major blocks to give the page a magazine cadence.
 *
 * Renders the same phrase repeated 4x so the strip always fills the row,
 * even when translateX is large. Respects reduced-motion (renders a static
 * single line instead).
 */

import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function ScrollMarquee({
  phrase,
  accent,
  className,
}: {
  phrase: string;
  accent?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  // pixels of translation — full strip width
  const x = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['10%', '-50%']);

  const phraseEl = (
    <span className="inline-flex items-center gap-7">
      <span className="text-grad">{phrase}</span>
      <span aria-hidden className="text-ink-faint">
        ·
      </span>
      <span className="font-serif italic font-medium text-grad-brand">
        {accent ?? phrase}
      </span>
      <span aria-hidden className="text-ink-faint">
        ·
      </span>
    </span>
  );

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn('relative overflow-hidden py-12 md:py-16', className)}
    >
      <motion.div
        style={{ x }}
        className="flex w-max items-center whitespace-nowrap text-[clamp(3.5rem,11vw,9rem)] font-[750] leading-none tracking-[-0.045em] lowercase"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="inline-flex items-center gap-7 pr-7">
            {phraseEl}
          </span>
        ))}
      </motion.div>
      {/* edge fades */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-32"
        style={{ background: 'linear-gradient(to right, #0A0A0F, transparent)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-32"
        style={{ background: 'linear-gradient(to left, #0A0A0F, transparent)' }}
      />
    </div>
  );
}
