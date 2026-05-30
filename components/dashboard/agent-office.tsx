'use client';

/**
 * Agent Office, the spacious "office floor" presentation for the dashboard.
 *
 * Founder feedback (2026-05-26): "All of the agents are too smushed into a small
 * space... Each agent needs to have its own window that you can click. It can
 * basically be like an office. You click on the little crocodile agent and then
 * you can see what it's doing and the files that it's outputted."
 *
 * This component is PRESENTATION ONLY. It owns no run logic. app-shell.tsx keeps
 * the run engine (panes, run(), retryPane(), abort controllers) and passes the
 * minimal slice of state + handlers down. Each agent gets a roomy "desk" card;
 * clicking a desk opens a focused detail drawer that reuses the StreamPane event
 * rendering plus a dedicated Outputs tab (assistant text + files / tool results)
 * with per-agent copy / download.
 */

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Download, FileText, Loader2, Plus, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';
import { AGENTS, type Agent, type AgentName } from '@/lib/agents';
import type { SimEvent } from '@/lib/simulator';
import { AgentCroc } from '@/components/agent-croc';
import { cn } from '@/lib/utils';
import { renderMd } from './render-md';

/** The slice of a running pane the office needs. Mirrors PaneState in app-shell
 *  but kept structurally typed so we don't import the internal interface. */
export interface OfficePane {
  id: string;
  agent: AgentName;
  events: SimEvent[];
  status: 'pending' | 'running' | 'done' | 'cancelled' | 'error';
}

type DeskStatus = 'available' | 'idle' | 'running' | 'done' | 'error' | 'cancelled';

interface AgentOfficeProps {
  selected: AgentName[];
  panes: OfficePane[];
  /** Toggle an agent in/out of the team (hire / let go). */
  onToggle: (name: AgentName) => void;
  /** Re-run a single pane by id. */
  onRetry: (paneId: string) => void;
  /** Close (dismiss) a single finished pane by id. */
  onClosePane: (paneId: string) => void;
}

