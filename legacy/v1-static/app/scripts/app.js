/* Brocco app: multi-agent dashboard runtime.
   Browser-side. Calls Anthropic directly with user's BYOK key.
   Tools execute in-browser; HTTP fetches go through /api/proxy. */

(function () {
  'use strict';

  // ---------- State ----------
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const STATE = {
    provider: 'anthropic', // 'anthropic' | 'openai'
    keys: { anthropic: null, tavily: null, openai: null, endpoint: null },
    model: 'claude-sonnet-4-6',
    openaiModel: 'gpt-4o',
    selectedAgents: new Set(),
    mode: 'single', // 'single' | 'broadcast' | 'supervisor'
    panes: [],
    cost: { in: 0, out: 0 },
  };

  // Local storage helpers
  const LS = {
    get(k, def) { try { const v = localStorage.getItem('brocco.' + k); return v == null ? def : JSON.parse(v); } catch { return def; } },
    set(k, v) { try { localStorage.setItem('brocco.' + k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem('brocco.' + k); } catch {} },
  };

  // Agent memory (per-agent KV)
  function memNs(agentName) { return 'mem.' + agentName; }
  function memGet(agentName, key) { const all = LS.get(memNs(agentName), {}); return all[key] ?? null; }
  function memPut(agentName, key, value) { const all = LS.get(memNs(agentName), {}); all[key] = value; LS.set(memNs(agentName), all); }
  function memList(agentName) { return LS.get(memNs(agentName), {}); }

  // ---------- BYOK ----------
  function loadKeys() {
    STATE.provider = LS.get('key.provider', 'anthropic');
    STATE.keys.anthropic = LS.get('key.anthropic', null);
    STATE.keys.tavily = LS.get('key.tavily', null);
    STATE.keys.openai = LS.get('key.openai', null);
    STATE.keys.endpoint = LS.get('key.endpoint', null);
    STATE.model = LS.get('key.model', 'claude-sonnet-4-6');
    STATE.openaiModel = LS.get('key.openaiModel', 'gpt-4o');
    updateBYOKPill();
    updateModelPill();
  }

  function hasActiveKey() {
    if (STATE.provider === 'anthropic') return !!STATE.keys.anthropic;
    if (STATE.provider === 'openai') return !!STATE.keys.endpoint;  // openai key may be empty for local
    return false;
  }

  function updateBYOKPill() {
    const pill = $('#byok-pill');
    const label = $('#byok-label');
    if (hasActiveKey()) {
      pill.classList.add('ok');
      label.textContent = STATE.provider === 'anthropic'
        ? 'anthropic, in browser only'
        : `${new URL(STATE.keys.endpoint).hostname}`;
    } else {
      pill.classList.remove('ok');
      label.textContent = 'no key set';
    }
  }

  function updateModelPill() {
    $('#model-pill').textContent = STATE.provider === 'anthropic' ? STATE.model : (STATE.openaiModel || 'no model');
  }

  function showProviderFields() {
    document.querySelectorAll('[data-provider]').forEach(el => {
      el.hidden = el.dataset.provider !== $('#provider-select').value;
    });
  }

  function openByokModal() {
    $('#provider-select').value = STATE.provider;
    $('#key-anthropic').value = STATE.keys.anthropic || '';
    $('#key-tavily').value = STATE.keys.tavily || '';
    $('#model-select').value = STATE.model;
    $('#key-endpoint').value = STATE.keys.endpoint || '';
    $('#key-openai').value = STATE.keys.openai || '';
    $('#model-openai').value = STATE.openaiModel || '';
    showProviderFields();
    $('#byok-modal').hidden = false;
    setTimeout(() => $('#key-anthropic').focus(), 50);
  }

  function closeByokModal() { $('#byok-modal').hidden = true; }

  $('#byok-pill').addEventListener('click', openByokModal);
  $('#provider-select').addEventListener('change', showProviderFields);

  $('#save-keys').addEventListener('click', () => {
    const provider = $('#provider-select').value;
    const a = $('#key-anthropic').value.trim();
    const t = $('#key-tavily').value.trim();
    const m = $('#model-select').value;
    const ep = $('#key-endpoint').value.trim().replace(/\/$/, '');
    const oa = $('#key-openai').value.trim();
    const om = $('#model-openai').value.trim();

    LS.set('key.provider', provider);
    if (a)  LS.set('key.anthropic', a);  else LS.del('key.anthropic');
    if (t)  LS.set('key.tavily', t);     else LS.del('key.tavily');
    if (ep) LS.set('key.endpoint', ep);  else LS.del('key.endpoint');
    if (oa) LS.set('key.openai', oa);    else LS.del('key.openai');
    if (m)  LS.set('key.model', m);
    if (om) LS.set('key.openaiModel', om);

    STATE.provider = provider;
    STATE.keys = { anthropic: a || null, tavily: t || null, openai: oa || null, endpoint: ep || null };
    STATE.model = m;
    STATE.openaiModel = om;
    updateBYOKPill(); updateModelPill();
    closeByokModal();
  });
  $('#clear-keys').addEventListener('click', () => {
    ['anthropic', 'tavily', 'openai', 'endpoint', 'provider', 'model', 'openaiModel'].forEach(k => LS.del('key.' + k));
    STATE.provider = 'anthropic';
    STATE.keys = { anthropic: null, tavily: null, openai: null, endpoint: null };
    ['key-anthropic', 'key-tavily', 'key-openai', 'key-endpoint', 'model-openai'].forEach(id => { const el = $('#' + id); if (el) el.value = ''; });
    updateBYOKPill();
  });

  document.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', () => {
    $('#byok-modal').hidden = true;
    $('#picker-modal').hidden = true;
  }));

  // ---------- Agent Library ----------
  function renderLibrary() {
    const root = $('#agent-library');
    root.innerHTML = '';
    for (const agent of window.BROCCO_AGENTS) {
      const btn = document.createElement('button');
      btn.className = 'agent-card';
      btn.innerHTML = `
        <div class="name" style="color: ${agent.color || 'var(--fg)'}">${agent.name}</div>
        <div class="desc">${agent.description}</div>
        <div class="badges">${agent.tools.slice(0, 3).map(t => `<span class="badge">${t}</span>`).join('')}${agent.tools.length > 3 ? `<span class="badge">+${agent.tools.length - 3}</span>` : ''}</div>
      `;
      btn.addEventListener('click', () => toggleAgent(agent.name, btn));
      root.appendChild(btn);
    }
  }

  function toggleAgent(name, btn) {
    if (STATE.mode === 'single') {
      // single mode: only one selected at a time
      STATE.selectedAgents.clear();
      $$('.agent-card').forEach(c => c.classList.remove('selected'));
      STATE.selectedAgents.add(name);
      btn.classList.add('selected');
    } else {
      if (STATE.selectedAgents.has(name)) {
        STATE.selectedAgents.delete(name);
        btn.classList.remove('selected');
      } else {
        STATE.selectedAgents.add(name);
        btn.classList.add('selected');
      }
    }
    updateTargets();
  }

  function updateTargets() {
    const tgt = $('#target-count');
    if (STATE.selectedAgents.size === 0) {
      tgt.textContent = 'none';
      tgt.style.color = 'var(--fg-dim)';
    } else {
      tgt.textContent = Array.from(STATE.selectedAgents).join(', ');
    }
  }

  // ---------- Mode toggle ----------
  $$('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      STATE.mode = btn.dataset.mode;
      // when switching to single, clear all but first
      if (STATE.mode === 'single' && STATE.selectedAgents.size > 1) {
        const first = STATE.selectedAgents.values().next().value;
        STATE.selectedAgents.clear();
        STATE.selectedAgents.add(first);
        $$('.agent-card').forEach(c => {
          const name = c.querySelector('.name').textContent.trim();
          c.classList.toggle('selected', name === first);
        });
      }
      // supervisor mode: lock selection to supervisor only
      if (STATE.mode === 'supervisor') {
        STATE.selectedAgents.clear();
        STATE.selectedAgents.add('supervisor');
        $$('.agent-card').forEach(c => {
          const name = c.querySelector('.name').textContent.trim();
          c.classList.toggle('selected', name === 'supervisor');
        });
      }
      updateTargets();
    });
  });

  // ---------- Recipes ----------
  const RECIPES = {
    'market-research': {
      mode: 'broadcast',
      agents: ['researcher', 'analyst', 'planner'],
      prompt: 'Research the top 5 alternatives to brocco.ai (multi-agent AI desktops) shipping in 2026. Return positioning, pricing, and one weakness for each.',
    },
    'launch-day': {
      mode: 'broadcast',
      agents: ['outreach', 'researcher', 'planner'],
      prompt: 'I am launching brocco.ai today. Draft 3 launch tweets (under 280 chars each), find the best subreddits to post in, and produce a 6-step launch-day execution plan.',
    },
    'customer-deep-dive': {
      mode: 'supervisor',
      agents: ['supervisor'],
      prompt: 'Look up Sarah Chen, AE at Vercel (sarah@vercel.com). Find recent context, save 3 facts about her to memory, then draft 3 cold opener variants. Use the outreach agent for the drafts.',
    },
    'content-sprint': {
      mode: 'broadcast',
      agents: ['researcher', 'analyst'],
      prompt: 'Write 5 short-form social posts (each under 200 chars) about how multi-agent AI dashboards beat single-chat interfaces for builders. Punchy, no AI cliches, no em-dashes.',
    },
    'competitor-pricing-watch': {
      mode: 'single',
      agents: ['analyst'],
      prompt: 'Check the pricing pages of Cursor, Claude Code, Replit, Lovable, and Devin. Tell me what changed since last month and rank by aggressiveness.',
    },
    'hn-show-draft': {
      mode: 'single',
      agents: ['outreach'],
      prompt: 'Write a Show HN post for a side project. Title under 80 chars, body that names tradeoffs and weaknesses honestly, ending with 3 specific feedback asks.',
    },
    'daily-news-brief': {
      mode: 'single',
      agents: ['researcher'],
      prompt: 'What shipped in agentic AI in the last 24 hours? Search HN, X, the major company blogs. Give me 5 bullets with source links.',
    },
    'feature-spec': {
      mode: 'supervisor',
      agents: ['supervisor'],
      prompt: 'Take this rough feature idea and produce: a 1-page PRD, an API sketch, 3 risks, and a launch checklist. Idea: a simple workflow tool for solo founders.',
    },
    'build-an-app': {
      mode: 'single',
      agents: ['app_builder'],
      prompt: 'Build me a working pomodoro timer as a single HTML file. Dark mode default, keyboard shortcuts (space to start/pause), sound when each round ends.',
    },
    'design-pack': {
      mode: 'single',
      agents: ['designer'],
      prompt: 'Generate 3 logo concepts (image_gen) and a brand brief for a vibe-coding tool called fizzbuzz.dev. Palette, typeface, voice, one-liner.',
    },
    'site-crawl': {
      mode: 'single',
      agents: ['browser'],
      prompt: 'Crawl 5 pages of https://linear.app and extract every pricing tier, feature list, and customer logo. Output as a clean markdown table.',
    },
  };

  $$('.recipe-card').forEach(card => {
    card.addEventListener('click', () => {
      const recipe = RECIPES[card.dataset.recipe];
      if (!recipe) return;
      // set mode
      $$('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === recipe.mode));
      STATE.mode = recipe.mode;
      // select agents
      STATE.selectedAgents.clear();
      $$('.agent-card').forEach(c => {
        const name = c.querySelector('.name').textContent.trim();
        const sel = recipe.agents.includes(name);
        c.classList.toggle('selected', sel);
        if (sel) STATE.selectedAgents.add(name);
      });
      updateTargets();
      $('#prompt-input').value = recipe.prompt;
      $('#prompt-input').focus();
    });
  });

  // ---------- Pane management ----------
  function spawnPane(agentName, prompt) {
    const agent = window.BROCCO_AGENTS.find(a => a.name === agentName);
    if (!agent) {
      alert('Unknown agent: ' + agentName);
      return null;
    }
    $('#empty-state')?.remove();

    const pane = document.createElement('div');
    pane.className = 'pane running';
    const id = 'pane_' + Math.random().toString(36).slice(2, 9);
    pane.dataset.id = id;
    pane.innerHTML = `
      <div class="pane__header">
        <span class="pane__status running"></span>
        <span class="pane__name" style="color: ${agent.color || 'var(--fg)'}">${agent.name}</span>
        <span class="pane__step" data-step>step 1</span>
        <div class="pane__actions">
          <button class="pane__action" data-stop title="Stop this agent">stop</button>
          <button class="pane__action" data-close title="Close pane">x</button>
        </div>
      </div>
      <div class="pane__stream" data-stream></div>
      <div class="pane__footer">
        <span data-status>thinking...</span>
        <span data-cost>0 / 0 tok</span>
      </div>
    `;
    $('#panes').appendChild(pane);

    const ctx = {
      id,
      pane,
      agent,
      stream: pane.querySelector('[data-stream]'),
      stepEl: pane.querySelector('[data-step]'),
      statusEl: pane.querySelector('[data-status]'),
      costEl: pane.querySelector('[data-cost]'),
      stopBtn: pane.querySelector('[data-stop]'),
      closeBtn: pane.querySelector('[data-close]'),
      messages: [{ role: 'user', content: prompt }],
      stopped: false,
      cost: { in: 0, out: 0 },
    };

    ctx.stopBtn.addEventListener('click', () => { ctx.stopped = true; setStatus(ctx, 'stopping...', 'error'); });
    ctx.closeBtn.addEventListener('click', () => { ctx.stopped = true; pane.remove(); STATE.panes = STATE.panes.filter(p => p.id !== id); });

    pushEvent(ctx, 'user', 'PROMPT', prompt);
    STATE.panes.push(ctx);

    // run async, don't await
    runAgent(ctx).catch(err => {
      pushEvent(ctx, 'error', 'ERROR', String(err.message || err));
      setStatus(ctx, 'error', 'error');
    });
    return ctx;
  }

  function pushEvent(ctx, type, label, body) {
    const div = document.createElement('div');
    div.className = 'ev ' + type;
    const lbl = document.createElement('div');
    lbl.className = 'lbl';
    lbl.textContent = label;
    div.appendChild(lbl);
    if (body != null) {
      const pre = document.createElement('pre');
      if (type === 'assistant' || type === 'done') pre.classList.add('bright');
      pre.textContent = body;
      div.appendChild(pre);
    }
    ctx.stream.appendChild(div);
    ctx.stream.scrollTop = ctx.stream.scrollHeight;
  }

  function setStatus(ctx, text, kind) {
    ctx.statusEl.textContent = text;
    if (kind) {
      ctx.pane.className = 'pane ' + kind;
      const dot = ctx.pane.querySelector('.pane__status');
      dot.className = 'pane__status ' + kind;
    }
  }

  function updateCost(ctx, usage) {
    if (!usage) return;
    ctx.cost.in += usage.input_tokens || 0;
    ctx.cost.out += usage.output_tokens || 0;
    ctx.costEl.textContent = `${ctx.cost.in.toLocaleString()} / ${ctx.cost.out.toLocaleString()} tok`;
    STATE.cost.in += usage.input_tokens || 0;
    STATE.cost.out += usage.output_tokens || 0;
    $('#cost-in').textContent = STATE.cost.in.toLocaleString();
    $('#cost-out').textContent = STATE.cost.out.toLocaleString();
  }

  // ---------- Tool execution ----------
  async function executeTool(ctx, name, input) {
    if (name === 'search_web') {
      if (!STATE.keys.tavily) return 'ERROR: Tavily key not set. Add it in the BYOK panel to enable web search.';
      try {
        const r = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: STATE.keys.tavily,
            query: input.query,
            max_results: input.max_results || 5,
            include_answer: true,
            search_depth: 'basic',
          }),
        });
        if (!r.ok) return `ERROR: tavily ${r.status}: ${(await r.text()).slice(0, 300)}`;
        const d = await r.json();
        const parts = [];
        if (d.answer) parts.push(`ANSWER: ${d.answer}`);
        for (const h of (d.results || []).slice(0, input.max_results || 5)) {
          parts.push(`- ${h.title}\n  ${h.url}\n  ${(h.content || '').slice(0, 280)}`);
        }
        return parts.join('\n').slice(0, 4000);
      } catch (e) { return 'ERROR: ' + e.message; }
    }

    if (name === 'http_get') {
      try {
        const r = await fetch('/api/proxy?url=' + encodeURIComponent(input.url), { method: 'GET' });
        const text = await r.text();
        return `status=${r.status}\n\n${text.slice(0, 3500)}`;
      } catch (e) { return 'ERROR: ' + e.message; }
    }

    if (name === 'memory_put') {
      memPut(ctx.agent.name, input.key, input.value);
      return `saved key=${input.key}`;
    }
    if (name === 'memory_get') {
      const v = memGet(ctx.agent.name, input.key);
      return v == null ? '(unset)' : JSON.stringify(v);
    }
    if (name === 'memory_list') {
      return JSON.stringify(memList(ctx.agent.name), null, 2);
    }

    if (name === 'file_save') {
      const blob = new Blob([input.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = input.filename; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      return `downloaded ${input.filename} (${input.content.length} chars)`;
    }

    if (name === 'delegate') {
      const sub = spawnPane(input.agent, input.task);
      return sub
        ? `spawned sub-agent ${input.agent} in pane ${sub.id}; it runs independently. continue your plan.`
        : `failed to spawn ${input.agent} (unknown name)`;
    }

    if (name === 'image_gen') {
      const key = STATE.keys.openai;
      if (!key) return 'ERROR: OpenAI key not set. Add it in BYOK > OpenAI provider field to enable image_gen.';
      try {
        const r = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: input.prompt,
            size: input.size || '1024x1024',
            quality: input.quality || 'standard',
            n: 1,
          }),
        });
        if (!r.ok) return `ERROR: openai images ${r.status}: ${(await r.text()).slice(0, 300)}`;
        const d = await r.json();
        const url = d.data && d.data[0] && d.data[0].url;
        if (!url) return 'ERROR: no url in response';
        return `image generated\n${url}`;
      } catch (e) { return 'ERROR: ' + e.message; }
    }

    if (name === 'voice_tts') {
      try {
        if (!('speechSynthesis' in window)) return 'ERROR: SpeechSynthesis not supported';
        const u = new SpeechSynthesisUtterance(String(input.text || '').slice(0, 1000));
        u.rate = Math.max(0.5, Math.min(2, Number(input.rate) || 1));
        window.speechSynthesis.speak(u);
        return `speaking ${u.text.length} chars`;
      } catch (e) { return 'ERROR: ' + e.message; }
    }

    if (name === 'done') {
      ctx._final = input.answer || '';
      return 'noted; finalizing.';
    }

    return `ERROR: unknown tool ${name}`;
  }

  // ---------- Provider routing ----------
  async function callModel(ctx, step, callbacks) {
    if (STATE.provider === 'openai') return openaiStream(ctx, step, callbacks);
    return anthropicStream(ctx, step, callbacks.onTextDelta, callbacks.onBlockStart, callbacks.onBlockStop);
  }

  // ---------- OpenAI / Ollama / OpenAI-compatible streaming ----------
  function toOpenAITools(anthropicTools) {
    return anthropicTools.map(t => ({
      type: 'function',
      function: { name: t.name, description: t.description, parameters: t.input_schema },
    }));
  }

  function toOpenAIMessages(systemText, anthropicMessages) {
    const out = [{ role: 'system', content: systemText }];
    for (const msg of anthropicMessages) {
      if (typeof msg.content === 'string') {
        out.push({ role: msg.role, content: msg.content });
        continue;
      }
      if (msg.role === 'user') {
        // user content can be tool_result blocks; emit each as a tool message
        for (const block of msg.content) {
          if (block.type === 'tool_result') {
            out.push({ role: 'tool', tool_call_id: block.tool_use_id, content: String(block.content) });
          } else if (block.type === 'text') {
            out.push({ role: 'user', content: block.text });
          }
        }
      } else if (msg.role === 'assistant') {
        // assistant content can be text + tool_use blocks
        const textParts = [];
        const toolCalls = [];
        for (const block of msg.content) {
          if (block.type === 'text') textParts.push(block.text);
          else if (block.type === 'tool_use') {
            toolCalls.push({
              id: block.id,
              type: 'function',
              function: { name: block.name, arguments: JSON.stringify(block.input || {}) },
            });
          }
        }
        const m = { role: 'assistant', content: textParts.join('\n') || null };
        if (toolCalls.length) m.tool_calls = toolCalls;
        out.push(m);
      }
    }
    return out;
  }

  async function openaiStream(ctx, step, callbacks) {
    const { onTextDelta, onBlockStart, onBlockStop } = callbacks;
    const tools = ctx.agent.tools.map(t => window.BROCCO_TOOLS[t]).filter(Boolean);
    const headers = { 'Content-Type': 'application/json' };
    if (STATE.keys.openai) headers['Authorization'] = `Bearer ${STATE.keys.openai}`;

    const resp = await fetch(`${STATE.keys.endpoint}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: STATE.openaiModel,
        stream: true,
        max_tokens: 2048,
        messages: toOpenAIMessages(ctx.agent.system, ctx.messages),
        tools: tools.length ? toOpenAITools(tools) : undefined,
        tool_choice: tools.length ? 'auto' : undefined,
        stream_options: { include_usage: true },
      }),
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`openai ${resp.status}: ${txt.slice(0, 300)}`);
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    let finishReason = null;
    let usage = null;

    // running state
    let textBlockIdx = null;       // current text block (synthetic index)
    let textAccum = '';
    const toolCallsByIdx = {};     // idx -> { id, name, argsStr, blockIdx }
    let nextSyntheticIdx = 0;

    function ensureTextBlock() {
      if (textBlockIdx === null) {
        textBlockIdx = nextSyntheticIdx++;
        onBlockStart && onBlockStart(textBlockIdx, { type: 'text', text: '' });
      }
    }
    function ensureToolBlock(idx, id, name) {
      if (!toolCallsByIdx[idx]) {
        const blockIdx = nextSyntheticIdx++;
        toolCallsByIdx[idx] = { id: id || `call_${idx}`, name: name || 'tool', argsStr: '', blockIdx };
        onBlockStart && onBlockStart(blockIdx, { type: 'tool_use', id: toolCallsByIdx[idx].id, name: toolCallsByIdx[idx].name });
      }
      if (id) toolCallsByIdx[idx].id = id;
      if (name) toolCallsByIdx[idx].name = name;
    }

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let nl;
      while ((nl = buf.indexOf('\n')) !== -1) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line.startsWith('data:')) continue;
        const dataStr = line.slice(5).trim();
        if (dataStr === '[DONE]') continue;
        let parsed;
        try { parsed = JSON.parse(dataStr); } catch { continue; }
        if (parsed.usage) {
          // OpenAI streamed usage frame
          usage = {
            input_tokens: parsed.usage.prompt_tokens || 0,
            output_tokens: parsed.usage.completion_tokens || 0,
          };
        }
        const choice = parsed.choices && parsed.choices[0];
        if (!choice) continue;
        if (choice.finish_reason) finishReason = choice.finish_reason;
        const delta = choice.delta || {};
        if (typeof delta.content === 'string' && delta.content) {
          ensureTextBlock();
          textAccum += delta.content;
          onTextDelta && onTextDelta(textBlockIdx, delta.content, { type: 'text', text: textAccum });
        }
        if (Array.isArray(delta.tool_calls)) {
          for (const tc of delta.tool_calls) {
            const idx = tc.index ?? 0;
            ensureToolBlock(idx, tc.id, tc.function && tc.function.name);
            if (tc.function && typeof tc.function.arguments === 'string') {
              toolCallsByIdx[idx].argsStr += tc.function.arguments;
            }
          }
        }
      }
    }

    // finalize: build content blocks
    const content = [];
    if (textBlockIdx !== null) {
      content.push({ type: 'text', text: textAccum });
      onBlockStop && onBlockStop(textBlockIdx, { type: 'text', text: textAccum });
    }
    for (const idx of Object.keys(toolCallsByIdx)) {
      const tc = toolCallsByIdx[idx];
      let parsed = {};
      try { parsed = tc.argsStr ? JSON.parse(tc.argsStr) : {}; } catch {}
      content.push({ type: 'tool_use', id: tc.id, name: tc.name, input: parsed });
      onBlockStop && onBlockStop(tc.blockIdx, { type: 'tool_use', id: tc.id, name: tc.name, inputJson: tc.argsStr });
    }
    const stop_reason = finishReason === 'tool_calls' ? 'tool_use'
                       : finishReason === 'stop' ? 'end_turn'
                       : finishReason === 'length' ? 'max_tokens'
                       : finishReason || 'end_turn';
    return { content, stop_reason, usage: usage || {} };
  }

  // ---------- Anthropic streaming call (browser-direct, SSE) ----------
  async function anthropicStream(ctx, step, onTextDelta, onBlockStart, onBlockStop) {
    const tools = ctx.agent.tools.map(t => window.BROCCO_TOOLS[t]).filter(Boolean);
    if (tools.length) tools[tools.length - 1] = { ...tools[tools.length - 1], cache_control: { type: 'ephemeral' } };

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': STATE.keys.anthropic,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'anthropic-beta': 'prompt-caching-2024-07-31',
      },
      body: JSON.stringify({
        model: STATE.model,
        max_tokens: 2048,
        stream: true,
        system: [{ type: 'text', text: ctx.agent.system, cache_control: { type: 'ephemeral' } }],
        tools: tools,
        messages: ctx.messages,
      }),
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`anthropic ${resp.status}: ${txt.slice(0, 300)}`);
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';

    const blocks = [];     // accumulated content blocks
    const partial = {};    // per-index { type, text, name, id, inputJson }
    let stopReason = null;
    let usage = null;

    function handleEvent(eventType, data) {
      if (eventType === 'content_block_start') {
        const idx = data.index;
        const block = data.content_block;
        partial[idx] = {
          type: block.type,
          text: block.type === 'text' ? '' : undefined,
          name: block.name,
          id: block.id,
          inputJson: block.type === 'tool_use' ? '' : undefined,
        };
        onBlockStart && onBlockStart(idx, partial[idx]);
      } else if (eventType === 'content_block_delta') {
        const idx = data.index;
        const delta = data.delta;
        const p = partial[idx];
        if (!p) return;
        if (delta.type === 'text_delta') {
          p.text += delta.text;
          onTextDelta && onTextDelta(idx, delta.text, p);
        } else if (delta.type === 'input_json_delta') {
          p.inputJson += delta.partial_json;
        }
      } else if (eventType === 'content_block_stop') {
        const idx = data.index;
        const p = partial[idx];
        if (!p) return;
        if (p.type === 'text') {
          blocks.push({ type: 'text', text: p.text });
        } else if (p.type === 'tool_use') {
          let parsed = {};
          try { parsed = p.inputJson ? JSON.parse(p.inputJson) : {}; } catch {}
          blocks.push({ type: 'tool_use', id: p.id, name: p.name, input: parsed });
        }
        onBlockStop && onBlockStop(idx, p);
      } else if (eventType === 'message_delta') {
        if (data.delta && data.delta.stop_reason) stopReason = data.delta.stop_reason;
        if (data.usage) usage = { ...(usage || {}), ...data.usage };
      } else if (eventType === 'message_start') {
        if (data.message && data.message.usage) usage = data.message.usage;
      } else if (eventType === 'error') {
        throw new Error(`anthropic stream error: ${JSON.stringify(data)}`);
      }
    }

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      // SSE: events separated by \n\n. each block has lines event:NAME\ndata:JSON
      let sep;
      while ((sep = buf.indexOf('\n\n')) !== -1) {
        const block = buf.slice(0, sep);
        buf = buf.slice(sep + 2);
        let evtName = '';
        let dataStr = '';
        for (const line of block.split('\n')) {
          if (line.startsWith('event:')) evtName = line.slice(6).trim();
          else if (line.startsWith('data:')) dataStr += line.slice(5).trim();
        }
        if (!evtName || !dataStr) continue;
        try {
          const parsed = JSON.parse(dataStr);
          handleEvent(evtName, parsed);
        } catch (e) {
          console.warn('SSE parse error', e, dataStr.slice(0, 200));
        }
      }
    }

    return { content: blocks, stop_reason: stopReason || 'end_turn', usage: usage || {} };
  }

  // ---------- Agent loop ----------
  async function runAgent(ctx) {
    if (!hasActiveKey()) {
      pushEvent(ctx, 'error', 'NO API KEY', 'Click the key pill in the header. Pick a provider (Anthropic or OpenAI-compatible) and add a key. Stays in your browser.');
      setStatus(ctx, 'no key', 'error');
      return;
    }

    const MAX_STEPS = 12;
    for (let step = 1; step <= MAX_STEPS && !ctx.stopped; step++) {
      ctx.stepEl.textContent = `step ${step}`;
      setStatus(ctx, 'thinking...', 'running');

      // pre-create a live event div per block so text appears as it streams
      const liveBlocks = {};
      const onBlockStart = (idx, p) => {
        const div = document.createElement('div');
        div.className = 'ev ' + (p.type === 'tool_use' ? 'tool_call' : 'assistant');
        const lbl = document.createElement('div');
        lbl.className = 'lbl';
        lbl.textContent = p.type === 'tool_use'
          ? `TOOL CALL ${p.name}`
          : `ASSISTANT step ${step}`;
        div.appendChild(lbl);
        const pre = document.createElement('pre');
        if (p.type === 'text') pre.classList.add('bright');
        div.appendChild(pre);
        ctx.stream.appendChild(div);
        ctx.stream.scrollTop = ctx.stream.scrollHeight;
        liveBlocks[idx] = { div, pre };
      };
      const onTextDelta = (idx, deltaText, p) => {
        const lb = liveBlocks[idx];
        if (lb) {
          lb.pre.textContent = p.text;
          ctx.stream.scrollTop = ctx.stream.scrollHeight;
        }
      };
      const onBlockStop = (idx, p) => {
        const lb = liveBlocks[idx];
        if (lb && p.type === 'tool_use') {
          let parsed = {};
          try { parsed = p.inputJson ? JSON.parse(p.inputJson) : {}; } catch {}
          lb.pre.textContent = JSON.stringify(parsed, null, 2);
        }
      };

      let data;
      try {
        data = await callModel(ctx, step, { onTextDelta, onBlockStart, onBlockStop });
      } catch (e) {
        pushEvent(ctx, 'error', 'API ERROR', e.message);
        setStatus(ctx, 'error', 'error');
        return;
      }
      updateCost(ctx, data.usage);
      ctx.messages.push({ role: 'assistant', content: data.content });

      if (data.stop_reason !== 'tool_use') {
        const finalText = data.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
        pushEvent(ctx, 'done', 'RUN DONE', ctx._final || finalText || '(no text)');
        setStatus(ctx, `done in ${step} steps`, 'done');
        return;
      }

      // execute tools
      const toolResults = [];
      for (const block of data.content) {
        if (block.type !== 'tool_use') continue;
        if (ctx.stopped) break;
        setStatus(ctx, `running ${block.name}...`, 'running');
        const result = await executeTool(ctx, block.name, block.input);
        const isErr = typeof result === 'string' && result.startsWith('ERROR');
        pushEvent(ctx, isErr ? 'error' : 'tool_result', `TOOL RESULT ${block.name}`, result);
        toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: String(result), is_error: isErr });
        if (block.name === 'done') {
          // finalize
          pushEvent(ctx, 'done', 'RUN DONE', ctx._final);
          setStatus(ctx, `done in ${step} steps`, 'done');
          return;
        }
      }

      ctx.messages.push({ role: 'user', content: toolResults });
    }

    setStatus(ctx, 'stopped (max steps or user)', 'error');
  }

  // ---------- Run button ----------
  function runFromPrompt() {
    const prompt = $('#prompt-input').value.trim();
    if (prompt.length < 2) { $('#prompt-input').focus(); return; }
    if (STATE.selectedAgents.size === 0) {
      alert('pick an agent on the left first.');
      return;
    }
    if (!hasActiveKey()) {
      openByokModal();
      return;
    }

    if (STATE.mode === 'broadcast') {
      // fan out to all selected, in parallel
      for (const name of STATE.selectedAgents) spawnPane(name, prompt);
    } else {
      // single or supervisor
      const name = STATE.selectedAgents.values().next().value;
      spawnPane(name, prompt);
    }
    $('#prompt-input').value = '';
  }

  $('#run-btn').addEventListener('click', runFromPrompt);
  $('#prompt-input').addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); runFromPrompt(); }
  });

  $('#stop-all').addEventListener('click', () => {
    STATE.panes.forEach(p => { p.stopped = true; });
  });
  $('#clear-all').addEventListener('click', () => {
    STATE.panes = STATE.panes.filter(p => {
      const isDone = p.pane.classList.contains('done') || p.pane.classList.contains('error');
      if (isDone) p.pane.remove();
      return !isDone;
    });
    if (STATE.panes.length === 0 && !$('#empty-state')) {
      // restore empty state
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.id = 'empty-state';
      empty.innerHTML = $('#panes').dataset.emptyHtml || '<div class="empty-state__inner"><h2>Spawn an agent.</h2><p>Pick agents on the left, type a goal below, hit run.</p></div>';
      $('#panes').appendChild(empty);
    }
  });
  $('#panes').dataset.emptyHtml = $('#empty-state')?.outerHTML || '';

  // ---------- Cmd+K agent picker ----------
  function openPicker() {
    $('#picker-modal').hidden = false;
    $('#picker-input').value = '';
    renderPickerList('');
    setTimeout(() => $('#picker-input').focus(), 50);
  }
  function renderPickerList(query) {
    const list = $('#picker-list');
    list.innerHTML = '';
    const q = query.toLowerCase();
    for (const a of window.BROCCO_AGENTS) {
      if (q && !a.name.includes(q) && !a.description.toLowerCase().includes(q)) continue;
      const btn = document.createElement('button');
      btn.className = 'picker-item';
      btn.innerHTML = `<div class="name" style="color: ${a.color || 'var(--fg)'}">${a.name}</div><div class="desc">${a.description}</div>`;
      btn.addEventListener('click', () => {
        STATE.selectedAgents.clear();
        $$('.agent-card').forEach(c => {
          const isThis = c.querySelector('.name').textContent.trim() === a.name;
          c.classList.toggle('selected', isThis);
          if (isThis) STATE.selectedAgents.add(a.name);
        });
        updateTargets();
        $('#picker-modal').hidden = true;
        $('#prompt-input').focus();
      });
      list.appendChild(btn);
    }
  }
  $('#picker-input')?.addEventListener('input', (e) => renderPickerList(e.target.value));

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openPicker(); }
    if ((e.metaKey || e.ctrlKey) && e.key === '.') { e.preventDefault(); STATE.panes.forEach(p => p.stopped = true); }
    if (e.key === 'Escape') { $('#byok-modal').hidden = true; $('#picker-modal').hidden = true; }
  });

  // ---------- Deep-link recipes (e.g. /app/#recipe=market-research) ----------
  function loadRecipeFromHash() {
    const hash = window.location.hash || '';
    const m = hash.match(/recipe=([a-z-]+)/i);
    if (!m) return;
    const recipe = RECIPES[m[1]];
    if (!recipe) return;
    // pretend the recipe card was clicked
    $$('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === recipe.mode));
    STATE.mode = recipe.mode;
    STATE.selectedAgents.clear();
    $$('.agent-card').forEach(c => {
      const name = c.querySelector('.name').textContent.trim();
      const sel = recipe.agents.includes(name);
      c.classList.toggle('selected', sel);
      if (sel) STATE.selectedAgents.add(name);
    });
    updateTargets();
    $('#prompt-input').value = recipe.prompt;
    setTimeout(() => $('#prompt-input').focus(), 100);
  }

  // ---------- Mobile menu ----------
  const menuToggle = document.getElementById('menu-toggle');
  const menuBackdrop = document.getElementById('menu-backdrop');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      document.querySelector('.app__library').classList.toggle('open');
      menuBackdrop.classList.toggle('open');
    });
  }
  if (menuBackdrop) {
    menuBackdrop.addEventListener('click', () => {
      document.querySelector('.app__library').classList.remove('open');
      menuBackdrop.classList.remove('open');
    });
  }
  // close mobile menu when an agent is picked
  document.addEventListener('click', (e) => {
    if (e.target.closest('.agent-card') || e.target.closest('.recipe-card')) {
      document.querySelector('.app__library').classList.remove('open');
      menuBackdrop?.classList.remove('open');
    }
  });

  // ---------- Onboarding tour ----------
  const TOUR_STEPS = [
    { selector: '.app__library', side: 'right',  title: '1. Agent library', body: 'Pick from 9 built-in agents. Click to select. Cmd+K to fuzzy-find.' },
    { selector: '.prompt-mode',  side: 'top',    title: '2. Run modes',     body: 'Single, Broadcast (one prompt to N selected agents in parallel), or Supervisor (one decomposes and delegates).' },
    { selector: '.prompt-row',   side: 'top',    title: '3. Prompt bar',    body: 'Type a goal, hit Run (or Cmd+Enter). Each selected agent spawns a live pane.' },
    { selector: '#byok-pill',    side: 'bottom', title: '4. Your key',      body: 'Stored in your browser only. Anthropic, or any OpenAI-compatible endpoint (Ollama, vLLM, OpenRouter). Click to manage.' },
  ];
  let tourIdx = 0;
  function positionTour(step) {
    const target = document.querySelector(step.selector);
    const spot = $('#tour-spotlight');
    const pop = $('#tour-popover');
    if (!target) { endTour(); return; }
    const r = target.getBoundingClientRect();
    const pad = 8;
    spot.style.top = (r.top - pad) + 'px';
    spot.style.left = (r.left - pad) + 'px';
    spot.style.width = (r.width + pad * 2) + 'px';
    spot.style.height = (r.height + pad * 2) + 'px';
    spot.classList.add('show');
    // popover positioning
    const popH = 160, popW = 320;
    let top, left;
    if (step.side === 'right') { top = r.top + r.height / 2 - popH / 2; left = r.right + 16; }
    else if (step.side === 'left') { top = r.top + r.height / 2 - popH / 2; left = r.left - popW - 16; }
    else if (step.side === 'top') { top = r.top - popH - 16; left = r.left + r.width / 2 - popW / 2; }
    else { top = r.bottom + 16; left = r.left + r.width / 2 - popW / 2; }
    top = Math.max(16, Math.min(window.innerHeight - popH - 16, top));
    left = Math.max(16, Math.min(window.innerWidth - popW - 16, left));
    pop.style.top = top + 'px';
    pop.style.left = left + 'px';
    pop.classList.add('show');
    $('#tour-title').textContent = step.title;
    $('#tour-body').textContent = step.body;
    $('#tour-step').textContent = `${tourIdx + 1} of ${TOUR_STEPS.length}`;
    $('#tour-next').textContent = (tourIdx === TOUR_STEPS.length - 1) ? 'Got it' : 'Next';
  }
  function startTour() { tourIdx = 0; positionTour(TOUR_STEPS[0]); }
  function nextTour() {
    tourIdx++;
    if (tourIdx >= TOUR_STEPS.length) { endTour(); return; }
    positionTour(TOUR_STEPS[tourIdx]);
  }
  function endTour() {
    $('#tour-spotlight').classList.remove('show');
    $('#tour-popover').classList.remove('show');
    LS.set('tour.completed', true);
  }
  $('#tour-next')?.addEventListener('click', nextTour);
  $('#tour-skip')?.addEventListener('click', endTour);
  window.addEventListener('resize', () => { if (tourIdx < TOUR_STEPS.length && $('#tour-popover').classList.contains('show')) positionTour(TOUR_STEPS[tourIdx]); });

  // ---------- Init ----------
  loadKeys();
  renderLibrary();
  loadRecipeFromHash();
  window.addEventListener('hashchange', loadRecipeFromHash);

  // First-run BYOK prompt (skip if a key already in)
  if (!hasActiveKey()) {
    setTimeout(openByokModal, 600);
  } else if (!LS.get('tour.completed', false)) {
    setTimeout(startTour, 800);
  }
})();
