# brocco.ai · path to 1,000 paying users

> Internal research brief. Not for publication.
> Date: 2026-05-05. Author: Claude Opus 4.7 working with Brock Pivec.

---

## tl;dr

To get from 0 to 1,000 paying users on an agentic AI SaaS with brocco's exact shape (BYOK + multi-agent dashboard + MCP + 5 comparison pages already shipped), the realistic path is **9-15 months** if executed well, **18-24** if average. Verified competitor data (see `path-to-1000-users-competitor-data.md`) reshapes three of the assumptions in earlier drafts of this brief:

1. **The market price is $20, not $49.** Cursor, Devin, Replit Agent, n8n Starter, and Relevance AI all anchor at $19-$20/mo. Lindy is the only outlier at $49.99 and they paid for it by skipping the free tier entirely (CC-required 7-day trial only). brocco at $49 with a free tier is fighting the market on both axes.
2. **Open-source GitHub is the cheapest channel that's actually verified to work.** n8n and CrewAI both explicitly credit OSS as their primary distribution. brocco shipping the public repo at `github.com/brocktherock52/brocco` (just done in v2.11) is now an actively leveraged channel — but it requires the runtime to be deployable, the README to be a real onboarding, and consistent stars + issues activity.
3. **One viral demo on X does the work of a year of marketing.** Cognition went $0 → $1M ARR in 6 months on the March 2024 Devin launch video. Lindy got 70k waitlist signups from one demo video. The single highest-leverage marketing move for brocco is a 60-90 second founder-shot demo video showing 5 agents running in parallel, posted on X.

The numbers that matter:
- 1,000 paying users × blended $94 ARPU (70/30 Solo/Team) = **$94k MRR ≈ $1.13M ARR**
- At verified 2026 cohort conversion rates: **freemium ~4% → ~25,000 active free signups needed**; **CC-required trial ~31% → ~3,200 trial starts needed**. The Lindy model is **8x more capital-efficient on top-of-funnel**.
- Plus 80-90% MoM retention or growth flatlines.

This brief covers: the math, the channels that actually work for this shape, the pricing decision to make before scaling spend, the 90-day plan, and the things that kill platforms at this stage.

---

## 1. define "1,000 users"

Three definitions, three planning horizons:

| Definition | What it means | Planning weight |
|---|---|---|
| **1,000 signups (free + paid)** | Includes BYOK free-tier users | ~3 months realistic |
| **1,000 weekly active users** | Free-tier users who actually run an agent in a 7-day window | ~6 months realistic |
| **1,000 paying customers** ⭐ | Solo or Team subscribers with an active Stripe charge | ~9-15 months realistic |

This brief assumes the **paying** definition. Free-tier signups are a leading indicator, not the goal. Many "1k user" announcements you see on Twitter conflate signups with paid; do not get pulled into that vanity loop.

---

## 2. working-backwards funnel math

Targeting 1,000 paying customers with brocco's current pricing ($49 Solo / $199 Team), assume a roughly 70/30 Solo/Team mix (founder-shaped buyers skew Solo at this stage). Blended ARPU ≈ **$94/mo**, MRR target ≈ **$94k**, ARR ≈ **$1.13M**.

Working backwards through the funnel with realistic 2026 conversion rates for a dev/ops SaaS at this price point:

| Stage | Rate | Volume needed |
|---|---:|---:|
| Total visitors (12-mo cumulative) | — | 250,000 |
| Hero → /app or /pricing engagement | 35% | 87,500 |
| /app → BYOK key saved (or signup) | 12% | 10,500 |
| BYOK saved → first real run | 65% | 6,825 |
| First run → /pricing visit | 30% | 2,047 |
| /pricing visit → InitiateCheckout | 22% | 450 |
| InitiateCheckout → Subscribe | 70% | 315 paid in month 12 |

That's only 315 paid in month 12 if it's all freshly acquired traffic this month. The actual 1,000 number compounds across months as cohorts accumulate. If you maintain a steady 100-200 paid signups per month from month 6 onward and **retain ≥ 80% MoM**, you cross 1,000 paid around month 9-13 depending on churn.

**Math sanity check**: at 200 paid signups/mo and 90% MoM retention, the steady-state ceiling is 200 / 0.10 = **2,000** paid users. That's the math you actually want — a steady inflow that compounds, not a launch spike that decays.

The single most leveraged number above is **"BYOK saved → first real run"**. Onboarding that gets users to a successful agent run in their first session is worth more than any paid channel. Brocco already ships an onboarding modal + recipes; the question is whether they actually convert. This needs PostHog instrumentation (already wired, gated on env var).

