import { notFound, redirect } from 'next/navigation';

export const metadata = { title: 'Start your trial', robots: { index: false, follow: false } };

// Keep existing campaign links working through the same account-first flow.
export default async function CheckoutPage({ params, searchParams }: {
  params: Promise<{ tier: string }>;
  searchParams: Promise<{ interval?: string }>;
}) {
  const { tier } = await params;
  if (!['solo', 'team', 'wholesaler'].includes(tier)) notFound();
  const { interval } = await searchParams;
  redirect(`/start?tier=${tier}&interval=${interval === 'annual' && tier !== 'wholesaler' ? 'annual' : 'monthly'}`);
}
