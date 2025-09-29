import { Scene, SceneManager, SceneRenderContext } from '../core/Scene';
import { GameState } from '../types/GameTypes';
import { DebugLogger } from '../utils/DebugLogger';
import { InnUIRenderer } from '../systems/inn/InnUIRenderer';
import { InnStateManager } from '../systems/inn/InnStateManager';
import { InnInputHandler } from '../systems/inn/InnInputHandler';
import { InnTransactionHandler } from '../systems/inn/InnTransactionHandler';

export class InnScene extends Scene {
  protected gameState: GameState;
  protected sceneManager: SceneManager;
  private messageLog: any;

  private uiRenderer!: InnUIRenderer;
  private stateManager!: InnStateManager;
  private inputHandler!: InnInputHandler;
  private transactionHandler!: InnTransactionHandler;

  constructor(gameState: GameState, sceneManager: SceneManager) {
    super('Inn');
    this.gameState = gameState;
    this.sceneManager = sceneManager;
    this.messageLog = this.gameState.messageLog;

    if (!this.messageLog) {
      DebugLogger.warn('InnScene', 'MessageLog not found in gameState');
    }

    this.initializeComponents();
  }

  private initializeComponents(): void {
    this.stateManager = new InnStateManager(this.gameState);
    this.transactionHandler = new InnTransactionHandler(this.gameState, this.messageLog);
    this.uiRenderer = new InnUIRenderer(this.gameState, this.messageLog);
    this.inputHandler = new InnInputHandler(
      this.gameState,
      this.sceneManager,
      this.stateManager,
      this.transactionHandler,
      this.messageLog
    );

    DebugLogger.info('InnScene', 'Components initialized');
  }

  public enter(): void {
    this.stateManager.reset();

    const charactersWithLevelUp = this.stateManager.getCharactersWithPendingLevelUp();
    if (charactersWithLevelUp.length > 0 && this.messageLog?.add) {
      this.messageLog.add(`${charactersWithLevelUp.length} character(s) ready to level up!`);
    }

    DebugLogger.info('InnScene', 'Entered inn scene');
  }

  public exit(): void {
    DebugLogger.info('InnScene', 'Exited inn scene');
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
    const normalizedKey = key.toLowerCase();
    return this.inputHandler.handleInput(normalizedKey);
  }

  public getCurrentState(): string {
    return this.stateManager.currentState;
  }
}