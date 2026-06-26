import type { CanonPack } from '@gametypes/canon-pack';

export const truTien: CanonPack = {
  id: 'tru-tien',
  title: 'Tru Tiên',
  altTitles: ['Jade Dynasty', 'Zhu Xian', '诛仙'],
  author: 'Tiêu Đỉnh',
  description:
    'Trương Tiểu Phàm — thiếu niên Thảo Miếu thôn, gia nhập Thanh Vân Môn, lưỡng đạo chính ma. Mối tình bi tráng với Lục Tuyết Kỳ + Bích Dao, kết cục đau lòng. Tu tiên cổ điển + ái tình + định mệnh.',
  themes: ['Tu tiên cổ điển', 'Lãng mạn bi tráng', 'Chính ma song tu'],
  currencyName: 'Linh Thạch',

  cosmology: {
    realmList: [
      'Phục Khí', 'Đan Đỉnh', 'Nguyên Thần', 'Hợp Đạo',
      'Đại La Kim Tiên', 'Tiên Quân', 'Đại Đế',
    ],
    description:
      'Tu tiên cổ điển 5 hệ Kim/Mộc/Thủy/Hỏa/Thổ. Chính ma cùng đi đường khác — chính đạo Thanh Vân, Thiên Âm; ma đạo Hợp Hoan Phái, Trường Sinh Đường, Quỷ Vương Tông. Hợp Đạo cảnh = tiêu chuẩn cao nhân.',
  },

  defaultStartingLocation: 'Thanh Vân Môn (Đại Trúc Phong)',

  signatureNpcs: [
    { name: 'Trương Tiểu Phàm / Quỷ Lệ', role: 'Nhân vật chính', description: 'Thiếu niên Thảo Miếu thôn duy nhất sống sót, tu Đại Phạm Bát Nhã trong Thanh Vân + Hợp Hoan Linh ma đạo song tu.' },
    { name: 'Lục Tuyết Kỳ', role: 'Đạo lữ chính (chính phái)', description: 'Đại tiểu thư Thanh Vân Môn Tiểu Trúc Phong, sư muội đồng môn, ái tình đầu tiên.' },
    { name: 'Bích Dao', role: 'Đạo lữ chính (ma đạo)', description: 'Quận chúa Quỷ Vương Tông, hy sinh vì Trương Tiểu Phàm.' },
    { name: 'Phổ Hồng đạo nhân', role: 'Sư phụ', description: 'Đạo nhân Đại Trúc Phong, sư phụ Trương Tiểu Phàm.' },
    { name: 'Đạo Huyền chân nhân', role: 'Đại sư huynh + đối thủ', description: 'Chưởng môn Thanh Vân Môn thời đó, người công tâm.' },
    { name: 'Quỷ Vương', role: 'Ma đạo lãnh tụ', description: 'Cha Bích Dao, lãnh tụ Quỷ Vương Tông.' },
    { name: 'Linh Sương', role: 'Bằng hữu + đệ tử', description: 'Sư đệ Đại Trúc Phong, đồng hành thân thiết.' },
  ],

  signatureSects: [
    { name: 'Thanh Vân Môn', alignment: 'chinh', description: 'Đại tông môn chính đạo, 7 phong (Long Thủ, Tiểu Trúc, Đại Trúc, Lạc Hồn, Long Đầu, Long Vĩ, Phượng Phong).' },
    { name: 'Thiên Âm Tự', alignment: 'chinh', description: 'Phật môn chính đạo, ngộ Phật Đại Bi.' },
    { name: 'Phần Hương Cốc', alignment: 'chinh', description: 'Đạo môn ẩn cư, thiên tài kiếm tu.' },
    { name: 'Hợp Hoan Phái', alignment: 'ma', description: 'Ma đạo song tu, tu Hợp Hoan Linh.' },
    { name: 'Quỷ Vương Tông', alignment: 'ma', description: 'Ma đạo lớn nhất, do Quỷ Vương lãnh đạo.' },
    { name: 'Trường Sinh Đường', alignment: 'ma', description: 'Ma môn cổ luyện hồn, hắc ám nhất.' },
  ],

  signatureItems: [
    { name: 'Tru Tiên Kiếm', category: 'Vũ khí', rarity: 'Huyền Thoại', description: 'Kiếm Tru Tiên cổ, vũ khí tối thượng — diệt sạch tiên ma.' },
    { name: 'Thiêu Hoả Côn (Hỏa Thiêu Côn)', category: 'Vũ khí', rarity: 'Cực Phẩm', description: 'Côn lửa của Trương Tiểu Phàm thời niên thiếu, do Phổ Hồng truyền.' },
    { name: 'Hợp Hoan Linh', category: 'Pháp bảo', rarity: 'Siêu Phẩm', description: 'Linh chuông Hợp Hoan Phái, hấp thụ tinh khí địch.' },
    { name: 'Thiên Lang Thần Quân Phù', category: 'Tín vật', rarity: 'Cực Phẩm', description: 'Phù Thiên Lang cổ, triệu hồi linh thú thần thoại.' },
    { name: 'Long Đầu Hắc Bảo', category: 'Pháp bảo', rarity: 'Huyền Thoại', description: 'Bảo vật Thanh Vân Long Đầu phong, lực lượng tối cao.' },
  ],

  signatureSkills: [
    { name: 'Đại Phạm Bát Nhã', kind: 'adventure', rarity: 'Huyền Thoại', description: 'Phật pháp đại bi cấp Thiên Âm Tự, tăng định lực + hộ thể.' },
    { name: 'Thái Cực Huyền Thanh Đạo', kind: 'combat_ultimate', rarity: 'Siêu Phẩm', description: 'Đạo pháp Thanh Vân, vận hành thái cực phá địch.' },
    { name: 'Phật Châu', kind: 'combat_basic', rarity: 'Hiếm', description: 'Niệm châu Phật môn, có thể phóng phật quang trị tà.' },
    { name: 'Hợp Hoan Linh Song Tu', kind: 'adventure', rarity: 'Cực Phẩm', description: 'Ma pháp song tu Hợp Hoan, tăng tu vi nhanh + nguy hiểm.' },
    { name: 'Tru Tiên Kiếm Trận', kind: 'combat_ultimate', rarity: 'Huyền Thoại', description: 'Trận pháp Tru Tiên, 4 kiếm phong tỏa thiên địa.' },
  ],

  signatureBeasts: [
    { name: 'Thiên Lang Thần Quân', rarity: 'Huyền Thoại', kind: 'mystical', description: 'Linh thú thần thoại Trương Tiểu Phàm thu phục.', basePower: 2200 },
    { name: 'Trừ Tà Cổ Vũ', rarity: 'Cực Phẩm', kind: 'beast', description: 'Vũ trừ tà Thanh Vân, hộ pháp môn.', basePower: 600 },
    { name: 'Hợp Hoan Yêu Hồ', rarity: 'Siêu Phẩm', kind: 'spirit', description: 'Hồ tinh Hợp Hoan Phái, mê hoặc nam tu sĩ.', basePower: 800 },
    { name: 'Quỷ Vương Bí Thú', rarity: 'Cực Phẩm', kind: 'mystical', description: 'Quái thú nuôi Quỷ Vương Tông.', basePower: 500 },
  ],

  signatureLocations: [
    { name: 'Thảo Miếu thôn', category: 'Sơn thôn', description: 'Quê hương Trương Tiểu Phàm, bị thảm sát.' },
    { name: 'Thanh Vân Sơn', category: 'Sect HQ', description: 'Sơn môn Thanh Vân — 7 phong tu tiên.' },
    { name: 'Khổng Tang Sơn', category: 'Cấm địa', description: 'Sơn bí ẩn ma đạo, nhiều cao thủ ẩn cư.' },
    { name: 'Hoang Châu', category: 'Đại lục', description: 'Châu hoang dã, nhiều dị bảo + nguy hiểm.' },
  ],

  terminology: [
    { term: 'Chính Ma', kind: 'other', explanation: 'Sự phân chia chính phái / ma phái — cốt lõi bối cảnh Tru Tiên.' },
    { term: 'Đại Phạm Bát Nhã', kind: 'other', explanation: 'Phật pháp đại bi Thiên Âm Tự.' },
    { term: 'Hợp Hoan Linh', kind: 'item_category', explanation: 'Linh chuông Hợp Hoan, biểu tượng ma đạo song tu.' },
    { term: 'Tru Tiên Trận', kind: 'other', explanation: 'Trận pháp Tru Tiên cổ — diệt sạch tiên ma.' },
    { term: 'Đan Đỉnh', kind: 'realm_term', explanation: 'Cảnh ngưng đan trong đỉnh — phân giới quan trọng.' },
    { term: 'Đại La Kim Tiên', kind: 'realm_term', explanation: 'Cảnh giới cao, gần như bất tử.' },
  ],

  popularCharacters: [
    { name: 'Trương Tiểu Phàm', description: 'Nhân vật chính — lưỡng đạo chính ma song tu.' },
    { name: 'Lục Tuyết Kỳ', description: 'Đạo lữ chính phái.' },
    { name: 'Bích Dao', description: 'Đạo lữ ma đạo — bi kịch.' },
  ],

  newbornBackstoryHints: [
    'Đệ tử ngoại môn Thanh Vân Đại Trúc Phong, kém tài.',
    'Hậu duệ Thảo Miếu thôn sống sót khác, tìm chân tướng thảm sát.',
    'Cô nhi được ma đạo nhận làm đệ tử, sau ngộ ra chính đạo.',
  ],
};
