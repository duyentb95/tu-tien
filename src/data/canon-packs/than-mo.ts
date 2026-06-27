import type { CanonPack } from '@gametypes/canon-pack';

export const thanMo: CanonPack = {
  id: 'than-mo',
  title: 'Thần Mộ',
  altTitles: ['Stellar Transformations: Tomb of Gods', 'Shenmu', '神墓'],
  author: 'Thần Đông',
  description:
    'Thần Phong (Mãng Hùng) — chiến thần thượng cổ sống lại sau vạn năm trong mộ thần. Tu chân trong vũ trụ mạt vận, đi tìm chân tướng tử vong cổ.',
  themes: ['Huyền huyễn', 'Cổ điển', 'Vũ trụ tu chân'],
  currencyName: 'Tinh Tệ',

  cosmology: {
    realmList: [
      'Nhập Tinh', 'Tiềm Nguyên', 'Thấu Nguyên', 'Hỗn Nguyên',
      'Tinh Hà', 'Vũ Trụ', 'Hư Không', 'Thần Cấp',
    ],
    description:
      'Hệ Nguyên tu vũ trụ — tu Nguyên lực từ tinh thần + thân thể. Thần Cấp là đỉnh, đi vào "Mộ Thần" cấm địa cổ.',
  },

  defaultStartingLocation: 'Cổ Mộ Thần (núi Mãng Hùng)',
  defaultStartingTechnique: 'Cửu Long Bí Văn',

  signatureNpcs: [
    { name: 'Thần Phong / Mãng Hùng', role: 'Nhân vật chính', description: 'Chiến thần thượng cổ sống lại từ Mộ Thần, ký ức cũ + thân thể trẻ.' },
    { name: 'Thanh Nguyệt nữ thần', role: 'Tri kỷ + đạo lữ', description: 'Nữ thần Thanh Nguyệt, thân cận Thần Phong từ thượng cổ.' },
    { name: 'Tử Lăng', role: 'Bằng hữu + đệ tử', description: 'Thiếu niên hiện đại đồng hành Thần Phong, ngộ đạo nhanh chóng.' },
    { name: 'Long Tổ', role: 'Đại nhân vật', description: 'Tổ tiên long tộc, đối thoại với Thần Phong qua trí nhớ cổ.' },
    { name: 'Cổ Đại Thần', role: 'Đối thủ', description: 'Vị Thần Cấp cổ đại từ trận chiến thượng cổ.' },
  ],

  signatureSects: [
    { name: 'Đông Phương Lãnh Mạc', alignment: 'chinh', description: 'Đại tổ chức tu chân Đông Phương vũ trụ.' },
    { name: 'Thiên Quốc', alignment: 'an', description: 'Quốc gia thần cấp ẩn cư, hậu duệ thần thượng cổ.' },
    { name: 'Thiên Đình Cung', alignment: 'trung', description: 'Cung điện thiên giới, có thiên binh thiên tướng.' },
    { name: 'Hỏa Thần Đảo', alignment: 'chinh', description: 'Đảo Hỏa Thần truyền pháp, đệ tử hùng mạnh.' },
    { name: 'Tinh Hà Liên Minh', alignment: 'trung', description: 'Liên minh các thế lực tinh hệ.' },
  ],

  signatureItems: [
    { name: 'Mộ Thần Khí', category: 'Pháp bảo', rarity: 'Huyền Thoại', description: 'Khí phách từ Mộ Thần cổ, vũ khí của thần thượng cổ.' },
    { name: 'Hắc Tế Mộ Hỏa', category: 'Dị bảo', rarity: 'Siêu Phẩm', description: 'Hỏa đen từ mộ, có thể thiêu hủy linh hồn.' },
    { name: 'Thanh Nguyệt Châu', category: 'Pháp bảo', rarity: 'Cực Phẩm', description: 'Châu trăng xanh, tăng linh thức + chữa thương.' },
    { name: 'Thái Cổ Long Tử', category: 'Nguyên liệu', rarity: 'Huyền Thoại', description: 'Hậu duệ Long Tổ, nuôi lớn thành thần long.' },
    { name: 'Tử Khí Đỉnh', category: 'Pháp bảo', rarity: 'Cực Phẩm', description: 'Đỉnh tử khí Đông Phương, luyện thần đan.' },
  ],

  signatureSkills: [
    { name: 'Cửu Long Bí Văn', kind: 'adventure', rarity: 'Huyền Thoại', description: 'Bí văn 9 long khắc trên thân Thần Phong, mở mỗi nét thì tăng vô số sức mạnh.' },
    { name: 'Tinh Long Bộ', kind: 'adventure', rarity: 'Cực Phẩm', description: 'Bộ pháp Tinh Long, di chuyển xuyên không gian.' },
    { name: 'Nguyên Khí Phá Thiên Chỉ', kind: 'combat_ultimate', rarity: 'Siêu Phẩm', description: 'Chỉ lực nguyên khí, phá toàn bộ phòng ngự.' },
    { name: 'Hắc Tế Hỏa Quyết', kind: 'combat_ultimate', rarity: 'Cực Phẩm', description: 'Bí pháp khống chế Hắc Tế Mộ Hỏa.' },
    { name: 'Hỗn Độn Khí Quyết', kind: 'adventure', rarity: 'Huyền Thoại', description: 'Tu hỗn độn khí — gốc của vạn vật.' },
  ],

  signatureBeasts: [
    { name: 'Long Tổ', rarity: 'Huyền Thoại', kind: 'dragon', description: 'Tổ tiên long tộc.', basePower: 3000 },
    { name: 'Cửu Đầu Quỷ Xà', rarity: 'Siêu Phẩm', kind: 'mystical', description: 'Xà 9 đầu cổ, mỗi đầu khạc một loại độc.', basePower: 1200 },
    { name: 'Mãng Hùng Cổ', rarity: 'Cực Phẩm', kind: 'beast', description: 'Mãng hùng cổ ngụ trên núi Mãng Hùng.', basePower: 700 },
    { name: 'Thần Phượng Vũ', rarity: 'Huyền Thoại', kind: 'phoenix', description: 'Phượng vũ thần cổ.', basePower: 2000 },
  ],

  signatureLocations: [
    { name: 'Mộ Thần', category: 'Cấm địa', description: 'Mộ chôn thần thượng cổ, nơi Thần Phong sống lại.' },
    { name: 'Núi Mãng Hùng', category: 'Vùng hoang dã', description: 'Núi cổ nơi Thần Phong ngụ, có nhiều mãng hùng cổ.' },
    { name: 'Tinh Hà Tinh Vực', category: 'Vũ trụ', description: 'Tinh vực giữa các sao, di chuyển phi thuyền.' },
    { name: 'Thiên Đình', category: 'Bí cảnh', description: 'Cung điện thiên giới ẩn trong vũ trụ.' },
  ],

  terminology: [
    { term: 'Nhập Tinh', kind: 'realm_term', explanation: 'Cảnh giới đầu, hấp thu tinh khí từ sao.' },
    { term: 'Tinh Tệ', kind: 'item_category', explanation: 'Đá chứa tinh khí, tiền tệ vũ trụ.' },
    { term: 'Mộ Thần', kind: 'territory', explanation: 'Mộ thần thượng cổ — bối cảnh khởi đầu.' },
    { term: 'Hỗn Độn Khí', kind: 'other', explanation: 'Khí nguyên thủy gốc — vô cùng quý.' },
    { term: 'Tinh Hà', kind: 'territory', explanation: 'Vùng tinh hà giữa các sao, du hành phi thuyền.' },
    { term: 'Thần Cấp', kind: 'realm_term', explanation: 'Cảnh giới Thần, đỉnh cao vũ trụ.' },
  ],

  popularCharacters: [
    { name: 'Thần Phong', description: 'Nhân vật chính — chiến thần thượng cổ sống lại.' },
    { name: 'Thanh Nguyệt', description: 'Đạo lữ tri kỷ.' },
  ],

  newbornBackstoryHints: [
    'Thiếu niên hiện đại lạc vào Mộ Thần, gặp Thần Phong.',
    'Đệ tử Đông Phương Lãnh Mạc, săn linh dược trên núi Mãng Hùng.',
    'Hậu duệ Long Tổ ẩn cư, mơ tìm dòng máu thượng cổ.',
  ],
};
