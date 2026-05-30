import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'brocco.dev, nine specialists, one prompt';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Page-specific social card for /agents. Text-only (no remote fetch).
export default function AgentsOg() {
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
            'radial-gradient(900px 500px at 75% 0%, rgba(34,211,238,0.26), transparent 60%), radial-gradient(700px 420px at 0% 100%, rgba(124,58,237,0.30), transparent 60%), #0A0A0F',
          color: '#E9EEF1',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em' }}>
          brocco<span style={{ color: '#6B7280' }}>.dev</span>
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <span style={{ fontSize: 22, letterSpacing: '0.22em', color: '#67E8F9', textTransform: 'uppercase' }}>
            the team
          </span>
          <h1
            style={{
              fontSize: 92,
              lineHeight: 1.0,
              letterSpacing: '-0.035em',
              fontWeight: 700,
              margin: 0,
              backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #67E8F9 45%, #A78BFA 100%)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Nine specialists. One prompt.
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 22, fontSize: 22, color: '#8A96A0', flexWrap: 'wrap' }}>
          <span>supervisor</span><span>·</span><span>researcher</span><span>·</span>
          <span>planner</span><span>·</span><span>coder</span><span>·</span>
          <span>outreach</span><span>·</span><span>analyst</span><span>·</span>
          <span>designer</span><span>·</span><span>browser</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
