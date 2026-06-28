import { lazy, Suspense, useState } from 'react';
import { useGameStore, selectStage } from '@state/game-store';
// Eager: 4 screen luôn hit đầu game (initial → adventure_mode → setup → playing)
import { InitialScreen } from '@features/initial-screen';
import { AdventureModeScreen } from '@features/adventure-mode';
import { GameSetupScreen } from '@features/game-setup';
import { GameplayScreen } from '@features/gameplay';
import { MobileBottomNav } from '@features/gameplay/MobileBottomNav';
import { ToastStack } from '@shared/components/ToastStack';
import { ScreenLoader } from '@shared/components/ScreenLoader';
import { AppFooter } from '@shared/components/AppFooter';
// Phase 14.x: Global shortcuts (Esc back, M/I/C/Q/G/B/V navigation, Shift+? help)
import { useGlobalShortcuts } from '@shared/hooks/useGlobalShortcuts';
import { useKeyboard } from '@shared/hooks/useKeyboard';
const ShortcutHelpModal = lazy(() =>
  import('@features/shortcut-help/ShortcutHelpModal').then((m) => ({ default: m.ShortcutHelpModal })),
);

// Lazy: 10 screen ít dùng — chỉ tải JS chunk khi user nhấn vào
const CharacterSheetScreen = lazy(() =>
  import('@features/character-sheet').then((m) => ({ default: m.CharacterSheetScreen })),
);
const InventoryScreen = lazy(() =>
  import('@features/inventory').then((m) => ({ default: m.InventoryScreen })),
);
const TribulationScreen = lazy(() =>
  import('@features/tribulation').then((m) => ({ default: m.TribulationScreen })),
);
const CombatScreen = lazy(() =>
  import('@features/combat').then((m) => ({ default: m.CombatScreen })),
);
const WorldMapScreen = lazy(() =>
  import('@features/world-map').then((m) => ({ default: m.WorldMapScreen })),
);
const QuestsScreen = lazy(() =>
  import('@features/quests').then((m) => ({ default: m.QuestsScreen })),
);
const SectHallScreen = lazy(() =>
  import('@features/sect-hall').then((m) => ({ default: m.SectHallScreen })),
);
const SecretRealmScreen = lazy(() =>
  import('@features/secret-realm').then((m) => ({ default: m.SecretRealmScreen })),
);
const SpiritBeastsScreen = lazy(() =>
  import('@features/spirit-beasts').then((m) => ({ default: m.SpiritBeastsScreen })),
);
const CaveAbodeScreen = lazy(() =>
  import('@features/cave-abode').then((m) => ({ default: m.CaveAbodeScreen })),
);

export const App = () => {
  const stage = useGameStore(selectStage);
  // Phase 14.x: Global shortcuts (Esc back, M/I/C/Q/G/B/V navigation)
  useGlobalShortcuts();

  // Phase 14.x: Help modal mở bằng Shift+? hoặc F1
  const [helpOpen, setHelpOpen] = useState(false);
  useKeyboard({
    'shift+?': () => setHelpOpen((v) => !v),
    F1: (e) => { e.preventDefault(); setHelpOpen((v) => !v); },
  }, []);

  // Skip-to-content link — visible chỉ khi keyboard focus
  const skipLink = (
    <a href="#main-content" className="skip-link">
      Bỏ qua đến nội dung chính
    </a>
  );

  // Footer hiển thị ở các screen tĩnh — không show trong combat/tribulation để không phân tâm
  const showFooter = stage !== 'combat' && stage !== 'tribulation';

  // Help modal overlay — luôn render ở root, hoạt động trên mọi screen
  const helpOverlay = (
    <Suspense fallback={null}>
      {helpOpen && <ShortcutHelpModal open onClose={() => setHelpOpen(false)} />}
    </Suspense>
  );

  // Eager render — không cần Suspense
  if (stage === 'initial') {
    return (
      <div className="flex min-h-screen w-full flex-col">
        {skipLink}
        <div id="main-content" className="flex-1">
          <InitialScreen />
        </div>
        {showFooter && <AppFooter />}
        <ToastStack />
        {helpOverlay}
      </div>
    );
  }
  if (stage === 'adventure_mode') {
    return (
      <div className="flex min-h-screen w-full flex-col">
        {skipLink}
        <div id="main-content" className="flex-1">
          <AdventureModeScreen />
        </div>
        {showFooter && <AppFooter />}
        <ToastStack />
        {helpOverlay}
      </div>
    );
  }
  if (stage === 'setup') {
    return (
      <div className="flex min-h-screen w-full flex-col">
        {skipLink}
        <div id="main-content" className="flex-1">
          <GameSetupScreen />
        </div>
        {showFooter && <AppFooter />}
        <ToastStack />
        {helpOverlay}
      </div>
    );
  }
  if (stage === 'playing') {
    return (
      <div className="flex min-h-screen w-full flex-col pb-16 lg:pb-0">
        {skipLink}
        <div id="main-content" className="flex-1">
          <GameplayScreen />
        </div>
        {showFooter && <AppFooter />}
        <ToastStack />
        {helpOverlay}
        <MobileBottomNav />
      </div>
    );
  }

  // Lazy screens — chia chung 1 Suspense boundary, fallback hiển thị loader cổ phong
  return (
    <div className="flex min-h-screen w-full flex-col pb-16 lg:pb-0">
      {skipLink}
      <div id="main-content" className="flex-1">
        <Suspense fallback={<ScreenLoader />}>
          {stage === 'character' && <CharacterSheetScreen />}
          {stage === 'inventory' && <InventoryScreen />}
          {stage === 'world_map' && <WorldMapScreen />}
          {stage === 'quests' && <QuestsScreen />}
          {stage === 'sect_hall' && <SectHallScreen />}
          {stage === 'secret_realm' && <SecretRealmScreen />}
          {stage === 'spirit_beasts' && <SpiritBeastsScreen />}
          {stage === 'cave_abode' && <CaveAbodeScreen />}
          {stage === 'combat' && <CombatScreen />}
          {stage === 'tribulation' && <TribulationScreen />}
        </Suspense>
      </div>
      {showFooter && <AppFooter />}
      <ToastStack />
      {helpOverlay}
      <MobileBottomNav />
    </div>
  );
};
