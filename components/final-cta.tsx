'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';

export function FinalCta() {
  return (
    <section className="relative py-28 md:py-36">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-brand/15 via-bg-1/80 to-cyan/10 px-6 py-16 text-center md:px-12 md:py-20"
        >
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
          <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-cyan/20 blur-3xl" />

          <div className="relative">
            <h2 className="mx-auto max-w-3xl text-display-xl lowercase">
              <span className="text-grad">stop hiring chatbots.</span>
              <br />
              <span className="text-grad-brand">start shipping work.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[16px] text-ink-dim">
              brocco runs your business while you sleep. 100 agent runs free, every month, forever. no card.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/app" className="btn-primary text-base px-7 py-3.5 group">
                start free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="mailto:hello@brocco.ai?subject=Brocco%20demo%20request"
                className="btn-ghost text-base px-7 py-3.5"
              >
                <Calendar className="h-4 w-4" />
                book a demo
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
