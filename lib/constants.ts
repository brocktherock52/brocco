// App-wide constants.

// The founder's account. The founder dashboard (/app/founder) and its metrics
// API are gated to this email server-side. Override via env in case the
// canonical account email changes, but default to the known founder address.
export const FOUNDER_EMAIL = (process.env.FOUNDER_EMAIL || 'brockpivec@gmail.com').toLowerCase();

export function isFounderEmail(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase() === FOUNDER_EMAIL;
}
