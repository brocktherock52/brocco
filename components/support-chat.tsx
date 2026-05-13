'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Github, Mail, MessageCircle, X } from 'lucide-react';

/**
 * Floating support chat widget. Self-hosted, no third-party SaaS.
 * Bottom-right FAB; click to open a tray with three contact rails:
 *   1. Book a Calendly demo
 *   2. Email help@brocco.dev
 *   3. Open the public GitHub issues page
 *
 * Style locks: matches site dark UI (white/8% borders, cyan glow accent,
 * rounded-2xl card, backdrop-blur).
 */
export function SupportChat() {
  const [open, setOpen] = useState(false);
  const [showFab, setShowFab] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowFab(true), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showFab && (
          <motion.div
            key="support-fab"
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.92 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-5 right-5 z-50 md:bottom-6 md:right-6"
          >
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'close support' : 'open support'}
              className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand to-cyan text-white shadow-glow2 transition-all duration-200 hover:scale-105 hover:shadow-glow"
            >
              <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/[0.10]" />
              {open ? (
                <X className="h-5 w-5 transition-transform" />
              ) : (
                <MessageCircle className="h-5 w-5 transition-transform group-hover:scale-105" />
              )}
              {!open && (
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-bg-0 bg-cyan-400 animate-pulse" />
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="support-tray"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-20 right-5 z-50 w-[320px] overflow-hidden rounded-2xl border border-white/[0.10] bg-bg-1/95 shadow-glow backdrop-blur-2xl md:bottom-24 md:right-6"
            role="dialog"
            aria-label="support"
          >
            <div className="border-b border-white/[0.06] bg-gradient-to-br from-brand/15 via-bg-1/40 to-cyan/10 px-5 py-4">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-cyan-glow">
                support
              </p>
              <p className="mt-1 text-[14.5px] font-semibold tracking-tight">
                got a question? <span className="font-serif italic font-normal text-grad-brand">we answer.</span>
              </p>
              <p className="mt-1 text-[12.5px] leading-snug text-ink-dim">
                solo founder. real human reads every message.
              </p>
            </div>
            <div className="p-2">
              <SupportRow
                Icon={Calendar}
                label="book a 15-min demo"
                hint="calendly · same-day slots"
                href="https://calendly.com/brockpivec/"
                external
              />
              <SupportRow
                Icon={Mail}
                label="email help@brocco.dev"
                hint="founder direct · usually within an hour"
                href="mailto:help@brocco.dev?subject=brocco%20support"
              />
              <SupportRow
                Icon={Github}
                label="open a github issue"
                hint="public repo · public history"
                href="https://github.com/brocktherock52/brocco/issues"
                external
              />
            </div>
            <div className="border-t border-white/[0.06] px-4 py-3">
              <p className="font-mono text-[10.5px] text-ink-faint">
                <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-cyan-400 align-middle animate-pulse" />
                all systems ok
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SupportRow({
  Icon,
  label,
  hint,
  href,
  external,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
  href: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.05]"
    >
      <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-white/[0.04] ring-1 ring-white/[0.08] transition-colors group-hover:ring-cyan-400/35">
        <Icon className="h-4 w-4 text-cyan-glow" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold tracking-tight text-white">{label}</p>
        <p className="mt-0.5 text-[12px] leading-snug text-ink-dim">{hint}</p>
      </div>
    </a>
  );
}
