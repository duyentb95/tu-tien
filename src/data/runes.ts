/**
 * Phase 24.A: Rune Registry — 6 loại × 5 tier = 30 rune.
 * Effect per-tier scale ~50% mỗi cấp.
 */
import type { RuneDef, RuneKind } from '@gametypes/skill-deep';

const KIND_LABEL: Record<RuneKind, string> = {
  sat: 'Sát',
  toc: 'Tốc',
  hap: 'Hấp',
  pha: 'Phá',
  sinh: 'Sinh',
  nguyen: 'Nguyên',
};

const TIER_LABEL: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: 'Sơ', 2: 'Tinh', 3: 'Cao', 4: 'Tuyệt', 5: 'Thiên',
};

/** Build effect per kind × tier */
const buildEffect = (kind: RuneKind, tier: 1 | 2 | 3 | 4 | 5): RuneDef['effect'] => {
  const t = tier;
  switch (kind) {
    case 'sat':    return { damageBonus: 0.03 * t * 1.5 };   // 4.5% → 22.5%
    case 'toc':    return { cooldownReduce: 0.025 * t * 1.5 }; // 3.75% → 18.75%
    case 'hap':    return { lifesteal: 0.02 * t * 1.5 };
    case 'pha':    return { penetration: 0.025 * t * 1.5 };
    case 'sinh':   return { healOverTime: 2 * t };
    case 'nguyen': return { costReduce: 0.04 * t * 1.5 };
  }
};

/** Cost theo tier — exponential */
const buildCost = (tier: 1 | 2 | 3 | 4 | 5): RuneDef['craftCost'] => {
  const base = [200, 800, 3000, 12000, 50000][tier - 1]!;
  const tienNgoc = tier >= 4 ? (tier === 4 ? 5 : 20) : undefined;
  const materials = tier >= 2 ? [
    { name: 'Linh Văn Thạch', count: tier },
    ...(tier >= 3 ? [{ name: 'Tinh Hoa Thiên Tài', count: tier - 2 }] : []),
  ] : undefined;
  return {
    linhThach: base,
    ...(tienNgoc ? { tienNgoc } : {}),
    ...(materials ? { materials } : {}),
  };
};

const buildDescription = (kind: RuneKind, tier: 1 | 2 | 3 | 4 | 5): string => {
  const e = buildEffect(kind, tier);
  switch (kind) {
    case 'sat':    return `Tăng +${(e.damageBonus! * 100).toFixed(1)}% damage cho skill chứa rune này.`;
    case 'toc':    return `Giảm -${(e.cooldownReduce! * 100).toFixed(1)}% cooldown skill.`;
    case 'hap':    return `Hấp thu ${(e.lifesteal! * 100).toFixed(1)}% damage gây ra thành HP.`;
    case 'pha':    return `Bỏ qua ${(e.penetration! * 100).toFixed(1)}% DEF kẻ địch.`;
    case 'sinh':   return `+${e.healOverTime} HP regen mỗi turn khi skill này trong slot equip.`;
    case 'nguyen': return `Giảm -${(e.costReduce! * 100).toFixed(1)}% linh khí tiêu hao.`;
  }
};

/** Generate full 30 rune registry */
export const RUNE_REGISTRY: RuneDef[] = (() => {
  const kinds: RuneKind[] = ['sat', 'toc', 'hap', 'pha', 'sinh', 'nguyen'];
  const tiers: Array<1 | 2 | 3 | 4 | 5> = [1, 2, 3, 4, 5];
  const out: RuneDef[] = [];
  for (const k of kinds) {
    for (const t of tiers) {
      out.push({
        id: `rune_${k}_${t}`,
        name: `${KIND_LABEL[k]} Văn ${TIER_LABEL[t]} Cấp`,
        kind: k,
        tier: t,
        effect: buildEffect(k, t),
        craftCost: buildCost(t),
        description: buildDescription(k, t),
      });
    }
  }
  return out;
})();

export const getRuneById = (id: string): RuneDef | undefined =>
  RUNE_REGISTRY.find((r) => r.id === id);

export const RUNE_KIND_LABEL = KIND_LABEL;
export const RUNE_TIER_LABEL = TIER_LABEL;

/** Color theo kind cho UI */
export const RUNE_KIND_COLOR: Record<RuneKind, string> = {
  sat:    'var(--ember-400)',
  toc:    'var(--spirit-300)',
  hap:    'var(--blood-500)',
  pha:    'var(--gold-300)',
  sinh:   'var(--leaf-400)',
  nguyen: 'var(--jade-300)',
};
