# brocco · next-session handoff

> Resume-here doc for working on brocco from a different machine.
> Last updated: 2026-05-05 after v3.0 PR 2 ship.

---

## current state (one-glance)

| Thing | State |
|---|---|
| **Live site** | https://brocco-site.vercel.app — v3.0 PR 2 deployed, all routes 200 |
| **Public source** | https://github.com/brocktherock52/brocco — main at `0a914bb`, 20 tags |
| **Private monorepo** | https://github.com/brocktherock52/bdp-consulting — main at `40bd228`, 17 named tags |
| **Vercel project** | `brocktherock52s-projects/brocco-site` (linked locally in `.vercel/`) |
| **Domain** | brocco.ai is **taken**. Recommended: **`brocco.dev`** at Cloudflare (~$12/yr) — see `CUSTOM_DOMAIN.md` and substitute |
| **Stripe** | Live, 4 prices wired, webhook signed via WebCrypto (envs already in Vercel) |
| **Pixel / CAPI / PostHog** | Code wired (consent-gated), env vars **not set in Vercel yet** — funnel measurement is dark until they are |
| **inference.sh `belt` CLI** | Installed at `~/bin/belt.exe`, **logged in** (key `1nfsh-…`). `agent-browser` skill is now usable |

## resume checklist (when you sit down at home)

```bash
# 1. clone (if you don't already have it)
git clone https://github.com/brocktherock52/bdp-consulting.git
cd bdp-consulting/projects/bdp-consulting/arms/brocco_site

# 2. install + dev
npm install
npm run dev
# → http://localhost:3000

# 3. confirm Vercel link (per-machine — must re-link)
vercel whoami
ls .vercel/project.json   # if missing: vercel link --yes --project brocco-site

# 4. confirm we're on main + up to date
git checkout main
git pull --ff-only

# 5. confirm latest tag
git describe --tags --abbrev=0
# → v3.0-pr2-rocksolid

# 6. (only if you want belt / agent-browser on the new machine)
curl -fsSL https://dist.inference.sh/cli/inferencesh-cli-v1.9.6-windows-amd64.zip -o belt.zip   # or grab the linux/darwin bundle
# extract belt.exe to a dir on PATH
belt login --key <your-inference-sh-key>
```

If anything is off, the public source repo at `https://github.com/brocktherock52/brocco` mirrors the v3.0 source (without internal strategy docs).

---

## the four gates blocking growth (still open — user-side action)

1. **Domain** — register `brocco.dev` at Cloudflare. brocco.ai is taken; verified via DNS.
2. **DNS cutover** — follow `CUSTOM_DOMAIN.md` step-by-step.
3. **Env vars in Vercel** (30 min):
   ```powershell
   vercel env add NEXT_PUBLIC_META_PIXEL_ID production
   vercel env add META_CAPI_TOKEN production
   vercel env add NEXT_PUBLIC_POSTHOG_KEY production
   vercel deploy --prod --yes
   ```
4. **Founder demo video** — single highest-leverage move per the research brief. Lindy got 70k waitlist signups from one demo. Beat sheet in `marketing/30-day-launch-playbook.md`.

---

## v3.0 progress (8-PR plan from `research/v3-acquisition-spec.md`)

| PR | What | Status |
|---|---|---|
| 1 | strip + consolidate (nav 5→3, home 8→4, /app simplified) | ✅ shipped (`v3.0-pr1-strip`) |
| 2 | rock-solid live Claude (retry, abort, errors, cost ticker, retry button) | ✅ shipped (`v3.0-pr2-rocksolid`) |
| 3 | public live broadcast endpoint + hero embed | next |
| 4 | Notion OAuth (real save) | |
| 5 | Slack OAuth | |
| 6 | Linear OAuth | |
| 7 | 90-second founder demo video, embedded in hero | |
| 8 | final acquisition-readiness audit (Lighthouse 95+, console errors, Stripe e2e, env vars set, domain pointed) | |

---

## strategic context (read these in order)

In `projects/bdp-consulting/arms/brocco_site/research/`:

1. **`v3-acquisition-spec.md`** — the 8-PR plan we're executing. The bar: *"could a head of product at Anthropic see a strategic reason to buy after a 5-minute demo?"* Today: no. Each PR closes the gap.

