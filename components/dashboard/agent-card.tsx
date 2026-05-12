'use client';

import { Check } from 'lucide-react';
import type { Agent } from '@/lib/agents';
import { cn } from '@/lib/utils';
import { AgentCroc } from '@/components/agent-croc';

export function AgentCard({
  agent,
  selected,
  onToggle,
}: {
  agent: Agent;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'group relative flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all',
        selected
          ? 'border-white/[0.18] bg-white/[0.05] shadow-glow2'
          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]',
      )}
    >
      <span
        className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-white/[0.10]"
        style={{
          background: `linear-gradient(135deg, ${agent.color}30 0%, ${agent.color}10 100%)`,
        }}
      >
        <AgentCroc agent={agent.name} size="sm" accent={agent.color} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[13.5px] font-semibold tracking-tight">{agent.label}</span>
          {selected && <Check className="h-3 w-3 text-emerald-400" />}
        </div>
        <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-ink-faint">{agent.description}</p>
      </div>
    </button>
  );
}
