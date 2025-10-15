import { GameState, DungeonTile, Direction } from '../../types/GameTypes';
import { GameUtilities } from '../../utils/GameUtilities';
import { DebugLogger } from '../../utils/DebugLogger';
import { SceneManager } from '../../core/Scene';
import { GAME_CONFIG } from '../../config/GameConstants';
import { StatusEffectSystem } from '../StatusEffectSystem';

export interface MovementResult {
  moved: boolean;
  blocked: boolean;
  triggered: 'combat' | 'trap' | 'event' | 'stairs' | 'chest' | 'door' | null;
  message?: string;
}

export class DungeonMovementHandler {
  private static readonly MOVE_DELAY = 100;
  private static readonly ENCOUNTER_CHANCE_BASE = 0.05;
  private static readonly ENCOUNTER_CHANCE_SCALING = 0.02;

  private gameState: GameState;
  private messageLog: any;
  private sceneManager: SceneManager;
  private statusEffectSystem: StatusEffectSystem;
  private lastMoveTime: number = 0;
  private lastTileEventPosition: { x: number; y: number; floor: number } | null = null;
  private lastEncounterPosition: { x: number; y: number; floor: number } | null = null;

  constructor(gameState: GameState, messageLog: any, sceneManager: SceneManager) {
    this.gameState = gameState;
    this.messageLog = messageLog;
    this.sceneManager = sceneManager;
    this.statusEffectSystem = StatusEffectSystem.getInstance();
  }

  public handleMovement(direction: Direction): MovementResult {
    const now = Date.now();
    if (now - this.lastMoveTime < DungeonMovementHandler.MOVE_DELAY) {
      return { moved: false, blocked: true, triggered: null };
    }

    const party = this.gameState.party;
    const currentFloor = this.gameState.dungeon[this.gameState.currentFloor - 1];

    if (!currentFloor || !party) {
      DebugLogger.warn('DungeonMovementHandler', 'No current floor or party available');
      return { moved: false, blocked: true, triggered: null };
    }

    // Convert relative direction to absolute direction based on facing
    let absoluteDirection: Direction;
    if (direction === 'forward' || direction === 'backward') {
      absoluteDirection = this.getAbsoluteDirection(direction, party.facing);
    } else {
      absoluteDirection = direction;
    }

    const delta = GameUtilities.getMovementDelta(absoluteDirection);
    const newX = party.x + delta.dx;
    const newY = party.y + delta.dy;

    if (newX < 0 || newX >= currentFloor.width || newY < 0 || newY >= currentFloor.height) {
      this.messageLog?.addSystemMessage('You cannot move in that direction.');
      return { moved: false, blocked: true, triggered: null };
    }

    const targetTile = currentFloor.tiles[newY][newX];

    if (!this.canMoveTo(targetTile)) {
      this.messageLog?.addSystemMessage('The way is blocked.');
      return { moved: false, blocked: true, triggered: null };
    }

    party.x = newX;
    party.y = newY;
    this.gameState.turnCount++;
    this.lastMoveTime = now;

    this.tickAllPartyMembers();

    this.updateDiscoveredTiles();

    const tileResult = this.handleTileEffect(targetTile);

    if (this.shouldCheckRandomEncounter(targetTile)) {
      const encountered = this.checkRandomEncounter();
      if (encountered) {
        return { moved: true, blocked: false, triggered: 'combat' };
      }
    }

    return { moved: true, blocked: false, triggered: tileResult };
  }

  public handleTurn(direction: 'left' | 'right'): void {
    const party = this.gameState.party;
    if (!party) return;

    party.move(direction);
    this.gameState.turnCount++;
    this.lastMoveTime = Date.now();

    this.tickAllPartyMembers();

    this.updateDiscoveredTiles();
  }

  private tickAllPartyMembers(): void {
    const party = this.gameState.party;
    if (!party || !party.characters) return;

    party.characters.forEach((char: any) => {
      if (!char.isDead) {
        this.statusEffectSystem.tick(char, 'exploration');
      }
    });
  }

  private canMoveTo(tile: DungeonTile | null): boolean {
    if (!tile) return false;
    return tile.type !== 'wall' && tile.type !== 'solid';
  }

  private getAbsoluteDirection(relativeDir: 'forward' | 'backward', facing: Direction): Direction {
    // Convert relative direction based on current facing
    if (relativeDir === 'forward') {
      return facing as Direction;
    } else { // backward
      switch (facing) {
        case 'north': return 'south';
        case 'south': return 'north';
        case 'east': return 'west';
        case 'west': return 'east';
        default: return facing as Direction;
      }
    }
  }