---

## 3. the six things that actually move the needle

After studying how Cursor, Devin, Lindy, Replit Agent, CrewAI, n8n, and Relevance AI got past their first 1,000 paid customers, the patterns are remarkably consistent:

### 3.1 distribution match > product polish
Cursor won on **dev Twitter/X + YouTube demos**. n8n won on **open-source GitHub + self-host SEO**. Lindy won on **LinkedIn ops crowd + cold founder outreach**. Devin won on **viral autonomous-PR-merge demo videos**. None of them won by being polished — they won by matching their distribution to their ICP.

For brocco, the ICP is **solo founders + ops leads + technical PMs** who already work with Claude / ChatGPT and want to stop tab-switching. The distribution that fits that ICP is:
- **Twitter/X** (dev-curious founders share AI tools)
- **Hacker News** (one Show HN at v2.10 quality is an event)
- **Comparison SEO** (they Google "alternative to Cursor for ops" — already shipped 5 vs/ pages)
- **Reddit r/AI_Agents, r/LocalLLaMA, r/SaaS** (genuine engagement, not drops)
- **YC alumni Slack / founder communities** (warm intros)

### 3.2 the demo IS the product page
Every agentic AI platform that crossed 1k paid did it with a hero that **shows the product running**, not a marketing pitch. Cursor's video, Devin's PR-shipping clip, Replit Agent's "build me a Tetris" demo. brocco already has a recorded simulator on /app — the conversion lift would come from a **20-second auto-playing hero loop** showing 5 agents working in parallel. Not a YouTube embed, just a small autoplay video.

### 3.3 BYOK reduces friction faster than discounts ever do
A $0 free tier with BYOK gets you ~30% of cold traffic to a "first run" outcome. A $0 free tier with hosted tokens but a 5-run cap gets you ~12%. The BYOK posture brocco already ships is the conversion lever; the messaging just needs to hit harder ("100 free runs · no card · we don't see your prompts").

### 3.4 comparison pages compound forever
Cursor has 11 /vs/ pages. n8n has 30+. brocco has 5. Each one is permanent SEO real estate that attracts buyers in the deepest part of the funnel — "they've decided to buy SOMETHING in this category, they just want to know which." Estimated organic traffic per /vs/ page: 200-2,000 visits/mo at maturity (3-9 months for Google to rank them). brocco's 5 pages should hit 1k-10k combined monthly visits by month 9 if covered with at least one outbound link campaign.

### 3.5 the right wedge beats a bigger wedge
Devin tried to be all-of-software-engineering. CrewAI tried to be all-of-multi-agent-frameworks. Brocco's wedge — "the dashboard you watch your agents from, not another orchestration framework" — is small enough to win first, then expand. Stay narrow until 1k paid is locked.

### 3.6 retention math kills you faster than CAC
Most agentic platforms at this stage have **40-60% gross MoM churn** because users sign up, run 5 things, get bored, cancel. The fix is **active workflows** (recurring prompts the user actually depends on), not feature counts. The "Save to Notion / Slack / Email" buttons in /app point in the right direction; making them real (Notion API integration, scheduled runs) is the highest-leverage retention work post-1k.

---

## 4. channel mix with realistic CAC (revised with verified evidence)

This table reflects what comparable platforms actually credit as their growth (see competitor-data file for sourced quotes), reweighted for brocco's position.

| Channel | Verified evidence | Realistic CAC | Time to first 10 paying | Effort | Recommended mix |
|---|---|---:|---:|---|---|
| **Founder-led X/Twitter (with demo videos)** | Lindy: 70k waitlist from one March-2023 video. Replit: Amjad Masad runs X personally. | $40-150 | 2-4 weeks | High (consistent posting + 1 viral demo) | **30%** |
| **OSS / public GitHub funnel** | n8n + CrewAI both credit this primary. | $0 marginal, time-investment heavy | 4-12 weeks | High (issue triage, README polish, deploy templates) | **20%** |
| **Comparison SEO (vs/)** | None of the 7 publicly credited this; brocco's bet that it's underweighted by competitors | $0 marginal | 3-9 months to rank | Medium | **15%** (compounding) |
| **Meta UGC ads** ⭐ | Not publicly used by the cohort, but Pixel/CAPI is wired and dev-tool ad arbitrage exists | $80-300 (target $200) | 1-3 weeks | Medium | **15%** |
| **YouTuber / influencer placement** | Lindy 2.0 inflection on MattVidPro video; Lindy founder credits this verbatim | $200-1,500 per placement | 4-8 weeks | Medium (outreach) | **10%** |
| **Hacker News (one-shot Show HN)** | Cursor + Devin both rode HN front page; not publicly credited as primary | $50-200 if it ranks | 1 week if top 10 | Low (1 post, day-of moderation) | **5%** (one-shot lever) |
| **Reddit (r/AI_Agents, r/LocalLLaMA, r/SaaS)** | Not credited by cohort but underpriced for technical buyers | $20-80 | 4-8 weeks | Medium | **5%** |
| **YC alumni / warm intros** | None publicly credited but always-on at zero cost | ~$0 | 1-4 weeks | Low | (always-on) |

