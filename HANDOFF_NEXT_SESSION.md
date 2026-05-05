# brocco · next-session handoff

> Resume-here doc for working on brocco from a different machine.
> Generated 2026-05-05 at end of v2.12 deploy.

---

## current state (one-glance)

| Thing | State |
|---|---|
| **Live site** | https://brocco-site.vercel.app — v2.12 deployed, all 35 routes 200 |
| **Public source** | https://github.com/brocktherock52/brocco — synced to v2.12 |
| **Private monorepo** | https://github.com/brocktherock52/bdp-consulting — main at `e77478e`, all tags pushed |
| **Vercel project** | `brocktherock52s-projects/brocco-site` (linked locally in `brocco_site/.vercel/`) |
| **Domain** | `brocco-site.vercel.app` (brocco.ai is taken; `brocco.dev` recommended — see CUSTOM_DOMAIN.md) |
| **Stripe** | Live, 4 prices wired, webhook signed via WebCrypto (envs already in Vercel) |
| **Pixel / CAPI / PostHog** | Code wired (consent-gated) but **env vars not set in Vercel yet** — funnel measurement is dark until they are |

## resume checklist (when you sit down at home)

```bash
# 1. clone (if you don't already have it)
git clone https://github.com/brocktherock52/bdp-consulting.git
cd bdp-consulting/projects/bdp-consulting/arms/brocco_site

# 2. install + dev
npm install
npm run dev
# → http://localhost:3000

# 3. confirm Vercel link is intact (it should be)
vercel whoami
ls .vercel/project.json   # if missing: vercel link --yes --project brocco-site

# 4. confirm we're on main + up to date
git checkout main
git pull --ff-only

# 5. confirm latest tag
git describe --tags --abbrev=0   # should be v2.12-launch-playbook
```

If anything is off, the public source repo at `https://github.com/brocktherock52/brocco` mirrors the v2.12 source (without internal strategy docs) — useful if you need a clean clone.

---

## the four gates blocking growth (resolve in order)

These are the 4 user-side actions that unblock the 30-day launch playbook:

### gate 1 · register a domain (15 min, ~$12/yr)
brocco.ai is taken. **Recommended: `brocco.dev`** at Cloudflare Registrar. Backup: `usebrocco.com`. Both verified available via DNS lookup (final confirm at registrar checkout).

### gate 2 · point DNS at Vercel (1 day for propagation)
Follow `CUSTOM_DOMAIN.md` step-by-step. Substitute `brocco.dev` (or whatever you registered) for every reference to "brocco.ai" in that doc.

### gate 3 · set env vars in Vercel (30 min)
```powershell
vercel env add NEXT_PUBLIC_META_PIXEL_ID production
vercel env add META_CAPI_TOKEN production
vercel env add NEXT_PUBLIC_POSTHOG_KEY production
# optional:
vercel env add NEXT_PUBLIC_POSTHOG_HOST production   # default: us.i.posthog.com
vercel deploy --prod --yes
```
Without these, the v2.6 + v2.8 funnel measurement code is wired but inactive. Meta Pixel + PostHog stay dormant until both consent + env vars are present.

### gate 4 · shoot the founder demo video (2-4 hours)
The single highest-leverage move per the research brief. Lindy got 70k waitlist signups from one demo video. Devin: $0 → $1M ARR in 6 months from one launch video.

Beat sheet, shot list, post copy, all in `marketing/30-day-launch-playbook.md` § week 1.

---

## decisions on your plate (not technical, strategic)

### decision 1 · pricing posture
The verified market price for agentic SaaS is $20, not $49. Pick one:

- **Posture A** — match Cursor: drop Solo to $20, keep free tier. Volume play. Need ~25k free signups → 1k paid (4% conversion).
- **Posture B** — match Lindy: keep $49, kill free tier, replace with CC-required 7-day trial. Intent play. Need ~3,200 trial starts → 1k paid (31% conversion). **8x more capital-efficient.**

Recommended: Posture B. Reasoning + math in `research/path-to-1000-users.md` § 5.1.

Once decided, the code change is small (pricing.tsx + onboarding.tsx + a Stripe trial-period flag). I can ship it on the next turn.

### decision 2 · domain choice (brocco.dev vs usebrocco.com)
Both available. Recommended: brocco.dev for dev-tool brand fit. Reasoning in last turn's reply.

---

## what's where (file map)

