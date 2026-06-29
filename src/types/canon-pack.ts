/**
 * Phase 13.1A: Canon Pack registry — pre-curated metadata cho các truyện tu tiên
 * phổ biến, để fan-fic mode không cần dựa hoàn toàn vào AI tự nhớ.
 *
 * Shape của CanonPack rất gần với `FanFicAnalyzeResult` (output của AI analyzer)
 * → có thể dùng làm drop-in replacement: nếu user pick pack có sẵn, skip AI call
 * và hydrate trực tiếp.
 *
 * Mỗi pack mô tả MINIMUM VIABLE CANON: realm system, top NPC/sect/item/skill,
 * terminology đặc trưng. Đủ để AI Narrative Engine bám đúng nguyên tác, KHÔNG
 * bịa stuff trái canon. Community có thể PR mở rộng pack.
 */

export type CanonAlignment = 'chinh' | 'ma' | 'trung' | 'an';
export type CanonRarity = 'Thường' | 'Tốt' | 'Hiếm' | 'Cực Phẩm' | 'Siêu Phẩm' | 'Huyền Thoại';
export type CanonSkillKind = 'combat_basic' | 'combat_ultimate' | 'adventure';
export type CanonBeastKind = 'beast' | 'dragon' | 'phoenix' | 'sword_spirit' | 'spirit' | 'mystical';

/**
 * Có thể tham gia world element collection.
 */
export interface CanonNPC {
  /** Tên đầy đủ theo nguyên tác (ưu tiên Hán Việt) */
  name: string;
  /** Vai trò ngắn — vd "Nhân vật chính", "Sư phụ", "Phản diện chính" */
  role: string;
  /** Mô tả 1-2 câu — tính cách + background nguyên tác */
  description: string;
  /** Arc nào nhân vật này xuất hiện (optional, dùng cho timeline anchor future) */
  arc?: string;
}

export interface CanonSect {
  name: string;
  alignment: CanonAlignment;
  description: string;
  philosophy?: string;
  /** Cấp tu vi tối thiểu để gia nhập */
  joinLevelMin?: number;
}

export interface CanonItem {
  name: string;
  /** Category — "Vũ khí", "Đan dược", "Pháp bảo", "Dị bảo"... */
  category: string;
  rarity: CanonRarity;
  description: string;
}

export interface CanonSkill {
  name: string;
  kind: CanonSkillKind;
  rarity: CanonRarity;
  description: string;
}

export interface CanonBeast {
  name: string;
  rarity: CanonRarity;
  kind: CanonBeastKind;
  description: string;
  /** 50 = mid common, 100 = strong common, 500+ = boss tier */
  basePower: number;
}

export interface CanonTerm {
  term: string;
  kind: 'kinh_mach' | 'huyet_vi' | 'realm_term' | 'territory' | 'time_unit' | 'item_category' | 'other';
  /** 1 câu giải thích để AI dùng đúng context */
  explanation: string;
}

export interface CanonLocation {
  name: string;
  /** "Sect HQ", "Thành thị lớn", "Bí cảnh", "Vùng hoang dã"... */
  category: string;
  description: string;
}

export interface CanonPack {
  /** Slug ID — kebab-case, dùng cho lookup + URL */
  id: string;
  /** Tên hiển thị Tiếng Việt */
  title: string;
  /** Alternative titles (pinyin, EN, Hán tự) — match autocomplete */
  altTitles?: string[];
  author: string;
  /** Mô tả 1-2 câu để user biết pack này là gì */
  description: string;
  /** Genre tags — "Huyền huyễn", "Tiên hiệp", "Đông phương thần thoại"... */
  themes: string[];

  /** Đơn vị tiền tệ trong universe */
  currencyName: string;

  /** ─────────── Cosmology ─────────── */
  cosmology: {
    /** Realm list ĐÚNG theo nguyên tác — order from low → high */
    realmList: string[];
    /** 2-3 câu giải thích cosmology + power system tổng quan */
    description: string;
    /**
     * Phase 24.C: Mô tả chi tiết từng cảnh giới (optional).
     * Nếu có → ưu tiên inject vào narrative prompt thay vì chỉ tên cảnh.
     * Tier dùng để gom nhóm hiển thị (vd "Thần Tàng" vs "Thiên Cung" cho Mục Thần Ký).
     */
    realmDetails?: Array<{
      /** Tên cảnh giới (khớp với entry trong realmList) */
      name: string;
      /** Nhóm cảnh giới — vd "Thần Tàng", "Thiên Cung", "Tiên Đạo" */
      tier?: string;
      /** 1-3 câu mô tả bản chất cảnh giới + cách đột phá */
      description: string;
      /** Nhân vật canon sáng lập / đại diện (nếu có) */
      founder?: string;
    }>;
    /**
     * Phase 24.C: Triết lý / hệ thống tu luyện đặc trưng (optional).
     * Vd Mục Thần Ký: "Dĩ Lực Thành Đạo" — Thiên Cung Thần Tàng song song với
     * con đường Đạo Cảnh. Inject vào narrative prompt để AI giữ flavor đúng.
     */
    philosophyNote?: string;
  };

  /** Vị trí khởi đầu mặc định (nếu không có context cụ thể) */
  defaultStartingLocation: string;
  /**
   * Phase 14.x: Công pháp chính canonical cho nhân vật chính nguyên tác.
   * Vd Tần Mục → "Bá Thể Tam Đan Công" (Mục Thần Ký).
   * Khi user pick Hóa Thân chính, currentTechnique = field này.
   * Khi Khởi Sinh, fallback default generic universe.
   */
  defaultStartingTechnique?: string;

  /** ─────────── World elements ─────────── */
  signatureNpcs: CanonNPC[];
  signatureSects: CanonSect[];
  signatureItems: CanonItem[];
  signatureSkills: CanonSkill[];
  signatureBeasts: CanonBeast[];
  signatureLocations: CanonLocation[];
  /** Thuật ngữ đặc trưng — inject vào narrative prompt để AI dùng đúng */
  terminology: CanonTerm[];

  /** ─────────── Suggested character templates ─────────── */
  /**
   * Hóa thân: tên nhân vật có sẵn trong nguyên tác.
   * Hiển thị làm gợi ý nhanh ở UI.
   */
  popularCharacters?: Array<{ name: string; description: string }>;
  /**
   * Khởi sinh: gợi ý backstory cho nhân vật mới phù hợp universe.
   * Hiển thị làm placeholder khi user pick "Khởi Sinh".
   */
  newbornBackstoryHints?: string[];
}
