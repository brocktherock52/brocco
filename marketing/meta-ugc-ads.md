# brocco.ai — Meta UGC Ads playbook

Stage one of the v2.1 launch. Goal: $50/day → first paying customer within 21 days. All copy follows the workspace voice rules (no em-dashes, no AI vocab) and the FINRA OBA caution on Brock's personal handles (this campaign runs from a brand handle, not Brock's personal accounts).

## Targeting and budget

- **Account**: Meta Ads Manager → page `brocco.ai` (create if not yet live)
- **Funnel**: Conversions → "Initiate Checkout" event (Stripe checkout open) primary, "ViewContent" on /pricing secondary
- **Daily budget**: $50/day for 14 days = $700 test
- **Audiences**:
  - **A1 — Lookalike-cold**: 1% LAL of Stripe customer email list (seed = bdp-shared Stripe account; min 100 buyers across BDP arms)
  - **A2 — Interest-cold**: Cursor + Vercel + Anthropic + Linear + n8n + LangChain users (interest stack)
  - **A3 — Retargeting**: visitors `/pricing` 30d, didn't convert; visitors `/app` 14d, didn't convert
  - **A4 — Custom**: Twitter/X follower list of `@brockpivec` minus Brock's existing customers
- **Placements**: Reels + Stories first, Feed second, no Audience Network
- **Optimization**: 7d-click / 1d-view; campaign budget optimization (CBO) on
- **Pixel events to wire**:
  - `PageView` (default)
  - `ViewContent` → /pricing, /app
  - `InitiateCheckout` → POST /api/checkout response.url load
  - `Subscribe` (Custom event) → /billing/success page load
  - `Lead` → BYOK key-saved (custom event from byok-modal save callback)

## Hooks (8 variants, A/B in pairs)

| # | Hook (≤7 words) | Promise | Pain it stabs |
|---|---|---|---|
| H1 | "Stop hiring chatbots" | Real work, on autopilot | Chatbots feel demo-grade |
| H2 | "I replaced 8 Zaps with 3 agents" | Cheaper, smarter, audit-grade | Zaps break on shape changes |
| H3 | "One prompt. Five agents. Done." | Broadcast pattern reveal | Tab-switching fatigue |
| H4 | "Cursor for ops, not just code" | Same DX, broader surface | Ops still in Zapier hell |
| H5 | "Watch 5 AI agents work in parallel" | Visceral demo | Can't visualize agents |
| H6 | "Built on Claude. Wired into your stack." | Trust + ownership | Walled-garden agent platforms |
| H7 | "100 free agent runs. Bring your key." | Free tier wedge | Pricing anchored to $20 |
| H8 | "The dashboard your agents deserve" | Premium aesthetic | Most agent UIs are ugly |

Pairing convention: H1↔H2, H3↔H4, H5↔H6, H7↔H8. Same audience, same creative, different first three seconds.

## Body copy (3 variants)

**B1 — Pain-first**
> Zapier breaks every Tuesday. n8n needs a server. Cursor only does code. Brocco is the dashboard where N AI agents run in parallel on YOUR tools, with a full audit log for your compliance team. 100 runs free. Bring your own Claude key. No card.

**B2 — Curiosity**
> One prompt. Five agents. Each one runs in its own pane. Researcher, planner, outreach, designer, analyst, all working at once. You watch them. They ship. We logged 11-minute time-to-first-run on the beta. Free tier ships today.

**B3 — Proof-first**
> Beta user just replaced 8 Zaps with 3 brocco agents. Cut their automation bill by $340/mo and gained a JSONL audit trail their CTO actually approved. Run it on your own Claude key, watch every step, ship work without the integration drama.

## Creative (UGC video scripts, 9-12 sec each)

### V1 — Founder POV, "the broadcast moment" (12s)
- 0-1s: Phone-camera selfie. Hook on screen: "Stop hiring chatbots."
- 1-3s: Cut to laptop screen, dashboard. Voiceover: "I'm running five AI agents at once on my own keys."
- 3-7s: Screen recording of /app — type goal, hit Cmd+Enter, panes light up.
- 7-10s: Cut to founder reaction. "This finished a Tuesday's worth of ops in three minutes."
- 10-12s: End card. "brocco.ai. 100 free runs. Card not required."
- CTA: Open the app

