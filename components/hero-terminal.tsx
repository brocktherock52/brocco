'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';
import { toast } from 'sonner';

const SAMPLE = `curl -N https://brocco.ai/api/v1/run \\
  -H "Authorization: Bearer sk-ant-..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent": "researcher",
    "prompt": "top 5 alternatives to brocco, ranked by wedge"
  }'`;

/**
 * Code-forward hero block. Mirrors inference.sh's "curl in the hero"
 * signature move. Lowercase typography, mono only, single accent.
 * Click to copy.
 */
export function HeroTerminal() {
  const [copied, setCopied] = useState(false);

  function copy() {
    if (typeof navigator === 'undefined') return;
    navigator.clipboard
      .writeText(SAMPLE)
      .then(() => {
        setCopied(true);
        toast.success('copied to clipboard');
        setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => {
        toast.message('copy this curl', { description: SAMPLE, duration: 12000 });
      });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto mt-12 max-w-2xl"
    >
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-bg-1/80 shadow-card backdrop-blur">
        {/* mac dots + path + copy */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/50" />
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-ink-faint">
            <Terminal className="h-3 w-3" />
            zsh
          </span>
          <span className="font-mono text-[11px] text-ink-faint">~/brocco</span>
          <button
            onClick={copy}
            className="ml-auto inline-flex items-center gap-1 rounded-md border border-white/[0.10] bg-white/[0.04] px-2 py-0.5 font-mono text-[10.5px] text-ink-dim hover:bg-white/[0.07] hover:text-white"
            aria-label="copy curl command"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" /> copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" /> copy
              </>
            )}
          </button>
        </div>

        {/* code body */}
        <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-[1.55] text-ink/95">
          <span className="text-ink-faint">$ </span>
          {colorize(SAMPLE)}
        </pre>

        {/* footer caption */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] bg-white/[0.02] px-3.5 py-2 font-mono text-[11px] text-ink-faint">
          <span>byok bearer · sse stream · 9 agents available</span>
          <a
            href="/api/v1/agents"
            className="text-cyan-glow hover:underline"
            target="_blank"
            rel="noopener"
          >
            get /api/v1/agents →
          </a>
        </div>
      </div>
    </motion.div>
  );
}

/** Ultra-light syntax color for shell+curl. Not a real tokenizer; just three
 *  passes over distinctive patterns. Keeps the bundle small. */
function colorize(src: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  src.split('\n').forEach((line, i) => {
    const tokens = line.split(/(\s+|".*?"|'.*?')/g);
    parts.push(
      <span key={i} className="block">
        {tokens.map((t, j) => {
          if (!t) return null;
          if (t.startsWith('"') || t.startsWith("'")) {
            return (
              <span key={j} className="text-cyan-glow">
                {t}
              </span>
            );
          }
          if (t === 'curl' || t === '-N' || t === '-H' || t === '-d') {
            return (
              <span key={j} className="text-brand-glow">
                {t}
              </span>
            );
          }
          if (t.startsWith('https://') || t.startsWith('http://')) {
            return (
              <span key={j} className="text-violet-300">
                {t}
              </span>
            );
          }
          return <span key={j}>{t}</span>;
        })}
      </span>,
    );
  });
  return <>{parts}</>;
}
