import { Scene, SceneManager, SceneRenderContext } from '../core/Scene';
import { GameState } from '../types/GameTypes';
import { DungeonViewRaycast } from '../ui/DungeonViewRaycast';
import { StatusPanel } from '../ui/StatusPanel';
import { DungeonMapView } from '../ui/DungeonMapView';
import { DebugOverlay } from '../ui/DebugOverlay';
import { PerformanceOverlay } from '../ui/PerformanceOverlay';
import { DebugLogger } from '../utils/DebugLogger';
import { DungeonMovementHandler } from '../systems/dungeon/DungeonMovementHandler';
import { DungeonItemPickupUI } from '../systems/dungeon/DungeonItemPickupUI';
import { DungeonInputHandler } from '../systems/dungeon/DungeonInputHandler';
import { GAME_CONFIG } from '../config/GameConstants';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';
import { UI_CONSTANTS } from '../config/UIConstants';

export class DungeonScene extends Scene {
  protected gameState: GameState;
  protected sceneManager: SceneManager;
  private dungeonView!: DungeonViewRaycast;
  private statusPanel!: StatusPanel;
  private messageLog: any;
  private dungeonMapView!: DungeonMapView;
  private debugOverlay!: DebugOverlay;
  private performanceOverlay!: PerformanceOverlay;

  private movementHandler!: DungeonMovementHandler;
  private itemPickupUI!: DungeonItemPickupUI;
  private dungeonInputHandler!: DungeonInputHandler;

  private isAwaitingCastleStairsResponse: boolean = false;
  private turnAnimationTimer: number = 0;
  private performanceMonitor: PerformanceMonitor;
  private doorPassageState: { x: number; y: number; direction: 'north' | 'south' | 'east' | 'west' } | null = null;

  constructor(gameState: GameState, sceneManager: SceneManager, _inputManager: any) {
    super('Dungeon');
    this.gameState = gameState;
    this.sceneManager = sceneManager;

    this.messageLog = this.gameState.messageLog;

    if (!this.messageLog) {
      DebugLogger.warn('DungeonScene', 'MessageLog not found in gameState, this should not happen');
    }

    this.movementHandler = new DungeonMovementHandler(this.gameState, this.messageLog, this.sceneManager);
    this.itemPickupUI = new DungeonItemPickupUI(this.gameState, this.messageLog);
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

    // Check for pending loot from combat
    if (this.gameState.pendingLoot && this.gameState.pendingLoot.length > 0) {
      DebugLogger.debug('DungeonScene', `Starting item pickup for ${this.gameState.pendingLoot.length} items`);
      this.itemPickupUI.startItemPickup(this.gameState.pendingLoot);
      this.gameState.pendingLoot = undefined; // Clear pending loot after starting pickup
    }
  }

  public exit(): void {
    this.performanceMonitor.stopMonitoring();
  }

  public update(deltaTime: number): void {
    this.performanceMonitor.markUpdateStart();

    const animationController = this.movementHandler.getTurnAnimationController();

    if (animationController.isActive()) {
      this.turnAnimationTimer += deltaTime;

      const animType = animationController.getAnimationType();
      const frameDuration = animType === 'turn'
        ? GAME_CONFIG.DUNGEON.TURN_FRAME_DURATION_MS
        : GAME_CONFIG.DUNGEON.MOVE_FRAME_DURATION_MS;

      if (this.turnAnimationTimer >= frameDuration) {
        this.turnAnimationTimer = 0;
        const animationComplete = animationController.advanceFrame();

        if (animationComplete) {
          DebugLogger.debug('DungeonScene', `${animType} animation completed`);
          if (this.dungeonView) {
            this.dungeonView.setViewAngle(null);
          }
        }
      }

      if (this.dungeonView && animationController.isActive()) {
        const currentAngle = animationController.getCurrentAngle();
        if (currentAngle !== null) {
          this.dungeonView.setViewAngle(currentAngle);
        }
      }
    }

    this.performanceMonitor.markUpdateEnd();
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.performanceMonitor.markRenderStart();
    this.renderImperative(ctx);
    this.performanceMonitor.markRenderEnd();
    this.performanceMonitor.recordFrame();
  }

  public hasLayeredRendering(): boolean {
    return true;
  }

