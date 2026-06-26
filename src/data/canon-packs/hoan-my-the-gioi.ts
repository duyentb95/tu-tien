import type { CanonPack } from '@gametypes/canon-pack';

export const hoanMyTheGioi: CanonPack = {
  id: 'hoan-my-the-gioi',
  title: 'Hoàn Mỹ Thế Giới',
  altTitles: ['Perfect World', '完美世界'],
  author: 'Thần Đông',
  description:
    'Thạch Hạo — thiếu niên Thạch Thôn, tu Bồ Đề Đạo, trỗi dậy giữa thời đại Bất Tử Sơn ẩn cư + chiến tranh thần thoại. Tiếp nối Già Thiên trong dòng "Tứ Đại Huyền Huyễn" Thần Đông.',
  themes: ['Huyền huyễn', 'Cổ điển', 'Thần thoại'],
  currencyName: 'Nguyên Tinh',

  cosmology: {
    realmList: [
      'Tịnh Lực', 'Pháp Tướng', 'Đạo Cung (9 trọng)', 'Lục Đỉnh',
      'Hỏa Phán Đại Phụ', 'Thần Cao', 'Đại Năng', 'Chuẩn Tiên',
      'Tiên Vương', 'Tiên Đế',
    ],
    description:
      'Tu chân từ Tịnh Lực rèn thân, lên Đại Năng giáp ranh Tiên. Tiên Đế là đỉnh cao truyền thuyết. Có cảnh giới Bất Tử ẩn trên Bất Tử Sơn.',
  },

  defaultStartingLocation: 'Thạch Thôn (bộ lạc cổ Hoang Cảnh)',

  signatureNpcs: [
    { name: 'Thạch Hạo', role: 'Nhân vật chính', description: 'Thiếu niên Thạch Thôn, tu Bồ Đề Đạo, sức mạnh khôn lường + tính tình hùng tâm.' },
    { name: 'Vân Hi', role: 'Đạo lữ chính', description: 'Tiên nữ Vân tộc, tình cảm sâu nặng với Thạch Hạo, mỹ lệ trác tuyệt.' },
    { name: 'Hằng Ngọc Vũ', role: 'Tri kỷ', description: 'Đại tiểu thư cổ tộc, đồng hành nhiều thử thách.' },
    { name: 'Tiểu Bạch Long', role: 'Linh thú + bằng hữu', description: 'Long con nhỏ, thân cận Thạch Hạo từ thời niên thiếu.' },
    { name: 'Mộc Thanh Loan', role: 'Tri kỷ + nữ thần', description: 'Nữ thần Mộc tộc, có tình cảm với Thạch Hạo.' },
    { name: 'Bất Tử Thiên Tôn', role: 'Tiền bối', description: 'Cao nhân Bất Tử Sơn, hướng dẫn Thạch Hạo.' },
  ],

  signatureSects: [
    { name: 'Thạch Thôn', alignment: 'trung', description: 'Bộ lạc nhỏ Hoang Cảnh, hậu duệ chiến binh cổ.' },
    { name: 'Bất Tử Sơn', alignment: 'an', description: 'Sơn môn cổ ẩn cư, chứa cao nhân Bất Tử cấp.' },
    { name: 'Cổ Đại Hoang Cảnh các bộ lạc', alignment: 'trung', description: 'Liên minh các bộ lạc cổ Hoang Cảnh.' },
    { name: 'Vân tộc', alignment: 'chinh', description: 'Cổ tộc Vân, sản sinh nhiều tiên nữ.' },
    { name: 'Yêu tộc Liên Minh', alignment: 'trung', description: 'Liên minh yêu tộc thượng cổ, đối lập nhân tộc.' },
  ],

  signatureItems: [
    { name: 'Bất Tử Thánh Tích', category: 'Pháp bảo', rarity: 'Huyền Thoại', description: 'Thánh tích Bất Tử Sơn, chứa truyền thừa cổ.' },
    { name: 'Hoàng Đế Bộ', category: 'Trang phục', rarity: 'Siêu Phẩm', description: 'Y phục hoàng đế cổ, hộ thể tuyệt vời.' },
    { name: 'Nhật Nguyệt Thực Linh Mễ', category: 'Linh dược', rarity: 'Cực Phẩm', description: 'Gạo linh tinh hoa nhật nguyệt, ăn vào tăng tiến tu vi.' },
    { name: 'Bồ Đề Tử', category: 'Linh dược', rarity: 'Huyền Thoại', description: 'Hạt Bồ Đề cổ, gốc của Bồ Đề Đạo.' },
    { name: 'Long Văn Hắc Kim Trụ', category: 'Vũ khí', rarity: 'Huyền Thoại', description: 'Cột hắc kim khắc văn long, vũ khí Thạch Hạo.' },
  ],

  signatureSkills: [
    { name: 'Bồ Đề Đạo', kind: 'adventure', rarity: 'Huyền Thoại', description: 'Đạo pháp Bồ Đề thượng cổ, tu cả thân + tâm.' },
    { name: 'Lục Vân Đỉnh', kind: 'combat_ultimate', rarity: 'Cực Phẩm', description: 'Đỉnh lục vân, áp chế địch trong vạn dặm.' },
    { name: 'Tiểu Vũ Vương Thần Quyền', kind: 'combat_basic', rarity: 'Hiếm', description: 'Quyền pháp Vũ Vương cổ, mạnh mẽ nhanh nhẹn.' },
    { name: 'Đại La Kiếm Phái', kind: 'combat_ultimate', rarity: 'Huyền Thoại', description: 'Kiếm pháp Đại La, cắt đứt vạn vật.' },
    { name: 'Trường Sinh Khí Quyết', kind: 'adventure', rarity: 'Siêu Phẩm', description: 'Tu trường sinh khí, sống lâu hơn người.' },
  ],

  signatureBeasts: [
    { name: 'Tiểu Bạch Long', rarity: 'Huyền Thoại', kind: 'dragon', description: 'Long con thân cận Thạch Hạo.', basePower: 1800 },
    { name: 'Cổ Đại Hoang Thú', rarity: 'Siêu Phẩm', kind: 'beast', description: 'Hoang thú cổ Hoang Cảnh.', basePower: 900 },
    { name: 'Phượng Vũ Cổ', rarity: 'Cực Phẩm', kind: 'phoenix', description: 'Phượng vũ cổ, gốc của Phượng tộc.', basePower: 600 },
    { name: 'Yêu Tộc Đại Năng', rarity: 'Huyền Thoại', kind: 'mystical', description: 'Yêu tộc cấp Đại Năng.', basePower: 2000 },
  ],

  signatureLocations: [
    { name: 'Hoang Cảnh', category: 'Đại lục', description: 'Vùng đất hoang cổ, nhiều bộ lạc + linh khí.' },
    { name: 'Bất Tử Sơn', category: 'Cấm địa', description: 'Sơn cổ ẩn cư cao nhân Bất Tử cấp.' },
    { name: 'Đông Hoang', category: 'Đại lục', description: 'Đại lục Đông Hoang, tiếp nối Già Thiên.' },
    { name: 'Tiên Cảnh Cấm Khu', category: 'Bí cảnh', description: 'Cấm khu tiên cảnh cổ, nhiều bí mật.' },
  ],

  terminology: [
    { term: 'Tịnh Lực', kind: 'realm_term', explanation: 'Cảnh giới khởi đầu, rèn thân tinh khiết.' },
    { term: 'Đại Năng', kind: 'realm_term', explanation: 'Cảnh giới tiền tiên, sức mạnh khôn lường.' },
    { term: 'Bất Tử', kind: 'realm_term', explanation: 'Cảnh giới ẩn trên Bất Tử Sơn, gần như bất tử.' },
    { term: 'Hoang Cảnh', kind: 'territory', explanation: 'Vùng đất hoang cổ — bối cảnh khởi đầu.' },
    { term: 'Bồ Đề Đạo', kind: 'other', explanation: 'Đạo pháp Bồ Đề — gốc tu chân Thạch Hạo.' },
    { term: 'Nguyên Tinh', kind: 'item_category', explanation: 'Đá nguyên tinh, tiền tệ + nhiên liệu.' },
  ],

  popularCharacters: [
    { name: 'Thạch Hạo', description: 'Nhân vật chính.' },
    { name: 'Vân Hi', description: 'Đạo lữ chính tiên nữ Vân tộc.' },
  ],

  newbornBackstoryHints: [
    'Thiếu niên Thạch Thôn, mất cha mẹ trong loạn yêu tộc.',
    'Đệ tử Bất Tử Sơn ngoại môn, ngộ đạo nhanh.',
    'Hậu duệ Vân tộc bị lưu lạc, mơ tìm về gốc.',
  ],
};
