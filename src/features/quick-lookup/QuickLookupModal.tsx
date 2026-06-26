import { useMemo, useState } from 'react';
import { useGameStore } from '@state/game-store';
import { Bracketed } from '@shared/components/CornerBracket';

type TabKey = 'npcs' | 'skills' | 'items' | 'locations';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Callback khi user click "Thêm vào ô chat" — append entity name vào action input */
  onInsertToChat?: (name: string) => void;
}

interface EntityCard {
  name: string;
  description: string;
  meta?: string;
  rarity?: string;
  category?: string;
  owned?: boolean;
}

const TAB_LABELS: Record<TabKey, string> = {
  npcs: 'NPCs',
  skills: 'Kỹ Năng',
  items: 'Vật Phẩm',
  locations: 'Địa Điểm',
};

/**
 * Phase 9.4: "Tra Cứu Nhanh" — modal 4 tabs với search bar, thay thế Cẩm Nang truyền thống.
 *
 * Tham khảo style từ docs/reference/google-canvas-rpg-reference.tsx — UX nhanh,
 * search-first, click "Thêm vào ô chat" để insert reference.
 */
export const QuickLookupModal = ({ open, onClose, onInsertToChat }: Props) => {
  const knowledge = useGameStore((s) => s.knowledge);
  const inventory = useGameStore((s) => s.inventory);
  const skills = useGameStore((s) => s.skills);

  const [activeTab, setActiveTab] = useState<TabKey>('npcs');
  const [searchTerm, setSearchTerm] = useState('');

  // Gom data theo từng tab
  const entities = useMemo<Record<TabKey, EntityCard[]>>(() => {
    // NPCs — gộp loreNpcs với character (nếu có name)
    const npcs: EntityCard[] = [];
    for (const lid of Object.values(knowledge.loreNpcs ?? {})) {
      const e = lid as { name?: string; description?: string; role?: string; materialized?: boolean };
      if (e.name) {
        npcs.push({
          name: e.name,
          description: e.description ?? '(Chưa rõ)',
          ...(e.role ? { meta: e.role } : {}),
          ...(e.materialized !== undefined ? { owned: e.materialized } : {}),
        });
      }
    }

    // Locations — gộp lore với world
    const locations: EntityCard[] = [];
    for (const loc of Object.values(knowledge.locations ?? {})) {
      const e = loc as { name?: string; description?: string; category?: string };
      if (e.name) {
        locations.push({
          name: e.name,
          description: e.description ?? '(Chưa khám phá)',
          ...(e.category ? { category: e.category } : {}),
          owned: true,
        });
      }
    }
    for (const lid of Object.values(knowledge.loreLocations ?? {})) {
      const e = lid as { name?: string; description?: string; region?: string };
      if (e.name && !locations.some((x) => x.name === e.name)) {
        locations.push({
          name: e.name,
          description: e.description ?? '(Tin đồn)',
          ...(e.region ? { meta: e.region } : {}),
          owned: false,
        });
      }
    }

    // Items — gộp inventory với loreItems
    const items: EntityCard[] = [];
    for (const it of Object.values(inventory ?? {})) {
      const e = it as { name?: string; description?: string; rarity?: string; category?: string };
      if (e.name) {
        items.push({
          name: e.name,
          description: e.description ?? '(Vật phẩm)',
          ...(e.rarity ? { rarity: e.rarity } : {}),
          ...(e.category ? { category: e.category } : {}),
          owned: true,
        });
      }
    }
    for (const lid of Object.values(knowledge.loreItems ?? {})) {
      const e = lid as { name?: string; description?: string; rarity?: string; category?: string };
      if (e.name && !items.some((x) => x.name === e.name)) {
        items.push({
          name: e.name,
          description: e.description ?? '(Tin đồn)',
          ...(e.rarity ? { rarity: e.rarity } : {}),
          ...(e.category ? { category: e.category } : {}),
          owned: false,
        });
      }
    }

    // Skills
    const skillsList: EntityCard[] = [];
    for (const sk of Object.values(skills ?? {})) {
      const e = sk as { name?: string; description?: string; kind?: string; rarity?: string };
      if (e.name) {
        skillsList.push({
          name: e.name,
          description: e.description ?? '(Kỹ năng)',
          ...(e.kind ? { meta: e.kind === 'combat_basic' ? 'Cơ bản' : e.kind === 'combat_ultimate' ? 'Tuyệt kỹ' : 'Phiêu lưu' } : {}),
          ...(e.rarity ? { rarity: e.rarity } : {}),
          owned: true,
        });
      }
    }

    return { npcs, skills: skillsList, items, locations };
  }, [knowledge.loreNpcs, knowledge.locations, knowledge.loreLocations, knowledge.loreItems, inventory, skills]);

  // Filter theo search term
  const filtered = useMemo(() => {
    const list = entities[activeTab];
    const q = searchTerm.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (e) => e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q),
    );
  }, [entities, activeTab, searchTerm]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-4"
      style={{ background: 'rgba(8,11,15,.88)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Tra cứu nhanh"
    >
      <div className="w-full max-w-2xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <Bracketed className="flex max-h-[85vh] flex-col rounded-md border bg-ink-700 p-5 sm:p-6" tone="gold">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between border-b border-gold-700/30 pb-3">
            <h2 className="flex items-center gap-2 font-serif text-xl font-bold tracking-wide text-gold-200">
              <span aria-hidden>📜</span> Tra Cứu Nhanh
            </h2>
            <button
              onClick={onClose}
              className="text-xs font-bold uppercase tracking-widest text-jade-500 hover:text-gold-300"
              aria-label="Đóng"
            >
              × Đóng
            </button>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex flex-shrink-0 border-b border-gold-700/30">
            {(Object.keys(TAB_LABELS) as TabKey[]).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSearchTerm('');
                }}
                className={`flex-1 px-3 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-gold-500 bg-gold-900/10 text-gold-200'
                    : 'border-b border-transparent text-jade-500 hover:bg-ink-500/30 hover:text-gold-300'
                }`}
              >
                {TAB_LABELS[tab]}
                <span className="ml-1 font-mono text-[10px] text-jade-600">
                  ({entities[tab].length})
                </span>
              </button>
            ))}
          </div>

          {/* Search bar */}
          <input
            type="text"
            placeholder={`Tìm kiếm trong ${TAB_LABELS[activeTab]}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4 w-full flex-shrink-0 rounded-md border border-gold-700/40 bg-ink-900 px-3 py-2.5 text-sm text-gold-200 placeholder-jade-600 outline-none focus:border-gold-500"
            autoFocus
          />

          {/* Entity list */}
          <div className="flex-grow overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <p className="py-12 text-center italic text-jade-500">
                {searchTerm
                  ? `Không tìm thấy "${searchTerm}" trong ${TAB_LABELS[activeTab]}.`
                  : `Chưa có ${TAB_LABELS[activeTab]} nào trong tri thức.`}
              </p>
            ) : (
              <ul className="space-y-2">
                {filtered.map((entity) => (
                  <li
                    key={entity.name}
                    className="rounded-md border border-gold-700/30 bg-ink-900/50 p-3 transition-colors hover:border-gold-500/60 hover:bg-ink-500/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-serif text-base font-semibold text-gold-200">
                            {entity.name}
                          </h3>
                          {entity.rarity && (
                            <span className="rounded-sm border border-gold-500/40 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gold-400">
                              {entity.rarity}
                            </span>
                          )}
                          {entity.meta && (
                            <span className="text-[10px] uppercase tracking-widest text-jade-500">
                              {entity.meta}
                            </span>
                          )}
                          {entity.owned === false && (
                            <span className="rounded-sm border border-spirit-500/40 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-spirit-400">
                              Tin đồn
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-jade-300">
                          {entity.description.length > 150
                            ? entity.description.slice(0, 150) + '...'
                            : entity.description}
                        </p>
                      </div>
                      {onInsertToChat && (
                        <button
                          onClick={() => {
                            onInsertToChat(entity.name);
                            onClose();
                          }}
                          className="flex-shrink-0 rounded-sm border border-gold-500/40 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-gold-400 transition-colors hover:bg-gold-700/20 hover:text-gold-200"
                          title="Chèn tên vào ô hành động"
                        >
                          + Chat
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer hint */}
          <div className="mt-4 flex-shrink-0 border-t border-gold-700/30 pt-3">
            <p className="text-center text-[11px] italic text-jade-600">
              💡 Click <strong className="text-gold-400">+ Chat</strong> để chèn tên vào ô hành động, hoặc click entity trong narrative để xem chi tiết.
            </p>
          </div>
        </Bracketed>
      </div>
    </div>
  );
};
