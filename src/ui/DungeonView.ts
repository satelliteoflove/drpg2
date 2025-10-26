import { Direction, DungeonLevel, DungeonTile } from '../types/GameTypes';
import { SegmentImageGenerator } from './SegmentImageGenerator';
import { SegmentBasedDungeonRenderer } from './SegmentBasedDungeonRenderer';
import { GAME_CONFIG } from '../config/GameConstants';

export class DungeonView {
  private ctx: CanvasRenderingContext2D;
  private currentRenderCtx: CanvasRenderingContext2D;
  private dungeon: DungeonLevel | null = null;
  private playerX: number = 0;
  private playerY: number = 0;
  private playerFacing: Direction = 'north';
  private dungeonRenderer: SegmentBasedDungeonRenderer;

  private readonly VIEW_WIDTH = 500;
  private readonly VIEW_HEIGHT = 400;
  private readonly VIEW_X = 260;  // Center in available space
  private readonly VIEW_Y = 80;   // Below header

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.currentRenderCtx = this.ctx;

    const segmentGenerator = new SegmentImageGenerator(460, 310, 4);
    const segments = segmentGenerator.generateAllSegments();
    this.dungeonRenderer = new SegmentBasedDungeonRenderer(segments);
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

    this.renderCorridor();
    this.renderUI();

