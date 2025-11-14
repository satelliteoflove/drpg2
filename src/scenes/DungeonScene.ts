import { Scene, SceneManager, SceneRenderContext } from '../core/Scene';
import { GameState } from '../types/GameTypes';
import { DebugLogger } from '../utils/DebugLogger';
import { DungeonMovementHandler } from '../systems/dungeon/DungeonMovementHandler';
import { DungeonItemPickupUI } from '../systems/dungeon/DungeonItemPickupUI';
import { DungeonInputHandler } from '../systems/dungeon/DungeonInputHandler';
import { DungeonStateManager } from '../systems/dungeon/DungeonStateManager';
import { DungeonUIRenderer } from '../systems/dungeon/DungeonUIRenderer';
import { GAME_CONFIG } from '../config/GameConstants';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';
import { GameServices } from '../services/GameServices';

export class DungeonScene extends Scene {
  protected gameState: GameState;
  protected sceneManager: SceneManager;
  private messageLog: any;

  private stateManager!: DungeonStateManager;
  private uiRenderer!: DungeonUIRenderer;
  private movementHandler!: DungeonMovementHandler;
  private itemPickupUI!: DungeonItemPickupUI;
  private dungeonInputHandler!: DungeonInputHandler;

  private performanceMonitor: PerformanceMonitor;
  private banterOrchestrator: any;

  constructor(gameState: GameState, sceneManager: SceneManager, _inputManager: any) {
    super('Dungeon');
    this.gameState = gameState;
    this.sceneManager = sceneManager;

    this.messageLog = this.gameState.messageLog;

    if (!this.messageLog) {
      DebugLogger.warn('DungeonScene', 'MessageLog not found in gameState, this should not happen');
    }

    this.stateManager = new DungeonStateManager(this.gameState);
    this.movementHandler = new DungeonMovementHandler(this.gameState, this.messageLog, this.sceneManager);
    this.itemPickupUI = new DungeonItemPickupUI(this.gameState, this.messageLog);
    this.uiRenderer = new DungeonUIRenderer(this.gameState, this.messageLog, this.itemPickupUI, this);
    this.dungeonInputHandler = new DungeonInputHandler(
      this.gameState,
      this.sceneManager,
      this.messageLog,
      this.movementHandler,
      this.itemPickupUI
    );
    this.performanceMonitor = PerformanceMonitor.getInstance();
  }

  public enter(): void {
    this.performanceMonitor.startMonitoring('dungeon');
    this.stateManager.reset();

    try {
      this.banterOrchestrator = GameServices.getBanterOrchestrator();
      if (this.banterOrchestrator) {
        DebugLogger.info('DungeonScene', 'BanterOrchestrator initialized successfully');
      }
    } catch (error) {
      DebugLogger.warn('DungeonScene', 'Failed to initialize BanterOrchestrator', { error });
      this.banterOrchestrator = null;
    }

    const currentDungeon = this.gameState.dungeon[this.gameState.currentFloor - 1];

    if (!this.gameState.hasEnteredDungeon && currentDungeon) {
      const entranceX = currentDungeon.startX;
      const entranceY = currentDungeon.startY;

      this.gameState.party.x = entranceX;
      this.gameState.party.y = entranceY;
      this.gameState.party.floor = this.gameState.currentFloor;
      this.gameState.party.facing = 'north';
      this.gameState.hasEnteredDungeon = true;

      this.movementHandler.updateDiscoveredTiles();
    }

    this.movementHandler.updateDiscoveredTiles();

    if (this.messageLog && this.messageLog.add) {
      this.messageLog.add(`Entering floor ${this.gameState.currentFloor} of the dungeon.`);
    }

    if (this.gameState.pendingLoot && this.gameState.pendingLoot.length > 0) {
      DebugLogger.debug('DungeonScene', `Starting item pickup for ${this.gameState.pendingLoot.length} items`);
      this.itemPickupUI.startItemPickup(this.gameState.pendingLoot);
      this.gameState.pendingLoot = undefined;
    }

    DebugLogger.info('DungeonScene', 'Entered dungeon scene');
  }

  public exit(): void {
    this.performanceMonitor.stopMonitoring();
    DebugLogger.info('DungeonScene', 'Exited dungeon scene');
  }

