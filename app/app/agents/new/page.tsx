import type { Metadata } from 'next';
import { AgentWizard } from '@/components/dashboard/agent-wizard';

export const metadata: Metadata = {
  title: 'create your own agent  ·  brocco.ai',
  description: 'fork a template, give it a topic, pick a costume. your custom agent saves to your team in seconds.',
  robots: { index: false, follow: false },
};

export default function NewAgentPage() {
  return <AgentWizard />;
}