```
projects/bdp-consulting/arms/brocco_site/
├── app/                         # Next.js source (35 routes)
│   ├── page.tsx                 # home (8 sections, consolidated v2.12)
│   ├── about/page.tsx           # NEW v2.12 — long-form depth
│   ├── app/page.tsx             # /app multi-agent dashboard
│   ├── pricing/, security/, docs/, download/, blog/, vs/cursor/...
│   ├── api/checkout, portal, proxy, stripe-webhook, v1/agents, v1/run
│   ├── layout.tsx, globals.css, sitemap.ts, robots.ts
│   ├── opengraph-image.tsx, icon.png, apple-icon.png
├── components/                  # ~30 components incl. dashboard/
├── lib/                         # agents.ts, simulator.ts, claude.ts, usage.ts, posts.ts, utils.ts
├── public/assets/               # logos (mark, transparent, wordmark, icons)
├── scripts/                     # make-transparent-logo.mjs, seed-stripe.mjs
│
├── marketing/                   # PRIVATE: not in public repo
│   ├── meta-ugc-ads.md          # Meta UGC ad playbook (8 hooks, 4 scripts, KPIs)
│   └── 30-day-launch-playbook.md  # NEW v2.12 — week-by-week tactics + copy templates
│
├── research/                    # PRIVATE: not in public repo
│   ├── path-to-1000-users.md             # strategic brief (12 sections)
│   └── path-to-1000-users-competitor-data.md  # source-cited competitor snapshot
│
├── CUSTOM_DOMAIN.md             # DNS + env-var cutover guide
├── HANDOFF_NEXT_SESSION.md      # ← this file
├── HANDOFF.md, NEXT_SESSION_HANDOFF_brocco_001.md  # legacy handoffs (kept)
├── README.md                    # internal-facing
│
├── legacy-static/, legacy-api/, legacy/         # v1.x archives (preserved)
├── session_logs/, sessions/                     # internal agent transcripts
└── package.json, next.config.mjs, vercel.json, tailwind.config.ts, tsconfig.json
```

---

## version history (all on GitHub)

13 tagged releases. All on `brocktherock52/bdp-consulting` AND mirrored to `brocktherock52/brocco` (public). Restore any version with `git checkout <tag>`.

| Tag | What |
|---|---|
| `v1.0-static` | Original static HTML site (Lacoste croc + Mac/Windows downloads) |
| `v2.0-nextjs-rebuild` | First Next.js rebuild |
| `v2.1-production-launch` | Live BYOK + PWA + onboarding |
| `v2.2-scaly-croc` | Scaly croc + integrations + social proof + Meta UGC playbook |
| `v2.3-official-logo-launch` | User-uploaded brand mark across the site |
| `v2.4-brand-icons` | 17 inline brand SVGs + redesigned /download |
| `v2.5-favicon-claude-polish` | Transparent logo + force-fixed favicon |
| `v2.6-vs-pixel` | /vs/cursor + /vs/zapier + /vs/devin + Meta Pixel/CAPI |
| `v2.7-app-polish` | Token chip + share-runs + /vs/n8n + /vs/crewai |
| `v2.8-posthog-blog` | PostHog + GDPR consent + JSON-LD + /blog |
| `v2.10-inference-shape` | Lowercase + curl hero + agents grid + mega-dropdown nav |
| `v2.11-public-github-launch` | Public github.com/brocktherock52/brocco shipped |
| `v2.12-launch-playbook` | **CURRENT** — design consolidation + /about + 30-day playbook |

---

## the single highest-leverage move (when you start at home)

```
1. open https://dash.cloudflare.com → register `brocco.dev`
2. follow CUSTOM_DOMAIN.md to point DNS at vercel
3. set the 3 env vars (NEXT_PUBLIC_META_PIXEL_ID, META_CAPI_TOKEN, NEXT_PUBLIC_POSTHOG_KEY)
4. shoot the 60-90s founder demo video per marketing/30-day-launch-playbook.md
5. post on X + LinkedIn + Reels
```

That's the next ~3 days. Then come back here and tell me how it went.

---

## things i can do on the next turn (your pick)

1. **Ship pricing posture A or B.** Tell me which; I'll do the pricing.tsx + Stripe trial change.
2. **Real Notion + Slack integrations** in `/app`. Replace the mock buttons with OAuth + actual writes. Biggest retention lever for week 4 of the launch playbook.
3. **Scheduled runs** (cron-style) in `/app`. Sticky-habit feature; second biggest retention lever.
4. **Long-form expand `/blog/agentic-ai-dashboard`** to 1,500 words. Picks up the SEO seed shipped in v2.8.
5. **Generate a hero illustration via nano-banana-2** — once you `belt login` (instructions in earlier handoff turns).
6. **Custom-domain cutover PR** — once you've registered the domain and pointed DNS, I'll flip SITE_URL + Stripe webhook + opengraph-image base URL in one PR.

Send me the number and I'll execute.

---

## one thing to NOT forget

The .vercel/ link directory in `brocco_site/` is on a per-machine basis. If you `vercel deploy --prod` from a different machine without re-linking, it'll create a new project. Always run `vercel link --yes --project brocco-site` first thing after cloning on a new machine.

---

made with claude · 2026-05-05