  private handleTileEffect(tile: DungeonTile): MovementResult['triggered'] {
    const currentPosition = {
      x: this.gameState.party.x,
      y: this.gameState.party.y,
      floor: this.gameState.currentFloor,
    };

    const isSamePosition = this.lastTileEventPosition &&
      this.lastTileEventPosition.x === currentPosition.x &&
      this.lastTileEventPosition.y === currentPosition.y &&
      this.lastTileEventPosition.floor === currentPosition.floor;

    switch (tile.type) {
      case 'stairs_up':
        if (this.gameState.currentFloor === 1) {
          // Special case for returning to town from floor 1
          // Only show message if we haven't shown it for this position
          if (!isSamePosition) {
            this.messageLog?.addSystemMessage('You are at the castle entrance. Do you want to return to town? (Y/N)');
            this.lastTileEventPosition = currentPosition;
          }
          return 'stairs';
        } else if (this.gameState.currentFloor > 1) {
          this.handleStairsUp();
          this.lastTileEventPosition = null;
          return 'stairs';
        }
        break;

      case 'stairs_down':
        if (this.gameState.currentFloor < this.gameState.dungeon.length) {
          this.handleStairsDown();
          this.lastTileEventPosition = null;
          return 'stairs';
        }
        break;

      case 'door':
        if (tile.properties?.locked) {
          this.messageLog?.addSystemMessage('The door is locked.');
        } else {
          this.messageLog?.addSystemMessage('You pass through the doorway.');
        }
        return 'door';

      case 'chest':
        if (tile.properties?.opened) {
          this.messageLog?.addSystemMessage('The chest has already been opened.');
        } else {
          this.handleChest(tile);
          return 'chest';
        }
        break;

      case 'trap':
        if (!isSamePosition) {
          this.handleTrap(tile);
          this.lastTileEventPosition = currentPosition;
          return 'trap';
        }
        break;

      case 'event':
        if (!isSamePosition && tile.properties?.eventType) {
          this.handleEvent(tile);
          this.lastTileEventPosition = currentPosition;
          return 'event';
        }
        break;
    }

    return null;
  }

  private handleStairsUp(): void {
    this.gameState.currentFloor--;
    const newFloor = this.gameState.dungeon[this.gameState.currentFloor - 1];

    if (newFloor && newFloor.stairsDown) {
      this.gameState.party.x = newFloor.stairsDown.x;
      this.gameState.party.y = newFloor.stairsDown.y;
    }

    this.messageLog?.addSystemMessage(`Ascended to floor ${this.gameState.currentFloor}`);
  }

  private handleStairsDown(): void {
    this.gameState.currentFloor++;
    const newFloor = this.gameState.dungeon[this.gameState.currentFloor - 1];

    if (newFloor.stairsUp) {
      this.gameState.party.x = newFloor.stairsUp.x;
      this.gameState.party.y = newFloor.stairsUp.y;
    }

    this.messageLog?.addSystemMessage(`Descended to floor ${this.gameState.currentFloor}`);
  }

  private handleChest(tile: DungeonTile): void {
    if (!tile.properties) return;

    const items = tile.properties.items || [];
    const gold = tile.properties.gold || 0;

    if (gold > 0) {
      this.gameState.party.pooledGold += gold;
      this.messageLog?.addSystemMessage(`Found ${gold} gold in the chest!`);
    }

    if (items.length > 0) {
      if (!this.gameState.pendingLoot) {
        this.gameState.pendingLoot = [];
      }
      this.gameState.pendingLoot.push(...items);
      this.messageLog?.addSystemMessage(`Found ${items.length} item(s) in the chest!`);
    }

    tile.properties.opened = true;
  }

  private handleTrap(tile: DungeonTile): void {
    if (!tile.properties) return;

    const trapType = tile.properties.trapType || 'spike';
    const damage = tile.properties.damage || 5;

    this.messageLog?.addSystemMessage(`A ${trapType} trap springs!`);

    const party = this.gameState.party.getAliveCharacters();
    const victim = party[Math.floor(Math.random() * party.length)];

    if (victim) {
      victim.hp = Math.max(0, victim.hp - damage);
      this.messageLog?.addSystemMessage(`${victim.name} takes ${damage} damage!`);

      if (victim.hp <= 0) {
        victim.isDead = true;
        this.messageLog?.addSystemMessage(`${victim.name} has died!`);
      }
    }

    if (tile.properties.oneTime) {
      tile.type = 'floor';
      tile.properties = undefined;
    }
  }

