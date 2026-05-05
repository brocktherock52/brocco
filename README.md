# brocco.ai

The agentic AI platform marketing site + interactive `/app` demo. Next.js 15 (App Router) +
TypeScript + Tailwind + Radix + Framer Motion. Production-deployed on Vercel as
`brocktherock52s-projects/brocco-site` at https://brocco-site.vercel.app.

## Stack

- **Framework**: Next.js 15 (App Router, RSC, edge runtime for `/api/*`)
- **UI**: Tailwind CSS + Radix Primitives + shadcn-style component patterns
- **Motion**: Framer Motion
- **Toasts**: Sonner
- **Analytics**: Vercel Analytics + Speed Insights
- **Billing**: Stripe (Checkout + Portal + signed Webhooks via WebCrypto)
- **Live demo**: Anthropic + Tavily (server-streamed SSE under `/api/v1/run`)

## Quick start

```powershell
# from arms/brocco_site/
npm install
npm run dev
# → http://localhost:3000
```

## Deploy

```powershell
vercel deploy --prod
```

The Vercel project is already linked. CI: push to `main` on the parent
`bdp-consulting` repo and Vercel will rebuild.

## Env vars (Production, already set)

| Var | Purpose |
|---|---|
| `STRIPE_API_KEY` | Stripe live API key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `STRIPE_PRICE_SOLO_MONTHLY` | $49/mo |
| `STRIPE_PRICE_SOLO_ANNUAL` | $490/yr |
| `STRIPE_PRICE_TEAM_MONTHLY` | $199/mo |
| `STRIPE_PRICE_TEAM_ANNUAL` | $1,990/yr |
| `APP_URL` | https://brocco-site.vercel.app |
| `ANTHROPIC_API_KEY` | (optional) enables `/api/v1/run` live demo |
| `TAVILY_API_KEY` | (optional) enables `search_web` in live demo |

## Layout

```
app/
  page.tsx                  - landing
  app/page.tsx              - interactive multi-agent dashboard
  pricing/page.tsx          - pricing + feature comparison
  security/page.tsx         - SOC 2 / GDPR / encryption / ZDR
  docs/page.tsx             - documentation hub
  billing/success/page.tsx  - Stripe success page
  api/
    checkout/route.ts        - POST: create Stripe Checkout session
    portal/route.ts          - POST: create Stripe Customer Portal session
    proxy/route.ts           - GET: read-only HTTP proxy for the in-app browser tool
    stripe-webhook/route.ts  - POST: signed Stripe webhook (Edge WebCrypto)
    v1/agents/route.ts       - GET: list available agents
    v1/run/route.ts          - POST: SSE-stream a live Claude tool-use loop
  layout.tsx, globals.css, sitemap.ts, robots.ts, not-found.tsx
components/
  nav, hero, particle-field, how-it-works, wedge, features, personas,
  pricing, faq, final-cta, footer, logo
  dashboard/
    app-shell, agent-card, stream-pane, jsonl-log, byok-modal
lib/
  agents.ts          - 9 built-in agent specs + 13 tools + 4 recipes
  simulator.ts       - realistic streaming simulator for the demo dashboard
  utils.ts
public/
  assets/            - logos, OG, app icons
  manifest.webmanifest
legacy-static/       - the previous static site (kept for reference)
legacy-api/          - the previous /api Vercel functions (kept for reference)
```

## Conversion + growth notes

- **Hero CTA**: primary `Open the app` (confetti + toast), secondary `Watch 47s demo`.
- **Trust bar**: provider logos right under the hero.
- **Multiple high-intent CTAs**: header, hero, every section, sticky pricing block,
  final CTA band.
- **/app**: works in Demo Mode without a key. Realistic templated streaming so visitors
  feel the product immediately. BYOK modal saves to localStorage only.
- **Recipes**: pre-fill the prompt with one click. Lowers TTFV from ~30s to ~5s.

## Lighthouse / SEO

- Edge functions, SSR for static pages, no client-only critical path.
- Open Graph + Twitter Card + JSON-LD (Organization + SoftwareApplication).
- `sitemap.ts`, `robots.ts`, semantic landmarks, skip-to-content link.
- Tailwind purged; no runtime CSS-in-JS.
- Inter + JetBrains Mono via Google Fonts (preconnected, swap).

## Roadmap

- [ ] Wire `/api/v1/run` into the dashboard when a key is present (replace simulator)
- [ ] /account page with Customer Portal CTA
- [ ] Persist Stripe state in Supabase (currently logs only)
- [ ] PostHog event taxonomy on hero, pricing, app-run
- [ ] Migrate blog/changelog/vs-comparison pages from `legacy-static/` into `app/(marketing)/`

---

© 2026 brocco.ai - a BDP Consulting product.
