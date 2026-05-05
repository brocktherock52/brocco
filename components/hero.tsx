'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { ParticleField } from './particle-field';

const STATS = [
  { value: 9, label: 'agents', suffix: '', sub: 'researcher, coder, outreach, more' },
  { value: 13, label: 'tools', suffix: '', sub: 'in the registry, growing weekly' },
  { value: 2, label: 'providers', suffix: '', sub: 'Anthropic + OpenAI compatible' },
  { value: 80, label: 'cache hit', suffix: '%', sub: 'on repeat workflows' },
];

function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 1400, stiffness: 80, damping: 22 });
  const display = useTransform(spring, (v) => Math.round(v).toString());
  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, mv, value]);
  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}

const TRUST = ['Anthropic', 'OpenAI', 'Ollama', 'Stripe', 'Vercel', 'Tavily'];

export function Hero() {
  const [confetti, setConfetti] = useState<{ id: number; x: number }[]>([]);

  function handleOpenApp() {
    const burst = Array.from({ length: 18 }, (_, i) => ({ id: Date.now() + i, x: Math.random() }));
    setConfetti(burst);
    toast.success('Opening the app...', { description: 'Demo mode is on. No key needed.' });
    setTimeout(() => setConfetti([]), 1400);
  }

  return (
    <section id="main" className="relative overflow-hidden pt-24 md:pt-32">
      {/* particle bg */}
      <ParticleField className="absolute inset-0 -z-10" />
      {/* radial wash */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-radial-glow opacity-90" />
      {/* faint grid */}
      <div className="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-40" />

      <div className="container-x relative">
        {/* eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex w-max items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 backdrop-blur"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan" />
          </span>
          <span className="text-[12px] font-medium text-ink-dim">
            v13 live - api + mcp server - install as desktop app
          </span>
        </motion.div>

        {/* headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-7 max-w-[18ch] text-center text-display-2xl"
        >
          <span className="text-grad">Agents that</span>
          <br />
          <span className="text-grad-brand">do the work.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="mx-auto mt-6 max-w-2xl text-center text-[17px] leading-relaxed text-ink-dim md:text-[19px]"
        >
          Run multiple Claude or local LLM agents in <strong className="text-white">parallel</strong> from one prompt.
          Plug into <strong className="text-white">Claude Desktop, ChatGPT, Cursor</strong> via MCP, or call the REST API from anywhere.
        </motion.p>

        {/* trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.32 }}
          className="mx-auto mt-3 max-w-xl text-center text-[13px] text-ink-faint"
        >
          Used by founders building the next wave - <span className="text-ink-dim">powered by Claude 4</span> - <span className="text-ink-dim">runs on your keys</span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.42 }}
          className="relative mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link href="/app" onClick={handleOpenApp} className="group btn-primary text-base px-7 py-3.5">
            <Sparkles className="h-4 w-4" />
            Open the app
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a href="#demo" className="btn-ghost text-base px-7 py-3.5">
            <Play className="h-3.5 w-3.5 fill-current" />
            Watch 47s demo
          </a>

          {/* confetti dots */}
          {confetti.map((c, i) => (
            <motion.span
              key={c.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
              animate={{
                x: (c.x - 0.5) * 380,
                y: -90 - Math.random() * 80,
                opacity: 0,
                scale: 1,
                rotate: Math.random() * 360,
              }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 rounded-sm"
              style={{
                background: i % 3 === 0 ? '#A78BFA' : i % 3 === 1 ? '#22D3EE' : '#FBBF24',
              }}
            />
          ))}
        </motion.div>

        {/* stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4"
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              className="card card-hover px-4 py-4 text-center md:px-5 md:py-5"
            >
              <div className="text-[28px] font-bold tracking-tight md:text-[34px]">
                <span className="text-grad-brand">
                  <CountUp value={s.value} suffix={s.suffix} />
                </span>
                <span className="ml-1.5 align-middle text-[12px] font-medium text-ink-faint md:text-[13px]">
                  {s.label}
                </span>
              </div>
              <p className="mt-1 text-[11.5px] text-ink-faint md:text-xs">{s.sub}</p>
            </div>
          ))}
        </motion.div>

        {/* trust bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.85 }}
          className="mt-16 border-t border-white/[0.06] pt-8 md:mt-24"
        >
          <p className="text-center text-[11.5px] uppercase tracking-[0.18em] text-ink-faint">
            Runs on the models and infra you already trust
          </p>
          <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[14px] text-ink-dim md:gap-x-12">
            {TRUST.map((t) => (
              <li key={t} className="opacity-70 transition-opacity hover:opacity-100">
                {t}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
