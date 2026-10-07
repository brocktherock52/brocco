import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Search,
  PhoneCall,
  Repeat2,
  LineChart,
  FileSignature,
  Handshake,
  Banknote,
  PlayCircle,
  Check,
} from 'lucide-react';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { FinalCta } from '@/components/final-cta';

// Dedicated A-to-Z auto-wholesaling walkthrough + landing page. This is the
// page Hold My Hand Wholesale students get sent to: it shows the whole deal
// pipeline (find -> skip trace -> work -> comps -> contract -> dispo -> paid),
// maps each stage to a Brocco tool they can try, and shows the money math.
// The dispo step hands the locked contract to their HMHW team (they keep 60%);
// Brocco's job is the front end that gets them to a signed contract.

const SITE = process.env.NEXT_PUBLIC_BASE_URL || 'https://brocco.dev';

export const metadata: Metadata = {
  title: 'Auto-Wholesale A to Z - find, lock, and dispo deals with your AI team',
  description:
    'The step-by-step walkthrough: use Brocco to pull motivated-seller leads, skip trace, run comps and max offer, draft the contract, and lock the deal. Then dispo it through your team and keep your assignment fee. Built for wholesalers. 7-day dashboard preview, card required.',
  alternates: { canonical: '/auto-wholesale' },
  openGraph: {
    title: 'Auto-Wholesale A to Z - your AI team finds and locks the deal',
    description:
      'Find leads, skip trace, run comps, draft contracts, lock the deal, hand it to dispo. The whole wholesaling pipeline, automated. 7-day dashboard preview, card required.',
    url: `${SITE}/auto-wholesale`,
    type: 'website',
  },
};

export const dynamic = 'force-static';

interface Step {
  n: number;
  slug: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  does: string;
  get: string;
}

// Each step maps a wholesaling stage to a Brocco tool (recipe slug). "Try this
// step" deep-links into /app with that recipe preloaded.
const STEPS: Step[] = [
  {
    n: 1,
    slug: 'motivated-seller-leads',
    icon: Search,
    title: 'Find the deal',
    does: 'Pull a targeted motivated-seller list in your market: tax-delinquent, absentee, pre-foreclosure, code violations, tired landlords.',
    get: 'A clean, ranked call list built to your criteria. No buying bulk lists you never work.',
  },
  {
    n: 2,
    slug: 'skip-trace-and-outreach',
    icon: PhoneCall,
    title: 'Reach the owner',
    does: 'Skip trace the owners for phone and email, then write your first text and cold-call opener so you can start conversations today.',
    get: 'Contact info plus a ready-to-send outreach script per lead.',
  },
  {
    n: 3,
    slug: 'deal-follow-up-engine',
    icon: Repeat2,
    title: 'Work the pipeline',
    does: 'Keep every lead warm and revive the dead ones. It drafts the follow-ups and tells you who to call next so nothing slips through.',
    get: 'A worked pipeline with follow-ups queued, not a graveyard of old leads.',
  },
  {
    n: 4,
    slug: 'comp-analysis-arv',
    icon: LineChart,
    title: 'Run the numbers',
    does: 'Pull comps, estimate ARV, and calculate your max allowable offer so your number is right before you ever pick up the phone.',
    get: 'A comp sheet, ARV, and a max offer you can defend.',
  },
  {
    n: 5,
    slug: 'loi-and-contract-draft',
    icon: FileSignature,
    title: 'Lock it under contract',
    does: 'Generate the LOI and an assignment-ready purchase agreement, filled with your terms, so you can lock the deal while you have the seller on the line.',
    get: 'A signable LOI and contract, ready to send.',
  },
  {
    n: 6,
    slug: 'cash-buyer-dispo',
    icon: Handshake,
    title: 'Dispo it (keep your 60%)',
    does: 'Line up cash buyers, or hand the signed contract straight to your HMHW dispo team. They assign it to their buyer list, you keep your 60%.',
    get: 'A buyer match or a clean handoff to dispo. Your front-end work, their close.',
  },
];

