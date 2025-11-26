import { GameState } from '../../types/GameTypes';

export type DungeonState =
  | 'exploring'
  | 'awaiting_stairs'
  | 'picking_up_items'
  | 'viewing_map';

export interface DungeonStateContext {
  currentState: DungeonState;
  isAwaitingCastleStairsResponse: boolean;
  isItemPickupActive: boolean;
  isMapVisible: boolean;
  isDebugOverlayOpen: boolean;
  isPerformanceOverlayOpen: boolean;
  currentFloor: number;
  playerPosition: { x: number; y: number; facing: string };
  doorPassageState: { x: number; y: number; direction: 'north' | 'south' | 'east' | 'west' } | null;
  turnAnimationTimer: number;
  pooledGold: number;
  partyGold: number;
  partyAlive: number;
  partyTotal: number;
  turnCount: number;
  combatEnabled: boolean;
  dungeonSeed: string;
  currentZone: string | null;
}

export class DungeonStateManager {
  private gameState: GameState;
  private currentState: DungeonState = 'exploring';
  private isAwaitingCastleStairsResponse: boolean = false;
  private doorPassageState: { x: number; y: number; direction: 'north' | 'south' | 'east' | 'west' } | null = null;
  private turnAnimationTimer: number = 0;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  public reset(): void {
    this.currentState = 'exploring';
    this.isAwaitingCastleStairsResponse = false;
    this.doorPassageState = null;
    this.turnAnimationTimer = 0;
  }

  public getStateContext(): DungeonStateContext {
    const pooledGold = this.gameState.party.pooledGold || 0;
    const partyGold = this.gameState.party.characters?.reduce((sum: number, char: any) => sum + char.gold, 0) || 0;
    const alive = this.gameState.party.characters.filter((c: any) => !c.isDead).length;
    const total = this.gameState.party.characters.length;
    const currentZone = this.getCurrentZone();

    return {
      currentState: this.currentState,
      isAwaitingCastleStairsResponse: this.isAwaitingCastleStairsResponse,
      isItemPickupActive: false,
      isMapVisible: false,
      isDebugOverlayOpen: false,
      isPerformanceOverlayOpen: false,
      currentFloor: this.gameState.currentFloor,
      playerPosition: {
        x: this.gameState.party.x,
        y: this.gameState.party.y,
        facing: this.gameState.party.facing
      },
      doorPassageState: this.doorPassageState,
      turnAnimationTimer: this.turnAnimationTimer,
      pooledGold,
      partyGold,
      partyAlive: alive,
      partyTotal: total,
      turnCount: this.gameState.turnCount || 0,
      combatEnabled: this.gameState.combatEnabled,
      dungeonSeed: this.gameState.dungeonSeed || '',
      currentZone
    };
  }

  private getCurrentZone(): string | null {
    const dungeon = this.gameState.dungeon[this.gameState.currentFloor - 1];
    if (!dungeon || !dungeon.overrideZones) return null;

    const partyX = this.gameState.party.x;
    const partyY = this.gameState.party.y;

    for (const zone of dungeon.overrideZones) {
      if (partyX >= zone.x1 && partyX <= zone.x2 && partyY >= zone.y1 && partyY <= zone.y2) {
        return zone.type;
      }
    }

    return null;
  }

  public transitionTo(newState: DungeonState): void {
    this.currentState = newState;
  }

  public canAcceptInput(): boolean {
    return this.currentState === 'exploring' || this.currentState === 'awaiting_stairs';
  }

  public setAwaitingCastleStairsResponse(value: boolean): void {
    this.isAwaitingCastleStairsResponse = value;
    if (value) {
      this.currentState = 'awaiting_stairs';
    } else if (this.currentState === 'awaiting_stairs') {
      this.currentState = 'exploring';
    }
  }

  public getIsAwaitingCastleStairsResponse(): boolean {
    return this.isAwaitingCastleStairsResponse;
  }

  public setDoorPassageState(state: { x: number; y: number; direction: 'north' | 'south' | 'east' | 'west' } | null): void {
    this.doorPassageState = state;
  }

  public getDoorPassageState(): { x: number; y: number; direction: 'north' | 'south' | 'east' | 'west' } | null {
    return this.doorPassageState;
  }

  public getTurnAnimationTimer(): number {
    return this.turnAnimationTimer;
  }

  public setTurnAnimationTimer(value: number): void {
    this.turnAnimationTimer = value;
  }

  public incrementTurnAnimationTimer(deltaTime: number): void {
    this.turnAnimationTimer += deltaTime;
  }

  public resetTurnAnimationTimer(): void {
    this.turnAnimationTimer = 0;
  }
}
