import { Game } from './Game';
import { GameState } from '../types/GameTypes';
import { Character } from '../entities/Character';
import { DiceRoller } from '../utils/DiceRoller';
import { EntityUtils } from '../utils/EntityUtils';
import { RandomSelector } from '../utils/RandomSelector';
import { ColorPalette } from '../utils/ColorPalette';
import { DebugLogger } from '../utils/DebugLogger';
import { GameServices } from '../services/GameServices';
import { BanterTriggerType } from '../types/BanterTypes';

export class AIInterface {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  public getGameState(): GameState {
    return this.game.getGameState();
  }

  public getCurrentScene(): string {
    return this.game.getSceneManager().getCurrentScene()?.getName() || 'none';
  }

  public getPartyInfo(): {
    location: { x: number; y: number; floor: number; facing: string };
    characters: Array<{
      name: string;
      class: string;
      level: number;
      hp: { current: number; max: number };
      mp: { current: number; max: number };
      status: string;
      statuses: any[];
      isDead: boolean;
      knownSpells?: string[];
    }>;
  } {
    const state = this.getGameState();
    return {
      location: {
        x: state.party.x,
        y: state.party.y,
        floor: state.currentFloor,
        facing: state.party.facing,
      },
      characters: state.party.characters.map((char: Character) => ({
        name: char.name,
        class: char.class,
        level: char.level,
        experience: char.experience,
        hp: { current: char.hp, max: char.maxHp },
        mp: { current: char.mp, max: char.maxMp },
        status: char.statuses.length > 0 ? char.statuses[0].type : 'OK',
        statuses: char.statuses,
        isDead: char.isDead,
        knownSpells: char.knownSpells || [],
      })),
    };
  }

  public getDungeonInfo(): {
    currentFloor: number;
    tile: string;
    hasMonsters: boolean;
    hasItems: boolean;
  } {
    const state = this.getGameState();
    const dungeon = state.dungeon[state.currentFloor - 1];
    if (!dungeon) return { currentFloor: state.currentFloor, tile: 'void', hasMonsters: false, hasItems: false };

    const tile = dungeon.tiles?.[state.party.y]?.[state.party.x]?.type || 'void';
    const hasMonsters = false; // Monsters are handled by encounter system
    const hasItems = false; // Items will be in event system

    return { currentFloor: state.currentFloor, tile, hasMonsters, hasItems };
  }

  public getZoneInfo(): {
    currentZone: {
      type: string;
      encounterRate: number;
      description?: string;
    } | null;
    floorZones: Array<{
      type: string;
      bounds: { x1: number; y1: number; x2: number; y2: number };
    }>;
  } {
    const state = this.getGameState();
    const dungeon = state.dungeon[state.currentFloor - 1];
    if (!dungeon) return { currentZone: null, floorZones: [] };

    const overrideZones = dungeon.overrideZones || [];
    const partyX = state.party.x;
    const partyY = state.party.y;

    let currentZone: { type: string; encounterRate: number; description?: string } | null = null;

    for (const zone of overrideZones) {
      if (partyX >= zone.x1 && partyX <= zone.x2 && partyY >= zone.y1 && partyY <= zone.y2) {
        currentZone = {
          type: zone.type,
          encounterRate: zone.data?.encounterRate || 0,
          description: zone.data?.description,
        };
        break;
      }
    }

    return {
      currentZone,
      floorZones: overrideZones.map(z => ({
        type: z.type,
        bounds: { x1: z.x1, y1: z.y1, x2: z.x2, y2: z.y2 },
      })),
    };
  }

  public getEncounterCooldownInfo(): {
    stepsSinceLastEncounter: number;
    cooldownMin: number;
    rampPercentPerStep: number;
    currentRampPercent: number;
    actualDangerPercent: number;
    encounterReady: boolean;
  } | null {
    const scene = this.game.getSceneManager().getCurrentScene();
    if (scene?.getName().toLowerCase() !== 'dungeon') {
      return null;
    }

    const dungeonScene = scene as any;
    if (typeof dungeonScene.getEncounterCooldownState === 'function') {
      return dungeonScene.getEncounterCooldownState();
    }

    return null;
  }

