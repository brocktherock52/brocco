'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

// BroccoFactory — visual section showing the brocco mascots being
// assembled on a conveyor belt. Pairs with the new "create your own
// agent" wizard pitch. Replaces the dropped SurfacesFilmstrip.

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
          className="relative mx-auto mt-12 max-w-5xl overflow-hidden rounded-2xl border border-white/[0.08] bg-black shadow-glow"
        >
          <Image
            src="/assets/brocco-factory.png"
            alt="A cartoon factory producing brocco mascots on a conveyor belt. Robotic arms attach glasses, headsets, and hats. Inspector crocs stand beside the belt with clipboards. A clock on the wall reads 06:00."
            width={1820}
            height={1024}
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="h-auto w-full"
            priority={false}
          />
          {/* subtle overlay so text reads on any future caption */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ boxShadow: 'inset 0 -120px 100px -40px rgba(0,0,0,0.6)' }}
          />
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
              unlimited custom agents
            </span>
          </div>
          <Link
            href="/app/agents/new"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-cyan px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-glow2 transition-all hover:shadow-glow"
          >
            build your own agent
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
