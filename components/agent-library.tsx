'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Search, Sparkles } from 'lucide-react';
import {
  getLibrary,
  CATEGORIES,
  type Category,
  type LibraryAgent,
} from '@/lib/agent-library';
import { CustomCroc } from '@/components/custom-croc';

// AgentLibrary — 888 specialist agents, paginated + filterable.
// Each card is forkable. Clicking a card opens the wizard at
// /app/agents/new with all fields prefilled.

const PAGE_SIZE = 48;

export function AgentLibrary() {
  const all = useMemo(() => getLibrary(), []);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<Category | 'all'>('all');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((a) => {
      if (cat !== 'all' && a.category !== cat) return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.seniority.toLowerCase().includes(q)
      );
    });
  }, [all, cat, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <section className="relative py-16 md:py-24">
      <div className="container-x">
        <header className="mx-auto max-w-2xl text-center">
          <p className="pill mx-auto inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            the library
          </p>
          <h1 className="mt-5 text-display-xl">
            <span className="text-grad">888 specialists.</span>{' '}
            <span className="font-serif italic font-normal text-grad-brand">one click to hire.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15.5px] leading-relaxed text-ink-dim">
            every agent in the brocco library, derived from the skills catalog and bundled into
            forkable specialist crocs. browse, search, fork.
          </p>
        </header>

        {/* Search + category filter */}
        <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-3">
          <label className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-ink-faint" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder="search 888 agents · role, name, category..."
              className="block w-full rounded-full border border-white/[0.08] bg-white/[0.02] py-2.5 pl-10 pr-4 text-[14px] text-ink outline-none transition focus:border-white/[0.2] focus:bg-white/[0.04]"
            />
          </label>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <CategoryChip
              active={cat === 'all'}
              onClick={() => {
                setCat('all');
                setPage(0);
              }}
              label="all · 888"
              accent="#FFFFFF"
            />
            {CATEGORIES.map((c) => {
              const count = all.filter((a) => a.category === c.id).length;
              return (
                <CategoryChip
                  key={c.id}
                  active={cat === c.id}
                  onClick={() => {
                    setCat(c.id);
                    setPage(0);
                  }}
                  label={`${c.label} · ${count}`}
                  accent={c.accent}
                />
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {pageItems.map((a, i) => (
            <LibraryCard key={a.slug} agent={a} index={i} />
          ))}
        </div>

        {/* Pagination */}
        <div className="mx-auto mt-10 flex max-w-md items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-ink-dim transition hover:border-white/[0.2] hover:text-white disabled:opacity-30"
          >
            ← prev
          </button>
          <span>
            page {page + 1} of {pageCount}  ·  {filtered.length} agents
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page >= pageCount - 1}
            className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-ink-dim transition hover:border-white/[0.2] hover:text-white disabled:opacity-30"
          >
            next →
          </button>
        </div>
      </div>
    </section>
  );
}

function CategoryChip({
  active,
  onClick,
  label,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  accent: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] transition ${
        active ? 'border-white/40 bg-white/[0.06] text-white' : 'border-white/[0.08] bg-white/[0.02] text-ink-dim hover:border-white/[0.16] hover:text-white'
      }`}
      style={active ? { boxShadow: `inset 0 0 0 1px ${accent}33` } : undefined}
    >
      {label}
    </button>
  );
}

function LibraryCard({ agent, index }: { agent: LibraryAgent; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index % 12) * 0.03, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/app/agents/new?fork=${agent.slug}`}
        className="group relative block overflow-hidden rounded-2xl border border-white/[0.08] bg-bg-1/60 p-1 transition hover:-translate-y-1 hover:border-white/[0.18] hover:shadow-glow"
        style={{ ['--accent' as string]: agent.accent }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-1 -z-10 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-60"
          style={{ background: `radial-gradient(circle at 30% 20%, ${agent.accent}33 0%, transparent 60%)` }}
        />

        <div className="relative aspect-square overflow-hidden rounded-xl bg-black">
          <CustomCroc
            accent={agent.accent}
            accessory={agent.accessory}
            className="absolute inset-0 h-full w-full"
          />
          <span
            className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full border bg-bg-1/80 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] backdrop-blur-md"
            style={{ borderColor: `${agent.accent}55`, color: agent.accent }}
          >
            <span
              className="inline-block h-1 w-1 rounded-full"
              style={{ background: agent.accent, boxShadow: `0 0 5px ${agent.accent}` }}
            />
            {agent.category}
          </span>
        </div>

        <div className="px-2 py-2.5">
          <p className="text-[13px] font-semibold tracking-tight text-white">{agent.name}</p>
          <p className="mt-0.5 line-clamp-1 text-[11.5px] text-ink-dim">{agent.role}</p>
          <p
            className="mt-2 inline-flex items-center gap-1 text-[11px] opacity-70 transition group-hover:opacity-100"
            style={{ color: agent.accent }}
          >
            fork
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
