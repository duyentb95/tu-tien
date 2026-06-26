/**
 * Fan-fic AI Analyzer — wizard 3 fields → AI populate GameSettings + World seed.
 *
 * Pattern lấy từ prototype (populateSettingsFromFanFic):
 *   1. User nhập: tên tác phẩm + kiểu nhân vật (Hóa Thân/Khởi Sinh) + tên nhân vật
 *   2. AI gọi Gemini với JSON schema bắt buộc
 *   3. Response hydrate: storyTitle, theme, setting, currencyName, character*, initialWorldElements
 *   4. UI cho user review + edit trước khi vào Setup screen
 *
 * AI dùng public knowledge về tác phẩm — Gemini biết các bộ tu tiên phổ biến.
 * Khi tác phẩm lạ → AI sáng tạo theo style fan-fic.
 */

import { z } from 'zod';

export interface FanFicSetupForm {
  /** "Mục Thần Ký", "Phàm Nhân Tu Tiên Truyện"... */
  originalWork: string;
  /** Hóa Thân = nhân vật có sẵn (vd Tần Mục). Khởi Sinh = nhân vật mới ngươi tự đặt. */
  characterType: 'incarnate' | 'newborn';
  /** Tên nhân vật. Hóa Thân: tên có sẵn nguyên tác. Khởi Sinh: tên ngươi tự đặt */
  characterName: string;
  /** Optional — chỉ cho Khởi Sinh: mô tả background nhân vật mới */
  characterDescription?: string;
}

/** JSON schema response — AI bắt buộc phải trả đúng shape này */
export const FanFicAnalyzeSchema = z.object({
  /** Tên truyện hiển thị, vd "Mục Thần Ký: Khởi Đầu Tại Đại Hoang" */
  storyTitle: z.string(),
  /** Chủ đề + thể loại, vd "Tiên Hiệp, Huyền Huyễn, Cải Cách" */
  theme: z.string(),
  /** Đoạn mô tả bối cảnh thế giới gốc (2-4 câu) */
  setting: z.string(),
  /** Tên đơn vị tiền tệ trong universe đó (vd "Linh Thạch", "Tinh Linh", "Đấu Khí Tinh") */
  currencyName: z.string(),
  /** Tên nhân vật chính (có thể giống input hoặc AI tinh chỉnh) */
  characterName: z.string(),
  /** Giới tính: Nam / Nữ / Trung tính */
  characterGender: z.string(),
  /** Tính cách 1-2 câu */
  characterPersonality: z.string(),
  /** Background nhân vật trong universe gốc (2-4 câu) */
  characterBackstory: z.string(),
  /** Hệ thống cảnh giới tu luyện theo nguyên tác (array string) — vd ["Luyện Khí", "Trúc Cơ"...] */
  realmList: z.array(z.string()).min(3),
  /** Vị trí khởi đầu — tên ngắn (vd "Đại Hoang thôn") */
  startingLocation: z.string(),
  /** 2-5 NPC + 2-5 location khởi đầu trong universe để inject vào knowledge */
  initialWorldElements: z.array(
    z.object({
      name: z.string(),
      type: z.enum(['NPC', 'LOCATION']),
      description: z.string(),
    }),
  ).min(2).max(12),
  /** 2-4 tông môn/môn phái nổi tiếng của universe — replace default 15 sects */
  initialSects: z.array(
    z.object({
      name: z.string(),
      alignment: z.enum(['chinh', 'ma', 'trung', 'an']).default('trung'),
      description: z.string(),
      philosophy: z.string().optional(),
      /** Có thể gia nhập từ cấp nào (mặc định 1) */
      joinLevelMin: z.number().default(1),
    }),
  ).min(0).max(6),
  /** 2-4 linh thú đặc trưng universe — replace default 25 beasts */
  initialBeasts: z.array(
    z.object({
      name: z.string(),
      rarity: z.enum(['Thường', 'Tốt', 'Hiếm', 'Cực Phẩm', 'Siêu Phẩm', 'Huyền Thoại']).default('Tốt'),
      kind: z.enum(['beast', 'dragon', 'phoenix', 'sword_spirit', 'spirit', 'mystical']).default('beast'),
      description: z.string(),
      /** Stat power estimate, scale theo level — vd 50 = mid common */
      basePower: z.number().min(10).max(2000).default(100),
    }),
  ).min(0).max(6),
});

