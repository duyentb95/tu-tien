import { doc, setDoc, getDoc, serverTimestamp, type Firestore } from 'firebase/firestore';
import { getDb, ensureSignedIn } from './firebase';

/**
 * Cloud save service — wrap Firestore để sync save game đa thiết bị.
 *
 * Schema:
 *   games/{userId}/saves/slot-0 → { version, savedAt, payload, ... }
 *
 * Fallback: nếu Firebase chưa config → return false, caller dùng localStorage.
 */

const SLOT_ID = 'slot-0';

const hasFirebaseConfig = (): boolean => {
  return !!import.meta.env.VITE_FIREBASE_API_KEY && !!import.meta.env.VITE_FIREBASE_PROJECT_ID;
};

export interface CloudSavePayload {
  version: number;
  savedAt: number;
  /** Toàn bộ data game state — JSON-serializable */
  data: Record<string, unknown>;
}

export interface CloudSaveResult {
  ok: boolean;
  error?: string;
  /** Có dùng được Firestore không */
  cloudAvailable: boolean;
}

/**
 * Save game state lên Firestore.
 * Tự sign-in anonymous nếu chưa.
 */
export const saveToCloud = async (payload: CloudSavePayload): Promise<CloudSaveResult> => {
  if (!hasFirebaseConfig()) {
    return { ok: false, cloudAvailable: false, error: 'Firebase chưa cấu hình' };
  }
  try {
    const user = await ensureSignedIn();
    const db: Firestore = getDb();
    const ref = doc(db, 'games', user.uid, 'saves', SLOT_ID);
    await setDoc(ref, {
      ...payload,
      serverSavedAt: serverTimestamp(),
    });
    return { ok: true, cloudAvailable: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, cloudAvailable: true, error: msg };
  }
};

/**
 * Load save từ Firestore. Trả null nếu không có save hoặc Firebase fail.
 */
export const loadFromCloud = async (): Promise<CloudSavePayload | null> => {
  if (!hasFirebaseConfig()) return null;
  try {
    const user = await ensureSignedIn();
    const db: Firestore = getDb();
    const ref = doc(db, 'games', user.uid, 'saves', SLOT_ID);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      version: data.version ?? 1,
      savedAt: data.savedAt ?? Date.now(),
      data: data.data ?? {},
    };
  } catch (e) {
    console.warn('[cloud-save] load failed', e);
    return null;
  }
};

/** Check Firebase có hoạt động không (test connection nhẹ) */
export const isCloudReady = async (): Promise<boolean> => {
  if (!hasFirebaseConfig()) return false;
  try {
    await ensureSignedIn();
    return true;
  } catch {
    return false;
  }
};
