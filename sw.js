const CACHE = 'nestd-v1';
const FILES = [
  './index.html',
  './css/styles.css',
  './js/data.js',
  './js/store.js',
  './js/ui.js',
  './js/render.js',
  './js/grocery.js',
  './js/life.js',
  './js/app.js',
  './icon-192.png',
  './icon-512.png',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // network-first for Google Fonts so they update, cache fallback for offline
  if (e.request.url.includes('fonts.googleapis.com') || e.request.url.includes('fonts.gstatic.com')) {
    e.respondWith(
      fetch(e.request).then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  e.respondWith(
    fetch(e.request).then(r => {
      const clone = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return r;
    }).catch(() => caches.match(e.request))
  );
});

// Receive canvas-generated icon blobs from the page and cache them
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'CACHE_ICON') {
    caches.open(CACHE).then(c => {
      c.put('./'+e.data.name, new Response(e.data.blob, {headers:{'Content-Type':'image/png'}}));
    });
  }
});
