#!/usr/bin/env node
// Generate 9 cast vignettes from the brand mark by compositing the
// white croc onto a dark-navy + accent-glow background. Each agent
// gets a unique accent color halo + small prop indicator. Output JPGs
// to public/assets/cast/<slug>.jpg.

import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MARK = path.join(ROOT, 'public/assets/brocco-mark-transparent.png');
const OUT = path.join(ROOT, 'public/assets/cast');

const SIZE = 1024;
const MARK_W = 540;

const AGENTS = [
  { slug: 'researcher', accent: '#67E8F9', prop: '\u{1F4D6}' },        // book
  { slug: 'planner',    accent: '#FB7185', prop: '\u{1F5C2}' },        // card index
  { slug: 'outreach',   accent: '#FBBF24', prop: '\u{2709}' },         // envelope
  { slug: 'designer',   accent: '#F472B6', prop: '\u{1F3A8}' },        // palette
  { slug: 'analyst',    accent: '#A78BFA', prop: '\u{1F4CA}' },        // bar chart
  { slug: 'coder',      accent: '#4ADE80', prop: '\u{1F4BB}' },        // laptop
  { slug: 'ops',        accent: '#22D3EE', prop: '\u{1F5A8}' },        // printer
  { slug: 'supervisor', accent: '#22C55E', prop: '\u{2728}' },         // sparkles
  { slug: 'browser',    accent: '#67E8F9', prop: '\u{1F3A9}' },        // top hat
];

function bgSvg(accent) {
  return `<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="38%" r="62%">
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
  <circle cx="${SIZE / 2}" cy="${SIZE / 2 - 30}" r="320" fill="none" stroke="${accent}" stroke-opacity="0.18" stroke-width="1.5" stroke-dasharray="3 7" />
  <circle cx="${SIZE / 2}" cy="${SIZE / 2 - 30}" r="380" fill="none" stroke="${accent}" stroke-opacity="0.10" stroke-width="1" stroke-dasharray="2 9" />
</svg>`;
}

function frameSvg(accent, slug) {
  return `<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect x="40" y="40" width="${SIZE - 80}" height="${SIZE - 80}" rx="48" fill="none" stroke="${accent}" stroke-opacity="0.22" stroke-width="2" />
  <rect x="40" y="40" width="${SIZE - 80}" height="${SIZE - 80}" rx="48" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
  <g transform="translate(${SIZE / 2}, ${SIZE - 110})">
    <rect x="-200" y="-32" width="400" height="56" rx="28" fill="rgba(5,8,10,0.65)" stroke="${accent}" stroke-opacity="0.3" stroke-width="1" />
    <text x="0" y="6" font-family="JetBrains Mono, monospace" font-size="22" font-weight="500" letter-spacing="3" fill="${accent}" text-anchor="middle">${slug.toUpperCase()}</text>
  </g>
</svg>`;
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });

  // Pre-load and resize the mark once
  const mark = await sharp(MARK)
    .resize({ width: MARK_W, height: MARK_W, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  for (const agent of AGENTS) {
    const bg = Buffer.from(bgSvg(agent.accent));
    const frame = Buffer.from(frameSvg(agent.accent, agent.slug));

    const outPath = path.join(OUT, `${agent.slug}.jpg`);
    await sharp(bg)
      .composite([
        { input: mark, top: Math.round((SIZE - MARK_W) / 2) - 40, left: Math.round((SIZE - MARK_W) / 2) },
        { input: frame, top: 0, left: 0 },
      ])
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(outPath);

    console.log(`wrote ${outPath}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
