'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { CADENCE_OPTIONS, cadenceLabel } from '@/lib/freshness';
import { updateThreadWatch } from '@/lib/threads-client';

// Per-project "watching" control: toggle on/off and pick the cadence
// (72h / 5 days / weekly). Gated to solo+ per Braeden ("include in teaming up
// or solo and up"). Free users see it as an upsell.

interface WatchSettingsProps {
  threadId: string | null;
  tier: 'free' | 'solo' | 'team';
  initialEnabled?: boolean;
  initialCadenceHours?: number;
  onUpgrade?: () => void;
}

export function WatchSettings({
  threadId,
  tier,
  initialEnabled = true,
  initialCadenceHours = 72,
  onUpgrade,
}: WatchSettingsProps) {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(initialEnabled);
  const [hours, setHours] = useState(initialCadenceHours);
  const locked = tier === 'free';

  async function persist(next: { enabled?: boolean; hours?: number }) {
    const e = next.enabled ?? enabled;
    const h = next.hours ?? hours;
    setEnabled(e);
    setHours(h);
    if (threadId) {
      const ok = await updateThreadWatch(threadId, {
        watchEnabled: e,
        refreshCadenceHours: h,
      });
      if (!ok) toast.error('Could not save watch settings. Try again.');
    }
  }

  if (locked) {
    return (
      <button
        type="button"
        onClick={() => {
          toast.message('Auto-refresh is a Solo feature', {
            description: 'Upgrade to have your AI team check this project every 72h, 5 days, or weekly and alert you when something changes.',
            action: onUpgrade ? { label: 'Upgrade', onClick: onUpgrade } : undefined,
          });
          onUpgrade?.();
        }}
        className="inline-flex items-center gap-1 text-[10.5px] text-ink-faint hover:text-amber-300"
        title="Auto-refresh is a Solo feature"
      >
        <Lock className="h-3 w-3" />
        auto-refresh: Solo
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1 text-[10.5px] ${
          enabled ? 'text-emerald-300/90' : 'text-ink-faint'
        } hover:text-white`}
        title="Watch cadence"
      >
        {enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
        {enabled ? `Watching · ${cadenceLabel(hours).toLowerCase()}` : 'Not watching'}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -3, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 top-full z-40 mt-1.5 w-[220px] overflow-hidden rounded-xl border border-white/[0.10] bg-bg-1/95 p-2 shadow-glow backdrop-blur-xl"
            >
              <label className="flex items-center justify-between rounded-md px-2 py-1.5 text-[12px] text-ink-dim">
                watch this project
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => persist({ enabled: e.target.checked })}
                  className="h-3.5 w-3.5 accent-emerald-400"
                />
              </label>
              <div className={`mt-1 space-y-0.5 ${enabled ? '' : 'pointer-events-none opacity-40'}`}>
                <p className="px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                  check every
                </p>
                {CADENCE_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => persist({ hours: c.hours })}
                    className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[12px] transition ${
                      hours === c.hours
                        ? 'bg-white/[0.06] text-white'
                        : 'text-ink-dim hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    {c.label}
                    {hours === c.hours && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
