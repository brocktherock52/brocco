'use client';

import { ToolPaywall } from '@/components/billing/tool-paywall';
import type { BillingAccess } from '@/lib/billing-client';

export function UpsellModal(props: {
  open: boolean;
  onClose: () => void;
  onActivated?: (access: BillingAccess) => void;
  source?: string;
}) {
  return <ToolPaywall {...props} />;
}
