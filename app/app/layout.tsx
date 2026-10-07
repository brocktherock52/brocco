import { DashboardAccess } from '@/components/billing/dashboard-access';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardAccess>{children}</DashboardAccess>;
}
