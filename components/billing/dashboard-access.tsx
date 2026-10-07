'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { fetchBillingAccess, type BillingAccess } from '@/lib/billing-client';

export function DashboardAccess({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isFounderPage = usePathname() === '/app/founder';
  const [access, setAccess] = useState<BillingAccess | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (isFounderPage) return;
    let active = true;
    setError(null);
    fetchBillingAccess().then((result) => {
      if (!active) return;
      if (!result.authenticated) { router.replace('/signup?callbackURL=%2Fstart'); return; }
      if (!result.canPreviewDashboard && !result.canUseTools) { router.replace('/start'); return; }
      setAccess(result);
    }).catch((e) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [router, attempt, isFounderPage]);
  // The read-only founder page and its API enforce founder identity server-side.
  if (isFounderPage) return <>{children}</>;
  if (!access) return <main className="flex min-h-screen items-center justify-center bg-bg-0 p-6 text-ink"><div className="max-w-md text-center">{error ? <><p role="alert">{error}</p><button className="btn-primary mt-4" onClick={() => setAttempt((n) => n + 1)}>Retry</button><Link href="/account" className="mt-4 block text-cyan-glow">Manage billing</Link></> : <p role="status" className="flex items-center gap-3"><Loader2 className="h-5 w-5 animate-spin" />Checking your account...</p>}</div></main>;
  return <>{children}</>;
}
