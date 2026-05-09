const CACHE_NAME = 'syncqueue-v12';
const SHELL_URL = '/';
const ASSETS = [
  SHELL_URL,
  '/dashboard',
  '/manifest.json',
  '/logo.png',
  '/icon.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Arming shell persistence v12');
      return cache.addAll(ASSETS);
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

  // 1. nav fallback to app shell
  if (request.mode === 'navigate') {
    try {
      const response = await fetch(request);
      if (response.ok) return response;
      throw new Error('Offline');
    } catch (e) {
      console.log('[SW v12] Serving Shell for navigate:', url.pathname);
      const shell = await cache.match(SHELL_URL);
      if (shell) return shell;
      // try cached dashboard if shell fails
      const dashboard = await cache.match('/dashboard');
      if (dashboard) return dashboard;
    }
  }

  // 2. static assets cache-first
  const isStatic = 
    url.pathname.startsWith('/_next/static/') || 
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname === '/manifest.json';

  if (isStatic) {
    const cached = await cache.match(request);
    if (cached) return cached;
  }

  // 3. network first for data, fallback to cache
  try {
    const response = await fetch(request);
    if (response.ok && url.origin === self.location.origin) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (e) {
    const cached = await cache.match(request);
    if (cached) return cached;
    
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
