'use client';

import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { SpotlightCard } from './ui/spotlight-card';

const TESTIMONIALS = [
  {
    quote:
      'Replaced 8 Zapier zaps with 3 brocco agents. Saved $340/mo and the audit logs alone are worth the switch.',
    name: 'Anonymous beta user',
    role: 'Ops lead, Series B SaaS',
  },
  {
    quote:
      'The broadcast pattern is the killer feature. One prompt, five specialists working in parallel. Nothing else does this.',
    name: 'Founder, indie',
    role: 'Solo SaaS',
  },
  {
    quote:
      'Took me 11 minutes from signup to a working agent that actually drafts cold emails I can send. JSONL audit trail seals it.',
    name: 'GTM lead',
    role: 'YC startup',
  },
];

const LOGOS = ['Anthropic', 'OpenAI', 'Stripe', 'Vercel', 'Tavily', 'Ollama', 'Postgres'];

export function SocialProof() {
  return (
    <section className="relative py-20">
      <div className="container-x">
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
          Built on infrastructure your security team already approved
        </p>

        {/* Marquee-style logo strip with edge fade */}
        <div className="relative mt-5 overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24"
            style={{ background: 'linear-gradient(to right, var(--tw-bg-0,#0A0A0F), transparent)' }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24"
            style={{ background: 'linear-gradient(to left, var(--tw-bg-0,#0A0A0F), transparent)' }}
          />
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[14px] text-ink-dim md:gap-x-12">
            {LOGOS.map((l) => (
              <li
                key={l}
                className="opacity-60 transition-all hover:opacity-100 hover:text-white hover:tracking-wide"
              >
                {l}
              </li>
            ))}
          </ul>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="mt-14 grid gap-4 md:grid-cols-3"
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={i}
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
              }}
              style={{ perspective: 1000 }}
            >
              <SpotlightCard
                tilt
                spotlightSize={420}
                spotlightColor="rgba(167, 139, 250, 0.18)"
                className="card group h-full overflow-hidden p-6"
              >
                <Quote className="absolute right-4 top-4 h-8 w-8 text-brand/25 transition-colors group-hover:text-brand/45" />
                <div className="flex gap-0.5 text-amber-300">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-3 text-[14px] leading-relaxed text-ink/95">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-4 border-t border-white/[0.06] pt-3">
                  <div className="text-[13px] font-semibold">{t.name}</div>
                  <div className="text-[11.5px] text-ink-faint">{t.role}</div>
                </figcaption>
              </SpotlightCard>
            </motion.figure>
          ))}
        </motion.div>

        <p className="mt-6 text-center text-[11px] italic text-ink-faint">
          Beta users; identifying details withheld until v2.2 case studies ship.
        </p>
      </div>
    </section>
  );
}
