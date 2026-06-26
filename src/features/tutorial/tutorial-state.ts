/**
 * Tutorial state — track xem user đã xem các tooltip first-time chưa.
 * Lưu trong localStorage để không show lặp lại.
 *
 * Key: `mac-do:tutorial-seen` — map { [tipId]: true }
 * Special key `welcome` = đã hoàn thành overlay 4-step đầu game.
 */

const STORAGE_KEY = 'mac-do:tutorial-seen';

type SeenMap = Record<string, true>;

const readSeen = (): SeenMap => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as SeenMap;
  } catch {
    return {};
  }
};

const writeSeen = (map: SeenMap) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore quota errors
  }
};

export const hasSeenTutorial = (tipId: string): boolean => {
  return readSeen()[tipId] === true;
};

export const markTutorialSeen = (tipId: string): void => {
  const map = readSeen();
  map[tipId] = true;
  writeSeen(map);
};

/** Reset all — dùng cho "Xem lại tutorial" button trong settings */
export const resetAllTutorials = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};
