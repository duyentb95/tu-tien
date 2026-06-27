import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useKeyboard } from '@shared/hooks/useKeyboard';
import {
  useGameStore,
  selectPlayer,
  selectStoryLog,
  selectActions,
  selectActionChoices,
  selectAiPhase,
  selectIsAiThinking,
  selectLastError,
  selectSettings,
} from '@state/game-store';
import { Bracketed } from '@shared/components/CornerBracket';
import { PlayerSidebar } from './PlayerSidebar';
import { StoryView } from './StoryView';
import { ActionPanel } from './ActionPanel';
// WelcomeOverlay nhẹ — eager (luôn cần check first-time)
import { WelcomeOverlay } from '@features/tutorial/WelcomeOverlay';
import { SceneBackground } from '@shared/components/SceneBackground';
import { getLocation } from '@data/default-world';
import { autoBackup } from '@services/save-manager';

// Lazy: 3 modal nặng — chỉ load khi user mở
const HandbookModal = lazy(() =>
  import('@features/tutorial').then((m) => ({ default: m.HandbookModal })),
);
const QuickLookupModal = lazy(() =>
  import('@features/quick-lookup/QuickLookupModal').then((m) => ({ default: m.QuickLookupModal })),
);
const SaveManagerModal = lazy(() =>
  import('@features/save-manager').then((m) => ({ default: m.SaveManagerModal })),
);
const LoreBookModal = lazy(() =>
  import('@features/lore-book').then((m) => ({ default: m.LoreBookModal })),
);
const CustomRulesModal = lazy(() =>
  import('@features/custom-rules').then((m) => ({ default: m.CustomRulesModal })),
);
const TournamentModal = lazy(() =>
  import('@features/tournament').then((m) => ({ default: m.TournamentModal })),
);
const AchievementsModal = lazy(() =>
  import('@features/achievements').then((m) => ({ default: m.AchievementsModal })),
);
const SkillManagementModal = lazy(() =>
  import('@features/skill-management/SkillManagementModal').then((m) => ({ default: m.SkillManagementModal })),
);
const TraderModal = lazy(() =>
  import('@features/trader/TraderModal').then((m) => ({ default: m.TraderModal })),
);
const AIStatusModal = lazy(() =>
  import('@features/ai-status/AIStatusModal').then((m) => ({ default: m.AIStatusModal })),
);
// AIStatusDot nhẹ → eager import (header luôn render)
import { AIStatusDot } from '@features/ai-status/AIStatusDot';
import { AIFallbackBanner } from '@features/ai-status/AIFallbackBanner';

