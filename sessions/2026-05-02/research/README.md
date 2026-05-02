# Sub-agent research transcripts (session 2026-05-02)

Seven background sub-agents ran during this session. Their full JSONL transcripts are here. Each is one Anthropic API call per line, including thinking blocks, tool calls, and tool results.

To read human-readably, use `jq`:

```bash
# Extract all assistant text from a research file
jq -r 'select(.type == "assistant") | .message.content[] | select(.type == "text") | .text' < 01-top-platforms.jsonl

# Or just the final synthesis (last text block)
jq -r '. | select(.type == "assistant") | .message.content[] | select(.type == "text") | .text' < 02-cro-playbook.jsonl | tail -100
```

## Index

### 01-top-platforms.jsonl (145 KB, ~31 tool uses)
**Question:** Top 15 commercial agentic AI platforms shipping in 2026 with positioning, pricing, killer feature, weakness for each. Synthesize into 5 hero-copy tropes, pricing patterns, 3 white spaces, one tagline recommendation.

**Key findings:**
- Surveyed 20 platforms: Cursor, Windsurf, Devin, Claude Code, Replit Agent, OpenAI Operator, Anthropic Computer Use, Google Project Mariner, Manus, MultiOn, Sierra, Decagon, Lindy, Relevance AI, CrewAI, LangGraph, AutoGPT, n8n, Zapier Agents, Vapi.
- Pricing convergence: Free / $19-20 prosumer / $100-200 power / $50K-150K enterprise floor.
- 3 hero-copy tropes: "AI [job] for [thing]", "Scale outcome without scaling headcount", "speed of thought".
- 3 white spaces: vertical-specific P&L agents, outcome-priced SMB, "wired-in" proprietary-data agents.
- Tagline winner: "Other agents read the internet. Ours reads your business." (Used directly in brocco hero.)

### 02-cro-playbook.jsonl (73 KB, ~14 tool uses)
**Question:** What is currently working for high-converting AI SaaS landing pages in 2025-2026. Section-by-section playbook.

**Key findings:**
- Hero: under 12-word headline, ONE primary CTA, real product motion (looping UI capture, not autoplay video).
- 4-tier pricing ladder, "Most Popular" highlight on tier 3, annual default ON, monthly toggle.
- Free tier (forever, with hard limits), NOT free trial.
- CTA verbs that convert in 2026: "Start building", "Start free", "Deploy". Not "Sign up", "Submit".
- Trust signals: SOC 2, "data never trains models", real customer outcomes (not just logos).
- 6-10 FAQs near final CTA.
- Drove the original brocco landing page structure.

### 03-fluid-hero.jsonl (90 KB, ~18 tool uses)
**Question:** How to ship an "awe-inspiring, fluid-dynamic" hero in 2026.

**Key findings:**
- Recommended: Paper Shaders MeshGradient (PolyForm Shield license).
- Implemented: equivalent custom WebGL fragment shader with fBm Simplex noise + UV warping, 5 brand colors, film grain. ~6 KB inline.
- Speed parameter sweet spot: 0.13 to 0.18.
- Mobile fallback for `prefers-reduced-motion`.
- Vignette gradient over the bottom 30% for text contrast.

### 04-multi-agent-ui.jsonl (117 KB, ~19 tool uses)
**Question:** Pixel-by-pixel patterns from real 2026 multi-agent dev tools (Antigravity, Cursor 3, Devin, Replit, Claude Code, Codex CLI, Amp, Copilot Workspace, VS Code).

**Key findings:**
- Antigravity Manager Surface: 3-column (walkthrough / preview / details).
- Cursor 3 "Glass" Agents Window: parallel-agents sidebar, isolated git worktrees, up to 8 agents on one prompt.
- Replit Agent 4: Design Canvas, infinite zoom, conflict-resolver sub-agent.
- Recommended layout for brocco: 3-row x 3-column grid (header / library / panes / inspector / prompt). **Implemented exactly this.**
- BYOK pattern: store in OS credential store or localStorage with WebCrypto encryption; "stays in your browser" copy is the trust UX.
- Tool-call render pattern (3-state): Initiation -> Execution streaming -> Completion swap-in of structured component.
- AG-UI streaming protocol with `TOOL_CALL_START`/`TOOL_CALL_ARGS`/`TOOL_CALL_END` events.

