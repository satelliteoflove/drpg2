import { GameState } from '../../types/GameTypes';
import { DungeonLevel } from '../../types/GameTypes';

export interface ISaveService {
  saveGame(gameState: GameState, playtimeSeconds: number): void;
  loadGame(): { gameState: GameState; playtimeSeconds: number } | null;
  hasSave(): boolean;
  deleteSave(): void;
}

export interface IDungeonService {
  generateLevel(floor: number): DungeonLevel;
  generateDungeon(floors: number): DungeonLevel[];
}

export interface IValidationService {
  safeValidateGameState(data: unknown): GameState | null;
  safeValidateParty(data: unknown, context: string): any;
}