    this.currentRenderCtx.restore();
  }

  private renderCorridor(): void {
    const segments: Array<{
      depth: number;
      hasLeftWall: boolean;
      hasRightWall: boolean;
      hasFrontWall: boolean;
      hasLeftCorridorFarWall: boolean;
      hasRightCorridorFarWall: boolean;
      tile?: any;
    }> = [];

    const viewDistance = GAME_CONFIG.DUNGEON.VIEW_DISTANCE;

    let lastSegmentHadFrontWall = false;

    for (let depth = 0; depth <= viewDistance; depth++) {
      const positions = this.getPositionsAtDepth(depth);
      const frontPos = positions.find(p => p.side === 'front');

      if (!frontPos) continue;

      const frontTile = this.getTileAt(frontPos.x, frontPos.y);
      const hasLeftWall = this.canSeeWall(frontPos.x, frontPos.y, 'left');
      const hasRightWall = this.canSeeWall(frontPos.x, frontPos.y, 'right');
      const hasFrontWall = this.canSeeWall(frontPos.x, frontPos.y, 'front');

      let hasLeftCorridorFarWall = false;
      let hasRightCorridorFarWall = false;

      if (!hasLeftWall) {
        const leftPos = positions.find(p => p.side === 'left');
        if (leftPos) {
          hasLeftCorridorFarWall = this.canSeeWall(leftPos.x, leftPos.y, 'front');
        }
      }

      if (!hasRightWall) {
        const rightPos = positions.find(p => p.side === 'right');
        if (rightPos) {
          hasRightCorridorFarWall = this.canSeeWall(rightPos.x, rightPos.y, 'front');
        }
      }

      segments.push({
        depth,
        hasLeftWall,
        hasRightWall,
        hasFrontWall,
        hasLeftCorridorFarWall,
        hasRightCorridorFarWall,
        tile: frontTile
      });

      if (hasFrontWall) {
        lastSegmentHadFrontWall = true;
        break;
      }
    }

    if (!lastSegmentHadFrontWall) {
      segments.push({
        depth: viewDistance,
        hasLeftWall: false,
        hasRightWall: false,
        hasFrontWall: true,
        hasLeftCorridorFarWall: false,
        hasRightCorridorFarWall: false,
        tile: null
      });
    }

    this.dungeonRenderer.drawCorridor(this.currentRenderCtx, segments, viewDistance);

    for (const segment of segments) {
      if (segment.tile && segment.tile.type !== 'floor' && segment.tile.type !== 'wall' && !segment.hasFrontWall) {
        this.drawSpecialTile(segment.tile, segment.depth);
      }
    }
  }

  private getPositionsAtDepth(
    depth: number
  ): Array<{ x: number; y: number; screenX: number; screenY: number; side: string }> {
    const positions: Array<{
      x: number;
      y: number;
      screenX: number;
      screenY: number;
      side: string;
    }> = [];
    const [dx, dy] = this.getDirectionVector();

    for (let i = -1; i <= 1; i++) {
      const x = this.playerX + dx * depth + dy * i;
      const y = this.playerY + dy * depth - dx * i;

      const screenX = i * (100 / depth);
      const screenY = -20 / depth;

      positions.push({
        x,
        y,
        screenX,
        screenY,
        side: i === 0 ? 'front' : i < 0 ? 'left' : 'right',
      });
    }

    return positions;
  }

  private getDirectionVector(): [number, number] {
    switch (this.playerFacing) {
      case 'north':
        return [0, -1];
      case 'south':
        return [0, 1];
      case 'east':
        return [1, 0];
      case 'west':
        return [-1, 0];
      default:
        return [0, 0];
    }
  }

  private getTileAt(x: number, y: number): DungeonTile | null {
    if (!this.dungeon || x < 0 || x >= this.dungeon.width || y < 0 || y >= this.dungeon.height) {
      return null;
    }
    return this.dungeon.tiles[y][x];
  }

  private canSeeWall(x: number, y: number, side: string): boolean {
    const tile = this.getTileAt(x, y);
    if (!tile) return true;

    if (tile.type === 'wall') return true;

    switch (side) {
      case 'front':
        switch (this.playerFacing) {
          case 'north':
            return tile.northWall;
          case 'south':
            return tile.southWall;
          case 'east':
            return tile.eastWall;
          case 'west':
            return tile.westWall;
        }
        break;
      case 'left':
        switch (this.playerFacing) {
          case 'north':
            return tile.westWall;
          case 'south':
            return tile.eastWall;
          case 'east':
            return tile.northWall;
          case 'west':
            return tile.southWall;
        }
        break;
      case 'right':
        switch (this.playerFacing) {
          case 'north':
            return tile.eastWall;
          case 'south':
            return tile.westWall;
          case 'east':
            return tile.southWall;
          case 'west':
            return tile.northWall;
        }
        break;
    }

    return false;
  }

  private drawSpecialTile(tile: DungeonTile, depth: number): void {
    if (!tile) return;

    const centerX = this.VIEW_WIDTH / 2;
    const centerY = this.VIEW_HEIGHT / 2;
    const size = 100 / (depth + 1);

    switch (tile.type) {
      case 'door':
        this.dungeonRenderer.drawDoor(this.currentRenderCtx, depth);
        break;

      case 'chest':
        this.dungeonRenderer.drawChest(this.currentRenderCtx, depth);
        break;

      case 'stairs_up':
        this.currentRenderCtx.strokeStyle = '#00FF00';
        this.currentRenderCtx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          this.currentRenderCtx.beginPath();
          this.currentRenderCtx.moveTo(centerX - size / 3 + (i * size) / 6, centerY + size / 6);
          this.currentRenderCtx.lineTo(centerX + size / 3, centerY + size / 6 - (i * size) / 6);
          this.currentRenderCtx.stroke();
        }
        break;

      case 'stairs_down':
        this.currentRenderCtx.strokeStyle = '#888888';
        this.currentRenderCtx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          this.currentRenderCtx.beginPath();
          this.currentRenderCtx.moveTo(centerX - size / 3, centerY - size / 6 + (i * size) / 6);
          this.currentRenderCtx.lineTo(centerX + size / 3 - (i * size) / 6, centerY + size / 6);
          this.currentRenderCtx.stroke();
        }
        break;

      case 'trap':
        this.currentRenderCtx.fillStyle = '#FF0000';
        this.currentRenderCtx.beginPath();
        this.currentRenderCtx.arc(centerX, centerY, size / 6, 0, Math.PI * 2);
        this.currentRenderCtx.fill();
        break;

      case 'event':
        this.currentRenderCtx.fillStyle = '#800080';
        this.currentRenderCtx.beginPath();
        this.currentRenderCtx.arc(centerX, centerY, size / 4, 0, Math.PI * 2);
        this.currentRenderCtx.fill();
        this.currentRenderCtx.strokeStyle = '#FF00FF';
        this.currentRenderCtx.lineWidth = 2;
        this.currentRenderCtx.stroke();
        break;
    }
  }

  private renderUI(): void {
    this.currentRenderCtx.fillStyle = '#333';
    this.currentRenderCtx.fillRect(0, this.VIEW_HEIGHT - 60, this.VIEW_WIDTH, 60);

    this.currentRenderCtx.strokeStyle = '#666';
    this.currentRenderCtx.lineWidth = 2;
    this.currentRenderCtx.strokeRect(0, this.VIEW_HEIGHT - 60, this.VIEW_WIDTH, 60);

    this.currentRenderCtx.fillStyle = '#fff';
    this.currentRenderCtx.font = '14px monospace';
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
}
