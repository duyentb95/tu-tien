/**
 * Phase 13.1D: World Genesis — AI wizard cho open-world mode.
 *
 * Khi user chọn "Tự do sáng tạo", thay vì empty form, mở wizard 4 bước:
 *   1. Tone (chips multi-select)
 *   2. Cosmology shape (radio)
 *   3. Magic density (radio)
 *   4. Theme tags (multi-select)
 *
 * AI sinh ra MỘT thế giới tu tiên hoàn chỉnh có realm list + sects + locations + lore
 * theo các tham số đó. User có thể "Chốt" hoặc "Re-roll".
 *
 * Output shape gần với FanFicAnalyzeResult — drop-in compatible với analyzeFanFic flow.
 */

import { z } from 'zod';

export type WorldTone = 'tươi sáng' | 'đen tối' | 'khôi hài' | 'bi tráng' | 'ấm áp' | 'lạnh lẽo' | 'huyền bí';
export type WorldCosmology = 'don-canh' | 'song-canh' | 'cuu-trung' | 'multiverse';
export type WorldMagicDensity = 'low-magic' | 'high-magic' | 'xenobiology';
export type WorldThemeTag =
  | 'than-thoai-dong-phuong'
  | 'mat-the'
  | 'di-gioi-xuyen-khong'
  | 'van-minh-co-dai'
  | 'hien-dai-tu-chan'
  | 'vo-hiep-thuan'
  | 'sci-fi-cyberpunk'
  | 'kiem-tien-thuan';

export interface WorldGenesisInput {
  tone: WorldTone[];
  cosmology: WorldCosmology;
  magicDensity: WorldMagicDensity;
  themes: WorldThemeTag[];
  /** Optional: tên/keyword user muốn AI cân nhắc khi đặt tên thế giới */
  inspirationKeyword?: string;
}

export const WorldGenesisSchema = z.object({
  /** Tên thế giới (creative, evocative) */
  worldName: z.string(),
  /** Slogan/tagline 1 câu — đặt mood ngay từ đầu */
  tagline: z.string(),
  /** Mô tả bối cảnh tổng thể (3-5 câu) */
  setting: z.string(),
  /** Theme summary — phối hợp các theme tags user chọn */
  theme: z.string(),
  /** Đơn vị tiền tệ unique cho thế giới này */
  currencyName: z.string(),
  /** Realm list — số cảnh giới phụ thuộc cosmology */
  realmList: z.array(z.string()).min(3),
  /** Mô tả cosmology + power system tổng quan (2-3 câu) */
  cosmologyDescription: z.string(),
  /** Vị trí khởi đầu mặc định */
  startingLocation: z.string(),

  /** 3-5 đại tông môn/phe phái */
  sects: z.array(
    z.object({
      name: z.string(),
      alignment: z.enum(['chinh', 'ma', 'trung', 'an']),
      description: z.string(),
      philosophy: z.string().optional(),
    }),
  ).min(3).max(6),

  /** 4-6 location lớn (thành thị, đại lục, cấm địa) */
  locations: z.array(
    z.object({
      name: z.string(),
      category: z.string(),
      description: z.string(),
    }),
  ).min(3).max(6),

  /** 3-5 NPC khởi đầu (sư phụ, đối thủ, bạn đồng hành tiềm năng) */
  npcs: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      description: z.string(),
    }),
  ).min(3).max(6),

  /** 3-5 vật phẩm signature unique cho thế giới này */
  items: z.array(
    z.object({
      name: z.string(),
      category: z.string(),
      rarity: z.enum(['Thường', 'Tốt', 'Hiếm', 'Cực Phẩm', 'Siêu Phẩm', 'Huyền Thoại']),
      description: z.string(),
    }),
  ).min(3).max(6),

  /** 3-5 công pháp/kỹ năng signature */
  skills: z.array(
    z.object({
      name: z.string(),
      kind: z.enum(['combat_basic', 'combat_ultimate', 'adventure']),
      rarity: z.enum(['Thường', 'Tốt', 'Hiếm', 'Cực Phẩm', 'Siêu Phẩm', 'Huyền Thoại']),
      description: z.string(),
    }),
  ).min(3).max(6),

  /** 3-6 thuật ngữ đặc trưng — để inject vào prompt narrative */
  terminology: z.array(
    z.object({
      term: z.string(),
      kind: z.enum(['kinh_mach', 'huyet_vi', 'realm_term', 'territory', 'time_unit', 'item_category', 'other']),
      explanation: z.string(),
    }),
  ).min(3).max(8),

  /** Suggested character backstory templates phù hợp thế giới này */
  suggestedBackstories: z.array(z.string()).min(2).max(4),
});

export type WorldGenesisResult = z.infer<typeof WorldGenesisSchema>;

const COSMOLOGY_LABEL: Record<WorldCosmology, string> = {
  'don-canh': 'Đơn cảnh (1 chiều không gian, 5-7 cảnh giới)',
  'song-canh': 'Song cảnh (Phàm + Tiên hoặc Dương + Âm, 8-10 cảnh giới)',
  'cuu-trung': 'Cửu trùng (9 tầng trời/9 vực, 9-13 cảnh giới)',
  'multiverse': 'Multiverse (nhiều vũ trụ song song, 12-15 cảnh giới)',
};

