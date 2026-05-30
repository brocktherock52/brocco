// Polished single-file PDF export for a brocco run.
//
// Braeden (Stackably) on the 2026-05-26 partner call asked for "a consolidated
// file of sorts, not MD, a recognizable one like a PDF or DocX," and noted it
// would be a real differentiator versus "why don't I just use my Claude
// membership." This builds a designed, branded report: a cover band with the
// user's logo + business name, the goal, then one clean section per agent with
// its summary + written output rendered from markdown-lite, a footer on every
// page, and page-break handling.
//
// jsPDF is dynamically imported so the dashboard's initial JS stays lean. Only
// visitors who actually click "Download PDF" pay for it. Mirrors the lazy
// jszip import already used for the .zip export.

import type { SimEvent } from './simulator';
import type { BroccoProfile } from './profile';
import { DEFAULT_BRAND_COLOR } from './profile';

export interface PdfPane {
  agentLabel: string;
  /** Hex accent for this agent (from lib/agents). */
  accent: string;
  status: string;
  mode: string;
  events: SimEvent[];
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '').trim();
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full || '7C3AED', 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Pull the assistant's written prose out of a pane (text events joined). */
function bodyText(events: SimEvent[]): string {
  return events
    .filter((e) => e.type === 'text')
    .map((e) => (e as Extract<SimEvent, { type: 'text' }>).text)
    .join('\n\n')
    .trim();
}

function doneSummary(events: SimEvent[]): string {
  const done = [...events].reverse().find((e) => e.type === 'done') as
    | Extract<SimEvent, { type: 'done' }>
    | undefined;
  return done?.summary ?? '';
}

function toolCallNames(events: SimEvent[]): string[] {
  return events
    .filter((e) => e.type === 'tool_call')
    .map((e) => (e as Extract<SimEvent, { type: 'tool_call' }>).tool);
}

/** A line of rendered content with styling hints for the layout engine. */
interface Block {
  kind: 'h1' | 'h2' | 'bullet' | 'body' | 'code' | 'space';
  text: string;
  bold?: boolean;
}

/**
 * Markdown-lite -> blocks. Handles headings (#, ##, ###), bullets (-, *),
 * fenced ``` code, and collapses whitespace. Inline **bold** markers are
 * stripped (jsPDF can't mix weights mid-line cheaply); the whole line is
 * bolded if it is wrapped in ** or is a heading.
 */
function toBlocks(md: string): Block[] {
  const blocks: Block[] = [];
  let inCode = false;
  for (const rawLine of md.split('\n')) {
    const line = rawLine.replace(/\t/g, '  ');
    if (line.trim().startsWith('```')) {
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      blocks.push({ kind: 'code', text: line });
      continue;
    }
    const trimmed = line.trim();
    if (!trimmed) {
      blocks.push({ kind: 'space', text: '' });
      continue;
    }
    if (trimmed.startsWith('### ')) {
      blocks.push({ kind: 'h2', text: strip(trimmed.slice(4)), bold: true });
    } else if (trimmed.startsWith('## ')) {
      blocks.push({ kind: 'h2', text: strip(trimmed.slice(3)), bold: true });
    } else if (trimmed.startsWith('# ')) {
      blocks.push({ kind: 'h1', text: strip(trimmed.slice(2)), bold: true });
    } else if (/^[-*]\s+/.test(trimmed)) {
      blocks.push({ kind: 'bullet', text: strip(trimmed.replace(/^[-*]\s+/, '')) });
    } else {
      const wholeBold = /^\*\*.+\*\*$/.test(trimmed);
      blocks.push({ kind: 'body', text: strip(trimmed), bold: wholeBold });
    }
  }
  return blocks;
}

/** Strip inline markdown emphasis + backticks for plain PDF text. */
function strip(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^\*\*|\*\*$/g, '');
}

