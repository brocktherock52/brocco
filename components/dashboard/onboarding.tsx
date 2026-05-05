'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Sparkles, KeyRound, Radio, Zap, ArrowRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const KEY = 'brocco:onboarded';

export function Onboarding({ onOpenByok }: { onOpenByok: () => void }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = localStorage.getItem(KEY);
    if (!seen) {
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  function close() {
    try {
      localStorage.setItem(KEY, '1');
    } catch {}
    setOpen(false);
  }

  const STEPS = [
    {
      icon: Sparkles,
      title: 'Welcome to brocco',
      body:
        'You are looking at a real multi-agent dashboard. Pick agents on the left, type a goal, and hit run. Demo Mode runs immediately, no key needed.',
      cta: { label: 'Show me how', primary: true },
    },
    {
      icon: Radio,
      title: 'Broadcast mode',
      body:
        'Toggle Broadcast (Cmd+B) to fan one prompt out to N agents in parallel. Each agent gets its own pane and runs concurrently.',
      cta: { label: 'Got it', primary: true },
    },
    {
      icon: KeyRound,
      title: 'Switch to Live Mode (optional)',
      body:
        'Add your Anthropic API key to call Claude directly from your browser. Your key never touches our servers. Free tier: 100 runs / month.',
      cta: { label: 'Add key', primary: true, action: 'byok' },
      altCta: { label: 'Stay in demo', primary: false },
    },
    {
      icon: Zap,
      title: 'You are ready.',
      body:
        'Try a one-click recipe on the left, or type something specific in the prompt box. Cmd+Enter to run.',
      cta: { label: 'Start building', primary: true },
    },
  ];

  const s = STEPS[step];
  const Icon = s.icon;
  const isLast = step === STEPS.length - 1;

  function next() {
    if (s.cta.action === 'byok') {
      close();
      onOpenByok();
      return;
    }
    if (isLast) close();
    else setStep(step + 1);
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-bg-0/70 backdrop-blur-md" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[70] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/[0.10] bg-bg-1/95 p-7 shadow-glow backdrop-blur-2xl">
          <button
            onClick={close}
            className="absolute right-3 top-3 rounded-md p-1 text-ink-faint hover:bg-white/[0.06] hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mb-5 flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-gradient-to-r from-brand to-cyan' : 'bg-white/[0.08]'}`}
              />
            ))}
          </div>

          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand/30 to-cyan/20 ring-1 ring-white/[0.08]">
            <Icon className="h-5 w-5 text-brand-glow" />
          </div>
          <Dialog.Title className="mt-4 text-[20px] font-semibold tracking-tight">{s.title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-[14.5px] leading-relaxed text-ink-dim">
            {s.body}
          </Dialog.Description>

          <div className="mt-7 flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] text-ink-faint">
              {step + 1} / {STEPS.length}
            </span>
            <div className="flex gap-2">
              {s.altCta && (
                <button onClick={close} className="btn-ghost text-[13px] px-4 py-2">
                  {s.altCta.label}
                </button>
              )}
              <button onClick={next} className="btn-primary text-[13px] px-4 py-2">
                {s.cta.label}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