export function AgentOffice({
  selected,
  panes,
  onToggle,
  onRetry,
  onClosePane,
}: AgentOfficeProps) {
  // Which agent's detail drawer is open (by agent name). null = office view.
  const [openAgent, setOpenAgent] = useState<AgentName | null>(null);

  // The newest pane for a given agent. A re-broadcast appends a new pane, so we
  // always surface the most recent one in the desk + drawer.
  const latestPaneFor = useMemo(() => {
    const map = new Map<AgentName, OfficePane>();
    for (const p of panes) map.set(p.agent, p); // later wins (panes are append-ordered)
    return map;
  }, [panes]);

  // Close the drawer if its agent gets removed from the team.
  useEffect(() => {
    if (openAgent && !selected.includes(openAgent)) setOpenAgent(null);
  }, [openAgent, selected]);

  // Stable office ordering: selected ("hired") desks first in AGENTS order,
  // then the dimmed "available to hire" desks. Keeps the floor calm, desks
  // don't jump around mid-run.
  const orderedHired = AGENTS.filter((a) => selected.includes(a.name));
  const orderedAvailable = AGENTS.filter((a) => !selected.includes(a.name));

  const openAgentSpec = openAgent ? AGENTS.find((a) => a.name === openAgent) ?? null : null;
  const openPane = openAgent ? latestPaneFor.get(openAgent) ?? null : null;

  return (
    <div className="relative">
      {/* Office header band */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">your office</p>
          <h2 className="mt-1 text-[17px] font-semibold tracking-tight text-ink">
            {selected.length} {selected.length === 1 ? 'specialist' : 'specialists'} on the floor
          </h2>
          <p className="mt-0.5 text-[12.5px] text-ink-dim">
            click a desk to watch that agent work and read what it produced.
          </p>
        </div>
        <span className="hidden font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint sm:inline-flex">
          {orderedAvailable.length} available to hire
        </span>
      </div>

      {/* HIRED desks, the live office floor. Roomy responsive grid. */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {orderedHired.map((agent) => {
          const pane = latestPaneFor.get(agent.name);
          return (
            <AgentDesk
              key={agent.name}
              agent={agent}
              pane={pane}
              onOpen={() => setOpenAgent(agent.name)}
              onRelease={() => onToggle(agent.name)}
            />
          );
        })}
      </div>

      {/* AVAILABLE desks, dimmed, click to hire. */}
      {orderedAvailable.length > 0 && (
        <div className="mt-10">
          <p className="eyebrow mb-4">available to hire</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {orderedAvailable.map((agent) => (
              <HireDesk key={agent.name} agent={agent} onHire={() => onToggle(agent.name)} />
            ))}
          </div>
        </div>
      )}

      {/* DETAIL DRAWER, focused view of one agent. */}
      <AgentDetailDrawer
        agent={openAgentSpec}
        pane={openPane}
        onClose={() => setOpenAgent(null)}
        onRetry={onRetry}
        onClosePane={onClosePane}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Desk (hired agent)                                                  */
/* ------------------------------------------------------------------ */

function deskStatusOf(pane?: OfficePane): DeskStatus {
  if (!pane) return 'idle';
  return pane.status === 'pending' ? 'running' : pane.status;
}

/** A short, human "what is it doing right now" line pulled from the latest
 *  meaningful event. Keeps the desk feeling alive without opening it. */
function activityLine(pane?: OfficePane): string {
  if (!pane || pane.events.length === 0) return 'waiting for a goal';
  const last = [...pane.events].reverse().find((e) =>
    e.type === 'thinking' ||
    e.type === 'tool_call' ||
    e.type === 'tool_result' ||
    e.type === 'text' ||
    e.type === 'done' ||
    e.type === 'error',
  );
  if (!last) return 'working…';
  switch (last.type) {
    case 'thinking':
      return strip(last.text);
    case 'tool_call':
      return `calling ${last.tool}()`;
    case 'tool_result':
      return `result from ${last.tool}`;
    case 'text':
      return strip(last.text);
    case 'done':
      return strip(last.summary);
    case 'error':
      return `error: ${strip(last.message)}`;
    default:
      return 'working…';
  }
}

function AgentDesk({
  agent,
  pane,
  onOpen,
  onRelease,
}: {
  agent: Agent;
  pane?: OfficePane;
  onOpen: () => void;
  onRelease: () => void;
}) {
  const status = deskStatusOf(pane);
  const outputCount = pane
    ? pane.events.filter((e) => e.type === 'tool_result' || e.type === 'text').length
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          'group relative flex w-full flex-col overflow-hidden rounded-2xl border p-5 text-left',
          'transition-[transform,border-color,background-color] duration-300 ease-out',
          'motion-safe:hover:-translate-y-0.5',
          status === 'running'
            ? 'border-cyan/30 bg-white/[0.045]'
            : status === 'error'
              ? 'border-rose-400/30 bg-white/[0.03]'
              : 'border-white/[0.08] bg-white/[0.03] hover:border-white/[0.16] hover:bg-white/[0.05]',
        )}
        style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 30px 60px -30px rgba(0,0,0,0.6)' }}
      >
        {/* soft per-agent glow wash in the corner */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-50 blur-3xl transition-opacity duration-300 group-hover:opacity-80"
          style={{ background: `radial-gradient(circle, ${agent.color}33, transparent 70%)` }}
        />

        {/* release (let go), appears on hover, top-right */}
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onRelease();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              onRelease();
            }
          }}
          aria-label={`remove ${agent.label} from the team`}
          title="remove from team"
          className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-ink-faint opacity-0 transition hover:bg-white/[0.08] hover:text-white focus:opacity-100 group-hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" />
        </span>

        {/* avatar window + name */}
        <div className="flex items-center gap-4">
          <span
            className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl ring-1 ring-white/[0.10]"
            style={{
              background: `linear-gradient(150deg, ${agent.color}26 0%, ${agent.color}0A 70%)`,
            }}
          >
            <AgentCroc agent={agent.name} size="md" accent={agent.color} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-[16px] font-semibold tracking-tight text-ink">
                {agent.label}
              </span>
              <DeskStatusDot status={status} />
            </div>
            {agent.personaName && (
              <p className="truncate text-[12px] text-ink-faint">
                {agent.personaName}
              </p>
            )}
          </div>
        </div>

        {/* live activity line */}
        <div className="mt-4 flex min-h-[34px] items-start gap-2 rounded-lg border border-white/[0.05] bg-bg-0/40 px-3 py-2">
          {status === 'running' ? (
            <Loader2 className="mt-0.5 h-3 w-3 shrink-0 animate-spin text-cyan-glow motion-reduce:animate-none" />
          ) : (
            <span
              className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: agent.color }}
            />
          )}
          <p className="line-clamp-2 text-[12px] leading-snug text-ink-dim">{activityLine(pane)}</p>
        </div>

        {/* footer meta */}
        <div className="mt-4 flex items-center justify-between font-mono text-[10.5px] text-ink-faint">
          <span className="inline-flex items-center gap-1.5">
            <span className="text-ink-dim">{agent.tools.length}</span> tools
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-ink-dim">{outputCount}</span> outputs
          </span>
          <span className="inline-flex items-center gap-1 text-brand-glow opacity-0 transition group-hover:opacity-100">
            open desk →
          </span>
        </div>
      </button>
    </motion.div>
  );
}

