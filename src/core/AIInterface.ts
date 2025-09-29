import { Game } from './Game';
import { GameState } from '../types/GameTypes';
import { Character } from '../entities/Character';
import { DiceRoller } from '../utils/DiceRoller';
import { EntityUtils } from '../utils/EntityUtils';

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
        status: char.status,
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
      case 'character creation':
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
      case 'character creation':
        return 'Creating characters';
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
}

export function createAIInterface(game: Game): AIInterface {
  return new AIInterface(game);
}