import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { capabilities } from '@/lib/capabilities-data';

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
            <span className="text-grad-brand">everything you need shipped.</span>
          </h2>
          <p className="mt-4 max-w-xl text-[16px] text-ink-dim">
            not a chatbot. a team of agents that builds sites, makes content, runs outreach, and
            turns research into decisions, end to end, with you in the approval loop.
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
                  {c.name}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-dim">{c.tagline}</p>
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
