import { GameState } from '../../types/GameTypes';
import { DungeonViewRaycast } from '../../ui/DungeonViewRaycast';
import { StatusPanel } from '../../ui/StatusPanel';
import { DungeonMapView } from '../../ui/DungeonMapView';
import { DebugOverlay } from '../../ui/DebugOverlay';
import { PerformanceOverlay } from '../../ui/PerformanceOverlay';
import { DungeonItemPickupUI } from './DungeonItemPickupUI';
import { DungeonStateContext } from './DungeonStateManager';
import { UI_CONSTANTS } from '../../config/UIConstants';
import { DebugLogger } from '../../utils/DebugLogger';
import { KeyBindingHelper } from '../../config/KeyBindings';

export class DungeonUIRenderer {
  private gameState: GameState;
  private messageLog: any;
  private dungeonView!: DungeonViewRaycast;
  private statusPanel!: StatusPanel;
  private dungeonMapView!: DungeonMapView;
  private debugOverlay!: DebugOverlay;
  private performanceOverlay!: PerformanceOverlay;
  private itemPickupUI: DungeonItemPickupUI;
  private dungeonScene: any;

  constructor(
    gameState: GameState,
    messageLog: any,
    itemPickupUI: DungeonItemPickupUI,
    dungeonScene: any
  ) {
    this.gameState = gameState;
    this.messageLog = messageLog;
    this.itemPickupUI = itemPickupUI;
    this.dungeonScene = dungeonScene;
  }

  public ensureInitialized(canvas: HTMLCanvasElement): void {
    if (this.dungeonView) {
      return;
    }

    DebugLogger.info('DungeonUIRenderer', 'Initializing raycasting dungeon renderer');
    this.dungeonView = new DungeonViewRaycast(canvas, this.dungeonScene);
    this.statusPanel = new StatusPanel(
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
  }

  public renderBackground(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  public renderDungeonView(ctx: CanvasRenderingContext2D): void {
    if (this.dungeonView) {
      this.dungeonView.render(ctx);
    }
  }

  public render(ctx: CanvasRenderingContext2D, stateContext: DungeonStateContext): void {
    this.ensureInitialized(ctx.canvas);

    const currentDungeon = this.gameState.dungeon[this.gameState.currentFloor - 1];
    if (!currentDungeon) {
      return;
    }

    this.renderUIComponents(ctx, currentDungeon, stateContext);
  }

  private renderUIComponents(ctx: CanvasRenderingContext2D, currentDungeon: any, stateContext: DungeonStateContext): void {
    this.renderDungeonHeader(ctx, stateContext);

    if (this.statusPanel) {
      this.statusPanel.render(this.gameState.party, ctx);
    }

    this.renderDungeonInfo(ctx, stateContext);

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

    if (this.messageLog && !this.dungeonMapView?.getIsVisible()) {
      this.messageLog.render(ctx);
    }

    this.renderControls(ctx);

    if (this.debugOverlay && this.debugOverlay.isOpen()) {
      this.debugOverlay.render(this.gameState);
    }

    if (this.performanceOverlay) {
      this.performanceOverlay.render(ctx);
    }
  }

  private renderDungeonHeader(ctx: CanvasRenderingContext2D, stateContext: DungeonStateContext): void {
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(10, 10, ctx.canvas.width - 20, 60);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, ctx.canvas.width - 20, 60);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`DUNGEON - FLOOR ${stateContext.currentFloor}`, ctx.canvas.width / 2, 45);

    ctx.fillStyle = '#ffa500';
    ctx.font = '14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Pooled: ${stateContext.pooledGold}g | Party: ${stateContext.partyGold}g`, ctx.canvas.width - 30, 45);
  }

  private renderDungeonInfo(ctx: CanvasRenderingContext2D, stateContext: DungeonStateContext): void {
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

    ctx.fillText(`Position: ${stateContext.playerPosition.x}, ${stateContext.playerPosition.y}`, infoX + 10, infoY + 50);
    ctx.fillText(`Facing: ${stateContext.playerPosition.facing}`, infoX + 10, infoY + 70);
    ctx.fillText(`Floor: ${stateContext.currentFloor}`, infoX + 10, infoY + 90);

    if (currentTile) {
      const specialType = currentTile.special?.type;
      const tileColor = specialType === 'stairs_up' ? '#ffa500' :
                       specialType === 'stairs_down' ? '#ffa500' :
                       specialType === 'chest' ? '#ffff00' : '#aaa';
      ctx.fillStyle = tileColor;
      const displayType = specialType || currentTile.type;
      ctx.fillText(`On: ${displayType.replace('_', ' ')}`, infoX + 10, infoY + 110);
    }

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('STATISTICS', infoX + 10, infoY + 150);

    ctx.font = '11px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText(`Party: ${stateContext.partyAlive}/${stateContext.partyTotal} alive`, infoX + 10, infoY + 170);

    ctx.fillText(`Turn Count: ${stateContext.turnCount}`, infoX + 10, infoY + 190);
    ctx.fillText(`Combat: ${stateContext.combatEnabled ? 'Enabled' : 'Disabled'}`, infoX + 10, infoY + 210);

    if (stateContext.dungeonSeed) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('SEED', infoX + 10, infoY + 240);

      ctx.font = '10px monospace';
      ctx.fillStyle = '#aaa';
      const seed = stateContext.dungeonSeed;
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

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('ZONE', infoX + 10, infoY + 300);

    ctx.font = '11px monospace';
    const zoneType = stateContext.currentZone;
    if (zoneType) {
      const zoneColors: Record<string, string> = {
        safe: '#4a4',
        boss: '#f44',
        special_mobs: '#f94',
        high_frequency: '#fa4',
        low_frequency: '#8af',
        treasure: '#ff4',
        ambush: '#f4f',
      };
      ctx.fillStyle = zoneColors[zoneType] || '#aaa';
      ctx.fillText(zoneType.replace('_', ' ').toUpperCase(), infoX + 10, infoY + 320);
    } else {
      ctx.fillStyle = '#666';
      ctx.fillText('Normal', infoX + 10, infoY + 320);
    }
  }

  private renderControls(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';

    const controls = KeyBindingHelper.getDungeonControlsDisplay();
    ctx.fillText(controls, ctx.canvas.width / 2, ctx.canvas.height - 20);
  }

  public getDungeonView(): DungeonViewRaycast | null {
    return this.dungeonView || null;
  }

  public getStatusPanel(): StatusPanel | null {
    return this.statusPanel || null;
  }

  public getDungeonMapView(): DungeonMapView | null {
    return this.dungeonMapView || null;
  }

  public getDebugOverlay(): DebugOverlay | null {
    return this.debugOverlay || null;
  }

  public getPerformanceOverlay(): PerformanceOverlay | null {
    return this.performanceOverlay || null;
  }
}
