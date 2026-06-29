import type { CanonPack } from '@gametypes/canon-pack';

/**
 * Mục Thần Ký — Trạch Trư.
 *
 * Phase 24.C: Cập nhật hệ thống cảnh giới chính xác theo nguyên tác —
 * "Hệ Thống Thiên Cung Thần Tàng" do Ngự Thiên Tôn đặt nền móng, gồm
 *   • 7 Thần Tàng (Linh Thai → Thần Kiều): mở khiếu, đắp nền pháp lực
 *   • 8 Thiên Cung (Tôn Thần → Thiên Đình): mô phỏng Long Hán Thiên Đình
 * Tổng 15 nấc thang chính. Triết lý "Dĩ Lực Thành Đạo" — chú trọng pháp lực
 * + sức mạnh bạo liệt, song song con đường Đạo Cảnh (giác ngộ quy luật).
 */
export const mucThanKy: CanonPack = {
  id: 'muc-than-ky',
  title: 'Mục Thần Ký',
  altTitles: ['Mu Shen Ji', '牧神记', 'Tale of the Shepherd God'],
  author: 'Trạch Trư',
  description:
    'Tần Mục được lão tổ ở Đại Hoang nuôi lớn, từ Linh Đài tu thành Thần. Phong cách hùng mạnh + tâm trạng tự do, đả phá quy tắc Thiên Đình.',
  themes: ['Huyền huyễn', 'Thần ma', 'Đông phương'],
  currencyName: 'Linh Thạch',

  cosmology: {
    realmList: [
      // 7 Thần Tàng — Dĩ Lực Thành Đạo (giai đoạn cơ bản)
      'Linh Thai Thần Tàng',
      'Ngũ Diệu Thần Tàng',
      'Lục Hợp Thần Tàng',
      'Thất Tinh Thần Tàng',
      'Thiên Nhân Thần Tàng',
      'Sinh Tử Thần Tàng',
      'Thần Kiều Thần Tàng',
      // 8 Thiên Cung — Mô phỏng Long Hán Thiên Đình
      'Tôn Thần',
      'Chân Thần',
      'Dao Đài',
      'Trảm Thần Đài',
      'Ngọc Kinh',
      'Lăng Tiêu',
      'Đế Tọa',
      'Thiên Đình',
    ],
    description:
      'Hệ thống Thiên Cung Thần Tàng do Ngự Thiên Tôn sáng lập thời Long Hán sơ kỳ, ' +
      'giúp phàm nhân từ "không" đến "có": 7 Thần Tàng đắp nền pháp lực + 8 Thiên Cung ' +
      'mô phỏng Long Hán Thiên Đình. Đỉnh cao Thiên Đình đòi hỏi 36 Đại Đạo + 72 Hậu ' +
      'Thiên Chi Đạo, dung hợp thành Cảnh Giới Đại Thiên Đình — đủ sức nghiền nát Cổ Thần.',

    realmDetails: [
      // ─────────── Thần Tàng (Cơ bản) ───────────
      {
        name: 'Linh Thai Thần Tàng',
        tier: 'Thần Tàng',
        founder: 'Ngự Thiên Tôn',
        description:
          'Phàm nhân vách ngăn Linh Thai bẩm sinh đóng kín. Phá vách → mở Linh Đài, ' +
          'đắp Linh Thai từ hư vô, giao phó linh hồn. Linh Thai đứng giữa, dưới chân Linh Đài ' +
          'phun nguyên khí — bước phân chia trời đất bên trong cơ thể.',
      },
      {
        name: 'Ngũ Diệu Thần Tàng',
        tier: 'Thần Tàng',
        founder: 'Hạo Thiên Tôn',
        description:
          'Tương ứng ngũ tạng (tâm/can/tỳ/phế/thận) + Ngũ Tinh (Kim Mộc Thủy Hỏa Thổ). ' +
          'Tính chuẩn tinh vị, vận khí phá bích đến khi vách không khép lại. ' +
          'Ngũ Diệu Tinh Quân ngự trong ngũ tạng biến nguyên khí thành "ngũ khí".',
      },
      {
        name: 'Lục Hợp Thần Tàng',
        tier: 'Thần Tàng',
        founder: 'Lăng Thiên Tôn',
        description:
          'Linh Đài hóa đại lục vững chãi, xác lập 6 phương (Đông Tây Nam Bắc Trên Dưới). ' +
          'Kết nối thân thể với đại địa, mượn lực thiên địa. Ngưỡng cửa chính thức ' +
          'lột xác từ phàm nhân thành Thần Thông Giả.',
      },
      {
        name: 'Thất Tinh Thần Tàng',
        tier: 'Thần Tàng',
        founder: 'Nguyệt Thiên Tôn',
        description:
          'Ngưng tụ Nhật Nguyệt (Thái Dương + Thái Âm) treo trên đỉnh đầu. Nhật Nguyệt ' +
          'hợp Ngũ Diệu = Thất Tinh, thu tinh lực khổng lồ phản bộ nuôi dưỡng nguyên thần.',
      },
      {
        name: 'Thiên Nhân Thần Tàng',
        tier: 'Thần Tàng',
        founder: 'Hỏa Thiên Tôn',
        description:
          'Lục Hợp lượn quanh Linh Thai, Ngũ Diệu rải không, Nhật Nguyệt chói lọi. ' +
          'Phá vách tạo "Thiên Địa Cực", đánh tan giới hạn giữa nhục thân và vũ trụ, ' +
          'đạt sự hòa hợp thiên nhân giao cảm.',
      },
      {
        name: 'Sinh Tử Thần Tàng',
        tier: 'Thần Tàng',
        founder: 'U Thiên Tôn',
        description:
          'Đối mặt ranh giới sinh tử luân hồi. Dưới đại lục Linh Đài mở ra U Đô tăm tối ' +
          'dưới lòng bàn chân nguyên thần. U Đô sinh → ranh giới Sinh/Tử thành hình, ' +
          'tu sĩ bước đầu thao túng thọ nguyên (sống đến ~800 tuổi).',
      },
      {
        name: 'Thần Kiều Thần Tàng',
        tier: 'Thần Tàng',
        founder: 'Vân Thiên Tôn',
        description:
          'Thần Tàng cuối — kết nối cõi Thần. Dùng pháp lực + thuật toán không gian phức tạp ' +
          'ngưng tụ Thần Kiều rực rỡ. Nguyên thần đạp lên cầu, bay qua vùng không gian hư vô ' +
          'tăm tối, tiến tới cửa Thiên Cung.',
      },
      // ─────────── Thiên Cung (Cõi Thần) ───────────
      {
        name: 'Tôn Thần',
        tier: 'Thiên Cung',
        description:
          'Bước chạm ngõ cõi Thần. Nguyên thần bay qua Thần Kiều, đứng uy nghiêm ngoài ' +
          'Nam Thiên Môn của Thiên Cung. Đạt trường sinh, nhưng chưa thật sự bước vào đại đạo.',
      },
      {
        name: 'Chân Thần',
        tier: 'Thiên Cung',
        description:
          'Đi xuyên qua Nam Thiên Môn. Cần đủ 3 yếu tố: Nhục thân + Nguyên thần (Linh Thai + ' +
          'Hồn Phách) + Tâm Cảnh (Đạo Pháp Thần Thông) — tất cả đạt Thần Cảnh. Ngạnh kháng ' +
          'Đạo Áp của Nam Thiên Môn để lột xác thành Chân Thần chính thức.',
      },
      {
        name: 'Dao Đài',
        tier: 'Thiên Cung',
        description:
          'Nguyên thần vào Dao Đài (mô phỏng Dao Trì Tổ Đình Thái Cổ). Mượn khí tức nguyên ' +
          'thủy + năng lượng thuần khiết gột rửa, bồi đạo tâm. Nguyên thần đạp biển Dao Trì ' +
          'vượt sóng to gió lớn → tu vi tăng vọt theo đường thẳng.',
      },
      {
        name: 'Trảm Thần Đài',
        tier: 'Thiên Cung',
        description:
          'Bước lên đài chém thần. Mô phỏng Trảm Thần Đài Tổ Đình, tích vô biên sát khí ' +
          'thời Thái Cổ. Dùng sát khí mài giũa đạo tâm + nguyên thần xuyên sinh tử → ' +
          'chiến lực thăng hoa về chất.',
      },
      {
        name: 'Ngọc Kinh',
        tier: 'Thiên Cung',
        description:
          'Tiến vào thành Ngọc Kinh rộng lớn (mô phỏng Tổ Đình Ngọc Kinh Thành). ' +
          'Dùng pháp lực đi qua thành, hấp thu huyền diệu vô số đạo pháp → cường hóa ' +
          'nguyên thần + nhục thân đến tận cùng. ⚠ Hố bẫy Di La Cung bắt đầu giăng.',
      },
      {
        name: 'Lăng Tiêu',
        tier: 'Thiên Cung',
        description:
          'Xông vào Lăng Tiêu Điện (mô phỏng Đại La Thiên). Pháp lực bạo liệt rót xuống ' +
          'khổng lồ. ⚠ "Hố bẫy Lăng Tiêu" của Tam Công Tử Di La Cung — đạo pháp bị khóa chặt ' +
          'vào Lăng Tiêu Bảo Điện, thao túng sinh mệnh + tự do.',
      },
      {
        name: 'Đế Tọa',
        tier: 'Thiên Cung',
        description:
          'An tọa trên ngai vàng Đế Tọa (thăng tiến trong Đại La Thiên). Pháp lực + uy năng ' +
          'đạt đỉnh cao một loại đại đạo, nhục thân + đạo hạnh hòa làm một, đủ sức nhìn bễ nghễ chúng sinh.',
      },
      {
        name: 'Thiên Đình',
        tier: 'Thiên Cung — Đại Viên Mãn',
        description:
          'Cảnh giới tối thượng. Thu đủ 36 Đại Đạo (36 Thiên Cung) + 72 Hậu Thiên Chi Đạo ' +
          '(72 Bảo Điện), dung hợp thống nhất thành Đại Thiên Đình. Pháp lực mênh mông, đủ ' +
          'sức nghiền nát Cổ Thần. Thập Thiên Tôn đã hao 60 vạn năm vẫn chỉ đạt khiếm khuyết ' +
          '(36 Thiên Cung không 72 Bảo Điện → bài xích lẫn nhau).',
      },
    ],

    philosophyNote:
      'TRIẾT LÝ "DĨ LỰC THÀNH ĐẠO" (Lạc Ấn Hư Không): Hệ thống Thiên Cung Thần Tàng ' +
      'chú trọng tích lũy pháp lực bạo liệt + sức mạnh, KHÔNG cảm ngộ Đại Đạo. Hoàn tất ' +
      'Đại Thiên Đình → mượn sức Tổ Đình Ngọc Kinh + Di La Cung, lạc ấn đạo quả lên ' +
      'Chung Cực Hư Không bằng bạo lực → thành tựu Đại La. NHƯỢC ĐIỂM: đạo tâm mỏng manh ' +
      'như giấy (gặp đả kích dễ rạn nứt). BẪY CHẾT NGƯỜI: tột cùng Ngọc Kinh / Lăng Tiêu / ' +
      'Đế Tọa đều là cạm bẫy Di La Cung — đạo quả tự động khóa vào Lăng Tiêu Bảo Điện, ' +
      'cường giả thành quân cờ vĩnh viễn không thoát. Song song hệ thống này là "Đạo Cảnh" — ' +
      'con đường giác ngộ quy luật của Tần Mục + nhóm cải cách (sẽ tiết lộ ở giai đoạn sau).',
  },

  defaultStartingLocation: 'Đại Hoang thôn',
  defaultStartingTechnique: 'Bá Thể Tam Đan Công',

  signatureNpcs: [
    // ─── Cốt truyện chính ───
    { name: 'Tần Mục', role: 'Nhân vật chính', description: 'Cô nhi được lão tổ Đại Hoang nuôi lớn, mở mắt thiên sinh, có Thái Tô khí cực kỳ thuần khiết.' },
    { name: 'Tần Hồng Sinh', role: 'Sư phụ + Tế Tự', description: 'Lão tế tự Đại Hoang, sư phụ Tần Mục, sức mạnh ẩn giấu cực sâu.' },
    { name: 'Tần Phụng', role: 'Bà cố', description: 'Bà của Tần Mục, võ lực hùng mạnh, từng là chiến tướng Đại Hoang.' },
    { name: 'Diệp Thanh Vũ', role: 'Đạo lữ', description: 'Tiên nữ Thanh Sơn phái, tình cảm phức tạp với Tần Mục.' },
    { name: 'Vân Vô Phong', role: 'Đối thủ', description: 'Thiên tài Đạo Thánh tông, kình địch không chấp nhận thất bại.' },
    { name: 'Mặc Thanh Đồng', role: 'Bằng hữu', description: 'Đệ tử Mặc Gia tinh thông cơ quan thuật, đồng hành Tần Mục từ thời niên thiếu.' },
    // ─── Thập Thiên Tôn — Sáng lập hệ thống Thiên Cung Thần Tàng ───
    { name: 'Ngự Thiên Tôn', role: 'Thập Thiên Tôn — Tổ Sư', description: 'Khai sáng Linh Thai Thần Tàng + đặt nền móng toàn bộ hệ thống Thiên Cung (Tôn Thần → Đế Tọa). Bị ám sát tại Dao Trì Tiểu Trúc trước khi truyền thụ.' },
    { name: 'Hạo Thiên Tôn', role: 'Thập Thiên Tôn', description: 'Bán Thần khai mở Ngũ Diệu Thần Tàng, mượn sức Ngũ Diệu Tinh Quân. Cùng Tần Mục công bố pháp Phi Thăng cho thế nhân tại Dao Trì.' },
    { name: 'Lăng Thiên Tôn', role: 'Thập Thiên Tôn', description: 'Nữ Tôn khai mở Lục Hợp Thần Tàng, mượn sức Địa Mẫu Nguyên Quân.' },
    { name: 'Nguyệt Thiên Tôn', role: 'Thập Thiên Tôn', description: 'Khai mở Thất Tinh Thần Tàng, mượn sức Nhật Nguyệt + Ngũ Diệu Tinh Quân.' },
    { name: 'Hỏa Thiên Tôn', role: 'Thập Thiên Tôn', description: 'Sáng tạo Thiên Nhân Thần Tàng, mượn sức Thiên Công.' },
    { name: 'U Thiên Tôn', role: 'Thập Thiên Tôn', description: 'Khai mở Sinh Tử Thần Tàng, mượn sức Thổ Bá đả thông sinh tử (thọ +800).' },
    { name: 'Vân Thiên Tôn', role: 'Thập Thiên Tôn', description: 'Hoàn thiện Thần Kiều Thần Tàng + cảnh giới Lăng Tiêu/Đế Tọa. Mượn sức Long Hán Thiên Đình.' },
    // ─── Đại Lôi Âm Tự (Phật môn) ───
    { name: 'Lão Như Lai', role: 'Phương Trượng Đại Lôi Âm Tự', description: 'Trụ trì Đại Lôi Âm Tự — tu Như Lai Đại Thừa Kinh đến Đại Phạn Thiên. Từng dùng Kim Thân Trượng Lục vỗ 1 chưởng giáng 5 ngọn núi trấn áp Diên Phong Đế.' },
    { name: 'Mã Gia', role: 'Cao tăng Đại Lôi Âm Tự', description: 'Đạt tầng 19 Đế Thích Thiên Cảnh trước khi rời núi — cường giả hạng nhất đương thời. Sở hữu tuyệt kỹ Lôi Âm Bát Thức.' },
    { name: 'Phật Tâm', role: 'Phật tử Đại Lôi Âm Tự', description: 'Phật tử tu Như Lai Đại Thừa Kinh — bị sát thủ Thái tử Diên Khang đâm chết oan vì Tần Mục mượn oai Như Lai huyễn hóa Ngũ Trùng Chư Thiên che thân.' },
    { name: 'Đại Phạn Thiên Vương Phật', role: 'Phật Giới — Tôn giả', description: 'Đại Phạn Thiên ngự ở Phật Giới thượng giới — sở hữu Vô Lượng Kiếp Kinh (chân kinh cấp Đế Tọa duy nhất của Phật Giới).' },
    // ─── Thiên Thánh Giáo (Ma môn) ───
    { name: 'Khai Sơn Tổ Sư Thiên Thánh Giáo', role: 'Tổ sư Thiên Ma Giáo', description: 'Lắng nghe Tiều Phu Thánh Nhân giảng đạo trên tảng đá về Tam Lập Thành Thánh + Tam Minh Vạn Nhân Sư → đại triệt đại ngộ, biên soạn Thánh Nhân Huấn → khai sinh Đại Dục Thiên Ma Kinh.' },
    { name: 'Thiếu Niên Tổ Sư Thiên Ma Giáo', role: 'Tổ sư trẻ Thiên Ma Giáo', description: 'Tu Tạo Hóa Tiên Thiên Công nghịch chuyển sơ sinh, thanh xuân vĩnh trú. Sử dụng Ngũ Quỷ Bàn Vận Thuật chộp lấy không trung lấy hai bát một thìa.' },
    { name: 'Tư Bà Bà', role: 'Cao thủ Thiên Ma Giáo', description: 'Thi triển Tạo Hóa Thiên Thần Công mô phỏng thành Tương Long Thành Chủ Phó Vân Địch — lấy giả đổi thật.' },
    { name: 'Tư Công Trưởng Lão', role: 'Trưởng lão Thiên Ma Giáo (Cường Giả Thần Kiều)', description: 'Tu thành Tiểu Vân Lôi Pháp — tâm duyệt thành phục trước lý giải của Tần Mục, tán dương Giáo Chủ là kỳ tài ngút trời.' },
    // ─── Cảnh giới khác ───
    { name: 'Tiều Phu Thánh Nhân', role: 'Thánh nhân tiền sử', description: 'Giảng đạo trên tảng đá về Tam Lập Thành Thánh (lập đức/công/ngôn) + Tam Minh Vạn Nhân Sư (minh lý/tri/giáo). Dùng Tạo Hóa Thiên Ma Công phong ấn linh hồn Khai Hoàng thần nhân vào túi da.' },
    { name: 'Lâm Hiên Đạo Tử', role: 'Đại đệ tử Đạo Môn', description: 'Đại diện Đạo Môn đương thời — Tần Mục giảng giải trước hắn về chân lý "tâm tồn chính → chính, tâm tồn ma → ma".' },
    { name: 'Diên Phong Đế', role: 'Hoàng đế Diên Khang', description: 'Hoàng đế đế quốc Diên Khang — từng bị Lão Như Lai dùng Kim Thân Trượng Lục giáng 5 núi trấn áp. Tần Mục dùng Tạo Hóa Linh Công luyện đi bệnh ngầm + Tạo Hóa Địa Nguyên Công bồi bổ nguyên thần.' },
    { name: 'Phó Vân Địch', role: 'Tương Long Thành Chủ', description: 'Bị Tư Bà Bà mô phỏng qua Tạo Hóa Thiên Thần Công.' },
    { name: 'Tam Công Tử Di La Cung', role: 'Phản diện ẩn', description: 'Giăng "Hố bẫy Lăng Tiêu" khóa chặt đạo quả cường giả Dĩ Lực Thành Đạo vào Lăng Tiêu Bảo Điện.' },
    // ─── Ma Thần & Cổ Thần ───
    { name: 'Đại Hắc Thiên', role: 'Tổ tiên Ma Tộc — Ma Thần đầu tiên U Đô', description: 'Vị Ma Thần bẩm sinh đầu tiên đản sinh bên trong U Đô từ ác niệm giữa thiên địa. Tổ tiên các Vực Ngoại Ma Thần. Bị Thổ Bá đuổi khỏi U Đô → lưu lãng tìm đất sinh tồn → khai sinh Ma Tộc.' },
    { name: 'Tôn Ma Thần Hai Đầu Năm Đuôi', role: 'Ma Thần Tử Giả Sinh Giới', description: 'Ma Thần lẩn khuất bóng tối Đại Khư, từng xuất hiện trong Tử Giả Sinh Giới, dụ dỗ Tần Mục trong bóng tối ban đêm.' },
    { name: 'Thổ Bá', role: 'Cổ Thần — Chủ nhân U Đô', description: 'Cổ Thần thái cổ — đã giúp U Thiên Tôn đả thông sinh tử (mở Sinh Tử Thần Tàng). Đuổi Đại Hắc Thiên + Ma Thần ra khỏi U Đô → khai sinh Ma Tộc lưu lãng.' },
    // ─── Kiếm đạo đỉnh phong ───
    { name: 'Giang Bạch Khuê', role: 'Diên Khang Quốc Sư — Đệ nhất nhân dưới Thần', description: 'Thánh nhân 500 năm 1 lần. Cải cách phá vỡ 14 kiếm thức cơ bản, bổ sung 3 thức Nhiễu/Du/Toản. Sáng tạo Định Giới (Kiếm Giới đệ nhất thiên) + Đại Lục Hợp Kiếm Pháp. Có hệ thống tu luyện riêng (1 trong 8-9 hệ thống Mục Thần Ký).' },
    { name: 'Thôn Trưởng (Tô Mạc Già)', role: 'Lão Kiếm Thần Đại Hoang', description: 'Thực ra là Tô Mạc Già — lão tổ nuôi Tần Mục. Ngộ Kiếm Đồ 9 Thức ở Thần Kiều, sau thành Thần khai Tân Kiếm Đồ (Kiếm Lý Sơn Hà, Kiếm Xuất Khai Hoàng, Thượng Hoàng Kiếp Động, Thương Thiên Bích Tỷ thức 12). Dùng kiếm sáng tạo thiên địa, ngược với Đạo Môn dùng thuật số phân tích.' },
    { name: 'Khai Hoàng (Tần Nghiệp)', role: 'Đế giả — Đệ nhất Kiếm Đạo', description: 'Kiếm vương 35 Trùng Thiên — Kiếm Đạo hóa Kiếm Vực. Lấy thần thành làm mũi nhọn, thần sơn làm vành đai, chư thiên hóa sống kiếm, chúng sinh tạo sức mạnh, nhân tâm ngưng kiếm đức. Bị Hạo Thiên Tôn + 4 Thiên Tôn liên thủ đánh vỡ kiếm vực.' },
    { name: 'Bạch Cừ Nhi (Thượng Hoàng Kiếm Thần)', role: 'Nữ Kiếm Thần Thượng Hoàng', description: 'Nữ nhi thành chủ Bách Long Thành — rửa kiếm tại đầu nguồn Dũng Giang. Kiếm pháp thoát thai Tần Mục, mài giũa 4 vạn năm → Kiếm Đạo 27 Trùng Thiên (Bạch Long Kiếm Vũ). Tinh thần "nhân mệnh lớn hơn trời", dùng kiếm thủ hộ bá tánh = con đường Nhập Đạo.' },
    { name: 'Tử Hề Thiên Sư (Yên Vân Hề / Thư Sinh Tử Hề)', role: 'Tứ Đại Thiên Sư Khai Hoàng', description: 'Nữ tử cải nam trang — đại cao thủ Lăng Tiêu, mạnh đến độ đè Trạc Trà xuống đất đánh. Dĩ kiếm nhập đạo Kiếm Đạo 13 Trùng Thiên. Tinh thông toàn diện: trận pháp, thuật số, đao thương kiếm kích, cầm kỳ thi họa. Tái hiện Đề Kiếp Kiếm Tần Mục + 33 Trùng Thiên Khai Hoàng.' },
    { name: 'Lạc Vô Song', role: 'Đao Thần — Kình địch Bạch Cừ Nhi', description: 'Đao pháp tinh thông tính toán, đường đường chính chính, dùng "Đại thế" bàng bạc đè bẹp đối thủ. Bị Bạch Cừ Nhi dùng "Điểm phá diện" + lực xuyên thấu sắc bén phá vỡ đại thế.' },
    { name: 'Tề Cửu Nghi (Cửu Thủ Phượng Hoàng)', role: 'Cường giả phản diện', description: 'Cửu Thủ Phượng Hoàng — đại thần thông bị Tần Mục dùng Khai Kiếp xé nát khi liên thủ cùng Triết Hoa Lê.' },
    { name: 'Triết Hoa Lê', role: 'Cường giả phản diện', description: 'Liên thủ Tề Cửu Nghi bị Tần Mục dùng Khai Kiếp (Kiếp Kiếm thức 1) chém bại.' },
    { name: 'Hàn Thiên Quân', role: 'Tu sĩ', description: 'Bị Tần Mục dùng Ứng Kiếp Kiếm một kích giết chết — đâm xuyên Thiên Cung qua Thần Kiều đến toàn bộ Thần Tàng.' },
    { name: 'Hoa Thanh', role: 'Tu sĩ', description: 'Cùng Hàn Thiên Quân bị Ứng Kiếp Kiếm giết tận gốc rễ căn cơ.' },
    { name: 'Võ Đấu Thiên Sư Trạc Trà', role: 'Tứ Đại Thiên Sư Khai Hoàng', description: 'Bị Yên Vân Hề (cùng cảnh giới Lăng Tiêu) đè xuống đất đánh — minh chứng nội lực Tử Hề khác biệt.' },
    { name: 'Lão Đạo Chủ Đạo Môn', role: 'Trưởng môn Đạo Môn', description: 'Đại trưởng môn Đạo Môn — chỉ luyện thành nửa thức Đạo Kiếm Thiên 14 vì nhật nguyệt tinh đẩu Diên Khang đều là giả → sai số.' },
    { name: 'Ý Sơn Nhân Hoàng (Ý Sơn Tổ Sư)', role: 'Tổ sư kiếm đạo cổ', description: 'Tổ sư cổ — Kiếm Lý Sơn Hà (thức 1 Kiếm Đồ Thôn Trưởng) lấy ý tưởng từ một chiêu của ngài.' },
  ],

  signatureSects: [
    { name: 'Mặc Gia', alignment: 'trung', description: 'Tông môn lấy cơ quan thuật + chiến giáp làm gốc, hậu duệ thợ thủ công cổ.', philosophy: 'Kiêm ái phi công, chuyển kỹ thuật thành sức mạnh.' },
    { name: 'Đạo Thánh Tông', alignment: 'chinh', description: 'Đại tông môn Trung Châu, sản sinh nhiều thiên tài đời này qua đời khác.' },
    { name: 'Thanh Sơn phái', alignment: 'chinh', description: 'Tông môn nữ tu chuyên kiếm pháp + thuật tu tiên cao quý.' },
    { name: 'Diên Khang đế quốc', alignment: 'trung', description: 'Đế quốc nhân loại lớn nhất Trung Châu, có Cấm Quân tu sĩ tinh nhuệ.' },
    { name: 'Long Hán Triều', alignment: 'an', description: 'Triều đại cổ xưa của Long tộc, vẫn còn ảnh hưởng ở Đại Khư.' },
    { name: 'Di La Cung', alignment: 'ma', description: 'Thế lực cổ ẩn sau hậu trường — Tam Công Tử giăng "Hố bẫy Lăng Tiêu" khóa đạo quả cường giả Dĩ Lực Thành Đạo.' },
    { name: 'Tổ Đình Ngọc Kinh Thành', alignment: 'an', description: 'Tổ đình Thái Cổ — nơi 72 Bảo Điện chân chính của 72 Thành Đạo Giả tiền sử tồn tại.' },
    // Ba đại thánh địa — thế chân vạc
    { name: 'Đại Lôi Âm Tự', alignment: 'chinh', description: 'Phật môn hạ giới — trấn phái Như Lai Đại Thừa Kinh (20 Chư Thiên). Yêu cầu Tuệ căn + Phật tâm thuần khiết. Cap ở Đại Phạn Thiên (gần Đế Tọa), cần Vô Lượng Kiếp Kinh từ Phật Giới mới tiến tiếp.', philosophy: 'Ngoài đúc Thể Như, trong luyện Tâm Như. Trong lòng có Phật, khó mà thành Phật.' },
    { name: 'Thiên Thánh Giáo (Thiên Ma Giáo)', alignment: 'ma', description: 'Ma môn — trấn phái Đại Dục Thiên Ma Kinh (1000 Pháp / Tạo Hóa Thất Thiên). Khai Sơn Tổ Sư ngộ đạo từ Tiều Phu Thánh Nhân về "Tam lập thành Thánh". Tên "Thiên Ma" do giáo đồ luyện sai lệch thành quỷ dị, không phải bản chất.', philosophy: 'Suất tính sở hành, thuần nhiệm tự nhiên, liền gọi là Đạo. Tâm tồn chính → chính, tâm tồn ma → ma.' },
    { name: 'Đạo Môn (Lâm Hiên Đạo)', alignment: 'chinh', description: 'Đạo môn — trấn phái Đạo Kiếm Thập Tứ Thiên. Lâm Hiên Đạo Tử là đại diện đương thời.' },
    { name: 'Phật Giới', alignment: 'an', description: 'Cõi Phật ở thượng giới — nơi Đại Phạn Thiên Vương Phật giữ Vô Lượng Kiếp Kinh (chân kinh cấp Đế Tọa duy nhất của Phật Giới).' },
    // ─── Ma giới — bóng tối Đại Khư ───
    { name: 'U Đô Ma Tộc', alignment: 'ma', description: 'Ma quái + Ma Thần đản sinh từ U Đô. Hành động theo bản năng giết chóc / cắn nuốt. Tiến hóa bằng cách xâu xé lẫn nhau (kẻ lớn ăn kẻ nhỏ) thành các tôn Ma Thần khổng lồ. Hình thù kỳ dị: mọc đầu lâu, vô số cánh tay vặn vẹo, toàn thân bạch cốt, đầy con ngươi, tay chân như rết.' },
    { name: 'Trọng Thân Ma Tộc', alignment: 'ma', description: 'Nhánh Ma Tộc đặc trưng — sinh tồn bằng cách nuốt chửng nhau, dung hợp sinh mệnh để bành trướng + tu vi tăng vọt như cầu tuyết lăn. Phương thức đào tạo "nuôi cổ độc" — ném tất cả vào một chỗ tự tương tàn sát, kẻ sống cuối cùng là kẻ độc ác + mạnh nhất.' },
    { name: 'Vực Ngoại Ma Thần (Ma Tộc Chư Thiên)', alignment: 'ma', description: 'Ma Tộc trí tuệ cực cao, văn minh + hệ thống tu luyện riêng. Tổ tiên là Ma Thần bẩm sinh từ ác niệm thiên địa (vd Đại Hắc Thiên), bị Thổ Bá đuổi khỏi U Đô. Đến từ Đô Thiên, La Phù Thiên... Sẵn sàng hiến tế hàng vạn Thiên Ma cấp thấp đắp tế đàn bạch cốt phá vách thế giới triệu hoán cường giả.' },
    { name: 'Tử Giả Sinh Giới (Ám Giới)', alignment: 'ma', description: 'Thế giới chồng chéo bóng tối Đại Khư vào ban đêm. Một số Ma Thần lẩn khuất — vd tôn Ma Thần hai đầu năm đuôi từng dụ dỗ Tần Mục trong bóng tối.' },
  ],

  signatureItems: [
    { name: 'Đại Hắc Hắc Tử', category: 'Pháp bảo', rarity: 'Huyền Thoại', description: 'Linh thú đặc biệt giống chó đen, thực chất là di vật từ thái cổ, có sức mạnh khôn lường.' },
    { name: 'Sấm Nguyệt Đao', category: 'Vũ khí', rarity: 'Cực Phẩm', description: 'Đao hình cong khắc tinh tượng, được Tần Mục sử dụng từ thời thiếu niên.' },
    { name: 'Hắc Bạch Thiên Tử Kỳ', category: 'Pháp bảo', rarity: 'Siêu Phẩm', description: 'Cờ lệnh chỉ huy thiên binh, biểu tượng quyền uy đại tế tự.' },
    { name: 'Thái Tô Khí', category: 'Nguyên liệu', rarity: 'Huyền Thoại', description: 'Khí thuần khiết nhất của thái cổ, là gốc của vạn vật pháp tắc.' },
    { name: 'Hồng Hoang Nội Cảnh', category: 'Công pháp', rarity: 'Huyền Thoại', description: 'Bí truyền Đại Hoang, cho phép nội cảnh chứa cả hồng hoang vũ trụ.' },
    { name: '36 Đại Đạo Công Pháp', category: 'Công pháp', rarity: 'Huyền Thoại', description: 'Bộ 36 công pháp Đế Tọa không trùng lặp — điều kiện tiên quyết để chạm Thiên Đình.' },
    { name: '72 Bảo Điện Chi Đạo', category: 'Công pháp', rarity: 'Huyền Thoại', description: '72 Hậu Thiên Chi Đạo do 72 Thành Đạo Giả tiền sử biến hóa — căn cơ phụ trợ chống bài xích.' },
    // ─── Chân kinh chấn phái ───
    { name: 'Như Lai Đại Thừa Kinh', category: 'Công pháp', rarity: 'Huyền Thoại', description: 'Tuyệt học trấn giáo Đại Lôi Âm Tự — 20 Chư Thiên. Cap Đại Phạn Thiên (gần Đế Tọa), thiếu hậu tiếp.' },
    { name: 'Đại Dục Thiên Ma Kinh', category: 'Công pháp', rarity: 'Huyền Thoại', description: 'Tuyệt học trấn giáo Thiên Thánh Giáo — hộp ngọc chứa cuộn chỉ / găng tay trắng, dùng nguyên khí phóng to thành vạn văn tự vòng tròn. 1000 Pháp + Tạo Hóa Thất Thiên.' },
    { name: 'Vô Lượng Kiếp Kinh', category: 'Công pháp', rarity: 'Huyền Thoại', description: 'Chân kinh cấp Đế Tọa duy nhất của Phật Giới — trong tay Đại Phạn Thiên Vương Phật. Dĩ Mộng Nhập Đạo.' },
    { name: 'Đạo Kiếm Thập Tứ Thiên', category: 'Công pháp', rarity: 'Huyền Thoại', description: 'Tuyệt học trấn giáo Đạo Môn — chân vạc với Như Lai + Đại Dục.' },
    { name: 'Thánh Nhân Huấn', category: 'Công pháp', rarity: 'Cực Phẩm', description: 'Bản nguyên thủy Đại Dục Thiên Ma Kinh do Khai Sơn Tổ Sư Thiên Thánh Giáo biên soạn từ lời giảng của Tiều Phu Thánh Nhân về Tam Lập Thành Thánh + Tam Minh Vạn Nhân Sư.' },
    { name: 'Truyền Tống Kỳ', category: 'Pháp bảo', rarity: 'Siêu Phẩm', description: 'Đại kỳ luyện chế từ Truyền Tống Thần Thông — cuộn lại, nơi nào kỳ che, toàn bộ truyền đi (mang nhiều người).' },
    { name: 'Truyền Tống Y', category: 'Pháp bảo', rarity: 'Siêu Phẩm', description: 'Áo luyện chế từ Truyền Tống Thần Thông — che khuất thân thể, mang chính mình đi.' },
    // ─── Kiếm khí + Bảo vật kiếm đạo ───
    { name: 'Vô Ưu Kiếm', category: 'Vũ khí', rarity: 'Huyền Thoại', description: 'Thanh kiếm 8 mặt của Tần Mục — là tâm Khai Kiếp (Kiếp Kiếm thức 1), 8000 phi kiếm tạo gương phản chiếu Bá Thể Tam Đan Công.' },
    { name: 'Trảm Thần Huyền Đao', category: 'Vũ khí', rarity: 'Huyền Thoại', description: 'Đao cổ do Khai Sơn Tổ Sư Đạo Môn lưu lại + tinh đẩu trận pháp bảo vệ. Tần Mục nghiên cứu → lĩnh ngộ trọn vẹn Đạo Kiếm Thiên 14.' },
    { name: 'Viêm Nhật Noãn', category: 'Pháp bảo', rarity: 'Huyền Thoại', description: 'Thái Dương Thủ — pháp bảo Khai Hoàng để thi triển Thái Minh Tề Thiên Kiếm. 2 vạn năm không xuất kiếm → rỉ sét, Thái Minh Thiên hiện vết rỉ.' },
    { name: 'Tổ Long Thái Huyền Công', category: 'Công pháp', rarity: 'Huyền Thoại', description: 'Công pháp cổ — Tần Mục truyền hoàn chỉnh cho Bạch Cừ Nhi → tăng tu vi cảnh giới một bước dài (không tăng kiếm đạo).' },
    { name: 'Tinh Đồ 35 Vạn Năm Trước', category: 'Nguyên liệu', rarity: 'Huyền Thoại', description: 'Bản đồ tinh đẩu chân thực của thiên hà 35 vạn năm trước (khác với nhật nguyệt tinh đẩu giả của Diên Khang) — chìa khóa ngộ Đạo Kiếm Thiên 14.' },
  ],

  signatureSkills: [
    { name: 'Bá Thể Tam Đan Công', kind: 'adventure', rarity: 'Huyền Thoại', description: 'Công pháp gốc của Tần Mục — tu Tinh / Khí / Thần Tam Đan, rèn bá thể bất diệt. Chia tu sĩ ra khỏi đường thông thường.' },
    { name: 'Khôi Lỗi Thuật', kind: 'adventure', rarity: 'Cực Phẩm', description: 'Bí truyền Mặc Gia — chế tạo + điều khiển khôi lỗi chiến giáp, kết hợp thể chất tu sĩ.' },
    { name: 'Mở Mắt Thiên Sinh', kind: 'adventure', rarity: 'Huyền Thoại', description: 'Thiên phú bẩm sinh, mắt nhìn thấu vạn pháp + pháp tắc thiên địa.' },
    { name: 'Lữ Sơn Pháp Tướng', kind: 'combat_ultimate', rarity: 'Siêu Phẩm', description: 'Triệu hồi pháp tướng Lữ Sơn, chiến đấu với sức mạnh thần linh cổ.' },
    { name: 'Hồng Hoang chi Hùng', kind: 'combat_ultimate', rarity: 'Cực Phẩm', description: 'Triệu hồi tinh khí thái cổ, biến cơ thể thành hùng mãnh thú vương.' },
    { name: 'Đại Quang Minh Quyền', kind: 'combat_basic', rarity: 'Hiếm', description: 'Quyền pháp ánh sáng, khắc chế tà ma âm khí.' },
    // ─── Tam đại tuyệt học chấn phái ───
    { name: 'Như Lai Đại Thừa Kinh', kind: 'adventure', rarity: 'Huyền Thoại', description: 'Chân kinh trấn phái Đại Lôi Âm Tự — hệ thống "Nhị Thập Chư Thiên" 20 tầng: Diêm Ma La Vương → Sa Kiệt Long Vương → Nguyệt Cung / Nhật Cung Thiên Tử → Quỷ Tử Mẫu → ... → Bồ Đề Thụ (sinh Bồ Đề Bà Sa) → Đế Thích → Đại Phạn Thiên. Đỉnh thi triển = Kim Thân Trượng Lục, 20 tầng chư thiên gia trì. ⚠ Khuyết hậu tiếp Đế Tọa.' },
    { name: 'Đại Dục Thiên Ma Kinh', kind: 'adventure', rarity: 'Huyền Thoại', description: 'Chân kinh trấn phái Thiên Thánh Giáo — 1000 Pháp phục vụ 360 ngành nghề thị tỉnh + Tạo Hóa Thất Thiên (Tiên Thiên / Địa Nguyên / Thiên Thần / Thiên Ma / Nhân Vương / Quỷ Thần / Linh). Thiếu "Đại Nhất Thống Công Pháp" cốt lõi — phải tự ngộ. Tần Mục dùng Bá Thể Tam Đan Công làm gốc, đại nhất thống thành hoàn chỉnh.' },
    { name: 'Vô Lượng Kiếp Kinh', kind: 'adventure', rarity: 'Huyền Thoại', description: 'Chân kinh cấp Đế Tọa DUY NHẤT của Phật Giới — nằm trong tay Đại Phạn Thiên Vương Phật. Pháp môn "Dĩ Mộng Nhập Đạo": mượn giấc mộng ngàn thu nếm trải vô lượng kiếp nạn, mượn hồng trần đúc tu vi. Là chìa khóa Như Lai Đại Thừa Kinh xé mây bước lên Đế Tọa.' },
    { name: 'Đạo Kiếm Thập Tứ Thiên', kind: 'adventure', rarity: 'Huyền Thoại', description: 'Chân kinh trấn phái Đạo Môn — sánh ngang Như Lai Đại Thừa + Đại Dục Thiên Ma, tạo thế chân vạc tam đại thánh địa.' },
    // ─── Phân pháp Tạo Hóa Thất Thiên ───
    { name: 'Tạo Hóa Tiên Thiên Công', kind: 'adventure', rarity: 'Cực Phẩm', description: 'Phân pháp 1/7 Tạo Hóa — nghịch chuyển trẻ sơ sinh, thanh xuân vĩnh trú. Kết hợp Địa Nguyên Công → bão nguyên thủ nhất, hái mẫu khí đại địa nuôi nguyên thần. Nhánh Tự Tại Tiên Thiên Công dễ luyện sai (gã phu canh nuôi dị xà cắn nuốt tiên thiên chi khí của trẻ sơ sinh).' },
    { name: 'Tạo Hóa Địa Nguyên Công', kind: 'adventure', rarity: 'Cực Phẩm', description: 'Phân pháp 2/7 — luyện dương thần, thu mẫu khí đại địa + thiên địa linh lực. Bị Phật môn lên án là ma công vì truyền sai dùng để hái ma hỏa thái dương luyện chết chúng sinh (oan hồn càng nhiều → ma hỏa hóa địa ngục Địa Nguyên).' },
    { name: 'Tạo Hóa Thiên Ma Công', kind: 'adventure', rarity: 'Cực Phẩm', description: 'Phân pháp 3/7 — chủ tu nội tại, phong ấn tam hồn thất phách + khí huyết bản thân, không cho ngoại ma xâm lấn. Bàng môn ngoại đạo: lột da may áo. Chính đạo: Tiều Phu Thánh Nhân phong ấn linh hồn Khai Hoàng thần nhân vào túi da.' },
    { name: 'Tạo Hóa Thiên Thần Công', kind: 'adventure', rarity: 'Siêu Phẩm', description: 'Phân pháp 4/7 — vô thường thế vô thường hình. Bề ngoài là mô phỏng công pháp thần thông khác (như Tư Bà Bà biến thành Phó Vân Địch), bản chất sâu hơn.' },
    { name: 'Tạo Hóa Linh Công', kind: 'adventure', rarity: 'Cực Phẩm', description: 'Phân pháp 5/7 — thay đổi Linh Thai + chuyển biến hình thái, thậm chí thuộc tính nguyên khí. Dị thú / yêu quái không có Thần Tàng / Linh Thai vẫn tu được Linh Thai riêng. Tần Mục dùng luyện đi bệnh ngầm của Diên Phong Đế.' },
    // ─── Pháp luyện thể + nhật dụng ───
    { name: 'Cửu Chuyển Tam Chứng Huyền Công', kind: 'combat_basic', rarity: 'Huyền Thoại', description: 'Công pháp luyện thể đỉnh cấp Đại Dục Thiên Ma Kinh. Tam chứng: cốt khẩn mật → thân như thiết → như khâu nhạc. Cửu chuyển: khí như hồng → tựa diên hống → hỏa long → hồng lô khai... ⚠ Cực hung hiểm, rút cạn năng lượng → cần linh đan bổ sung. Tần Mục dung hợp vào Bá Thể Tam Đan Công.' },
    { name: 'Linh Hoàn Đan Đại Bổ Công', kind: 'adventure', rarity: 'Cực Phẩm', description: 'Tu luyện qua ăn uống — đồ ăn vào bụng hóa năng lượng / nguyên khí, cường thân tráng cốt + tăng tu vi.' },
    { name: 'Tiểu Vân Lôi Pháp', kind: 'combat_basic', rarity: 'Hiếm', description: 'Pháp thuật mây sấm trong Đại Dục Thiên Ma Kinh. Tư Công Trưởng Lão (Cường Giả Thần Kiều) tu thành — uy lực không nhỏ.' },
    { name: 'Ngũ Quỷ Bàn Vận Thuật', kind: 'adventure', rarity: 'Tốt', description: 'Pháp thuật hạ cửu lưu — thần không biết quỷ không hay trộm vật từ xa.' },
    { name: 'Truyền Tống Thần Thông', kind: 'adventure', rarity: 'Siêu Phẩm', description: 'Thần thông di chuyển không gian dựa trên thuật số cực cao. Luyện chế thành Truyền Tống Kỳ (cờ che → mọi nơi trong tầm phủ truyền đi) hoặc Truyền Tống Y (áo → mang chính mình).' },
    { name: 'Lôi Âm Bát Thức', kind: 'combat_ultimate', rarity: 'Huyền Thoại', description: 'Thần thông sinh ra từ cảnh giới Đế Thích Thiên (tầng 19/20). Mã Gia đạt được trước khi rời núi → cường giả hạng nhất đương thời.' },
    { name: 'Bồ Đề Bà Sa', kind: 'combat_ultimate', rarity: 'Huyền Thoại', description: 'Thần thông huyền diệu thai nghén từ tầng Bồ Đề Thụ Thiên (Như Lai Đại Thừa Kinh).' },
    { name: 'Kim Thân Trượng Lục', kind: 'combat_ultimate', rarity: 'Huyền Thoại', description: 'Đỉnh thi triển Như Lai Đại Thừa Kinh — hóa Đại Phật khổng lồ, 20 tầng chư thiên thần phật lượn bao quanh gia trì. Lão Như Lai từng vỗ một chưởng giáng 5 ngọn núi trấn áp Diên Phong Đế.' },
    // ─── Kiếm Đạo: 20 thức cơ bản + kiếm pháp đại sư ───
    { name: '14 Kiếm Thức Khai Hoàng', kind: 'combat_basic', rarity: 'Cực Phẩm', description: 'Nền tảng kiếm pháp thiên hạ — phân giải mọi kiếm pháp thành 14 động tác cơ bản: Đâm (Thích), Hất (Thiêu), Vân, Chém (Trảm), Bổ (Phách), Điểm, Băng, Quải, Liêu, Mạt, Quét (Tảo), Giá, Tiệt, Hoa.' },
    { name: 'Tam Tân Kiếm Thức (Nhiễu/Du/Toản)', kind: 'combat_basic', rarity: 'Siêu Phẩm', description: '3 thức Giang Bạch Khuê thêm vào — Nhiễu (quấn), Du (lượn/bơi), Toản (khoan). Đẩy kiếm đạo đình trệ từ Khai Hoàng tiến 3 bước khổng lồ.' },
    { name: 'Định Giới', kind: 'combat_ultimate', rarity: 'Huyền Thoại', description: 'Kiếm Giới đệ nhất thiên — Giang Bạch Khuê sáng tạo khi vừa đặt chân ngưỡng Kiếm Đạo. Ẩn hoài bão: định giang sơn / xã tắc, dẹp loạn lục hợp bát hoang, mở thái bình thịnh thế.' },
    { name: 'Đại Lục Hợp Kiếm Pháp', kind: 'combat_ultimate', rarity: 'Huyền Thoại', description: 'Thần thông Giang Bạch Khuê lấy Nhiễu Kiếm Thức làm cốt lõi. Bề ngoài 1 cú đâm (Thích), thực ra kiếm trụ là vô số đạo kiếm quang lưu động biến ảo độc lập, xuất kiếm hòa thành 1 chỉnh thể.' },
    { name: 'Kiếm Đồ 9 Thức', kind: 'combat_ultimate', rarity: 'Huyền Thoại', description: 'Kiếm pháp Thôn Trưởng (Tô Mạc Già) ngộ ở cảnh Thần Kiều — mỗi chiêu 1 trọng thiên. Dùng kiếm sáng tạo thiên địa vạn vật.' },
    { name: 'Tân Kiếm Đồ', kind: 'combat_ultimate', rarity: 'Huyền Thoại', description: 'Thôn Trưởng khai sáng sau khi thành Thần — gồm Kiếm Lý Sơn Hà (thức 1), Kiếm Xuất Khai Hoàng (thức 2 — Nhất Kiếm Khai Hoàng Huyết Uông Dương), Thượng Hoàng Kiếp Động (thức 3), Thương Thiên Bích Tỷ (thức 12).' },
    { name: 'Đạo Kiếm Thập Tứ Thiên — Thiên 1 (Lưỡng Nghi)', kind: 'combat_ultimate', rarity: 'Huyền Thoại', description: 'Nhất điểm xuyên liên hạo động, lưỡng nghi nội phản phúc âm dương — phép tính nhị phân, diễn Thái Cực Đồ, kiếm quang hắc bạch luân chuyển.' },
    { name: 'Đạo Kiếm Thập Tứ Thiên — Thiên 2 (Ngũ Khí)', kind: 'combat_ultimate', rarity: 'Huyền Thoại', description: 'Ngũ khí tam nguyên kết tú, thăng đằng xứ vân lộ giao gia — tam phân + ngũ phân tạo Nhật Nguyệt Đại Địa, mượn sức Ngũ Khí Triều Nguyên.' },
    { name: 'Đạo Kiếm Thập Tứ Thiên — Thiên 4 (Chu Thiên Tinh La)', kind: 'combat_ultimate', rarity: 'Huyền Thoại', description: 'Mặc bả chu thiên oát vận, kiến sâm la vạn tượng thôi thiên — thuật toán Chu Thiên Tinh La Kỳ Biến, biến vạn phi kiếm thành mạn thiên tinh đẩu, vây hãm Tinh Không Ngân Hà.' },
    { name: 'Đạo Kiếm Thập Tứ Thiên — Thiên 14 (Vạn Pháp Quy Nhất)', kind: 'combat_ultimate', rarity: 'Huyền Thoại', description: 'Đạo dưỡng chư thiên đại địa, tư vạn pháp thiên hạ quy nhất — đỉnh cao Đạo Môn, không tiêu hao nguyên khí, mượn sức quy luật thiên địa. Chỉ Tần Mục lĩnh ngộ trọn vẹn nhờ tinh đồ 35 vạn năm trước + tinh đẩu trận pháp Trảm Thần Huyền Đao.' },
    { name: '35 Trùng Thiên Kiếm Đạo Khai Hoàng', kind: 'combat_ultimate', rarity: 'Huyền Thoại', description: 'Đỉnh kiếm đạo nhân gian — Khai Hoàng 35 Trùng Thiên hóa Kiếm Vực. Tiêu biểu: Thái Hoàng Bình Thiên (1), Thái Minh Tề Thiên (2), Vô Thượng Thường Dung (29), Ngọc Long Đằng Thắng (30), Long Biến Phạn Độ (31), Bình Dục Giả Dịch (32), Thái Thanh Đạo Cảnh (33), Thượng Thanh Cảnh Kiếm Vực (34), Ngọc Thanh Cảnh Kiếm Vực (35).' },
    { name: 'Kiếm Thức 18 (Xoay Tròn Như Bánh Xe)', kind: 'combat_ultimate', rarity: 'Huyền Thoại', description: 'Tần Mục ngộ ở Quân Thành — kiếm xoay tròn, kết hợp Bổ + Gọt + Vân. Uy lực kinh người nhưng tiêu pháp lực kinh khủng, thôi 1 lần bòn rút non nửa tu vi.' },
    { name: 'Kiếm Thức 19 (Đề Kiếp)', kind: 'combat_ultimate', rarity: 'Huyền Thoại', description: 'Phức tạp đến mức bất kỳ thần thông giả nào học cũng tự động dĩ kiếm nhập đạo. Cốt lõi: buông bỏ (tiên xả nhi hậu thủ), hàng chục biến hóa vô lượng như Liên Hoàn Kiếp.' },
    { name: 'Kiếm Thức 20', kind: 'combat_ultimate', rarity: 'Huyền Thoại', description: 'Khai Hoàng ngộ ngay sau khi xem Kiếm 19 Tần Mục. Đòi hỏi dung nhập toàn bộ khí huyết + thần thức + thần hồn vào kiếm, thiêu khí huyết, phối hợp Kiếm Vực. Yếu đánh mạnh dễ như trở bàn tay.' },
    // ─── KIẾP KIẾM — Tuyệt học riêng Tần Mục ───
    { name: 'Khai Kiếp (Kiếp Kiếm Thức 1)', kind: 'combat_ultimate', rarity: 'Huyền Thoại', description: 'Hóa phồn vi giản — bề ngoài 1 chỉ điểm, bên trong lấy Vô Ưu Kiếm (thân 8 mặt) làm tâm, 8000 phi kiếm tạo gương phản chiếu phù văn Bá Thể Tam Đan Công. Đạo pháp + nhục thân + nguyên thần hội tụ 1 đòn sát thủ. Đã xé nát đại thần thông Tề Cửu Nghi + Triết Hoa Lê.' },
    { name: 'Đề Kiếp Kiếm (Kiếp Kiếm Thức 2 = Kiếm 19)', kind: 'combat_ultimate', rarity: 'Huyền Thoại', description: 'Tần Mục sáng tạo đầu thời Long Hán để trả thù cho Ngự Thiên Tôn. Kiếm quang nhảy múa vô định không thể nắm bắt, mỗi biến hóa 1 kiếp số. Đánh trọng thương Hạo Thiên Tôn thành tàn phế nằm liệt giường 1000 năm dưới sức ép Nguyên Mẫu Phu Nhân.' },
    { name: 'Ứng Kiếp Kiếm (Kiếp Kiếm Thức 3)', kind: 'combat_ultimate', rarity: 'Huyền Thoại', description: 'Hung bạo nhất — trảm Thần Tàng + Thiên Cung. Sinh ra sau đại kiếp Nguyên Giới. Tần Mục từng tự trảm Thiên Nhân + Ngũ Diệu + Lục Hợp + Thất Tinh + Sinh Tử Thần Tàng của mình (giữ Linh Thai), đập nồi dìm thuyền. Dùng lên địch: đâm thẳng từ Thiên Cung xuyên Thần Kiều xuống toàn bộ Thần Tàng → diệt tận gốc tu vi. Đã giết Hàn Thiên Quân + Hoa Thanh 1 kích.' },
    // ─── Bạch Cừ Nhi + Tử Hề ───
    { name: 'Bạch Long Kiếm Vũ', kind: 'combat_ultimate', rarity: 'Huyền Thoại', description: 'Kiếm pháp đặc trưng Bạch Cừ Nhi — Kiếm Đạo 27 Trùng Thiên. Chiến thuật "Điểm phá diện", lấy lực xuyên thấu sắc bén đâm thủng cục diện đối thủ.' },
    { name: 'Kiếm Đạo 13 Trùng Thiên Tử Hề', kind: 'combat_ultimate', rarity: 'Siêu Phẩm', description: 'Cực hạn Yên Vân Hề tự khai khi bị vây Lăng Tiêu. Đặc trưng: tinh thông toàn diện Hậu Thiên Đại Đạo (trận pháp / thuật số / đao thương kiếm kích / cầm kỳ thi họa) → tái hiện chiêu thức tối thượng của người khác.' },
  ],

  signatureBeasts: [
    { name: 'Đại Hắc Hắc Tử', rarity: 'Huyền Thoại', kind: 'mystical', description: 'Linh thú thái cổ, ngụy trang dưới hình chó đen.', basePower: 1500 },
    { name: 'Hắc Linh Lang', rarity: 'Hiếm', kind: 'beast', description: 'Lang vương Đại Hoang, lông đen như mực, săn theo bầy.', basePower: 180 },
    { name: 'Tỏa Linh Hồ Tinh', rarity: 'Cực Phẩm', kind: 'spirit', description: 'Cáo chín đuôi, tu thành nhân hình, mê hoặc tu sĩ.', basePower: 350 },
    { name: 'Long Hán Hậu Duệ', rarity: 'Siêu Phẩm', kind: 'dragon', description: 'Long tộc sót lại từ Long Hán Triều cổ.', basePower: 800 },
    // ─── Ma Thần / U Đô Ma Quái ───
    { name: 'U Đô Ma Quái — Bách Đầu', rarity: 'Cực Phẩm', kind: 'mystical', description: 'Trên người mọc đầy đầu lâu của đủ loại chủng tộc — kết tinh oán niệm vô số vong giả U Đô.', basePower: 450 },
    { name: 'U Đô Ma Quái — Bách Bí', rarity: 'Cực Phẩm', kind: 'mystical', description: 'Cánh tay là do vô số cánh tay vặn vẹo cùng một chỗ cấu thành — hung hãn xé toạc mọi thứ.', basePower: 480 },
    { name: 'U Đô Ma Quái — Bạch Cốt', rarity: 'Hiếm', kind: 'mystical', description: 'Toàn thân bạch cốt, di chuyển nhanh, sát thương vật lý cao.', basePower: 220 },
    { name: 'U Đô Ma Quái — Vạn Mục', rarity: 'Siêu Phẩm', kind: 'mystical', description: 'Trên mặt mọc đầy con ngươi lớn nhỏ — nhìn thấu mọi che giấu, tâm linh tấn công.', basePower: 620 },
    { name: 'U Đô Ma Quái — Bách Túc', rarity: 'Hiếm', kind: 'mystical', description: 'Mọc vô số tay chân tựa con rết — bò nhanh, vây kín mục tiêu.', basePower: 260 },
    { name: 'Tôn Ma Thần Hai Đầu Năm Đuôi', rarity: 'Huyền Thoại', kind: 'mystical', description: 'Ma Thần Tử Giả Sinh Giới — hai đầu nói lời mê hoặc, năm đuôi cuốn kẻ địch vào bóng tối.', basePower: 1800 },
    { name: 'Trọng Thân Ma Tướng', rarity: 'Siêu Phẩm', kind: 'mystical', description: 'Tướng lĩnh Trọng Thân Ma Tộc — đã nuốt hàng vạn đồng loại, thân hình bành trướng quái dị, thao túng nhiều ý thức.', basePower: 900 },
    { name: 'Đại Hắc Thiên', rarity: 'Huyền Thoại', kind: 'mystical', description: 'Ma Thần bẩm sinh đầu tiên U Đô — tổ tiên toàn bộ Ma Tộc Vực Ngoại. Bị Thổ Bá đuổi, lưu lãng khai sinh Ma Tộc.', basePower: 3500 },
  ],

  signatureLocations: [
    { name: 'Đại Hoang', category: 'Vùng hoang dã', description: 'Vùng đất khắc nghiệt phía Bắc, nhiều mãnh thú + linh dược cổ.' },
    { name: 'Trung Châu', category: 'Đại lục', description: 'Trung tâm văn minh nhân loại, hội tụ đại tông môn.' },
    { name: 'Đại Khư', category: 'Cổ chiến trường', description: 'Tàn tích chiến trường thái cổ, có vô số bí mật + nguy hiểm.' },
    { name: 'Diên Khang Kinh', category: 'Đô thị lớn', description: 'Kinh đô Diên Khang đế quốc, đông đúc nhộn nhịp.' },
    { name: 'Dao Trì Tiểu Trúc', category: 'Thánh địa', description: 'Nơi Ngự Thiên Tôn bị ám sát — Mạn Hồi Lang Các huyền bí.' },
    { name: 'Nam Thiên Môn', category: 'Cổng cảnh giới', description: 'Cánh cổng phân chia Tôn Thần và Chân Thần — Đạo Áp khủng khiếp.' },
    { name: 'Tổ Đình Ngọc Kinh Thành', category: 'Thánh địa thái cổ', description: 'Tổ đình nguyên bản với 72 Bảo Điện chân chính của 72 Thành Đạo Giả tiền sử.' },
    { name: 'Đại Lôi Âm Tự', category: 'Thánh địa Phật môn', description: 'Tổ đình Phật môn hạ giới — trấn phái Như Lai Đại Thừa Kinh. Yên tĩnh + uy nghiêm, bia đá nơi Tần Mục huyễn Ngũ Trùng Chư Thiên.' },
    { name: 'Thiên Thánh Giáo Tổ Đình', category: 'Thánh địa Ma môn', description: 'Tổ đình Thiên Ma Giáo — nơi tảng đá Tiều Phu Thánh Nhân giảng đạo, gốc của Thánh Nhân Huấn.' },
    { name: 'Phật Giới', category: 'Thượng giới', description: 'Cõi Phật ở thượng giới — Đại Phạn Thiên Vương Phật + Vô Lượng Kiếp Kinh.' },
    { name: 'Tương Long Thành', category: 'Đại thành', description: 'Thành Phó Vân Địch trị vì — Tư Bà Bà từng giả dạng để lấy giả đổi thật.' },
    // ─── Cõi Ma + Cõi huyền thoại ───
    { name: 'Vô Ưu Hương', category: 'Miền đất hứa', description: 'Miền đất huyền thoại được đồn đại an toàn tuyệt đối — mục tiêu săn lùng hàng đầu của các Ma Thần đang đối mặt nguy cơ diệt tộc.' },
    { name: 'Tự Tại Thiên (Sát-Ma-Gia)', category: 'Lãnh địa Ma Thần', description: 'Tiếng Phạn "Tát Ma Gia" = sáng tạo Tự Tại Thiên. Lãnh địa độc lập do Ma Thần dùng vĩ lực khai tích, thôn tính di tích / không gian sống làm nơi ngự trị riêng.' },
    { name: 'Đô Thiên', category: 'Ma Tộc Chư Thiên (đã diệt)', description: 'Thế giới Ma Tộc đã bị tàn phá đến mức mặt trời tắt lụi, chỉ còn lại tăm tối vô biên + chết chóc. Lý do các Ma Thần Đô Thiên đổ về săn Vô Ưu Hương.' },
    { name: 'La Phù Thiên', category: 'Ma Tộc Chư Thiên', description: 'Thế giới Ma Tộc — nguồn gốc một nhánh Vực Ngoại Ma Thần đến Đại Khư.' },
    { name: 'U Đô', category: 'Cõi âm', description: 'Nơi tử vong sinh ra ngay khi thế gian xuất hiện cái chết. Vong giả tụ tập, oán niệm + tham lam → diễn sinh Ma Tính → kết tinh thành U Đô Ma Quái. Thổ Bá là chủ nhân.' },
    { name: 'Tử Giả Sinh Giới', category: 'Cõi chồng chéo', description: 'Một thế giới trong Ám Giới — chồng điệp với Đại Khư vào ban đêm. Nơi tôn Ma Thần hai đầu năm đuôi xuất hiện.' },
    { name: 'Khu Di Tích Hẻm Núi', category: 'Di tích cổ', description: 'Di tích nơi thứ ẩn nấp trong bóng tối dự định xây Tự Tại Thiên triệu Ma Thần giáng lâm cắn nuốt toàn bộ.' },
    { name: 'Tế Đàn Bạch Cốt', category: 'Công trình ma', description: 'Tế đàn khổng lồ đắp từ thi thể hàng vạn Thiên Ma tự tàn sát — dùng phá vách thế giới triệu hoán Ma Thần cường đại hơn giáng lâm.' },
  ],

  terminology: [
    { term: 'Khiếu Huyệt', kind: 'huyet_vi', explanation: 'Cửa huyệt khởi nguồn tu luyện, mỗi người có 9 chính khiếu.' },
    { term: 'Linh Khu', kind: 'kinh_mach', explanation: 'Hệ kinh mạch dẫn linh khí, tu Linh Đài cảnh là tu Linh Khu.' },
    { term: 'Vĩnh Hải', kind: 'kinh_mach', explanation: 'Đại kinh mạch chính, nơi linh khí tích tụ thành biển.' },
    { term: 'Thần Kiều', kind: 'realm_term', explanation: 'Cây cầu nối nguyên thần với cõi Thần, mở ra cảnh giới Tôn Thần.' },
    { term: 'Đại Khư', kind: 'territory', explanation: 'Vùng đất nguyên chiến trường thái cổ, đầy di tích thần ma.' },
    { term: 'Thái Tô', kind: 'other', explanation: 'Khí nguyên thủy thuần khiết nhất, gốc của vạn pháp.' },
    { term: 'Linh Thai', kind: 'realm_term', explanation: 'Cảnh giới đầu tiên — đắp Linh Thai từ hư vô, giao phó linh + hồn.' },
    { term: 'Ngũ Diệu', kind: 'realm_term', explanation: 'Ngũ tạng tương ứng Ngũ Tinh (Kim Mộc Thủy Hỏa Thổ), Ngũ Diệu Tinh Quân ngự trị.' },
    { term: 'Lục Hợp', kind: 'realm_term', explanation: 'Đông Tây Nam Bắc Trên Dưới — ngưỡng cửa Thần Thông Giả.' },
    { term: 'Thất Tinh', kind: 'realm_term', explanation: 'Ngũ Diệu + Nhật + Nguyệt = 7 vì sao trong cơ thể.' },
    { term: 'U Đô', kind: 'realm_term', explanation: 'Vùng tăm tối mở dưới Linh Đài cảnh Sinh Tử — ranh giới Sinh và Tử.' },
    { term: 'Nam Thiên Môn', kind: 'realm_term', explanation: 'Cửa Thiên Cung — phân Tôn Thần (đứng ngoài) với Chân Thần (bước vào).' },
    { term: 'Đạo Áp', kind: 'other', explanation: 'Áp lực quy tắc đại đạo của Nam Thiên Môn — cần Nhục thân + Nguyên thần + Tâm cảnh đủ Thần Cảnh mới chịu nổi.' },
    { term: 'Dao Trì', kind: 'realm_term', explanation: 'Biển khí tức nguyên thủy trong cảnh giới Dao Đài — gột rửa + bồi đạo tâm.' },
    { term: 'Trảm Thần Đài', kind: 'realm_term', explanation: 'Đài chém thần tích sát khí Thái Cổ — mài giũa chiến lực thăng hoa về chất.' },
    { term: 'Ngọc Kinh Thành', kind: 'realm_term', explanation: 'Tòa thành mô phỏng Tổ Đình — hấp thu vô số đạo pháp cường hóa.' },
    { term: 'Lăng Tiêu Điện', kind: 'realm_term', explanation: 'Mô phỏng Đại La Thiên — ẩn Hố bẫy của Di La Cung.' },
    { term: 'Đế Tọa', kind: 'realm_term', explanation: 'Ngai vàng tột đỉnh một loại đại đạo — nhục thân + đạo hạnh hòa làm một.' },
    { term: 'Thiên Đình', kind: 'realm_term', explanation: 'Đại Viên Mãn — 36 Đại Đạo + 72 Hậu Thiên Chi Đạo dung hợp thành Đại Thiên Đình.' },
    { term: 'Dĩ Lực Thành Đạo', kind: 'other', explanation: 'Triết lý hệ thống Thiên Cung Thần Tàng — tích lũy pháp lực bạo liệt, KHÔNG cảm ngộ Đại Đạo.' },
    { term: 'Lạc Ấn Hư Không', kind: 'other', explanation: 'Đỉnh cao Dĩ Lực Thành Đạo — dùng bạo lực ép Hư Không dung nạp đạo quả, thành tựu Đại La.' },
    { term: 'Thập Thiên Tôn', kind: 'other', explanation: '10 bậc Tôn Thần thời Long Hán sơ kỳ — sáng lập + hoàn thiện hệ thống Thiên Cung Thần Tàng.' },
    { term: 'Thất Đại Thần Tàng', kind: 'other', explanation: '7 Thần Tàng cơ bản: Linh Thai → Ngũ Diệu → Lục Hợp → Thất Tinh → Thiên Nhân → Sinh Tử → Thần Kiều.' },
    { term: 'Tám Cảnh Thiên Cung', kind: 'other', explanation: '8 cảnh giới cõi Thần: Tôn Thần → Chân Thần → Dao Đài → Trảm Thần Đài → Ngọc Kinh → Lăng Tiêu → Đế Tọa → Thiên Đình.' },
    { term: '36 Đại Đạo', kind: 'other', explanation: 'Yêu cầu Thiên Đình — 36 loại Đại Đạo không trùng lặp, mỗi đại đạo đúc 1 tòa Thiên Cung.' },
    { term: '72 Bảo Điện', kind: 'other', explanation: '72 Hậu Thiên Chi Đạo bổ trợ — căn cơ chống bài xích giữa các đại Thiên Cung.' },
    { term: 'Hố Bẫy Lăng Tiêu', kind: 'other', explanation: 'Cạm bẫy Di La Cung — khóa đạo quả cường giả Dĩ Lực Thành Đạo vào Lăng Tiêu Bảo Điện vĩnh viễn.' },
    // ─── Tam đại tuyệt học + Phật/Ma ───
    { term: 'Nhị Thập Chư Thiên', kind: 'realm_term', explanation: '20 tầng trời của Như Lai Đại Thừa Kinh: Diêm Ma La Vương → Sa Kiệt Long Vương → Nguyệt Cung → Nhật Cung → ... → Quỷ Tử Mẫu → ... → Bồ Đề Thụ → ... → Đế Thích → Đại Phạn Thiên.' },
    { term: 'Diêm Ma La Vương Thiên', kind: 'realm_term', explanation: 'Tầng 1 Như Lai — uy quyền địa ngục. Đốn ngộ chịu hành hạ 8 tầng lạnh + 8 tầng nóng đan xen, hóa thân Diêm Vương.' },
    { term: 'Sa Kiệt Long Vương Thiên', kind: 'realm_term', explanation: 'Tầng 2 — uy lực Long Vương biển sâu.' },
    { term: 'Nguyệt Cung Thiên Tử Thiên', kind: 'realm_term', explanation: 'Tầng 3 — tâm cảnh tĩnh tại thanh cao, phía sau ót hiện vầng Phật quang như trăng linh thiêng.' },
    { term: 'Nhật Cung Thiên Tử Thiên', kind: 'realm_term', explanation: 'Tầng 4 — tâm cảnh rực cháy, Phật quang sau đầu mang lửa đỏ tựa thái dương.' },
    { term: 'Quỷ Tử Mẫu Thiên', kind: 'realm_term', explanation: 'Tầng 6 — rào cản khắc nghiệt kiểm chứng Phật tâm, Bá Thể Tần Mục cũng từng kẹt.' },
    { term: 'Bồ Đề Thụ Thiên', kind: 'realm_term', explanation: 'Tầng 14/20 (đệ thập tứ) — thai nghén thần thông Bồ Đề Bà Sa.' },
    { term: 'Đế Thích Thiên Cảnh', kind: 'realm_term', explanation: 'Tầng 19 — cường giả hạng nhất. Mã Gia đạt → tuyệt kỹ Lôi Âm Bát Thức.' },
    { term: 'Đại Phạn Thiên Cảnh', kind: 'realm_term', explanation: 'Tầng 20 — đốn ngộ + viên giác tuyệt đối. Cap của Như Lai Đại Thừa Kinh, gần Đế Tọa nhưng thiếu hậu tiếp.' },
    { term: 'Tạo Hóa Thất Thiên', kind: 'other', explanation: '7 phân pháp gốc Đại Dục Thiên Ma Kinh: Tiên Thiên / Địa Nguyên / Thiên Thần / Thiên Ma / Nhân Vương / Quỷ Thần / Linh.' },
    { term: 'Dĩ Mộng Nhập Đạo', kind: 'other', explanation: 'Pháp môn Vô Lượng Kiếp Kinh — mượn giấc mộng ngàn thu nếm trải vô lượng kiếp nạn, đúc tu vi từ hồng trần.' },
    { term: 'Tam Lập Thành Thánh', kind: 'other', explanation: 'Lập đức / lập công / lập ngôn — triết lý Tiều Phu Thánh Nhân, gốc của Thánh Nhân Huấn / Đại Dục Thiên Ma Kinh.' },
    { term: 'Tam Minh Vạn Nhân Sư', kind: 'other', explanation: 'Minh lý / minh tri / minh giáo — triết lý đi cùng Tam Lập Thành Thánh.' },
    { term: 'Đại Nhất Thống Công Pháp', kind: 'other', explanation: 'Nội công cốt lõi giá ngự 1000 Pháp của Đại Dục Thiên Ma Kinh. Ẩn trong dư âm hình ảnh Tiều Phu giảng pháp trên đá, mỗi đời Giáo chủ tự tham ngộ.' },
    { term: 'Cửu Chuyển Tam Chứng', kind: 'other', explanation: 'Luyện thể: 3 chứng (cốt khẩn mật → thân như thiết → như khâu nhạc) × 9 chuyển (khí như hồng → diên hống → hỏa long → hồng lô khai...).' },
    { term: 'Kim Thân Trượng Lục', kind: 'other', explanation: 'Đỉnh thi triển Như Lai — hóa Đại Phật khổng lồ, 20 chư thiên thần phật gia trì.' },
    { term: 'Tuệ Căn', kind: 'other', explanation: 'Bẩm sinh trí tuệ — yêu cầu tu Như Lai Đại Thừa Kinh, đi đôi với Phật Tâm thuần khiết.' },
    { term: 'Phật Tâm', kind: 'other', explanation: 'Tâm Phật thuần khiết không vướng bụi trần — điều kiện tu Như Lai. Cũng là tên 1 phật tử (bị giết oan).' },
    { term: 'Thể Như / Tâm Như', kind: 'other', explanation: 'Như Lai Đại Thừa Kinh: ngoài đúc Thể Như (thân thể chân thật), trong luyện Tâm Như (tâm chân thật).' },
    // ─── Kiếm Đạo ───
    { term: 'Thuật / Pháp / Đạo', kind: 'other', explanation: '3 giai đoạn kiếm tu: Thuật (học + vận dụng) → Pháp (khai sáng) → Đạo (vứt bỏ pháp + thuật).' },
    { term: '14 Kiếm Thức', kind: 'other', explanation: 'Nền tảng Khai Hoàng: Đâm/Hất/Vân/Chém/Bổ/Điểm/Băng/Quải/Liêu/Mạt/Quét/Giá/Tiệt/Hoa. Tổ tiên kiếm thiên hạ.' },
    { term: 'Nhiễu / Du / Toản', kind: 'other', explanation: '3 thức Giang Bạch Khuê thêm: Nhiễu (quấn), Du (lượn bơi), Toản (khoan). Phá vỡ khuôn 14 thức cũ.' },
    { term: 'Kiếm Vực', kind: 'realm_term', explanation: 'Lĩnh vực Kiếm Đạo — Kiếm Đạo hóa thực chất. Khai Hoàng đạt Thượng Thanh Cảnh (34) + Ngọc Thanh Cảnh (35) Kiếm Vực.' },
    { term: 'Trùng Thiên Kiếm Đạo', kind: 'realm_term', explanation: 'Hệ thống đo lường kiếm đạo — Khai Hoàng 35 Trùng, Bạch Cừ Nhi 27 Trùng, Tử Hề 13 Trùng. Càng cao = càng gần Kiếm Vực.' },
    { term: 'Kiếm Giới đệ nhất thiên', kind: 'realm_term', explanation: 'Ngưỡng cửa Kiếm Đạo — Định Giới của Giang Bạch Khuê là chiêu đầu tiên.' },
    { term: 'Dĩ Kiếm Nhập Đạo', kind: 'other', explanation: 'Cách kiếm tu chứng đạo — Yên Vân Hề / Khai Hoàng / Tần Mục đều theo con đường này.' },
    { term: 'KIẾP KIẾM', kind: 'other', explanation: 'Tuyệt học Tần Mục — chủ động đối mặt tai kiếp, thay pháp tổ tông, đoạt mệnh Thần Ma. 3 thức: Khai Kiếp / Đề Kiếp / Ứng Kiếp.' },
    { term: 'Tiên xả nhi hậu thủ', kind: 'other', explanation: 'Cốt lõi Đề Kiếp Kiếm — buông trước giữ sau, tạo Liên Hoàn Kiếp.' },
    { term: 'Hóa Phồn Vi Giản', kind: 'other', explanation: 'Cốt lõi Khai Kiếp — biến phức tạp thành đơn giản tột cùng, 1 chỉ điểm chứa cả vạn kiếm.' },
    { term: 'Bạch Long Kiếm Vũ', kind: 'other', explanation: 'Kiếm pháp đặc trưng Bạch Cừ Nhi — Điểm phá diện, lực xuyên thấu phá đại thế.' },
    { term: 'Điểm phá diện', kind: 'other', explanation: 'Chiến thuật Bạch Cừ Nhi — đối lập "Đại thế bàng bạc" của Lạc Vô Song.' },
    { term: 'Tứ Đại Thiên Sư Khai Hoàng', kind: 'other', explanation: 'Tứ đại tướng thân tín Khai Hoàng — gồm Tử Hề (Yên Vân Hề), Võ Đấu Thiên Sư Trạc Trà, ...' },
    { term: 'Hậu Thiên Đại Đạo', kind: 'other', explanation: 'Tổng hợp trận pháp / thuật số / đao thương kiếm kích / cầm kỳ thi họa — sở trường Tử Hề Thiên Sư.' },
    { term: 'Liên Hoàn Kiếp', kind: 'other', explanation: 'Biến hóa vô lượng của Đề Kiếp Kiếm — mỗi kiếm = 1 kiếp số liên hoàn.' },
    { term: 'Đạo Áp Kiếm Tâm', kind: 'other', explanation: 'Cảm ngộ phối hợp Kiếm Vực — yêu cầu thi triển Kiếm Thức 20 của Khai Hoàng.' },
  ],

  popularCharacters: [
    { name: 'Tần Mục', description: 'Nhân vật chính nguyên tác — cô nhi được lão tổ Đại Hoang nuôi lớn.' },
    { name: 'Tần Hồng Sinh', description: 'Sư phụ Tần Mục, lão tế tự với sức mạnh ẩn giấu.' },
    { name: 'Diệp Thanh Vũ', description: 'Tiên nữ Thanh Sơn phái.' },
    { name: 'Mặc Thanh Đồng', description: 'Đệ tử Mặc Gia, tinh thông cơ quan thuật.' },
    { name: 'Vân Vô Phong', description: 'Thiên tài Đạo Thánh tông — kình địch Tần Mục.' },
    { name: 'Lão Như Lai', description: 'Phương Trượng Đại Lôi Âm Tự — Kim Thân Trượng Lục giáng 5 núi trấn áp Diên Phong Đế.' },
    { name: 'Mã Gia', description: 'Cao tăng Đại Lôi Âm Tự — Đế Thích Thiên Cảnh, tuyệt kỹ Lôi Âm Bát Thức.' },
    { name: 'Tiều Phu Thánh Nhân', description: 'Thánh nhân tiền sử — giảng đạo trên đá, gốc của Đại Dục Thiên Ma Kinh.' },
    { name: 'Đại Phạn Thiên Vương Phật', description: 'Tôn giả Phật Giới — giữ Vô Lượng Kiếp Kinh (chân kinh cấp Đế Tọa duy nhất).' },
    { name: 'Giang Bạch Khuê', description: 'Diên Khang Quốc Sư — Đệ nhất nhân dưới Thần, sáng tạo Định Giới + Đại Lục Hợp Kiếm.' },
    { name: 'Khai Hoàng (Tần Nghiệp)', description: 'Đế giả — Kiếm Đạo 35 Trùng Thiên.' },
    { name: 'Bạch Cừ Nhi', description: 'Nữ Kiếm Thần Thượng Hoàng — Bạch Long Kiếm Vũ, 27 Trùng Thiên.' },
    { name: 'Yên Vân Hề (Tử Hề Thiên Sư)', description: 'Tứ Đại Thiên Sư Khai Hoàng — Lăng Tiêu Đại Viên Mãn, 13 Trùng Thiên kiếm đạo.' },
  ],

  newbornBackstoryHints: [
    'Đệ tử cấp thấp Mặc Gia, đam mê cơ quan thuật, mơ chế tạo chiến giáp riêng.',
    'Thợ săn Đại Hoang, lớn lên trong rừng sâu, tinh thông săn mãnh thú.',
    'Tù binh Long Hán hậu duệ trốn thoát, mang dòng máu cổ chưa thức tỉnh.',
    'Hậu duệ Tế Tự cổ ở Đại Hoang, lưu giữ bí quyết khai mở Linh Thai từ tổ tiên.',
    'Tiểu đạo đồng Đạo Thánh Tông phục dịch, lén lút học pháp Ngũ Diệu Thần Tàng.',
    'Tiểu sa di Đại Lôi Âm Tự, có Tuệ căn + Phật tâm sạch sẽ, đã nhập môn Như Lai Đại Thừa Kinh đến Diêm Ma La Vương Thiên.',
    'Giáo đồ trẻ Thiên Thánh Giáo bị xã hội xem là tà ma, thực ra tu chính đạo Tạo Hóa Tiên Thiên Công để cứu mẹ già bệnh tật.',
    'Lữ khách hành cước, nhặt được mảnh Đại Dục Thiên Ma Kinh trong chợ — chưa biết là tuyệt học chấn phái.',
  ],
};
