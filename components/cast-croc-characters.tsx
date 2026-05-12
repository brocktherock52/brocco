/**
 * Cast croc characters — 9 distinct SVG illustrations, one per agent.
 *
 * Each croc has its own body proportion, pose, and costume drawn AS PART
 * of the SVG (not as overlays). Same white-crocodile color palette across
 * all 9 so they read as the same brand character in different roles,
 * but every illustration is unique geometry.
 *
 * ViewBox: 200x250 (4:5 aspect, matches the cast card area)
 *
 * Shared color tokens (inline, not from tailwind, so this file works
 * standalone in any context):
 *   white scales  : #F4F6F8
 *   scale shadow  : #C9CED4
 *   green belly   : #B6E3B0   (broccoli reference)
 *   ink outline   : #0A0A0F
 *   eye           : #0A0A0F
 *   pink mouth    : #F4A8B3
 *
 * The accent color is passed as a prop and applied to the agent-specific
 * accessory (glasses lens tint, marker color, monitor glow, etc.) so each
 * card carries the agent's brand color into the illustration itself.
 */

import type { CSSProperties } from 'react';

interface CrocProps {
  accent?: string;
  className?: string;
  style?: CSSProperties;
}

// Shared color constants — define here so every croc looks like the same
// species but with different costumes.
const C = {
  scale: '#F4F6F8',
  scaleShadow: '#C9CED4',
  belly: '#B6E3B0',
  ink: '#0A0A0F',
  inkSoft: '#2A2A2F',
  mouth: '#F4A8B3',
  eyeWhite: '#FFFFFF',
};

// =============================================================================
// 1. RESEARCHER — chubby sitting croc, wire glasses, paper in claw, books
// =============================================================================
export function ResearcherCroc({ accent = '#67E8F9', className, style }: CrocProps) {
  return (
    <svg viewBox="0 0 200 250" className={className} style={style} role="img" aria-label="Researcher croc">
      <defs>
        <radialGradient id="rs-light" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
          <stop offset="60%" stopColor={accent} stopOpacity="0.05" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      {/* desk lamp glow */}
      <ellipse cx="100" cy="80" rx="80" ry="60" fill="url(#rs-light)" />
      {/* book pile behind */}
      <g>
        <rect x="20" y="180" width="36" height="10" rx="1" fill="#7A5230" stroke={C.ink} strokeWidth="1.5" />
        <rect x="22" y="170" width="38" height="10" rx="1" fill="#5B7A30" stroke={C.ink} strokeWidth="1.5" />
        <rect x="18" y="160" width="40" height="10" rx="1" fill="#7A3030" stroke={C.ink} strokeWidth="1.5" />
        <line x1="22" y1="174" x2="58" y2="174" stroke={C.ink} strokeWidth="0.5" />
        <line x1="22" y1="184" x2="54" y2="184" stroke={C.ink} strokeWidth="0.5" />
      </g>
      {/* desk */}
      <rect x="0" y="210" width="200" height="40" fill="#3A2818" stroke={C.ink} strokeWidth="1.5" />
      <line x1="0" y1="218" x2="200" y2="218" stroke={C.ink} strokeWidth="0.5" opacity="0.4" />
      {/* tail behind body */}
      <path d="M 140 200 Q 175 195 180 175 Q 178 188 175 200 Z" fill={C.scale} stroke={C.ink} strokeWidth="1.8" />
      {/* body — chubby seated */}
      <path
        d="M 60 200 Q 50 150 70 130 Q 90 115 110 118 Q 140 122 150 150 Q 155 185 145 210 L 60 210 Z"
        fill={C.scale}
        stroke={C.ink}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* cardigan — color block on torso */}
      <path
        d="M 70 155 Q 75 175 78 200 L 140 200 Q 145 175 148 158 Q 130 165 105 165 Q 85 165 70 155 Z"
        fill="#8B6B3F"
        stroke={C.ink}
        strokeWidth="1.8"
      />
      {/* cardigan buttons */}
      <circle cx="108" cy="175" r="2" fill={C.ink} />
      <circle cx="108" cy="188" r="2" fill={C.ink} />
      {/* belly tint */}
      <ellipse cx="105" cy="195" rx="14" ry="10" fill={C.belly} opacity="0.35" />
      {/* head/snout — sticks out to the right */}
      <path
        d="M 110 120 Q 165 122 178 135 Q 182 145 175 152 L 120 150 Z"
        fill={C.scale}
        stroke={C.ink}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* upper jaw teeth */}
      <path
        d="M 122 148 L 126 153 L 130 148 L 134 153 L 138 148 L 142 153 L 146 148 L 150 153 L 154 148 L 158 153 L 162 148 L 166 153 L 170 148"
        fill={C.scale}
        stroke={C.ink}
        strokeWidth="1.2"
      />
      {/* nostril */}
      <circle cx="174" cy="138" r="1.8" fill={C.ink} />
      {/* WIRE GLASSES on the snout */}
      <g stroke={C.ink} strokeWidth="2.5" fill="none">
        <circle cx="148" cy="135" r="8" />
        <circle cx="166" cy="135" r="8" />
        <line x1="156" y1="135" x2="158" y2="135" />
        <line x1="174" y1="135" x2="180" y2="132" />
      </g>
      {/* glasses lens tint in accent */}
      <circle cx="148" cy="135" r="7" fill={accent} opacity="0.18" />
      <circle cx="166" cy="135" r="7" fill={accent} opacity="0.18" />
      {/* eye behind glasses */}
      <circle cx="148" cy="135" r="2.5" fill={C.ink} />
      <circle cx="148.5" cy="134.5" r="0.8" fill={C.eyeWhite} />
      {/* paper in claw */}
      <g>
        <rect x="55" y="178" width="22" height="28" fill="#FAF8F2" stroke={C.ink} strokeWidth="1.5" transform="rotate(-12 66 192)" />
        <line x1="58" y1="184" x2="73" y2="184" stroke={C.inkSoft} strokeWidth="0.6" transform="rotate(-12 66 192)" />
        <line x1="58" y1="188" x2="73" y2="188" stroke={C.inkSoft} strokeWidth="0.6" transform="rotate(-12 66 192)" />
        <line x1="58" y1="192" x2="71" y2="192" stroke={C.inkSoft} strokeWidth="0.6" transform="rotate(-12 66 192)" />
        <line x1="58" y1="196" x2="73" y2="196" stroke={C.inkSoft} strokeWidth="0.6" transform="rotate(-12 66 192)" />
        <line x1="58" y1="200" x2="68" y2="200" stroke={C.inkSoft} strokeWidth="0.6" transform="rotate(-12 66 192)" />
      </g>
      {/* claw */}
      <ellipse cx="75" cy="195" rx="9" ry="6" fill={C.scale} stroke={C.ink} strokeWidth="1.5" />
      {/* sticky note floating */}
      <rect x="18" y="60" width="22" height="22" fill={accent} stroke={C.ink} strokeWidth="1.5" transform="rotate(-8 29 71)" opacity="0.9" />
    </svg>
  );
}

