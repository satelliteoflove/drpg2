import { DungeonLevel, DungeonTile } from '../types/GameTypes';

export class DungeonMapView {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private currentRenderCtx: CanvasRenderingContext2D;
  private isVisible: boolean = false;
  private dungeon: DungeonLevel | null = null;
  private playerX: number = 0;
  private playerY: number = 0;
  private playerFacing: string = 'north';

  private readonly TILE_SIZE = 20;
  private readonly COLORS = {
    background: 'rgba(0, 0, 0, 0.95)',
    border: '#444',
    undiscovered: '#444',
    wall: '#f00',
    wallLine: '#fff',
    floor: '#aaa',
    stairs_up: '#0a0',
    stairs_down: '#a00',
    chest: '#fa0',
    door: '#840',
    door_regular: '#840',
    door_locked: '#c40',
    door_oneway: '#08c',
    door_lever: '#c0c',
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
    this.currentRenderCtx = this.ctx;
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

  public render(ctx?: CanvasRenderingContext2D): void {
    if (!this.isVisible || !this.dungeon) return;

    this.currentRenderCtx = ctx || this.ctx;
    this.currentRenderCtx.save();

    this.drawBackground();
    this.drawMap();
    this.drawPlayer();
    this.drawLegend();
    this.drawTitle();

    this.currentRenderCtx.restore();
  }

  private drawBackground(): void {
    this.currentRenderCtx.fillStyle = this.COLORS.background;
    this.currentRenderCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.currentRenderCtx.strokeStyle = this.COLORS.border;
    this.currentRenderCtx.lineWidth = 2;
    this.currentRenderCtx.strokeRect(10, 10, this.canvas.width - 20, this.canvas.height - 20);
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

    this.currentRenderCtx.strokeStyle = this.COLORS.grid;
    this.currentRenderCtx.lineWidth = 0.5;

    for (let x = 0; x <= this.dungeon.width; x++) {
      const drawX = offsetX + x * this.TILE_SIZE;
      this.currentRenderCtx.beginPath();
      this.currentRenderCtx.moveTo(drawX, offsetY);
      this.currentRenderCtx.lineTo(drawX, offsetY + mapHeight);
      this.currentRenderCtx.stroke();
    }

    for (let y = 0; y <= this.dungeon.height; y++) {
      const drawY = offsetY + y * this.TILE_SIZE;
      this.currentRenderCtx.beginPath();
      this.currentRenderCtx.moveTo(offsetX, drawY);
      this.currentRenderCtx.lineTo(offsetX + mapWidth, drawY);
      this.currentRenderCtx.stroke();
    }

    this.currentRenderCtx.fillStyle = '#fff';
    this.currentRenderCtx.font = '9px monospace';
    this.currentRenderCtx.textAlign = 'center';
    this.currentRenderCtx.textBaseline = 'bottom';

    for (let x = 0; x < this.dungeon.width; x += 5) {
      const drawX = offsetX + x * this.TILE_SIZE + this.TILE_SIZE / 2;
      this.currentRenderCtx.fillText(x.toString(), drawX, offsetY - 2);
    }

    this.currentRenderCtx.textAlign = 'right';
    this.currentRenderCtx.textBaseline = 'middle';
    for (let y = 0; y < this.dungeon.height; y += 5) {
      const drawY = offsetY + y * this.TILE_SIZE + this.TILE_SIZE / 2;
      this.currentRenderCtx.fillText(y.toString(), offsetX - 3, drawY);
    }
  }

  private drawTile(tile: DungeonTile, x: number, y: number): void {
    if (!tile.discovered && tile.type !== 'solid') {
      this.currentRenderCtx.fillStyle = this.COLORS.undiscovered;
      this.currentRenderCtx.fillRect(x, y, this.TILE_SIZE, this.TILE_SIZE);
      return;
    }

    let color = this.COLORS.floor;
    let symbol = '';

    if (tile.type === 'solid') {
      color = this.COLORS.wall;
    } else if (tile.type === 'floor') {
      color = this.COLORS.floor;

      if (tile.special) {
        switch (tile.special.type) {
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
          case 'trap':
            color = this.COLORS.trap;
            symbol = '×';
            break;
          case 'event':
            color = this.COLORS.event;
            symbol = '?';
            break;
        }
      }
    }

    this.currentRenderCtx.fillStyle = color;
    this.currentRenderCtx.fillRect(x, y, this.TILE_SIZE, this.TILE_SIZE);

    if (symbol) {
      this.currentRenderCtx.fillStyle = '#000';
      this.currentRenderCtx.font = 'bold 14px monospace';
      this.currentRenderCtx.textAlign = 'center';
      this.currentRenderCtx.textBaseline = 'middle';
      this.currentRenderCtx.fillText(symbol, x + this.TILE_SIZE / 2, y + this.TILE_SIZE / 2);
    }

    if (tile.type !== 'solid') {
      this.drawWall(tile.northWall, x, y, x + this.TILE_SIZE, y);
      this.drawWall(tile.southWall, x, y + this.TILE_SIZE, x + this.TILE_SIZE, y + this.TILE_SIZE);
      this.drawWall(tile.westWall, x, y, x, y + this.TILE_SIZE);
      this.drawWall(tile.eastWall, x + this.TILE_SIZE, y, x + this.TILE_SIZE, y + this.TILE_SIZE);
    }
  }

  private drawWall(wall: any, x1: number, y1: number, x2: number, y2: number): void {
    if (!wall.exists) return;

    if (wall.type === 'door') {
      let color = this.COLORS.door_regular;
      if (wall.properties?.locked) {
        color = this.COLORS.door_locked;
      } else if (wall.properties?.oneWay) {
        color = this.COLORS.door_oneway;
      } else if (wall.properties?.openMechanism === 'lever') {
        color = this.COLORS.door_lever;
      }

      this.currentRenderCtx.strokeStyle = color;
      this.currentRenderCtx.lineWidth = 2;
      this.currentRenderCtx.setLineDash([4, 4]);
      this.currentRenderCtx.beginPath();
      this.currentRenderCtx.moveTo(x1, y1);
      this.currentRenderCtx.lineTo(x2, y2);
      this.currentRenderCtx.stroke();
      this.currentRenderCtx.setLineDash([]);

      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      this.currentRenderCtx.fillStyle = color;
      this.currentRenderCtx.font = 'bold 12px monospace';
      this.currentRenderCtx.textAlign = 'center';
      this.currentRenderCtx.textBaseline = 'middle';
      this.currentRenderCtx.fillText('◊', midX, midY);
    } else {
      this.currentRenderCtx.strokeStyle = this.COLORS.wallLine;
      this.currentRenderCtx.lineWidth = 2;
      this.currentRenderCtx.beginPath();
      this.currentRenderCtx.moveTo(x1, y1);
      this.currentRenderCtx.lineTo(x2, y2);
      this.currentRenderCtx.stroke();
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

    this.currentRenderCtx.fillStyle = this.COLORS.player;
    this.currentRenderCtx.beginPath();
    this.currentRenderCtx.arc(playerDrawX, playerDrawY, 6, 0, Math.PI * 2);
    this.currentRenderCtx.fill();

    this.currentRenderCtx.strokeStyle = this.COLORS.playerDirection;
    this.currentRenderCtx.lineWidth = 3;
    this.currentRenderCtx.beginPath();
    this.currentRenderCtx.moveTo(playerDrawX, playerDrawY);

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

    this.currentRenderCtx.lineTo(
      playerDrawX + dirX * this.TILE_SIZE * 0.4,
      playerDrawY + dirY * this.TILE_SIZE * 0.4
    );
    this.currentRenderCtx.stroke();
  }

  private drawLegend(): void {
    const legendX = 20;
    const legendY = this.canvas.height - 200;
    const legendWidth = 140;
    const legendHeight = 180;

    this.currentRenderCtx.fillStyle = this.COLORS.legendBg;
    this.currentRenderCtx.fillRect(legendX, legendY, legendWidth, legendHeight);

    this.currentRenderCtx.strokeStyle = this.COLORS.border;
    this.currentRenderCtx.lineWidth = 1;
    this.currentRenderCtx.strokeRect(legendX, legendY, legendWidth, legendHeight);

    this.currentRenderCtx.fillStyle = this.COLORS.text;
    this.currentRenderCtx.font = 'bold 11px monospace';
    this.currentRenderCtx.textAlign = 'left';
    this.currentRenderCtx.textBaseline = 'top';
    this.currentRenderCtx.fillText('LEGEND', legendX + 8, legendY + 8);

    const items = [
      { color: this.COLORS.floor, label: 'Floor' },
      { color: this.COLORS.wallLine, label: 'Wall' },
      { color: this.COLORS.stairs_up, label: '▲ Up' },
      { color: this.COLORS.stairs_down, label: '▼ Down' },
      { color: this.COLORS.chest, label: '□ Chest' },
      { color: this.COLORS.door_regular, label: '◊ Door' },
      { color: this.COLORS.door_locked, label: '◊ Locked' },
      { color: this.COLORS.door_oneway, label: '◊ One-Way' },
      { color: this.COLORS.player, label: '● You' },
    ];

    this.currentRenderCtx.font = '10px monospace';
    items.forEach((item, index) => {
      const itemY = legendY + 28 + index * 15;

      this.currentRenderCtx.fillStyle = item.color;
      this.currentRenderCtx.fillRect(legendX + 8, itemY, 10, 10);

      this.currentRenderCtx.fillStyle = this.COLORS.text;
      this.currentRenderCtx.fillText(item.label, legendX + 24, itemY);
    });
  }

  private drawTitle(): void {
    if (!this.dungeon) return;

    this.currentRenderCtx.fillStyle = this.COLORS.text;
    this.currentRenderCtx.font = 'bold 18px monospace';
    this.currentRenderCtx.textAlign = 'center';
    this.currentRenderCtx.textBaseline = 'top';
    this.currentRenderCtx.fillText(
      `DUNGEON FLOOR ${this.dungeon.level}`,
      this.canvas.width / 2,
      20
    );

    this.currentRenderCtx.font = '12px monospace';
    this.currentRenderCtx.fillText(
      `Position: (${this.playerX}, ${this.playerY}) Facing: ${this.playerFacing.toUpperCase()}`,
      this.canvas.width / 2,
      42
    );

    this.currentRenderCtx.font = '11px monospace';
    this.currentRenderCtx.fillText(
      'Press M to close map',
      this.canvas.width / 2,
      this.canvas.height - 20
    );
  }
}
