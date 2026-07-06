/* ============================================================================
   BDP Command Center - app logic
   Dual mode: talks to server.py (/api/*) when available for live control,
   else falls back to the static window.BDP_* globals (read-only).
   ============================================================================ */
window.BDP = (function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
  const f$ = (n) => '$' + Math.round(n || 0).toLocaleString('en-US');
  const fmtK = (n) => Math.abs(n) >= 1000 ? '$' + (n/1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k' : '$' + Math.round(n || 0);
  const todayISO = () => new Date().toISOString().slice(0, 10);

  let STATE = { data: null, revenue: [], meetings: [], metrics: null, config: null, backend: false };
  let activeLane = 'All', query = '';

  /* ---------------- boot ---------------- */
  async function boot() {
    // static fallback
    STATE.data = window.BDP_DATA || { meta:{}, kpis:[], goals:[], focus:[], ventures:[], lanes:[], quickLinks:[] };
    STATE.revenue = window.BDP_REVENUE || [];
    STATE.meetings = window.BDP_MEETINGS || [];
    STATE.metrics = window.BDP_METRICS || null;
    STATE.config = window.BDP_CONFIG || { weeklyMeetingTarget:15, monthlyRevenueTarget:20000, bookingLinks:[], outreachTargets:[] };
    initTheme(); initClock(); wireStatic();
    renderAll();
    // Demo mode (public deploy) stays fully static and never calls a backend API.
    if (!document.body.classList.contains('demo')) {
      try {
        const r = await fetch('/api/state', { cache: 'no-store' });
        if (r.ok) { const s = await r.json(); if (s.ok) { applyState(s); STATE.backend = true; renderAll(); } }
      } catch (e) { /* static mode */ }
    }
    setConn();
    initJarvis();
    firstPaint();
    setTimeout(() => location.reload(), 60 * 60 * 1000); // hourly auto-refresh
  }
  function firstPaint() {
    animateNumbers(document);
    setTimeout(() => document.body.classList.remove('first-load'), 1500);
    initHero();
  }

  /* ---------------- HERO: command-bridge constellation ---------------- */
  function initHero() {
    const D = STATE.data, vs = D.ventures || [];
    // greeting
    const h = new Date().getHours();
    const greet = h < 5 ? 'Still up' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    const op = (D.meta.operator || 'Operator').split(' ')[0];
    $('hero-title').innerHTML = `${greet}, <span class="acc">${esc(op)}</span>.`;
    const rev = (STATE.revenue || []).filter(r => typeof r.amount === 'number').reduce((s, r) => s + r.amount, 0);
    const lanes = (D.lanes || []).length;
    $('hero-sub').textContent = `Your holding company at a glance: ${vs.length} ventures across ${lanes} lanes, ${vs.filter(v=>v.status==='live').length} live and ${vs.filter(v=>v.status==='active').length} active. ${rev === 0 ? 'Zero dollars logged so far. Every star below is a shot at the first one.' : 'Tracking every dollar in real time.'}`;
    const northMrr = '$10K';
    $('hero-stats').innerHTML = [
      { v: String(vs.length), k: 'Ventures live' },
      { v: f$(rev), k: 'Your revenue' },
      { v: northMrr, k: 'North-star MRR' },
      { v: (STATE.metrics && STATE.metrics.latest ? `${STATE.metrics.latest.meetingsWeek}/${STATE.metrics.latest.meetingTarget}` : '0/15'), k: 'Meetings this wk' },
    ].map(s => `<div class="hero-stat"><div class="hs-v">${esc(s.v)}</div><div class="hs-k">${esc(s.k)}</div></div>`).join('');
    animateNumbers($('hero-stats'));

    $('scroll-cue').addEventListener('click', () => {
      const t = document.querySelector('.wrap'); if (t) window.scrollTo({ top: t.offsetTop - 20, behavior: 'smooth' });
    });

    bootSequence(vs.length);
    const SORD = { live: 0, active: 1, pending: 2, paused: 3, parked: 4, dormant: 5 };
    const conNodes = [...vs].sort((a, b) => (SORD[a.status] ?? 9) - (SORD[b.status] ?? 9)).slice(0, 64);
    startConstellation(conNodes);
  }

  function bootSequence(n) {
    const lines = [
      'INITIALIZING BDP MISSION CONTROL',
      `LINKING ${n} VENTURES // 9 LANES`,
      'PULSE ONLINE // ALL SYSTEMS NOMINAL',
    ];
    const el = $('boot-line'); let li = 0, ci = 0;
    setTimeout(() => $('boot').classList.add('done'), 3200); // safety: never hang
    function type() {
      if (li >= lines.length) { setTimeout(() => $('boot').classList.add('done'), 250); return; }
      const line = lines[li];
      if (ci <= line.length) { el.textContent = line.slice(0, ci) + (ci < line.length ? '_' : ''); ci++; setTimeout(type, 18); }
      else { li++; ci = 0; setTimeout(type, 230); }
    }
    type();
  }

  const LANE_COLOR = { 'SaaS':'#45d6d0', 'Real Estate':'#46e29a', 'Trading':'#9d8cff', 'Content':'#ffc46b',
    'Employment':'#62b8ff', 'Consulting':'#ff6f8d', 'Education':'#3ee0c6', 'Ops':'#8fa0b5', 'Other':'#8fa0b5' };
  const STATUS_R = { live: 5.5, active: 4.5, pending: 3.6, parked: 2.8, paused: 2.8, dormant: 2.2 };

  function startConstellation(vs) {
    const cv = document.getElementById('constellation'); if (!cv) return;
    const ctx = cv.getContext('2d');
    let W = 0, Hh = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -1e4, y: -1e4, px: 0, py: 0 };
    let nodes = [], coreT = 0, hover = null, comets = [], lastComet = 0;

    function resize() {
      const r = cv.getBoundingClientRect(); W = r.width; Hh = r.height;
      cv.width = W * dpr; cv.height = Hh * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout();
    }
    function layout() {
      const cx = W * 0.5, cy = Hh * 0.46;
      nodes = vs.map((v, i) => {
        // cluster loosely by lane angle + ring by status, with jitter
        const lanes = STATE.data.lanes || [];
        const li = Math.max(0, lanes.indexOf(v.lane));
        const ang = (li / Math.max(1, lanes.length)) * Math.PI * 2 + (i * 0.7);
        const ring = 0.16 + (1 - (STATUS_R[v.status] || 3) / 6) * 0.36 + ((i % 5) * 0.03);
        const rad = ring * Math.min(W, Hh * 1.6) * (0.6 + (i % 3) * 0.18);
        const jx = (Math.sin(i * 12.9) * 0.5) * 90, jy = (Math.cos(i * 7.3) * 0.5) * 70;
        const x = cx + Math.cos(ang) * rad + jx, y = cy + Math.sin(ang) * rad * 0.62 + jy;
        return { v, x, y, bx: x, by: y, r: STATUS_R[v.status] || 3, color: LANE_COLOR[v.lane] || '#8fa0b5',
          live: v.status === 'live' || v.status === 'active', ph: i * 0.6, appear: 0, delay: 600 + i * 28 };
      });
    }
    function frame(t) {
      coreT = t * 0.001;
      mouse.px += (mouse.x - mouse.px) * 0.06; mouse.py += (mouse.y - mouse.py) * 0.06;
      ctx.clearRect(0, 0, W, Hh);
      const cx = W * 0.5, cy = Hh * 0.46;

      // node drift + parallax
      nodes.forEach((n, i) => {
        if (n.appear < 1 && t > n.delay) n.appear = Math.min(1, n.appear + 0.04);
        const off = (n.r - 3) * 1.2;
        n.x = n.bx + Math.sin(coreT * 0.5 + n.ph) * 6 + (mouse.px - W/2) * 0.008 * off;
        n.y = n.by + Math.cos(coreT * 0.4 + n.ph) * 5 + (mouse.py - Hh/2) * 0.008 * off;
      });

      // links between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j]; const dx = a.x - b.x, dy = a.y - b.y; const d = Math.hypot(dx, dy);
          if (d < 150) {
            const al = (1 - d / 150) * 0.22 * a.appear * b.appear;
            ctx.strokeStyle = `rgba(120,200,200,${al})`; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      // core links to live nodes
      nodes.forEach(n => {
        if (!n.live) return;
        ctx.strokeStyle = `rgba(62,224,198,${0.1 * n.appear})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(n.x, n.y); ctx.stroke();
      });

      // core reactor
      const pulse = 0.5 + Math.sin(coreT * 1.6) * 0.5;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60 + pulse * 14);
      g.addColorStop(0, 'rgba(62,224,198,0.5)'); g.addColorStop(0.3, 'rgba(98,184,255,0.18)'); g.addColorStop(1, 'rgba(98,184,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 70 + pulse * 16, 0, 7); ctx.fill();
      for (let k = 0; k < 3; k++) {
        ctx.strokeStyle = `rgba(120,210,205,${0.18 - k * 0.05})`; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(cx, cy, 26 + k * 16 + pulse * 6, coreT * (0.6 + k * 0.2), coreT * (0.6 + k * 0.2) + 4.4); ctx.stroke();
      }
      ctx.fillStyle = '#dffaf4'; ctx.beginPath(); ctx.arc(cx, cy, 5 + pulse * 1.5, 0, 7); ctx.fill();

      // nodes
      hover = null;
      nodes.forEach(n => {
        const hov = Math.hypot(mouse.x - n.x, mouse.y - n.y) < n.r + 9;
        if (hov && mouse.x > -1000) hover = n;
        const a = n.appear, rr = n.r * (hov ? 1.7 : 1);
        const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, rr * 4);
        glow.addColorStop(0, n.color + 'cc'); glow.addColorStop(1, n.color + '00');
        ctx.globalAlpha = a * (n.live ? 0.9 : 0.6); ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(n.x, n.y, rr * 4, 0, 7); ctx.fill();
        ctx.globalAlpha = a; ctx.fillStyle = n.color;
        ctx.beginPath(); ctx.arc(n.x, n.y, rr, 0, 7); ctx.fill();
        ctx.globalAlpha = 1;
      });

      // tooltip
      const tip = $('con-tip');
      if (hover) { cv.style.cursor = 'pointer';
        tip.innerHTML = `<div class="ct-name">${esc(hover.v.name)}</div><div class="ct-meta">${esc(hover.v.lane)} &middot; ${esc(hover.v.status)}${hover.v.mrr && hover.v.mrr !== '$0' ? ' &middot; ' + esc(hover.v.mrr) : ''}</div>`;
        tip.style.left = hover.x + 'px'; tip.style.top = hover.y + 'px'; tip.classList.add('show');
      } else { cv.style.cursor = 'default'; tip.classList.remove('show'); }

      // shooting stars
      if (t - lastComet > 2600 + Math.random() * 3200) {
        lastComet = t; const fromLeft = Math.random() < 0.5;
        comets.push({ x: fromLeft ? -40 : W + 40, y: Hh * (0.08 + Math.random() * 0.4),
          vx: (fromLeft ? 1 : -1) * (4.5 + Math.random() * 3), vy: 1.1 + Math.random() * 1.5, life: 0, max: 130 });
      }
      comets.forEach(c => { c.x += c.vx; c.y += c.vy; c.life++; });
      comets = comets.filter(c => c.life < c.max && c.x > -90 && c.x < W + 90);
      comets.forEach(c => {
        const tx = c.x - c.vx * 9, ty = c.y - c.vy * 9, fade = 1 - c.life / c.max;
        const grad = ctx.createLinearGradient(c.x, c.y, tx, ty);
        grad.addColorStop(0, `rgba(214,255,245,${0.85 * fade})`); grad.addColorStop(1, 'rgba(214,255,245,0)');
        ctx.strokeStyle = grad; ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(tx, ty); ctx.stroke();
        ctx.fillStyle = `rgba(255,255,255,${fade})`; ctx.beginPath(); ctx.arc(c.x, c.y, 1.8, 0, 7); ctx.fill();
      });

      requestAnimationFrame(frame);
    }
    cv.addEventListener('mousemove', e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    cv.addEventListener('mouseleave', () => { mouse.x = -1e4; mouse.y = -1e4; });
    cv.addEventListener('click', () => { if (hover) jumpToVenture(hover.v.id); });
    window.addEventListener('resize', resize);
    resize(); requestAnimationFrame(frame);
  }
  function jumpToVenture(id) {
    const card = document.getElementById('card-' + id); if (!card) return;
    // ensure visible (clear lane filter if needed)
    if (card.classList.contains('hidden')) { activeLane = 'All'; query = '';
      document.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x.dataset.lane === 'All'));
      applyFilter();
    }
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.remove('flash'); void card.offsetWidth; card.classList.add('flash');
  }
  function animateNumbers(scope) {
    scope.querySelectorAll('.kpi .value, .rev-kpi .v, .pulse-strip .pl-item .v').forEach(el => {
      const raw = el.textContent.trim();
      const m = raw.match(/^([^\d-]*)(-?[\d,]+(?:\.\d+)?)(.*)$/);
      if (!m) return;
      const prefix = m[1], numStr = m[2].replace(/,/g, ''), suffix = m[3];
      const target = parseFloat(numStr); if (!isFinite(target)) return;
      const grouped = m[2].includes(',') || target >= 1000;
      const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
      const dur = 900, t0 = performance.now();
      const fmt = v => prefix + (grouped ? Math.round(v).toLocaleString('en-US') : (decimals ? v.toFixed(decimals) : Math.round(v))) + suffix;
      const step = (t) => { const p = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(target * e); if (p < 1) requestAnimationFrame(step); else el.textContent = raw; };
      requestAnimationFrame(step);
    });
  }
  function applyState(s) {
    STATE.data = s.data || STATE.data; STATE.revenue = s.revenue || []; STATE.meetings = s.meetings || [];
    STATE.metrics = s.metrics || STATE.metrics; STATE.config = s.config || STATE.config; STATE.workspace = s.workspace;
  }
  async function refresh() {
    if (!STATE.backend) return;
    try { const r = await fetch('/api/state', { cache:'no-store' }); const s = await r.json(); if (s.ok) { applyState(s); renderAll(); } } catch (e) {}
  }
  async function api(path, body) {
    const r = await fetch(path, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body || {}) });
    return r.json();
  }

  /* ---------------- clock + conn ---------------- */
  function initClock() {
    const tick = () => { const n = new Date();
      $('clock-t').textContent = n.toLocaleTimeString('en-US', { hour12:false });
      $('clock-d').textContent = n.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' }); };
    tick(); setInterval(tick, 1000);
  }
  function setConn() {
    const dot = $('conn-dot');
    if (STATE.backend) { dot.classList.remove('off'); dot.title = 'Control backend live'; }
    else { dot.classList.add('off'); dot.title = 'Static mode (run start.ps1 for live controls)'; }
  }

  /* ---------------- theme ---------------- */
  function initTheme() {
    const saved = localStorage.getItem('bdp-theme') || 'brocco-dark';
    document.body.setAttribute('data-theme', saved);
    const sel = $('theme-select'); if (sel) { sel.value = saved; sel.addEventListener('change', () => {
      document.body.setAttribute('data-theme', sel.value); localStorage.setItem('bdp-theme', sel.value);
    }); }
  }

  /* ---------------- path helpers ---------------- */
  function resolvePath(p) { return '../../' + String(p).replace(/\\/g, '/'); }
  function ventureFolder(v) {
    const l = (v.links || []).find(x => x.path); if (!l) return null;
    const p = l.path; return p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : p;
  }
  function linkHtml(l) {
    if (l.url) return `<a class="clink" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} &#8599;</a>`;
    if (l.path) return `<span class="clink path" data-open="${esc(l.path)}" title="${esc(l.path)}">${esc(l.label)}</span>`;
    return `<span class="clink">${esc(l.label)}</span>`;
  }

  /* ---------------- render: top ---------------- */
  function renderAll() {
    const D = STATE.data;
    $('co-name').textContent = D.meta.company || 'BDP Industries';
    $('co-tag').textContent = D.meta.tagline || 'Command Center';
    document.title = (D.meta.company || 'BDP') + ' - Command Center';

    $('qbar').innerHTML = (D.quickLinks || []).map(linkHtml).join('');

    $('kpis').innerHTML = (D.kpis || []).map(k => {
      const tri = k.trend === 'up' ? '&#9650;' : k.trend === 'down' ? '&#9660;' : '&#9644;';
      const av = { green:'var(--green)', cyan:'var(--cyan)', violet:'var(--violet)', amber:'var(--amber)', rose:'var(--rose)' }[k.accent] || 'var(--cyan)';
      return `<div class="kpi" style="--accent:${av}"><div class="trend ${esc(k.trend)}">${tri}</div>
        <div class="label">${esc(k.label)}</div><div class="value">${esc(k.value)}</div><div class="sub">${esc(k.sub||'')}</div></div>`;
    }).join('');

    $('goals').innerHTML = (D.goals || []).map(g => `
      <div class="goal"><div class="goal-top"><span class="goal-title">${esc(g.title)}</span><span class="goal-pct">${esc(g.pct)}%</span></div>
      <div class="bar"><div style="width:${Math.max(0,Math.min(100,g.pct))}%"></div></div>
      <div class="goal-note">${esc(g.note||'')}</div></div>`).join('');

    $('focus').innerHTML = (D.focus || []).map(f => `
      <div class="focus-item"><div class="pnum">${esc(f.p)}</div><div class="focus-body">
      <div class="focus-text">${esc(f.text)}${f.lane?`<span class="lane-tag">${esc(f.lane)}</span>`:''}</div>
      <div class="focus-meta">${esc(f.due||'')}</div></div></div>`).join('');

    renderPulse(); renderRevenue(); renderMeetings(); renderCards(); renderFooter();
  }

  /* ---------------- render: pulse ---------------- */
  function renderPulse() {
    const el = $('pulse-strip'), M = STATE.metrics;
    if (!M || !M.latest) {
      el.innerHTML = `<span class="pl-lbl">Pulse</span><span class="stamp">No snapshot yet. Run <code>pulse.ps1</code> (or register-pulse.ps1 for hourly).</span>`;
      return;
    }
    const L = M.latest, hist = M.history || [];
    const spark = hist.slice(-40), maxS = Math.max(1, ...spark.map(s => s.allTime || 0));
    const bars = spark.map(s => `<div style="height:${Math.max(4,(s.allTime/maxS)*100)}%" title="${s.ts}: ${f$(s.allTime)}"></div>`).join('');
    const stamp = new Date(L.ts).toLocaleString('en-US', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' });
    el.innerHTML = `
      <span class="live-dot"></span><span class="pl-lbl">Live Pulse</span>
      <div class="pl-item"><div class="v" style="color:var(--green)">${f$(L.mrr)}</div><div class="k">Your MRR</div></div>
      <div class="pl-item"><div class="v">${f$(L.mtd)}</div><div class="k">Month to date</div></div>
      <div class="pl-item"><div class="v">${f$(L.allTime)}</div><div class="k">All-time</div></div>
      <div class="pl-item"><div class="v">${L.meetingsWeek}/${L.meetingTarget}</div><div class="k">Meetings / wk</div></div>
      <div class="pl-item"><div class="v">${L.vLive}/${L.vActive}</div><div class="k">Live / active</div></div>
      <div class="spark">${bars}</div>
      <div class="pl-right">
        <span class="stamp">updated ${stamp} &middot; auto-refresh hourly</span>
        <a class="rss" href="feed.xml" target="_blank">RSS feed</a>
      </div>`;
  }

  /* ---------------- render: revenue ---------------- */
  const ym = (d) => d.slice(0,7);
  function renderRevenue() {
    const now = new Date(), thisMonth = now.toISOString().slice(0,7);
    const rev = (STATE.revenue || []).filter(r => typeof r.amount === 'number');
    const total = rev.reduce((s,r)=>s+r.amount,0);
    const mtd = rev.filter(r=>ym(r.date)===thisMonth).reduce((s,r)=>s+r.amount,0);
    const cutoff = new Date(now.getTime()-30*864e5).toISOString().slice(0,10);
    const last30 = rev.filter(r=>r.date>=cutoff).reduce((s,r)=>s+r.amount,0);
    const recurring = rev.filter(r=>r.type==='recurring');
    const mrrMonths = [...new Set(recurring.map(r=>ym(r.date)))].sort();
    const mrr = mrrMonths.length ? recurring.filter(r=>ym(r.date)===mrrMonths.slice(-1)[0]).reduce((s,r)=>s+r.amount,0) : 0;
    const target = (STATE.config && STATE.config.monthlyRevenueTarget) || 20000;

    $('rev-month-label').textContent = now.toLocaleDateString('en-US',{month:'long',year:'numeric'});
    $('rev-count').textContent = rev.length + ' entries';
    $('rev-kpis').innerHTML = [
      { k:'All-time', v:f$(total), s:rev.length+' transactions' },
      { k:'This month', v:f$(mtd), s:'target '+fmtK(target) },
      { k:'Last 30 days', v:f$(last30), s:'rolling' },
      { k:'Recurring (MRR)', v:f$(mrr), s:'latest month' },
    ].map(x => `<div class="rev-kpi"><div class="k">${x.k}</div><div class="v">${x.v}</div><div class="s">${x.s}</div></div>`).join('');

    const months = [];
    for (let i=5;i>=0;i--){ const d=new Date(now.getFullYear(), now.getMonth()-i, 1); months.push(d.toISOString().slice(0,7)); }
    const mt = months.map(m => rev.filter(r=>ym(r.date)===m).reduce((s,r)=>s+r.amount,0));
    const maxM = Math.max(1, ...mt);
    $('rev-months').innerHTML = months.map((m,i) => {
      const h = mt[i] ? Math.max(4,(mt[i]/maxM)*100) : 2;
      const lbl = new Date(m+'-01').toLocaleDateString('en-US',{month:'short'});
      return `<div class="mcol" title="${m}: ${f$(mt[i])}"><div class="mbar" style="height:${h}%"></div><div class="mlbl">${lbl}</div></div>`;
    }).join('');

    const laneMap = {}; rev.forEach(r => { laneMap[r.lane||'Other'] = (laneMap[r.lane||'Other']||0)+r.amount; });
    const laneArr = Object.entries(laneMap).sort((a,b)=>b[1]-a[1]); const maxL = Math.max(1, ...laneArr.map(x=>x[1]));
    $('rev-lanes').innerHTML = laneArr.length ? laneArr.map(([nm,amt]) =>
      `<div class="lane-row"><div class="nm">${esc(nm)}</div><div class="track"><div style="width:${(amt/maxL)*100}%"></div></div><div class="amt">${fmtK(amt)}</div></div>`
    ).join('') : '<div class="empty">No revenue logged yet. Click <b>+ Log a dollar</b> when you close your first deal.</div>';

    const recent = [...rev].sort((a,b)=> a.date<b.date?1:-1).slice(0,9);
    $('rev-rows').innerHTML = recent.length ? recent.map(r =>
      `<tr><td style="color:var(--muted)">${esc(r.date)}</td><td>${esc(r.venture)}<div style="font-size:10px;color:var(--faint)">${esc(r.lane||'')}</div></td><td style="color:var(--muted)">${esc(r.type)}</td><td class="amt">${f$(r.amount)}</td></tr>`
    ).join('') : '<tr><td colspan="4" class="empty">No transactions yet.</td></tr>';
  }

  /* ---------------- render: meetings ---------------- */
  function renderMeetings() {
    const MTG = STATE.meetings || [], cfg = STATE.config || {};
    const now = new Date(), today = now.toISOString().slice(0,10);
    const day = (now.getDay()+6)%7;
    const weekStart = new Date(now); weekStart.setDate(now.getDate()-day); weekStart.setHours(0,0,0,0);
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate()+7);
    const wsISO = weekStart.toISOString().slice(0,10), weISO = weekEnd.toISOString().slice(0,10);
    const inWeek = MTG.filter(m => m.date>=wsISO && m.date<weISO);
    const weekBooked = inWeek.filter(m=>m.status!=='target').length;
    const target = cfg.weeklyMeetingTarget || 15;
    const pct = Math.min(100, Math.round((weekBooked/target)*100));
    $('mt-ring').style.setProperty('--p', pct); $('mt-ring-num').textContent = weekBooked; $('mt-ring-cap').textContent = `of ${target}/wk`;
    $('mt-stats').innerHTML = [
      { k:'Booked this wk', v:weekBooked },
      { k:'Confirmed', v:inWeek.filter(m=>m.status==='confirmed').length },
      { k:'Requested', v:inWeek.filter(m=>m.status==='requested').length },
      { k:'Targets open', v:MTG.filter(m=>m.status==='target').length },
    ].map(x=>`<div class="mt-stat"><div class="k">${x.k}</div><div class="v">${x.v}</div></div>`).join('');

    const upcoming = MTG.filter(m=>m.date>=today).sort((a,b)=> a.date<b.date?-1:(a.date>b.date?1:(a.time||'').localeCompare(b.time||''))).slice(0,8);
    $('mt-upcoming').innerHTML = upcoming.length ? upcoming.map(m => {
      const d = new Date(m.date+'T00:00:00');
      return `<div class="mt-item">
        <div class="mt-date"><div class="dd">${d.getDate()}</div><div class="mo">${d.toLocaleDateString('en-US',{month:'short'})}</div>${m.time?`<div class="tm">${esc(m.time)}</div>`:''}</div>
        <div class="mt-body"><div class="mt-title">${esc(m.title)} <span class="badge b-${esc(m.status)}">${esc(m.status)}</span></div>
          <div class="mt-meta">${esc(m.with||'')}${m.with?' &middot; ':''}<span class="lane-tag">${esc(m.lane)}</span> ${esc(m.type)}${m.note?' &middot; '+esc(m.note):''}</div>
          ${m.link?`<div class="booking"><a class="book-link" href="${esc(m.link)}" target="_blank">Open &#8599;</a></div>`:''}
        </div></div>`;
    }).join('') : '<div class="empty">No upcoming meetings. Work the pipeline below and click <b>+ Log meeting</b>.</div>';

    $('booking').innerHTML = (cfg.bookingLinks||[]).map(b =>
      `<a class="book-link" href="${esc(b.url)}" target="_blank" title="${esc(b.note||'')}">${esc(b.label)} &#8599;</a>`).join('') || '<div class="empty">Add booking links in config.js</div>';
    $('pipeline').innerHTML = (cfg.outreachTargets||[]).map(t =>
      `<div class="pipe-row"><div class="pl"><span class="lane-tag">${esc(t.lane)}</span></div>
       <div class="pw"><b>${esc(t.who)}</b><small>${esc(t.action)}${t.link?` &middot; <a class="clink" style="padding:1px 6px" href="${esc(t.link)}" target="_blank">link &#8599;</a>`:''}</small></div></div>`).join('') || '<div class="empty">Add outreach targets in config.js</div>';
  }

  /* ---------------- render: venture cards ---------------- */
  function renderCards() {
    const D = STATE.data, ventures = D.ventures || [];
    const lanes = D.lanes || [...new Set(ventures.map(v=>v.lane))];
    $('cards').innerHTML = ventures.map(cardHtml).join('');
    const laneCount = (l) => l==='All' ? ventures.length : ventures.filter(v=>v.lane===l).length;
    $('filters').innerHTML = ['All', ...lanes].map(l =>
      `<button class="tab${l===activeLane?' active':''}" data-lane="${esc(l)}">${esc(l)}<span class="count">${laneCount(l)}</span></button>`).join('')
      + `<div class="search"><input id="search" type="text" placeholder="Search ventures..." value="${esc(query)}" /></div>`;
    applyFilter();
  }
  function cardHtml(v) {
    const metrics = (v.metrics||[]).slice(0,6).map(m => `<div class="metric"><div class="mk">${esc(m.k)}</div><div class="mv">${esc(m.v)}</div></div>`).join('');
    const links = (v.links||[]).map(linkHtml).join('');
    const mrrPill = v.mrr ? `<span class="pill" style="background:rgba(63,224,138,0.13);color:var(--green)">${esc(v.mrr)}</span>` : '';
    const folder = ventureFolder(v);
    const openBtn = folder ? `<button class="ctrl-btn" data-act="open" data-path="${esc(folder)}">&#128193; Open</button>` : '';
    const browseBtn = folder ? `<button class="ctrl-btn" data-act="browse" data-path="${esc(folder)}">&#9881;&#65039; Files / Run</button>` : '';
    const editBtn = `<button class="ctrl-btn" data-act="edit" data-id="${esc(v.id)}">&#9999;&#65039; Edit</button>`;
    return `<div class="card" id="card-${esc(v.id)}" data-id="${esc(v.id)}" data-lane="${esc(v.lane)}" data-text="${esc((v.name+' '+(v.blurb||'')+' '+v.lane+' '+(v.rev||'')+' '+(v.flag||'')).toLowerCase())}">
      <div class="card-head"><div class="card-title">${esc(v.name)}</div><div class="health-dot health-${esc(v.health||'unknown')}" title="health: ${esc(v.health||'unknown')}"></div></div>
      <div class="pills"><span class="pill pill-lane">${esc(v.lane)}</span><span class="pill st-${esc(v.status)}">${esc(v.status)}</span>${mrrPill}</div>
      <div class="blurb">${esc(v.blurb)}</div>
      ${v.rev?`<div class="rev">&#128176; ${esc(v.rev)}</div>`:''}
      ${metrics?`<div class="metrics">${metrics}</div>`:''}
      ${v.next?`<div class="next"><div class="nk">Next</div><div class="nv">${esc(v.next)}</div></div>`:''}
      ${v.monetization?`<div class="money"><span class="mlbl2">&#128181; Monetize</span> ${esc(v.monetization)}</div>`:''}
      ${v.flag?`<div class="flag">${esc(v.flag)}</div>`:''}
      ${links?`<div class="card-links">${links}</div>`:''}
      <div class="ctrl-row">${openBtn}${browseBtn}${editBtn}</div>
      ${v.updated?`<div class="updated">updated ${esc(v.updated)}</div>`:''}
    </div>`;
  }
  function applyFilter() {
    document.querySelectorAll('.card').forEach(c => {
      const laneOk = activeLane==='All' || c.dataset.lane===activeLane;
      const qOk = !query || c.dataset.text.includes(query);
      c.classList.toggle('hidden', !(laneOk && qOk));
    });
  }
  function renderFooter() {
    const v = (STATE.data.ventures||[]);
    const mode = STATE.backend ? '<span class="mode-pill mode-live">CONTROL BACKEND LIVE</span>' : '<span class="mode-pill mode-static">STATIC MODE - run start.ps1 for controls</span>';
    $('footer').innerHTML = `${mode} &middot; ${v.length} ventures &middot; ${v.filter(x=>x.status==='live').length} live &middot; ${v.filter(x=>x.status==='active').length} active &middot; ${(STATE.revenue||[]).length} ledger entries &middot; ${(STATE.meetings||[]).length} meetings &middot; data ${esc(STATE.data.meta.asOf||'')}`;
  }

  /* ---------------- static event wiring (delegation) ---------------- */
  function wireStatic() {
    $('filters').addEventListener('click', e => { const t = e.target.closest('.tab'); if (!t) return;
      activeLane = t.dataset.lane; document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active', x===t)); applyFilter(); });
    document.addEventListener('input', e => { if (e.target && e.target.id==='search') { query = e.target.value.toLowerCase().trim(); applyFilter(); } });
    document.addEventListener('click', e => {
      const oc = e.target.closest('[data-open]'); if (oc) { openPath(oc.getAttribute('data-open')); return; }
      const cb = e.target.closest('[data-act]'); if (!cb) return;
      const act = cb.dataset.act;
      if (act==='open') openPath(cb.dataset.path);
      else if (act==='browse') browseModal(cb.dataset.path);
      else if (act==='edit') editModal(cb.dataset.id);
    });
    $('btn-log-rev').addEventListener('click', logRevenueModal);
    $('btn-log-mtg').addEventListener('click', logMeetingModal);
    $('data-btn').addEventListener('click', dataModal);
  }

  /* ---------------- portability: import / export / blank ---------------- */
  function exportData() {
    const bundle = { _format: 'bdp-mission-control', _version: 1, exportedAt: new Date().toISOString(),
      data: STATE.data, revenue: STATE.revenue, meetings: STATE.meetings, config: STATE.config };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = ((STATE.data.meta.company || 'mission-control').toLowerCase().replace(/[^a-z0-9]+/g, '-')) + '-export.json';
    a.click(); URL.revokeObjectURL(a.href); toast('Exported your data', 'ok');
  }
  async function applyImport(bundle) {
    if (!bundle || !bundle.data || !Array.isArray(bundle.data.ventures)) { toast('That is not a valid Mission Control export', 'err'); return; }
    if (STATE.backend) {
      const r = await api('/api/import', { data: bundle.data, revenue: bundle.revenue || [], meetings: bundle.meetings || [], config: bundle.config || STATE.config });
      if (r.ok) { toast('Imported. Reloading...', 'ok'); setTimeout(() => location.reload(), 700); } else { toast('Import failed: ' + r.error, 'err'); }
    } else {
      STATE.data = bundle.data; STATE.revenue = bundle.revenue || []; STATE.meetings = bundle.meetings || []; STATE.config = bundle.config || STATE.config;
      closeModal(); renderAll(); toast('Loaded for this session (run the local app to save)', 'ok');
    }
  }
  function importFile() {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
    inp.onchange = () => { const f = inp.files[0]; if (!f) return; const rd = new FileReader();
      rd.onload = () => { try { applyImport(JSON.parse(rd.result)); } catch (e) { toast('Could not read that file', 'err'); } };
      rd.readAsText(f); };
    inp.click();
  }
  function startBlank() {
    const name = prompt('Name your company / business:', 'My Company');
    if (name === null) return;
    const today = new Date().toISOString().slice(0, 10);
    const blank = { data: {
        meta: { company: name || 'My Company', operator: 'You', tagline: 'Mission control for ' + (name || 'my business') + '.', asOf: today, northStar: 'Set your north-star goal' },
        kpis: [
          { label: 'Your Revenue', value: '$0', sub: 'log your first dollar', trend: 'flat', accent: 'rose' },
          { label: 'Ventures', value: '0', sub: 'add your first', trend: 'flat', accent: 'cyan' },
          { label: 'Live', value: '0', sub: 'nothing live yet', trend: 'flat', accent: 'green' },
          { label: 'Meetings / wk', value: '0', sub: 'fill the calendar', trend: 'flat', accent: 'violet' },
        ],
        goals: [], focus: [],
        lanes: ['SaaS', 'Real Estate', 'Trading', 'Content', 'Services', 'Ops', 'Other'],
        ventures: [], quickLinks: [] },
      revenue: [], meetings: [],
      config: { weeklyMeetingTarget: 10, monthlyRevenueTarget: 10000, bookingLinks: [], outreachTargets: [] } };
    applyImport(blank);
  }
  function dataModal() {
    openModal(`
      <div class="modal-head"><h2>&#8645; Your data</h2><button class="x" onclick="BDP.closeModal()">&times;</button></div>
      <div class="modal-body">
        <div class="banner info">Mission Control is yours to run for any business. Export a backup, import someone else's, or start a blank cockpit for your own company. ${STATE.backend ? 'Changes save to this machine.' : 'Static mode: imports load for this session only.'}</div>
        <div style="display:grid;gap:10px">
          <button class="btn btn-primary" id="d-export">&#11015; Export my data (JSON)</button>
          <button class="btn" id="d-import">&#11014; Import a Mission Control file</button>
          <button class="btn" id="d-blank">&#10024; Start a blank business</button>
          <button class="btn" id="d-notion">&#128218; Sync to Notion</button>
        </div>
        <div id="d-notion-out"></div>
        <div class="hint" style="margin-top:16px;font-size:11px;color:var(--faint);line-height:1.6">
          To run your own copy: download the <code>command-center</code> folder, run <code>.\\start.ps1</code>, then <b>Start a blank business</b> or <b>Import</b> your data. Your numbers live in <code>store.json</code> / <code>revenue.js</code> / <code>meetings.js</code>.
        </div>
      </div>`);
    $('d-export').addEventListener('click', exportData);
    $('d-import').addEventListener('click', importFile);
    $('d-blank').addEventListener('click', startBlank);
    $('d-notion').addEventListener('click', async () => {
      if (!STATE.backend) { toast('Run the local app (start.ps1) to sync Notion', 'err'); return; }
      const out = $('d-notion-out'); out.innerHTML = '<div class="console">Syncing to Notion...</div>';
      const r = await api('/api/notion/sync', {});
      out.innerHTML = `<div class="console"><span class="${r.ok ? 'ok' : 'err'}">${esc(r.out || r.err || r.error || (r.ok ? 'done' : 'failed'))}</span></div>`;
      toast(r.ok ? 'Synced to Notion' : 'Notion sync needs setup (see NOTION_SETUP.md)', r.ok ? 'ok' : 'err');
    });
  }

  /* ---------------- actions ---------------- */
  async function openPath(path) {
    if (STATE.backend) { const r = await api('/api/open', { path }); toast(r.ok ? 'Opened in Explorer' : ('Open failed: '+r.error), r.ok?'ok':'err'); }
    else { window.open(resolvePath(path), '_blank'); }
  }

  /* ---------------- modals ---------------- */
  function openModal(html) { $('modal').innerHTML = html; $('modal-bg').classList.add('open'); }
  function closeModal() { $('modal-bg').classList.remove('open'); }
  function toast(msg, kind) { const t = $('toast'); t.textContent = msg; t.className = 'toast show ' + (kind||''); setTimeout(()=>{ t.className='toast'; }, 2600); }

  const STATUS_OPTS = ['live','active','pending','parked','paused','dormant'];
  const HEALTH_OPTS = ['good','watch','risk','unknown'];
  function opts(list, sel) { return list.map(o=>`<option value="${o}"${o===sel?' selected':''}>${o}</option>`).join(''); }

  function editModal(id) {
    const v = (STATE.data.ventures||[]).find(x=>x.id===id); if (!v) return;
    const lanes = STATE.data.lanes || [];
    const metricsText = (v.metrics||[]).map(m=>`${m.k} = ${m.v}`).join('\n');
    openModal(`
      <div class="modal-head"><h2>Edit: ${esc(v.name)}</h2><button class="x" onclick="BDP.closeModal()">&times;</button></div>
      <div class="modal-body">
        ${STATE.backend ? '' : '<div class="banner warn">Static mode: edits will not save. Run <code>start.ps1</code> to enable saving.</div>'}
        <div class="field-row">
          <div class="field"><label>Status</label><select id="e-status">${opts(STATUS_OPTS, v.status)}</select></div>
          <div class="field"><label>Health</label><select id="e-health">${opts(HEALTH_OPTS, v.health)}</select></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Lane</label><select id="e-lane">${opts(lanes, v.lane)}</select></div>
          <div class="field"><label>MRR / revenue pill</label><input id="e-mrr" value="${esc(v.mrr||'')}" /></div>
        </div>
        <div class="field"><label>Next action</label><textarea id="e-next">${esc(v.next||'')}</textarea></div>
        <div class="field"><label>Revenue model</label><input id="e-rev" value="${esc(v.rev||'')}" /></div>
        <div class="field"><label>Risk flag</label><textarea id="e-flag">${esc(v.flag||'')}</textarea></div>
        <div class="field"><label>Metrics (one per line: key = value)</label><textarea id="e-metrics" style="min-height:90px">${esc(metricsText)}</textarea></div>
        <div class="modal-actions"><button class="btn" onclick="BDP.closeModal()">Cancel</button><button class="btn btn-primary" id="e-save">Save</button></div>
      </div>`);
    $('e-save').addEventListener('click', async () => {
      const metrics = $('e-metrics').value.split('\n').map(l=>l.trim()).filter(Boolean).map(l => {
        const i = l.indexOf('='); return i<0 ? null : { k: l.slice(0,i).trim(), v: l.slice(i+1).trim() };
      }).filter(Boolean);
      const patch = { status:$('e-status').value, health:$('e-health').value, lane:$('e-lane').value,
        mrr:$('e-mrr').value, next:$('e-next').value, rev:$('e-rev').value, flag:$('e-flag').value, metrics };
      if (!STATE.backend) { toast('Static mode: not saved. Run start.ps1.', 'err'); return; }
      const r = await api('/api/venture', { id, patch });
      if (r.ok) { toast('Saved', 'ok'); closeModal(); await refresh(); } else { toast('Save failed: '+r.error, 'err'); }
    });
  }

  async function browseModal(path) {
    if (!STATE.backend) {
      openModal(`<div class="modal-head"><h2>Files / Run</h2><button class="x" onclick="BDP.closeModal()">&times;</button></div>
        <div class="modal-body"><div class="banner warn">Running scripts needs the control backend. Run <code>start.ps1</code>, then reopen.</div>
        <div class="banner info">Folder: <code>${esc(path)}</code></div></div>`);
      return;
    }
    openModal(`<div class="modal-head"><h2>Files / Run</h2><button class="x" onclick="BDP.closeModal()">&times;</button></div>
      <div class="modal-body"><div id="fb-path" class="banner info"></div><div class="fb-list" id="fb-list">Loading...</div>
      <div class="console" id="fb-console" style="display:none"></div></div>`);
    loadDir(path);
  }
  async function loadDir(path) {
    const r = await api('/api/listdir', { path });
    if (!r.ok) { $('fb-list').innerHTML = `<div class="empty" style="padding:12px">${esc(r.error)}</div>`; return; }
    $('fb-path').innerHTML = `Folder: <code>${esc(r.rel)}</code>`;
    const parent = r.rel.includes('/') ? r.rel.slice(0, r.rel.lastIndexOf('/')) : '';
    let html = parent ? `<div class="fb-item"><span class="nm dir" data-dir="${esc(parent)}">.. (up)</span></div>` : '';
    html += r.items.map(it => {
      const run = it.runnable ? `<button class="fb-run" data-run="${esc(it.rel)}">Run</button>` : '';
      const open = `<button class="fb-open" data-openf="${esc(it.rel)}">Open</button>`;
      const nm = it.dir ? `<span class="nm dir" data-dir="${esc(it.rel)}">${esc(it.name)}</span>` : `<span class="nm">${esc(it.name)}</span>`;
      return `<div class="fb-item">${nm}${run}${open}</div>`;
    }).join('');
    $('fb-list').innerHTML = html || '<div class="empty" style="padding:12px">empty folder</div>';
    $('fb-list').querySelectorAll('[data-dir]').forEach(el => el.addEventListener('click', () => loadDir(el.dataset.dir)));
    $('fb-list').querySelectorAll('[data-openf]').forEach(el => el.addEventListener('click', () => openPath(el.dataset.openf)));
    $('fb-list').querySelectorAll('[data-run]').forEach(el => el.addEventListener('click', () => runScript(el.dataset.run)));
  }
  async function runScript(path) {
    const c = $('fb-console'); c.style.display='block'; c.innerHTML = `<span>Running ${esc(path)} ...</span>`;
    const r = await api('/api/run', { path });
    if (!r.ok) { c.innerHTML = `<span class="err">Error: ${esc(r.error)}</span>`; return; }
    c.innerHTML = `<span class="${r.code===0?'ok':'err'}">exit ${r.code}</span>\n${esc(r.stdout||'')}${r.stderr?`\n<span class="err">${esc(r.stderr)}</span>`:''}`;
    refresh();
  }

  function logRevenueModal() {
    const lanes = STATE.data.lanes || [];
    const vens = (STATE.data.ventures||[]).map(v=>v.name);
    openModal(`
      <div class="modal-head"><h2>&#128176; Log a dollar</h2><button class="x" onclick="BDP.closeModal()">&times;</button></div>
      <div class="modal-body">
        <div class="field-row">
          <div class="field"><label>Amount (USD)</label><input id="r-amt" type="number" step="0.01" placeholder="10000" /></div>
          <div class="field"><label>Date</label><input id="r-date" type="date" value="${todayISO()}" /></div>
        </div>
        <div class="field"><label>Venture</label><input id="r-ven" list="r-venlist" placeholder="934 10th St" /><datalist id="r-venlist">${vens.map(n=>`<option value="${esc(n)}">`).join('')}</datalist></div>
        <div class="field-row">
          <div class="field"><label>Lane</label><select id="r-lane">${opts(lanes, lanes[0])}</select></div>
          <div class="field"><label>Type</label><select id="r-type">${opts(['one-time','recurring','assignment','commission','sale','payout','other'],'one-time')}</select></div>
        </div>
        <div class="field"><label>Note</label><input id="r-note" placeholder="first assignment fee" /></div>
        <div class="modal-actions"><button class="btn" onclick="BDP.closeModal()">Cancel</button><button class="btn btn-primary" id="r-save">Log it</button></div>
      </div>`);
    $('r-save').addEventListener('click', async () => {
      const body = { amount: parseFloat($('r-amt').value||'0'), date:$('r-date').value, venture:$('r-ven').value||'Unknown',
        lane:$('r-lane').value, type:$('r-type').value, note:$('r-note').value };
      if (!body.amount) { toast('Enter an amount', 'err'); return; }
      if (STATE.backend) { const r = await api('/api/revenue', body); if (r.ok) { toast('Logged '+f$(body.amount), 'ok'); closeModal(); await refresh(); } else toast('Failed: '+r.error,'err'); }
      else { copyCmd(`.\\log-revenue.ps1 -Amount ${body.amount} -Venture "${body.venture}" -Lane "${body.lane}" -Type ${body.type} -Note "${body.note}"`); }
    });
  }

  function logMeetingModal() {
    const lanes = STATE.data.lanes || [];
    openModal(`
      <div class="modal-head"><h2>&#128197; Log a meeting</h2><button class="x" onclick="BDP.closeModal()">&times;</button></div>
      <div class="modal-body">
        <div class="field"><label>Title</label><input id="m-title" placeholder="Buyer showing - 934 10th St" /></div>
        <div class="field-row">
          <div class="field"><label>Date</label><input id="m-date" type="date" value="${todayISO()}" /></div>
          <div class="field"><label>Time</label><input id="m-time" type="time" /></div>
        </div>
        <div class="field"><label>With</label><input id="m-with" placeholder="Howard / buyer" /></div>
        <div class="field-row">
          <div class="field"><label>Lane</label><select id="m-lane">${opts(lanes, lanes[0])}</select></div>
          <div class="field"><label>Type</label><select id="m-type">${opts(['internal','sales','investor','partner','seller','buyer','discovery','other'],'sales')}</select></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Status</label><select id="m-status">${opts(['confirmed','requested','target'],'confirmed')}</select></div>
          <div class="field"><label>Link</label><input id="m-link" placeholder="https://..." /></div>
        </div>
        <div class="field"><label>Note</label><input id="m-note" /></div>
        <div class="modal-actions"><button class="btn" onclick="BDP.closeModal()">Cancel</button><button class="btn btn-primary" id="m-save">Log it</button></div>
      </div>`);
    $('m-save').addEventListener('click', async () => {
      const body = { title:$('m-title').value||'Meeting', date:$('m-date').value, time:$('m-time').value, with:$('m-with').value,
        lane:$('m-lane').value, type:$('m-type').value, status:$('m-status').value, link:$('m-link').value, note:$('m-note').value };
      if (STATE.backend) { const r = await api('/api/meeting', body); if (r.ok) { toast('Meeting logged', 'ok'); closeModal(); await refresh(); } else toast('Failed: '+r.error,'err'); }
      else { copyCmd(`.\\log-meeting.ps1 -Title "${body.title}" -Date ${body.date} -Time ${body.time} -With "${body.with}" -Lane "${body.lane}" -Type ${body.type} -Status ${body.status}`); }
    });
  }

  function copyCmd(cmd) {
    try { navigator.clipboard.writeText(cmd); } catch (e) {}
    openModal(`<div class="modal-head"><h2>Run this to save</h2><button class="x" onclick="BDP.closeModal()">&times;</button></div>
      <div class="modal-body"><div class="banner info">Static mode (no backend). This command was copied to your clipboard. Paste it in PowerShell inside the command-center folder.</div>
      <div class="console">${esc(cmd)}</div>
      <div class="modal-actions"><button class="btn btn-primary" onclick="BDP.closeModal()">Done</button></div></div>`);
  }

  /* ---------------- JARVIS (talk to it) ---------------- */
  let jarvisOpen = false, voiceOut = false, recog = null, listening = false, greeted = false;
  function initJarvis() {
    $('jarvis-fab').addEventListener('click', toggleJarvis);
    $('jp-close').addEventListener('click', toggleJarvis);
    $('jp-send').addEventListener('click', jarvisSend);
    $('jp-text').addEventListener('keydown', e => { if (e.key === 'Enter') jarvisSend(); });
    $('jp-voice').addEventListener('click', () => {
      voiceOut = !voiceOut; $('jp-voice').classList.toggle('active', voiceOut);
      if (voiceOut) speak('Voice replies on.');
    });
    $('jp-mic').addEventListener('click', micToggle);
  }
  function toggleJarvis() {
    jarvisOpen = !jarvisOpen;
    $('jarvis-panel').classList.toggle('open', jarvisOpen);
    $('jarvis-fab').style.display = jarvisOpen ? 'none' : 'flex';
    if (jarvisOpen && !greeted) {
      greeted = true;
      jarvisBot(`I'm your BDP Mission Control. I track your ${(STATE.data.ventures||[]).length} ventures, revenue, and meetings. Ask me anything, or tap a chip.`);
      addChips(['Revenue', 'Focus today', 'Risks', 'Real estate', 'Brocco', 'Meetings']);
      $('jp-text').focus();
    }
  }
  function micToggle() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast('Voice input needs Chrome', 'err'); return; }
    if (listening) { try { recog.stop(); } catch (e) {} return; }
    recog = new SR(); recog.lang = 'en-US'; recog.interimResults = false; recog.maxAlternatives = 1;
    recog.onresult = e => { $('jp-text').value = e.results[0][0].transcript; jarvisSend(); };
    recog.onend = () => { listening = false; $('jp-mic').classList.remove('jp-mic-on'); };
    recog.onerror = () => { listening = false; $('jp-mic').classList.remove('jp-mic-on'); };
    recog.start(); listening = true; $('jp-mic').classList.add('jp-mic-on');
  }
  function speak(text) {
    if (!voiceOut || !window.speechSynthesis) return;
    const plain = text.replace(/\*\*/g, '').replace(/\n+/g, '. ').replace(/[#>\-]/g, '');
    const u = new SpeechSynthesisUtterance(plain); u.rate = 1.05; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
  }
  function msgHtml(text) {
    return esc(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
  }
  function addMsg(text, who) {
    const d = document.createElement('div'); d.className = 'jp-msg ' + who; d.innerHTML = who === 'bot' ? msgHtml(text) : esc(text);
    $('jp-msgs').appendChild(d); $('jp-msgs').scrollTop = $('jp-msgs').scrollHeight;
  }
  function jarvisBot(text) { addMsg(text, 'bot'); speak(text); }
  function addChips(items) {
    const wrap = document.createElement('div'); wrap.className = 'jp-chips';
    wrap.innerHTML = items.map(t => `<span class="jp-chip">${esc(t)}</span>`).join('');
    $('jp-msgs').appendChild(wrap);
    wrap.querySelectorAll('.jp-chip').forEach(c => c.addEventListener('click', () => { $('jp-text').value = c.textContent; jarvisSend(); }));
  }
  async function jarvisSend() {
    const inp = $('jp-text'); const text = inp.value.trim(); if (!text) return;
    addMsg(text, 'user'); inp.value = '';
    const reply = await jarvisRespond(text);
    jarvisBot(reply);
  }
  function revStats() {
    const now = new Date(), tm = now.toISOString().slice(0,7);
    const rev = (STATE.revenue||[]).filter(r => typeof r.amount === 'number');
    const total = rev.reduce((s,r)=>s+r.amount,0);
    const mtd = rev.filter(r=>r.date.slice(0,7)===tm).reduce((s,r)=>s+r.amount,0);
    const rec = rev.filter(r=>r.type==='recurring'); const months=[...new Set(rec.map(r=>r.date.slice(0,7)))].sort();
    const mrr = months.length ? rec.filter(r=>r.date.slice(0,7)===months.slice(-1)[0]).reduce((s,r)=>s+r.amount,0) : 0;
    return { rev, total, mtd, mrr };
  }
  function findVenture(q) {
    const vs = STATE.data.ventures||[]; q = q.toLowerCase().trim();
    return vs.find(x=>x.name.toLowerCase()===q) || vs.find(x=>x.id===q.replace(/\s+/g,'-'))
      || vs.find(x=>x.name.toLowerCase().includes(q) && q.length>2)
      || vs.find(x=>q.includes(x.name.toLowerCase().split(/[ (]/)[0]) && x.name.length>3);
  }
  async function jarvisRespond(raw) {
    const m = raw.toLowerCase().trim(); const D = STATE.data, vs = D.ventures||[];
    // ACTION: log revenue
    let mm = raw.match(/log\s+\$?\s*([\d,.]+)\s+(?:from|for)\s+(.+)/i);
    if (mm) {
      const amt = parseFloat(mm[1].replace(/,/g,'')); const name = mm[2].trim(); const v = findVenture(name);
      const lane = v ? v.lane : 'Other';
      if (!STATE.backend) return `Start the backend (start.ps1) and I can log it. For now run:\n.\\log-revenue.ps1 -Amount ${amt} -Venture "${name}" -Lane "${lane}" -Type one-time`;
      const r = await api('/api/revenue', { amount: amt, venture: v?v.name:name, lane, type:'one-time', note:'via Jarvis' });
      if (r.ok) { await refresh(); return `Logged **${f$(amt)}** from ${v?v.name:name}. All-time is now **${f$(revStats().total)}**.`; }
      return 'I could not log that one.';
    }
    // ACTION: open a venture
    mm = m.match(/^(?:open|go to|show me the folder for)\s+(.+)/);
    if (mm) { const v = findVenture(mm[1]); if (v && ventureFolder(v)) { openPath(ventureFolder(v)); return `Opening **${v.name}**.`; } return `I do not have a folder for "${mm[1]}".`; }
    // ACTION: pulse
    if (/\b(pulse|refresh metrics|update metrics|recalc)\b/.test(m)) {
      if (!STATE.backend) return 'I need the backend (start.ps1) to refresh the pulse.';
      await api('/api/pulse'); await refresh(); return `Pulse refreshed. MRR **${f$((STATE.metrics&&STATE.metrics.latest&&STATE.metrics.latest.mrr)||0)}**, ${(STATE.meetings||[]).length} meetings tracked.`;
    }
    // revenue
    if (/\b(revenue|money|mrr|income|earn|made|sales|cash|dollar|profit)\b/.test(m)) {
      const s = revStats();
      return `You have made **${f$(s.total)}** all-time across ${s.rev.length} logged ${s.rev.length===1?'entry':'entries'}. This month: **${f$(s.mtd)}**. Recurring MRR: **${f$(s.mrr)}**.` + (s.total===0 ? `\nYou have not logged a dollar yet. Tell me "log 10000 from 934 10th St" when you close. (Options AI's $11K is the client's metric, not yours.)` : '');
    }
    // meetings
    if (/\b(meeting|calendar|booked|schedule|appointment|call)\b/.test(m)) {
      const MTG = STATE.meetings||[]; const now=new Date(), day=(now.getDay()+6)%7;
      const ws=new Date(now); ws.setDate(now.getDate()-day); ws.setHours(0,0,0,0); const we=new Date(ws); we.setDate(ws.getDate()+7);
      const wsI=ws.toISOString().slice(0,10), weI=we.toISOString().slice(0,10);
      const booked=MTG.filter(x=>x.date>=wsI&&x.date<weI&&x.status!=='target').length;
      const target=(STATE.config&&STATE.config.weeklyMeetingTarget)||15;
      const up=MTG.filter(x=>x.date>=now.toISOString().slice(0,10)).sort((a,b)=>a.date<b.date?-1:1)[0];
      return `**${booked}/${target}** meetings booked this week. ${up?`Next up: **${up.title}** (${up.date}${up.time?' '+up.time:''}, ${up.status}).`:'Nothing on the calendar yet, work the outreach pipeline.'}`;
    }
    // focus
    if (/\b(focus|priorit|today|what should i|do now|important|first)\b/.test(m)) {
      const f = D.focus||[]; return `Your top priorities right now:\n` + f.slice(0,5).map(x=>`**${x.p}.** ${x.text}`).join('\n');
    }
    // risks
    if (/\b(risk|flag|danger|security|leak|warn|problem|broke|issue)\b/.test(m)) {
      const fl = vs.filter(v=>v.flag); return `**${fl.length}** ventures carry risk flags. Biggest:\n` + fl.slice(0,5).map(v=>`- **${v.name}**: ${v.flag.replace(/^[^A-Za-z0-9]+/,'').slice(0,100)}`).join('\n') + `\nAlso: a master secrets file with 40+ live keys was quarantined today, rotate those keys.`;
    }
    // overview / counts
    if (/\b(how many|count|portfolio|overview|status|summary|ventures|lanes|everything)\b/.test(m)) {
      const by = s => vs.filter(v=>v.status===s).length;
      return `**${vs.length} ventures** across ${(D.lanes||[]).length} lanes: ${by('live')} live, ${by('active')} active, ${by('pending')} pending, ${by('parked')+by('paused')} parked/paused, ${by('dormant')} dormant. Your revenue: **${f$(revStats().total)}**.`;
    }
    // lane
    for (const lane of (D.lanes||[])) {
      if (m.includes(lane.toLowerCase())) {
        const list = vs.filter(v=>v.lane===lane);
        return `**${lane}** (${list.length}):\n` + list.map(v=>`- **${v.name}** [${v.status}]${v.mrr&&v.mrr!=='$0'?' '+v.mrr:''}`).join('\n');
      }
    }
    // a specific venture
    const v = findVenture(m);
    if (v) return `**${v.name}** [${v.status} / ${v.health}] in ${v.lane}.\n${v.blurb}\n**Next:** ${v.next||'-'}${v.flag?`\n**Flag:** ${v.flag.replace(/^[^A-Za-z0-9]+/,'')}`:''}`;
    // help
    if (/\b(help|what can you|commands|how do|abilities)\b/.test(m))
      return `I can answer about **revenue**, **meetings**, **focus**, **risks**, any **lane** (e.g. "real estate"), or any **venture** by name. I can act too: "log 10000 from 934 10th St", "open Brocco", "refresh pulse". I also take voice, tap the mic.`;
    // greeting
    if (/^(hi|hello|hey|jarvis|yo|sup|good morning|good evening)\b/.test(m))
      return `Hey. ${(STATE.data.ventures||[]).length} ventures, ${f$(revStats().total)} earned, ${(STATE.meetings||[]).filter(x=>x.status!=='target').length} meetings on the books. What do you want to know?`;
    // fallback search
    const hits = vs.filter(x=>(x.name+' '+(x.blurb||'')+' '+(x.rev||'')).toLowerCase().includes(m)).slice(0,4);
    if (hits.length) return `Closest matches:\n` + hits.map(x=>`- **${x.name}** [${x.status}]`).join('\n');
    return `Not sure on that one. Try "revenue", "what should I focus on", "show trading", "risks", a venture name, or "log 5000 from Brocco".`;
  }

  return { boot, closeModal };
})();
BDP.boot();
