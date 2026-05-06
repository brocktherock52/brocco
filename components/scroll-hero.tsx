'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { ArrowRight, Download, Terminal as TerminalIcon } from 'lucide-react';

/**
 * Motion-dynamic scroll hero. Reuses the Nano Banana 2 generated
 * mascot image at /assets/hero-broccoli-croc.jpg as the centerpiece,
 * but drives it with framer-motion useScroll + useTransform so the
 * whole composition reacts as you scroll.
 *
 * Layered effects (bottom -> top):
 *   1. Faint grid bg
 *   2. Hero image with: parallax-y, slight scale, mouse-drift, gentle bob
 *   3. Cyan radial glow that intensifies on scroll
 *   4. Floating glassy "agent panels" with stagger fade-in
 *   5. Hero text + CTAs that fade and lift as user scrolls past
 */
export function ScrollHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Parallax: image scales 1.0 -> 1.18, lifts -8% as user scrolls
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '-8%']);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.65, 0.25]);

  // Glow intensifies then fades
  const glowOpacity = useTransform(scrollYProgress, [0, 0.4, 1], [0.6, 1, 0.2]);

  // Hero text lifts and fades
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6, 0.9], [1, 0.4, 0]);

  // Floating panels: slight drift
  const panelY1 = useTransform(scrollYProgress, [0, 1], ['0%', '-22%']);
  const panelY2 = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const panelY3 = useTransform(scrollYProgress, [0, 1], ['0%', '-14%']);

  // Mouse drift on the image (light parallax with cursor)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const driftX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const driftY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      mouseX.set(((e.clientX / w) - 0.5) * 14);
      mouseY.set(((e.clientY / h) - 0.5) * 10);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [mouseX, mouseY]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden pt-28 pb-24 md:pt-36 md:pb-32"
      id="main"
    >
      <motion.div
        className="grid-bg pointer-events-none absolute inset-0 -z-30 opacity-50"
        style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '6%']) }}
      />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-[700px]"
        style={{ opacity: glowOpacity }}
      >
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-radial from-cyan/15 via-brand/10 to-transparent blur-3xl" />
      </motion.div>

      <div className="container-x relative z-10">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
          <motion.div style={{ y: textY, opacity: textOpacity }} className="relative">
            <p className="eyebrow">agents that ship</p>
            <h1 className="mt-4 text-display-2xl">
              <span className="text-grad">broadcast</span>
              <br />
              <span className="font-serif italic font-normal text-grad-brand">one prompt.</span>
            </h1>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink-dim">
              9 specialists. parallel panes. greppable audit logs. byok or hosted.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/app" className="btn-primary group">
                open app
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/download" className="btn-ghost">
                <Download className="h-4 w-4" />
                install
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-[11px] font-mono uppercase tracking-[0.18em] text-ink-faint">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                100 free runs / mo
              </span>
              <span>·</span>
              <span>byok</span>
              <span>·</span>
              <span>no card</span>
              <span>·</span>
              <span>jsonl audit</span>
            </div>
          </motion.div>

          <motion.div
            className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-white/[0.10] shadow-glow"
            style={{ x: driftX, y: driftY }}
            whileHover={{ scale: 1.015, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
          >
            <motion.div
              style={{ scale: imageScale, y: imageY, opacity: imageOpacity }}
              className="absolute inset-0"
            >
              <motion.div
                className="absolute inset-0"
                animate={{
                  scale: [1, 1.025, 1.005, 1],
                  rotate: [0, 0.4, -0.3, 0],
                  x: [0, 6, -4, 0],
                  y: [0, -3, 4, 0],
                }}
                transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Image
                  src="/assets/hero-broccoli-croc.jpg"
                  alt="brocco-crocodile mascot with floating agent panels"
                  fill
                  priority
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </motion.div>
            </motion.div>

            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent mix-blend-screen"
              animate={{ x: ['0%', '500%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
            />

            <motion.div
              aria-hidden
              className="pointer-events-none absolute -inset-1 rounded-3xl"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(103,232,249,0)',
                  '0 0 64px 8px rgba(103,232,249,0.18)',
                  '0 0 0 0 rgba(103,232,249,0)',
                ],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-bg-0/60 via-transparent to-cyan/[0.10]" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.08]" />

            <motion.div
              className="pointer-events-none absolute left-[6%] top-[12%] hidden rounded-md border border-cyan-400/30 bg-bg-1/70 px-2.5 py-1.5 backdrop-blur-md md:block"
              style={{ y: panelY1 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-glow">researcher · live</p>
            </motion.div>

            <motion.div
              className="pointer-events-none absolute right-[5%] top-[24%] hidden rounded-md border border-violet-400/30 bg-bg-1/70 px-2.5 py-1.5 backdrop-blur-md md:block"
              style={{ y: panelY2 }}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.85, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-violet-300">analyst · streaming</p>
            </motion.div>

            <motion.div
              className="pointer-events-none absolute right-[14%] bottom-[16%] hidden rounded-md border border-cyan-400/30 bg-bg-1/70 px-2.5 py-1.5 backdrop-blur-md md:block"
              style={{ y: panelY3 }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-glow">supervisor · synth</p>
            </motion.div>

            <motion.div
              className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-black/45 px-2 py-1 font-mono text-[10px] text-ink-dim backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            >
              <TerminalIcon className="h-3 w-3 text-cyan-glow" />
              broadcast.sh · live
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
