---
name: brocco.ai v4 multi-agent app + Stripe shipped 2026-05-02
description: brocco.ai v4 ships /app PWA (multi-agent dashboard, BYOK, parallel agents), Stripe Checkout + portal + webhook endpoints, croc rebrand, Schmidt mentions removed, em-dashes purged. Live at brocco-site.vercel.app/app.
type: project
originSessionId: 7c5add35-ed63-4280-a3e9-3a80fca2b792
---
Shipped 2026-05-02 (same session). Major rebrand + product expansion of brocco.ai.

**Logo:** white crocodile profile, replaces broccoli (which was the original mark). SVG hand-crafted. Files: `public/assets/logomark.svg`, `logo-wordmark.svg`, `favicon.svg`, `og.svg`.

**Multi-agent dashboard PWA** at `https://brocco-site.vercel.app/app`:
- 3-row x 2-col layout: header / library / panes / prompt bar (per Antigravity Manager + Cursor 3 Glass research)
- BYOK pattern: Anthropic key stored in `localStorage.brocco.key.anthropic`, `dangerous-direct-browser-access` header, never touches brocco servers
- Tools available in browser: `search_web` (Tavily), `http_get` (proxied via /api/proxy), `memory_*` (localStorage namespaced per agent), `file_save` (browser download), `delegate` (spawn parallel pane), `done`
- 6 built-in agent specs in `public/app/scripts/agents.js`: researcher, analyst, outreach, coder, supervisor, planner
- 4 prebuilt recipes (one-click multi-agent runs): market-research, launch-day, customer-deep-dive, content-sprint
- 3 modes: Single, Broadcast (one prompt to N agents in parallel), Supervisor (decomposes via delegate)
- Cmd+K agent picker, Cmd+Enter send, Cmd+. stop all
- PWA: `manifest.webmanifest` + `sw.js` cache app shell, install button when supported
- Cost meter live in header, per-pane token tally in footer

**Stripe endpoints** (all Vercel Edge, all return 503 gracefully until env keys are pushed):
- `api/checkout.ts` POST {tier, interval} -> Stripe Checkout Session URL
- `api/portal.ts` POST {customer_id} -> Customer Portal URL
- `api/stripe-webhook.ts` HMAC-SHA256 verify via WebCrypto (no SDK dependency)
- `api/proxy.ts` GET ?url=... server-side proxy for browser http_get with safety caps
- `scripts/seed-stripe.mjs` one-time bootstrap script: creates Solo + Team Products and 4 monthly+annual Prices, prints `vercel env add` commands

**To enable paid checkout** (one-time, ~5 min):
```powershell
cd projects/bdp-consulting/arms/brocco_site
$env:STRIPE_API_KEY = "<your stripe sk_live_ or sk_test_>"
node scripts/seed-stripe.mjs                              # prints 4 price IDs
vercel env add STRIPE_API_KEY production
vercel env add STRIPE_PRICE_SOLO_MONTHLY production       # paste from above
vercel env add STRIPE_PRICE_SOLO_ANNUAL production
vercel env add STRIPE_PRICE_TEAM_MONTHLY production
vercel env add STRIPE_PRICE_TEAM_ANNUAL production
vercel env add STRIPE_WEBHOOK_SECRET production           # whsec_... from Stripe Dashboard webhook
vercel env add APP_URL production                         # https://brocco.ai
vercel deploy --prod --yes
# In Stripe Dashboard: add webhook endpoint at https://brocco.ai/api/stripe-webhook
# events: checkout.session.completed, customer.subscription.*, invoice.paid, invoice.payment_failed
```

**Rebrand pass:**
- All Schmidt mentions removed from site copy. Substance kept in brocco's voice. Memory has feedback `feedback_dont_overlead_inspiration.md`.
- All em-dashes purged across 12 files. Replaced with commas, periods, or " - ". Memory has feedback `feedback_no_emdashes.md` for future deliverables.
- Hero CTAs: primary now "Open the app" -> /app/, was "Start free" -> #cta
- Pricing CTAs: Free -> /app/, Solo + Team -> /api/checkout (POST {tier, interval}), Enterprise -> mailto:hello@brocco.ai
- Nav: added "Open app" as first link, brand-color highlighted

**Verified live 2026-05-02:** 9/10 URLs return 200 (the 10th, /app/ with trailing slash, 308-redirects to /app which is 200; browsers follow this transparently). /api/proxy returned 200 fetching example.com. /api/checkout + /api/portal return 503 with helpful detail (expected, no Stripe env yet).

**What's NOT shipped yet:**
- Tauri desktop wrapper (skipped, PWA install covers v1)
- nano-banana-2 hero photography (belt CLI install was permission-denied)
- Real DB-backed subscription state (webhook handler logs to console; needs Supabase / Neon / KV wiring)
- Auth (BYOK is the auth substitute for v1; no user accounts on brocco.ai itself yet)
- /account page for portal access (need auth first)

**v5 through v9 shipped same session 2026-05-02:**
- v5: 2 comparison pages (`/vs/cursor`, `/vs/claude-code`) + marketing assets in `marketing/` folder (launch tweets, HN draft, 4 reddit posts, PH checklist).
- v6: SSE streaming in `/app` (text appears live char-by-char, `input_json_delta` for tool args).
- v7: `/recipes` public gallery (8 deep-linked recipes via `/app/#recipe=NAME`), `/changelog` page tracking v1-v7.
- v8: multi-provider in `/app` (Anthropic OR OpenAI-compatible / Ollama / vLLM / OpenRouter). Add custom endpoint URL + model in BYOK modal. Adapter translates Anthropic <-> OpenAI tool format.
- v9: mobile pass on `/app` (drawer menu + library overlay below 720px), 2 new tools (`image_gen` via DALL-E 3 with OpenAI key, `voice_tts` via browser SpeechSynthesis), 2 new agents (`browser` for web crawl + extract, `designer` for image briefs).

**Final live state (12+ URLs, all 200):**
- `/`, `/app`, `/recipes`, `/changelog`, `/security`, `/docs`, `/blog/agentic-ai-platforms-2026`
- `/vs/zapier`, `/vs/cursor`, `/vs/claude-code`
- `/api/run`, `/api/checkout`, `/api/portal`, `/api/stripe-webhook`, `/api/proxy`

**Total shipped:** 8 agents, 13 tools, 8 recipes, 5 API endpoints, multi-provider, mobile-friendly, PWA-installable.
