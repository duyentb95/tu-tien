import { useGameStore, selectStage } from '@state/game-store';
import { InitialScreen } from '@features/initial-screen';
import { GameSetupScreen } from '@features/game-setup';
import { GameplayScreen } from '@features/gameplay';
import { CharacterSheetScreen } from '@features/character-sheet';
import { InventoryScreen } from '@features/inventory';
import { TribulationScreen } from '@features/tribulation';
import { CombatScreen } from '@features/combat';
import { WorldMapScreen } from '@features/world-map';
import { QuestsScreen } from '@features/quests';
import { SectHallScreen } from '@features/sect-hall';
import { SecretRealmScreen } from '@features/secret-realm';
import { SpiritBeastsScreen } from '@features/spirit-beasts';
import { CaveAbodeScreen } from '@features/cave-abode';
import { ToastStack } from '@shared/components/ToastStack';

export const App = () => {
  const stage = useGameStore(selectStage);

  return (
    <div className="min-h-screen w-full">
      {stage === 'initial' && <InitialScreen />}
      {stage === 'setup' && <GameSetupScreen />}
      {stage === 'playing' && <GameplayScreen />}
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

      <ToastStack />
    </div>
  );
};
