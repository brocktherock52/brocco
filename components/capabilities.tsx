import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { capabilities } from '@/lib/capabilities-data';

const WORKFLOW_PREVIEWS: Record<string, { name: string; tagline: string }> = {
  'website-builder': { name: 'Website planning', tagline: 'Example: draft a page outline, copy, and code for review.' },
  'content-studio': { name: 'Content planning', tagline: 'Example: develop hooks, scripts, and captions from your brief.' },
  'outreach-engine': { name: 'Outreach drafts', tagline: 'Example: prepare messages using the audience context you provide.' },
  'market-intel': { name: 'Market analysis', tagline: 'Example: compare market information and explain assumptions.' },
  'deep-research': { name: 'Research briefs', tagline: 'Example: summarize sources and flag questions to verify.' },
  automation: { name: 'Operations planning', tagline: 'Example: turn a recurring task into a checklist for review.' },
};

/**
 * Capabilities, the homepage section that reframes every venture lane as
 * something the brocco team ships for you: sites, content, outreach, intel,
 * research, ops. Each card deep-links to its own /capabilities/[slug] page
 * with a live, in-browser demo. Matches the house cyberpunk design system.
 */
export function Capabilities() {
  return (
    <section id="capabilities" className="relative py-24 md:py-32">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="pill">capabilities</p>
          <h2 className="mt-5 text-display-lg lowercase">
            <span className="text-grad">one team.</span>{' '}
            <span className="text-grad-brand">different ways to work.</span>
          </h2>
          <p className="mt-4 max-w-xl text-[16px] text-ink-dim">
            Illustrative tasks to adapt to your needs. Ask for research, plans, and drafts, then review the results before using them.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c) => (
            <Link
              key={c.slug}
              href={`/capabilities/${c.slug}`}
              className="card card-hover group relative block overflow-hidden p-5"
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${c.accent} opacity-0 transition group-hover:opacity-100`}
              />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{c.icon}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                    {c.lane}
                  </span>
                </div>
                <h3 className="mt-3 text-[15px] font-semibold tracking-tight text-white group-hover:text-cyan-glow">
                  {WORKFLOW_PREVIEWS[c.slug]?.name ?? c.name}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-dim">{WORKFLOW_PREVIEWS[c.slug]?.tagline ?? 'Explore an illustrative workflow.'}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/capabilities"
            className="group inline-flex items-center gap-2 text-[14px] text-cyan-glow"
          >
            explore all capabilities
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
