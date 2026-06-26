/**
 * Service Worker — minimal offline cache.
 * Strategy:
 *   - HTML / CSS / JSON từ same-origin → stale-while-revalidate (24h TTL)
 *   - JS MODULES (lazy chunks) → NETWORK-ONLY (file path có hash, mỗi build mới hash đổi.
 *     Cache-first sẽ làm SW trả index.html fallback → MIME error)
 *   - Fonts từ Google → cache-first vĩnh viễn
 *   - Imagen API + Gemini API + DeepSeek API + AI proxy → network-only (không cache)
 *
 * IMPORTANT: bump CACHE_VERSION mỗi khi có breaking change (CSP, route, JS structure)
 * để force re-cache. Old version SW sẽ delete trong activate handler.
 */

const CACHE_VERSION = 'mac-do-v3';   // bumped v3: skip cache JS modules, allow deepseek
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
  if (url.hostname.includes('api.deepseek.com')) return; // Phase 8.1 DeepSeek
  if (url.hostname.endsWith('.workers.dev')) return; // Cloudflare Worker proxy
  if (url.hostname.includes('cloudfunctions.net')) return; // Firebase Function proxy

  // ⚠ CRITICAL: KHÔNG cache JS module chunks (vd /assets/feat-map-XXX.js)
  // Mỗi build mới Vite gen hash khác → SW cache-first sẽ trả 404 fallback
  // → SPA rewrite → trả index.html → MIME 'text/html' → module loader crash.
  // Strategy: luôn network cho file .js trong /assets/
  if (url.pathname.startsWith('/assets/') && url.pathname.endsWith('.js')) return;
  if (url.pathname.startsWith('/assets/') && url.pathname.endsWith('.css')) return;

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
