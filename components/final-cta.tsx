'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';
import { MagneticLink } from './ui/magnetic';

export function FinalCta() {
  const reduce = useReducedMotion();

  return (
    <section className="relative py-28 md:py-36">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-brand/15 via-bg-1/80 to-cyan/10 px-6 py-16 text-center md:px-12 md:py-24"
        >
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />

          {/* Animated breathing orbs */}
          {!reduce && (
            <>
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand/30 blur-3xl"
                animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.85, 0.5] }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-cyan/20 blur-3xl"
                animate={{ scale: [1.12, 1, 1.12], opacity: [0.8, 0.5, 0.8] }}
                transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  background:
                    'conic-gradient(from 0deg, rgba(124,58,237,0.08), rgba(34,211,238,0.08), rgba(124,58,237,0.08))',
                  filter: 'blur(60px)',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              />
            </>
          )}

          <div className="relative">
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto max-w-3xl text-display-xl lowercase"
            >
              <span className="text-grad">stop hiring chatbots.</span>
              <br />
              <span className="text-grad-brand">start shipping work.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mx-auto mt-5 max-w-xl text-[16px] text-ink-dim"
            >
              brocco runs your business while you sleep. 100 agent runs free, every month, forever.
              no card.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-9 flex flex-wrap items-center justify-center gap-3"
            >
              <MagneticLink href="/checkout/solo" className="btn-primary group text-base px-7 py-3.5">
                <span>start 7-day trial . $49/mo</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </MagneticLink>
              <MagneticLink
                href="https://calendly.com/brockpivec/"
                external
                className="btn-ghost text-base px-7 py-3.5"
              >
                <Calendar className="h-4 w-4" />
                book a demo
              </MagneticLink>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
