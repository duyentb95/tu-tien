/**
 * MOCK AI — fixture chunks có inject TAGS thực sự để demo full game loop.
 * 2 chế độ sử dụng:
 *   1. `import.meta.env.VITE_GEMINI_API_KEY` rỗng → mock chunks toàn bộ session.
 *   2. AI fail (503 sau hết retry+fallback) → narrative-service catch + fallback mock.
 *
 * Mock OPENING tự personalize theo background user nhập (player.description,
 * settings.storyTitle). Các chunk sau dùng template generic.
 */

import type { NarrativeContext } from './prompts/narrative';

/**
 * Generate opening cá nhân hóa theo background user.
 * Nếu user nhập "đệ tử Vạn Cổ Tối Cường Tông" → opening dùng tên tông đó,
 * không hardcoded "Thanh Vân Phong" nữa.
 */
const buildPersonalizedOpening = (ctx?: NarrativeContext): string => {
  const name = ctx?.player?.Name || 'Đạo Hữu';
  const desc = ctx?.player?.description?.trim();
  const storyTitle = ctx?.settings?.storyTitle?.trim();

  // Đoạn mô tả bối cảnh — ưu tiên description user nhập
  const sceneIntro = desc
    ? `Theo gió tu tiên đưa ngươi đến hôm nay — ${desc}. ${name} đứng giữa thiên địa bao la, hô hấp đều đặn, cảm nhận linh khí mong manh len lỏi vào kinh mạch.`
    : `Sương sớm phủ kín núi non, từng tia nắng đầu ngày xuyên qua tầng mây tựa thiên kiếm. ${name} đứng giữa sân đá xanh, hô hấp đều đặn, cảm nhận linh khí mong manh len lỏi vào kinh mạch.`;

  const titleHint = storyTitle && storyTitle !== 'Mặc Hội Tiên Đồ'
    ? `Bên tai vẳng nghe tiếng vọng "${storyTitle}" — như một lời tiên tri cổ xưa đang dần ứng nghiệm.`
    : `Bên hông, thanh trường kiếm gỉ sét rung nhẹ như muốn ứng theo nhịp tim ngươi.`;

  return `<narrative>
${sceneIntro} ${titleHint}
<dialogue speaker="Một lão giả thần bí">Tiểu hữu... có vẻ ngươi là người mà ta đã chờ rất lâu. Hãy nhận lấy 50 viên linh thạch này, coi như duyên khởi đầu. Đường tu tiên hung hiểm — hãy tự lượng sức.</dialogue>
</narrative>

[ITEM Trường Kiếm Gỉ|Thường|Vũ khí]
[CURRENCY+ 50]
[QUEST_GIVEN Khởi Đầu Tu Tiên|main|Khám phá thế giới tu tiên, tìm cơ duyên đột phá cảnh giới.|Lão giả thần bí]
[NOTE ⚠ Đang chạy chế độ offline (AI tạm thời không phản hồi). Cốt truyện sẽ phong phú hơn khi AI khả dụng.]

[ACTION:1] Cảm tạ lão giả rồi rời đi tìm cơ duyên
[ACTION:2] Hỏi lão giả về lai lịch + thế giới này
[ACTION:3] Mở Bản Đồ xem đường đi
[ACTION:4] Vận khí tu luyện thêm một canh giờ`;
};

