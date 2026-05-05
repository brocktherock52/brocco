'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, X } from 'lucide-react';
import type { SimEvent } from '@/lib/simulator';
import { findAgent } from '@/lib/simulator';

interface PaneProps {
  agent: string;
  events: SimEvent[];
  status: 'pending' | 'running' | 'done' | 'cancelled' | 'error';
  onClose?: () => void;
  onRetry?: () => void;
}

export function StreamPane({ agent, events, status, onClose, onRetry }: PaneProps) {
  const a = findAgent(agent as any);
  const stepCount = events.length;
  // pull the most recent error event (if any) so we can render a retry button
  const errorEvent = [...events].reverse().find((e) => e.type === 'error') as
    | (Extract<SimEvent, { type: 'error' }>)
    | undefined;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35 }}
      className="card relative flex min-h-[340px] flex-col overflow-hidden"
    >
      {/* header */}
      <div className="flex items-center gap-2.5 border-b border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5">
        <span
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold"
          style={{ background: `${a.color}20`, color: a.color }}
        >
          {a.label[0]}
        </span>
        <span className="font-mono text-[12.5px] font-semibold" style={{ color: a.color }}>
          {a.label.toLowerCase()}
        </span>
        <StatusBadge status={status} />
        <span className="ml-auto font-mono text-[10.5px] text-ink-faint">step {stepCount}</span>
        {onRetry && (status === 'error' || status === 'cancelled') && (
          <button
            onClick={onRetry}
            title="retry this agent"
            className="ml-1 inline-flex items-center gap-1 rounded-md border border-white/[0.10] bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-ink-dim hover:bg-white/[0.07] hover:text-white"
          >
            <RefreshCw className="h-2.5 w-2.5" /> retry
          </button>
        )}
        {onClose && status !== 'running' && (
          <button onClick={onClose} className="-mr-1 ml-1 rounded-md p-1 text-ink-faint hover:bg-white/[0.06] hover:text-white">
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* body */}
      <div className="flex-1 overflow-y-auto p-3.5">
        <AnimatePresence initial={false}>
          {events.map((e, i) => (
            <EventBlock key={i} ev={e} />
          ))}
        </AnimatePresence>
        {status === 'running' && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2 py-1 font-mono text-[11px] text-ink-dim">
            <Loader2 className="h-3 w-3 animate-spin" />
            thinking...
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: PaneProps['status'] }) {
  if (status === 'running') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-cyan/30 bg-cyan/10 px-1.5 py-0.5 font-mono text-[10px] text-cyan-glow">
        <span className="relative flex h-1 w-1">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-glow opacity-60" />
          <span className="relative inline-flex h-1 w-1 rounded-full bg-cyan-glow" />
        </span>
        live
      </span>
    );
  }
  if (status === 'done') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300">
        <CheckCircle2 className="h-2.5 w-2.5" />
        done
      </span>
    );
  }
  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center rounded-full border border-rose-400/30 bg-rose-400/10 px-1.5 py-0.5 font-mono text-[10px] text-rose-300">
        cancelled
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="inline-flex items-center rounded-full border border-rose-400/30 bg-rose-400/10 px-1.5 py-0.5 font-mono text-[10px] text-rose-300">
        error
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-white/[0.10] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">
      pending
    </span>
  );
}

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
          <CheckCircle2 className="h-3 w-3" /> done
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
        <Loader2 className="h-2.5 w-2.5 animate-spin" />
        retry attempt {ev.attempt} ({ev.reason}) · waiting {(ev.wait_ms / 1000).toFixed(1)}s
      </motion.div>
    );
  }
  if (ev.type === 'rate_limit') {
    if (
      (ev.remaining_requests ?? 1) > 5 &&
      (ev.remaining_tokens ?? 100000) > 50000
    ) {
      return null; // headroom; don't render
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
        <div className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-wider text-rose-300">
          <AlertTriangle className="h-3 w-3" /> {ev.kind.replace('_', ' ')}
        </div>
        <div className="mt-1 text-[13px] text-ink/95">{ev.message}</div>
        <div className="mt-2 font-mono text-[10.5px] text-ink-faint">
          {ev.retryable ? 'retryable · click retry above' : 'not retryable · fix the underlying cause'}
        </div>
      </motion.div>
    );
  }
  if (ev.type === 'usage') {
    // usage events are folded into the header chip; we don't render inline.
    return null;
  }
  return null;
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

// crude markdown rendering for bold + headings + code (good enough for the demo)
function renderMd(text: string) {
  const lines = text.split('\n');
  return lines.map((ln, i) => {
    if (ln.startsWith('```')) return null;
    if (ln.startsWith('|')) {
      return (
        <div key={i} className="my-0.5 font-mono text-[11.5px] text-ink-dim">
          {ln}
        </div>
      );
    }
    const html = ln
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="font-mono text-[11.5px] bg-white/[0.06] px-1 py-0.5 rounded">$1</code>');
    return <div key={i} dangerouslySetInnerHTML={{ __html: html || '&nbsp;' }} />;
  });
}
