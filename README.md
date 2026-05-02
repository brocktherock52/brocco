# brocco.ai. marketing site

Static site for **brocco.ai**, BDP's agentic AI platform (codename: Charter). Custom WebGL fluid hero, scripted live-agent demo, four-tier pricing, eight-question FAQ. all built around brocco's wedge: agents commoditize, workflows are the moat.

## Local

```powershell
# from arms/brocco_site/
npm run dev
# → http://localhost:4321/
```

No build step. No frameworks. Just `public/` served raw.

## Deploy

```powershell
vercel deploy --prod
```

`vercel.json` ships:
- `cleanUrls: true`
- security headers (no-sniff, referrer-policy, permissions-policy)
- aggressive cache on `/assets/*` (immutable, 30 days)
- moderate cache on `/styles.css` and `/scripts/*` (1h browser, 24h edge, SWR 7d)

## Assets

- `public/index.html`. single page
- `public/styles.css`. design system + components
- `public/scripts/fluid-hero.js`. custom WebGL fragment shader (fBm Simplex noise + UV warp + 5-color brand palette + film grain). ~6KB. Falls back to a CSS gradient on `prefers-reduced-motion` or no-WebGL.
- `public/scripts/agent-demo.js`. replays 4 recorded agent traces (researcher / outreach / coder / supervisor) for the live-demo section. v2 swaps for a real Charter API call.
- `public/scripts/main.js`. nav glassify, FAQ accordion, pricing toggle, scroll reveals.
- `public/assets/logomark.svg`, `logo-wordmark.svg`, `favicon.svg`, `og.svg`. brand kit.

## Stack rationale

Custom WebGL > Paper Shaders / three.js for this hero because:
- zero deps, zero build step → ships from one HTML file
- full control over palette + motion speed (research recommended 0.13–0.18)
- 5KB fragment shader vs. ~600KB three.js bundle
- works offline, no CDN dependency for shader runtime

If we ever need React/Next, drop in `@paper-design/shaders-react MeshGradient` with the same color stops. they'll match.

## Roadmap

- v2: real Charter API endpoint behind `/api/run` (Vercel serverless or Hetzner reverse proxy). replaces the scripted demo
- v2: WebP fallback frame for hero (export shader at 1920×1080 for static OG)
- v3: regenerate hero photography of broccoli-as-chrome-sculpture via nano-banana-2 once `belt` CLI is installed
- v3: SEO refresh. /docs, /security, /vs/<competitor> pages
- v4: A/B test hero copy variants ("Agents that do the work" vs "Other agents read the internet…") with PostHog (key already in workspace .env)
