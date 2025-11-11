import { ServiceBasedScene } from './base/ServiceBasedScene';
import { GameState } from '../types/GameTypes';
import { SceneManager } from '../core/Scene';
import { DebugLogger } from '../utils/DebugLogger';
import { TrainingGroundsUIRenderer } from '../systems/training/TrainingGroundsUIRenderer';
import { TrainingGroundsStateManager } from '../systems/training/TrainingGroundsStateManager';
import { TrainingGroundsInputHandler } from '../systems/training/TrainingGroundsInputHandler';
import { TrainingGroundsServiceHandler } from '../systems/training/TrainingGroundsServiceHandler';

export class TrainingGroundsScene extends ServiceBasedScene<
  string,
  ReturnType<TrainingGroundsStateManager['getStateContext']>,
  TrainingGroundsUIRenderer,
  TrainingGroundsStateManager,
  TrainingGroundsInputHandler,
  TrainingGroundsServiceHandler
> {
  constructor(gameState: GameState, sceneManager: SceneManager) {
    super('TrainingGrounds', gameState, sceneManager);
  }

  protected initializeComponents(): void {
    this.stateManager = new TrainingGroundsStateManager(this.gameState);
    this.serviceHandler = new TrainingGroundsServiceHandler(this.gameState);
    this.uiRenderer = new TrainingGroundsUIRenderer(this.gameState, this.messageLog, this.stateManager);
    this.inputHandler = new TrainingGroundsInputHandler(
      this.gameState,
      this.sceneManager,
      this.stateManager,
      this.serviceHandler,
      this.messageLog
    );

    DebugLogger.info('TrainingGroundsScene', 'Components initialized');
  }

  protected onEnter(): void {
    if (this.gameState.characterRoster.length > 0 && this.messageLog?.add) {
      this.messageLog.add(`Roster has ${this.gameState.characterRoster.length} character(s).`);
    }
  }

  protected normalizeKey(key: string): string {
    return key;
  }
}
