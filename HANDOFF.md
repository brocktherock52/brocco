# brocco.ai - HANDOFF (next session, start here)

**Last updated:** 2026-05-02, end of session `7c5add35`. Site live at **https://brocco-site.vercel.app**.

This document is the single source of truth for picking up where the previous session stopped. Read it top to bottom and you will know what is shipped, what is blocked, and what to do next.

---

## 1. The 60-second status

**What brocco.ai is:** a multi-agent AI dashboard. Browser-first PWA. Bring-your-own-key (Anthropic, or any OpenAI-compatible endpoint including local Ollama). Broadcast one prompt to N agents in parallel. 9 built-in agents, 13 tools, 11 deep-linked recipes. Stripe billing wired but currently 503'd until env keys are pushed.

**Production URL:** https://brocco-site.vercel.app/ (Vercel-aliased). Custom `brocco.ai` domain not yet purchased.

**Vercel project:** `brocktherock52s-projects/brocco-site`. Auth: gh CLI logged in as `brocktherock52`, `vercel whoami` resolves the same.

**Repo of record:** this folder, `projects/bdp-consulting/arms/brocco_site/`, inside the workspace mono-repo at https://github.com/brocktherock52/bdp-consulting (private). Charter runtime lives next door at `arms/agentic_platform/`.

**Current shipped version:** **v11.2**. See `public/changelog.html` for the full ladder; `sessions/2026-05-02/timeline.md` for the narrative.

---

## 2. What is blocked, and what unblocks it

Exactly one blocker right now:

### Stripe activation needs `STRIPE_SECRET_KEY`

Workspace `.env` has `STRIPE_PUBLISHABLE_KEY` (pk_, client-only) and `VERCEL_TOKEN`, but is missing the secret key needed to create Products, Prices, Checkout Sessions, and Webhook Endpoints from server-side.

**To unblock**, the user (Brock) adds to `C:\Users\gigix\OneDrive\Desktop\BDP Consulting\.env`:

```
STRIPE_SECRET_KEY=sk_test_...
```

Get one from https://dashboard.stripe.com/apikeys (use test mode first, then swap to `sk_live_` once a real flow works).

**Once that env var is set, run this end-to-end activation:**

```powershell
cd projects/bdp-consulting/arms/brocco_site

# 1. Create products + prices in Stripe (prints 4 price IDs)
$env:STRIPE_SECRET_KEY = (Select-String -Path "..\..\..\..\..\..\.env" -Pattern "^STRIPE_SECRET_KEY=").Line -replace "^STRIPE_SECRET_KEY=", ""
node scripts/seed-stripe.mjs

# 2. Create webhook endpoint (capture whsec_ from response)
$body = @{
  url = "https://brocco-site.vercel.app/api/stripe-webhook"
  enabled_events = @(
    "checkout.session.completed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.paid",
    "invoice.payment_failed"
  )
} | ConvertTo-Json
# Use Stripe REST or run from a node oneliner; the seed-stripe.mjs script can be extended

# 3. Push 7 env vars to Vercel
$ENV_VARS = @{
  STRIPE_API_KEY = $env:STRIPE_SECRET_KEY
  STRIPE_WEBHOOK_SECRET = "whsec_from_step_2"
  STRIPE_PRICE_SOLO_MONTHLY = "price_from_step_1"
  STRIPE_PRICE_SOLO_ANNUAL  = "price_from_step_1"
  STRIPE_PRICE_TEAM_MONTHLY = "price_from_step_1"
  STRIPE_PRICE_TEAM_ANNUAL  = "price_from_step_1"
  APP_URL = "https://brocco-site.vercel.app"
}
foreach ($k in $ENV_VARS.Keys) {
  $ENV_VARS[$k] | vercel env add $k production
}

# 4. Redeploy + verify
vercel deploy --prod --yes
Invoke-RestMethod -Uri "https://brocco-site.vercel.app/api/checkout" -Method POST -ContentType "application/json" -Body '{"tier":"solo","interval":"monthly"}'
# Should now return { "url": "https://checkout.stripe.com/..." } not 503
```