function DeskStatusDot({ status }: { status: DeskStatus }) {
  if (status === 'running') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-cyan/30 bg-cyan/10 px-1.5 py-0.5 font-mono text-[9.5px] text-cyan-glow">
        <span className="relative flex h-1 w-1">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-glow opacity-60 motion-reduce:hidden" />
          <span className="relative inline-flex h-1 w-1 rounded-full bg-cyan-glow" />
        </span>
        working
      </span>
    );
  }
  if (status === 'done') {
    return (
      <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-1.5 py-0.5 font-mono text-[9.5px] text-emerald-300">
        done
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="rounded-full border border-rose-400/30 bg-rose-400/10 px-1.5 py-0.5 font-mono text-[9.5px] text-rose-300">
        error
      </span>
    );
  }
  if (status === 'cancelled') {
    return (
      <span className="rounded-full border border-rose-400/30 bg-rose-400/10 px-1.5 py-0.5 font-mono text-[9.5px] text-rose-300">
        stopped
      </span>
    );
  }
  return (
    <span className="rounded-full border border-white/[0.10] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9.5px] text-ink-faint">
      idle
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Hire desk (available agent)                                         */
/* ------------------------------------------------------------------ */

function HireDesk({ agent, onHire }: { agent: Agent; onHire: () => void }) {
  return (
    <button
      type="button"
      onClick={onHire}
      title={`hire ${agent.label}`}
      className={cn(
        'group relative flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/[0.10] bg-white/[0.015] p-4 text-center',
        'transition-[transform,border-color,background-color] duration-300 ease-out',
        'opacity-70 hover:opacity-100 hover:border-white/[0.22] hover:bg-white/[0.04] motion-safe:hover:-translate-y-0.5',
      )}
    >
      <span
        className="relative flex h-12 w-12 items-center justify-center rounded-lg ring-1 ring-white/[0.08] grayscale transition group-hover:grayscale-0"
        style={{ background: `linear-gradient(150deg, ${agent.color}1A 0%, transparent 70%)` }}
      >
        <AgentCroc agent={agent.name} size="sm" accent={agent.color} />
      </span>
      <span className="truncate text-[12.5px] font-medium text-ink-dim group-hover:text-ink">
        {agent.label}
      </span>
      <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.10] bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-ink-faint transition group-hover:border-brand/40 group-hover:text-brand-glow">
        <Plus className="h-2.5 w-2.5" /> hire
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Detail drawer                                                       */
/* ------------------------------------------------------------------ */

function AgentDetailDrawer({
  agent,
  pane,
  onClose,
  onRetry,
  onClosePane,
}: {
  agent: Agent | null;
  pane: OfficePane | null;
  onClose: () => void;
  onRetry: (paneId: string) => void;
  onClosePane: (paneId: string) => void;
}) {
  const [tab, setTab] = useState<'stream' | 'outputs'>('stream');

  // Reset to the stream tab each time a new agent's drawer opens.
  useEffect(() => {
    if (agent) setTab('stream');
  }, [agent?.name]);

  // Esc closes the drawer.
  useEffect(() => {
    if (!agent) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [agent, onClose]);

  const events = pane?.events ?? [];
  const status = deskStatusOf(pane ?? undefined);

  const assistantText = useMemo(
    () =>
      events
        .filter((e) => e.type === 'text')
        .map((e) => (e as Extract<SimEvent, { type: 'text' }>).text)
        .join('\n\n'),
    [events],
  );
  const toolResults = useMemo(
    () => events.filter((e) => e.type === 'tool_result') as Array<Extract<SimEvent, { type: 'tool_result' }>>,
    [events],
  );
  const outputCount = (assistantText.trim() ? 1 : 0) + toolResults.length;

  return (
    <AnimatePresence>
      {agent && (
        <>
          <motion.div
            key="office-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            aria-hidden
          />
          <motion.aside
            key="office-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[560px] flex-col border-l border-white/[0.08] bg-bg-1/98 backdrop-blur-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={`${agent.label} desk`}
          >
            {/* drawer header */}
            <div className="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-5 py-4">
              <span
                className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ring-white/[0.10]"
                style={{ background: `linear-gradient(150deg, ${agent.color}26 0%, ${agent.color}0A 70%)` }}
              >
                <AgentCroc agent={agent.name} size="sm" accent={agent.color} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[16px] font-semibold tracking-tight text-ink">
                    {agent.label}
                  </span>
                  <DeskStatusDot status={status} />
                </div>
                <p className="truncate text-[12px] text-ink-faint">{agent.description}</p>
              </div>
              {pane && (status === 'error' || status === 'cancelled') && (
                <button
                  type="button"
                  onClick={() => onRetry(pane.id)}
                  className="inline-flex items-center gap-1 rounded-md border border-white/[0.10] bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-ink-dim transition hover:bg-white/[0.07] hover:text-white"
                >
                  <RefreshCw className="h-3 w-3" /> retry
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="close desk"
                className="rounded-full p-2 text-ink-faint transition hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* tabs */}
            <div className="flex items-center gap-1 border-b border-white/[0.06] px-4 py-2">
              <DrawerTab active={tab === 'stream'} onClick={() => setTab('stream')}>
                live stream
                <span className="ml-1.5 font-mono text-[10px] text-ink-faint">{events.length}</span>
              </DrawerTab>
              <DrawerTab active={tab === 'outputs'} onClick={() => setTab('outputs')}>
                outputs
                <span className="ml-1.5 font-mono text-[10px] text-ink-faint">{outputCount}</span>
              </DrawerTab>
              {pane && status !== 'running' && (
                <button
                  type="button"
                  onClick={() => {
                    onClosePane(pane.id);
                    onClose();
                  }}
                  className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[10.5px] text-ink-faint transition hover:text-rose-300"
                  title="dismiss this run"
                >
                  <X className="h-3 w-3" /> dismiss run
                </button>
              )}
            </div>

            {/* body */}
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {!pane ? (
                <DrawerEmpty agent={agent} />
              ) : tab === 'stream' ? (
                <DrawerStream events={events} status={status} />
              ) : (
                <DrawerOutputs
                  agent={agent}
                  assistantText={assistantText}
                  toolResults={toolResults}
                />
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function DrawerTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition',
        active ? 'bg-white/[0.07] text-ink' : 'text-ink-faint hover:bg-white/[0.04] hover:text-ink-dim',
      )}
    >
      {children}
    </button>
  );
}

function DrawerEmpty({ agent }: { agent: Agent }) {
  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
      <span
        className="relative flex h-20 w-20 items-center justify-center rounded-2xl ring-1 ring-white/[0.10]"
        style={{ background: `linear-gradient(150deg, ${agent.color}26 0%, ${agent.color}0A 70%)` }}
      >
        <AgentCroc agent={agent.name} size="md" accent={agent.color} />
      </span>
      <p className="mt-4 text-[14px] font-medium text-ink">{agent.label} is at its desk.</p>
      <p className="mt-1 max-w-[280px] text-[12.5px] leading-relaxed text-ink-dim">
        {agent.description} Type a goal up top and hit broadcast, and this desk lights up the moment it
        starts working.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
        {agent.tools.map((t) => (
          <span
            key={t}
            className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 font-mono text-[10.5px] text-ink-faint"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Reuses the same event-rendering vocabulary as StreamPane. Self-contained so
 *  app-shell's StreamPane stays untouched, but visually identical event blocks. */
function DrawerStream({
  events,
  status,
}: {
  events: SimEvent[];
  status: DeskStatus;
}) {
  return (
    <div>
      <AnimatePresence initial={false}>
        {events.map((e, i) => (
          <EventBlock key={i} ev={e} />
        ))}
      </AnimatePresence>
      {status === 'running' && (
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2 py-1 font-mono text-[11px] text-ink-dim">
          <Loader2 className="h-3 w-3 animate-spin motion-reduce:animate-none" />
          thinking...
        </div>
      )}
      {events.length === 0 && status !== 'running' && (
        <p className="font-mono text-[12px] text-ink-faint">_no events yet_</p>
      )}
    </div>
  );
}

function DrawerOutputs({
  agent,
  assistantText,
  toolResults,
}: {
  agent: Agent;
  assistantText: string;
  toolResults: Array<Extract<SimEvent, { type: 'tool_result' }>>;
}) {
  const hasText = assistantText.trim().length > 0;

  function copy(text: string, label: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(`Copied ${label}`))
      .catch(() => toast.error('Copy failed'));
  }

  function download(text: string, filename: string) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Downloaded', { description: filename });
  }

  const slug = agent.label.toLowerCase().replace(/\s+/g, '-');

  if (!hasText && toolResults.length === 0) {
    return (
      <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
        <FileText className="h-8 w-8 text-ink-faint" />
        <p className="mt-3 text-[13px] text-ink-dim">No outputs yet.</p>
        <p className="mt-1 max-w-[260px] text-[12px] text-ink-faint">
          Files and the final answer will appear here once {agent.label} finishes a step.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* assistant answer */}
      {hasText && (
        <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
          <header className="flex items-center justify-between gap-2 border-b border-white/[0.06] bg-white/[0.02] px-3.5 py-2">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
              answer
            </span>
            <div className="flex items-center gap-1">
              <IconBtn title="copy answer" onClick={() => copy(assistantText, 'answer')}>
                <Copy className="h-3 w-3" />
              </IconBtn>
              <IconBtn
                title="download answer"
                onClick={() => download(assistantText, `${slug}-answer.md`)}
              >
                <Download className="h-3 w-3" />
              </IconBtn>
            </div>
          </header>
          <div className="whitespace-pre-wrap px-3.5 py-3 text-[13px] leading-relaxed text-ink/95">
            {renderMd(assistantText)}
          </div>
        </section>
      )}

      {/* files / tool results */}
      {toolResults.length > 0 && (
        <section>
          <p className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
            files &amp; results · {toolResults.length}
          </p>
          <div className="space-y-3">
            {toolResults.map((tr, i) => {
              const filename = `${slug}-${tr.tool}-${i + 1}.txt`;
              return (
                <div
                  key={i}
                  className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]"
                >
                  <header className="flex items-center justify-between gap-2 border-b border-white/[0.06] bg-white/[0.02] px-3.5 py-2">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-cyan-glow">
                      <span className="h-1 w-1 rounded-full bg-cyan-glow" />
                      {tr.tool}
                    </span>
                    <div className="flex items-center gap-1">
                      <IconBtn title="copy result" onClick={() => copy(tr.result, tr.tool)}>
                        <Copy className="h-3 w-3" />
                      </IconBtn>
                      <IconBtn title="download result" onClick={() => download(tr.result, filename)}>
                        <Download className="h-3 w-3" />
                      </IconBtn>
                    </div>
                  </header>
                  <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap break-words px-3.5 py-3 font-mono text-[11.5px] leading-relaxed text-ink-dim">
                    {tr.result}
                  </pre>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function IconBtn({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="rounded-md p-1.5 text-ink-faint transition hover:bg-white/[0.07] hover:text-white"
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Event rendering, mirrors stream-pane.tsx so the drawer stream reads */
/* identically to the legacy panes.                                    */
/* ------------------------------------------------------------------ */

function EventBlock({ ev }: { ev: SimEvent }) {
  if (ev.type === 'thinking') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="my-2 border-l-2 border-white/[0.10] pl-3 text-[12.5px] italic text-ink-faint"
      >
        {ev.text}
      </motion.div>
    );
  }
  if (ev.type === 'tool_call') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="my-2">
        <div className="text-[10.5px] uppercase tracking-wider text-ink-faint">tool call</div>
        <div className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-cyan/20 bg-cyan/5 px-2 py-0.5 font-mono text-[12px] text-cyan-glow">
          <span className="h-1 w-1 rounded-full bg-cyan-glow" />
          {ev.tool}
          <span className="text-ink-faint">(</span>
          <span className="text-ink-dim">
            {Object.entries(ev.input)
              .map(([k, v]) => `${k}: ${truncate(JSON.stringify(v), 36)}`)
              .join(', ')}
          </span>
          <span className="text-ink-faint">)</span>
        </div>
      </motion.div>
    );
  }
  if (ev.type === 'tool_result') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="my-2">
        <div className="text-[10.5px] uppercase tracking-wider text-ink-faint">result</div>
        <pre className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap break-words rounded-md bg-bg-2/80 p-2 font-mono text-[11.5px] leading-relaxed text-ink-dim">
          {ev.result}
        </pre>
      </motion.div>
    );
  }
  if (ev.type === 'text') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="my-2">
        <div className="text-[10.5px] uppercase tracking-wider text-ink-faint">assistant</div>
        <div className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-ink/95">
          {renderMd(ev.text)}
        </div>
      </motion.div>
    );
  }
  if (ev.type === 'delegate') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="my-2">
        <div className="text-[10.5px] uppercase tracking-wider text-ink-faint">delegate</div>
        <div className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-violet-400/20 bg-violet-400/5 px-2 py-0.5 font-mono text-[12px] text-violet-300">
          → {ev.to}: {truncate(ev.task, 60)}
        </div>
      </motion.div>
    );
  }
  if (ev.type === 'done') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 rounded-lg border border-emerald-400/30 bg-emerald-400/5 p-3"
      >
        <div className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-wider text-emerald-300">
          done
        </div>
        <div className="mt-1 text-[13px] text-ink/95">{ev.summary}</div>
      </motion.div>
    );
  }
  if (ev.type === 'retry') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="my-2 inline-flex items-center gap-1.5 rounded-md border border-amber-400/20 bg-amber-400/5 px-2 py-0.5 font-mono text-[11px] text-amber-300"
      >
        <Loader2 className="h-2.5 w-2.5 animate-spin motion-reduce:animate-none" />
        retry attempt {ev.attempt} ({ev.reason}) · waiting {(ev.wait_ms / 1000).toFixed(1)}s
      </motion.div>
    );
  }
  if (ev.type === 'rate_limit') {
    if ((ev.remaining_requests ?? 1) > 5 && (ev.remaining_tokens ?? 100000) > 50000) {
      return null;
    }
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="my-2 inline-flex items-center gap-1.5 rounded-md border border-amber-400/20 bg-amber-400/5 px-2 py-0.5 font-mono text-[10.5px] text-amber-300"
      >
        anthropic rate limit · {ev.remaining_requests ?? '?'} req · {ev.remaining_tokens ?? '?'} tok left
        {ev.reset_in_seconds ? ` · resets in ${ev.reset_in_seconds}s` : ''}
      </motion.div>
    );
  }
  if (ev.type === 'error') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 rounded-lg border border-rose-400/30 bg-rose-400/5 p-3"
      >
        <div className="font-mono text-[10.5px] uppercase tracking-wider text-rose-300">
          {ev.kind.replace('_', ' ')}
        </div>
        <div className="mt-1 text-[13px] text-ink/95">{ev.message}</div>
        <div className="mt-2 font-mono text-[10.5px] text-ink-faint">
          {ev.retryable ? 'retryable · click retry above' : 'not retryable · fix the underlying cause'}
        </div>
      </motion.div>
    );
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* small helpers (kept local; same behavior as stream-pane.tsx)        */
/* ------------------------------------------------------------------ */

function strip(s: string): string {
  return s.replace(/[*`#>]/g, '').replace(/\n+/g, ' ').trim();
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

// renderMd now lives in the shared, XSS-safe module (./render-md). Agent output
// is untrusted and is HTML-escaped before any markup transform runs.
