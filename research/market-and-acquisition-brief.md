# brocco · market + acquisition diligence brief

> Companion to `path-to-1000-users.md`, `v3-acquisition-spec.md`,
> `30-day-launch-playbook.md`, `meta-ugc-ads.md`.
> Date: 2026-05-05. Source-verified per-claim.
> Method: parallel WebFetch on a16z, Madrona, McKinsey, Gartner, Anthropic,
> Vercel, Atlassian IR pages, TechCrunch / CNBC / Bloomberg coverage,
> Sacra, Latka, Crunchbase, Insight Partners, CB Insights, ChartMogul,
> Software Equity Group, Heavybit, Acquire.com, YC corp-dev guides.

---

## 1. market sizing (TAM / SAM / current state)

**Headline numbers**
- AI orchestration platform market: **$13.56B in 2026 → $82.15B by 2035** ([Precedence Research](https://www.precedenceresearch.com/ai-orchestration-platform-market)). Second forecaster: $13.99B → $60.34B by 2034 at 20.05% CAGR ([Fortune Business Insights](https://www.fortunebusinessinsights.com/ai-orchestration-market-107177)).
- AI agent orchestration software (closest to brocco): **$26.3B by 2034 at 18.8% CAGR** (IntelEvoResearch).
- Autonomous AI agent market: **$8.5B in 2026 → $35B by 2030** (Research and Markets).
- McKinsey: AI agents could add **$2.6T-$4.4T annually** across business use cases.
- Gartner: **40% of enterprise apps will include task-specific AI agents by end of 2026** (up from <5% in 2025); agentic AI projected to drive ~30% of enterprise app software revenue by 2035, surpassing $450B ([Gartner](https://www.gartner.com/en/newsroom/press-releases/2025-08-26-gartner-predicts-40-percent-of-enterprise-apps-will-feature-task-specific-ai-agents-by-2026-up-from-less-than-5-percent-in-2025)).

**Current-state proof points**
- **Anthropic**: ~$9B run rate end-2025 → ~$19B by March 2026 → $30B by April 2026 (Anthropic / Madrona).
- **Cursor (Anysphere)**: $100M ARR Jan 2025 → $500M Jun 2025 → $1B Nov 2025 → $2B Feb 2026; xAI option to acquire at **$60B** ([CNBC](https://www.cnbc.com/2025/11/13/cursor-ai-startup-funding-round-valuation.html)).
- **n8n**: $40M ARR, **$2.5B valuation**, ~58x revenue multiple ([Sacra](https://sacra.com/c/n8n/)).
- **Replit**: $2.8M → $150M ARR in 9 months of 2025; **$9B valuation March 2026** ([TechCrunch](https://techcrunch.com/2026/03/11/replit-snags-9b-valuation-6-months-after-hitting-3b/)).

**Three most-cited tailwinds**
1. **MCP adoption.** 78% of enterprise AI teams report at least one MCP-backed agent in production by April 2026; MCP server registry grew 1,200 (Q1 2025) → 9,400+ (April 2026); 97M monthly SDK downloads ([digitalapplied.com](https://www.digitalapplied.com/blog/mcp-adoption-statistics-2026-model-context-protocol)).
2. **Token-price collapse.** Claude Haiku 4.5 at $1 input / $5 output per 1M tokens; Batch API at 50% off enables agentic workflows previously uneconomic ([Anthropic API Docs](https://docs.anthropic.com/)).
3. **Coding-agent pull-through.** Cursor at 64% of Fortune 500; ~360K paying customers (Cursor enterprise page).

**SAM**: brocco's serviceable slice = the multi-agent orchestration market that targets mid-market BYOK-conscious teams. Realistically a **$1B-$3B 2026 SOM**.

---

## 2. recent acquisitions in agentic / dev-tool AI (2024-2026)

| # | Acquirer | Target | Disclosed Price | Structure | Stated Rationale |
|---|---|---|---|---|---|
| 1 | Cognition | Windsurf (residual) | ~$250M (TC sources, undisclosed) | Cash + stock; 100% employee participation, accelerated vesting | Acquire IP + brand + $82M ARR enterprise IDE post-Google CEO poach ([Cognition](https://cognition.ai/blog/windsurf), [TechCrunch](https://techcrunch.com/2025/07/14/cognition-maker-of-the-ai-coding-agent-devin-acquires-windsurf/)) |
| 2 | Google | Windsurf (CEO + key talent) | $2.4B licensing | Licensing, not acquisition; CEO + IP rights | Bring agentic IDE talent in-house pre-Cognition deal ([CNBC](https://www.cnbc.com/2025/07/14/cognition-to-buy-ai-startup-windsurf-days-after-google-poached-ceo.html)) |
| 3 | OpenAI | Windsurf (proposed) | $3B, deal collapsed | Cash; exclusivity expired Jul 11, 2025 | Coding-agent surface area ([Bloomberg](https://www.bloomberg.com/news/articles/2025-05-06/openai-reaches-agreement-to-buy-startup-windsurf-for-3-billion)) |
| 4 | OpenAI | Statsig | $1.1B all-stock | Stock + Statsig CEO joins as Apps exec | Feature-flagging / experimentation infra ([CNBC](https://www.cnbc.com/2025/09/02/openai-buys-statsig-for-1point1-billion-hires-ceo-as-applications-exec.html)) |
| 5 | OpenAI | Multi.app (Remotion) | Undisclosed | Acquihire; product shutdown Jul 2024 | Collaboration / screen-sharing UX team |
| 6 | OpenAI | Hiro Finance | Undisclosed | Acquihire ~10 people (April 2026) | Finance vertical talent ([TechCrunch](https://techcrunch.com/2026/04/13/openai-has-bought-ai-personal-finance-startup-hiro/)) |
| 7 | OpenAI | IO Products | $6.5B | Stock | Hardware ambition (Jony Ive team) |
| 8 | Microsoft | Inflection AI | $650M ($620M license + $33M waiver) | Cash license + acquihire; Suleyman 10-yr vest | Consumer-AI talent (CEO of Microsoft AI); CMA designated as merger ([DeepLearning.ai](https://www.deeplearning.ai/the-batch/microsoft-pays-inflection-ai-650-million-hires-most-of-its-staff/)) |
| 9 | Amazon | Adept AI | Undisclosed (FTC scrutiny) | Tech license + founder acquihire; ~20 employees stayed | Agentic AI talent for AGI team ([TechCrunch](https://techcrunch.com/2024/06/28/amazon-hires-founders-away-from-ai-startup-adept/)) |
| 10 | Anthropic | Bun (Oven) | Undisclosed | Cash/stock; team integration | Performance/stability for Claude Code (Dec 2025) ([Anthropic](https://www.anthropic.com/news/anthropic-acquires-bun-as-claude-code-reaches-usd1b-milestone)) |
| 11 | Anthropic | Coefficient Bio | Undisclosed | Cash | Biotech / drug discovery vertical (April 2026) |
| 12 | Vercel | Tremor | Undisclosed (small) | Acquihire of cofounders into Design Engineering; OSS components | Dashboard component library powering v0 ([Vercel Blog](https://vercel.com/blog/vercel-acquires-tremor)) |
| 13 | Vercel | NuxtLabs | Undisclosed | Acquihire (Anthony Fu, Atinux, Daniel Roe); MIT-license preservation | Universal frontend platform; Vue/Nuxt + Nitro ([Vercel Blog](https://vercel.com/blog/nuxtlabs-joins-vercel)) |
| 14 | Salesforce | Informatica | ~$8B | Cash | Data management for Agentforce ([CXToday](https://www.cxtoday.com/ai-automation-in-cx/salesforce-agentforce-acquisitions-2025-2026/)) |
| 15 | Salesforce | Momentum, Cimulate, Spindle AI, Qualified | Undisclosed | Tuck-ins | Conversational intel, agentic commerce, analytics, agentic marketing for Agentforce |
| 16 | ServiceNow | Moveworks | $2.85B | Cash; closed Dec 15, 2025 | Front-end AI assistant + enterprise search; 250 mutual customers ([ServiceNow](https://newsroom.servicenow.com/press-releases/details/2025/ServiceNow-completes-acquisition-of-Moveworks/default.aspx)) |
| 17 | Atlassian | The Browser Company; DX | Undisclosed (FY26 disclosure) | Cash | Browser-native agentic surface; DevEx instrumentation |
| 18 | HubSpot | Clearbit | Undisclosed (closed Dec 2023) | Cash | Data enrichment for Agentic Customer Platform; powers Breeze Intelligence ([HubSpot IR](https://ir.hubspot.com/news-releases/news-release-details/hubspot-completes-acquisition-b2b-intelligence-leader-clearbit)) |
| 19 | Notion | Skiff | Undisclosed | Cash + acquihire; Skiff sunset | Encrypted productivity → Notion Mail, Notion Drive ([TechCrunch](https://techcrunch.com/2024/02/09/notion-acquires-privacy-focused-productivity-platform-skiff/)) |

CB Insights Q1 2026: **266 AI M&A deals, +90% YoY** ([Heavybit](https://www.heavybit.com/library/article/the-acqui-hire-is-no-longer-a-distress-sale)).

**Pattern**: dominant 2024-2026 structure is **licensing-plus-acquihire** (MS/Inflection, Amazon/Adept, Google/Windsurf) that sidesteps merger review. Pure equity deals concentrate at $1B+ (Statsig, Moveworks, Informatica) or stay <$50M and undisclosed (Tremor, NuxtLabs, Skiff).

---

## 3. strategic acquirer profiles (12-18 month outlook)

| Acquirer | Track record | Likely buys (12-18 mo) | Price band | brocco fit |
|---|---|---|---:|---|
| **Anthropic** ($380B post-money, possibly $900B at next round) | Bun (Dec 2025), Coefficient Bio (Apr 2026) | Claude-Code-adjacent dev tooling, vertical-data plays | $10M-$100M tuck-ins + 1× $1B-$3B vertical bet | **Low** unless brocco doubles as Claude Code distribution channel |
| **Vercel** ($9.3B Series F, $340M ARR Feb 2026) | Tremor, NuxtLabs, Splitbee, Turborepo | OSS-author teams folding into v0 / AI Cloud | $5M-$50M, 100% talent + IP | **High** if framed as "v0 for agents" |
| **OpenAI** | Statsig ($1.1B), Multi.app, Hiro Finance, IO Products ($6.5B), Rockset, Windsurf (failed) | High-end strategic ($1B+) for revenue-bearing infra; small acquihires for talent | $5M-$1B+ | **Low** — passes on multi-model BYOK (competes with their direct API) |
| **Replit** ($9B valuation, $1B ARR target) | Modulz, agent infra teams | Deployment/infra, vertical agent templates | $5M-$30M acquihires (cash-constrained vs hyperscalers) | **Medium** if positioned as "Replit for non-coders" |
| **Salesforce** (Agentforce push) | Informatica ($8B), Moveworks-adjacent buys, Momentum, Cimulate, Spindle AI, Qualified — 10 deals in 6 months | Data + conversational intel + vertical agents for Agentforce | $50M-$8B | **Low** unless wedged as "Agentforce-adjacent for SMB" |
| **Microsoft** (Copilot Studio gaps documented: weak Excel/PowerPoint, MS-only, data-residency limits) | Inflection ($650M licensing) | Cross-ecosystem agent runtimes (Google Workspace bridges), governance/audit, Excel-native AI | $100M-$1B+ via licensing acquihires | **Medium** if Excel-native or governance-first |
| **HubSpot** ($1B+ ARR; "Agentic Customer Platform" pivot) | Clearbit | Agentic email/CRM automation between marketing + service hubs | $50M-$500M | **Medium** if positioned as SMB workflow agent |
| **Atlassian** (Rovo at 5M MAU) | Browser Company + DX in FY26; heavy MCP investment | MCP-deep workflow agents | $50M-$500M + occasional $1B+ | **Low** without Atlassian-product integration depth |
| **Notion** (90% retention, 40%+ ARR growth) | Cron, Skiff | Small-team feature buys | $5M-$50M | **Medium** if surfaces as Notion AI extension |
| **ServiceNow** | Moveworks ($2.85B) | $1B+ strategic platform plays | $500M-$3B | **Low** unless enterprise-IT-positioned |

**Realistic acquirers for brocco at $5M-$50M code-only state**: **Vercel, Replit, Notion, Lindy, n8n, Cognition.** Most likely path is acquihire by a Series B/C agentic-AI company that wants the multi-agent UX work, not the brand.

---

## 4. competitor product analysis (white-space gaps)

| Competitor | ARR / Val | Surface | Moat |
|---|---|---|---|
| **Cursor** | $2B ARR / $29.3B val (Nov 2025); 360K paying users; 64% F500 | VS Code fork + agent/ask/edit + MCP first-class + multi-model router (Claude/GPT/Gemini/DeepSeek) + enterprise SSO/SCIM + Security Reviewer | distribution + IDE switching cost |
| **Devin (Cognition)** | $10.2B val post-Windsurf | Autonomous engineer; Devin 2.0 dropped to **$20/mo** from $500; Interactive Planning, Devin Search, Devin Wiki, ACU billing | brand + Windsurf IDE |
| **Lindy** | ~$5M revenue Oct 2024; ~10x trajectory 2025 | Chat-first agent builder; email mgmt; voice agents (Gaia $0.19/min); 4,000+ integrations; Lindy Build | chat UX + email depth |
| **Replit Agent** | $150M ARR / $9B val | Vibe-coding to deployed apps; integrated stack | hosted runtime + zero-setup distribution |
| **CrewAI** | $3.2M revenue 2025; 45,900+ GH stars; 12M daily executions | OSS framework; MCP/A2A native; role-based metaphor | prototype-in-a-day; weak observability |
| **LangGraph** | OSS via LangChain | Explicit state graph, checkpointing, human-in-loop, deepest production tooling via LangSmith | depth, but 10-14 day learning curve |
| **n8n** | $40M ARR / $2.5B val | OSS-core fair-source; visual workflows; AI agents native; self-hostable | OSS license + EU data residency |
| **Relevance AI** | $2.9M revenue 2024 | $0/$19/$234/mo split; vendor-credit pricing; agent marketplace | marketplace |
| **Stack AI** | $16.6M raised | Enterprise-only; HIPAA/SOC2/GDPR; Salesforce/HubSpot/ServiceNow integrations | regulated-industry compliance |
| **Make.com** | n/a | Visual canvas + AI agents + Claude 3.5 Sonnet native; ~30-50% Zapier cost | cost-per-operation |
| **Zapier** | n/a | $19.99 entry; Zapier Agents GA 2025; MCP support | integration breadth + brand |

**White-space gaps brocco can credibly own:**
1. **BYOK transparency.** No major competitor leads on per-call cost visibility + multi-provider key vault. JetBrains/Warp added BYOK in late 2025 but as feature, not positioning.
2. **Multi-agent UX for non-developers.** Lindy chat-first, Cursor IDE-first, n8n flow-first. There is no canonical **dashboard pattern** (single pane, parallel agent monitoring, cost-attributed) that a builder PM can use without writing code.
3. **Cost-attribution for agent runs.** Devin's ACU is opaque. Cursor pricing is per-seat. **Token-level cost-per-task with per-agent budget caps remains underbuilt.**
4. **OSS / self-hostable Claude-native pattern.** n8n owns OSS but is provider-agnostic. A **Claude-optimized BYOK self-hostable dashboard** is empty space.

The **builder-dashboard surface for ops/PM users** is still up for grabs.

---

## 5. acquisition diligence checklist ($5M-$50M)

What a Vercel- or Anthropic-style corp-dev process actually examines (sources: [YC Series A diligence](https://www.ycombinator.com/library/3h-series-a-diligence-checklist), [Acquire.com playbook](https://blog.acquire.com/acquisition-due-diligence-checklist-2/), [Sphere technical DD](https://www.sphereinc.com/blogs/technical-due-diligence-checklist-startup/), [Heavybit acquihire piece](https://www.heavybit.com/library/article/the-acqui-hire-is-no-longer-a-distress-sale)):

1. **Code quality + tech stack** (week 1) — repo age, commit frequency, test coverage, CI green-rate, dependency hygiene, secrets-in-history scan, license audit (no GPL viral). $5M-$50M deal: 1-2 day technical read by a staff engineer; clean monorepo, modern stack (TS + Postgres + Vercel/Next or equivalent), no "magic glue."
2. **Team** — founder coachability, key-person risk, equity/vest schedule, retention plans. Acquihires require 100% of named-key engineers to commit + accept new vest cliffs. Cognition/Windsurf waived cliffs and accelerated vesting for 100% of employees → that is the new market norm.
3. **IP + patents** — assignment of all IP from contractors, no joint-IP issues with prior employer, OSS license cleanliness (no AGPL contamination of proprietary code), trademark filed.
4. **Revenue + retention math** — at $5M-$50M, retention often matters more than absolute ARR. Public benchmarks ([Software Equity Group](https://softwareequity.com/blog/net-retention-public-saas-companies/)): <90% NRR → 1.2× revenue multiple; 100-110% NRR → 6.0×; 120%+ NRR → 11.7×.
5. **User concentration** — no customer >20% of ARR. For brocco at $0 ARR: design-partner pipeline quality + weekly-active beta cohort.
6. **Litigation / OSS license cleanliness** — pending suits, IP claims from prior employers, contractor disputes, GDPR/CCPA exposure, license-scanner output (Black Duck or equivalent) attached to deal data room.
7. **Strategic fit** — why this team specifically, integration plan in 6/12/18 months, what acquirer's customer base gets day one. Vercel-style acquihires (Tremor, NuxtLabs) are explicitly framed around "team continues OSS work, product folds into v0/AI Cloud" — that narrative IS the rationale.

For a code-complete pre-revenue tool like brocco, the **realistic exit at $5M-$25M** is structured as:
> **IP buyout + 2-4 founder/lead-eng acquihire + 2-4 year vest, possibly with a small earnout tied to integration milestones.**

Above $25M the buyer will require ARR or a hard distribution thesis (e.g., installed users a strategic acquirer wants).

---

## what this means for brocco — 7 actionable conclusions

1. **Pick a wedge by June.** "Multi-agent dashboard with BYOK Claude" is too horizontal. Choose one of:
   - (a) builder-dashboard for ops/PM users replacing Zapier-with-AI
   - (b) cost-attribution layer for agent runs (untouched space)
   - (c) self-hostable OSS Claude-native n8n alternative
   Each maps to a different acquirer. Without a wedge, brocco is invisible at $0 ARR.

2. **Get to 10 paying design partners or 1,000 weekly-active GitHub stars before pitching corp-dev.** Acquihire deals at $5M-$25M evaluate team + traction signal, not ARR. Tremor and NuxtLabs were closed on team + OSS reputation, not revenue.

3. **Lean into BYOK as positioning, not feature.** No major competitor positions on it. Build a transparent token-cost dashboard, per-agent budget caps, multi-provider router. 3-month project that creates a defensible "the only honest AI dashboard" line and is exactly what a Vercel or Cloudflare acquirer would value.

4. **Ship MCP server + native MCP client UI in next sprint.** 78% of enterprise AI teams report MCP-backed agents in production; 9,400+ MCP servers in registry. MCP-first is table stakes by Q3 2026 and the cheapest way to land in MCP-related corp-dev conversations at Cursor, Cognition, Atlassian, Anthropic.

5. **Default acquirer-target list of 6 names, not 20.** **Vercel, Replit, Notion, n8n, Cognition, Lindy.** Each is sub-$15B, has done acquihires in 2024-2026, has a stack-gap brocco can map onto. Skip Anthropic, OpenAI, Microsoft, Salesforce — they buy at $1B+ or for vertical data.

6. **Build the data room now.** Clean repo, license scanner output, contractor IP-assignment paperwork, design-partner letters of intent, weekly-active dashboard. Diligence at $5M-$25M is 3-4 weeks; clean data room compresses that to 2 — which raises close probability when a buyer's calendar is tight.

7. **Aim for a structured acquihire conversation in Q4 2026, not 2027.** Q1 2026 AI M&A pace (266 deals, +90% YoY) is unsustainable; rate-cut cycle and IPO window will redirect strategic dollars. Acquihire window for $5M-$25M code-only deals is widest in 2026.

---

## verification flags (be honest about what's not 100% solid)

- Cognition/Windsurf $250M figure is "TechCrunch sources, undisclosed" — not authoritative.
- Anthropic acquisition list may be incomplete pre-2025; only Bun (Dec 2025) and Coefficient Bio (Apr 2026) confirmed in search.
- Stripe AI Index dollar-spend per token figure not directly stated; macro figure (46% GDP growth from compute demand) reported by Stripe but should be verified against the primary annual letter before any external citation.
- Microsoft Copilot weakness commentary is from secondary sources; primary Microsoft documentation does not characterize these as "gaps."

---

Quarterly refresh required: market sizing + acquisition prices both move fast in 2026.
