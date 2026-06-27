/**
 * Phase 17.3: Analytics — Firestore event tracker.
 *
 * Thin wrapper trackEvent() non-blocking emit vào Firestore collection
 * `analytics_events`. Batch buffer + flush 5s để giảm write cost.
 *
 * Privacy: chỉ track event metadata (name + props), KHÔNG track PII (player name,
 * narrative content, BYOK keys). Sample 100% cho dev, 10% cho production whale events.
 *
 * Schema 1 event document:
 *   {
 *     name: string                  // 'pack_purchase' / 'mission_completed' ...
 *     props: Record<string, any>    // event-specific (packId, missionId, value...)
 *     sessionId: string             // random per browser session
 *     deviceId: string              // stable per device (localStorage)
 *     ts: serverTimestamp           // when event fired (client → server adjust)
 *     userId?: string               // Firebase Auth UID nếu signed in
 *     appVersion: string            // build version
 *   }
 *
 * Disable bằng env VITE_ANALYTICS_ENABLED=false hoặc nếu Firebase config thiếu.
 */

import { APP_VERSION } from '@features/legal';

// ─────────────────────────────────────────────────────────────
// Event taxonomy — extend khi cần
// ─────────────────────────────────────────────────────────────

export type AnalyticsEventName =
  // Funnel
  | 'app_loaded'
  | 'character_created'
  | 'first_turn_completed'
  | 'turn_milestone'        // turn = 10, 50, 100, 500
  // Monetization
  | 'pack_view'             // user xem 1 currency pack
  | 'pack_purchase_intent'  // click "Mua" button
  | 'pack_purchase_complete' // mock done OR Stripe webhook OK
  | 'exchange_purchase'     // mua exchange option
  // Retention
  | 'daily_login'           // mở app, login streak ++
  | 'mission_claimed'       // claim daily mission reward
  | 'coupon_redeemed'
  | 'referral_applied'
  | 'referral_code_shared'
  // Feature usage
  | 'quest_started'
  | 'quest_completed'
  | 'combat_won'
  | 'combat_lost'
  | 'realm_break'
  | 'item_upgraded'         // re-roll hoặc thăng cấp
  | 'world_genesis'         // dùng wizard
  | 'canon_pack_picked'     // chọn truyện đồng nhân
  | 'byok_set'              // user paste key
  // Errors
  | 'ai_provider_failed'
  | 'sw_chunk_recovery';    // stale chunk hotfix kick in

export interface AnalyticsEventProps {
  [key: string]: string | number | boolean | undefined | null;
}

// ─────────────────────────────────────────────────────────────
// Session ID + device ID (reuse từ economy module)
// ─────────────────────────────────────────────────────────────

const sessionId = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const getDeviceId = (): string => {
  if (typeof window === 'undefined') return 'ssr';
  try {
    const KEY = 'tu-tien:device-id';
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return 'unknown';
  }
};

// ─────────────────────────────────────────────────────────────
// Enabled check
// ─────────────────────────────────────────────────────────────

const isEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  // Env flag override
  const env = import.meta.env as Record<string, string | undefined>;
  if (env.VITE_ANALYTICS_ENABLED === 'false') return false;
  // Firebase config tối thiểu
  if (!env.VITE_FIREBASE_API_KEY || !env.VITE_FIREBASE_PROJECT_ID) return false;
  // User opt-out toggle
  try {
    if (localStorage.getItem('tu-tien:analytics-disabled') === '1') return false;
  } catch { /* ignore */ }
  return true;
};

// ─────────────────────────────────────────────────────────────
// Buffer + flush (giảm Firestore write cost)
// ─────────────────────────────────────────────────────────────

interface BufferedEvent {
  name: AnalyticsEventName;
  props: AnalyticsEventProps;
  ts: number; // client timestamp ms
}

const buffer: BufferedEvent[] = [];
const FLUSH_INTERVAL_MS = 5000;
const MAX_BUFFER_SIZE = 50;
let flushScheduled = false;

const scheduleFlush = () => {
  if (flushScheduled) return;
  flushScheduled = true;
  setTimeout(() => {
    flushScheduled = false;
    void flush();
  }, FLUSH_INTERVAL_MS);
};

const flush = async (): Promise<void> => {
  if (buffer.length === 0) return;
  if (!isEnabled()) {
    buffer.length = 0;
    return;
  }

  const batch = buffer.splice(0, MAX_BUFFER_SIZE);
  try {
    const { getDb } = await import('./firebase');
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const db = getDb();
    const colRef = collection(db, 'analytics_events');
    const deviceId = getDeviceId();
    // Parallel writes (Firestore handles concurrency; nếu lo cost, dùng writeBatch)
    await Promise.all(
      batch.map((e) =>
        addDoc(colRef, {
          name: e.name,
          props: e.props,
          sessionId,
          deviceId,
          appVersion: APP_VERSION,
          clientTs: e.ts,
          serverTs: serverTimestamp(),
        }).catch((err) => console.warn('[analytics] write fail:', err)),
      ),
    );
  } catch (e) {
    console.warn('[analytics] flush failed:', e);
  }
};

// Flush khi tab close / visibility hidden
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flush();
  });
  window.addEventListener('beforeunload', () => { void flush(); });
}

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

/**
 * Track 1 event. Non-blocking — buffer + flush sau 5s.
 * Auto-no-op nếu analytics disabled (env / opt-out / Firebase chưa config).
 */
export const trackEvent = (name: AnalyticsEventName, props: AnalyticsEventProps = {}): void => {
  if (!isEnabled()) return;
  buffer.push({ name, props, ts: Date.now() });
  if (buffer.length >= MAX_BUFFER_SIZE) {
    void flush();
  } else {
    scheduleFlush();
  }
};

/** User toggle opt-out qua AI Status hoặc settings */
export const setAnalyticsEnabled = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;
  try {
    if (enabled) localStorage.removeItem('tu-tien:analytics-disabled');
    else localStorage.setItem('tu-tien:analytics-disabled', '1');
  } catch { /* ignore */ }
};

export const isAnalyticsEnabled = (): boolean => isEnabled();
