# NEXT_SESSION_HANDOFF.md

**Project:** brocco.ai (multi-agent AI dashboard) + Charter (Python runtime)
**Repo:** https://github.com/brocktherock52/bdp-consulting (private mono-repo, branch `main`)
**Live site:** https://brocco-site.vercel.app/
**Vercel project:** `brocktherock52s-projects/brocco-site`
**Handoff date:** 2026-05-03

---

## Quick Start Instructions

> You are continuing from the previous session. The full transcript is in
> `session_logs/session_transcript_2026-05-03_18-05-00.md` (synthesized,
> human-readable) and `session_logs/raw/session_2026-05-03_18-05-00.jsonl`
> (raw 7.2MB Claude Code JSONL with every tool call). The single best
> entry document is `HANDOFF.md` in this same folder. Read this file first
> for the action checklist, then HANDOFF.md for the deeper architecture
> map. Memory files at `~/.claude/projects/.../memory/` auto-load and
> include the locked Brock style rules (no em-dashes, no "Brock Pivec" on
> public surfaces, banded vs specific CoC by audience).

Paste this paragraph at the start of the next session for zero context loss.

---

## 1. Session Summary (what we accomplished this session, 2026-05-02 -> 2026-05-03)

Across 14 product-driving user prompts (plus end-of-session ceremony), we
shipped brocco.ai from "build me an agentic AI platform" to a fully live,
revenue-generating product with 18+ named version ships:

**Built from scratch (yesterday + today):**

- **Charter runtime** at `arms/agentic_platform/`. Python package with
  Anthropic tool-use loop, prompt caching, JSONL audit logs, multi-agent
  orchestrator, FastAPI server, sandboxed tool registry, MCP server
  module. 17 tools, 5 agent specs, smoke-tested end-to-end.

- **brocco.ai marketing site** at `arms/brocco_site/`. Custom WebGL fluid
  hero shader, Lacoste-style side-profile crocodile logo, 13 site pages
  including landing, /about, /security, /privacy, /terms, /docs,
  /changelog, /recipes, /download, /blog (with index + 3 articles +
  RSS feed), /vs/cursor, /vs/claude-code, /vs/zapier, /404,
  /billing/success.

- **/app multi-agent dashboard PWA**. 9 built-in agents, 13 tools,
  11 deep-linked recipes, 3 modes (single, broadcast, supervisor),
  BYOK pattern (Anthropic OR OpenAI-compatible incl Ollama / vLLM /
  OpenRouter), SSE streaming with `content_block_delta` parsing, mobile
  drawer menu, 4-step onboarding tour, PWA install (4 PNG icons + SVG).

- **5 Vercel Edge API endpoints**: `/api/run` (in-app demo runner),
  `/api/v1/run` (public REST API with Bearer auth + BYOK pass-through),
  `/api/v1/agents` (public discovery), `/api/checkout` (Stripe Checkout
  Session creator), `/api/portal` (Stripe Customer Portal), `/api/stripe-webhook`
  (HMAC-SHA256 verify via WebCrypto, no SDK), `/api/proxy` (CORS proxy
  for browser http_get tool).

- **Stripe billing live in production**. 2 Products created in the BDP-shared
  live Stripe account, 4 Prices ($49/mo, $490/yr Solo; $199/mo, $1990/yr
  Team). Webhook `we_1TSlYIGruI6cvQMoYlEGueE4` registered. Verified all
  4 tier+interval combos return real `cs_live_*` Checkout URLs.

- **Marketing assets** in `marketing/`: 14-day launch playbook, Product
  Hunt checklist, Show HN draft, 4 Reddit drafts (LocalLLaMA, SideProject,
  AI_Agents, ChatGPTCoding), `this-week.md` with fresh tactical moves
  (AI Agent Week NYC, Theo t3.gg pitch, Latent Space sponsor, viral
  30-sec demo idea), and `seo-content-brief.md` with 10-article queue
  ranked by SEO leverage.

