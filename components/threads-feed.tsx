'use client';

/**
 * ThreadsFeed — vertical scrolling feed of "thread" cards.
 *
 * Visual reference: Threads / Mastodon / Bluesky single-column feed.
 * Each post is a card with author handle + timestamp + body + tags.
 * Threaded replies are indented inside a parent card.
 *
 * Data: hardcoded MVP posts for the v1 launch. Future: pull from a CMS /
 * Threads API / RSS feed.
 */

import Image from 'next/image';
import { motion } from 'framer-motion';
import { MessageCircle, Repeat2, Heart, Share2 } from 'lucide-react';

interface ThreadPost {
  id: string;
  ago: string;
  body: string;
  tags?: string[];
  replies?: { handle: string; body: string }[];
  stats: { likes: number; replies: number; reposts: number };
}

const POSTS: ThreadPost[] = [
  {
    id: 't-001',
    ago: '2h ago',
    body: 'shipping the v4.6 bento + 9 cute cast cards tonight. each one is the same brocco-croc in a different role. cute beats photoreal when you ship in 4 months solo.',
    tags: ['#buildinpublic', '#brocco'],
    stats: { likes: 24, replies: 3, reposts: 5 },
  },
  {
    id: 't-002',
    ago: '6h ago',
    body: 'shipped the /api/v1/run streaming fix. anthropic sse deltas now stream per-token through to the browser. previous version buffered the whole step. yc-grade fix or no demo.',
    tags: ['#anthropic', '#sse', '#shipping'],
    stats: { likes: 41, replies: 7, reposts: 12 },
  },
  {
    id: 't-003',
    ago: '12h ago',
    body: 'gstack review chain ran the full ceo → eng → design → devex sequence on the brocco plan tonight. 5 reviews. ~20 commits. 35/35 tests passing. site is materially better than this morning.',
    tags: ['#gstack', '#reviews'],
    replies: [
      {
        handle: '@brockpivec',
        body: 'the eng review caught a real ship-killer: /api/v1/run was non-streaming. without the fix, the homepage promise of "5 panes streaming live in 3 seconds" could not work. tests caught it. shipped the fix.',
      },
    ],
    stats: { likes: 17, replies: 2, reposts: 4 },
  },
  {
    id: 't-004',
    ago: '1d ago',
    body: 'brocco.ai → brocco.dev. someone is squatting brocco.ai with a stealth crypto wallet that has not shipped in 2 years. their loss. brocco.dev coming up.',
    tags: ['#domain', '#shipit'],
    stats: { likes: 8, replies: 1, reposts: 0 },
  },
  {
    id: 't-005',
    ago: '2d ago',
    body: 'building brocco solo. 4 months in. 18 repos. 70 routes live. real stripe ($49 / $199 monthly). zero paying users (yet — launch is in 14 days). applying to YC. wish me luck.',
    tags: ['#yc', '#solofounder'],
    stats: { likes: 156, replies: 23, reposts: 31 },
  },
  {
    id: 't-006',
    ago: '3d ago',
    body: 'the wedge: BYOK + zero data retention + broadcast (not chat). you bring your anthropic key, we never see your prompts, you run N agents in parallel. the people who already pay anthropic are the people brocco is for.',
    tags: ['#byok', '#anthropic', '#agents'],
    stats: { likes: 84, replies: 11, reposts: 19 },
  },
  {
    id: 't-007',
    ago: '5d ago',
    body: 'recipe i have been running this week: research the top 3 alternatives to <competitor>, output a 1-page brief with a recommendation, save to notion. 4 agents fan out, 90 seconds end to end. used to take me 2 hours.',
    tags: ['#workflow', '#agents'],
    stats: { likes: 67, replies: 14, reposts: 22 },
  },
  {
    id: 't-008',
    ago: '7d ago',
    body: 'every ai-agent startup is pitching the same demo. broadcast-first dashboard is the wedge nobody else is doing. easy to copy, hard to be first.',
    tags: ['#strategy'],
    stats: { likes: 32, replies: 5, reposts: 8 },
  },
];

export function ThreadsFeed() {
  return (
    <section className="container-x mt-14">
      <div className="mx-auto max-w-2xl space-y-4">
        {POSTS.map((post, i) => (
          <ThreadCard key={post.id} post={post} index={i} />
        ))}

        <div className="mt-12 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
            that is the feed so far
          </p>
          <h2 className="mt-4 text-display-lg lowercase">
            <span className="text-grad">keep up</span>{' '}
            <span className="font-serif italic font-normal text-grad-brand">in real time.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[14.5px] text-ink-dim">
            this page mirrors the highlights. for daily updates as they ship, the original threads
            live on the platforms below.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://threads.net/@brockpivec"
              target="_blank"
              rel="noreferrer noopener"
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-[14px]"
            >
              follow on threads
            </a>
            <a
              href="https://x.com/brockpivec"
              target="_blank"
              rel="noreferrer noopener"
              className="btn-ghost inline-flex items-center gap-2 px-5 py-2.5 text-[14px]"
            >
              follow on x
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ThreadCard({ post, index }: { post: ThreadPost; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay: (index % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-white/[0.08] bg-bg-1/60 p-5 transition-colors hover:border-white/[0.14] hover:bg-bg-1/80"
    >
      <header className="flex items-center gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10">
          <Image src="/assets/brocco-mark-transparent.png" alt="" fill className="object-cover" sizes="40px" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold tracking-tight">
            brocco{' '}
            <span className="font-normal text-ink-dim">@brockpivec</span>
          </p>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
            {post.ago}
          </p>
        </div>
      </header>

      <div className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
        {post.body}
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 font-mono text-[12px] text-cyan-glow">
          {post.tags.map((t) => (
            <span key={t} className="opacity-80">{t}</span>
          ))}
        </div>
      )}

      {post.replies && post.replies.length > 0 && (
        <div className="mt-4 border-l-2 border-white/10 pl-4 space-y-3">
          {post.replies.map((r, i) => (
            <div key={i} className="text-[14px] leading-relaxed">
              <p className="text-ink-dim">
                <span className="text-ink">{r.handle}</span>{' '}
                <span className="text-ink-faint">replying</span>
              </p>
              <p className="mt-1">{r.body}</p>
            </div>
          ))}
        </div>
      )}

      <footer className="mt-4 flex items-center gap-5 font-mono text-[11px] text-ink-faint">
        <span className="inline-flex items-center gap-1.5">
          <Heart className="h-3.5 w-3.5" /> {post.stats.likes}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MessageCircle className="h-3.5 w-3.5" /> {post.stats.replies}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Repeat2 className="h-3.5 w-3.5" /> {post.stats.reposts}
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 opacity-60">
          <Share2 className="h-3.5 w-3.5" /> share
        </span>
      </footer>
    </motion.article>
  );
}
