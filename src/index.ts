import { Game } from './core/Game';
import './config/FeatureFlags';
import { createAIInterface } from './core/AIInterface';
import { DiceRoller } from './utils/DiceRoller';
import { EntityUtils } from './utils/EntityUtils';
import { SavingThrowCalculator } from './utils/SavingThrowCalculator';
import { RandomSelector } from './utils/RandomSelector';
import { ColorPalette } from './utils/ColorPalette';
import { SpellRegistry } from './systems/magic/SpellRegistry';
import { SpellCaster } from './systems/magic/SpellCaster';
import { Character } from './entities/Character';
import { Party } from './entities/Party';
import { GameServices } from './services/GameServices';
import { GAME_CONFIG } from './config/GameConstants';
import { DebugLogger } from './utils/DebugLogger';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const game = new Game(canvas);
  game.start();

  // Expose game and feature flags to window for testing
  if (typeof window !== 'undefined') {
    // Create AI interface
    const aiInterface = createAIInterface(game);

    // Create comprehensive testing interface
    (window as any).game = {
      instance: game,
      services: game.getServices(),
      sceneManager: game.getSceneManager(),
      gameState: game.getGameState(),
      isRunning: () => game.isGameRunning(),
      canvas: game.getCanvas(),
    };

    // Expose AI interface for agent interaction
    (window as any).AI = {
      getState: () => aiInterface.getGameState(),
      getScene: () => aiInterface.getCurrentScene(),
      getCurrentScene: () => aiInterface.getCurrentScene(),
      getParty: () => aiInterface.getPartyInfo(),
      getDungeon: () => aiInterface.getDungeonInfo(),
      getCombat: () => aiInterface.getCombatInfo(),
      getShop: () => aiInterface.getShopInfo(),
      getTrainingGroundsInfo: () => aiInterface.getTrainingGroundsInfo(),
      getRosterCharacters: () => aiInterface.getRosterCharacters(),
      createCharacter: (options: any) => aiInterface.createCharacter(options),
      inspectRosterCharacter: (index: number) => aiInterface.inspectRosterCharacter(index),
      changeCharacterClass: (index: number, newClass: string) => aiInterface.changeCharacterClass(index, newClass),
      deleteRosterCharacter: (index: number) => aiInterface.deleteRosterCharacter(index),
      renameRosterCharacter: (index: number, newName: string) => aiInterface.renameRosterCharacter(index, newName),
      getActions: () => aiInterface.getAvailableActions(),
      describe: () => aiInterface.getSceneDescription(),
      sendKey: (key: string) => aiInterface.simulateKeypress(key),
      simulateKeypress: (key: string) => aiInterface.simulateKeypress(key),
      roll: (dice: string) => aiInterface.rollDice(dice),
      getSpellMenu: () => aiInterface.getSpellMenuInfo(),
      selectSpell: (index: number) => aiInterface.selectSpellByIndex(index),
      navigateSpellMenu: (direction: 'up' | 'down' | 'left' | 'right') => aiInterface.navigateSpellMenu(direction),
      testRandomSelector: () => aiInterface.testRandomSelector(),
      testColorPalette: () => aiInterface.testColorPalette(),
      banter: {
        getMetrics: () => aiInterface.getBanterMetrics(),
        getEvents: () => aiInterface.getBanterEvents(),
        getState: () => aiInterface.getBanterState(),
        trigger: (type?: any) => aiInterface.forceBanterTrigger(type),
        test: () => aiInterface.testBanterSystem()
      }
    };

    // Also expose drpg namespace for backward compatibility
    (window as any).drpg = {
      game: game,
      featureFlags: (window as any).featureFlags,
    };

    // Expose utility classes for testing
    (window as any).DiceRoller = DiceRoller;
    (window as any).EntityUtils = EntityUtils;
    (window as any).SavingThrowCalculator = SavingThrowCalculator;
    (window as any).RandomSelector = RandomSelector;
    (window as any).ColorPalette = ColorPalette;
    (window as any).SpellRegistry = SpellRegistry;
    (window as any).SpellCaster = SpellCaster;
    (window as any).Character = Character;
    (window as any).Party = Party;
    (window as any).GameServices = GameServices;
    (window as any).GAME_CONFIG = GAME_CONFIG;

    DebugLogger.info('AIInterface', 'AI Interface available: window.AI.describe(), window.AI.getState(), window.AI.sendKey(key), etc.');
  }
});