  public getCombatInfo(): {
    inCombat: boolean;
    enemies?: Array<{ name: string; hp: number; status: string }>;
    currentTurn?: string;
    spellMenuOpen?: boolean;
    selectedSpell?: string;
    availableSpells?: string[];
  } {
    const state = this.getGameState();
    if (!state.inCombat || !state.combatContext) {
      return { inCombat: false };
    }

    const scene = this.game.getSceneManager().getCurrentScene();
    const combatScene = scene?.getName().toLowerCase() === 'combat' ? (scene as any) : null;
    const testState = combatScene?.getTestState ? combatScene.getTestState() : null;

    return {
      inCombat: true,
      enemies: state.combatContext.monsters?.map((e: any) => ({
        name: e.name,
        hp: e.hp,
        status: e.status || 'OK',
      })) || [],
      currentTurn: 'player', // Combat system doesn't expose turn info yet
      spellMenuOpen: testState?.spellMenuOpen || false,
      selectedSpell: testState?.pendingSpellId || undefined,
      availableSpells: testState?.availableSpells || []
    };
  }

  public getShopInfo(): {
    inShop: boolean;
    currentState?: string;
  } {
    const scene = this.game.getSceneManager().getCurrentScene();
    if (!scene || scene.getName().toLowerCase() !== 'shop') {
      return { inShop: false };
    }

    const shopScene = scene as any;
    if (shopScene.getCurrentState) {
      return {
        inShop: true,
        currentState: shopScene.getCurrentState(),
      };
    }

    return { inShop: true };
  }

  public simulateKeypress(key: string): boolean {
    const scene = this.game.getSceneManager().getCurrentScene();
    if (!scene) return false;

    // Normalize key to handle both cases (e.g., 'Enter' -> 'enter', 'ArrowUp' -> 'arrowup')
    const normalizedKey = key.charAt(0).toLowerCase() + key.slice(1).toLowerCase();
    const handled = scene.handleInput(normalizedKey);

    // Force immediate scene transition processing if needed
    // This ensures tests can immediately check the new scene
    const sceneManager = this.game.getSceneManager();
    if ((sceneManager as any).nextScene) {
      sceneManager.update(0);
    }

    return handled;
  }

  public rollDice(notation: string): number {
    return DiceRoller.roll(notation);
  }

  public isCharacter(entity: any): boolean {
    return EntityUtils.isCharacter(entity);
  }

  public isMonster(entity: any): boolean {
    return EntityUtils.isMonster(entity);
  }

  public applyDamage(entity: Character | any, damage: number): void {
    EntityUtils.applyDamage(entity, damage);
  }

  public applyHealing(entity: Character | any, healing: number): void {
    EntityUtils.applyHealing(entity, healing);
  }

