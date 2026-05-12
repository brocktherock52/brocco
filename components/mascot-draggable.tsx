'use client';

/**
 * Draggable brocco mascot.
 *
 * Floats in the bottom-right corner of the viewport, can be dragged anywhere
 * on the page. Position persists across page navigations (within the session)
 * via sessionStorage. On hover: wiggle. On tap: a happy bounce.
 *
 * Respects prefers-reduced-motion (drag still works, but the idle float +
 * hover/tap animations are flattened).
 *
 * Why it exists: brand personality. The brocco mascot is the company's
 * identity; making it a persistent, playful element on the page reinforces
 * it without occupying critical UI real estate.
 */

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

const STORAGE_KEY = 'brocco_mascot_position';
const MARGIN = 24; // distance from screen edge for the default position

export function MascotDraggable() {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring-smoothed transform for the idle float so motion feels physical.
  // When prefers-reduced-motion is set, fold to a static value.
  const floatY = useSpring(0, { stiffness: 60, damping: 18 });

  useEffect(() => {
    setMounted(true);

    // Default to bottom-right of viewport.
    const setDefault = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      x.set(vw - 96 - MARGIN);
      y.set(vh - 96 - MARGIN);
    };

    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { x?: number; y?: number };
        if (Number.isFinite(parsed.x) && Number.isFinite(parsed.y)) {
          x.set(parsed.x as number);
          y.set(parsed.y as number);
        } else {
          setDefault();
        }
      } else {
        setDefault();
      }
    } catch {
      setDefault();
    }

    // Persist position on unload + drag-end.
    const persist = () => {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ x: x.get(), y: y.get() }));
      } catch {
        /* ignore quota errors */
      }
    };
    window.addEventListener('beforeunload', persist);
    return () => window.removeEventListener('beforeunload', persist);
  }, [x, y]);

  // Idle float — gentle sinusoidal bob when not being dragged.
  // Disabled when reduce-motion is set.
  useEffect(() => {
    if (reduceMotion) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      floatY.set(Math.sin(t * 1.2) * 4);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion, floatY]);

  if (!mounted) return null;

  return (
    <motion.div
      ref={containerRef}
      drag
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={typeof window !== 'undefined' ? {
        left: 0,
        top: 0,
        right: window.innerWidth - 96,
        bottom: window.innerHeight - 96,
      } : undefined}
      style={{ x, y, position: 'fixed', top: 0, left: 0, zIndex: 50 }}
      whileHover={reduceMotion ? undefined : { scale: 1.08, rotate: -4 }}
      whileTap={reduceMotion ? undefined : { scale: 0.94 }}
      onDragEnd={() => {
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ x: x.get(), y: y.get() }));
        } catch {
          /* ignore */
        }
      }}
      className="cursor-grab active:cursor-grabbing select-none"
      aria-label="Brocco mascot — drag me"
      role="img"
    >
      <motion.div style={{ y: floatY }} className="relative h-24 w-24">
        <Image
          src="/assets/brocco-mark-transparent.png"
          alt="Brocco mascot"
          width={96}
          height={96}
          priority={false}
          draggable={false}
          className="pointer-events-none drop-shadow-[0_8px_24px_rgba(124,58,237,0.35)]"
        />
      </motion.div>
    </motion.div>
  );
}
