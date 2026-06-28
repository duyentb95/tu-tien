/**
 * Phase 23.5: Đại Đạo helpers — AI-sinh linh hoạt.
 *
 * Không hardcode 3000 đạo. Khi player Ngộ Đạo → AI roll random 1 đạo mới
 * theo canon pack + meditation context. Player có thể focus tối đa 3 đạo chính.
 *
 * Default 8 đạo phổ biến để AI có pool fallback:
 *   Hỏa Đạo · Lôi Đạo · Thủy Đạo · Phong Đạo
 *   Thời Gian Đạo · Không Gian Đạo · Tử Vong Đạo · Sinh Mệnh Đạo
 */
import type { DaiDaoEntry, DaiDaoState } from '@gametypes/cultivation';
import type { Element } from '@gametypes/character';

export const MAX_DAO_LEVEL = 9;
export const MAX_FOCUSED_DAO = 3;

export const DEFAULT_DAO_POOL: Array<{ name: string; description: string; element?: Element }> = [
  { name: 'Hỏa Đạo', description: 'Lửa thiêu đốt vạn vật. Damage hỏa hệ +N%.', element: 'hoa' },
  { name: 'Lôi Đạo', description: 'Sấm sét hủy diệt. Damage lôi hệ +N%.', element: 'loi' },
  { name: 'Thủy Đạo', description: 'Nước nhu mì uốn lượn. Healing +N%.', element: 'thuy' },
  { name: 'Phong Đạo', description: 'Gió tự do bất định. Tốc độ +N%.', element: 'phong' },
  { name: 'Thời Gian Đạo', description: 'Khống chế dòng chảy thời gian. Cooldown -N%.' },
  { name: 'Không Gian Đạo', description: 'Lưới không gian xé toang vạn dặm. Né tránh +N%.' },
  { name: 'Tử Vong Đạo', description: 'Hấp thu sinh khí, ám tổn vĩnh viễn.' },
  { name: 'Sinh Mệnh Đạo', description: 'Nuôi dưỡng sinh khí, HP regen +N%.' },
];

/** XP curve cho đạo: 100 / 300 / 700 / 1500 / 3000 / 6000 / 12000 / 25000 */
export const getDaoXpToNext = (level: number): number => {
  if (level >= MAX_DAO_LEVEL) return Infinity;
  const tiers = [100, 300, 700, 1500, 3000, 6000, 12000, 25000];
  return tiers[level - 1] ?? 100;
};

/** Damage multiplier theo đạo level: lv 1 = 1.0, lv 9 = 1.6 (7.5% per level) */
export const getDaoMul = (level: number): number => {
  return 1 + (Math.max(1, Math.min(MAX_DAO_LEVEL, level)) - 1) * 0.075;
};

/** Slug name → key (Hỏa Đạo → hoa_dao).
 * Note: `đ`/`Đ` (U+0111/0110) là Latin letter có stroke, không decompose qua NFD,
 * nên phải replace thủ công trước NFD để tránh bị `[^a-z0-9]+` strip thành ''.
 */
export const daoSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

/** Create new đạo entry khi vừa ngộ */
export const createDaoEntry = (
  name: string,
  description: string,
  turn: number,
  element?: Element,
): DaiDaoEntry => ({
  name,
  description,
  level: 1,
  xp: 0,
  unlockedAtTurn: turn,
  ...(element ? { element } : {}),
});

export interface AddDaoXpResult {
  state: DaiDaoState;
  leveledUp: boolean;
  newLevel: number;
  daoKey: string;
}

export const addDaoXp = (
  state: DaiDaoState,
  daoName: string,
  xpDelta: number,
): AddDaoXpResult => {
  const key = daoSlug(daoName);
  const cur = state.paths[key];
  if (!cur) {
    return { state, leveledUp: false, newLevel: 0, daoKey: key };
  }
  let level = cur.level;
  let xp = cur.xp + Math.max(0, xpDelta);
  let leveledUp = false;
  while (level < MAX_DAO_LEVEL) {
    const needed = getDaoXpToNext(level);
    if (xp >= needed) { xp -= needed; level += 1; leveledUp = true; }
    else break;
  }
  if (level >= MAX_DAO_LEVEL) xp = 0;
  return {
    state: { ...state, paths: { ...state.paths, [key]: { ...cur, level, xp } } },
    leveledUp,
    newLevel: level,
    daoKey: key,
  };
};

/** Add đạo mới vào state. Nếu đã có → skip (chỉ tạo 1 lần). */
export const unlockDao = (
  state: DaiDaoState,
  name: string,
  description: string,
  turn: number,
  element?: Element,
): { state: DaiDaoState; created: boolean; key: string } => {
  const key = daoSlug(name);
  if (state.paths[key]) return { state, created: false, key };
  return {
    state: { ...state, paths: { ...state.paths, [key]: createDaoEntry(name, description, turn, element) } },
    created: true,
    key,
  };
};
