/**
 * Service Worker — minimal offline cache.
 *
 * Strategy:
 *   - HTML / navigate request → NETWORK-FIRST với cache fallback (offline only).
 *     LÝ DO: index.html mỗi build mới trỏ tới chunk hash khác. Cache-first =
 *     user xem HTML cũ → request chunk cũ không tồn tại trên server → SPA fallback
 *     → MIME text/html → module crash → màn hình đen.
 *   - JS modules (lazy chunks) /assets/*.js → NETWORK-ONLY (bypass SW hoàn toàn).
 *   - CSS /assets/*.css → NETWORK-ONLY (cùng lý do hash).
 *   - Static asset same-origin (icon, manifest...) → stale-while-revalidate.
 *   - Google Fonts → cache-first vĩnh viễn.
 *   - AI APIs (Gemini / DeepSeek / Cloudflare Worker / Firebase) → network-only.
 *
 * + Auto-recover: khi page detect chunk load error (vd "Failed to fetch dynamically
 *   imported module"), gửi message 'CLEAR_CACHE' → SW xoá cache + unregister →
 *   page reload → fresh fetch.
 *
 * IMPORTANT: bump CACHE_VERSION mỗi khi có breaking change SW logic.
 */

const CACHE_VERSION = 'mac-do-v5';   // v5: bump cho v1.10.0 release — force fresh cache
const FONT_CACHE = 'mac-do-fonts-v1';

const PRECACHE_URLS = ['/manifest.webmanifest', '/icon-192.svg', '/icon-512.svg'];

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
    ).then(() => self.clients.claim())
  );
});

// Listen 'CLEAR_CACHE' message từ page (auto-recover stale chunk)
self.addEventListener('message', (event) => {
  if (event.data === 'CLEAR_CACHE' || event.data?.type === 'CLEAR_CACHE') {
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => caches.delete(k)))
    ).then(() => {
      // Notify all clients to reload
      self.clients.matchAll().then((clients) => {
        clients.forEach((c) => c.postMessage({ type: 'CACHE_CLEARED' }));
      });
    });
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass non-GET + AI APIs (network-only)
  if (event.request.method !== 'GET') return;
  if (url.hostname.includes('generativelanguage.googleapis.com')) return;
  if (url.hostname.includes('firestore.googleapis.com')) return;
  if (url.hostname.includes('api.deepseek.com')) return;
  if (url.hostname.endsWith('.workers.dev')) return;
  if (url.hostname.includes('cloudfunctions.net')) return;

  // ⚠ CRITICAL: KHÔNG cache JS/CSS module chunks (hash đổi mỗi build)
  if (url.pathname.startsWith('/assets/') && url.pathname.endsWith('.js')) return;
  if (url.pathname.startsWith('/assets/') && url.pathname.endsWith('.css')) return;

  // HTML / navigate request → NETWORK-FIRST (cache chỉ là offline fallback)
  const isNavigate = event.request.mode === 'navigate';
  const acceptsHtml = event.request.headers.get('accept')?.includes('text/html');
  if (isNavigate || acceptsHtml || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (res.ok) {
            // Cache fresh copy cho offline
            const clone = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
          }
          return res;
        })
        .catch(() => {
          // Offline → fallback cache (HTML cũ vẫn tốt hơn không có gì)
          return caches.match(event.request).then((cached) => cached || caches.match('/'));
        })
    );
    return;
  }

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

  // Other same-origin static (icon, manifest...) → stale-while-revalidate
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
          return cached || fetchPromise;
        })
      )
    );
  }
});
