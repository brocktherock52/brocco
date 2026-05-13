'use client';

import type { CSSProperties } from 'react';

// CustomCroc — deterministic SVG composer for user-created agents.
//
// The wizard at /app/agents/new lets the user pick a croc base + an
// accent color + an accessory slot. CustomCroc reads that descriptor
// (stored on the CustomAgent.crocBase + .accent fields plus a new
// .croc.accessory field) and renders the croc with the accessory
// layered on top.
//
// Why deterministic (no AI image-gen at render-time):
//   - zero latency, zero cost, works offline
//   - identical render across devices for a given descriptor
//   - users can iterate in the wizard without API calls
// The trade-off: 6 stock accessories vs unlimited AI options. We use AI
// for the *built-in* cast (cast-v6 PNGs); users get the composer.

export type AccessoryId =
  | 'glasses'
  | 'beret'
  | 'headset'
  | 'crown'
  | 'fedora'
  | 'bow_tie'
  | 'none';

export const ACCESSORIES: Array<{ id: AccessoryId; label: string }> = [
  { id: 'none', label: 'no accessory' },
  { id: 'glasses', label: 'wire glasses' },
  { id: 'beret', label: 'artist beret' },
  { id: 'headset', label: 'headset' },
  { id: 'crown', label: 'gold crown' },
  { id: 'fedora', label: 'detective fedora' },
  { id: 'bow_tie', label: 'cyan bow tie' },
];

interface CustomCrocProps {
  /** body color of the croc, default brocco cream */
  accent?: string;
  /** which accessory to layer on top */
  accessory?: AccessoryId;
  className?: string;
  style?: CSSProperties;
}

const COLORS = {
  body: '#FAFAF6',
  ink: '#0A0A0F',
  blush: '#FFB8BE',
  eyeWhite: '#FFFFFF',
};

// The official logomark path, scaled and translated into a 200x250
// component viewport (same convention as cast-croc-characters).
const LOGO_TRANSFORM = 'translate(4 110) scale(3)';
const EYE_CX = 160;
const EYE_CY = 167;
const HEAD_TOP_X = 100;
const HEAD_TOP_Y = 158;

export function CustomCroc({
  accent = '#67E8F9',
  accessory = 'none',
  className,
  style,
}: CustomCrocProps) {
  return (
    <svg
      viewBox="0 0 200 250"
      className={className}
      style={style}
      role="img"
      aria-label="Custom brocco croc"
    >
      {/* accent halo */}
      <ellipse cx="100" cy="150" rx="90" ry="70" fill={accent} opacity="0.14" />

      {/* shared base logo body */}
      <g transform={LOGO_TRANSFORM}>
        <ellipse cx="32" cy="32" rx="28" ry="1.5" fill={COLORS.ink} opacity="0.15" />
        <path
          d="M 2 22 L 4 24 Q 1 28 5 28 L 10 26 L 16 25 L 20 25 L 20 30 L 18 30 L 18 24.5 L 26 24 L 32 24 L 32 30 L 30 30 L 30 24 L 36 24 L 42 24.5 L 48 25.5 L 56 26.5 L 62 27 L 62 25 L 58 25 L 58 23 L 62 23 L 62 21 L 56 19 L 50 18 L 46 17 L 40 16 L 38 13 L 36 16 L 32 16 L 30 12 L 28 16 L 24 16 L 22 13 L 20 16 L 16 17 L 12 19 L 8 20 Z"
          fill={COLORS.body}
          stroke={COLORS.ink}
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
        <ellipse cx="46" cy="22" rx="2.2" ry="1.2" fill={COLORS.blush} opacity="0.85" />
        <circle cx="52" cy="19" r="1.5" fill={COLORS.ink} />
        <circle cx="52.4" cy="18.5" r="0.5" fill={COLORS.eyeWhite} />
        <path
          d="M 59 24 L 60 24.7 L 61 24 Z"
          fill={COLORS.eyeWhite}
          stroke={COLORS.ink}
          strokeWidth="0.3"
        />
      </g>

      {/* accessory layer */}
      <Accessory id={accessory} accent={accent} />
    </svg>
  );
}

