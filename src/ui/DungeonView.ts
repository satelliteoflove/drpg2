import { Direction, DungeonLevel, DungeonTile } from '../types/GameTypes';

export class DungeonView {
  private ctx: CanvasRenderingContext2D;
  private currentRenderCtx: CanvasRenderingContext2D;
  private dungeon: DungeonLevel | null = null;
  private playerX: number = 0;
  private playerY: number = 0;
  private playerFacing: Direction = 'north';

  private readonly VIEW_WIDTH = 500;
  private readonly VIEW_HEIGHT = 400;
  private readonly VIEW_X = 260;  // Center in available space
  private readonly VIEW_Y = 80;   // Below header

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.currentRenderCtx = this.ctx;
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

    // Set the current rendering context
    this.currentRenderCtx = ctx || this.ctx;

    // Draw panel frame around the dungeon view
    this.currentRenderCtx.fillStyle = '#2a2a2a';
    this.currentRenderCtx.fillRect(this.VIEW_X - 5, this.VIEW_Y - 5, this.VIEW_WIDTH + 10, this.VIEW_HEIGHT + 10);

    this.currentRenderCtx.strokeStyle = '#666';
    this.currentRenderCtx.lineWidth = 2;
    this.currentRenderCtx.strokeRect(this.VIEW_X - 5, this.VIEW_Y - 5, this.VIEW_WIDTH + 10, this.VIEW_HEIGHT + 10);

    // Save context state and translate to view position
    this.currentRenderCtx.save();
    this.currentRenderCtx.translate(this.VIEW_X, this.VIEW_Y);

    this.currentRenderCtx.fillStyle = '#000';
    this.currentRenderCtx.fillRect(0, 0, this.VIEW_WIDTH, this.VIEW_HEIGHT);

    this.renderDepth3();
    this.renderDepth2();
    this.renderDepth1();
    this.renderCurrentPosition();
    this.renderUI();

