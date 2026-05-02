# brocco.ai SEO content brief

Use this as the actual queue for the next 10 articles. Each entry has a target keyword, search intent, the outline to follow, and the internal links to drop.

## Current on-page SEO state (what's already done)

- **Sitemap**: `/sitemap.xml` lists 17 URLs with priorities + changefreq.
- **Robots**: `/robots.txt` allows everything, points at sitemap.
- **Structured data**: `/` has `Organization` + `SoftwareApplication` + `FAQPage` JSON-LD. Eligible for rich Google results (price snippets + FAQ accordion in SERP).
- **Canonicals**: every page has `<link rel="canonical">`. No duplicate content risk.
- **OG / Twitter cards**: every page has explicit `og:title`, `og:description`, `og:image` (currently `/assets/og.svg`, raster fallback when belt CLI is set up).
- **Meta descriptions**: 155-160 chars, keyword-leading, on every page.
- **Comparison pages**: `/vs/cursor`, `/vs/claude-code`, `/vs/zapier` capture mid-funnel buyers searching "X alternative."
- **Recipes gallery**: `/recipes` with 8 deep-link cards. Programmatic SEO surface (each recipe is its own indexable URL eventually).
- **Changelog**: `/changelog` shows ship cadence, anchor for "what's new in [tool]" queries.

What's not done yet (low effort to fix):
- No raster OG image (Twitter/Facebook prefer PNG over SVG; current SVG works on most modern crawlers but not all)
- No `<article>` schema on the blog post (would unlock article rich results)
- No HowTo schema on `/docs` quickstart
- No image alt text audit yet
- No backlinks (will come from launch)

## Article queue, in priority order

Each is scoped for a 1,200-2,200-word post. Title + meta written for click-through. Use the existing brand voice (no em-dashes, no AI cliches, no "Brock Pivec" attribution on public surfaces).

### 1. "How to run multiple AI agents in parallel from one prompt"
- **Target keyword**: `run multiple ai agents in parallel` (hard, ~1.2k searches/mo, growing)
- **Intent**: how-to. People searching this are already sold on the concept, looking for a tool.
- **Outline**:
  1. The problem: tab-switching between Claude, ChatGPT, Cursor.
  2. Three patterns (broadcast, supervisor, custom), 2 paragraphs each.
  3. Live walkthrough using brocco's Broadcast mode.
  4. When NOT to use parallel agents (when ordering matters).
  5. Code/screenshots showing 3 panes streaming.
  6. Closing CTA: "Try it free at brocco.ai/app".
- **Internal links**: `/app/`, `/recipes`, `/vs/cursor`.
- **Schema**: `BlogPosting` + `HowTo`.
- **Slug**: `/blog/run-multiple-ai-agents-parallel-one-prompt`.

### 2. "BYOK for AI agents: how it works and why it matters"
- **Target keyword**: `byok ai agents` (medium, ~600 searches/mo, brand-adjacent)
- **Intent**: educational. Captures readers researching key-management and privacy.
- **Outline**:
  1. The privacy problem with hosted AI tools.
  2. What BYOK actually means (browser localStorage, direct API calls, zero retention).
  3. Three failure modes (free tier abuse, BOM bugs, key rotation).
  4. Setting up brocco BYOK in 30 seconds.
  5. Cost math: typical BYOK monthly spend at 100 runs/day on Sonnet.
  6. Closing: "Try BYOK free at brocco.ai/app".
- **Internal links**: `/app/`, `/security`, `/privacy`.
- **Slug**: `/blog/byok-ai-agents-explained`.

### 3. "Claude Desktop MCP servers: 10 tools every builder should install"
- **Target keyword**: `claude desktop mcp servers` (~2k/mo, exploding)
- **Intent**: list-style. Highest-volume keyword for new MCP ecosystem.
- **Outline**:
  1. Quick MCP primer (1-2 paragraphs).
  2. The 10 MCP servers, one paragraph each. Include real ones (filesystem, GitHub, Brave search, Postgres) plus brocco prominently.
  3. Setup snippet for each.
  4. How to combine them ("use brocco_researcher to read GitHub issues via the GitHub MCP server").
  5. Closing: "Install brocco's MCP server: brocco.ai/download#mcp".
- **Internal links**: `/download`, `/docs`, `/api/v1/agents`.
- **Slug**: `/blog/claude-desktop-mcp-servers-2026`.
- **Note**: this is the highest-leverage piece. Aim for 1,800 words, dense.

### 4. "Cursor pricing in 2026: full breakdown vs alternatives"
- **Target keyword**: `cursor pricing` (~6k/mo, very high commercial intent)
- **Intent**: comparison. People searching this are mid-funnel.
- **Outline**:
  1. Cursor's 2026 pricing ladder (Hobby $0, Pro $20, Pro+ $60, Ultra $200).
  2. What you get at each tier (real numbers).
  3. The credit-burn problem (Pro+ users hitting walls).
  4. Three alternatives at each tier (brocco for parallel, Windsurf for IDE, Claude Code for terminal).
  5. Decision tree: "if you mostly do X, pick Y."
  6. Closing: "If you're tab-switching, try brocco /vs/cursor".
- **Internal links**: `/vs/cursor`, `/#pricing`, `/app/`.
- **Slug**: `/blog/cursor-pricing-2026-breakdown`.

### 5. "How to build a multi-agent workflow without writing code"
- **Target keyword**: `multi agent workflow no code` (~800/mo, founder/ops searching for tools)
- **Intent**: how-to with strong commercial signal.
- **Outline**:
  1. The four parts of any multi-agent workflow (input, agents, tools, output).
  2. Pick agents from a library (brocco has 9; show them).
  3. Wire tools (Stripe, Slack, Postgres, custom HTTP).
  4. Trigger via webhook or cron.
  5. Concrete recipe: "qualify yesterday's signups + draft outreach + post to Slack."
  6. Closing CTA.
