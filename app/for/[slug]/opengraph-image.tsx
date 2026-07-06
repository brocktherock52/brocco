import { ImageResponse } from 'next/og';
import { getVertical } from '@/lib/verticals';

export const runtime = 'edge';
export const alt = 'brocco for your team';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Generated dynamically on the edge per slug (Vercel caches it), so shares of
// any /for/<slug> page get a tailored "brocco for <audience>" image instead of
// the generic site card. (Edge runtime cannot be combined with
// generateStaticParams, and the other OG routes are edge-dynamic too.)
export default async function Og({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const audience = getVertical(slug)?.audience ?? 'your team';

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
            for {audience}
          </span>
          <h1
            style={{
              fontSize: 84,
              lineHeight: 1.0,
              letterSpacing: '-0.035em',
              fontWeight: 700,
              margin: 0,
              backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #C4B5FD 40%, #67E8F9 100%)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            your AI team for {audience}.
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 40, fontSize: 26, color: '#A8B0BC' }}>
          <span><strong style={{ color: '#fff' }}>one</strong> prompt in</span>
          <span><strong style={{ color: '#fff' }}>9</strong> agents in parallel</span>
          <span>BYOK</span>
          <span>branded PDF out</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
