import type { CanonPack } from '@gametypes/canon-pack';

export const voThuongSatThan: CanonPack = {
  id: 'vo-thuong-sat-than',
  title: 'Vô Thượng Sát Thần',
  altTitles: ['Peerless Killing God', '无上杀神'],
  author: 'Phi Thiên Ngư',
  description:
    'Sở Phong — thiếu niên Sở gia, hồn nhập Sở Nhược, trỗi dậy bằng Cửu Long Thôn Thiên Quyết. Phong cách chiến đấu khoái cảm, đả tỉnh tu chân thông tục.',
  themes: ['Tu chân', 'Huyền huyễn', 'Báo thù'],
  currencyName: 'Nguyên Tinh Thạch',

  cosmology: {
    realmList: [
      'Nguyên Sĩ', 'Nguyên Sư', 'Tiềm Nguyên Cảnh', 'Hỗn Nguyên Cảnh',
      'Thiên Nguyên Cảnh', 'Hoàng Cảnh', 'Tôn Cảnh', 'Đế Cảnh',
    ],
    description:
      'Hệ Nguyên tu — tu Nguyên lực thay vì linh khí. Mỗi cảnh phân Sơ/Trung/Hậu kỳ + Đỉnh phong. Cửu Long Thôn Thiên Quyết là pháp môn nuốt thiên đỉnh cao.',
  },

  defaultStartingLocation: 'Phong Vân thành (Sở gia)',
  defaultStartingTechnique: 'Cửu Long Thôn Thiên Quyết',

  signatureNpcs: [
    { name: 'Sở Phong', role: 'Nhân vật chính (sau hồn nhập)', description: 'Linh hồn thiếu niên đời khác nhập vào Sở Phong phế vật, dùng Cửu Long Thôn Thiên Quyết trỗi dậy.' },
    { name: 'Sở Nhược', role: 'Người gốc + bi kịch', description: 'Thân chính của Sở Phong gốc, đã chết, linh hồn rời đi.' },
    { name: 'Mộ Dung Y', role: 'Đạo lữ chính', description: 'Tiểu thư Mộ Dung gia, định hôn ước nhưng bị hủy do Sở Phong là phế vật.' },
    { name: 'Hoàng Phủ Đào Yêu', role: 'Đạo lữ thứ hai', description: 'Tiểu thư Hoàng Phủ tộc, mê đắm tài năng Sở Phong sau khi trỗi dậy.' },
    { name: 'Sở Tử Hàn', role: 'Sư phụ', description: 'Trưởng lão Sở gia, dạy nguyên tổ pháp môn.' },
    { name: 'Lão Long Hồn', role: 'Bí bảo + lão', description: 'Hồn long cổ ngụ trong Cửu Long Quyết, hướng dẫn Sở Phong.' },
  ],

  signatureSects: [
    { name: 'Sở gia', alignment: 'trung', description: 'Gia tộc lớn Phong Vân thành, xuất thân Sở Phong.' },
    { name: 'Hắc Phong Trại', alignment: 'ma', description: 'Trại cướp đen Phong Vân, đối thủ Sở Phong sơ kỳ.' },
    { name: 'Phụng Vũ Cốc', alignment: 'chinh', description: 'Cốc tu chân tiên cảnh, nơi Sở Phong tu luyện.' },
    { name: 'Vạn Vật Tông', alignment: 'chinh', description: 'Đại tông môn cấp châu, đỉnh cao Tôn Cảnh.' },
    { name: 'Diễm Hỏa Đế Triều', alignment: 'trung', description: 'Triều đại Hoàng Cảnh, có Đế Hoàng cấp cao.' },
  ],

  signatureItems: [
    { name: 'Cửu Long Châu', category: 'Pháp bảo', rarity: 'Huyền Thoại', description: '9 hạt châu chứa hồn long cổ, gốc của Cửu Long Quyết.' },
    { name: 'Thiên Đỉnh Diễm Hỏa', category: 'Dị bảo', rarity: 'Siêu Phẩm', description: 'Hỏa diễm thiên đỉnh, thiêu rụi pháp bảo Hoàng cấp.' },
    { name: 'Tử Tinh Thiết', category: 'Nguyên liệu', rarity: 'Cực Phẩm', description: 'Tinh thiết tím cấp Tôn, luyện vũ khí thượng phẩm.' },
    { name: 'Bảo Mệnh Hoàn', category: 'Tín vật', rarity: 'Hiếm', description: 'Vòng bảo mệnh, đỡ một đòn chí mạng.' },
    { name: 'Phong Vân Quyết Bí Kíp', category: 'Công pháp', rarity: 'Cực Phẩm', description: 'Bí kíp Sở gia trấn gia, tu phong vân chi lực.' },
  ],

  signatureSkills: [
    { name: 'Cửu Long Thôn Thiên Quyết', kind: 'adventure', rarity: 'Huyền Thoại', description: 'Bí pháp nuốt thiên, hấp thu nguyên lực vũ trụ, do 9 hồn long truyền.' },
    { name: 'Sát Thần Quyết', kind: 'combat_ultimate', rarity: 'Cực Phẩm', description: 'Quyết sát thần, mỗi đòn thấm khí sát.' },
    { name: 'Phong Vân Chưởng', kind: 'combat_basic', rarity: 'Hiếm', description: 'Chưởng pháp Sở gia, mượn phong vân chi lực.' },
    { name: 'Lôi Đình Đệ Cửu Kích', kind: 'combat_ultimate', rarity: 'Siêu Phẩm', description: '9 kích lôi đình, mỗi kích mạnh gấp đôi trước.' },
    { name: 'Hắc Long Triền Thân', kind: 'combat_basic', rarity: 'Tốt', description: 'Hắc long quấn thân, phòng ngự + phản kích.' },
  ],

  signatureBeasts: [
    { name: 'Cổ Long Tổ Tông', rarity: 'Huyền Thoại', kind: 'dragon', description: 'Long tổ cổ, ngụ trong Cửu Long Châu.', basePower: 2500 },
    { name: 'Hắc Phong Lang Vương', rarity: 'Cực Phẩm', kind: 'beast', description: 'Lang vương Hắc Phong Trại.', basePower: 400 },
    { name: 'Diễm Phượng Linh', rarity: 'Siêu Phẩm', kind: 'phoenix', description: 'Phượng linh lửa cấp Hoàng.', basePower: 900 },
    { name: 'Tinh Lang Tinh Bộ', rarity: 'Hiếm', kind: 'beast', description: 'Lang tinh cấp Tiềm Nguyên.', basePower: 180 },
  ],

  signatureLocations: [
    { name: 'Phong Vân thành', category: 'Đô thị', description: 'Thành lớn Sở gia trú ngụ, đông đảo võ sĩ.' },
    { name: 'Phụng Vũ Cốc', category: 'Sect HQ', description: 'Cốc tiên cảnh, nơi tu chân.' },
    { name: 'Thanh Châu', category: 'Đại lục', description: 'Châu Sở Phong xuất thân, có nhiều tông môn vừa.' },
    { name: 'Diễm Hỏa Đế Đô', category: 'Đô thị lớn', description: 'Kinh đô Diễm Hỏa Đế Triều, hoành tráng.' },
  ],

  terminology: [
    { term: 'Nguyên Sĩ', kind: 'realm_term', explanation: 'Cảnh giới sơ cấp, khai mở 36 nguyên đan trong thân.' },
    { term: 'Hỗn Nguyên', kind: 'realm_term', explanation: 'Hợp nhất nguyên lực, đột phá phân giới quan trọng.' },
    { term: 'Hoàng Cảnh', kind: 'realm_term', explanation: 'Đạt cảnh giới Hoàng cấp, mỗi châu chỉ vài người.' },
    { term: 'Cửu Long Quyết', kind: 'other', explanation: '9 hồn long truyền pháp, gốc thiên hạ vô địch.' },
    { term: 'Nguyên Tinh Thạch', kind: 'item_category', explanation: 'Đá tinh chứa nguyên lực, tiền tệ + nhiên liệu.' },
    { term: 'Tôn Cảnh', kind: 'realm_term', explanation: 'Cảnh giới Tôn, vượt qua Hoàng, ít người đạt.' },
  ],

  popularCharacters: [
    { name: 'Sở Phong', description: 'Nhân vật chính — hồn nhập trỗi dậy.' },
    { name: 'Mộ Dung Y', description: 'Đạo lữ chính.' },
  ],

  newbornBackstoryHints: [
    'Đệ tử ngoại Sở gia, không có máu chính tông.',
    'Mạo hiểm gia trẻ tuổi Thanh Châu, săn linh thú kiếm sống.',
    'Cô nhi Phong Vân thành được Sở Tử Hàn nhận làm đệ tử.',
  ],
};
