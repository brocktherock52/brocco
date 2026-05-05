'use client';

import { motion } from 'framer-motion';

/** Six brocco-specific problem statements. Mirrors inference.sh's
 *  "why we built this" block. Each entry is a constraint we ran into
 *  and what we did about it. Editorial italic on the close line keeps
 *  the Claude-design rhythm. */
const WHY = [
  {
    title: 'specialists beat generalists',
    body:
      'one agent good at everything is bad at everything. we ship 9 specialists with their own tool lists, system prompts, and memories.',
    closer: 'a researcher does not write code. a coder does not draft cold emails.',
  },
  {
    title: 'observability or it didn\'t happen',
    body:
      'every step of every run is appended to a single jsonl file. you can grep it, diff it, replay it, hand it to your security team.',
    closer: 'no black-box autonomy. no surprise tool calls.',
  },
  {
    title: 'parallel by default',
    body:
      'broadcast one prompt to n agents. they run concurrently in their own panes. each finishes when it finishes.',
    closer: 'one cup of coffee, five outputs.',
  },
  {
    title: 'streaming all the way through',
    body:
      'server-sent events from the model into the dashboard, with no polling and no spinners. live token chip in the header during every run.',
    closer: 'you watch the agent think, not wait for it to finish.',
  },
  {
    title: 'cost is a first-class citizen',
    body:
      'prompt caching is on by default. 80% cache hit on repeat workflows. live token meter shows cost in dollars while you wait.',
    closer: 'a $49/mo tier covers 2,000 runs. solo founders ship in the green.',
  },
  {
    title: 'your data does not train models',
    body:
      'on free tier, prompts go from your browser to your provider. on paid, our hosted runtime calls anthropic with zdr enabled by default.',
    closer: 'byok is not a pricing trick. it is a security posture.',
  },
];

export function WhyWeBuilt() {
  return (
    <section className="relative py-24 md:py-28">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="pill">why we built this</p>
          <h2 className="mt-5 text-display-lg lowercase">
            <span className="text-grad">six things every</span>{' '}
            <span className="text-grad-brand">agent runtime should ship.</span>
          </h2>
          <p className="mt-4 max-w-xl text-[16px] text-ink-dim">
            the constraints we ran into building agents in production, and the design decisions they forced. each is non-negotiable in brocco.
          </p>
        </div>

        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {WHY.map((w, i) => (
            <motion.li
              key={w.title}
              variants={{
                hidden: { opacity: 0, y: 14 },
                show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
              }}
              className="card card-hover relative overflow-hidden p-6"
            >
              <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-2 text-[16.5px] font-semibold leading-snug tracking-tight">
                {w.title}
              </h3>
              <p className="mt-3 text-[13.5px] leading-relaxed text-ink-dim">{w.body}</p>
              <p className="mt-3 border-t border-white/[0.06] pt-3 font-serif italic text-[13.5px] leading-snug text-ink/95">
                {w.closer}
              </p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
