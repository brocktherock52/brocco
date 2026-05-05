# brocco · v3.0 acquisition-shape spec

> Companion to `path-to-1000-users.md` and `30-day-launch-playbook.md`.
> Date: 2026-05-05.
> Goal: a v3.0 of brocco that an acquirer (Anthropic, Vercel, OpenAI, Replit) can demo and immediately understand, with one obsessive feature done so well nothing else matters.

---

## the bar

> "could a head of product at Anthropic, after a 5-minute demo, see a clear strategic reason to buy this team and ship?"

That's the only question. Everything in this doc serves that question.

The answer is YES if and only if:
1. The demo runs in **under 90 seconds** and shows ONE thing they can't unsee
2. The code has **zero rough edges** — no console errors, no stuck states, no "demo magic"
3. The product surface is **5 routes max**, not 35
4. There are **real users** (small but real) producing **real outputs**

The answer is NO with what we have now (35 routes, simulator-heavy /app, no users, $0 revenue).

---

## the cut (everything we delete or hide)

### routes that get cut from public view

| Route | Action | Reason |
|---|---|---|
| `/about` | keep, but unlinked from nav | Editorial depth nobody asks for |
| `/changelog` | keep at /changelog, footer-link only | Inside-baseball |
| `/blog`, `/blog/[slug]` | keep, footer-link only | Stubs that aren't filled in yet read as weakness |
| `/vs/cursor`, `/vs/zapier`, `/vs/devin`, `/vs/n8n`, `/vs/crewai` | keep, footer-link only | SEO assets but distract on the homepage tour |
| `/security`, `/privacy`, `/terms`, `/docs` | keep, footer-link only | Standard, expected, not selling points |
| `/download` | keep, link from `Install` button | Real surface, but secondary |
| `/billing/success` | keep | Required |

### routes that stay primary

- `/` — home
- `/app` — the product
- `/pricing` — buy
- That's it.

The nav goes from 5 mega-dropdowns + 13 footer links to **3 nav items + 1 install button + 1 open-app CTA**. Everything else moves to the footer.

### sections cut from `/app`

| Section | Action |
|---|---|
| Single-agent mode | DELETE — broadcast is the product |
| Recipe browser sidebar | DELETE — replace with 3 hardcoded "try this" buttons in the empty state |
| Model picker (6 options) | SIMPLIFY — Sonnet only at v3, swap-config for hosted plan |
| BYOK status pill | KEEP — single source of truth for live vs demo |
| History sidebar | DEMOTE — small "recent" link in header, opens drawer on click |
| Save-output dropdown (Notion/Slack/Email/Drive/Webhook) | REPLACE with 3 real OAuth integrations: Notion, Slack, Linear |

### sections cut from `/`

| Section | Action |
|---|---|
| AgentsGrid | DELETE — the agents are visible IN THE LIVE BROADCAST below the fold |
| HowItWorks | DELETE — show, don't tell |
| Integrations | KEEP but compress to a single icon strip, no card grid |
| SocialProof | KEEP, tighter |
| Pricing | KEEP |
| FAQ | DELETE from home, move to /pricing |
| FinalCTA | KEEP, simpler |

Result: home goes from 8 sections to **4**. Pricing absorbs the FAQ. /about + others go behind the footer.

---

## the obsession (what gets all the new energy)

**One job: a logged-out visitor lands on `/`, sees a real broadcast running on the page within 3 seconds (real Claude, not simulator), can click "save this run" and authenticate to Notion/Slack/Linear in one click, and walks away with a result they can show their team.**

That's the entire bet.

This requires:

### 1. live-broadcast hero

- The hero IS a working broadcast running on a sample goal ("research the top 3 alternatives to X")
- 5 panes streaming Claude tokens live, IP-rate-limited so it costs us pennies
- Server-side: `/api/v1/run-public` endpoint that broadcasts a fixed prompt with our (cached) anthropic key, gated to 1 run per IP per 6 hours via cookie
- Streams via SSE. The hero doesn't load HTML and then animate; the agents start when the page is parsed
- 99.5% reliability target. If anthropic 429s us, fall back to a recorded replay (NOT a simulator — a real recording of a previous run)

### 2. rock-solid live mode in `/app`

What "rock solid" means specifically:
- Retry with exponential backoff on 429s and 5xx (3 attempts, max 30s wait)
- Partial-output recovery: if the stream cuts mid-tool-call, the pane shows what's available and a "resume" button
- Per-pane error states with specific messages ("anthropic returned 401: your key is invalid" / "tavily returned 503: try again in 10s")
- Cost ticker that shows live $ as tokens stream (not after the run)
- Hard rate limit per BYOK key per hour, surfaced in the UI before they hit it
- Abort that ACTUALLY aborts the upstream HTTP request (currently it just sets a flag)
- Session resilience: refresh the page mid-run and the panes reconnect, replay missed events

### 3. real OAuth integrations (3, not 5)

Pick three. Ship them with full OAuth, real token refresh, scoped permissions, and visible audit-log writes:

- **Notion** — `pages.create` with the agent output as the page body
- **Slack** — `chat.postMessage` to the user's chosen channel
- **Linear** — `issueCreate` with title from agent first line + body from rest

