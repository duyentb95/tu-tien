import { useState } from 'react';
import { Bracketed } from '@shared/components/CornerBracket';
import { useKeyboard } from '@shared/hooks/useKeyboard';
import { useGameStore } from '@state/game-store';
import { notify } from '@state/notifications';
import {
  INTENT_TIER_NAMES,
} from '@gametypes/cultivation';
import {
  getIntentXpToNext, getIntentDamageMul, MAX_INTENT_LEVEL,
} from '@core/cultivation/intent';
import {
  getDaoXpToNext, getDaoMul, MAX_DAO_LEVEL, MAX_FOCUSED_DAO,
} from '@core/cultivation/dai-dao';
import { PHAP_TAC_REGISTRY, getPhapTacById } from '@data/phap-tac';

interface Props {
  open: boolean;
  onClose: () => void;
}

type Tab = 'intent' | 'phaptac' | 'daidao' | 'ngo' | 'rules';

const TABS: Array<{ id: Tab; label: string; hint: string }> = [
  { id: 'intent', label: 'Ý Cảnh', hint: 'Kiếm/đao/quyền/chỉ/pháp ý — 9 tầng' },
  { id: 'phaptac', label: 'Pháp Tắc', hint: 'Luật trời, ngộ sau Hợp Thể' },
  { id: 'daidao', label: 'Đại Đạo', hint: 'Con đường tu — AI sinh linh hoạt' },
  { id: 'ngo', label: 'Ngộ Đạo', hint: 'Tĩnh tâm cảm ngộ — 50 linh thạch' },
  { id: 'rules', label: 'Quy Tắc', hint: 'Custom rule cho AI' },
];

