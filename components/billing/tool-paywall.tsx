'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import { Loader2, LockKeyhole, X } from 'lucide-react';
import { fetchBillingAccess, formatSubscriptionPrice, type BillingAccess } from '@/lib/billing-client';
import { trackEvent } from '@/components/posthog-provider';

export function ToolPaywall({ open, onClose, onActivated, source = 'tool' }: {
  open: boolean;
  onClose: () => void;
  onActivated?: (access: BillingAccess) => void;
  source?: string;
}) {
  const [access, setAccess] = useState<BillingAccess | null>(null);
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const inFlight = useRef(false);
  const requestId = useRef<string | null>(null);

  async function check() {
    setChecking(true);
    setError(null);
    try { setAccess(await fetchBillingAccess()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Please retry.'); }
    finally { setChecking(false); }
  }

  useEffect(() => {
    if (!open) return;
    setAccess(null);
    setConfirmed(false);
    void check();
    trackEvent('tool_paywall_shown', { source });
  }, [open, source]);

  async function activate() {
    if (!confirmed || !access?.subscriptionId || inFlight.current) return;
    inFlight.current = true;
    requestId.current ??= crypto.randomUUID();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/billing/activate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true, subscriptionId: access.subscriptionId, requestId: requestId.current, price: access.price }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 402 || response.status === 409) { requestId.current = null; setConfirmed(false); }
        if (data.access) setAccess(data.access);
        else if (data.paymentUrl) setAccess({ ...access, paymentUrl: data.paymentUrl });
        throw new Error(data.detail || data.error || 'Payment did not complete. Your tools remain locked.');
      }
      const updated = await fetchBillingAccess();
      setAccess(updated);
      if (updated.canUseTools) {
        trackEvent('tools_unlocked', { source });
        onActivated?.(updated);
        onClose();
      } else {
        setError('Payment is being confirmed. Check access again before running a tool.');
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Please retry.'); }
    finally { setBusy(false); inFlight.current = false; }
  }

  const price = formatSubscriptionPrice(access?.price ?? null);
  return <Dialog.Root open={open} onOpenChange={(next) => { if (!next && !busy) onClose(); }}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-[71] w-[calc(100%_-_2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border-strong bg-bg-1 p-8 text-ink shadow-xl">
        <Dialog.Close disabled={busy} aria-label="Close payment dialog" className="absolute right-4 top-4 rounded p-1 text-ink-dim"><X className="h-5 w-5" /></Dialog.Close>
        <LockKeyhole className="mb-4 h-6 w-6 text-brand-glow" />
        <Dialog.Title className="text-2xl font-semibold">Unlock your tools</Dialog.Title>
        <Dialog.Description className="mt-3 text-base text-ink-dim">Your seven-day trial lets you explore the dashboard. A paid subscription is required to run tools, including with your own API key.</Dialog.Description>
        {access?.hostedAvailable === false && <p className="mt-4 rounded-xl border border-accent-gold/30 p-3 text-base text-ink">Live tools require your own Anthropic or xAI API key. Your provider bills usage separately.</p>}
        {checking ? <p role="status" className="mt-6 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Checking subscription access...</p> : <div className="mt-6 space-y-4">
          {access?.canUseTools ? <><p>Your subscription is active. You can run tools now.</p><button className="btn-primary" onClick={() => { onActivated?.(access); onClose(); }}>Return to tools</button></> : access?.subscriptionId && price && (access.status === 'trialing' || (access.status === 'payment_required' && !access.paymentUrl)) ? <>
            <p className="text-base">Start <strong className="capitalize">{access.plan}</strong> now for <strong>{price}</strong>. {access.status === 'trialing' ? 'This ends your trial and charges your saved payment method today.' : 'Retry payment for your existing subscription. No additional subscription is created.'} The subscription renews at this rate until canceled.</p>
            <label className="flex items-start gap-3 text-base"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} disabled={busy} className="mt-1 h-4 w-4" /><span>{access.status === 'trialing' ? 'I agree to end my trial and start the paid subscription now.' : 'I agree to retry payment for my existing subscription now.'}</span></label>
            <button onClick={activate} disabled={!confirmed || busy} className="btn-primary w-full justify-center disabled:opacity-50">{busy ? 'Confirming payment...' : `Pay ${price} and unlock tools`}</button>
          </> : access && !access.authenticated ? <Link className="btn-primary" href="/signup">Create your account</Link> : access?.status === 'none' || access?.status === 'canceled' ? <Link className="btn-primary" href="/start">Start 7-day trial</Link> : <p>Complete or update your payment to unlock tools. Manage your subscription below.</p>}
          {access?.paymentUrl && <a className="btn-primary" href={access.paymentUrl}>Complete secure payment</a>}
          <div className="flex flex-wrap gap-4 text-base"><Link href="/account" className="text-cyan-glow underline">Manage or cancel subscription</Link><button onClick={check} disabled={busy} className="text-cyan-glow underline">Check access again</button></div>
        </div>}
        {error && <p role="alert" className="mt-4 rounded-xl border border-accent-gold/30 p-3 text-accent-gold">{error}</p>}
        <p className="mt-6 text-sm text-ink-faint">No tool will run until payment is confirmed. You can close this dialog and continue browsing your dashboard.</p>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