  private handleEvent(tile: DungeonTile): void {
    if (!tile.properties) return;

    const eventType = tile.properties.eventType;

    switch (eventType) {
      case 'message':
        this.messageLog?.addSystemMessage(tile.properties.message || 'Something happens...');
        break;

      case 'encounter':
        this.triggerCombat(tile.properties.monsters);
        break;

      case 'heal':
        const party = this.gameState.party.getAliveCharacters();
        party.forEach((char: any) => {
          const healAmount = Math.min(10, char.maxHp - char.hp);
          if (healAmount > 0) {
            char.hp += healAmount;
            this.messageLog?.addSystemMessage(`${char.name} recovers ${healAmount} HP.`);
          }
        });
        break;

      case 'teleport':
        const targetX = tile.properties.targetX || 0;
        const targetY = tile.properties.targetY || 0;
        this.gameState.party.x = targetX;
        this.gameState.party.y = targetY;
        this.messageLog?.addSystemMessage('You are teleported to a new location!');
        break;
    }

    if (tile.properties.oneTime) {
      tile.type = 'floor';
      tile.properties = undefined;
    }
  }

  private shouldCheckRandomEncounter(tile: DungeonTile): boolean {
    if (!this.gameState.combatEnabled) return false;
    if (tile.type !== 'floor' && tile.type !== 'corridor') return false;

    const currentPosition = {
      x: this.gameState.party.x,
      y: this.gameState.party.y,
      floor: this.gameState.currentFloor,
    };

    if (this.lastEncounterPosition &&
        this.lastEncounterPosition.x === currentPosition.x &&
        this.lastEncounterPosition.y === currentPosition.y &&
        this.lastEncounterPosition.floor === currentPosition.floor) {
      return false;
    }

    return true;
  }

  private checkRandomEncounter(): boolean {
    const chance = DungeonMovementHandler.ENCOUNTER_CHANCE_BASE +
                  (this.gameState.currentFloor - 1) * DungeonMovementHandler.ENCOUNTER_CHANCE_SCALING;

    if (Math.random() < chance) {
      this.triggerCombat();
      this.lastEncounterPosition = {
        x: this.gameState.party.x,
        y: this.gameState.party.y,
        floor: this.gameState.currentFloor,
      };
      return true;
    }

    return false;
  }

  private triggerCombat(specificMonsters?: any[]): void {
    DebugLogger.debug('DungeonMovementHandler', 'Triggering combat encounter');

    const monsters = specificMonsters || this.generateRandomMonsters();

    if (!this.gameState.combatContext) {
      this.gameState.combatContext = {
        monsters: monsters,
        floor: this.gameState.currentFloor,
        surprised: Math.random() < 0.1,
      };
    }

    this.gameState.inCombat = true;
    this.sceneManager.switchTo('combat');
  }

  private generateRandomMonsters(): any[] {
    const monsterCount = Math.floor(Math.random() * 3) + 1;
    const monsters = [];

    for (let i = 0; i < monsterCount; i++) {
      monsters.push({
        name: `Monster ${i + 1}`,
        hp: 10 + this.gameState.currentFloor * 5,
        maxHp: 10 + this.gameState.currentFloor * 5,
        ac: 10 + Math.floor(this.gameState.currentFloor / 2),
        attacks: [{ damage: `1d${4 + this.gameState.currentFloor}` }],
        xpValue: 10 * this.gameState.currentFloor,
      });
    }

    return monsters;
  }

  public getCastleStairsPosition(): { x: number; y: number } | null {
    const currentFloor = this.gameState.dungeon[this.gameState.currentFloor - 1];
    if (currentFloor?.properties?.isCastle && currentFloor.stairsUp) {
      return currentFloor.stairsUp;
    }
    return null;
  }

  public updateDiscoveredTiles(): void {
    const currentFloor = this.gameState.dungeon[this.gameState.currentFloor - 1];
    if (!currentFloor) return;

    const party = this.gameState.party;
    const viewDistance = GAME_CONFIG.DUNGEON.VIEW_DISTANCE;

    for (let dy = -viewDistance; dy <= viewDistance; dy++) {
      for (let dx = -viewDistance; dx <= viewDistance; dx++) {
        const tileX = party.x + dx;
        const tileY = party.y + dy;

        if (tileX >= 0 && tileX < currentFloor.width &&
            tileY >= 0 && tileY < currentFloor.height) {
          const tile = currentFloor.tiles[tileY][tileX];
          if (tile) {
            tile.discovered = true;
          }
        }
      }
    }
  }

  public resetLastTileEventPosition(): void {
    this.lastTileEventPosition = null;
  }
}