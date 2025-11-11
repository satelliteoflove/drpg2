import { Scene, SceneManager, SceneRenderContext } from '../../core/Scene';
import { GameState } from '../../types/GameTypes';
import { DebugLogger } from '../../utils/DebugLogger';

export interface IUIRenderer<TStateContext> {
  render(ctx: CanvasRenderingContext2D, stateContext: TStateContext): void;
}

export interface IStateManager<TState extends string, TStateContext> {
  currentState: TState;
  reset(): void;
  getStateContext(): TStateContext;
}

export interface IInputHandler {
  handleInput(key: string): boolean;
}

export interface IServiceHandler {
}

export interface ITransactionHandler {
}

export abstract class ServiceBasedScene<
  TState extends string,
  TStateContext,
  TUIRenderer extends IUIRenderer<TStateContext>,
  TStateManager extends IStateManager<TState, TStateContext>,
  TInputHandler extends IInputHandler,
  TServiceHandler extends IServiceHandler | ITransactionHandler
> extends Scene {

  protected gameState: GameState;
  protected sceneManager: SceneManager;
  protected messageLog: any;

  protected uiRenderer!: TUIRenderer;
  protected stateManager!: TStateManager;
  protected inputHandler!: TInputHandler;
  protected serviceHandler!: TServiceHandler;

  constructor(sceneName: string, gameState: GameState, sceneManager: SceneManager) {
    super(sceneName);
    this.gameState = gameState;
    this.sceneManager = sceneManager;
    this.messageLog = this.gameState.messageLog;

    if (!this.messageLog) {
      DebugLogger.warn(sceneName, 'MessageLog not found in gameState');
    }

    this.initializeComponents();
  }

  protected abstract initializeComponents(): void;

  protected abstract onEnter(): void;

  public enter(): void {
    this.stateManager.reset();
    this.onEnter();
    DebugLogger.info(this.name, `Entered ${this.name.toLowerCase()} scene`);
  }

  public exit(): void {
    DebugLogger.info(this.name, `Exited ${this.name.toLowerCase()} scene`);
  }

  public update(_deltaTime: number): void {
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.uiRenderer.render(ctx, this.stateManager.getStateContext());
  }

  public renderLayered(renderContext: SceneRenderContext): void {
    const { renderManager } = renderContext;

    renderManager.renderBackground((ctx) => {
      this.renderBackground(ctx);
    });

    renderManager.renderUI((ctx) => {
      this.uiRenderer.render(ctx, this.stateManager.getStateContext());
    });
  }

  protected renderBackground(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  public handleInput(key: string): boolean {
    const normalizedKey = this.normalizeKey(key);
    return this.inputHandler.handleInput(normalizedKey);
  }

  protected normalizeKey(key: string): string {
    return key.toLowerCase();
  }

  public getCurrentState(): TState {
    return this.stateManager.currentState;
  }
}
