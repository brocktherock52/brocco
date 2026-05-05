import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Apple, AppWindow, Globe2, Terminal, Plug } from 'lucide-react';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { InstallButton } from '@/components/install-button';

export const metadata: Metadata = {
  title: 'Download',
  description: 'Install brocco anywhere. Native PWA on Mac and Windows. MCP server for Claude Desktop. REST API for everything else.',
  alternates: { canonical: '/download' },
};

export default function DownloadPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="relative pt-32 pb-12 md:pt-40">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-radial-glow" />
          <div className="container-x text-center">
            <p className="pill mx-auto">Download</p>
            <h1 className="mx-auto mt-5 max-w-3xl text-display-xl text-grad">Install brocco anywhere.</h1>
            <p className="mx-auto mt-5 max-w-xl text-[16px] text-ink-dim">
              PWA install for Mac, Windows, Linux, and mobile. MCP server for Claude Desktop, Cursor, and any MCP-compatible client. REST API for everything else.
            </p>
          </div>
        </section>

        <section className="pb-20">
          <div className="container-x">
            <div className="grid gap-5 md:grid-cols-2">
              <PlatformCard
                icon={Apple}
                title="Brocco for Mac"
                sub="macOS 12 Monterey or later. Apple Silicon (M1/M2/M3/M4) and Intel."
                steps={[
                  'Click Install above (opens /app).',
                  'Chrome: click the install icon in the address bar. Safari: File → Add to Dock.',
                  'Brocco appears in your Applications folder and Dock. Standalone window, no browser chrome.',
                ]}
                meta={['~50KB cache', 'auto-updates', 'code-signed via browser']}
              />
              <PlatformCard
                icon={AppWindow}
                title="Brocco for Windows"
                sub="Windows 10 / 11. Edge, Chrome, or Brave recommended."
                steps={[
                  'Click Install above (opens /app).',
                  'Click the install icon in the address bar (small monitor with a down arrow).',
                  'Brocco pins to your taskbar and Start menu. Launches as a real desktop window.',
                ]}
                meta={['~50KB cache', 'auto-updates', 'WebView2 (built-in)']}
              />
            </div>

            <h3 className="mt-14 font-mono text-[12px] uppercase tracking-[0.16em] text-ink-faint">
              Native binaries (Tauri, coming soon)
            </h3>
            <div className="mt-3 grid gap-5 md:grid-cols-2">
              <SoonCard
                icon={Apple}
                title="Brocco.app (Mac, .dmg)"
                body="~4 MB Tauri 2 native binary. Notarized for macOS Gatekeeper. Apple Silicon + Intel universal."
              />
              <SoonCard
                icon={AppWindow}
                title="Brocco.exe (Windows installer)"
                body="~4 MB Tauri 2 native binary. Code-signed for SmartScreen. x64 + ARM64."
              />
            </div>

            <h3 className="mt-14 font-mono text-[12px] uppercase tracking-[0.16em] text-ink-faint">
              Other ways to use brocco
            </h3>
            <div className="mt-3 grid gap-4 md:grid-cols-3">
              <SecondaryCard
                icon={Globe2}
                title="Linux + mobile"
                body="PWA install works on Linux (Chrome / Edge), iOS Safari, Android Chrome. Same dashboard, BYOK, full feature parity."
                href="/app"
                cta="Open the app"
              />
              <SecondaryCard
                icon={Plug}
                title="MCP for Claude Desktop"
                body="Run brocco agents from inside Claude Desktop, Cursor, or any MCP client. Each agent registers as a callable tool."
                href="/docs"
                cta="Setup steps"
              />
              <SecondaryCard
                icon={Terminal}
                title="REST API"
                body={`POST /api/v1/run with Bearer auth. Plug brocco into ChatGPT custom GPTs, n8n, Zapier, anything that speaks HTTP.`}
                href="/docs"
                cta="curl example"
              />
            </div>
          </div>
        </section>

        <section className="pb-24">
          <div className="container-x max-w-3xl">
            <h2 id="mcp-setup" className="text-[22px] font-semibold tracking-tight text-grad">
              MCP server setup (Claude Desktop, Cursor)
            </h2>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-dim">
              The brocco MCP server exposes every brocco agent as a callable tool inside Claude Desktop or any MCP-compatible client. Each agent (researcher, coder, outreach, supervisor, etc.) becomes a tool you can call from a Claude conversation.
            </p>
            <p className="mt-5 text-[14.5px] text-ink-dim">
              <strong className="text-white">Step 1</strong>, install Charter (the brocco runtime, ~64 KB Python package):
            </p>
            <Pre>{`git clone https://github.com/brocktherock52/bdp-consulting
cd bdp-consulting/projects/bdp-consulting/arms/agentic_platform
pip install -e .`}</Pre>
            <p className="mt-4 text-[14.5px] text-ink-dim">
              <strong className="text-white">Step 2</strong>, edit <code className="font-mono text-cyan-glow">claude_desktop_config.json</code> (Claude Desktop → Settings → Developer → Edit Config):
            </p>
            <Pre>{`{
  "mcpServers": {
    "brocco": {
      "command": "python",
      "args": ["-m", "charter.mcp_server"],
      "env": {
        "ANTHROPIC_API_KEY": "sk-ant-...",
        "TAVILY_API_KEY": "tvly-..."
      }
    }
  }
}`}</Pre>
            <p className="mt-4 text-[14.5px] text-ink-dim">
              <strong className="text-white">Step 3</strong>, restart Claude Desktop. Open a new chat. The brocco tools appear under the tools menu.
            </p>

            <h2 id="rest-api" className="mt-14 text-[22px] font-semibold tracking-tight text-grad">
              REST API for ChatGPT, n8n, curl
            </h2>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-dim">
              The same agents are available over HTTP. Pass your own Anthropic key as a Bearer token (BYOK pass-through).
            </p>
            <Pre>{`curl -N https://brocco-site.vercel.app/api/v1/run \\
  -H "Authorization: Bearer sk-ant-YOUR-KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"agent": "researcher", "prompt": "Top 3 alternatives to Notion under $20/mo"}'`}</Pre>
            <p className="mt-4 text-[14.5px] text-ink-dim">
              Response streams Server-Sent Events: <code className="font-mono text-cyan-glow">run_started</code>, <code className="font-mono text-cyan-glow">tool_call</code>, <code className="font-mono text-cyan-glow">tool_result</code>, <code className="font-mono text-cyan-glow">assistant_text</code>, <code className="font-mono text-cyan-glow">run_finished</code>. List agents at <Link href="/api/v1/agents" className="text-cyan-glow underline-offset-4 hover:underline">GET /api/v1/agents</Link>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function PlatformCard({
  icon: Icon,
  title,
  sub,
  steps,
  meta,
}: {
  icon: typeof Apple;
  title: string;
  sub: string;
  steps: string[];
  meta: string[];
}) {
  return (
    <div className="card card-hover relative overflow-hidden p-7">
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand/10 blur-3xl" />
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand/30 to-cyan/20 ring-1 ring-white/[0.10]">
        <Icon className="h-6 w-6 text-brand-glow" />
      </div>
      <h2 className="mt-5 text-[22px] font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-[13.5px] text-ink-dim">{sub}</p>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <InstallButton variant="primary" />
        <Link href="/app" className="btn-ghost text-[13px] px-4 py-2">
          Open in browser <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <ol className="mt-5 space-y-2 pl-5 text-[13.5px] leading-relaxed text-ink-dim list-decimal">
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-white/[0.06] pt-4 font-mono text-[11.5px] text-ink-faint">
        {meta.map((m) => (
          <span key={m}>• {m}</span>
        ))}
      </div>
    </div>
  );
}

function SoonCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Apple;
  title: string;
  body: string;
}) {
  return (
    <div className="card relative overflow-hidden p-6 opacity-90">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.04] ring-1 ring-white/[0.08]">
        <Icon className="h-5 w-5 text-ink-dim" />
      </div>
      <h3 className="mt-4 text-[17px] font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 text-[13.5px] text-ink-dim">{body}</p>
      <div className="mt-4 flex items-center gap-2">
        <span className="rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1 font-mono text-[11px] text-ink-faint">
          Coming soon
        </span>
        <a href="https://github.com/brocktherock52/bdp-consulting" className="text-[12.5px] text-cyan-glow hover:underline">
          Watch releases →
        </a>
      </div>
    </div>
  );
}

function SecondaryCard({
  icon: Icon,
  title,
  body,
  href,
  cta,
}: {
  icon: typeof Apple;
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="card card-hover p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/[0.04] ring-1 ring-white/[0.08]">
          <Icon className="h-4 w-4 text-brand-glow" />
        </span>
        <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
      </div>
      <p className="mt-2.5 text-[13px] leading-relaxed text-ink-dim">{body}</p>
      <Link href={href} className="mt-3 inline-flex items-center gap-1 text-[13px] text-cyan-glow hover:underline">
        {cta} <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-lg border border-white/[0.06] bg-bg-2 p-4 font-mono text-[12.5px] leading-relaxed text-ink">
      {children}
    </pre>
  );
}