2. **`market-and-acquisition-brief.md`** — source-cited market research (added in v3.0 PR 2). Three findings that shape strategy:
   - Realistic acquirer list: **Vercel, Replit, Notion, Lindy, n8n, Cognition** (NOT Anthropic / OpenAI / MS / Salesforce)
   - Realistic exit shape at $0 ARR: **$5M-$25M IP buyout + 2-4 acquihires + 2-4yr vest**
   - 78% of enterprise AI teams have MCP-backed agents in production by April 2026

3. **`path-to-1000-users.md`** — strategic brief for getting to 1k paying customers (the alternative path to acquisition: real revenue + real users → strategic acquisition at $10M-$50M instead of acquihire at $5M-$25M)

4. **`path-to-1000-users-competitor-data.md`** — verified per-company data with source URLs

In `projects/bdp-consulting/arms/brocco_site/marketing/`:

5. **`30-day-launch-playbook.md`** — week-by-week tactics, copy templates, founder demo video shot list, HN post text, influencer hit list

6. **`meta-ugc-ads.md`** — Meta UGC ad strategy: 8 hooks, 4 video scripts, KPIs with stop-loss thresholds

---

## decisions on your plate (not technical, strategic)

### decision 1 · pricing posture
Verified market price is $20, not $49. Pick one:
- **Posture A** (match Cursor): drop Solo to $20, keep free tier. Volume play. ~25k free signups → 1k paid.
- **Posture B** (match Lindy): keep $49, kill free tier, replace with CC-required 7-day trial. **8x more capital-efficient on top-of-funnel.**

Recommendation: **Posture B**. Code change is small (pricing.tsx + Stripe trial-period flag).

### decision 2 · domain choice
- **brocco.dev** ($12/yr Cloudflare, dev-tool brand fit, forces HTTPS via HSTS preload) — recommended primary
- **usebrocco.com** — safer fallback if .dev feels too engineer-coded
- Both verified available via SOA lookup (final confirm at registrar checkout)

### decision 3 · wedge by June (per market-and-acquisition-brief.md)
"Multi-agent dashboard with BYOK Claude" is too horizontal. Pick one:
- (a) builder-dashboard for ops/PM users replacing Zapier-with-AI → maps to Notion / HubSpot acquirers
- (b) cost-attribution layer for agent runs (untouched space) → maps to Vercel / Cloudflare
- (c) self-hostable OSS Claude-native n8n alternative → maps to n8n / CrewAI as buyers

---

## file map (current state)

```
projects/bdp-consulting/arms/brocco_site/
├── app/
│   ├── page.tsx                   # v3.0: 4 sections only
│   ├── about/page.tsx             # holds the cut content
│   ├── app/page.tsx               # multi-agent dashboard (broadcast-only)
│   ├── pricing/, security/, docs/, download/, blog/, vs/cursor/...  (all preserved, footer-only)
│   ├── api/checkout, portal, proxy, stripe-webhook, v1/agents, v1/run
│   ├── layout.tsx, globals.css, sitemap.ts, robots.ts
│   └── opengraph-image.tsx, icon.png, apple-icon.png
│
├── components/
│   ├── nav.tsx                    # v3.0: 3 simple links, no mega-dropdowns
│   ├── hero.tsx, social-proof.tsx, pricing.tsx, final-cta.tsx, footer.tsx
│   ├── (kept but unused on home: agents-grid, how-it-works, integrations,
│   │    wedge, product-cards, why-we-built, features, personas, faq)
│   └── dashboard/
│       ├── app-shell.tsx          # broadcast-only, retry-pane, live $ chip
│       ├── stream-pane.tsx        # error/retry/rate-limit UI
│       ├── byok-modal, jsonl-log, agent-card, onboarding
│
├── lib/
│   ├── claude.ts                  # v3.0 PR2: production-grade retry/abort/errors/cost
│   ├── simulator.ts               # SimEvent extended to subsume LiveEvent
│   ├── agents.ts, usage.ts, posts.ts, utils.ts
│
├── public/
│   ├── assets/                    # brand mark, og, app icons, favicon source
│   └── manifest.webmanifest, sw.js, robots.txt, sitemap.xml
│
├── scripts/
│   ├── make-transparent-logo.mjs
│   └── seed-stripe.mjs
│
├── marketing/                     # PRIVATE — not in public repo
│   ├── meta-ugc-ads.md
│   └── 30-day-launch-playbook.md
│
├── research/                      # PRIVATE — not in public repo
│   ├── v3-acquisition-spec.md
│   ├── path-to-1000-users.md
│   ├── path-to-1000-users-competitor-data.md
│   └── market-and-acquisition-brief.md   ← NEW v3.0 PR 2
│
├── CUSTOM_DOMAIN.md
├── HANDOFF_NEXT_SESSION.md        ← this file
├── README.md
│
├── legacy-static/, legacy-api/, legacy/
├── session_logs/, sessions/
└── package.json, next.config.mjs, vercel.json, tailwind.config.ts, tsconfig.json
```

