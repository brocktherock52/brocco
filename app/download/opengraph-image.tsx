import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Install brocco, native on Mac and Windows, one click';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Page-specific social card for /download. Text-only (no remote fetch) so it
// renders fast and never 404s a remote asset on a share. Mirrors the /pricing
// card style for brand consistency.
export default function DownloadOg() {
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
            install
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
            install brocco in one click.
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 40, fontSize: 26, color: '#A8B0BC' }}>
          <span><strong style={{ color: '#fff' }}>macOS</strong></span>
          <span><strong style={{ color: '#fff' }}>Windows</strong></span>
          <span><strong style={{ color: '#fff' }}>Claude Desktop</strong></span>
          <span>PWA, auto-updates</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
