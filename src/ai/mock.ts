/**
 * MOCK AI — fixture chunks có inject TAGS thực sự để demo full game loop.
 * Khi `import.meta.env.VITE_GEMINI_API_KEY` rỗng → fallback hàm này.
 */

export const MOCK_NARRATIVE_CHUNKS: string[] = [
  // CHUNK 0 — opening + quest chính + item khởi đầu
  `<narrative>
Sương sớm phủ kín đỉnh Thanh Vân Phong, từng tia nắng đầu ngày xuyên qua tầng mây tựa thiên kiếm. Ngươi đứng giữa sân đá xanh, hô hấp đều đặn, cảm nhận linh khí mong manh len lỏi vào kinh mạch. Bên hông, thanh trường kiếm gỉ sét rung nhẹ như muốn ứng theo nhịp tim ngươi.
<dialogue speaker="Sư huynh Mặc Uyên">Tiểu sư đệ, hôm nay tới phiên ngươi xuống Trấn Lạc Vân mua dược liệu rồi đó. Lấy đi 50 viên linh thạch này làm lộ phí. Nhớ trở về trước khi mặt trời lặn.</dialogue>
</narrative>

[ITEM Trường Kiếm Gỉ|Thường|Vũ khí]
[CURRENCY+ 50]
[QUEST_GIVEN Hạ Sơn Mua Dược|main|Xuống Trấn Lạc Vân mua đủ Linh Tâm Thảo cho tông môn rồi quay về Thanh Vân Phong trước khi mặt trời lặn.|Sư huynh Mặc Uyên]
[NOTE Bắt đầu hành trình tu tiên]

[ACTION:1] Cảm tạ sư huynh rồi lập tức khởi hành xuống núi
[ACTION:2] Hỏi sư huynh về lộ trình an toàn nhất
[ACTION:3] Mở Bản Đồ xem đường đi
[ACTION:4] Vận khí tu luyện thêm một canh giờ trước khi đi`,

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

export const getMockNarrative = (isOpening: boolean): string => {
  if (isOpening) {
    mockCursor = 0;
    return MOCK_NARRATIVE_CHUNKS[0]!;
  }
  mockCursor = (mockCursor + 1) % MOCK_NARRATIVE_CHUNKS.length;
  return MOCK_NARRATIVE_CHUNKS[mockCursor]!;
};

export const resetMockCursor = () => {
  mockCursor = 0;
};

export const shouldUseMockAi = (): boolean => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  return !key || key === '' || key === 'mock';
};
