import { Direction, DungeonLevel } from '../types/GameTypes';
import { DungeonAtlasLoader, ColorSchemeName } from './DungeonAtlasLoader';
import { DungeonCellAtlasRenderer } from './DungeonCellAtlasRenderer';
import { GAME_CONFIG } from '../config/GameConstants';
import { DebugLogger } from '../utils/DebugLogger';

export class DungeonViewAtlas {
  private ctx: CanvasRenderingContext2D;
  private currentRenderCtx: CanvasRenderingContext2D;
  private dungeon: DungeonLevel | null = null;
  private playerX: number = 0;
  private playerY: number = 0;
  private playerFacing: Direction = 'north';
  private atlasLoader: DungeonAtlasLoader;
  private renderer: DungeonCellAtlasRenderer;
  private loadPromise: Promise<void> | null = null;

  private readonly VIEW_WIDTH = 500;
  private readonly VIEW_HEIGHT = 400;
  private readonly VIEW_X = 260;
  private readonly VIEW_Y = 80;
  private readonly INNER_VIEW_WIDTH = 460;
  private readonly INNER_VIEW_HEIGHT = 310;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.currentRenderCtx = this.ctx;

    this.atlasLoader = new DungeonAtlasLoader();
    this.renderer = new DungeonCellAtlasRenderer(this.atlasLoader, this.INNER_VIEW_WIDTH, this.INNER_VIEW_HEIGHT);

