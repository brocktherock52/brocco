import type { Metadata } from 'next';
import { AppShell } from '@/components/dashboard/app-shell';

export const metadata: Metadata = {
  title: 'app - multi-agent dashboard',
  description: 'Run multiple Claude or local LLM agents in parallel from one prompt. BYOK, browser-first.',
  robots: { index: false, follow: false },
};

export default function AppPage() {
  return <AppShell />;
}
