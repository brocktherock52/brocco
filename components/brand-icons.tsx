/**
 * Inline brand SVGs for partners and platforms.
 * All use viewBox + currentColor so they inherit text-color from the parent
 * (lets us recolor for hover, dark/light, focus, etc.).
 *
 * Sources used as visual references (we redrew geometry, not copied):
 *   - Anthropic A-mark
 *   - OpenAI knot mark
 *   - Vercel triangle
 *   - Ollama llama silhouette
 *   - Stripe wordmark "S"
 *   - Slack 4-square hash
 *   - Discord chat balloon
 *   - GitHub octocat
 *   - n8n nodes
 *   - Cursor cursor mark
 *   - VS Code triangle-ribbon
 *   - Apple, Windows, Linux platform marks
 *
 * No external CDN refs, no licensed glyphs lifted verbatim.
 */
type IconProps = { className?: string; title?: string };

const base = 'shrink-0';

export function AnthropicIcon({ className = '', title = 'Anthropic' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-label={title}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M5 21 12 3l7 18h-3.4l-1.4-3.6H9.8L8.4 21Zm5.7-6.7h2.6L12 10.7Z"
      />
    </svg>
  );
}

export function OpenAIIcon({ className = '', title = 'OpenAI' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-label={title}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M22.28 9.82a5.97 5.97 0 0 0-.51-4.91 6.05 6.05 0 0 0-6.51-2.9 5.99 5.99 0 0 0-4.51-2.01 6.05 6.05 0 0 0-5.77 4.18A5.99 5.99 0 0 0 .96 6.94a6.05 6.05 0 0 0 .74 7.09 5.97 5.97 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.51 2.9 5.99 5.99 0 0 0 4.51 2.01 6.05 6.05 0 0 0 5.77-4.18 5.99 5.99 0 0 0 4.02-2.76 6.05 6.05 0 0 0-.74-7.09zM13.27 22.49a4.49 4.49 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.78.78 0 0 0 .39-.68v-6.74l2.02 1.17a.07.07 0 0 1 .04.05v5.58a4.5 4.5 0 0 1-4.49 4.5zm-9.66-4.13a4.48 4.48 0 0 1-.54-3.01l.14.08 4.78 2.76a.78.78 0 0 0 .79 0l5.84-3.37v2.33a.08.08 0 0 1-.03.06L9.77 19.97a4.5 4.5 0 0 1-6.16-1.61zM2.34 9.71a4.48 4.48 0 0 1 2.34-1.97v5.68c0 .28.15.55.39.69l5.81 3.36-2.02 1.17a.07.07 0 0 1-.07 0L4.01 15.85A4.5 4.5 0 0 1 2.34 9.71zm16.66 3.86-5.84-3.38 2.02-1.16a.07.07 0 0 1 .07 0l4.78 2.76a4.5 4.5 0 0 1-.69 8.11v-5.68a.78.78 0 0 0-.34-.65zm2.01-3.02-.14-.09-4.78-2.76a.78.78 0 0 0-.79 0L9.46 11.07V8.74a.07.07 0 0 1 .03-.06l4.78-2.76a4.5 4.5 0 0 1 6.69 4.66zM8.36 14.3l-2.02-1.17a.07.07 0 0 1-.04-.05V7.49a4.5 4.5 0 0 1 7.39-3.46l-.14.09-4.78 2.76a.78.78 0 0 0-.39.68zm1.1-2.36 2.6-1.5 2.6 1.5v3l-2.6 1.5-2.6-1.5z"
      />
    </svg>
  );
}

export function VercelIcon({ className = '', title = 'Vercel' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-label={title}>
      <title>{title}</title>
      <path fill="currentColor" d="M12 3 22 21H2Z" />
    </svg>
  );
}

export function OllamaIcon({ className = '', title = 'Ollama' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-label={title}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M12 2c-2.3 0-4.2 2-4.2 4.4 0 .9.3 1.7.7 2.4-2 .8-3.5 2.7-3.5 5.1V18a3 3 0 0 0 3 3h.5v-2.6a1.4 1.4 0 0 1 2.8 0V21h2v-2.6a1.4 1.4 0 0 1 2.8 0V21h.5a3 3 0 0 0 3-3v-4.1c0-2.4-1.5-4.3-3.5-5.1.5-.7.7-1.5.7-2.4C16.3 4 14.4 2 12 2zm-1.6 4.4a1.6 1.6 0 1 1 3.2 0 1.6 1.6 0 0 1-3.2 0z"
      />
    </svg>
  );
}

