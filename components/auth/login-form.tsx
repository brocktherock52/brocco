'use client';

/**
 * LoginForm — magic-link entry shared by /login and /signup.
 *
 * Reuses the cosmic palette (gradient brand-to-cyan ring, glow halo,
 * mono labels) so the page feels like it belongs to /app rather than the
 * marketing site. One email field, one button. On submit we call
 * authClient.signIn.magicLink and surface a success or error state.
 *
 * Both modes feed the same handler. better-auth auto-creates the user on
 * first magic-link click, so signup === login with a different headline.
 */
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Logomark } from '@/components/logo';
import { authClient } from '@/lib/auth-client';

interface Props {
  mode: 'login' | 'signup';
}

export function LoginForm({ mode }: Props) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const headline =
    mode === 'signup'
      ? { lead: 'create your account', tail: 'your AI team is waiting.' }
      : { lead: 'welcome back', tail: 'pick up where you left off.' };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      toast.error('enter a valid email.');
      return;
    }
    setSending(true);
    try {
      const { error } = await authClient.signIn.magicLink({
        email: trimmed,
        callbackURL: '/app',
      });
      if (error) {
        toast.error(error.message || 'could not send sign-in link.');
        return;
      }
      setSent(true);
      toast.success('check your inbox', {
        description: 'we sent a one-tap sign-in link. it expires in 5 minutes.',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'unexpected error.');
    } finally {
      setSending(false);
    }
  }

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

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="mb-7 flex flex-col items-center text-center">
          <Link href="/" aria-label="brocco home" className="inline-flex">
            <Logomark className="h-12 w-12" />
          </Link>
          <h1 className="mt-5 text-[26px] font-semibold lowercase tracking-tight">
            <span className="text-grad">{headline.lead}.</span>{' '}
            <span className="font-serif italic font-normal text-grad-brand">
              {headline.tail}
            </span>
          </h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-dim">
            magic-link login. no passwords. ever.
          </p>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-1 -z-10 rounded-3xl opacity-60 blur-2xl"
            style={{
              background:
                'radial-gradient(ellipse at 50% 30%, rgba(103,232,249,0.22), transparent 60%), radial-gradient(ellipse at 50% 70%, rgba(167,139,250,0.18), transparent 60%)',
            }}
          />
          <div className="relative rounded-3xl border border-white/[0.12] bg-bg-1/80 p-6 shadow-glow backdrop-blur-xl">
            {sent ? (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 p-3 text-emerald-300">
                  <Mail className="h-5 w-5" />
                </div>
                <p className="mt-4 text-[15px] font-medium">check your inbox.</p>
                <p className="mt-1.5 max-w-xs text-[12.5px] leading-relaxed text-ink-dim">
                  we sent a sign-in link to{' '}
                  <span className="font-mono text-ink">{email}</span>. open it on
                  any device to land on your dashboard.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1.5 font-mono text-[11px] text-ink-dim hover:bg-white/[0.07] hover:text-white"
                >
                  use a different email
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <label className="block">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">
                    email
                  </span>
                  <div className="relative mt-1.5">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                    <input
                      type="email"
                      autoComplete="email"
                      autoFocus
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@studio.com"
                      className="block w-full rounded-2xl border border-white/[0.10] bg-bg-0/60 py-3 pl-10 pr-4 text-[15px] text-ink outline-none transition placeholder:text-ink-faint focus:border-white/[0.22]"
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand to-cyan px-5 py-3 text-[14px] font-semibold text-white shadow-glow2 transition-all hover:shadow-glow disabled:opacity-60"
                >
                  {sending ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-pulse" /> sending link
                    </>
                  ) : (
                    <>
                      {mode === 'signup' ? 'create account' : 'send sign-in link'}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-[11.5px] leading-relaxed text-ink-faint">
                  one link. one tap. 5-minute expiry. zero passwords.
                </p>
              </form>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-[12.5px] text-ink-dim">
          {mode === 'signup' ? (
            <>
              already have an account?{' '}
              <Link href="/login" className="text-cyan-glow hover:underline">
                sign in
              </Link>
            </>
          ) : (
            <>
              new to brocco?{' '}
              <Link href="/signup" className="text-cyan-glow hover:underline">
                create an account
              </Link>
            </>
          )}
        </p>

        <p className="mt-3 text-center font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
          by signing in you agree to the{' '}
          <Link href="/terms" className="hover:text-ink-dim">
            terms
          </Link>{' '}
          ·{' '}
          <Link href="/privacy" className="hover:text-ink-dim">
            privacy
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
