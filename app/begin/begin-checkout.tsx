'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { LoaderCircle } from 'lucide-react';

export function BeginCheckout({ tier, interval }: { tier: string; interval: string }) {
  const started = useRef(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(true);
  const open = useCallback(async () => {
    setError(''); setPending(true);
    try {
      // First call only installs the HttpOnly intent cookie. The second call
      // creates/reuses Checkout, including after a interrupted browser request.
      for (let attempt = 0; attempt < 2; attempt++) {
        const response = await fetch('/api/checkout/guest', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tier, interval }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'We could not open checkout. Please try again.');
        if (data.prepared && attempt === 0) continue;
        if (typeof data.url !== 'string') throw new Error('Allow cookies for Brocco, then try again.');
        const url = new URL(data.url, window.location.origin);
        if (url.origin !== window.location.origin && !(url.protocol === 'https:' && url.hostname === 'checkout.stripe.com')) throw new Error('We could not verify the checkout address.');
        window.location.assign(url.toString());
        return;
      }
    } catch (error) { setError(error instanceof Error ? error.message : 'We could not open checkout. Please try again.'); }
    setPending(false);
  }, [tier, interval]);
  useEffect(() => { if (!started.current) { started.current = true; void open(); } }, [open]);
  return <main className="flex min-h-screen flex-col items-center justify-center bg-bg-0 px-6 text-center text-ink">
    {pending && <LoaderCircle className="mb-5 h-7 w-7 animate-spin text-cyan-glow" aria-hidden />}
    <h1 className="text-display-sm">{pending ? 'Opening secure checkout…' : 'Let’s get your trial started.'}</h1>
    <p className="mt-4 max-w-lg text-ink-dim" role={error ? 'alert' : undefined}>{error || 'Add your card in Stripe, then connect your Brocco account. Your seven-day trial previews the dashboard.'}</p>
    {!pending && <button className="btn-primary mt-6" onClick={() => void open()}>Try checkout again</button>}
    <Link href="/pricing" className="mt-6 text-sm text-ink-dim underline">Back to pricing</Link>
  </main>;
}
