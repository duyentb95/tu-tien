/**
 * Save Manager — multi-slot save management trên localStorage.
 *
 * Key conventions:
 *   tu-tien:save:slot-0        — slot mặc định (legacy, single save)
 *   tu-tien:save:slot-N        — slot user-created (N = 1, 2, ...)
 *   tu-tien:save:autobackup-K  — rolling auto-backup (K = 0, 1, 2 — keep last 3)
 *   tu-tien:save:meta          — { lastBackupTurn: number, slotNames: {slotId: name} }
 *
 * Payload schema (version 8):
 *   { version: 8, savedAt: ms, player, settings, storyLog, turn, ... }
 *
 * Public API:
 *   listSlots()             → SaveSlotInfo[]
 *   readSlot(id)            → SavePayload | null
 *   writeSlot(id, payload)  → void
 *   deleteSlot(id)          → void
 *   renameSlot(id, name)    → void
 *   exportSlot(id)          → trigger download .json
 *   importFromFile(file)    → SavePayload, also writes to next free slot
 *   autoBackup(payload)     → rotate qua 3 slot autobackup
 */

import type { PlayerCharacter } from '@gametypes/character';

const SLOT_PREFIX = 'tu-tien:save:slot-';
const AUTOBACKUP_PREFIX = 'tu-tien:save:autobackup-';
const META_KEY = 'tu-tien:save:meta';
const MAX_AUTOBACKUPS = 3;
const MAX_USER_SLOTS = 10; // tổng cộng max 10 slot user-created

export interface SavePayload {
  version: number;
  savedAt: number;
  player?: PlayerCharacter;
  settings?: Record<string, unknown>;
  storyLog?: unknown[];
  currentActions?: string[];
  turn?: number;
  knowledge?: Record<string, unknown>;
  inventory?: Record<string, unknown>;
  skills?: Record<string, unknown>;
  quests?: Record<string, unknown>;
  sectMembership?: unknown;
  claimedMissions?: Record<string, number>;
  secretRealm?: unknown;
  spiritBeasts?: Record<string, unknown>;
  activeBeastId?: string | null;
  caveAbode?: unknown;
  daoLu?: Record<string, unknown>;
  [k: string]: unknown;
}

export interface SaveSlotInfo {
  id: string;              // ex: "slot-0", "autobackup-1"
  kind: 'manual' | 'autobackup';
  name: string;            // user-provided hoặc auto-generated
  savedAt: number;         // ms timestamp
  playerName?: string;
  level?: number;
  realm?: string;
  turn?: number;
  sizeKb: number;          // ước lượng size payload
}

interface SaveMeta {
  lastBackupTurn?: number;
  slotNames?: Record<string, string>;
}

// ─── Meta helpers ───
const readMeta = (): SaveMeta => {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as SaveMeta;
  } catch {
    return {};
  }
};
const writeMeta = (m: SaveMeta) => {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(m));
  } catch {
    // ignore quota
  }
};

// ─── Core slot read/write ───
const slotKey = (id: string): string => {
  if (id.startsWith('autobackup-')) return AUTOBACKUP_PREFIX + id.slice('autobackup-'.length);
  if (id.startsWith('slot-')) return SLOT_PREFIX + id.slice('slot-'.length);
  // Fallback assume user slot id
  return SLOT_PREFIX + id;
};

export const readSlot = (id: string): SavePayload | null => {
  try {
    const raw = localStorage.getItem(slotKey(id));
    if (!raw) return null;
    const data = JSON.parse(raw) as SavePayload;
    if (!data?.player) return null;
    return data;
  } catch {
    return null;
  }
};

export const writeSlot = (id: string, payload: SavePayload): { ok: boolean; error?: string } => {
  try {
    const str = JSON.stringify(payload);
    localStorage.setItem(slotKey(id), str);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('quota') || msg.includes('QuotaExceeded')) {
      return { ok: false, error: 'Hết dung lượng localStorage. Hãy xóa save cũ trước.' };
    }
    return { ok: false, error: msg };
  }
};

export const deleteSlot = (id: string): void => {
  try {
    localStorage.removeItem(slotKey(id));
    const meta = readMeta();
    if (meta.slotNames?.[id]) {
      delete meta.slotNames[id];
      writeMeta(meta);
    }
  } catch {
    // ignore
  }
};

export const renameSlot = (id: string, name: string): void => {
  const meta = readMeta();
  meta.slotNames = { ...meta.slotNames, [id]: name };
  writeMeta(meta);
};

// ─── Discovery ───
const slotInfoFromPayload = (id: string, payload: SavePayload, kind: SaveSlotInfo['kind']): SaveSlotInfo => {
  const meta = readMeta();
  const customName = meta.slotNames?.[id];
  const defaultName = kind === 'autobackup'
    ? `Tự động #${id.replace('autobackup-', '')}`
    : `Slot ${id.replace('slot-', '')}`;
  const sizeKb = Math.ceil(JSON.stringify(payload).length / 1024);
  return {
    id,
    kind,
    name: customName ?? defaultName,
    savedAt: payload.savedAt ?? 0,
    playerName: payload.player?.Name,
    level: payload.player?.level,
    realm: (payload.player as unknown as Record<string, unknown>)?.realmDisplay as string | undefined,
    turn: payload.turn,
    sizeKb,
  };
};

