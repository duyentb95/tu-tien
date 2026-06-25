import { describe, it, expect } from 'vitest';
import {
  getRealmInfoFromLevel,
  calculateLevelFromRealmString,
  isSameRealm,
  realmGap,
} from './realms';
import { DEFAULT_REALMS } from '@data/default-realms';

describe('getRealmInfoFromLevel', () => {
  it('cấp 1 → Luyện Khí Tầng 1', () => {
    expect(getRealmInfoFromLevel(1)).toEqual({ realmName: 'Luyện Khí', realmTier: 1 });
  });

  it('cấp 10 → Luyện Khí Tầng 10', () => {
    expect(getRealmInfoFromLevel(10)).toEqual({ realmName: 'Luyện Khí', realmTier: 10 });
  });

  it('cấp 11 → Trúc Cơ Tầng 1 (đại đột phá)', () => {
    expect(getRealmInfoFromLevel(11)).toEqual({ realmName: 'Trúc Cơ', realmTier: 1 });
  });

  it('cấp 25 → Kim Đan Tầng 5', () => {
    expect(getRealmInfoFromLevel(25)).toEqual({ realmName: 'Kim Đan', realmTier: 5 });
  });

  it('cấp 100 → Tiên Nhân Tầng 10 (cảnh giới cuối default)', () => {
    expect(getRealmInfoFromLevel(100)).toEqual({ realmName: 'Tiên Nhân', realmTier: 10 });
  });

  it('cấp 101 → Vô Định Cảnh Tầng 1 (vượt cấp)', () => {
    expect(getRealmInfoFromLevel(101)).toEqual({ realmName: 'Vô Định Cảnh', realmTier: 1 });
  });

  it('cấp 111 → Vô Định Cảnh Tầng 2', () => {
    expect(getRealmInfoFromLevel(111)).toEqual({ realmName: 'Vô Định Cảnh', realmTier: 2 });
  });

  it('Dùng custom realmList từ AI', () => {
    const custom = ['Phàm Nhân', 'Tu Sĩ', 'Đại Năng'];
    expect(getRealmInfoFromLevel(11, custom)).toEqual({ realmName: 'Tu Sĩ', realmTier: 1 });
    expect(getRealmInfoFromLevel(25, custom)).toEqual({ realmName: 'Đại Năng', realmTier: 5 });
  });

  it('Lọc duplicates và "Tầng X" từ realmList raw', () => {
    const raw = ['"Luyện Khí Tầng 1"', '"Luyện Khí Tầng 2"', '"Trúc Cơ Tầng 1"'];
    expect(getRealmInfoFromLevel(11, raw)).toEqual({ realmName: 'Trúc Cơ', realmTier: 1 });
  });
});

describe('calculateLevelFromRealmString', () => {
  it('"Luyện Khí Tầng 5" → 5', () => {
    expect(calculateLevelFromRealmString('Luyện Khí Tầng 5', [...DEFAULT_REALMS])).toBe(5);
  });

  it('"Trúc Cơ Tầng 1" → 11', () => {
    expect(calculateLevelFromRealmString('Trúc Cơ Tầng 1', [...DEFAULT_REALMS])).toBe(11);
  });

  it('Không có "Tầng X" → mặc định tier 5', () => {
    expect(calculateLevelFromRealmString('Kim Đan', [...DEFAULT_REALMS])).toBe(25);
  });

  it('Cảnh giới không tồn tại → 1', () => {
    expect(calculateLevelFromRealmString('Ma Thần Tầng 9', [...DEFAULT_REALMS])).toBe(1);
  });

  it('Roundtrip: level → string → level (cấp 35)', () => {
    const info = getRealmInfoFromLevel(35);
    const roundtripped = calculateLevelFromRealmString(
      `${info.realmName} Tầng ${info.realmTier}`,
      [...DEFAULT_REALMS],
    );
    expect(roundtripped).toBe(35);
  });
});

describe('isSameRealm / realmGap', () => {
  it('Cấp 5 và 9 cùng Luyện Khí', () => {
    expect(isSameRealm(5, 9)).toBe(true);
    expect(realmGap(5, 9)).toBe(0);
  });

  it('Cấp 10 và 11 khác cảnh giới', () => {
    expect(isSameRealm(10, 11)).toBe(false);
    expect(realmGap(11, 10)).toBe(1);
  });

  it('Chênh 3 đại cảnh giới', () => {
    expect(realmGap(35, 5)).toBe(3);
  });
});
