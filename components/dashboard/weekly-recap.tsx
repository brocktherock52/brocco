'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Flame, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getCastMember } from '@/lib/agent-cast';
import { getStreak } from '@/lib/streak';
import type { AgentName } from '@/lib/agents';

// WeeklyRecap — the second high-frequency surface besides the morning
// briefing. Anchored at Sunday 18:00 user-local (the component itself
// just renders the past 7 days whenever it's loaded; the "what to look
// at" framing is the cron job's job once we have one).
//
// Reads brocco:history from localStorage. Renders four cards:
//   1. runs by agent (top 3)
//   2. streak progress (current count + best of the week)
//   3. top 3 outputs (most recent done runs)
//   4. suggested next moves (delegates to lib/suggestions for ideas)

interface RunHistoryEntry {
  id: string;
  goal: string;
  agents: AgentName[];
  ts: number;
}

const AGENT_ACCENTS: Record<string, string> = {
  supervisor: '#22C55E',
  researcher: '#67E8F9',
  analyst: '#A78BFA',
  outreach: '#FBBF24',
  coder: '#4ADE80',
  browser: '#67E8F9',
  designer: '#F472B6',
  planner: '#FB7185',
  app_builder: '#22D3EE',
};

function readHistory(): RunHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('brocco:history');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RunHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function WeeklyRecap() {
  const [history, setHistory] = useState<RunHistoryEntry[]>([]);
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    setHistory(readHistory());
    setStreakCount(getStreak().count);
  }, []);

  const stats = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = history.filter((h) => h.ts >= sevenDaysAgo);

    const byAgent = new Map<string, number>();
    for (const h of recent) {
      for (const a of h.agents) byAgent.set(a, (byAgent.get(a) ?? 0) + 1);
    }
    const topAgents = [...byAgent.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

    const topGoals = [...recent].sort((a, b) => b.ts - a.ts).slice(0, 3);

    const runsByDay: number[] = Array(7).fill(0);
    for (const h of recent) {
      const daysAgo = Math.floor((Date.now() - h.ts) / (24 * 60 * 60 * 1000));
      const idx = 6 - Math.min(daysAgo, 6);
      runsByDay[idx] += 1;
    }

    return {
      totalRuns: recent.length,
      topAgents,
      topGoals,
      runsByDay,
    };
  }, [history]);

  const peak = Math.max(1, ...stats.runsByDay);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <header className="mb-10">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
          <Calendar className="mr-1 inline h-3 w-3" />
          last 7 days  ·  weekly recap
        </p>
        <h1 className="mt-3 text-[32px] font-semibold tracking-tight lowercase md:text-[40px]">
          <span className="text-grad">your week with brocco.</span>{' '}
          <span className="font-serif italic font-normal text-grad-brand">what shipped.</span>
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-dim">
          a quiet sunday view of the week your team just worked. open this every sunday at 6 pm.
        </p>
      </header>

      {stats.totalRuns === 0 ? (
        <EmptyWeek />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <RecapCard title="runs this week" accent="#22C55E" Icon={Sparkles}>
            <p className="text-[44px] font-semibold tabular-nums text-ink">{stats.totalRuns}</p>
            <p className="mt-1 text-[12.5px] text-ink-dim">broadcasts across all agents</p>

            <div className="mt-5 flex items-end gap-1.5">
              {stats.runsByDay.map((n, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <motion.div
                    className="w-full rounded-t bg-emerald-400/40"
                    initial={{ height: 0 }}
                    animate={{ height: `${(n / peak) * 60 + 4}px` }}
                    transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    style={{ boxShadow: '0 0 12px rgba(74, 222, 128, 0.3)' }}
                  />
                  <span className="font-mono text-[9.5px] text-ink-faint">
                    {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'][i]}
                  </span>
                </div>
              ))}
            </div>
          </RecapCard>

          <RecapCard title="streak" accent="#FBBF24" Icon={Flame}>
            <div className="flex items-baseline gap-3">
              <p className="text-[44px] font-semibold tabular-nums text-ink">{streakCount}</p>
              <span className="text-[14px] text-ink-dim">day{streakCount === 1 ? '' : 's'}</span>
            </div>
            <p className="mt-1 text-[12.5px] text-ink-dim">
              {streakCount === 0 ? 'open /app to start one' : streakCount < 7 ? 'keep it going — 7 days unlocks fuchsia mode' : streakCount < 30 ? 'in fuchsia. 30 days = gold.' : 'gold streak. legend.'}
            </p>
            {streakCount > 0 && (
              <div className="mt-5">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: `${Math.min((streakCount / 30) * 100, 100)}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-gradient-to-r from-amber-400 via-fuchsia-400 to-yellow-300"
                  />
                </div>
                <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
                  {Math.max(0, 30 - streakCount)} days to gold
                </p>
              </div>
            )}
          </RecapCard>

          <RecapCard title="busiest agents" accent="#67E8F9" Icon={TrendingUp}>
            <ul className="space-y-3">
              {stats.topAgents.map(([agent, count], i) => {
                const member = getCastMember(agent);
                const accent = AGENT_ACCENTS[agent] ?? '#67E8F9';
                const pct = Math.round((count / stats.totalRuns) * 100);
                return (
                  <li key={agent} className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-black">
                      {member?.imagePath && (
                        <Image
                          src={member.imagePath}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <p className="text-[13px] font-medium tabular-nums">
                          <span style={{ color: accent }}>{count}</span>{' '}
                          <span className="text-ink-faint">runs</span>
                        </p>
                        <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
                          {agent}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                        <motion.div
                          initial={{ width: '0%' }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, delay: 0.15 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full"
                          style={{ background: accent, boxShadow: `0 0 8px ${accent}55` }}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </RecapCard>

          <RecapCard title="most recent goals" accent="#F472B6" Icon={ArrowRight}>
            <ul className="space-y-2.5">
              {stats.topGoals.map((g) => (
                <li
                  key={g.id}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5"
                >
                  <p className="line-clamp-2 text-[12.5px] leading-snug text-ink">{g.goal}</p>
                  <p className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                    <span>{relTime(g.ts)}</span>
                    <span>·</span>
                    <span>{g.agents.join(', ')}</span>
                  </p>
                </li>
              ))}
            </ul>
          </RecapCard>
        </div>
      )}

      <div className="mt-10 flex justify-center">
        <Link
          href="/app"
          className="group inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand to-cyan px-5 py-2.5 text-[13px] font-semibold text-white shadow-glow2 transition-all hover:shadow-glow"
        >
          start this week strong
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

function RecapCard({
  title,
  accent,
  Icon,
  children,
}: {
  title: string;
  accent: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-bg-1/60 p-5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-2 -z-10 rounded-2xl opacity-50 blur-2xl"
        style={{ background: `radial-gradient(circle at 30% 20%, ${accent}25 0%, transparent 60%)` }}
      />
      <div className="mb-4 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
        <Icon className="h-3 w-3" style={{ color: accent }} />
        {title}
      </div>
      {children}
    </motion.section>
  );
}

function EmptyWeek() {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.10] bg-white/[0.02] p-12 text-center">
      <p className="text-[15px] text-ink-dim">
        nothing to recap yet. open <Link href="/app" className="underline-offset-4 hover:underline">/app</Link> and broadcast your first goal.
      </p>
    </div>
  );
}

function relTime(ts: number): string {
  const s = (Date.now() - ts) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
