import type { Metadata } from 'next';
import Link from 'next/link';
import { Logomark } from '@/components/logo';
import { EarlyAccess } from '@/components/early-access';

export const metadata: Metadata = {
  title: 'start free - brocco.dev',
  description:
    'Claim 100 free runs a month. One prompt spins up your AI team and they do the work. No credit card.',
  robots: { index: false, follow: false },
};

const PROOF = [
  'one prompt in, finished work out',
  'your AI team runs in parallel',
  '100 runs every month, free',
];

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg-0 px-4 py-12 text-ink">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse at 50% 20%, rgba(103,232,249,0.18), transparent 60%), radial-gradient(ellipse at 50% 80%, rgba(167,139,250,0.16), transparent 60%)',
        }}
      />
      <div className="relative w-full max-w-md">
        <div className="mb-7 flex flex-col items-center text-center">
          <Link href="/" aria-label="brocco home" className="inline-flex">
            <Logomark className="h-12 w-12" />
          </Link>
          <h1 className="mt-5 text-[26px] font-semibold lowercase tracking-tight">
            <span className="text-grad">start free.</span>{' '}
            <span className="font-serif italic font-normal text-grad-brand">
              your AI team is waiting.
            </span>
          </h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-dim">
            drop your email and we&apos;ll open the dashboard. no card, ever.
          </p>
        </div>

        <EarlyAccess source="signup-page" variant="card" />

        <ul className="mt-6 space-y-2">
          {PROOF.map((p) => (
            <li key={p} className="flex items-center gap-2.5 text-[13px] text-ink-dim">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-glow" />
              {p}
            </li>
          ))}
        </ul>

        <p className="mt-6 text-center text-[12.5px] text-ink-dim">
          already have an account?{' '}
          <Link href="/login" className="text-cyan-glow hover:underline">
            sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
