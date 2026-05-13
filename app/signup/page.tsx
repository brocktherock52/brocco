import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'sign up - brocco.dev',
  description:
    'Create a free brocco.dev account. Magic-link login. Your AI team and thread history persist across devices.',
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return <LoginForm mode="signup" />;
}
