import { ImageResponse } from 'next/og';

// Shared social-card generator for the /vs/* comparison pages. Text-only
// (no remote fetch) so it renders fast and never 404s a remote asset on a
// share. Mirrors the /pricing + /download card styling for brand consistency.
// Each app/vs/<x>/opengraph-image.tsx is a thin wrapper that calls this with
// the competitor's display name.
export const ogSize = { width: 1200, height: 630 };

export function vsOgImage(competitor: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background:
            'radial-gradient(900px 500px at 25% 0%, rgba(124,58,237,0.34), transparent 60%), radial-gradient(700px 420px at 100% 100%, rgba(34,211,238,0.22), transparent 60%), #0A0A0F',
          color: '#E9EEF1',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em' }}>
          brocco<span style={{ color: '#6B7280' }}>.dev</span>
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <span style={{ fontSize: 22, letterSpacing: '0.22em', color: '#A78BFA', textTransform: 'uppercase' }}>
            compare
          </span>
          <h1
            style={{
              fontSize: 88,
              lineHeight: 1.0,
              letterSpacing: '-0.035em',
              fontWeight: 700,
              margin: 0,
              backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #C4B5FD 40%, #67E8F9 100%)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            brocco vs {competitor}.
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 40, fontSize: 26, color: '#A8B0BC' }}>
          <span><strong style={{ color: '#fff' }}>9</strong> agents in parallel</span>
          <span>BYOK</span>
          <span>JSONL audit</span>
          <span>self-host</span>
        </div>
      </div>
    ),
    { ...ogSize },
  );
}
