import { lazy, Suspense } from 'react';
import { useGameStore, selectStage } from '@state/game-store';
// Eager: 3 screen luôn hit đầu game (initial → setup → playing)
import { InitialScreen } from '@features/initial-screen';
import { GameSetupScreen } from '@features/game-setup';
import { GameplayScreen } from '@features/gameplay';
import { ToastStack } from '@shared/components/ToastStack';
import { ScreenLoader } from '@shared/components/ScreenLoader';

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

  // Skip-to-content link — visible chỉ khi keyboard focus
  const skipLink = (
    <a href="#main-content" className="skip-link">
      Bỏ qua đến nội dung chính
    </a>
  );

  // Eager render — không cần Suspense
  if (stage === 'initial') {
    return (
      <div className="min-h-screen w-full">
        {skipLink}
        <div id="main-content">
          <InitialScreen />
        </div>
        <ToastStack />
      </div>
    );
  }
  if (stage === 'setup') {
    return (
      <div className="min-h-screen w-full">
        {skipLink}
        <div id="main-content">
          <GameSetupScreen />
        </div>
        <ToastStack />
      </div>
    );
  }
  if (stage === 'playing') {
    return (
      <div className="min-h-screen w-full">
        {skipLink}
        <div id="main-content">
          <GameplayScreen />
        </div>
        <ToastStack />
      </div>
    );
  }

  // Lazy screens — chia chung 1 Suspense boundary, fallback hiển thị loader cổ phong
  return (
    <div className="min-h-screen w-full">
      {skipLink}
      <div id="main-content">
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
      <ToastStack />
    </div>
  );
};
