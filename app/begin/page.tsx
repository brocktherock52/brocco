import { BeginCheckout } from './begin-checkout';

export const metadata = { title: 'Start your Brocco trial', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function BeginPage({ searchParams }: { searchParams: Promise<{ tier?: string; interval?: string }> }) {
  const params = await searchParams;
  const tier = ['solo', 'team', 'wholesaler'].includes(params.tier || '') ? params.tier! : 'solo';
  const interval = tier === 'wholesaler' ? 'monthly' : params.interval === 'annual' ? 'annual' : 'monthly';
  return <BeginCheckout tier={tier} interval={interval} />;
}
