import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

/**
 * Homepage feature section for Mission Control, the operator dashboard built by
 * the parallel session and shipped as static files under public/mission-control/.
 * Links out to the landing (/mission-control) and the live demo
 * (/mission-control/app). Uses plain <a> because those are static pages outside
 * the Next App Router.
 */
export function MissionControlCta() {
  return (
    <section id="mission-control" className="relative py-24 md:py-28">
      <div className="container-x grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="pill">mission control</p>
          <h2 className="mt-5 text-display-lg lowercase">
            <span className="text-grad">run your</span>{' '}
            <span className="font-serif italic font-normal text-grad-brand">whole company.</span>
          </h2>
          <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-ink-dim">
            One screen for every venture, every dollar, every meeting. An hourly pulse and a voice
            assistant you can talk to. Your AI team does the work; Mission Control is where you run
            it all. Bring your own data or start from a live demo.
          </p>
          <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2 text-[14px] text-ink-dim sm:grid-cols-2">
            <li className="flex items-center gap-2"><span className="text-cyan-glow">+</span> ventures as a galaxy</li>
            <li className="flex items-center gap-2"><span className="text-cyan-glow">+</span> every dollar logged</li>
            <li className="flex items-center gap-2"><span className="text-cyan-glow">+</span> talk to your company</li>
            <li className="flex items-center gap-2"><span className="text-cyan-glow">+</span> private by default</li>
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="/mission-control" className="btn-primary">
              Open Mission Control <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <a href="/mission-control/app" className="btn-ghost">
              Try the live demo
            </a>
          </div>
        </div>
        <a
          href="/mission-control"
          className="group relative block overflow-hidden rounded-3xl border border-white/[0.08] bg-bg-1/40 shadow-glow2"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(34,211,238,0.5), rgba(167,139,250,0.4), transparent)',
            }}
          />
          <Image
            src="/assets/home/mission-control-croc.png"
            alt="The Brocco croc commanding a mission control dashboard of every venture, dollar, and meeting"
            width={1200}
            height={896}
            sizes="(max-width: 1024px) 100vw, 560px"
            className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </a>
      </div>
    </section>
  );
}
