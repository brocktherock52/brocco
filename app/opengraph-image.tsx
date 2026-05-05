import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'brocco.ai - agents that do the work';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://brocco-site.vercel.app';

export default async function OpengraphImage() {
  // Fetch the brand mark so it embeds inside the rendered OG.
  let markSrc: string | null = null;
  try {
    const r = await fetch(`${SITE}/assets/brocco-mark.png`, { cache: 'force-cache' });
    if (r.ok) {
      const buf = await r.arrayBuffer();
      const b64 = Buffer.from(buf).toString('base64');
      markSrc = `data:image/png;base64,${b64}`;
    }
  } catch {
    /* fall through to text-only */
  }

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
            'radial-gradient(900px 500px at 30% 0%, rgba(124,58,237,0.32), transparent 60%), radial-gradient(700px 400px at 100% 100%, rgba(34,211,238,0.22), transparent 60%), #0A0A0F',
          color: '#E9EEF1',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* top row: brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {markSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={markSrc} width={88} height={88} alt="" style={{ objectFit: 'contain' }} />
          ) : null}
          <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em' }}>
            brocco<span style={{ color: '#6B7280' }}>.ai</span>
          </span>
        </div>

        {/* headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h1
            style={{
              fontSize: 96,
              lineHeight: 1.02,
              letterSpacing: '-0.035em',
              fontWeight: 700,
              margin: 0,
              backgroundImage:
                'linear-gradient(135deg, #ffffff 0%, #C4B5FD 30%, #67E8F9 60%, #A78BFA 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              maxWidth: 1000,
            }}
          >
            Agents that do the work.
          </h1>
          <p style={{ fontSize: 28, lineHeight: 1.4, color: '#A8B0BC', margin: 0, maxWidth: 980 }}>
            Run multiple Claude or local LLM agents in parallel from one prompt. BYOK. Browser-first. Audit-grade.
          </p>
        </div>

        {/* bottom: stats row */}
        <div style={{ display: 'flex', gap: 24, fontSize: 18, color: '#8A96A0' }}>
          <span>9 agents</span>
          <span>•</span>
          <span>13 tools</span>
          <span>•</span>
          <span>Claude + OpenAI + Ollama</span>
          <span>•</span>
          <span>SOC 2 in progress</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
