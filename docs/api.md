# Brocco API Reference

All endpoints are under `/api/v1/`. This surface is stable — breaking changes will be released under `/api/v2/`.

Base URL (production): `https://brocco.dev`

## Authentication

Two modes:

1. **Public demo (default).** No auth required. Cookie-rate-limited to 1 run per browser per 24 hours.
2. **BYOK passthrough (planned).** `Authorization: Bearer sk-ant-...` — your Anthropic key is used directly, bypassing the public-demo quota. Your key never leaves the request lifecycle and is never logged.

## Endpoints

### POST `/api/v1/run`

Streams a Claude tool-use loop. Server-Sent Events response.

**Request:**

```http
POST /api/v1/run HTTP/1.1
Content-Type: application/json

{
  "prompt": "string, 4-1000 chars"
}
```

**Response:** `Content-Type: text/event-stream; charset=utf-8`

Each event is a single `data:` line containing a JSON object. The stream ends with a literal `event: done\ndata: {}\n\n`.

**Event types:**

| `type` | Fields | Emitted when |
|---|---|---|
| `run_started` | `request_id`, `agent`, `prompt` | Run begins. `request_id` is returned in headers as `X-Brocco-Request-Id`. |
| `step_start` | `step` (1-6) | New step in the agent loop. Max 6 steps. |
| `text_delta` | `step`, `text` | Per-token text streaming. Use for live UI. Buffer and join into the final synthesis. |
| `assistant_turn` | `step`, `stop_reason`, `content[]`, `usage` | Step complete. `usage` matches Anthropic's `usage` object (input_tokens, output_tokens, cache_*). |
| `tool_call` | `step`, `tool`, `input`, `tool_use_id` | Agent invoked a tool. |
| `tool_result` | `step`, `tool`, `output`, `is_error`, `tool_use_id` | Tool returned. `is_error: true` when the output begins with `ERROR`. |
| `assistant_text` | `text` | Final synthesis (markdown). |
| `run_finished` | `status: "done"\|"error"`, `code?`, `error?`, `request_id` | Run ended. On `error`, `code` is the structured error code. |

**Built-in tools:**

| Tool | Input | Notes |
|---|---|---|
| `search_web` | `{ "query": "string" }` | Tavily search. Top 4 results + snippet. Truncated to 3500 chars. |
| `http_get` | `{ "url": "string" }` | HTTP GET. Truncated to 3500 chars. SSRF-protected: private IP ranges (10.x, 172.16-31.x, 192.168.x), loopback, AWS metadata, file://, are rejected with `ERROR: ssrf_blocked`. |

**Heartbeat:** the server emits an SSE comment `: ping\n\n` every 5 seconds to keep proxies from closing the connection.

**Cancellation:** the client can cancel by aborting the request (e.g. `controller.abort()` on the fetch). The server propagates the abort signal to the upstream Anthropic call and to any in-flight tool fetches.

**Retry behavior:** on 429 / 5xx from Anthropic, the server retries up to 3 times with exponential backoff (max 30s wait), honoring `Retry-After` when present.

**Hard caps:**
- Prompt: 4-1000 characters
- Steps: 6
- Tool result body: 3500 chars (truncated)
- Total run wall time: 60 seconds
- Per-IP/cookie: 1 free run per 24 hours

### GET `/api/v1/agents`

Returns the list of built-in agents and their tool permissions.

**Response:** JSON

```json
{
  "agents": [
    {
      "id": "researcher",
      "name": "Researcher",
      "description": "...",
      "tools": ["search_web", "http_get"]
    },
    ...
  ]
}
```

## Error envelope

Every error response uses the same shape:

```json
{
  "error": "human-readable summary",
  "code": "error_code",
  "detail": "human-readable explanation",
  "doc_url": "https://brocco.dev/docs/errors#error_code",
  "request_id": "req_..."
}
```

`request_id` is also returned in the `X-Brocco-Request-Id` response header.

| `code` | HTTP | Meaning |
|---|---|---|
| `invalid_json` | 400 | Request body was not valid JSON. |
| `validation_failed` | 400 | Field validation failed (e.g. prompt out of range). |
| `auth_failed` | 401 | Auth required or invalid token. |
| `ssrf_blocked` | 403 | Tool tried to fetch a private/internal address. |
| `rate_limit` | 429 | Per-IP/cookie quota exhausted. |
| `upstream_rate_limit` | 429 | Anthropic returned 429. Retried up to 3 times before surfacing. |
| `internal` | 500 | Unhandled server error. |
| `upstream_error` | 502 | Anthropic returned a 4xx (other than 429) or 5xx (not retryable). |
| `demo_offline` | 503 | Server-side Anthropic key not configured. |
| `tool_unavailable` | 503 | A tool's upstream is unreachable (e.g. Tavily). |
| `upstream_overloaded` | 503 | Anthropic returned 5xx, retries exhausted. |
| `timeout` | 504 | Run exceeded the 60-second hard cap. |
| `aborted` | 499 | Client disconnected mid-run. (Status 499 is non-standard but conventional for client-aborted requests.) |

## Worked example

```bash
curl -N -X POST https://brocco.dev/api/v1/run \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"top 3 AI tools shipped in the last 7 days for solo founders"}'
```

Pipe through `jq` to parse the stream:

```bash
curl -sN -X POST https://brocco.dev/api/v1/run \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"hello"}' | \
  while IFS= read -r line; do
    [[ "$line" == data:* ]] && echo "${line:6}" | jq -c '.'
  done
```

For a TypeScript fetch + parser example, see [`examples/curl-quickstart.md`](examples/curl-quickstart.md).

## Stability

The `/api/v1/*` namespace is the stable surface. Specifically:
- Adding new event types to an SSE stream is **not** a breaking change. Consumers should ignore unknown types.
- Adding new optional fields to a JSON response is **not** a breaking change. Consumers should ignore unknown fields.
- Renaming/removing fields or event types **is** a breaking change. Such changes will land under `/api/v2/`.

## Internal endpoints (not stable)

The following endpoints exist but are not part of the public API:

- `/api/checkout` — Stripe Checkout session creation
- `/api/portal` — Stripe Customer Portal session creation
- `/api/proxy` — read-only HTTP proxy used by the in-app browser tool
- `/api/stripe-webhook` — signed Stripe webhook receiver

Treat these as implementation details. They may change without notice.
