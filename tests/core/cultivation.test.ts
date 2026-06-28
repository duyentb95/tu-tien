import { describe, it, expect } from 'vitest';
import {
  addIntentXp, getIntentXpToNext, inferIntentFromSkill, getIntentDamageMul, MAX_INTENT_LEVEL,
} from '../../src/core/cultivation/intent';
import {
  addDaoXp, getDaoXpToNext, getDaoMul, unlockDao, daoSlug, MAX_DAO_LEVEL,
} from '../../src/core/cultivation/dai-dao';
import { getAvailablePhapTac, getPhapTacById } from '../../src/data/phap-tac';

describe('Ý Cảnh — inferIntentFromSkill', () => {
  it('kiếm → kiếm ý', () => expect(inferIntentFromSkill('Kiếm Khí Trảm')).toBe('kiếm ý'));
  it('đao → đao ý', () => expect(inferIntentFromSkill('Đao Hồn')).toBe('đao ý'));
  it('quyền → quyền ý', () => expect(inferIntentFromSkill('Bá Vương Quyền')).toBe('quyền ý'));
  it('chỉ → chỉ ý', () => expect(inferIntentFromSkill('Hỏa Long Chỉ')).toBe('chỉ ý'));
  it('default → pháp ý', () => expect(inferIntentFromSkill('Lôi Thiểm')).toBe('pháp ý'));
});

describe('Ý Cảnh — XP + level', () => {
  it('lv 1 XP cần 50', () => expect(getIntentXpToNext(1)).toBe(50));
  it('lv 8 XP cần 30000', () => expect(getIntentXpToNext(8)).toBe(30000));
  it('lv max → Infinity', () => expect(getIntentXpToNext(MAX_INTENT_LEVEL)).toBe(Infinity));

  it('damage mul lv 1 = 1.0', () => expect(getIntentDamageMul(1)).toBe(1));
  it('damage mul lv 9 = 1.4', () => expect(getIntentDamageMul(9)).toBeCloseTo(1.4));

  it('addIntentXp cascade level up', () => {
    const r = addIntentXp({}, 'kiếm ý', 220); // lv1 50 + lv2 150 = 200 → lv3, còn 20
    expect(r.state['kiếm ý']!.level).toBe(3);
    expect(r.state['kiếm ý']!.xp).toBe(20);
    expect(r.leveledUp).toBe(true);
  });
});

describe('Đại Đạo — slug + unlock', () => {
  it('Hỏa Đạo → hoa_dao slug', () => expect(daoSlug('Hỏa Đạo')).toBe('hoa_dao'));
  it('Thời Gian Đạo → thoi_gian_dao', () => expect(daoSlug('Thời Gian Đạo')).toBe('thoi_gian_dao'));

  it('unlockDao tạo entry mới', () => {
    const r = unlockDao({ paths: {}, focused: [] }, 'Hỏa Đạo', 'Lửa thiêu', 100, 'hoa');
    expect(r.created).toBe(true);
    expect(r.state.paths.hoa_dao!.name).toBe('Hỏa Đạo');
    expect(r.state.paths.hoa_dao!.level).toBe(1);
    expect(r.state.paths.hoa_dao!.element).toBe('hoa');
    expect(r.state.paths.hoa_dao!.unlockedAtTurn).toBe(100);
  });

  it('unlockDao lần 2 trùng tên → skip', () => {
    const initial = unlockDao({ paths: {}, focused: [] }, 'Hỏa Đạo', 'x', 1).state;
    const r2 = unlockDao(initial, 'Hỏa Đạo', 'y', 50);
    expect(r2.created).toBe(false);
    expect(r2.state.paths.hoa_dao!.description).toBe('x');
  });

  it('addDaoXp level up', () => {
    const s0 = unlockDao({ paths: {}, focused: [] }, 'Lôi Đạo', '', 1).state;
    const r = addDaoXp(s0, 'Lôi Đạo', 100);
    expect(r.state.paths.loi_dao!.level).toBe(2);
    expect(r.leveledUp).toBe(true);
  });

  it('damage mul lv 9 = 1.6', () => {
    expect(getDaoMul(9)).toBeCloseTo(1.6);
  });

  it('lv max → Infinity', () => expect(getDaoXpToNext(MAX_DAO_LEVEL)).toBe(Infinity));
});

describe('Pháp Tắc — registry + unlock', () => {
  it('sinh_tu unlock từ level 70', () => {
    expect(getPhapTacById('sinh_tu')).toBeDefined();
    expect(getAvailablePhapTac(60).find((p) => p.id === 'sinh_tu')).toBeUndefined();
    expect(getAvailablePhapTac(70).find((p) => p.id === 'sinh_tu')).toBeDefined();
  });

  it('cấp 100 unlock tất cả default (không canon-exclusive)', () => {
    const all = getAvailablePhapTac(100);
    expect(all.length).toBeGreaterThanOrEqual(10);
  });
});
