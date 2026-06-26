import { useState, useMemo } from 'react';
import { Bracketed } from '@shared/components/CornerBracket';
import { useKeyboard } from '@shared/hooks/useKeyboard';
import { useGameStore } from '@state/game-store';

/**
 * Tàng Thư — modal hiển thị 2-tier lore.
 *
 * Tabs:
 *   - Tin Đồn: lore_npcs/locations chưa materialized (player nghe nhưng chưa gặp)
 *   - Đã Chứng Kiến: lore đã materialized + world entities có loreId
 *
 * Mỗi entry hiển thị: tên, mô tả, source (ai kể), turn introduced.
 * Materialized lore có badge "✓ Đã gặp" + link tới world entity.
 */
interface Props {
  open: boolean;
  onClose: () => void;
}

type Tab = 'rumors' | 'witnessed';

export const LoreBookModal = ({ open, onClose }: Props) => {
  const knowledge = useGameStore((s) => s.knowledge);
  const [tab, setTab] = useState<Tab>('rumors');

  useKeyboard({ Escape: onClose }, [onClose], open);

  const npcs = useMemo(() => Object.values(knowledge.loreNpcs), [knowledge.loreNpcs]);
  const locs = useMemo(() => Object.values(knowledge.loreLocations), [knowledge.loreLocations]);
  const items = useMemo(() => Object.values(knowledge.loreItems), [knowledge.loreItems]);
  const quests = useMemo(() => Object.values(knowledge.loreQuests), [knowledge.loreQuests]);

  const rumorsCount =
    npcs.filter((n) => !n.materialized).length +
    locs.filter((l) => !l.materialized).length +
    items.filter((i) => !i.materialized).length +
    quests.filter((q) => !q.assigned).length;

  const witnessedCount =
    npcs.filter((n) => n.materialized).length +
    locs.filter((l) => l.materialized).length;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,11,15,.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lorebook-title"
    >
      <div
        className="relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90vh' }}
      >
        <Bracketed className="rounded-md border bg-ink-700" tone="gold">
          <div className="flex flex-col" style={{ maxHeight: '85vh' }}>
            {/* Header */}
            <header className="border-b border-gold-700/15 px-6 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="label-section mb-1">Tri Thức · Mạch Truyện</div>
                  <h2 id="lorebook-title" className="font-serif text-2xl font-bold uppercase tracking-wider text-gold-200">
                    Tàng Thư
                  </h2>
                  <p className="mt-1 text-[12px] italic text-jade-500">
                    Nơi ghi chép tin đồn nghe được + những gì ngươi đã chứng kiến trong giang hồ.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-sm p-2 text-2xl text-gold-300 transition-colors hover:text-gold-100"
                  aria-label="Đóng (Esc)"
                  title="Đóng (Esc)"
                >
                  ⊗
                </button>
              </div>

              <nav className="mt-4 flex gap-1" role="tablist">
                <TabBtn
                  active={tab === 'rumors'}
                  label={`Tin Đồn (${rumorsCount})`}
                  onClick={() => setTab('rumors')}
                />
                <TabBtn
                  active={tab === 'witnessed'}
                  label={`Đã Chứng Kiến (${witnessedCount})`}
                  onClick={() => setTab('witnessed')}
                />
              </nav>
            </header>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: '65vh' }}>
              {tab === 'rumors' && (
                <div className="space-y-5">
                  <Section title="Nhân vật nghe đồn" icon="✦">
                    {npcs.filter((n) => !n.materialized).length === 0 ? (
                      <Empty msg="Chưa nghe đồn về nhân vật nào." />
                    ) : (
                      npcs.filter((n) => !n.materialized).map((n) => (
                        <LoreCard
                          key={n.id}
                          name={n.name}
                          description={n.description}
                          source={n.source}
                          turn={n.introducedAtTurn}
                        />
                      ))
                    )}
                  </Section>

                  <Section title="Địa danh nghe đồn" icon="◉">
                    {locs.filter((l) => !l.materialized).length === 0 ? (
                      <Empty msg="Chưa nghe đồn về địa danh nào." />
                    ) : (
                      locs.filter((l) => !l.materialized).map((l) => (
                        <LoreCard
                          key={l.id}
                          name={l.name}
                          description={l.description}
                          source={l.source}
                          turn={l.introducedAtTurn}
                          extraTag={l.region}
                        />
                      ))
                    )}
                  </Section>

                  <Section title="Bảo vật nghe đồn" icon="☆">
                    {items.filter((i) => !i.materialized).length === 0 ? (
                      <Empty msg="Chưa nghe đồn về bảo vật nào." />
                    ) : (
                      items.filter((i) => !i.materialized).map((i) => (
                        <LoreCard
                          key={i.id}
                          name={i.name}
                          description={i.description}
                          source={i.source}
                          turn={i.introducedAtTurn}
                          extraTag={i.rarity}
                        />
                      ))
                    )}
                  </Section>

                  <Section title="Nhiệm vụ nghe phong thanh" icon="◇">
                    {quests.filter((q) => !q.assigned).length === 0 ? (
                      <Empty msg="Chưa nghe đồn về nhiệm vụ nào." />
                    ) : (
                      quests.filter((q) => !q.assigned).map((q) => (
                        <LoreCard
                          key={q.id}
                          name={q.title}
                          description={q.description}
                          source={q.source}
                          turn={q.introducedAtTurn}
                        />
                      ))
                    )}
                  </Section>
                </div>
              )}

              {tab === 'witnessed' && (
                <div className="space-y-5">
                  <Section title="Nhân vật đã gặp" icon="✓">
                    {npcs.filter((n) => n.materialized).length === 0 ? (
                      <Empty msg="Chưa gặp ai trong tin đồn." />
                    ) : (
                      npcs.filter((n) => n.materialized).map((n) => (
                        <LoreCard
                          key={n.id}
                          name={n.name}
                          description={n.description}
                          source={n.source}
                          turn={n.introducedAtTurn}
                          materialized
                        />
                      ))
                    )}
                  </Section>

                  <Section title="Địa danh đã đến" icon="✓">
                    {locs.filter((l) => l.materialized).length === 0 ? (
                      <Empty msg="Chưa đến địa danh nào trong tin đồn." />
                    ) : (
                      locs.filter((l) => l.materialized).map((l) => (
                        <LoreCard
                          key={l.id}
                          name={l.name}
                          description={l.description}
                          source={l.source}
                          turn={l.introducedAtTurn}
                          materialized
                        />
                      ))
                    )}
                  </Section>
                </div>
              )}
            </div>

            <footer className="border-t border-gold-700/15 px-6 py-3 text-center text-[11px] italic text-jade-500">
              💡 Lore xuất hiện khi AI tạo tin đồn (foreshadowing) → khi nhân vật gặp thật, lore tự "Đã Chứng Kiến".
            </footer>
          </div>
        </Bracketed>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