Detailed Stripe research (which APIs, which webhook events, dunning policy, free-tier usage tracking, Customer Portal config) is in `sessions/2026-05-02/research/05-stripe-saas.jsonl` lines containing `Stripe Integration Playbook`.

---

## 3. Architecture map

```
projects/bdp-consulting/arms/
+-- agentic_platform/          # Charter runtime (Python). Powers /api/run.
|   +-- charter/               # The package
|   |   +-- runtime.py         # Anthropic tool-use loop, prompt caching, JSONL logs
|   |   +-- agent.py           # Markdown+YAML agent spec loader
|   |   +-- tools/             # 17 tools: files, shell, http, search, memory,
|   |   |                      #   delegate, stripe_*, slack_*, postgres_*
|   |   +-- api.py             # FastAPI server (for self-hosting)
|   |   +-- ui/index.html      # Local dev console
|   +-- agents/                # 5 markdown specs: supervisor, researcher,
|   |                          #   coder, outreach, ops
|   +-- scripts/smoke_test.py  # Verifies imports + agents + tools register
|
+-- brocco_site/               # The marketing + app (this folder)
    +-- HANDOFF.md             # YOU ARE HERE
    +-- README.md              # Local dev instructions
    +-- vercel.json            # cleanUrls, headers, caching
    +-- package.json
    +-- public/                # Vercel deploys this
    |   +-- index.html         # Landing page
    |   +-- about.html         # Founder + brand story
    |   +-- security.html      # Trust + GDPR
    |   +-- privacy.html
    |   +-- terms.html
    |   +-- changelog.html     # v1 -> v11
    |   +-- recipes.html       # Public recipe gallery (8 recipes)
    |   +-- 404.html           # Custom 404 with the croc
    |   +-- vs/
    |   |   +-- cursor.html
    |   |   +-- claude-code.html
    |   |   +-- zapier.html
    |   +-- blog/
    |   |   +-- agentic-ai-platforms-2026.html
    |   +-- docs/
    |   |   +-- index.html     # Quickstart for Charter runtime
    |   +-- app/               # The dashboard PWA
    |   |   +-- index.html     # 3x2 grid (header/library/panes/prompt)
    |   |   +-- styles.css
    |   |   +-- manifest.webmanifest
    |   |   +-- sw.js          # Service worker, app shell offline cache
    |   |   +-- scripts/
    |   |       +-- agents.js  # 9 agent specs + 13 tool definitions
    |   |       +-- app.js     # Runtime: BYOK, multi-provider router,
    |   |                      #   SSE streaming, recipe deep links,
    |   |                      #   onboarding tour, mobile menu
    |   +-- scripts/           # Marketing site JS (different from /app/scripts/)
    |   |   +-- fluid-hero.js  # WebGL fragment shader (fBm Simplex)
    |   |   +-- agent-demo.js  # Recorded demo replay on /
    |   |   +-- main.js        # Nav, FAQ, billing toggle, checkout buttons
    |   +-- assets/            # Croc SVG (mark, wordmark, favicon, OG)
    |   +-- styles.css         # Marketing site stylesheet
    |   +-- robots.txt
    |   +-- sitemap.xml
    +-- api/                   # Vercel Edge functions
    |   +-- run.ts             # Server-side Claude tool-use loop (503 until ANTHROPIC_API_KEY)
    |   +-- checkout.ts        # Stripe Checkout Session creator (503 until STRIPE_SECRET_KEY)
    |   +-- portal.ts          # Stripe Customer Portal session
    |   +-- stripe-webhook.ts  # HMAC-SHA256 verify via WebCrypto, no SDK
    |   +-- proxy.ts           # GET proxy for browser http_get tool
    +-- scripts/
    |   +-- seed-stripe.mjs    # One-time bootstrap: 2 products, 4 prices
    +-- marketing/             # Launch + distribution playbooks
    |   +-- launch-day.md      # 14-day sequence + 3 tweet drafts + channels
    |   +-- producthunt-checklist.md
    |   +-- hn-show.md         # Show HN draft + thread strategy
    |   +-- reddit-posts.md    # 4 subreddits, full drafts
    |   +-- this-week.md       # FRESH research: AI Agent Week NYC, Theo
    |                          #   t3.gg, Latent Space sponsor, viral demo
    +-- sessions/2026-05-02/   # This handoff package
        +-- timeline.md        # Chronological narrative of the session
        +-- research/          # 7 sub-agent transcripts (research gold)
        |   +-- README.md
        |   +-- 01-top-platforms.jsonl       # 20 platform survey
        |   +-- 02-cro-playbook.jsonl        # AI SaaS landing page CRO
        |   +-- 03-fluid-hero.jsonl          # WebGL hero implementations
        |   +-- 04-multi-agent-ui.jsonl      # Antigravity, Cursor 3 layouts
        |   +-- 05-stripe-saas.jsonl         # Stripe integration playbook
        |   +-- 06-distribution-playbook.jsonl  # 14-day launch
        |   +-- 07-this-week-trends.jsonl    # NYC, Theo, Latent Space
        +-- memory-snapshot/   # Memory files at end of session
        |   +-- MEMORY.md
        |   +-- feedback_no_emdashes.md
        |   +-- feedback_dont_overlead_inspiration.md
        |   +-- project_charter_agentic_platform.md
        |   +-- project_brocco_ai_launch.md
        |   +-- project_brocco_v4_app_stripe.md
        +-- pointer.md         # Path to the full session JSONL transcript
```

