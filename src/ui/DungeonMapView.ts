import { DungeonLevel, DungeonTile } from '../types/GameTypes';

export class DungeonMapView {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isVisible: boolean = false;
  private dungeon: DungeonLevel | null = null;
  private playerX: number = 0;
  private playerY: number = 0;
  private playerFacing: string = 'north';

  private readonly TILE_SIZE = 20;
  private readonly COLORS = {
    background: 'rgba(0, 0, 0, 0.95)',
    border: '#444',
    undiscovered: '#111',
    wall: '#333',
    wallLine: '#fff',
    floor: '#666',
    stairs_up: '#0a0',
    stairs_down: '#a00',
    chest: '#fa0',
    door: '#840',
    trap: '#808',
    event: '#088',
    player: '#fff',
    playerDirection: '#ff0',
    grid: 'rgba(255, 255, 255, 0.1)',
    text: '#fff',
    legendBg: 'rgba(0, 0, 0, 0.7)',
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  public setDungeon(dungeon: DungeonLevel): void {
    this.dungeon = dungeon;
  }

  public setPlayerPosition(x: number, y: number, facing: string): void {
    this.playerX = x;
    this.playerY = y;
    this.playerFacing = facing;
  }

  public toggle(): void {
    this.isVisible = !this.isVisible;
  }

  public show(): void {
    this.isVisible = true;
  }

  public hide(): void {
    this.isVisible = false;
  }

  public getIsVisible(): boolean {
    return this.isVisible;
  }

  public render(): void {
    if (!this.isVisible || !this.dungeon) return;

    this.ctx.save();

    this.drawBackground();
    this.drawMap();
    this.drawPlayer();
    this.drawLegend();
    this.drawTitle();

    this.ctx.restore();
  }

  private drawBackground(): void {
    this.ctx.fillStyle = this.COLORS.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.strokeStyle = this.COLORS.border;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(10, 10, this.canvas.width - 20, this.canvas.height - 20);
  }

  private drawMap(): void {
    if (!this.dungeon) return;

    const mapWidth = this.dungeon.width * this.TILE_SIZE;
    const mapHeight = this.dungeon.height * this.TILE_SIZE;
    const offsetX = (this.canvas.width - mapWidth) / 2;
    const offsetY = (this.canvas.height - mapHeight) / 2;

    for (let y = 0; y < this.dungeon.height; y++) {
      for (let x = 0; x < this.dungeon.width; x++) {
        const tile = this.dungeon.tiles[y][x];
        const drawX = offsetX + x * this.TILE_SIZE;
        const drawY = offsetY + y * this.TILE_SIZE;

        this.drawTile(tile, drawX, drawY);
      }
    }

    this.ctx.strokeStyle = this.COLORS.grid;
    this.ctx.lineWidth = 0.5;

    for (let x = 0; x <= this.dungeon.width; x++) {
      const drawX = offsetX + x * this.TILE_SIZE;
      this.ctx.beginPath();
      this.ctx.moveTo(drawX, offsetY);
      this.ctx.lineTo(drawX, offsetY + mapHeight);
      this.ctx.stroke();
    }

    for (let y = 0; y <= this.dungeon.height; y++) {
      const drawY = offsetY + y * this.TILE_SIZE;
      this.ctx.beginPath();
      this.ctx.moveTo(offsetX, drawY);
      this.ctx.lineTo(offsetX + mapWidth, drawY);
      this.ctx.stroke();
    }
  }

  private drawTile(tile: DungeonTile, x: number, y: number): void {
    if (!tile.discovered) {
      this.ctx.fillStyle = this.COLORS.undiscovered;
      this.ctx.fillRect(x, y, this.TILE_SIZE, this.TILE_SIZE);
      return;
    }

    let color = this.COLORS.floor;
    let symbol = '';

    switch (tile.type) {
      case 'wall':
        color = this.COLORS.wall;
        break;
      case 'floor':
        color = this.COLORS.floor;
        break;
      case 'stairs_up':
        color = this.COLORS.stairs_up;
        symbol = '▲';
        break;
      case 'stairs_down':
        color = this.COLORS.stairs_down;
        symbol = '▼';
        break;
      case 'chest':
        color = this.COLORS.chest;
        symbol = '□';
        break;
      case 'door':
        color = this.COLORS.door;
        symbol = '◊';
        break;
      case 'trap':
        color = this.COLORS.trap;
        symbol = '×';
        break;
      case 'event':
        color = this.COLORS.event;
        symbol = '?';
        break;
    }

    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, this.TILE_SIZE, this.TILE_SIZE);

    if (symbol) {
      this.ctx.fillStyle = '#000';
      this.ctx.font = 'bold 14px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(symbol, x + this.TILE_SIZE / 2, y + this.TILE_SIZE / 2);
    }

    if (tile.type !== 'wall') {
      this.ctx.strokeStyle = this.COLORS.wallLine;
      this.ctx.lineWidth = 2;

      if (tile.northWall) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + this.TILE_SIZE, y);
        this.ctx.stroke();
      }
      if (tile.southWall) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + this.TILE_SIZE);
        this.ctx.lineTo(x + this.TILE_SIZE, y + this.TILE_SIZE);
        this.ctx.stroke();
      }
      if (tile.westWall) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x, y + this.TILE_SIZE);
        this.ctx.stroke();
      }
      if (tile.eastWall) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + this.TILE_SIZE, y);
        this.ctx.lineTo(x + this.TILE_SIZE, y + this.TILE_SIZE);
        this.ctx.stroke();
      }
    }
  }

  private drawPlayer(): void {
    if (!this.dungeon) return;

    const mapWidth = this.dungeon.width * this.TILE_SIZE;
    const mapHeight = this.dungeon.height * this.TILE_SIZE;
    const offsetX = (this.canvas.width - mapWidth) / 2;
    const offsetY = (this.canvas.height - mapHeight) / 2;

    const playerDrawX = offsetX + this.playerX * this.TILE_SIZE + this.TILE_SIZE / 2;
    const playerDrawY = offsetY + this.playerY * this.TILE_SIZE + this.TILE_SIZE / 2;

    this.ctx.fillStyle = this.COLORS.player;
    this.ctx.beginPath();
    this.ctx.arc(playerDrawX, playerDrawY, 6, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = this.COLORS.playerDirection;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(playerDrawX, playerDrawY);

    let dirX = 0,
      dirY = 0;
    switch (this.playerFacing) {
      case 'north':
        dirY = -1;
        break;
      case 'south':
        dirY = 1;
        break;
      case 'east':
        dirX = 1;
        break;
      case 'west':
        dirX = -1;
        break;
    }

    this.ctx.lineTo(
      playerDrawX + dirX * this.TILE_SIZE * 0.4,
      playerDrawY + dirY * this.TILE_SIZE * 0.4
    );
    this.ctx.stroke();
  }

  private drawLegend(): void {
    const legendX = 30;
    const legendY = this.canvas.height - 180;
    const legendWidth = 200;
    const legendHeight = 150;

    this.ctx.fillStyle = this.COLORS.legendBg;
    this.ctx.fillRect(legendX, legendY, legendWidth, legendHeight);

    this.ctx.strokeStyle = this.COLORS.border;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);

    this.ctx.fillStyle = this.COLORS.text;
    this.ctx.font = 'bold 14px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText('LEGEND', legendX + 10, legendY + 10);

    const items = [
      { color: this.COLORS.floor, label: 'Floor' },
      { color: this.COLORS.wallLine, label: 'Wall (white lines)' },
      { color: this.COLORS.stairs_up, label: '▲ Stairs Up' },
      { color: this.COLORS.stairs_down, label: '▼ Stairs Down' },
      { color: this.COLORS.chest, label: '□ Chest' },
      { color: this.COLORS.door, label: '◊ Door' },
      { color: this.COLORS.player, label: '● You' },
    ];

    this.ctx.font = '12px monospace';
    items.forEach((item, index) => {
      const itemY = legendY + 35 + index * 16;

      this.ctx.fillStyle = item.color;
      this.ctx.fillRect(legendX + 10, itemY, 12, 12);

      this.ctx.fillStyle = this.COLORS.text;
      this.ctx.fillText(item.label, legendX + 30, itemY);
    });
  }

  private drawTitle(): void {
    if (!this.dungeon) return;

    this.ctx.fillStyle = this.COLORS.text;
    this.ctx.font = 'bold 20px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(`DUNGEON FLOOR ${this.dungeon.level}`, this.canvas.width / 2, 30);

    this.ctx.font = '14px monospace';
    this.ctx.fillText(
      `Position: (${this.playerX}, ${this.playerY}) Facing: ${this.playerFacing.toUpperCase()}`,
      this.canvas.width / 2,
      55
    );

    this.ctx.fillText('Press M to close map', this.canvas.width / 2, this.canvas.height - 30);
  }
}