    const colorScheme = GAME_CONFIG.DUNGEON_VISUAL.COLOR_SCHEME as ColorSchemeName;
    this.loadPromise = this.atlasLoader.load(colorScheme).catch((error) => {
      DebugLogger.error('DungeonViewAtlas', 'Failed to load atlas', error);
    });
  }

  public setDungeon(dungeon: DungeonLevel): void {
    this.dungeon = dungeon;
  }

  public setPlayerPosition(x: number, y: number, facing: Direction): void {
    this.playerX = x;
    this.playerY = y;
    this.playerFacing = facing;
  }

  public render(ctx?: CanvasRenderingContext2D): void {
    if (!this.dungeon) return;

    this.currentRenderCtx = ctx || this.ctx;

    this.currentRenderCtx.fillStyle = '#2a2a2a';
    this.currentRenderCtx.fillRect(this.VIEW_X - 5, this.VIEW_Y - 5, this.VIEW_WIDTH + 10, this.VIEW_HEIGHT + 10);

    this.currentRenderCtx.strokeStyle = '#666';
    this.currentRenderCtx.lineWidth = 2;
    this.currentRenderCtx.strokeRect(this.VIEW_X - 5, this.VIEW_Y - 5, this.VIEW_WIDTH + 10, this.VIEW_HEIGHT + 10);

    this.currentRenderCtx.save();
    this.currentRenderCtx.translate(this.VIEW_X, this.VIEW_Y);

    this.currentRenderCtx.fillStyle = '#000';
    this.currentRenderCtx.fillRect(0, 0, this.VIEW_WIDTH, this.VIEW_HEIGHT);

    const innerX = (this.VIEW_WIDTH - this.INNER_VIEW_WIDTH) / 2;
    const innerY = (this.VIEW_HEIGHT - this.INNER_VIEW_HEIGHT) / 2;
    this.currentRenderCtx.save();
    this.currentRenderCtx.translate(innerX, innerY);

    if (this.atlasLoader.isLoaded()) {
      this.renderer.renderDungeon(
        this.currentRenderCtx,
        this.dungeon,
        this.playerX,
        this.playerY,
        this.playerFacing,
        GAME_CONFIG.DUNGEON.VIEW_DISTANCE
      );
    } else {
      this.renderLoadingScreen();
    }

    this.currentRenderCtx.restore();

    this.renderUI();

    this.currentRenderCtx.restore();
  }

  private renderLoadingScreen(): void {
    this.currentRenderCtx.fillStyle = '#000000';
    this.currentRenderCtx.fillRect(0, 0, this.INNER_VIEW_WIDTH, this.INNER_VIEW_HEIGHT);

    this.currentRenderCtx.fillStyle = '#FFFFFF';
    this.currentRenderCtx.font = '16px monospace';
    this.currentRenderCtx.textAlign = 'center';
    this.currentRenderCtx.fillText('Loading dungeon...', this.INNER_VIEW_WIDTH / 2, this.INNER_VIEW_HEIGHT / 2);
  }

  private renderUI(): void {
    this.currentRenderCtx.fillStyle = '#333';
    this.currentRenderCtx.fillRect(0, this.VIEW_HEIGHT - 60, this.VIEW_WIDTH, 60);

    this.currentRenderCtx.strokeStyle = '#666';
    this.currentRenderCtx.lineWidth = 2;
    this.currentRenderCtx.strokeRect(0, this.VIEW_HEIGHT - 60, this.VIEW_WIDTH, 60);

    this.currentRenderCtx.fillStyle = '#fff';
    this.currentRenderCtx.font = '14px monospace';
    this.currentRenderCtx.textAlign = 'start';
    this.currentRenderCtx.fillText(
      `Position: ${this.playerX}, ${this.playerY}`,
      10,
      this.VIEW_HEIGHT - 40
    );
    this.currentRenderCtx.fillText(`Facing: ${this.playerFacing}`, 10, this.VIEW_HEIGHT - 20);

    if (this.dungeon) {
      this.currentRenderCtx.fillText(`Floor: ${this.dungeon.level}`, 200, this.VIEW_HEIGHT - 40);

      const currentTile = this.getTileAt(this.playerX, this.playerY);
      if (currentTile && currentTile.type !== 'floor') {
        this.currentRenderCtx.fillText(`On: ${currentTile.type}`, 200, this.VIEW_HEIGHT - 20);
      }
    }

    const compassSize = 40;
    const compassX = this.VIEW_WIDTH - compassSize - 10;
    const compassY = this.VIEW_HEIGHT - compassSize - 10;

    this.currentRenderCtx.strokeStyle = '#666';
    this.currentRenderCtx.lineWidth = 2;
    this.currentRenderCtx.beginPath();
    this.currentRenderCtx.arc(compassX, compassY, compassSize / 2, 0, Math.PI * 2);
    this.currentRenderCtx.stroke();

    this.currentRenderCtx.fillStyle = '#ff0000';
    this.currentRenderCtx.font = '12px monospace';
    this.currentRenderCtx.textAlign = 'center';
    this.currentRenderCtx.fillText('N', compassX, compassY - compassSize / 3);

    const arrowLength = compassSize / 3;
    const angle = this.getCompassAngle();
    const arrowX = compassX + Math.sin(angle) * arrowLength;
    const arrowY = compassY - Math.cos(angle) * arrowLength;

    this.currentRenderCtx.strokeStyle = '#ff0000';
    this.currentRenderCtx.lineWidth = 3;
    this.currentRenderCtx.beginPath();
    this.currentRenderCtx.moveTo(compassX, compassY);
    this.currentRenderCtx.lineTo(arrowX, arrowY);
    this.currentRenderCtx.stroke();

    this.currentRenderCtx.textAlign = 'start';
  }

  private getTileAt(x: number, y: number) {
    if (!this.dungeon || x < 0 || x >= this.dungeon.width || y < 0 || y >= this.dungeon.height) {
      return null;
    }
    return this.dungeon.tiles[y][x];
  }

  private getCompassAngle(): number {
    switch (this.playerFacing) {
      case 'north':
        return 0;
      case 'east':
        return Math.PI / 2;
      case 'south':
        return Math.PI;
      case 'west':
        return (3 * Math.PI) / 2;
      default:
        return 0;
    }
  }

  public async waitForLoad(): Promise<void> {
    if (this.loadPromise) {
      await this.loadPromise;
    }
  }

  public isAtlasLoaded(): boolean {
    return this.atlasLoader.isLoaded();
  }
}
