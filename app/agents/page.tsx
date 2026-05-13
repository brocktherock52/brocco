import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { FinalCta } from '@/components/final-cta';
import { AGENT_PROFILES } from '@/lib/agent-profiles';
import { AnimatedGrid, AnimatedGridItem } from '@/components/animated-grid';
import { AgentCardName } from '@/components/agent-shared';

export const metadata: Metadata = {
  title: 'Agents — brocco.dev',
  description:
    'Nine specialist agents you can broadcast to from one prompt. Researcher, planner, outreach, designer, analyst, coder, ops, supervisor, browser.',
  alternates: { canonical: '/agents' },
  keywords: ['ai agents', 'multi-agent dashboard', 'agentic ai platform', 'parallel agents'],
};

export default function AgentsIndex() {
  return (
    <>
      <Nav />
      <main>
        <section className="relative pt-32 pb-12 md:pt-40">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-radial-glow" />
          <div className="container-x text-center">
            <p className="pill mx-auto">The team</p>
            <h1 className="mx-auto mt-5 max-w-3xl text-display-xl">
              <span className="text-grad">Nine specialists.</span>{' '}
              <span className="font-serif italic font-normal text-grad-brand">One prompt.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[16px] text-ink-dim">
              Each agent has a focused tool list, a tight system prompt, and a job. Broadcast one goal and watch them work in parallel.
            </p>
          </div>
        </section>

        <section className="pb-24">
          <div className="container-x">
            <AnimatedGrid className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3" staggerMs={50}>
              {AGENT_PROFILES.map((a) => (
                <AnimatedGridItem key={a.slug}>
                  <Link
                    href={`/agents/${a.slug}`}
                    className="card card-hover group block h-full p-6 hover:shadow-glow"
                  >
                    <AgentCardName slug={a.slug} className="block font-mono text-[10.5px] uppercase tracking-[0.18em] text-cyan-glow">
                      {a.name}
                    </AgentCardName>
                    <h2 className="mt-3 text-[20px] font-semibold leading-snug tracking-tight transition-colors group-hover:text-white">
                      {a.tagline}
                    </h2>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-ink-dim line-clamp-3">
                      {a.lead}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {a.primaryTools.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center rounded-full border border-cyan-400/35 bg-cyan-400/[0.05] px-2.5 py-0.5 font-mono text-[11px] text-cyan-glow"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1 text-[13px] text-cyan-glow">
                      Open profile <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </AnimatedGridItem>
              ))}
            </AnimatedGrid>
          </div>
        </section>
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
