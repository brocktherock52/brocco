'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { freshnessMeta } from '@/lib/freshness';
import { refreshProjectWithDiff } from '@/lib/refresh';
import { getBrain, type BrainEntry } from '@/lib/threads-client';
import type { AgentName } from '@/lib/agents';
import { trackEvent } from '@/components/posthog-provider';
import { WatchSettings } from './watch-settings';
import { fetchBillingAccess } from '@/lib/billing-client';

// One saved project in the history drawer. Carries the freshness dot, the
// "Watching · every 72h" indicator, a Refresh action that runs the
// diff-with-brain flow, and an expandable "What this project has learned"
// iteration history (the self-improving brain).

export interface ProjectCardEntry {
  id: string;
  goal: string;
  agents: AgentName[];
  ts: number;
  /** server thread id when this project is persisted (enables brain + watch) */
  threadId?: string | null;
  watchEnabled?: boolean;
  refreshCadenceHours?: number;
}

interface ProjectCardProps {
  entry: ProjectCardEntry;
  tier: 'free' | 'solo' | 'team';
  apiKey: string | null;
  modelId: string;
  onPickGoal: (goal: string) => void;
  onUpgrade?: () => void;
  /** bump so the bell re-fetches after a refresh files a changes_found alert */
  onRefreshed?: () => void;
}

