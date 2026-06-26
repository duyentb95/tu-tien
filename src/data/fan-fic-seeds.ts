/**
 * Fan-fic seed examples — chỉ dùng cho autocomplete UI gợi ý.
 *
 * KHÔNG còn dùng preset cứng (như version trước). Theo pattern prototype:
 * user nhập 3 fields → AI "Phân Tích" → hydrate full settings + initialWorldElements.
 * Seeds chỉ là gợi ý nhanh — không phải data ground truth.
 *
 * Gemini có public knowledge về các bộ tu tiên phổ biến — AI sẽ tự nhớ
 * NPCs, cảnh giới, setting đúng nguyên tác khi nhập đúng tên + nhân vật.
 */

export interface FanFicSeedExample {
  title: string;
  author: string;
  /** Suggestions cho field "Tên nhân vật" khi user chọn tác phẩm này */
  popularChars?: string[];
}

export const FAN_FIC_SEEDS: FanFicSeedExample[] = [
  { title: 'Mục Thần Ký', author: 'Trạch Trư', popularChars: ['Tần Mục', 'Tần Hồng Sinh', 'Tần Phụng'] },
  { title: 'Đấu Phá Thương Khung', author: 'Thiên Tằm Thổ Đậu', popularChars: ['Tiêu Viêm', 'Tiêu Huân Nhi', 'Tiêu Y'] },
  { title: 'Phàm Nhân Tu Tiên Truyện', author: 'Vong Ngữ', popularChars: ['Hàn Lập', 'Nam Cung Uyển'] },
  { title: 'Tru Tiên', author: 'Tiêu Đỉnh', popularChars: ['Trương Tiểu Phàm', 'Lục Tuyết Kỳ', 'Bích Dao'] },
  { title: 'Tiên Nghịch', author: 'Nhĩ Căn', popularChars: ['Vương Lâm', 'Lý Mộ Uyển'] },
  { title: 'Vạn Cổ Tối Cường Tông', author: 'Giang Hồ Tái Kiến', popularChars: ['Quân Thường Tiếu', 'Lục Thiên Thiên'] },
  { title: 'Đế Bá', author: 'Yếm Bút Tiêu Sinh', popularChars: ['Lý Thất Dạ', 'Mai Nghi Nguyệt'] },
  { title: 'Tinh Thần Biến', author: 'Ngã Cật Tây Hồng Thị', popularChars: ['Tần Vũ', 'Tần Phong'] },
  { title: 'Già Thiên', author: 'Thần Đông', popularChars: ['Diệp Phàm', 'Bàng Bác', 'Lý Hắc Thủy'] },
  { title: 'Hoàn Mỹ Thế Giới', author: 'Thần Đông', popularChars: ['Thạch Hạo', 'Vân Hi'] },
  { title: 'Thôn Phệ Tinh Không', author: 'Ngã Cật Tây Hồng Thị', popularChars: ['La Phong'] },
];

/** Lookup nhanh bằng tên (case-insensitive partial match) cho autocomplete */
export const matchSeed = (query: string): FanFicSeedExample[] => {
  if (!query) return [];
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];
  return FAN_FIC_SEEDS.filter((s) => s.title.toLowerCase().includes(q)).slice(0, 5);
};
