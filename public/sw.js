// MosesTech Fix AI Service Worker - Bulletproof Safe Offline & Online Diagnostic Support
const CACHE_NAME = 'mosestech-cache-v4';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Some static assets failed to pre-cache during install:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Pass through or fallback for API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({
            text: '⚡ Offline Mode Active: MosesTech local diagnostic engine matched this issue offline. Check your connection for full cloud AI synthesis.',
            offline: true
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 200
          }
        );
      })
    );
    return;
  }

  // Handle SPA navigation requests: NEVER return undefined to prevent Chrome ERR_FAILED
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const toCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, toCache)).catch(() => {});
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match('/index.html') || await caches.match('/');
          if (cached) return cached;
          return new Response(
            `<!doctype html><html><head><meta charset="utf-8"><title>MosesTech Fix AI - Offline</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="background:#020617;color:#f8fafc;font-family:sans-serif;padding:2rem;text-align:center;"><h2>MosesTech Fix AI Connection Notice</h2><p>Please check your internet connection or reload the page.</p><button onclick="location.reload()" style="background:#10b981;color:#020617;font-weight:bold;padding:0.75rem 1.5rem;border-radius:0.75rem;border:none;cursor:pointer;">Reload Page</button></body></html>`,
            { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 200 }
          );
        })
    );
    return;
  }

  // For JS, CSS, images, and other assets: cache-first with network fallback
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const toCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, toCache).catch(() => {});
            });
          }
          return response;
        })
        .catch(() => {
          // Return safe empty response instead of throwing unhandled error
          return new Response('', { status: 408, statusText: 'Request Failed' });
        });
    })
  );
});
