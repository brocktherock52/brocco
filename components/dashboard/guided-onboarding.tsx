'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';

// GuidedOnboarding — first-time onboarding overlay that walks a user
// through the 4 essential dashboard moves. Toggle in settings (stored
// in localStorage) so power users can turn it off.

const STEPS = [
  {
    title: 'welcome to your AI team',
    body: 'nine specialists run in parallel on every prompt. this is your dashboard.',
  },
  {
    title: 'type a goal — any goal',
    body: 'one prompt fans out to the team. each specialist gets its own streaming pane.',
  },
  {
    title: 'set it and forget it',
    body: 'click "set and forget" on any done run to schedule it. brocco re-runs it for you every morning.',
  },
  {
    title: 'build your own agent',
    body: '4 steps. fork a template, pick a costume, save. your agent shows up in the sidebar instantly.',
  },
];

const STORAGE_KEY = 'brocco:onboarding-seen';
const TOGGLE_KEY = 'brocco:onboarding-enabled';

export function GuidedOnboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      const enabled = localStorage.getItem(TOGGLE_KEY);
      const seen = localStorage.getItem(STORAGE_KEY);
      if (enabled !== 'off' && !seen) {
        // small delay so it doesn't pop instantly on first render
        const t = window.setTimeout(() => setOpen(true), 700);
        return () => window.clearTimeout(t);
      }
    } catch {}
  }, []);

  function close() {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {}
    setOpen(false);
  }

  function next() {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else close();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[55] flex items-center justify-center bg-black/70 p-6 backdrop-blur-xl"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl border border-white/[0.12] bg-bg-1/95 p-6 shadow-glow backdrop-blur-2xl"
          >
            <button
              onClick={close}
              className="absolute right-3 top-3 rounded-md p-1 text-ink-faint hover:text-white"
              aria-label="close onboarding"
            >
              <X className="h-4 w-4" />
            </button>

            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
              first-time setup · step {step + 1} of {STEPS.length}
            </p>

            <div className="mt-3 flex gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i <= step ? 'bg-gradient-to-r from-brand to-cyan' : 'bg-white/[0.08]'
                  }`}
                />
              ))}
            </div>

            <h2 className="mt-6 text-[22px] font-semibold leading-tight tracking-tight">
              <span className="text-grad">{STEPS[step].title}</span>
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-dim">{STEPS[step].body}</p>

            <div className="mt-7 flex items-center justify-between">
              <button
                onClick={() => {
                  try {
                    localStorage.setItem(TOGGLE_KEY, 'off');
                  } catch {}
                  close();
                }}
                className="text-[12px] text-ink-faint hover:text-ink-dim"
              >
                I'm a power user · skip forever
              </button>
              <button
                onClick={next}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand to-cyan px-5 py-2 text-[13px] font-semibold text-white shadow-glow2"
              >
                {step === STEPS.length - 1 ? 'start using brocco' : 'next'}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
