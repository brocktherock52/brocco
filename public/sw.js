/* brocco service worker - cache the app shell so demo mode works offline. */
const VERSION = 'brocco-v2.1';
const SHELL = [
  '/',
  '/app',
  '/manifest.webmanifest',
  '/assets/favicon.svg',
  '/assets/logomark.svg',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' })))),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Never cache API or any cross-origin (Anthropic, Tavily, fonts, analytics).
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (req.method !== 'GET') return;

  // network-first for HTML, cache-first for static assets
  if (req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(VERSION).then((c) => c.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req).then((m) => m || caches.match('/'))),
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((m) => m || fetch(req).then((res) => {
      const clone = res.clone();
      caches.open(VERSION).then((c) => c.put(req, clone));
      return res;
    })),
  );
});
