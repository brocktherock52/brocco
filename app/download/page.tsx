import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, CheckCircle2 } from 'lucide-react';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { InstallButton } from '@/components/install-button';
import { DownloadHero } from '@/components/download-hero';
import { Logomark } from '@/components/logo';
import {
  AnthropicIcon,
  OpenAIIcon,
  OllamaIcon,
  VercelIcon,
  StripeIcon,
  TavilyIcon,
  AppleIcon,
  WindowsIcon,
  LinuxIcon,
  McpIcon,
} from '@/components/brand-icons';

export const metadata: Metadata = {
  title: 'Install brocco',
  description:
    'Install brocco anywhere. Native PWA on Mac and Windows. MCP server for Claude Desktop. REST API for everything else. Bring your own Claude or OpenAI key.',
  alternates: { canonical: '/download' },
  openGraph: {
    title: 'Install brocco - Mac, Windows, Claude Desktop',
    description: 'Native PWA + MCP + REST. Pick your stack, install in one click.',
  },
};

const PARTNERS = [
  { name: 'Anthropic', Icon: AnthropicIcon },
  { name: 'OpenAI', Icon: OpenAIIcon },
  { name: 'Ollama', Icon: OllamaIcon },
  { name: 'Vercel', Icon: VercelIcon },
  { name: 'Stripe', Icon: StripeIcon },
  { name: 'Tavily', Icon: TavilyIcon },
];

const PROOFS = [
  'BYOK on every plan — Anthropic / OpenAI / Ollama / Groq / vLLM / OpenRouter',
  'Same dashboard everywhere: web, native PWA, Claude Desktop tool, REST',
  'Audit-grade JSONL logs that your security team can sign off on',
  'Zero data retention by default. Your prompts never train a model.',
];

