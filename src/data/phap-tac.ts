/**
 * Phase 23.4: 10 Pháp Tắc default — luật trời.
 * Unlock từ Hợp Thể (cấp 70+) hoặc canon-specific.
 */
import type { PhapTacDef } from '@gametypes/cultivation';

export const PHAP_TAC_REGISTRY: PhapTacDef[] = [
  {
    id: 'sinh_tu',
    name: 'Sinh Tử Tắc',
    category: 'sinh-tử',
    description: 'Hiểu thấu sinh tử, khi HP về 0 có 30% cơ hội sống lại với 50% HP.',
    minLevel: 70,
    passive: { description: '+15% max HP, miễn nhiễm 1 lần chết / combat (30% chance)', hpMul: 1.15 },
  },
  {
    id: 'thoi_khong',
    name: 'Thời-Không Tắc',
    category: 'thời-không',
    description: 'Khống chế dòng thời gian, giảm cooldown skill -20%.',
    minLevel: 75,
    passive: { description: '-20% cooldown skill, +5% SPD', cooldownReduce: 0.2 },
  },
  {
    id: 'luan_hoi',
    name: 'Luân Hồi Tắc',
    category: 'luân-hồi',
    description: 'Ngộ ra vòng luân hồi — mỗi kill tăng EP +30%.',
    minLevel: 80,
    passive: { description: '+30% EP gain, kill enemy hoàn HP 5%', epMul: 1.3 },
  },
  {
    id: 'nhan_qua',
    name: 'Nhân Quả Tắc',
    category: 'nhân-quả',
    description: 'Nghiệp đến nghiệp đi — mọi damage nhận được phản trả 20%.',
    minLevel: 80,
    passive: { description: 'Phản damage 20%, +10% DEF', defMul: 1.1 },
  },
  {
    id: 'hon_don',
    name: 'Hỗn Độn Tắc',
    category: 'hỗn-độn',
    description: 'Khởi nguyên của vạn vật — tăng tất cả damage element +25%.',
    minLevel: 85,
    passive: { description: '+25% damage element, +15% ATK', atkMul: 1.15 },
  },
  {
    id: 'bat_diet',
    name: 'Bất Diệt Tắc',
    category: 'sinh-tử',
    description: 'Thân thể bất hoại — regen 5% HP/turn trong combat.',
    minLevel: 85,
    passive: { description: 'Regen 5% HP/turn combat, +20% max HP', hpMul: 1.2 },
  },
  {
    id: 'dao_ly',
    name: 'Đạo Lý Tắc',
    category: 'đạo-lý',
    description: 'Ngộ ra chân lý — mọi stat +10%.',
    minLevel: 90,
    passive: { description: '+10% tất cả stats', atkMul: 1.1, defMul: 1.1, hpMul: 1.1 },
  },
  {
    id: 'yeu_dao',
    name: 'Yêu Đạo Tắc',
    category: 'tà',
    description: 'Đạo của yêu tộc — biến hóa khôn lường.',
    minLevel: 75,
    passive: { description: '+20% evasion, +15% SPD' },
  },
  {
    id: 'than_dao',
    name: 'Thần Đạo Tắc',
    category: 'thần',
    description: 'Đạo bao trùm vạn pháp — chế áp đối thủ thấp hơn cảnh giới.',
    minLevel: 90,
    passive: { description: '+30% damage đến enemy cấp thấp hơn 5+', atkMul: 1.2 },
  },
  {
    id: 'quy_dao',
    name: 'Quỷ Đạo Tắc',
    category: 'tà',
    description: 'Hấp tinh đại pháp — hút HP của đối thủ.',
    minLevel: 80,
    passive: { description: 'Mỗi đòn đánh hút 10% damage thành HP' },
  },
];

export const getPhapTacById = (id: string): PhapTacDef | undefined =>
  PHAP_TAC_REGISTRY.find((p) => p.id === id);

/** Check pháp tắc unlock được cho player level + canon hiện tại */
export const getAvailablePhapTac = (playerLevel: number, canonPackId?: string): PhapTacDef[] => {
  return PHAP_TAC_REGISTRY.filter((p) => {
    if (p.canonExclusive && p.canonExclusive !== canonPackId) return false;
    return playerLevel >= p.minLevel;
  });
};