export async function exportRunToPdf(opts: {
  goal: string;
  panes: PdfPane[];
  profile: BroccoProfile;
}): Promise<void> {
  const { goal, panes, profile } = opts;
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48; // page margin
  const contentW = W - M * 2;

  const brandHex = profile.brandColor || DEFAULT_BRAND_COLOR;
  const brand = hexToRgb(brandHex);
  const ink: RGB = { r: 24, g: 24, b: 33 };
  const dim: RGB = { r: 110, g: 110, b: 125 };
  const faint: RGB = { r: 160, g: 160, b: 172 };

  let y = M;

  const workspace = (profile.businessName || profile.name || '').trim();
  const dateStr = new Date().toLocaleString(undefined, {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  // ---- footer drawn on every page -----------------------------------------
  function footer() {
    const page = doc.getCurrentPageInfo().pageNumber;
    doc.setDrawColor(232, 232, 238);
    doc.setLineWidth(0.5);
    doc.line(M, H - 34, W - M, H - 34);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(faint.r, faint.g, faint.b);
    doc.text('Generated by brocco.dev, your AI team in a tab', M, H - 20);
    doc.text(`${page}`, W - M, H - 20, { align: 'right' });
  }

  function ensureSpace(needed: number) {
    if (y + needed > H - 56) {
      footer();
      doc.addPage();
      y = M;
    }
  }

  // ---- cover band ----------------------------------------------------------
  const bandH = 132;
  doc.setFillColor(brand.r, brand.g, brand.b);
  doc.rect(0, 0, W, bandH, 'F');
  // subtle darker base line under the band
  doc.setFillColor(
    Math.round(brand.r * 0.82),
    Math.round(brand.g * 0.82),
    Math.round(brand.b * 0.82),
  );
  doc.rect(0, bandH - 5, W, 5, 'F');

  // logo (if uploaded), drawn as a rounded-ish white tile on the band
  let textX = M;
  if (profile.logoDataUrl) {
    try {
      const fmt = profile.logoDataUrl.includes('image/jpeg') ? 'JPEG' : 'PNG';
      const size = 56;
      const lx = M;
      const ly = (bandH - size) / 2;
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(lx - 6, ly - 6, size + 12, size + 12, 8, 8, 'F');
      doc.addImage(profile.logoDataUrl, fmt, lx, ly, size, size, undefined, 'FAST');
      textX = lx + size + 22;
    } catch {
      // bad/undecodable logo, just skip it
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text((workspace || 'YOUR WORKSPACE').toUpperCase(), textX, 52);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text('AI Team Report', textX, 82);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(
    `${dateStr}  ·  ${panes.length} specialist${panes.length === 1 ? '' : 's'}  ·  parallel run`,
    textX,
    104,
  );

  y = bandH + 34;

  // ---- the goal ------------------------------------------------------------
  doc.setTextColor(brand.r, brand.g, brand.b);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('THE GOAL', M, y);
  y += 16;
  doc.setTextColor(ink.r, ink.g, ink.b);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  const goalLines = doc.splitTextToSize(goal, contentW);
  doc.text(goalLines, M, y);
  y += goalLines.length * 17 + 10;

  // summary chips: who ran
  doc.setDrawColor(232, 232, 238);
  doc.setLineWidth(0.75);
  doc.line(M, y, W - M, y);
  y += 22;

  // ---- per-agent sections --------------------------------------------------
  panes.forEach((pane) => {
    const accent = hexToRgb(pane.accent || brandHex);
    ensureSpace(64);

    // accent tab + agent heading
    doc.setFillColor(accent.r, accent.g, accent.b);
    doc.rect(M, y - 11, 4, 18, 'F');
    doc.setTextColor(ink.r, ink.g, ink.b);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(pane.agentLabel, M + 14, y + 3);

    // status pill on the right
    const statusLabel = pane.status.toUpperCase();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    const pillW = doc.getTextWidth(statusLabel) + 16;
    const ok = pane.status === 'done';
    if (ok) doc.setFillColor(16, 145, 90);
    else if (pane.status === 'error') doc.setFillColor(200, 60, 60);
    else doc.setFillColor(150, 150, 160);
    doc.roundedRect(W - M - pillW, y - 9, pillW, 14, 7, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(statusLabel, W - M - pillW + 8, y + 1);
    y += 22;

    // done summary line (highlighted)
    const summary = doneSummary(pane.events);
    if (summary) {
      const sLines = doc.splitTextToSize(summary, contentW - 16);
      const boxH = sLines.length * 13 + 14;
      ensureSpace(boxH);
      doc.setFillColor(247, 246, 252);
      doc.roundedRect(M, y - 4, contentW, boxH, 5, 5, 'F');
      doc.setTextColor(dim.r, dim.g, dim.b);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.text(sLines, M + 10, y + 9);
      y += boxH + 10;
    }

    // rendered body
    const blocks = toBlocks(bodyText(pane.events) || '_No written output for this agent._');
    for (const b of blocks) {
      if (b.kind === 'space') {
        y += 6;
        continue;
      }
      let size = 10.5;
      let font: 'normal' | 'bold' | 'italic' = b.bold ? 'bold' : 'normal';
      let color = ink;
      let indent = 0;
      let prefix = '';
      if (b.kind === 'h1') {
        size = 13;
        font = 'bold';
      } else if (b.kind === 'h2') {
        size = 11.5;
        font = 'bold';
      } else if (b.kind === 'bullet') {
        indent = 14;
        prefix = '•  ';
        color = dim;
      } else if (b.kind === 'code') {
        size = 9;
        color = dim;
      }
      doc.setFont(b.kind === 'code' ? 'courier' : 'helvetica', font);
      doc.setFontSize(size);
      doc.setTextColor(color.r, color.g, color.b);
      const lines = doc.splitTextToSize(prefix + b.text, contentW - indent);
      const lineH = size * 1.38;
      for (const ln of lines) {
        ensureSpace(lineH + 2);
        doc.text(ln, M + indent, y);
        y += lineH;
      }
      y += b.kind === 'h1' || b.kind === 'h2' ? 4 : 2;
    }

    // tool-call trail (compact)
    const tools = toolCallNames(pane.events);
    if (tools.length) {
      ensureSpace(20);
      doc.setFont('courier', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(faint.r, faint.g, faint.b);
      const trail = `tools: ${tools.join(' · ')}`;
      const tLines = doc.splitTextToSize(trail, contentW);
      for (const ln of tLines) {
        ensureSpace(11);
        doc.text(ln, M, y);
        y += 11;
      }
    }

    y += 20;
  });

  footer();

  const slug = (workspace || goal || 'run')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'run';
  const ts = new Date().toISOString().slice(0, 10);
  doc.save(`brocco-report-${slug}-${ts}.pdf`);
}