  public renderLayered(renderContext: SceneRenderContext): void {
    this.performanceMonitor.markRenderStart();

    const { renderManager, mainContext } = renderContext;

    if (!this.dungeonView) {
      this.initializeUI(mainContext.canvas);
    }

    const currentDungeon = this.gameState.dungeon[this.gameState.currentFloor - 1];
    if (currentDungeon) {
      this.dungeonView.setDungeon(currentDungeon);

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

      this.dungeonView.setPlayerPosition(visualX, visualY, this.gameState.party.facing);
    }

    renderManager.renderBackground((ctx) => {
      this.renderBackground(ctx);
    });

    renderManager.renderDungeon((ctx: CanvasRenderingContext2D) => {
      if (this.dungeonView) {
        this.dungeonView.render(ctx);
      }
    });

    renderManager.renderUI((ctx) => {
      // Render header first
      this.renderDungeonHeader(ctx);

      if (this.statusPanel) {
        this.statusPanel.render(this.gameState.party, ctx);
      }

      // Render info panel
      this.renderDungeonInfo(ctx);

      if (this.dungeonMapView && currentDungeon) {
        this.dungeonMapView.setDungeon(currentDungeon);
        this.dungeonMapView.setPlayerPosition(
          this.gameState.party.x,
          this.gameState.party.y,
          this.gameState.party.facing
        );
        if (this.dungeonMapView.getIsVisible()) {
          this.dungeonMapView.render(ctx);
        }
      }

      this.itemPickupUI.render(ctx);

      // Render the shared message log only when map is not visible
      if (this.messageLog && !this.dungeonMapView?.getIsVisible()) {
        this.messageLog.render(ctx);
      }

      this.renderControls(ctx);

      this.updateDebugData();
      if (this.debugOverlay && this.debugOverlay.isOpen()) {
        this.debugOverlay.render(this.gameState);
      }

      if (this.performanceOverlay) {
        this.performanceOverlay.render(ctx);
      }
    });

    this.performanceMonitor.markRenderEnd();
    this.performanceMonitor.recordFrame();
  }

  private renderImperative(ctx: CanvasRenderingContext2D): void {
    if (!this.dungeonView) {
      this.initializeUI(ctx.canvas);
    }

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const currentDungeon = this.gameState.dungeon[this.gameState.currentFloor - 1];
    if (!currentDungeon) {
      return;
    }

    this.dungeonView.setDungeon(currentDungeon);

    const animationController = this.movementHandler.getTurnAnimationController();
    const offset = animationController.getCurrentPositionOffset();

    let visualX = this.gameState.party.x + offset.dx;
    let visualY = this.gameState.party.y + offset.dy;

    visualX = Math.max(0, Math.min(currentDungeon.width - 0.01, visualX));
    visualY = Math.max(0, Math.min(currentDungeon.height - 0.01, visualY));

    this.dungeonView.setPlayerPosition(visualX, visualY, this.gameState.party.facing);
    this.dungeonView.render(ctx);

    // Render header
    this.renderDungeonHeader(ctx);

    this.statusPanel.render(this.gameState.party, ctx);

    // Render info panel
    this.renderDungeonInfo(ctx);

    if (this.dungeonMapView && currentDungeon) {
      this.dungeonMapView.setDungeon(currentDungeon);
      this.dungeonMapView.setPlayerPosition(
        this.gameState.party.x,
        this.gameState.party.y,
        this.gameState.party.facing
      );
      if (this.dungeonMapView.getIsVisible()) {
        this.dungeonMapView.render(ctx);
      }
    }

    this.itemPickupUI.render(ctx);

    // Render the shared message log only when map is not visible
    if (this.messageLog && !this.dungeonMapView?.getIsVisible()) {
      this.messageLog.render(ctx);
    }

    this.renderControls(ctx);

    this.updateDebugData();
    if (this.debugOverlay && this.debugOverlay.isOpen()) {
      this.debugOverlay.render(this.gameState);
    }

    if (this.performanceOverlay) {
      this.performanceOverlay.render(ctx);
    }
  }

  private renderBackground(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  private renderDungeonHeader(ctx: CanvasRenderingContext2D): void {
    // Header panel
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(10, 10, ctx.canvas.width - 20, 60);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, ctx.canvas.width - 20, 60);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`DUNGEON - FLOOR ${this.gameState.currentFloor}`, ctx.canvas.width / 2, 45);

    // Gold display
    const pooledGold = this.gameState.party.pooledGold || 0;
    const partyGold = this.gameState.party.characters?.reduce((sum: number, char: any) => sum + char.gold, 0) || 0;

