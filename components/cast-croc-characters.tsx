/**
 * Cast croc characters — 9 emoji-style icons that all share the SAME
 * brocco logomark body and only swap accessories per role.
 *
 * Architecture (and why the previous version was wrong):
 *
 *   The previous version tried to hand-draw 9 unique crocodile shapes as
 *   raw SVG paths (boxy rectangles, triangle teeth). They looked like
 *   "assembled shapes," not like the cute brocco logo. The fix here is
 *   to anchor every character on the ACTUAL logomark path from
 *   public/assets/logomark.svg so the silhouette is identical across
 *   all 9, and to only vary the accessory layer.
 *
 *   The logomark viewBox is 64x36. We render it at scale=3 inside a
 *   200x250 viewport (so 64*3=192 wide, leaves a 4px margin), with the
 *   croc centered ~75% down so the costume layer above the snout reads.
 *
 *   The accent prop is the agent's brand color. It is applied to ONE
 *   accessory (glasses tint, headset cup, marker barrel, etc.) so the
 *   icon carries the agent's identity without recoloring the body.
 *
 * Color palette (kept consistent across all 9):
 *   body       : #FAFAF6 (cream-white, matches logo on light bg)
 *   spine bumps: same as body, the silhouette is flat
 *   ink        : #0A0A0F
 *   blush      : #FFC4C9 (cheek)
 *   eye-white  : #FFFFFF
 */

import type { CSSProperties } from 'react';

interface CrocProps {
  accent?: string;
  className?: string;
  style?: CSSProperties;
}

const C = {
  body: '#FAFAF6',
  bodyShadow: '#E6E6DC',
  ink: '#0A0A0F',
  inkSoft: '#2A2A2F',
  blush: '#FFB8BE',
  eyeWhite: '#FFFFFF',
};

// The official logomark path, scaled and translated into the 200x250
// component viewport. logomark viewBox is 64x36; we scale 3x and
// translate (4, 110) so the croc sits in the lower-middle, leaving the
// upper area for accessories.
const LOGO_TRANSFORM = 'translate(4 110) scale(3)';

// Eye coordinates from logomark.svg are (52, 19) with the iris dot
// behind it. After the LOGO_TRANSFORM, that becomes (4 + 52*3, 110 + 19*3)
// = (160, 167). Smile coord from the path's mouth element similarly.
const EYE_CX = 160;
const EYE_CY = 167;
const SNOUT_TIP_X = 190;
const SNOUT_TOP_Y = 152;
const HEAD_TOP_X = 100;
const HEAD_TOP_Y = 158;

