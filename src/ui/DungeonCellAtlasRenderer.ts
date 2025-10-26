import { DungeonLevel, DungeonTile, Direction } from '../types/GameTypes';
import { DungeonAtlasLoader } from './DungeonAtlasLoader';
import { DebugLogger } from '../utils/DebugLogger';

interface CellSegment {
  depth: number;
  hasLeftWall: boolean;
  hasRightWall: boolean;
  hasFrontWall: boolean;
  tile?: DungeonTile | null;
}

export class DungeonCellAtlasRenderer {
  private atlasLoader: DungeonAtlasLoader;
  private viewWidth: number;
  private viewHeight: number;

  constructor(atlasLoader: DungeonAtlasLoader, viewWidth: number = 460, viewHeight: number = 310) {
    this.atlasLoader = atlasLoader;
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
  }

  public renderDungeon(
    ctx: CanvasRenderingContext2D,
    dungeon: DungeonLevel,
    playerX: number,
    playerY: number,
    playerFacing: Direction,
    viewDistance: number
  ): void {
    if (!this.atlasLoader.isLoaded()) {
      DebugLogger.warn('DungeonCellAtlasRenderer', 'Atlas not loaded yet');
      this.renderLoadingScreen(ctx);
      return;
    }

    const segments = this.buildSegments(dungeon, playerX, playerY, playerFacing, viewDistance);

    segments.sort((a, b) => b.depth - a.depth);

    for (const segment of segments) {
      const cellImage = this.atlasLoader.getCell(
        segment.depth,
        segment.hasLeftWall,
        segment.hasRightWall,
        segment.hasFrontWall
      );

      if (cellImage) {
        ctx.drawImage(cellImage, 0, 0, this.viewWidth, this.viewHeight);
      } else {
        DebugLogger.warn(
          'DungeonCellAtlasRenderer',
          `Missing cell: d${segment.depth} L${+segment.hasLeftWall}R${+segment.hasRightWall}F${+segment.hasFrontWall}`
        );
      }

      if (segment.tile && segment.tile.type !== 'floor' && segment.tile.type !== 'wall' && !segment.hasFrontWall) {
        this.renderSpecialTile(ctx, segment.tile, segment.depth);
      }
    }
  }

  private buildSegments(
    dungeon: DungeonLevel,
    playerX: number,
    playerY: number,
    playerFacing: Direction,
    viewDistance: number
  ): CellSegment[] {
    const segments: CellSegment[] = [];
    let lastSegmentHadFrontWall = false;

    for (let depth = 0; depth <= viewDistance; depth++) {
      const frontPos = this.getPositionAtDepth(playerX, playerY, playerFacing, depth);

      if (!frontPos) continue;

      const frontTile = this.getTileAt(dungeon, frontPos.x, frontPos.y);
      const hasLeftWall = this.canSeeWall(dungeon, frontPos.x, frontPos.y, playerFacing, 'left');
      const hasRightWall = this.canSeeWall(dungeon, frontPos.x, frontPos.y, playerFacing, 'right');
      const hasFrontWall = this.canSeeWall(dungeon, frontPos.x, frontPos.y, playerFacing, 'front');

      DebugLogger.debug(
        'DungeonCellAtlasRenderer',
        `Depth ${depth} at (${frontPos.x},${frontPos.y}): L=${hasLeftWall} R=${hasRightWall} F=${hasFrontWall}`
      );

      segments.push({
        depth,
        hasLeftWall,
        hasRightWall,
        hasFrontWall,
        tile: frontTile,
      });

      if (hasFrontWall) {
        lastSegmentHadFrontWall = true;
        break;
      }
    }

    if (!lastSegmentHadFrontWall && segments.length > 0) {
      const lastSegment = segments[segments.length - 1];
      lastSegment.hasFrontWall = true;
      DebugLogger.debug('DungeonCellAtlasRenderer', `Closing off view at depth ${lastSegment.depth}`);
    }

    DebugLogger.debug('DungeonCellAtlasRenderer', `Built ${segments.length} segments`);

    return segments;
  }

  private getPositionAtDepth(
    playerX: number,
    playerY: number,
    facing: Direction,
    depth: number
  ): { x: number; y: number } | null {
    const [dx, dy] = this.getDirectionVector(facing);
    return {
      x: playerX + dx * depth,
      y: playerY + dy * depth,
    };
  }

  private getDirectionVector(facing: Direction): [number, number] {
    switch (facing) {
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

  private getTileAt(dungeon: DungeonLevel, x: number, y: number): DungeonTile | null {
    if (x < 0 || x >= dungeon.width || y < 0 || y >= dungeon.height) {
      return null;
    }
    return dungeon.tiles[y][x];
  }

  private canSeeWall(
    dungeon: DungeonLevel,
    x: number,
    y: number,
    playerFacing: Direction,
    side: string
  ): boolean {
    const tile = this.getTileAt(dungeon, x, y);
    if (!tile) return true;

    if (tile.type === 'wall') return true;

    switch (side) {
      case 'front':
        switch (playerFacing) {
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
        switch (playerFacing) {
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
        switch (playerFacing) {
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

  private renderSpecialTile(ctx: CanvasRenderingContext2D, tile: DungeonTile, depth: number): void {
    if (!tile) return;

    const centerX = this.viewWidth / 2;
    const centerY = this.viewHeight / 2;
    const size = 100 / (depth + 1);

    switch (tile.type) {
      case 'door':
        ctx.strokeStyle = '#8B4513';
        ctx.fillStyle = '#654321';
        ctx.fillRect(centerX - size / 4, centerY - size / 2, size / 2, size);
        ctx.strokeRect(centerX - size / 4, centerY - size / 2, size / 2, size);
        break;

      case 'chest':
        ctx.strokeStyle = '#8B4513';
        ctx.fillStyle = '#DAA520';
        ctx.fillRect(centerX - size / 3, centerY, size / 1.5, size / 3);
        ctx.strokeRect(centerX - size / 3, centerY, size / 1.5, size / 3);
        break;

      case 'stairs_up':
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(centerX - size / 3 + (i * size) / 6, centerY + size / 6);
          ctx.lineTo(centerX + size / 3, centerY + size / 6 - (i * size) / 6);
          ctx.stroke();
        }
        break;

      case 'stairs_down':
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(centerX - size / 3, centerY - size / 6 + (i * size) / 6);
          ctx.lineTo(centerX + size / 3 - (i * size) / 6, centerY + size / 6);
          ctx.stroke();
        }
        break;

      case 'trap':
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(centerX, centerY, size / 6, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'event':
        ctx.fillStyle = '#800080';
        ctx.beginPath();
        ctx.arc(centerX, centerY, size / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FF00FF';
        ctx.lineWidth = 2;
        ctx.stroke();
        break;
    }
  }

  private renderLoadingScreen(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Loading dungeon atlas...', this.viewWidth / 2, this.viewHeight / 2);
  }
}