    ctx.fillStyle = '#ffa500';
    ctx.font = '14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Pooled: ${pooledGold}g | Party: ${partyGold}g`, ctx.canvas.width - 30, 45);
  }

  private renderDungeonInfo(ctx: CanvasRenderingContext2D): void {
    // Info panel on the right
    const infoX = 770;
    const infoY = 80;
    const infoWidth = 240;
    const infoHeight = 480;

    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(infoX, infoY, infoWidth, infoHeight);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(infoX, infoY, infoWidth, infoHeight);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DUNGEON INFO', infoX + infoWidth / 2, infoY + 20);
    ctx.textAlign = 'left';

    const currentDungeon = this.gameState.dungeon[this.gameState.currentFloor - 1];
    if (!currentDungeon) return;

    const currentTile = currentDungeon.tiles[this.gameState.party.y]?.[this.gameState.party.x];

    ctx.font = '12px monospace';
    ctx.fillStyle = '#aaa';

    // Position info
    ctx.fillText(`Position: ${this.gameState.party.x}, ${this.gameState.party.y}`, infoX + 10, infoY + 50);
    ctx.fillText(`Facing: ${this.gameState.party.facing}`, infoX + 10, infoY + 70);
    ctx.fillText(`Floor: ${this.gameState.currentFloor}`, infoX + 10, infoY + 90);

    // Current tile
    if (currentTile) {
      const specialType = currentTile.special?.type;
      const tileColor = specialType === 'stairs_up' ? '#ffa500' :
                       specialType === 'stairs_down' ? '#ffa500' :
                       specialType === 'chest' ? '#ffff00' : '#aaa';
      ctx.fillStyle = tileColor;
      const displayType = specialType || currentTile.type;
      ctx.fillText(`On: ${displayType.replace('_', ' ')}`, infoX + 10, infoY + 110);
    }

    // Statistics
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('STATISTICS', infoX + 10, infoY + 150);

    ctx.font = '11px monospace';
    ctx.fillStyle = '#aaa';
    const alive = this.gameState.party.characters.filter((c: any) => !c.isDead).length;
    const total = this.gameState.party.characters.length;
    ctx.fillText(`Party: ${alive}/${total} alive`, infoX + 10, infoY + 170);

    ctx.fillText(`Turn Count: ${this.gameState.turnCount || 0}`, infoX + 10, infoY + 190);
    ctx.fillText(`Combat: ${this.gameState.combatEnabled ? 'Enabled' : 'Disabled'}`, infoX + 10, infoY + 210);

    if (this.gameState.dungeonSeed) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('SEED', infoX + 10, infoY + 240);

      ctx.font = '10px monospace';
      ctx.fillStyle = '#aaa';
      const seed = this.gameState.dungeonSeed;
      const maxWidth = infoWidth - 20;
      const charWidth = 6;
      const charsPerLine = Math.floor(maxWidth / charWidth);

      if (seed.length <= charsPerLine) {
        ctx.fillText(seed, infoX + 10, infoY + 260);
      } else {
        const line1 = seed.substring(0, charsPerLine);
        const line2 = seed.substring(charsPerLine);
        ctx.fillText(line1, infoX + 10, infoY + 260);
        ctx.fillText(line2, infoX + 10, infoY + 275);
      }
    }
  }

  private initializeUI(canvas: HTMLCanvasElement): void {
    DebugLogger.info('DungeonScene', 'Initializing raycasting dungeon renderer');
    this.dungeonView = new DungeonViewRaycast(canvas, this);
    this.statusPanel = new StatusPanel(
      canvas,
      UI_CONSTANTS.LAYOUT.STATUS_PANEL_X,
      UI_CONSTANTS.LAYOUT.STATUS_PANEL_Y,
      UI_CONSTANTS.LAYOUT.STATUS_PANEL_WIDTH,
      UI_CONSTANTS.LAYOUT.STATUS_PANEL_HEIGHT
    );
    this.dungeonMapView = new DungeonMapView(canvas);
    this.debugOverlay = new DebugOverlay(canvas);
    this.performanceOverlay = new PerformanceOverlay(canvas);

    const currentDungeon = this.gameState.dungeon[this.gameState.currentFloor - 1];
    if (currentDungeon) {
      this.dungeonView.setDungeon(currentDungeon);
      this.dungeonView.setPlayerPosition(
        this.gameState.party.x,
        this.gameState.party.y,
        this.gameState.party.facing
      );

      this.dungeonMapView.setDungeon(currentDungeon);
      this.dungeonMapView.setPlayerPosition(
        this.gameState.party.x,
        this.gameState.party.y,
        this.gameState.party.facing
      );
    }

    this.debugOverlay = new DebugOverlay(canvas);
  }

  public handleInput(key: string): boolean {
    if (key === 'shift+p') {
      if (this.performanceOverlay) {
        this.performanceOverlay.toggle();
      }
      return true;
    }

    if (key === 'shift+r') {
      this.performanceMonitor.reset();
      DebugLogger.info('DungeonScene', 'Performance metrics reset');
      return true;
    }

    this.dungeonInputHandler.setContext({
      isAwaitingCastleStairsResponse: this.isAwaitingCastleStairsResponse,
      dungeonMapView: this.dungeonMapView
    });

    const handled = this.dungeonInputHandler.handleInput(key);

    this.isAwaitingCastleStairsResponse = this.dungeonInputHandler.getIsAwaitingResponse();

    return handled;
  }

  private renderControls(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';

    const controls = 'WASD/Arrows: Move | ENTER: Interact | TAB: Inventory | M: Map | Shift+P: Perf | Shift+R: Reset';
    ctx.fillText(controls, ctx.canvas.width / 2, ctx.canvas.height - 20);
  }

  private updateDebugData(): void {
    const currentDungeon = this.gameState.dungeon[this.gameState.currentFloor - 1];
    if (!currentDungeon) return;
  }

  public getDungeonView(): DungeonViewRaycast | null {
    return this.dungeonView || null;
  }

  public getStatusPanel(): StatusPanel | null {
    return this.statusPanel || null;
  }

  public setDoorPassageState(state: { x: number; y: number; direction: 'north' | 'south' | 'east' | 'west' } | null): void {
    this.doorPassageState = state;
  }

  public getDoorPassageState(): { x: number; y: number; direction: 'north' | 'south' | 'east' | 'west' } | null {
    return this.doorPassageState;
  }
}