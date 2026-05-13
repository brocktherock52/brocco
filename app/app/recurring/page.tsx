import type { Metadata } from 'next';
import { RecurringList } from '@/components/dashboard/recurring-list';

export const metadata: Metadata = {
  title: 'recurring runs  ·  brocco.ai',
  description: 'every job your team runs on a schedule.',
  robots: { index: false, follow: false },
};

export default function RecurringPage() {
  return (
    <div className="min-h-screen bg-bg-0 text-ink">
      <RecurringList />
    </div>
  );
}
