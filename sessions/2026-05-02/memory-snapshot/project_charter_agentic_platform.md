---
name: Charter agentic platform shipped 2026-05-02
description: Charter — Claude-native agent runtime + tool registry + multi-agent orchestrator + FastAPI/SSE UI, lives at projects/bdp-consulting/arms/agentic_platform/, smoke-tested end-to-end.
type: project
originSessionId: 7c5add35-ed63-4280-a3e9-3a80fca2b792
---
Shipped 2026-05-02 as a one-shot: **Charter**, BDP's agentic AI substrate.

**Why:** Schmidt's thesis on agentic AI (LinkedIn post 2026-05-02) — agents commoditize fast; the moat is proprietary data + embedded workflows + distribution. BDP already has the workflows (8 arms); Charter is the runtime that turns them into autonomous actors.

**How to apply:**
- Path: `projects/bdp-consulting/arms/agentic_platform/`
- Run an agent: `python -m charter run <name> "<prompt>"` (cwd = arm root)
- API + UI: `python -m uvicorn charter.api:app --port 8787` then http://localhost:8787/
- Smoke: `python scripts/smoke_test.py` (offline) or `--live` (hits Anthropic + Tavily)
- Agent specs: markdown + YAML frontmatter under `agents/`. Add new agents by dropping a new `.md` file there — auto-discovered.
- Tools: `files`, `shell` (allowlisted), `http`, `search` (Tavily), `memory` (per-agent KV), `delegate` (sub-agent). 11 tool functions registered.
- Default model: `claude-sonnet-4-6`. Prompt caching is on (system + tools).
- Workspace .env is loaded automatically; ANTHROPIC_API_KEY + TAVILY_API_KEY already wired.
- Run state: JSONL event logs at `data/runs/<run_id>.jsonl`. Per-agent persistent memory at `data/memory/<agent>.json`.

**Validated 2026-05-02:** smoke_test --live ran researcher through 9 tool-use steps (Tavily search + http_get + file_write), produced sourced brief, persisted 42 events; UI returns 200 with the console HTML; /api/agents lists all 4 specs.
