import { Bracketed } from '@shared/components/CornerBracket';

export interface InspectableEntity {
  type: 'character' | 'location' | 'lore_npc' | 'lore_location' | 'lore_item' | 'skill' | 'item';
  name: string;
  description?: string;
  /** Meta fields tuỳ type */
  role?: string;
  personality?: string;
  appearance?: string;
  rarity?: string;
  category?: string;
  level?: number;
}

interface Props {
  entity: InspectableEntity | null;
  onClose: () => void;
}

/**
 * Phase 9.5: Modal "Hồ Sơ Thực Thể" — hiển thị khi click entity gold underline trong narrative.
 * Style tối giản, focus vào info chính. Khác CharacterSheetScreen full-page — modal nhanh, không phá flow đọc.
 */
export const EntityInspectModal = ({ entity, onClose }: Props) => {
  if (!entity) return null;

  const typeLabel = {
    character: 'Nhân Vật',
    location: 'Địa Điểm',
    lore_npc: 'NPC (Tin Đồn)',
    lore_location: 'Địa Điểm (Tin Đồn)',
    lore_item: 'Vật Phẩm (Tin Đồn)',
    item: 'Vật Phẩm',
    skill: 'Kỹ Năng',
  }[entity.type];

  const tone = entity.type.includes('lore') ? 'spirit' : 'gold';

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center p-4"
      style={{ background: 'rgba(8,11,15,.85)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Hồ sơ ${entity.name}`}
    >
      <div className="w-full max-w-md animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <Bracketed className="rounded-md border bg-ink-700 p-6" tone={tone}>
          {/* Header */}
          <div className="mb-4 border-b border-gold-700/30 pb-3">
            <p className="label-section text-[10px] uppercase tracking-widest text-jade-400">
              Hồ Sơ {typeLabel}
            </p>
            <h3 className="mt-1 font-serif text-2xl font-bold tracking-wide text-gold-100">
              {entity.name}
            </h3>
          </div>

          {/* Meta row */}
          {(entity.role || entity.level !== undefined || entity.rarity || entity.category) && (
            <div className="mb-3 flex flex-wrap gap-2">
              {entity.level !== undefined && (
                <span className="rounded-sm border border-jade-500/40 bg-jade-900/30 px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest text-jade-300">
                  Cấp {entity.level}
                </span>
              )}
              {entity.rarity && (
                <span className="rounded-sm border border-gold-500/40 bg-gold-900/30 px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest text-gold-300">
                  {entity.rarity}
                </span>
              )}
              {entity.category && (
                <span className="rounded-sm border border-spirit-500/40 bg-spirit-900/30 px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest text-spirit-300">
                  {entity.category}
                </span>
              )}
              {entity.role && (
                <span className="rounded-sm border border-ember-500/40 bg-ember-900/30 px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest text-ember-300">
                  {entity.role}
                </span>
              )}
            </div>
          )}

          {/* Body */}
          <div className="space-y-3 text-[14px] leading-relaxed">
            {entity.description && (
              <div>
                <p className="label-section mb-1 text-[10px] uppercase tracking-widest text-jade-500">
                  Mô Tả
                </p>
                <p className="text-gold-200">{entity.description}</p>
              </div>
            )}
            {entity.personality && (
              <div>
                <p className="label-section mb-1 text-[10px] uppercase tracking-widest text-jade-500">
                  Tính Cách
                </p>
                <p className="italic text-gold-300">{entity.personality}</p>
              </div>
            )}
            {entity.appearance && (
              <div>
                <p className="label-section mb-1 text-[10px] uppercase tracking-widest text-jade-500">
                  Ngoại Hình
                </p>
                <p className="text-gold-200">{entity.appearance}</p>
              </div>
            )}
            {!entity.description && !entity.personality && !entity.appearance && (
              <p className="italic text-jade-500">Chưa có thông tin chi tiết về {entity.name}.</p>
            )}
          </div>

          {/* Footer */}
          <button
            onClick={onClose}
            className="mt-6 w-full rounded-md border border-gold-500/50 bg-transparent py-2.5 font-serif text-sm font-bold uppercase tracking-widest text-gold-300 transition-all hover:bg-gold-700/20 hover:text-gold-100"
          >
            Đóng
          </button>
        </Bracketed>
      </div>
    </div>
  );
};
