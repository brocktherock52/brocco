import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { FinalCta } from '@/components/final-cta';
import { capabilities, getCapability } from '@/lib/capabilities-data';
import { CapabilityDemo } from '@/components/capabilities/demos';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return capabilities.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const c = getCapability(slug);
  if (!c) return { title: 'Not found' };
  return {
    title: `${c.name} - brocco AI team`,
    description: c.hero.slice(0, 160),
    alternates: { canonical: `/capabilities/${c.slug}` },
  };
}

export default async function CapabilityPage({ params }: PageProps) {
  const { slug } = await params;
  const c = getCapability(slug);
  if (!c) notFound();

  return (
    <>
      <Nav />
      <main>
        <section className="relative pt-32 pb-10 md:pt-40">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-radial-glow" />
          <div className="container-x">
            <Link
              href="/capabilities"
              className="inline-flex items-center gap-1 text-[12.5px] text-ink-faint hover:text-white"
            >
              <ArrowLeft className="h-3 w-3" />
              all capabilities
            </Link>
            <p className="eyebrow mt-6">
              {c.icon} {c.lane}
            </p>
            <h1 className="mt-3 text-display-lg lowercase">
              <span className="text-grad">{c.name}</span>
            </h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-ink-dim">{c.hero}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary">
                start free <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/capabilities" className="btn-ghost">
                all capabilities
              </Link>
            </div>
          </div>
        </section>

        <section className="pb-24">
          <div className="container-x max-w-3xl space-y-12">
            {c.demo !== 'none' && (
              <div className="card p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-[20px] font-semibold tracking-tight text-white">try it</h2>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan/20 bg-cyan/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-glow">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-glow" />
                    interactive preview
                  </span>
                </div>
                <CapabilityDemo kind={c.demo} />
                <p className="mt-4 text-[12.5px] text-ink-faint">
                  this is a sample of the output format. sign in to run the real team on your own
                  brief.
                </p>
              </div>
            )}

            <div className="grid gap-10 md:grid-cols-2">
              <div>
                <h2 className="text-[22px] font-semibold tracking-tight">
                  <span className="font-serif italic font-normal text-grad-brand">what the team does</span>
                </h2>
                <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-ink-dim">
                  {c.what.map((w) => (
                    <li key={w} className="flex gap-2">
                      <span className="text-cyan-glow">▹</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-[22px] font-semibold tracking-tight">
                  <span className="font-serif italic font-normal text-grad-brand">what you get</span>
                </h2>
                <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-ink-dim">
                  {c.outcomes.map((o) => (
                    <li key={o} className="flex gap-2">
                      <span className="text-accent-green">✓</span>
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-[22px] font-semibold tracking-tight">
                <span className="font-serif italic font-normal text-grad-brand">how it works</span>
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {c.steps.map((s, i) => (
                  <div key={s.title} className="card p-4">
                    <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-cyan/15 text-[13px] font-semibold text-cyan-glow">
                      {i + 1}
                    </div>
                    <div className="text-[14px] font-semibold text-white">{s.title}</div>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-dim">{s.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-10 md:grid-cols-2">
              <div>
                <h2 className="text-[22px] font-semibold tracking-tight">
                  <span className="font-serif italic font-normal text-grad-brand">under the hood</span>
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {c.stack.map((s) => (
                    <span
                      key={s}
                      className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-[13.5px] text-ink-dim"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-[22px] font-semibold tracking-tight">
                  <span className="font-serif italic font-normal text-grad-brand">who runs it</span>
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {c.team.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-cyan/20 bg-cyan/5 px-3 py-1.5 font-mono text-[13px] text-cyan-glow"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
