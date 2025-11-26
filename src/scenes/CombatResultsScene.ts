import { Scene, SceneManager, SceneRenderContext } from '../core/Scene';
import { GameState, Monster } from '../types/GameTypes';
import { CombatResultsStateManager } from '../systems/combatResults/CombatResultsStateManager';
import { CombatResultsUIRenderer } from '../systems/combatResults/CombatResultsUIRenderer';
import { CombatResultsInputHandler } from '../systems/combatResults/CombatResultsInputHandler';
import { CombatRewards } from './combat/CombatStateManager';
import { GameServices } from '../services/GameServices';
import { DebugLogger } from '../utils/DebugLogger';
import { SCENE_AUDIO } from '../config/AudioConstants';

export class CombatResultsScene extends Scene {
  private gameState: GameState;
  private sceneManager: SceneManager;
  private stateManager: CombatResultsStateManager;
  private uiRenderer: CombatResultsUIRenderer;
  private inputHandler: CombatResultsInputHandler;

  private pendingRewards: CombatRewards | null = null;
  private pendingMonsters: Monster[] = [];

  constructor(gameState: GameState, sceneManager: SceneManager) {
    super('CombatResults');
    this.gameState = gameState;
    this.sceneManager = sceneManager;

    this.stateManager = new CombatResultsStateManager(this.gameState);
    this.uiRenderer = new CombatResultsUIRenderer();
    this.inputHandler = new CombatResultsInputHandler(this.sceneManager, this.stateManager);
  }

  public setResults(rewards: CombatRewards, monsters: Monster[]): void {
    this.pendingRewards = rewards;
    this.pendingMonsters = monsters;
  }

  public enter(): void {
    this.stateManager.reset();

    if (this.pendingRewards) {
      this.stateManager.setRewards(this.pendingRewards, this.pendingMonsters);
      this.pendingRewards = null;
      this.pendingMonsters = [];
    }

    const config = SCENE_AUDIO['combatResults'];
    if (config?.music) {
      GameServices.getInstance().getAudioManager().playMusic(config.music, {
        volumeMultiplier: config.musicVolume
      });
    }

    DebugLogger.info('CombatResultsScene', 'Entered combat results scene', {
      totalXp: this.stateManager.getStateContext().totalXp,
      totalGold: this.stateManager.getStateContext().totalGold,
      itemCount: this.stateManager.getStateContext().items.length
    });
  }

  public exit(): void {
    DebugLogger.info('CombatResultsScene', 'Exited combat results scene');
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

  public getTestState(): any {
    return this.stateManager.getStateContext();
  }
}
