import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
import { getSocialProviderAvailability } from '@/lib/auth-config';
import { getAuthCallbackURL } from '@/lib/auth-redirect';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to brocco.dev with Google, Apple, or an email link. Your thread history follows you across devices.',
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackURL?: string | string[]; error?: string | string[] }> }) {
  const params = await searchParams;
  return <LoginForm mode="login" providers={getSocialProviderAvailability()}
    callbackURL={getAuthCallbackURL(params.callbackURL, 'login')} authError={typeof params.error === 'string' ? params.error : undefined} />;
}