export function ProjectCard({
  entry,
  tier,
  apiKey,
  modelId,
  onPickGoal,
  onUpgrade,
  onRefreshed,
}: ProjectCardProps) {
  const fm = freshnessMeta(entry.ts);
  // Use the id as the persistence key (brain + alerts) even for local/demo
  // projects. Server calls keyed by a local id 404 and degrade to localStorage,
  // which is exactly what powers the no-login demo. A purely-transient run id
  // (uid('r') -> "r-...") still persists locally so the demo accumulates.
  const threadId = entry.threadId ?? entry.id;
  const [busy, setBusy] = useState(false);
  const [lastSummary, setLastSummary] = useState<string | null>(null);
  const [brainOpen, setBrainOpen] = useState(false);
  const [brain, setBrain] = useState<BrainEntry[] | null>(null);

  async function doRefresh() {
    if (busy) return;
    try {
      const access = await fetchBillingAccess();
      if (!access.canUseTools) { onUpgrade?.(); return; }
    } catch { toast.error('Could not check subscription access. Please retry.'); return; }
    setBusy(true);
    // Funnel: the refresh action is the core of the retention loop. Track the
    // click and (below) whether it surfaced changes, so PostHog can show how
    // often the watcher actually pays off for users.
    trackEvent('refresh_clicked', { mode: apiKey ? 'live' : 'demo' });
    const t = toast.loading('Checking for updates...', {
      description: 'Re-running with your project history so it builds on what it learned.',
    });
    try {
      const res = await refreshProjectWithDiff({
        threadId,
        goal: entry.goal,
        agents: entry.agents,
        apiKey,
        modelId,
        lastRunMs: entry.ts,
      });
      setLastSummary(res.summary);
      if (res.changed) {
        const n = (res.summary.match(/^\s*[-*]/gm) || []).length || 1;
        trackEvent('changes_found', { update_count: n, iterations: res.priorIterations });
        toast.success(`Found ${n} update${n === 1 ? '' : 's'}`, {
          id: t,
          description: 'Open "what changed" below to see the diff.',
        });
      } else {
        trackEvent('refresh_up_to_date', {});
        toast.success('Up to date', { id: t, description: 'No material changes since last run.' });
      }
      // refresh the brain view if it's open
      if (brainOpen && threadId) setBrain(await getBrain(threadId));
      onRefreshed?.();
    } catch (e) {
      toast.error('Refresh failed', {
        id: t,
        description: e instanceof Error ? e.message : 'Try again in a moment.',
      });
    } finally {
      setBusy(false);
    }
  }

  async function toggleBrain() {
    const next = !brainOpen;
    setBrainOpen(next);
    if (next && brain === null && threadId) {
      setBrain(await getBrain(threadId));
    }
  }

  const iterationCount = brain?.length ?? 0;

  return (
    <div className="group mb-1.5 w-full rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 hover:border-white/[0.12] hover:bg-white/[0.04]">
      <button onClick={() => onPickGoal(entry.goal)} className="block w-full text-left">
        <div className="line-clamp-2 text-[12.5px] font-medium text-ink">{entry.goal}</div>
      </button>

      <div className="mt-1.5 flex flex-wrap items-center gap-1 font-mono text-[10.5px] text-ink-faint">
        {entry.agents.slice(0, 4).map((a) => (
          <span key={a}>{a}</span>
        ))}
        <span className={`ml-auto inline-flex items-center gap-1.5 ${fm.textClass}`} title={fm.nudge}>
          <span className={`h-1.5 w-1.5 rounded-full ${fm.dotClass}`} />
          {fm.label}
        </span>
      </div>

      {/* watch indicator + brain toggle */}
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <WatchSettings
          threadId={threadId}
          tier={tier}
          initialEnabled={entry.watchEnabled ?? true}
          initialCadenceHours={entry.refreshCadenceHours ?? 72}
          onUpgrade={onUpgrade}
        />
        <button
          type="button"
          onClick={toggleBrain}
          className="inline-flex items-center gap-1 text-[10.5px] text-ink-faint hover:text-brand-glow"
          title="What this project has learned"
        >
          <Brain className="h-3 w-3" />
          learned{iterationCount ? ` (${iterationCount})` : ''}
          <ChevronDown className={`h-2.5 w-2.5 transition ${brainOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* refresh row */}
      <div className="mt-2 flex items-center justify-between gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1.5">
        <span className="text-[10.5px] leading-tight text-ink-dim">
          {fm.state !== 'fresh' ? fm.nudge : 'Pull the latest and see what changed.'}
        </span>
        <button
          type="button"
          onClick={doRefresh}
          disabled={busy}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-brand to-cyan px-2.5 py-1 text-[10.5px] font-semibold text-white disabled:opacity-60"
        >
          <RefreshCw className={`h-3 w-3 ${busy ? 'animate-spin' : ''}`} />
          {busy ? 'checking' : 'refresh'}
        </button>
      </div>

      {/* what changed (last refresh summary) */}
      {lastSummary && (
        <div className="mt-2 rounded-md border border-cyan-400/20 bg-cyan-400/[0.05] px-2.5 py-2">
          <p className="mb-1 font-mono text-[9.5px] uppercase tracking-wider text-cyan-glow">
            what's new
          </p>
          <p className="whitespace-pre-line text-[11px] leading-snug text-ink-dim">{lastSummary}</p>
        </div>
      )}

      {/* brain / iteration history */}
      <AnimatePresence>
        {brainOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-md border border-brand/20 bg-brand/[0.04] px-2.5 py-2">
              <p className="mb-1.5 inline-flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-wider text-brand-glow">
                <Brain className="h-3 w-3" /> what this project has learned
              </p>
              {brain === null ? (
                <p className="text-[11px] text-ink-faint">loading...</p>
              ) : brain.length === 0 ? (
                <p className="text-[11px] leading-snug text-ink-faint">
                  Nothing yet. Each refresh appends what it did, learned, and changed so the next
                  run builds on it.
                </p>
              ) : (
                <ol className="space-y-1.5">
                  {brain.map((b) => (
                    <li key={`${b.iteration}-${b.id ?? b.createdAt}`} className="text-[11px] leading-snug">
                      <span className="font-semibold text-ink">iteration {b.iteration}</span>
                      {b.changed && <p className="text-ink-dim">changed: {b.changed.slice(0, 240)}</p>}
                      {b.learned && (
                        <p className="text-ink-faint">learned: {b.learned.slice(0, 180)}</p>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