  public update(deltaTime: number): void {
    this.performanceMonitor.markUpdateStart();

    const animationController = this.movementHandler.getTurnAnimationController();

    if (animationController.isActive()) {
      this.stateManager.incrementTurnAnimationTimer(deltaTime);

      const animType = animationController.getAnimationType();
      const frameDuration = animType === 'turn'
        ? GAME_CONFIG.DUNGEON.TURN_FRAME_DURATION_MS
        : GAME_CONFIG.DUNGEON.MOVE_FRAME_DURATION_MS;

      if (this.stateManager.getTurnAnimationTimer() >= frameDuration) {
        this.stateManager.resetTurnAnimationTimer();
        const animationComplete = animationController.advanceFrame();

        if (animationComplete) {
          DebugLogger.debug('DungeonScene', `${animType} animation completed`);
          const dungeonView = this.uiRenderer.getDungeonView();
          if (dungeonView) {
            dungeonView.setViewAngle(null);
          }
        }
      }

      const dungeonView = this.uiRenderer.getDungeonView();
      if (dungeonView && animationController.isActive()) {
        const currentAngle = animationController.getCurrentAngle();
        if (currentAngle !== null) {
          dungeonView.setViewAngle(currentAngle);
        }
      }
    }

    if (!GAME_CONFIG.BANTER.DISABLE_BANTER && this.banterOrchestrator) {
      try {
        this.banterOrchestrator.update(deltaTime, this.gameState);
      } catch (error) {
        DebugLogger.error('DungeonScene', 'Error in BanterOrchestrator.update()', { error });
      }
    }

    this.performanceMonitor.markUpdateEnd();
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.executeRenderPipeline(
      ctx.canvas,
      () => {
        this.uiRenderer.renderBackground(ctx);
      },
      () => {
        this.uiRenderer.renderDungeonView(ctx);
      },
      () => {
        const stateContext = this.stateManager.getStateContext();
        this.uiRenderer.render(ctx, stateContext);
      }
    );
  }

  public hasLayeredRendering(): boolean {
    return true;
  }

  public renderLayered(renderContext: SceneRenderContext): void {
    const { renderManager, mainContext } = renderContext;

    this.executeRenderPipeline(
      mainContext.canvas,
      () => {
        renderManager.renderBackground((ctx) => {
          this.uiRenderer.renderBackground(ctx);
        });
      },
      () => {
        renderManager.renderDungeon((ctx: CanvasRenderingContext2D) => {
          this.uiRenderer.renderDungeonView(ctx);
        });
      },
      () => {
        renderManager.renderUI((ctx) => {
          const stateContext = this.stateManager.getStateContext();
          this.uiRenderer.render(ctx, stateContext);
        });
      }
    );
  }

  private executeRenderPipeline(
    canvas: HTMLCanvasElement,
    renderBackground: () => void,
    renderDungeon: () => void,
    renderUI: () => void
  ): void {
    this.performanceMonitor.markRenderStart();
    this.uiRenderer.ensureInitialized(canvas);
    this.prepareDungeonViewForRendering();

    renderBackground();
    renderDungeon();
    renderUI();

    this.performanceMonitor.markRenderEnd();
    this.performanceMonitor.recordFrame();
  }

  private prepareDungeonViewForRendering(): void {
    const currentDungeon = this.gameState.dungeon[this.gameState.currentFloor - 1];
    if (!currentDungeon) {
      return;
    }

    const dungeonView = this.uiRenderer.getDungeonView();
    if (!dungeonView) {
      return;
    }

    dungeonView.setDungeon(currentDungeon);

    const animationController = this.movementHandler.getTurnAnimationController();
    const offset = animationController.getCurrentPositionOffset();

    let visualX = this.gameState.party.x + offset.dx;
    let visualY = this.gameState.party.y + offset.dy;

    visualX = Math.max(0, Math.min(currentDungeon.width - 0.01, visualX));
    visualY = Math.max(0, Math.min(currentDungeon.height - 0.01, visualY));

    if (offset.dx !== 0 || offset.dy !== 0) {
      DebugLogger.info(
        'DungeonScene',
        `Move animation: logical=(${this.gameState.party.x}, ${this.gameState.party.y}), offset=(${offset.dx.toFixed(2)}, ${offset.dy.toFixed(2)}), visual=(${visualX.toFixed(2)}, ${visualY.toFixed(2)})`
      );
    }

    dungeonView.setPlayerPosition(visualX, visualY, this.gameState.party.facing);
  }

  public handleInput(key: string): boolean {
    if (key === 'shift+p') {
      const performanceOverlay = this.uiRenderer.getPerformanceOverlay();
      if (performanceOverlay) {
        performanceOverlay.toggle();
      }
      return true;
    }

    if (key === 'shift+r') {
      this.performanceMonitor.reset();
      DebugLogger.info('DungeonScene', 'Performance metrics reset');
      return true;
    }

    const dungeonMapView = this.uiRenderer.getDungeonMapView();
    this.dungeonInputHandler.setContext({
      isAwaitingCastleStairsResponse: this.stateManager.getIsAwaitingCastleStairsResponse(),
      dungeonMapView: dungeonMapView || undefined
    });

    const handled = this.dungeonInputHandler.handleInput(key);

    this.stateManager.setAwaitingCastleStairsResponse(this.dungeonInputHandler.getIsAwaitingResponse());

    return handled;
  }

  public getDungeonView() {
    return this.uiRenderer.getDungeonView();
  }

  public getStatusPanel() {
    return this.uiRenderer.getStatusPanel();
  }

  public setDoorPassageState(state: { x: number; y: number; direction: 'north' | 'south' | 'east' | 'west' } | null): void {
    this.stateManager.setDoorPassageState(state);
  }

  public getDoorPassageState(): { x: number; y: number; direction: 'north' | 'south' | 'east' | 'west' } | null {
    return this.stateManager.getDoorPassageState();
  }
}