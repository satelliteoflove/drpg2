import { Scene, SceneManager, SceneRenderContext } from '../core/Scene';
import { GameState } from '../types/GameTypes';
import { DebugLogger } from '../utils/DebugLogger';
import { TempleUIRenderer } from '../systems/temple/TempleUIRenderer';
import { TempleStateManager } from '../systems/temple/TempleStateManager';
import { TempleInputHandler } from '../systems/temple/TempleInputHandler';
import { TempleServiceHandler } from '../systems/temple/TempleServiceHandler';

export class TempleScene extends Scene {
  protected gameState: GameState;
  protected sceneManager: SceneManager;
  private messageLog: any;

  private uiRenderer!: TempleUIRenderer;
  private stateManager!: TempleStateManager;
  private inputHandler!: TempleInputHandler;
  private serviceHandler!: TempleServiceHandler;

  constructor(gameState: GameState, sceneManager: SceneManager) {
    super('Temple');
    this.gameState = gameState;
    this.sceneManager = sceneManager;
    this.messageLog = this.gameState.messageLog;

    if (!this.messageLog) {
      DebugLogger.warn('TempleScene', 'MessageLog not found in gameState');
    }

    this.initializeComponents();
  }

  private initializeComponents(): void {
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

  public enter(): void {
    this.stateManager.reset();

    const charactersNeedingService = this.stateManager.getCharactersNeedingAnyService();
    if (charactersNeedingService.length > 0 && this.messageLog?.add) {
      this.messageLog.add(`${charactersNeedingService.length} character(s) need temple services.`);
    }

    DebugLogger.info('TempleScene', 'Entered temple scene');
  }

  public exit(): void {
    DebugLogger.info('TempleScene', 'Exited temple scene');
  }

  public update(_deltaTime: number): void {
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
