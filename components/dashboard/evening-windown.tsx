'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Moon, X } from 'lucide-react';
import Image from 'next/image';
import { getCastMember } from '@/lib/agent-cast';
import type { AgentName } from '@/lib/agents';

// EveningWindDown — the second half of the daily-ritual mandate.
//
// Where MorningBriefing answers "what did brocco do while I slept,"
// EveningWindDown answers "what does brocco want to run tonight."
//
// It only renders when the local hour is >= 19 (7pm) so the dashboard
// doesn't feel cluttered in the morning. Below the threshold, the
// component returns null.

interface WindDownItem {
  slug: AgentName;
  agent: string;
  accent: string;
  message: string;
  meta: string;
  /** what the user gets if they accept */
  acceptLabel: string;
}

const FIXTURES: WindDownItem[] = [
  {
    slug: 'researcher',
    agent: 'researcher',
    accent: '#67E8F9',
    message: 'queued: scan 5 competitor blogs at 03:00. should be 12-min run, fresh by your morning brief.',
    meta: 'runs 03:00 · est 12 min',
    acceptLabel: 'keep queued',
  },
  {
    slug: 'outreach',
    agent: 'outreach',
    accent: '#FBBF24',
    message: '6 cold-email drafts waiting for your nod. nothing sends overnight without approval.',
    meta: '6 drafts · awaiting nod',
    acceptLabel: 'review now',
  },
  {
    slug: 'browser',
    agent: 'browser',
    accent: '#67E8F9',
    message: 'monitoring competitor pricing page. last diff was 09:14 today — nothing new since.',
    meta: 'monitoring · 4h since last change',
    acceptLabel: 'view watch list',
  },
  {
    slug: 'supervisor',
    agent: 'supervisor',
    accent: '#22C55E',
    message: 'tomorrow has 3 deep-work blocks scheduled. designer queued for the 9-11 block on your landing refresh.',
    meta: 'tomorrow plan · supervised',
    acceptLabel: 'see schedule',
  },
];

interface EveningWindDownProps {
  onAct?: (item: WindDownItem) => void;
  /** force render regardless of clock — for testing or dev */
  alwaysShow?: boolean;
}

export function EveningWindDown({ onAct, alwaysShow }: EveningWindDownProps) {
  const [items, setItems] = useState<WindDownItem[]>(FIXTURES);
  const [now, setNow] = useState<string>('');
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setNow(d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
      setShouldShow(alwaysShow || d.getHours() >= 19);
    };
    update();
    const t = setInterval(update, 60_000);
    return () => clearInterval(t);
  }, [alwaysShow]);

  function dismiss(slug: AgentName) {
    setItems((curr) => curr.filter((it) => it.slug !== slug));
  }

  if (!shouldShow) return null;

  return (
    <section className="w-full max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400/30 to-indigo-400/5 ring-1 ring-indigo-400/30">
            <Moon className="h-4 w-4 text-indigo-300" />
          </span>
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
              your evening wind-down
            </p>
            <h2 className="mt-0.5 text-[20px] font-semibold tracking-tight lowercase">
              <span className="text-grad">tonight,</span>{' '}
              <span className="font-serif italic font-normal text-grad-brand">while you sleep.</span>
            </h2>
          </div>
        </div>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
          {now || '--:--'}
        </span>
      </div>

      <ul className="mt-5 space-y-2.5">
        <AnimatePresence>
          {items.length === 0 ? (
            <motion.li
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.01] p-6 text-center text-[13px] text-ink-faint"
            >
              wind-down cleared. brocco is on standby until morning.
            </motion.li>
          ) : (
            items.map((it, i) => (
              <WindDownRow
                key={it.slug}
                item={it}
                index={i}
                onAct={() => onAct?.(it)}
                onDismiss={() => dismiss(it.slug)}
              />
            ))
          )}
        </AnimatePresence>
      </ul>

      <p className="mt-5 text-center font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
        nothing sends overnight without your nod  ·  full audit log on the morning brief
      </p>
    </section>
  );
}

function WindDownRow({
  item,
  index,
  onAct,
  onDismiss,
}: {
  item: WindDownItem;
  index: number;
  onAct: () => void;
  onDismiss: () => void;
}) {
  const member = getCastMember(item.slug);
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-bg-1/60 p-3 transition-colors hover:border-white/[0.14] hover:bg-bg-1/80"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-12 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
        style={{ background: `radial-gradient(circle, ${item.accent}55 0%, transparent 70%)` }}
      />

      <div className="flex items-start gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-black ring-1 ring-white/[0.06]">
          {member?.imagePath && (
            <Image
              src={member.imagePath}
              alt=""
              fill
              sizes="56px"
              className="object-cover"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em]"
              style={{ color: item.accent, border: `1px solid ${item.accent}40`, background: `${item.accent}15` }}
            >
              <span
                className="h-1 w-1 rounded-full"
                style={{ background: item.accent, boxShadow: `0 0 6px ${item.accent}` }}
              />
              {item.agent}
            </span>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
              {item.meta}
            </span>
          </div>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink">{item.message}</p>
          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={onAct}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium transition-opacity hover:opacity-80"
              style={{ color: item.accent }}
            >
              {item.acceptLabel}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={onDismiss}
              className="ml-auto inline-flex items-center gap-1 text-[11.5px] text-ink-faint transition-colors hover:text-ink-dim"
            >
              <X className="h-3 w-3" />
              dismiss
            </button>
          </div>
        </div>
      </div>
    </motion.li>
  );
}