**Key revisions vs prior draft:**
- OSS / GitHub bumped from 0% to **20%** — now actively leveraged because the public repo `brocktherock52/brocco` shipped in v2.11. Add a one-click Vercel deploy button in the README, ship a Docker image for self-host, and engage star + issue activity weekly.
- Comparison SEO held at 15% (compounding asset, but not a recurring evidence pattern in the cohort)
- YouTuber/influencer added at 10% — brand-new channel but verifiably high-leverage (Lindy 2.0)
- Hacker News deweighted to 5% — high variance, one-shot

The Meta UGC playbook in `marketing/meta-ugc-ads.md` is detailed enough to start. The pixel + CAPI infrastructure (v2.6) is wired and gated on env vars.

---

## 5. pricing decisions before scaling spend

The current pricing is good but has three open decisions worth resolving before pouring money into ads:

### 5.1 Solo at $49 vs $29 vs $20 (REVISED based on verified data)
Original recommendation was to keep $49 with a $29 founder undercut. Verified competitor data flips this:

| Vendor | First paid tier | Free tier? |
|---|---:|---|
| Cursor | $20 | yes (Hobby) |
| Devin | $20 | yes |
| Replit Agent | $20-$25 | yes |
| Relevance AI | $19 | yes |
| n8n Starter | ~$20 | self-host OSS |
| Lindy | $49.99 | **no** (CC-required 7-day trial) |
| **brocco today** | **$49** | yes (100 BYOK runs/mo) |

brocco is currently in the worst-of-both-worlds zone: priced like Lindy but free-tiered like Cursor. **Pick a posture and commit:**

- **Posture A — Match Cursor.** Drop Solo to $19 or $20, keep the 100-run BYOK free tier. Bet on volume. Need ~25,000 free signups → 1,000 paid at the cohort-typical 4% conversion.
- **Posture B — Match Lindy.** Keep Solo at $49 (or push to $59), kill the free tier, replace with a 7-day CC-required trial. Bet on intent. Need only ~3,200 trial starts → 1,000 paid at the verified 31.4% CC-trial conversion. **8x more capital-efficient on top-of-funnel.**

Posture B is the better fit for brocco given the brand work, the editorial design, and the audience (founders + ops leads who already pay Lindy or comparable). Posture A is the safer fit if the channel mix leans toward Hacker News / GitHub / Twitter where price-sensitivity is higher.

**Recommendation: Posture B at $49 with CC-required trial, plus a permanent BYOK demo path** (no signup, no card, runs in the simulator) for tire-kickers. The BYOK demo doesn't count as a "free tier" because nothing leaves the browser. This preserves the trust posture while capturing the trial-conversion math.

If Posture B doesn't work after 60 days of paid traffic, fall back to Posture A.

### 5.2 Free-tier run limit
100 runs/mo is generous. The risk is power users burn through them in week 1 and then either churn or upgrade. Recommendation: split the limit into **100 demo-mode runs (free, simulator) + 25 BYOK live runs (free, real tokens via direct browser call)**. Demo runs cost brocco nothing; BYOK live runs cost the user. The cap signals "this is real" without taxing brocco's margins.

### 5.3 Annual discount
Currently 17% (10/12 months). Industry standard for early-stage SaaS is 20-25%. Recommendation: bump to 20%. Marginal revenue impact is minor at this scale, but it shows up in lifetime customer math and in cash flow (annual prepayment is your friend).

---

## 6. retention + expansion: the real game past 200

The first 200 paid customers come from acquisition. The next 800 come from retention. The math:

- 90% MoM retention = ~70% annual retention. At $49 ARPU, lifetime value ≈ $588 per user.
- 80% MoM retention = ~60% annual. LTV ≈ $441.
- At 80% retention, with $200 CAC, **CAC payback ≈ 4 months, LTV/CAC ≈ 2.2x**. Acceptable but not great.
- At 90% retention, same CAC, **CAC payback ≈ 4 months, LTV/CAC ≈ 2.9x**. The product is actually working.

