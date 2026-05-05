import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'brocco.ai - agents that do the work';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
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
            'radial-gradient(900px 500px at 30% 0%, rgba(124,58,237,0.35), transparent 60%), radial-gradient(700px 400px at 100% 100%, rgba(34,211,238,0.25), transparent 60%), #0A0A0F',
          color: '#E9EEF1',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* top row: logomark + wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <svg viewBox="0 0 64 36" width={84} height={48}>
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="64" y2="36" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#A78BFA" />
                <stop offset="60%" stopColor="#22D3EE" />
                <stop offset="100%" stopColor="#67E8F9" />
              </linearGradient>
            </defs>
            <path
              fill="url(#g)"
              d="M 4 22 Q 1 24 2 26 L 8 25 L 12 24 L 18 23 L 26 22 L 34 22 L 42 23 L 50 24 L 56 25 L 60 25 L 62 23 Q 63 22 60 21 L 58 20 L 56 19 L 52 19 Q 50 18 48 19 L 42 19 L 36 19 Q 32 17 28 19 L 22 19 L 16 19 L 12 20 L 8 21 Z"
            />
            <circle cx="55.5" cy="20.4" r="1.4" fill="#fff" />
            <circle cx="55.7" cy="20.6" r="0.85" fill="#0A0A0F" />
          </svg>
          <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em' }}>
            brocco<span style={{ color: '#6B7280' }}>.ai</span>
          </span>
        </div>

        {/* headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h1
            style={{
              fontSize: 92,
              lineHeight: 1.02,
              letterSpacing: '-0.035em',
              fontWeight: 700,
              margin: 0,
              backgroundImage:
                'linear-gradient(135deg, #ffffff 0%, #C4B5FD 30%, #67E8F9 60%, #A78BFA 100%)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Agents that do the work.
          </h1>
          <p style={{ fontSize: 28, lineHeight: 1.4, color: '#A8B0BC', margin: 0, maxWidth: 980 }}>
            Run multiple Claude or local LLM agents in parallel from one prompt. BYOK. Browser-first. Audit-grade.
          </p>
        </div>

        {/* bottom row: stats */}
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
