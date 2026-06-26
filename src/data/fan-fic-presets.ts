/**
 * Fan-fic universe presets — inject lore vào prompt khi user chọn.
 *
 * Vấn đề: Gemini không có deep knowledge về tiểu thuyết tu tiên TQ. Khi user
 * nhập "Mục Thần Ký", AI đoán mò → narrative xa nguyên tác (sai tên NPC, sai
 * setting, dùng "Tù Trưởng" thay vì "Tần Phụng").
 *
 * Fix: 7 preset cho universe phổ biến — match storyTitle (hoặc alias) → inject
 * lore brief vào prompt. AI dùng grounding này để dệt narrative đúng tinh thần.
 *
 * Khi user nhập universe không có trong preset → fallback chế độ tự do.
 *
 * Source: tóm tắt ngắn dựa trên knowledge public, không copy nguyên văn.
 */

export interface FanFicPreset {
  id: string;
  /** Tên chính + alias để match storyTitle */
  title: string;
  aliases: string[];
  author: string;
  /** Brief 2-3 đoạn về bối cảnh, hệ thống, key NPCs để inject prompt */
  lore: string;
  /** Tên nhân vật chính trong nguyên tác (gợi ý cho user) */
  protagonistName?: string;
  /** Vị trí khởi đầu thường thấy (gợi ý setting) */
  startingLocation?: string;
  /** Vài key terms quan trọng (cảnh giới, item, faction) */
  keyTerms?: string[];
}

