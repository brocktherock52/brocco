'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Download, Zap, Sparkles } from 'lucide-react';
import { Logomark } from './logo';
import { InstallButton } from './install-button';
import { ParticleField } from './particle-field';

const STATS = [
  { v: '~50 KB', l: 'cache after install' },
  { v: '11 min', l: 'median time to first run' },
  { v: '0 deps', l: 'no Electron, no node, no Python' },
  { v: 'BYOK', l: 'your key, never ours' },
];

export function DownloadHero() {
  return (
    <section className="relative overflow-hidden pt-32 md:pt-40">
      <ParticleField className="absolute inset-0 -z-10" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-radial-glow opacity-90" />
      <div className="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-30" />

      <div className="container-x relative">
        {/* eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex w-max items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 backdrop-blur"
        >
          <Download className="h-3 w-3 text-cyan-glow" />
          <span className="text-[12px] font-medium text-ink-dim">Install brocco · v2.4 PWA</span>
        </motion.div>

        {/* mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-7 flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 -z-10 animate-pulse-slow rounded-full bg-brand/20 blur-3xl" />
            <Logomark className="h-20 w-20" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-7 max-w-[18ch] text-center text-display-2xl"
        >
          <span className="text-grad">Install brocco</span>
          <br />
          <span className="font-serif italic font-medium text-grad-brand">in one click.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32 }}
          className="mx-auto mt-6 max-w-xl text-center text-[17px] leading-relaxed text-ink-dim md:text-[19px]"
        >
          Native window on <strong className="text-white">Mac and Windows</strong>. Same dashboard inside <strong className="text-white">Claude Desktop, Cursor, ChatGPT</strong>. REST API for everything else.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.42 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <InstallButton variant="primary" />
          <Link href="/app" className="btn-ghost text-base px-7 py-3.5 group">
            <Sparkles className="h-4 w-4" />
            Open in browser
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4"
        >
          {STATS.map((s) => (
            <div key={s.l} className="card card-hover px-4 py-4 text-center md:px-5 md:py-5">
              <div className="text-[20px] font-bold tracking-tight md:text-[22px]">
                <span className="text-grad-brand">{s.v}</span>
              </div>
              <p className="mt-1 text-[11.5px] text-ink-faint">{s.l}</p>
            </div>
          ))}
        </motion.div>

        <div className="mb-16 mt-10 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 font-mono text-[11px] text-emerald-300">
            <Zap className="h-3 w-3" />
            Auto-updates. No app store review.
          </span>
        </div>
      </div>
    </section>
  );
}
