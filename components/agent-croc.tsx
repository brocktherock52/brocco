/**
 * Agent croc avatars. Cute white cartoon crocodile + persona accessory baked in.
 *
 * Source: Higgsfield Nano Banana 2 master + reference-driven variants generated
 * 2026-05-22 (see scripts/transparent-bg.py + public/assets/agents-nano/).
 *
 * Each agent gets one transparent PNG showing the same croc holding/wearing
 * its persona accessory:
 *   supervisor  → gold crown
 *   researcher  → magnifying glass
 *   analyst     → bar chart
 *   outreach    → speech bubble
 *   coder       → laptop with </>
 *   browser     → globe
 *   designer    → palette + brush
 *   planner     → clipboard
 *   app_builder → wrench
 *
 * Replaced the previous flat-SVG + 2-bit accessory pattern (was bad at
 * any size above 48px and didn't match the cast-v7 hero treatment).
 */

import Image from 'next/image';
import type { AgentName } from '@/lib/agents';

type Size = 'sm' | 'md' | 'lg';

const SIZE_PX: Record<Size, number> = { sm: 32, md: 48, lg: 96 };

interface AgentCrocProps {
  agent: AgentName;
  size?: Size;
  className?: string;
  /**
   * Accent color used for an optional soft outer glow. The persona
   * accessory itself is baked into the PNG; this no longer tints it.
   */
  accent?: string;
  /** Optional title for screen readers. Defaults to "<agent name> agent". */
  title?: string;
}

const AGENT_TITLES: Record<AgentName, string> = {
  supervisor: 'Supervisor agent',
  researcher: 'Researcher agent',
  analyst: 'Analyst agent',
  outreach: 'Outreach agent',
  coder: 'Coder agent',
  browser: 'Browser agent',
  designer: 'Designer agent',
  planner: 'Planner agent',
  app_builder: 'App builder agent',
};

export function AgentCroc({ agent, size = 'md', className, accent, title }: AgentCrocProps) {
  const px = SIZE_PX[size];
  const a11yTitle = title ?? AGENT_TITLES[agent];
  const glow = accent
    ? { filter: `drop-shadow(0 0 ${Math.round(px * 0.18)}px ${accent}55)` }
    : undefined;
  return (
    <Image
      src={`/assets/agents-nano/${agent}.png`}
      alt={a11yTitle}
      width={px}
      height={px}
      className={className}
      style={glow}
      // High-priority art on the landing hero / agent specialists; let Next
      // optimize and avoid layout shift.
      priority={size === 'lg'}
    />
  );
}

/**
 * Convenience export: render all 9 in a row. Useful for /app sidebar, /agents page.
 */
export function AgentCrocStrip({ size = 'md', className }: { size?: Size; className?: string }) {
  const names: AgentName[] = [
    'supervisor', 'researcher', 'analyst', 'outreach',
    'coder', 'browser', 'designer', 'planner', 'app_builder',
  ];
  return (
    <div className={`inline-flex items-end gap-2 ${className ?? ''}`}>
      {names.map((n) => <AgentCroc key={n} agent={n} size={size} />)}
    </div>
  );
}
