/**
 * Better-auth browser client. Exposes the magic-link sign-in method plus
 * the useSession hook for client components.
 */
'use client';
import { createAuthClient } from 'better-auth/react';
import { magicLinkClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL:
    typeof window === 'undefined'
      ? process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      : window.location.origin,
  plugins: [magicLinkClient()],
});

export const { useSession, signIn, signOut } = authClient;