export const FAN_FIC_PRESETS: FanFicPreset[] = [
  {
    id: 'muc-than-ky',
    title: 'Mục Thần Ký',
    aliases: ['mục thần ký', 'mucthanky', 'muc than ky', 'mu shen ji'],
    author: 'Trạch Trư (Zhai Zhu)',
    protagonistName: 'Tần Mục',
    startingLocation: 'Đại Hoang thôn — một làng nhỏ giữa Đại Hoang (vùng đất hoang dã đầy quái thú), nơi có Tần thị tộc nhân nuôi gia súc, chăn thả',
    keyTerms: [
      'Linh Hải cảnh', 'Thần Kiều cảnh', 'Tâm Cảnh', 'Pháp Tướng cảnh',
      'Tần thị', 'Đại Hoang', 'Thái Hư Cổ Long Mã', 'Đại Tu Hành Sĩ',
      'Hư Thiên Phong', 'Thiên Thư', 'Tổ Thần', 'Tử Thần',
    ],
    lore: `BỐI CẢNH: Mục Thần Ký lấy bối cảnh thời đại tu sĩ suy thoái, các đại tông môn cổ xưa đã sụp đổ. Tần Mục là một cậu bé mồ côi sống ở **Đại Hoang thôn** — làng nhỏ của **Tần thị tộc** giữa **Đại Hoang** (vùng đất hoang dã chứa nhiều quái thú, hung điểu). Tần thị tộc nuôi gia súc + chăn thả các loài thú đặc biệt (Thái Hư Cổ Long Mã, Vô Trác Đại Bằng...).

KEY NPCs: **Tần Phụng** (trưởng làng, thân thủ cao cường, ông ngoại nuôi Tần Mục), **Tần Hồng Sinh** (sư huynh, anh tài), các sư thúc bá trong làng đều có lai lịch — họ là các đại nhân vật cường giả ẩn cư. Tần Mục nhìn bình thường nhưng có **mắt thần kỳ** thấy được điều người khác không thấy.

HỆ THỐNG TU LUYỆN: Tu sĩ chia thành các cảnh giới: **Linh Hải → Thần Kiều → Tâm Cảnh → Pháp Tướng → Đỗ Kiếp → Vân Đài → Khai Sơn → Hợp Đạo → Động Thần**. Mở "Linh Hải" trong cơ thể là bước đầu tiên. Tu sĩ chia hệ: võ tu, đạo tu, ma tu, ma tướng, thần linh hệ...

TINH THẦN: Tu hành gian khổ, nhân tình ấm áp giữa các thị tộc nhân, đề cao trí tuệ + ngộ tính. Tần Mục không thiên phú cực cao nhưng học nhanh + có mắt thần.`,
  },

  {
    id: 'dau-pha-thuong-khung',
    title: 'Đấu Phá Thương Khung',
    aliases: ['đấu phá thương khung', 'dau pha thuong khung', 'đấu phá', 'dauphathuongkhung', 'douluodalu'],
    author: 'Thiên Tằm Thổ Đậu',
    protagonistName: 'Tiêu Viêm',
    startingLocation: 'Ô Đàn thành — Tiêu gia, thiếu gia Tiêu Viêm tu vi mất 3 năm vì hôn ước với Vân Vận',
    keyTerms: [
      'Đấu Khí', 'Đấu Giả', 'Đấu Sư', 'Đại Đấu Sư', 'Đấu Linh', 'Đấu Vương',
      'Đấu Hoàng', 'Đấu Tông', 'Đấu Tôn', 'Đấu Thánh', 'Đấu Đế',
      'Tiêu gia', 'Vân Lam Tông', 'Dược Lão', 'Nạp Lan Yên Nhiên', 'Tiêu Huân Nhi',
      'Dị hỏa', 'Tô Thiên', 'Già Mã Đế Quốc',
    ],
    lore: `BỐI CẢNH: Đại Lục Đấu Khí, nơi tu luyện theo hệ **Đấu Khí** (không phải linh khí). Cấp bậc: **Đấu Giả → Đấu Sư → Đại Đấu Sư → Đấu Linh → Đấu Vương → Đấu Hoàng → Đấu Tông → Đấu Tôn → Đấu Thánh → Đấu Đế**. Mỗi cấp chia 9 sao.

PROTAGONIST: **Tiêu Viêm** là thiếu gia Tiêu gia ở **Ô Đàn thành**. Hắn từng là thiên tài, nhưng đột nhiên tu vi tụt 3 năm liền → bị Vân gia hủy hôn ước với **Nạp Lan Yên Nhiên**. Bí mật: Đấu Khí bị một linh hồn cổ ăn — **Dược Lão** (Dược Trần) — đại đan sư cổ đại trú ngụ trong nhẫn ngọc Tiêu Viêm đeo.

KEY ELEMENT: **Dị hỏa** — lửa thiên nhiên đặc biệt, mỗi loại có Hỏa Diễm Bảng. Tiêu Viêm thu thập dị hỏa để mạnh. **Luyện dược sư** là nghề tôn quý. Tiêu Viêm + Dược Lão trở thành luyện dược sư mạnh.

KEY NPCs: **Tiêu Huân Nhi** (em họ thiên tài), **Tiêu Chiến** (cha), **Vân Vận** (hôn thê cũ), **Hải Bột Đông** (đại sư huynh Vân Lam), **Tiêu Y** (nữ thần y).

TINH THẦN: Phục thù gia tộc, chinh phục đại lục, thu phục mỹ nữ. Văn phong nhiệt huyết, nhân vật có "kim thủ chỉ" rõ ràng.`,
  },

  {
    id: 'pham-nhan-tu-tien',
    title: 'Phàm Nhân Tu Tiên Truyện',
    aliases: ['phàm nhân tu tiên', 'pham nhan tu tien', 'phàm nhân', 'pnttt', 'a record of a mortals journey to immortality'],
    author: 'Vong Ngữ',
    protagonistName: 'Hàn Lập',
    startingLocation: 'Thất Huyền Môn — môn phái nhỏ vùng quê, nơi Hàn Lập từ một nông dân phàm nhân trúng tuyển nhập môn',
    keyTerms: [
      'Luyện Khí kỳ', 'Trúc Cơ kỳ', 'Kết Đan kỳ', 'Nguyên Anh kỳ',
      'Hóa Thần kỳ', 'Hợp Thể kỳ', 'Đại Thừa kỳ', 'Độ Kiếp kỳ',
      'Thất Huyền Môn', 'Hoàng Phong Cốc', 'Thanh Nguyên Tử',
      'Mặc Đại Phu', 'Nam Cung Uyển', 'Lý Hóa Long', 'Linh Văn Tông',
    ],
    lore: `BỐI CẢNH: **Phàm Nhân Tu Tiên Truyện** — câu chuyện về **Hàn Lập**, một nông dân bình thường không có tài năng đặc biệt, xuất thân nghèo khó từ một thôn nhỏ. Hắn vào **Thất Huyền Môn** (môn phái nhỏ) chỉ vì gia đình ép, ban đầu chỉ muốn rèn luyện rồi về nhà.

HỆ THỐNG TU LUYỆN: Cảnh giới chuẩn mực — **Luyện Khí → Trúc Cơ → Kết Đan → Nguyên Anh → Hóa Thần → Hợp Thể → Đại Thừa → Độ Kiếp**. Mỗi cảnh giới chia thành tiền/trung/hậu/đỉnh phong. Đột phá đại cảnh giới = thiên kiếp.

PROTAGONIST: Hàn Lập **không có thiên phú cao**, không có "tiền thân vô địch", không có sư phụ thần bí cho công pháp tuyệt thế. Hắn dựa vào **cẩn thận, nhẫn nại, ngộ tính trung bình + nỗ lực phi thường + chút may mắn** (bình thủy chích thẩm thấu cải mệnh). Rất sợ chết, luôn thận trọng — không liều mạng vì "danh dự".

VĂN PHONG: Chậm rãi, chi tiết, hiện thực — không phải kim thủ chỉ open. Có hàng trăm chương Luyện Khí mới đột phá Trúc Cơ. Tu hành thực sự gian nan.

KEY NPCs: **Mặc Đại Phu** (sư phụ luyện dược ở Thất Huyền Môn), **Nam Cung Uyển** (đạo lữ đầu tiên — Trúc Cơ kỳ), **Lý Hóa Long** (đồng môn).`,
  },

  {
    id: 'tru-tien',
    title: 'Tru Tiên',
    aliases: ['tru tiên', 'tru tien', 'jade dynasty'],
    author: 'Tiêu Đỉnh',
    protagonistName: 'Trương Tiểu Phàm',
    startingLocation: 'Thảo Miếu thôn — sau khi cả thôn bị thảm sát, được Phổ Trí thiền sư cứu rồi đưa vào Thanh Vân Môn',
    keyTerms: [
      'Thanh Vân Môn', 'Thanh Vân Quyết', 'Đại Trúc Phong',
      'Phổ Trí thiền sư', 'Quỷ Vương', 'Bích Dao', 'Lục Tuyết Kỳ',
      'Hợp Hoan Linh', 'Thiên Âm Tự', 'Phần Hương Cốc',
      'Phệ Hồn Châu', 'Hỏa Lân Phiến', 'Thất Mạch Thần Kiếm',
    ],
    lore: `BỐI CẢNH: Tu tiên giới Trung Nguyên chia chính - tà. Chính đạo gồm: **Thanh Vân Môn**, **Thiên Âm Tự**, **Phần Hương Cốc**. Ma đạo gồm: **Quỷ Vương tông**, **Hợp Hoan Phái**, **Trường Sinh Đường**.

PROTAGONIST: **Trương Tiểu Phàm** — sau khi cả Thảo Miếu thôn bị Trường Sinh Đường thảm sát, hắn được **Phổ Trí thiền sư** (Thiên Âm Tự) cứu rồi đưa vào **Thanh Vân Môn**. Tư chất hắn ban đầu rất kém, học **Thái Cực Huyền Thanh Đạo** (công pháp tự nhiên của Đại Trúc Phong) thay vì Thanh Vân Quyết — vô tình lại trở thành nền tảng độc đáo.

KEY NPCs: **Tống Đại Nhân** (sư phụ trong Đại Trúc Phong), **Lục Tuyết Kỳ** (sư tỷ thiên tài, chính phái), **Bích Dao** (nữ ma đạo, con gái Quỷ Vương — đường tình ngang trái), **Tiểu Hôi** (chó nhỏ của Tiểu Phàm, sau biến thành Hợp Hoan Linh).

TINH THẦN: Bi kịch, tình yêu đau khổ (Bích Dao vs Lục Tuyết Kỳ), ranh giới chính tà mờ ảo. Văn phong thâm tình, nhiều cảnh tang thương. Trương Tiểu Phàm từ thiếu niên hiền lành → ma đầu Quỷ Lệ.`,
  },

  {
    id: 'tien-nghich',
    title: 'Tiên Nghịch',
    aliases: ['tiên nghịch', 'tien nghich', 'renegade immortal'],
    author: 'Nhĩ Căn',
    protagonistName: 'Vương Lâm',
    startingLocation: 'Hà Lộc thôn — phàm nhân đứa con thứ ba của Vương gia, tham gia Hằng Nhạc môn tuyển đệ tử',
    keyTerms: [
      'Hằng Nhạc môn', 'Cô Mộc Tử', 'Chân Vũ tông',
      'Tu La giới', 'Tinh Hà giới', 'Bát Hoang tông',
      'Linh tử', 'Mặc Hổ', 'Tử Hà',
    ],
    lore: `BỐI CẢNH: Tu tiên giới đa giới — Tu La giới, Tinh Hà giới, Bát Hoang giới... Vương Lâm khởi đầu ở **Triệu quốc**, một quốc gia phàm nhân nhỏ. Hằng năm các tu tiên môn phái xuống tuyển đệ tử.

PROTAGONIST: **Vương Lâm** — con trai thứ ba Vương gia ở Hà Lộc thôn, tư chất bình thường. Tham gia tuyển đệ tử **Hằng Nhạc môn** vì danh dự gia đình, lận đận mãi mới qua. Sau khi nhập môn → bị xếp "tạp dịch đệ tử" do tư chất kém.

CỐT TRUYỆN: Vương Lâm có **lòng tu hành sắt đá** + **không nhân nghĩa khi cần** — sống còn là trên hết. Hắn giết người không nháy mắt, lừa thầy phản bạn nếu lợi ích cao. **"Nghịch thiên cải mệnh"** — chống lại thiên đạo bố trí.

KEY NPCs: **Cô Mộc Tử** (sư huynh Hằng Nhạc môn), **Lý Mộ Uyển** (nữ tử hôn ước phàm nhân, sau thành nữ chính), **Tử Hà** (linh thú).

TINH THẦN: Đen tối, thực dụng, anti-hero. Không cool như Tiêu Viêm, không hiền như Tiểu Phàm. Vương Lâm là một tu sĩ "phàm nhân" — không thiên phú nhưng ý chí + thủ đoạn cao.`,
  },

  {
    id: 'tinh-than-bien',
    title: 'Tinh Thần Biến',
    aliases: ['tinh thần biến', 'tinh than bien', 'stellar transformations'],
    author: 'Ngã Cật Tây Hồng Thị',
    protagonistName: 'Tần Vũ',
    startingLocation: 'Tần phủ - tu Lưu Vân tông sau khi cha gửi đi vì đặc thể không tu được pháp lực',
    keyTerms: [
      'Lưu Vân tông', 'Tần Đức', 'Lôi Vân',
      'Cửu Chuyển Hoàn Hỗn Quyết', 'Tinh Thần Biến',
      'Tinh thể', 'Ngân Quang Lưu Vân Kiếm', 'Hỗn Độn',
    ],
    lore: `BỐI CẢNH: Đông Phương Đại Lục, tu tiên giới chia 4 hệ chính: **Đạo, Phật, Yêu, Ma**. Cảnh giới: **Hậu Thiên → Tiên Thiên → Hoán Vũ → Hư Đan → Kim Đan → Nguyên Anh → Hợp Đạo → Độ Kiếp → Thái Ất**.

PROTAGONIST: **Tần Vũ** — con trai Tần Đức (đại tướng quân Đại Tần đế quốc), nhưng **đặc thể** (không tu được pháp lực bình thường) → bị cha thất vọng, gửi vào **Lưu Vân tông** học tu hành. Hắn không tu được nội lực → chỉ luyện thể, học **Cửu Chuyển Hoàn Hỗn Quyết** (đặc biệt cho đặc thể).

CỐT TRUYỆN: Tần Vũ luyện thể vô địch, sau khám phá ra cha hắn thực ra là tu sĩ Hỗn Độn cấp cao. Anh em ruột là **Tần Phong** (thiên phú cao, tu Lưu Vân chính tông).

TINH THẦN: Tình anh em, tình cha con — gia đình là motivation chính. Phục thù, vươn lên từ "không tu được" thành cường giả.`,
  },

  {
    id: 'tieu-dao',
    title: 'Tu Tiên Tự Do (chế độ tự sáng tạo)',
    aliases: ['tu tiên tự do', 'custom', 'tự sáng tạo', 'tao'],
    author: '— (chế độ mở)',
    lore: `Chế độ tự do — AI sẽ dệt nên một thế giới tu tiên độc đáo dựa trên background nhân vật ngươi nhập. Không có nguyên tác ràng buộc.

Hệ thống mặc định: **Luyện Khí → Trúc Cơ → Kim Đan → Nguyên Anh → Hóa Thần → Luyện Hư → Đại Thừa → Phi Thăng**. Có thể thêm: linh căn, độ kiếp, đạo lữ, pháp bảo, tông môn.

Hãy nhập background càng chi tiết càng tốt — vd: "đệ tử Vạn Cổ Tối Cường Tông", "tán tu cô độc gặp kỳ duyên", "công chúa một quốc gia bị diệt môn đi tìm thù"...`,
  },
];

