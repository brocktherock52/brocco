import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { FinalCta } from '@/components/final-cta';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'What is new in brocco.ai. Versioned, dated, no spin.',
  alternates: { canonical: '/changelog' },
};

interface Entry {
  version: string;
  date: string;
  tag: 'major' | 'minor' | 'patch';
  title: string;
  bullets: string[];
}

const ENTRIES: Entry[] = [
  {
    version: 'v2.1',
    date: '2026-05-05',
    tag: 'minor',
    title: 'Production launch - live mode, PWA, customer-ready',
    bullets: [
      'Live mode: BYOK now calls Claude directly from your browser. No keys ever touch our server.',
      'Dashboard: Live / Demo mode badge, real cost + token counters, persistent run history.',
      'PWA: install brocco as a desktop or mobile app from any modern browser. Offline demo mode.',
      'Onboarding: 60-second first-run walkthrough that gets you to your first agent run.',
      'Stripe: end-to-end checkout flow, success page, and customer portal entry point.',
      'Pages: /privacy, /terms, /changelog. Loading and error boundaries on every route.',
      'A11y + perf: better skip links, focus rings, larger touch targets on mobile.',
    ],
  },
  {
    version: 'v2.0',
    date: '2026-05-05',
    tag: 'major',
    title: 'Full Next.js 15 rebuild',
    bullets: [
      'Replatformed from static HTML to Next.js 15 App Router + TypeScript + Tailwind + Radix + Framer Motion.',
      'New animated particle hero with count-up stats and dual CTAs.',
      'Production /app: 9 agents, parallel streaming panes, JSONL audit log, BYOK modal, history, recipes.',
      'New /pricing with feature comparison table. New /security with SOC 2 / GDPR pillars.',
      'All 6 API routes ported to Next.js edge runtime, Stripe envs preserved.',
    ],
  },
  {
    version: 'v1.x',
    date: '2026-05-02',
    tag: 'major',
    title: 'Static site era',
    bullets: [
      'Hand-rolled HTML + custom WebGL fluid hero (single fragment shader).',
      'Scripted demo, 4 agent traces, eight-question FAQ.',
      'Stripe live, 4 tiers wired, webhook signature verified via WebCrypto.',
      'Preserved under legacy/v1-static/ and legacy/v1-api/ for reference.',
    ],
  },
];

const TAG_STYLE: Record<Entry['tag'], string> = {
  major: 'border-brand/30 bg-brand/10 text-brand-glow',
  minor: 'border-cyan/30 bg-cyan/10 text-cyan-glow',
  patch: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
};

export default function ChangelogPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="relative pt-32 pb-12 md:pt-40">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-radial-glow" />
          <div className="container-x max-w-3xl text-center">
            <p className="pill mx-auto">Changelog</p>
            <h1 className="mt-5 text-display-xl text-grad">What is new.</h1>
            <p className="mx-auto mt-5 max-w-xl text-[16px] text-ink-dim">
              Versioned, dated, no spin. Major versions are listed top-down. Subscribe via the RSS link at the bottom.
            </p>
          </div>
        </section>

        <section className="pb-24">
          <div className="container-x max-w-3xl">
            <ol className="relative space-y-10 border-l border-white/[0.08] pl-7 md:pl-10">
              {ENTRIES.map((e) => (
                <li key={e.version} className="relative">
                  <span className="absolute -left-[31px] top-1 inline-flex h-3 w-3 items-center justify-center rounded-full bg-bg-0 ring-2 ring-brand/60 md:-left-[43px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-glow" />
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[12px] tracking-wider text-ink-faint">{e.date}</span>
                    <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${TAG_STYLE[e.tag]}`}>
                      {e.tag}
                    </span>
                    <span className="font-mono text-[12px] text-ink-faint">{e.version}</span>
                  </div>
                  <h2 className="mt-2 text-[20px] font-semibold tracking-tight">{e.title}</h2>
                  <ul className="mt-3 space-y-2">
                    {e.bullets.map((b, i) => (
                      <li key={i} className="flex gap-2 text-[14px] leading-relaxed text-ink-dim">
                        <Sparkles className="mt-1 h-3 w-3 shrink-0 text-brand-glow" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
