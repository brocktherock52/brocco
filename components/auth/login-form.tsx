'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, LoaderCircle, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Logomark } from '@/components/logo';
import { authClient } from '@/lib/auth-client';
import type { SignInProvider, SocialProviderAvailability } from '@/lib/auth-config';
import { getAuthPageURL, type AuthMode } from '@/lib/auth-redirect';
import { trackEvent } from '@/components/posthog-provider';

interface Props {
  mode: AuthMode;
  callbackURL: string;
  providers: SocialProviderAvailability;
  authError?: string;
}

const providerLabels: Record<SignInProvider, string> = { google: 'Google', apple: 'Apple' };
const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

export function LoginForm({ mode, callbackURL, providers, authError }: Props) {
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState<SignInProvider | 'email' | null>(null);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState(authError
    ? authError === 'access_denied'
      ? 'Sign-in was cancelled. Choose an option below to try again.'
      : 'We could not finish signing you in. Please try again or continue by email.'
    : '');
  const errorCallbackURL = getAuthPageURL(mode, callbackURL);

  function showError(message: string) {
    setErrorMessage(message);
    toast.error(message);
  }

  async function onSocialSignIn(provider: SignInProvider) {
    if (!providers[provider] || pending) return;
    setPending(provider);
    setErrorMessage('');
    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL,
        newUserCallbackURL: callbackURL,
        errorCallbackURL,
      });
      if (error) {
        showError(`Could not connect to ${providerLabels[provider]}. Please try again or continue by email.`);
        setPending(null);
        return;
      }
      trackEvent('social_signin_started', { method: provider, mode });
      // Better Auth navigates to the provider. Keep the controls locked while
      // leaving the page so repeated clicks cannot overwrite OAuth state.
    } catch {
      showError('Could not start sign-in. Check your connection and try again.');
      setPending(null);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      showError('Enter a valid email address.');
      return;
    }
    setPending('email');
    setErrorMessage('');
    try {
      const { error } = await authClient.signIn.magicLink({
        email: trimmed,
        callbackURL,
        newUserCallbackURL: callbackURL,
        errorCallbackURL,
      });
      if (error) {
        showError('Could not send your sign-in link. Please try again or contact help@brocco.dev.');
        return;
      }
      setEmail(trimmed);
      setSent(true);
      trackEvent(mode === 'signup' ? 'signup' : 'login_link_sent', { method: 'magic_link' });
    } catch {
      showError('Could not send your sign-in link. Check your connection and try again.');
    } finally {
      setPending(null);
    }
  }

  const unavailable = (Object.keys(providerLabels) as SignInProvider[])
    .filter((provider) => !providers[provider])
    .map((provider) => providerLabels[provider]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-0 px-4 py-12 text-ink">
      <div className="w-full max-w-md">
        <Link href="/" aria-label="brocco home" className={`inline-flex rounded-md ${focusRing}`}>
          <Logomark className="h-12 w-12" />
        </Link>
        <h1 className="mt-6 font-serif text-4xl tracking-tight">
          {mode === 'signup' ? 'Create your account.' : 'Welcome back.'}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-dim">
          {mode === 'signup'
            ? 'Sign up, then choose your plan and start a 7-day trial with a card on file.'
            : 'Sign in to continue with your AI team.'}
        </p>

        <div className="mt-6 rounded-xl border border-border-strong bg-bg-1 p-6">
          {errorMessage && <p role="alert" className="mb-4 text-base text-accent-rose">{errorMessage}</p>}
          {sent ? (
            <div role="status" className="py-4">
              <Mail aria-hidden="true" className="h-6 w-6 text-accent-green" />
              <h2 className="mt-4 text-xl font-semibold">Check your inbox.</h2>
              <p className="mt-2 break-words text-base leading-relaxed text-ink-dim">
                We sent a sign-in link to <span className="text-ink">{email}</span>.
                {' '}It expires in 5 minutes. Open it to continue where you left off.
              </p>
              <button type="button" onClick={() => setSent(false)}
                className={`mt-6 min-h-12 rounded-xl border border-border-strong px-4 text-base hover:bg-bg-2 ${focusRing}`}>
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3" aria-label="Social sign-in">
                {(Object.keys(providerLabels) as SignInProvider[]).map((provider) => (
                  <button key={provider} type="button" disabled={!providers[provider] || pending !== null}
                    onClick={() => onSocialSignIn(provider)}
                    aria-describedby={!providers[provider] ? 'unavailable-providers' : undefined}
                    className={`flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-border-strong bg-bg-0 px-4 py-3 text-base font-semibold transition-colors hover:bg-bg-2 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}>
                    {pending === provider && <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin motion-reduce:animate-none" />}
                    {pending === provider ? `Connecting to ${providerLabels[provider]}…` : `Continue with ${providerLabels[provider]}`}
                  </button>
                ))}
              </div>
              {unavailable.length > 0 && (
                <p id="unavailable-providers" className="mt-3 text-base leading-relaxed text-ink-dim">
                  {unavailable.join(' and ')} sign-in {unavailable.length > 1 ? 'are' : 'is'} currently unavailable. You can continue by email.
                </p>
              )}
              <div className="my-6 flex items-center gap-3 text-sm text-ink-dim" aria-hidden="true">
                <span className="h-px flex-1 bg-border-strong" />or use email<span className="h-px flex-1 bg-border-strong" />
              </div>
              <form onSubmit={onSubmit} className="space-y-4">
                <label className="block">
                  <span className="text-base font-medium">Email address</span>
                  <input type="email" autoComplete="email" required value={email}
                    disabled={pending !== null} onChange={(e) => setEmail(e.target.value)} placeholder="you@studio.com"
                    className={`mt-2 block min-h-12 w-full rounded-xl border border-border-strong bg-bg-0 px-4 py-3 text-base text-ink placeholder:text-ink-faint disabled:opacity-60 ${focusRing}`} />
                </label>
                <button type="submit" disabled={pending !== null}
                  className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-deep disabled:opacity-60 ${focusRing}`}>
                  {pending === 'email' ? (
                    <><LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin motion-reduce:animate-none" />Sending link…</>
                  ) : (
                    <>{mode === 'signup' ? 'Create account with email' : 'Send sign-in link'}<ArrowRight aria-hidden="true" className="h-5 w-5" /></>
                  )}
                </button>
                <p className="text-base leading-relaxed text-ink-dim">We&apos;ll email you a secure sign-in link. No password needed.</p>
              </form>
            </>
          )}
        </div>

        {mode === 'signup' && <p className="mt-4 text-base leading-relaxed text-ink-dim">Your trial lets you explore the dashboard. Activate your subscription to use live tools.</p>}
        <p className="mt-6 text-base text-ink-dim">
          {mode === 'signup' ? 'Already have an account? ' : 'New to brocco? '}
          <Link href={getAuthPageURL(mode === 'signup' ? 'login' : 'signup', callbackURL)} className={`rounded-md text-ink underline underline-offset-4 ${focusRing}`}>
            {mode === 'signup' ? 'Sign in' : 'Create an account'}
          </Link>
        </p>
        <p className="mt-4 text-sm leading-relaxed text-ink-dim">
          By continuing, you agree to the{' '}
          <Link href="/terms" className={`rounded-md underline underline-offset-4 ${focusRing}`}>terms</Link>{' '}
          and acknowledge our{' '}
          <Link href="/privacy" className={`rounded-md underline underline-offset-4 ${focusRing}`}>privacy policy</Link>.
        </p>
      </div>
    </main>
  );
}
