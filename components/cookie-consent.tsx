'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';

const KEY = 'brocco:consent';
type Mode = 'all' | 'essential' | null;

interface ConsentState {
  mode: Mode;
  ts: number;
}

function read(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentState;
  } catch {
    return null;
  }
}

function write(mode: Mode) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ mode, ts: Date.now() }));
    // Tell the rest of the app immediately so the analytics providers
    // can initialize without a refresh.
    window.dispatchEvent(new CustomEvent('brocco:consent-change', { detail: { mode } }));
  } catch {
    /* ignore */
  }
}

/**
 * Read access for other components / scripts. Defaults to FALSE for
 * analytics until user explicitly accepts (GDPR-conservative).
 */
export function hasConsent(category: 'essential' | 'analytics' | 'marketing'): boolean {
  if (typeof window === 'undefined') return false;
  const state = read();
  if (!state || !state.mode) {
    // No decision yet → only essentials are allowed.
    return category === 'essential';
  }
  if (state.mode === 'all') return true;
  return category === 'essential';
}

export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const state = read();
    if (!state || !state.mode) {
      const t = setTimeout(() => setOpen(true), 700);
      return () => clearTimeout(t);
    }
  }, []);

  function accept() {
    write('all');
    setOpen(false);
  }
  function essential() {
    write('essential');
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-label="Cookie preferences"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-2xl rounded-2xl border border-white/[0.10] bg-bg-1/95 p-4 shadow-glow backdrop-blur-xl md:bottom-5 md:p-5"
        >
          <button
            aria-label="Dismiss"
            onClick={essential}
            className="absolute right-3 top-3 rounded-md p-1 text-ink-faint hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="flex items-start gap-3">
            <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand/30 to-cyan/20 ring-1 ring-white/[0.10] sm:inline-flex">
              <ShieldCheck className="h-4 w-4 text-brand-glow" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-[15px] font-semibold tracking-tight">
                We use cookies you can audit.
              </h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-dim">
                Essentials run the site (auth, checkout, language). Analytics help us
                see which pages convert. Marketing pixels measure ad performance. Pick what
                you accept. See our{' '}
                <Link href="/privacy" className="text-cyan-glow underline-offset-4 hover:underline">
                  privacy policy
                </Link>
                .
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button onClick={accept} className="btn-primary text-[12.5px] px-4 py-2">
                  Accept all
                </button>
                <button onClick={essential} className="btn-ghost text-[12.5px] px-4 py-2">
                  Essential only
                </button>
                <span className="ml-auto font-mono text-[10.5px] text-ink-faint">
                  Saved locally · no server-side tracking until consent
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