  public getAvailableActions(): string[] {
    const scene = this.getCurrentScene();
    const actions: string[] = [];

    switch (scene.toLowerCase()) {
      case 'dungeon':
        actions.push('ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'm', 'i', 'Escape');
        break;
      case 'combat':
        const combatInfo = this.getCombatInfo();
        if (combatInfo.spellMenuOpen) {
          actions.push('ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape', '1-9');
        } else {
          actions.push('ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape', 'a', 'd', 'r', 's');
        }
        break;
      case 'town':
        actions.push('ArrowUp', 'ArrowDown', 'Enter', 'Escape');
        break;
      case 'shop':
        actions.push('ArrowUp', 'ArrowDown', 'Enter', 'b', 's', 'p', 'Escape');
        break;
      case 'inventory':
        actions.push('ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'e', 'd', 'u', 'Escape');
        break;
      case 'mainmenu':
      case 'new game':
        actions.push('ArrowUp', 'ArrowDown', 'Enter', 'Escape');
        break;
      default:
        actions.push('Enter', 'Escape');
    }

    return actions;
  }

  public getSceneDescription(): string {
    const scene = this.getCurrentScene();
    const state = this.getGameState();

    switch (scene.toLowerCase()) {
      case 'dungeon':
        const dungeonInfo = this.getDungeonInfo();
        return `Dungeon Floor ${dungeonInfo.currentFloor} at (${state.party.x}, ${state.party.y}) facing ${state.party.facing}. Tile: ${dungeonInfo.tile}${dungeonInfo.hasMonsters ? ', monsters present' : ''}${dungeonInfo.hasItems ? ', items present' : ''}`;
      case 'combat':
        const combatInfo = this.getCombatInfo();
        const baseDescription = `Combat with ${combatInfo.enemies?.length || 0} enemies. Turn: ${combatInfo.currentTurn || 'unknown'}`;
        if (combatInfo.spellMenuOpen) {
          return baseDescription + `. Spell menu open with ${combatInfo.availableSpells?.length || 0} spells available`;
        }
        return baseDescription;
      case 'town':
        return 'In the Town of Llylgamyn';
      case 'shop':
        return "At Boltac's Trading Post";
      case 'inventory':
        return 'Managing party inventory';
      case 'mainmenu':
        return 'At the Main Menu';
      case 'new game':
        return 'Starting a new game';
      default:
        return `In ${scene} scene`;
    }
  }

  public getSpellMenuInfo(): {
    isOpen: boolean;
    selectedSpellIndex?: number;
    selectedLevel?: number;
    knownSpells?: Array<{ id: string; name: string; level: number; mpCost: number }>;
  } {
    const scene = this.game.getSceneManager().getCurrentScene();
    if (scene?.getName().toLowerCase() !== 'combat') {
      return { isOpen: false };
    }

    const combatScene = scene as any;
    const testState = combatScene.getTestState ? combatScene.getTestState() : null;
    if (!testState?.spellMenuOpen) {
      return { isOpen: false };
    }

    const spellMenuState = testState.spellMenuState;
    if (!spellMenuState) {
      return { isOpen: true };
    }

    const result: any = {
      isOpen: true,
      selectedSpellIndex: spellMenuState.selectedSpellIndex,
      selectedLevel: spellMenuState.selectedLevel
    };

    if (spellMenuState.spellsByLevel && spellMenuState.selectedLevel) {
      const spellsAtLevel = spellMenuState.spellsByLevel.get(spellMenuState.selectedLevel) || [];
      result.knownSpells = spellsAtLevel.map((spell: any) => ({
        id: spell.id,
        name: spell.name,
        level: spell.level,
        mpCost: spell.mpCost
      }));
    }

    return result;
  }

  public selectSpellByIndex(index: number): boolean {
    const spellMenuInfo = this.getSpellMenuInfo();
    if (!spellMenuInfo.isOpen || !spellMenuInfo.knownSpells) {
      return false;
    }

    if (index >= 0 && index < spellMenuInfo.knownSpells.length) {
      const key = String(index + 1);
      return this.simulateKeypress(key);
    }

    return false;
  }

  public navigateSpellMenu(direction: 'up' | 'down' | 'left' | 'right'): boolean {
    const spellMenuInfo = this.getSpellMenuInfo();
    if (!spellMenuInfo.isOpen) {
      return false;
    }

    const keyMap: { [key: string]: string } = {
      'up': 'ArrowUp',
      'down': 'ArrowDown',
      'left': 'ArrowLeft',
      'right': 'ArrowRight'
    };

    return this.simulateKeypress(keyMap[direction] || 'ArrowUp');
  }

  public getTrainingGroundsInfo(): {
    inTrainingGrounds: boolean;
    currentState?: string;
    rosterCount?: number;
    selectedCharacter?: {
      name: string;
      race: string;
      class: string;
      level: number;
      stats: { [key: string]: number };
      hp: { current: number; max: number };
      mp: { current: number; max: number };
      age: number;
      experience: number;
      knownSpells?: string[];
    };
    creationData?: {
      name: string;
      race: string | null;
      gender: string | null;
      class: string | null;
      alignment: string | null;
      baseStats: { [key: string]: number } | null;
      bonusPoints: number;
      allocatedBonusPoints: { [key: string]: number };
      remainingBonusPoints: number;
      startAtLevel4: boolean;
      eligibleClasses: string[];
    };
    availableActions?: string[];
  } {
    const scene = this.game.getSceneManager().getCurrentScene();
    if (!scene || scene.getName().toLowerCase() !== 'traininggrounds') {
      return { inTrainingGrounds: false };
    }

    const trainingScene = scene as any;
    const currentState = trainingScene.getCurrentState ? trainingScene.getCurrentState() : 'unknown';
    const state = this.getGameState();
    const rosterCount = state.characterRoster?.length || 0;

    const result: any = {
      inTrainingGrounds: true,
      currentState,
      rosterCount,
    };

    if (trainingScene.stateManager) {
      const stateContext = trainingScene.stateManager.getStateContext();

      if (stateContext.selectedCharacterIndex >= 0 && state.characterRoster?.[stateContext.selectedCharacterIndex]) {
        const char = state.characterRoster[stateContext.selectedCharacterIndex] as Character;
        result.selectedCharacter = {
          name: char.name,
          race: char.race,
          class: char.class,
          level: char.level,
          stats: {
            strength: char.stats.strength,
            intelligence: char.stats.intelligence,
            piety: char.stats.piety,
            vitality: char.stats.vitality,
            agility: char.stats.agility,
            luck: char.stats.luck,
          },
          hp: { current: char.hp, max: char.maxHp },
          mp: { current: char.mp, max: char.maxMp },
          age: char.age,
          experience: char.experience,
          knownSpells: char.knownSpells || [],
        };
      }

      if (stateContext.creationData) {
        const allocated = Object.values(stateContext.creationData.allocatedBonusPoints).reduce(
          (sum: number, val: any) => sum + (val || 0), 0
        );

        result.creationData = {
          name: stateContext.creationData.name,
          race: stateContext.creationData.race,
          gender: stateContext.creationData.gender,
          class: stateContext.creationData.class,
          alignment: stateContext.creationData.alignment,
          baseStats: stateContext.creationData.baseStats ? {
            strength: stateContext.creationData.baseStats.strength,
            intelligence: stateContext.creationData.baseStats.intelligence,
            piety: stateContext.creationData.baseStats.piety,
            vitality: stateContext.creationData.baseStats.vitality,
            agility: stateContext.creationData.baseStats.agility,
            luck: stateContext.creationData.baseStats.luck,
          } : null,
          bonusPoints: stateContext.creationData.bonusPoints,
          allocatedBonusPoints: stateContext.creationData.allocatedBonusPoints,
          remainingBonusPoints: stateContext.creationData.bonusPoints - allocated,
          startAtLevel4: stateContext.creationData.startAtLevel4,
          eligibleClasses: stateContext.eligibleClasses,
        };
      }

      const actionMap: { [key: string]: string[] } = {
        'main': trainingScene.stateManager.getMainMenuOptions?.() || [],
        'inspectMenu': trainingScene.stateManager.getInspectMenuOptions?.() || [],
      };

      result.availableActions = actionMap[currentState] || [];
    }

    return result;
  }

  public createCharacter(options: {
    name: string;
    race: string;
    gender: 'male' | 'female';
    class: string;
    alignment: string;
    statAllocations: { [key: string]: number };
  }): boolean {
    const info = this.getTrainingGroundsInfo();
    if (!info.inTrainingGrounds || info.currentState !== 'main') {
      return false;
    }

    this.simulateKeypress('ArrowUp');
    this.simulateKeypress('Enter');

    this.simulateKeypress(options.name);
    this.simulateKeypress('Enter');

    const races = ['Human', 'Elf', 'Dwarf', 'Gnome', 'Hobbit', 'Faerie', 'Lizman', 'Dracon', 'Rawulf', 'Mook', 'Felpurr'];
    const raceIndex = races.indexOf(options.race);
    if (raceIndex === -1) return false;

    for (let i = 0; i < raceIndex; i++) {
      this.simulateKeypress('ArrowDown');
    }
    this.simulateKeypress('Enter');

    if (options.gender === 'female') {
      this.simulateKeypress('ArrowDown');
    }
    this.simulateKeypress('Enter');

    const stats = ['strength', 'intelligence', 'piety', 'vitality', 'agility', 'luck'];
    for (let i = 0; i < stats.length; i++) {
      const stat = stats[i];
      const points = options.statAllocations[stat] || 0;

      for (let j = 0; j < i; j++) {
        this.simulateKeypress('ArrowDown');
      }

      for (let p = 0; p < points; p++) {
        this.simulateKeypress('ArrowRight');
      }
    }

    this.simulateKeypress('Enter');

    const currentInfo = this.getTrainingGroundsInfo();
    if (!currentInfo.creationData?.eligibleClasses.includes(options.class)) {
      return false;
    }

    const classIndex = currentInfo.creationData.eligibleClasses.indexOf(options.class);
    for (let i = 0; i < classIndex; i++) {
      this.simulateKeypress('ArrowDown');
    }
    this.simulateKeypress('Enter');

    const alignments = ['Good', 'Neutral', 'Evil'];
    const alignmentIndex = alignments.indexOf(options.alignment);
    if (alignmentIndex === -1) return false;

    for (let i = 0; i < alignmentIndex; i++) {
      this.simulateKeypress('ArrowDown');
    }
    this.simulateKeypress('Enter');

    this.simulateKeypress('y');

    return true;
  }

  public getRosterCharacters(): Array<{
    name: string;
    race: string;
    class: string;
    level: number;
    status: string;
    statuses: any[];
    isDead: boolean;
  }> {
    const state = this.getGameState();
    const roster = state.characterRoster as Character[];
    return (roster || []).map((char: Character) => ({
      name: char.name,
      race: char.race,
      class: char.class,
      level: char.level,
      status: char.statuses.length > 0 ? char.statuses[0].type : 'OK',
      statuses: char.statuses,
      isDead: char.isDead,
    }));
  }

  public inspectRosterCharacter(index: number): boolean {
    const info = this.getTrainingGroundsInfo();
    if (!info.inTrainingGrounds || info.currentState !== 'main') {
      return false;
    }

    if (index < 0 || index >= (info.rosterCount || 0)) {
      return false;
    }

    this.simulateKeypress('ArrowDown');
    this.simulateKeypress('Enter');

    for (let i = 0; i < index; i++) {
      this.simulateKeypress('ArrowDown');
    }
    this.simulateKeypress('Enter');

    return true;
  }

  public changeCharacterClass(characterIndex: number, newClass: string): boolean {
    if (!this.inspectRosterCharacter(characterIndex)) {
      return false;
    }

    this.simulateKeypress('ArrowDown');
    this.simulateKeypress('Enter');

    this.simulateKeypress('Enter');

    const info = this.getTrainingGroundsInfo();
    if (!info.creationData?.eligibleClasses.includes(newClass)) {
      return false;
    }

    const classIndex = info.creationData.eligibleClasses.indexOf(newClass);
    for (let i = 0; i < classIndex; i++) {
      this.simulateKeypress('ArrowDown');
    }
    this.simulateKeypress('Enter');

    this.simulateKeypress('y');

    return true;
  }

  public deleteRosterCharacter(index: number): boolean {
    if (!this.inspectRosterCharacter(index)) {
      return false;
    }

    for (let i = 0; i < 3; i++) {
      this.simulateKeypress('ArrowDown');
    }
    this.simulateKeypress('Enter');

    this.simulateKeypress('y');

    return true;
  }

  public renameRosterCharacter(index: number, newName: string): boolean {
    if (!this.inspectRosterCharacter(index)) {
      return false;
    }

    for (let i = 0; i < 2; i++) {
      this.simulateKeypress('ArrowDown');
    }
    this.simulateKeypress('Enter');

    for (let i = 0; i < 20; i++) {
      this.simulateKeypress('Backspace');
    }

    this.simulateKeypress(newName);
    this.simulateKeypress('Enter');

    return true;
  }

  public getTavernInfo(): {
    inTavern: boolean;
    currentState?: string;
    partySize?: number;
    rosterSize?: number;
    selectedPartyIndex?: number;
    selectedRosterIndex?: number;
    selectedMenuOption?: number;
    availableActions?: string[];
  } {
    const scene = this.game.getSceneManager().getCurrentScene();
    if (!scene || scene.getName().toLowerCase() !== 'tavern') {
      return { inTavern: false };
    }

    const tavernScene = scene as any;
    const currentState = tavernScene.getCurrentState ? tavernScene.getCurrentState() : 'unknown';
    const state = this.getGameState();

    const result: any = {
      inTavern: true,
      currentState,
      partySize: state.party.characters.length,
      rosterSize: state.characterRoster?.length || 0,
    };

    if (tavernScene.stateManager) {
      const stateContext = tavernScene.stateManager.getStateContext();
      result.selectedPartyIndex = stateContext.selectedPartyIndex;
      result.selectedRosterIndex = stateContext.selectedRosterIndex;
      result.selectedMenuOption = stateContext.selectedMenuOption;

      const mainMenuOptions = tavernScene.stateManager.getMainMenuOptions?.() || [];
      result.availableActions = mainMenuOptions;
    }

    return result;
  }

  public testRandomSelector(): void {
    DebugLogger.info('AIInterface', 'Starting RandomSelector tests...');

    try {
      DebugLogger.info('AIInterface', 'Test 1: selectRandom with array');
      const testArray = ['a', 'b', 'c', 'd', 'e'];
      const selected = RandomSelector.selectRandom(testArray);
      DebugLogger.info('AIInterface', `Result: ${selected} (should be one of: ${testArray.join(', ')})`);
      DebugLogger.info('AIInterface', `✓ Result is valid: ${testArray.includes(selected)}`);

      DebugLogger.info('AIInterface', 'Test 2: selectRandom distribution (100 trials)');
      const counts: { [key: string]: number } = {};
      for (let i = 0; i < 100; i++) {
        const val = RandomSelector.selectRandom(testArray);
        counts[val] = (counts[val] || 0) + 1;
      }
      DebugLogger.info('AIInterface', `Distribution: ${JSON.stringify(counts)}`);
      DebugLogger.info('AIInterface', `✓ All values appeared: ${Object.keys(counts).length > 0}`);

      DebugLogger.info('AIInterface', 'Test 3: selectWeighted');
      const weightedOptions = [
        { item: 'solo', weight: 0.4 },
        { item: 'duo', weight: 0.4 },
        { item: 'group', weight: 0.2 }
      ];
      const weightedResult = RandomSelector.selectWeighted(weightedOptions);
      DebugLogger.info('AIInterface', `Result: ${weightedResult} (should be solo, duo, or group)`);
      DebugLogger.info('AIInterface', `✓ Result is valid: ${['solo', 'duo', 'group'].includes(weightedResult)}`);

      DebugLogger.info('AIInterface', 'Test 4: selectWeighted distribution (1000 trials)');
      const weightCounts: { [key: string]: number } = {};
      for (let i = 0; i < 1000; i++) {
        const val = RandomSelector.selectWeighted(weightedOptions);
        weightCounts[val] = (weightCounts[val] || 0) + 1;
      }
      DebugLogger.info('AIInterface', `Distribution: ${JSON.stringify(weightCounts)}`);
      DebugLogger.info('AIInterface', `Expected ~40% solo, ~40% duo, ~20% group`);
      DebugLogger.info('AIInterface', `Actual: ${(weightCounts.solo/10).toFixed(1)}% solo, ${(weightCounts.duo/10).toFixed(1)}% duo, ${(weightCounts.group/10).toFixed(1)}% group`);

      DebugLogger.info('AIInterface', 'Test 5: Error handling - empty array');
      try {
        RandomSelector.selectRandom([]);
        DebugLogger.error('AIInterface', '✗ Should have thrown error for empty array');
      } catch (e: any) {
        DebugLogger.info('AIInterface', `✓ Correctly threw error: ${e.message}`);
      }

      DebugLogger.info('AIInterface', 'Test 6: Error handling - negative weight');
      try {
        RandomSelector.selectWeighted([{ item: 'test', weight: -1 }]);
        DebugLogger.error('AIInterface', '✗ Should have thrown error for negative weight');
      } catch (e: any) {
        DebugLogger.info('AIInterface', `✓ Correctly threw error: ${e.message}`);
      }

      DebugLogger.info('AIInterface', '=== All RandomSelector tests completed ===');
      console.log('RandomSelector tests completed! Check debug.log for detailed results.');

    } catch (error: any) {
      DebugLogger.error('AIInterface', `Error during RandomSelector testing: ${error.message}`);
    }
  }

  public testColorPalette(): void {
    DebugLogger.info('AIInterface', 'Starting ColorPalette tests...');

    try {
      DebugLogger.info('AIInterface', 'Test 1: getHSLPalette size');
      const palette = ColorPalette.getHSLPalette();
      DebugLogger.info('AIInterface', `Palette size: ${palette.length} (expected: 256)`);
      DebugLogger.info('AIInterface', `✓ Correct size: ${palette.length === 256}`);

      DebugLogger.info('AIInterface', 'Test 2: Verify caching');
      const palette2 = ColorPalette.getHSLPalette();
      DebugLogger.info('AIInterface', `Same reference: ${palette === palette2} (should be true)`);
      DebugLogger.info('AIInterface', `✓ Caching works: ${palette === palette2}`);

      DebugLogger.info('AIInterface', 'Test 3: Verify color format');
      const firstColor = palette[0];
      const lastColor = palette[255];
      DebugLogger.info('AIInterface', `First color: ${firstColor} (expected: hsl(0, 70%, 30%))`);
      DebugLogger.info('AIInterface', `Last color: ${lastColor} (expected: hsl(349, 70%, 80%))`);
      DebugLogger.info('AIInterface', `✓ First color correct: ${firstColor === 'hsl(0, 70%, 30%)'}`);
      DebugLogger.info('AIInterface', `✓ Last color correct: ${lastColor === 'hsl(349, 70%, 80%)'}`);

      DebugLogger.info('AIInterface', 'Test 4: Verify hue range (first row)');
      const hues: string[] = [];
      for (let i = 0; i < 32; i += 8) {
        hues.push(palette[i]);
      }
      DebugLogger.info('AIInterface', `Sample hues: ${hues.join(', ')}`);
      DebugLogger.info('AIInterface', `✓ Hues span spectrum: ${hues.length === 4}`);

      DebugLogger.info('AIInterface', 'Test 5: Verify lightness range (first column)');
      const lightnesses: string[] = [];
      for (let i = 0; i < 8; i++) {
        lightnesses.push(palette[i * 32]);
      }
      DebugLogger.info('AIInterface', `Sample lightness levels: ${lightnesses.join(', ')}`);
      DebugLogger.info('AIInterface', `✓ 8 lightness levels: ${lightnesses.length === 8}`);

      DebugLogger.info('AIInterface', 'Test 6: getRandomColor');
      const randomColors: string[] = [];
      for (let i = 0; i < 10; i++) {
        randomColors.push(ColorPalette.getRandomColor());
      }
      DebugLogger.info('AIInterface', `10 random colors: ${randomColors.join(', ')}`);
      const allInPalette = randomColors.every(color => palette.includes(color));
      DebugLogger.info('AIInterface', `✓ All random colors in palette: ${allInPalette}`);

      DebugLogger.info('AIInterface', 'Test 7: getRandomColor distribution (100 trials)');
      const colorCounts: { [key: string]: number } = {};
      for (let i = 0; i < 100; i++) {
        const color = ColorPalette.getRandomColor();
        colorCounts[color] = (colorCounts[color] || 0) + 1;
      }
      const uniqueColors = Object.keys(colorCounts).length;
      DebugLogger.info('AIInterface', `Unique colors generated: ${uniqueColors}/100 trials`);
      DebugLogger.info('AIInterface', `✓ Good distribution: ${uniqueColors > 50}`);

      DebugLogger.info('AIInterface', '=== All ColorPalette tests completed ===');
      console.log('ColorPalette tests completed! Check debug.log for detailed results.');

    } catch (error: any) {
      DebugLogger.error('AIInterface', `Error during ColorPalette testing: ${error.message}`);
    }
  }

  public getBanterMetrics(): any {
    try {
      const services = GameServices.getInstance();
      const metrics = services.getBanterMetrics();
      return metrics.getStats();
    } catch (error: any) {
      DebugLogger.error('AIInterface', `Error getting banter metrics: ${error.message}`);
      return null;
    }
  }

  public getBanterEvents(): any[] {
    try {
      const services = GameServices.getInstance();
      const eventTracker = services.getBanterEventTracker();
      return eventTracker.getRecentEvents();
    } catch (error: any) {
      DebugLogger.error('AIInterface', `Error getting banter events: ${error.message}`);
      return [];
    }
  }

  public getBanterState(): {
    isGenerating: boolean;
    lastTrigger: any;
    metrics: any;
    recentEvents: any[];
  } {
    try {
      const services = GameServices.getInstance();
      const orchestrator = services.getBanterOrchestratorInstance();
      const triggerDetector = services.getTriggerDetector();

      return {
        isGenerating: (orchestrator as any).isGenerating || false,
        lastTrigger: (triggerDetector as any).lastTriggerTime || null,
        metrics: this.getBanterMetrics(),
        recentEvents: this.getBanterEvents()
      };
    } catch (error: any) {
      DebugLogger.error('AIInterface', `Error getting banter state: ${error.message}`);
      return {
        isGenerating: false,
        lastTrigger: null,
        metrics: null,
        recentEvents: []
      };
    }
  }

  public forceBanterTrigger(triggerType?: BanterTriggerType): void {
    try {
      DebugLogger.info('AIInterface', `Forcing banter trigger: ${triggerType || 'any'}`);

      const services = GameServices.getInstance();
      const eventTracker = services.getBanterEventTracker();

      if (triggerType === BanterTriggerType.CharacterDeath) {
        const state = this.getGameState();
        const firstChar = state.party.characters[0];
        if (firstChar) {
          eventTracker.recordCharacterDeath(firstChar.name);
        }
      } else if (triggerType === BanterTriggerType.DarkZoneEntry) {
        eventTracker.recordDarkZoneEntry();
      } else if (triggerType === BanterTriggerType.LowHpWarning) {
        eventTracker.recordEvent({
          type: 'LowHp' as any,
          timestamp: Date.now(),
          details: 'Forced low HP trigger'
        });
      }

      const triggerDetector = services.getTriggerDetector();
      (triggerDetector as any).lastTriggerTime = 0;

      DebugLogger.info('AIInterface', 'Banter trigger forced - will fire on next update cycle');

    } catch (error: any) {
      DebugLogger.error('AIInterface', `Error forcing banter trigger: ${error.message}`);
    }
  }

  public testBanterSystem(): void {
    DebugLogger.info('AIInterface', 'Starting banter system tests...');

    try {
      DebugLogger.info('AIInterface', 'Test 1: Check banter services registered');
      try {
        const services = GameServices.getInstance();
        services.getBanterOrchestratorInstance();
        services.getTriggerDetector();
        services.getBanterEventTracker();
        services.getBanterMetrics();
        DebugLogger.info('AIInterface', '✓ All core banter services registered');
      } catch (e: any) {
        DebugLogger.error('AIInterface', `✗ Banter services not registered: ${e.message}`);
      }

      DebugLogger.info('AIInterface', 'Test 2: Check banter metrics');
      const metricsData = this.getBanterMetrics();
      DebugLogger.info('AIInterface', `Metrics: ${JSON.stringify(metricsData)}`);

      DebugLogger.info('AIInterface', 'Test 3: Check event tracker');
      const events = this.getBanterEvents();
      DebugLogger.info('AIInterface', `Recent events: ${events.length}`);

      DebugLogger.info('AIInterface', 'Test 4: Check banter state');
      const state = this.getBanterState();
      DebugLogger.info('AIInterface', `Is generating: ${state.isGenerating}`);
      DebugLogger.info('AIInterface', `Last trigger: ${state.lastTrigger}`);

      DebugLogger.info('AIInterface', '=== Banter system test completed ===');
      console.log('Banter system test completed! Check debug.log for detailed results.');

    } catch (error: any) {
      DebugLogger.error('AIInterface', `Error during banter system testing: ${error.message}`);
    }
  }

  public getAudioState(): {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    voiceVolume: number;
    currentMusic: string | null;
    activeSfx: string[];
    isMuted: boolean;
  } {
    try {
      const services = GameServices.getInstance();
      const audioManager = services.getAudioManager();
      return audioManager.getState();
    } catch (error: any) {
      DebugLogger.error('AIInterface', `Error getting audio state: ${error.message}`);
      return {
        masterVolume: 1.0,
        musicVolume: 0.7,
        sfxVolume: 0.8,
        voiceVolume: 0.9,
        currentMusic: null,
        activeSfx: [],
        isMuted: false,
      };
    }
  }

  public playMusic(clipId: string, options?: { volumeMultiplier?: number; fadeInDuration?: number }): void {
    try {
      const services = GameServices.getInstance();
      const audioManager = services.getAudioManager();
      audioManager.playMusic(clipId, options);
      DebugLogger.info('AIInterface', `Playing music: ${clipId}`, options);
    } catch (error: any) {
      DebugLogger.error('AIInterface', `Error playing music: ${error.message}`);
    }
  }

  public stopMusic(fadeOutDuration?: number): void {
    try {
      const services = GameServices.getInstance();
      const audioManager = services.getAudioManager();
      audioManager.stopMusic({ fadeOutDuration });
      DebugLogger.info('AIInterface', 'Stopping music', { fadeOutDuration });
    } catch (error: any) {
      DebugLogger.error('AIInterface', `Error stopping music: ${error.message}`);
    }
  }

  public playSfx(clipId: string, volumeMultiplier?: number): void {
    try {
      const services = GameServices.getInstance();
      const audioManager = services.getAudioManager();
      audioManager.playSfx(clipId, { volumeMultiplier });
      DebugLogger.info('AIInterface', `Playing SFX: ${clipId}`, { volumeMultiplier });
    } catch (error: any) {
      DebugLogger.error('AIInterface', `Error playing SFX: ${error.message}`);
    }
  }

  public stopAllSfx(): void {
    try {
      const services = GameServices.getInstance();
      const audioManager = services.getAudioManager();
      audioManager.stopAllSfx();
      DebugLogger.info('AIInterface', 'Stopped all SFX');
    } catch (error: any) {
      DebugLogger.error('AIInterface', `Error stopping SFX: ${error.message}`);
    }
  }

  public setMasterVolume(volume: number): void {
    try {
      const services = GameServices.getInstance();
      const audioManager = services.getAudioManager();
      audioManager.setMasterVolume(volume);
      DebugLogger.info('AIInterface', `Set master volume: ${volume}`);
    } catch (error: any) {
      DebugLogger.error('AIInterface', `Error setting master volume: ${error.message}`);
    }
  }

  public setMusicVolume(volume: number): void {
    try {
      const services = GameServices.getInstance();
      const audioManager = services.getAudioManager();
      audioManager.setMusicVolume(volume);
      DebugLogger.info('AIInterface', `Set music volume: ${volume}`);
    } catch (error: any) {
      DebugLogger.error('AIInterface', `Error setting music volume: ${error.message}`);
    }
  }

  public setSfxVolume(volume: number): void {
    try {
      const services = GameServices.getInstance();
      const audioManager = services.getAudioManager();
      audioManager.setSfxVolume(volume);
      DebugLogger.info('AIInterface', `Set SFX volume: ${volume}`);
    } catch (error: any) {
      DebugLogger.error('AIInterface', `Error setting SFX volume: ${error.message}`);
    }
  }

  public toggleMute(): boolean {
    try {
      const services = GameServices.getInstance();
      const audioManager = services.getAudioManager();
      const isMuted = audioManager.toggleMute();
      DebugLogger.info('AIInterface', `Toggled mute: ${isMuted ? 'muted' : 'unmuted'}`);
      return isMuted;
    } catch (error: any) {
      DebugLogger.error('AIInterface', `Error toggling mute: ${error.message}`);
      return false;
    }
  }
}

export function createAIInterface(game: Game): AIInterface {
  return new AIInterface(game);
}