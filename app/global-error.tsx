'use client';

import { useEffect } from 'react';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error('[brocco:global]', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          background: '#0A0A0F',
          color: '#E9EEF1',
          fontFamily: 'system-ui, sans-serif',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Something went wrong.</h1>
          <p style={{ opacity: 0.7, fontSize: 14 }}>
            {error?.message || 'An unexpected error occurred.'}
          </p>
          <a href="/" style={{ display: 'inline-block', marginTop: 16, color: '#67E8F9' }}>
            ← Back home
          </a>
        </div>
      </body>
    </html>
  );
}