// =============================================================================
// 2. PLANNER — tall croc at whiteboard, marker raised, mid-gesture
// =============================================================================
export function PlannerCroc({ accent = '#FB7185', className, style }: CrocProps) {
  return (
    <svg viewBox="0 0 200 250" className={className} style={style} role="img" aria-label="Planner croc">
      <defs>
        <radialGradient id="pl-light" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.3" />
          <stop offset="70%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="80" rx="80" ry="70" fill="url(#pl-light)" />
      {/* whiteboard behind */}
      <rect x="20" y="20" width="160" height="100" fill="#FAFAF6" stroke={C.ink} strokeWidth="2" />
      <rect x="20" y="20" width="160" height="100" fill="none" stroke={accent} strokeWidth="1" opacity="0.4" />
      {/* whiteboard arrows + boxes (the plan) */}
      <g stroke={accent} strokeWidth="2" fill="none">
        <rect x="28" y="32" width="22" height="14" />
        <line x1="50" y1="39" x2="68" y2="39" markerEnd="url(#arrow)" />
        <rect x="68" y="32" width="22" height="14" />
        <line x1="90" y1="39" x2="108" y2="39" />
        <rect x="108" y="32" width="22" height="14" />
        <line x1="79" y1="46" x2="79" y2="64" />
        <rect x="68" y="64" width="22" height="14" />
      </g>
      <text x="40" y="60" fontSize="6" fill={C.ink} opacity="0.7">v1</text>
      <text x="80" y="60" fontSize="6" fill={C.ink} opacity="0.7">v2</text>
      <text x="120" y="60" fontSize="6" fill={C.ink} opacity="0.7">ship</text>
      {/* floor line */}
      <line x1="0" y1="240" x2="200" y2="240" stroke={C.ink} strokeWidth="1.5" />
      {/* tail */}
      <path d="M 60 230 Q 30 225 22 210 Q 30 232 50 240 Z" fill={C.scale} stroke={C.ink} strokeWidth="1.8" />
      {/* body — tall standing */}
      <path
        d="M 75 240 Q 70 200 75 170 Q 78 145 90 135 Q 100 130 110 135 Q 122 145 125 170 Q 130 200 125 240 Z"
        fill={C.scale}
        stroke={C.ink}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* shirt sleeves rolled up — color block on torso */}
      <path
        d="M 78 175 Q 78 220 82 240 L 118 240 Q 122 220 122 175 Q 100 180 78 175 Z"
        fill="#E8F4F0"
        stroke={C.ink}
        strokeWidth="1.5"
      />
      <line x1="80" y1="200" x2="120" y2="200" stroke={C.ink} strokeWidth="0.5" opacity="0.3" />
      {/* head — slight tilt up */}
      <path
        d="M 95 135 Q 92 110 100 100 Q 115 95 130 105 Q 135 120 132 135 Q 115 142 95 135 Z"
        fill={C.scale}
        stroke={C.ink}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* snout */}
      <path
        d="M 130 115 Q 165 116 175 125 Q 175 135 168 138 L 130 130 Z"
        fill={C.scale}
        stroke={C.ink}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* upper teeth */}
      <path
        d="M 132 130 L 136 134 L 140 130 L 144 134 L 148 130 L 152 134 L 156 130 L 160 134 L 164 130 L 168 134"
        fill={C.scale}
        stroke={C.ink}
        strokeWidth="1.1"
      />
      <circle cx="172" cy="122" r="1.5" fill={C.ink} />
      {/* eye */}
      <circle cx="115" cy="118" r="3" fill={C.ink} />
      <circle cx="116" cy="117" r="1" fill={C.eyeWhite} />
      {/* RAISED ARM with marker */}
      <path
        d="M 120 145 Q 145 130 160 110 Q 162 100 156 95 L 152 92"
        fill={C.scale}
        stroke={C.ink}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* claw on raised arm */}
      <ellipse cx="155" cy="95" rx="7" ry="5" fill={C.scale} stroke={C.ink} strokeWidth="1.5" transform="rotate(-30 155 95)" />
      {/* MARKER */}
      <g transform="rotate(-30 155 95)">
        <rect x="148" y="84" width="14" height="6" fill={accent} stroke={C.ink} strokeWidth="1.5" rx="1" />
        <rect x="162" y="85" width="6" height="4" fill={C.ink} />
      </g>
      {/* sticky note on whiteboard */}
      <rect x="138" y="78" width="14" height="14" fill={accent} stroke={C.ink} strokeWidth="1.2" transform="rotate(-6 145 85)" opacity="0.9" />
      {/* sandwich on the floor */}
      <g transform="translate(155 232)">
        <rect x="0" y="0" width="16" height="6" fill="#D4A867" stroke={C.ink} strokeWidth="1" />
        <rect x="0" y="2" width="16" height="2" fill="#7BAE5C" />
      </g>
    </svg>
  );
}