---

## version history (all on GitHub)

17 named tags on `bdp-consulting`, 20 ls-remote tag refs. Mirror tags on `brocktherock52/brocco` (public).

| Tag | What |
|---|---|
| `v1.0-static` | Original static HTML site |
| `v2.0-nextjs-rebuild` | First Next.js rebuild |
| `v2.1-production-launch` | Live BYOK + PWA + onboarding |
| `v2.2-scaly-croc` | Scaly croc + integrations + Meta UGC playbook |
| `v2.3-official-logo-launch` | User-uploaded brand mark |
| `v2.4-brand-icons` | 17 inline brand SVGs |
| `v2.5-favicon-claude-polish` | Transparent logo + force-fixed favicon |
| `v2.6-vs-pixel` | /vs/* + Meta Pixel/CAPI |
| `v2.7-app-polish` | Token chip + share-runs + /vs/n8n + /vs/crewai |
| `v2.8-posthog-blog` | PostHog + GDPR + JSON-LD + /blog |
| `v2.10-inference-shape` | Lowercase + curl hero + agents grid + mega-dropdown |
| `v2.11-public-github-launch` | Public repo at brocktherock52/brocco shipped |
| `v2.12-launch-playbook` | /about + 30-day playbook |
| `v2.x-stable` / `v2.12-final-snapshot` | **v2 frozen reference. `git checkout v2.x-stable` to roll back.** |
| `v3.0-pr1-strip` | The cut: home 8→4, nav 5→3, /app simplified |
| `v3.0-pr2-rocksolid` | **CURRENT.** Production-grade live Claude + market brief |

---

## the single highest-leverage move when you start at home

```
1. open https://dash.cloudflare.com → register `brocco.dev` (~$12, 5 min)
2. follow CUSTOM_DOMAIN.md to point DNS at vercel
3. set the 3 env vars (NEXT_PUBLIC_META_PIXEL_ID, META_CAPI_TOKEN, NEXT_PUBLIC_POSTHOG_KEY)
4. shoot the 60-90s founder demo video per marketing/30-day-launch-playbook.md
5. post on X + LinkedIn + Reels
```

---

## things i can do on the next turn (your pick)

1. **PR 3 — public live broadcast endpoint + hero embed.** Real Claude broadcast running on the homepage when a logged-out visitor lands. Highest-leverage demo. Server endpoint with IP-cookie rate limit + recorded fallback.
2. **PR 4-6 — real Notion / Slack / Linear OAuth.** Replace the mocks with full OAuth + token refresh + scoped permissions.
3. **Custom domain cutover PR.** Once you've registered the domain and pointed DNS, one PR flips SITE_URL + Stripe webhook URL + opengraph base.
4. **Pricing posture commit.** Tell me A or B; I'll ship the pricing.tsx + Stripe trial change.
5. **Wedge commitment.** Tell me which of the three wedges (ops-builder / cost-attribution / OSS-Claude-native) you want and I'll reposition the home + comparison pages around it.

Send me a number and I'll execute.

---

## one thing to NOT forget

The `.vercel/` link directory is per-machine. After cloning on a new machine, run `vercel link --yes --project brocco-site` first thing or you'll create a duplicate Vercel project.

---

made with claude · 2026-05-05
