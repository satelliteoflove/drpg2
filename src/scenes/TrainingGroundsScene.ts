import { Scene, SceneManager, SceneRenderContext } from '../core/Scene';
import { GameState } from '../types/GameTypes';
import { DebugLogger } from '../utils/DebugLogger';
import { TrainingGroundsUIRenderer } from '../systems/training/TrainingGroundsUIRenderer';
import { TrainingGroundsStateManager } from '../systems/training/TrainingGroundsStateManager';
import { TrainingGroundsInputHandler } from '../systems/training/TrainingGroundsInputHandler';
import { TrainingGroundsServiceHandler } from '../systems/training/TrainingGroundsServiceHandler';

export class TrainingGroundsScene extends Scene {
  protected gameState: GameState;
  protected sceneManager: SceneManager;
  private messageLog: any;

  private uiRenderer!: TrainingGroundsUIRenderer;
  private stateManager!: TrainingGroundsStateManager;
  private inputHandler!: TrainingGroundsInputHandler;
  private serviceHandler!: TrainingGroundsServiceHandler;

  constructor(gameState: GameState, sceneManager: SceneManager) {
    super('TrainingGrounds');
    this.gameState = gameState;
    this.sceneManager = sceneManager;
    this.messageLog = this.gameState.messageLog;

    if (!this.messageLog) {
      DebugLogger.warn('TrainingGroundsScene', 'MessageLog not found in gameState');
    }

    this.initializeComponents();
  }

  private initializeComponents(): void {
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

  public enter(): void {
    this.stateManager.reset();

    if (this.gameState.characterRoster.length > 0 && this.messageLog?.add) {
      this.messageLog.add(`Roster has ${this.gameState.characterRoster.length} character(s).`);
    }

    DebugLogger.info('TrainingGroundsScene', 'Entered training grounds scene');
  }

  public exit(): void {
    DebugLogger.info('TrainingGroundsScene', 'Exited training grounds scene');
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
    return this.inputHandler.handleInput(key);
  }

  public getCurrentState(): string {
    return this.stateManager.currentState;
  }
}