export const GameplayScreen = () => {
  const player = useGameStore(selectPlayer);
  const storyLog = useGameStore(selectStoryLog);
  const actions = useGameStore(selectActions);
  const actionChoices = useGameStore(selectActionChoices);
  const isAiThinking = useGameStore(selectIsAiThinking);
  const aiPhase = useGameStore(selectAiPhase);
  const lastError = useGameStore(selectLastError);
  const settings = useGameStore(selectSettings);
  const submitAction = useGameStore((s) => s.submitAction);
  const setStage = useGameStore((s) => s.setStage);
  const turn = useGameStore((s) => s.turn);
  const realmList = useGameStore((s) => s.knowledge.realmProgressionList);
  const gameTime = useGameStore((s) => s.gameTime);
  const weather = useGameStore((s) => s.weather);
  const ep = useGameStore((s) => s.ep);
  const reset = useGameStore((s) => s.reset);
  const getCurrentPayload = useGameStore((s) => s.getCurrentPayload);
  const [handbookOpen, setHandbookOpen] = useState(false);
  const [quickLookupOpen, setQuickLookupOpen] = useState(false);
  const [saveManagerOpen, setSaveManagerOpen] = useState(false);
  const [loreBookOpen, setLoreBookOpen] = useState(false);
  const [customRulesOpen, setCustomRulesOpen] = useState(false);
  const [tournamentOpen, setTournamentOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [skillMgmtOpen, setSkillMgmtOpen] = useState(false);
  // Phase 14.2B: AI Status modal
  const [aiStatusOpen, setAiStatusOpen] = useState(false);
  // Phase 12.2: Trader modal — auto-open theo traderSession state
  const traderSession = useGameStore((s) => s.traderSession);
  const [traderManuallyClosed, setTraderManuallyClosed] = useState(false);
  const traderOpen = !!traderSession && !traderManuallyClosed;
  // Reset manual-close flag khi session đổi (new trader)
  useEffect(() => {
    if (!traderSession) setTraderManuallyClosed(false);
  }, [traderSession?.traderName]);

  // Gameplay-only shortcuts (M/I/C/Q/G/B/V đã xử lý trong useGlobalShortcuts).
  // Còn lại: ? mở Cẩm Nang, Ctrl/Cmd+S mở Lưu Trữ.
  useKeyboard(
    {
      Slash: () => setHandbookOpen((v) => !v),
      'cmd+s': (e) => {
        e.preventDefault();
        setSaveManagerOpen(true);
      },
      'ctrl+s': (e) => {
        e.preventDefault();
        setSaveManagerOpen(true);
      },
    },
    [],
  );

  // Auto-backup mỗi 10 lượt — rotate qua 3 slot autobackup
  const lastBackupTurnRef = useRef(turn);
  useEffect(() => {
    if (!player) return;
    if (turn - lastBackupTurnRef.current >= 10) {
      const payload = getCurrentPayload();
      const success = autoBackup(payload as Parameters<typeof autoBackup>[0]);
      if (success) {
        console.info(`[auto-backup] Saved at turn ${turn}`);
      }
      lastBackupTurnRef.current = turn;
    }
  }, [turn, player, getCurrentPayload]);

  if (!player) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Bracketed className="p-8 text-center">
          <p className="text-jade-400">Không có dữ liệu nhân vật.</p>
          <button onClick={() => setStage('initial')} className="btn-primary mt-4">
            Về trang chính
          </button>
        </Bracketed>
      </div>
    );
  }

  // Scene background — Phase 8.2 (AI image cho location hiện tại)
  const currentLocId = player.current_location_id;
  const currentLoc = currentLocId ? getLocation(currentLocId) : undefined;

  return (
    <div className="relative min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      {/* Phase 8.2: AI scene background — fixed position blur layer */}
      {currentLoc && (
        <div className="pointer-events-none fixed inset-0 -z-10">
          <SceneBackground locationName={currentLoc.name} description={currentLoc.description} overlayOpacity={0.85} />
        </div>
      )}

      {/* ░░░ TOP NAV BAR ░░░ */}
      <header className="mx-auto mb-4 flex max-w-7xl flex-col gap-3 border-b border-gold-700/15 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-celestial font-serif text-xl font-semibold">
            {settings.storyTitle || 'Mặc Hội Tiên Đồ'}
          </h1>
          <p className="text-xs text-jade-500">
            Lượt {turn} · Độ khó {settings.difficulty}
          </p>
        </div>
        {/* Mobile: scroll horizontal. Desktop: flex-wrap */}
        <nav className="flex gap-1 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-x-visible sm:pb-0" style={{ scrollbarWidth: 'thin' }}>
          <NavButton label="Câu Chuyện" icon="◆" active onClick={() => {}} />
          <NavButton label="Bản Đồ" icon="◉" onClick={() => setStage('world_map')} />
          <NavButton label="Nhân Vật" icon="✦" onClick={() => setStage('character')} />
          <NavButton label="Pháp Thuật" icon="✧" onClick={() => setSkillMgmtOpen(true)} />
          <NavButton label="Hành Trang" icon="☷" onClick={() => setStage('inventory')} />
          <NavButton label="Nhiệm Vụ" icon="◇" onClick={() => setStage('quests')} />
          <NavButton label="Tông Môn" icon="◈" onClick={() => setStage('sect_hall')} />
          <NavButton label="Linh Thú" icon="☘" onClick={() => setStage('spirit_beasts')} />
          <NavButton label="Động Phủ" icon="◐" onClick={() => setStage('cave_abode')} />
          <NavButton
            label="Bí Cảnh"
            icon="✧"
            onClick={() => useGameStore.getState().enterSecretRealm(Math.max(1, player.level), 'Hắc Mộ Bí Cảnh')}
          />
          <NavButton
            label="Combat"
            icon="⚔"
            onClick={() => useGameStore.getState().startCombat('Hắc Vụ Lang', Math.max(1, player.level))}
          />
          <NavButton label="Độ Kiếp" icon="⚡" onClick={() => setStage('tribulation')} />
          <NavButton label="Tàng Thư" icon="☷" onClick={() => setLoreBookOpen(true)} />
          <NavButton label="Đại Hội" icon="⚔" onClick={() => setTournamentOpen(true)} />
          <NavButton label="Thành Tựu" icon="★" onClick={() => setAchievementsOpen(true)} />
          <NavButton label="Đạo Tâm" icon="◍" onClick={() => setCustomRulesOpen(true)} />
          <NavButton label="Lưu Trữ" icon="◭" onClick={() => setSaveManagerOpen(true)} />
          <NavButton label="Tra Cứu" icon="📜" onClick={() => setQuickLookupOpen(true)} />
          <NavButton label="Cẩm Nang" icon="?" onClick={() => setHandbookOpen(true)} />
          <NavButton label="Phím Tắt" icon="⌨" onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: '?', code: 'Slash', shiftKey: true }))} />
          {/* Phase 14.2B: AI status indicator (auto-update via subscribeHealth) */}
          <AIStatusDot onClick={() => setAiStatusOpen(true)} />
          <NavButton
            label="Thoát"
            icon="⊗"
            onClick={() => {
              if (confirm('Thoát về trang chính? (Bản lưu vẫn còn trong localStorage)')) {
                reset();
              }
            }}
          />
        </nav>
      </header>

      {/* Mode badge — bottom-right */}
      {settings.useHybridLogic !== false && (
        <div
          className="fixed bottom-3 right-3 z-10 rounded-sm border border-spirit-500/30 bg-ink-800/80 px-2 py-1 text-[10px] uppercase tracking-wider text-spirit-300 backdrop-blur-sm"
          title="2-step Hybrid: Logic Engine sinh 6 scenarios + dice roll + Narrative Engine viết prose"
        >
          <span aria-hidden style={{ color: 'var(--spirit-400)' }}>✦</span> Hybrid Logic
        </div>
      )}

      {/* Error banner */}
      {lastError && (
        <div className="mx-auto mb-3 max-w-7xl rounded-md border border-blood-500/50 bg-blood-500/10 px-4 py-2 text-sm text-ember-200">
          <strong>Lỗi:</strong> {lastError}
        </div>
      )}

      {/* Main grid — mobile: sidebar trên trước, gameplay dưới. Desktop: 2 cột */}
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1fr_300px]">
        <div className="order-2 flex flex-col gap-2 lg:order-1">
          <AIFallbackBanner onOpenStatus={() => setAiStatusOpen(true)} />
          <StoryView entries={storyLog} isAiThinking={isAiThinking} aiPhase={aiPhase} playerName={player.Name} />
          <ActionPanel
            actions={actions}
            choices={actionChoices}
            disabled={isAiThinking}
            onSelect={(action) => void submitAction(action)}
          />
        </div>

        <div className="order-1 lg:order-2">
          <PlayerSidebar
            player={player}
            realmList={realmList}
            turn={turn}
            currencyName={settings.currencyName}
            gameTime={gameTime}
            weather={weather}
            ep={ep}
          />
        </div>
      </div>

      {/* Tutorial + Save overlays — lazy mount khi open=true */}
      <WelcomeOverlay />
      <Suspense fallback={null}>
        {handbookOpen && <HandbookModal open onClose={() => setHandbookOpen(false)} />}
        {quickLookupOpen && (
          <QuickLookupModal
            open
            onClose={() => setQuickLookupOpen(false)}
            onInsertToChat={(name) => {
              // Append name vào current action input (state ở ActionPanel)
              // Đơn giản: dispatch custom event để ActionPanel listen
              window.dispatchEvent(new CustomEvent('quick-lookup:insert', { detail: { name } }));
            }}
          />
        )}
        {saveManagerOpen && <SaveManagerModal open onClose={() => setSaveManagerOpen(false)} />}
        {loreBookOpen && <LoreBookModal open onClose={() => setLoreBookOpen(false)} />}
        {customRulesOpen && <CustomRulesModal open onClose={() => setCustomRulesOpen(false)} />}
        {tournamentOpen && <TournamentModal open onClose={() => setTournamentOpen(false)} />}
        {achievementsOpen && <AchievementsModal open onClose={() => setAchievementsOpen(false)} />}
        {skillMgmtOpen && <SkillManagementModal open onClose={() => setSkillMgmtOpen(false)} />}
        {traderOpen && (
          <TraderModal open onClose={() => setTraderManuallyClosed(true)} />
        )}
        {aiStatusOpen && <AIStatusModal open onClose={() => setAiStatusOpen(false)} />}
      </Suspense>
    </div>
  );
};

interface NavButtonProps {
  label: string;
  icon: string;
  active?: boolean;
  onClick: () => void;
}
const NavButton = ({ label, icon, active, onClick }: NavButtonProps) => (
  <button
    onClick={onClick}
    aria-label={`Mở màn ${label}`}
    aria-current={active ? 'page' : undefined}
    className="relative flex flex-shrink-0 items-center gap-1.5 rounded-sm px-3 py-2 text-[12.5px] transition-colors whitespace-nowrap"
    style={{
      color: active ? 'var(--gold-100)' : 'var(--gold-300)',
      background: active ? 'rgba(205,164,94,.08)' : 'transparent',
      minHeight: 40,
    }}
  >
    {active && (
      <span
        aria-hidden
        className="absolute inset-x-2 -bottom-0.5 h-[2px] rounded-full"
        style={{ background: 'var(--gold-500)', boxShadow: '0 0 9px rgba(205,164,94,.7)' }}
      />
    )}
    <span aria-hidden style={{ color: 'var(--gold-500)', fontSize: 11 }}>{icon}</span>
    <span>{label}</span>
  </button>
);