/**
 * Match storyTitle với preset (case-insensitive, ignore accent partial).
 * Trả về preset nếu match, null nếu không.
 */
export const findFanFicPreset = (storyTitle: string | undefined): FanFicPreset | null => {
  if (!storyTitle) return null;
  const normalized = storyTitle.toLowerCase().trim();
  for (const preset of FAN_FIC_PRESETS) {
    if (preset.title.toLowerCase() === normalized) return preset;
    for (const alias of preset.aliases) {
      if (alias === normalized) return preset;
      // Partial match (vd "đấu phá" match "đấu phá thương khung")
      if (normalized.includes(alias) || alias.includes(normalized)) {
        if (Math.min(normalized.length, alias.length) >= 4) return preset;
      }
    }
  }
  return null;
};

/**
 * Build lore block để inject vào prompt khi storyTitle match preset.
 */
export const buildLoreInjection = (preset: FanFicPreset): string => {
  return `[BỐI CẢNH NGUYÊN TÁC — TUÂN THỦ NGHIÊM NGẶT]
Truyện này là fan-fiction của "${preset.title}" (tác giả: ${preset.author}).

${preset.lore}

${preset.keyTerms ? `KEY TERMS PHẢI DÙNG (không bịa thuật ngữ khác): ${preset.keyTerms.join(', ')}` : ''}

LƯU Ý KHI VIẾT NARRATIVE:
- Dùng đúng tên NPC, địa danh, hệ thống cảnh giới của nguyên tác ở trên
- Tinh thần văn phong theo nguyên tác (không chế thêm thuật ngữ lạ)
- Nhân vật chính của user có thể là OC (original character) trong universe này, nhưng phải tương tác với NPC + setting đúng nguyên tác
- KHÔNG tự ý đổi tên cảnh giới hệ thống. Vd nếu là Mục Thần Ký → dùng "Linh Hải cảnh", KHÔNG dùng "Luyện Khí"`;
};