### 05-stripe-saas.jsonl (65 KB, ~7 tool uses)
**Question:** Best-practice Stripe integration for a 4-tier SaaS in 2026, with Vercel Edge code.

**Key findings:**
- **Stripe-Hosted Checkout** > Embedded > custom Elements > Payment Links.
- Lookup keys (`solo_monthly`, `team_annual`) for sync UI <-> Stripe.
- Edge-compatible: `Stripe.createFetchHttpClient()` and `webhooks.constructEventAsync()` (the sync version uses Node crypto, breaks on Edge).
- Webhook events to handle: `checkout.session.completed`, `customer.subscription.*`, `invoice.paid`, `invoice.payment_failed`.
- Free tier: track usage in Vercel KV with monthly key + 32-day TTL.
- Dunning: configure Smart Retries (8 retries / 2 weeks), final action = "Mark as unpaid" (NOT cancel). Status `past_due` = grace period, `unpaid` = readonly.
- Customer Portal: one-click setup, configure once in Dashboard, programmatic via `billingPortal.sessions.create({customer, return_url})`.
- **Read this file when activating Stripe in the next session.**

### 06-distribution-playbook.jsonl (82 KB, ~12 tool uses)
**Question:** 14-day launch + distribution plan for an agentic AI desktop platform competing with Claude Code, Cursor, Lovable, Replit.

**Key findings:**
- Top 8 channels: X/Twitter (AI dev cohort), r/LocalLLaMA, Hacker News (Show HN), niche subreddits, Discord (Latent Space, Cursor Community, Buildspace), newsletters (TLDR AI, Ben's Bites, Latent Space), YouTube creators, Product Hunt + Indie Hackers.
- 14-day sequence from "site live" to "first 100 paid signups," day-by-day.
- Founder-led content recommendation: short-form vertical demo videos under 90s on X first, mirror to YouTube Shorts and TikTok. 1 clip/day for 30 days.
- 3 launch tweet drafts at different angles (product-led, comparison, build-in-public).
- Distribution flywheel idea: **"Brocco Recipes"** public gallery. Implemented as `/recipes` page.
- Lead magnets: free agent runs (50/mo), Brocco Recipes Gallery, "What can my computer actually do?" wizard.

### 07-this-week-trends.jsonl (63 KB, ~9 tool uses)
**Question:** Five marketing moves to make THIS WEEK that we haven't already covered.

**Key findings:**
- **Quote-tweet jump on the Cursor 3 Agents Window viral demo** with brocco's "no IDE, no install, BYOK, in your phone browser" angle.
- **AI Agent Week NYC, May 4-8** - https://www.aiagentweek.com/. Demo nights, no booth needed.
- **Ruya AI Hackathon** on Devpost - sponsor angle ($500 credit prize) or participant resource.
- **AI Tinkerers** local IRL meetups - 30+ city chapters, pitch a 5-min lightning demo.
- **Latent Space podcast newsletter** sponsor slot ($300-500 estimated, ~95% ICP).
- **Theo Browne (t3.gg) roast pitch:** DM with "build a custom recipe pack with your stack pre-loaded" trade.
- **Viral demo idea:** "8 AIs. One prompt. My phone." 30-second clip, broadcast mode visible, contradictory roasts side-by-side, voice TTS reads "brocco dot A I" at the end. Saved verbatim in `marketing/this-week.md`.

## Combined research = ~635 KB in 7 files

If you only have time to read one: **05-stripe-saas.jsonl** if you are activating payments, **04-multi-agent-ui.jsonl** if you are improving the dashboard, **07-this-week-trends.jsonl** if you are doing distribution.
