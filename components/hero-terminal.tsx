'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Live typing terminal. Cycles through a script of agent commands +
 * streamed JSONL responses. Each frame mimics the inference.sh
 * "curl in the hero" signature, but actually types character by
 * character and replays.
 *
 * Honors prefers-reduced-motion: degrades to static text.
 */

interface Step {
  text: string;
  speedMs: [number, number]; // min..max delay per char
  pauseAfterMs?: number;
  cls?: string; // tailwind text color
}

// Each scene = a sequence of lines that types out, then we hold and
// move to the next scene.
const SCENES: Step[][] = [
  [
    { text: '$ curl -N https://brocco.ai/api/v1/run \\', speedMs: [12, 26] },
    { text: '    -H "Authorization: Bearer sk-ant-..." \\', speedMs: [10, 22] },
    { text: '    -d \'{"agent":"researcher","prompt":"competitor pricing"}\'', speedMs: [10, 22], pauseAfterMs: 380 },
    { text: '> tavily.search("agent platforms 2026")', speedMs: [8, 18], cls: 'text-cyan-glow' },
    { text: '> http_get linear.app/pricing → 200 (3.2kb)', speedMs: [6, 14], cls: 'text-cyan-glow' },
    { text: '> http_get cursor.com/pricing → 200 (1.9kb)', speedMs: [6, 14], cls: 'text-cyan-glow' },
    { text: '> file_save brief.md (2.3kb · 14 cites)', speedMs: [6, 14], cls: 'text-cyan-glow' },
    { text: '> done · 4m 12s · $0.08 byok', speedMs: [8, 18], pauseAfterMs: 1500, cls: 'text-emerald-400' },
  ],
  [
    { text: '$ brocco run --agent supervisor \\', speedMs: [12, 24] },
    { text: '    --goal "launch sprint for v3.1" \\', speedMs: [10, 22] },
    { text: '    --broadcast researcher,planner,outreach,designer,analyst', speedMs: [8, 18], pauseAfterMs: 360 },
    { text: '↳ supervisor delegating to 5 specialists...', speedMs: [8, 16], cls: 'text-violet-300' },
    { text: '↳ researcher · 1m 12s · 3 sources', speedMs: [6, 14], cls: 'text-cyan-glow' },
    { text: '↳ planner    · 1m 38s · 7 phases', speedMs: [6, 14], cls: 'text-rose-300' },
    { text: '↳ outreach   · 2m 04s · 12 emails', speedMs: [6, 14], cls: 'text-amber-300' },
    { text: '↳ designer   · 2m 18s · 3 wireframes', speedMs: [6, 14], cls: 'text-pink-300' },
    { text: '↳ analyst    · 2m 41s · 2 charts', speedMs: [6, 14], cls: 'text-violet-300' },
    { text: '↳ supervisor synthesizing... done', speedMs: [8, 18], pauseAfterMs: 1500, cls: 'text-emerald-400' },
  ],
  [
    { text: '$ brocco install mcp --client claude-desktop', speedMs: [12, 26], pauseAfterMs: 360 },
    { text: '✓ wrote ~/Library/Application Support/Claude/config.json', speedMs: [8, 16], cls: 'text-emerald-400' },
    { text: '✓ registered 9 agents as MCP tools', speedMs: [8, 16], cls: 'text-emerald-400' },
    { text: '✓ allow-listed: search_web · http_get · file_save · ...', speedMs: [8, 16], cls: 'text-cyan-glow' },
    { text: '→ restart claude desktop to pick up the new tools.', speedMs: [10, 20], pauseAfterMs: 1500, cls: 'text-violet-300' },
  ],
];

const COPY_SAMPLE = `curl -N https://brocco.ai/api/v1/run \\
  -H "Authorization: Bearer sk-ant-..." \\
  -H "Content-Type: application/json" \\
  -d '{"agent":"researcher","prompt":"competitor pricing"}'`;

export function HeroTerminal() {
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const [scene, setScene] = useState(0);
  const [lines, setLines] = useState<string[]>([]); // typed lines so far
  const [active, setActive] = useState(''); // currently typing chars
  const [activeCls, setActiveCls] = useState<string | undefined>(undefined);
  const cancelRef = useRef(false);

  function copy() {
    if (typeof navigator === 'undefined') return;
    navigator.clipboard
      .writeText(COPY_SAMPLE)
      .then(() => {
        setCopied(true);
        toast.success('copied to clipboard');
        setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => {
        toast.message('copy this curl', { description: COPY_SAMPLE, duration: 12000 });
      });
  }

  useEffect(() => {
    cancelRef.current = false;

    if (reduce) {
      // Static fallback: show the first scene fully.
      setLines(SCENES[0].map((s) => s.text));
      setActive('');
      return () => {
        cancelRef.current = true;
      };
    }

    async function sleep(ms: number) {
      return new Promise<void>((resolve) => {
        const t = setTimeout(resolve, ms);
        if (cancelRef.current) clearTimeout(t);
      });
    }

    async function runScene(steps: Step[]) {
      setLines([]);
      setActive('');
      for (let i = 0; i < steps.length; i++) {
        if (cancelRef.current) return;
        const step = steps[i];
        setActiveCls(step.cls);
        let buf = '';
        for (const ch of step.text) {
          if (cancelRef.current) return;
          buf += ch;
          setActive(buf);
          const [lo, hi] = step.speedMs;
          const delay = lo + Math.random() * (hi - lo);
          await sleep(delay);
        }
        // commit line
        setLines((prev) => [...prev, JSON.stringify({ t: step.text, c: step.cls })]);
        setActive('');
        if (step.pauseAfterMs) await sleep(step.pauseAfterMs);
        else await sleep(140);
      }
      // Hold completed scene briefly, then advance
      await sleep(2400);
      if (cancelRef.current) return;
      setScene((s) => (s + 1) % SCENES.length);
    }

    runScene(SCENES[scene]);
    return () => {
      cancelRef.current = true;
    };
  }, [scene, reduce]);

  const parsedLines = lines.map((l) => JSON.parse(l) as { t: string; c?: string });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-bg-1/80 shadow-card backdrop-blur">
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
          <span className="ml-2 inline-flex items-center gap-1.5 font-mono text-[10.5px] text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            live
          </span>
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

        <div className="min-h-[260px] overflow-x-auto p-4 font-mono text-[12.5px] leading-[1.55] text-ink/95">
          {parsedLines.map((ln, i) => (
            <p key={i} className={ln.c ?? ''}>
              {ln.t}
            </p>
          ))}
          {(active || !reduce) && (
            <p className={activeCls ?? ''}>
              {active}
              {!reduce && (
                <motion.span
                  className="ml-0.5 inline-block h-3 w-1.5 align-middle bg-cyan-400"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </p>
          )}
        </div>

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
    </div>
  );
}
