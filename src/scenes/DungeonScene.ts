import { Scene, SceneManager, SceneRenderContext } from '../core/Scene';
import { GameState } from '../types/GameTypes';
import { DungeonView } from '../ui/DungeonView';
import { StatusPanel } from '../ui/StatusPanel';
import { DungeonMapView } from '../ui/DungeonMapView';
import { DebugOverlay } from '../ui/DebugOverlay';
import { DebugLogger } from '../utils/DebugLogger';
import { DungeonMovementHandler } from '../systems/dungeon/DungeonMovementHandler';
import { DungeonItemPickupUI } from '../systems/dungeon/DungeonItemPickupUI';
import { DungeonInputHandler } from '../systems/dungeon/DungeonInputHandler';

export class DungeonScene extends Scene {
  protected gameState: GameState;
  protected sceneManager: SceneManager;
  private dungeonView!: DungeonView;
  private statusPanel!: StatusPanel;
  private messageLog: any;
  private dungeonMapView!: DungeonMapView;
  private debugOverlay!: DebugOverlay;

  private movementHandler!: DungeonMovementHandler;
  private itemPickupUI!: DungeonItemPickupUI;
  private dungeonInputHandler!: DungeonInputHandler;

  private isAwaitingCastleStairsResponse: boolean = false;

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
  }

  public enter(): void {
    const currentDungeon = this.gameState.dungeon[this.gameState.currentFloor - 1];

    if (!this.gameState.hasEnteredDungeon && currentDungeon) {
      const entranceX = currentDungeon.startX;
      const entranceY = currentDungeon.startY;

      this.gameState.party.x = entranceX;
      this.gameState.party.y = entranceY;
      this.gameState.party.floor = this.gameState.currentFloor;
      this.gameState.party.facing = 'north';
      this.gameState.hasEnteredDungeon = true;
    }

    if (this.messageLog && this.messageLog.add) {
      this.messageLog.add(`Entering floor ${this.gameState.currentFloor} of the dungeon.`);
    }
  }

  public exit(): void {
    // Clean up when exiting
  }

  public update(_deltaTime: number): void {
    // Update logic
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.renderImperative(ctx);
  }

  public hasLayeredRendering(): boolean {
    return true;
  }

  public renderLayered(renderContext: SceneRenderContext): void {
    const { renderManager } = renderContext;

    renderManager.renderBackground((ctx) => {
      this.renderBackground(ctx);
    });

    renderManager.renderDungeon((ctx: CanvasRenderingContext2D) => {
      if (this.dungeonView) {
        this.dungeonView.render(ctx);
      }
    });

    renderManager.renderUI((ctx) => {
      if (this.statusPanel) {
        this.statusPanel.render(this.gameState.party, ctx);
      }

      if (this.dungeonMapView && this.dungeonMapView.getIsVisible()) {
        this.dungeonMapView.render(ctx);
      }

      this.itemPickupUI.render(ctx);

      this.renderControls(ctx);

      this.updateDebugData();
      if (this.debugOverlay && this.debugOverlay.isOpen()) {
        this.debugOverlay.render(this.gameState);
      }
    });
  }

  private renderImperative(ctx: CanvasRenderingContext2D): void {
    if (!this.dungeonView) {
      this.initializeUI(ctx.canvas);
    }

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const currentDungeon = this.gameState.dungeon[this.gameState.currentFloor - 1];
    if (!currentDungeon) {
      return;
    }

    this.dungeonView.setDungeon(currentDungeon);
    this.dungeonView.setPlayerPosition(
      this.gameState.party.x,
      this.gameState.party.y,
      this.gameState.party.facing
    );
    this.dungeonView.render(ctx);

    this.statusPanel.render(this.gameState.party, ctx);

    if (this.dungeonMapView.getIsVisible()) {
      this.dungeonMapView.render(ctx);
    }

    this.itemPickupUI.render(ctx);

    this.renderControls(ctx);

    this.updateDebugData();
    if (this.debugOverlay && this.debugOverlay.isOpen()) {
      this.debugOverlay.render(this.gameState);
    }
  }

  private renderBackground(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  private initializeUI(canvas: HTMLCanvasElement): void {
    this.dungeonView = new DungeonView(canvas);
    this.statusPanel = new StatusPanel(canvas, 0, 0, 200, canvas.height);
    this.dungeonMapView = new DungeonMapView(canvas);
    this.debugOverlay = new DebugOverlay(canvas);

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
    this.dungeonInputHandler.setContext({
      isAwaitingCastleStairsResponse: this.isAwaitingCastleStairsResponse,
      dungeonMapView: this.dungeonMapView
    });

    const handled = this.dungeonInputHandler.handleInput(key);

    const castleStairsPos = this.movementHandler.getCastleStairsPosition();
    if (castleStairsPos &&
        this.gameState.party.x === castleStairsPos.x &&
        this.gameState.party.y === castleStairsPos.y &&
        this.gameState.currentFloor === 0) {
      this.isAwaitingCastleStairsResponse = true;
    }

    return handled;
  }

  private renderControls(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#888';
    ctx.font = '10px monospace';
    const y = ctx.canvas.height - 45;

    const controls = 'TAB: Inventory | R: Rest | M: Map | C: Toggle Combat | Ctrl+D: Debug';

    ctx.fillText(controls, 10, y);
    ctx.fillText('WASD/Arrows: Move | SPACE/ENTER: Interact | ESC: Menu', 10, y + 12);
  }

  private updateDebugData(): void {
    const currentDungeon = this.gameState.dungeon[this.gameState.currentFloor - 1];
    if (!currentDungeon) return;
  }

  public getDungeonView(): DungeonView | null {
    return this.dungeonView || null;
  }

  public getStatusPanel(): StatusPanel | null {
    return this.statusPanel || null;
  }
}