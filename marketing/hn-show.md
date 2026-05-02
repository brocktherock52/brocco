# Show HN draft

## Title (80 char max)
`Show HN: Brocco, an agentic desktop for builders (multi-agent, BYOK)`

## URL
https://brocco.ai

## Text (first comment, sets the conversation)

Hi HN. I'm Brock, solo. I built brocco because I kept hitting the same wall in
Cursor and Claude Code: they're great at one task at a time, but the work I do
involves 3-5 things in parallel (research a competitor, draft outreach, fix a
bug, plan a launch). Tabbing between 5 agent sessions felt dumb.

Brocco is a browser-first multi-agent dashboard. Pick N agents, type one prompt,
hit Broadcast, and each agent runs in its own pane in parallel. Or use
Supervisor mode, where one agent decomposes your goal and spawns sub-agents
that you can watch live.

Stack:
- Vanilla JS + custom WebGL hero (no frameworks, ~25 KB JS for the dashboard)
- BYOK: your Anthropic key stays in localStorage, calls go direct to api.anthropic.com
- Vercel Edge functions for the proxy + Stripe + recorded-demo SSE
- 6 built-in agent specs (researcher, analyst, coder, outreach, supervisor, planner)
- Tools: search_web (Tavily), http_get (server-side proxied to dodge CORS),
  memory_get/put (localStorage namespaced per agent), file_save (browser
  download), delegate (spawn sub-agent)

Tradeoffs I made:
- BYOK over hosted: zero server cost on inference, you own your data, but it's
  a worse onboarding experience than "sign up and click run"
- Browser over native: install as PWA in one click, runs anywhere, but no real
  shell access; coder agent can plan but not execute
- Vanilla over React: faster to ship, smaller bundle, but the codebase will
  show stress at >5 panes if you don't manage memory

Free forever for BYOK. Paid tiers (Solo $49, Team $199) cover tokens for users
who don't want to manage their own keys; those use Stripe Checkout
(implementation pasted in the repo for anyone curious).

Honest weaknesses:
- The supervisor mode is the most conceptually interesting but the most
  finicky in practice. delegate() spawns sub-agents that the parent can't
  re-coordinate with mid-flight. That's a known limitation, not a bug.
- No real-time SSE yet; each turn buffers until Anthropic's response is
  complete. Streaming is the next ship.
- No auth or DB. BYOK is the auth substitute. If you want shared state across
  devices it's not there yet.

Would love feedback, especially on:
- Multi-pane UX patterns from people who've shipped tools like this
- Better failure modes when one agent in a broadcast crashes
- What recipes you'd want to see in the public gallery

Source for the runtime is in the repo (Apache-2). Hosted at https://brocco.ai.

## How to engage in thread
- Agree with every legitimate critique
- Don't respond to trolls, just upvote thoughtful counter-arguments
- Drop technical details when asked: prompt caching ratio, average step count,
  latency per turn, how delegate handles errors
- If someone asks about a competitor: be honest, name the ones brocco doesn't
  beat (Cursor for IDE-bound work, Claude Code for terminal-only tasks)
