'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Download } from 'lucide-react';

/**
 * HeroAnimated — fully kinetic hero. Replaces the static spinning
 * jpeg approach. Layered motion:
 *   1. Particle field (40 cyan dots drifting upward, parallax with mouse)
 *   2. Orbital agent ring: 9 specialist dots orbiting the mascot at
 *      different radii / speeds, each pulsing with a delay so the
 *      whole ring feels alive. Connector lines draw from each dot to
 *      the mascot with stroke-dasharray animation.
 *   3. Mascot in center: layered transform — scroll-driven scale + rotation,
 *      mouse-driven tilt, idle breathing loop, blink animation.
 *   4. Two streaming JSONL panels with real typewriter effect — text
 *      types character by character, then erases, then re-types
 *      a different message.
 *   5. Title + CTAs that lift away on scroll.
 */

const AGENTS = [
  { name: 'researcher', color: '#67E8F9', delay: 0 },
  { name: 'planner', color: '#A78BFA', delay: 0.4 },
  { name: 'outreach', color: '#FBBF24', delay: 0.8 },
  { name: 'designer', color: '#F472B6', delay: 1.2 },
  { name: 'analyst', color: '#A78BFA', delay: 1.6 },
  { name: 'coder', color: '#4ADE80', delay: 2.0 },
  { name: 'ops', color: '#22D3EE', delay: 2.4 },
  { name: 'supervisor', color: '#22C55E', delay: 2.8 },
  { name: 'browser', color: '#67E8F9', delay: 3.2 },
];

const STREAM_LINES_LEFT = [
  '> tavily.search("ai agent platforms 2026")',
  '> http_get https://news.ycombinator.com',
  '> reading 12 results... synthesizing',
  '> file_save brief.md (2.3kb, 14 cites)',
  '> done. cost $0.08 · 4m 12s',
];

const STREAM_LINES_RIGHT = [
  '{ "agent": "designer", "step": 3,',
  '  "tool": "image_gen",',
  '  "prompt": "moodboard hero shot",',
  '  "status": "streaming...",',
  '  "elapsed_ms": 3812 }',
];