export const MOCK_NARRATIVE_CHUNKS: string[] = [
  // CHUNK 0 — placeholder (không dùng — getMockNarrative override với personalized)
  '',

  // CHUNK 1 — tu luyện
  `<narrative>
Ngươi ngồi xuống tảng đá xanh, đặt tay lên đùi theo thế Hồn Nguyên Tọa. Linh khí xung quanh từ từ tụ về kinh mạch, chảy qua đan điền tựa dòng sông nhỏ. Một canh giờ trôi qua, ngươi cảm thấy thân thể nhẹ nhõm hơn, đan điền ấm áp.
</narrative>

[EXP+ 80]
[HP+ 30]
[NOTE Tu luyện thành công · Tu vi tăng nhẹ]

[ACTION:1] Tiếp tục tu luyện thêm một canh giờ nữa
[ACTION:2] Đứng dậy xuống núi
[ACTION:3] Thử lĩnh ngộ công pháp mới
[ACTION:4] Mở Bản Đồ chọn đường`,

  // CHUNK 2 — encounter NPC + trang bị tốt
  `<narrative>
Xuống đến Trấn Lạc Vân, ngươi thấy một thiếu nữ áo trắng đứng bên giếng đá. Nàng nhìn ngươi rồi rút ra một mảnh ngọc bài chạm rồng, khẽ cười.
<dialogue speaker="Lạc Vô Thường">Đạo hữu trên người có khí chất khác lạ. Nếu có duyên, hãy nhận lấy Lôi Văn Phù này — biết đâu sau này hữu dụng. Ngoài ra, ta nghe nói trong Hậu Sơn Mật Lâm có yêu thú đang quấy nhiễu dân làng — nếu muốn lập công, có thể tới đó xem qua.</dialogue>
</narrative>

[ITEM Lôi Văn Phù|Cực Phẩm|Phụ kiện]
[QUEST_GIVEN Diệt Yêu Hậu Sơn|side|Tới Hậu Sơn Mật Lâm tiêu diệt Hắc Vụ Lang đang quấy nhiễu dân làng.|Lạc Vô Thường]
[NOTE Gặp gỡ kỳ duyên · Quan hệ với Lạc Vô Thường +10]

[ACTION:1] Cảm tạ và hỏi danh xưng nàng
[ACTION:2] Cảnh giác từ chối, sợ có âm mưu
[ACTION:3] Nhận phù chú, ngỏ lời mời uống trà
[ACTION:4] Đi tới Hậu Sơn Mật Lâm ngay`,

  // CHUNK 3 — combat trigger
  `<narrative>
Trên đường vào Hậu Sơn Mật Lâm, một con Hắc Vụ Lang bất ngờ nhảy ra từ bụi rậm, mắt đỏ rực, răng nanh nhe ra đầy hung khí. Nó gầm gừ tiến tới, rõ ràng đã ngắm ngươi từ lâu.
<dialogue speaker="Hắc Vụ Lang">*Gầmmm... hú dài...*</dialogue>
</narrative>

[COMBAT Hắc Vụ Lang|3]
[NOTE Chiến đấu bắt đầu]

[ACTION:1] Rút kiếm xông lên tấn công
[ACTION:2] Dùng Lôi Văn Phù triệu lôi
[ACTION:3] Tìm cách trốn chạy
[ACTION:4] Đứng yên quan sát động tĩnh`,

  // CHUNK 4 — sau combat, hoàn thành quest phụ
  `<narrative>
Sau một hồi giao đấu kịch liệt, ngươi cuối cùng cũng chặt đứt cổ Hắc Vụ Lang. Máu nó chảy ra đen như mực, bốc lên một làn khói nhẹ. Trên xác nó rớt ra một viên nội đan đen tuyền, còn ấm áp.
Một luồng linh lực mạnh mẽ trào vào kinh mạch, ngươi cảm thấy tu vi tăng lên rõ rệt. Nhiệm vụ Lạc Vô Thường giao đã hoàn thành.
</narrative>

[EXP+ 250]
[CURRENCY+ 30]
[ITEM Hắc Vụ Nội Đan|Hiếm|Nguyên liệu]
[ITEM Áo Da Lang|Tốt|Thân]
[HP- 80]
[QUEST_COMPLETE Diệt Yêu Hậu Sơn]
[NOTE Hạ gục Hắc Vụ Lang · Tu vi tăng đột phá!]

[ACTION:1] Lập tức dùng nội đan luyện hóa
[ACTION:2] Mặc Áo Da Lang vừa nhặt được
[ACTION:3] Quay về Trấn Lạc Vân giao công cho Lạc Vô Thường
[ACTION:4] Tiếp tục thám hiểm sâu hơn vào rừng`,

  // CHUNK 5 — đột phá + tribulation hint
  `<narrative>
Ngươi tìm một hang đá kín đáo, ngồi xuống điều hòa hơi thở. Đột nhiên đan điền rung lên dữ dội — linh khí trong cơ thể bắt đầu xoáy tròn không ngừng. Đây là dấu hiệu của một bước đột phá lớn! Ngươi vận chuyển công pháp toàn lực, từng tầng kinh mạch được mở rộng, thân thể như được tái sinh.
</narrative>

[REALM_BREAK]
[STAT atk+15]
[STAT def+10]
[STAT hp+50]
[AP+ 5]
[SKILL Lôi Thiểm|combat_basic|Hiếm]
[NOTE Đột phá cảnh giới! Tất cả chỉ số tăng vọt]

[ACTION:1] Tiếp tục ổn định cảnh giới
[ACTION:2] Thử nghiệm pháp thuật mới
[ACTION:3] Vội xuống núi báo cáo sư phụ
[ACTION:4] Đi tìm Lạc Vô Thường khoe`,
];

let mockCursor = 0;

/**
 * Lấy mock narrative chunk.
 * @param isOpening - true cho opening chunk (personalize theo user nhập)
 * @param ctx - optional context (player + settings) để personalize opening
 */
export const getMockNarrative = (isOpening: boolean, ctx?: NarrativeContext): string => {
  if (isOpening) {
    mockCursor = 0;
    return buildPersonalizedOpening(ctx);
  }
  // Skip CHUNK 0 (placeholder) — bắt đầu từ CHUNK 1
  mockCursor = (mockCursor + 1);
  if (mockCursor >= MOCK_NARRATIVE_CHUNKS.length) mockCursor = 1;
  return MOCK_NARRATIVE_CHUNKS[mockCursor]!;
};

export const resetMockCursor = () => {
  mockCursor = 0;
};

export const shouldUseMockAi = (): boolean => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  return !key || key === '' || key === 'mock';
};
