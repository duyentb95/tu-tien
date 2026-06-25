import { describe, it, expect } from 'vitest';
import { parseGameTags, stripGameTags } from './tag-parser';

describe('parseGameTags', () => {
  it('parse EXP+', () => {
    expect(parseGameTags('xong rồi [EXP+ 120]')).toEqual([{ type: 'EXP_GAIN', amount: 120 }]);
  });

  it('parse HP- (damage)', () => {
    expect(parseGameTags('[HP- 50]')).toEqual([{ type: 'HP_DELTA', amount: -50 }]);
  });

  it('parse HP+ (heal)', () => {
    expect(parseGameTags('[HP+ 80]')).toEqual([{ type: 'HP_DELTA', amount: 80 }]);
  });

  it('parse ITEM 3 fields', () => {
    expect(parseGameTags('[ITEM Tử Tiêu Kiếm|Huyền Thoại|Vũ khí]')).toEqual([
      { type: 'ITEM_GAINED', name: 'Tử Tiêu Kiếm', rarity: 'Huyền Thoại', category: 'Vũ khí' },
    ]);
  });

  it('parse SKILL', () => {
    expect(parseGameTags('[SKILL Lôi Thiểm|combat_basic|Cực Phẩm]')).toEqual([
      { type: 'SKILL_LEARNED', name: 'Lôi Thiểm', kind: 'combat_basic', rarity: 'Cực Phẩm' },
    ]);
  });

  it('parse REALM_BREAK + TRIBULATION', () => {
    expect(parseGameTags('[REALM_BREAK][TRIBULATION Đại đột phá Trúc Cơ]')).toEqual([
      { type: 'REALM_BREAK' },
      { type: 'TRIBULATION', reason: 'Đại đột phá Trúc Cơ' },
    ]);
  });

  it('parse COMBAT', () => {
    expect(parseGameTags('[COMBAT Hắc Vụ Lang|3]')).toEqual([
      { type: 'COMBAT_START', enemyName: 'Hắc Vụ Lang', enemyLevel: 3 },
    ]);
  });

  it('parse STAT atk+10', () => {
    expect(parseGameTags('[STAT atk+10]')).toEqual([
      { type: 'STAT_BUFF', stat: 'atk', amount: 10 },
    ]);
  });

  it('parse nhiều tag trong 1 chuỗi', () => {
    const raw = 'Sau trận chiến: [EXP+ 50] [CURRENCY+ 120] [ITEM Hồi Khí Đan|Tốt|Đan dược]';
    const events = parseGameTags(raw);
    expect(events).toHaveLength(3);
  });

  it('stripGameTags loại bỏ hết tag', () => {
    const raw = 'Ngươi đánh bại Hắc Vụ Lang. [EXP+ 50] [CURRENCY+ 30]';
    expect(stripGameTags(raw)).toBe('Ngươi đánh bại Hắc Vụ Lang.');
  });

  it('tag không đúng format → bỏ qua', () => {
    expect(parseGameTags('[EXP+ abc]')).toEqual([]);
  });
});
