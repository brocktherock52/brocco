'use client';

import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  Cpu,
  FileText,
  History,
  Image as ImageIcon,
  KeyRound,
  Loader2,
  Paperclip,
  Play,
  Share2,
  Sparkles,
  Square,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Logomark } from '@/components/logo';
import { AGENTS, type AgentName } from '@/lib/agents';
import { runAgent, type SimEvent } from '@/lib/simulator';
import { SYSTEM_PROMPTS, type ClaudeAttachment, type LiveEvent } from '@/lib/claude';
import { runAgentLive } from '@/lib/run-live';
import { recordRun, getUsage } from '@/lib/usage';
import { uid } from '@/lib/utils';
import { fetchBillingAccess, type BillingAccess } from '@/lib/billing-client';
import { AgentCard } from './agent-card';
import { AgentOffice } from './agent-office';
import { JsonlLog } from './jsonl-log';
import { ByokModal, getKey } from './byok-modal';
// Duplicate `Onboarding` modal deleted 2026-05-22, collided with `GuidedOnboarding`.
import { MorningBriefing } from './morning-briefing';
import { EveningWindDown } from './evening-windown';
import { SuggestionSlot } from './suggestion-slot';
import { recordStreakTouch } from '@/lib/streak';
import { getCustomAgents, deleteCustomAgent, type CustomAgent } from '@/lib/custom-agents';
import { CustomCroc } from '@/components/custom-croc';
import { RecurringToggle } from './recurring-toggle';
import { ConstructionCrew } from './construction-crew';
import { GuidedOnboarding } from './guided-onboarding';
import { UpsellModal } from './upsell-modal';
import { listThreads, createThread, appendBrain, type ClientThread } from '@/lib/threads-client';
import { useSession, signOut } from '@/lib/auth-client';
import { exportRunToPdf, type PdfPane } from '@/lib/pdf-export';
import { getProfile, PROFILE_CHANGED_EVENT, type BroccoProfile } from '@/lib/profile';
import { needsRefresh } from '@/lib/freshness';
import { AlertsBell } from './alerts-bell';
import { ProjectCard, type ProjectCardEntry } from './project-card';
import { seedDemoProjectIfNeeded } from '@/lib/demo-projects';
import { trackEvent, identifyUser, resetUser } from '@/components/posthog-provider';
import { isFounderEmail } from '@/lib/constants';
import { resolvePreset } from '@/lib/app-presets';

const MODELS = [
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', tag: 'default' },
  { id: 'claude-opus-4-7', label: 'Claude Opus 4.7', tag: '1M ctx' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5', tag: 'fast' },
  { id: 'gpt-4o', label: 'GPT-4o', tag: 'OpenAI' },
  { id: 'grok-4.20-0309-non-reasoning', label: 'Grok 4.2 fast', tag: 'xAI · cheap' },
  { id: 'llama-3-local', label: 'Llama 3 (local)', tag: 'Ollama' },
];

const MAX_ATTACHMENTS = 6;
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
const MAX_TEXT_ATTACHMENT_CHARS = 40_000;

type DashboardAttachment = ClaudeAttachment & {
  previewUrl?: string;
};

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

// Ambient backdrop for the whole app surface. Layered auroras + a masked grid
// + a soft floor glow give the dashboard depth instead of a flat dark page.
// Static by design (the calm-motion brand rule), GPU-isolated so it never
// repaints on scroll.
function AppAmbient() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          transform: 'translateZ(0)',
          contain: 'paint',
          backgroundImage: [
            'radial-gradient(1100px 560px at 18% -160px, rgba(124,58,237,0.18), transparent 60%)',
            'radial-gradient(900px 500px at 88% -120px, rgba(34,211,238,0.10), transparent 60%)',
            'radial-gradient(1200px 760px at 50% 120%, rgba(124,58,237,0.08), transparent 70%)',
          ].join(', '),
        }}
      />
      {/* faint structural grid, masked to fade out toward the edges */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(80% 70% at 50% 0%, #000 0%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(80% 70% at 50% 0%, #000 0%, transparent 80%)',
        }}
      />
      {/* edge vignette to seat the content */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 120% at 50% 40%, transparent 55%, rgba(0,0,0,0.45) 100%)',
        }}
      />
    </div>
  );
}

