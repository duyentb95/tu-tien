import type { SpiritualRoot, SpiritualRootType, Element } from '@gametypes/character';

/**
 * SPIRITUAL ROOTS — Linh Căn + Thiên Phú
 *
 * Hệ thống tu tiên truyền thống:
 *   - Đơn linh căn (×3.0) → Song (×2.0) → Tam (×1.4) → Tứ (×0.9) → Ngũ (×0.5)
 *   - Dị linh căn (Lôi/Phong/Băng/Quang/Ám) ×4.0–5.0 — siêu hiếm
 *
 * Đơn linh căn của 1 hệ → chỉ học được công pháp hệ đó, nhưng cực nhanh.
 * Ngũ linh căn → học được mọi hệ nhưng cực chậm (phế tài).
 * Dị linh căn → thiên phú thiên kiêu, ngộ tính cực cao.
 */

export const BASE_ELEMENTS: Element[] = ['kim', 'moc', 'thuy', 'hoa', 'tho'];
export const RARE_ELEMENTS: Element[] = ['loi', 'phong', 'bang', 'quang', 'am'];

export const ELEMENT_DISPLAY: Record<Element, { name: string; color: string; symbol: string }> = {
  kim:   { name: 'Kim',   color: '#cda45e', symbol: '⚒' },
  moc:   { name: 'Mộc',   color: '#8fc98c', symbol: '☘' },
  thuy:  { name: 'Thủy',  color: '#7fbce8', symbol: '〰' },
  hoa:   { name: 'Hỏa',   color: '#d97757', symbol: '⚡' },
  tho:   { name: 'Thổ',   color: '#a8823f', symbol: '◊' },
  loi:   { name: 'Lôi',   color: '#a78bfa', symbol: '⚡' },
  phong: { name: 'Phong', color: '#9ec9e8', symbol: '≋' },
  bang:  { name: 'Băng',  color: '#cdbcff', symbol: '❄' },
  quang: { name: 'Quang', color: '#efe0a0', symbol: '☀' },
  am:    { name: 'Ám',    color: '#5e7a5d', symbol: '☾' },
};

interface RootTypeDef {
  type: SpiritualRootType;
  name: string;
  description: string;
  /** Số element chọn từ pool (5 cơ bản hoặc 5 dị) */
  elementCount: number;
  /** Tỉ lệ roll (%) */
  rollWeight: number;
  /** Hệ số tu luyện */
  multiplier: number;
  /** Có dùng pool dị linh căn không */
  isDi?: boolean;
}

const ROOT_TYPES: RootTypeDef[] = [
  // Cơ bản
  { type: 'don', name: 'Đơn Linh Căn', description: 'Một thuộc tính duy nhất — tu luyện cực nhanh, học công pháp hạn chế.', elementCount: 1, rollWeight: 2, multiplier: 3.0 },
  { type: 'song', name: 'Song Linh Căn', description: 'Hai thuộc tính cân bằng — tu luyện nhanh, công pháp đa dạng.', elementCount: 2, rollWeight: 8, multiplier: 2.0 },
  { type: 'tam', name: 'Tam Linh Căn', description: 'Ba thuộc tính — tu luyện ổn định.', elementCount: 3, rollWeight: 25, multiplier: 1.4 },
  { type: 'tu', name: 'Tứ Linh Căn', description: 'Bốn thuộc tính — tu luyện hơi chậm, ngộ tính bình thường.', elementCount: 4, rollWeight: 35, multiplier: 0.9 },
  { type: 'ngu', name: 'Ngũ Linh Căn', description: 'Đủ năm thuộc tính — "phế tài thân thể", tu luyện cực chậm nhưng học được mọi công pháp.', elementCount: 5, rollWeight: 27, multiplier: 0.5 },
  // Dị
  { type: 'di', name: 'Dị Linh Căn', description: 'Thiên phú dị bẩm — Lôi/Phong/Băng/Quang/Ám. Cực hiếm, ngộ tính kinh người.', elementCount: 1, rollWeight: 3, multiplier: 4.2, isDi: true },
];

