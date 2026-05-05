# brocco · 30-day launch playbook

> Internal. Companion to `meta-ugc-ads.md` and `research/path-to-1000-users.md`.
> Day 0 = the day you point the new domain at Vercel.
> Goal: by day 30 → 25 paying customers, real CAC data, viral-or-not signal.

---

## week 0 (the 5 gates) · before any marketing

These are non-negotiable. Marketing is wasted spend until they're closed.

- [ ] **Domain registered + pointed.** Brocco.ai is taken. Recommendation: `brocco.dev` (~$12/yr at Cloudflare). Backup: `usebrocco.com`. Follow `CUSTOM_DOMAIN.md` once registered.
- [ ] **Pricing posture decision.** Pick A ($20 + free) or B ($49 + CC-required trial). See `research/path-to-1000-users.md` §5.1. **Recommendation: Posture B**, Lindy-style.
- [ ] **3 env vars in Vercel**: `NEXT_PUBLIC_META_PIXEL_ID`, `META_CAPI_TOKEN`, `NEXT_PUBLIC_POSTHOG_KEY`. Without these the funnel built in v2.6 + v2.8 is invisible.
- [ ] **Logo, favicon, OG image render correctly on the new domain.** Check `/icon.png`, `/apple-icon.png`, `/opengraph-image`. Twitter Card validator + LinkedIn Post Inspector will surface any issues.
- [ ] **Public github.com/brocktherock52/brocco repo polished**: one-click Vercel deploy button at the top of the README, a `docker-compose.yml` for self-hosters, and a pinned issue welcoming first contributors.

If any of these is open, do not proceed past week 0.

---

## week 1 · founder-led content (the highest-leverage week)

The single biggest lever in the entire research brief is "one viral demo video." This week is mostly that.

### day 1-2: shoot the launch video
- 60-90 seconds, founder POV, phone camera is fine
- Beat sheet (45-second cut):
  - 0-3s: hook on screen "I run my company without an assistant" or "I replaced 8 zaps with 3 brocco agents"
  - 3-15s: face-cam founder explains the problem in 1 sentence, then says "watch this"
  - 15-45s: screen-record of /app — type a goal, hit Cmd+Enter, 5 panes light up, JSONL log fills, supervisor synthesizes
  - 45-60s: face-cam payoff "this finished a Tuesday's worth of ops in 4 minutes"
  - End card: brocco mark + brocco.dev URL + "100 free runs · no card"
- Shot in iPhone vertical (9:16) for Reels/Shorts; export 16:9 export for X/LinkedIn

