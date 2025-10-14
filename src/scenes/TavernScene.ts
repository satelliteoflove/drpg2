import { Scene, SceneManager, SceneRenderContext } from '../core/Scene';
import { GameState } from '../types/GameTypes';
import { DebugLogger } from '../utils/DebugLogger';
import { TavernUIRenderer } from '../systems/tavern/TavernUIRenderer';
import { TavernStateManager } from '../systems/tavern/TavernStateManager';
import { TavernInputHandler } from '../systems/tavern/TavernInputHandler';
import { TavernServiceHandler } from '../systems/tavern/TavernServiceHandler';

export class TavernScene extends Scene {
  protected gameState: GameState;
  protected sceneManager: SceneManager;
  private messageLog: any;

  private uiRenderer!: TavernUIRenderer;
  private stateManager!: TavernStateManager;
  private inputHandler!: TavernInputHandler;
  private serviceHandler!: TavernServiceHandler;

  constructor(gameState: GameState, sceneManager: SceneManager) {
    super('Tavern');
    this.gameState = gameState;
    this.sceneManager = sceneManager;
    this.messageLog = this.gameState.messageLog;

    if (!this.messageLog) {
      DebugLogger.warn('TavernScene', 'MessageLog not found in gameState');
    }

    this.initializeComponents();
  }

  private initializeComponents(): void {
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

  public enter(): void {
    this.stateManager.reset();

    const party = this.gameState.party.characters;
    const roster = this.gameState.characterRoster || [];
    if (this.messageLog?.add) {
      this.messageLog.add(`Welcome to Gilgamesh's Tavern!`);
      this.messageLog.add(`Party: ${party.length}/6 | Roster: ${roster.length}`);
    }

    DebugLogger.info('TavernScene', 'Entered tavern scene');
  }

  public exit(): void {
    DebugLogger.info('TavernScene', 'Exited tavern scene');
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
