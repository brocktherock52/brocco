'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowRight,
  CreditCard,
  Crown,
  LogOut,
  Mail,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { useSession, signOut } from '@/lib/auth-client';
import { getUsage, remainingFreeRuns, FREE_LIMIT, type Usage } from '@/lib/usage';
import { resetUser } from '@/components/posthog-provider';

type Plan = 'free' | 'solo' | 'team';
const PLAN_LABEL: Record<Plan, string> = { free: 'Free', solo: 'Solo', team: 'Team' };

export default function AccountPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);

  useEffect(() => {
    setUsage(getUsage());
  }, []);

  // Session persists across pages via the cookie; this just guards the page.
  useEffect(() => {
    if (!isPending && !session?.user) router.replace('/login');
  }, [isPending, session, router]);

  if (isPending || !session?.user) {
    return (
      <>
        <Nav />
        <main className="flex min-h-[60vh] items-center justify-center pt-32">
          <Sparkles className="h-5 w-5 animate-pulse text-cyan-glow" />
        </main>
        <Footer />
      </>
    );
  }

  const user = session.user;
  const plan = (((user as { plan?: string }).plan as Plan) || 'free') as Plan;
  const remaining = usage ? remainingFreeRuns(usage) : FREE_LIMIT;

  async function manageBilling() {
    setBillingLoading(true);
    try {
      const r = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      const d = await r.json();
      if (r.ok && d.url) {
        window.location.href = d.url;
        return;
      }
      toast.error(d.detail || 'No billing account linked yet. Start a plan first.');
    } catch {
      toast.error('Could not open the billing portal. Try again.');
    } finally {
      setBillingLoading(false);
    }
  }

  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-28 md:pt-32">
        <h1 className="text-display-md text-grad">Your account</h1>
        <p className="mt-2 text-[15px] text-ink-dim">Plan, billing, and usage.</p>

        {/* Identity */}
        <section className="mt-8 rounded-2xl border border-white/[0.10] bg-bg-1/60 p-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.04]">
              <Mail className="h-4 w-4 text-cyan-glow" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-medium text-ink">{user.email}</p>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                signed in · passwordless
              </p>
            </div>
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[12px] font-semibold text-brand-glow">
              {plan === 'team' && <Crown className="h-3.5 w-3.5" />}
              {PLAN_LABEL[plan]} plan
            </span>
          </div>
          <p className="mt-3 text-[12.5px] leading-relaxed text-ink-faint">
            Sign-in is passwordless (magic link), so there is no password to change. Use
            &ldquo;sign out&rdquo; below to end this session on this device.
          </p>
        </section>

        {/* Usage */}
        <section className="mt-5 rounded-2xl border border-white/[0.10] bg-bg-1/60 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-ink">Runs this month</h2>
            <span className="font-mono text-[12px] text-ink-dim">
              {usage ? usage.month_runs : 0} / {FREE_LIMIT}
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand to-cyan transition-all"
              style={{ width: `${Math.min(100, ((usage?.month_runs ?? 0) / FREE_LIMIT) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-[12.5px] text-ink-faint">
            {remaining > 0
              ? `${remaining} free runs left this month.`
              : 'You are out of free runs. Upgrade for more.'}
          </p>
        </section>

        {/* Plan / upsell */}
        <section className="mt-5 rounded-2xl border border-white/[0.10] bg-bg-1/60 p-5">
          <h2 className="text-[15px] font-semibold text-ink">
            {plan === 'team' ? 'You are on the top plan' : 'Upgrade for more runs + seats'}
          </h2>

          {plan !== 'team' && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {plan === 'free' && (
                <UpsellCard
                  href="/checkout/solo"
                  icon={<Zap className="h-4 w-4" />}
                  title="Solo"
                  blurb="10x the runs, full thread history, PDF export."
                  cta="Upgrade to Solo"
                />
              )}
              <UpsellCard
                href="/checkout/team"
                icon={<Crown className="h-4 w-4" />}
                title="Team"
                blurb="Everything in Solo, plus seats, shared projects, and priority."
                cta={plan === 'solo' ? 'Upgrade to Team' : 'Go Team'}
                featured
              />
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={manageBilling}
              disabled={billingLoading}
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-4 py-2 text-[13px] font-medium text-ink hover:bg-white/[0.07] disabled:opacity-60"
            >
              <CreditCard className="h-4 w-4" />
              {billingLoading ? 'Opening…' : 'Manage billing'}
            </button>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-[13px] text-cyan-glow hover:underline"
            >
              Compare plans <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <p className="mt-3 text-[12px] text-ink-faint">
            &ldquo;Manage billing&rdquo; opens the secure Stripe portal to update your card, view
            invoices, or change/cancel your plan.
          </p>
        </section>

        {/* Account actions */}
        <section className="mt-5 flex items-center justify-between rounded-2xl border border-white/[0.10] bg-bg-1/60 p-5">
          <Link href="/app" className="btn-primary inline-flex">
            Open the app <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() =>
              signOut({
                fetchOptions: {
                  onSuccess: () => {
                    resetUser();
                    window.location.href = '/';
                  },
                },
              })
            }
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.10] px-4 py-2 text-[13px] text-ink-dim hover:bg-white/[0.04] hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </section>
      </main>
      <Footer />
    </>
  );
}

function UpsellCard({
  href,
  icon,
  title,
  blurb,
  cta,
  featured,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  blurb: string;
  cta: string;
  featured?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-xl border p-4 transition ${
        featured
          ? 'border-brand/40 bg-gradient-to-b from-brand/[0.10] to-transparent'
          : 'border-white/[0.10] bg-white/[0.02] hover:border-white/[0.18]'
      }`}
    >
      <div className="flex items-center gap-2 text-ink">
        <span className="text-brand-glow">{icon}</span>
        <span className="text-[14px] font-semibold">{title}</span>
      </div>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-dim">{blurb}</p>
      <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-cyan-glow">
        {cta} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
