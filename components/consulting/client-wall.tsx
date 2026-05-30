'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

/**
 * Client + venture wall for the consulting page. Builds brand recognition by
 * showing who we've built for, rendered as clean wordmark chips (we don't have
 * every client's raster logo, so styled wordmarks keep it consistent and on-
 * brand instead of a row of mismatched PNGs).
 *
 * `href` is optional and intentionally left blank where we don't have a
 * verified public URL. We never link to a guessed or dead domain, so chips
 * without a confirmed site render as plain (non-link) wordmarks.
 */
type Client = {
  name: string;
  kind: 'client' | 'venture';
  href?: string; // verified public URL only; blank renders a non-link chip
};

const CLIENTS: Client[] = [
  // Consulting clients (engagements)
  { name: 'ChiroVision', kind: 'client' },
  { name: 'Picture Perfect Health', kind: 'client', href: 'https://pictureperfecthealth.com' },
  { name: 'Salt Waterfront Kitchen', kind: 'client', href: 'https://saltwaterfrontkitchenmd.com' },
  { name: 'Point Lookout Marina', kind: 'client', href: 'https://pointlookoutmarina.com' },
  { name: 'Marley Select Staffing', kind: 'client' },
  // Our own ventures, same team, built in-house
  { name: 'Brocco', kind: 'venture', href: '/' },
  { name: 'Storefront Labs', kind: 'venture' },
  { name: 'Pellegrino', kind: 'venture', href: 'https://www.tiktok.com/@pellegrino0001' },
  { name: 'CarryStack', kind: 'venture' },
];

export function ClientWall() {
  return (
    <section className="relative border-y border-white/[0.06] bg-bg-1/30 py-14">
      <div className="container-x">
        <div className="flex flex-col items-center text-center">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-faint">
            trusted by operators · built by the same team
          </p>
          <h2 className="mt-3 max-w-xl text-[20px] font-semibold tracking-tight text-ink md:text-[24px]">
            <span className="text-grad">Real businesses</span>{' '}
            <span className="text-grad-brand">run on our agents.</span>
          </h2>
        </div>

        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          className="mx-auto mt-9 flex max-w-4xl flex-wrap items-center justify-center gap-2.5"
        >
          {CLIENTS.map((c) => {
            const inner = (
              <span className="inline-flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: c.kind === 'venture' ? '#67E8F9' : '#A78BFA',
                    boxShadow: `0 0 8px ${c.kind === 'venture' ? '#67E8F9' : '#A78BFA'}66`,
                  }}
                />
                <span className="text-[14px] font-semibold tracking-tight text-ink">{c.name}</span>
                {c.kind === 'venture' && (
                  <span className="rounded-full bg-cyan/10 px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.16em] text-cyan-glow">
                    ours
                  </span>
                )}
                {c.href && <ArrowUpRight className="h-3 w-3 text-ink-faint" />}
              </span>
            );
            const cls =
              'inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 transition-colors hover:border-white/[0.18] hover:bg-white/[0.06]';
            return (
              <motion.li
                key={c.name}
                variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              >
                {c.href ? (
                  <a
                    href={c.href}
                    target={c.href.startsWith('http') ? '_blank' : undefined}
                    rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={cls}
                  >
                    {inner}
                  </a>
                ) : (
                  <span className={cls}>{inner}</span>
                )}
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