// =============================================================================
// 3. OUTREACH — round friendly croc with headset, mid-call smile
// =============================================================================
export function OutreachCroc({ accent = '#FBBF24', className, style }: CrocProps) {
  return (
    <svg viewBox="0 0 200 250" className={className} style={style} role="img" aria-label="Outreach croc">
      <defs>
        <radialGradient id="or-light" cx="40%" cy="20%" r="70%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.4" />
          <stop offset="60%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <ellipse cx="80" cy="40" rx="90" ry="70" fill="url(#or-light)" />
      {/* desk */}
      <rect x="0" y="210" width="200" height="40" fill="#1A1A24" stroke={C.ink} strokeWidth="1.5" />
      {/* laptop */}
      <g>
        <path d="M 50 195 L 150 195 L 158 215 L 42 215 Z" fill="#2A2A36" stroke={C.ink} strokeWidth="1.5" />
        <rect x="60" y="165" width="80" height="32" fill="#0A0A14" stroke={C.ink} strokeWidth="1.5" rx="2" />
        <rect x="64" y="170" width="72" height="24" fill={accent} opacity="0.25" rx="1" />
        <line x1="66" y1="175" x2="100" y2="175" stroke={accent} strokeWidth="0.6" />
        <line x1="66" y1="180" x2="120" y2="180" stroke={accent} strokeWidth="0.6" />
        <line x1="66" y1="185" x2="90" y2="185" stroke={accent} strokeWidth="0.6" />
      </g>
      {/* sticky note piles */}
      <rect x="155" y="195" width="14" height="14" fill="#FCD34D" stroke={C.ink} strokeWidth="1" transform="rotate(8 162 202)" />
      <rect x="172" y="198" width="14" height="14" fill="#F87171" stroke={C.ink} strokeWidth="1" transform="rotate(-4 179 205)" />
      {/* coffee mug */}
      <g transform="translate(160 165)">
        <rect x="0" y="0" width="18" height="22" fill={accent} stroke={C.ink} strokeWidth="1.5" rx="1" />
        <ellipse cx="9" cy="0" rx="9" ry="3" fill={C.scale} stroke={C.ink} strokeWidth="1.5" />
        <path d="M 18 6 Q 26 6 26 12 Q 26 18 18 18" fill="none" stroke={C.ink} strokeWidth="1.5" />
        {/* steam */}
        <path d="M 5 -3 Q 7 -8 5 -12 M 12 -3 Q 14 -8 12 -12" fill="none" stroke={accent} strokeWidth="1" opacity="0.7" />
      </g>
      {/* body — round friendly */}
      <ellipse cx="100" cy="180" rx="48" ry="40" fill={C.scale} stroke={C.ink} strokeWidth="2" />
      {/* blazer over torso */}
      <path
        d="M 60 180 Q 60 215 80 220 L 120 220 Q 140 215 140 180 Q 120 200 100 200 Q 80 200 60 180 Z"
        fill="#1F2C4A"
        stroke={C.ink}
        strokeWidth="1.8"
      />
      {/* tee under blazer */}
      <path d="M 90 200 Q 100 210 110 200 L 108 218 L 92 218 Z" fill="#F4F6F8" stroke={C.ink} strokeWidth="1.5" />
      {/* head — round */}
      <ellipse cx="100" cy="115" rx="35" ry="32" fill={C.scale} stroke={C.ink} strokeWidth="2" />
      {/* snout sticking forward-right */}
      <path d="M 130 115 Q 165 117 172 128 Q 172 138 165 140 L 130 130 Z" fill={C.scale} stroke={C.ink} strokeWidth="2" strokeLinejoin="round" />
      {/* mouth — slightly open mid-call */}
      <path d="M 132 132 L 136 138 L 142 132 L 148 138 L 154 132 L 160 138 L 166 132" fill={C.scale} stroke={C.ink} strokeWidth="1.2" />
      <ellipse cx="148" cy="140" rx="6" ry="2" fill={C.mouth} stroke={C.ink} strokeWidth="1" />
      <circle cx="168" cy="122" r="1.5" fill={C.ink} />
      {/* eye — happy curved (smiling) */}
      <path d="M 108 110 Q 116 100 124 110" fill="none" stroke={C.ink} strokeWidth="2.5" strokeLinecap="round" />
      {/* HEADSET — band across the head */}
      <path
        d="M 70 95 Q 100 65 130 95"
        fill="none"
        stroke={C.ink}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="70" cy="95" r="9" fill={C.inkSoft} stroke={C.ink} strokeWidth="2" />
      <circle cx="70" cy="95" r="4" fill={accent} />
      {/* mic boom */}
      <path d="M 70 104 Q 78 118 110 120" fill="none" stroke={C.ink} strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="112" cy="120" rx="3" ry="2" fill={C.inkSoft} stroke={C.ink} strokeWidth="1" />
    </svg>
  );
}

// =============================================================================
// 4. DESIGNER — sleek croc with paint apron, palette, stylus, big headphones
// =============================================================================
export function DesignerCroc({ accent = '#F472B6', className, style }: CrocProps) {
  return (
    <svg viewBox="0 0 200 250" className={className} style={style} role="img" aria-label="Designer croc">
      <defs>
        <radialGradient id="dg-light" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
          <stop offset="70%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="80" rx="80" ry="70" fill="url(#dg-light)" />
      {/* color swatches pinned behind */}
      <g>
        <rect x="20" y="30" width="14" height="20" fill="#F472B6" stroke={C.ink} strokeWidth="1.3" />
        <rect x="38" y="30" width="14" height="20" fill="#FB7185" stroke={C.ink} strokeWidth="1.3" />
        <rect x="56" y="30" width="14" height="20" fill="#A78BFA" stroke={C.ink} strokeWidth="1.3" />
        <rect x="74" y="30" width="14" height="20" fill="#67E8F9" stroke={C.ink} strokeWidth="1.3" />
        <rect x="92" y="30" width="14" height="20" fill="#FBBF24" stroke={C.ink} strokeWidth="1.3" />
      </g>
      {/* floor */}
      <line x1="0" y1="240" x2="200" y2="240" stroke={C.ink} strokeWidth="1.5" />
      {/* tail */}
      <path d="M 70 220 Q 38 215 28 195 Q 38 220 55 230 Z" fill={C.scale} stroke={C.ink} strokeWidth="1.8" />
      {/* body — sleek/curvy standing */}
      <path
        d="M 80 240 Q 70 200 78 165 Q 85 145 100 142 Q 115 145 122 165 Q 130 200 120 240 Z"
        fill={C.scale}
        stroke={C.ink}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* paint-flecked apron */}
      <path
        d="M 82 165 Q 82 220 88 240 L 112 240 Q 118 220 118 165 Q 100 175 82 165 Z"
        fill="#1A1A1F"
        stroke={C.ink}
        strokeWidth="1.5"
      />
      {/* paint flecks on apron */}
      <circle cx="90" cy="180" r="2" fill="#F472B6" />
      <circle cx="105" cy="195" r="1.5" fill="#FBBF24" />
      <circle cx="113" cy="210" r="2" fill="#67E8F9" />
      <circle cx="92" cy="220" r="1.5" fill="#A78BFA" />
      <circle cx="100" cy="225" r="1" fill="#FB7185" />
      {/* apron strap */}
      <path d="M 92 145 Q 100 142 108 145" fill="none" stroke={C.ink} strokeWidth="1.5" />
      {/* head */}
      <ellipse cx="100" cy="130" rx="30" ry="26" fill={C.scale} stroke={C.ink} strokeWidth="2" />
      {/* snout */}
      <path d="M 125 130 Q 158 132 168 145 Q 168 155 162 158 L 125 145 Z" fill={C.scale} stroke={C.ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 128 148 L 132 153 L 136 148 L 140 153 L 144 148 L 148 153 L 152 148 L 156 153 L 160 148 L 164 153" fill={C.scale} stroke={C.ink} strokeWidth="1.1" />
      <circle cx="166" cy="139" r="1.5" fill={C.ink} />
      {/* eye */}
      <circle cx="108" cy="125" r="3" fill={C.ink} />
      <circle cx="109" cy="124" r="1" fill={C.eyeWhite} />
      {/* OVERSIZED HEADPHONES */}
      <g>
        {/* band */}
        <path d="M 72 105 Q 100 75 128 105" fill="none" stroke={C.ink} strokeWidth="4" strokeLinecap="round" />
        {/* left cup */}
        <circle cx="72" cy="115" r="14" fill={accent} stroke={C.ink} strokeWidth="2.5" />
        <circle cx="72" cy="115" r="8" fill={C.inkSoft} />
        {/* cable curling */}
        <path d="M 70 128 Q 60 145 70 160 Q 80 175 75 195" fill="none" stroke={C.ink} strokeWidth="2" />
      </g>
      {/* claw holding stylus + palette */}
      <ellipse cx="125" cy="200" rx="10" ry="7" fill={C.scale} stroke={C.ink} strokeWidth="1.5" />
      {/* PALETTE */}
      <g transform="translate(135 175)">
        <path
          d="M 0 15 Q 0 0 18 0 Q 36 0 36 15 Q 30 22 22 22 Q 14 22 14 28 Q 14 35 6 35 Q 0 30 0 15 Z"
          fill={C.scale}
          stroke={C.ink}
          strokeWidth="2"
        />
        <circle cx="8" cy="10" r="2.5" fill="#F472B6" />
        <circle cx="20" cy="6" r="2.5" fill="#67E8F9" />
        <circle cx="28" cy="14" r="2.5" fill="#FBBF24" />
        <circle cx="14" cy="18" r="2.5" fill="#A78BFA" />
      </g>
      {/* STYLUS in other claw position */}
      <g transform="translate(118 138) rotate(-30)">
        <rect x="-2" y="0" width="4" height="22" fill={accent} stroke={C.ink} strokeWidth="1.5" />
        <polygon points="-2,0 2,0 0,-5" fill={C.inkSoft} stroke={C.ink} strokeWidth="1" />
      </g>
    </svg>
  );
}

// =============================================================================
// 5. ANALYST — stiff formal croc, rolled sleeves, tie, glasses, between monitors
// =============================================================================
export function AnalystCroc({ accent = '#A78BFA', className, style }: CrocProps) {
  return (
    <svg viewBox="0 0 200 250" className={className} style={style} role="img" aria-label="Analyst croc">
      <defs>
        <radialGradient id="an-light" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.25" />
          <stop offset="70%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="200" height="250" fill="url(#an-light)" />
      {/* monitors flanking */}
      <g>
        <rect x="6" y="60" width="46" height="80" fill="#0E1024" stroke={C.ink} strokeWidth="2" rx="2" />
        <rect x="148" y="60" width="46" height="80" fill="#0E1024" stroke={C.ink} strokeWidth="2" rx="2" />
        {/* chart lines on monitors */}
        <polyline points="10,125 18,110 26,118 34,100 42,108 48,90" fill="none" stroke={accent} strokeWidth="2" />
        <polyline points="152,125 160,108 168,114 176,100 184,90 192,80" fill="none" stroke={accent} strokeWidth="2" />
        {/* bar chart hint */}
        <rect x="12" y="75" width="4" height="20" fill={accent} opacity="0.5" />
        <rect x="18" y="70" width="4" height="25" fill={accent} opacity="0.5" />
        <rect x="24" y="80" width="4" height="15" fill={accent} opacity="0.5" />
        <rect x="158" y="75" width="4" height="18" fill={accent} opacity="0.5" />
        <rect x="164" y="68" width="4" height="25" fill={accent} opacity="0.5" />
        <rect x="170" y="78" width="4" height="15" fill={accent} opacity="0.5" />
        {/* monitor stand */}
        <rect x="24" y="140" width="10" height="8" fill={C.inkSoft} stroke={C.ink} strokeWidth="1" />
        <rect x="166" y="140" width="10" height="8" fill={C.inkSoft} stroke={C.ink} strokeWidth="1" />
      </g>
      {/* desk */}
      <rect x="0" y="210" width="200" height="40" fill="#3A2818" stroke={C.ink} strokeWidth="1.5" />
      {/* body */}
      <path
        d="M 75 210 Q 70 175 78 155 Q 88 142 100 140 Q 112 142 122 155 Q 130 175 125 210 Z"
        fill={C.scale}
        stroke={C.ink}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* dress shirt — white */}
      <path
        d="M 78 160 Q 78 200 82 215 L 118 215 Q 122 200 122 160 Q 100 168 78 160 Z"
        fill="#FAFAF6"
        stroke={C.ink}
        strokeWidth="1.5"
      />
      {/* TIE — loosened */}
      <g>
        <path d="M 95 158 L 100 165 L 105 158" fill={accent} stroke={C.ink} strokeWidth="1.3" />
        <path d="M 95 165 L 96 175 L 100 200 L 104 175 L 105 165 Z" fill={accent} stroke={C.ink} strokeWidth="1.3" />
      </g>
      {/* sleeves rolled — color stripe */}
      <rect x="73" y="180" width="10" height="14" fill={C.scale} stroke={C.ink} strokeWidth="1.2" />
      <rect x="117" y="180" width="10" height="14" fill={C.scale} stroke={C.ink} strokeWidth="1.2" />
      {/* head — stiff upright */}
      <ellipse cx="100" cy="125" rx="28" ry="25" fill={C.scale} stroke={C.ink} strokeWidth="2" />
      <path d="M 126 125 Q 158 127 168 138 Q 168 148 162 151 L 126 142 Z" fill={C.scale} stroke={C.ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 128 142 L 132 146 L 136 142 L 140 146 L 144 142 L 148 146 L 152 142 L 156 146 L 160 142 L 164 146" fill={C.scale} stroke={C.ink} strokeWidth="1.1" />
      <circle cx="166" cy="132" r="1.5" fill={C.ink} />
      {/* glasses */}
      <g stroke={C.ink} strokeWidth="2.2" fill="none">
        <rect x="135" y="128" width="14" height="10" rx="1" />
        <rect x="151" y="128" width="14" height="10" rx="1" />
        <line x1="149" y1="133" x2="151" y2="133" />
      </g>
      <rect x="135" y="128" width="14" height="10" rx="1" fill={accent} opacity="0.18" />
      <rect x="151" y="128" width="14" height="10" rx="1" fill={accent} opacity="0.18" />
      {/* eye behind glasses */}
      <circle cx="142" cy="133" r="2" fill={C.ink} />
      {/* coffee mug */}
      <g transform="translate(60 195)">
        <rect x="0" y="0" width="14" height="14" fill="#5B7A30" stroke={C.ink} strokeWidth="1.3" rx="1" />
        <path d="M 14 4 Q 20 4 20 8 Q 20 12 14 12" fill="none" stroke={C.ink} strokeWidth="1.3" />
      </g>
    </svg>
  );
}

// =============================================================================
// 6. CODER — lanky hunched croc, huge hipster glasses, hoodie, keyboard
// =============================================================================
export function CoderCroc({ accent = '#4ADE80', className, style }: CrocProps) {
  return (
    <svg viewBox="0 0 200 250" className={className} style={style} role="img" aria-label="Coder croc">
      <defs>
        <radialGradient id="cd-light" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
          <stop offset="70%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="150" rx="80" ry="70" fill="url(#cd-light)" />
      {/* desk */}
      <rect x="0" y="210" width="200" height="40" fill="#1A1A24" stroke={C.ink} strokeWidth="1.5" />
      {/* monitor glow rectangle behind head */}
      <rect x="20" y="40" width="160" height="80" fill="#0A1A0F" stroke={accent} strokeWidth="1.5" rx="2" opacity="0.7" />
      {/* monospace green text on screen */}
      <g fontFamily="monospace" fontSize="6" fill={accent} opacity="0.85">
        <text x="28" y="56">{`> npm run dev`}</text>
        <text x="28" y="68">{`✓ ready in 348ms`}</text>
        <text x="28" y="80">{`GET / 200 in 12ms`}</text>
        <text x="28" y="92">{`GET /api/v1 200`}</text>
        <text x="28" y="104">{`_`}</text>
      </g>
      {/* keyboard */}
      <g>
        <rect x="50" y="200" width="100" height="14" fill="#1A1A1F" stroke={C.ink} strokeWidth="1.5" rx="1" />
        {Array.from({ length: 10 }).map((_, i) => (
          <rect key={i} x={54 + i * 9.5} y="203" width="7" height="3" fill="#3A3A45" />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <rect key={i + 10} x={54 + i * 9.5} y="208" width="7" height="3" fill="#3A3A45" />
        ))}
      </g>
      {/* body — lanky hunched forward */}
      <path
        d="M 70 200 Q 60 160 75 145 Q 90 138 110 142 Q 130 148 135 175 Q 138 195 130 205 L 80 205 Z"
        fill={C.scale}
        stroke={C.ink}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* hoodie body */}
      <path
        d="M 72 165 Q 65 200 78 205 L 130 205 Q 138 200 135 165 Q 110 175 72 165 Z"
        fill="#2B5F35"
        stroke={C.ink}
        strokeWidth="1.6"
      />
      {/* hoodie front pocket */}
      <rect x="88" y="180" width="28" height="14" fill="none" stroke={C.ink} strokeWidth="1.2" rx="1" opacity="0.5" />
      {/* hoodie hood behind head */}
      <path
        d="M 70 115 Q 65 140 85 145 Q 100 130 115 145 Q 135 140 130 115 Q 100 100 70 115 Z"
        fill="#2B5F35"
        stroke={C.ink}
        strokeWidth="1.8"
      />
      {/* green LED clipped to hoodie */}
      <circle cx="80" cy="180" r="2" fill={accent} stroke={C.ink} strokeWidth="0.8" />
      <circle cx="80" cy="180" r="3.5" fill={accent} opacity="0.4" />
      {/* head — hunched */}
      <ellipse cx="100" cy="125" rx="28" ry="24" fill={C.scale} stroke={C.ink} strokeWidth="2" />
      {/* snout */}
      <path d="M 122 125 Q 152 127 162 138 Q 162 148 156 150 L 122 140 Z" fill={C.scale} stroke={C.ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 124 140 L 128 144 L 132 140 L 136 144 L 140 140 L 144 144 L 148 140 L 152 144 L 156 140" fill={C.scale} stroke={C.ink} strokeWidth="1.1" />
      <circle cx="158" cy="132" r="1.5" fill={C.ink} />
      {/* HUGE HIPSTER GLASSES */}
      <g stroke={C.ink} strokeWidth="3" fill="none">
        <circle cx="130" cy="130" r="14" />
        <circle cx="148" cy="130" r="14" />
        <line x1="144" y1="130" x2="148" y2="130" />
      </g>
      <circle cx="130" cy="130" r="13" fill={accent} opacity="0.15" />
      <circle cx="148" cy="130" r="13" fill={accent} opacity="0.15" />
      {/* terminal text reflected in lens */}
      <text x="124" y="128" fontFamily="monospace" fontSize="3.5" fill={accent} opacity="0.8">{'{}'}</text>
      <text x="144" y="128" fontFamily="monospace" fontSize="3.5" fill={accent} opacity="0.8">{`=>`}</text>
      {/* eye behind glasses */}
      <circle cx="130" cy="130" r="2.5" fill={C.ink} />
    </svg>
  );
}

// =============================================================================
// 7. OPS — boxy formal suit croc, tie, at copy machine
// =============================================================================
export function OpsCroc({ accent = '#22D3EE', className, style }: CrocProps) {
  return (
    <svg viewBox="0 0 200 250" className={className} style={style} role="img" aria-label="Ops croc">
      <defs>
        <radialGradient id="op-light" cx="80%" cy="50%" r="60%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
          <stop offset="70%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="200" height="250" fill="url(#op-light)" />
      {/* floor */}
      <line x1="0" y1="240" x2="200" y2="240" stroke={C.ink} strokeWidth="1.5" />
      {/* copy machine on the right */}
      <g>
        <rect x="135" y="120" width="60" height="110" fill="#3A3A45" stroke={C.ink} strokeWidth="2" rx="2" />
        <rect x="140" y="125" width="50" height="20" fill={accent} stroke={C.ink} strokeWidth="1.2" opacity="0.85" />
        <rect x="140" y="150" width="50" height="6" fill="#1A1A24" />
        <rect x="140" y="160" width="50" height="6" fill="#1A1A24" />
        {/* paper sticking out */}
        <rect x="148" y="155" width="34" height="20" fill="#FAFAF6" stroke={C.ink} strokeWidth="1.2" />
        <line x1="152" y1="162" x2="178" y2="162" stroke={C.inkSoft} strokeWidth="0.6" />
        <line x1="152" y1="167" x2="170" y2="167" stroke={C.inkSoft} strokeWidth="0.6" />
        {/* buttons */}
        <circle cx="155" cy="180" r="2" fill={accent} />
        <circle cx="165" cy="180" r="2" fill={C.ink} />
        <circle cx="175" cy="180" r="2" fill={C.ink} />
      </g>
      {/* paper confetti drifting */}
      <rect x="115" y="60" width="8" height="10" fill="#FAFAF6" stroke={C.ink} strokeWidth="0.8" transform="rotate(20 119 65)" />
      <rect x="100" y="50" width="6" height="8" fill="#FAFAF6" stroke={C.ink} strokeWidth="0.8" transform="rotate(-15 103 54)" />
      <rect x="80" y="70" width="5" height="7" fill="#FAFAF6" stroke={C.ink} strokeWidth="0.8" transform="rotate(8 82 73)" />
      {/* body — boxy/square */}
      <rect x="65" y="150" width="60" height="90" fill={C.scale} stroke={C.ink} strokeWidth="2" rx="3" />
      {/* navy suit jacket */}
      <path
        d="M 65 158 Q 65 230 75 240 L 95 240 L 100 200 L 105 240 L 115 240 Q 125 230 125 158 Q 95 168 65 158 Z"
        fill="#1F2C4A"
        stroke={C.ink}
        strokeWidth="1.6"
      />
      {/* white shirt V */}
      <path d="M 92 165 L 100 195 L 108 165 Z" fill="#FAFAF6" stroke={C.ink} strokeWidth="1.5" />
      {/* CYAN TIE */}
      <path d="M 96 168 L 100 178 L 104 168" fill={accent} stroke={C.ink} strokeWidth="1.3" />
      <path d="M 96 178 L 97 195 L 100 215 L 103 195 L 104 178 Z" fill={accent} stroke={C.ink} strokeWidth="1.3" />
      {/* head — squarish */}
      <rect x="73" y="105" width="54" height="48" fill={C.scale} stroke={C.ink} strokeWidth="2" rx="6" />
      {/* snout */}
      <path d="M 125 125 Q 155 127 165 140 Q 165 150 159 152 L 125 145 Z" fill={C.scale} stroke={C.ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 127 142 L 131 146 L 135 142 L 139 146 L 143 142 L 147 146 L 151 142 L 155 146 L 159 142" fill={C.scale} stroke={C.ink} strokeWidth="1.1" />
      <circle cx="161" cy="134" r="1.5" fill={C.ink} />
      {/* serious eye */}
      <circle cx="105" cy="130" r="2.8" fill={C.ink} />
      <circle cx="106" cy="129" r="0.9" fill={C.eyeWhite} />
      {/* eyebrow — serious */}
      <line x1="98" y1="120" x2="112" y2="122" stroke={C.ink} strokeWidth="2.2" strokeLinecap="round" />
      {/* paper in claw */}
      <ellipse cx="58" cy="195" rx="10" ry="6" fill={C.scale} stroke={C.ink} strokeWidth="1.5" />
      <rect x="38" y="180" width="22" height="28" fill="#FAFAF6" stroke={C.ink} strokeWidth="1.5" transform="rotate(-8 49 194)" />
      <line x1="41" y1="186" x2="56" y2="186" stroke={C.inkSoft} strokeWidth="0.6" transform="rotate(-8 49 194)" />
      <line x1="41" y1="192" x2="56" y2="192" stroke={C.inkSoft} strokeWidth="0.6" transform="rotate(-8 49 194)" />
    </svg>
  );
}

// =============================================================================
// 8. SUPERVISOR — dignified, conductor pose, baton raised, half-glasses, headset
// =============================================================================
export function SupervisorCroc({ accent = '#22C55E', className, style }: CrocProps) {
  return (
    <svg viewBox="0 0 200 250" className={className} style={style} role="img" aria-label="Supervisor croc">
      <defs>
        <radialGradient id="su-light" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
          <stop offset="70%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="100" rx="90" ry="80" fill="url(#su-light)" />
      {/* 5 small monitor screens floating behind */}
      <g>
        <rect x="14" y="35" width="34" height="22" fill="#0E1024" stroke={accent} strokeWidth="1.3" rx="1" />
        <rect x="14" y="60" width="34" height="22" fill="#0E1024" stroke="#67E8F9" strokeWidth="1.3" rx="1" />
        <rect x="14" y="85" width="34" height="22" fill="#0E1024" stroke="#FB7185" strokeWidth="1.3" rx="1" />
        <rect x="152" y="35" width="34" height="22" fill="#0E1024" stroke="#FBBF24" strokeWidth="1.3" rx="1" />
        <rect x="152" y="60" width="34" height="22" fill="#0E1024" stroke="#A78BFA" strokeWidth="1.3" rx="1" />
        <rect x="152" y="85" width="34" height="22" fill="#0E1024" stroke="#F472B6" strokeWidth="1.3" rx="1" />
        {/* screen content hints */}
        <line x1="18" y1="46" x2="44" y2="46" stroke={accent} strokeWidth="0.8" opacity="0.7" />
        <line x1="18" y1="50" x2="40" y2="50" stroke={accent} strokeWidth="0.8" opacity="0.5" />
        <line x1="156" y1="46" x2="182" y2="46" stroke="#FBBF24" strokeWidth="0.8" opacity="0.7" />
        <line x1="156" y1="71" x2="178" y2="71" stroke="#A78BFA" strokeWidth="0.8" opacity="0.7" />
      </g>
      {/* floor */}
      <line x1="0" y1="240" x2="200" y2="240" stroke={C.ink} strokeWidth="1.5" />
      {/* body — dignified standing */}
      <path
        d="M 80 240 Q 75 200 78 165 Q 84 145 100 142 Q 116 145 122 165 Q 125 200 120 240 Z"
        fill={C.scale}
        stroke={C.ink}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* cardigan over button-up */}
      <path
        d="M 80 165 Q 80 230 88 240 L 112 240 Q 120 230 120 165 Q 100 175 80 165 Z"
        fill="#3A2818"
        stroke={C.ink}
        strokeWidth="1.6"
      />
      {/* button-up V */}
      <path d="M 92 165 L 100 195 L 108 165 Z" fill="#FAFAF6" stroke={C.ink} strokeWidth="1.5" />
      {/* cardigan buttons */}
      <circle cx="100" cy="190" r="1.6" fill={C.ink} />
      <circle cx="100" cy="205" r="1.6" fill={C.ink} />
      <circle cx="100" cy="220" r="1.6" fill={C.ink} />
      {/* head — slightly raised */}
      <ellipse cx="100" cy="130" rx="28" ry="25" fill={C.scale} stroke={C.ink} strokeWidth="2" />
      {/* snout */}
      <path d="M 126 130 Q 160 132 170 142 Q 170 152 164 154 L 126 146 Z" fill={C.scale} stroke={C.ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 128 146 L 132 150 L 136 146 L 140 150 L 144 146 L 148 150 L 152 146 L 156 150 L 160 146 L 164 150" fill={C.scale} stroke={C.ink} strokeWidth="1.1" />
      <circle cx="166" cy="136" r="1.5" fill={C.ink} />
      {/* HALF-GLASSES — only on the bottom of the eye area */}
      <g stroke={C.ink} strokeWidth="2.2" fill="none">
        <path d="M 102 138 Q 112 142 122 138" />
        <path d="M 130 138 Q 140 142 150 138" />
        <line x1="122" y1="138" x2="130" y2="138" />
      </g>
      {/* eye */}
      <circle cx="112" cy="128" r="2.8" fill={C.ink} />
      <circle cx="113" cy="127" r="1" fill={C.eyeWhite} />
      {/* DIRECTOR'S HEADSET — single-ear */}
      <g>
        <path d="M 72 100 Q 100 70 130 102" fill="none" stroke={C.ink} strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="72" cy="102" r="10" fill={C.inkSoft} stroke={C.ink} strokeWidth="2" />
        <circle cx="72" cy="102" r="5" fill={accent} />
        {/* small green LED on headset */}
        <circle cx="76" cy="92" r="2" fill={accent} />
        <circle cx="76" cy="92" r="3.5" fill={accent} opacity="0.4" />
      </g>
      {/* RAISED ARM with CONDUCTOR BATON */}
      <path
        d="M 122 160 Q 145 130 160 105 Q 162 95 156 90"
        fill={C.scale}
        stroke={C.ink}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <ellipse cx="158" cy="92" rx="6" ry="4" fill={C.scale} stroke={C.ink} strokeWidth="1.5" transform="rotate(-30 158 92)" />
      {/* baton */}
      <g transform="rotate(-30 158 92)">
        <line x1="158" y1="60" x2="160" y2="92" stroke={C.scale} strokeWidth="3" />
        <line x1="158" y1="60" x2="160" y2="92" stroke={C.ink} strokeWidth="1.5" />
        <circle cx="160" cy="92" r="3" fill={C.ink} />
      </g>
      {/* clipboard tucked under other arm */}
      <g transform="translate(58 175) rotate(-8)">
        <rect x="0" y="0" width="18" height="24" fill="#FAFAF6" stroke={C.ink} strokeWidth="1.5" />
        <rect x="6" y="-3" width="6" height="5" fill="#A88040" stroke={C.ink} strokeWidth="1" />
        <line x1="3" y1="6" x2="15" y2="6" stroke={C.inkSoft} strokeWidth="0.6" />
        <line x1="3" y1="10" x2="15" y2="10" stroke={C.inkSoft} strokeWidth="0.6" />
        <line x1="3" y1="14" x2="13" y2="14" stroke={C.inkSoft} strokeWidth="0.6" />
      </g>
    </svg>
  );
}

// =============================================================================
// 9. BROWSER — noir reclined croc, fedora, pipe, leather chair
// =============================================================================
export function BrowserCroc({ accent = '#67E8F9', className, style }: CrocProps) {
  return (
    <svg viewBox="0 0 200 250" className={className} style={style} role="img" aria-label="Browser croc">
      <defs>
        <radialGradient id="br-light" cx="30%" cy="20%" r="60%">
          <stop offset="0%" stopColor="#94E5BC" stopOpacity="0.4" />
          <stop offset="70%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="50" rx="80" ry="60" fill="url(#br-light)" />
      {/* banker's lamp */}
      <g transform="translate(150 40)">
        <ellipse cx="0" cy="0" rx="22" ry="10" fill="#1F4A2C" stroke={C.ink} strokeWidth="1.5" />
        <line x1="0" y1="10" x2="0" y2="60" stroke={C.ink} strokeWidth="3" />
        <ellipse cx="0" cy="60" rx="10" ry="3" fill="#3A2818" stroke={C.ink} strokeWidth="1.3" />
        {/* lamp glow */}
        <ellipse cx="0" cy="10" rx="22" ry="6" fill="#94E5BC" opacity="0.6" />
      </g>
      {/* floor */}
      <line x1="0" y1="240" x2="200" y2="240" stroke={C.ink} strokeWidth="1.5" />
      {/* armchair back */}
      <path
        d="M 30 130 Q 25 95 60 90 L 110 90 Q 130 95 130 130 L 130 220 L 30 220 Z"
        fill="#7A3030"
        stroke={C.ink}
        strokeWidth="2"
      />
      {/* chair button tufts */}
      <circle cx="55" cy="120" r="2" fill={C.ink} />
      <circle cx="80" cy="120" r="2" fill={C.ink} />
      <circle cx="105" cy="120" r="2" fill={C.ink} />
      <circle cx="55" cy="150" r="2" fill={C.ink} />
      <circle cx="80" cy="150" r="2" fill={C.ink} />
      <circle cx="105" cy="150" r="2" fill={C.ink} />
      {/* chair seat */}
      <rect x="25" y="220" width="110" height="20" fill="#5A2020" stroke={C.ink} strokeWidth="2" />
      {/* tail draped out */}
      <path d="M 130 220 Q 150 215 165 225 Q 145 225 130 230 Z" fill={C.scale} stroke={C.ink} strokeWidth="1.8" />
      {/* body — reclined back */}
      <path
        d="M 50 220 Q 45 175 60 155 Q 80 145 105 155 Q 120 175 115 220 Z"
        fill={C.scale}
        stroke={C.ink}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* PINSTRIPE VEST */}
      <path
        d="M 55 168 Q 55 215 65 220 L 100 220 Q 110 215 110 168 Q 82 175 55 168 Z"
        fill="#1A1A24"
        stroke={C.ink}
        strokeWidth="1.6"
      />
      {/* pinstripes */}
      {[63, 70, 77, 84, 91, 98].map((x) => (
        <line key={x} x1={x} y1="175" x2={x} y2="218" stroke={accent} strokeWidth="0.6" opacity="0.6" />
      ))}
      {/* shirt collar */}
      <path d="M 75 168 L 82 178 L 89 168 Z" fill="#FAFAF6" stroke={C.ink} strokeWidth="1.3" />
      {/* leather case file on lap */}
      <rect x="30" y="200" width="50" height="18" fill="#5A4030" stroke={C.ink} strokeWidth="1.5" rx="1" />
      <rect x="32" y="205" width="46" height="10" fill="#FAFAF6" stroke={C.ink} strokeWidth="1" />
      {/* head — tilted back slightly */}
      <ellipse cx="82" cy="125" rx="28" ry="25" fill={C.scale} stroke={C.ink} strokeWidth="2" transform="rotate(-5 82 125)" />
      {/* snout */}
      <path d="M 108 130 Q 138 130 148 138 Q 148 148 142 150 L 108 142 Z" fill={C.scale} stroke={C.ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 110 142 L 114 146 L 118 142 L 122 146 L 126 142 L 130 146 L 134 142 L 138 146 L 142 142" fill={C.scale} stroke={C.ink} strokeWidth="1.1" />
      <circle cx="144" cy="132" r="1.5" fill={C.ink} />
      {/* eye — half lidded (mysterious) */}
      <path d="M 90 122 Q 96 125 102 122" fill="none" stroke={C.ink} strokeWidth="2.5" strokeLinecap="round" />
      {/* FEDORA */}
      <g>
        <path
          d="M 50 105 L 110 105 Q 115 105 113 110 L 50 110 Q 48 105 50 105 Z"
          fill="#1A1A1F"
          stroke={C.ink}
          strokeWidth="2"
        />
        <path
          d="M 60 90 Q 65 75 82 73 Q 102 75 105 90 Q 105 105 100 105 L 65 105 Q 60 105 60 90 Z"
          fill="#1A1A1F"
          stroke={C.ink}
          strokeWidth="2"
        />
        {/* hat band */}
        <rect x="60" y="98" width="45" height="4" fill={accent} opacity="0.7" />
      </g>
      {/* BRIAR PIPE */}
      <g transform="translate(135 140) rotate(15)">
        <ellipse cx="0" cy="0" rx="6" ry="4" fill="#5A2A0A" stroke={C.ink} strokeWidth="1.3" />
        <rect x="-4" y="2" width="14" height="3" fill="#3A1A0A" stroke={C.ink} strokeWidth="1.2" />
        {/* smoke wisp */}
        <path d="M 0 -4 Q 2 -8 0 -12 Q -2 -16 0 -20" fill="none" stroke="#94E5BC" strokeWidth="1.5" opacity="0.6" />
      </g>
    </svg>
  );
}

// =============================================================================
// Registry — map agent slug to character component
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
