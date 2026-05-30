import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { FinalCta } from '@/components/final-cta';
import { capabilities, capabilityLanes } from '@/lib/capabilities-data';
import { VERTICALS } from '@/lib/verticals';
import { RECIPE_PROFILES } from '@/lib/recipe-profiles';

export const metadata: Metadata = {
  title: 'Capabilities - what the brocco AI team builds for you',
  description:
    'brocco is an AI team in a tab. It builds websites and storefronts, produces content and video, runs outreach, delivers market and research intel, and automates recurring ops. Built for founders, agencies, sales and ops teams, real estate wholesalers, land and creative-finance investors, agents, and more.',
  alternates: { canonical: '/capabilities' },
  keywords: [
    'ai team', 'ai website builder', 'ai content studio', 'ai outreach', 'ai research',
    'ai for real estate wholesalers', 'real estate wholesaling ai', 'ai for land investors',
    'ai for real estate agents', 'ai for founders', 'ai for agencies',
  ],
};

export const dynamic = 'force-static';

export default function CapabilitiesIndex() {
  return (
    <>
      <Nav />
      <main>
        <section className="relative pt-32 pb-12 md:pt-40">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-radial-glow" />
          <div className="container-x text-center">
            <p className="pill mx-auto">the work, done</p>
            <h1 className="mx-auto mt-5 max-w-3xl text-display-xl lowercase">
              <span className="text-grad">one team.</span>{' '}
              <span className="font-serif italic font-normal text-grad-brand">
                everything you need shipped.
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[16px] text-ink-dim">
              brocco is an AI team in a tab. each capability below is a real pipeline the team runs
              end to end, with you in the approval loop.
            </p>
          </div>
        </section>

        {/* Hero showcase: the Brocco croc orchestrating every kind of work. */}
        <section className="pb-12">
          <div className="container-x">
            <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/[0.08] bg-bg-1/40 shadow-glow2">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(34,211,238,0.5), rgba(167,139,250,0.4), transparent)',
                }}
              />
              <Image
                src="/assets/home/capabilities-croc.png"
                alt="The Brocco croc orchestrating websites, content, outreach, research, and code at once"
                width={1200}
                height={896}
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                className="h-auto w-full"
              />
            </div>
          </div>
        </section>

        <section className="pb-24">
          <div className="container-x">
            {capabilityLanes.map((lane) => {
              const list = capabilities.filter((c) => c.lane === lane);
              if (list.length === 0) return null;
              return (
                <div key={lane} className="mt-12 first:mt-0">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
                    {lane}
                  </p>
                  <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {list.map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={`/capabilities/${c.slug}`}
                          className="card card-hover group relative block h-full overflow-hidden p-5"
                        >
                          <div
                            className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${c.accent} opacity-0 transition group-hover:opacity-100`}
                          />
                          <div className="relative">
                            <span className="text-2xl">{c.icon}</span>
                            <p className="mt-3 text-[15px] font-semibold text-white group-hover:text-cyan-glow">
                              {c.name}
                            </p>
                            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-dim line-clamp-3">
                              {c.tagline}
                            </p>
                            <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] text-cyan-glow">
                              {c.cta}{' '}
                              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                            </span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Built for your role: links to every /for/<slug> niche landing page so
            each audience (real estate wholesalers, land + creative-finance
            investors, agents, founders, agencies, ops/sales, recruiters, course
            creators, marketers, CS) can jump straight to their use case. */}
        <section className="pb-8">
          <div className="container-x">
            <div className="border-t border-white/[0.06] pt-12">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
                built for your role
              </p>
              <h2 className="mt-3 text-display-lg lowercase">
                <span className="font-serif italic font-normal text-grad-brand">
                  your job, run by an AI team.
                </span>
              </h2>
              <p className="mt-3 max-w-xl text-[15px] text-ink-dim">
                The same team, pointed at your niche. Pick the one that fits and see exactly how it
                runs your day.
              </p>
              <Link
                href="/real-estate"
                className="card card-hover group relative mt-6 block overflow-hidden p-6"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan/10 to-brand/10 opacity-0 transition group-hover:opacity-100" />
                <div className="relative flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-cyan-glow">
                      featured
                    </p>
                    <p className="mt-1 text-[17px] font-semibold text-white">
                      In real estate? Start here.
                    </p>
                    <p className="mt-1 text-[13.5px] text-ink-dim">
                      Lead pull, skip trace, comps, cash-buyer dispo, follow-up, and contracts for
                      wholesalers, investors, and agents.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand to-cyan px-4 py-2 text-[13px] font-semibold text-white">
                    open the real estate hub{' '}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
              <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {VERTICALS.map((v) => (
                  <li key={v.slug}>
                    <Link
                      href={`/for/${v.slug}`}
                      className="card card-hover group block h-full p-5"
                    >
                      <p className="text-[15px] font-semibold capitalize text-white group-hover:text-cyan-glow">
                        {v.audience}
                      </p>
                      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-dim line-clamp-2">
                        {v.cta}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] text-cyan-glow">
                        see the workflow{' '}
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Ready-to-run recipes: direct links to every /recipes/<slug> pattern,
            including the real-estate tools (skip trace, comps, dispo, follow-up,
            LOI). Gives visitors a concrete tool to click, not just a category. */}
        <section className="pb-24">
          <div className="container-x">
            <div className="border-t border-white/[0.06] pt-12">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
                ready-to-run recipes
              </p>
              <h2 className="mt-3 text-display-lg lowercase">
                <span className="text-grad">prompts that ship something.</span>
              </h2>
              <p className="mt-3 max-w-xl text-[15px] text-ink-dim">
                Each one is a saved pattern: the prompt, what you get back, and the cost. Run it with
                your own key.
              </p>
              <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {RECIPE_PROFILES.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/recipes/${r.slug}`}
                      className="card card-hover group block h-full p-5"
                    >
                      <p className="text-[15px] font-semibold text-white group-hover:text-cyan-glow">
                        {r.name}
                      </p>
                      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-dim line-clamp-2">
                        {r.tagline}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] text-cyan-glow">
                        open recipe{' '}
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