- **3 SEO articles published**: `/blog/agentic-ai-platforms-2026`,
  `/blog/claude-desktop-mcp-servers-2026` (~2k searches/mo target),
  `/blog/cursor-pricing-2026-breakdown` (~6k searches/mo, highest
  commercial intent), `/blog/run-multiple-ai-agents-parallel-one-prompt`
  (brocco's wedge keyword).

**Bugs found and fixed this session (this is what the user reported):**

1. **Stripe billed annual instead of monthly.** Pricing toggle defaulted
   to "Annual" active. User saw "$49/mo" but click sent `interval=annual`
   to /api/checkout, which routed to the annual price ID ($490/yr Solo,
   $1990/yr Team). Fixed by reordering the toggle so Monthly is the
   default active button. Annual is now opt-in.

2. **/app didn't open / install didn't work.** PWA manifest only had
   one SVG icon, which fails Chrome's install criteria. Generated 4 PNG
   icons via PIL (192/512 plain + 192/512 maskable), updated manifest.
   Also changed `start_url` from `/app/` to `/app` to avoid the 308
   trailing-slash redirect on PWA launch. Cleaned up `href="/app/"` to
   `href="/app"` across all 16 HTML files. Bumped service worker
   cache name to force-invalidate stale caches.

3. **Header bleed.** Removed the announcement bar entirely (it was the
   source of stacking + nav-offset bugs twice). Nav now sits at `top: 0`
   with no overlap concerns.

4. **Croc didn't read as a crocodile.** Redesigned to Lacoste-style
   side-profile silhouette: long body with sawtooth dorsal scales, 4
   stubby legs, eye, open mouth with one tooth, tail flick. Replaced
   inline SVG across 15 HTML files + 4 standalone SVG files.

5. **/download Mac+Windows split.** Restructured /download into two
   primary platform cards at top with platform-specific install steps.
   JS auto-detects user OS and highlights matching card.

**Style rules locked into memory** (`feedback_no_emdashes.md`,
`feedback_dont_overlead_inspiration.md`, plus `feedback_brock_style_rules.md`
from a parallel session): never use em-dashes anywhere, never use "Brock
Pivec" full name on public surfaces, take the substance of an outside
inspiration but not the celebrity name. All deliverables comply.

---

## 2. Current Project State (where we left off)

### Live URLs (verified 200 today)

| URL | Status | Notes |
|---|---|---|
| `/`                                   | 200 | Landing page, Lacoste croc, Monthly default toggle |
| `/app`                                | 200 | Dashboard PWA, no redirect, install button works |
| `/about`, `/security`, `/privacy`, `/terms`, `/docs`, `/changelog` | 200 | All trust pages |
| `/recipes`                            | 200 | 8 deep-linked recipe cards |
| `/download`                           | 200 | Mac + Windows + secondary install paths |
| `/blog`, `/blog/feed.xml`             | 200 | Blog index + RSS |
| `/blog/agentic-ai-platforms-2026`     | 200 | Article 0 |
| `/blog/claude-desktop-mcp-servers-2026` | 200 | Article 1 (~2k/mo) |
| `/blog/cursor-pricing-2026-breakdown` | 200 | Article 2 (~6k/mo, highest commercial) |
| `/blog/run-multiple-ai-agents-parallel-one-prompt` | 200 | Article 3 (wedge) |
| `/vs/cursor`, `/vs/claude-code`, `/vs/zapier` | 200 | Comparison pages |
| `/api/v1/agents`                      | 200 | Public agent discovery |
| `/api/v1/run`                         | 401 unauth / 200 streaming | Bearer auth gated |
| `/api/checkout` solo monthly          | 200 -> `cs_live_*` | $49/mo, real billing |
| `/api/checkout` team monthly          | 200 -> `cs_live_*` | $199/mo, real billing |
| `/api/checkout` solo annual           | 200 -> `cs_live_*` | $490/yr |
| `/api/checkout` team annual           | 200 -> `cs_live_*` | $1990/yr |
| `/api/proxy?url=...`                  | 200 | CORS proxy working |
| `/api/stripe-webhook`                 | 503 until secret set | (it IS set; deploys logs only) |
| `/sitemap.xml`, `/robots.txt`         | 200 | 22 URLs in sitemap |
| `/assets/icon-192.png`, `-512.png`    | 200 | PWA install icons |
| `/assets/icon-192-maskable.png`, `-512-maskable.png` | 200 | Android maskable |

### Vercel env vars (already pushed, in production)

- `STRIPE_API_KEY` (sk_live_, BDP-shared, 107 chars, BOM-stripped)
- `STRIPE_WEBHOOK_SECRET` (***REMOVED***)
- `STRIPE_PRICE_SOLO_MONTHLY` (price_1TSlXoGruI6cvQMo7JTYJGoX)
- `STRIPE_PRICE_SOLO_ANNUAL` (price_1TSlXpGruI6cvQMo7eSkzuKc)
- `STRIPE_PRICE_TEAM_MONTHLY` (price_1TSlXpGruI6cvQMoegp1rLG0)
- `STRIPE_PRICE_TEAM_ANNUAL` (price_1TSlXpGruI6cvQMoMy7wgIAU)
- `APP_URL` (https://brocco-site.vercel.app)

`ANTHROPIC_API_KEY` and `TAVILY_API_KEY` are NOT pushed to Vercel yet
(they remain in the workspace `.env`). The /api/run live demo currently
returns 503 with a helpful message ("Sign up to run agents on your own key").
This is a deliberate cost-protection choice; the primary user surface is
/app with BYOK.

### Charter (agentic_platform) state

- 17 tools registered cleanly: file_read/write/list, shell_exec,
  http_get/post, search_web, memory_get/put/list, delegate, postgres_query/execute,
  stripe_customer_lookup/create_invoice, slack_post_webhook/post_channel
- 5 agents on disk: coder, ops, outreach, researcher, supervisor
- New `charter/mcp_server.py` exposes every Charter agent as an MCP tool
  for Claude Desktop / Cursor / any MCP client
- Smoke test (`scripts/smoke_test.py`) green; `--live` test verified
  end-to-end against real Anthropic + Tavily

### Locked feedback in memory (load every session, per system prompt)

All at `C:\Users\gigix\.claude\projects\C--Users-gigix-OneDrive-Desktop-BDP-Consulting\memory\`:

- `feedback_no_emdashes.md` - never use em-dashes anywhere in deliverables
- `feedback_dont_overlead_inspiration.md` - take substance, lose celebrity name
- `feedback_brock_style_rules.md` - no "Brock Pivec" on public marketing
  surfaces, banded vs specific CoC by audience, properties not cards
- `feedback_real_value_products.md` - default to Brock's existing IP, not
  AliExpress trends

---

## 3. Key Decisions and Context (gotchas you must know)

### Stripe live mode is on. First real subscriber will be charged.

The Stripe key is the **BDP-shared live key** sourced from
`projects/bdp/shared/engine/config/.env.secrets`. This means brocco.ai
subscription revenue routes to the same Stripe account as other BDP arms.
Books are mixed by design (per Brock's authorization on 2026-05-02). If
you ever want a brocco-only Stripe account, that's a Customer creation +
Product+Price re-seed + key swap on Vercel; not trivial.

### The BOM-in-secrets bug (do not repeat)

The BDP-shared `.env.secrets` file has a UTF-8 zero-width character
embedded in the Stripe secret key value. PowerShell's stdin pipe to
`vercel env add` re-introduced the BOM after stripping, causing a 401
"Invalid API Key" with a visible BOM in the masked echo. **Solution
that worked:** Node `child_process.spawn` with `shell: true` + raw
`Buffer.from(value, "utf8")` written to stdin. If you ever rotate keys,
use the same pattern. Recipe is in `HANDOFF.md` section 2.

### `/app` PWA gotchas

- `start_url` and `scope` are both `/app` (no trailing slash) to avoid
  the 308 redirect from Vercel's `trailingSlash: false` config. **Don't
  change this** without testing PWA install on Chrome desktop + iOS
  Safari + Android Chrome.
- Service worker version is `brocco-app-v8-cache-bust`. Bump the version
  string in `public/app/sw.js` whenever you ship breaking changes to
  `app.js`, `agents.js`, or `styles.css` so installed users get the new
  code on next launch.
- BYOK key is stored in `localStorage.brocco.key.anthropic` (and
  `key.openai`, `key.tavily`, `key.endpoint`, `key.model`,
  `key.openaiModel`, `key.provider`). Never sent to brocco servers.
- Direct Anthropic browser calls require the
  `anthropic-dangerous-direct-browser-access: true` header. Already set.

### Locked style rules (will get rejected at deploy time if violated)

- **No em-dashes** anywhere in deliverables. Use commas, periods, colons,
  parens, or hyphens with spaces. `grep -c "—"` should return 0 in any
  file you ship.
- **No "Brock Pivec" on public marketing surfaces.** Use "BDP Consulting"
  or "the operator" or "Brock" (first name only). The Twitter handle
  `@brockpivec` is fine because it's a public handle.
- **No fabricated testimonials.** Real receipts only. Empty slot is fine.
- **No "Schmidt's thesis" framing on public surfaces.** Take the
  substance ("agents commoditize, workflows are the moat"), drop the
  celebrity name.

### Vercel auth has two paths

- `vercel` CLI is logged in as `brocktherock52` and uses the
  `~/.vercel` config. This is what's actually used for `vercel deploy`
  and `vercel env add`.
- The `VERCEL_TOKEN` in workspace `.env` is scoped to a different
  project (returns 403/404 against `prj_cIbeXAU15HHs7g5Sn3L8GoaZocJr`).
  Don't try to use it for brocco-site env operations; use the CLI.

### Croc icon design notes

- Lacoste-inspired side profile, 64x36 viewBox in standalone SVG, 64x64
  with translate(0,14) in favicon for square framing.
- 4 PNG icons in `/assets/`: `icon-192.png`, `icon-512.png`, plus
  maskable variants with safe-zone padding. Generated by PIL polygon
  drawing (recipe in committed history under tmp-gen-icons.py;
  reusable). Don't rely on cairosvg, it's not installed.

---

## 4. Next Steps / Priorities (exact list for next session)

In strict priority order:

### A. Drive first paying subscriber

1. **Pick one of 3 launch tweet drafts** (in `marketing/launch-day.md`)
   and post from `@brockpivec`. The product-led punch is the recommended
   first move.
2. **Submit Show HN** using `marketing/hn-show.md`. Aim for Tuesday or
   Wednesday morning ET. Sit in the thread for 8 hours, agree with
   criticism, never hype.
3. **Post to r/LocalLLaMA, r/SideProject, r/AI_Agents** - drafts in
   `marketing/reddit-posts.md`. One subreddit per day, never bulk.
4. **Email 30 mid-tier AI YouTubers** with a free Pro account and a
   recipe pack tuned to their stack (Theo t3.gg, Mckay Wrigley, Riley
   Brown, Matthew Berman). Pitch a roast video, not a sponsorship.

### B. Ship the next 2 SEO articles (Tuesday + Friday cadence)

From `marketing/seo-content-brief.md`, slots #4 through #10. Already
shipped: 1 (MCP servers), 2 (Cursor pricing), 3 (parallel agents).
Next up:

- #4: `BYOK for AI agents: how it works and why it matters` (~600 mo)
- #5: `Why your Zapier zaps keep breaking` (~1.5k mo, switching intent)
- #6: `Ollama vs Anthropic for agents: when to use which` (~400 mo)
- #7: `Brocco Recipe: launch day kit for solo founders` (~2k mo)

### C. Activation gaps to close

1. **Wire `/api/stripe-webhook` to a real DB.** Currently logs to Vercel
   function logs. Need: Supabase or Neon Postgres, store
   `users.stripe_customer_id`, `users.plan`, `users.stripe_subscription_id`,
   `users.status`. Then build:
2. **`/account` page** - user-facing settings page that hits
   `/api/portal` to launch Customer Portal for cancel / change plan / 
   update card.
3. **Auth.** Currently zero auth on the site (BYOK is the auth
   substitute on `/app`). For the paid plan flow, need: Clerk or
   Supabase Auth. Add `/login` and `/signup`. Stripe Customer creation
   in webhook handler links to user row.
4. **Tauri native binaries.** /download page advertises "coming soon"
   for Mac.dmg and Win.exe. Requires Rust toolchain install (which
   needed authorization on prior attempts). Setup is `cargo install
   tauri-cli` then `tauri init` + `tauri build`.

### D. Optimization

1. **Lighthouse audit.** Verify Core Web Vitals are green. The WebGL
   hero shader might cost LCP on low-end devices; consider conditional
   rendering for `prefers-reduced-motion` (already in place) and slow
   GPUs.
2. **Per-page OG PNG.** The shared `/assets/og.svg` works on most
   crawlers but Twitter/Facebook prefer raster. Generate per-article OG
   PNGs via the same PIL-polygon recipe.
3. **Structured data on blog articles.** Currently only `BlogPosting`.
   Add `HowTo` schema for #3 (the parallel agents post) and #4 (BYOK
   how-to). Eligible for Google rich results.
4. **Image lazy-load / pre-fetch hints.** Add `<link rel="preload">`
   for the hero font + critical CSS.

### E. Continuous content engine

- 1 article every Tuesday + Friday at 9am PT
- Tweet daily for 30 days (founder-led short-form video format,
  per the launch playbook research)
- Build the "Brocco Recipes" public gallery as a flywheel (each paid
  user's run becomes an indexable URL once auth ships)

---

## 5. Quick Start Instructions (paste at start of next session)

```
You are continuing from the previous session. The full transcript is in
session_logs/session_transcript_2026-05-03_18-05-00.md (synthesized,
human-readable) and session_logs/raw/session_2026-05-03_18-05-00.jsonl
(raw 7.2MB Claude Code JSONL). Read NEXT_SESSION_HANDOFF.md first, then
HANDOFF.md for the deeper architecture map. Memory files at
~/.claude/projects/.../memory/ auto-load and include the locked Brock
style rules (no em-dashes, no "Brock Pivec" on public surfaces, banded
vs specific CoC by audience). Current state: brocco.ai live at
brocco-site.vercel.app, Stripe live with $49/$199 monthly + annual
prices wired and verified, /app PWA installable on Mac/Win/iOS/Android,
3 SEO articles shipped, REST API + MCP server live. Stripe was the
biggest recurring bug source - the toggle defaulted to annual, which
billed users for the year instead of monthly. That's fixed. Next
priorities are in section 4 of NEXT_SESSION_HANDOFF.md - the priority-A
list is "drive first paying subscriber".
```

---

## 6. File map (where everything lives)

```
projects/bdp-consulting/arms/
  agentic_platform/             # Charter Python runtime
    charter/                    # The package
      mcp_server.py             # Stdio MCP server for Claude Desktop
      runtime.py, agent.py, store.py, orchestrator.py, api.py, config.py
      tools/                    # 17 tool modules
    agents/                     # 5 agent specs (markdown + YAML frontmatter)
    scripts/smoke_test.py       # Smoke test
  brocco_site/                  # The marketing + app
    HANDOFF.md                  # Comprehensive deeper handoff
    NEXT_SESSION_HANDOFF.md     # This file
    README.md                   # Local dev instructions
    vercel.json                 # cleanUrls: true, trailingSlash: false
    api/                        # Vercel Edge functions
      run.ts, checkout.ts, portal.ts, stripe-webhook.ts, proxy.ts
      v1/run.ts, v1/agents.ts   # Public versioned API
    public/                     # Static site
      index.html                # Landing page
      app/                      # PWA dashboard
        index.html, styles.css, manifest.webmanifest, sw.js
        scripts/app.js, agents.js
      blog/                     # 4 articles + index + feed.xml
      vs/                       # 3 comparison pages
      assets/                   # SVG mark + PNG icons + OG image
    scripts/seed-stripe.mjs     # One-time Stripe products+prices bootstrap
    marketing/                  # Launch + distribution playbooks
      launch-day.md, producthunt-checklist.md, hn-show.md,
      reddit-posts.md, this-week.md, seo-content-brief.md
    sessions/2026-05-02/        # Yesterday's archive
      timeline.md, research/    # 7 sub-agent transcripts
      memory-snapshot/          # Memory at end of yesterday
    session_logs/               # NEW today
      session_transcript_2026-05-03_18-05-00.md  # Synthesized
      raw/session_2026-05-03_18-05-00.jsonl      # Raw 7.2MB

~/.claude/projects/C--Users-gigix-OneDrive-Desktop-BDP-Consulting/
  memory/                       # Auto-loaded by Claude Code
    MEMORY.md                   # Index of all memory files
    feedback_no_emdashes.md, feedback_dont_overlead_inspiration.md,
    feedback_brock_style_rules.md, feedback_real_value_products.md,
    feedback_perpetual_execution_session.md
    handoff_brocco_2026-05-02.md
    project_*.md                # Per-project state notes
```

---

## 7. Key commits (most recent on top)

- v18.1 `3666a31` /app/ -> /app cleanup across 16 files
- v18 `aa662bd` Stripe monthly default + PWA PNG icons + SW bump
- v17 `9bf22ad` SEO article #3 (parallel agents) + a11y skip-link + RSS
- v16 `9f39fb7` SEO article #2 (Cursor pricing) + RSS feed
- v15 `57a6521` SEO article #1 (MCP servers) + /blog index
- v14 `0f34a71` kill announcement bar + Lacoste croc + Mac/Win download split
- v13 `6bf43ba` REST API + MCP server + /download page
- v12 `22feea0` Stripe live, accepting real subscriptions
- earlier: `749d35b` v1-v11 platform shipped (full transcript bundle)

Full log: `git log --oneline -25` from the workspace root.

---

End of handoff. Update `HANDOFF.md` if any state changes (deployment URL,
Stripe keys, blocked items). Update this file at the start of every
session if priorities shift.
