import { useMemo, useState } from 'react';
import { useGameStore, selectQuests } from '@state/game-store';
import { Bracketed } from '@shared/components/CornerBracket';
import type { QuestStatus } from '@gametypes/quest';

const KIND_STYLE: Record<string, { color: string; label: string; icon: string }> = {
  main: { color: '#cda45e', label: 'Chính Tuyến', icon: '◆' },
  side: { color: '#8ba888', label: 'Nhiệm Vụ Phụ', icon: '◇' },
  sect: { color: '#a78bfa', label: 'Tông Môn', icon: '◈' },
  cultivation: { color: '#7fbce8', label: 'Tu Luyện', icon: '✦' },
  hidden: { color: '#d97757', label: 'Ẩn Tuyến', icon: '✧' },
};

const STATUS_STYLE: Record<QuestStatus, { color: string; label: string }> = {
  active: { color: '#cda45e', label: 'Đang Diễn Ra' },
  completed: { color: '#8fc98c', label: 'Hoàn Thành' },
  failed: { color: '#8a2f2f', label: 'Thất Bại' },
  abandoned: { color: '#5e7a5d', label: 'Từ Bỏ' },
};

export const QuestsScreen = () => {
  const quests = useGameStore(selectQuests);
  const setStage = useGameStore((s) => s.setStage);
  const turn = useGameStore((s) => s.turn);
  const [filter, setFilter] = useState<QuestStatus | 'all'>('active');

  const list = useMemo(() => Object.values(quests), [quests]);
  const filtered = useMemo(
    () => (filter === 'all' ? list : list.filter((q) => q.status === filter)),
    [list, filter],
  );
  const counts = useMemo(
    () => ({
      active: list.filter((q) => q.status === 'active').length,
      completed: list.filter((q) => q.status === 'completed').length,
      failed: list.filter((q) => q.status === 'failed').length,
      abandoned: list.filter((q) => q.status === 'abandoned').length,
      all: list.length,
    }),
    [list],
  );

  return (
    <main className="min-h-screen px-6 py-8 lg:px-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-gold-700/15 pb-4">
        <div>
          <div className="label-section mb-2">Sổ Tay · Hành Trình Đại Đạo</div>
          <h1 className="font-serif text-[30px] font-bold uppercase tracking-wider text-gold-200">
            Nhiệm Vụ
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider text-jade-500">Đang nhận</div>
            <div className="font-mono text-2xl text-gold-500">{counts.active}</div>
          </div>
          <button onClick={() => setStage('playing')} className="btn-jade text-[13px]">
            ← Quay lại
          </button>
        </div>
      </header>

      {/* Filter tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {(
          [
            ['all', `Tất Cả (${counts.all})`],
            ['active', `Đang (${counts.active})`],
            ['completed', `Hoàn Thành (${counts.completed})`],
            ['failed', `Thất Bại (${counts.failed})`],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setFilter(k as QuestStatus | 'all')}
            className="rounded-sm border px-3 py-1.5 text-[12.5px] transition-colors"
            style={{
              borderColor: filter === k ? 'var(--gold-500)' : 'rgba(205,164,94,.2)',
              color: filter === k ? 'var(--gold-100)' : 'var(--gold-300)',
              background: filter === k ? 'rgba(205,164,94,.08)' : 'transparent',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Bracketed className="rounded-md border bg-ink-700 p-16 text-center" tone="jade">
          <p className="font-serif italic text-jade-500">
            {list.length === 0
              ? 'Chưa nhận được nhiệm vụ nào. Hãy phiêu lưu để gặp cơ duyên…'
              : 'Không có nhiệm vụ thuộc trạng thái này.'}
          </p>
        </Bracketed>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((q) => {
            const kindStyle = KIND_STYLE[q.kind] ?? KIND_STYLE.side!;
            const statStyle = STATUS_STYLE[q.status];
            const turnsAgo = turn - q.acceptedAtTurn;
            return (
              <Bracketed
                key={q.id}
                tone={q.status === 'completed' ? 'jade' : q.status === 'failed' ? 'ember' : 'gold'}
                className="rounded-md border bg-ink-700 p-5"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono text-xl leading-none"
                      style={{ color: kindStyle.color }}
                    >
                      {kindStyle.icon}
                    </span>
                    <div>
                      <div className="label-section">{kindStyle.label}</div>
                      <h2 className="font-serif text-lg text-gold-200">{q.title}</h2>
                    </div>
                  </div>
                  <span
                    className="flex-shrink-0 rounded-sm px-2 py-0.5 text-[10.5px] uppercase tracking-wider"
                    style={{
                      color: statStyle.color,
                      background: `${statStyle.color}1a`,
                      border: `1px solid ${statStyle.color}66`,
                    }}
                  >
                    {statStyle.label}
                  </span>
                </div>

                <p className="mb-3 font-serif text-[13px] italic leading-relaxed text-gold-300">
                  {q.description}
                </p>

                {q.objectives.length > 0 && (
                  <div className="mb-3">
                    <div className="label-section mb-1.5">Mục Tiêu</div>
                    <ul className="space-y-1 text-[12.5px] text-gold-300">
                      {q.objectives.map((o, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-gold-500">○</span>
                          <span>{o}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-gold-700/15 pt-2 text-[11px] text-jade-500">
                  {q.giver && (
                    <span>
                      Giao bởi: <span className="text-gold-400">{q.giver}</span>
                    </span>
                  )}
                  <span className="font-mono">
                    {q.status === 'completed' && q.completedAtTurn
                      ? `Xong lượt ${q.completedAtTurn}`
                      : `Đã ${turnsAgo} lượt`}
                  </span>
                </div>
              </Bracketed>
            );
          })}
        </div>
      )}
    </main>
  );
};