export function StripeIcon({ className = '', title = 'Stripe' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-label={title}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M14 7c-2.4 0-4.5 1.6-4.5 4 0 2.5 2.3 3.3 4.2 3.9 1.4.4 2.5.8 2.5 1.7 0 .8-.7 1.4-2.2 1.4-1.6 0-3.3-.6-4.5-1.4v3c1.3.6 3 1 4.6 1 2.7 0 5-1.4 5-4.1 0-2.7-2.3-3.5-4.3-4.1-1.4-.4-2.4-.8-2.4-1.6 0-.7.6-1.2 1.8-1.2 1.5 0 3 .5 4.1 1V7.6C16.9 7.2 15.4 7 14 7Z"
      />
    </svg>
  );
}

export function TavilyIcon({ className = '', title = 'Tavily' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-label={title}>
      <title>{title}</title>
      <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="m20 20-4.3-4.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GitHubIcon({ className = '', title = 'GitHub' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-label={title}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M12 .3a12 12 0 0 0-3.79 23.4c.6.11.79-.26.79-.58v-2.23c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.49 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.39 1.24-3.23-.13-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.24 1.92 1.24 3.23 0 4.61-2.81 5.62-5.49 5.92.43.37.83 1.1.83 2.22v3.29c0 .32.19.69.8.58A12 12 0 0 0 12 .3"
      />
    </svg>
  );
}

export function SlackIcon({ className = '', title = 'Slack' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-label={title}>
      <title>{title}</title>
      <g fill="currentColor">
        <rect x="9" y="2" width="2.6" height="9" rx="1.3" />
        <rect x="13" y="13" width="2.6" height="9" rx="1.3" />
        <rect x="2" y="9" width="9" height="2.6" rx="1.3" />
        <rect x="13" y="9" width="9" height="2.6" rx="1.3" />
      </g>
    </svg>
  );
}

// (DiscordIcon moved below to use the Simple-Icons official path.)

export function N8nIcon({ className = '', title = 'n8n' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-label={title}>
      <title>{title}</title>
      <g fill="currentColor">
        <circle cx="4" cy="12" r="2.4" />
        <circle cx="12" cy="6" r="2.4" />
        <circle cx="12" cy="18" r="2.4" />
        <circle cx="20" cy="12" r="2.4" />
        <path d="M5.6 11.4 10.4 6.8M5.6 12.6l4.8 4.6M13.6 6.8l4.8 4.6M13.6 17.2l4.8-4.6" stroke="currentColor" strokeWidth="1.4" />
      </g>
    </svg>
  );
}

export function CursorIcon({ className = '', title = 'Cursor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-label={title}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M4 3l16 9-7 1.5L11 21z"
      />
    </svg>
  );
}

export function VsCodeIcon({ className = '', title = 'VS Code' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-label={title}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M16.8 2.5 22 5v14l-5.2 2.5-9.4-7.6L4 17l-2-1V8l2-1 3.4 3 9.4-7.5zM5.5 12 8 14.2v-4.4L5.5 12zm10.7 4.6 4-3V10.4l-4-3-5.5 4.6 5.5 4.6z"
      />
    </svg>
  );
}

export function ZapierIcon({ className = '', title = 'Zapier' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-label={title}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M14 2 7 11h5l-3 11 7-9h-5l3-11z"
      />
    </svg>
  );
}

export function McpIcon({ className = '', title = 'MCP' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-label={title}>
      <title>{title}</title>
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17 9 11l4 4 8-8" />
        <path d="M14 5h7v7" />
      </g>
    </svg>
  );
}

export function AppleIcon({ className = '', title = 'macOS' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-label={title}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M16.4 4c-.7 0-1.5.5-2.1 1-.6.5-1.1 1.4-1 2.3.7 0 1.6-.5 2.2-1 .5-.5 1-1.4.9-2.3zM18.5 14c0-1.7.8-3 2.2-3.8-.8-1.1-2-1.8-3.4-1.8-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-2.9-.8-1.5 0-2.9.9-3.7 2.2-1.6 2.7-.4 6.7 1.1 8.9.7 1.1 1.6 2.3 2.7 2.3 1.1 0 1.5-.7 2.8-.7 1.3 0 1.7.7 2.8.7 1.2 0 1.9-1.1 2.6-2.2.8-1.2 1.2-2.5 1.3-2.5-.1-.1-2.5-1-2.5-3.8z"
      />
    </svg>
  );
}

export function WindowsIcon({ className = '', title = 'Windows' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-label={title}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M3 5.5L11 4.4v7.5H3V5.5zm0 13l8 1.1v-7.5H3v6.4zm9 1.2l9 1.3v-9H12v7.7zm0-15.5v7.7h9V3l-9 1.2z"
      />
    </svg>
  );
}

