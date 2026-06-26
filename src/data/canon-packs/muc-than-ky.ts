import type { CanonPack } from '@gametypes/canon-pack';

export const mucThanKy: CanonPack = {
  id: 'muc-than-ky',
  title: 'Mục Thần Ký',
  altTitles: ['Mu Shen Ji', '牧神记', 'Tale of the Shepherd God'],
  author: 'Trạch Trư',
  description:
    'Tần Mục được lão tổ ở Đại Hoang nuôi lớn, từ Linh Đài tu thành Thần. Phong cách hùng mạnh + tâm trạng tự do, đả phá quy tắc Thiên Đình.',
  themes: ['Huyền huyễn', 'Thần ma', 'Đông phương'],
  currencyName: 'Linh Thạch',

  cosmology: {
    realmList: [
      'Linh Đài', 'Tỏa Linh', 'Linh Hải', 'Thần Kiều', 'Linh Thai',
      'Pháp Tướng', 'Vô Cấu Anh Hài', 'Nguyên Thần Biến', 'Phi Tiên',
      'Pháp Thần', 'Pháp Quyền', 'Pháp Tướng (Đại La)', 'Thượng Cổ Thần',
    ],
    description:
      'Cảnh giới khởi nguồn từ mở Khiếu Huyệt, tu Linh Khu, kết Thần Kiều. Mỗi cảnh có tầng phụ. Thượng Cổ Thần là đỉnh cao, gần như bất tử.',
  },

  defaultStartingLocation: 'Đại Hoang thôn',

  signatureNpcs: [
    { name: 'Tần Mục', role: 'Nhân vật chính', description: 'Cô nhi được lão tổ Đại Hoang nuôi lớn, mở mắt thiên sinh, có Thái Tô khí cực kỳ thuần khiết.' },
    { name: 'Tần Hồng Sinh', role: 'Sư phụ + Tế Tự', description: 'Lão tế tự Đại Hoang, sư phụ Tần Mục, sức mạnh ẩn giấu cực sâu.' },
    { name: 'Tần Phụng', role: 'Bà cố', description: 'Bà của Tần Mục, võ lực hùng mạnh, từng là chiến tướng Đại Hoang.' },
    { name: 'Diệp Thanh Vũ', role: 'Đạo lữ', description: 'Tiên nữ Thanh Sơn phái, tình cảm phức tạp với Tần Mục.' },
    { name: 'Vân Vô Phong', role: 'Đối thủ', description: 'Thiên tài Đạo Thánh tông, kình địch không chấp nhận thất bại.' },
    { name: 'Mặc Thanh Đồng', role: 'Bằng hữu', description: 'Đệ tử Mặc Gia tinh thông cơ quan thuật, đồng hành Tần Mục từ thời niên thiếu.' },
  ],

  signatureSects: [
    { name: 'Mặc Gia', alignment: 'trung', description: 'Tông môn lấy cơ quan thuật + chiến giáp làm gốc, hậu duệ thợ thủ công cổ.', philosophy: 'Kiêm ái phi công, chuyển kỹ thuật thành sức mạnh.' },
    { name: 'Đạo Thánh Tông', alignment: 'chinh', description: 'Đại tông môn Trung Châu, sản sinh nhiều thiên tài đời này qua đời khác.' },
    { name: 'Thanh Sơn phái', alignment: 'chinh', description: 'Tông môn nữ tu chuyên kiếm pháp + thuật tu tiên cao quý.' },
    { name: 'Diên Khang đế quốc', alignment: 'trung', description: 'Đế quốc nhân loại lớn nhất Trung Châu, có Cấm Quân tu sĩ tinh nhuệ.' },
    { name: 'Long Hán Triều', alignment: 'an', description: 'Triều đại cổ xưa của Long tộc, vẫn còn ảnh hưởng ở Đại Khư.' },
  ],

  signatureItems: [
    { name: 'Đại Hắc Hắc Tử', category: 'Pháp bảo', rarity: 'Huyền Thoại', description: 'Linh thú đặc biệt giống chó đen, thực chất là di vật từ thái cổ, có sức mạnh khôn lường.' },
    { name: 'Sấm Nguyệt Đao', category: 'Vũ khí', rarity: 'Cực Phẩm', description: 'Đao hình cong khắc tinh tượng, được Tần Mục sử dụng từ thời thiếu niên.' },
    { name: 'Hắc Bạch Thiên Tử Kỳ', category: 'Pháp bảo', rarity: 'Siêu Phẩm', description: 'Cờ lệnh chỉ huy thiên binh, biểu tượng quyền uy đại tế tự.' },
    { name: 'Thái Tô Khí', category: 'Nguyên liệu', rarity: 'Huyền Thoại', description: 'Khí thuần khiết nhất của thái cổ, là gốc của vạn vật pháp tắc.' },
    { name: 'Hồng Hoang Nội Cảnh', category: 'Công pháp', rarity: 'Huyền Thoại', description: 'Bí truyền Đại Hoang, cho phép nội cảnh chứa cả hồng hoang vũ trụ.' },
  ],

  signatureSkills: [
    { name: 'Mở Mắt Thiên Sinh', kind: 'adventure', rarity: 'Huyền Thoại', description: 'Thiên phú bẩm sinh, mắt nhìn thấu vạn pháp + pháp tắc thiên địa.' },
    { name: 'Lữ Sơn Pháp Tướng', kind: 'combat_ultimate', rarity: 'Siêu Phẩm', description: 'Triệu hồi pháp tướng Lữ Sơn, chiến đấu với sức mạnh thần linh cổ.' },
    { name: 'Hồng Hoang chi Hùng', kind: 'combat_ultimate', rarity: 'Cực Phẩm', description: 'Triệu hồi tinh khí thái cổ, biến cơ thể thành hùng mãnh thú vương.' },
    { name: 'Đại Quang Minh Quyền', kind: 'combat_basic', rarity: 'Hiếm', description: 'Quyền pháp ánh sáng, khắc chế tà ma âm khí.' },
    { name: 'Tinh Long Biến Quyết', kind: 'adventure', rarity: 'Cực Phẩm', description: 'Pháp môn cải tạo thể chất, mượn long khí tăng tiến tu vi.' },
  ],

  signatureBeasts: [
    { name: 'Đại Hắc Hắc Tử', rarity: 'Huyền Thoại', kind: 'mystical', description: 'Linh thú thái cổ, ngụy trang dưới hình chó đen.', basePower: 1500 },
    { name: 'Hắc Linh Lang', rarity: 'Hiếm', kind: 'beast', description: 'Lang vương Đại Hoang, lông đen như mực, săn theo bầy.', basePower: 180 },
    { name: 'Tỏa Linh Hồ Tinh', rarity: 'Cực Phẩm', kind: 'spirit', description: 'Cáo chín đuôi, tu thành nhân hình, mê hoặc tu sĩ.', basePower: 350 },
    { name: 'Long Hán Hậu Duệ', rarity: 'Siêu Phẩm', kind: 'dragon', description: 'Long tộc sót lại từ Long Hán Triều cổ.', basePower: 800 },
  ],

  signatureLocations: [
    { name: 'Đại Hoang', category: 'Vùng hoang dã', description: 'Vùng đất khắc nghiệt phía Bắc, nhiều mãnh thú + linh dược cổ.' },
    { name: 'Trung Châu', category: 'Đại lục', description: 'Trung tâm văn minh nhân loại, hội tụ đại tông môn.' },
    { name: 'Đại Khư', category: 'Cổ chiến trường', description: 'Tàn tích chiến trường thái cổ, có vô số bí mật + nguy hiểm.' },
    { name: 'Diên Khang Kinh', category: 'Đô thị lớn', description: 'Kinh đô Diên Khang đế quốc, đông đúc nhộn nhịp.' },
  ],

  terminology: [
    { term: 'Khiếu Huyệt', kind: 'huyet_vi', explanation: 'Cửa huyệt khởi nguồn tu luyện, mỗi người có 9 chính khiếu.' },
    { term: 'Linh Khu', kind: 'kinh_mach', explanation: 'Hệ kinh mạch dẫn linh khí, tu Linh Đài cảnh là tu Linh Khu.' },
    { term: 'Vĩnh Hải', kind: 'kinh_mach', explanation: 'Đại kinh mạch chính, nơi linh khí tích tụ thành biển.' },
    { term: 'Thần Kiều', kind: 'realm_term', explanation: 'Cây cầu nối thần thức + nhục thân, mở ra cảnh giới Thần.' },
    { term: 'Đại Khư', kind: 'territory', explanation: 'Vùng đất nguyên chiến trường thái cổ, đầy di tích thần ma.' },
    { term: 'Thái Tô', kind: 'other', explanation: 'Khí nguyên thủy thuần khiết nhất, gốc của vạn pháp.' },
    { term: 'Thần Kiều cảnh', kind: 'realm_term', explanation: 'Mở Thần Kiều thành công = đạt cảnh giới Thần Kiều.' },
  ],

  popularCharacters: [
    { name: 'Tần Mục', description: 'Nhân vật chính nguyên tác — cô nhi được lão tổ Đại Hoang nuôi lớn.' },
    { name: 'Tần Hồng Sinh', description: 'Sư phụ Tần Mục, lão tế tự với sức mạnh ẩn giấu.' },
    { name: 'Diệp Thanh Vũ', description: 'Tiên nữ Thanh Sơn phái.' },
  ],

  newbornBackstoryHints: [
    'Đệ tử cấp thấp Mặc Gia, đam mê cơ quan thuật, mơ chế tạo chiến giáp riêng.',
    'Thợ săn Đại Hoang, lớn lên trong rừng sâu, tinh thông săn mãnh thú.',
    'Tù binh Long Hán hậu duệ trốn thoát, mang dòng máu cổ chưa thức tỉnh.',
  ],
};
