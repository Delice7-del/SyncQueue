const CACHE_NAME = 'syncqueue-v6';
const OFFLINE_URL = '/offline';

const ASSETS_TO_CACHE = [
  '/',
  OFFLINE_URL,
  '/manifest.json',
  '/logo.png',
  '/icon.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching core assets');
      return Promise.all(
        ASSETS_TO_CACHE.map(async (url) => {
          try {
            const response = await fetch(url, { cache: 'reload' });
            if (response.ok) return await cache.put(url, response);
          } catch (e) {
            console.error(`[SW] Pre-cache failed for ${url}:`, e);
          }
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

async function getFallbackResponse(request) {
  const cache = await caches.open(CACHE_NAME);
  const url = new URL(request.url);

  // If it's a navigation or a Next.js data request, try the app shell (/)
  if (request.mode === 'navigate' || url.search.includes('_rsc')) {
    const shell = await cache.match('/');
    if (shell) return shell;
  }

  // Try the specific requested resource
  const matched = await cache.match(request);
  if (matched) return matched;

  // Try the offline page
  const offline = await cache.match(OFFLINE_URL);
  if (offline) return offline;

  // Final fallback to avoid TypeError
  return new Response('SyncQueue Offline Protocol Active', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: new Headers({ 'Content-Type': 'text/plain' })
  });
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Static Assets & System Chunks - Cache First
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icon') || url.pathname.endsWith('.png') || url.pathname.endsWith('.svg')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => getFallbackResponse(event.request));
      })
    );
    return;
  }

  // 2. Navigation & Everything Else - Network First
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => getFallbackResponse(event.request))
  );
});
