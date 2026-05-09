const CACHE_NAME = 'syncqueue-v10';
const SHELL_URL = '/';
const ASSETS = [
  SHELL_URL,
  '/manifest.json',
  '/logo.png',
  '/icon.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Arming shell persistence v10');
      return cache.addAll(ASSETS).catch(err => console.error('[SW] Pre-cache error:', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

async function handleFetch(request) {
  const cache = await caches.open(CACHE_NAME);
  const url = new URL(request.url);

  // 1. SYSTEM ASSETS - Cache-First
  const isSystemAsset = 
    url.pathname.startsWith('/_next/static/') || 
    url.pathname.startsWith('/icon') || 
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg');

  if (isSystemAsset) {
    const cached = await cache.match(request);
    if (cached) return cached;
  }

  // 2. NAVIGATION & SHELL - Ultra-Aggressive Fallback
  if (request.mode === 'navigate' || url.pathname === SHELL_URL) {
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) return networkResponse;
      throw new Error('Network fail');
    } catch (e) {
      const shell = await cache.match(SHELL_URL);
      console.log('[SW] Shell fallback for:', url.pathname);
      return shell;
    }
  }

  // 3. DATA & ASSETS - Network with Cache Fallback
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200 && url.origin === self.location.origin) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    
    // Fallback to Shell for RSC data requests to prevent white-screens
    if (url.search.includes('_rsc')) {
       return cache.match(SHELL_URL);
    }

    return new Response('Offline Protocol Active', { status: 200 });
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(handleFetch(event.request));
});