export type FanFicAnalyzeResult = z.infer<typeof FanFicAnalyzeSchema>;

/**
 * Build prompt yêu cầu AI phân tích tác phẩm gốc + hydrate settings.
 */
export const buildFanFicAnalyzePrompt = (form: FanFicSetupForm): string => {
  const typeLabel = form.characterType === 'incarnate'
    ? `HÓA THÂN (đóng vai nhân vật CÓ SẴN trong nguyên tác)`
    : `KHỞI SINH (nhân vật MỚI do ngươi tự tạo, sống trong universe gốc)`;

  const charBlock = form.characterType === 'incarnate'
    ? `Nhân vật: **${form.characterName}** (nhân vật chính/phụ có sẵn trong nguyên tác). Giữ đúng tính cách, background, vai trò của nhân vật này theo nguyên tác.`
    : `Nhân vật: **${form.characterName}** (nhân vật MỚI do người chơi tạo).${form.characterDescription ? ` Mô tả: ${form.characterDescription}` : ' AI tự thiết kế background hợp lý trong universe.'}`;

  return `
[VAI TRÒ]
Ngươi là **AI phân tích văn học** chuyên về tiểu thuyết tu tiên / huyền huyễn / tiên hiệp. Nhiệm vụ: phân tích tác phẩm gốc và setup cấu hình game RPG đồng nhân (fan-fiction).

[ĐẦU VÀO]
- Tác phẩm gốc: **"${form.originalWork}"**
- Kiểu nhân vật: ${typeLabel}
- ${charBlock}

[NHIỆM VỤ — BẮT BUỘC TUÂN THỦ TUẦN TỰ]
1. **Truy xuất kiến thức** về tác phẩm "${form.originalWork}":
   - Tác giả, bối cảnh thế giới, hệ thống tu luyện, key NPCs, key locations
   - Nếu KHÔNG biết tác phẩm này → sáng tạo theo style fan-fic Đông Phương cổ phong

2. **Hydrate game settings** theo schema JSON dưới. Yêu cầu:
   - **storyTitle**: tên truyện + điểm khởi đầu, vd "Mục Thần Ký: Khởi Đầu Tại Đại Hoang"
   - **theme**: 3-4 thể loại cách dấu phẩy, vd "Tiên Hiệp, Huyền Huyễn, Cải Cách"
   - **setting**: 2-4 câu mô tả thế giới gốc — DÙNG ĐÚNG terminology nguyên tác
   - **currencyName**: đơn vị tiền theo nguyên tác (vd "Linh Thạch" cho hầu hết tu tiên, "Đấu Khí Tinh" cho Đấu Phá, "Tinh Linh" cho Tinh Thần Biến)
   - **realmList**: array hệ thống cảnh giới ĐÚNG NGUYÊN TÁC từ thấp đến cao (vd Mục Thần Ký = ["Linh Hải", "Thần Kiều", "Tâm Cảnh", "Pháp Tướng", "Đỗ Kiếp", "Vân Đài", "Khai Sơn", "Hợp Đạo", "Động Thần"]; Đấu Phá = ["Đấu Giả", "Đấu Sư", "Đại Đấu Sư", ...])

3. **Hydrate character**:
   - Nếu Hóa Thân → lấy đúng characterName, characterGender, characterPersonality, characterBackstory theo nguyên tác
   - Nếu Khởi Sinh → giữ tên người chơi nhập, AI điền background hợp lý (vd "đệ tử tạp dịch tông môn X" cho universe có tông môn)

4. **initialWorldElements**: 4-8 entity quan trọng nhất ở thời điểm khởi đầu:
   - Mix LOCATION (2-4) + NPC (2-4)
   - LOCATION: tên + 1 câu mô tả (vd "Đại Hoang thôn — làng nhỏ của Tần thị tộc giữa Đại Hoang đầy quái thú")
   - NPC: tên + 1 câu role/relationship (vd "Tần Phụng — trưởng làng, ông ngoại nuôi Tần Mục")
   - CHỈ chọn entity xuất hiện ngay đoạn mở đầu nguyên tác, KHÔNG spoil late-game

5. **initialSects**: 2-4 tông môn nổi tiếng của universe (replace default 15 sects mặc định):
   - VD Mục Thần Ký: "Bích Bạch Cung", "Tô Tà Tông", "Đại Phố Châu" (alignment trung)
   - VD Đấu Phá: "Vân Lam Tông", "Hắc Hoàng Tông", "Già Mã Đế Quốc"
   - VD Phàm Nhân: "Thất Huyền Môn", "Hoàng Phong Cốc", "Linh Văn Tông"
   - VD Mặc Đồ default (nếu universe lạ): "Thanh Vân Môn", "Vạn Pháp Tông", "Huyết Sát Tông"
   - alignment: 'chinh' | 'ma' | 'trung' | 'an'
   - joinLevelMin: cấp tối thiểu (1-50)

6. **initialBeasts**: 2-4 linh thú/yêu thú đặc trưng universe:
   - VD Mục Thần Ký: "Thái Hư Cổ Long Mã" (Huyền Thoại dragon), "Vô Trác Đại Bằng" (phoenix), "Bạch Xà"
   - VD Đấu Phá: "Phong Hỗn Tử Cánh Thiên Xà Vương" (Huyền Thoại), "Hỏa Vân Long"
   - VD Phàm Nhân: "Tinh Linh Hồ", "Hắc Vụ Lang"
   - kind: 'beast' | 'dragon' | 'phoenix' | 'sword_spirit' | 'spirit' | 'mystical'
   - rarity: 'Thường' | 'Tốt' | 'Hiếm' | 'Cực Phẩm' | 'Siêu Phẩm' | 'Huyền Thoại'
   - basePower: 50-200 (Thường/Tốt), 300-600 (Hiếm), 800-1500 (Cực+), 1500-2000 (Huyền Thoại)

[QUY TẮC CẤM]
- KHÔNG dùng cảnh giới Luyện Khí/Trúc Cơ/Kim Đan nếu nguyên tác có hệ thống riêng (vd Đế Bá = Sinh Mệnh Cung)
- KHÔNG bịa tên NPC không có trong nguyên tác (trừ khi Khởi Sinh + không biết universe)
- KHÔNG spoiler twist late-game vào initialWorldElements
- KHÔNG dùng tiếng Anh/Nhật trong tên — toàn bộ Hán-Việt

[ĐỊNH DẠNG ĐẦU RA]
TRẢ VỀ DUY NHẤT 1 JSON OBJECT theo schema:
{
  "storyTitle": "...",
  "theme": "...",
  "setting": "...",
  "currencyName": "...",
  "characterName": "...",
  "characterGender": "Nam" | "Nữ" | "Trung tính",
  "characterPersonality": "...",
  "characterBackstory": "...",
  "realmList": ["...", "...", "..."],
  "startingLocation": "...",
  "initialWorldElements": [
    { "name": "...", "type": "NPC" | "LOCATION", "description": "..." }
  ],
  "initialSects": [
    { "name": "...", "alignment": "chinh|ma|trung|an", "description": "...", "philosophy": "...", "joinLevelMin": 1 }
  ],
  "initialBeasts": [
    { "name": "...", "rarity": "Hiếm", "kind": "dragon", "description": "...", "basePower": 300 }
  ]
}

KHÔNG viết gì ngoài JSON. KHÔNG dùng markdown \`\`\`json wrapper.
`.trim();
};
