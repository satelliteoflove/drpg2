import { ServiceBasedScene } from './base/ServiceBasedScene';
import { GameState } from '../types/GameTypes';
import { SceneManager } from '../core/Scene';
import { DebugLogger } from '../utils/DebugLogger';
import { ShopUIRenderer } from '../systems/shop/ShopUIRenderer';
import { ShopStateManager, ShopState } from '../systems/shop/ShopStateManager';
import { ShopInputHandler } from '../systems/shop/ShopInputHandler';
import { ShopTransactionHandler } from '../systems/shop/ShopTransactionHandler';

export class ShopScene extends ServiceBasedScene<
  ShopState,
  ReturnType<ShopStateManager['getStateContext']>,
  ShopUIRenderer,
  ShopStateManager,
  ShopInputHandler,
  ShopTransactionHandler
> {
  constructor(gameState: GameState, sceneManager: SceneManager) {
    super('Shop', gameState, sceneManager);
  }

  protected initializeComponents(): void {
    this.stateManager = new ShopStateManager(this.gameState);
    this.serviceHandler = new ShopTransactionHandler(this.gameState, this.messageLog);
    this.uiRenderer = new ShopUIRenderer(this.gameState, this.messageLog);
    this.inputHandler = new ShopInputHandler(
      this.gameState,
      this.sceneManager,
      this.stateManager,
      this.serviceHandler,
      this.messageLog
    );

    DebugLogger.info('ShopScene', 'Components initialized');
  }

  protected onEnter(): void {
  }
}