---

## 4. State of every URL

All return 200 (verified 2026-05-02 15:30):

| URL | What it is |
|---|---|
| `/`                                  | Landing page. Croc logo. Trust partner row. 3-pane CSS app mockup. Use cases. Features. Pricing (4 tiers). 7-question FAQ. CTA band. |
| `/app/` (308 -> `/app`)              | Multi-agent dashboard PWA. Header (croc, model pill, BYOK pill, cost meter). Left rail: 9 agents + 4 recipe shortcuts. Center: pane grid. Bottom: 3-mode prompt bar. Onboarding tour on first run. Mobile drawer menu. |
| `/recipes`                           | Public recipe gallery. 8 cards with prompt + agents + mode pill. Filter chips. Each card deep-links to `/app/#recipe=NAME`. |
| `/changelog`                         | v1 through v11 ship log. |
| `/about`                             | Founder card (BP avatar), 5 operating principles, the stack, what's next. |
| `/security`                          | SOC 2 in progress, GDPR, data handling, deletion, BYOK. |
| `/docs`                              | 11-minute quickstart for Charter runtime. Code samples. |
| `/blog/agentic-ai-platforms-2026`    | 8-min read. 20-platform survey, 3 white spaces. No Schmidt name. |
| `/vs/cursor`                         | Comparison page. |
| `/vs/claude-code`                    | Comparison page. |
| `/vs/zapier`                         | Comparison page. |
| `/privacy`                           | Privacy in plain English. |
| `/terms`                             | Terms of service. |
| `/sitemap.xml`, `/robots.txt`        | SEO basics. |
| `/api/run` (POST)                    | **503** until `ANTHROPIC_API_KEY` env var pushed to Vercel. Real Claude tool-use loop with SSE. |
| `/api/checkout` (POST)               | **503** until `STRIPE_SECRET_KEY` + 4 price IDs + `APP_URL` pushed. |
| `/api/portal` (POST)                 | **503** until `STRIPE_SECRET_KEY` pushed. |
| `/api/stripe-webhook` (POST)         | **503** until `STRIPE_WEBHOOK_SECRET` pushed. |
| `/api/proxy?url=...` (GET)           | **200**, working. Server-side proxy for browser http_get tool. Caps: 8s timeout, 500KB response, blocks private IPs. |

---

## 5. The /app dashboard, in depth

This is the killer feature, so it gets its own section.

**Entry point:** `public/app/index.html`. Wired in `public/app/scripts/app.js` (~42KB).

