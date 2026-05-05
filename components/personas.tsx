'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const PEOPLE = [
  {
    persona: 'Solo founder',
    title: '"I run my company without an assistant"',
    story:
      'Type one prompt at 9am: "qualify yesterday signups, draft 5 personalized intros, post a launch update to Slack." Three brocco agents fan out in parallel. Done by 9:08am.',
    metric: ['3 agents', '~$0.04 / run'],
    href: '/app#recipe=customer-deep-dive',
  },
  {
    persona: 'Ops lead',
    title: '"I replaced 8 Zapier zaps with 3 agents"',
    story:
      'Zaps break when input changes shape. Brocco agents read the data and decide. Connect Stripe, Notion, Slack, Postgres, describe in English, the agent runs on cron with full audit trail.',
    metric: ['17 tools wired', 'JSONL audit'],
    href: '/app#recipe=feature-spec',
  },
  {
    persona: 'Content creator',
    title: '"I broadcast one prompt to five angles"',
    story:
      'Drop a topic in Broadcast mode, pick 5 agents (researcher, analyst, outreach, designer, planner). Get a brief, 5 social posts, 3 logo concepts, and a launch plan. One prompt, one cup of coffee.',
    metric: ['5 agents', 'image_gen + voice_tts'],
    href: '/app#recipe=content-sprint',
  },
];

export function Personas() {
  return (
    <section id="personas" className="relative border-y border-white/[0.05] bg-bg-1/40 py-24 md:py-32">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="pill">Who is it for</p>
          <h2 className="mt-5 text-display-lg">
            <span className="text-grad">Three workflows. Three people.</span>{' '}
            <span className="font-serif italic font-normal text-grad-brand">One dashboard.</span>
          </h2>
          <p className="mt-4 max-w-xl text-[16px] text-ink-dim">
            Concrete, real, what-it-does-for-you-Tuesday-morning. Not abstract benefits.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          className="mt-12 grid gap-4 md:grid-cols-3 md:gap-5"
        >
          {PEOPLE.map((p) => (
            <motion.div
              key={p.persona}
              variants={{
                hidden: { opacity: 0, y: 14 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
              }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="card card-hover group flex flex-col p-6"
            >
              <span className="self-start rounded-full border border-cyan/30 bg-cyan/10 px-2.5 py-0.5 text-[11px] font-mono text-cyan-glow">
                {p.persona}
              </span>
              <h3 className="mt-4 text-[18px] font-semibold leading-snug tracking-tight">{p.title}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-ink-dim">{p.story}</p>
              <div className="mt-5 flex flex-wrap gap-x-3 gap-y-1.5 font-mono text-[11.5px] text-ink-faint">
                {p.metric.map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
              <Link
                href={p.href}
                className="mt-6 inline-flex items-center gap-1.5 self-start text-[13px] font-medium text-brand-glow transition-colors hover:text-cyan-glow"
              >
                Try this workflow
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
