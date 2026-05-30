import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { FinalCta } from '@/components/final-cta';
import { VERTICALS } from '@/lib/verticals';
import { RECIPE_PROFILES } from '@/lib/recipe-profiles';

// Single shareable real-estate hub: /real-estate. The page people in
// HoldMyHandWholesale (and other RE niches) get sent to. Aggregates the
// real-estate niche pages + the real-estate tool recipes with a free-first CTA.

const NICHE_SLUGS = ['wholesalers', 'land-investors', 'creative-finance-investors', 'real-estate-agents'];
const TOOL_SLUGS = [
  'motivated-seller-leads',
  'skip-trace-and-outreach',
  'comp-analysis-arv',
  'cash-buyer-dispo',
  'deal-follow-up-engine',
  'loi-and-contract-draft',
];

const SITE = process.env.NEXT_PUBLIC_BASE_URL || 'https://brocco.dev';

export const metadata: Metadata = {
  title: 'AI for Real Estate - your wholesaling and investing team in a tab',
  description:
    'brocco is an AI team for real estate. Pull motivated-seller leads, skip trace and write outreach, run comps and max-offer math, match cash buyers, draft LOIs and contracts, and revive aged leads. For wholesalers, land and creative-finance investors, and agents. 100 free runs, bring your own key.',
  alternates: { canonical: '/real-estate' },
  keywords: [
    'ai for real estate', 'real estate wholesaling ai', 'ai for wholesalers', 'wholesaling software',
    'motivated seller leads ai', 'skip tracing ai', 'arv calculator ai', 'cash buyers list ai',
    'ai for land investors', 'subject to real estate ai', 'ai for real estate agents', 'real estate ai tools',
  ],
  openGraph: {
    title: 'AI for Real Estate - your wholesaling and investing team in a tab',
    description:
      'Pull leads, skip trace, run comps, match cash buyers, draft contracts, and follow up. An AI team for wholesalers, investors, and agents. 100 free runs, bring your own key.',
    url: `${SITE}/real-estate`,
    type: 'website',
  },
};

export const dynamic = 'force-static';

const FAQ = [
  {
    q: 'Do I need to be technical to use this?',
    a: 'No. You describe the job in plain language ("pull tax-delinquent leads in Wayne County under 150k and write me a call list") and the AI team does the work. You stay in the approval loop.',
  },
  {
    q: 'Is my data private?',
    a: 'Yes. You bring your own model key, and your lists, deals, and contacts are yours. brocco does not sell or share your data, and there are no pre-loaded lists on this page, you supply your own inputs at run time.',
  },
  {
    q: 'How much does it cost?',
    a: 'You get 100 free runs every month with no card. Power users bring their own API key and run effectively unlimited. Paid plans add hosted runs and team features.',
  },
  {
    q: 'Why not just use ChatGPT or Claude directly?',
    a: 'A single chat does one thing at a time and forgets your business next week. brocco runs a team of specialists in parallel, hands you finished deliverables (a call list, a comp sheet, a contract), and remembers your projects so each run builds on the last.',
  },
];