### Modes
- **Single:** pick 1 agent, hit Run, 1 pane spawns.
- **Broadcast:** pick N agents (multi-select on agent cards), hit Run, N panes spawn in parallel from the same prompt.
- **Supervisor:** auto-locks to the supervisor agent. Send a goal; it decomposes via `delegate(agent, task)` and each delegate spawns a sub-pane.

### BYOK + provider routing
Two providers wired in `STATE.provider`:

| Provider | Endpoint | Tool format | Streaming |
|---|---|---|---|
| `anthropic` (default) | `https://api.anthropic.com/v1/messages` with `anthropic-dangerous-direct-browser-access: true` | Native Anthropic | Anthropic SSE (`event: content_block_delta` etc) |
| `openai` (custom)     | User-supplied URL (Ollama: `http://localhost:11434/v1`, vLLM, OpenRouter, Groq, etc) | `tools[].function.parameters` | OpenAI SSE (`data: {...}\n\ndata: [DONE]`) |

The `callModel()` function in app.js routes between `anthropicStream()` and `openaiStream()`. Both return the same `{ content, stop_reason, usage }` shape so the agent loop is provider-agnostic.

Tool format adapter: `toOpenAITools()` and `toOpenAIMessages()` in app.js translate Anthropic's tool_use blocks into OpenAI's function calling format and back.

Keys live in localStorage at: `brocco.key.anthropic`, `brocco.key.tavily`, `brocco.key.openai`, `brocco.key.endpoint`, `brocco.key.model`, `brocco.key.openaiModel`, `brocco.key.provider`. None of these ever touch brocco's servers (except by user choice when paid checkout is wired).

### 9 built-in agents
In `public/app/scripts/agents.js`:

