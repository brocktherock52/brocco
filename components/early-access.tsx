'use client';

/**
 * EarlyAccess — the free-tier signup capture the social content machine drives
 * to ("100 free runs -> brocco.dev"). One email field, one button. On submit it
 * POSTs to /api/early-access (graceful-degrade capture) and then drops the
 * visitor straight into the working demo at /app, so the free experience starts
 * immediately even before account auth is fully wired.
 *
 * Variants:
 *   "inline"  — hero/section use, transparent, sits in existing layout.
 *   "card"    — standalone boxed version (used on /signup).
 */
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Mail, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  source?: string;
  variant?: 'inline' | 'card';
  className?: string;
}

export function EarlyAccess({ source = 'unknown', variant = 'inline', className = '' }: Props) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      toast.error('enter a valid email.');
      return;
    }
    setSending(true);
    try {
      const referrer = typeof document !== 'undefined' ? document.referrer : '';
      await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, source, referrer }),
      });
      // Optimistic: the capture never blocks the visitor from the free demo.
      try {
        localStorage.setItem('brocco:lead', trimmed);
        localStorage.setItem('brocco:tier', 'free');
      } catch {
        /* ignore */
      }
      setDone(true);
      toast.success("you're in.", { description: 'opening your AI team...' });
      setTimeout(() => {
        window.location.href = '/app';
      }, 1100);
    } catch {
      // Even on a network hiccup, let them into the demo.
      window.location.href = '/app';
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className={`flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.06] px-5 py-4 text-emerald-200 ${className}`}>
        <Check className="h-5 w-5 shrink-0" />
        <p className="text-[14px]">
          you&apos;re in. opening your AI team{' '}
          <Link href="/app" className="underline underline-offset-4">now</Link>...
        </p>
      </div>
    );
  }

  const wrap =
    variant === 'card'
      ? 'rounded-3xl border border-white/[0.12] bg-bg-1/80 p-6 shadow-glow backdrop-blur-xl'
      : '';

  return (
    <form onSubmit={onSubmit} className={`${wrap} ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            aria-label="email"
            className="block w-full rounded-2xl border border-white/[0.12] bg-bg-0/60 py-3.5 pl-10 pr-4 text-[15px] text-ink outline-none transition placeholder:text-ink-faint focus:border-cyan-glow/50"
          />
        </div>
        <button
          type="submit"
          disabled={sending}
          className="btn-primary group inline-flex items-center justify-center gap-2 whitespace-nowrap px-6 py-3.5 text-[15px] disabled:opacity-60"
        >
          <span>{sending ? 'starting...' : 'claim 100 free runs'}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
      <p className="mt-2.5 text-center text-[12px] text-ink-faint sm:text-left">
        free • no credit card • 100 runs every month
      </p>
    </form>
  );
}