// Shared logo body — the EXACT path from public/assets/logomark.svg
// rendered once, then accessories layer on top.
function LogoBody({ accent, mouthCurl = 0 }: { accent: string; mouthCurl?: number }) {
  return (
    <g transform={LOGO_TRANSFORM}>
      {/* shadow under the croc — soft drop */}
      <ellipse cx="32" cy="32" rx="28" ry="1.5" fill={C.ink} opacity="0.15" />
      {/* main silhouette — the actual brocco logomark path */}
      <path
        d="M 2 22 L 4 24 Q 1 28 5 28 L 10 26 L 16 25 L 20 25 L 20 30 L 18 30 L 18 24.5 L 26 24 L 32 24 L 32 30 L 30 30 L 30 24 L 36 24 L 42 24.5 L 48 25.5 L 56 26.5 L 62 27 L 62 25 L 58 25 L 58 23 L 62 23 L 62 21 L 56 19 L 50 18 L 46 17 L 40 16 L 38 13 L 36 16 L 32 16 L 30 12 L 28 16 L 24 16 L 22 13 L 20 16 L 16 17 L 12 19 L 8 20 Z"
        fill={C.body}
        stroke={C.ink}
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      {/* cheek blush — cute emoji touch on the cheek behind the snout */}
      <ellipse cx="46" cy="22" rx="2.2" ry="1.2" fill={C.blush} opacity="0.85" />
      {/* eye — round, with iris dot + sparkle exactly like the logo */}
      <circle cx="52" cy="19" r="1.5" fill={C.ink} />
      <circle cx="52.4" cy="18.5" r="0.5" fill={C.eyeWhite} />
      {/* tooth — preserved from logo */}
      <path d="M 59 24 L 60 24.7 L 61 24 Z" fill={C.eyeWhite} stroke={C.ink} strokeWidth="0.3" />
      {/* tiny smile curl below the eye — adds emoji warmth */}
      {mouthCurl !== 0 && (
        <path
          d={`M 55 23 Q ${55 + mouthCurl * 0.5} ${23 + mouthCurl * 0.3} ${55 + mouthCurl} 23`}
          fill="none"
          stroke={C.ink}
          strokeWidth="0.4"
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

// Glow halo behind the croc — colored by accent so each card has its own ambience
function Halo({ accent }: { accent: string }) {
  return (
    <defs>
      <radialGradient id={`halo-${accent.replace('#', '')}`} cx="50%" cy="60%" r="60%">
        <stop offset="0%" stopColor={accent} stopOpacity="0.4" />
        <stop offset="70%" stopColor={accent} stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

// =============================================================================
// 1. RESEARCHER — wire glasses on the snout, paper floating, books behind
// =============================================================================
export function ResearcherCroc({ accent = '#67E8F9', className, style }: CrocProps) {
  return (
    <svg viewBox="0 0 200 250" className={className} style={style} role="img" aria-label="Researcher croc">
      <ellipse cx="100" cy="150" rx="90" ry="70" fill={accent} opacity="0.12" />
      {/* book pile in the back */}
      <g opacity="0.85">
        <rect x="18" y="115" width="30" height="8" rx="1" fill="#7A5230" stroke={C.ink} strokeWidth="1.2" />
        <rect x="20" y="108" width="32" height="7" rx="1" fill="#5B7A30" stroke={C.ink} strokeWidth="1.2" />
        <rect x="16" y="101" width="34" height="7" rx="1" fill="#7A3030" stroke={C.ink} strokeWidth="1.2" />
      </g>
      {/* sticky note floating top */}
      <rect x="26" y="40" width="22" height="22" rx="1" fill={accent} stroke={C.ink} strokeWidth="1.2" transform="rotate(-8 37 51)" opacity="0.95" />
      <line x1="30" y1="48" x2="42" y2="48" stroke={C.ink} strokeWidth="0.6" transform="rotate(-8 37 51)" />
      <line x1="30" y1="52" x2="42" y2="52" stroke={C.ink} strokeWidth="0.6" transform="rotate(-8 37 51)" />

      <LogoBody accent={accent} />

      {/* wire-frame glasses positioned on the snout — covering the eye */}
      <g stroke={C.ink} strokeWidth="2.5" fill="none" strokeLinecap="round">
        <circle cx={EYE_CX} cy={EYE_CY} r="11" />
        <circle cx={EYE_CX + 22} cy={EYE_CY} r="11" />
        <line x1={EYE_CX + 11} y1={EYE_CY} x2={EYE_CX + 11} y2={EYE_CY} />
        <line x1={EYE_CX + 11} y1={EYE_CY} x2={EYE_CX + 11} y2={EYE_CY} />
        <line x1={EYE_CX + 11} y1={EYE_CY} x2={EYE_CX + 11} y2={EYE_CY} />
      </g>
      <circle cx={EYE_CX} cy={EYE_CY} r="10" fill={accent} opacity="0.2" />
      <circle cx={EYE_CX + 22} cy={EYE_CY} r="10" fill={accent} opacity="0.2" />
    </svg>
  );
}

// =============================================================================
// 2. PLANNER — sticky-note crown + marker beside head
// =============================================================================
export function PlannerCroc({ accent = '#FB7185', className, style }: CrocProps) {
  return (
    <svg viewBox="0 0 200 250" className={className} style={style} role="img" aria-label="Planner croc">
      <ellipse cx="100" cy="150" rx="90" ry="70" fill={accent} opacity="0.12" />
      {/* whiteboard with mini plan */}
      <g>
        <rect x="20" y="20" width="160" height="78" rx="3" fill="#FAFAF6" stroke={C.ink} strokeWidth="2" />
        <g stroke={accent} strokeWidth="1.8" fill="none">
          <rect x="32" y="36" width="22" height="14" rx="1" />
          <line x1="54" y1="43" x2="72" y2="43" markerEnd="url(#arr-pl)" />
          <rect x="72" y="36" width="22" height="14" rx="1" />
          <line x1="94" y1="43" x2="112" y2="43" />
          <rect x="112" y="36" width="22" height="14" rx="1" />
          <line x1="83" y1="50" x2="83" y2="66" />
          <rect x="72" y="66" width="22" height="14" rx="1" />
        </g>
        <text x="42" y="64" fontSize="7" fill={C.ink} opacity="0.7">v1</text>
        <text x="82" y="64" fontSize="7" fill={C.ink} opacity="0.7">v2</text>
        <text x="120" y="64" fontSize="7" fill={C.ink} opacity="0.7">ship</text>
      </g>

      <LogoBody accent={accent} mouthCurl={3} />

      {/* sticky note on top of head */}
      <rect x={HEAD_TOP_X - 12} y={HEAD_TOP_Y - 22} width="24" height="20" rx="2" fill={accent} stroke={C.ink} strokeWidth="1.5" transform={`rotate(-8 ${HEAD_TOP_X} ${HEAD_TOP_Y - 12})`} />
      <line x1={HEAD_TOP_X - 8} y1={HEAD_TOP_Y - 16} x2={HEAD_TOP_X + 6} y2={HEAD_TOP_Y - 16} stroke={C.ink} strokeWidth="0.6" transform={`rotate(-8 ${HEAD_TOP_X} ${HEAD_TOP_Y - 12})`} />
      <line x1={HEAD_TOP_X - 8} y1={HEAD_TOP_Y - 12} x2={HEAD_TOP_X + 6} y2={HEAD_TOP_Y - 12} stroke={C.ink} strokeWidth="0.6" transform={`rotate(-8 ${HEAD_TOP_X} ${HEAD_TOP_Y - 12})`} />

      {/* marker pointing at whiteboard */}
      <g transform={`rotate(-30 ${SNOUT_TIP_X + 4} ${SNOUT_TOP_Y - 4})`}>
        <rect x={SNOUT_TIP_X - 2} y={SNOUT_TOP_Y - 18} width="14" height="6" rx="1.5" fill={accent} stroke={C.ink} strokeWidth="1.4" />
        <rect x={SNOUT_TIP_X + 12} y={SNOUT_TOP_Y - 17} width="5" height="4" rx="0.6" fill={C.ink} />
      </g>
    </svg>
  );
}

// =============================================================================
// 3. OUTREACH — headset over head + speech bubble
// =============================================================================
export function OutreachCroc({ accent = '#FBBF24', className, style }: CrocProps) {
  return (
    <svg viewBox="0 0 200 250" className={className} style={style} role="img" aria-label="Outreach croc">
      <ellipse cx="100" cy="150" rx="90" ry="70" fill={accent} opacity="0.14" />
      {/* speech bubble */}
      <g>
        <path d="M 30 60 Q 28 40 50 38 L 100 38 Q 122 40 120 60 Q 120 78 100 80 L 78 80 L 70 92 L 72 80 L 50 80 Q 28 78 30 60 Z" fill={C.body} stroke={C.ink} strokeWidth="1.8" />
        <circle cx="60" cy="58" r="3" fill={accent} />
        <circle cx="75" cy="58" r="3" fill={accent} opacity="0.7" />
        <circle cx="90" cy="58" r="3" fill={accent} opacity="0.4" />
      </g>

      <LogoBody accent={accent} mouthCurl={4} />

      {/* HEADSET — band over the head, cup over the side */}
      <g>
        <path d={`M ${HEAD_TOP_X - 20} ${HEAD_TOP_Y - 5} Q ${HEAD_TOP_X + 5} ${HEAD_TOP_Y - 24} ${HEAD_TOP_X + 30} ${HEAD_TOP_Y - 5}`} fill="none" stroke={C.ink} strokeWidth="4" strokeLinecap="round" />
        {/* left cup */}
        <circle cx={HEAD_TOP_X - 20} cy={HEAD_TOP_Y - 5} r="8" fill={C.inkSoft} stroke={C.ink} strokeWidth="2" />
        <circle cx={HEAD_TOP_X - 20} cy={HEAD_TOP_Y - 5} r="4" fill={accent} />
        {/* mic boom */}
        <path d={`M ${HEAD_TOP_X - 20} ${HEAD_TOP_Y + 3} Q ${HEAD_TOP_X - 4} ${HEAD_TOP_Y + 18} ${EYE_CX - 4} ${EYE_CY + 6}`} fill="none" stroke={C.ink} strokeWidth="2" strokeLinecap="round" />
        <ellipse cx={EYE_CX - 4} cy={EYE_CY + 6} rx="3" ry="2" fill={C.inkSoft} stroke={C.ink} strokeWidth="1" />
      </g>
    </svg>
  );
}

// =============================================================================
// 4. DESIGNER — beret + paintbrush + color swatches
// =============================================================================
export function DesignerCroc({ accent = '#F472B6', className, style }: CrocProps) {
  return (
    <svg viewBox="0 0 200 250" className={className} style={style} role="img" aria-label="Designer croc">
      <ellipse cx="100" cy="150" rx="90" ry="70" fill={accent} opacity="0.14" />
      {/* color swatches pinned top */}
      <g>
        <rect x="20" y="32" width="14" height="20" fill="#F472B6" stroke={C.ink} strokeWidth="1.3" />
        <rect x="38" y="32" width="14" height="20" fill="#FB7185" stroke={C.ink} strokeWidth="1.3" />
        <rect x="56" y="32" width="14" height="20" fill="#A78BFA" stroke={C.ink} strokeWidth="1.3" />
        <rect x="74" y="32" width="14" height="20" fill="#67E8F9" stroke={C.ink} strokeWidth="1.3" />
        <rect x="92" y="32" width="14" height="20" fill="#FBBF24" stroke={C.ink} strokeWidth="1.3" />
        <rect x="110" y="32" width="14" height="20" fill="#4ADE80" stroke={C.ink} strokeWidth="1.3" />
      </g>
      {/* color palette floating */}
      <g transform="translate(132 48)">
        <path
          d="M 0 15 Q 0 0 18 0 Q 36 0 36 15 Q 30 22 22 22 Q 14 22 14 28 Q 14 35 6 35 Q 0 30 0 15 Z"
          fill={C.body}
          stroke={C.ink}
          strokeWidth="1.8"
        />
        <circle cx="8" cy="10" r="2.5" fill="#F472B6" />
        <circle cx="20" cy="6" r="2.5" fill="#67E8F9" />
        <circle cx="28" cy="14" r="2.5" fill="#FBBF24" />
        <circle cx="14" cy="18" r="2.5" fill="#A78BFA" />
      </g>

      <LogoBody accent={accent} mouthCurl={3} />

      {/* BERET on top of the head */}
      <g>
        <ellipse cx={HEAD_TOP_X + 4} cy={HEAD_TOP_Y - 6} rx="20" ry="6" fill={accent} stroke={C.ink} strokeWidth="2" />
        <ellipse cx={HEAD_TOP_X + 4} cy={HEAD_TOP_Y - 10} rx="16" ry="8" fill={accent} stroke={C.ink} strokeWidth="2" />
        {/* beret stem */}
        <circle cx={HEAD_TOP_X + 18} cy={HEAD_TOP_Y - 16} r="2.5" fill={accent} stroke={C.ink} strokeWidth="1.5" />
      </g>

      {/* paint flecks on the body */}
      <circle cx="100" cy="200" r="2" fill="#F472B6" />
      <circle cx="115" cy="208" r="1.5" fill="#FBBF24" />
      <circle cx="85" cy="210" r="2" fill="#67E8F9" />
    </svg>
  );
}

// =============================================================================
// 5. ANALYST — rectangle glasses + bar chart behind
// =============================================================================
export function AnalystCroc({ accent = '#A78BFA', className, style }: CrocProps) {
  return (
    <svg viewBox="0 0 200 250" className={className} style={style} role="img" aria-label="Analyst croc">
      <ellipse cx="100" cy="150" rx="90" ry="70" fill={accent} opacity="0.14" />
      {/* bar chart behind */}
      <g>
        <line x1="20" y1="100" x2="180" y2="100" stroke={C.ink} strokeWidth="1.5" opacity="0.5" />
        <line x1="20" y1="30" x2="20" y2="100" stroke={C.ink} strokeWidth="1.5" opacity="0.5" />
        <rect x="34" y="68" width="14" height="32" fill={accent} stroke={C.ink} strokeWidth="1.2" />
        <rect x="56" y="54" width="14" height="46" fill={accent} stroke={C.ink} strokeWidth="1.2" opacity="0.9" />
        <rect x="78" y="42" width="14" height="58" fill={accent} stroke={C.ink} strokeWidth="1.2" opacity="0.95" />
        <rect x="100" y="32" width="14" height="68" fill={accent} stroke={C.ink} strokeWidth="1.2" />
        <rect x="122" y="48" width="14" height="52" fill={accent} stroke={C.ink} strokeWidth="1.2" opacity="0.92" />
        <rect x="144" y="38" width="14" height="62" fill={accent} stroke={C.ink} strokeWidth="1.2" />
        {/* trend line */}
        <polyline points="41,76 63,64 85,52 107,40 129,56 151,46" fill="none" stroke={C.ink} strokeWidth="2" />
      </g>

      <LogoBody accent={accent} mouthCurl={2} />

      {/* RECTANGLE READING GLASSES on the snout */}
      <g stroke={C.ink} strokeWidth="2.2" fill="none" strokeLinecap="round">
        <rect x={EYE_CX - 12} y={EYE_CY - 6} width="14" height="11" rx="1.5" />
        <rect x={EYE_CX + 8} y={EYE_CY - 6} width="14" height="11" rx="1.5" />
        <line x1={EYE_CX + 2} y1={EYE_CY - 1} x2={EYE_CX + 8} y2={EYE_CY - 1} />
      </g>
      <rect x={EYE_CX - 11} y={EYE_CY - 5} width="12" height="9" fill={accent} opacity="0.18" rx="1" />
      <rect x={EYE_CX + 9} y={EYE_CY - 5} width="12" height="9" fill={accent} opacity="0.18" rx="1" />
    </svg>
  );
}

// =============================================================================
// 6. CODER — big circle hipster glasses + terminal behind
// =============================================================================
export function CoderCroc({ accent = '#4ADE80', className, style }: CrocProps) {
  return (
    <svg viewBox="0 0 200 250" className={className} style={style} role="img" aria-label="Coder croc">
      <ellipse cx="100" cy="150" rx="90" ry="70" fill={accent} opacity="0.16" />
      {/* terminal in the back */}
      <g>
        <rect x="16" y="22" width="168" height="78" rx="3" fill="#04140A" stroke={accent} strokeWidth="1.5" />
        {/* traffic lights */}
        <circle cx="26" cy="32" r="2.5" fill="#F87171" />
        <circle cx="35" cy="32" r="2.5" fill="#FBBF24" />
        <circle cx="44" cy="32" r="2.5" fill={accent} />
        <g fontFamily="monospace" fontSize="7" fill={accent} opacity="0.9">
          <text x="24" y="50">{'> npm run dev'}</text>
          <text x="24" y="62">{'✓ ready in 348ms'}</text>
          <text x="24" y="74">{'GET / 200 in 12ms'}</text>
          <text x="24" y="86">{'GET /api/v1 200'}</text>
          <text x="24" y="96">_</text>
        </g>
      </g>

      <LogoBody accent={accent} mouthCurl={3} />

      {/* HUGE round hipster glasses on the snout */}
      <g stroke={C.ink} strokeWidth="3" fill="none">
        <circle cx={EYE_CX} cy={EYE_CY} r="13" />
        <circle cx={EYE_CX + 26} cy={EYE_CY} r="13" />
        <line x1={EYE_CX + 13} y1={EYE_CY} x2={EYE_CX + 13} y2={EYE_CY} />
      </g>
      <circle cx={EYE_CX} cy={EYE_CY} r="12" fill={accent} opacity="0.2" />
      <circle cx={EYE_CX + 26} cy={EYE_CY} r="12" fill={accent} opacity="0.2" />
      {/* code reflection in the lenses */}
      <text x={EYE_CX - 5} y={EYE_CY + 2} fontFamily="monospace" fontSize="4" fill={accent}>{'{}'}</text>
      <text x={EYE_CX + 21} y={EYE_CY + 2} fontFamily="monospace" fontSize="4" fill={accent}>=&gt;</text>
    </svg>
  );
}

// =============================================================================
// 7. OPS — tiny necktie + clipboard
// =============================================================================
export function OpsCroc({ accent = '#22D3EE', className, style }: CrocProps) {
  return (
    <svg viewBox="0 0 200 250" className={className} style={style} role="img" aria-label="Ops croc">
      <ellipse cx="100" cy="150" rx="90" ry="70" fill={accent} opacity="0.14" />
      {/* clipboard floating top-left */}
      <g transform="translate(30 30) rotate(-6)">
        <rect x="0" y="0" width="44" height="60" rx="2" fill={C.body} stroke={C.ink} strokeWidth="1.8" />
        <rect x="14" y="-4" width="16" height="8" rx="1" fill="#A88040" stroke={C.ink} strokeWidth="1.5" />
        <line x1="6" y1="14" x2="38" y2="14" stroke={C.inkSoft} strokeWidth="0.8" />
        <line x1="6" y1="22" x2="34" y2="22" stroke={C.inkSoft} strokeWidth="0.8" />
        <line x1="6" y1="30" x2="38" y2="30" stroke={C.inkSoft} strokeWidth="0.8" />
        <line x1="6" y1="38" x2="30" y2="38" stroke={C.inkSoft} strokeWidth="0.8" />
        {/* checkmarks */}
        <path d="M 6 46 L 9 49 L 14 44" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* paper confetti floating */}
      <rect x="130" y="44" width="8" height="10" fill={C.body} stroke={C.ink} strokeWidth="0.8" transform="rotate(20 134 49)" />
      <rect x="148" y="62" width="6" height="8" fill={C.body} stroke={C.ink} strokeWidth="0.8" transform="rotate(-15 151 66)" />
      <rect x="156" y="40" width="5" height="7" fill={C.body} stroke={C.ink} strokeWidth="0.8" transform="rotate(8 158 43)" />

      <LogoBody accent={accent} mouthCurl={2} />

      {/* small bow tie under the chin (snout-base) */}
      <g transform={`translate(${EYE_CX - 4} ${EYE_CY + 18})`}>
        <path d="M -10 0 L -2 -4 L -2 4 Z" fill={accent} stroke={C.ink} strokeWidth="1.4" />
        <path d="M 10 0 L 2 -4 L 2 4 Z" fill={accent} stroke={C.ink} strokeWidth="1.4" />
        <circle cx="0" cy="0" r="2.5" fill={accent} stroke={C.ink} strokeWidth="1.4" />
      </g>
    </svg>
  );
}

// =============================================================================
// 8. SUPERVISOR — crown/halo + tiny baton
// =============================================================================
export function SupervisorCroc({ accent = '#22C55E', className, style }: CrocProps) {
  return (
    <svg viewBox="0 0 200 250" className={className} style={style} role="img" aria-label="Supervisor croc">
      <ellipse cx="100" cy="150" rx="90" ry="70" fill={accent} opacity="0.14" />
      {/* mini dashboard tiles behind */}
      <g>
        <rect x="20" y="24" width="46" height="28" rx="2" fill="#0E1024" stroke={accent} strokeWidth="1.3" />
        <line x1="26" y1="36" x2="58" y2="36" stroke={accent} strokeWidth="0.8" />
        <line x1="26" y1="42" x2="50" y2="42" stroke={accent} strokeWidth="0.8" opacity="0.6" />

        <rect x="74" y="24" width="46" height="28" rx="2" fill="#0E1024" stroke="#67E8F9" strokeWidth="1.3" />
        <polyline points="80,46 88,38 96,42 104,30 112,40 118,32" fill="none" stroke="#67E8F9" strokeWidth="1.5" />

        <rect x="128" y="24" width="46" height="28" rx="2" fill="#0E1024" stroke="#FB7185" strokeWidth="1.3" />
        <rect x="134" y="40" width="4" height="10" fill="#FB7185" opacity="0.7" />
        <rect x="142" y="34" width="4" height="16" fill="#FB7185" opacity="0.7" />
        <rect x="150" y="38" width="4" height="12" fill="#FB7185" opacity="0.7" />
        <rect x="158" y="30" width="4" height="20" fill="#FB7185" opacity="0.7" />
        <rect x="166" y="36" width="4" height="14" fill="#FB7185" opacity="0.7" />
      </g>

      <LogoBody accent={accent} mouthCurl={2} />

      {/* CROWN on top of the head — 3 points */}
      <g>
        <path
          d={`M ${HEAD_TOP_X - 14} ${HEAD_TOP_Y - 4}
              L ${HEAD_TOP_X - 14} ${HEAD_TOP_Y - 18}
              L ${HEAD_TOP_X - 8}  ${HEAD_TOP_Y - 8}
              L ${HEAD_TOP_X}      ${HEAD_TOP_Y - 22}
              L ${HEAD_TOP_X + 8}  ${HEAD_TOP_Y - 8}
              L ${HEAD_TOP_X + 14} ${HEAD_TOP_Y - 18}
              L ${HEAD_TOP_X + 14} ${HEAD_TOP_Y - 4} Z`}
          fill={accent}
          stroke={C.ink}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* gem in middle */}
        <circle cx={HEAD_TOP_X} cy={HEAD_TOP_Y - 10} r="2.5" fill={C.eyeWhite} stroke={C.ink} strokeWidth="1" />
        {/* gems on points */}
        <circle cx={HEAD_TOP_X - 14} cy={HEAD_TOP_Y - 18} r="1.8" fill={C.eyeWhite} stroke={C.ink} strokeWidth="0.8" />
        <circle cx={HEAD_TOP_X + 14} cy={HEAD_TOP_Y - 18} r="1.8" fill={C.eyeWhite} stroke={C.ink} strokeWidth="0.8" />
      </g>
    </svg>
  );
}

// =============================================================================
// 9. BROWSER — fedora + magnifying glass over the snout
// =============================================================================
export function BrowserCroc({ accent = '#67E8F9', className, style }: CrocProps) {
  return (
    <svg viewBox="0 0 200 250" className={className} style={style} role="img" aria-label="Browser croc">
      <ellipse cx="100" cy="150" rx="90" ry="70" fill={accent} opacity="0.14" />
      {/* banker's lamp top-right */}
      <g transform="translate(150 28)">
        <ellipse cx="0" cy="0" rx="20" ry="9" fill="#1F4A2C" stroke={C.ink} strokeWidth="1.5" />
        <line x1="0" y1="9" x2="0" y2="44" stroke={C.ink} strokeWidth="3" />
        <ellipse cx="0" cy="46" rx="10" ry="3" fill="#3A2818" stroke={C.ink} strokeWidth="1.3" />
        {/* lamp glow */}
        <ellipse cx="0" cy="9" rx="20" ry="5" fill="#94E5BC" opacity="0.7" />
      </g>
      {/* case-file folder */}
      <g transform="translate(20 50) rotate(-4)">
        <rect x="0" y="0" width="42" height="48" rx="2" fill="#5A4030" stroke={C.ink} strokeWidth="1.5" />
        <rect x="3" y="6" width="36" height="38" rx="1" fill={C.body} stroke={C.ink} strokeWidth="1.2" />
        <line x1="7" y1="14" x2="33" y2="14" stroke={C.inkSoft} strokeWidth="0.8" />
        <line x1="7" y1="20" x2="29" y2="20" stroke={C.inkSoft} strokeWidth="0.8" />
        <line x1="7" y1="26" x2="33" y2="26" stroke={C.inkSoft} strokeWidth="0.8" />
        <text x="7" y="40" fontSize="8" fill="#A8302C" fontWeight="700">CONFIDENTIAL</text>
      </g>

      <LogoBody accent={accent} mouthCurl={1} />

      {/* FEDORA on top of the head */}
      <g>
        {/* brim */}
        <path
          d={`M ${HEAD_TOP_X - 22} ${HEAD_TOP_Y - 4}
              L ${HEAD_TOP_X + 22} ${HEAD_TOP_Y - 4}
              Q ${HEAD_TOP_X + 26} ${HEAD_TOP_Y - 2} ${HEAD_TOP_X + 22} ${HEAD_TOP_Y}
              L ${HEAD_TOP_X - 22} ${HEAD_TOP_Y}
              Q ${HEAD_TOP_X - 26} ${HEAD_TOP_Y - 2} ${HEAD_TOP_X - 22} ${HEAD_TOP_Y - 4} Z`}
          fill="#1A1A1F"
          stroke={C.ink}
          strokeWidth="1.8"
        />
        {/* crown */}
        <path
          d={`M ${HEAD_TOP_X - 16} ${HEAD_TOP_Y - 4}
              Q ${HEAD_TOP_X - 14} ${HEAD_TOP_Y - 20} ${HEAD_TOP_X}     ${HEAD_TOP_Y - 22}
              Q ${HEAD_TOP_X + 14} ${HEAD_TOP_Y - 20} ${HEAD_TOP_X + 16} ${HEAD_TOP_Y - 4} Z`}
          fill="#1A1A1F"
          stroke={C.ink}
          strokeWidth="1.8"
        />
        {/* hat band */}
        <rect x={HEAD_TOP_X - 15} y={HEAD_TOP_Y - 8} width="30" height="3" fill={accent} opacity="0.9" />
      </g>

      {/* MAGNIFYING GLASS hovering over the snout */}
      <g transform={`translate(${EYE_CX + 18} ${EYE_CY + 10}) rotate(30)`}>
        <circle cx="0" cy="0" r="14" fill={C.eyeWhite} stroke={C.ink} strokeWidth="2.5" opacity="0.4" />
        <circle cx="0" cy="0" r="14" fill="none" stroke={accent} strokeWidth="2" opacity="0.7" />
        {/* handle */}
        <rect x="10" y="-2" width="20" height="4" rx="1" fill={C.inkSoft} stroke={C.ink} strokeWidth="1.5" />
      </g>
    </svg>
  );
}

// =============================================================================
// Registry
// =============================================================================
export const CAST_CROCS: Record<string, React.ComponentType<CrocProps>> = {
  researcher: ResearcherCroc,
  planner: PlannerCroc,
  outreach: OutreachCroc,
  designer: DesignerCroc,
  analyst: AnalystCroc,
  coder: CoderCroc,
  ops: OpsCroc,
  supervisor: SupervisorCroc,
  browser: BrowserCroc,
};
