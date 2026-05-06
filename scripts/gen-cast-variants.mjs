#!/usr/bin/env node
// Generate 9 cast vignettes from the brand mark. Each agent gets a
// unique scene: per-accent radial glow + a large agent-specific glyph
// (book, marker, envelope, palette, chart, code, printer, baton,
// fedora) overlaid on the canvas, plus the brand-mark mascot in a
// distinctive pose. Output 1024x1024 jpgs to public/assets/cast/.

import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MARK = path.join(ROOT, 'public/assets/brocco-mark-transparent.png');
const OUT = path.join(ROOT, 'public/assets/cast');

const SIZE = 1024;
const MARK_W = 460;

// Per-agent: accent color + unique prop SVG path drawn at large scale
// so each card has a visually distinct hero element. Mark position
// + rotation also varies per agent.
const AGENTS = [
  {
    slug: 'researcher', accent: '#67E8F9',
    markX: 320, markY: 460, markRot: -4,
    propSvg: `
      <g transform="translate(512, 560) scale(1.6)" stroke="#67E8F9" stroke-width="6" fill="none" opacity="0.85">
        <path d="M -120 80 L -120 -80 L 0 -100 L 0 80 Z" fill="#0a1116" />
        <path d="M 0 -100 L 0 80 L 120 80 L 120 -80 Z" fill="#0a1116" />
        <line x1="-100" y1="-60" x2="-20" y2="-70" />
        <line x1="-100" y1="-30" x2="-20" y2="-40" />
        <line x1="-100" y1="0" x2="-20" y2="-10" />
        <line x1="-100" y1="30" x2="-20" y2="20" />
        <line x1="20" y1="-70" x2="100" y2="-60" />
        <line x1="20" y1="-40" x2="100" y2="-30" />
        <line x1="20" y1="-10" x2="100" y2="0" />
        <line x1="20" y1="20" x2="100" y2="30" />
      </g>
      <g transform="translate(370, 320) rotate(-12)" stroke="#67E8F9" stroke-width="5" fill="none" opacity="0.7">
        <circle cx="-30" cy="0" r="32" />
        <circle cx="30" cy="0" r="32" />
        <line x1="2" y1="0" x2="-2" y2="0" />
      </g>`,
  },
  {
    slug: 'planner', accent: '#FB7185',
    markX: 290, markY: 480, markRot: 3,
    propSvg: `
      <g transform="translate(512, 560) scale(1.6)" stroke="#FB7185" stroke-width="6" fill="none" opacity="0.85">
        <rect x="-180" y="-130" width="360" height="240" rx="12" fill="#0a1116" />
        <line x1="-160" y1="-90" x2="100" y2="-90" />
        <line x1="-160" y1="-50" x2="60" y2="-50" />
        <line x1="-160" y1="-10" x2="120" y2="-10" />
        <path d="M -160 30 L 80 30 L 80 70 L -160 70 Z" />
        <line x1="-50" y1="80" x2="0" y2="105" />
        <polygon points="0,105 -10,90 10,95" fill="#FB7185" />
      </g>`,
  },
  {
    slug: 'outreach', accent: '#FBBF24',
    markX: 310, markY: 470, markRot: -2,
    propSvg: `
      <g transform="translate(512, 560) scale(1.6)" stroke="#FBBF24" stroke-width="6" fill="none" opacity="0.85">
        <rect x="-150" y="-100" width="300" height="200" rx="6" fill="#0a1116" />
        <path d="M -150 -100 L 0 30 L 150 -100" />
        <path d="M -150 100 L -30 0" />
        <path d="M 150 100 L 30 0" />
      </g>
      <g transform="translate(420, 290) rotate(20)" stroke="#FBBF24" stroke-width="4" fill="none" opacity="0.6">
        <path d="M -60 0 L 60 0 L 50 -10 M 60 0 L 50 10" />
      </g>`,
  },
  {
    slug: 'designer', accent: '#F472B6',
    markX: 320, markY: 470, markRot: 4,
    propSvg: `
      <g transform="translate(512, 560) scale(1.6)" stroke="#F472B6" stroke-width="6" fill="none" opacity="0.85">
        <path d="M 0 -130 C 80 -130 150 -70 150 0 C 150 60 100 100 60 80 C 30 65 50 30 30 30 L -30 30 C -100 30 -150 -10 -150 -50 C -150 -100 -90 -130 0 -130 Z" fill="#0a1116" />
        <circle cx="-90" cy="-70" r="14" fill="#F472B6" />
        <circle cx="-30" cy="-100" r="14" fill="#67E8F9" />
        <circle cx="40" cy="-100" r="14" fill="#FBBF24" />
        <circle cx="100" cy="-50" r="14" fill="#A78BFA" />
      </g>`,
  },
  {
    slug: 'analyst', accent: '#A78BFA',
    markX: 310, markY: 470, markRot: 0,
    propSvg: `
      <g transform="translate(512, 560) scale(1.6)" stroke="#A78BFA" stroke-width="6" fill="none" opacity="0.85">
        <line x1="-180" y1="100" x2="180" y2="100" />
        <line x1="-180" y1="100" x2="-180" y2="-130" />
        <rect x="-150" y="40" width="40" height="60" fill="#0a1116" />
        <rect x="-90" y="-20" width="40" height="120" fill="#0a1116" />
        <rect x="-30" y="-80" width="40" height="180" fill="#A78BFA" fill-opacity="0.3" />
        <rect x="30" y="-40" width="40" height="140" fill="#0a1116" />
        <rect x="90" y="-110" width="40" height="210" fill="#A78BFA" fill-opacity="0.5" />
        <polyline points="-130,30 -70,-30 -10,-90 50,-50 110,-120 170,-100" stroke-width="4" stroke="#67E8F9" />
      </g>`,
  },
  {
    slug: 'coder', accent: '#4ADE80',
    markX: 310, markY: 470, markRot: -6,
    propSvg: `
      <g transform="translate(512, 560) scale(1.6)" stroke="#4ADE80" stroke-width="6" fill="none" opacity="0.85">
        <rect x="-180" y="-130" width="360" height="240" rx="14" fill="#0a1116" />
        <text x="-160" y="-80" fill="#4ADE80" font-family="JetBrains Mono, monospace" font-size="32" font-weight="500">{ </text>
        <text x="-110" y="-30" fill="#67E8F9" font-family="JetBrains Mono, monospace" font-size="22">"agent":</text>
        <text x="-110" y="10" fill="#FBBF24" font-family="JetBrains Mono, monospace" font-size="22">  "coder",</text>
        <text x="-110" y="50" fill="#67E8F9" font-family="JetBrains Mono, monospace" font-size="22">"step": 3</text>
        <text x="160" y="100" fill="#4ADE80" font-family="JetBrains Mono, monospace" font-size="32" font-weight="500"> }</text>
      </g>`,
  },
  {
    slug: 'ops', accent: '#22D3EE',
    markX: 310, markY: 470, markRot: 2,
    propSvg: `
      <g transform="translate(640, 380)" stroke="#22D3EE" stroke-width="6" fill="none" opacity="0.85">
        <rect x="-160" y="-100" width="320" height="200" rx="10" fill="#0a1116" />
        <rect x="-130" y="-70" width="260" height="60" fill="#22D3EE" fill-opacity="0.15" />
        <line x1="-140" y1="40" x2="140" y2="40" />
        <line x1="-100" y1="60" x2="100" y2="60" />
        <line x1="-80" y1="80" x2="80" y2="80" />
        <circle cx="120" cy="-80" r="6" fill="#22D3EE" />
        <circle cx="100" cy="-80" r="6" fill="#FB7185" />
      </g>`,
  },
  {
    slug: 'supervisor', accent: '#22C55E',
    markX: 310, markY: 470, markRot: 0,
    propSvg: `
      <g transform="translate(512, 560) scale(1.6)" stroke="#22C55E" stroke-width="6" fill="none" opacity="0.85">
        <circle cx="0" cy="0" r="160" stroke-dasharray="6 10" />
        <circle cx="0" cy="0" r="120" stroke-dasharray="3 7" stroke="#67E8F9" stroke-opacity="0.5" />
        <g fill="#22C55E">
          <circle cx="0" cy="-160" r="14" />
          <circle cx="113" cy="-113" r="14" />
          <circle cx="160" cy="0" r="14" />
          <circle cx="113" cy="113" r="14" />
          <circle cx="0" cy="160" r="14" />
          <circle cx="-113" cy="113" r="14" />
          <circle cx="-160" cy="0" r="14" />
          <circle cx="-113" cy="-113" r="14" />
        </g>
        <line x1="0" y1="0" x2="0" y2="-160" stroke-width="2" />
        <line x1="0" y1="0" x2="113" y2="-113" stroke-width="2" />
        <line x1="0" y1="0" x2="160" y2="0" stroke-width="2" />
        <circle cx="0" cy="0" r="20" fill="#22C55E" />
      </g>`,
  },
  {
    slug: 'browser', accent: '#67E8F9',
    markX: 310, markY: 480, markRot: -3,
    propSvg: `
      <g transform="translate(512, 560) scale(1.6)" stroke="#67E8F9" stroke-width="6" fill="none" opacity="0.85">
        <rect x="-180" y="-110" width="360" height="220" rx="14" fill="#0a1116" />
        <line x1="-180" y1="-60" x2="180" y2="-60" />
        <circle cx="-150" cy="-85" r="6" fill="#FB7185" />
        <circle cx="-125" cy="-85" r="6" fill="#FBBF24" />
        <circle cx="-100" cy="-85" r="6" fill="#22C55E" />
        <rect x="-150" y="-30" width="300" height="20" fill="#67E8F9" fill-opacity="0.15" />
        <line x1="-150" y1="20" x2="100" y2="20" />
        <line x1="-150" y1="50" x2="60" y2="50" />
        <line x1="-150" y1="80" x2="120" y2="80" />
      </g>`,
  },
];

