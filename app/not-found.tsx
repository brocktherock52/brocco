import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Logomark } from '@/components/logo';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="text-center">
        <Logomark className="mx-auto h-12 w-24 text-brand-glow opacity-80" />
        <p className="mt-6 font-mono text-[12px] uppercase tracking-wider text-ink-faint">404</p>
        <h1 className="mt-2 text-display-lg text-grad">Page not found.</h1>
        <p className="mt-3 max-w-md text-[15px] text-ink-dim">
          That route does not exist. Try the app or the homepage.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <Link href="/" className="btn-ghost">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <Link href="/app" className="btn-primary">
            Open the app
          </Link>
        </div>
      </div>
    </main>
  );
}
