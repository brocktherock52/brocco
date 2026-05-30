'use client';

// Interactive, self-contained demos for each capability lane.
// Everything here runs in the browser with deterministic, templated output.
// No network calls, no API keys, no secrets. Safe to ship and safe to fail.

import { useState } from 'react';
import type { CapabilityDemo as DemoKind } from '@/lib/capabilities-data';

function titleCase(s: string) {
  return s
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const inputClass =
  'block w-full rounded-2xl border border-white/[0.12] bg-bg-0/60 px-4 py-3.5 text-[15px] text-ink outline-none transition placeholder:text-ink-faint focus:border-cyan-glow/50';

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-bg-0/60">
      <div className="flex items-center gap-1.5 border-b border-white/[0.08] bg-white/[0.03] px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-accent-rose/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent-green/70" />
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function RunButton({ label, onClick, busy }: { label: string; onClick: () => void; busy: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="btn-primary inline-flex shrink-0 items-center justify-center whitespace-nowrap px-6 py-3.5 text-[15px] disabled:opacity-60"
    >
      {busy ? 'working...' : label}
    </button>
  );
}

function DemoNote() {
  return (
    <p className="mt-3 text-[12px] text-ink-faint">
      live preview. output is generated locally for demonstration. sign in to run the real team.
    </p>
  );
}

/* ----------------------------- Website builder ---------------------------- */

function SiteDemo() {
  const [input, setInput] = useState('a cozy coffee roaster in Detroit');
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState<null | { name: string; tagline: string; sections: string[] }>(null);

  function run() {
    setBusy(true);
    const name = titleCase(input) || 'Your Brand';
    setTimeout(() => {
      setPlan({
        name,
        tagline: `${name}. Built to convert, ready to ship.`,
        sections: ['hero', 'social proof', 'features', 'pricing', 'faq', 'contact'],
      });
      setBusy(false);
    }, 600);
  }

  return (
    <div>
      <label className="mb-2 block text-[13px] text-ink-dim">describe your business</label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={inputClass}
          placeholder="a yoga studio for busy parents"
        />
        <RunButton label="generate site plan" onClick={run} busy={busy} />
      </div>

      {plan && (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Frame>
            <div className="rounded-xl bg-gradient-to-b from-cyan/10 to-transparent p-5">
              <div className="text-lg font-bold text-white">{plan.name}</div>
              <div className="mt-1 text-[14px] text-ink-dim">{plan.tagline}</div>
              <div className="mt-4 inline-block rounded-full bg-gradient-to-r from-brand to-cyan px-3 py-1.5 text-[12px] font-semibold text-white">
                get started
              </div>
            </div>
          </Frame>
          <div>
            <div className="text-[14px] font-semibold text-white">page structure</div>
            <ul className="mt-2 space-y-1.5">
              {plan.sections.map((s, i) => (
                <li key={s} className="flex items-center gap-2 text-[14px] text-ink-dim">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan/15 text-[11px] text-cyan-glow">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <DemoNote />
    </div>
  );
}

/* ------------------------------ Content studio ---------------------------- */

function ContentDemo() {
  const [topic, setTopic] = useState('why cold brew beats iced coffee');
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<null | { hooks: string[]; beats: string[]; cadence: string }>(null);

  function run() {
    setBusy(true);
    const t = topic.trim() || 'your topic';
    setTimeout(() => {
      setOut({
        hooks: [
          `stop scrolling if you care about ${t}.`,
          `nobody tells you this about ${t}.`,
          `i tested ${t} so you don't have to.`,
        ],
        beats: [
          'hook: pattern interrupt in the first second',
          'problem: the thing everyone gets wrong',
          'proof: the demo or the receipts',
          'payoff: the result and the takeaway',
          'cta: follow for the next one',
        ],
        cadence: '3 shorts/day across TikTok, Reels, and Shorts',
      });
      setBusy(false);
    }, 600);
  }

  return (
    <div>
      <label className="mb-2 block text-[13px] text-ink-dim">what is the content about?</label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className={inputClass}
          placeholder="a product launch, a niche, an angle"
        />
        <RunButton label="plan a content run" onClick={run} busy={busy} />
      </div>

      {out && (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-[14px] font-semibold text-white">hook options</div>
            <ul className="mt-2 space-y-2">
              {out.hooks.map((h) => (
                <li key={h} className="card p-3 text-[14px] text-ink-dim">
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[14px] font-semibold text-white">script beats</div>
            <ol className="mt-2 space-y-1.5">
              {out.beats.map((b, i) => (
                <li key={b} className="flex gap-2 text-[14px] text-ink-dim">
                  <span className="text-cyan-glow">{i + 1}.</span>
                  {b}
                </li>
              ))}
            </ol>
            <div className="mt-3 rounded-xl bg-cyan/10 px-3 py-2 text-[12px] text-cyan-glow">
              suggested cadence: {out.cadence}
            </div>
          </div>
        </div>
      )}
      <DemoNote />
    </div>
  );
}

/* ----------------------------- Outreach engine ---------------------------- */

function OutreachDemo() {
  const [who, setWho] = useState('indie SaaS founders');
  const [busy, setBusy] = useState(false);
  const [seq, setSeq] = useState<null | { list: string; touches: { kind: string; body: string }[] }>(null);

  function run() {
    setBusy(true);
    const w = who.trim() || 'your audience';
    setTimeout(() => {
      setSeq({
        list: `built a segmented list of ${w}, enriched with role and company signals.`,
        touches: [
          {
            kind: 'email 1',
            body: `quick one for ${w}: noticed you are shipping fast. we built a way to do the busywork in parallel. worth a look?`,
          },
          {
            kind: 'follow-up',
            body: 'circling back. two-line version: delegate whole workflows, keep approval on every send. open to a 10-min look?',
          },
          { kind: 'sms', body: 'hey, sent a note on cutting your busywork. want the 60-second demo link?' },
        ],
      });
      setBusy(false);
    }, 600);
  }

  return (
    <div>
      <label className="mb-2 block text-[13px] text-ink-dim">who do you want to reach?</label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={who}
          onChange={(e) => setWho(e.target.value)}
          className={inputClass}
          placeholder="local dentists, ecommerce brands, agencies"
        />
        <RunButton label="preview a campaign" onClick={run} busy={busy} />
      </div>

      {seq && (
        <div className="mt-5">
          <div className="rounded-xl bg-cyan/10 px-3 py-2 text-[12px] text-cyan-glow">{seq.list}</div>
          <div className="mt-3 space-y-3">
            {seq.touches.map((t) => (
              <div key={t.kind} className="card p-3">
                <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-brand-glow">
                  {t.kind}
                </div>
                <div className="text-[14px] text-ink-dim">{t.body}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-ink-faint">drafts only. nothing sends without your approval.</p>
        </div>
      )}
      <DemoNote />
    </div>
  );
}

/* ------------------------------ Market intel ------------------------------ */

function Bars() {
  const data = [38, 52, 44, 61, 73, 58, 80, 67, 91];
  const max = Math.max(...data);
  return (
    <div className="flex h-24 items-end gap-1.5">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t bg-gradient-to-t from-brand/40 to-cyan/80"
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  );
}

function MarketDemo() {
  const cards = [
    { label: 'signals tracked', value: '1,284', delta: '+6.2%' },
    { label: 'sim win rate', value: '61%', delta: 'shadow mode' },
    { label: 'trend score', value: '82 / 100', delta: 'rising' },
  ];
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card p-4">
            <div className="text-[12px] text-ink-faint">{c.label}</div>
            <div className="mt-1 text-2xl font-bold text-white">{c.value}</div>
            <div className="mt-1 text-[12px] text-cyan-glow">{c.delta}</div>
          </div>
        ))}
      </div>
      <div className="card mt-4 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[14px] font-semibold text-white">signal volume, last 9 windows</div>
          <span className="rounded-md bg-white/5 px-2 py-1 text-[11px] text-ink-faint">sample data</span>
        </div>
        <Bars />
      </div>
      <p className="mt-3 text-[12px] text-ink-faint">
        read-only monitoring and simulation. brocco never places trades for you.
      </p>
    </div>
  );
}

/* ------------------------------ Deep research ----------------------------- */

function ResearchDemo() {
  const [q, setQ] = useState('is now a good time to start a UGC agency?');
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState(0);
  const phases = ['scoping the question', 'fanning out searches', 'verifying claims', 'synthesizing brief'];

  function run() {
    setBusy(true);
    setPhase(0);
    let i = 0;
    const tick = () => {
      i += 1;
      setPhase(i);
      if (i < phases.length) {
        setTimeout(tick, 450);
      } else {
        setBusy(false);
      }
    };
    setTimeout(tick, 450);
  }

  const done = phase >= phases.length;

  return (
    <div>
      <label className="mb-2 block text-[13px] text-ink-dim">ask a research question</label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className={inputClass}
          placeholder="anything worth getting right"
        />
        <RunButton label="run research brief" onClick={run} busy={busy} />
      </div>

      {phase > 0 && (
        <div className="mt-5 space-y-2">
          {phases.map((p, i) => (
            <div key={p} className="flex items-center gap-2 text-[14px]">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                  i < phase ? 'bg-cyan/20 text-cyan-glow' : 'bg-white/5 text-ink-faint'
                }`}
              >
                {i < phase ? '✓' : i + 1}
              </span>
              <span className={i < phase ? 'text-ink-dim' : 'text-ink-faint'}>{p}</span>
            </div>
          ))}
          {done && (
            <div className="card mt-3 p-4 text-[14px] text-ink-dim">
              <div className="font-semibold text-white">brief ready</div>
              <p className="mt-1">
                synthesized answer with confidence levels, key claims verified against multiple
                sources, and citations attached. this is a preview of the format.
              </p>
            </div>
          )}
        </div>
      )}
      <DemoNote />
    </div>
  );
}

/* -------------------------------- Dispatcher ------------------------------ */

export function CapabilityDemo({ kind }: { kind: DemoKind }) {
  switch (kind) {
    case 'site':
      return <SiteDemo />;
    case 'content':
      return <ContentDemo />;
    case 'outreach':
      return <OutreachDemo />;
    case 'market':
      return <MarketDemo />;
    case 'research':
      return <ResearchDemo />;
    default:
      return null;
  }
}