function bgSvg(accent) {
  return `<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="40%" r="62%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.42" />
      <stop offset="35%" stop-color="${accent}" stop-opacity="0.18" />
      <stop offset="62%" stop-color="#7C3AED" stop-opacity="0.10" />
      <stop offset="100%" stop-color="#050807" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050807" />
      <stop offset="100%" stop-color="#0a1116" />
    </linearGradient>
    <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse">
      <path d="M 56 0 L 0 0 0 56" fill="none" stroke="rgba(255,255,255,0.045)" stroke-width="1" />
    </pattern>
    <radialGradient id="gridmask" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#fff" stop-opacity="1" />
      <stop offset="100%" stop-color="#fff" stop-opacity="0" />
    </radialGradient>
    <mask id="mask">
      <rect width="${SIZE}" height="${SIZE}" fill="url(#gridmask)" />
    </mask>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)" />
  <rect width="${SIZE}" height="${SIZE}" fill="url(#grid)" mask="url(#mask)" />
  <rect width="${SIZE}" height="${SIZE}" fill="url(#glow)" />
</svg>`;
}

function propAndFrameSvg(agent) {
  return `<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
  ${agent.propSvg}
  <rect x="40" y="40" width="${SIZE - 80}" height="${SIZE - 80}" rx="48" fill="none" stroke="${agent.accent}" stroke-opacity="0.22" stroke-width="2" />
  <rect x="40" y="40" width="${SIZE - 80}" height="${SIZE - 80}" rx="48" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
</svg>`;
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });

  for (const agent of AGENTS) {
    // Mascot intentionally excluded — these are placeholder dioramas
    // (prop + accent frame). User is generating real character art
    // separately and will drop into the same paths.
    const bg = Buffer.from(bgSvg(agent.accent));
    const propFrame = Buffer.from(propAndFrameSvg(agent));

    const outPath = path.join(OUT, `${agent.slug}-v3.jpg`);
    await sharp(bg)
      .composite([{ input: propFrame, top: 0, left: 0 }])
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(outPath);

    console.log(`wrote ${outPath}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
