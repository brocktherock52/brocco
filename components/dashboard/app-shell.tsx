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
  Radio,
  Share2,
  Sparkles,
  Square,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Logomark } from '@/components/logo';
import { AGENTS, type AgentName, RECIPES } from '@/lib/agents';
import { runAgent, type SimEvent } from '@/lib/simulator';
import { runClaudeLive, SYSTEM_PROMPTS, type LiveEvent } from '@/lib/claude';
import { recordRun, freeTierExceeded, remainingFreeRuns, getUsage, FREE_LIMIT } from '@/lib/usage';
import { uid } from '@/lib/utils';
import { AgentCard } from './agent-card';
import { StreamPane } from './stream-pane';
import { JsonlLog } from './jsonl-log';
import { ByokModal, getKey } from './byok-modal';
import { Onboarding } from './onboarding';

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
  const [selected, setSelected] = useState<AgentName[]>(['supervisor']);
  const [broadcast, setBroadcast] = useState(false);
  const [goal, setGoal] = useState('');
  const [model, setModel] = useState(MODELS[0].id);
  const [modelOpen, setModelOpen] = useState(false);
  const [byokOpen, setByokOpen] = useState(false);
  const [keyState, setKeyState] = useState<string | null>(null);
  const [panes, setPanes] = useState<PaneState[]>([]);
  const [history, setHistory] = useState<RunHistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [usage, setUsage] = useState(getUsage());
  const [tokens, setTokens] = useState({ in: 0, out: 0 });
  const [demoRunsThisSession, setDemoRunsThisSession] = useState(0);

  // hydrate
  useEffect(() => {
    setKeyState(getKey());
    setUsage(getUsage());
    try {
      const raw = localStorage.getItem('brocco:history');
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
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

  function toggleAgent(name: AgentName) {
    setSelected((s) =>
      s.includes(name) ? s.filter((x) => x !== name) : broadcast ? [...s, name] : [name],
    );
  }

  function loadRecipe(id: string) {
    const r = RECIPES.find((x) => x.id === id);
    if (!r) return;
    setSelected(r.agents);
    setBroadcast(true);
    setGoal(r.goal);
    toast.success(`Loaded recipe: ${r.name}`, { description: 'Hit Run when ready.' });
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

    const runAgents = broadcast ? selected : selected.slice(0, 1);
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
    setTokens({ in: 0, out: 0 });

    await Promise.all(
      next.map((pane, idx) => {
        const a = AGENTS.find((x) => x.name === pane.agent)!;

        const emit = (e: SimEvent | (LiveEvent & { ts?: number; step?: number; agent?: AgentName })) => {
          const norm = ('ts' in e && e.ts ? e : null) as SimEvent | null;
          const ev = norm ?? ({ ...(e as LiveEvent), ts: Date.now(), step: 0, agent: pane.agent } as SimEvent);
          if ((ev as any).type === 'usage') {
            const u = ev as unknown as { in: number; out: number };
            totalIn = u.in;
            totalOut = u.out;
            setTokens({ in: totalIn, out: totalOut });
            return;
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
              emit({ type: 'error', message: err instanceof Error ? err.message : String(err) } as any);
              setPanes((curr) =>
                curr.map((p, i) => (i === idx ? { ...p, status: 'error' } : p)),
              );
            })
            .finally(() => {
              setPanes((curr) =>
                curr.map((p, i) =>
                  i === idx
                    ? {
                        ...p,
                        status: pane.ctrl.signal.aborted ? 'cancelled' : (p.status === 'error' ? 'error' : 'done'),
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
      const dollars = ((totalIn * 3 + totalOut * 15) / 1_000_000).toFixed(4);
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
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setBroadcast((v) => !v);
      }
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
          {(tokens.in > 0 || tokens.out > 0) && (
            <span
              className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-ink-dim"
              title="Tokens this run (live mode only)"
            >
              <span className="text-cyan-glow">{tokens.in.toLocaleString()}</span>
              <span className="text-ink-faint">in</span>
              <span className="text-ink-faint">/</span>
              <span className="text-brand-glow">{tokens.out.toLocaleString()}</span>
              <span className="text-ink-faint">out</span>
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
        {/* SIDEBAR */}
        <aside className="hidden w-[280px] shrink-0 overflow-y-auto border-r border-white/[0.06] bg-bg-1/30 md:block">
          <div className="p-4">
            <p className="px-1 font-mono text-[10.5px] uppercase tracking-wider text-ink-faint">
              Agents
            </p>
            <label className="mt-2 flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
              <span className="inline-flex items-center gap-2 text-[12.5px] font-medium">
                <Radio className="h-3.5 w-3.5 text-brand-glow" />
                Broadcast mode
              </span>
              <button
                onClick={() => setBroadcast((v) => !v)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${broadcast ? 'bg-brand' : 'bg-white/[0.10]'}`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${broadcast ? 'translate-x-[18px]' : 'translate-x-0.5'} translate-y-0.5`}
                />
              </button>
            </label>
            <p className="mt-1.5 px-1 text-[11px] text-ink-faint">
              {broadcast ? 'One prompt fans out to every selected agent in parallel.' : 'Single agent run. Toggle on for parallel.'}
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

            <p className="mt-6 px-1 font-mono text-[10.5px] uppercase tracking-wider text-ink-faint">
              Recipes
            </p>
            <div className="mt-2 space-y-1.5">
              {RECIPES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => loadRecipe(r.id)}
                  className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-left transition hover:border-white/[0.12] hover:bg-white/[0.04]"
                >
                  <div className="text-[13px] font-semibold text-white">{r.name}</div>
                  <div className="mt-0.5 text-[11px] text-ink-faint">{r.description}</div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER */}
        <main className="flex min-w-0 flex-1 flex-col">
          {/* goal input */}
          <div className="border-b border-white/[0.06] bg-bg-0 p-4">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-1 shadow-card">
              <textarea
                id="goal-input"
                placeholder="Type a goal. e.g. 'survey the top 5 competitors to brocco, output a 1-page brief and 5 cold-email angles'"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                rows={3}
                className="block w-full resize-none rounded-xl bg-transparent p-3 text-[14.5px] leading-relaxed text-ink outline-none placeholder:text-ink-faint"
              />
              <div className="flex items-center gap-2 px-2 py-1.5">
                <span className="kbd">⌘</span>
                <span className="kbd">Enter</span>
                <span className="text-[11px] text-ink-faint">to run</span>
                <span className="ml-3 kbd">⌘</span>
                <span className="kbd">B</span>
                <span className="text-[11px] text-ink-faint">broadcast</span>
                <div className="ml-auto flex items-center gap-2">
                  <span className="font-mono text-[11px] text-ink-faint">
                    {selected.length} agent{selected.length !== 1 && 's'} {broadcast && selected.length > 1 ? '(parallel)' : ''}
                  </span>
                  <button
                    onClick={run}
                    disabled={running}
                    className="btn-primary text-[13px] px-4 py-2 disabled:opacity-60"
                  >
                    {running ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Running
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <Play className="h-3 w-3 fill-current" /> Run agents <ArrowRight className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* panes + log */}
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden p-3 lg:grid-cols-[1fr_360px]">
            {/* panes */}
            <div className="min-h-0 overflow-y-auto">
              {panes.length === 0 ? (
                <EmptyState onPick={loadRecipe} />
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
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {panes.some((p) => p.status === 'done') && (
                <SaveActions />
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

function EmptyState({ onPick }: { onPick: (id: string) => void }) {
  return (
    <div className="flex h-full min-h-[480px] items-center justify-center">
      <div className="max-w-md text-center">
        <Logomark className="mx-auto h-14 w-14 opacity-90" />
        <h2 className="mt-5 text-[22px] font-semibold tracking-tight">Spawn an agent.</h2>
        <p className="mt-2 text-[14px] text-ink-dim">
          Pick agents on the left, type a goal, hit Run. Toggle <strong>Broadcast</strong> to fan one prompt out to N agents in parallel.
        </p>
        <p className="mt-4 inline-flex items-center gap-2 text-[12px] text-ink-faint">
          <span className="kbd">⌘</span>
          <span className="kbd">Enter</span>
          send
          <span className="kbd ml-3">⌘</span>
          <span className="kbd">K</span>
          focus prompt
          <span className="kbd ml-3">⌘</span>
          <span className="kbd">B</span>
          broadcast
        </p>

        <p className="mt-8 px-1 text-left font-mono text-[10.5px] uppercase tracking-wider text-ink-faint">
          One-click recipes
        </p>
        <div className="mt-2 grid gap-2 text-left sm:grid-cols-2">
          {RECIPES.map((r) => (
            <button
              key={r.id}
              onClick={() => onPick(r.id)}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <div className="text-[13px] font-semibold text-white">{r.name}</div>
              <div className="mt-0.5 text-[11.5px] text-ink-faint">{r.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SaveActions() {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <span className="font-mono text-[11px] text-ink-faint">SAVE OUTPUT TO</span>
      {['Notion', 'Slack', 'Email', 'Google Drive', 'Webhook'].map((dest) => (
        <button
          key={dest}
          onClick={() => toast.success(`Saved to ${dest}`, { description: 'Connect this destination on your paid plan.' })}
          className="rounded-full border border-white/[0.10] bg-white/[0.04] px-2.5 py-1 text-[11.5px] font-medium text-ink-dim hover:bg-white/[0.07] hover:text-white"
        >
          {dest}
        </button>
      ))}
    </div>
  );
}