To hit 90% MoM retention, the product needs to be genuinely used **3+ times per week** by paying users. That requires:
- **At least one recurring workflow** the user has set up (a daily research run, a weekly content sprint, a Stripe-receipt-to-Notion automation)
- **Scheduled runs** (cron-style) — not yet shipped; v3 candidate
- **Real Save-to-Notion / Slack / Email** integrations (currently mocks) — v3 candidate
- **Run history that's worth coming back to** — currently localStorage; should be cloud-synced for paid users

These 4 features are the difference between churning and compounding. Build them between paid customer #50 and #200, not later.

---

## 7. 90-day execution plan

### days 1-30: foundation
- [ ] Custom domain `brocco.ai` (per `CUSTOM_DOMAIN.md`)
- [ ] Meta Pixel ID + CAPI token in Vercel envs (Pixel snippet already wired)
- [ ] PostHog project key + initial dashboards (init code already wired)
- [ ] Stripe receipts customized with brand
- [ ] One additional comparison page per week (start with `/vs/lindy`, `/vs/relevance-ai`)
- [ ] Founder posting cadence: 3 Twitter posts/week, 1 LinkedIn/week, ALL with /app demo screenshots or short clips
- [ ] Submit brocco to: Product Hunt (queued, not launched yet), Open Source Friday, There's An AI For That, Futurepedia
- [ ] Stand up a small (5-10 person) early-access Slack/Discord and seed it with friends + YC alumni

**Goal by day 30**: 25 paying customers from cold + warm sources combined.

### days 31-60: paid amplification
- [ ] Launch Meta UGC ad campaign at $50/day per the playbook
- [ ] Hire one $50/UGC creator on Backstage to shoot variants 2-4 of the playbook
- [ ] Show HN post for v3.0 (when shipped) — single shot, prep day-of comments
- [ ] Long-form expand the 5 blog post seeds to ~1,500 words each
- [ ] Add `/vs/` pages for n8n cloud, Make.com, Lindy
- [ ] Close 3-5 small partnership integrations (Lindy can call brocco via webhook, Notion template, Cursor extension)

**Goal by day 60**: 75 paying customers, $50/day Meta spend showing < $250 CAC, comparison pages indexed.

### days 61-90: retention + expansion
- [ ] Ship scheduled runs (cron-style) — biggest retention lever
- [ ] Real Notion integration (was mock, make it work)
- [ ] Cloud-sync run history for paid users
- [ ] Customer-success cadence: every paid user gets a personal Loom in their first 7 days
- [ ] First case study published (anonymized okay; "ops lead at Series B SaaS replaced 8 Zaps")
- [ ] Show HN if not done yet

**Goal by day 90**: 150-200 paying customers, MoM gross retention ≥ 85%, one published case study, Meta CAC < $200.

---

## 8. 12-month trajectory to 1,000

Realistic compounding model (assumes the 90-day foundation works):

| Month | Paid signups (new) | Churned | Net new | Cumulative paid |
|---:|---:|---:|---:|---:|
| 1 | 25 | 0 | 25 | 25 |
| 2 | 50 | 3 | 47 | 72 |
| 3 | 80 | 7 | 73 | 145 |
| 4 | 110 | 14 | 96 | 241 |
| 5 | 150 | 24 | 126 | 367 |
| 6 | 180 | 36 | 144 | 511 |
| 7 | 200 | 51 | 149 | 660 |
| 8 | 220 | 66 | 154 | 814 |
| 9 | 230 | 81 | 149 | 963 |
| 10 | 230 | 96 | 134 | 1,097 |

This crosses 1,000 paid in **month 10** with realistic-but-disciplined execution. Compared to the funnel math in section 2, the implied CAC across the full 12 months averages **~$110 paid + organic blended**. That requires the comparison-page SEO to actually rank by month 6 and Twitter to deliver 30% of new signups.

If channel mix is worse: 12-15 months. If product-market-fit is weaker than assumed (retention < 80%): the curve flattens and 1k slips to month 18.

---

## 9. risk register (the things that kill platforms at this stage)

