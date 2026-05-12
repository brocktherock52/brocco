# cURL quickstart

Copy-paste recipes for the `/api/v1/*` endpoints. Pair with [`docs/api.md`](../api.md) for the full reference.

## One-liner — run a prompt, watch it stream

```bash
curl -N -X POST https://brocco.dev/api/v1/run \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"What are the top 3 AI startups shipped this week?"}'
```

The `-N` flag disables curl buffering so SSE events arrive live.

## Parse the stream with jq

```bash
curl -sN -X POST https://brocco.dev/api/v1/run \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"summarize SSR vs SSG in Next.js"}' \
  | while IFS= read -r line; do
      [[ "$line" == data:* ]] && echo "${line:6}" | jq -c '.'
    done
```

This prints one JSON object per SSE event. Filter to a specific type:

```bash
# Just the per-token text deltas
... | jq -c 'select(.type == "text_delta") | .text' | tr -d '\n"'

# Just the tool calls
... | jq -c 'select(.type == "tool_call") | {tool, input}'

# Just the final synthesis
... | jq -c 'select(.type == "assistant_text") | .text'
```

## Catch the request_id (for support tickets)

```bash
curl -sN -i -X POST https://brocco.dev/api/v1/run \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"hello"}' \
  | grep -i 'X-Brocco-Request-Id'
```

Every response — success or error — includes `X-Brocco-Request-Id`. Include it when filing an issue.

## List available agents

```bash
curl -s https://brocco.dev/api/v1/agents | jq '.agents[] | {id, name, tools}'
```

## Test an error path

Send a prompt that's too short to trigger validation:

```bash
curl -i -X POST https://brocco.dev/api/v1/run \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"hi"}'
```

Response: HTTP 400 with `code: "validation_failed"`, `detail: "Prompt must be 4-1000 characters. Got 2."`

## TypeScript / JavaScript

A minimal fetch + SSE parser. No SDK required.

```ts
async function run(prompt: string, onEvent: (ev: any) => void) {
  const resp = await fetch('https://brocco.dev/api/v1/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const requestId = resp.headers.get('X-Brocco-Request-Id');
  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(`${err.code}: ${err.detail} (${requestId})`);
  }
  const reader = resp.body!.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf('\n\n')) !== -1) {
      const frame = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      for (const line of frame.split('\n')) {
        if (line.startsWith('data: ')) {
          try { onEvent(JSON.parse(line.slice(6))); } catch { /* skip */ }
        }
      }
    }
  }
}

// Usage
run('top 3 startups shipped this week', (ev) => {
  if (ev.type === 'text_delta') process.stdout.write(ev.text);
  if (ev.type === 'tool_call') console.log(`\n[tool] ${ev.tool}(${JSON.stringify(ev.input)})`);
});
```

## Python

Use `requests` + a hand-rolled SSE parser. No SDK required.

```python
import json
import requests

def run(prompt: str):
    resp = requests.post(
        'https://brocco.dev/api/v1/run',
        json={'prompt': prompt},
        stream=True,
    )
    request_id = resp.headers.get('X-Brocco-Request-Id')
    if not resp.ok:
        err = resp.json()
        raise RuntimeError(f"{err['code']}: {err['detail']} ({request_id})")
    for line in resp.iter_lines(decode_unicode=True):
        if line and line.startswith('data: '):
            yield json.loads(line[6:])

for ev in run('top 3 startups shipped this week'):
    if ev.get('type') == 'text_delta':
        print(ev['text'], end='', flush=True)
    elif ev.get('type') == 'tool_call':
        print(f"\n[tool] {ev['tool']}({ev['input']})")
```

## Cancelling mid-stream

To cancel a run, close the connection. The server detects the disconnect and aborts the upstream Anthropic call and any in-flight tool fetches within ~100ms.

```bash
# Ctrl+C the curl process
# Or with timeout
timeout 5 curl -N -X POST https://brocco.dev/api/v1/run ...
```

In TypeScript, use an `AbortController`:

```ts
const ctrl = new AbortController();
fetch('https://brocco.dev/api/v1/run', { signal: ctrl.signal, ... });
setTimeout(() => ctrl.abort(), 5000);
```
