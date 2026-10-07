export type BillingPlan = 'solo' | 'team' | 'wholesaler';

export interface BillingAccess {
  authenticated: boolean;
  canPreviewDashboard: boolean;
  canUseTools: boolean;
  hostedAvailable: boolean;
  status: 'signed_out' | 'none' | 'trialing' | 'active' | 'payment_required' | 'canceled' | 'unavailable';
  plan: BillingPlan | null;
  subscriptionId: string | null;
  trialEndsAt: number | null;
  price: { amount: number; currency: string; interval: string } | null;
  paymentUrl: string | null;
}

export function emptyBillingAccess(authenticated: boolean): BillingAccess {
  return {
    authenticated,
    canPreviewDashboard: false,
    canUseTools: false,
    hostedAvailable: false,
    status: authenticated ? 'none' : 'signed_out',
    plan: null,
    subscriptionId: null,
    trialEndsAt: null,
    price: null,
    paymentUrl: null,
  };
}
