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
import { InteractiveTour } from '@features/tutorial/InteractiveTour';
import { setBgmMood, moodFromState } from '@services/ambient-bgm';
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
const DaoTamModal = lazy(() =>
  import('@features/cultivation/DaoTamModal').then((m) => ({ default: m.DaoTamModal })),
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
const SkillDeepModal = lazy(() =>
  import('@features/skill-management/SkillDeepModal').then((m) => ({ default: m.SkillDeepModal })),
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
// Phase 15: Monetization
const MonetizationModal = lazy(() =>
  import('@features/monetization/MonetizationModal').then((m) => ({ default: m.MonetizationModal })),
);
import { CurrencyDisplay } from '@features/monetization/CurrencyDisplay';
import { NotificationCenter } from '@features/notifications/NotificationCenter';
import { SaveIndicator } from '@shared/components/SaveIndicator';
import { NavDropdown } from './NavDropdown';
import type { NotificationActionTarget } from '@state/notifications';
// Phase 16.3: Daily missions
const DailyMissionsModal = lazy(() =>
  import('@features/daily-missions/DailyMissionsModal').then((m) => ({ default: m.DailyMissionsModal })),
);
// Phase 17.1: Extended quests
const ExtendedQuestsModal = lazy(() =>
  import('@features/extended-quests/ExtendedQuestsModal').then((m) => ({ default: m.ExtendedQuestsModal })),
);

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
  const [daoTamOpen, setDaoTamOpen] = useState(false);
  const [tournamentOpen, setTournamentOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [skillMgmtOpen, setSkillMgmtOpen] = useState(false);
  const [skillDeepOpen, setSkillDeepOpen] = useState(false);
  // Phase 14.2B: AI Status modal
  const [aiStatusOpen, setAiStatusOpen] = useState(false);
  // Phase 15: Monetization modal
  const [monetizationOpen, setMonetizationOpen] = useState(false);
  // Phase 16.3: Daily missions modal
  const [dailyMissionsOpen, setDailyMissionsOpen] = useState(false);
  // Phase 17.1: Extended quests modal
  const [extendedQuestsOpen, setExtendedQuestsOpen] = useState(false);
  // Auto-refresh extended quest progress + load missions on mount
  const refreshExtendedQuests = useGameStore((s) => s.refreshExtendedQuests);
  useEffect(() => { refreshExtendedQuests(); }, [refreshExtendedQuests]);
  // Auto-trigger refreshDailyMissions on mount để check daily reset + login bonus
  const refreshDailyMissions = useGameStore((s) => s.refreshDailyMissions);
  useEffect(() => { refreshDailyMissions(); }, [refreshDailyMissions]);

  // Phase 21.4: BGM ambient theo stage
  const stage = useGameStore((s) => s.stage);
  useEffect(() => {
    const mood = moodFromState({ stage });
    setBgmMood(mood);
    return () => { setBgmMood(null); };
  }, [stage]);

  // Phase 19: NotificationCenter dispatch global event 'tutien:open' → handle ở đây
  useEffect(() => {
    const handler = (e: Event) => {
      const target = (e as CustomEvent<NotificationActionTarget>).detail;
      switch (target) {
        case 'daily-missions': setDailyMissionsOpen(true); break;
        case 'extended-quests': setExtendedQuestsOpen(true); break;
        case 'monetization': setMonetizationOpen(true); break;
        case 'handbook': setHandbookOpen(true); break;
        case 'skills': setSkillMgmtOpen(true); break;
        case 'character-sheet': setStage('character'); break;
        case 'inventory': setStage('inventory'); break;
        case 'world-map': setStage('world_map'); break;
        case 'cave-abode': setStage('cave_abode'); break;
        case 'sect-hall': setStage('sect_hall'); break;
        case 'spirit-beasts': setStage('spirit_beasts'); break;
        case 'tournament': setTournamentOpen(true); break;
        case 'achievements': setAchievementsOpen(true); break;
        case 'tribulation': setStage('tribulation'); break;
        case 'cultivation': setDaoTamOpen(true); break;
      }
    };
    window.addEventListener('tutien:open', handler);
    return () => window.removeEventListener('tutien:open', handler);
  }, [setStage]);
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
        {/* Phase 22.UX: Grouped nav — 4 dropdown + 3 critical button + corner widgets */}
        <nav className="flex flex-wrap items-center gap-1.5">
          {/* Critical (always visible) */}
          <NavButton label="Câu Chuyện" icon="◆" active onClick={() => {}} />
          <NavButton label="Bản Đồ" icon="◉" onClick={() => setStage('world_map')} />
          <NavButton label="Đạo Cơ" icon="✦" onClick={() => setStage('character')} />
          <NavButton label="Hành Trang" icon="☷" onClick={() => setStage('inventory')} />

          {/* Group 1: Khám phá */}
          <NavDropdown
            label="Khám phá"
            icon="◐"
            items={[
              { label: 'Bí Cảnh', icon: '✧', onClick: () => useGameStore.getState().enterSecretRealm(Math.max(1, player.level), 'Hắc Mộ Bí Cảnh') },
              { label: 'Combat thử', icon: '⚔', onClick: () => useGameStore.getState().startCombat('Hắc Vụ Lang', Math.max(1, player.level)) },
              { label: 'Độ Kiếp', icon: '⚡', onClick: () => setStage('tribulation') },
              { label: 'Động Phủ', icon: '◐', onClick: () => setStage('cave_abode') },
            ]}
          />

          {/* Group 2: Tu Luyện */}
          <NavDropdown
            label="Tu Luyện"
            icon="✧"
            items={[
              { label: 'Pháp Thuật', icon: '✧', onClick: () => setSkillMgmtOpen(true) },
              { label: 'Tài Năng · Rune · Combo', icon: '✺', onClick: () => setSkillDeepOpen(true) },
              { label: 'Nhiệm Vụ', icon: '◇', onClick: () => setStage('quests') },
              { label: 'Chuỗi Nhiệm Vụ', icon: '✦', onClick: () => setExtendedQuestsOpen(true) },
              { label: 'Tàng Thư', icon: '☷', onClick: () => setLoreBookOpen(true) },
              { label: 'Đạo Tâm', icon: '◍', onClick: () => setDaoTamOpen(true) },
            ]}
          />

          {/* Group 3: Xã hội */}
          <NavDropdown
            label="Xã hội"
            icon="◈"
            items={[
              { label: 'Tông Môn', icon: '◈', onClick: () => setStage('sect_hall') },
              { label: 'Đại Hội', icon: '⚔', onClick: () => setTournamentOpen(true) },
              { label: 'Linh Thú', icon: '☘', onClick: () => setStage('spirit_beasts') },
            ]}
          />

          {/* Group 4: Tiện ích */}
          <NavDropdown
            label="Tiện ích"
            icon="⋯"
            items={[
              { label: 'Hàng Ngày', icon: '📅', onClick: () => setDailyMissionsOpen(true) },
              { label: 'Thành Tựu', icon: '★', onClick: () => setAchievementsOpen(true) },
              { label: 'Cẩm Nang', icon: '?', onClick: () => setHandbookOpen(true) },
              { label: 'Tra Cứu', icon: '📜', onClick: () => setQuickLookupOpen(true) },
              { label: 'Lưu Trữ', icon: '◭', onClick: () => setSaveManagerOpen(true) },
              { label: 'Phím Tắt', icon: '⌨', onClick: () => window.dispatchEvent(new KeyboardEvent('keydown', { key: '?', code: 'Slash', shiftKey: true })) },
              { label: 'Thoát game', icon: '⊗', onClick: () => { if (confirm('Thoát về trang chính? (Bản lưu vẫn còn trong localStorage)')) reset(); } },
            ]}
          />

          {/* Corner widgets — always right edge */}
          <div className="ml-auto flex items-center gap-1.5">
            <AIStatusDot onClick={() => setAiStatusOpen(true)} />
            <span data-tour="nav-currency">
              <CurrencyDisplay onClick={() => setMonetizationOpen(true)} />
            </span>
            <span data-tour="notification-bell">
              <NotificationCenter />
            </span>
          </div>
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
          <div data-tour="story-view">
            <StoryView entries={storyLog} isAiThinking={isAiThinking} aiPhase={aiPhase} playerName={player.Name} />
          </div>
          <div data-tour="action-panel">
            <ActionPanel
              actions={actions}
              choices={actionChoices}
              disabled={isAiThinking}
              onSelect={(action) => void submitAction(action)}
            />
          </div>
        </div>

        <div className="order-1 lg:order-2" data-tour="player-sidebar">
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
      <InteractiveTour />
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
        {daoTamOpen && <DaoTamModal open onClose={() => setDaoTamOpen(false)} />}
        <SaveIndicator />

        {tournamentOpen && <TournamentModal open onClose={() => setTournamentOpen(false)} />}
        {achievementsOpen && <AchievementsModal open onClose={() => setAchievementsOpen(false)} />}
        {skillMgmtOpen && <SkillManagementModal open onClose={() => setSkillMgmtOpen(false)} />}
        {skillDeepOpen && <SkillDeepModal open onClose={() => setSkillDeepOpen(false)} />}
        {traderOpen && (
          <TraderModal open onClose={() => setTraderManuallyClosed(true)} />
        )}
        {aiStatusOpen && <AIStatusModal open onClose={() => setAiStatusOpen(false)} />}
        {monetizationOpen && <MonetizationModal open onClose={() => setMonetizationOpen(false)} />}
        {dailyMissionsOpen && <DailyMissionsModal open onClose={() => setDailyMissionsOpen(false)} />}
        {extendedQuestsOpen && <ExtendedQuestsModal open onClose={() => setExtendedQuestsOpen(false)} />}
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
