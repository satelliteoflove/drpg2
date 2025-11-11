import { ServiceBasedScene } from './base/ServiceBasedScene';
import { GameState } from '../types/GameTypes';
import { SceneManager } from '../core/Scene';
import { DebugLogger } from '../utils/DebugLogger';
import { TavernUIRenderer } from '../systems/tavern/TavernUIRenderer';
import { TavernStateManager } from '../systems/tavern/TavernStateManager';
import { TavernInputHandler } from '../systems/tavern/TavernInputHandler';
import { TavernServiceHandler } from '../systems/tavern/TavernServiceHandler';
import { TavernState, TavernStateContext } from '../types/TavernTypes';

export class TavernScene extends ServiceBasedScene<
  TavernState,
  TavernStateContext,
  TavernUIRenderer,
  TavernStateManager,
  TavernInputHandler,
  TavernServiceHandler
> {
  constructor(gameState: GameState, sceneManager: SceneManager) {
    super('Tavern', gameState, sceneManager);
  }

  protected initializeComponents(): void {
    this.stateManager = new TavernStateManager(this.gameState);
    this.serviceHandler = new TavernServiceHandler(this.gameState, this.messageLog);
    this.uiRenderer = new TavernUIRenderer(this.gameState, this.messageLog);
    this.inputHandler = new TavernInputHandler(
      this.gameState,
      this.sceneManager,
      this.stateManager,
      this.serviceHandler,
      this.messageLog
    );

    DebugLogger.info('TavernScene', 'Components initialized');
  }

  protected onEnter(): void {
    const party = this.gameState.party.characters;
    const roster = this.gameState.characterRoster || [];
    if (this.messageLog?.add) {
      this.messageLog.add(`Welcome to Gilgamesh's Tavern!`);
      this.messageLog.add(`Party: ${party.length}/6 | Roster: ${roster.length}`);
    }
  }
}