export default function AutoWholesalePage() {
  const stepLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to auto-wholesale a real estate deal A to Z with Brocco',
    step: STEPS.map((s) => ({ '@type': 'HowToStep', position: s.n, name: s.title, text: s.does })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(stepLd) }} />
      <Nav />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-12 md:pt-40">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-radial-glow" />
          <div className="container-x text-center">
            <p className="pill mx-auto">the a-to-z walkthrough</p>
            <h1 className="mx-auto mt-5 max-w-3xl text-display-xl lowercase">
              <span className="text-grad">auto-wholesale a deal,</span>{' '}
              <span className="font-serif italic font-normal text-grad-brand">start to assignment fee.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxed text-ink-dim">
              Your AI team runs the front end: finds motivated sellers, skip traces, runs comps and
              your max offer, and drafts the contract so you can lock the deal. Then you hand it to
              your dispo team and keep your cut. Explore the six steps below, then start your dashboard preview.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="btn-primary">
                Start 7-day trial <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#walkthrough"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.04] px-5 py-3 text-sm font-medium text-ink-dim transition-colors hover:text-white"
              >
                see the 6 steps
              </Link>
            </div>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
              card required · 7-day dashboard preview · live tools on paid plans
            </p>
          </div>
        </section>

        {/* Walkthrough video slot. Drop the Loom embed in here once recorded. */}
        <section className="pb-14">
          <div className="container-x">
            <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/[0.10] bg-bg-1/50 shadow-glow2">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(34,211,238,0.5), rgba(224,69,123,0.4), transparent)',
                }}
              />
              <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 text-center">
                <PlayCircle className="h-14 w-14 text-cyan-glow/80" />
                <p className="text-[15px] font-semibold text-white">4-minute walkthrough</p>
                <p className="max-w-sm px-6 text-[13px] leading-relaxed text-ink-dim">
                  Watch the whole flow: from pulling a list to a signed contract you can send to dispo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The 6-step A-Z pipeline */}
        <section id="walkthrough" className="scroll-mt-24 pb-10">
          <div className="container-x">
            <div className="border-t border-white/[0.06] pt-12">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">the pipeline</p>
              <h2 className="mt-3 text-display-lg lowercase">
                <span className="text-grad">six steps,</span>{' '}
                <span className="font-serif italic font-normal text-grad-brand">deal to dollars.</span>
              </h2>
              <p className="mt-3 max-w-xl text-[15px] text-ink-dim">
                This is the whole wholesaling motion. Each step is a tool you can run right now. Try
                them in order and you have run a deal end to end.
              </p>

              <ol className="mt-8 space-y-4">
                {STEPS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <li key={s.n}>
                      <div className="card card-hover group relative flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-4 sm:w-[230px] sm:shrink-0">
                          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/[0.10] bg-white/[0.04]">
                            <Icon className="h-5 w-5 text-cyan-glow" />
                            <span className="absolute -right-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-brand to-cyan text-[11px] font-bold text-white">
                              {s.n}
                            </span>
                          </div>
                          <h3 className="text-[16px] font-semibold capitalize text-white">{s.title}</h3>
                        </div>
                        <div className="flex-1">
                          <p className="text-[14px] leading-relaxed text-ink-dim">{s.does}</p>
                          <p className="mt-2 inline-flex items-start gap-1.5 text-[13px] leading-relaxed text-ink">
                            <Check className="mt-[3px] h-3.5 w-3.5 shrink-0 text-emerald-400" />
                            <span><span className="text-ink-faint">you get:</span> {s.get}</span>
                          </p>
                        </div>
                        <div className="sm:w-[150px] sm:shrink-0 sm:text-right">
                          <Link
                            href="/signup"
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.05] px-4 py-2 text-[13px] font-medium text-cyan-glow transition-colors hover:bg-white/[0.09] hover:text-white"
                          >
                            Start 7-day trial
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        </div>
                      </div>
                    </li>
                  );
                })}

                {/* Payoff step */}
                <li>
                  <div className="relative flex flex-col gap-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] p-6 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4 sm:w-[230px] sm:shrink-0">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10">
                        <Banknote className="h-5 w-5 text-emerald-300" />
                      </div>
                      <h3 className="text-[16px] font-semibold text-white">Assignment fee, banked</h3>
                    </div>
                    <p className="flex-1 text-[14px] leading-relaxed text-ink-dim">
                      Your buyer closes, the assignment fee hits, and you keep your split. That is one
                      deal, run end to end, mostly by your AI team.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* The money math */}
        <section className="pb-10">
          <div className="container-x">
            <div className="border-t border-white/[0.06] pt-12">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">the math</p>
              <h2 className="mt-3 text-display-lg lowercase">
                <span className="font-serif italic font-normal text-grad-brand">one deal pays for years of the tool.</span>
              </h2>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <MathCard label="You lock it at" value="$120,000" />
                <MathCard label="You assign it for" value="$135,000" />
                <MathCard label="Assignment fee" value="$15,000" accent />
              </div>
              <p className="mt-5 max-w-2xl text-[14px] leading-relaxed text-ink-dim">
                Dispo it through your HMHW team and keep 60% of that fee:{' '}
                <span className="font-semibold text-white">$9,000 on a single deal</span>. Brocco runs
                the front end for less than a dinner a month. The numbers above are an example, not a
                promise; your market and spread will vary.
              </p>
            </div>
          </div>
        </section>

        {/* Try everything CTA */}
        <section className="pb-10">
          <div className="container-x">
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.10] bg-bg-1/50 p-8 text-center md:p-10">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 opacity-60"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.18), transparent 60%)',
                }}
              />
              <h2 className="mx-auto max-w-2xl text-display-lg lowercase">
                <span className="text-grad">preview your workspace.</span>
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-ink-dim">
                Explore the dashboard for seven days with a card on file. Activate a paid plan to run the steps on
                your own market. Cancel before the trial ends to avoid the first subscription charge.
              </p>
              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/signup" className="btn-primary">
                  Start 7-day trial <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/pricing" className="btn-ghost">
                  see pricing
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Hero showcase image, reused on-brand asset */}
        <section className="pb-20">
          <div className="container-x">
            <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-white/[0.08] bg-bg-1/40">
              <Image
                src="/assets/real-estate/croc-building-house.png"
                alt="The Brocco croc building a house frame: your AI team doing the wholesaling work"
                width={1200}
                height={896}
                sizes="(max-width: 768px) 100vw, 672px"
                className="h-auto w-full"
              />
            </div>
          </div>
        </section>

        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

function MathCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={
        accent
          ? 'rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-5'
          : 'card p-5'
      }
    >
      <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">{label}</p>
      <p className={accent ? 'mt-2 text-[28px] font-bold tracking-tight text-emerald-300' : 'mt-2 text-[28px] font-bold tracking-tight text-white'}>
        {value}
      </p>
    </div>
  );
}
