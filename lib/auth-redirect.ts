export type AuthMode = 'login' | 'signup';

/** Only local app destinations may survive a sign-in or provider round trip. */
export function getAuthCallbackURL(value: unknown, mode: AuthMode): string {
  const fallback = mode === 'signup' ? '/start' : '/app';
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u001f\u007f]/.test(value)) {
    return fallback;
  }
  try {
    const parsed = new URL(value, 'https://brocco.invalid');
    if (parsed.origin !== 'https://brocco.invalid') return fallback;
    // Encoded slashes and controls can be interpreted differently by proxies.
    if (/%(?:2f|5c|0[0-9a-f]|1[0-9a-f]|7f)/i.test(parsed.pathname)) return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function getAuthPageURL(mode: AuthMode, callbackURL: string): string {
  return `/${mode}?${new URLSearchParams({ callbackURL })}`;
}