Why these three: each is a distinct buyer profile (PMs use Notion, ops/eng use Slack, eng-shaped startups use Linear). Each surface is a verb the agent output naturally maps to. Stripe + Gmail are NOT in scope for v3.0 — they're better as v4 (transactional ops).

### 4. one obsessive demo recording

Pre-record a single 90-second video of a real broadcast run, exported as a high-quality `.webm` and `.mp4`. Hosted on the site, autoplays muted in the hero. This is the single highest-leverage marketing artifact AND the fallback for the live broadcast if Anthropic is rate-limiting us.

---

## what an acquirer actually sees

Walk through the demo on a fictional Anthropic-product-lead's screen:

```
0:00  hero loads. video autoplays. "agents that do the work." 
      a real broadcast is running in front of them with 5 streaming panes.
0:08  they read the synthesis output. they get it.
0:20  they click "open the app." app loads.
0:22  app shows a single goal input. nothing else. they paste their own prompt.
      "draft 5 cold emails to YC founders launching agentic tools this quarter."
0:25  they click run. live mode badge lights up. 5 panes stream real Claude.
0:55  panes finish. cost ticker shows $0.07. synthesis below.
0:58  they click "save to Notion." OAuth flow. one click. page created in their workspace.
1:10  they're back on /app, page already open in another tab.
1:15  they click "open dashboard" -- run history persists. previous run there.
1:20  they navigate to /pricing. one screen. $49/mo solo or $199/mo team.
1:30  they think: "huh. this is the dashboard cursor never built."
```

That's the bar. Today's product cannot do this in 90 seconds without the simulator.

---

## scope and order of operations

### PR 1 — strip and consolidate (1 turn, ~2 hours)

- Cut nav from mega-dropdowns to 3 items (`pricing`, `download`, `open app`)
- Cut home from 8 sections to 4
- Move 5 routes to footer-only
- Delete recipe browser from /app sidebar
- Delete single-agent mode (broadcast always on)
- Delete model picker UI (config in lib/agents.ts only)

### PR 2 — rock-solid live mode (1 turn, deep)

- Implement retry/backoff in `lib/claude.ts`
- Per-pane error states with real messages
- Live cost ticker (currently fires once at end, make it per-token)
- Abort signal propagated to upstream fetch
- Page-refresh resume (localStorage + SSE replay)

### PR 3 — public live broadcast endpoint (1 turn)

- New `/api/v1/run-public` server-side endpoint, IP-cookie rate-limited
- Hero embeds an iframe or React Server Component streaming live broadcast
- Pre-recorded fallback for rate-limited cases
- Real Anthropic key in Vercel env (separate from BYOK passthrough)

### PR 4 — Notion OAuth integration (1 turn)

- `app/api/integrations/notion/oauth/route.ts` for token exchange
- Save-button in /app fires `pages.create` with agent output
- Shows page URL in toast on success

### PR 5 — Slack OAuth integration (1 turn)

- Same shape as Notion. Channel picker. `chat.postMessage`.

### PR 6 — Linear OAuth integration (1 turn)

- Same shape. Team picker. `issueCreate`.

### PR 7 — recorded demo + hero polish (1 turn)

- Shoot the 90-second demo video (founder action)
- Embed in hero with autoplay/muted/loop
- Fallback chain: live broadcast → recorded video → static screenshot

### PR 8 — final acquisition-readiness audit (1 turn)

- Lighthouse 95+ across all 5 primary routes
- Zero console errors on production
- Stripe checkout end-to-end test with a real card (refunded immediately)
- Pixel + CAPI + PostHog producing data (env vars set by user)
- Domain pointed at Vercel, all `brocco-site.vercel.app` references replaced

---

## what an acquirer is NOT looking for

- "5 agents, 13 tools, 4 recipes" — feature-list bingo doesn't sell
- A $49/mo paywall with 0 customers — read as "no one wants this"
- 35 routes, 5 /vs/ pages, blog stubs — signals "no focus"
- A simulator that pretends to be live — signals "doesn't actually work"
- A README full of marketing — signals "founders don't care about devs"

---

## what they ARE looking for

- One obsessive technical insight (broadcast pattern, live-streamed parallel agents, JSONL audit), implemented at production quality
- A demo that doesn't break
- Code so clean and well-typed that a 10-minute review by their staff eng raises zero red flags
- Real users producing real outputs — even 50 of them with case studies > 5,000 marketing-driven signups
- A founder who can articulate the wedge in one sentence

---

## restore points (if v3.0 goes wrong)

Tagged on both repos as of 2026-05-05:

- `v2.x-stable` (alias) — last v2 state, full 35 routes, all features
- `v2.12-final-snapshot` — same commit, descriptive name
- `v2.12-launch-playbook` — same commit
- `git checkout v2.x-stable` brings everything back

We can restore at any time. The cut is reversible.

---

## next-turn execution

The first cut (PR 1) is the biggest behavioral shift. It is also the least technical. I'll execute it next turn, ship the diff as a branch + PR + tag, and stop. You decide whether to merge.

If you don't like what you see at PR 1, we revert and stay on v2.x-stable.

If you do like it, we keep going through PRs 2-8 over the next 3-5 sessions.

Either way, the v2.12-final-snapshot tag is permanent. Nothing is lost.
