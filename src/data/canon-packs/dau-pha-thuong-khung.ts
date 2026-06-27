import type { CanonPack } from '@gametypes/canon-pack';

export const dauPhaThuongKhung: CanonPack = {
  id: 'dau-pha-thuong-khung',
  title: 'Đấu Phá Thương Khung',
  altTitles: ['Battle Through the Heavens', 'BTTH', '斗破苍穹'],
  author: 'Thiên Tằm Thổ Đậu',
  description:
    'Tiêu Viêm — thiên tài ngộ tu trở thành phế vật, gặp Dược Lão truyền thừa, từ Đấu Khí leo đến Đấu Đế. Phong cách shounen điển hình + lò luyện đan dược.',
  themes: ['Huyền huyễn', 'Dị hỏa', 'Đan sư'],
  currencyName: 'Lượng (vàng)',

  cosmology: {
    realmList: [
      'Đấu Khí (9 cấp)', 'Đấu Sư', 'Đại Đấu Sư', 'Đấu Linh', 'Đấu Vương',
      'Đấu Hoàng', 'Đấu Tông', 'Đấu Tôn', 'Đấu Thánh', 'Đấu Đế',
    ],
    description:
      'Đấu Khí làm nền tảng, tu luyện qua bí pháp + đấu kỹ. Đấu Đế là đỉnh cao truyền thuyết. Đan sư phân Nhất Phẩm → Cửu Phẩm, ngang hàng quan trọng với chiến lực.',
  },

  defaultStartingLocation: 'Ô Đàm thành (Tiêu gia)',
  defaultStartingTechnique: 'Phần Quyết',

  signatureNpcs: [
    { name: 'Tiêu Viêm', role: 'Nhân vật chính', description: 'Thiếu niên Tiêu gia, ban đầu mất Đấu Khí, gặp Dược Lão truyền thừa nên trỗi dậy.' },
    { name: 'Dược Lão (Dược Trần)', role: 'Sư phụ + Đan vương', description: 'Linh hồn Đan vương cổ ngụ trong nhẫn linh hồn Tiêu Viêm, dạy đan thuật.' },
    { name: 'Tiêu Huân Nhi', role: 'Em gái nuôi', description: 'Cô gái Cổ tộc nhỏ tuổi, em gái nuôi Tiêu Viêm, cực kỳ thiên tài.' },
    { name: 'Tiêu Y', role: 'Đạo lữ chính', description: 'Hôn thê Tiêu Viêm từ nhỏ, Vân Lam tông tiểu thư, thiên tài Đấu Vương.' },
    { name: 'Nạp Lan Yên Nhiên', role: 'Hôn ước cũ', description: 'Nạp Lan gia tiểu thư, ban đầu hủy hôn với Tiêu Viêm, sau hối hận.' },
    { name: 'Hải Ba Đông', role: 'Bằng hữu + đối thủ', description: 'Thiên tài Hồ Đảo, đồng môn + đối thủ cạnh tranh.' },
    { name: 'Lâm Hi Nhi', role: 'Bằng hữu', description: 'Đại tiểu thư Lâm gia, song tu đối tượng tiềm năng.' },
  ],

  signatureSects: [
    { name: 'Mộc Hoàng Học Viện', alignment: 'chinh', description: 'Học viện Đấu Khí nổi tiếng nhất Gia Mã đế quốc.' },
    { name: 'Tinh Vẫn Đại Lục Học Viện', alignment: 'chinh', description: 'Học viện lớn nhất Trung Châu, sản sinh nhiều thiên tài.' },
    { name: 'Vạn Dược Tông', alignment: 'chinh', description: 'Tông môn đan sư đỉnh cao, có nhiều cao nhân Đan Tôn.' },
    { name: 'Hồn Điện', alignment: 'ma', description: 'Tổ chức thu thập linh hồn dị nhân, đối thủ chính của Tiêu Viêm.' },
    { name: 'Vân Lam Tông', alignment: 'chinh', description: 'Tông môn của Tiêu Y, đỉnh cao Gia Mã đế quốc.' },
    { name: 'Cổ Tộc', alignment: 'an', description: 'Một trong tám tộc cổ, hậu duệ thượng cổ thần long.' },
  ],

  signatureItems: [
    { name: 'Phật Nộ Hỏa Liên', category: 'Dị bảo', rarity: 'Huyền Thoại', description: 'Dị hỏa cấp 19 mạnh nhất, hoa sen Phật nộ thiêu rụi vạn vật.' },
    { name: 'Tử Vẫn Thiên Hỏa', category: 'Dị bảo', rarity: 'Siêu Phẩm', description: 'Dị hỏa cấp 11, lửa thiên giáng thuần khiết.' },
    { name: 'Tinh Hà Vẫn Thiết', category: 'Nguyên liệu', rarity: 'Cực Phẩm', description: 'Sắt vẫn thạch hạng nặng, luyện vũ khí thượng phẩm.' },
    { name: 'Cốt Linh Lãnh Hỏa', category: 'Dị bảo', rarity: 'Cực Phẩm', description: 'Dị hỏa cấp 23, lạnh đến mức đông cứng đấu khí.' },
    { name: 'Cửu Phẩm Bảo Đan', category: 'Đan dược', rarity: 'Huyền Thoại', description: 'Đan dược cấp cao nhất, mỗi viên hồn phách thành hình.' },
  ],

  signatureSkills: [
    { name: 'Phần Quyết', kind: 'adventure', rarity: 'Huyền Thoại', description: 'Bí pháp thiêu hủy nuốt thiên hỏa, do Tiêu Viêm tu luyện chính.' },
    { name: 'Bát Cực Băng Thiên Quyết', kind: 'combat_basic', rarity: 'Cực Phẩm', description: 'Bí pháp băng thuộc tính cấp huyền giai.' },
    { name: 'Đại Thiên Hỏa Quyết', kind: 'combat_ultimate', rarity: 'Siêu Phẩm', description: 'Bí pháp hỏa thuộc tính cấp địa giai, hợp với Phần Quyết.' },
    { name: 'Vô Phong Trảm', kind: 'combat_basic', rarity: 'Hiếm', description: 'Đấu kỹ cấp huyền giai, kiếm khí vô hình.' },
    { name: 'Tiêu Sa Quyết', kind: 'combat_ultimate', rarity: 'Cực Phẩm', description: 'Đấu kỹ thượng cấp địa giai, sa khí tiêu diệt vạn vật.' },
  ],

  signatureBeasts: [
    { name: 'Hỏa Vân Hậu', rarity: 'Huyền Thoại', kind: 'mystical', description: 'Thượng cổ ma thú, kiểm soát hỏa thiên đạo.', basePower: 1800 },
    { name: 'Diên Linh', rarity: 'Cực Phẩm', kind: 'spirit', description: 'Linh thú khói, lẩn quẩn trong dị hỏa.', basePower: 500 },
    { name: 'Tiểu Y Tiên', rarity: 'Siêu Phẩm', kind: 'mystical', description: 'Y vương ma thú thân cận Tiêu Viêm.', basePower: 800 },
    { name: 'Lôi Đế Tinh Long', rarity: 'Huyền Thoại', kind: 'dragon', description: 'Long cổ Lôi Đế tộc, có lực hủy diệt.', basePower: 1500 },
  ],

  signatureLocations: [
    { name: 'Ô Đàm thành', category: 'Đô thị', description: 'Thành nhỏ Gia Mã đế quốc, nơi Tiêu Viêm sinh trưởng.' },
    { name: 'Gia Mã đế quốc', category: 'Quốc gia', description: 'Đế quốc phàm tục, có Mộc Hoàng Học Viện.' },
    { name: 'Trung Châu', category: 'Đại lục', description: 'Trung tâm Đấu Khí đại lục, tinh hoa cao nhân tu sĩ.' },
    { name: 'Tử Tinh Đại Lục', category: 'Đại lục', description: 'Lục địa cổ đại bị phá hủy, vùng tu chân tối thượng.' },
  ],

  terminology: [
    { term: 'Đấu Khí', kind: 'other', explanation: 'Năng lượng chiến đấu thay vì linh khí, hệ thống đặc thù DPTK.' },
    { term: 'Dị Hỏa', kind: 'item_category', explanation: 'Lửa thiên địa cấp cao, đứng thứ trong "dị hỏa bảng" của Dược Lão.' },
    { term: 'Đan Sư', kind: 'other', explanation: 'Nghề luyện đan dược, cấp Nhất Phẩm → Cửu Phẩm, địa vị cao.' },
    { term: 'Bí Pháp', kind: 'other', explanation: 'Công pháp tu luyện cấp Hoàng/Huyền/Địa/Thiên, ảnh hưởng tốc độ tu luyện.' },
    { term: 'Đấu Kỹ', kind: 'other', explanation: 'Chiêu thức chiến đấu phân Hoàng/Huyền/Địa/Thiên giai.' },
    { term: 'Trợn Khí Hóa Cánh', kind: 'realm_term', explanation: 'Đấu Hoàng cảnh đạt được, có thể bay bằng đấu khí cánh.' },
  ],

  popularCharacters: [
    { name: 'Tiêu Viêm', description: 'Nhân vật chính — phế vật trỗi dậy thành Đấu Đế.' },
    { name: 'Tiêu Huân Nhi', description: 'Em gái Cổ tộc thiên tài.' },
    { name: 'Tiêu Y', description: 'Hôn thê + đạo lữ chính.' },
  ],

  newbornBackstoryHints: [
    'Đệ tử ngoại môn Mộc Hoàng Học Viện, tài chất thường thường.',
    'Người bộ tộc nhỏ vùng biên cương Gia Mã, vô tình thu được đan phương cổ.',
    'Đan sư học việc, nhặt được di vật Đan Vương cấp.',
  ],
};
