import type { CanonPack } from '@gametypes/canon-pack';

export const deBa: CanonPack = {
  id: 'de-ba',
  title: 'Đế Bá',
  altTitles: ['Emperor\'s Domination', '帝霸'],
  author: 'Yếm Bút Tiêu Sinh',
  description:
    'Lý Thất Dạ — Tiên Đế chuyển thế chín lần, mỗi đời học pháp môn riêng. Trỗi dậy ở thời mạt vận tu sĩ, hồi sinh các thế hệ vẫn yêu mến.',
  themes: ['Huyền huyễn', 'Cổ phong', 'Bất tử'],
  currencyName: 'Tinh Thần (đá nguyên thạch)',

  cosmology: {
    realmList: [
      'Cửu Hoành Cảnh (9 cấp)', 'Long Môn Cảnh', 'Tử Vong Cảnh', 'Phi Long Cảnh',
      'Thông Thiên Cảnh', 'Hoàng Cảnh', 'Khải Tử Cảnh', 'Tiên Vương Cảnh', 'Tiên Đế Cảnh',
    ],
    description:
      'Cảnh giới phân biệt rõ rệt giữa Nhân Hoàng + Tiên Hoàng. Tu sĩ Tiên Đế cảnh có thể tồn tại vượt thời gian. Mạt vận tu sĩ: tài nguyên kiệt quệ, đỉnh cao chỉ Hoàng Cảnh.',
  },

  defaultStartingLocation: 'Tinh Thần phái (Tinh Thần lâu)',
  defaultStartingTechnique: 'Tiên Hoàng Pháp',

  signatureNpcs: [
    { name: 'Lý Thất Dạ', role: 'Nhân vật chính', description: 'Tiên Đế chuyển thế, ngụy trang đệ tử Tinh Thần phái, sống lại từ vực sâu hỗn loạn.' },
    { name: 'Lâm Hâm', role: 'Đại tỷ + đạo lữ', description: 'Đại tiểu thư Tinh Thần phái, người đầu tiên nhận ra giá trị Lý Thất Dạ.' },
    { name: 'Tiên Long Hoàng Phi', role: 'Vị hôn thê', description: 'Hậu duệ Tiên Long tộc, hôn ước từ cổ đại với Lý Thất Dạ.' },
    { name: 'Vũ Đông Lưu', role: 'Đệ tử + bằng hữu', description: 'Đệ tử Tinh Thần phái, sau theo Lý Thất Dạ.' },
    { name: 'Mai Nghi Nguyệt', role: 'Đại nhân vật + tri kỷ', description: 'Cao nhân nữ Tiên Đế cảnh, một trong những đạo lữ cổ của Lý Thất Dạ.' },
    { name: 'Lý Cao', role: 'Hậu duệ + đệ tử', description: 'Hậu duệ dòng máu Lý Thất Dạ ở mạt thế, được sư tổ quay về truyền pháp.' },
  ],

  signatureSects: [
    { name: 'Tinh Thần phái', alignment: 'chinh', description: 'Tông môn nhỏ mạt vận, do tiền thân Lý Thất Dạ sáng lập, sau suy thoái.' },
    { name: 'Tiên Long Tộc', alignment: 'an', description: 'Cổ tộc Long Tiên, hậu duệ thần long thượng cổ.' },
    { name: 'Vạn Cổ Đan Đỉnh', alignment: 'chinh', description: 'Đan tông cổ đại, mạt vận chỉ còn truyền nhân yếu.' },
    { name: 'Lưu Vô Tận', alignment: 'ma', description: 'Tổ chức ma đạo cổ, đối thủ qua nhiều thế hệ.' },
    { name: 'Thiên Long Thái Tử Đoàn', alignment: 'chinh', description: 'Đoàn quân tinh nhuệ Tiên Long, có Thái Tử cấp Hoàng Cảnh.' },
  ],

  signatureItems: [
    { name: 'Cửu Tinh Thần Đỉnh', category: 'Pháp bảo', rarity: 'Huyền Thoại', description: 'Đỉnh luyện đan của 9 tinh thần, do Lý Thất Dạ chế tạo ở đời trước.' },
    { name: 'Thần Hồn Hỏa', category: 'Dị bảo', rarity: 'Siêu Phẩm', description: 'Hỏa nguyên thần linh hồn, vũ khí tinh thần tối thượng.' },
    { name: 'Hoàng Long Đại Đan', category: 'Đan dược', rarity: 'Huyền Thoại', description: 'Đan dược truyền thuyết, ăn vào tăng tu vi 1 cảnh giới.' },
    { name: 'Cổ Tiên Kiếm', category: 'Vũ khí', rarity: 'Cực Phẩm', description: 'Kiếm cổ thời Tiên Đế, ngụy trang dưới hình sắt rỉ.' },
    { name: 'Thiên Đế Bộ', category: 'Trang phục', rarity: 'Huyền Thoại', description: 'Y phục cổ Tiên Đế, hộ thể vô địch.' },
  ],

  signatureSkills: [
    { name: 'Cửu Hắc Bộ', kind: 'adventure', rarity: 'Huyền Thoại', description: 'Bí pháp di chuyển 9 bước hắc đạo, nhanh vượt thời gian.' },
    { name: 'Tiểu Thiên Long Tượng Quyền', kind: 'combat_ultimate', rarity: 'Cực Phẩm', description: 'Quyền pháp Long tộc, lực nặng như thiên long.' },
    { name: 'Tiên Hoàng Pháp', kind: 'combat_ultimate', rarity: 'Huyền Thoại', description: 'Bí pháp Tiên Hoàng cảnh, thâm áo khôn lường.' },
    { name: 'Hắc Long Liệt Hỏa Tướng', kind: 'combat_ultimate', rarity: 'Siêu Phẩm', description: 'Triệu hồi hắc long phun lửa hủy diệt.' },
    { name: 'Cửu Chuyển Đan Phương', kind: 'adventure', rarity: 'Huyền Thoại', description: 'Đan phương 9 chuyển, luyện đan tột đỉnh.' },
  ],

  signatureBeasts: [
    { name: 'Tiên Long Hậu Duệ', rarity: 'Huyền Thoại', kind: 'dragon', description: 'Tiên Long nhân hình, có thể biến long thật.', basePower: 2200 },
    { name: 'Cửu U Yêu Yến', rarity: 'Siêu Phẩm', kind: 'phoenix', description: 'Phượng U Yêu cấp Long Môn cảnh, lông đen.', basePower: 1000 },
    { name: 'Hỏa Vũ Lang', rarity: 'Cực Phẩm', kind: 'beast', description: 'Lang vương lửa, săn bầy theo đàn.', basePower: 400 },
    { name: 'Tinh Thần Quái', rarity: 'Hiếm', kind: 'spirit', description: 'Quái nguyên thạch, ẩn cư núi cao.', basePower: 200 },
  ],

  signatureLocations: [
    { name: 'Tinh Thần phái', category: 'Sect HQ', description: 'Sơn môn tông phái nhỏ, mạt vận khôi phục dần.' },
    { name: 'Hoang Vực', category: 'Vùng hoang dã', description: 'Vùng mạt vận tu sĩ, đầy bí cảnh + di tích cổ.' },
    { name: 'Tử Vong Cảnh thâm uyên', category: 'Bí cảnh', description: 'Vực sâu chứa khí Tử Vong cảnh, nơi Lý Thất Dạ phục sinh.' },
    { name: 'Cổ Đại Chiến Trường', category: 'Cổ chiến trường', description: 'Tàn tích chiến tranh Tiên Hoàng thượng cổ.' },
  ],

  terminology: [
    { term: 'Mạt Vận', kind: 'other', explanation: 'Thời đại tu sĩ suy thoái, tài nguyên cạn kiệt — bối cảnh hiện tại.' },
    { term: 'Tinh Thần', kind: 'item_category', explanation: 'Đá nguyên thạch chứa tinh khí, tiền tệ + nhiên liệu chính.' },
    { term: 'Cửu Hoành Cảnh', kind: 'realm_term', explanation: 'Cảnh giới khởi nguồn, 9 cấp tu Cửu Hoành tinh khí.' },
    { term: 'Long Môn', kind: 'realm_term', explanation: 'Cảnh giới "cá chép vượt long môn", phân giới quan trọng.' },
    { term: 'Tiên Đế', kind: 'realm_term', explanation: 'Đỉnh cao truyền thuyết, một thời đại chỉ có vài người.' },
    { term: 'Đệ Nhị Sát Long', kind: 'other', explanation: 'Lý Thất Dạ biệt danh — kẻ giết long thứ hai trong lịch sử.' },
  ],

  popularCharacters: [
    { name: 'Lý Thất Dạ', description: 'Nhân vật chính — Tiên Đế chuyển thế.' },
    { name: 'Lâm Hâm', description: 'Đại tỷ + đạo lữ Tinh Thần phái.' },
  ],

  newbornBackstoryHints: [
    'Đệ tử ngoại môn Tinh Thần phái mạt vận, không biết Lý Thất Dạ là sư tổ thật sự.',
    'Khách lữ hành đến Hoang Vực, vô tình tìm thấy di tích Tiên Đế.',
    'Hậu duệ Tiên Long tộc sa cơ, mơ phục hưng vinh quang cổ.',
  ],
};
