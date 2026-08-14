// Synth Verdict — service worker
// HTML: network-first, so article edits show up immediately when online,
// with a cached fallback for offline use.
// Everything else (CSS/JS/icons): stale-while-revalidate — the cached
// copy is served instantly, while a fresh copy is fetched in the
// background and silently saved for next time. That means new deploys
// of style.css / app.js / icons pick themselves up automatically on
// the next visit — no need to bump CACHE_NAME by hand just to get
// static assets to refresh.

const CACHE_NAME = 'synth-verdict-v16';

const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './omnisphere.html',
  './nord-lead-4.html',
  './jup-8-v.html',
  './nexus5.html',
  './rippler.html',
  './xo-xo.html',
  './life.html',
  './rapid.html',
  './acid-v.html',
  './analog-lab.html',
  './synthmaster3.html',
  './icon-192.png',
  './icon-512.png',
  './favicon-32.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const isHTML = req.headers.get('accept') && req.headers.get('accept').includes('text/html');

  if (isHTML) {
    // network-first for pages: always try to get the latest article
    // text; fall back to cache (or index.html) when offline.
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // stale-while-revalidate for everything else (css, js, images, fonts):
  // serve the cached copy instantly if we have one, and refresh the
  // cache from the network in the background so the next visit already
  // gets the new version — no manual cache-version bump needed.
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(req).then((cached) => {
        const networkFetch = fetch(req)
          .then((res) => {
            if (res && res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    )
  );
});
