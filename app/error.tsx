'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.error('[brocco]', error);
    }
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="max-w-md text-center">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-rose-400/30 bg-rose-400/10">
          <AlertTriangle className="h-5 w-5 text-rose-300" />
        </div>
        <h1 className="mt-6 text-[28px] font-semibold tracking-tight text-grad">Something went sideways.</h1>
        <p className="mt-3 text-[14.5px] text-ink-dim">
          {error?.message?.slice(0, 200) || 'An unexpected error occurred. Try again or head back home.'}
        </p>
        {error?.digest && (
          <p className="mt-2 font-mono text-[11px] text-ink-faint">digest: {error.digest}</p>
        )}
        <div className="mt-7 flex items-center justify-center gap-3">
          <Link href="/" className="btn-ghost">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <button onClick={reset} className="btn-primary">
            <RotateCcw className="h-4 w-4" /> Try again
          </button>
        </div>
      </div>
    </main>
  );
}
