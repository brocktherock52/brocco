import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'sign in - brocco.dev',
  description:
    'Sign in to brocco.dev with a magic link. No password needed. Your thread history follows you across devices.',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginForm mode="login" />;
}