const TabBtn = ({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="rounded-sm px-3 py-2 text-[12.5px] transition-colors whitespace-nowrap"
    style={{
      color: active ? 'var(--gold-100)' : 'var(--gold-300)',
      background: active ? 'rgba(205,164,94,.1)' : 'transparent',
      borderBottom: active ? '2px solid var(--gold-500)' : '2px solid transparent',
      minHeight: 40,
    }}
  >
    {label}
  </button>
);

const Section = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
  <div>
    <div className="label-gold mb-2 flex items-center gap-2">
      <span aria-hidden style={{ color: 'var(--gold-500)' }}>{icon}</span>
      {title}
    </div>
    <div className="space-y-2">{children}</div>
  </div>
);

const Empty = ({ msg }: { msg: string }) => (
  <p className="rounded-sm border border-jade-700/30 bg-jade-700/5 p-3 text-center text-[11.5px] italic text-jade-500">
    {msg}
  </p>
);

interface LoreCardProps {
  name: string;
  description: string;
  source?: string;
  turn?: number;
  extraTag?: string;
  materialized?: boolean;
}
const LoreCard = ({ name, description, source, turn, extraTag, materialized }: LoreCardProps) => (
  <div
    className="rounded-sm border bg-ink-800/40 p-3"
    style={{ borderColor: materialized ? 'rgba(127,174,110,.3)' : 'rgba(205,164,94,.15)' }}
  >
    <div className="mb-1 flex items-center gap-2">
      <h4 className="font-serif text-[14px] font-medium text-gold-200">{name}</h4>
      {materialized && (
        <span className="rounded-sm border border-leaf-500/40 bg-leaf-500/5 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-leaf-500">
          ✓ Đã gặp
        </span>
      )}
      {extraTag && (
        <span className="rounded-sm border border-gold-700/30 bg-gold-500/5 px-1.5 py-0.5 text-[10px] text-gold-300">
          {extraTag}
        </span>
      )}
    </div>
    <p className="text-[12.5px] leading-relaxed text-gold-300/90">{description}</p>
    {(source || turn !== undefined) && (
      <div className="mt-2 flex items-center gap-2 text-[10.5px] italic text-jade-500">
        {source && <span>Nguồn: {source}</span>}
        {turn !== undefined && (
          <>
            {source && <span>·</span>}
            <span>Lượt {turn}</span>
          </>
        )}
      </div>
    )}
  </div>
);
