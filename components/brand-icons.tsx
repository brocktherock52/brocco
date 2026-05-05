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

export function DiscordIcon({ className = '', title = 'Discord' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-label={title}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M19.7 4.4A18.4 18.4 0 0 0 15 3l-.2.4a16.6 16.6 0 0 0-5.6 0L9 3a18.4 18.4 0 0 0-4.7 1.4A19.5 19.5 0 0 0 1 16.4 18.4 18.4 0 0 0 6.6 19l.5-.7a12 12 0 0 1-1.9-.9l.5-.4a13 13 0 0 0 12.6 0l.5.4-1.9.9.5.7a18.4 18.4 0 0 0 5.6-2.6 19.5 19.5 0 0 0-3.3-12zM9 14.6a2.2 2.2 0 0 1-2.1-2.3A2.2 2.2 0 0 1 9 10a2.2 2.2 0 0 1 2.1 2.3A2.2 2.2 0 0 1 9 14.6zm6 0a2.2 2.2 0 0 1-2.1-2.3A2.2 2.2 0 0 1 15 10a2.2 2.2 0 0 1 2.1 2.3A2.2 2.2 0 0 1 15 14.6z"
      />
    </svg>
  );
}

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