- **Internal links**: `/recipes`, `/app/`, `/docs`.
- **Slug**: `/blog/multi-agent-workflow-no-code`.

### 6. "Ollama vs Anthropic for agents: when to use which"
- **Target keyword**: `ollama vs anthropic` (~400/mo, growing as local LLM scene grows)
- **Intent**: comparison.
- **Outline**:
  1. The tradeoff: latency vs cost vs privacy vs capability.
  2. Where Ollama wins (privacy, $0 marginal cost, no internet).
  3. Where Anthropic wins (Claude Sonnet/Opus quality on complex agent loops).
  4. The hybrid pattern: Ollama for cheap classification, Claude for synthesis.
  5. brocco's multi-provider switch makes this trivial.
  6. Setup snippet for both providers in brocco's BYOK panel.
- **Internal links**: `/app/`, `/blog/byok-ai-agents-explained`.
- **Slug**: `/blog/ollama-vs-anthropic-agents`.

### 7. "Brocco Recipe: launch day kit for solo founders"
- **Target keyword**: `solo founder launch checklist` (~2k/mo, indie hacker audience)
- **Intent**: long-tail recipe content.
- **Outline**:
  1. The 14-day launch sequence (taken from `marketing/launch-day.md`).
  2. Which agents to spawn for each step.
  3. Live demo: type the goal, watch 3 agents fan out (broadcast mode).
  4. The actual outputs (3 tweets, 1 HN post, 4 reddit drafts, PH checklist).
  5. Closing: "Run the recipe yourself: brocco.ai/app#recipe=launch-day".
- **Internal links**: `/app/#recipe=launch-day`, `/recipes`, `/marketing/this-week.md` (or write a public version).
- **Slug**: `/blog/solo-founder-launch-day-recipe`.

### 8. "Why your Zapier zaps keep breaking (and what reasoning agents fix)"
- **Target keyword**: `zapier alternative ai` (~1.5k/mo, switching intent)
- **Intent**: switching. Capture "zapier broke again" frustration.
- **Outline**:
  1. The deterministic-step trap.
  2. Three concrete cases where zaps break (input shape change, partial response, edge case).
  3. How a reasoning agent handles each (it reads the data, decides, retries).
  4. When Zapier is still right (high-volume + zero decisions).
  5. Migration pattern: keep Zapier triggers, route to brocco agent for judgement.
  6. Closing: "Try the agent that reasons: brocco.ai/vs/zapier".
- **Internal links**: `/vs/zapier`, `/recipes`, `/app/`.
- **Slug**: `/blog/zapier-alternative-reasoning-agents`.

### 9. "Stripe Checkout in Vercel Edge: lessons from a 1-day SaaS launch"
- **Target keyword**: `stripe checkout vercel edge` (~300/mo but highly developer-targeted)
- **Intent**: dev-focused; positions brocco as "shipped fast, here's how".
- **Outline**:
  1. The constraint: ship a paid SaaS in one day.
  2. Stripe Hosted Checkout (vs Embedded vs Elements).
  3. The Edge runtime gotchas: `constructEventAsync` not `constructEvent`, `req.text()` not `req.json()`.
  4. The actual code (paste from `api/checkout.ts`, `api/stripe-webhook.ts`).
  5. The BOM-in-secrets bug we hit (war story).
  6. Closing: "Source: github.com/brocco-ai/charter".
- **Internal links**: `/changelog`, `/docs`.
- **Slug**: `/blog/stripe-checkout-vercel-edge-lessons`.

### 10. "Brocco docs: REST API quickstart"
- **Target keyword**: `agentic ai api` (~900/mo, dev-targeted)
- **Intent**: documentation, ranks for "X api" queries, also serves real users.
- **Format**: docs page (not blog), at `/docs/api`. Update sitemap.
- **Outline**:
  1. Auth (Bearer with brocco key OR sk-ant- BYOK pass-through).
  2. POST /api/v1/run example (curl + node + python).
  3. Response event schema (run_started, step_start, tool_call, tool_result, etc).
  4. GET /api/v1/agents.
  5. Rate limits, error codes.
  6. ChatGPT custom GPT example using the API.

## Linking strategy

**Hub-and-spoke pattern.**
- Hubs: `/`, `/app/`, `/download`, `/blog/agentic-ai-platforms-2026`.
- Spokes: every new article links UP to at least 2 hubs in the body, plus DOWN to 1-2 sibling articles in a related-posts block at the end.
- Anchor text: include the target keyword for the destination at least once.
- Don't over-optimize: aim for 60% exact-match, 40% generic / partial-match anchors.

## Distribution path

For each article, after publish:
1. **Tweet** with the post URL + a 1-image teaser (use the OG image).
2. **Indie Hackers** post if it's a "build" angle (#3, #5, #7, #9 fit).
3. **r/ChatGPTCoding / r/AI_Agents** if it's a how-to (#1, #2, #5).
4. **HN Show** only for #3 (MCP servers) and #9 (Stripe lessons). Don't burn HN goodwill on every post.
5. **Newsletter pitches**: TLDR AI loves #2, Smol AI News loves #6, Latent Space loves #3.

## Tracking

Set up Plausible or Vercel Analytics. Track:
- Visits per article per week
- Time on page (>2 min = good)
- Bounce rate (<60% = good)
- Conversions (clicks to /app/ or signups) per article
- Position in Google Search Console for target keyword (after 4-6 weeks)

Goal: by week 8, top 3 articles ranking page-1 for their target keywords.

## Cadence

Ship 1 article per week, every Tuesday at 9 AM PT. Don't break the cadence. The compounding only kicks in around month 3.
