import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { AgentLibrary } from '@/components/agent-library';

export const metadata: Metadata = {
  title: '888 agents — brocco.dev',
  description: 'browse the brocco agent library. 888 specialists across 8 categories. fork any one in one click.',
  alternates: { canonical: '/agents/library' },
};

export default function AgentLibraryPage() {
  return (
    <>
      <Nav />
      <main>
        <AgentLibrary />
      </main>
      <Footer />
    </>
  );
}