export default function DownloadPage() {
  return (
    <>
      <Nav />
      <main>
        <DownloadHero />

        {/* PARTNER STRIP */}
        <section className="border-y border-white/[0.05] bg-bg-1/40 py-10">
          <div className="container-x">
            <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
              Built on infra and models you already trust
            </p>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
              {PARTNERS.map((p) => (
                <li
                  key={p.name}
                  className="inline-flex items-center gap-2 text-ink-dim opacity-70 transition-opacity hover:opacity-100"
                >
                  <p.Icon className="h-5 w-5" />
                  <span className="text-[13px] font-medium">{p.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* PRIMARY DOWNLOAD CARDS */}
        <section className="py-20 md:py-24">
          <div className="container-x">
            <div className="mx-auto max-w-3xl text-center">
              <p className="pill mx-auto">One-click install</p>
              <h2 className="mt-5 text-display-lg">
                <span className="text-grad">Mac, Windows, mobile.</span>{' '}
                <span className="font-serif italic font-medium text-grad-brand">All native.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[16px] text-ink-dim">
                Brocco installs as a Progressive Web App. ~50 KB cache, auto-updates, runs as a real desktop window. No App Store review queue.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2">
              <PlatformCard
                Icon={AppleIcon}
                title="Brocco for Mac"
                sub="macOS 12 Monterey or later. Apple Silicon (M1/M2/M3/M4) and Intel."
                steps={[
                  'Click Install (opens /app in your browser).',
                  'Chrome / Brave: click the install icon in the address bar. Safari: File → Add to Dock.',
                  'Brocco appears in your Applications folder and Dock. Standalone window.',
                ]}
                meta={['~50 KB cache', 'auto-updates', 'code-signed via browser']}
              />
              <PlatformCard
                Icon={WindowsIcon}
                title="Brocco for Windows"
                sub="Windows 10 / 11. Edge, Chrome, or Brave recommended."
                steps={[
                  'Click Install (opens /app).',
                  'Click the install icon in the address bar (small monitor with a down arrow).',
                  'Brocco pins to your taskbar and Start menu. Real desktop window.',
                ]}
                meta={['~50 KB cache', 'auto-updates', 'WebView2 (built-in)']}
              />
            </div>

            {/* Native binaries (coming) */}
            <h3 className="mt-16 text-center font-mono text-[12px] uppercase tracking-[0.16em] text-ink-faint">
              Native binaries (Tauri 2)
            </h3>
            <div className="mx-auto mt-4 grid max-w-3xl gap-4 md:grid-cols-2">
              <SoonCard
                Icon={AppleIcon}
                title="Brocco.app (Mac, .dmg)"
                body="~4 MB Tauri 2 native binary. Notarized for Gatekeeper. Universal Apple Silicon + Intel."
              />
              <SoonCard
                Icon={WindowsIcon}
                title="Brocco.exe (Windows installer)"
                body="~4 MB Tauri 2 native binary. Code-signed for SmartScreen. x64 + ARM64."
              />
            </div>
          </div>
        </section>

        {/* OTHER PATHS */}
        <section className="border-t border-white/[0.05] py-20">
          <div className="container-x">
            <div className="mx-auto max-w-2xl text-center">
              <p className="pill mx-auto">More ways to run brocco</p>
              <h2 className="mt-5 text-display-lg text-grad">
                Inside Claude. Inside Cursor. Inside your stack.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[16px] text-ink-dim">
                The same agents work everywhere a developer already lives.
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3">
              <PathCard
                Icon={McpIcon}
                title="MCP for Claude Desktop"
                body="Every brocco agent registers as a callable tool inside Claude Desktop, Cursor, and any MCP-compatible client."
                href="#mcp-setup"
                cta="Setup"
              />
              <PathCard
                Icon={LinuxIcon}
                title="Linux + Mobile"
                body="PWA install on Linux (Chrome / Edge), iOS Safari, Android Chrome. Same dashboard, same BYOK."
                href="/app"
                cta="Open in browser"
              />
              <PathCard
                Icon={ShieldCheck}
                title="REST API"
                body="POST /api/v1/run with Bearer auth. Brocco as the agent step in n8n, Make, Zapier, or your code."
                href="#rest-api"
                cta="curl example"
              />
            </div>
          </div>
        </section>

        {/* CONFIDENCE STRIP */}
        <section className="py-16">
          <div className="container-x">
            <div className="mx-auto max-w-3xl rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8">
              <ul className="grid gap-3 md:grid-cols-2">
                {PROOFS.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-ink-dim">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-5 text-[13px]">
                <span className="inline-flex items-center gap-2 font-mono text-[11px] text-ink-faint">
                  <Logomark className="h-5 w-5" />
                  brocco.dev · v2.4
                </span>
                <Link
                  href="/security"
                  className="inline-flex items-center gap-1 text-cyan-glow underline-offset-4 hover:underline"
                >
                  Security and trust <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* MCP SETUP */}
        <section className="py-16">
          <div className="container-x max-w-3xl">
            <h2 id="mcp-setup" className="text-[22px] font-semibold tracking-tight text-grad">
              MCP server setup (Claude Desktop, Cursor)
            </h2>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-dim">
              The brocco MCP server exposes every brocco agent as a callable tool inside Claude Desktop or any MCP-compatible client.
            </p>
            <p className="mt-5 text-[14.5px] text-ink-dim">
              <strong className="text-white">Step 1</strong> · install Charter (the brocco runtime, ~64 KB Python package):
            </p>
            <Pre>{`git clone https://github.com/brocktherock52/bdp-consulting
cd bdp-consulting/projects/bdp-consulting/arms/agentic_platform
pip install -e .`}</Pre>
            <p className="mt-4 text-[14.5px] text-ink-dim">
              <strong className="text-white">Step 2</strong> · edit{' '}
              <code className="font-mono text-cyan-glow">claude_desktop_config.json</code> (Claude Desktop → Settings → Developer → Edit Config):
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
              <strong className="text-white">Step 3</strong> · restart Claude Desktop. The brocco tools appear under the tools menu.
            </p>

            <h2 id="rest-api" className="mt-14 text-[22px] font-semibold tracking-tight text-grad">
              REST API for ChatGPT, n8n, curl
            </h2>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-dim">
              The same agents are available over HTTP. Pass your Anthropic key as a Bearer token (BYOK passthrough).
            </p>
            <Pre>{`curl -N https://brocco-site.vercel.app/api/v1/run \\
  -H "Authorization: Bearer sk-ant-YOUR-KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"agent": "researcher", "prompt": "Top 3 alternatives to Notion under $20/mo"}'`}</Pre>
            <p className="mt-4 text-[14.5px] text-ink-dim">
              Response streams Server-Sent Events:{' '}
              <code className="font-mono text-cyan-glow">run_started</code>,{' '}
              <code className="font-mono text-cyan-glow">tool_call</code>,{' '}
              <code className="font-mono text-cyan-glow">tool_result</code>,{' '}
              <code className="font-mono text-cyan-glow">assistant_text</code>,{' '}
              <code className="font-mono text-cyan-glow">run_finished</code>. List agents at{' '}
              <Link href="/api/v1/agents" className="text-cyan-glow underline-offset-4 hover:underline">
                GET /api/v1/agents
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

type IconComp = React.ComponentType<{ className?: string }>;

function PlatformCard({
  Icon,
  title,
  sub,
  steps,
  meta,
}: {
  Icon: IconComp;
  title: string;
  sub: string;
  steps: string[];
  meta: string[];
}) {
  return (
    <div className="card card-hover relative overflow-hidden p-7">
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand/10 blur-3xl" />
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand/30 to-cyan/20 ring-1 ring-white/[0.10]">
        <Icon className="h-6 w-6 text-white" />
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
  Icon,
  title,
  body,
}: {
  Icon: IconComp;
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
        <a
          href="https://github.com/brocktherock52/bdp-consulting"
          className="text-[12.5px] text-cyan-glow hover:underline"
        >
          Watch releases →
        </a>
      </div>
    </div>
  );
}

function PathCard({
  Icon,
  title,
  body,
  href,
  cta,
}: {
  Icon: IconComp;
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="card card-hover group block p-5 transition-transform hover:-translate-y-0.5"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] ring-1 ring-white/[0.08]">
        <Icon className="h-4 w-4 text-brand-glow" />
      </div>
      <h3 className="mt-4 text-[15px] font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-dim">{body}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-[13px] text-cyan-glow">
        {cta} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-lg border border-white/[0.06] bg-bg-2 p-4 font-mono text-[12.5px] leading-relaxed text-ink">
      {children}
    </pre>
  );
}
