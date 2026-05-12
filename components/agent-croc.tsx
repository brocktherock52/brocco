/**
 * Agent croc icons. White-croc base + 2-bit pixel-style persona accessory per agent.
 *
 * Rendered as inline SVG so they:
 *   - scale crisply at any size (16px nav badges → 96px agent cards)
 *   - tint via currentColor (the accent ring around each agent)
 *   - cost zero KB extra beyond the JSX (no asset fetch)
 *   - render with `shape-rendering="crispEdges"` for the pixelated/codey aesthetic
 *
 * The base shape is a side-view croc head (matches the existing brocco-mark).
 * Each agent variant adds a small persona accessory floating above the croc:
 *   supervisor  → crown
 *   researcher  → magnifying glass
 *   analyst     → bar chart
 *   outreach    → speech bubble
 *   coder       → angle brackets </>
 *   browser     → web/globe
 *   designer    → palette
 *   planner     → checklist box
 *   app_builder → wrench
 */

import type { AgentName } from '@/lib/agents';

type Size = 'sm' | 'md' | 'lg';

const SIZE_PX: Record<Size, number> = { sm: 32, md: 48, lg: 96 };

interface AgentCrocProps {
  agent: AgentName;
  size?: Size;
  className?: string;
  /** Accent color used for the persona accessory + the eye glint. Defaults to white. */
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

// Each accessory is drawn on a 32x32 grid in the top-right area of the croc.
// Pixels are intentionally large (2-3px) for the 2-bit aesthetic.
const accessories: Record<AgentName, React.ReactNode> = {
  supervisor: (
    // Crown: 5 pixel points
    <g shapeRendering="crispEdges" stroke="currentColor" strokeWidth="1" fill="currentColor">
      <rect x="38" y="6" width="2" height="2" />
      <rect x="42" y="4" width="2" height="2" />
      <rect x="46" y="6" width="2" height="2" />
      <rect x="50" y="4" width="2" height="2" />
      <rect x="54" y="6" width="2" height="2" />
      <rect x="36" y="10" width="22" height="3" />
      <rect x="36" y="14" width="22" height="1" opacity="0.6" />
    </g>
  ),
  researcher: (
    // Magnifying glass: circle outline + handle
    <g shapeRendering="auto" fill="none" stroke="currentColor" strokeWidth="3">
      <circle cx="48" cy="12" r="8" />
      <line x1="54" y1="18" x2="60" y2="24" strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  analyst: (
    // Bar chart: 3 ascending bars
    <g shapeRendering="crispEdges" fill="currentColor">
      <rect x="38" y="14" width="4" height="6" />
      <rect x="46" y="10" width="4" height="10" />
      <rect x="54" y="6" width="4" height="14" />
    </g>
  ),
  outreach: (
    // Speech bubble with 3 dots
    <g shapeRendering="auto" fill="currentColor" stroke="currentColor" strokeWidth="1">
      <path d="M36 4 h22 a2 2 0 0 1 2 2 v10 a2 2 0 0 1 -2 2 h-12 l-4 4 v-4 h-6 a2 2 0 0 1 -2 -2 v-10 a2 2 0 0 1 2 -2 z" fill="currentColor" />
      <circle cx="42" cy="11" r="1.5" fill="#0A0A0F" />
      <circle cx="47" cy="11" r="1.5" fill="#0A0A0F" />
      <circle cx="52" cy="11" r="1.5" fill="#0A0A0F" />
    </g>
  ),
  coder: (
    // Angle brackets </>
    <g shapeRendering="auto" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="40,4 34,12 40,20" />
      <polyline points="54,4 60,12 54,20" />
      <line x1="50" y1="3" x2="44" y2="21" strokeWidth="2" />
    </g>
  ),
  browser: (
    // Globe: circle with latitude + longitude
    <g shapeRendering="auto" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="48" cy="12" r="9" />
      <ellipse cx="48" cy="12" rx="4" ry="9" />
      <line x1="39" y1="12" x2="57" y2="12" />
    </g>
  ),
  designer: (
    // Paint palette: rounded shape with 3 dots of color
    <g shapeRendering="auto">
      <path
        d="M48 3 a9 9 0 0 0 -9 9 a9 9 0 0 0 9 9 a3 3 0 0 0 3 -3 a2 2 0 0 1 2 -2 h2 a4 4 0 0 0 4 -4 a9 9 0 0 0 -11 -9 z"
        fill="currentColor"
      />
      <circle cx="44" cy="9" r="1.5" fill="#FB7185" />
      <circle cx="49" cy="14" r="1.5" fill="#22D3EE" />
      <circle cx="53" cy="9" r="1.5" fill="#FBBF24" />
    </g>
  ),
  planner: (
    // Checklist: 3 lines with checkmarks
    <g shapeRendering="auto" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="36" y="4" width="22" height="18" rx="1" stroke="currentColor" strokeWidth="2" />
      <polyline points="39,9 41,11 44,8" />
      <polyline points="39,14 41,16 44,13" />
      <line x1="46" y1="9" x2="55" y2="9" />
      <line x1="46" y1="14" x2="55" y2="14" />
      <line x1="39" y1="18" x2="55" y2="18" />
    </g>
  ),
  app_builder: (
    // Wrench
    <g shapeRendering="auto" fill="currentColor">
      <path
        d="M38 22 L52 8 a5 5 0 0 1 7 7 L44 30 z M55 5 a4 4 0 0 0 -4 4 a4 4 0 0 0 4 4 a4 4 0 0 0 4 -4 a4 4 0 0 0 -4 -4 z"
        fill="currentColor"
      />
      <circle cx="55" cy="9" r="2" fill="#0A0A0F" />
    </g>
  ),
};

/**
 * The base white-croc silhouette. Side view, snout facing right, with a single
 * eye-glint accent in the accent color. Drawn on a 96x96 viewport (matches the
 * existing brocco-mark proportions) but positioned in the LOWER half so the
 * persona accessory has room in the upper-right.
 */
function CrocBase({ accent }: { accent: string }) {
  return (
    <g shapeRendering="auto">
      {/* main snout body */}
      <path
        d="
          M6 70
          L6 60
          Q6 52 14 50
          L26 48
          Q34 44 44 44
          L74 44
          Q86 44 90 50
          L90 60
          Q90 66 84 68
          L74 68
          Q70 72 64 72
          L20 72
          Q10 72 6 70
          Z
        "
        fill="white"
        stroke="#0A0A0F"
        strokeWidth="2"
      />
      {/* upper jaw teeth (zig-zag) — gives the 2-bit codey vibe */}
      <path
        d="M22 60 L26 66 L30 60 L34 66 L38 60 L42 66 L46 60 L50 66 L54 60 L58 66 L62 60 L66 66 L70 60"
        fill="white"
        stroke="#0A0A0F"
        strokeWidth="1.2"
        strokeLinejoin="miter"
      />
      {/* eye */}
      <circle cx="78" cy="54" r="3" fill="#0A0A0F" />
      <circle cx="79" cy="53" r="0.9" fill={accent} />
      {/* nostril */}
      <circle cx="88" cy="52" r="1.2" fill="#0A0A0F" />
      {/* tail tip behind */}
      <path
        d="M6 60 L2 56 L4 64 Z"
        fill="white"
        stroke="#0A0A0F"
        strokeWidth="1.5"
        strokeLinejoin="miter"
      />
      {/* scales along the back (3 chevrons) — pixel-style */}
      <g shapeRendering="crispEdges" fill="white" stroke="#0A0A0F" strokeWidth="1">
        <polyline points="36,42 40,38 44,42" fill="none" />
        <polyline points="50,42 54,38 58,42" fill="none" />
        <polyline points="64,42 68,38 72,42" fill="none" />
      </g>
    </g>
  );
}

export function AgentCroc({ agent, size = 'md', className, accent = '#67E8F9', title }: AgentCrocProps) {
  const px = SIZE_PX[size];
  const a11yTitle = title ?? AGENT_TITLES[agent];
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 96 96"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={a11yTitle}
      className={className}
    >
      <title>{a11yTitle}</title>
      <CrocBase accent={accent} />
      {/* accessory drawn in the upper-right quadrant, in the agent's accent color */}
      <g style={{ color: accent }}>{accessories[agent]}</g>
    </svg>
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
