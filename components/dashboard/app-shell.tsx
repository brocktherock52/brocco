'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  Cpu,
  History,
  KeyRound,
  Play,
  Share2,
  Sparkles,
  Square,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Logomark } from '@/components/logo';
import { AGENTS, type AgentName } from '@/lib/agents';
import { runAgent, type SimEvent } from '@/lib/simulator';
import { runClaudeLive, SYSTEM_PROMPTS, type LiveEvent } from '@/lib/claude';
import { recordRun, freeTierExceeded, remainingFreeRuns, getUsage, FREE_LIMIT } from '@/lib/usage';
import { uid } from '@/lib/utils';
import { AgentCard } from './agent-card';
import { StreamPane } from './stream-pane';
import { JsonlLog } from './jsonl-log';
import { ByokModal, getKey } from './byok-modal';
import { Onboarding } from './onboarding';
import { MorningBriefing } from './morning-briefing';
import { EveningWindDown } from './evening-windown';
import { SuggestionSlot } from './suggestion-slot';
import { recordStreakTouch } from '@/lib/streak';
import { getCustomAgents, TEMPLATES, deleteCustomAgent, type CustomAgent } from '@/lib/custom-agents';
import { CustomCroc } from '@/components/custom-croc';
import { RecurringToggle } from './recurring-toggle';
import { ConstructionCrew } from './construction-crew';
import { GuidedOnboarding } from './guided-onboarding';
import { listThreads, createThread, type ClientThread } from '@/lib/threads-client';
import { useSession, signOut } from '@/lib/auth-client';

