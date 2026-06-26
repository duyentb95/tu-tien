import type { CanonPack } from '@gametypes/canon-pack';

export const giaThien: CanonPack = {
  id: 'gia-thien',
  title: 'Già Thiên',
  altTitles: ['Shrouding the Heavens', 'Zhe Tian', '遮天'],
  author: 'Thần Đông',
  description:
    'Diệp Phàm — học sinh trẻ chết khi du lịch Thái Sơn, sống lại trong vũ trụ tu chân huyền bí. Lữ Sơn cảnh giới + cảnh sắc thi pháp hùng vĩ, một trong tứ đại huyền huyễn Thần Đông.',
  themes: ['Huyền huyễn', 'Cổ điển', 'Vũ trụ tu chân'],
  currencyName: 'Nguyên Tinh',

  cosmology: {
    realmList: [
      'Luân Hải (4 cảnh)', 'Đạo Cung (9 trọng)', 'Tứ Cực', 'Hóa Long',
      'Tiên Đài (3 cảnh)', 'Chuẩn Đế (Cửu trùng)', 'Đại Đế', 'Hồng Trần Tiên',
    ],
    description:
      'Luân Hải mở 4 vạch khổ hải, Đạo Cung tu 9 trọng cung, Tứ Cực kết bí cảnh. Chuẩn Đế = bất tử. Đại Đế = mỗi thời đại chỉ một người.',
  },

  defaultStartingLocation: 'Đông Hoang (Hoang Trủng)',

  signatureNpcs: [
    { name: 'Diệp Phàm', role: 'Nhân vật chính', description: 'Học sinh hiện đại chết lúc du lịch Thái Sơn, sống lại trên thi quan đồng cổ, tu thành Đại Đế.' },
    { name: 'Bàng Bác', role: 'Bằng hữu cốt lõi', description: 'Bạn thân của Diệp Phàm, lực sĩ trên thi quan đồng, trung thành cứng cỏi.' },
    { name: 'Lý Hắc Thủy', role: 'Bằng hữu + nữ tử', description: 'Cô gái cùng đoàn Thái Sơn, sau chuyển sang vũ trụ tu chân.' },
    { name: 'Khương Thái Hư', role: 'Tiền bối + đối thủ', description: 'Hậu duệ Khương gia, thiên tài cùng thời cạnh tranh.' },
    { name: 'Trương Bạch Y', role: 'Bằng hữu + Thái Cực Cung', description: 'Cao thủ Thái Cực Cung, thân cận Diệp Phàm.' },
    { name: 'Vũ Hoa', role: 'Tri kỷ + đạo lữ', description: 'Tiên nữ Vũ Hoa thị, có duyên với Diệp Phàm qua nhiều thời đại.' },
    { name: 'Tiểu Tịch', role: 'Em gái', description: 'Em họ Diệp Phàm, bị Diệp Phàm bảo vệ cứu sống.' },
  ],

  signatureSects: [
    { name: 'Đông Hoang Đoạn Tộc', alignment: 'an', description: 'Tộc cổ ẩn cư Đông Hoang, hậu duệ thượng cổ Đại Đế.' },
    { name: 'Thần Triều Đông Hoang', alignment: 'chinh', description: 'Đại triều Đông Hoang, có cao nhân Chuẩn Đế.' },
    { name: 'Lăng Vân Tông', alignment: 'chinh', description: 'Tông môn lớn vùng Tinh Vực, nhiều thiên tài.' },
    { name: 'Thần Khư', alignment: 'an', description: 'Cấm địa cổ + sect không tên, ẩn náu nhiều cao nhân.' },
    { name: 'Vũ Hoa thị', alignment: 'chinh', description: 'Đại tộc nhân long, sản sinh tiên nữ qua nhiều thời.' },
  ],

  signatureItems: [
    { name: 'Tiên Kim', category: 'Nguyên liệu', rarity: 'Huyền Thoại', description: 'Kim loại thượng cổ, hấp thụ tiên khí, vô địch chế tạo tiên khí.' },
    { name: 'Linh Hư Kính', category: 'Pháp bảo', rarity: 'Cực Phẩm', description: 'Gương soi linh hư, phá vọng tưởng + huyễn cảnh.' },
    { name: 'Đại La Đại Cát Đại Khôi Lỗi', category: 'Pháp bảo', rarity: 'Huyền Thoại', description: 'Khôi lỗi cổ Đại La cấp, do Đại Đế chế tạo.' },
    { name: 'Thi Hồn Hỏa', category: 'Dị bảo', rarity: 'Siêu Phẩm', description: 'Hỏa hồn linh từ thi quan, thiêu hồn phách địch.' },
    { name: 'Bồ Đề Cổ Cây', category: 'Linh dược', rarity: 'Huyền Thoại', description: 'Cây Bồ Đề cổ, ngộ đạo cảnh Hóa Long.' },
  ],

  signatureSkills: [
    { name: 'Bồ Đề Cổ Pháp', kind: 'adventure', rarity: 'Huyền Thoại', description: 'Bí pháp Bồ Đề tổ thượng, gia trì ngộ đạo + thiền định.' },
    { name: 'Hắc Hoàng Đả Pháp', kind: 'combat_basic', rarity: 'Hiếm', description: 'Quyền pháp đá khắc đến thuộc Bàng Bác, phá chướng ngại.' },
    { name: 'Lục Đạo Luân Hồi Quyền', kind: 'combat_ultimate', rarity: 'Huyền Thoại', description: 'Quyền pháp 6 đạo luân hồi, kéo địch về niết bàn.' },
    { name: 'Tiên Hỏa Tự Quyết', kind: 'combat_ultimate', rarity: 'Cực Phẩm', description: 'Bí pháp khống chế tiên hỏa, vũ khí Diệp Phàm.' },
    { name: 'Đạo Cung Cửu Trọng', kind: 'adventure', rarity: 'Siêu Phẩm', description: 'Pháp môn tu Đạo Cung 9 trọng, mở rộng nội cảnh.' },
  ],

  signatureBeasts: [
    { name: 'Kim Sí Đại Bằng', rarity: 'Huyền Thoại', kind: 'phoenix', description: 'Đại bằng cánh vàng thượng cổ, tốc độ vô địch.', basePower: 2500 },
    { name: 'Chân Long Cổ Loài', rarity: 'Huyền Thoại', kind: 'dragon', description: 'Chân long cổ, một con thôn cả thế giới.', basePower: 3000 },
    { name: 'Hoàng Tuyền Quỷ Tướng', rarity: 'Siêu Phẩm', kind: 'spirit', description: 'Quỷ tướng Hoàng Tuyền, thi quan đồng triệu hồi.', basePower: 1100 },
    { name: 'Thiết Phong Linh', rarity: 'Cực Phẩm', kind: 'beast', description: 'Tinh thú vảy sắt, phòng ngự vô địch.', basePower: 500 },
  ],

  signatureLocations: [
    { name: 'Đông Hoang', category: 'Đại lục', description: 'Vùng đất Đông Hoang, mở đầu hành trình Diệp Phàm.' },
    { name: 'Bắc Nguyên', category: 'Đại lục', description: 'Vùng băng nguyên phía Bắc, lạnh + nhiều cấm địa.' },
    { name: 'Tinh Vực', category: 'Vũ trụ', description: 'Không gian giữa sao, tu sĩ cao cấp di chuyển bằng phi thuyền.' },
    { name: 'Thần Khư', category: 'Cấm địa', description: 'Cấm địa cổ tổ, có di vật Đại Đế.' },
  ],

  terminology: [
    { term: 'Luân Hải', kind: 'realm_term', explanation: 'Cảnh giới khởi đầu, mở 4 vạch khổ hải trong thân thể.' },
    { term: 'Đạo Cung', kind: 'realm_term', explanation: '9 trọng cung tu luyện, tăng tinh hoa thân thể + thần thức.' },
    { term: 'Tứ Cực', kind: 'realm_term', explanation: 'Bí cảnh 4 cực, đạt thân thể bất tử.' },
    { term: 'Hóa Long', kind: 'realm_term', explanation: 'Cá vượt long môn, đạt thân thể hậu thiên long.' },
    { term: 'Chuẩn Đế', kind: 'realm_term', explanation: 'Cảnh giới bất tử, một thời đại chỉ vài người, 9 trọng.' },
    { term: 'Hoang Cổ', kind: 'time_unit', explanation: 'Thời đại hoang cổ — bối cảnh truyền thuyết các Đại Đế.' },
    { term: 'Thi Quan Đồng', kind: 'other', explanation: 'Quan tài đồng cổ, mở đầu hành trình tu chân Diệp Phàm.' },
  ],

  popularCharacters: [
    { name: 'Diệp Phàm', description: 'Nhân vật chính — sinh viên hiện đại sống lại trong vũ trụ tu chân.' },
    { name: 'Bàng Bác', description: 'Bằng hữu cốt lõi, lực sĩ trên thi quan đồng.' },
  ],

  newbornBackstoryHints: [
    'Người trẻ Đông Hoang ngộ đạo trên di tích thần triều cổ.',
    'Đệ tử Lăng Vân Tông, gia nhập đoàn khám phá Thần Khư.',
    'Hậu duệ Đoạn Tộc trỗi dậy, tìm di vật tổ.',
  ],
};
