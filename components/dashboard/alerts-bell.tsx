'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, RefreshCw, Sparkles } from 'lucide-react';
import { listAlerts, markAlertRead, type ClientAlert } from '@/lib/threads-client';

// The "watching out for you" notification bell. Polls /api/alerts for unread
// notifications the cron watcher (refresh_due) and client refreshes
// (changes_found) have filed, badges the count, and lists them with the
// "what changed" summary. Uses the amber/rose language from freshnessMeta.

interface AlertsBellProps {
  /** jump to a project (open its history entry / refresh it) */
  onOpenProject?: (threadId: string) => void;
  /** external trigger to re-fetch (e.g. after a refresh completes) */
  refreshSignal?: number;
}

export function AlertsBell({ onOpenProject, refreshSignal }: AlertsBellProps) {
  const [alerts, setAlerts] = useState<ClientAlert[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    const res = await listAlerts(false);
    setAlerts(res.alerts);
    setUnread(res.unreadCount);
  }, []);

  useEffect(() => {
    load();
    // light polling so the cron's alerts surface without a manual reload
    const t = setInterval(load, 60_000);
    // local (demo) alerts fire this event when seeded or after a refresh
    const onLocal = () => load();
    window.addEventListener('brocco:alerts-changed', onLocal);
    return () => {
      clearInterval(t);
      window.removeEventListener('brocco:alerts-changed', onLocal);
    };
  }, [load]);

  useEffect(() => {
    if (refreshSignal !== undefined) load();
  }, [refreshSignal, load]);

  async function dismiss(id: string) {
    setAlerts((a) => a.map((x) => (x.id === id ? { ...x, status: 'read' } : x)));
    setUnread((c) => Math.max(0, c - 1));
    await markAlertRead(id);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full border border-white/[0.10] bg-white/[0.04] p-2 text-ink-dim hover:bg-white/[0.07] hover:text-white"
        aria-label="updates and alerts"
        title={unread ? `${unread} update${unread === 1 ? '' : 's'}` : 'No new updates'}
      >
        <Bell className="h-3.5 w-3.5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-bold text-black">
            {unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-full z-40 mt-2 w-[340px] overflow-hidden rounded-xl border border-white/[0.10] bg-bg-1/95 shadow-glow backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                  {unread > 0 ? `${unread} update${unread === 1 ? '' : 's'}` : 'Updates'}
                </span>
                <span className="text-[10.5px] text-ink-faint">watching out for you</span>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {alerts.length === 0 ? (
                  <p className="px-2 py-3 text-[12.5px] text-ink-faint">
                    No updates yet. Your AI team checks your saved projects on a cadence and posts
                    here when something may have changed.
                  </p>
                ) : (
                  alerts.map((a) => {
                    const isChanges = a.kind === 'changes_found';
                    const tone = isChanges
                      ? 'border-cyan-400/20 bg-cyan-400/[0.05]'
                      : 'border-amber-400/20 bg-amber-400/[0.05]';
                    const dot = isChanges ? 'bg-cyan-400' : 'bg-amber-400';
                    return (
                      <div
                        key={a.id}
                        className={`group mb-1.5 rounded-lg border p-2.5 ${tone} ${
                          a.status === 'read' ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink">
                              {isChanges ? (
                                <Sparkles className="h-3 w-3 text-cyan-glow" />
                              ) : (
                                <RefreshCw className="h-3 w-3 text-amber-300" />
                              )}
                              <span className="truncate">
                                {a.threadTitle?.slice(0, 60) || 'Project'}
                              </span>
                            </div>
                            {a.summary && (
                              <p className="mt-1 whitespace-pre-line text-[11.5px] leading-snug text-ink-dim">
                                {a.summary.slice(0, 400)}
                              </p>
                            )}
                            <div className="mt-1.5 flex items-center gap-3">
                              {onOpenProject && (
                                <button
                                  onClick={() => {
                                    onOpenProject(a.threadId);
                                    setOpen(false);
                                  }}
                                  className="text-[10.5px] font-semibold text-cyan-glow hover:underline"
                                >
                                  open project
                                </button>
                              )}
                              {a.status === 'unread' && (
                                <button
                                  onClick={() => dismiss(a.id)}
                                  className="text-[10.5px] text-ink-faint hover:text-white"
                                >
                                  mark read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
