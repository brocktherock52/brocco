/* brocco.ai -main.js: nav scroll, FAQ accordion, billing toggle, reveals */

(function () {
  /* ── nav glassify on scroll ── */
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── FAQ accordion ── */
  document.querySelectorAll('.faq__item').forEach(item => {
    const q = item.querySelector('.faq__q');
    const a = item.querySelector('.faq__a');
    if (!q || !a) return;
    q.addEventListener('click', () => {
      const open = item.classList.toggle('open');
      a.style.maxHeight = open ? a.scrollHeight + 'px' : '0';
    });
  });

  /* ── billing toggle (annual vs monthly) ── */
  const toggle = document.getElementById('billing-toggle');
  if (toggle) {
    toggle.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        toggle.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.billing;
        document.querySelectorAll('.tier__price .amount[data-monthly]').forEach(el => {
          const val = mode === 'monthly' ? el.dataset.monthly : el.dataset.annual;
          el.textContent = '$' + val;
        });
        document.querySelectorAll('.tier__price .per[data-per-monthly]').forEach(el => {
          el.textContent = mode === 'monthly' ? el.dataset.perMonthly : el.dataset.perAnnual;
        });
      });
    });
  }

  /* ── reveal on scroll (CSS class flip) ── */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  }

  /* ── prefers-reduced-motion: skip reveal anims ── */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  }

  /* ── pricing checkout buttons (POST /api/checkout, redirect to Stripe) ── */
  document.querySelectorAll('[data-checkout-tier]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const tier = btn.dataset.checkoutTier;
      const billingActive = document.querySelector('#billing-toggle button.active');
      const interval = billingActive ? billingActive.dataset.billing : 'annual';
      const original = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = 'redirecting...';
      try {
        const r = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier, interval }),
        });
        if (r.status === 503) {
          const d = await r.json().catch(() => ({}));
          alert(d.detail || 'Checkout offline. Email hello@brocco.ai to start a paid plan.');
          btn.disabled = false; btn.innerHTML = original;
          return;
        }
        const data = await r.json();
        if (data.url) { window.location.href = data.url; return; }
        alert(data.error || 'Checkout failed.');
      } catch (e) {
        alert('Network error: ' + e.message);
      }
      btn.disabled = false;
      btn.innerHTML = original;
    });
  });

  /* ── smooth in-page nav ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      const top = t.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
