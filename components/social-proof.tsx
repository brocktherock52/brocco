'use client';

import { motion } from 'framer-motion';
import { ClipboardList } from 'lucide-react';
import { SpotlightCard } from './ui/spotlight-card';

const WORKFLOW_EXAMPLES = [
  {
    prompt: 'Compare these three competitors using their public pages. List sources, differences, and questions I should verify.',
    name: 'Research brief',
    role: 'Example prompt for researcher and analyst',
  },
  {
    prompt: 'Turn this product brief into a launch checklist and three draft announcements. Flag any missing information.',
    name: 'Launch planning',
    role: 'Example prompt for planner and outreach',
  },
  {
    prompt: 'Draft three introductory emails from the context I provide. Keep them for my review before I send anything.',
    name: 'Outreach drafts',
    role: 'Example prompt for outreach',
  },
];

const PROVIDERS = ['Anthropic Claude', 'xAI Grok'];

export function SocialProof() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="container-x">
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
          Supported model providers
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
            {PROVIDERS.map((l) => (
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
          {WORKFLOW_EXAMPLES.map((t, i) => (
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
                <ClipboardList className="absolute right-4 top-4 h-8 w-8 text-brand/25 transition-colors group-hover:text-brand/45" />
                <p className="font-mono text-[11px] uppercase tracking-wider text-brand-glow">Illustrative workflow</p>
                <p className="mt-3 text-[14px] leading-relaxed text-ink/95">{t.prompt}</p>
                <figcaption className="mt-4 border-t border-white/[0.06] pt-3">
                  <div className="text-[13px] font-semibold">{t.name}</div>
                  <div className="text-[11.5px] text-ink-faint">{t.role}</div>
                </figcaption>
              </SpotlightCard>
            </motion.figure>
          ))}
        </motion.div>

        <p className="mt-6 text-center text-[11px] italic text-ink-faint">
          Example prompts to adapt to your work. Review generated outputs. Live runs require a paid plan and configured model access.
        </p>
      </div>
    </section>
  );
}
