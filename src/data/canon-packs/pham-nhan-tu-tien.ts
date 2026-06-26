import type { CanonPack } from '@gametypes/canon-pack';

export const phamNhanTuTien: CanonPack = {
  id: 'pham-nhan-tu-tien',
  title: 'Phàm Nhân Tu Tiên Truyện',
  altTitles: ['Phàm Nhân Tu Tiên', 'A Record of a Mortal\'s Journey to Immortality', '凡人修仙传'],
  author: 'Vong Ngữ',
  description:
    'Hàn Lập — phàm nhân tư chất tầm thường, dựa vào kiên trì + thận trọng tu thành chân tiên. Phong cách realism khắc nghiệt, không truy cầu cao trào ảo tưởng.',
  themes: ['Tiên hiệp truyền thống', 'Realism', 'Phàm nhân lưu'],
  currencyName: 'Linh Thạch',

  cosmology: {
    realmList: [
      'Luyện Khí (12 tầng)', 'Trúc Cơ (Sơ/Trung/Hậu/Đại Viên Mãn)',
      'Kim Đan', 'Nguyên Anh', 'Hóa Thần', 'Luyện Hư', 'Hợp Thể',
      'Đại Thừa', 'Độ Kiếp', 'Chân Tiên', 'Huyền Tiên',
      'Kim Tiên', 'Đại La Kim Tiên',
    ],
    description:
      'Hệ cảnh giới truyền thống. Mỗi cảnh phân Sơ/Trung/Hậu/Đại Viên Mãn. Linh căn quyết định tốc độ tu luyện. Độ Kiếp = phân giới giữa phàm tiên.',
  },

  defaultStartingLocation: 'Mặc Lăng cốc (Sơn thôn nghèo)',

  signatureNpcs: [
    { name: 'Hàn Lập', role: 'Nhân vật chính', description: 'Phàm nhân tư chất tầm thường, tâm tính cực kỳ thận trọng, dựa kiên trì + cơ duyên dần dần tu thành.' },
    { name: 'Nam Cung Uyển', role: 'Đạo lữ', description: 'Tu sĩ Nguyệt Vũ Tông, song tu với Hàn Lập, tính cách dịu dàng quyết đoán.' },
    { name: 'Mặc Đại Phu', role: 'Sư phụ đầu', description: 'Đại phu Mặc Lăng cốc, dạy Hàn Lập y thuật + tu luyện cơ bản, có nhiều bí mật.' },
    { name: 'Khúc Hồn', role: 'Bằng hữu', description: 'Tu sĩ Hoàng Phong Cốc, giúp đỡ Hàn Lập trong tu luyện ban đầu.' },
    { name: 'Tử Linh', role: 'Linh thú', description: 'Tử Tinh Phong, linh thú bằng vàng do Hàn Lập thu phục.' },
    { name: 'Lưu Văn Hoa', role: 'Đối thủ', description: 'Đệ tử Hoàng Phong Cốc, ban đầu kình địch Hàn Lập trong nội tông.' },
  ],

  signatureSects: [
    { name: 'Hoàng Phong Cốc', alignment: 'chinh', description: 'Tông môn cấp trung Việt quốc, nơi Hàn Lập gia nhập sau Luyện Khí.' },
    { name: 'Thiên Khuyết Bảo', alignment: 'chinh', description: 'Đại tông môn Việt quốc, hùng mạnh nhất khu vực Loạn Tinh Hải.' },
    { name: 'Vạn Trùng Sơn', alignment: 'ma', description: 'Tông môn ma đạo chuyên trùng độc thuật, đối thủ chính nghĩa.' },
    { name: 'Cự Khuyết Pháo', alignment: 'chinh', description: 'Tông môn chế tạo pháp khí cấp Trúc Cơ + Kim Đan.' },
    { name: 'Nguyệt Vũ Tông', alignment: 'chinh', description: 'Tông môn nữ tu Đông Hải, nơi Nam Cung Uyển xuất thân.' },
  ],

  signatureItems: [
    { name: 'Tiểu Cực Cung', category: 'Vũ khí', rarity: 'Cực Phẩm', description: 'Cung tên cấp Tiên Bảo do Hàn Lập sở hữu, bắn ra tinh hoa thần lực.' },
    { name: 'Thanh Linh Lệnh', category: 'Tín vật', rarity: 'Hiếm', description: 'Lệnh bài đệ tử nội môn Hoàng Phong Cốc.' },
    { name: 'Trúc Cơ Đan', category: 'Đan dược', rarity: 'Tốt', description: 'Đan dược cần thiết để đột phá Luyện Khí → Trúc Cơ, cực kỳ khan hiếm.' },
    { name: 'Thiên Vẫn Cương Khí', category: 'Pháp bảo', rarity: 'Siêu Phẩm', description: 'Cương khí từ vẫn thạch thiên giới, vũ khí phòng ngự đỉnh cao.' },
    { name: 'Linh Tủy', category: 'Nguyên liệu', rarity: 'Cực Phẩm', description: 'Tủy linh từ thần thú cổ, tăng tốc tu luyện vượt bậc.' },
  ],

  signatureSkills: [
    { name: 'Đại Diễn Quyết', kind: 'adventure', rarity: 'Cực Phẩm', description: 'Công pháp thần thức Hàn Lập tu luyện, tăng cường thần thức + tính toán pháp tắc.' },
    { name: 'Thanh Nguyên Kiếm Quyết', kind: 'combat_basic', rarity: 'Hiếm', description: 'Kiếm pháp cơ bản Hoàng Phong Cốc, có thể nâng cấp lên cấp ngộ đạo.' },
    { name: 'Phật Châu', kind: 'combat_ultimate', rarity: 'Siêu Phẩm', description: 'Phật bảo của một vị tiền bối Phật môn, có lực sát thương + phòng ngự.' },
    { name: 'Lôi Đính Tuyết Chú', kind: 'combat_basic', rarity: 'Tốt', description: 'Phù chú tự khắc, triệu lôi đánh địch, đặc biệt khắc ma vật.' },
    { name: 'Hóa Huyết Đại Pháp', kind: 'combat_ultimate', rarity: 'Cực Phẩm', description: 'Ma công của Vạn Trùng Sơn, hấp thụ tinh huyết.' },
  ],

  signatureBeasts: [
    { name: 'Tử Linh', rarity: 'Siêu Phẩm', kind: 'mystical', description: 'Tử Tinh Phong linh điểu vàng, biến hình thành nhân hình, có thể nuốt nguyên thần địch.', basePower: 600 },
    { name: 'Hắc Loa Hồ', rarity: 'Hiếm', kind: 'spirit', description: 'Cáo trắng đuôi đen, ranh mãnh khôn lường, tu Kim Đan.', basePower: 200 },
    { name: 'Yêu Trùng', rarity: 'Tốt', kind: 'beast', description: 'Trùng độc cổ Vạn Trùng Sơn, đa dạng độc tính, từng đàn áp đảo.', basePower: 80 },
    { name: 'Tinh Hoàng Lang', rarity: 'Cực Phẩm', kind: 'beast', description: 'Lang vương cổ trên Loạn Tinh Hải, tinh thông âm thanh sát kỹ.', basePower: 400 },
  ],

  signatureLocations: [
    { name: 'Việt quốc', category: 'Quốc gia', description: 'Quốc gia phàm tục nơi Hàn Lập sinh ra.' },
    { name: 'Hoàng Phong Cốc', category: 'Sect HQ', description: 'Cốc tu luyện trên núi, sương mù bao phủ quanh năm.' },
    { name: 'Loạn Tinh Hải', category: 'Đại lục', description: 'Vùng quần đảo nơi đại tông môn tranh đoạt.' },
    { name: 'Lạc Vân Tông Cấm Địa', category: 'Bí cảnh', description: 'Cấm địa cổ, chôn vùi nhiều di tích tu sĩ thượng cổ.' },
  ],

  terminology: [
    { term: 'Linh Căn', kind: 'other', explanation: 'Tư chất tu luyện bẩm sinh — Kim/Mộc/Thủy/Hỏa/Thổ. Đơn linh căn = thiên tài.' },
    { term: 'Trúc Cơ', kind: 'realm_term', explanation: 'Cảnh giới thứ 2, đặt nền móng cho con đường tu chân lâu dài.' },
    { term: 'Kim Đan', kind: 'realm_term', explanation: 'Ngưng tụ linh khí thành đan trong cơ thể, dài thọ 500 năm.' },
    { term: 'Nguyên Anh', kind: 'realm_term', explanation: 'Phá đan kết anh, có thể xuất khiếu — tách hồn khỏi nhục thân.' },
    { term: 'Linh Thạch', kind: 'item_category', explanation: 'Đá chứa linh khí, đơn vị tiền tệ + nhiên liệu tu luyện.' },
    { term: 'Pháp Bảo', kind: 'item_category', explanation: 'Vũ khí được tu sĩ luyện chế bằng linh thức + linh khí.' },
    { term: 'Phiến Dược', kind: 'other', explanation: 'Hành động hái thuốc thần dược nguy hiểm trong rừng sâu.' },
  ],

  popularCharacters: [
    { name: 'Hàn Lập', description: 'Nhân vật chính — phàm nhân kiên trì tu thành tiên.' },
    { name: 'Nam Cung Uyển', description: 'Đạo lữ chính.' },
  ],

  newbornBackstoryHints: [
    'Trẻ mồ côi tị nạn từ làng quê, gặp lão tu sĩ truyền pháp căn bản.',
    'Đệ tử tạp dịch Hoàng Phong Cốc, mất linh căn nhưng có cơ duyên đặc biệt.',
    'Con cháu gia tộc trung sản phá sản, tự tìm đường tu luyện.',
  ],
};