| Risk | Impact | Mitigation |
|---|---|---|
| **Anthropic ships brocco's exact product** | Existential | Go deeper on multi-agent + tool factory; lean into BYOK posture they won't replicate |
| **Cursor adds an "ops mode"** | High | Ship `/vs/cursor` traffic plus deeper Notion/Stripe/Postgres integrations they won't prioritize |
| **Stripe takes 5% of bottom-line** | Low | Acceptable, baked into pricing |
| **Free tier gets abused (BYOK doesn't matter, they just want demo runs)** | Medium | Cap demo at 100/mo, IP+localStorage rate limit, friction on signup |
| **CAC > $300 sustained** | High | Kill paid, double-down on SEO + community until unit economics work |
| **Churn > 30% MoM** | Existential | Stop scaling acquisition until retention > 80% MoM; the product needs more "habit" surface |
| **Solo-founder burnout** | High | One full-time hire (probably a customer-success-engineer) when at $20k MRR |
| **Anthropic API pricing changes** | Medium | BYOK passthrough means most cost risk is on the user; brocco's risk is hosted-tier margin |
| **MCP becomes commoditized** | Low | brocco's wedge is the dashboard, not MCP-specifically. MCP commoditization helps us. |

---

## 10. what NOT to do at this stage

- **Don't go after enterprise**. The contract motion is 6-9 months and kills the team's velocity. Wait until 500 paid SMB customers prove product-market-fit, then sell upmarket.
- **Don't add a fifth integration before the first three actually work end-to-end**. Notion + Slack + Stripe done well beats 12 half-wired ones.
- **Don't chase Twitter clout-chasing replies on every AI tweet**. Pick 2-3 high-signal threads/week, contribute substantively, link to a specific brocco use-case (not the homepage).
- **Don't cut the BYOK option even when paid takes off**. It's the trust-building feature; removing it would reverse the moat.
- **Don't hire a marketer before $30k MRR**. Founder-led marketing is the only marketing that works pre-PMF.
- **Don't run a Black Friday discount in year 1**. It trains buyers to wait. Run it in year 2 once growth is steady.

---

## 11. the honest assessment

brocco's product surface at v2.11 is **further along than ~80% of agentic AI platforms when they hit their first 100 paid customers**. The 9 agents, 13 tools, MCP, REST API, /vs pages, Stripe, Pixel + CAPI, PostHog, BYOK, PWA, audit log, comparison SEO, 5 blog seeds, **public GitHub repo with 11 versioned tags** — that's strong distribution-readiness.

The constraints at this point are not technical. They're four things:

1. **Domain not pointed at brocco.ai** — every ad creative looks worse on a `*.vercel.app` URL
2. **Pricing posture is incoherent** — $49 with free tier is the worst-of-both-worlds. Pick Posture A ($20 + free) or Posture B ($49 + CC-trial) per section 5.1. Until this is resolved, the funnel math is fighting the market.
3. **No founder content yet** — Brock has the public footprint and technical credibility but isn't posting brocco-specific content cadence-wise. Verified evidence: Lindy 70k waitlist from one demo video. The single highest-leverage marketing move available right now is shooting that video.
4. **Pixel / CAPI / PostHog have no data flowing** — the env vars aren't set in Vercel, so we can't measure the funnel we built

Resolving these four gates is a 5-day project. Then it's 9 months of disciplined execution against the 90-day plan above.

---

## 12. references and sources

This brief was assembled from:
- **Verified public data** on comparable platforms — see `path-to-1000-users-competitor-data.md` (companion file in this directory) for source-cited per-company snapshots, including pricing, ARR trajectories, and self-credited growth channels.
- **Industry-standard SaaS conversion benchmarks** from ChartMogul, First Page Sage, Guru Startups (see companion file).
- **The actual brocco.ai codebase** shipped through v2.11 (lowercase + curl hero + agents grid + product cards + why-we-built + mega-dropdown nav + public GitHub repo).

Update this doc on a quarterly basis. The math sections are stable; the channel and pricing recommendations should evolve based on actual PostHog + Stripe data once Pixel is live.

---

## next step (one decision, not five) — REVISED

The single highest-leverage move, in priority order, after integrating verified competitor data:

1. **Pick Posture A or Posture B and ship the pricing change** (section 5.1). The current $49+free is the worst-of-both-worlds. This is a 1-day code change.
2. **Point brocco.ai DNS at the Vercel project** (1 day per `CUSTOM_DOMAIN.md`).
3. **Set the three env vars in Vercel** (Pixel ID, CAPI token, PostHog key). 30 minutes.
4. **Shoot one 60-90 second founder POV demo video** showing 5 agents running in parallel. Post it on X with brocco-handle attached. Verified evidence: Lindy got 70k waitlist signups from one such video.
5. **Polish the public GitHub README** with a one-click Vercel deploy button + Docker image so the OSS funnel actually converts. n8n + CrewAI both verifiably ride this.
6. **Then launch Meta UGC at $50/day** with the existing playbook.

By day 21 you'll have real CAC data, a viral-or-not signal from the X video, and GitHub stars trending or flat. All three signals are useful.

Everything else in this brief is downstream of those six moves.