export const DaoTamModal = ({ open, onClose }: Props) => {
  const cultivation = useGameStore((s) => s.cultivation);
  const player = useGameStore((s) => s.player);
  const settings = useGameStore((s) => s.settings);
  const refreshPhapTacUnlocks = useGameStore((s) => s.refreshPhapTacUnlocks);
  const togglePhapTacActive = useGameStore((s) => s.togglePhapTacActive);
  const toggleDaiDaoFocus = useGameStore((s) => s.toggleDaiDaoFocus);
  const ngoDaoAction = useGameStore((s) => s.ngoDaoAction);
  const addCustomRule = useGameStore((s) => s.addCustomRule);
  const removeCustomRule = useGameStore((s) => s.removeCustomRule);
  const toggleCustomRule = useGameStore((s) => s.toggleCustomRule);

  const [tab, setTab] = useState<Tab>('intent');
  const [ruleInput, setRuleInput] = useState('');
  const [ngoLoading, setNgoLoading] = useState(false);

  useKeyboard({ Escape: onClose }, [onClose], open);

  if (!open) return null;

  const handleRefreshLaws = () => {
    const n = refreshPhapTacUnlocks();
    if (n === 0) notify.info('Chưa đủ duyên', 'Cảnh giới chưa đủ ngộ pháp tắc mới');
  };

  const handleNgoDao = async () => {
    if (ngoLoading) return;
    setNgoLoading(true);
    await ngoDaoAction();
    setNgoLoading(false);
  };

  const handleAddRule = () => {
    const t = ruleInput.trim();
    if (!t) return;
    if (t.length > 200) {
      notify.warn('Quá dài', 'Tối đa 200 ký tự');
      return;
    }
    addCustomRule(t);
    setRuleInput('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,11,15,.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '92vh' }}
      >
        <Bracketed className="rounded-md border bg-ink-700" tone="gold">
          <div className="flex flex-col" style={{ maxHeight: '88vh' }}>
            <header className="flex items-start justify-between border-b border-gold-700/15 px-6 py-4">
              <div>
                <div className="label-section mb-1">Đạo Tâm</div>
                <h2 className="font-serif text-2xl font-bold uppercase tracking-wider text-gold-200">
                  Tu Tâm Dưỡng Tính
                </h2>
                <p className="mt-1 text-[12px] italic text-jade-500">
                  Hiểu rõ thân pháp, cảm ngộ ý cảnh, ngộ đạo bình thiên hạ.
                </p>
              </div>
              <button onClick={onClose} className="text-gold-500 text-xl px-2">✕</button>
            </header>

            {/* Tabs */}
            <nav className="flex border-b border-gold-700/15 px-2 overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-3 py-2 text-[13px] font-semibold whitespace-nowrap transition ${
                    tab === t.id
                      ? 'text-gold-200 border-b-2 border-gold-500'
                      : 'text-jade-500 hover:text-gold-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            <div className="overflow-y-auto px-6 py-4 flex-1">
              {tab === 'intent' && (
                <section>
                  <p className="text-[12px] italic text-jade-500 mb-3">
                    Ý cảnh tăng theo loại skill bạn dùng trong combat. Cấp cao → damage skill cùng loại +5%/cấp (tối đa +40%).
                  </p>
                  {Object.keys(cultivation.intents).length === 0 ? (
                    <div className="text-jade-500/70 italic text-sm py-6 text-center">
                      Chưa khởi ý cảnh nào. Dùng kĩ năng trong combat sẽ tự động tích lũy.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(cultivation.intents).map(([name, entry]) => {
                        const needed = getIntentXpToNext(entry.level);
                        const pct = needed === Infinity ? 100 : Math.min(100, (entry.xp / needed) * 100);
                        const tier = INTENT_TIER_NAMES[entry.level] ?? `Tầng ${entry.level}`;
                        return (
                          <div key={name} className="border border-gold-700/20 rounded p-3 bg-ink-900/50">
                            <div className="flex justify-between items-baseline">
                              <span className="font-serif text-gold-200 font-bold">{name}</span>
                              <span className="text-xs text-gold-400">
                                Cấp {entry.level}/{MAX_INTENT_LEVEL} · {tier} · ×{getIntentDamageMul(entry.level).toFixed(2)}
                              </span>
                            </div>
                            <div className="mt-2 h-2 bg-ink-900 rounded overflow-hidden">
                              <div className="h-full bg-gold-500/80" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="text-[11px] text-jade-500 mt-1">
                              {entry.xp.toLocaleString()} / {needed === Infinity ? '∞' : needed.toLocaleString()} XP · Đã dùng {entry.totalUses} lần
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {tab === 'phaptac' && (
                <section>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[12px] italic text-jade-500">
                      Ngộ được khi cảnh giới đủ cao. Active tối đa 3 cùng lúc.
                    </p>
                    <button
                      onClick={handleRefreshLaws}
                      className="text-xs px-3 py-1 border border-gold-700/40 rounded text-gold-300 hover:bg-gold-900/20"
                    >
                      Kiểm tra ngộ pháp tắc
                    </button>
                  </div>
                  <div className="space-y-2">
                    {PHAP_TAC_REGISTRY.map((law) => {
                      const isUnlocked = cultivation.laws.unlocked.includes(law.id);
                      const isActive = cultivation.laws.active.includes(law.id);
                      const playerLv = player?.level ?? 1;
                      return (
                        <div key={law.id} className={`border rounded p-3 ${isUnlocked ? 'border-gold-700/40 bg-ink-900/50' : 'border-ink-700/40 bg-ink-900/30 opacity-60'}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-serif text-gold-200 font-bold">{law.name}</span>
                              <span className="ml-2 text-[10px] uppercase text-jade-500">[{law.category}]</span>
                              <p className="text-[12px] text-gold-400 mt-1">{law.description}</p>
                              <p className="text-[11px] text-jade-400 italic mt-1">{law.passive.description}</p>
                            </div>
                            <div className="flex flex-col items-end ml-3 gap-1">
                              {isUnlocked ? (
                                <button
                                  onClick={() => {
                                    const r = togglePhapTacActive(law.id);
                                    if (!r.ok && r.message) notify.warn('Không thể', r.message);
                                  }}
                                  className={`text-[11px] px-2 py-1 rounded border ${
                                    isActive
                                      ? 'border-ember-500 text-ember-300 bg-ember-900/30'
                                      : 'border-gold-700 text-gold-300 hover:bg-gold-900/20'
                                  }`}
                                >
                                  {isActive ? '✓ Đang tu' : 'Kích hoạt'}
                                </button>
                              ) : (
                                <span className="text-[11px] text-jade-500/70">
                                  Cần cấp {law.minLevel} (bạn lv {playerLv})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {tab === 'daidao' && (
                <section>
                  <p className="text-[12px] italic text-jade-500 mb-3">
                    Đại đạo do AI sinh theo cốt truyện / Ngộ Đạo action. Focus tối đa {MAX_FOCUSED_DAO} đạo chính.
                  </p>
                  {Object.keys(cultivation.dao.paths).length === 0 ? (
                    <div className="text-jade-500/70 italic text-sm py-6 text-center">
                      Chưa ngộ đạo nào. Sang tab "Ngộ Đạo" để bắt đầu.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(cultivation.dao.paths).map(([key, entry]) => {
                        const needed = getDaoXpToNext(entry.level);
                        const pct = needed === Infinity ? 100 : Math.min(100, (entry.xp / needed) * 100);
                        const isFocused = cultivation.dao.focused.includes(key);
                        return (
                          <div key={key} className={`border rounded p-3 ${isFocused ? 'border-ember-700/60 bg-ember-900/15' : 'border-gold-700/20 bg-ink-900/50'}`}>
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-serif text-gold-200 font-bold">{entry.name}</span>
                                {entry.element && (
                                  <span className="ml-2 text-[10px] uppercase text-spirit-400">[{entry.element}]</span>
                                )}
                                <p className="text-[12px] text-jade-400 italic mt-1">{entry.description}</p>
                              </div>
                              <button
                                onClick={() => {
                                  const r = toggleDaiDaoFocus(key);
                                  if (!r.ok && r.message) notify.warn('Không thể', r.message);
                                }}
                                className={`text-[11px] px-2 py-1 rounded border ${
                                  isFocused
                                    ? 'border-ember-500 text-ember-300'
                                    : 'border-gold-700 text-gold-300 hover:bg-gold-900/20'
                                }`}
                              >
                                {isFocused ? '★ Focus' : 'Focus'}
                              </button>
                            </div>
                            <div className="flex justify-between text-xs text-gold-400 mt-2">
                              <span>Cấp {entry.level}/{MAX_DAO_LEVEL} · ×{getDaoMul(entry.level).toFixed(2)}</span>
                              <span>{entry.xp.toLocaleString()} / {needed === Infinity ? '∞' : needed.toLocaleString()}</span>
                            </div>
                            <div className="mt-1 h-2 bg-ink-900 rounded overflow-hidden">
                              <div className="h-full bg-ember-500/80" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {tab === 'ngo' && (
                <section className="space-y-4">
                  <div className="border border-gold-700/30 rounded p-4 bg-ink-900/50">
                    <h3 className="font-serif text-gold-200 text-lg font-bold mb-2">Tĩnh Tâm Ngộ Đạo</h3>
                    <p className="text-[13px] text-jade-400 mb-3">
                      Tiêu <span className="text-gold-300 font-mono">50 linh thạch</span> để tĩnh tâm thiền định.
                      Có 5% cơ hội ngộ ra đại đạo mới, 60% boost XP cho đạo focused, hoặc thu được EP / cảm ngộ thoáng qua.
                    </p>
                    <button
                      onClick={handleNgoDao}
                      disabled={ngoLoading || !player || player.currency < 50}
                      className="w-full py-2 border border-gold-500 text-gold-200 bg-gold-900/20 hover:bg-gold-900/40 disabled:opacity-40 disabled:cursor-not-allowed rounded font-semibold"
                    >
                      {ngoLoading ? 'Đang thiền định...' : '🧘 Tĩnh Tâm Ngộ Đạo'}
                    </button>
                    <p className="text-[11px] text-jade-500 mt-2 text-center">
                      Linh thạch hiện có: <span className="text-gold-300 font-mono">{player?.currency?.toLocaleString() ?? 0}</span>
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gold-300 mb-2">Cảm ngộ gần đây</h4>
                    {cultivation.recentInsights.length === 0 ? (
                      <p className="text-xs text-jade-500/70 italic">Chưa có cảm ngộ nào.</p>
                    ) : (
                      <ul className="space-y-1">
                        {cultivation.recentInsights.slice(0, 10).map((ins, i) => (
                          <li key={i} className="text-[12px] text-jade-300 border-l-2 border-gold-700/40 pl-2">
                            <span className="text-gold-500 font-mono">[T{ins.turn}]</span> {ins.text}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
              )}

              {tab === 'rules' && (
                <section>
                  <p className="text-[12px] italic text-jade-500 mb-3">
                    Quy tắc bạn đặt — AI tuân thủ trong mọi narrative.
                  </p>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={ruleInput}
                      onChange={(e) => setRuleInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddRule(); }}
                      placeholder='Vd: "Không bao giờ giết NPC chính nguyên tác"'
                      className="flex-1 bg-ink-900 border border-gold-700/30 rounded px-3 py-2 text-sm text-gold-200"
                    />
                    <button
                      onClick={handleAddRule}
                      className="px-4 py-2 border border-gold-500 text-gold-200 bg-gold-900/20 hover:bg-gold-900/40 rounded text-sm"
                    >
                      + Thêm
                    </button>
                  </div>
                  <div className="space-y-1">
                    {(settings.customRules ?? []).map((r) => (
                      <div key={r.id} className={`flex items-center justify-between gap-2 border rounded px-3 py-2 ${r.enabled ? 'border-gold-700/30 bg-ink-900/40' : 'border-ink-700/30 bg-ink-900/20 opacity-50'}`}>
                        <label className="flex-1 flex gap-2 items-center text-[13px] text-gold-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={r.enabled}
                            onChange={() => toggleCustomRule(r.id)}
                            className="accent-gold-500"
                          />
                          {r.rule}
                        </label>
                        <button
                          onClick={() => removeCustomRule(r.id)}
                          className="text-xs text-ember-400 hover:text-ember-300"
                          aria-label="Xóa quy tắc"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {(settings.customRules ?? []).length === 0 && (
                      <p className="text-xs text-jade-500/70 italic text-center py-4">
                        Chưa có quy tắc nào.
                      </p>
                    )}
                  </div>
                </section>
              )}
            </div>

            <footer className="border-t border-gold-700/15 px-6 py-3 flex justify-between items-center text-[11px] text-jade-500">
              <span>{TABS.find((x) => x.id === tab)?.hint}</span>
              <button
                onClick={onClose}
                className="px-3 py-1 border border-gold-700/30 rounded text-gold-300 hover:bg-gold-900/20"
              >
                Đóng (Esc)
              </button>
            </footer>
          </div>
        </Bracketed>
      </div>
    </div>
  );
};

// Helper unused so getPhapTacById doesn't error on lint; surface for downstream uses.
void getPhapTacById;
