const CACHE_NAME = 'syncqueue-v9';
const SHELL_URL = '/';
const ASSETS = [
  SHELL_URL,
  '/manifest.json',
  '/logo.png',
  '/icon.png',
  '/offline',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Arming shell persistence');
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

  // 1. SYSTEM ASSETS & SHELL - Strict Cache-First
  const isSystemAsset = 
    url.pathname.startsWith('/_next/static/') || 
    url.pathname.startsWith('/icon') || 
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname === SHELL_URL;

  if (isSystemAsset) {
    const cached = await cache.match(request);
    if (cached) return cached;
    
    // Fallback to Shell if specific static asset fails and we are in navigation mode
    if (request.mode === 'navigate') {
       const shell = await cache.match(SHELL_URL);
       if (shell) return shell;
    }
  }

  // 2. DATA & NAVIGATION - Network with Aggressive Cache Fallback
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200 && url.origin === self.location.origin) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('[SW] Offline fallback triggered for:', url.pathname);
    
    // A. If it's a navigation or Next.js RSC data request, serve the shell
    if (request.mode === 'navigate' || url.search.includes('_rsc') || url.pathname.includes('/my-ticket/')) {
      const shell = await cache.match(SHELL_URL);
      if (shell) {
         console.log('[SW] Serving App Shell for:', url.pathname);
         return shell;
      }
    }

    // B. Check specific cache match
    const cached = await cache.match(request);
    if (cached) return cached;

    // C. Final safety response
    return new Response('Offline Mode Active', {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(handleFetch(event.request));
});
