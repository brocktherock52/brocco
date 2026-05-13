# Changelog

All notable changes to Brocco. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: semver under the `vMAJOR.MINOR-tag` scheme until 1.0.

## [Unreleased] — daily-essential push (2026-05-12)

### Added
- **brocco.dev domain registered** on Hostinger. DNS + Vercel switchover steps documented at `docs/internal/CUSTOM_DOMAIN.md` (rewritten for Hostinger's DNS panel + brocco.dev specifically; the doc was previously for `brocco.ai`).
- **README banner** — wordmark logo at the top, badges row (site / source / license).
- **Daily auto-briefing** on the dashboard. `<MorningBriefing />` lives above the empty-state and simulates "what brocco did while you slept" — 6 per-agent rows with one-click follow-ups. Stub data today; data-shape stable so swapping to a real per-user feed is a single-line change.
- **Marketing morning-routine section** between the bento hero and the agents bento. Four peek cards mirror the dashboard briefing so the landing promise matches the in-app reality.
- **Bespoke 9-croc cast cards.** The agent-cast cards now render the per-slug `CastCrocCharacter` SVG (researcher at his desk, planner at the whiteboard, browser in the leather chair, etc.) instead of the shared brocco mascot. Each card gets a subtle y-bob + rotate idle and a pulsing accent vignette. The previous SCENE / COSTUME / STICKER tables (~280 lines) are gone.
- **Daily-streak counter** in the nav (`<StreakChip />` + `lib/streak.ts`). Ticks once per local day on /app mount. 1 free skip per ISO week. Color ramps amber → fuchsia → gold at 7 / 30 day milestones.
- **Proactive suggestion slot** above the panes (`<SuggestionSlot />` + `lib/suggestions.ts`). Three pattern types: recurring candidate (same goal 3×/14d), broadcast drought (>36h idle), agent bias (one agent ≥7×, another <2×). Accept / snooze 7d / dismiss.
- **Custom-agent wizard** at `/app/agents/new`. 4-step flow (template → name+topic → croc base + accent → tools + save). 8 templates (researcher, closer, reviewer, analyst, qa, recruiter, pm, editor), 9 croc bases, 8 accents, live preview. Persists to localStorage via `lib/custom-agents.ts`. Sidebar gets a "create your own agent" CTA.
- **DAILY-ESSENTIAL-FEATURES.md** tracker at repo root — 8 daily-essential lanes with status + next steps.

### Changed
- Removed the per-card hue-rotate filter on the cast cards. The bespoke SVGs carry their own personality; we don't need to grade the same mascot 9 different ways.

---

## [Unreleased] — review-fixes-2026-05-11 branch

### Security
- **Stripe webhook now rejects events with timestamps older than 5 minutes.** Closes a replay-attack vector where a captured webhook could be replayed indefinitely. ([#stripe-webhook-timestamp])
- **Stripe webhook is now idempotent.** Duplicate `event.id` is ignored on retry. Today this uses an in-memory `Set` (best-effort across Edge cold starts); production should swap to Vercel KV. ([#stripe-webhook-idempotency])
- **`/api/v1/run`'s `http_get` tool now blocks SSRF.** Private IP ranges (10.x, 172.16-31.x, 192.168.x), loopback, AWS metadata endpoint, and non-http(s) schemes are rejected with `ERROR: ssrf_blocked`. Mirrors the existing `/api/proxy` protection.

### Added
- **`LICENSE`** — MIT.
- **Per-token streaming on `/api/v1/run`.** The server now calls Anthropic with `stream: true` and emits `text_delta` events to SSE consumers. Existing `assistant_turn` and `assistant_text` events are unchanged — consumers can opt into the deltas for live rendering without breaking.
- **AbortSignal propagation on `/api/v1/run`.** When the client disconnects, the upstream Anthropic call and any in-flight tool fetches are aborted within ~100ms.
- **Retry+backoff on Anthropic 429/5xx.** Up to 3 attempts, max 30s wait, honors `Retry-After` header.
- **Parallel tool execution within a step.** Multiple `tool_use` blocks in one assistant turn now execute via `Promise.all` (latency win on multi-tool steps).
- **Heartbeat ping every 5s on the SSE stream** (`: ping\n\n` comment) to keep proxies from closing idle connections.
- **60-second hard cap on `/api/v1/run`** to bound demo cost.
- **Structured error envelope** across `/api/v1/*` routes: `{error, code, detail, doc_url, request_id}`. `code` is a stable identifier; HTTP status maps from the code. See [`docs/api.md`](docs/api.md#error-envelope).
- **`request_id` surfaced** in both the response envelope and the `X-Brocco-Request-Id` response header on every endpoint. Include it when filing issues.
- **Full Stripe subscription lifecycle handlers**: `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.payment_succeeded/failed`. Today these log; persistence layer is the next step.
- **`docs/` directory** with API reference, self-host guide, BYOK guide, and curl quickstart examples.
- **`CHANGELOG.md`** (this file) and **`CONTRIBUTING.md`**.
- **`DESIGN.md`** at the repo root documenting the visual system.

### Changed
- **README rewritten.** Now leads with a working curl example, the self-host instructions reference the correct path (`cd brocco`, not the stale `cd arms/brocco_site`), and includes a one-click Vercel deploy button.
- **HANDOFF\*.md and CUSTOM_DOMAIN.md moved** from the repo root to `docs/internal/`. These are operator artifacts; they no longer clutter the developer landing.

### Pending (planned, not in this changeset)
- **Vercel KV persistence layer** for Stripe events and subscription state.
- **Public broadcast endpoint** `/api/v1/run-public` for the homepage live hero.
- **Notion OAuth integration** (planned as v3 PR 4 from `docs/internal/HANDOFF_NEXT_SESSION.md`).
- **`brocco-sdk` npm package** with typed event union and SSE iterator.

---

## [v4.6] — 2026-05-11

### Added
- Bento redesign of the homepage hero (`components/hero-bento.tsx`, `components/agents-bento.tsx`, `components/surfaces-filmstrip.tsx`).
- 5 new UI primitives via Framer Motion 11.

### Notes
- Branch `feat/bento-redesign` not yet merged at the time of this changelog entry. See [`docs/internal/HANDOFF_2026-05-11.md`](docs/internal/HANDOFF_2026-05-11.md).

## [v4.5] — 2026-05-06

### Added
- Live typewriter terminal in the hero.
- Live activity rail showing recent runs.
- Cast images on the homepage.
- Mega-dropdown navigation.
- Command palette (Cmd+K).
- Calendly booking links.
- Support chat FAB.

### Stack
- 70+ live routes, all returning 200.

## [v3.0] — 2026-05-03

### Added
- Charter runtime + `/app` dashboard.
- Stripe live integration (Checkout + Customer Portal + signed webhooks).
- 3 published blog articles.
- Initial marketing assets.

### Removed
- Static HTML site (preserved under `legacy-static/`).

## [v2.1] — 2026-05-05

### Added
- Live BYOK Claude integration in `/app`.
- PWA install.
- Onboarding modal (4-step tour).
- `/privacy`, `/terms`, `/changelog` pages.
- Loading + error boundaries.
- Free-tier usage tracking (localStorage).

## [v2.0] — 2026-05-05

### Added
- Full Next.js 15 rebuild from static HTML.
- New `/app` dashboard, `/pricing`, `/security`, `/docs` routes.

## [v1.x] — 2026-05-02

### Added
- Original static HTML site with custom WebGL fluid hero.
- Scripted demo.

Preserved under `legacy-static/` and `legacy/v1-*` for reference.
