import { Scene, SceneManager, SceneRenderContext } from '../core/Scene';
import { GameState } from '../types/GameTypes';
import { DebugLogger } from '../utils/DebugLogger';
import { ShopUIRenderer } from '../systems/shop/ShopUIRenderer';
import { ShopStateManager } from '../systems/shop/ShopStateManager';
import { ShopInputHandler } from '../systems/shop/ShopInputHandler';
import { ShopTransactionHandler } from '../systems/shop/ShopTransactionHandler';

export class ShopScene extends Scene {
  protected gameState: GameState;
  protected sceneManager: SceneManager;
  private messageLog: any;

  private uiRenderer!: ShopUIRenderer;
  private stateManager!: ShopStateManager;
  private inputHandler!: ShopInputHandler;
  private transactionHandler!: ShopTransactionHandler;

  constructor(gameState: GameState, sceneManager: SceneManager) {
    super('Shop');
    this.gameState = gameState;
    this.sceneManager = sceneManager;
    this.messageLog = this.gameState.messageLog;

    if (!this.messageLog) {
      DebugLogger.warn('ShopScene', 'MessageLog not found in gameState');
    }

    this.initializeComponents();
  }

  private initializeComponents(): void {
    this.stateManager = new ShopStateManager(this.gameState);
    this.transactionHandler = new ShopTransactionHandler(this.gameState, this.messageLog);
    this.uiRenderer = new ShopUIRenderer(this.gameState, this.messageLog);
    this.inputHandler = new ShopInputHandler(
      this.gameState,
      this.sceneManager,
      this.stateManager,
      this.transactionHandler,
      this.messageLog
    );

    DebugLogger.info('ShopScene', 'Components initialized');
  }

  public enter(): void {
    this.stateManager.reset();
    DebugLogger.info('ShopScene', 'Entered shop scene');
  }

  public exit(): void {
    DebugLogger.info('ShopScene', 'Exited shop scene');
  }

  public update(_deltaTime: number): void {
    // Update logic if needed
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.uiRenderer.render(ctx, this.stateManager.getStateContext());
  }

  public renderLayered(renderContext: SceneRenderContext): void {
    const { renderManager } = renderContext;

    renderManager.renderBackground((ctx) => {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    });

    renderManager.renderUI((ctx) => {
      this.uiRenderer.render(ctx, this.stateManager.getStateContext());
    });
  }

  public handleInput(key: string): boolean {
    return this.inputHandler.handleInput(key);
  }
}