export function AppShell() {
  // v3.0: broadcast is the product. Default to 3 specialists selected.
  const [selected, setSelected] = useState<AgentName[]>([
    'researcher',
    'planner',
    'outreach',
  ]);
  const [broadcast, setBroadcast] = useState(true);
  // Pre-fill so a first-time user can hit Cmd+Enter and see something happen
  // with zero keystrokes. They are free to clear / overwrite. Punchlist 2026-05-22.
  const [goal, setGoal] = useState(
    'Run a launch sprint: research, draft tweets, write a landing hero, plan day-1 outreach.',
  );
  const [model, setModel] = useState(MODELS[0].id);
  const [modelOpen, setModelOpen] = useState(false);
  // Category workspace, set from a deep-link preset (?for=, ?recipe=, ?goal=).
  // Drives the tailored empty-state examples + the "workspace" chip so RE users
  // landing from /real-estate get an experience built for them, not the generic
  // launch-sprint default.
  const [workspace, setWorkspace] = useState<{ label: string; examples: string[] } | null>(null);
  const [byokOpen, setByokOpen] = useState(false);
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [billingAccess, setBillingAccess] = useState<BillingAccess | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const checkingAccessRef = useRef(false);

  useEffect(() => { void fetchBillingAccess().then(setBillingAccess).catch(() => {}); }, []);

  async function requireTools(source: string): Promise<BillingAccess | null> {
    if (checkingAccessRef.current) return null;
    checkingAccessRef.current = true;
    setCheckingAccess(true);
    try {
      const access = await fetchBillingAccess();
      setBillingAccess(access);
      if (!access.canUseTools) {
        setUpsellSource(source);
        setUpsellOpen(true);
        return null;
      }
      return access;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not check subscription access.');
      return null;
    } finally { checkingAccessRef.current = false; setCheckingAccess(false); }
  }
  // Where the upsell was triggered from, for the PostHog upsell funnel.
  const [upsellSource, setUpsellSource] = useState('run_limit');
  const [keyState, setKeyState] = useState<string | null>(null);
  const [panes, setPanes] = useState<PaneState[]>([]);
  const [history, setHistory] = useState<RunHistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  // Mobile bottom-sheet for picking agents. The desktop sidebar remains the
  // canonical surface above md. See marketing/audit/app-audit-2026-05-22.md
  // Finding 5a.
  const [showTeamSheet, setShowTeamSheet] = useState(false);
  const [serverThreads, setServerThreads] = useState<ClientThread[]>([]);
  const [serverOffline, setServerOffline] = useState(true);
  // Bumped after a refresh files a changes_found alert so the bell re-fetches.
  const [alertsSignal, setAlertsSignal] = useState(0);
  const session = useSession();
  const [usage, setUsage] = useState(getUsage());
  const [tokens, setTokens] = useState({ in: 0, out: 0, cost: 0 });
  const [demoRunsThisSession, setDemoRunsThisSession] = useState(0);
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([]);
  const [attachments, setAttachments] = useState<DashboardAttachment[]>([]);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Deep-link preset: open /app pre-configured for a category/recipe. Read from
  // window.location.search (not useSearchParams, so the page stays static and
  // needs no Suspense boundary). Runs once on mount.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const preset = resolvePreset(params);
    if (!preset) return;
    if (preset.goal) setGoal(preset.goal);
    if (preset.agents.length) setSelected(preset.agents);
    setWorkspace({ label: preset.label, examples: preset.examples });
    trackEvent('workspace_preset_opened', {
      label: preset.label,
      for: params.get('for'),
      recipe: params.get('recipe'),
      agent_count: preset.agents.length,
    });
  }, []);

  // hydrate
  useEffect(() => {
    setKeyState(getKey());
    setUsage(getUsage());
    // Tick the daily-streak counter, opening /app counts as the day's touch.
    recordStreakTouch();
    // Hydrate custom agents from localStorage + re-read on change.
    setCustomAgents(getCustomAgents());
    const onCustomChange = () => setCustomAgents(getCustomAgents());
    window.addEventListener('brocco:custom-agents-changed', onCustomChange);
    // cleanup attached via the same useEffect's main return below
    // Seed the no-login demo project (stale, with a pending alert + starter
    // brain) so the full watch -> refresh -> what's-new -> brain flow is
    // demoable without auth or a paid plan. Idempotent.
    seedDemoProjectIfNeeded();
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

  // Identify the user to PostHog once the session resolves so the journey map
  // (Braden's ask: see where users drop after signup) follows one person across
  // signup -> onboarding -> first run -> upgrade. No-op without a key/consent.
  useEffect(() => {
    const u = session?.data?.user;
    if (u?.id) {
      identifyUser(u.id, {
        email: u.email,
        plan: (u as { plan?: string }).plan ?? 'free',
      });
    }
  }, [session?.data?.user]);

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

  // Project freshness ("watching out for you"). Count unique saved projects
  // whose findings have aged past the fresh window so we can badge the bell.
  const staleProjects = useMemo(() => {
    const seen = new Set<string>();
    return history.filter((h) => {
      if (seen.has(h.goal)) return false;
      seen.add(h.goal);
      return needsRefresh(h.ts);
    });
  }, [history]);

  // Display capabilities from the server; browser storage and BYOK never grant access.
  type Tier = 'free' | 'solo' | 'team';
  const tier: Tier = billingAccess?.canUseTools
    ? billingAccess.plan === 'team' ? 'team' : 'solo'
    : 'free';
  const paneCap = tier === 'team' ? Infinity : tier === 'solo' ? 8 : 3;
  const activePaneCount = panes.filter((p) => p.status === 'running' || p.status === 'pending').length;

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

  async function handleAttachmentPick(e: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (picked.length === 0) return;

    const slots = Math.max(0, MAX_ATTACHMENTS - attachments.length);
    if (slots === 0) {
      toast.error('Attachment limit reached', {
        description: `Remove a file first. Brocco accepts up to ${MAX_ATTACHMENTS} files per run.`,
      });
      return;
    }

    const accepted = picked.slice(0, slots);
    if (picked.length > accepted.length) {
      toast.message(`Added ${accepted.length} of ${picked.length} files`, {
        description: `Brocco accepts up to ${MAX_ATTACHMENTS} attachments per run.`,
      });
    }

    setUploadingAttachments(true);
    const next: DashboardAttachment[] = [];
    for (const file of accepted) {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        toast.error(`${file.name} is too large`, {
          description: `Max file size is ${formatBytes(MAX_ATTACHMENT_BYTES)}.`,
        });
        continue;
      }

      const mediaType = normalizeMediaType(file);
      const kind = attachmentKind(file, mediaType);
      if (!kind) {
        toast.error(`${file.name} is not supported`, {
          description: 'Use images, PDFs, or text files like .txt, .md, .csv, .json, and code.',
        });
        continue;
      }

      try {
        if (kind === 'text') {
          const raw = await file.text();
          const truncated = raw.length > MAX_TEXT_ATTACHMENT_CHARS;
          next.push({
            id: uid('att'),
            name: file.name,
            mediaType,
            size: file.size,
            kind,
            text: truncated
              ? `${raw.slice(0, MAX_TEXT_ATTACHMENT_CHARS)}\n\n[truncated at ${MAX_TEXT_ATTACHMENT_CHARS.toLocaleString()} characters]`
              : raw,
          });
          continue;
        }

        const data = await readFileAsBase64(file);
        next.push({
          id: uid('att'),
          name: file.name,
          mediaType,
          size: file.size,
          kind,
          data,
          previewUrl: kind === 'image' ? `data:${mediaType};base64,${data}` : undefined,
        });
      } catch (err) {
        toast.error(`Could not read ${file.name}`, {
          description: err instanceof Error ? err.message : String(err),
        });
      }
    }
    if (next.length) {
      setAttachments((curr) => [...curr, ...next]);
      toast.success(`Attached ${next.length} file${next.length === 1 ? '' : 's'}.`);
    }
    setUploadingAttachments(false);
  }

  function removeAttachment(id: string) {
    setAttachments((curr) => curr.filter((file) => file.id !== id));
  }

  async function run() {
    if (!goal.trim() && attachments.length === 0) {
      toast.error('Type a goal or attach a file first.');
      return;
    }
    if (selected.length === 0) {
      toast.error('Pick at least one agent on the left.');
      return;
    }

    const access = await requireTools('run');
    if (!access) return;
    if (!keyState && access.hostedAvailable === false) {
      setByokOpen(true);
      toast.message('Connect your own API key to run tools.', { description: 'Your AI provider bills usage separately.' });
      return;
    }
    const live = true;
    const runTier = access.plan === 'team' ? 'team' : 'solo';
    const runCap = runTier === 'team' ? Infinity : 8;

    // v3.0: broadcast is always on; runAgents is just selected.
    // Enforce the tier's parallel-pane cap. If the user is already at the cap
    // we still allow the queue but trim the batch to what fits.
    const runAgents = selected;
    const headroom = Math.max(0, runCap - activePaneCount);
    if (headroom === 0 && runTier !== 'team') {
      toast.error('Parallel run limit reached', {
        description: tier === 'free'
          ? 'Free tier runs 3 panes at a time. Stop a run or upgrade for 8+ in parallel.'
          : 'Solo tier runs 8 panes at a time. Wait for one to finish or upgrade to Team for unlimited.',
        action: { label: 'Upgrade', onClick: () => (window.location.href = '/pricing') },
      });
      return;
    }
    const allowedAgents = runTier === 'team' ? runAgents : runAgents.slice(0, headroom);
    if (allowedAgents.length < runAgents.length) {
      toast.message(`Running ${allowedAgents.length} of ${runAgents.length} agents`, {
        description: `${tier} tier caps parallel panes at ${paneCap}. Upgrade to unlock the rest.`,
      });
    }
    const next: PaneState[] = allowedAgents.map((name) => ({
      id: uid('p'),
      agent: name,
      events: [],
      status: 'running',
      ctrl: new AbortController(),
      mode: live ? 'live' : 'demo',
    }));
    // Append instead of clobber so a second batch fired while the first one
    // is still streaming does not wipe in-flight panes. Filter by id keeps the
    // function idempotent if React re-invokes setState during strict-mode dev.
    setPanes((curr) => [...curr.filter((p) => !next.find((n) => n.id === p.id)), ...next]);

    const goalSnapshot = goal.trim() || 'Analyze the attached files.';
    const promptForRun = withAttachmentContext(goalSnapshot, attachments);
    setHistory((h) =>
      [{ id: uid('r'), goal: goalSnapshot, agents: runAgents, ts: Date.now() }, ...h].slice(0, 25),
    );
    // Persist as a thread on the server (no-op for anonymous users beyond
    // the localStorage write-through cache inside threads-client). Capture the
    // created id so the run can seed the project "brain" (iteration 1) once it
    // finishes, kicking off the self-improving loop.
    const createdThread = createThread({ title: goalSnapshot.slice(0, 200), agents: runAgents as string[] })
      .then((t) => {
        if (t) setServerThreads((curr) => [t, ...curr.filter((x) => x.id !== t.id)].slice(0, 50));
        return t;
      })
      .catch(() => null);

    // first_run: the single most important activation event in the funnel.
    // Fires once per browser (persisted) so the journey map can measure
    // signup -> first_run drop-off. Guarded so re-runs do not re-fire it.
    try {
      if (typeof window !== 'undefined' && !localStorage.getItem('brocco:first-run-fired')) {
        localStorage.setItem('brocco:first-run-fired', '1');
        trackEvent('first_run', { mode: live ? 'live' : 'demo', agent_count: allowedAgents.length, tier });
      }
    } catch {}

    trackEvent('run_started', {
      mode: live ? 'live' : 'demo',
      agent_count: allowedAgents.length,
      agents: allowedAgents,
      attachment_count: attachments.length,
      model,
      tier,
    });

    if (live) {
      toast.message('Live mode', {
        description: `Calling Claude directly from your browser with your key${attachments.length ? ` and ${attachments.length} attachment${attachments.length === 1 ? '' : 's'}` : ''}.`,
      });
    } else {
      toast.message('Demo mode', {
        description: attachments.length
          ? 'Simulated run with attachment context. Add an Anthropic key for live file/image analysis.'
          : 'Simulated run. Add an Anthropic key for live agents on your tokens.',
      });
    }

    // Each live pane emits *cumulative* usage events (running totals for that
    // pane). Track the latest usage per paneId and SUM across panes so the cost
    // chip reflects the whole parallel run, not just whichever pane emitted last.
    const usageByPane = new Map<string, { in: number; out: number; cost: number }>();
    let totalIn = 0;
    let totalOut = 0;
    let totalCost = 0;
    setTokens({ in: 0, out: 0, cost: 0 });

    await Promise.all(
      next.map((pane) => {
        const a = AGENTS.find((x) => x.name === pane.agent)!;
        const paneId = pane.id;

        const emit = (e: SimEvent | (LiveEvent & { ts?: number; step?: number; agent?: AgentName })) => {
          const norm = ('ts' in e && e.ts ? e : null) as SimEvent | null;
          const ev = norm ?? ({ ...(e as LiveEvent), ts: Date.now(), step: 0, agent: pane.agent } as SimEvent);
          if ((ev as any).type === 'usage') {
            const u = ev as unknown as { in: number; out: number; cost_usd?: number };
            // Store this pane's latest cumulative usage, then re-sum every pane.
            usageByPane.set(paneId, {
              in: u.in,
              out: u.out,
              cost: typeof u.cost_usd === 'number' ? u.cost_usd : 0,
            });
            totalIn = 0;
            totalOut = 0;
            totalCost = 0;
            for (const pu of usageByPane.values()) {
              totalIn += pu.in;
              totalOut += pu.out;
              totalCost += pu.cost;
            }
            setTokens({ in: totalIn, out: totalOut, cost: totalCost });
            // fall through so the event is also pushed onto the pane log
          }
          // Match panes by id, not array index. Appending batches reshuffles
          // index positions so the old `i === idx` check no longer holds.
          setPanes((curr) =>
            curr.map((p) => (p.id === paneId ? { ...p, events: [...p.events, ev as SimEvent] } : p)),
          );
        };

        if (live) {
          const sys = SYSTEM_PROMPTS[a.name] || SYSTEM_PROMPTS.researcher;
          return runAgentLive({
            apiKey: keyState || '',
            modelId: model,
            agent: a,
            goal: goalSnapshot,
            attachments,
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
                curr.map((p) =>
                  p.id === paneId
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
          promptForRun,
          (e) => {
            setPanes((curr) =>
              curr.map((p) => (p.id === paneId ? { ...p, events: [...p.events, e] } : p)),
            );
          },
          { cancelled: pane.ctrl.signal.aborted },
        ).then(() => {
          setPanes((curr) =>
            curr.map((p) =>
              p.id === paneId ? { ...p, status: pane.ctrl.signal.aborted ? 'cancelled' : 'done' } : p,
            ),
          );
        });
      }),
    );

    const u = recordRun({ in: totalIn, out: totalOut });
    setUsage(u);
    trackEvent('run_completed', {
      mode: live ? 'live' : 'demo',
      agent_count: next.length,
      tokens_in: totalIn,
      tokens_out: totalOut,
      cost_usd: totalCost,
    });

    // Seed the project "brain" with this run so the self-improving loop starts
    // from iteration 1. Subsequent refreshes (lib/refresh.ts) read this back in
    // and append what changed. BYOK-safe: brain lives in the DB (or localStorage
    // in demo) and is never the server's job to compute.
    void createdThread.then((t) => {
      const tid = t?.id ?? null;
      if (!tid) return; // anonymous / offline: refresh path keeps a local brain
      appendBrain(tid, {
        did: `First run of ${runAgents.join(', ')} on "${goalSnapshot.slice(0, 100)}".`,
        learned: 'Baseline captured.',
        changed: 'Initial baseline. Future refreshes show what changed.',
      }).catch(() => {});
    });
    if (live) {
      const dollars = (totalCost > 0 ? totalCost : (totalIn * 3 + totalOut * 15) / 1_000_000).toFixed(4);
      toast.success('All agents finished.', {
        description: `Tokens: ${totalIn} in / ${totalOut} out. Est. cost: $${dollars}.`,
      });
    } else {
      const next = demoRunsThisSession + 1;
      setDemoRunsThisSession(next);
      toast.success('All agents finished.', {
        description: 'Simulation finished. Connect your API key for live output.',
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
    const access = await requireTools('retry');
    if (!access) return;
    if (!keyState && access.hostedAvailable === false) { setByokOpen(true); return; }
    const pane = panes.find((p) => p.id === paneId);
    if (!pane) return;
    const a = AGENTS.find((x) => x.name === pane.agent);
    if (!a) return;
    const live = true;
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
        await runAgentLive({
          apiKey: keyState || '',
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
    <div className="relative flex h-screen flex-col bg-bg-0 text-ink">
      <AppAmbient />
      {billingAccess && !billingAccess.canUseTools && <div className="relative z-30 flex flex-wrap items-center justify-between gap-2 border-b border-border bg-bg-2 px-4 py-2 text-sm"><span>Dashboard trial. Running tools starts your paid subscription.</span><button onClick={() => { setUpsellSource('trial_banner'); setUpsellOpen(true); }} className="text-cyan-glow underline">Unlock tools</button><Link href="/account" className="text-ink-dim underline">Manage trial</Link></div>}
      {/* TOP BAR */}
      {/* relative z-30: the header's backdrop-blur makes it its own stacking
          context, so its absolutely-positioned dropdowns (model picker) were
          being painted OVER by the main app body below (a later sibling in the
          same parent context). Lifting the whole header above the body fixes
          that. Fixed overlays (sheets/panels/modals at z-40+) still sit on top. */}
      <header className="relative z-30 flex h-14 shrink-0 items-center gap-3 border-b border-white/[0.06] bg-bg-1/70 px-4 backdrop-blur-xl">
        <Link href="/" className="inline-flex items-center gap-2 text-[14px] font-semibold tracking-tight">
          <Logomark className="h-6 w-6" />
          brocco<span className="text-ink-faint">.app</span>
        </Link>

        <WorkspaceBadge />

        <ModeBadge live={!!billingAccess?.canUseTools && (!!keyState || billingAccess.hostedAvailable !== false)} />

        <span className="hidden h-5 w-px bg-white/[0.10] md:block" />

        {/* model picker */}
        <div className="relative">
          <button
            onClick={() => setModelOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1.5 font-mono text-[12px] text-ink-dim hover:bg-white/[0.07] hover:text-white"
          >
            <Cpu className="h-3 w-3 text-brand-glow" />
            {keyState ? MODELS.find((m) => m.id === model)?.label : billingAccess?.hostedAvailable === false ? 'Connect your API key' : 'Brocco hosted AI'}
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
              {billingAccess?.hostedAvailable ? 'optional API key' : 'connect API key'}
            </span>
          )}
        </button>

        {/* Mobile-only "team" chip. Opens the agent-picker bottom sheet.
            Hidden on md+ where the left sidebar is already visible. */}
        <button
          type="button"
          onClick={() => setShowTeamSheet(true)}
          className="md:hidden inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1.5 font-mono text-[12px] text-ink-dim hover:bg-white/[0.07] hover:text-white"
          aria-label="open team picker"
        >
          <Users className="h-3 w-3 text-brand-glow" />
          team · {selected.length}
        </button>

        <div className="ml-auto flex items-center gap-2">
          {/* Founder-only metrics link. Gated by email; the page + API enforce
              the real server-side check, this just surfaces the entry point. */}
          {isFounderEmail(session?.data?.user?.email) && (
            <Link
              href="/app/founder"
              className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/[0.08] px-2.5 py-1 font-mono text-[11px] text-brand-glow hover:bg-brand/[0.14]"
              title="Founder metrics (MRR + users)"
            >
              <Sparkles className="h-3 w-3" />
              founder
            </Link>
          )}
          {/* Session pill, signed-in email + sign out, or a sign-in link. */}
          {session?.data?.user ? (
            <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-ink-dim">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <Link href="/account" className="hover:text-white" title="account settings">
                {session.data.user.email}
              </Link>
              <button
                type="button"
                onClick={() => signOut({ fetchOptions: { onSuccess: () => { resetUser(); window.location.href = '/login'; } } })}
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
            aria-label="share this run"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
          <AlertsBell
            refreshSignal={alertsSignal}
            onOpenProject={(threadId) => {
              setShowHistory(true);
              const t = serverThreads.find((x) => x.id === threadId);
              if (t) setGoal(t.title);
            }}
          />
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="relative rounded-full border border-white/[0.10] bg-white/[0.04] p-2 text-ink-dim hover:bg-white/[0.07] hover:text-white"
            aria-label="projects and history"
            title={
              staleProjects.length
                ? `${staleProjects.length} project${staleProjects.length === 1 ? '' : 's'} may have new info`
                : 'Projects & history'
            }
          >
            <History className="h-3.5 w-3.5" />
            {staleProjects.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-bold text-black">
                {staleProjects.length}
              </span>
            )}
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

      {/* MAIN, v3.1 office layout. The cramped left sidebar + smushed panes are
          gone. Hiring/release happens on the office floor itself; the JSONL
          audit lives in a roomy right rail. */}
      <div className="relative z-10 flex min-h-0 flex-1">
        {/* CENTER */}
        <main className="flex min-w-0 flex-1 flex-col">
          {/* Chat-first goal input, prominent, centered, ChatGPT-style.
              Bigger pill, glowing border, larger placeholder, primary CTA. */}
          <div className="relative border-b border-white/[0.06] bg-bg-0/30 px-4 py-7 backdrop-blur-sm">
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
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,text/*,.csv,.json,.md,.markdown,.txt,.ts,.tsx,.js,.jsx,.py,.html,.css"
                    className="hidden"
                    onChange={handleAttachmentPick}
                  />
                  <textarea
                    id="goal-input"
                    placeholder="what should your AI team work on today? attach files or images if they need context."
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    rows={3}
                    className="block w-full resize-none rounded-2xl bg-transparent px-5 py-4 text-[16px] leading-relaxed text-ink outline-none placeholder:text-ink-faint"
                  />
                  {attachments.length > 0 && (
                    <div className="grid gap-2 px-3 pb-3 sm:grid-cols-2">
                      {attachments.map((file) => (
                        <div
                          key={file.id}
                          className="group flex min-w-0 items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-2"
                        >
                          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.08] bg-black/35 text-cyan">
                            {file.previewUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={file.previewUrl} alt="" className="h-full w-full object-cover" />
                            ) : file.kind === 'document' ? (
                              <FileText className="h-4 w-4" />
                            ) : (
                              <ImageIcon className="h-4 w-4" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[12.5px] font-medium text-ink">{file.name}</span>
                            <span className="block truncate font-mono text-[10.5px] text-ink-faint">
                              {file.kind} · {formatBytes(file.size)}
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(file.id)}
                            title={`Remove ${file.name}`}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-white/[0.08] hover:text-ink"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-3 pb-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAttachments || attachments.length >= MAX_ATTACHMENTS}
                      title="Attach files or images"
                      className="inline-flex h-9 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 text-[12px] font-medium text-ink-dim transition-colors hover:border-white/[0.16] hover:bg-white/[0.06] hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {uploadingAttachments ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Paperclip className="h-3.5 w-3.5" />
                      )}
                      attach
                    </button>
                    <span className="hidden text-[11.5px] text-ink-faint md:inline">
                      images, PDFs, text · max {MAX_ATTACHMENTS}
                    </span>
                    <span className="kbd">⌘</span>
                    <span className="kbd">Enter</span>
                    <span className="text-[11.5px] text-ink-faint">to run</span>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="font-mono text-[11px] text-ink-faint">
                        {selected.length} agent{selected.length !== 1 && 's'} · parallel
                      </span>
                      <button
                        onClick={run}
                        disabled={checkingAccess}
                        title={
                          !billingAccess?.canUseTools
                            ? 'check your subscription to unlock tools'
                            : running
                              ? 'fire another batch in parallel'
                              : 'broadcast to selected agents'
                        }
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-cyan px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-glow2 transition-all hover:shadow-glow disabled:opacity-60"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Play className="h-3.5 w-3.5 fill-current" />
                          {checkingAccess ? 'checking access...' : running ? 'run another' : 'broadcast'}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-center font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
                  {`${workspace?.label ? `${workspace.label.toLowerCase()} workspace` : 'your AI team'} · ${selected.length}/9 specialists · ${billingAccess?.canUseTools ? keyState ? 'your API key' : billingAccess.hostedAvailable === false ? 'connect your API key' : 'hosted AI' : 'dashboard preview'}`}
                </p>
              </div>
            </div>
          </div>

          {billingAccess?.canUseTools && !keyState && <div className="border-b border-border bg-bg-1 px-4 py-2 text-sm text-ink-dim">{billingAccess.hostedAvailable === false ? 'Connect your own Anthropic or xAI API key for live tools. Your provider bills usage separately.' : 'Hosted AI is ready. Attachments require your own API key.'}</div>}

          {/* Proactive nudge slot, appears above panes when there's an
              active suggestion, invisible otherwise. */}
          <SuggestionSlot
            onAccept={(g, ags) => {
              if (g) setGoal(g);
              if (ags && ags.length) setSelected(ags);
            }}
          />

          {/* office + log */}
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden p-4 sm:p-6 lg:grid-cols-[1fr_340px]">
            {/* office floor */}
            <div className="relative min-h-0 overflow-y-auto">
              {/* Construction crew, walks across the floor while runs are
                  active. Adds visual life to the work-in-progress. */}
              <ConstructionCrew active={running} />

              {/* The office is always present (desks for the team, plus
                  available-to-hire desks). The daily ritual / try-these
                  empty state shows above it only before the first run. */}
              {panes.length === 0 && (
                <div className="mb-8">
                  <EmptyState onPick={(g) => setGoal(g)} workspace={workspace} />
                </div>
              )}

              <AgentOffice
                selected={selected}
                panes={panes}
                onToggle={toggleAgent}
                onRetry={(id) => retryPane(id)}
                onClosePane={(id) => setPanes((curr) => curr.filter((x) => x.id !== id))}
              />

              {/* Custom agents + create-your-own, relocated from the old
                  sidebar into a calm strip below the office floor. */}
              <div className="mt-10 border-t border-white/[0.06] pt-6">
                {customAgents.length > 0 && (
                  <div className="mb-5">
                    <p className="eyebrow mb-3">your custom agents · {customAgents.length}</p>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                      {customAgents.map((ca) => (
                        <div
                          key={ca.id}
                          className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:border-white/[0.14] hover:bg-white/[0.04]"
                        >
                          <span
                            className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-black"
                            style={{ boxShadow: `inset 0 0 0 1px ${ca.accent}33` }}
                          >
                            <CustomCroc
                              accent={ca.accent}
                              accessory={ca.accessory ?? 'none'}
                              className="absolute inset-0 h-full w-full"
                            />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium text-ink">{ca.label}</p>
                            <p className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                              {ca.template}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => useCustomAgent(ca)}
                            className="rounded-md border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-[11px] text-ink-dim transition hover:border-white/[0.18] hover:text-white"
                          >
                            hire
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
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Link
                  href="/app/agents/new"
                  className="group flex max-w-md items-center justify-between gap-2 rounded-xl border border-dashed border-white/[0.10] bg-white/[0.02] px-4 py-3 text-[13px] text-ink-dim transition-colors hover:border-white/[0.22] hover:bg-white/[0.04] hover:text-white"
                >
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-brand-glow" />
                    create your own agent
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              {panes.some((p) => p.status === 'done') && (
                <>
                  <SaveActions goal={goal} panes={panes} allEvents={allEvents} />
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

        {/* MOBILE TEAM BOTTOM SHEET. Mirrors the desktop sidebar agent list.
            Backdrop tap or close button dismisses. md+ users still get the
            persistent left sidebar above. */}
        <AnimatePresence>
          {showTeamSheet && (
            <>
              <motion.div
                key="team-sheet-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowTeamSheet(false)}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                aria-hidden
              />
              <motion.aside
                key="team-sheet"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                className="fixed inset-x-0 bottom-0 z-50 max-h-[82vh] overflow-hidden rounded-t-2xl border-t border-white/[0.10] bg-bg-1/98 backdrop-blur-xl md:hidden"
                role="dialog"
                aria-modal="true"
                aria-label="agent picker"
              >
                <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-white/[0.16]" aria-hidden />
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">
                      specialists · {selected.length} selected
                    </p>
                    <p className="mt-1 text-[11.5px] leading-snug text-ink-dim">
                      broadcast is always on. one prompt fans out in parallel.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTeamSheet(false)}
                    className="rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1 text-[11.5px] text-ink-dim hover:bg-white/[0.07] hover:text-white"
                  >
                    done
                  </button>
                </div>
                <div className="max-h-[68vh] overflow-y-auto px-4 pb-6">
                  <div className="space-y-2">
                    {AGENTS.map((a) => (
                      <AgentCard
                        key={a.name}
                        agent={a}
                        selected={selected.includes(a.name)}
                        onToggle={() => toggleAgent(a.name)}
                      />
                    ))}
                  </div>

                  {customAgents.length > 0 && (
                    <div className="mt-5">
                      <p className="px-1 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">
                        your agents · {customAgents.length}
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {customAgents.map((ca) => (
                          <li
                            key={ca.id}
                            className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2"
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
                              className="rounded-md border border-white/[0.08] bg-white/[0.02] px-2 py-1 text-[10.5px] text-ink-dim hover:border-white/[0.18] hover:text-white"
                            >
                              use
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Link
                    href="/app/agents/new"
                    onClick={() => setShowTeamSheet(false)}
                    className="mt-4 flex items-center justify-between gap-2 rounded-lg border border-dashed border-white/[0.10] bg-white/[0.02] px-3 py-2.5 text-[12.5px] text-ink-dim hover:border-white/[0.22] hover:bg-white/[0.04] hover:text-white"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-brand-glow" />
                      create your own agent
                    </span>
                    <ArrowRight className="h-3 w-3 opacity-60" />
                  </Link>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

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
                <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                  Projects
                </span>
                <button onClick={() => setShowHistory(false)} className="text-ink-faint hover:text-white">
                  ×
                </button>
              </div>
              {staleProjects.length > 0 && (
                <div className="border-b border-white/[0.06] bg-amber-400/[0.06] px-4 py-2.5">
                  <p className="text-[11.5px] leading-snug text-amber-200/90">
                    <span className="font-semibold">{staleProjects.length}</span> project
                    {staleProjects.length === 1 ? '' : 's'} may have new information since you last
                    ran {staleProjects.length === 1 ? 'it' : 'them'}. Refresh to pull the latest.
                  </p>
                </div>
              )}
              <div className="overflow-y-auto p-3">
                {history.length === 0 ? (
                  <p className="px-1 text-[12.5px] text-ink-faint">
                    No projects yet. Type a goal and hit run, and brocco then watches it for you.
                  </p>
                ) : (
                  history.map((h) => {
                    const st = serverThreads.find((t) => t.id === h.id);
                    const cardEntry: ProjectCardEntry = {
                      id: h.id,
                      goal: h.goal,
                      agents: h.agents,
                      ts: h.ts,
                      threadId: st ? st.id : h.id.startsWith('local-') || h.id.startsWith('r-') ? null : h.id,
                      watchEnabled: st?.watchEnabled,
                      refreshCadenceHours: st?.refreshCadenceHours,
                    };
                    return (
                      <ProjectCard
                        key={h.id}
                        entry={cardEntry}
                        tier={tier}
                        apiKey={keyState}
                        modelId={model}
                        onPickGoal={setGoal}
                        onUpgrade={() => {
                          setUpsellSource('watch_settings');
                          setUpsellOpen(true);
                        }}
                        onRefreshed={() => setAlertsSignal((n) => n + 1)}
                      />
                    );
                  })
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <ByokModal open={byokOpen} onOpenChange={setByokOpen} initial={keyState} onSaved={setKeyState} />
      <UpsellModal
        open={upsellOpen}
        source={upsellSource}
        onClose={() => setUpsellOpen(false)}
        onActivated={setBillingAccess}
      />
      <GuidedOnboarding />
    </div>
  );
}

function normalizeMediaType(file: File): string {
  if (file.type) return file.type;
  const name = file.name.toLowerCase();
  if (name.endsWith('.md') || name.endsWith('.markdown')) return 'text/markdown';
  if (name.endsWith('.json')) return 'application/json';
  if (name.endsWith('.csv')) return 'text/csv';
  if (name.endsWith('.pdf')) return 'application/pdf';
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.webp')) return 'image/webp';
  if (name.endsWith('.gif')) return 'image/gif';
  return 'text/plain';
}

function attachmentKind(file: File, mediaType: string): DashboardAttachment['kind'] | null {
  const lower = file.name.toLowerCase();
  if (/^image\/(png|jpeg|webp|gif)$/.test(mediaType)) return 'image';
  if (mediaType === 'application/pdf') return 'document';
  if (
    mediaType.startsWith('text/') ||
    mediaType === 'application/json' ||
    /\.(md|markdown|txt|csv|json|ts|tsx|js|jsx|py|html|css|xml|yaml|yml)$/i.test(lower)
  ) {
    return 'text';
  }
  return null;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('file read failed'));
    reader.onload = () => {
      const value = String(reader.result ?? '');
      resolve(value.includes(',') ? value.split(',')[1] : value);
    };
    reader.readAsDataURL(file);
  });
}

function withAttachmentContext(goal: string, attachments: DashboardAttachment[]): string {
  if (attachments.length === 0) return goal;
  const summary = attachments
    .map((file) => `- ${file.name} (${file.kind}, ${file.mediaType}, ${formatBytes(file.size)})`)
    .join('\n');
  const textContext = attachments
    .filter((file) => file.kind === 'text' && file.text)
    .map((file) => `\n\n<attachment name="${file.name}">\n${file.text}\n</attachment>`)
    .join('');
  return `${goal}\n\nAttached files:\n${summary}${textContext}`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb >= 10 ? 0 : 1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
}

// WorkspaceBadge, shows the user's logo + business name in the top bar once
// they've personalized (onboarding). Makes the workspace feel like theirs,
// which is the retention hook Braeden flagged. Re-reads on profile change.
function WorkspaceBadge() {
  const [profile, setProfile] = useState<BroccoProfile | null>(null);
  useEffect(() => {
    const read = () => setProfile(getProfile());
    read();
    window.addEventListener(PROFILE_CHANGED_EVENT, read);
    return () => window.removeEventListener(PROFILE_CHANGED_EVENT, read);
  }, []);
  const label = profile?.businessName?.trim() || profile?.name?.trim() || '';
  if (!label && !profile?.logoDataUrl) return null;
  return (
    <span
      className="hidden items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] py-1 pl-1.5 pr-2.5 sm:inline-flex"
      title="your workspace"
    >
      {profile?.logoDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.logoDataUrl} alt="" className="h-4 w-4 rounded object-contain" />
      ) : (
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: profile?.brandColor || '#7C3AED' }}
        />
      )}
      {label && <span className="max-w-[140px] truncate text-[12px] text-ink-dim">{label}</span>}
    </span>
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
      dashboard preview
    </span>
  );
}

/** v3.0: empty state shows 3 hardcoded "try this" goals that pre-fill the input. */
const TRY_THESE = [
  'research the top 5 alternatives to notion, output a 1-page brief and 5 cold-email angles',
  'plan a 7-day launch for a $49/mo dev tool with 0 audience and a $200 budget',
  'review my landing-page copy, suggest 5 a/b test variants, and draft 3 launch tweets',
];

function EmptyState({
  onPick,
  workspace,
}: {
  onPick: (goal: string) => void;
  workspace?: { label: string; examples: string[] } | null;
}) {
  // When the user arrived via a category deep-link, lead with that category's
  // tailored examples and a clear "you're in the X workspace" header instead of
  // the generic founder-flavored copy.
  const examples = workspace?.examples?.length ? workspace.examples : TRY_THESE;
  return (
    <div className="flex flex-col items-center px-4 py-2">
      {/* The daily ritual, appears at the top of the empty dashboard. */}
      <MorningBriefing onAct={(item) => onPick(`Follow up on the ${item.agent}'s overnight run: ${item.output}`)} />

      {/* Evening wind-down, renders only after 7pm local. Below the morning
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
        {workspace?.label ? (
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/[0.08] px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-brand-glow">
            <Sparkles className="h-3 w-3" />
            {workspace.label} workspace
          </span>
        ) : null}
        <h2 className="mt-3 text-[20px] font-semibold tracking-tight lowercase">
          <span className="text-grad">type one goal.</span>{' '}
          <span className="font-serif italic font-normal text-grad-brand">your team works.</span>
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-dim">
          {workspace?.label
            ? 'these examples are tailored to your work. tweak one or write your own.'
            : 'broadcast is always on. each specialist runs in its own pane, in parallel.'}
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
          {examples.map((g, i) => (
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

/** Slugify a goal into a filename-safe token. Trims to 40 chars. */
function slugifyGoal(goal: string): string {
  const slug = goal
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return slug || 'run';
}

/** Render a single pane's events as a markdown transcript. */
function paneToMarkdown(pane: PaneState, goal: string): string {
  const a = AGENTS.find((x) => x.name === pane.agent);
  const lines: string[] = [];
  lines.push(`# ${a?.label || pane.agent}`);
  lines.push('');
  lines.push(`- goal: ${goal}`);
  lines.push(`- status: ${pane.status}`);
  lines.push(`- mode: ${pane.mode}`);
  lines.push(`- events: ${pane.events.length}`);
  lines.push('');
  lines.push('---');
  lines.push('');
  for (const e of pane.events) {
    switch (e.type) {
      case 'thinking':
        lines.push(`*thinking* ${e.text}`);
        break;
      case 'tool_call':
        lines.push(`**tool_call** \`${e.tool}\``);
        lines.push('```json');
        lines.push(JSON.stringify(e.input, null, 2));
        lines.push('```');
        break;
      case 'tool_result':
        lines.push(`**tool_result** \`${e.tool}\``);
        lines.push('```');
        lines.push(e.result);
        lines.push('```');
        break;
      case 'text':
        lines.push(e.text);
        break;
      case 'delegate':
        lines.push(`**delegate** -> ${e.to}: ${e.task}`);
        break;
      case 'usage':
        lines.push(`*usage* in=${e.in} out=${e.out}${e.cost_usd ? ` cost=$${e.cost_usd.toFixed(4)}` : ''}`);
        break;
      case 'retry':
        lines.push(`*retry attempt ${e.attempt}*: ${e.reason} (wait ${e.wait_ms}ms)`);
        break;
      case 'rate_limit':
        lines.push(`*rate_limit*: reset in ${e.reset_in_seconds ?? '?'}s`);
        break;
      case 'error':
        lines.push(`**error (${e.kind})**: ${e.message}`);
        break;
      case 'done':
        lines.push('');
        lines.push(`**done**: ${e.summary}`);
        break;
    }
    lines.push('');
  }
  return lines.join('\n');
}

function SaveActions({
  goal,
  panes,
  allEvents,
}: {
  goal: string;
  panes: PaneState[];
  allEvents: SimEvent[];
}) {
  // Lazy-load jszip so the dashboard's initial JS payload stays small. Only
  // users who actually click "Download .zip" pay the cost.
  async function downloadZip() {
    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      const slug = slugifyGoal(goal);
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `brocco-run-${slug}-${ts}.zip`;

      // README header with the goal + run metadata.
      zip.file(
        'README.md',
        [
          `# Brocco run · ${new Date().toLocaleString()}`,
          '',
          `**Goal:** ${goal}`,
          '',
          `**Agents:** ${panes.map((p) => p.agent).join(', ')}`,
          '',
          `**Panes:** ${panes.length}`,
          '',
        ].join('\n'),
      );

      // One markdown file per pane plus a raw assistant_text dump for quick
      // copy-paste. Tool-result blobs land in tool-results/<pane>-<n>.txt so
      // anything large stays out of the main transcript.
      for (const p of panes) {
        const a = AGENTS.find((x) => x.name === p.agent);
        const baseName = `${(a?.label || p.agent).toLowerCase().replace(/\s+/g, '-')}-${p.id}`;
        zip.file(`agents/${baseName}.md`, paneToMarkdown(p, goal));

        const assistantText = p.events
          .filter((e) => e.type === 'text')
          .map((e) => (e as Extract<SimEvent, { type: 'text' }>).text)
          .join('\n\n');
        if (assistantText.trim().length > 0) {
          zip.file(`agents/${baseName}.assistant.txt`, assistantText);
        }

        const toolResults = p.events.filter((e) => e.type === 'tool_result') as Array<
          Extract<SimEvent, { type: 'tool_result' }>
        >;
        toolResults.forEach((tr, i) => {
          zip.file(`tool-results/${baseName}-${i + 1}-${tr.tool}.txt`, tr.result);
        });
      }

      // Raw event stream as JSONL (one event per line). Matches the shape
      // produced by the unified JsonlLog right rail.
      const jsonl = allEvents.map((e) => JSON.stringify(e)).join('\n');
      zip.file('events.jsonl', jsonl);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Run exported', { description: fileName });
    } catch (err) {
      toast.error('Could not build zip', {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // Polished single-file PDF. The headline deliverable from the 2026-05-26
  // partner call, a branded, designed report (cover band + per-agent
  // sections) rather than raw markdown. Brands the cover with the workspace
  // profile (logo / business name / accent) captured in onboarding.
  const [pdfBusy, setPdfBusy] = useState(false);
  async function downloadPdf() {
    setPdfBusy(true);
    try {
      const pdfPanes: PdfPane[] = panes
        .filter((p) => p.status === 'done' || p.events.length > 0)
        .map((p) => {
          const a = AGENTS.find((x) => x.name === p.agent);
          return {
            agentLabel: a?.label || p.agent,
            accent: a?.color || '#7C3AED',
            status: p.status,
            mode: p.mode,
            events: p.events,
          };
        });
      const prof = getProfile();
      await exportRunToPdf({ goal, panes: pdfPanes, profile: prof });
      // export_pdf is the canonical funnel name Braden listed; pdf_exported is
      // kept for the existing dashboards. Both fire so neither breaks.
      const pdfProps = {
        agent_count: pdfPanes.length,
        branded: !!(prof.businessName || prof.logoDataUrl),
      };
      trackEvent('export_pdf', pdfProps);
      trackEvent('pdf_exported', pdfProps);
      toast.success('PDF report ready', {
        description: 'A branded, single-file report of this run just downloaded.',
      });
    } catch (err) {
      toast.error('Could not build PDF', {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setPdfBusy(false);
    }
  }

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
      <button
        type="button"
        onClick={downloadPdf}
        disabled={pdfBusy}
        className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand to-cyan px-3.5 py-1 text-[12px] font-semibold text-white shadow-glow2 transition hover:shadow-glow disabled:opacity-60"
        title="export this run as a polished, branded PDF report"
      >
        <FileText className="h-3.5 w-3.5" />
        {pdfBusy ? 'building…' : 'Download PDF'}
      </button>
      <button
        type="button"
        onClick={downloadZip}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.14] bg-white/[0.06] px-3 py-1 text-[12px] font-medium text-ink hover:bg-white/[0.10] hover:text-white"
        title="package this run as a .zip (markdown + raw events)"
      >
        Download .zip
      </button>
    </div>
  );
}
