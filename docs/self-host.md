# Self-Hosting Brocco

Brocco is open source under MIT. You can deploy your own instance on Vercel (one-click), or wherever Next.js + Edge runtime is supported (Cloudflare Workers and Netlify Edge work with minor config tweaks).

## Quick start — Vercel (recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbrocktherock52%2Fbrocco&env=ANTHROPIC_API_KEY&envDescription=Required%20to%20run%20live%20agents.%20Get%20one%20at%20console.anthropic.com.&envLink=https%3A%2F%2Fconsole.anthropic.com)

The Vercel button clones the repo into your account, prompts for `ANTHROPIC_API_KEY`, and deploys. ~3 minutes end to end.

## Quick start — local development

```bash
git clone https://github.com/brocktherock52/brocco
cd brocco
npm install
ANTHROPIC_API_KEY=sk-ant-... npm run dev
# → http://localhost:3000
```

## Environment variables

### Required for live agents

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Server-side key for `/api/v1/run` public demo. Without it, `/api/v1/run` returns 503 `demo_offline`. The `/app` dashboard still works in BYOK mode (user pastes their own key). |

### Optional features

| Variable | Purpose |
|---|---|
| `TAVILY_API_KEY` | Enables the `search_web` tool. Without it, search returns `ERROR: TAVILY_API_KEY not set`. Get one at [tavily.com](https://tavily.com). |
| `APP_URL` | Canonical URL used in OG tags, Stripe redirects, and CAPI deduplication. Defaults to `https://brocco.dev`. |

### Stripe billing (optional — only if you want paid plans)

| Variable | Purpose |
|---|---|
| `STRIPE_API_KEY` | Stripe live or test secret key (`sk_live_...` / `sk_test_...`). |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret from your Stripe webhook endpoint config. |
| `STRIPE_PRICE_SOLO_MONTHLY` | Price ID for the Solo monthly plan. |
| `STRIPE_PRICE_SOLO_ANNUAL` | Price ID for the Solo annual plan. |
| `STRIPE_PRICE_TEAM_MONTHLY` | Price ID for the Team monthly plan. |
| `STRIPE_PRICE_TEAM_ANNUAL` | Price ID for the Team annual plan. |

Configure your Stripe webhook to POST to `https://<your-domain>/api/stripe-webhook` and select these events:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

The webhook verifies signatures via WebCrypto (no Stripe SDK) and rejects events with timestamps older than 5 minutes (replay protection).

### Analytics (optional — funnel measurement)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel browser-side. Consent-gated. |
| `META_CAPI_TOKEN` | Meta Conversions API server-side token (deduplicated with browser pixel via `event_id`). |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog analytics. Consent-gated. |

Without these set, the analytics code is a no-op. Pixel/CAPI/PostHog integration code is wired but inert until the env vars are present.

## Setting env vars on Vercel

```bash
vercel env add ANTHROPIC_API_KEY production
vercel env add TAVILY_API_KEY production
# ...etc
vercel deploy --prod --yes
```

## Custom domain

Brocco runs on `brocco.dev` by default. To use your own:

1. Add the domain in Vercel project settings.
2. Update the `APP_URL` env var.
3. Update your Stripe webhook URL to `https://<your-domain>/api/stripe-webhook`.
4. Search-replace `brocco-site.vercel.app` references in `app/layout.tsx` (OG tags) and `app/sitemap.ts`.

## Deploying outside Vercel

The `/api/*` routes use Next.js Edge runtime, which is portable to:

- **Cloudflare Workers** via [`@cloudflare/next-on-pages`](https://github.com/cloudflare/next-on-pages). Requires moving Stripe webhook signature verification to a Cloudflare-compatible WebCrypto path (the current code already uses WebCrypto, so this should be drop-in).
- **Netlify Edge** via [`@netlify/plugin-nextjs`](https://github.com/netlify/next-runtime). Similar story.

We don't currently maintain CI for non-Vercel deployments. If you ship Brocco on a different platform, please file a PR with the working config.

## Database

Brocco does **not** require a database for the free demo or BYOK mode. The Stripe webhook handler currently logs events to `console.log` only — there is no persistence layer. This is acceptable for first-customer scale; once you have real customers, you'll want to add Vercel KV / Neon / Supabase to persist subscription state.

See [`docs/internal/HANDOFF_NEXT_SESSION.md`](internal/HANDOFF_NEXT_SESSION.md) for the planned persistence migration.

## Costs

- **Anthropic Claude:** pay-per-token. Each demo run is ~$0.05-$0.20 depending on tool use.
- **Tavily search:** free tier covers ~1000 queries/month.
- **Vercel:** free tier is fine for first 100 users; Pro tier is $20/month per seat once you exceed it.
- **Stripe:** 2.9% + $0.30 per transaction (US, online).

Public-demo cost exposure: with the cookie rate limit (1 run / 24h / IP), worst case is ~$0.20 × DAU. Add IP-rate-limiting via Vercel KV for stricter caps.
