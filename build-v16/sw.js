/**
 * Service Worker — minimal offline cache.
 * Strategy:
 *   - HTML / JS / CSS / JSON từ same-origin → cache-first sau lần đầu (24h TTL)
 *   - Fonts từ Google → cache-first vĩnh viễn
 *   - Imagen API + Gemini API + AI proxy → network-only (không cache)
 *
 * IMPORTANT: bump CACHE_VERSION mỗi khi có breaking change (vd CSP, new endpoint)
 * để force re-cache. Old version SW sẽ delete trong activate handler.
 */

const CACHE_VERSION = 'mac-do-v2';   // bumped: CSP allow workers.dev + proxy support
const FONT_CACHE = 'mac-do-fonts-v1';

const PRECACHE_URLS = ['/', '/manifest.webmanifest', '/icon-192.svg', '/icon-512.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_VERSION && k !== FONT_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass non-GET + AI APIs (network-only)
  if (event.request.method !== 'GET') return;
  if (url.hostname.includes('generativelanguage.googleapis.com')) return;
  if (url.hostname.includes('firestore.googleapis.com')) return;
  if (url.hostname.endsWith('.workers.dev')) return; // Cloudflare Worker proxy
  if (url.hostname.includes('cloudfunctions.net')) return; // Firebase Function proxy

  // Google Fonts → cache forever
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(event.request).then(
          (cached) =>
            cached ||
            fetch(event.request).then((res) => {
              cache.put(event.request, res.clone());
              return res;
            })
        )
      )
    );
    return;
  }

  // Same-origin → cache-first with network fallback
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(CACHE_VERSION).then((cache) =>
        cache.match(event.request).then((cached) => {
          const fetchPromise = fetch(event.request)
            .then((res) => {
              if (res.ok) cache.put(event.request, res.clone());
              return res;
            })
            .catch(() => cached);
          // Stale-while-revalidate
          return cached || fetchPromise;
        })
      )
    );
  }
});
