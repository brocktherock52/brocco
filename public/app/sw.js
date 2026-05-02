/* Brocco app service worker - app-shell offline cache */

const CACHE = 'brocco-app-v8-cache-bust';
const SHELL = [
  '/app/',
  '/app/styles.css',
  '/app/scripts/agents.js',
  '/app/scripts/app.js',
  '/app/manifest.webmanifest',
  '/assets/favicon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Never cache API or third-party calls (Anthropic, Tavily)
  if (url.pathname.startsWith('/api/') || url.origin !== self.location.origin) return;
  // App shell: cache-first
  if (url.pathname.startsWith('/app/') || url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request).then(resp => {
        if (resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(event.request, copy));
        }
        return resp;
      }).catch(() => cached))
    );
  }
});