export const listSlots = (): SaveSlotInfo[] => {
  const slots: SaveSlotInfo[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      let id: string | null = null;
      let kind: SaveSlotInfo['kind'] | null = null;
      if (k.startsWith(SLOT_PREFIX)) {
        id = 'slot-' + k.slice(SLOT_PREFIX.length);
        kind = 'manual';
      } else if (k.startsWith(AUTOBACKUP_PREFIX)) {
        id = 'autobackup-' + k.slice(AUTOBACKUP_PREFIX.length);
        kind = 'autobackup';
      }
      if (!id || !kind) continue;
      const payload = readSlot(id);
      if (payload) slots.push(slotInfoFromPayload(id, payload, kind));
    }
  } catch {
    // ignore
  }
  // Sort: manual trước, mỗi nhóm sort theo savedAt desc
  return slots.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'manual' ? -1 : 1;
    return b.savedAt - a.savedAt;
  });
};

/** Tìm slot id trống tiếp theo (slot-1, slot-2, ...) — slot-0 là default */
export const nextFreeSlotId = (): string | null => {
  for (let i = 1; i <= MAX_USER_SLOTS; i++) {
    const id = `slot-${i}`;
    if (!localStorage.getItem(slotKey(id))) return id;
  }
  return null;
};

// ─── Export / Import ───
export const exportSlot = (id: string): { ok: boolean; error?: string } => {
  const payload = readSlot(id);
  if (!payload) return { ok: false, error: 'Slot rỗng hoặc không tồn tại' };

  try {
    const playerName = payload.player?.Name ?? 'unknown';
    const date = new Date(payload.savedAt).toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const filename = `mac-do_${playerName}_${date}.json`;

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
};

/** Import từ file → ghi vào next free slot, return slot id mới */
export const importFromFile = async (
  file: File,
): Promise<{ ok: boolean; slotId?: string; error?: string }> => {
  try {
    const text = await file.text();
    const payload = JSON.parse(text) as SavePayload;
    if (!payload?.player) {
      return { ok: false, error: 'File save không hợp lệ (thiếu player)' };
    }
    if (typeof payload.version !== 'number') {
      return { ok: false, error: 'File save không có version — không tương thích' };
    }
    const slotId = nextFreeSlotId();
    if (!slotId) {
      return { ok: false, error: `Đã đầy ${MAX_USER_SLOTS} slot, xóa bớt trước khi import` };
    }
    const writeResult = writeSlot(slotId, payload);
    if (!writeResult.ok) return { ok: false, error: writeResult.error };
    // Auto-rename theo nhân vật + ngày import
    const importDate = new Date().toISOString().slice(0, 10);
    renameSlot(slotId, `${payload.player.Name} (import ${importDate})`);
    return { ok: true, slotId };
  } catch (e) {
    if (e instanceof SyntaxError) {
      return { ok: false, error: 'File không phải JSON hợp lệ' };
    }
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
};

// ─── Auto-backup ───
let autoBackupCursor = 0;

/**
 * Auto-backup payload — rotate qua MAX_AUTOBACKUPS slot.
 * Chỉ backup nếu turn tăng ≥ 10 từ lần backup cuối, tránh spam.
 */
export const autoBackup = (payload: SavePayload): boolean => {
  const meta = readMeta();
  const currentTurn = payload.turn ?? 0;
  const lastBackup = meta.lastBackupTurn ?? -999;
  if (currentTurn - lastBackup < 10 && currentTurn > 0) {
    return false; // chưa đủ điều kiện backup
  }

  const id = `autobackup-${autoBackupCursor}`;
  const result = writeSlot(id, payload);
  if (!result.ok) {
    console.warn('[save-manager] autoBackup failed:', result.error);
    return false;
  }

  autoBackupCursor = (autoBackupCursor + 1) % MAX_AUTOBACKUPS;
  writeMeta({ ...meta, lastBackupTurn: currentTurn });
  return true;
};

/** Reset cursor — gọi khi user reset toàn bộ game */
export const resetAutoBackupCursor = () => {
  autoBackupCursor = 0;
};

// ─── Storage usage ───
export const getStorageUsage = (): { usedKb: number; totalKb: number; percent: number } => {
  let used = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      const v = localStorage.getItem(k) ?? '';
      used += k.length + v.length;
    }
  } catch {
    // ignore
  }
  const usedKb = Math.ceil(used / 1024);
  const totalKb = 5 * 1024; // browser default ~5MB
  return { usedKb, totalKb, percent: Math.min(100, Math.round((usedKb / totalKb) * 100)) };
};