### V2 — "I replaced 8 Zaps" reaction (10s)
- 0-2s: Text-on-screen: "I had 8 Zaps. They broke every week."
- 2-5s: Person at desk, tired face. "Switched to brocco. Three agents. Same job."
- 5-8s: Screen rec: brocco audit log scrolling, every step labeled.
- 8-10s: "Saved $340/mo. CTO finally approved." End card.

### V3 — Side-by-side race (12s)
- 0-2s: "Zapier vs Brocco. Same task. Go."
- 2-9s: Split screen. Zapier: 12 nodes, hands-on. Brocco: one prompt, agents fan out.
- 9-12s: Brocco finishes first by ~3x. End card.

### V4 — "Live mode reveal" (9s)
- 0-2s: "Watch what happens when I add my Anthropic key."
- 2-7s: Demo Mode badge → click BYOK → paste key → Live Mode badge lights up. Real Claude tokens streaming.
- 7-9s: "Same dashboard. Real Claude. Your tokens. Your data." End card.

## Landing variants (server-side flag, simulated for now)

Each ad URL appends `?ref=<hook>` so we can attribute. The hero H1 stays default, but the eyebrow pill swaps copy:

| Hook | Eyebrow pill (?ref) |
|---|---|
| H1 | "Why brocco beats chatbots" |
| H2 | "Replaced 8 Zaps with 3 agents" |
| H3 | "Broadcast mode is live" |
| H7 | "100 free runs, no card" |

Implementation note: a `<HeroEyebrow />` reads `?ref` from `useSearchParams` and renders the matched copy with a sensible default. Ship in v2.2 if attribution lift > 8% on landing→/app conversion.

## KPIs and stop-loss

| Metric | Target by day 7 | Stop-loss |
|---|---|---|
| CTR (link) | ≥ 1.6% | < 0.7% |
| LP → /app | ≥ 35% | < 18% |
| /app → BYOK key saved | ≥ 12% | < 5% |
| /pricing → Checkout | ≥ 4% | < 1.5% |
| CAC (paid only) | ≤ $200 (vs $588 Solo annual LTV) | > $400 |

If two of the three top-funnel rates miss stop-loss for 3 consecutive days, kill creative and rotate to next pair. Audience stop-loss: $150 spent with zero "InitiateCheckout."

## Production checklist

- [ ] Meta Pixel installed (already wired via Vercel Analytics, add `fbq` script in `app/layout.tsx`)
- [ ] Custom Conversion: "Subscribe" mapped to /billing/success
- [ ] CAPI server-side event from `/api/stripe-webhook` → `Subscribe` with `value` and `currency`
- [ ] 4 video creatives shot (Brock POV is fastest; alternative: hire a $50 UGC creator on Backstage)
- [ ] 3 thumbnail variants per video
- [ ] Landing variant attribution (hero eyebrow swap on `?ref`)
- [ ] Day-7 retro: drop bottom-quartile creative, scale top quartile to $100/day

## What's pre-built and ready

- Stripe checkout: `/api/checkout` is live, returns real `cs_live_*` URLs
- Free tier: 100 runs/month with localStorage usage tracking and upgrade nudge already in `/app`
- /billing/success exists with confirmation copy
- Onboarding modal already runs first-visit (4 steps)
- /pricing has monthly/annual toggle with "save 17%" pill
- /security page reads as enterprise-credible (SOC 2 in progress, ZDR, AES-256)

## Deferred (post-first-customer)

- Google Ads search campaign (long-tail keywords from SEO research)
- LinkedIn Sponsored Content for ops-leader audience
- Cold-email outbound sequence to YC W26 batch ops leads
- Affiliate program (10% recurring on referrals)
- Comparison pages: brocco vs Cursor, brocco vs Devin, brocco vs Zapier (legacy/v1-static has stubs we can port)
