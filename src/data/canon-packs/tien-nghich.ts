import type { CanonPack } from '@gametypes/canon-pack';

export const tienNghich: CanonPack = {
  id: 'tien-nghich',
  title: 'Tiên Nghịch',
  altTitles: ['Xian Ni', 'Renegade Immortal', '仙逆'],
  author: 'Nhĩ Căn',
  description:
    'Vương Lâm — bình phàm thiếu niên Triệu Quốc, tu nghịch thiên đạo. Phong cách bi tráng, tu vi đi từ rễ thấp lên đỉnh, đầy hy sinh + lựa chọn nghiệt ngã.',
  themes: ['Tu chân', 'Bi tráng', 'Nghịch thiên'],
  currencyName: 'Linh Thạch',

  cosmology: {
    realmList: [
      'Ngưng Khí (15 tầng)', 'Trúc Cơ', 'Kết Đan', 'Nguyên Anh', 'Hóa Thần',
      'Vấn Đỉnh', 'Anh Biến', 'Không Hư', 'Tịch Diệt',
      'Đại Thừa', 'Độ Kiếp', 'Chân Tiên', 'Tiên Tôn', 'Tiên Đế',
    ],
    description:
      'Hệ cảnh giới tu chân kéo dài lên Tiên Đế. Tịch Diệt cảnh là phân giới quan trọng — diệt sạch nhân tính để đạt đại thừa. Đặc trưng cảnh giới Anh Biến — anh hoa biến hóa nhiều lần.',
  },

  defaultStartingLocation: 'Trương Nguyên thôn (Triệu quốc)',
  defaultStartingTechnique: 'Tị Linh Quyết',

  signatureNpcs: [
    { name: 'Vương Lâm', role: 'Nhân vật chính', description: 'Thiếu niên Triệu quốc, ban đầu tư chất tầm thường nhưng quyết tâm tu chân, dần đi đến đỉnh.' },
    { name: 'Lý Mộ Uyển', role: 'Đạo lữ + bi kịch', description: 'Đại tiểu thư Hằng Sơn phái, người Vương Lâm yêu thương — kết cục bi kịch.' },
    { name: 'Tổ Hồn Phù', role: 'Bí bảo + lão', description: 'Phù hộ thân chứa hồn tổ tiên Vương Lâm, có thể giao tiếp tư vấn.' },
    { name: 'Lý Mộ Tinh', role: 'Tiền bối', description: 'Tiền bối Hằng Sơn phái, sư tổ của Lý Mộ Uyển.' },
    { name: 'Đại Tu Sĩ', role: 'Đối thủ chính', description: 'Tu sĩ cấp Vấn Đỉnh đời trước, từng thử thách + truyền thừa.' },
    { name: 'Khúc Du', role: 'Bằng hữu', description: 'Đệ tử Hằng Sơn cùng thời, đồng hành Vương Lâm thời đầu.' },
  ],

  signatureSects: [
    { name: 'Hằng Sơn phái', alignment: 'chinh', description: 'Tông môn Vương Lâm gia nhập sau đột phá Trúc Cơ.' },
    { name: 'Thanh Lâm Tông', alignment: 'chinh', description: 'Tông môn lớn nhất Thanh Lâm vực, có sư tổ Hóa Thần.' },
    { name: 'Thiên Linh Tông', alignment: 'an', description: 'Tông môn cổ xưa, truyền thừa Vấn Đỉnh thần thông.' },
    { name: 'Triệu Quốc Hoàng Tộc', alignment: 'trung', description: 'Hoàng tộc phàm tục Triệu quốc — bối cảnh xuất thân Vương Lâm.' },
    { name: 'Tứ Ngụy Châu', alignment: 'ma', description: 'Ma đạo liên minh, đối địch với chính phái suốt nhiều ngàn năm.' },
  ],

  signatureItems: [
    { name: 'Linh Hồ Tổ Truyền', category: 'Pháp bảo', rarity: 'Cực Phẩm', description: 'Hồ rượu truyền đời Vương gia, chứa hồn tổ tiên + bí mật khôn lường.' },
    { name: 'Lưu Ly Cốt', category: 'Nguyên liệu', rarity: 'Siêu Phẩm', description: 'Xương lưu ly trong thân thể tu sĩ Anh Biến, cực kỳ quý giá.' },
    { name: 'Phong Linh Châu', category: 'Pháp bảo', rarity: 'Hiếm', description: 'Châu phong ấn linh hồn, dùng giam giữ địch.' },
    { name: 'Tiên Tôn Phù', category: 'Tín vật', rarity: 'Huyền Thoại', description: 'Phù lệnh của Tiên Tôn cảnh, biểu tượng quyền lực tối cao.' },
    { name: 'Tịch Diệt Khí', category: 'Nguyên liệu', rarity: 'Siêu Phẩm', description: 'Khí tịch diệt, vũ khí khắc chế sinh mệnh — hai mặt.' },
  ],

  signatureSkills: [
    { name: 'Mộc Đạo Quyết', kind: 'adventure', rarity: 'Hiếm', description: 'Pháp môn Mộc thuộc tính, trị liệu + tăng sinh khí.' },
    { name: 'Tị Linh Quyết', kind: 'adventure', rarity: 'Cực Phẩm', description: 'Pháp môn ẩn thân + tránh linh thức, do Vương Lâm chế.' },
    { name: 'Tu Nhân Quyết', kind: 'combat_basic', rarity: 'Tốt', description: 'Pháp môn nhân quả, đếm nghiệp lực địch.' },
    { name: 'Tinh Sát Thuật', kind: 'combat_ultimate', rarity: 'Cực Phẩm', description: 'Tinh thần sát kỹ, tấn công nguyên thần địch trực tiếp.' },
    { name: 'Tịch Diệt Chỉ', kind: 'combat_ultimate', rarity: 'Huyền Thoại', description: 'Chỉ lực Tịch Diệt cảnh, diệt sạch sinh khí trong tầm bắn.' },
  ],

  signatureBeasts: [
    { name: 'Linh Hồ Lão Tổ', rarity: 'Huyền Thoại', kind: 'spirit', description: 'Hồ tinh tổ tiên Vương gia, ẩn trong Tổ Hồn Phù.', basePower: 2000 },
    { name: 'Ô Thiết Trùng', rarity: 'Hiếm', kind: 'beast', description: 'Trùng sắt đen Thanh Lâm vực, vỏ cứng vô địch.', basePower: 150 },
    { name: 'Băng Nguyên Lang', rarity: 'Cực Phẩm', kind: 'beast', description: 'Lang băng Bắc nguyên, gầm rít làm thiên địa đông lạnh.', basePower: 450 },
    { name: 'Thanh Long Tinh Hồn', rarity: 'Siêu Phẩm', kind: 'dragon', description: 'Linh hồn long cổ ngụ trong long mạch.', basePower: 900 },
  ],

  signatureLocations: [
    { name: 'Triệu quốc', category: 'Quốc gia', description: 'Quốc gia phàm tục nơi Vương Lâm sinh ra.' },
    { name: 'Hằng Sơn phái', category: 'Sect HQ', description: 'Sơn môn Hằng Sơn, nhiều linh động + thí luyện.' },
    { name: 'Thanh Lâm vực', category: 'Đại lục', description: 'Vùng tu chân rộng lớn, nhiều tông môn tranh đoạt.' },
    { name: 'Tịch Diệt Thâm Uyên', category: 'Bí cảnh', description: 'Vực sâu Tịch Diệt khí dồn tụ, cấm địa của Anh Biến cảnh.' },
  ],

  terminology: [
    { term: 'Anh Biến', kind: 'realm_term', explanation: 'Cảnh giới biến hóa anh hoa nhiều lần, tăng cường nguyên thần.' },
    { term: 'Vấn Đỉnh', kind: 'realm_term', explanation: 'Hỏi đỉnh trời, cảnh giới cao quý giáp ranh chân tiên.' },
    { term: 'Tịch Diệt', kind: 'realm_term', explanation: 'Cảnh giới diệt sạch cảm xúc + nhân tính để đột phá Đại Thừa.' },
    { term: 'Tu Chân', kind: 'other', explanation: 'Đường tu chân (real cultivation) — khác tu tiên fantasy thông thường.' },
    { term: 'Nghịch Tu', kind: 'other', explanation: 'Tu nghịch thiên đạo — đi ngược lại quy tắc thông thường.' },
    { term: 'Tổ Hồn', kind: 'other', explanation: 'Hồn tổ tiên — truyền thừa tinh thần dòng họ.' },
  ],

  popularCharacters: [
    { name: 'Vương Lâm', description: 'Nhân vật chính — thiếu niên Triệu quốc tu nghịch thiên đạo.' },
    { name: 'Lý Mộ Uyển', description: 'Đạo lữ Hằng Sơn phái.' },
  ],

  newbornBackstoryHints: [
    'Nông dân Triệu quốc xa làng, vô tình nhặt được mảnh tu tiên cuốn.',
    'Đệ tử ngoại môn Hằng Sơn không có linh căn, nhưng có ý chí mạnh.',
    'Hậu duệ cổ tu sĩ ẩn cư, mang dòng máu Anh Biến chưa đánh thức.',
  ],
};
