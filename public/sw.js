const CACHE_NAME = 'syncqueue-v8';
const CORE_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/icon.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/offline',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        CORE_ASSETS.map(url => fetch(url, { cache: 'reload' }).then(res => cache.put(url, res)))
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

// Universal responder to ensure we NEVER return undefined/null to respondWith
async function safeResponse(request) {
  const cache = await caches.open(CACHE_NAME);
  const url = new URL(request.url);

  // 1. Try Cache Match first (even if online, for speed of system assets)
  const cached = await cache.match(request);
  if (cached) return cached;

  // 2. Try Network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok && (url.origin === self.location.origin)) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    // 3. OFFLINE FALLBACKS
    
    // A. Next.js Data / Navigation Fallback
    // If it's a ticket page or a data request for one, serve the root shell
    if (url.pathname.includes('/my-ticket/') || url.search.includes('_rsc') || request.mode === 'navigate') {
      const shell = await cache.match('/');
      if (shell) return shell;
    }

    // B. Offline page
    const offline = await cache.match('/offline');
    if (offline) return offline;

    // C. Hardcoded fallback
    return new Response('SyncQueue Protocol Offline', {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  // Ignore external analytics/extensions
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(safeResponse(event.request));
});
