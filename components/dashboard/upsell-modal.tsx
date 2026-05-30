'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, KeyRound, Sparkles, X, Zap } from 'lucide-react';
import { trackEvent } from '@/components/posthog-provider';

// UpsellModal, fires when a free-tier user hits their monthly run cap. Braeden
// (2026-05-26 call) flagged this exact friction point as the key monetization
// lever: "if they run out of runs, they're buying more... to the point where
// they're like, I just spent another hundred, I'll get the team and upgrade."
// We give two honest paths so the user is never hard-stopped:
//   1. Keep going free with their own key (BYOK, unlimited), the trust play.
//   2. Upgrade to Solo (2,000 hosted runs/mo), the conversion play.
// Each choice is tracked so the funnel is measurable in PostHog.

export function UpsellModal({
  open,
  onClose,
  onUseKey,
  source = 'run_limit',
}: {
  open: boolean;
  onClose: () => void;
  onUseKey: () => void;
  source?: string;
}) {
  // Funnel: the upsell impression. Pairs with upsell_choice so PostHog can
  // measure the offer's conversion rate, not just the clicks.
  useEffect(() => {
    if (open) trackEvent('upsell_shown', { source });
  }, [open, source]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-6 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: -12 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.12] bg-bg-1/95 p-7 shadow-glow backdrop-blur-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-3 rounded-md p-1 text-ink-faint hover:text-white"
              aria-label="close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-glow" />
              <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">
                you&apos;re out of free runs this month
              </p>
            </div>
            <h2 className="mt-3 text-[24px] font-semibold leading-tight tracking-tight">
              <span className="text-grad">your team&apos;s on a roll.</span>{' '}
              <span className="font-serif italic font-normal text-grad-brand">keep it going.</span>
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-dim">
              You&apos;ve used your 100 free runs. Pick how you want to keep running. No hard stop.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {/* BYOK, free, unlimited on their key */}
              <button
                type="button"
                onClick={() => {
                  trackEvent('upsell_choice', { choice: 'byok' });
                  onUseKey();
                }}
                className="group flex flex-col rounded-xl border border-white/[0.10] bg-white/[0.03] p-4 text-left transition hover:border-white/[0.2] hover:bg-white/[0.05]"
              >
                <KeyRound className="h-5 w-5 text-cyan-glow" />
                <p className="mt-3 text-[15px] font-semibold">Use your own key</p>
                <p className="mt-1 flex-1 text-[12.5px] leading-relaxed text-ink-dim">
                  Add an Anthropic / OpenAI key and run unlimited on your own tokens. Free forever.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-cyan-glow">
                  add key <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>

              {/* Upgrade, hosted runs */}
              <Link
                href="/checkout/solo"
                onClick={() => trackEvent('upsell_choice', { choice: 'upgrade_solo' })}
                className="group relative flex flex-col rounded-xl border border-brand/40 bg-gradient-to-br from-brand/15 to-cyan/5 p-4 text-left shadow-glow2 transition hover:shadow-glow"
              >
                <span className="absolute -top-2 right-3 rounded-full bg-gradient-to-r from-brand to-cyan px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-white">
                  most pick this
                </span>
                <Zap className="h-5 w-5 text-brand-glow" />
                <p className="mt-3 text-[15px] font-semibold">Upgrade to Solo</p>
                <p className="mt-1 flex-1 text-[12.5px] leading-relaxed text-ink-dim">
                  2,000 hosted runs/mo (we cover the tokens), 8 agents in parallel, all integrations.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-white">
                  $49/mo <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </div>

            <button
              onClick={onClose}
              className="mt-5 w-full text-center text-[12px] text-ink-faint hover:text-ink-dim"
            >
              maybe later
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
