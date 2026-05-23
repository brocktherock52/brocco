import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { CheckoutClient } from './checkout-client';

// Intermediate page between the marketing site and Stripe Checkout. The role
// of this surface: anchor value, offer the annual upgrade, and reassure trust
// signals before sending the visitor to enter their card. Stripe Checkout
// itself is opened on click of the primary CTA via /api/checkout.

type Tier = 'solo' | 'team';

interface TierSpec {
  id: Tier;
  name: string;
  tagline: string;
  monthly: number;
  annual: number;
  perks: string[];
  bestFor: string;
}

const TIERS: Record<Tier, TierSpec> = {
  solo: {
    id: 'solo',
    name: 'Solo',
    tagline: 'For founders running ops with agents.',
    monthly: 49,
    annual: 41,
    bestFor: 'Solo founders. Side-project shippers. Indie ops.',
    perks: [
      '2,000 runs per month, hosted on us',
      '5 agents running in parallel',
      'All 13 built-in tools',
      'Custom tools via factory pattern',
      'JSONL audit log on every run',
      'Email support',
      '7-day trial. Cancel anytime.',
    ],
  },
  team: {
    id: 'team',
    name: 'Team',
    tagline: 'For ops teams replacing entire workflows.',
    monthly: 199,
    annual: 166,
    bestFor: 'Ops teams. Agencies. Founders past first hire.',
    perks: [
      '10,000 runs per month, hosted on us',
      'Unlimited parallel agents',
      '5 included seats',
      'SSO + audit logs',
      'Slack support, 1-hour SLA',
      'Workspace sharing + comments',
      '7-day trial. Cancel anytime.',
    ],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ tier: string }> }): Promise<Metadata> {
  const { tier } = await params;
  const spec = TIERS[tier as Tier];
  if (!spec) return { title: 'Checkout' };
  return {
    title: `Start your ${spec.name} trial`,
    description: spec.tagline,
    robots: { index: false, follow: true },
  };
}

export default async function CheckoutPage({ params }: { params: Promise<{ tier: string }> }) {
  const { tier } = await params;
  const spec = TIERS[tier as Tier];
  if (!spec) notFound();

  return (
    <>
      <Nav />
      <main className="relative min-h-screen pb-24 pt-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px]"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.18), transparent 55%), radial-gradient(ellipse at 50% 30%, rgba(103,232,249,0.10), transparent 65%)',
          }}
        />
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <p className="pill mx-auto">checkout</p>
            <h1 className="mt-5 text-display-lg lowercase">
              <span className="text-grad">start your</span>{' '}
              <span className="font-serif italic font-normal text-grad-brand">{spec.name} trial.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-[16px] text-ink-dim">
              7 days free. cancel anytime. card charged on day 8.
            </p>
          </div>

          <CheckoutClient
            tier={spec.id}
            name={spec.name}
            monthly={spec.monthly}
            annual={spec.annual}
            perks={spec.perks}
            bestFor={spec.bestFor}
            tagline={spec.tagline}
          />

          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px] text-ink-faint">
            <span>$0 charged today</span>
            <span>·</span>
            <span>cancel in one click</span>
            <span>·</span>
            <span>SOC 2 in progress</span>
            <span>·</span>
            <span>your data never trains a model</span>
          </div>

          <p className="mx-auto mt-10 max-w-lg text-center text-[13px] text-ink-dim">
            Not sure yet? <Link href="/app" className="text-cyan-glow hover:underline">try the demo, no card</Link> or{' '}
            <Link href="/pricing" className="text-cyan-glow hover:underline">compare all plans</Link>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
