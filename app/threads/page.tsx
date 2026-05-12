import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { ThreadsFeed } from '@/components/threads-feed';

export const metadata: Metadata = {
  title: 'threads — brocco.ai',
  description:
    'What the brocco team is shipping, learning, and posting. Daily updates on building a multi-agent platform in public.',
  openGraph: {
    title: 'threads — brocco.ai',
    description: 'Daily updates from building brocco — the multi-agent platform that runs N AI agents in parallel.',
  },
};

export default function ThreadsPage() {
  return (
    <>
      <Nav />
      <main className="relative pb-24 pt-32 md:pt-36">
        {/* Editorial header */}
        <section className="container-x">
          <div className="mx-auto max-w-3xl text-center">
            <p className="pill mx-auto">the threads</p>
            <h1 className="mt-5 text-display-xl lowercase">
              <span className="text-grad">building brocco</span>{' '}
              <span className="font-serif italic font-normal text-grad-brand">in public.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-ink-dim">
              what the team is shipping, learning, breaking, and arguing about today. a running log
              from a one-person studio building a multi-agent runtime that does the work.
            </p>
            <div className="mx-auto mt-7 flex flex-wrap items-center justify-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
              <span>follow</span>
              <a href="https://threads.net/@brockpivec" target="_blank" rel="noreferrer noopener" className="text-cyan-glow hover:underline">@brockpivec on threads</a>
              <span>·</span>
              <a href="https://x.com/brockpivec" target="_blank" rel="noreferrer noopener" className="text-cyan-glow hover:underline">@brockpivec on x</a>
              <span>·</span>
              <a href="https://github.com/brocktherock52/brocco" target="_blank" rel="noreferrer noopener" className="text-cyan-glow hover:underline">github</a>
            </div>
          </div>
        </section>

        {/* Feed of pinned posts — editorialized "thread" style */}
        <ThreadsFeed />
      </main>
      <Footer />
    </>
  );
}
