import type { JSX } from 'react';

/**
 * Safe inline-markdown renderer for agent output.
 *
 * Agents can emit adversarial tool_result / http_get content, so we must never
 * inject their raw text as HTML. We HTML-escape the line first, THEN apply our
 * own bold + inline-code transforms on the already-escaped string. The only
 * tags that can reach the DOM are the <strong> / <code> we add ourselves; any
 * `<script>`, `onerror=`, etc. in the source becomes inert escaped text.
 *
 * Visual output is identical to the previous (unsafe) regex renderer.
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderMd(text: string): (JSX.Element | null)[] {
  const lines = text.split('\n');
  return lines.map((ln, i) => {
    if (ln.startsWith('```')) return null;
    if (ln.startsWith('|')) {
      return (
        <div key={i} className="my-0.5 font-mono text-[11.5px] text-ink-dim">
          {ln}
        </div>
      );
    }
    // Escape first, then layer our own safe markup on top of escaped text.
    const html = escapeHtml(ln)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(
        /`([^`]+)`/g,
        '<code class="font-mono text-[11.5px] bg-white/[0.06] px-1 py-0.5 rounded">$1</code>',
      );
    return <div key={i} dangerouslySetInnerHTML={{ __html: html || '&nbsp;' }} />;
  });
}
