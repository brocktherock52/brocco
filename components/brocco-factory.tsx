'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { CustomCroc } from '@/components/custom-croc';
import type { AccessoryId } from '@/components/custom-croc';
import type { CustomCrocBase } from '@/lib/custom-agents';

// BroccoFactory — ANIMATED conveyor belt of crocs being produced.
// Builds left to right: a stream of unaccessorized crocs travels along
// the belt, robotic arms drop accessories on each croc as it passes the
// build station, the finished croc continues to the right where a 'READY'
// stamp lands on it. Loops forever.

interface BeltCroc {
  id: string;
  base: CustomCrocBase;
  accent: string;
  accessory: AccessoryId;
  delay: number;
}

const BASES: CustomCrocBase[] = ['researcher', 'planner', 'outreach', 'designer', 'analyst', 'coder', 'ops', 'supervisor', 'browser'];
const ACCENTS = ['#67E8F9', '#FB7185', '#FBBF24', '#F472B6', '#A78BFA', '#4ADE80', '#22D3EE', '#22C55E', '#F97316'];
const ACCESSORIES: AccessoryId[] = ['glasses', 'beret', 'headset', 'crown', 'fedora', 'bow_tie'];

function buildLine(count: number): BeltCroc[] {
  const out: BeltCroc[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      id: `c-${i}`,
      base: BASES[i % BASES.length],
      accent: ACCENTS[i % ACCENTS.length],
      accessory: ACCESSORIES[i % ACCESSORIES.length],
      delay: i * 1.4,
    });
  }
  return out;
}

const LINE = buildLine(8);
const BELT_DURATION = 12; // seconds for one croc to cross
const STATION_X_PCT = 50; // where the accessory drops

export function BroccoFactory() {
  return (
    <section className="relative py-24 md:py-32" id="factory">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <p className="pill mx-auto inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            the brocco factory
          </p>
          <h2 className="mt-5 text-display-xl">
            <span className="text-grad">an endless line</span>{' '}
            <span className="font-serif italic font-normal text-grad-brand">of specialists.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[15.5px] leading-relaxed text-ink-dim">
            you'll never need to staff your AI team again. brocco builds new specialists on a conveyor belt
            every morning at 06:00. fork a template, pick a costume, hit ship. your new croc is already
            on the line.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mt-12 max-w-5xl overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#16101f] to-[#0a0612] shadow-glow"
        >
          {/* the static factory backplate */}
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <Image
              src="/assets/brocco-factory.png"
              alt=""
              fill
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="object-cover opacity-50"
              priority={false}
            />

            {/* animated belt — a thin lane near the bottom-middle */}
            <div className="absolute inset-x-0 bottom-[28%] h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-30" />
            <BeltMotion />

            {/* the build station — a small descending robotic arm */}
            <BuildStation />

            {/* moving crocs */}
            {LINE.map((c) => (
              <BeltCrocMotion key={c.id} croc={c} />
            ))}

            {/* end-of-line READY stamp */}
            <div
              className="absolute right-[5%] bottom-[35%] rounded-md border border-emerald-400/60 bg-emerald-400/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300 backdrop-blur-md"
              style={{ boxShadow: '0 0 12px rgba(74, 222, 128, 0.3)' }}
            >
              ready
            </div>
            <div
              className="absolute left-[3%] bottom-[35%] rounded-md border border-fuchsia-400/60 bg-fuchsia-400/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-fuchsia-300 backdrop-blur-md"
              style={{ boxShadow: '0 0 12px rgba(244, 114, 182, 0.3)' }}
            >
              new
            </div>

            {/* clock overlay top-right */}
            <div className="absolute right-[6%] top-[8%] rounded-md border border-white/20 bg-black/60 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur-md">
              <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              line · live
            </div>
          </div>
        </motion.div>

        <div className="mx-auto mt-8 flex max-w-3xl flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              06:00 line start
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
              4-step wizard
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              888 specialists ready
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/app/agents/new"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-cyan px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-glow2 transition-all hover:shadow-glow"
            >
              build your own agent
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/agents/library"
              className="group inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-[13.5px] font-medium text-white transition-colors hover:bg-white/[0.05]"
            >
              browse 888 agents
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function BeltMotion() {
  // Belt rollers — a row of small ovals scrolling left to right
  return (
    <div className="absolute inset-x-0 bottom-[27%] h-2 overflow-hidden">
      <motion.div
        className="flex h-full items-center gap-3"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        style={{ width: '200%' }}
      >
        {Array.from({ length: 40 }).map((_, i) => (
          <span
            key={i}
            className="h-1.5 w-3 shrink-0 rounded-full bg-white/30"
            style={{ boxShadow: '0 0 4px rgba(255,255,255,0.2)' }}
          />
        ))}
      </motion.div>
    </div>
  );
}

function BuildStation() {
  return (
    <motion.div
      className="absolute"
      style={{ left: `${STATION_X_PCT}%`, top: '20%', transform: 'translateX(-50%)' }}
      animate={{ y: [0, 60, 0] }}
      transition={{ duration: BELT_DURATION / LINE.length, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="flex flex-col items-center">
        {/* arm shaft */}
        <div className="h-16 w-1.5 rounded bg-gradient-to-b from-cyan-400/60 to-white/20" />
        {/* claw */}
        <div className="-mt-1 h-3 w-6 rounded-b bg-cyan-300/80 shadow-[0_0_12px_rgba(103,232,249,0.6)]" />
        {/* spark on hit */}
        <motion.span
          className="-mt-1 text-cyan-200"
          animate={{ opacity: [0, 1, 0], scale: [0.6, 1.6, 0.6] }}
          transition={{ duration: BELT_DURATION / LINE.length, repeat: Infinity, ease: 'easeInOut' }}
        >
          ✦
        </motion.span>
      </div>
    </motion.div>
  );
}

function BeltCrocMotion({ croc }: { croc: BeltCroc }) {
  return (
    <motion.div
      className="absolute"
      style={{ bottom: '23%', left: '-10%', width: 64 }}
      animate={{ x: ['0vw', '110vw'] }}
      transition={{
        duration: BELT_DURATION,
        repeat: Infinity,
        ease: 'linear',
        delay: croc.delay,
      }}
    >
      <motion.div
        animate={{ y: [-1, 1, -1] }}
        transition={{ duration: 0.3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        <div
          className="relative h-16 w-16 overflow-hidden rounded-xl bg-black"
          style={{ boxShadow: `inset 0 0 0 1px ${croc.accent}55, 0 0 16px ${croc.accent}33` }}
        >
          <CustomCroc
            accent={croc.accent}
            accessory={croc.accessory}
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
