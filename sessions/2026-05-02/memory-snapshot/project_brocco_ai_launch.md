---
name: brocco.ai marketing site shipped 2026-05-02
description: brocco.ai marketing site live at brocco-site.vercel.app — landing page + /security + /docs + /vs/zapier + /blog + Vercel Edge /api/run for live agent demo (gracefully off until env keys pushed).
type: project
originSessionId: 7c5add35-ed63-4280-a3e9-3a80fca2b792
---
Shipped 2026-05-02 in same session as Charter platform.

**Domain target:** `brocco.ai` (not yet purchased — site lives at brocco-site.vercel.app via Vercel deploy).

**Tagline:** "Agents that do the work." / "Other agents read the internet. Brocco reads your business."

**Live URLs (production, vercel alias):**
- https://brocco-site.vercel.app/ — landing page (WebGL fluid hero, scripted demo, pricing, FAQ)
- https://brocco-site.vercel.app/security — trust/security overview
- https://brocco-site.vercel.app/docs — quickstart with code samples
- https://brocco-site.vercel.app/vs/zapier — head-to-head comparison
- https://brocco-site.vercel.app/blog/agentic-ai-platforms-2026 — landscape post
- https://brocco-site.vercel.app/api/run — Vercel Edge function (real Claude tool-use loop, returns 503 until ANTHROPIC_API_KEY + TAVILY_API_KEY are pushed)

**Repo:** `projects/bdp-consulting/arms/brocco_site/` — static `public/` + `api/run.ts` Edge function. Vercel-linked to project `brocktherock52s-projects/brocco-site`.

**Branding:**
- Logo: hand-crafted white broccoli SVG (cluster of florets + tapered stem). Files: `public/assets/logomark.svg`, `logo-wordmark.svg`, `favicon.svg`, `og.svg`.
- Palette: brand=#22c55e (broccoli green), bg-0=#050807, fg=#e9eef1.
- Typography: Inter (sans) + JetBrains Mono.

**Hero:** custom WebGL fragment shader (fBm Simplex noise + UV warping + 5-color brand palette + film grain). ~6KB inline. Falls back to CSS gradient on `prefers-reduced-motion` / no-WebGL.

**To enable the live `/api/run` demo:**
```powershell
cd projects/bdp-consulting/arms/brocco_site
vercel env add ANTHROPIC_API_KEY production    # paste workspace .env value
vercel env add TAVILY_API_KEY production
vercel deploy --prod --yes
```
Cookie rate-limited to 1 run / 24h / IP. Hard cap: 6 tool-use steps, 1000-char prompt.

**v2 Charter additions** (also shipped in this session):
- 7 new tools: `stripe_customer_lookup`, `stripe_create_invoice`, `slack_post_webhook`, `slack_post_channel`, `postgres_query`, `postgres_execute` (registered alongside the original 11; total now 17)
- 1 new agent: `ops` — bridges Stripe/Slack/Postgres for business workflows
- Total: 5 agents, 17 tools, smoke test green

**Research outputs from this session live in transcripts:**
- 20 commercial agentic platforms surveyed (Cursor, Devin, Manus, Sierra, Decagon, Lindy, Relevance, CrewAI, LangGraph, Operator, Mariner, Vapi, etc.)
- Pricing convergence: Free / $19-20 prosumer / $100-200 power / $50K-150K enterprise floor
- 3 white spaces identified: vertical-specific P&L agents, outcome-priced SMB, "wired-in" proprietary-data agents
- Tagline winner from research: "Other agents read the internet. Ours reads your business."

**Open follow-ups:**
- Buy brocco.ai domain (currently brocco-site.vercel.app)
- Push ANTHROPIC_API_KEY + TAVILY_API_KEY to Vercel env to enable live demo
- Install `belt` CLI to regenerate hero image via nano-banana-2 (skill exists, CLI install was permission-denied this session)
- PNG OG image (currently SVG, works on most platforms but X/FB prefer raster)