function Accessory({ id, accent }: { id: AccessoryId; accent: string }) {
  switch (id) {
    case 'glasses':
      return (
        <g stroke={COLORS.ink} strokeWidth="2.5" fill="none">
          <circle cx={EYE_CX} cy={EYE_CY} r="11" />
          <circle cx={EYE_CX + 22} cy={EYE_CY} r="11" />
          <line x1={EYE_CX + 11} y1={EYE_CY} x2={EYE_CX + 11} y2={EYE_CY} />
          <circle cx={EYE_CX} cy={EYE_CY} r="10" fill={accent} opacity="0.2" stroke="none" />
          <circle cx={EYE_CX + 22} cy={EYE_CY} r="10" fill={accent} opacity="0.2" stroke="none" />
        </g>
      );
    case 'beret':
      return (
        <g>
          <ellipse
            cx={HEAD_TOP_X + 4}
            cy={HEAD_TOP_Y - 6}
            rx="22"
            ry="6"
            fill={accent}
            stroke={COLORS.ink}
            strokeWidth="2"
          />
          <ellipse
            cx={HEAD_TOP_X + 4}
            cy={HEAD_TOP_Y - 10}
            rx="18"
            ry="9"
            fill={accent}
            stroke={COLORS.ink}
            strokeWidth="2"
          />
          <circle
            cx={HEAD_TOP_X + 20}
            cy={HEAD_TOP_Y - 18}
            r="3"
            fill={accent}
            stroke={COLORS.ink}
            strokeWidth="1.5"
          />
        </g>
      );
    case 'headset':
      return (
        <g>
          <path
            d={`M ${HEAD_TOP_X - 22} ${HEAD_TOP_Y - 5} Q ${HEAD_TOP_X + 5} ${HEAD_TOP_Y - 26} ${HEAD_TOP_X + 32} ${HEAD_TOP_Y - 5}`}
            fill="none"
            stroke={COLORS.ink}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx={HEAD_TOP_X - 22} cy={HEAD_TOP_Y - 5} r="8" fill="#2A2A2F" stroke={COLORS.ink} strokeWidth="2" />
          <circle cx={HEAD_TOP_X - 22} cy={HEAD_TOP_Y - 5} r="4" fill={accent} />
          <circle cx={HEAD_TOP_X + 32} cy={HEAD_TOP_Y - 5} r="8" fill="#2A2A2F" stroke={COLORS.ink} strokeWidth="2" />
          <circle cx={HEAD_TOP_X + 32} cy={HEAD_TOP_Y - 5} r="4" fill={accent} />
        </g>
      );
    case 'crown':
      return (
        <g>
          <path
            d={`M ${HEAD_TOP_X - 14} ${HEAD_TOP_Y - 4}
                L ${HEAD_TOP_X - 14} ${HEAD_TOP_Y - 20}
                L ${HEAD_TOP_X - 6}  ${HEAD_TOP_Y - 8}
                L ${HEAD_TOP_X}      ${HEAD_TOP_Y - 24}
                L ${HEAD_TOP_X + 6}  ${HEAD_TOP_Y - 8}
                L ${HEAD_TOP_X + 14} ${HEAD_TOP_Y - 20}
                L ${HEAD_TOP_X + 14} ${HEAD_TOP_Y - 4} Z`}
            fill={accent}
            stroke={COLORS.ink}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx={HEAD_TOP_X} cy={HEAD_TOP_Y - 12} r="2.5" fill={COLORS.eyeWhite} stroke={COLORS.ink} strokeWidth="1" />
        </g>
      );
    case 'fedora':
      return (
        <g>
          <path
            d={`M ${HEAD_TOP_X - 22} ${HEAD_TOP_Y - 4}
                L ${HEAD_TOP_X + 22} ${HEAD_TOP_Y - 4}
                Q ${HEAD_TOP_X + 26} ${HEAD_TOP_Y - 2} ${HEAD_TOP_X + 22} ${HEAD_TOP_Y}
                L ${HEAD_TOP_X - 22} ${HEAD_TOP_Y}
                Q ${HEAD_TOP_X - 26} ${HEAD_TOP_Y - 2} ${HEAD_TOP_X - 22} ${HEAD_TOP_Y - 4} Z`}
            fill="#1A1A1F"
            stroke={COLORS.ink}
            strokeWidth="1.8"
          />
          <path
            d={`M ${HEAD_TOP_X - 16} ${HEAD_TOP_Y - 4}
                Q ${HEAD_TOP_X - 14} ${HEAD_TOP_Y - 20} ${HEAD_TOP_X} ${HEAD_TOP_Y - 22}
                Q ${HEAD_TOP_X + 14} ${HEAD_TOP_Y - 20} ${HEAD_TOP_X + 16} ${HEAD_TOP_Y - 4} Z`}
            fill="#1A1A1F"
            stroke={COLORS.ink}
            strokeWidth="1.8"
          />
          <rect
            x={HEAD_TOP_X - 15}
            y={HEAD_TOP_Y - 8}
            width="30"
            height="3"
            fill={accent}
            opacity="0.9"
          />
        </g>
      );
    case 'bow_tie':
      return (
        <g transform={`translate(${EYE_CX - 4} ${EYE_CY + 18})`}>
          <path d="M -10 0 L -2 -4 L -2 4 Z" fill={accent} stroke={COLORS.ink} strokeWidth="1.4" />
          <path d="M 10 0 L 2 -4 L 2 4 Z" fill={accent} stroke={COLORS.ink} strokeWidth="1.4" />
          <circle cx="0" cy="0" r="2.5" fill={accent} stroke={COLORS.ink} strokeWidth="1.4" />
        </g>
      );
    case 'none':
    default:
      return null;
  }
}
