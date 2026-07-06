import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { isFounderEmail } from '@/lib/constants';
import { FounderDashboard } from '@/components/dashboard/founder-dashboard';

export const metadata: Metadata = {
  title: 'founder metrics',
  robots: { index: false, follow: false },
};

// Server-side gate so the page never renders for anyone but the founder. The
// /api/founder/metrics route enforces the same check independently, so data is
// safe even if this redirect were ever bypassed.
export default async function FounderPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || !isFounderEmail(session.user.email)) {
    redirect('/app');
  }
  return <FounderDashboard />;
}
