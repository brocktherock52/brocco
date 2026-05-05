/* brocco.ai - interactive agent demo replay
   Plays back recorded JSONL-style event traces character-by-character so
   visitors get the live-run feeling without needing a backend. v2 swaps
   this for a real Charter API call. */

(function () {
  const stream = document.getElementById('demo-stream');
  const status = document.getElementById('demo-status');
  const agentEl = document.getElementById('demo-agent');
  const idEl = document.getElementById('demo-id');
  const replayBtn = document.getElementById('demo-replay');
  const opts = document.querySelectorAll('.demo__opt');
  if (!stream) return;

  /* ───────── recorded traces ───────── */
  const TRACES = {
    research: {
      runId: 'bcd724859165',
      agent: 'researcher',
      events: [
        { t: 0.0, type: 'step_start', step: 1 },
        { t: 0.4, type: 'tool_call', tool: 'search_web', input: { query: 'best notion alternatives 2026 under 20 dollars', max_results: 5 } },
        { t: 1.6, type: 'tool_result', tool: 'search_web', output:
          'ANSWER: Top contenders are Capacities, AnyType, Reflect, Logseq, and Tana.\n- Capacities $11.99/mo, object based, strong graph view\n  https://capacities.io\n- AnyType free, fully local-first, end to end encrypted\n  https://anytype.io\n- Reflect $10/mo, AI-first daily notes, Whisper voice in\n  https://reflect.app' },
        { t: 2.6, type: 'step_start', step: 2 },
        { t: 2.9, type: 'tool_call', tool: 'http_get', input: { url: 'https://capacities.io/pricing' } },
        { t: 4.0, type: 'tool_result', tool: 'http_get', output: 'status=200\nPro $11.99/mo (annual) or $14.99/mo. Believer plan $129/yr. Free tier capped at 3 spaces and 100 objects.' },
        { t: 4.8, type: 'step_start', step: 3 },
        { t: 5.1, type: 'tool_call', tool: 'search_web', input: { query: 'capacities vs anytype vs reflect 2026 review', max_results: 4 } },
        { t: 6.2, type: 'tool_result', tool: 'search_web', output: 'ANSWER: Capacities wins on object model and graph. AnyType wins on privacy and free. Reflect wins on AI features and voice.' },
        { t: 7.2, type: 'step_start', step: 4 },
        { t: 7.5, type: 'tool_call', tool: 'file_write', input: { path: 'brief.md', content: '# Notion alternatives under $20/mo' } },
        { t: 8.0, type: 'tool_result', tool: 'file_write', output: 'wrote 1184 chars to brief.md' },
        { t: 8.6, type: 'step_start', step: 5 },
        { t: 9.0, type: 'assistant_text', text:
`## Notion alternatives under $20/mo

- **Capacities ($11.99/mo)** picks the best object model in the category. Strong graph view, daily notes, AI built in. Best fit if you think in objects (people, projects, books).
- **AnyType (free, local-first)** is the privacy answer. End to end encrypted, no servers, your data stays on your devices. Best fit if you want zero subscription and own your data.
- **Reflect ($10/mo)** leans hardest into AI. Whisper voice in, Claude/GPT for note synthesis. Best fit for daily-notes-first thinkers who talk more than they type.

Recommendation: try AnyType first (free), upgrade to Capacities if you need the object model + multi-device sync without local-first complexity.` },
        { t: 11.0, type: 'run_finished', status: 'done', steps: 5 },
      ],
    },

    outreach: {
      runId: 'a3c7e0d12b41',
      agent: 'outreach',
      events: [
        { t: 0.0, type: 'step_start', step: 1 },
        { t: 0.3, type: 'tool_call', tool: 'search_web', input: { query: 'Detroit cash buyer fix-flip 2026 LinkedIn' } },
        { t: 1.7, type: 'tool_result', tool: 'search_web', output: 'Top result: Richard Grandin Taylor,Detroit RGT acquisitions, $3M+ closed in 2025. Specializes in West-side rentals.' },
        { t: 2.4, type: 'tool_call', tool: 'file_read', input: { path: 'arms/storefront_labs/...' } },
        { t: 3.2, type: 'tool_result', tool: 'file_read', output: 'detroit_rgt_disposition_pack.md,8 properties ranked, avg ARV $148k…' },
        { t: 3.9, type: 'step_start', step: 2 },
        { t: 4.2, type: 'tool_call', tool: 'memory_put', input: { key: 'last_target_rgt', value: { contacted: '2026-05-02', angle: 'disposition_pack' } } },
        { t: 4.8, type: 'tool_result', tool: 'memory_put', output: 'saved key=last_target_rgt' },
        { t: 5.5, type: 'step_start', step: 3 },
        { t: 5.8, type: 'tool_call', tool: 'file_write', input: { path: 'outreach.md', content: 'short / medium / bold variants…' } },
        { t: 6.4, type: 'tool_result', tool: 'file_write', output: 'wrote 1840 chars to outreach.md' },
        { t: 7.1, type: 'assistant_text', text:
`### SHORT (subject: 8 detroit deals)
Richard,saw your 2025 Westside closings. Built a disposition pack for you: 8 props, ranked by ARV - rehab. Want the link?

### MEDIUM (subject: rgt-only pack)
Hey Richard,I run dispo for a small wholesale shop. After your Q4 closings I built a pack pre-filtered for your buybox: 8 Westside Detroit properties, all under $80k assignable. Live link, no fluff. Reply 'send' and it's in your inbox.

### BOLD (subject: stop chasing trustees)
Richard,you closed 14 deals in 2025 and 11 of them were trustee-walk-throughs that took 3 weeks each. I have 8 ready-to-assign Westside props sitting in a pack right now. 30 min on the phone Tue at 2pm and you save the trustee dance. Yes/no?` },
        { t: 9.5, type: 'run_finished', status: 'done', steps: 3 },
      ],
    },

    coder: {
      runId: '7e91f3c205a4',
      agent: 'coder',
      events: [
        { t: 0.0, type: 'step_start', step: 1 },
        { t: 0.3, type: 'tool_call', tool: 'file_list', input: { path: 'charter/tools/' } },
        { t: 0.9, type: 'tool_result', tool: 'file_list', output:
`f          1841 __init__.py
f          1162 registry.py
f          3104 files.py
f          1932 shell.py
f          1564 http.py
f          1418 search.py
f          1502 memory.py
f          1280 delegate.py` },
        { t: 1.4, type: 'tool_call', tool: 'file_read', input: { path: 'charter/tools/registry.py' } },
        { t: 2.0, type: 'tool_result', tool: 'file_read', output: '"""Tool registry. Each tool registers a factory…"""\nfrom __future__ import annotations…' },
        { t: 2.7, type: 'step_start', step: 2 },
        { t: 3.0, type: 'tool_call', tool: 'file_write', input: { path: 'charter/tools/stripe_tool.py', content: '"""Stripe customer lookup tool."""…' } },
        { t: 3.5, type: 'tool_result', tool: 'file_write', output: 'wrote 1208 chars to charter/tools/stripe_tool.py' },
        { t: 4.1, type: 'step_start', step: 3 },
        { t: 4.4, type: 'tool_call', tool: 'shell_exec', input: { command: 'python -m pytest tests/test_stripe_tool.py -q' } },
        { t: 6.8, type: 'tool_result', tool: 'shell_exec', output: 'exit=0\n....                                                                  [100%]\n4 passed in 0.42s' },
        { t: 7.4, type: 'assistant_text', text:
`Added \`stripe_tool.py\` with two functions:

- \`stripe_customer_lookup(email)\` → dict of customer fields
- \`stripe_create_invoice(customer_id, line_items)\` → invoice URL

Both registered in the tool registry. 4/4 tests passing. The supervisor agent can now call these in any workflow.` },
        { t: 9.0, type: 'run_finished', status: 'done', steps: 3 },
      ],
    },

    supervisor: {
      runId: '5d2a9b80fc11',
      agent: 'supervisor',
      events: [
        { t: 0.0, type: 'step_start', step: 1 },
        { t: 0.4, type: 'assistant_text', text: 'Plan:\n  1. researcher → competitor brief\n  2. coder → wire one new integration based on findings\n  3. outreach → draft pitch for the gap we surface' },
        { t: 1.4, type: 'tool_call', tool: 'delegate', input: { agent: 'researcher', task: 'Top 3 competitors in Detroit fix-flip dispo, what they don\'t do.' } },
        { t: 4.2, type: 'tool_result', tool: 'delegate', output: 'sub_run_id=ab12 steps=4 stop=end_turn\n\nTop 3: Roofstock, NewWestern, Sundae. None offer pre-ranked Westside-only packs under $80k.' },
        { t: 4.8, type: 'tool_call', tool: 'delegate', input: { agent: 'coder', task: 'Add a propstream_search tool to query lists by zip + ARV.' } },
        { t: 8.4, type: 'tool_result', tool: 'delegate', output: 'sub_run_id=cd34 steps=3 stop=end_turn\n\nAdded propstream_search. 3 tests passing.' },
        { t: 9.0, type: 'tool_call', tool: 'delegate', input: { agent: 'outreach', task: 'Draft pitch for Detroit cash buyers; angle: pre-ranked Westside packs.' } },
        { t: 12.0, type: 'tool_result', tool: 'delegate', output: 'sub_run_id=ef56 steps=3 stop=end_turn\n\n3 variants written to outreach.md.' },
        { t: 12.6, type: 'assistant_text', text:
`Plan executed. Brocco shipped a research brief, a new tool, and 3 outreach variants in one continuous run. The Westside-only pack angle is unowned by Roofstock/NewWestern/Sundae,recommend pursuing this week.` },
        { t: 14.5, type: 'run_finished', status: 'done', steps: 4 },
      ],
    },
  };

  /* ───────── render helpers ───────── */
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  const esc = s => String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

  function renderEvent(ev) {
    const wrap = el('div', 'ev ' + ev.type);
    if (ev.type === 'step_start') {
      wrap.appendChild(el('div', 'lbl', `STEP ${ev.step}`));
    } else if (ev.type === 'tool_call') {
      wrap.appendChild(el('div', 'lbl', `TOOL CALL · ${esc(ev.tool)}`));
      wrap.appendChild(el('pre', null, esc(JSON.stringify(ev.input, null, 2))));
    } else if (ev.type === 'tool_result') {
      wrap.appendChild(el('div', 'lbl', `TOOL RESULT · ${esc(ev.tool)}`));
      wrap.appendChild(el('pre', null, esc(ev.output || '')));
    } else if (ev.type === 'assistant_text') {
      wrap.appendChild(el('div', 'lbl', 'ASSISTANT'));
      wrap.appendChild(el('pre', 'bright', esc(ev.text)));
    } else if (ev.type === 'run_finished') {
      wrap.appendChild(el('div', 'lbl', `RUN ${esc(ev.status.toUpperCase())} · ${ev.steps} steps`));
    }
    return wrap;
  }

  /* ───────── playback ───────── */
  let timers = [];
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function play(key) {
    const trace = TRACES[key];
    if (!trace) return;
    clearTimers();
    stream.innerHTML = '';
    agentEl.textContent = trace.agent;
    idEl.textContent = `id=${trace.runId}`;
    status.textContent = `running · ${trace.runId}`;

    trace.events.forEach((ev) => {
      timers.push(setTimeout(() => {
        const node = renderEvent(ev);
        stream.appendChild(node);
        stream.scrollTop = stream.scrollHeight;
        if (ev.type === 'run_finished') {
          status.textContent = `done · ${trace.runId} · ${ev.steps} steps`;
        }
      }, ev.t * 1000));
    });
  }

  /* ───────── wire UI ───────── */
  opts.forEach(opt => {
    opt.addEventListener('click', () => {
      opts.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      play(opt.dataset.demo);
    });
  });

  replayBtn.addEventListener('click', () => {
    const active = document.querySelector('.demo__opt.active');
    if (active) play(active.dataset.demo);
  });

  /* auto-play once when demo enters viewport */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { play('research'); io.disconnect(); }
      }
    }, { threshold: 0.35 });
    io.observe(document.getElementById('demo'));
  }

  /* ───────── live mode: POST /api/run, parse SSE ───────── */
  const liveInput = document.getElementById('demo-live-input');
  const liveGo = document.getElementById('demo-live-go');

  function setStatus(text) { if (status) status.textContent = text; }

  async function runLive(prompt) {
    clearTimers();
    stream.innerHTML = '';
    agentEl.textContent = 'demo (live)';
    idEl.textContent = 'id=streaming…';
    setStatus('connecting…');
    liveGo.disabled = true;

    let resp;
    try {
      resp = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
    } catch (e) {
      setStatus('network error: ' + e.message);
      liveGo.disabled = false;
      return;
    }

    if (resp.status === 503) {
      const data = await resp.json().catch(() => ({}));
      const node = renderEvent({
        type: 'run_finished',
        status: 'demo offline',
        steps: 0,
      });
      stream.appendChild(node);
      const note = el('div', 'ev', `<div class="lbl">DEMO OFFLINE</div><pre>${esc(data.detail || 'Live demo not enabled on this deployment yet. Sign up to run agents on your own key.')}</pre>`);
      stream.appendChild(note);
      setStatus('demo offline · scripted runs still available');
      liveGo.disabled = false;
      return;
    }
    if (resp.status === 429) {
      const data = await resp.json().catch(() => ({}));
      setStatus(data.detail || 'rate limited,try again tomorrow');
      stream.appendChild(el('div', 'ev', `<div class="lbl">RATE LIMITED</div><pre>${esc(data.detail || 'Free demo limit reached.')}</pre>`));
      liveGo.disabled = false;
      return;
    }
    if (!resp.ok) {
      const txt = await resp.text();
      setStatus('error ' + resp.status);
      stream.appendChild(el('div', 'ev error', `<div class="lbl">ERROR ${resp.status}</div><pre>${esc(txt.slice(0, 400))}</pre>`));
      liveGo.disabled = false;
      return;
    }

    setStatus('streaming…');
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';

    function processChunk(chunk) {
      // SSE events are separated by \n\n; each event has data: <json>
      buf += chunk;
      let idx;
      while ((idx = buf.indexOf('\n\n')) !== -1) {
        const block = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        for (const line of block.split('\n')) {
          if (line.startsWith('data: ')) {
            const payload = line.slice(6);
            if (!payload || payload === '{}') continue;
            try {
              const ev = JSON.parse(payload);
              const node = renderEvent(ev);
              stream.appendChild(node);
              stream.scrollTop = stream.scrollHeight;
              if (ev.type === 'run_finished') {
                setStatus(`done · ${ev.steps || '?'} steps`);
                idEl.textContent = 'id=live-' + Date.now().toString(36);
              }
            } catch {}
          }
        }
      }
    }

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        processChunk(decoder.decode(value, { stream: true }));
      }
    } catch (e) {
      setStatus('stream interrupted: ' + e.message);
    } finally {
      liveGo.disabled = false;
    }
  }

  if (liveGo && liveInput) {
    liveGo.addEventListener('click', () => {
      const p = (liveInput.value || '').trim();
      if (p.length < 4) { setStatus('type a longer prompt'); return; }
      runLive(p);
    });
    liveInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') liveGo.click();
    });
  }
})();