    // Restore context state
    this.currentRenderCtx.restore();
  }

  private renderDepth3(): void {
    const positions = this.getPositionsAtDepth(3);

    positions.forEach((pos) => {
      const tile = this.getTileAt(pos.x, pos.y);
      if (!tile) return;

      const screenX = this.VIEW_WIDTH / 2 + pos.screenX;
      const screenY = this.VIEW_HEIGHT / 2 + pos.screenY;

      if (this.canSeeWall(pos.x, pos.y, pos.side)) {
        this.drawWall(screenX, screenY, 20, 15, '#333');
      } else if (tile.type === 'floor') {
        this.drawFloor(screenX, screenY, 8, 6, '#444');
      }
    });
  }

  private renderDepth2(): void {
    const positions = this.getPositionsAtDepth(2);

    positions.forEach((pos) => {
      const tile = this.getTileAt(pos.x, pos.y);
      if (!tile) return;

      const screenX = this.VIEW_WIDTH / 2 + pos.screenX;
      const screenY = this.VIEW_HEIGHT / 2 + pos.screenY;

      if (this.canSeeWall(pos.x, pos.y, pos.side)) {
        this.drawWall(screenX, screenY, 40, 30, '#555');
      } else if (tile.type === 'floor') {
        this.drawFloor(screenX, screenY, 16, 12, '#666');
        this.drawSpecialTile(tile, screenX, screenY, 12);
      }
    });
  }

  private renderDepth1(): void {
    const positions = this.getPositionsAtDepth(1);

    positions.forEach((pos) => {
      const tile = this.getTileAt(pos.x, pos.y);
      if (!tile) return;

      const screenX = this.VIEW_WIDTH / 2 + pos.screenX;
      const screenY = this.VIEW_HEIGHT / 2 + pos.screenY;

      if (this.canSeeWall(pos.x, pos.y, pos.side)) {
        this.drawWall(screenX, screenY, 80, 60, '#777');
      } else if (tile.type === 'floor') {
        this.drawFloor(screenX, screenY, 32, 24, '#888');
        this.drawSpecialTile(tile, screenX, screenY, 24);
      }
    });
  }

  private renderCurrentPosition(): void {
    const centerX = this.VIEW_WIDTH / 2;
    const centerY = this.VIEW_HEIGHT / 2;

    const currentTile = this.getTileAt(this.playerX, this.playerY);
    if (currentTile) {
      this.drawFloor(centerX, centerY, 60, 40, '#aaa');
      this.drawSpecialTile(currentTile, centerX, centerY, 40);
    }

    const frontTile = this.getTileInFront();
    if (frontTile && this.canSeeWall(frontTile.x, frontTile.y, 'front')) {
      this.drawWall(centerX, centerY - 50, 160, 120, '#999');
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

  private getTileInFront(): DungeonTile | null {
    const [dx, dy] = this.getDirectionVector();
    return this.getTileAt(this.playerX + dx, this.playerY + dy);
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

  private drawWall(x: number, y: number, width: number, height: number, color: string): void {
    this.currentRenderCtx.fillStyle = color;
    this.currentRenderCtx.fillRect(x - width / 2, y - height / 2, width, height);

    this.currentRenderCtx.strokeStyle = '#222';
    this.currentRenderCtx.lineWidth = 1;
    this.currentRenderCtx.strokeRect(x - width / 2, y - height / 2, width, height);

    this.currentRenderCtx.fillStyle = '#000';
    this.currentRenderCtx.fillRect(x - width / 4, y - height / 4, width / 8, height / 8);
  }

  private drawFloor(x: number, y: number, width: number, height: number, color: string): void {
    this.currentRenderCtx.fillStyle = color;
    this.currentRenderCtx.fillRect(x - width / 2, y + height / 4, width, height / 2);

    this.currentRenderCtx.strokeStyle = '#444';
    this.currentRenderCtx.lineWidth = 1;
    this.currentRenderCtx.strokeRect(x - width / 2, y + height / 4, width, height / 2);
  }

  private drawSpecialTile(tile: DungeonTile, x: number, y: number, size: number): void {
    if (!tile) return;

    switch (tile.type) {
      case 'door':
        this.currentRenderCtx.fillStyle = '#8B4513';
        this.currentRenderCtx.fillRect(x - size / 4, y - size / 2, size / 2, size);
        this.currentRenderCtx.fillStyle = '#FFD700';
        this.currentRenderCtx.fillRect(x - size / 8, y - size / 8, size / 16, size / 16);
        break;

      case 'chest':
        this.currentRenderCtx.fillStyle = '#8B4513';
        this.currentRenderCtx.fillRect(x - size / 3, y - size / 6, (size * 2) / 3, size / 3);
        this.currentRenderCtx.fillStyle = '#FFD700';
        this.currentRenderCtx.fillRect(x - size / 6, y - size / 12, size / 8, size / 6);
        break;

      case 'stairs_up':
        this.currentRenderCtx.strokeStyle = '#999';
        this.currentRenderCtx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          this.currentRenderCtx.beginPath();
          this.currentRenderCtx.moveTo(x - size / 3 + (i * size) / 6, y + size / 6);
          this.currentRenderCtx.lineTo(x + size / 3, y + size / 6 - (i * size) / 6);
          this.currentRenderCtx.stroke();
        }
        break;

      case 'stairs_down':
        this.currentRenderCtx.strokeStyle = '#666';
        this.currentRenderCtx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          this.currentRenderCtx.beginPath();
          this.currentRenderCtx.moveTo(x - size / 3, y - size / 6 + (i * size) / 6);
          this.currentRenderCtx.lineTo(x + size / 3 - (i * size) / 6, y + size / 6);
          this.currentRenderCtx.stroke();
        }
        break;

      case 'trap':
        this.currentRenderCtx.fillStyle = '#FF0000';
        this.currentRenderCtx.beginPath();
        this.currentRenderCtx.arc(x, y, size / 6, 0, Math.PI * 2);
        this.currentRenderCtx.fill();
        break;

      case 'event':
        this.currentRenderCtx.fillStyle = '#800080';
        this.currentRenderCtx.beginPath();
        this.currentRenderCtx.arc(x, y, size / 4, 0, Math.PI * 2);
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