/** Tổng weight = 100 — convenient check */
export const TOTAL_ROOT_WEIGHT = ROOT_TYPES.reduce((s, r) => s + r.rollWeight, 0);

/**
 * Roll linh căn cho 1 nhân vật mới.
 * @param rng injectable cho test
 */
export const rollSpiritualRoot = (rng: () => number = Math.random): SpiritualRoot => {
  // Bước 1: roll loại
  const r1 = rng() * 100;
  let cum = 0;
  let chosenType = ROOT_TYPES[ROOT_TYPES.length - 1]!;
  for (const t of ROOT_TYPES) {
    cum += t.rollWeight;
    if (r1 < cum) {
      chosenType = t;
      break;
    }
  }

  // Bước 2: chọn elements từ pool tương ứng
  const pool = chosenType.isDi ? RARE_ELEMENTS : BASE_ELEMENTS;
  const shuffled = [...pool].sort(() => rng() - 0.5);
  const elements = shuffled.slice(0, chosenType.elementCount);

  return {
    type: chosenType.type,
    elements,
    cultivationMultiplier: chosenType.multiplier,
  };
};

/** Format hiển thị: "Đơn Hỏa Linh Căn" / "Tam Kim Mộc Thủy Linh Căn" / "Thiên Lôi Dị Căn" */
export const getRootDisplayName = (root: SpiritualRoot): string => {
  if (root.type === 'di') {
    const el = root.elements[0]!;
    return `Thiên ${ELEMENT_DISPLAY[el].name} Dị Căn`;
  }
  const typeDef = ROOT_TYPES.find((t) => t.type === root.type)!;
  const elNames = root.elements.map((e) => ELEMENT_DISPLAY[e].name).join(' ');
  return `${typeDef.name.replace('Linh Căn', '').trim()} ${elNames} Linh Căn`;
};

/** Mô tả ngắn cho UI: "Đơn linh căn · cực hiếm" */
export const getRootSubtitle = (root: SpiritualRoot): string => {
  const t = ROOT_TYPES.find((x) => x.type === root.type)!;
  if (t.isDi) return 'Đơn dị linh căn · cực hiếm';
  return `${t.name} · ${root.cultivationMultiplier >= 2 ? 'thiên phú cao' : root.cultivationMultiplier >= 1 ? 'bình thường' : 'phế tài'}`;
};

/** Lấy element chủ đạo (cho UI màu sắc, công pháp gợi ý) */
export const getPrimaryElement = (root: SpiritualRoot): Element => root.elements[0]!;

export const getRootRolltypes = (): RootTypeDef[] => ROOT_TYPES;

/** Phase 23.UX: lấy mô tả đầy đủ của root để hiển thị (description + grade) */
export const getRootFullDescription = (root: SpiritualRoot): string => {
  const t = ROOT_TYPES.find((x) => x.type === root.type)!;
  return t.description;
};

/** Phase 23.UX: cách tu luyện gợi ý theo loại linh căn */
export const getRootCultivationTip = (root: SpiritualRoot): string => {
  const mul = root.cultivationMultiplier;
  if (mul >= 4) {
    return 'Dị bẩm — tu luyện bùng nổ. Tập trung 1 công pháp đơn hệ, không cần học nhiều. Ngộ pháp tắc sớm hơn người thường.';
  }
  if (mul >= 3) {
    return 'Đơn linh căn — tu luyện cực nhanh. Tinh thông 1 hệ đến cực hạn, có thể vượt phẩm cấp đối thủ.';
  }
  if (mul >= 2) {
    return 'Song linh căn — cân bằng tốc độ + đa dạng kỹ năng. Nên học công pháp 2 hệ phối hợp (vd Hỏa+Phong = Bão Lửa).';
  }
  if (mul >= 1) {
    return 'Tam-Tứ linh căn — tu luyện ổn định. Nhiều lựa chọn công pháp, dùng đan dược + cảnh giới để bù tốc độ.';
  }
  return 'Ngũ linh căn — "phế tài" tốc độ, nhưng học được mọi loại công pháp. Cần đại cơ duyên / pháp bảo mạnh để bứt phá.';
};
