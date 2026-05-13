import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { FinalCta } from '@/components/final-cta';
import { INTEGRATION_PROFILES } from '@/lib/integration-profiles';

export const metadata: Metadata = {
  title: 'Integrations — brocco.dev',
  description:
    'Connect Anthropic, OpenAI, Ollama, Stripe, Slack, Gmail, Notion, Postgres. BYOK on free; hosted with ZDR on paid.',
  alternates: { canonical: '/integrations' },
  keywords: ['ai integrations', 'agent integrations', 'mcp integrations'],
};

const CATEGORIES = ['model', 'data', 'comms', 'productivity'] as const;

export default function IntegrationsIndex() {
  return (
    <>
      <Nav />
      <main>
        <section className="relative pt-32 pb-12 md:pt-40">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-radial-glow" />
          <div className="container-x text-center">
            <p className="pill mx-auto">The connectors</p>
            <h1 className="mx-auto mt-5 max-w-3xl text-display-xl">
              <span className="text-grad">Eight integrations.</span>{' '}
              <span className="font-serif italic font-normal text-grad-brand">Real keys.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[16px] text-ink-dim">
              Connect the tools your team already uses. BYOK on the free tier; hosted with zero data retention on paid.
            </p>
          </div>
        </section>

        <section className="pb-24">
          <div className="container-x">
            {CATEGORIES.map((cat) => {
              const items = INTEGRATION_PROFILES.filter((i) => i.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat} className="mt-12 first:mt-0">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
                    {cat}
                  </p>
                  <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((i) => (
                      <li key={i.slug}>
                        <Link
                          href={`/integrations/${i.slug}`}
                          className="card card-hover group block h-full p-5"
                        >
                          <p className="text-[16px] font-bold tracking-tight">{i.name}</p>
                          <p className="mt-2 text-[14px] leading-relaxed text-ink-dim line-clamp-3">{i.tagline}</p>
                          <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] text-cyan-glow">
                            Setup <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
