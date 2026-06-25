import { DEFAULT_REALMS } from '@data/default-realms';

export interface RealmInfo {
  realmName: string;
  realmTier: number; // 1-10 trong cảnh giới đó
}

/**
 * Map level → { realmName, realmTier }.
 * Port từ prototype `PREVIEW.md:15913`. Mỗi cảnh giới = 10 cấp.
 * Vượt cảnh giới cuối cùng → "Vô Định Cảnh".
 */
export const getRealmInfoFromLevel = (
  level: number,
  realmList?: readonly string[],
): RealmInfo => {
  const cleanRealmList =
    realmList && realmList.length > 0
      ? Array.from(
          new Set(realmList.map((item) => String(item).replace(/"/g, '').split(' Tầng ')[0]!.trim())),
        )
      : ([...DEFAULT_REALMS] as string[]);

  const maxDefinedLevel = cleanRealmList.length * 10;

  if (level > maxDefinedLevel) {
    const realmTier = Math.floor((level - 1 - maxDefinedLevel) / 10) + 1;
    return { realmName: 'Vô Định Cảnh', realmTier };
  }

  const realmIndex = Math.floor((level - 1) / 10);
  const realmName = cleanRealmList[realmIndex] ?? `Cảnh Giới ${realmIndex + 1}`;
  const realmTier = ((level - 1) % 10) + 1;

  return { realmName, realmTier };
};

/**
 * Inverse: "Trúc Cơ Tầng 5" → level 15 (giả sử Luyện Khí là cảnh giới 1).
 * Port từ prototype `PREVIEW.md:15943`. Mặc định tier = 5 nếu không có.
 */
export const calculateLevelFromRealmString = (
  realmString: string,
  realmList: readonly string[],
): number => {
  if (!realmString || !realmList || realmList.length === 0) return 1;

  const cleanRealmString = realmString.trim();
  const parts = cleanRealmString.split(' Tầng ');
  const realmName = parts[0]!.trim();
  const parsedTier = parts.length > 1 && parts[1] ? parseInt(parts[1], 10) : 5;
  const tier = Number.isNaN(parsedTier) ? 5 : parsedTier;

  const realmIndex = realmList.findIndex((r) => r.startsWith(realmName));
  if (realmIndex === -1) return 1;

  return Math.max(1, realmIndex * 10 + tier);
};

/** Check 2 cấp có cùng đại cảnh giới không (dùng cho gap penalty trong combat) */
export const isSameRealm = (
  levelA: number,
  levelB: number,
  realmList?: readonly string[],
): boolean => {
  return (
    getRealmInfoFromLevel(levelA, realmList).realmName ===
    getRealmInfoFromLevel(levelB, realmList).realmName
  );
};

/** Số "đại cảnh giới" chênh lệch (signed: A - B) */
export const realmGap = (
  levelA: number,
  levelB: number,
  _realmList?: readonly string[],
): number => {
  return Math.floor((levelA - 1) / 10) - Math.floor((levelB - 1) / 10);
};