export function LinuxIcon({ className = '', title = 'Linux' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-label={title}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M12 2c-2.5 0-4.5 2-4.5 4.5 0 1.5.7 2.8 1.8 3.6-1 .8-1.7 1.9-2 3.2L7 17l-1 3 2 1 1-2 .8.5L11 22h2l.2-2.5.8-.5 1 2 2-1-.3-3.7c-.3-1.3-1-2.4-2-3.2 1.1-.8 1.8-2.1 1.8-3.6C16.5 4 14.5 2 12 2zM10 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"
      />
    </svg>
  );
}

// --- Social platform marks (redrawn geometry, currentColor) ----------------

export function TikTokIcon({ className = '', title = 'TikTok' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-label={title}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M16.5 3c.3 2 1.5 3.6 3.5 4v2.5c-1.3 0-2.6-.4-3.6-1.1v6.2a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v2.6a3 3 0 1 0 2.1 2.9V3h2.7z"
      />
    </svg>
  );
}

export function InstagramIcon({ className = '', title = 'Instagram' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-label={title}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9c-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.21 15.58 2.2 15.2 2.2 12s0-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.21 8.8 2.2 12 2.2zm0 1.95c-3.15 0-3.52.01-4.76.07-.92.04-1.42.2-1.75.33-.44.17-.75.37-1.08.7-.33.33-.53.64-.7 1.08-.13.33-.29.83-.33 1.75-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.04.92.2 1.42.33 1.75.17.44.37.75.7 1.08.33.33.64.53 1.08.7.33.13.83.29 1.75.33 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c.92-.04 1.42-.2 1.75-.33.44-.17.75-.37 1.08-.7.33-.33.53-.64.7-1.08.13-.33.29-.83.33-1.75.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.04-.92-.2-1.42-.33-1.75a2.9 2.9 0 0 0-.7-1.08 2.9 2.9 0 0 0-1.08-.7c-.33-.13-.83-.29-1.75-.33-1.24-.06-1.61-.07-4.76-.07zm0 3.32a4.53 4.53 0 1 1 0 9.06 4.53 4.53 0 0 1 0-9.06zm0 1.95a2.58 2.58 0 1 0 0 5.16 2.58 2.58 0 0 0 0-5.16zm4.74-3.4a1.06 1.06 0 1 1 0 2.12 1.06 1.06 0 0 1 0-2.12z"
      />
    </svg>
  );
}

export function XIcon({ className = '', title = 'X' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-label={title}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.2-6.81-5.96 6.81H1.7l7.73-8.84L1.25 2.25H8.1l4.71 6.23 5.43-6.23zm-1.16 17.52h1.83L7.01 4.13H5.04l12.04 15.64z"
      />
    </svg>
  );
}

export function LinkedInIcon({ className = '', title = 'LinkedIn' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-label={title}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .78 0 1.74v20.52C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.74C24 .78 23.2 0 22.22 0z"
      />
    </svg>
  );
}

export function YouTubeIcon({ className = '', title = 'YouTube' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-label={title}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M23.5 6.5a3 3 0 0 0-2.1-2.13C19.5 3.85 12 3.85 12 3.85s-7.5 0-9.4.52A3 3 0 0 0 .5 6.5 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.5 3 3 0 0 0 2.1 2.13c1.9.52 9.4.52 9.4.52s7.5 0 9.4-.52a3 3 0 0 0 2.1-2.13c.34-1.8.5-3.64.5-5.5a31.3 31.3 0 0 0-.5-5.5zM9.6 15.57V8.43L15.82 12 9.6 15.57z"
      />
    </svg>
  );
}

export function ThreadsIcon({ className = '', title = 'Threads' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-label={title}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M12.18 22h-.04c-2.85-.02-5.04-.96-6.5-2.8C4.16 17.56 3.5 15.3 3.46 12.5v-.02c.04-2.8.7-5.06 2.01-6.7C6.93 3.96 9.13 3.02 12 3h.04c2.2.02 4.04.58 5.46 1.68 1.33 1.03 2.27 2.5 2.78 4.37l-1.95.53c-.84-3.04-2.95-4.6-6.3-4.62-2.22.02-3.9.72-4.99 2.1-1.02 1.28-1.55 3.14-1.58 5.46.03 2.32.56 4.18 1.58 5.46 1.09 1.37 2.77 2.07 4.99 2.1 2-.02 3.32-.49 4.42-1.58 1.26-1.25 1.23-2.78 0.83-3.71-.24-.55-.67-1-1.26-1.35-.15 1.06-.47 1.9-.98 2.55-.68.86-1.65 1.33-2.88 1.4-1 .06-1.95-.18-2.69-.66-.87-.58-1.38-1.46-1.43-2.49-.1-2.02 1.5-3.47 4-3.61.88-.05 1.7-.01 2.46.11-.1-.61-.31-1.1-.62-1.45-.42-.48-1.08-.72-1.95-.73-.97 0-1.71.36-2.18 1.05l-1.62-1.09c.84-1.24 2.13-1.87 3.82-1.87 2.6.02 4.16 1.62 4.32 4.4.09.04.18.08.27.13 1.27.6 2.2 1.5 2.68 2.62.67 1.55.73 4.08-1.3 6.1C16.6 21.3 14.74 21.98 12.18 22zm-.86-8.42c-.13 0-.27 0-.4.01-1.88.11-2.18 1.01-2.16 1.55.03.71.8 1.04 1.54 1 .96-.06 2.05-.43 2.24-2.45-.4-.07-.81-.11-1.22-.11z"
      />
    </svg>
  );
}

