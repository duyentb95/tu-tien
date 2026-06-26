import type { CanonPack } from '@gametypes/canon-pack';

export const thonPheTinhKhong: CanonPack = {
  id: 'thon-phe-tinh-khong',
  title: 'Thôn Phệ Tinh Không',
  altTitles: ['Swallowed Star', 'TPTK', '吞噬星空'],
  author: 'Ngã Cật Tây Hồng Thị',
  description:
    'La Phong — chàng trai phổ thông trong thời đại quái thú trỗi dậy, tu Cực Cảnh tinh chất, thành Vũ Trụ Tôn Giả. Phong cách sci-fi tu chân kết hợp — vũ trụ + công nghệ + nguyên võ.',
  themes: ['Sci-fi tu chân', 'Vũ trụ', 'Quái thú'],
  currencyName: 'Tinh Tệ',

  cosmology: {
    realmList: [
      'Võ Giả', 'Võ Sư', 'Đại Võ Sư', 'Tinh Cấp (9 cấp)',
      'Hành Tinh Cấp', 'Tinh Hệ Cấp', 'Vũ Trụ Cấp', 'Lãnh Vực Cấp',
      'Thế Giới Cấp', 'Vũ Trụ Tôn Giả',
    ],
    description:
      'Hệ Nguyên Võ + Tinh Lực — tu cả thân thể + tinh thần. Vũ trụ rộng lớn với nhiều chủng tộc thông minh + quái thú. Vũ Trụ Tôn Giả là đỉnh, kiểm soát một vũ trụ.',
  },

  defaultStartingLocation: 'Phổ Thông thành (Thượng Hải khu vực)',

  signatureNpcs: [
    { name: 'La Phong', role: 'Nhân vật chính', description: 'Thiếu niên phổ thông gia đình nghèo, gia nhập Nguyên Võ Trường tu Cực Cảnh, trỗi dậy thành Vũ Trụ Tôn Giả.' },
    { name: 'La Hồng', role: 'Cha', description: 'Cha La Phong, taxi tài xế, lao động kiếm sống nuôi gia đình.' },
    { name: 'Trạch Long', role: 'Bằng hữu cốt lõi', description: 'Bạn thân La Phong từ thời niên thiếu, đồng hành nhiều hiểm nguy.' },
    { name: 'Ba La Cát', role: 'Sư phụ + chiến hữu', description: 'Tướng quân chiến đấu, hướng dẫn La Phong tu luyện.' },
    { name: 'Bốc Vương', role: 'Bí bảo + tiền bối', description: 'Vũ Trụ Tôn Giả cổ ngụ trong nhẫn không gian, hướng dẫn La Phong.' },
    { name: 'Hồng Đại Tướng', role: 'Đối thủ + bằng hữu', description: 'Đại tướng nhân loại, ban đầu thử thách La Phong.' },
  ],

  signatureSects: [
    { name: 'Nhân Loại Liên Minh', alignment: 'chinh', description: 'Liên minh phòng thủ nhân loại thời đại quái thú trỗi dậy.' },
    { name: 'Cực Cảnh Hội', alignment: 'trung', description: 'Tổ chức võ giả Cực Cảnh, đỉnh cao của nhân loại.' },
    { name: 'Hắc Tinh Mộng Đảo', alignment: 'ma', description: 'Đảo tối tăm chứa quái thú nguy hiểm.' },
    { name: 'Bốc Vương Đảo', alignment: 'an', description: 'Đảo ẩn cư Bốc Vương cổ.' },
    { name: 'Quái Thú Đảo', alignment: 'ma', description: 'Đảo quái thú trỗi dậy, lãnh thổ riêng của chúng.' },
  ],

  signatureItems: [
    { name: 'Thâm Lam Tinh Phù', category: 'Tín vật', rarity: 'Cực Phẩm', description: 'Tinh phù xanh thẫm của La Phong, lưu trữ dữ liệu + công nghệ.' },
    { name: 'Tử Nguyệt Đan', category: 'Đan dược', rarity: 'Siêu Phẩm', description: 'Đan đông cố tinh chất, tăng tu vi Tinh Cấp.' },
    { name: 'Du Thần Phù', category: 'Pháp bảo', rarity: 'Huyền Thoại', description: 'Phù du thần — di chuyển tinh thần xuyên không gian.' },
    { name: 'Nguyên Tố Tinh Hạch', category: 'Nguyên liệu', rarity: 'Huyền Thoại', description: 'Tinh hạch nguyên tố cấp Tinh Hệ, vũ khí siêu cấp.' },
    { name: 'Khôi Lỗi Chiến Giáp', category: 'Trang phục', rarity: 'Cực Phẩm', description: 'Giáp khôi lỗi kết hợp công nghệ + nguyên võ.' },
  ],

  signatureSkills: [
    { name: 'Cửu Trọng Lôi Đao', kind: 'combat_ultimate', rarity: 'Cực Phẩm', description: 'Đao pháp 9 trọng lôi, mỗi tầng mạnh gấp đôi.' },
    { name: 'Lôi Thần Quyền', kind: 'combat_basic', rarity: 'Hiếm', description: 'Quyền pháp lôi thần, đa dụng + linh hoạt.' },
    { name: 'Bạo Phong Kiếm Pháp', kind: 'combat_basic', rarity: 'Hiếm', description: 'Kiếm pháp bạo phong, tốc độ vô địch.' },
    { name: 'Tinh Hà Thôn Phệ Quyết', kind: 'adventure', rarity: 'Huyền Thoại', description: 'Pháp môn thôn phệ tinh hà, gốc tu La Phong.' },
    { name: 'Cực Cảnh Tinh Chất', kind: 'adventure', rarity: 'Siêu Phẩm', description: 'Tinh chất Cực Cảnh — nâng cấp thân thể đến tối đa.' },
  ],

  signatureBeasts: [
    { name: 'Hỗn Độn Cự Thú', rarity: 'Huyền Thoại', kind: 'mystical', description: 'Quái thú hỗn độn cổ, cấp Vũ Trụ.', basePower: 3000 },
    { name: 'Lôi Thần Long', rarity: 'Siêu Phẩm', kind: 'dragon', description: 'Long lôi thần, vũ khí sinh học cấp Tinh Hệ.', basePower: 1500 },
    { name: 'Tinh Hà Mãng', rarity: 'Cực Phẩm', kind: 'beast', description: 'Mãng cổ giữa tinh hà, săn theo bầy.', basePower: 700 },
    { name: 'Quái Thú Trỗi Dậy', rarity: 'Hiếm', kind: 'beast', description: 'Quái thú phổ thông thời đại trỗi dậy.', basePower: 200 },
  ],

  signatureLocations: [
    { name: 'Trái Đất (mạt thế)', category: 'Hành tinh', description: 'Trái đất sau khi quái thú trỗi dậy, hỗn loạn + nguy hiểm.' },
    { name: 'Tinh Hà Liên Minh', category: 'Tinh hệ', description: 'Liên minh tinh hệ nhân loại.' },
    { name: 'Hắc Tinh Mộng Đảo', category: 'Cấm địa', description: 'Đảo bí ẩn chứa quái thú nguy hiểm.' },
    { name: 'Bốc Vương Đảo', category: 'Bí cảnh', description: 'Đảo Bốc Vương ẩn cư, có truyền thừa cổ.' },
  ],

  terminology: [
    { term: 'Cực Cảnh', kind: 'other', explanation: 'Cảnh giới cực hạn của võ giả nhân loại, đỉnh cao cơ thể.' },
    { term: 'Tinh Cấp', kind: 'realm_term', explanation: 'Cấp võ sĩ vượt khỏi hành tinh, đi vào tinh không.' },
    { term: 'Tinh Lực', kind: 'other', explanation: 'Năng lượng tu luyện cấp Tinh, khác linh khí truyền thống.' },
    { term: 'Nguyên Võ', kind: 'other', explanation: 'Võ thuật nguyên thủy, kết hợp khoa học công nghệ.' },
    { term: 'Vũ Trụ Tôn Giả', kind: 'realm_term', explanation: 'Đỉnh cao truyền thuyết, kiểm soát một vũ trụ.' },
    { term: 'Tinh Tệ', kind: 'item_category', explanation: 'Tiền tệ thông dụng giữa các tinh hệ.' },
  ],

  popularCharacters: [
    { name: 'La Phong', description: 'Nhân vật chính — thiếu niên phổ thông trỗi dậy thành Vũ Trụ Tôn Giả.' },
    { name: 'Trạch Long', description: 'Bằng hữu cốt lõi.' },
  ],

  newbornBackstoryHints: [
    'Học viên Nguyên Võ Trường, tài chất trung bình nhưng quyết tâm.',
    'Lính tuần tra Trái Đất mạt thế, săn quái thú kiếm điểm cống hiến.',
    'Hậu duệ võ giả Tinh Cấp ẩn cư, mơ tiếp nối di nguyện gia tộc.',
  ],
};
