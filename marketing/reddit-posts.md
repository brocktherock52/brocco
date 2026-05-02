# Reddit launch posts

## r/LocalLLaMA (technical, ~890k members)

**Title:** I built a multi-agent desktop that runs Claude / GPT / local Llama behind one runner. Architecture writeup.

**Body:**
After 9 months of side-project nights I shipped brocco.ai, a browser-first
multi-agent dashboard. Wanted to share the architecture in case it's useful
for anyone building similar.

Stack:
- Each "pane" is an independent agent loop with its own system prompt and
  tool list. Specs are markdown with YAML frontmatter, drag a card from the
  library = spawn a pane.
- All Anthropic / OpenAI / local-OpenAI-compatible calls happen browser-side
  via fetch. Anthropic's `dangerous-direct-browser-access` header lets you
  skip the server proxy. Cuts your cost to zero.
- Tools execute in browser too. search_web hits Tavily directly. http_get
  goes through a thin Vercel Edge proxy because most sites don't ship CORS.
  memory_get/put writes to localStorage namespaced per agent. file_save
  triggers a browser download.
- Prompt caching is on by default: cache_control on system block + the last
  tool definition. Cuts repeated-workflow cost ~80%.
- No SDK dep. Raw fetch + JSON. ~25 KB total JS.

Modes:
- Single: one agent, one prompt
- Broadcast: same prompt fans out to N selected agents in parallel panes
- Supervisor: one agent decomposes the goal and uses delegate() to spawn
  sub-agents

For local models, point CHARTER_DEFAULT_MODEL or use BYOK with an
OpenAI-compatible endpoint URL (Ollama, vLLM, llama.cpp serve).

Free at brocco.ai (BYOK, 100 runs/mo). Paid tiers exist for hosted-key
users.

Open to roasting on the architecture, particularly:
- Single-page state management without a framework (it's vanilla JS plus a
  thin pub-sub)
- How to handle the case where one agent in a broadcast hangs
- Local-model UX: should I auto-discover Ollama on localhost?

---

## r/SideProject (founder story, ~250k)

**Title:** I quit pivoting and finally shipped: brocco.ai (multi-agent AI desktop)

**Body:**
Quick founder story for fellow side-project lifers.

I have a graveyard of half-finished projects. Wholesaling AI, a content
pipeline, a Polymarket bot, a Series 7 prep funnel. None shipped to a paying
customer last quarter.

Two weeks ago I noticed I had spent more time switching between Cursor /
Claude Code / ChatGPT / a custom researcher than actually using them. So I
built the multi-pane dashboard I wanted.

brocco.ai lets you run N agents in parallel from one prompt. Pick research +
outreach + coder, type "plan a launch for X", hit Run, watch all three work
at once.

What I learned:
- Scope discipline beats skill. I shipped this in 8 days because I refused
  to add auth, a database, or a custom backend. BYOK + browser localStorage
  did the job.
- Picking a recognizable mark matters. The crocodile is not subtle.
- Free tier with hard limits beats free trial. Cursor proved this; I copied.

Free at brocco.ai. Pricing $49 / $199 with Stripe. Goal: 100 paying users
this week.

Anyone else here ship something multi-agent? What broke first for you?

---

## r/AI_Agents (recipe-led, ~140k)

**Title:** Brocco recipes: 4 multi-agent workflows you can run in 30 seconds (free, BYOK)

**Body:**
I built a browser app where each "recipe" is a one-click multi-agent run.
Sharing the 4 that ship by default.

1. **Market research** (3 agents in parallel)
   - researcher: surveys 5 competitors
   - analyst: extracts pricing + positioning into a table
   - planner: turns it into a 6-step roadmap

2. **Launch day** (3 agents in parallel)
   - outreach: drafts 3 launch tweets
   - researcher: finds best subreddits to post in
   - planner: produces a day-by-day execution plan

3. **Customer deep dive** (1 supervisor + delegated sub-agents)
   - supervisor reads an email, decomposes the goal
   - spawns researcher to look up the lead
   - spawns outreach to draft 3 opener variants

4. **Content sprint** (2 agents in parallel)
   - researcher: gathers the latest in a topic
   - analyst: distills into 5 short-form posts

All use Claude (BYOK, your tokens). Brocco runs in your browser, agents call
Anthropic directly, your API key never touches our servers.

brocco.ai/app

What other recipes would be useful? I'll build the top voted ones this week.

---

## r/ChatGPTCoding (honest comparison, ~280k)

**Title:** Brocco vs Cursor for parallel agent work, an honest take after 200 runs

**Body:**
Used Cursor heavily for 6 months. Built brocco as the thing I wished it was
for non-IDE work. Honest comparison after dogfooding both this week:

| | Cursor | Brocco |
|---|---|---|
| In-IDE coding | Wins easily | Not the use case |
| Multi-agent parallel | Limited (Cmd+T tabs) | Native (broadcast mode) |
| BYOK transparency | Hidden | First-class, in header |
| Cost meter | Buried in settings | Live in header per session |
| Tools beyond code | None native | search, http, memory, file |
| Free tier | 50 requests | 100 runs (BYOK = your tokens) |
| Lock-in | High (forked VSCode) | Zero (browser, leave anytime) |

When to use which:
- Cursor: anything inside a codebase
- Brocco: research, outreach, planning, multi-step ops, anything that needs
  >1 agent in parallel

Both run on Claude. Brocco doesn't try to replace Cursor; it covers what
Cursor doesn't.

brocco.ai is free. Curious what others use for non-coding agentic work.
