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
        hp: { current: char.hp, max: char.maxHp },
        mp: { current: char.mp, max: char.maxMp },
        status: char.status,
        isDead: char.isDead,
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
  } {
    const state = this.getGameState();
    if (!state.inCombat || !state.combatContext) {
      return { inCombat: false };
    }

    return {
      inCombat: true,
      enemies: state.combatContext.monsters?.map((e: any) => ({
        name: e.name,
        hp: e.hp,
        status: e.status || 'OK',
      })) || [],
      currentTurn: 'player', // Combat system doesn't expose turn info yet
    };
  }

  public simulateKeypress(key: string): boolean {
    const scene = this.game.getSceneManager().getCurrentScene();
    if (!scene) return false;
    return scene.handleInput(key);
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

    switch (scene) {
      case 'dungeon':
        actions.push('ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'm', 'i', 'Escape');
        break;
      case 'combat':
        actions.push('a', 'p', 'd', 'r', 's', '1-9');
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
      default:
        actions.push('Enter', 'Escape');
    }

    return actions;
  }

  public getSceneDescription(): string {
    const scene = this.getCurrentScene();
    const state = this.getGameState();

    switch (scene) {
      case 'dungeon':
        const dungeonInfo = this.getDungeonInfo();
        return `Dungeon Floor ${dungeonInfo.currentFloor} at (${state.party.x}, ${state.party.y}) facing ${state.party.facing}. Tile: ${dungeonInfo.tile}${dungeonInfo.hasMonsters ? ', monsters present' : ''}${dungeonInfo.hasItems ? ', items present' : ''}`;
      case 'combat':
        const combatInfo = this.getCombatInfo();
        return `Combat with ${combatInfo.enemies?.length || 0} enemies. Turn: ${combatInfo.currentTurn || 'unknown'}`;
      case 'town':
        return 'In the Town of Llylgamyn';
      case 'shop':
        return "At Boltac's Trading Post";
      case 'inventory':
        return 'Managing party inventory';
      default:
        return `In ${scene} scene`;
    }
  }
}

export function createAIInterface(game: Game): AIInterface {
  return new AIInterface(game);
}