### day 2: post the launch
- **X/Twitter**: post the video as a single tweet, NOT a thread. Caption: "i run my company without an assistant. i broadcast one prompt to five claude agents working in parallel. brocco · 100 free runs · brocco.dev"
- Pin it to the brocco-handle profile (create `@brocco_ai` if you haven't)
- Post the same video to **LinkedIn** with a slightly different caption (operator-shaped: "if your ops team has more than 5 zaps, you should try this")
- Post to **YouTube Shorts** + **Instagram Reels** + **TikTok** with auto-uploaded captions (Descript / CapCut handles this in 90 seconds)

### day 3-7: founder posting cadence (3 posts/day on X, 1/day on LinkedIn)
The cohort data is unambiguous: founder-led X drove Lindy + Replit growth. Templates below.

**X thread template — "what brocco does in 1 minute"**
```
1/  what brocco actually does, in one minute:

you have nine specialists. researcher, planner, outreach, coder, designer, analyst.

each one is a markdown file with a tool list.

2/  you broadcast one goal.

they fan out. each runs in its own pane. each calls real tools — search, http, file, memory.

every step is logged as jsonl. greppable, diffable, your security team will sign off.

3/  byok or hosted.

free tier: 100 runs, your anthropic key, prompts go from your browser direct to anthropic. zero data retention.

paid: $49 / mo, hosted, we cover tokens.

4/  install as a desktop app on mac or windows.

run it inside claude desktop via mcp.

call it from cursor, n8n, zapier via rest.

5/  brocco.dev · 100 free runs · no card

[demo video]
```

**X reply template — engaging on AI threads**
```
brocco does this exact pattern but with N agents in parallel. one prompt → researcher + planner + outreach + designer + analyst all run at once. jsonl audit log. 100 free runs byok. brocco.dev
```
(only post this when it's actually relevant; shotgunning kills the brand)

**LinkedIn post template — operator audience**
```
last week i replaced 8 zapier zaps with 3 brocco agents.

zaps broke every tuesday because the input shape changed.

brocco agents READ the data and decide what to call next. saved $340/mo and the audit log alone got cto sign-off.

100 free runs / month, byok, browser-first.

brocco.dev — comments are open.
```

### day 7 deliverable
- Launch video has ≥10k views OR you adjust the next-week plan to lean more on paid + GitHub
- 5+ replies / DMs from interested users
- 2-3 of those converted to first BYOK run via /app

---

## week 2 · public github amplification + influencer outreach

OSS is the cheapest verified channel for agentic SaaS (n8n, CrewAI). The repo is live; now make it convert.

### day 8-10: github funnel
- README at `github.com/brocktherock52/brocco`: add a **"Deploy to Vercel"** button at the top (one-click clone + deploy with env vars pre-templated). This is the single biggest GitHub-to-revenue lever.
- Add a `docker-compose.yml` that boots the full stack with a local Stripe stub. Self-hosters love this and it converts engineering teams.
- Submit to:
  - [Awesome AI Agents](https://github.com/e2b-dev/awesome-ai-agents) (PR with brocco entry)
  - [Awesome MCP Servers](https://github.com/punkpeye/awesome-mcp-servers) (PR)
  - [Open Source Friday](https://opensourcefriday.com/projects/new) (project listing)
  - [There's An AI For That](https://theresanaiforthat.com/submit-tool/)
  - [Futurepedia](https://www.futurepedia.io/submit-tool)
- Pin a "good first issue" labeled GitHub issue: "Add a tool factory example for [popular SaaS]" — invites contributors

### day 10-12: influencer / podcast outreach
Lindy 2.0 inflection was a single MattVidPro placement. Reach out to 5 names in the AI / dev tools space (cold email, no agent):

| Target | Channel | Pitch angle |
|---|---|---|
| MattVidPro | YouTube | "the brocco dashboard runs 9 agents in parallel — i'd love to send a 5-min demo if you do AI tooling reviews" |
| Latent Space (swyx) | Podcast | "small bet: brocco's wedge is 'parallel agent panes' which nobody else ships. would you do a 20-min sit-down?" |
| Lenny Rachitsky | Substack | "you covered cursor's growth — i'm at v2.10 of the same shape for ops/non-coders. happy to share the full data." |
| Theo (t3.gg) | YouTube | "byok-first agentic dashboard. open source. would love a roast on stream." |
| Greg Isenberg | Twitter | "i bootstrapped brocco solo. happy to give you 3 customers' worth of MRR data for a tweet review." |

Cold-email template (≤80 words, no em-dashes per workspace rule):
```
subject: brocco · 9 agents in parallel · 60-second demo

hey [first name],

i shipped brocco today: a multi-agent dashboard where one prompt fans out to N claude agents in parallel. each runs in its own pane. byok or hosted, $49/mo.

different from cursor (ide) and devin (autonomous swe). closer to lindy but cheaper, byok, and self-hostable.

60-second demo here: [video url]
github: github.com/brocktherock52/brocco

would you take a look?

brock
```

### day 12-14: comparison page distribution
The 5 /vs/ pages are SEO assets but they're also content. Drop links in:
- Hacker News comments (only when relevant — never drop, only contribute)
- Reddit r/AI_Agents threads asking "what's the difference between X and Y"
- LinkedIn posts that mention competitor names organically
- Twitter replies on competitor announcements (one per day max)

### week 2 deliverable
- 3+ inbound replies from cold outreach
- 1 confirmed podcast / video booking
- GitHub repo at ≥25 stars
- /vs/ pages indexed in Google (search `site:brocco.dev /vs/`)

---

## week 3 · paid amplification + show HN

### day 15-17: meta UGC at $50/day
- Wire the Pixel ID + CAPI token in Vercel envs (week-0 gate)
- Launch the hooks H1+H2 pair from `marketing/meta-ugc-ads.md` against the LAL audience
- Daily monitoring: CTR, LP→/app, /pricing→Checkout
- Stop-loss: kill creative if CTR < 0.7% for 3 consecutive days
- Day 14 of campaign: drop bottom-quartile creative, scale top to $100/day

### day 18: show HN post
**Post title**: `Show HN: Brocco — multi-agent dashboard with BYOK Claude (open source)`
**Post body**:
```
hi HN — i'm brock, solo founder, i shipped brocco over the last week.

the wedge: cursor lives in your ide. devin runs autonomous swe. lindy is for ops but $49/mo with no free tier. brocco is the multi-agent dashboard for everyone in between — researcher + planner + outreach + designer + analyst, all running in parallel from one prompt.

what's there at v2.10:
- 9 specialists, 13 tools, 4 recipes
- byok on free (your anthropic key, prompts never touch our server)
- hosted on paid ($49 solo, $199 team)
- mcp server so the agents work inside claude desktop + cursor
- rest api with bearer auth + sse
- jsonl audit log per run, exportable
- pwa, works offline in demo mode
- public source under brocco public source license

what i'd love feedback on:
1. the broadcast pattern (one prompt to N agents) — does it actually solve a problem you have?
2. byok-first posture — is this trust-building or friction?
3. the wedge against cursor / devin / lindy / n8n / crewai (i wrote 5 /vs/ pages, all here: brocco.dev/vs/cursor)

repo: github.com/brocktherock52/brocco
live: brocco.dev/app

happy to answer anything.
```

Day-of: monitor every comment, reply within 10 minutes, stay civil to the inevitable critic. The first 2 hours decide whether it ranks.

### day 19-21: reddit + community
- 3 reddit posts in week 3, ONE per day:
  - `r/AI_Agents`: "i shipped a multi-agent dashboard, wedge is parallel panes — feedback?"
  - `r/LocalLLaMA`: "byok llama.cpp via openai-compatible endpoint — full ollama story"
  - `r/SaaS`: "from 0 to 25 paying customers in 30 days, here's what worked" (only if you actually hit 25)
- Each post: link to the live site, NOT to a marketing landing page
- Be ready for criticism; engage every comment that asks a real question

### week 3 deliverable
- HN post hits front page (top 30) for at least 1 hour OR you write the retro and try again at v3.0
- Meta CAC trending toward < $250 by day 21
- 50+ paying customers cumulative

---

## week 4 · retention infrastructure

The cohort data: 60% MoM gross churn is normal for agentic SaaS at this stage. To keep what you've earned:

### day 22-24: ship scheduled runs
- Cron-style scheduling in `/app` ("run this every Monday at 9am")
- Recurring workflow = sticky habit. Without it, users churn after 2 weeks.

### day 24-27: real Notion + Slack integrations
- Replace the mock "Save to Notion / Slack" buttons with real OAuth + write
- Notion API: `pages.create` from agent output → user's chosen page
- Slack: `chat.postMessage` from agent output → user's chosen channel
- These two integrations alone improve 30-day retention by ~20% empirically (industry benchmark, not brocco-measured yet)

### day 27-30: customer success motion
- Every paying customer gets a personal Loom in their first 7 days from Brock
- Week 4 of paid: send the "what should we build next?" email with 3-question survey
- One published case study (anonymized okay — "ops lead at series B SaaS replaced 8 zaps")

### day 30 deliverable
- 25+ paying customers
- Day-30 retention ≥ 80%
- 1 published case study
- Meta CAC < $250
- 10+ GitHub stars per week trend
- HN front-page post archived for evergreen referrer traffic

---

## the math (simplified)

Posture B (Lindy-style $49 + CC-required trial):
- ~31% trial-to-paid conversion (verified benchmark)
- To hit 25 paying by day 30 you need ~80 trial starts
- 80 trial starts at 4-6% landing-page conversion = ~1,500-2,000 visitors
- 1,500-2,000 visitors over 30 days from: 600 organic (founder content + repo) + 800 paid (Meta UGC at $50/day = $1,500 spend) + 100-300 from HN/Reddit spike = math closes

This is achievable in 30 days only if week-0 gates are closed and the founder demo video gets ≥10k views in week 1.

---

## the seven things that kill this 30-day plan

1. Domain not pointed by day 1 → all the URLs in your content go to vercel preview → trust kills CTR
2. Pricing not committed (still $49 with free tier) → funnel math fights itself
3. Founder demo video not shot → the highest-leverage move never happens
4. Pixel/CAPI/PostHog env vars unset → you can't measure the funnel you built
5. Public repo README is the v1 internal one (it's not — it's the polished v2.11 one) — keep it that way
6. Trying to do all of this without retention infrastructure → 60% gross churn = 10 net new from 25
7. Doing none of weeks 1-3 and just launching Meta ads → CAC > $400, cash-out before month 3

---

## what to do if week 1 goes badly

If the founder video gets <2k views and you have <5 replies by day 7:
- The video is wrong, not the product. Re-shoot with a different opening hook (use H2 or H4 from `meta-ugc-ads.md`)
- Move the demo to a 12-second screen-only loop with text overlays — ditch the talking head
- Post to the same channels but with 3 variants this time

If Meta CAC is > $400 by day 21:
- Kill the Meta campaign. Do NOT scale to $100/day yet
- Double-down on free channels: GitHub, founder posting, comparison SEO, podcast outreach
- Revisit the pricing posture — if you're on Posture A ($20 + free), the math doesn't support paid acq. Switch to Posture B.

If MoM retention < 70% by day 30:
- The product is being signed up for, not used
- Ship scheduled runs + real Notion integration FIRST, then resume acquisition

---

## quick-reference: the top 10 things to actually do this week

1. Register `brocco.dev` at Cloudflare ($12, 5 minutes)
2. Point DNS at Vercel per `CUSTOM_DOMAIN.md` (1 day for propagation)
3. Set 3 env vars in Vercel (Pixel, CAPI, PostHog) — 30 min
4. Decide Posture A vs B and ship the pricing change — 1 day code
5. Shoot 60-90s founder demo video — 2 hours including iteration
6. Post to X + LinkedIn + Reels — 30 min
7. Add Vercel deploy button to public README — 15 min
8. Email 5 influencers / podcasters with the demo URL — 1 hour
9. Launch Meta UGC at $50/day — 30 min
10. Block out the next 30 days for cadence (every day, 3x X posts + 1x LinkedIn + 1x repo activity)

That's it. The rest is execution.
