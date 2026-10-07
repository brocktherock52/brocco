'use client';

import Link from 'next/link';
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';

export function PendingCheckoutActions({ sessionId, callbackURL, signedIn, canCancel }: { sessionId: string; callbackURL: string; signedIn: boolean; canCancel: boolean }) {
  const [confirmed, setConfirmed] = useState(false);
  const [pending, setPending] = useState(false);
  const [canceled, setCanceled] = useState(false);
  const [message, setMessage] = useState('');
  const signupURL = `/signup?callbackURL=${encodeURIComponent(callbackURL)}`;
  async function switchAccount() {
    setPending(true); setMessage('');
    try { const result = await authClient.signOut(); if (result.error) throw new Error(); window.location.assign(signupURL); }
    catch { setMessage('Could not sign out. Please try again.'); setPending(false); }
  }
  async function cancel() {
    if (!confirmed || pending) return;
    setPending(true); setMessage('');
    try {
      const response = await fetch('/api/billing/pending/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId, confirm: true }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Could not cancel. Please try again or contact help@brocco.dev.');
      setCanceled(true); setMessage('Subscription canceled. It will not renew. Any payment already processed is unchanged.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not cancel. Please try again.'); }
    finally { setPending(false); }
  }
  return <div className="mt-8 flex w-full max-w-lg flex-col items-center">
    {!canceled && (signedIn
      ? <button className="btn-primary" onClick={() => void switchAccount()} disabled={pending}>Use the checkout email</button>
      : <Link className="btn-primary" href={signupURL}>Connect your account</Link>)}
    {canCancel && !canceled && <div className="mt-8 rounded-xl border border-border p-5 text-left">
      <label className="flex items-start gap-3 text-sm text-ink-dim"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} disabled={pending} className="mt-1" />Cancel this unconnected subscription and stop future renewal.</label>
      <button className="btn-secondary mt-4 w-full" disabled={!confirmed || pending} onClick={() => void cancel()}>{pending ? 'Canceling…' : 'Cancel this subscription'}</button>
    </div>}
    {message && <p className="mt-5 text-sm text-ink-dim" role="status">{message}</p>}
  </div>;
}
