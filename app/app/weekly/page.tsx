import type { Metadata } from 'next';
import { WeeklyRecap } from '@/components/dashboard/weekly-recap';

export const metadata: Metadata = {
  title: 'weekly recap  ·  brocco.ai',
  description: 'a quiet sunday view of the week your team just worked.',
  robots: { index: false, follow: false },
};

export default function WeeklyPage() {
  return (
    <div className="min-h-screen bg-bg-0 text-ink">
      <WeeklyRecap />
    </div>
  );
}