const MAGIC_LABEL: Record<WorldMagicDensity, string> = {
  'low-magic': 'Low magic — tu sĩ hiếm, mỗi cảnh giới là kỳ tích, đa số là phàm nhân',
  'high-magic': 'High magic — tu sĩ phổ biến, sect linh tinh, tiền tệ là linh thạch',
  'xenobiology': 'Xenobiology — đa chủng tộc (yêu/ma/tiên/quái), mỗi tộc có hệ tu khác',
};

const THEME_LABEL: Record<WorldThemeTag, string> = {
  'than-thoai-dong-phuong': 'Thần thoại Đông phương cổ',
  'mat-the': 'Mạt thế (thế giới sụp đổ, tu sĩ thưa thớt)',
  'di-gioi-xuyen-khong': 'Dị giới xuyên không (nhân vật từ hiện đại sang)',
  'van-minh-co-dai': 'Văn minh cổ đại (di tích tổ tiên, công nghệ thất truyền)',
  'hien-dai-tu-chan': 'Hiện đại tu chân (đô thị + tu luyện)',
  'vo-hiep-thuan': 'Võ hiệp thuần (không tu chân, chỉ võ công)',
  'sci-fi-cyberpunk': 'Sci-fi cyberpunk (vũ trụ + công nghệ)',
  'kiem-tien-thuan': 'Kiếm tiên thuần (kiếm là gốc, tu kiếm cảnh)',
};

/** Build prompt yêu cầu AI sinh world genesis */
export const buildWorldGenesisPrompt = (input: WorldGenesisInput): string => {
  const tones = input.tone.length > 0 ? input.tone.join(', ') : 'trung tính';
  const themes = input.themes.length > 0
    ? input.themes.map((t) => THEME_LABEL[t]).join(' + ')
    : 'tu tiên cổ điển';

  return `
VAI TRÒ: Ngươi là một tác giả tiểu thuyết tu tiên huyền huyễn bậc thầy, được giao nhiệm vụ sáng tạo MỘT thế giới tu tiên hoàn toàn mới.

USER ĐÃ CHỌN THAM SỐ:
- Tone (không khí): ${tones}
- Cosmology shape: ${COSMOLOGY_LABEL[input.cosmology]}
- Magic density: ${MAGIC_LABEL[input.magicDensity]}
- Theme tags: ${themes}
${input.inspirationKeyword ? `- Inspiration keyword: "${input.inspirationKeyword}"` : ''}

NHIỆM VỤ: Sinh ra thế giới với độ độc đáo + sáng tạo CAO. KHÔNG copy paste từ truyện có sẵn (Mục Thần Ký, Phàm Nhân, Đấu Phá...). Tự đặt tên realm/sect/NPC/item theo style Hán Việt phù hợp tu tiên nhưng UNIQUE.

YÊU CẦU:
1. **realmList**: số cảnh giới phụ thuộc cosmology user chọn (đơn cảnh 5-7, song cảnh 8-10, cửu trùng 9-13, multiverse 12-15). Đặt tên creative, không trùng các realm phổ biến.
2. **sects**: 4-6 đại tông môn/phe phái. Mỗi sect có alignment + philosophy khác biệt. Nên có ít nhất 1 chinh, 1 ma/an, 1 trung lập để tạo tension.
3. **locations**: 4-6 location đa dạng — vùng khởi đầu (sơn thôn/đô thị nhỏ) + đại lục lớn + cấm địa.
4. **npcs**: 4-5 NPC khởi đầu — 1 sư phụ tiềm năng, 1 đối thủ, 1 bạn đồng hành, 1 tri kỷ tiềm năng, có thể thêm 1 bí ẩn.
5. **items**: 3-5 vật phẩm signature unique, mỗi món có lore + power level rõ ràng.
6. **skills**: 3-5 công pháp signature — chia đều combat_basic / combat_ultimate / adventure.
7. **terminology**: 3-6 thuật ngữ unique (tên kinh mạch, huyệt vị, đơn vị thời gian/lãnh thổ đặc thù).
8. **suggestedBackstories**: 2-4 gợi ý backstory nhân vật khởi đầu phù hợp thế giới này.

TONE GUIDANCE:
${input.tone.map((t) => {
  const guides: Record<WorldTone, string> = {
    'tươi sáng': '- Tươi sáng: thế giới có hy vọng, sư phụ tử tế, mạo hiểm thú vị.',
    'đen tối': '- Đen tối: thế giới khắc nghiệt, betrayal phổ biến, đường tu là máu + nước mắt.',
    'khôi hài': '- Khôi hài: có yếu tố trolling, NPC quirky, tình huống hài hước.',
    'bi tráng': '- Bi tráng: hy sinh + mất mát là chủ đạo, anh hùng cô độc.',
    'ấm áp': '- Ấm áp: tình thân + tình bạn được nhấn mạnh, gia đình quan trọng.',
    'lạnh lẽo': '- Lạnh lẽo: thế giới xa lạ, nhân vật cô đơn, ít kết nối cảm xúc.',
    'huyền bí': '- Huyền bí: nhiều bí mật chưa giải, lore sâu, ngữ điệu mistical.',
  };
  return guides[t];
}).join('\n')}

OUTPUT: CHỈ trả về JSON đúng schema. KHÔNG markdown wrapper. KHÔNG comment.
`.trim();
};

export { COSMOLOGY_LABEL, MAGIC_LABEL, THEME_LABEL };
