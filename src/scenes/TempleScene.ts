import { ServiceBasedScene } from './base/ServiceBasedScene';
import { GameState } from '../types/GameTypes';
import { SceneManager } from '../core/Scene';
import { DebugLogger } from '../utils/DebugLogger';
import { TempleUIRenderer } from '../systems/temple/TempleUIRenderer';
import { TempleStateManager } from '../systems/temple/TempleStateManager';
import { TempleInputHandler } from '../systems/temple/TempleInputHandler';
import { TempleServiceHandler } from '../systems/temple/TempleServiceHandler';
import { TempleState, TempleStateContext } from '../types/TempleTypes';

export class TempleScene extends ServiceBasedScene<
  TempleState,
  TempleStateContext,
  TempleUIRenderer,
  TempleStateManager,
  TempleInputHandler,
  TempleServiceHandler
> {
  constructor(gameState: GameState, sceneManager: SceneManager) {
    super('Temple', gameState, sceneManager);
  }

  protected initializeComponents(): void {
    this.stateManager = new TempleStateManager(this.gameState);
    this.serviceHandler = new TempleServiceHandler();
    this.uiRenderer = new TempleUIRenderer(this.gameState, this.messageLog, this.stateManager);
    this.inputHandler = new TempleInputHandler(
      this.gameState,
      this.sceneManager,
      this.stateManager,
      this.serviceHandler,
      this.messageLog
    );

    DebugLogger.info('TempleScene', 'Components initialized');
  }

  protected onEnter(): void {
    const charactersNeedingService = this.stateManager.getCharactersNeedingAnyService();
    if (charactersNeedingService.length > 0 && this.messageLog?.add) {
      this.messageLog.add(`${charactersNeedingService.length} character(s) need temple services.`);
    }
  }
}