export function HeroAnimated() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Mascot scroll motion
  const mascotScale = useTransform(scrollYProgress, [0, 1], [1, 0.7]);
  const mascotY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);
  const mascotOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.55, 0.15]);

  // Title scroll motion
  const titleY = useTransform(scrollYProgress, [0, 1], ['0%', '-40%']);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.5, 0.85], [1, 0.5, 0]);

  // Mouse position for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const tiltX = useSpring(useTransform(mouseY, [-1, 1], [8, -8]), { stiffness: 60, damping: 20 });
  const tiltY = useSpring(useTransform(mouseX, [-1, 1], [-8, 8]), { stiffness: 60, damping: 20 });
  const driftX = useSpring(useTransform(mouseX, [-1, 1], [-12, 12]), { stiffness: 50, damping: 18 });
  const driftY = useSpring(useTransform(mouseY, [-1, 1], [-8, 8]), { stiffness: 50, damping: 18 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      mouseX.set((e.clientX / w) * 2 - 1);
      mouseY.set((e.clientY / h) * 2 - 1);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [mouseX, mouseY]);

  // Particles
  const particles = useMemo(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 8 + Math.random() * 6,
      size: 1 + Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.4,
    })),
  []);

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28"
      id="main"
    >
      {/* Faint moving grid */}
      <motion.div
        aria-hidden
        className="grid-bg pointer-events-none absolute inset-0 -z-30 opacity-50"
        style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '8%']) }}
      />

      {/* Particle field */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20">
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full bg-cyan-400"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: p.opacity }}
            animate={{ y: [0, -120, -240], opacity: [0, p.opacity, 0] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      {/* Big radial glow that follows mouse subtly */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[20%] -z-10 h-[640px] w-[920px] -translate-x-1/2 rounded-full"
        style={{ x: driftX, y: driftY }}
        animate={{
          background: [
            'radial-gradient(circle, rgba(103,232,249,0.16) 0%, rgba(124,58,237,0.10) 35%, transparent 70%)',
            'radial-gradient(circle, rgba(124,58,237,0.16) 0%, rgba(103,232,249,0.10) 35%, transparent 70%)',
            'radial-gradient(circle, rgba(103,232,249,0.16) 0%, rgba(124,58,237,0.10) 35%, transparent 70%)',
          ],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="container-x relative z-10">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
          {/* LEFT: title + CTAs + stream panel */}
          <motion.div style={{ y: titleY, opacity: titleOpacity }}>
            <p className="eyebrow">agents that ship</p>
            <h1 className="mt-4 text-display-2xl">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-grad block"
              >
                broadcast
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="font-serif italic font-normal text-grad-brand block"
              >
                one prompt.
              </motion.span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 max-w-md text-[17px] leading-relaxed text-ink-dim"
            >
              9 specialists. parallel panes. greppable audit logs. byok or hosted.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link href="/app" className="btn-primary group">
                open app
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/download" className="btn-ghost">
                <Download className="h-4 w-4" />
                install
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="mt-8 flex flex-wrap items-center gap-4 text-[11px] font-mono uppercase tracking-[0.18em] text-ink-faint"
            >
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
            </motion.div>
          </motion.div>

          {/* RIGHT: orbital mascot + streaming panels */}
          <div className="relative aspect-square w-full max-w-[560px] mx-auto" style={{ perspective: 1200 }}>
            <motion.div
              className="relative h-full w-full"
              style={{
                rotateX: tiltX,
                rotateY: tiltY,
                scale: mascotScale,
                y: mascotY,
                opacity: mascotOpacity,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Inner glow disc */}
              <motion.div
                aria-hidden
                className="absolute inset-[18%] rounded-full bg-gradient-to-br from-cyan/20 via-brand/10 to-transparent blur-2xl"
                animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.9, 0.6] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Orbital ring (svg) */}
              <svg
                aria-hidden
                viewBox="-50 -50 100 100"
                className="absolute inset-0 h-full w-full"
              >
                <motion.circle
                  cx="0"
                  cy="0"
                  r="44"
                  fill="none"
                  stroke="rgba(103,232,249,0.18)"
                  strokeWidth="0.3"
                  strokeDasharray="0.8 1.5"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
                />
                <motion.circle
                  cx="0"
                  cy="0"
                  r="36"
                  fill="none"
                  stroke="rgba(196,181,253,0.14)"
                  strokeWidth="0.3"
                  strokeDasharray="0.4 2"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 110, repeat: Infinity, ease: 'linear' }}
                />
              </svg>

              {/* Orbiting agent dots */}
              {AGENTS.map((agent, i) => (
                <OrbitDot key={agent.name} index={i} total={AGENTS.length} agent={agent} />
              ))}

              {/* Mascot center */}
              <motion.div
                className="absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2"
                animate={{
                  y: [0, -8, 4, 0],
                  scale: [1, 1.03, 0.98, 1],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformStyle: 'preserve-3d', translateZ: 40 }}
              >
                <Image
                  src="/assets/brocco-mark-transparent.png"
                  alt="brocco-crocodile mascot"
                  fill
                  priority
                  className="object-contain drop-shadow-[0_0_30px_rgba(103,232,249,0.35)]"
                  sizes="(min-width: 768px) 30vw, 60vw"
                />
              </motion.div>

              {/* Eye blink overlay (positioned over the existing mark eye) */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute left-[58%] top-[44%] h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-bg-0"
                animate={{ scaleY: [0, 0, 1, 0, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', times: [0, 0.94, 0.97, 0.99, 1] }}
              />
            </motion.div>

            {/* Streaming panel — left */}
            <motion.div
              className="absolute -left-2 top-[12%] hidden w-[200px] rounded-lg border border-cyan-400/30 bg-bg-1/85 p-2.5 backdrop-blur-md md:block"
              style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '-30%']), x: driftX }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
            >
              <div className="flex items-center gap-1.5 border-b border-white/[0.06] pb-1.5 mb-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-cyan-glow">researcher</span>
              </div>
              <Typewriter lines={STREAM_LINES_LEFT} />
            </motion.div>

            {/* Streaming panel — right */}
            <motion.div
              className="absolute -right-2 bottom-[10%] hidden w-[210px] rounded-lg border border-violet-400/30 bg-bg-1/85 p-2.5 backdrop-blur-md md:block"
              style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '20%']), x: driftX }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.85, duration: 0.7 }}
            >
              <div className="flex items-center gap-1.5 border-b border-white/[0.06] pb-1.5 mb-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-violet-300">designer</span>
              </div>
              <Typewriter lines={STREAM_LINES_RIGHT} delay={1.2} />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OrbitDot({
  index,
  total,
  agent,
}: {
  index: number;
  total: number;
  agent: { name: string; color: string; delay: number };
}) {
  const radiusPct = 38 + (index % 2) * 6; // 38 or 44
  const baseAngle = (index / total) * 360;
  const orbitDuration = 50 + (index % 3) * 12;
  const direction = index % 2 === 0 ? 1 : -1;

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 h-0 w-0"
      initial={{ rotate: baseAngle }}
      animate={{ rotate: baseAngle + 360 * direction }}
      transition={{ duration: orbitDuration, repeat: Infinity, ease: 'linear' }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <motion.div
        className="absolute"
        style={{ left: `${radiusPct}%`, top: 0, x: '-50%', y: '-50%' }}
      >
        <motion.div
          className="group relative cursor-default"
          animate={{ rotate: -baseAngle - 360 * direction }}
          transition={{ duration: orbitDuration, repeat: Infinity, ease: 'linear' }}
        >
          <motion.div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: agent.color, boxShadow: `0 0 12px ${agent.color}` }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: agent.delay, ease: 'easeInOut' }}
          />
          <span
            className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-dim opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          >
            {agent.name}
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function Typewriter({ lines, delay = 0 }: { lines: string[]; delay?: number }) {
  const [shown, setShown] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let started = false;

    const tick = () => {
      if (!started) {
        started = true;
        timer = setTimeout(tick, delay * 1000);
        return;
      }

      if (currentLine >= lines.length) {
        timer = setTimeout(() => {
          setShown([]);
          setCurrentLine(0);
          setCurrentChar(0);
        }, 4000);
        return;
      }

      const line = lines[currentLine];
      if (currentChar < line.length) {
        setShown((prev) => {
          const next = [...prev];
          next[currentLine] = line.slice(0, currentChar + 1);
          return next;
        });
        setCurrentChar((c) => c + 1);
        timer = setTimeout(tick, 22 + Math.random() * 14);
      } else {
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
        timer = setTimeout(tick, 320);
      }
    };

    timer = setTimeout(tick, 40);
    return () => clearTimeout(timer);
  }, [currentLine, currentChar, lines, delay]);

  return (
    <div className="space-y-0.5 font-mono text-[10px] leading-snug text-ink-dim">
      {lines.map((line, i) => (
        <p key={i} className={i === currentLine ? 'text-cyan-glow' : ''}>
          {shown[i] ?? ''}
          {i === currentLine && <BlinkingCursor />}
        </p>
      ))}
    </div>
  );
}

function BlinkingCursor() {
  return (
    <motion.span
      className="ml-0.5 inline-block h-3 w-1 align-middle bg-cyan-400"
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}