1. **researcher** - search_web, http_get, file_save. Sourced briefs.
2. **analyst** - structured findings from data.
3. **outreach** - cold email/DM/SMS drafts, no AI cliches.
4. **coder** - read code, write code, no shell in browser.
5. **supervisor** - delegate-driven decomposition.
6. **planner** - numbered execution plans.
7. **browser** - web crawl + extract.
8. **designer** - image generation + brand briefs (uses `image_gen`).
9. **app_builder** - single-file HTML+CSS+JS apps (rivals Lovable's wedge).

### 13 tools in the registry
search_web (Tavily), http_get (proxied), memory_get/put/list, file_save (browser download), delegate (spawn sub-pane), image_gen (DALL-E 3 via OpenAI key), voice_tts (browser SpeechSynthesis), done.

### 11 recipes
8 are exposed in `/recipes` gallery with deep links: `market-research`, `launch-day`, `customer-deep-dive`, `content-sprint`, `competitor-pricing-watch`, `hn-show-draft`, `daily-news-brief`, `feature-spec`, `build-an-app`, `design-pack`, `site-crawl`.

Deep-link format: `/app/#recipe=NAME`. The hashchange listener auto-loads recipe agents + prompt.

### PWA bits
`public/app/manifest.webmanifest` declares standalone display, theme color, icons.
`public/app/sw.js` cache name `brocco-app-v7-tour`. Shell-only cache; never caches `/api/*` or third-party hosts. Bump the version string when deploying any breaking change to app.js / styles.css / agents.js.

### Onboarding tour
4-step spotlight tour fires on first visit if BYOK key is already set. Steps in `TOUR_STEPS` array in app.js. Stored as `brocco.tour.completed` flag in localStorage.

---

## 6. What was learned (research index)

Seven sub-agent runs produced ~635KB of structured research. Full JSONL transcripts in `sessions/2026-05-02/research/`. Key takeaways:

| File | Key insight |
|---|---|
| `01-top-platforms.jsonl`     | 20-platform landscape. Pricing convergence: Free / $19-20 prosumer / $100-200 power / $50K-150K enterprise floor. Three white spaces: vertical-specific P&L agents, outcome-priced SMB, "wired-in" proprietary-data agents. |
| `02-cro-playbook.jsonl`      | 2026 SaaS landing-page winners. No autoplay video. Free tier (not free trial). 4-tier pricing with #3 highlighted. CTA verbs: "Start building", "Start free", "Deploy". Used to build the original index.html. |
| `03-fluid-hero.jsonl`        | Recommendation: Paper Shaders MeshGradient style; we shipped equivalent via custom WebGL fBm noise. Speed sweet spot 0.13-0.18. 5 colors + grain to hide banding. |
| `04-multi-agent-ui.jsonl`    | Antigravity Manager + Cursor 3 Glass + Replit Canvas patterns. AG-UI tool-call render pattern. localStorage + IndexedDB hybrid. The 3x2 grid in `/app` is straight from this. |
| `05-stripe-saas.jsonl`       | Stripe playbook. Hosted Checkout > Embedded > Elements. `constructEventAsync` for Edge runtime. Smart Retries + `past_due` grace. Free tier in Vercel KV. THIS IS THE FILE TO READ FIRST WHEN ACTIVATING STRIPE. |
| `06-distribution-playbook.jsonl` | 14-day launch sequence. Top 8 channels by signal. 3 tweet drafts. Brocco Recipes flywheel. |
| `07-this-week-trends.jsonl`  | Fresh 2026-05-02. AI Agent Week NYC May 4-8. Theo t3.gg roast pitch. Latent Space sponsor slot $300-500. The viral 30-sec demo idea: "8 AIs. One prompt. My phone." |

For the JSONLs, each line is one Anthropic API call or tool result. To read human-readably:

```bash
jq -r 'select(.type=="text") | .text' < sessions/2026-05-02/research/05-stripe-saas.jsonl | less
```

---

## 7. Memory files (load these for context)

Six files at `~/.claude/projects/C--Users-gigix-OneDrive-Desktop-BDP-Consulting/memory/`:

| File | Why it matters |
|---|---|
| `MEMORY.md` | The index. 28 entries spanning Brock's profile, the 8 BDP arms, prior project ships, and the new feedback rules. |
| `feedback_no_emdashes.md` | **CRITICAL.** Brock dislikes em-dashes (`-`). Use commas/periods/hyphens instead. Grep before shipping any deliverable. |
| `feedback_dont_overlead_inspiration.md` | When an outside source inspires a pivot, take the substance, lose the celebrity name. Came up after the original site was Schmidt-themed and got pushback. |
| `project_charter_agentic_platform.md` | Charter runtime state: 17 tools, 5 agents, smoke-tested, prompt caching on. |
| `project_brocco_ai_launch.md` | Original v1-v3 launch state. |
| `project_brocco_v4_app_stripe.md` | v4 onward: /app PWA, Stripe endpoints, croc rebrand, em-dash purge. |

A snapshot of all six is in `sessions/2026-05-02/memory-snapshot/` for archive.

---

## 8. Recommended first 3 actions for next session

In strict priority order:

### Action 1: Activate Stripe (10 min once `STRIPE_SECRET_KEY` is in `.env`)
Detailed steps in section 2 above. Quick smoke test after deploy:

```powershell
Invoke-RestMethod -Uri "https://brocco-site.vercel.app/api/checkout" `
  -Method POST -ContentType "application/json" `
  -Body '{"tier":"solo","interval":"monthly"}'
```

A real Stripe Checkout URL means it works.

### Action 2: Push `ANTHROPIC_API_KEY` + `TAVILY_API_KEY` to Vercel (2 min)
Already in workspace `.env`. One-liner using the `VERCEL_TOKEN`:

```powershell
$ak = (Select-String -Path .env -Pattern '^ANTHROPIC_API_KEY=').Line -replace '^ANTHROPIC_API_KEY=',''
$ak | vercel env add ANTHROPIC_API_KEY production
$tk = (Select-String -Path .env -Pattern '^TAVILY_API_KEY=').Line -replace '^TAVILY_API_KEY=',''
$tk | vercel env add TAVILY_API_KEY production
cd projects/bdp-consulting/arms/brocco_site && vercel deploy --prod --yes
```

This flips `/api/run` from 503 to live. The home-page demo's "Run live" button starts working.

### Action 3: Buy `brocco.ai` domain + alias on Vercel (15 min)
Currently the site is at `brocco-site.vercel.app`. Custom domain unlocks:
- Cleaner social shares
- Email at `hello@brocco.ai` (currently a placeholder; Brock would need to set up MX or use a forwarder)
- All the marketing copy that already says `brocco.ai`

Buy at namecheap/Cloudflare/whatever, point CNAME at `cname.vercel-dns.com`, add domain in Vercel Dashboard -> Project Settings -> Domains.

After all 3: brocco.ai is fully live, fully paid-tier-ready, on its real domain. Ready for the launch sequence in `marketing/launch-day.md`.

---

## 9. Lower-priority follow-ups (in roughly descending impact)

- **Onboarding for first-time `/app` users**: BYOK modal pops fine, but a short example/recipe trigger after key entry would help conversion. Tour exists; could add a "Run the market-research recipe to see what brocco does" CTA.
- **Real DB-backed subscription state**: `/api/stripe-webhook.ts` currently logs to console. Wire to Supabase/Neon/KV so paid plan status is queryable.
- **Auth + `/account` page**: BYOK is the auth substitute for now. To unlock paid-plan personalization, add Clerk or similar; build `/account` with the Customer Portal button.
- **Tauri desktop wrapper**: PWA install covers v1; a real `.dmg`/`.exe` build would beat ChatGPT desktop. ~half a day with Tauri 2 + the Vercel deploy as a webview source.
- **Per-page OG images**: All pages currently use `/assets/og.svg`. Twitter/Facebook prefer raster; would need PNG export.
- **`belt` CLI install** for nano-banana-2: was permission-denied this session. If Brock authorizes, install it and regenerate the hero with a chrome-crocodile sculpture render.
- **Ollama localhost auto-detect**: when user opens BYOK modal, ping `http://localhost:11434/v1/models` and offer "Use local Ollama" if found. Big delight moment for the open-source crowd.
- **Public recipe sharing**: paid users can publish a recipe URL anyone can remix. Per the launch playbook flywheel idea.
- **Browser extension companion**: clip a webpage -> spawn analyst on it.
- **More agents**: voice-bot, social-poster, calendar-scheduler, customer-support.

---

## 10. Pointers to long-form artifacts

- **Full session transcript** (4.2 MB JSONL): see `sessions/2026-05-02/pointer.md` for the local path. Not committed to keep repo size sane.
- **Sub-agent transcripts** (635 KB total): committed at `sessions/2026-05-02/research/*.jsonl`. Read these for the actual reasoning behind decisions.
- **Memory files**: `~/.claude/projects/C--Users-gigix-OneDrive-Desktop-BDP-Consulting/memory/`. Auto-loaded by Claude Code in any future session of this project. Snapshot at `sessions/2026-05-02/memory-snapshot/`.
- **Marketing playbook**: `marketing/launch-day.md` for the canonical 14-day sequence; `marketing/this-week.md` for fresh tactical moves.
- **Session timeline** (human-readable narrative): `sessions/2026-05-02/timeline.md`.

---

## 11. One-paragraph summary you can paste anywhere

> brocco.ai is a multi-agent AI dashboard, live at brocco-site.vercel.app, that lets you broadcast one prompt to N AI agents in parallel. Bring your own Anthropic key (or any OpenAI-compatible endpoint, Ollama included) and watch 9 specialist agents work in their own panes with live streaming. 13 tools, 11 recipes, 3 modes (single/broadcast/supervisor), PWA installable, mobile-friendly. Built solo by Brock (BDP Consulting) under BDP Consulting in 1 day across 11 versions, on Claude Code with the Charter open Python runtime underneath. Stripe billing wired (gated on a STRIPE_SECRET_KEY env var). 8-question FAQ, /security, /privacy, /terms, /about, 3 vs-competitor pages, public recipe gallery and changelog. Repo at github.com/brocktherock52/bdp-consulting under arms/brocco_site/.

End of handoff. Read `timeline.md` next if you want the full story.
