import { ServiceBasedScene } from './base/ServiceBasedScene';
import { GameState } from '../types/GameTypes';
import { SceneManager } from '../core/Scene';
import { DebugLogger } from '../utils/DebugLogger';
import { InnUIRenderer } from '../systems/inn/InnUIRenderer';
import { InnStateManager, InnState, InnStateContext } from '../systems/inn/InnStateManager';
import { InnInputHandler } from '../systems/inn/InnInputHandler';
import { InnTransactionHandler } from '../systems/inn/InnTransactionHandler';

export class InnScene extends ServiceBasedScene<
  InnState,
  InnStateContext,
  InnUIRenderer,
  InnStateManager,
  InnInputHandler,
  InnTransactionHandler
> {
  constructor(gameState: GameState, sceneManager: SceneManager) {
    super('Inn', gameState, sceneManager);
  }

  protected initializeComponents(): void {
    this.stateManager = new InnStateManager(this.gameState);
    this.serviceHandler = new InnTransactionHandler(this.gameState, this.messageLog);
    this.uiRenderer = new InnUIRenderer(this.gameState, this.messageLog);
    this.inputHandler = new InnInputHandler(
      this.gameState,
      this.sceneManager,
      this.stateManager,
      this.serviceHandler,
      this.messageLog
    );

    DebugLogger.info('InnScene', 'Components initialized');
  }

  protected onEnter(): void {
    const charactersWithLevelUp = this.stateManager.getCharactersWithPendingLevelUp();
    if (charactersWithLevelUp.length > 0 && this.messageLog?.add) {
      this.messageLog.add(`${charactersWithLevelUp.length} character(s) ready to level up!`);
    }
  }
}