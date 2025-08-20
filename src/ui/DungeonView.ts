import { Direction, DungeonLevel, DungeonTile } from '../types/GameTypes';

export class DungeonView {
  private ctx: CanvasRenderingContext2D;
  private dungeon: DungeonLevel | null = null;
  private playerX: number = 0;
  private playerY: number = 0;
  private playerFacing: Direction = 'north';

  private readonly VIEW_WIDTH = 400;
  private readonly VIEW_HEIGHT = 300;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
  }

  public setDungeon(dungeon: DungeonLevel): void {
    this.dungeon = dungeon;
  }

  public setPlayerPosition(x: number, y: number, facing: Direction): void {
    this.playerX = x;
    this.playerY = y;
    this.playerFacing = facing;
  }

  public render(): void {
    if (!this.dungeon) return;

    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.VIEW_WIDTH, this.VIEW_HEIGHT);

    this.renderDepth3();
    this.renderDepth2();
    this.renderDepth1();
    this.renderCurrentPosition();
    this.renderUI();
  }

  private renderDepth3(): void {
    const positions = this.getPositionsAtDepth(3);

    positions.forEach(pos => {
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

    positions.forEach(pos => {
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

    positions.forEach(pos => {
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
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x - width / 2, y - height / 2, width, height);

    this.ctx.strokeStyle = '#222';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x - width / 2, y - height / 2, width, height);

    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(x - width / 4, y - height / 4, width / 8, height / 8);
  }

  private drawFloor(x: number, y: number, width: number, height: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x - width / 2, y + height / 4, width, height / 2);

    this.ctx.strokeStyle = '#444';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x - width / 2, y + height / 4, width, height / 2);
  }

  private drawSpecialTile(tile: DungeonTile, x: number, y: number, size: number): void {
    if (!tile) return;

    switch (tile.type) {
      case 'door':
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x - size / 4, y - size / 2, size / 2, size);
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(x - size / 8, y - size / 8, size / 16, size / 16);
        break;

      case 'chest':
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x - size / 3, y - size / 6, (size * 2) / 3, size / 3);
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(x - size / 6, y - size / 12, size / 8, size / 6);
        break;

      case 'stairs_up':
        this.ctx.strokeStyle = '#999';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          this.ctx.beginPath();
          this.ctx.moveTo(x - size / 3 + (i * size) / 6, y + size / 6);
          this.ctx.lineTo(x + size / 3, y + size / 6 - (i * size) / 6);
          this.ctx.stroke();
        }
        break;

      case 'stairs_down':
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          this.ctx.beginPath();
          this.ctx.moveTo(x - size / 3, y - size / 6 + (i * size) / 6);
          this.ctx.lineTo(x + size / 3 - (i * size) / 6, y + size / 6);
          this.ctx.stroke();
        }
        break;

      case 'trap':
        this.ctx.fillStyle = '#FF0000';
        this.ctx.beginPath();
        this.ctx.arc(x, y, size / 6, 0, Math.PI * 2);
        this.ctx.fill();
        break;

      case 'event':
        this.ctx.fillStyle = '#800080';
        this.ctx.beginPath();
        this.ctx.arc(x, y, size / 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#FF00FF';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        break;
    }
  }

  private renderUI(): void {
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(0, this.VIEW_HEIGHT - 60, this.VIEW_WIDTH, 60);

    this.ctx.strokeStyle = '#666';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(0, this.VIEW_HEIGHT - 60, this.VIEW_WIDTH, 60);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '14px monospace';
    this.ctx.fillText(`Position: ${this.playerX}, ${this.playerY}`, 10, this.VIEW_HEIGHT - 40);
    this.ctx.fillText(`Facing: ${this.playerFacing}`, 10, this.VIEW_HEIGHT - 20);

    if (this.dungeon) {
      this.ctx.fillText(`Floor: ${this.dungeon.level}`, 200, this.VIEW_HEIGHT - 40);

      const currentTile = this.getTileAt(this.playerX, this.playerY);
      if (currentTile && currentTile.type !== 'floor') {
        this.ctx.fillText(`On: ${currentTile.type}`, 200, this.VIEW_HEIGHT - 20);
      }
    }

    const compassSize = 40;
    const compassX = this.VIEW_WIDTH - compassSize - 10;
    const compassY = this.VIEW_HEIGHT - compassSize - 10;

    this.ctx.strokeStyle = '#666';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(compassX, compassY, compassSize / 2, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.fillStyle = '#ff0000';
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('N', compassX, compassY - compassSize / 3);

    const arrowLength = compassSize / 3;
    const angle = this.getCompassAngle();
    const arrowX = compassX + Math.sin(angle) * arrowLength;
    const arrowY = compassY - Math.cos(angle) * arrowLength;

    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(compassX, compassY);
    this.ctx.lineTo(arrowX, arrowY);
    this.ctx.stroke();

    this.ctx.textAlign = 'start';
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
    }
  }
}
