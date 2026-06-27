import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Register service worker for PWA — chỉ trong production build
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[sw] register failed', err);
    });
  });

  // Auto-recover khi chunk lazy load fail (stale SW cache HTML cũ trỏ chunk không tồn tại)
  // → clear cache + reload. Một lần / session để tránh loop.
  let _recovered = false;
  const tryRecover = (reason: string) => {
    if (_recovered) return;
    _recovered = true;
    console.warn(`[sw] Detect stale chunk (${reason}) — clear cache + reload...`);
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
    }
    navigator.serviceWorker.addEventListener('message', (e) => {
      if (e.data?.type === 'CACHE_CLEARED') {
        window.location.reload();
      }
    });
    // Fallback nếu SW không respond trong 2s → hard reload
    setTimeout(() => window.location.reload(), 2000);
  };

  // Vite phát error 'Failed to fetch dynamically imported module' khi chunk hash 404
  window.addEventListener('error', (event) => {
    const msg = String(event.message ?? event.error?.message ?? '');
    if (
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Failed to load module script') ||
      msg.includes('error loading dynamically imported module')
    ) {
      tryRecover('window.error');
    }
  });
  window.addEventListener('unhandledrejection', (event) => {
    const msg = String(event.reason?.message ?? event.reason ?? '');
    if (
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Failed to load module script')
    ) {
      tryRecover('unhandledrejection');
    }
  });
}
