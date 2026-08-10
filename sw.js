// Synth Verdict — service worker
// Cache-first for static assets, network-first fallback for HTML so
// article edits show up quickly while still working offline.

const CACHE_NAME = 'synth-verdict-v1';

const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './reviews/omnisphere.html',
  './reviews/nord-lead-4.html',
  './reviews/nexus5.html',
  './reviews/rippler.html',
  './reviews/xo-xo.html',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/favicon-32.png',
  './icons/apple-touch-icon.png'
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
    // network-first for pages
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

  // cache-first for everything else (css, images, fonts)
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      });
    })
  );
});