export default function RealEstateHub() {
  const niches = NICHE_SLUGS.map((s) => VERTICALS.find((v) => v.slug === s)).filter(Boolean) as typeof VERTICALS;
  const tools = TOOL_SLUGS.map((s) => RECIPE_PROFILES.find((r) => r.slug === s)).filter(Boolean) as typeof RECIPE_PROFILES;

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Nav />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-12 md:pt-40">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-radial-glow" />
          <div className="container-x text-center">
            <p className="pill mx-auto">for real estate</p>
            <h1 className="mx-auto mt-5 max-w-3xl text-display-xl lowercase">
              <span className="text-grad">your real estate business,</span>{' '}
              <span className="font-serif italic font-normal text-grad-brand">run by an AI team.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxed text-ink-dim">
              Pull motivated-seller leads, skip trace and write the outreach, run comps and your max
              offer, match cash buyers, draft the contract, and chase the aged leads. One prompt in,
              finished work back. Built for wholesalers, land and creative-finance investors, and agents.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="btn-primary">
                start free · 100 runs <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#tools"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.04] px-5 py-3 text-sm font-medium text-ink-dim transition-colors hover:text-white"
              >
                see the tools
              </Link>
            </div>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
              100 free runs / mo · no card · bring your own key · your data stays yours
            </p>
          </div>
        </section>

        {/* Niches */}
        <section className="pb-8">
          <div className="container-x">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">pick your lane</p>
            <h2 className="mt-3 text-display-lg lowercase">
              <span className="font-serif italic font-normal text-grad-brand">your niche, your workflow.</span>
            </h2>
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {niches.map((v) => (
                <li key={v.slug}>
                  <Link href={`/for/${v.slug}`} className="card card-hover group block h-full p-6">
                    <p className="text-[16px] font-semibold capitalize text-white group-hover:text-cyan-glow">
                      {v.audience}
                    </p>
                    <p className="mt-2 text-[14px] leading-relaxed text-ink-dim">{v.hero}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] text-cyan-glow">
                      see the workflow <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Tools */}
        <section id="tools" className="scroll-mt-24 pb-8">
          <div className="container-x">
            <div className="border-t border-white/[0.06] pt-12">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">the tools</p>
              <h2 className="mt-3 text-display-lg lowercase">
                <span className="text-grad">the real estate stack, on tap.</span>
              </h2>
              <p className="mt-3 max-w-xl text-[15px] text-ink-dim">
                Each is a saved pattern: the prompt, exactly what you get back, and the cost. Run it
                with your own key on your own lists.
              </p>
              <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/recipes/${r.slug}`} className="card card-hover group block h-full p-5">
                      <p className="text-[15px] font-semibold text-white group-hover:text-cyan-glow">{r.name}</p>
                      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-dim line-clamp-2">{r.tagline}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] text-cyan-glow">
                        open tool <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="pb-8">
          <div className="container-x">
            <div className="border-t border-white/[0.06] pt-12">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">how it works</p>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { n: '01', t: 'say the job', b: 'Describe what you need in one sentence. Your county, your price band, your list.' },
                  { n: '02', t: 'the team runs it', b: 'Specialist agents work in parallel: research, outreach, comps, contracts.' },
                  { n: '03', t: 'get finished work', b: 'A call list, a comp sheet, a dispo blast, a contract. Ready to use, not a chat log.' },
                ].map((s) => (
                  <div key={s.n} className="card p-5">
                    <p className="font-mono text-[12px] text-cyan-glow">{s.n}</p>
                    <p className="mt-2 text-[15px] font-semibold text-white">{s.t}</p>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-dim">{s.b}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="pb-24">
          <div className="container-x">
            <div className="border-t border-white/[0.06] pt-12">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">questions</p>
              <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                {FAQ.map((f) => (
                  <div key={f.q}>
                    <dt className="text-[15px] font-semibold text-white">{f.q}</dt>
                    <dd className="mt-1.5 text-[14px] leading-relaxed text-ink-dim">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Hands Free Wholesaling community: the coaching + community layer that
            pairs with the AI tools. External Whop link (paid community). */}
        <section className="pb-24">
          <div className="container-x">
            <a
              href="https://whop.com/bdp-industries/"
              target="_blank"
              rel="noopener noreferrer"
              className="card card-hover group relative block overflow-hidden p-7"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/15 to-cyan/15 opacity-0 transition group-hover:opacity-100" />
              <div className="relative flex flex-wrap items-center justify-between gap-4">
                <div className="max-w-xl">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-cyan-glow">
                    community + coaching
                  </p>
                  <p className="mt-1 text-[19px] font-semibold text-white">
                    Want the playbook and a room of wholesalers doing it?
                  </p>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-dim">
                    Hands Free Wholesaling is the community and step-by-step training that pairs with
                    these tools. The AI team does the work, the community shows you the moves. Join on
                    Whop.
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-brand to-cyan px-5 py-2.5 text-[13px] font-semibold text-white">
                  join on Whop{' '}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </a>
          </div>
        </section>

        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
