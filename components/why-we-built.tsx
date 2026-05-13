'use client';

import { motion } from 'framer-motion';

/**
 * WhyWeBuilt — magazine-style editorial. No cards, no rounded boxes, no
 * spotlight. The page already has too many card grids. This section now
 * reads like a print spread: oversized numeric drop caps, vertical column
 * rules, sans body, serif italic closers. The voice is "broadsheet of one".
 *
 * Layout:
 *   - h2 hero headline (existing rhythm)
 *   - 3 wide rows of magazine entries; each row has a left rail (number +
 *     section kicker), a body column, and an italic closer column.
 *   - On md+ screens those three pieces sit on one line separated by thin
 *     vertical rules; on mobile they stack vertically so the rules
 *     collapse out.
 */

const ENTRIES = [
  {
    kicker: 'on architecture',
    title: 'specialists beat generalists',
    body:
      'one agent good at everything is bad at everything. we ship 888 specialists with their own tool lists, system prompts, and memories. each one is small enough to debug and sharp enough to ship.',
    closer: 'a researcher does not write code. a coder does not draft cold emails.',
  },
  {
    kicker: 'on observability',
    title: "observability or it didn't happen",
    body:
      'every step of every run is appended to a single jsonl file. you can grep it, diff it, replay it, hand it to your security team in the morning and still close tickets by lunch.',
    closer: 'no black-box autonomy. no surprise tool calls.',
  },
  {
    kicker: 'on concurrency',
    title: 'parallel by default',
    body:
      'broadcast one prompt to n agents. they run concurrently in their own panes, each finishing when it finishes. supervisor stitches the outputs together if you want a single report.',
    closer: 'one cup of coffee, five outputs.',
  },
  {
    kicker: 'on transport',
    title: 'streaming all the way through',
    body:
      'server-sent events from the model into the dashboard, with no polling and no spinners. live token chip in the header during every run so you always know what you are paying for.',
    closer: 'you watch the agent think, not wait for it to finish.',
  },
  {
    kicker: 'on economics',
    title: 'cost is a first-class citizen',
    body:
      'prompt caching is on by default. 80% cache hit on repeat workflows. live token meter shows cost in dollars while you wait. budgets are enforced before the next tool call, not after.',
    closer: 'a $49/mo tier covers 2,000 runs. solo founders ship in the green.',
  },
  {
    kicker: 'on data',
    title: 'your data does not train models',
    body:
      'on free tier, prompts go from your browser to your provider. on paid, our hosted runtime calls anthropic with zdr enabled by default. byok on every plan so the key never leaves your wallet.',
    closer: 'byok is not a pricing trick. it is a security posture.',
  },
];

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

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
            the constraints we ran into building agents in production, and the design decisions
            they forced. each is non-negotiable in brocco.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
          className="mt-14 divide-y divide-white/[0.06] border-y border-white/[0.06]"
        >
          {ENTRIES.map((e, i) => (
            <motion.article
              key={e.title}
              variants={itemVariants}
              className="grid gap-6 py-9 md:grid-cols-[7rem_minmax(0,1fr)_minmax(0,16rem)] md:gap-10 md:py-12"
            >
              {/* Left rail: numeric drop-cap + kicker */}
              <div className="md:border-r md:border-white/[0.06] md:pr-6">
                <div className="font-serif text-[44px] leading-none text-grad-brand md:text-[58px]">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-faint">
                  {e.kicker}
                </div>
              </div>

              {/* Body column */}
              <div className="md:pr-6">
                <h3 className="text-[22px] font-semibold leading-snug tracking-tight text-white md:text-[26px]">
                  {e.title}
                </h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-ink-dim md:text-[15.5px]">
                  {e.body}
                </p>
              </div>

              {/* Closer column: serif italic pulled quote */}
              <div className="md:border-l md:border-white/[0.06] md:pl-6">
                <p className="font-serif italic text-[15px] leading-snug text-ink/95 md:text-[16px]">
                  &ldquo;{e.closer}&rdquo;
                </p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
