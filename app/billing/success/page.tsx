import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { SuccessTracker } from './success-tracker';

export const metadata = {
  title: 'Welcome to brocco',
  description: 'Subscription confirmed.',
  robots: { index: false, follow: false },
};

export default function SuccessPage() {
  return (
    <>
      <Nav />
      <SuccessTracker />
      <main className="flex min-h-[calc(100vh-200px)] items-center justify-center pt-32">
        <div className="container-x text-center">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10">
            <CheckCircle2 className="h-6 w-6 text-emerald-300" />
          </div>
          <h1 className="mt-6 text-display-lg text-grad">You are in.</h1>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-ink-dim">
            Subscription confirmed. A receipt is on its way to your inbox. Now go ship something.
          </p>
          <Link href="/app" className="btn-primary mt-8 inline-flex">
            Open the app <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
