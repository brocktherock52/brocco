import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { FinalCta } from '@/components/final-cta';
import { INTEGRATION_PROFILES, getIntegrationProfile } from '@/lib/integration-profiles';
import { getAgentProfile } from '@/lib/agent-profiles';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return INTEGRATION_PROFILES.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const i = getIntegrationProfile(slug);
  if (!i) return { title: 'Not found' };
  return {
    title: `${i.name} integration — brocco.ai`,
    description: i.tagline.slice(0, 160),
    alternates: { canonical: `/integrations/${i.slug}` },
    keywords: i.keywords,
  };
}

export default async function IntegrationPage({ params }: PageProps) {
  const { slug } = await params;
  const i = getIntegrationProfile(slug);
  if (!i) notFound();

  return (
    <>
      <Nav />
      <main>
        <section className="relative pt-32 pb-10 md:pt-40">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-radial-glow" />
          <div className="container-x">
            <Link href="/integrations" className="inline-flex items-center gap-1 text-[12.5px] text-ink-faint hover:text-white">
              <ArrowLeft className="h-3 w-3" />
              All integrations
            </Link>
            <p className="eyebrow mt-6">Integration · {i.category}</p>
            <h1 className="mt-3 text-display-xl">
              <span className="text-grad">{i.name}</span>
            </h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-ink-dim">{i.tagline}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/app" className="btn-primary">
                Connect <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/integrations" className="btn-ghost">All integrations</Link>
            </div>
          </div>
        </section>

        <section className="pb-24">
          <div className="container-x max-w-3xl space-y-12">
            <div>
              <h2 className="text-[24px] font-semibold tracking-tight">
                <span className="font-serif italic font-normal text-grad-brand">Setup</span>
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-dim">{i.setup}</p>
            </div>

            <div>
              <h2 className="text-[24px] font-semibold tracking-tight">
                <span className="font-serif italic font-normal text-grad-brand">Config</span>
              </h2>
              <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/[0.06] bg-bg-1 p-5 font-mono text-[13px] leading-relaxed text-ink whitespace-pre-wrap">
                {i.configSnippet}
              </pre>
            </div>

            <div>
              <h2 className="text-[24px] font-semibold tracking-tight">
                <span className="font-serif italic font-normal text-grad-brand">Used by</span>
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {i.usedBy.map((slug) => {
                  const a = getAgentProfile(slug);
                  if (!a) return null;
                  return (
                    <Link
                      key={slug}
                      href={`/agents/${slug}`}
                      className="card card-hover group flex items-center justify-between p-4"
                    >
                      <span className="font-mono text-[14px] font-bold text-cyan-glow">{a.name}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-ink-dim transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="text-[24px] font-semibold tracking-tight">
                <span className="font-serif italic font-normal text-grad-brand">Notes</span>
              </h2>
              <ul className="mt-4 space-y-2 pl-5 list-disc text-[15px] leading-relaxed text-ink-dim">
                {i.notes.map((n) => <li key={n}>{n}</li>)}
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
