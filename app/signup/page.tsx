import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
import { getSocialProviderAvailability } from '@/lib/auth-config';
import { getAuthCallbackURL } from '@/lib/auth-redirect';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Create an account',
  description: 'Create your brocco account with Google, Apple, or email. Choose a plan and start a 7-day trial with a card on file.',
  robots: { index: false, follow: false },
};

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ callbackURL?: string | string[]; error?: string | string[] }> }) {
  const params = await searchParams;
  return <LoginForm mode="signup" providers={getSocialProviderAvailability()}
    callbackURL={getAuthCallbackURL(params.callbackURL, 'signup')} authError={typeof params.error === 'string' ? params.error : undefined} />;
}
