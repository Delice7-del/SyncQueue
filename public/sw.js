const CACHE_NAME = 'syncqueue-v7';
const CORE_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/icon.png',
  '/offline',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        CORE_ASSETS.map(url => fetch(url).then(res => cache.put(url, res)))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => key !== CACHE_NAME && caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith((async () => {
    try {
      // 1. Try Network first for everything
      const networkResponse = await fetch(event.request);
      
      // Cache successful system responses
      const url = new URL(event.request.url);
      if (networkResponse.ok && (url.origin === self.location.origin)) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, networkResponse.clone());
      }
      
      return networkResponse;
    } catch (error) {
      // 2. Network Failed (Offline) - Try Cache
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) return cachedResponse;

      // 3. SPA Fallback: If it's a page navigation OR Next.js data request (_rsc)
      // return the root shell (/) to keep the app running.
      const url = new URL(event.request.url);
      if (event.request.mode === 'navigate' || url.search.includes('_rsc')) {
        const cache = await caches.open(CACHE_NAME);
        const shell = await cache.match('/');
        if (shell) return shell;
      }

      // 4. Absolute Final Fallback to prevent "TypeError: Failed to convert value to Response"
      return new Response(
        '<!DOCTYPE html><html><body><h1>Offline Protocol Active</h1><script>window.location.href="/";</script></body></html>',
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }
  })());
});