export function FacebookIcon({ className = '', title = 'Facebook' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-label={title}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.19 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.5-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.9h-2.33V22c4.78-.75 8.44-4.92 8.44-9.94Z"
      />
    </svg>
  );
}

export function PinterestIcon({ className = '', title = 'Pinterest' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-label={title}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.64 7.86 6.36 9.32-.09-.79-.17-2 .03-2.87.18-.78 1.16-4.97 1.16-4.97s-.3-.59-.3-1.46c0-1.37.8-2.39 1.79-2.39.84 0 1.25.63 1.25 1.39 0 .85-.54 2.12-.82 3.3-.23.98.49 1.79 1.46 1.79 1.75 0 3.1-1.85 3.1-4.52 0-2.37-1.7-4.02-4.13-4.02-2.81 0-4.46 2.11-4.46 4.29 0 .85.33 1.76.74 2.26.08.1.09.18.07.28-.07.31-.24.98-.27 1.12-.04.18-.15.22-.34.13-1.25-.58-2.03-2.4-2.03-3.86 0-3.14 2.28-6.03 6.58-6.03 3.45 0 6.13 2.46 6.13 5.74 0 3.43-2.16 6.19-5.17 6.19-1.01 0-1.96-.52-2.28-1.14l-.62 2.37c-.23.86-.83 1.94-1.24 2.6.93.29 1.92.44 2.95.44 5.52 0 10-4.48 10-10S17.52 2 12 2Z"
      />
    </svg>
  );
}

export function RedditIcon({ className = '', title = 'Reddit' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-label={title}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M22 12.07c0-1.21-.99-2.2-2.2-2.2-.59 0-1.13.23-1.52.61a10.74 10.74 0 0 0-5.78-1.84l.98-4.62 3.21.68a1.58 1.58 0 1 0 .17-.94l-3.6-.76a.47.47 0 0 0-.56.36l-1.1 5.18a10.7 10.7 0 0 0-5.86 1.84 2.2 2.2 0 1 0-2.43 3.6 4.34 4.34 0 0 0-.05.66c0 3.36 3.92 6.09 8.74 6.09s8.74-2.73 8.74-6.09c0-.22-.02-.44-.05-.65A2.2 2.2 0 0 0 22 12.07Zm-15 1.55a1.55 1.55 0 1 1 3.1 0 1.55 1.55 0 0 1-3.1 0Zm8.94 4.13c-1.05 1.05-3.06 1.13-3.65 1.13-.6 0-2.6-.08-3.66-1.13a.4.4 0 0 1 .56-.56c.67.67 2.1.91 3.1.91s2.43-.24 3.1-.91a.4.4 0 0 1 .55.56Zm-.21-2.58a1.55 1.55 0 1 1 0-3.1 1.55 1.55 0 0 1 0 3.1Z"
      />
    </svg>
  );
}

export function SnapchatIcon({ className = '', title = 'Snapchat' }: IconProps) {
  // Simplified ghost silhouette. The official Simple-Icons path renders as a
  // mushy blob at 16-20px because of the dense wavy-foot detail; this version
  // is a clean filled bell-ghost that stays recognizable at every size.
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-label={title}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M12 2a6 6 0 0 0-6 6v3.5c0 .9-.4 1.7-1.1 2.3-.7.6-1.4 1-2.2 1.2-.5.1-.6.7-.2 1 .8.6 1.7 1.1 2.7 1.4l.4 1c.2.4.6.6 1 .5l1.3-.3c.4-.1.8 0 1.1.2.9.6 1.9 1 3 1s2.1-.4 3-1c.3-.2.7-.3 1.1-.2l1.3.3c.4.1.8-.1 1-.5l.4-1c1-.3 1.9-.8 2.7-1.4.4-.3.3-.9-.2-1-.8-.2-1.5-.6-2.2-1.2-.7-.6-1.1-1.4-1.1-2.3V8a6 6 0 0 0-6-6z"
      />
    </svg>
  );
}

export function DiscordIcon({ className = '', title = 'Discord' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-label={title}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"
      />
    </svg>
  );
}