const MODELS = [
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', tag: 'default' },
  { id: 'claude-opus-4-7', label: 'Claude Opus 4.7', tag: '1M ctx' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5', tag: 'fast' },
  { id: 'gpt-4o', label: 'GPT-4o', tag: 'OpenAI' },
  { id: 'grok-2', label: 'Grok 2', tag: 'xAI' },
  { id: 'llama-3-local', label: 'Llama 3 (local)', tag: 'Ollama' },
];

interface PaneState {
  id: string;
  agent: AgentName;
  events: SimEvent[];
  status: 'pending' | 'running' | 'done' | 'cancelled' | 'error';
  ctrl: AbortController;
  mode: 'demo' | 'live';
}

interface RunHistoryEntry {
  id: string;
  goal: string;
  agents: AgentName[];
  ts: number;
}

export function AppShell() {
  // v3.0: broadcast is the product. Default to 3 specialists selected.
  const [selected, setSelected] = useState<AgentName[]>([
    'researcher',
    'planner',
    'outreach',
  ]);
  const [broadcast, setBroadcast] = useState(true);
  const [goal, setGoal] = useState('');
  const [model, setModel] = useState(MODELS[0].id);
  const [modelOpen, setModelOpen] = useState(false);
  const [byokOpen, setByokOpen] = useState(false);
  const [keyState, setKeyState] = useState<string | null>(null);
  const [panes, setPanes] = useState<PaneState[]>([]);
  const [history, setHistory] = useState<RunHistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [serverThreads, setServerThreads] = useState<ClientThread[]>([]);
  const [serverOffline, setServerOffline] = useState(true);
  const session = useSession();
  const [usage, setUsage] = useState(getUsage());
  const [tokens, setTokens] = useState({ in: 0, out: 0, cost: 0 });
  const [demoRunsThisSession, setDemoRunsThisSession] = useState(0);
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([]);

  // hydrate
  useEffect(() => {
    setKeyState(getKey());
    setUsage(getUsage());
    // Tick the daily-streak counter — opening /app counts as the day's touch.
    recordStreakTouch();
    // Hydrate custom agents from localStorage + re-read on change.
    setCustomAgents(getCustomAgents());
    const onCustomChange = () => setCustomAgents(getCustomAgents());
    window.addEventListener('brocco:custom-agents-changed', onCustomChange);
    // cleanup attached via the same useEffect's main return below
    try {
      const raw = localStorage.getItem('brocco:history');
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
    // Pull server-side thread history if signed in; falls back to
    // localStorage cache when unauthenticated or offline.
    listThreads().then((res) => {
      setServerThreads(res.threads);
      setServerOffline(res.offline);
      if (!res.offline && res.threads.length) {
        // Hydrate the in-memory history drawer from the server so signed-in
        // returners land on a populated list even before clicking History.
        setHistory((curr) => {
          const fromServer: RunHistoryEntry[] = res.threads.slice(0, 25).map((t) => ({
            id: t.id,
            goal: t.title,
            agents: t.agents as AgentName[],
            ts: new Date(t.updatedAt).getTime(),
          }));
          // Prefer server entries; merge in any local-only ones that aren't there.
          const seen = new Set(fromServer.map((h) => h.goal));
          const merged = [...fromServer, ...curr.filter((h) => !seen.has(h.goal))].slice(0, 25);
          return merged;
        });
      }
    });
    // hydrate from share-hash if present
    if (typeof window !== 'undefined' && window.location.hash) {
      try {
        const hash = window.location.hash.replace(/^#/, '');
        if (hash.startsWith('run=')) {
          const enc = hash.slice(4);
          const json = JSON.parse(atob(decodeURIComponent(enc)));
          if (json.goal) setGoal(json.goal);
          if (Array.isArray(json.agents) && json.agents.length) setSelected(json.agents);
          if (typeof json.broadcast === 'boolean') setBroadcast(json.broadcast);
          toast.message('Loaded shared run', {
            description: 'Goal + agents pre-filled. Hit run when ready.',
          });
        }
      } catch {}
    }
    return () => {
      window.removeEventListener('brocco:custom-agents-changed', onCustomChange);
    };
  }, []);

  // sync history
  useEffect(() => {
    try {
      localStorage.setItem('brocco:history', JSON.stringify(history.slice(0, 25)));
    } catch {}
  }, [history]);

  const allEvents = useMemo(
    () => panes.flatMap((p) => p.events).sort((a, b) => a.ts - b.ts),
    [panes],
  );
  const running = panes.some((p) => p.status === 'running');

  // Map a CustomAgent.template -> a built-in AgentName archetype.
  // Custom agents currently run through their template's existing stream
  // and dispatch path until the live Claude wrapper accepts custom system
  // prompts directly. Pre-fills the goal with the agent's saved topic.
  function useCustomAgent(ca: CustomAgent) {
    const archetype: AgentName = (
      ca.template === 'closer'
        ? 'outreach'
        : ca.template === 'reviewer' || ca.template === 'analyst'
          ? 'analyst'
          : ca.template === 'qa'
            ? 'coder'
            : ca.template === 'recruiter'
              ? 'outreach'
              : ca.template === 'pm'
                ? 'planner'
                : ca.template === 'editor'
                  ? 'designer'
                  : 'researcher'
    ) as AgentName;
    if (!selected.includes(archetype)) {
      setSelected((s) => [...s, archetype]);
    }
    toast.message(`${ca.label} is on your team`, {
      description: `Runs through the ${archetype} stream. Edit anytime in /app/agents/new.`,
    });
  }

  function toggleAgent(name: AgentName) {
    // v3.0: broadcast always on, toggle adds/removes from the set.
    // Minimum 1, no upper bound.
    setSelected((s) =>
      s.includes(name) ? (s.length > 1 ? s.filter((x) => x !== name) : s) : [...s, name],
    );
  }

  async function run() {
    if (!goal.trim()) {
      toast.error('Type a goal first.');
      return;
    }
    if (selected.length === 0) {
      toast.error('Pick at least one agent on the left.');
      return;
    }

    const live = !!keyState;
    if (!live && freeTierExceeded(usage)) {
      toast.error('Free tier limit reached', {
        description: `You used your 100 free runs this month. Add an Anthropic key (BYOK) for unlimited runs on your tokens, or upgrade.`,
        action: { label: 'Upgrade', onClick: () => (window.location.href = '/pricing') },
      });
      return;
    }

    // v3.0: broadcast is always on; runAgents is just selected.
    const runAgents = selected;
    const next: PaneState[] = runAgents.map((name) => ({
      id: uid('p'),
      agent: name,
      events: [],
      status: 'running',
      ctrl: new AbortController(),
      mode: live ? 'live' : 'demo',
    }));
    setPanes(next);

    setHistory((h) =>
      [{ id: uid('r'), goal: goal, agents: runAgents, ts: Date.now() }, ...h].slice(0, 25),
    );
    // Persist as a thread on the server (no-op for anonymous users beyond
    // the localStorage write-through cache inside threads-client).
    createThread({ title: goal.slice(0, 200), agents: runAgents as string[] })
      .then((t) => {
        if (t) setServerThreads((curr) => [t, ...curr.filter((x) => x.id !== t.id)].slice(0, 50));
      })
      .catch(() => {});

    if (live) {
      toast.message('Live mode', {
        description: `Calling Claude directly from your browser with your key.`,
      });
    } else {
      toast.message('Demo mode', {
        description: 'Simulated run. Add an Anthropic key for live agents on your tokens.',
      });
    }

    let totalIn = 0;
    let totalOut = 0;
    let totalCost = 0;
    setTokens({ in: 0, out: 0, cost: 0 });

    await Promise.all(
      next.map((pane, idx) => {
        const a = AGENTS.find((x) => x.name === pane.agent)!;

        const emit = (e: SimEvent | (LiveEvent & { ts?: number; step?: number; agent?: AgentName })) => {
          const norm = ('ts' in e && e.ts ? e : null) as SimEvent | null;
          const ev = norm ?? ({ ...(e as LiveEvent), ts: Date.now(), step: 0, agent: pane.agent } as SimEvent);
          if ((ev as any).type === 'usage') {
            const u = ev as unknown as { in: number; out: number; cost_usd?: number };
            totalIn = u.in;
            totalOut = u.out;
            if (typeof u.cost_usd === 'number') totalCost = u.cost_usd;
            setTokens({ in: totalIn, out: totalOut, cost: totalCost });
            // fall through so the event is also pushed onto the pane log
          }
          setPanes((curr) =>
            curr.map((p, i) => (i === idx ? { ...p, events: [...p.events, ev as SimEvent] } : p)),
          );
        };

        if (live) {
          const sys = SYSTEM_PROMPTS[a.name] || SYSTEM_PROMPTS.researcher;
          return runClaudeLive({
            apiKey: keyState!,
            modelId: model,
            agent: a,
            goal,
            emit: (e) => emit(e),
            signal: pane.ctrl.signal,
            systemPrompt: sys,
          })
            .catch((err) => {
              // unexpected exception (not the structured-error event path)
              emit({
                type: 'error',
                kind: 'unknown',
                message: err instanceof Error ? err.message : String(err),
                retryable: true,
              } as any);
            })
            .finally(() => {
              setPanes((curr) =>
                curr.map((p, i) =>
                  i === idx
                    ? {
                        ...p,
                        status: pane.ctrl.signal.aborted
                          ? 'cancelled'
                          : p.events.some((e) => e.type === 'error')
                            ? 'error'
                            : 'done',
                      }
                    : p,
                ),
              );
            });
        }

        // demo path: simulator
        return runAgent(
          a,
          goal,
          (e) => {
            setPanes((curr) =>
              curr.map((p, i) => (i === idx ? { ...p, events: [...p.events, e] } : p)),
            );
          },
          { cancelled: pane.ctrl.signal.aborted },
        ).then(() => {
          setPanes((curr) =>
            curr.map((p, i) =>
              i === idx ? { ...p, status: pane.ctrl.signal.aborted ? 'cancelled' : 'done' } : p,
            ),
          );
        });
      }),
    );

    const u = recordRun({ in: totalIn, out: totalOut });
    setUsage(u);
    if (live) {
      const dollars = (totalCost > 0 ? totalCost : (totalIn * 3 + totalOut * 15) / 1_000_000).toFixed(4);
      toast.success('All agents finished.', {
        description: `Tokens: ${totalIn} in / ${totalOut} out. Est. cost: $${dollars}.`,
      });
    } else {
      const next = demoRunsThisSession + 1;
      setDemoRunsThisSession(next);
      toast.success('All agents finished.', {
        description: `${remainingFreeRuns(u)} free demo runs left this month.`,
      });
      // Nudge after 1st and 3rd demo run, only when no key is set yet.
      if (!keyState && (next === 1 || next === 3)) {
        setTimeout(() => {
          toast.message('Want real Claude calls?', {
            description: 'Add your Anthropic key (BYOK). Runs go directly from your browser to Anthropic.',
            duration: 9000,
            action: { label: 'Switch to Live', onClick: () => setByokOpen(true) },
          });
        }, 800);
      }
    }
  }

  function shareLastRun() {
    if (typeof window === 'undefined') return;
    const last = history[0];
    if (!last && !goal.trim()) {
      toast.error('Nothing to share yet. Run something first.');
      return;
    }
    const payload = {
      goal: last?.goal ?? goal,
      agents: last?.agents ?? selected,
      broadcast,
    };
    const enc = encodeURIComponent(btoa(JSON.stringify(payload)));
    const url = `${window.location.origin}/app#run=${enc}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success('Share link copied', {
          description: 'Anyone who opens it gets the same goal + agents pre-filled.',
        });
      })
      .catch(() => {
        toast.message('Copy this URL', { description: url, duration: 12000 });
      });
  }

  function stopAll() {
    setPanes((curr) => {
      curr.forEach((p) => {
        if (p.status === 'running') p.ctrl.abort();
      });
      return curr;
    });
    toast.warning('Stopping all agents...');
  }

  function clearDone() {
    setPanes((curr) => curr.filter((p) => p.status === 'running'));
  }

  /** Re-run a single failed/cancelled pane without restarting all agents.
   *  Replaces the pane in-place with a fresh AbortController + empty events. */
  async function retryPane(paneId: string) {
    const pane = panes.find((p) => p.id === paneId);
    if (!pane) return;
    const a = AGENTS.find((x) => x.name === pane.agent);
    if (!a) return;
    const live = !!keyState;
    const ctrl = new AbortController();
    setPanes((curr) =>
      curr.map((p) =>
        p.id === paneId ? { ...p, events: [], status: 'running' as const, ctrl } : p,
      ),
    );
    const emit = (e: SimEvent | (LiveEvent & { ts?: number; step?: number; agent?: AgentName })) => {
      const norm = ('ts' in e && e.ts ? e : null) as SimEvent | null;
      const ev =
        norm ??
        ({ ...(e as LiveEvent), ts: Date.now(), step: 0, agent: pane.agent } as SimEvent);
      if ((ev as any).type === 'usage') {
        const u = ev as unknown as { in: number; out: number; cost_usd?: number };
        setTokens((t) => ({
          in: t.in + (u.in || 0),
          out: t.out + (u.out || 0),
          cost: typeof u.cost_usd === 'number' ? t.cost + u.cost_usd : t.cost,
        }));
      }
      setPanes((curr) =>
        curr.map((p) => (p.id === paneId ? { ...p, events: [...p.events, ev as SimEvent] } : p)),
      );
    };

    try {
      if (live) {
        const sys = SYSTEM_PROMPTS[a.name] || SYSTEM_PROMPTS.researcher;
        await runClaudeLive({
          apiKey: keyState!,
          modelId: model,
          agent: a,
          goal,
          emit,
          signal: ctrl.signal,
          systemPrompt: sys,
        });
      } else {
        await runAgent(a, goal, (e) => emit(e), { cancelled: ctrl.signal.aborted });
      }
    } finally {
      setPanes((curr) =>
        curr.map((p) =>
          p.id === paneId
            ? {
                ...p,
                status: ctrl.signal.aborted
                  ? 'cancelled'
                  : p.events.some((e) => e.type === 'error')
                    ? 'error'
                    : 'done',
              }
            : p,
        ),
      );
    }
  }

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        run();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('goal-input')?.focus();
      }
      // Cmd+B no longer toggles broadcast (always on in v3.0)
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goal, selected, broadcast]);

  return (
    <div className="flex h-screen flex-col bg-bg-0 text-ink">
      {/* TOP BAR */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/[0.06] bg-bg-1/70 px-4 backdrop-blur-xl">
        <Link href="/" className="inline-flex items-center gap-2 text-[14px] font-semibold tracking-tight">
          <Logomark className="h-6 w-6" />
          brocco<span className="text-ink-faint">.app</span>
        </Link>

        <ModeBadge live={!!keyState} />

        <span className="hidden h-5 w-px bg-white/[0.10] md:block" />

        {/* model picker */}
        <div className="relative">
          <button
            onClick={() => setModelOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1.5 font-mono text-[12px] text-ink-dim hover:bg-white/[0.07] hover:text-white"
          >
            <Cpu className="h-3 w-3 text-brand-glow" />
            {MODELS.find((m) => m.id === model)?.label}
            <ChevronDown className="h-3 w-3 text-ink-faint" />
          </button>
          <AnimatePresence>
            {modelOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute left-0 top-full z-50 mt-1.5 w-64 overflow-hidden rounded-xl border border-white/[0.10] bg-bg-2/95 p-1 shadow-glow backdrop-blur-2xl"
              >
                {MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setModel(m.id);
                      setModelOpen(false);
                    }}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[12.5px] hover:bg-white/[0.06]"
                  >
                    <span>{m.label}</span>
                    <span className="font-mono text-[10.5px] text-ink-faint">{m.tag}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BYOK status */}
        <button
          onClick={() => setByokOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1.5 font-mono text-[12px] text-ink-dim hover:bg-white/[0.07] hover:text-white"
        >
          <KeyRound className="h-3 w-3" />
          {keyState ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              demo mode
            </span>
          )}
        </button>

        <div className="ml-auto flex items-center gap-2">
          {/* Session pill — signed-in email + sign out, or a sign-in link. */}
          {session?.data?.user ? (
            <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-ink-dim">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {session.data.user.email}
              <button
                type="button"
                onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/login'; } } })}
                className="ml-2 text-ink-faint hover:text-white"
              >
                sign out
              </button>
            </span>
          ) : (
            <Link
              href="/login"
              className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-ink-dim hover:bg-white/[0.07] hover:text-white"
            >
              sign in
            </Link>
          )}
          {(tokens.in > 0 || tokens.out > 0) && (
            <span
              className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-ink-dim"
              title="tokens + estimated cost this run (live mode only)"
            >
              <span className="text-cyan-glow">{tokens.in.toLocaleString()}</span>
              <span className="text-ink-faint">in</span>
              <span className="text-ink-faint">/</span>
              <span className="text-brand-glow">{tokens.out.toLocaleString()}</span>
              <span className="text-ink-faint">out</span>
              {tokens.cost > 0 && (
                <>
                  <span className="text-ink-faint">·</span>
                  <span className="text-emerald-300">${tokens.cost.toFixed(4)}</span>
                </>
              )}
            </span>
          )}
          <button
            onClick={shareLastRun}
            className="hidden sm:inline-flex rounded-full border border-white/[0.10] bg-white/[0.04] p-2 text-ink-dim hover:bg-white/[0.07] hover:text-white"
            title="Share this run"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="rounded-full border border-white/[0.10] bg-white/[0.04] p-2 text-ink-dim hover:bg-white/[0.07] hover:text-white"
            title="History"
          >
            <History className="h-3.5 w-3.5" />
          </button>
          {running ? (
            <button onClick={stopAll} className="btn-ghost text-[12.5px] px-3 py-1.5">
              <Square className="h-3 w-3" /> Stop all
            </button>
          ) : (
            <button onClick={clearDone} className="btn-ghost text-[12.5px] px-3 py-1.5">
              <Trash2 className="h-3 w-3" /> Clear done
            </button>
          )}
        </div>
      </header>

      {/* MAIN */}
      <div className="flex min-h-0 flex-1">
        {/* SIDEBAR — v3.0: agents only, broadcast always on, no recipe browser */}
        <aside className="hidden w-[260px] shrink-0 overflow-y-auto border-r border-white/[0.06] bg-bg-1/30 md:block">
          <div className="p-4">
            <p className="px-1 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">
              specialists · {selected.length} selected
            </p>
            <p className="mt-1.5 px-1 text-[11.5px] leading-snug text-ink-dim">
              broadcast is always on. one prompt fans out to every selected agent in parallel.
            </p>
            <div className="mt-4 space-y-2">
              {AGENTS.map((a) => (
                <AgentCard
                  key={a.name}
                  agent={a}
                  selected={selected.includes(a.name)}
                  onToggle={() => toggleAgent(a.name)}
                />
              ))}
            </div>

            {/* Custom agents list — renders below the built-ins. Clicking
                "use" routes the agent through its template archetype's
                runtime stream. Full system-prompt override is a follow-up
                once the live Claude wrapper accepts custom prompts. */}
            {customAgents.length > 0 && (
              <div className="mt-5">
                <p className="px-1 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">
                  your agents · {customAgents.length}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {customAgents.map((ca) => (
                    <li
                      key={ca.id}
                      className="group flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 transition-colors hover:border-white/[0.14] hover:bg-white/[0.04]"
                    >
                      <span
                        className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-black"
                        style={{ boxShadow: `inset 0 0 0 1px ${ca.accent}33` }}
                      >
                        <CustomCroc
                          accent={ca.accent}
                          accessory={ca.accessory ?? 'none'}
                          className="absolute inset-0 h-full w-full"
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-medium text-ink">{ca.label}</p>
                        <p className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                          {ca.template}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => useCustomAgent(ca)}
                        className="rounded-md border border-white/[0.08] bg-white/[0.02] px-2 py-1 text-[10.5px] text-ink-dim transition hover:border-white/[0.18] hover:text-white"
                      >
                        use
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete ${ca.label}?`)) deleteCustomAgent(ca.id);
                        }}
                        className="rounded-md p-1 text-ink-faint opacity-0 transition group-hover:opacity-100 hover:text-red-300"
                        aria-label={`delete ${ca.label}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Create-your-own-agent entry point — feeds the lib/custom-agents
                store via the wizard at /app/agents/new. */}
            <Link
              href="/app/agents/new"
              className="group mt-4 flex items-center justify-between gap-2 rounded-lg border border-dashed border-white/[0.10] bg-white/[0.02] px-3 py-2.5 text-[12.5px] text-ink-dim transition-colors hover:border-white/[0.22] hover:bg-white/[0.04] hover:text-white"
            >
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-brand-glow" />
                create your own agent
              </span>
              <ArrowRight className="h-3 w-3 opacity-60 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </aside>

        {/* CENTER */}
        <main className="flex min-w-0 flex-1 flex-col">
          {/* Chat-first goal input — prominent, centered, ChatGPT-style.
              Bigger pill, glowing border, larger placeholder, primary CTA. */}
          <div className="relative border-b border-white/[0.06] bg-bg-0 px-4 py-6">
            <div className="mx-auto w-full max-w-3xl">
              <div className="relative">
                {/* glow halo behind the input */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-1 -z-10 rounded-3xl opacity-60 blur-2xl"
                  style={{
                    background:
                      'radial-gradient(ellipse at 50% 30%, rgba(103,232,249,0.22), transparent 60%), radial-gradient(ellipse at 50% 70%, rgba(167,139,250,0.18), transparent 60%)',
                  }}
                />
                <div className="relative rounded-3xl border border-white/[0.12] bg-bg-1/80 p-1.5 shadow-glow backdrop-blur-xl">
                  <textarea
                    id="goal-input"
                    placeholder="what should your AI team work on today?"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    rows={3}
                    className="block w-full resize-none rounded-2xl bg-transparent px-5 py-4 text-[16px] leading-relaxed text-ink outline-none placeholder:text-ink-faint"
                  />
                  <div className="flex items-center gap-2 px-3 pb-2">
                    <span className="kbd">⌘</span>
                    <span className="kbd">Enter</span>
                    <span className="text-[11.5px] text-ink-faint">to run</span>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="font-mono text-[11px] text-ink-faint">
                        {selected.length} agent{selected.length !== 1 && 's'} · parallel
                      </span>
                      <button
                        onClick={run}
                        disabled={running}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-cyan px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-glow2 transition-all hover:shadow-glow disabled:opacity-60"
                      >
                        {running ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 animate-pulse" /> agents at work
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5">
                            <Play className="h-3.5 w-3.5 fill-current" /> broadcast
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-center font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
                  your AI team · {selected.length}/9 specialists · broadcast mode on
                </p>
              </div>
            </div>
          </div>

          {/* Proactive nudge slot — appears above panes when there's an
              active suggestion, invisible otherwise. */}
          <SuggestionSlot
            onAccept={(g, ags) => {
              if (g) setGoal(g);
              if (ags && ags.length) setSelected(ags);
            }}
          />

          {/* panes + log */}
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden p-3 lg:grid-cols-[1fr_360px]">
            {/* panes */}
            <div className="relative min-h-0 overflow-y-auto">
              {/* Construction crew — walks across the pane area while runs
                  are active. Adds visual life to the work-in-progress. */}
              <ConstructionCrew active={running} />
              {panes.length === 0 ? (
                <EmptyState onPick={(g) => setGoal(g)} />
              ) : (
                <div
                  className={`grid gap-3 ${panes.length === 1 ? 'grid-cols-1' : panes.length === 2 ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 xl:grid-cols-2'}`}
                >
                  <AnimatePresence>
                    {panes.map((p) => (
                      <StreamPane
                        key={p.id}
                        agent={p.agent}
                        events={p.events}
                        status={p.status}
                        onClose={() => setPanes((curr) => curr.filter((x) => x.id !== p.id))}
                        onRetry={() => retryPane(p.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {panes.some((p) => p.status === 'done') && (
                <>
                  <SaveActions />
                  <div className="mt-2 flex justify-end">
                    <RecurringToggle goal={goal} agents={selected} />
                  </div>
                </>
              )}
            </div>

            {/* log */}
            <div className="hidden min-h-0 lg:block">
              <JsonlLog events={allEvents} />
            </div>
          </div>
        </main>

        {/* HISTORY DRAWER */}
        <AnimatePresence>
          {showHistory && (
            <motion.aside
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              className="fixed right-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-[320px] border-l border-white/[0.06] bg-bg-1/95 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">History</span>
                <button onClick={() => setShowHistory(false)} className="text-ink-faint hover:text-white">
                  ×
                </button>
              </div>
              <div className="overflow-y-auto p-3">
                {history.length === 0 ? (
                  <p className="px-1 text-[12.5px] text-ink-faint">No runs yet. Type a goal and hit run.</p>
                ) : (
                  history.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setGoal(h.goal)}
                      className="mb-1.5 w-full rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-left hover:border-white/[0.12] hover:bg-white/[0.04]"
                    >
                      <div className="line-clamp-2 text-[12.5px] font-medium text-ink">{h.goal}</div>
                      <div className="mt-1 flex flex-wrap gap-1 font-mono text-[10.5px] text-ink-faint">
                        {h.agents.map((a) => (
                          <span key={a}>{a}</span>
                        ))}
                        <span className="ml-auto">{new Date(h.ts).toLocaleTimeString()}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <ByokModal open={byokOpen} onOpenChange={setByokOpen} initial={keyState} onSaved={setKeyState} />
      <Onboarding onOpenByok={() => setByokOpen(true)} />
      <GuidedOnboarding />
    </div>
  );
}

function ModeBadge({ live }: { live: boolean }) {
  if (live) {
    return (
      <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 font-mono text-[11px] text-emerald-300">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        live mode
      </span>
    );
  }
  return (
    <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 font-mono text-[11px] text-amber-300">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      demo mode
    </span>
  );
}

/** v3.0: empty state shows 3 hardcoded "try this" goals that pre-fill the input. */
const TRY_THESE = [
  'research the top 5 alternatives to notion, output a 1-page brief and 5 cold-email angles',
  'plan a 7-day launch for a $49/mo dev tool with 0 audience and a $200 budget',
  'review my landing-page copy, suggest 5 a/b test variants, and draft 3 launch tweets',
];

function EmptyState({ onPick }: { onPick: (goal: string) => void }) {
  return (
    <div className="flex h-full min-h-[480px] flex-col items-center px-4 py-8">
      {/* The daily ritual — appears at the top of the empty dashboard. */}
      <MorningBriefing onAct={(item) => onPick(`Follow up on the ${item.agent}'s overnight run: ${item.output}`)} />

      {/* Evening wind-down — renders only after 7pm local. Below the morning
          briefing so the day reads top-down chronologically. */}
      <div className="mt-8 w-full max-w-3xl">
        <EveningWindDown
          onAct={(item) => onPick(`${item.agent}: ${item.message}`)}
        />
      </div>

      {/* Divider */}
      <div className="my-10 flex w-full max-w-3xl items-center gap-3 text-ink-faint">
        <span className="h-px flex-1 bg-white/[0.06]" />
        <span className="font-mono text-[10.5px] uppercase tracking-[0.18em]">or start something new</span>
        <span className="h-px flex-1 bg-white/[0.06]" />
      </div>

      <div className="max-w-lg text-center">
        <Logomark className="mx-auto h-10 w-10 opacity-90" />
        <h2 className="mt-4 text-[20px] font-semibold tracking-tight lowercase">
          <span className="text-grad">type one goal.</span>{' '}
          <span className="font-serif italic font-normal text-grad-brand">three agents work.</span>
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-dim">
          broadcast is always on. each specialist runs in its own pane, in parallel.
        </p>
        <p className="mt-4 inline-flex items-center gap-2 text-[12px] text-ink-faint">
          <span className="kbd">⌘</span>
          <span className="kbd">Enter</span>
          run
          <span className="kbd ml-3">⌘</span>
          <span className="kbd">K</span>
          focus
        </p>

        <p className="mt-8 text-left font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
          try one of these
        </p>
        <div className="mt-3 space-y-2 text-left">
          {TRY_THESE.map((g, i) => (
            <button
              key={i}
              onClick={() => onPick(g)}
              className="block w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-[13px] leading-relaxed text-ink-dim transition hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-white"
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SaveActions() {
  // v3.0: real OAuth integrations ship in PR4-6. For now, three primary
  // destinations only (notion, slack, linear). Email/drive/webhook deferred.
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">save output to</span>
      {['Notion', 'Slack', 'Linear'].map((dest) => (
        <button
          key={dest}
          onClick={() => toast.message(`${dest} oauth shipping in v3.0 PR ${dest === 'Notion' ? '4' : dest === 'Slack' ? '5' : '6'}`, {
            description: 'real integration with token refresh + scoped permissions. coming next.',
          })}
          className="rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1 text-[12px] font-medium text-ink-dim hover:bg-white/[0.07] hover:text-white"
        >
          {dest}
        </button>
      ))}
    </div>
  );
}
