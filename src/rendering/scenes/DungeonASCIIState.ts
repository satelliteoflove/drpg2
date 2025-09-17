import { ASCIIState, ASCII_GRID_HEIGHT, ASCII_GRID_WIDTH } from '../ASCIIState';
import { ASCII_SYMBOLS } from '../ASCIISymbols';
import { Direction, DungeonLevel, DungeonTile } from '../../types/GameTypes';
import { DebugLogger } from '../../utils/DebugLogger';
import { Character } from '../../entities/Character';

export class DungeonASCIIState extends ASCIIState {
  private dungeon: DungeonLevel | null = null;
  private playerX: number = 0;
  private playerY: number = 0;
  private playerFacing: Direction = 'north';
  private showMap: boolean = false;
  private mapOffsetX: number = 0;
  private mapOffsetY: number = 0;

  constructor() {
    super(ASCII_GRID_WIDTH, ASCII_GRID_HEIGHT);
    DebugLogger.info('DungeonASCIIState', 'Initialized DungeonASCIIState');
  }

  private markFullDirty(): void {
    // Mark entire grid as needing re-render
    for (let y = 0; y < ASCII_GRID_HEIGHT; y++) {
      for (let x = 0; x < ASCII_GRID_WIDTH; x++) {
        // Force a minimal change to mark cell as dirty
        const grid = this.getGrid();
        if (grid.cells[y] && grid.cells[y][x] !== undefined) {
          this.setCell(x, y, grid.cells[y][x]);
        }
      }
    }
  }

  public setDungeon(dungeon: DungeonLevel): void {
    this.dungeon = dungeon;
    this.markFullDirty();
  }

  public setPlayerPosition(x: number, y: number, facing: Direction): void {
    this.playerX = x;
    this.playerY = y;
    this.playerFacing = facing;
    this.updateMapOffset();
    this.markFullDirty();
  }

  public toggleMap(): void {
    this.showMap = !this.showMap;
    this.markFullDirty();
  }

  public setMapVisible(visible: boolean): void {
    this.showMap = visible;
    this.markFullDirty();
  }

  private updateMapOffset(): void {
    if (!this.dungeon) return;

    const mapViewWidth = 30;
    const mapViewHeight = 20;

    this.mapOffsetX = Math.max(
      0,
      Math.min(this.dungeon.width - mapViewWidth, this.playerX - Math.floor(mapViewWidth / 2))
    );

    this.mapOffsetY = Math.max(
      0,
      Math.min(this.dungeon.height - mapViewHeight, this.playerY - Math.floor(mapViewHeight / 2))
    );
  }

  public updateDungeonView(): void {
    if (!this.dungeon) return;

    this.clear();

    if (this.showMap) {
      this.renderFullMap();
    } else {
      this.renderFirstPersonView();
      this.renderMiniMap();
    }

    this.renderUIBorders();
  }

  private renderFirstPersonView(): void {
    const viewX = 1;
    const viewY = 1;
    const viewWidth = 48;
    const viewHeight = 22;

    this.drawBox(viewX - 1, viewY - 1, viewWidth + 2, viewHeight + 2);

    const centerX = viewX + Math.floor(viewWidth / 2);
    const centerY = viewY + Math.floor(viewHeight / 2);

    this.renderDepth3(centerX, centerY);
    this.renderDepth2(centerX, centerY);
    this.renderDepth1(centerX, centerY);
    this.renderCurrentPosition(centerX, centerY);

    this.renderCompass(viewX + viewWidth - 8, viewY + 1);
  }

  private renderDepth3(centerX: number, centerY: number): void {
    const positions = this.getPositionsAtDepth(3);

    positions.forEach((pos) => {
      const tile = this.getTileAt(pos.x, pos.y);
      if (!tile) return;

      const offsetX = pos.screenOffset * 4;
      const x = centerX + offsetX;
      const y = centerY - 3;

      if (this.canSeeWall(pos.x, pos.y, pos.side)) {
        this.drawWallSection(x, y, 3, 3, 'far');
      } else if (tile.type === 'floor') {
        this.drawFloorSection(x, y, 3, 2, 'far');
      }
    });
  }

  private renderDepth2(centerX: number, centerY: number): void {
    const positions = this.getPositionsAtDepth(2);

    positions.forEach((pos) => {
      const tile = this.getTileAt(pos.x, pos.y);
      if (!tile) return;

      const offsetX = pos.screenOffset * 8;
      const x = centerX + offsetX;
      const y = centerY - 2;

      if (this.canSeeWall(pos.x, pos.y, pos.side)) {
        this.drawWallSection(x, y, 5, 5, 'mid');
      } else if (tile.type === 'floor') {
        this.drawFloorSection(x, y, 5, 3, 'mid');
        this.drawSpecialTileSymbol(tile, x, y);
      }
    });
  }

  private renderDepth1(centerX: number, centerY: number): void {
    const positions = this.getPositionsAtDepth(1);

    positions.forEach((pos) => {
      const tile = this.getTileAt(pos.x, pos.y);
      if (!tile) return;

      const offsetX = pos.screenOffset * 12;
      const x = centerX + offsetX;
      const y = centerY;

      if (this.canSeeWall(pos.x, pos.y, pos.side)) {
        this.drawWallSection(x, y, 7, 7, 'near');
      } else if (tile.type === 'floor') {
        this.drawFloorSection(x, y, 7, 4, 'near');
        this.drawSpecialTileSymbol(tile, x, y + 1);
      }
    });
  }

  private renderCurrentPosition(centerX: number, centerY: number): void {
    const tile = this.getTileAt(this.playerX, this.playerY);
    if (!tile) return;

    const frontTile = this.getTileInFront();
    if (frontTile && frontTile.type === 'wall') {
      this.drawWallSection(centerX, centerY + 2, 15, 10, 'immediate');
    } else {
      this.drawFloorSection(centerX, centerY + 4, 10, 5, 'immediate');
      if (tile.type !== 'floor') {
        this.drawSpecialTileSymbol(tile, centerX, centerY + 5);
      }
    }
  }

  private drawWallSection(
    x: number,
    y: number,
    width: number,
    height: number,
    distance: 'far' | 'mid' | 'near' | 'immediate'
  ): void {
    const wallChar = distance === 'far' ? '░' : distance === 'mid' ? '▒' : '▓';

    for (let dy = 0; dy < height; dy++) {
      for (let dx = -Math.floor(width / 2); dx <= Math.floor(width / 2); dx++) {
        this.setCell(x + dx, y + dy, wallChar);
      }
    }
  }

  private drawFloorSection(
    x: number,
    y: number,
    width: number,
    height: number,
    distance: 'far' | 'mid' | 'near' | 'immediate'
  ): void {
    const floorChar = distance === 'far' ? '.' : distance === 'mid' ? '·' : '∙';

    for (let dy = 0; dy < height; dy++) {
      for (let dx = -Math.floor(width / 2); dx <= Math.floor(width / 2); dx++) {
        if (dy === 0 || dy === height - 1) {
          this.setCell(x + dx, y + dy, floorChar);
        }
      }
    }
  }

  private drawSpecialTileSymbol(tile: DungeonTile, x: number, y: number): void {
    let symbol = '';

    switch (tile.type) {
      case 'stairs_up':
        symbol = ASCII_SYMBOLS.STAIRS_UP;
        break;
      case 'stairs_down':
        symbol = ASCII_SYMBOLS.STAIRS_DOWN;
        break;
      case 'chest':
        symbol = ASCII_SYMBOLS.CHEST;
        break;
      case 'door':
        symbol = ASCII_SYMBOLS.DOOR_CLOSED;
        break;
      case 'trap':
        symbol = ASCII_SYMBOLS.TRAP;
        break;
    }

    if (symbol) {
      this.setCell(x, y, symbol);
    }
  }

  private renderCompass(x: number, y: number): void {
    const directions = ['N', 'E', 'S', 'W'];
    const facingIndex = ['north', 'east', 'south', 'west'].indexOf(this.playerFacing);

    this.writeText(x, y, '┌─────┐');
    this.writeText(x, y + 1, '│     │');
    this.writeText(x, y + 2, '│     │');
    this.writeText(x, y + 3, '└─────┘');

    const compassDir = directions[facingIndex];
    this.writeText(x + 3, y + 2, compassDir, { foreground: '#FFFF00' });
  }

  private renderMiniMap(): void {
    if (!this.dungeon) return;

    const mapX = 52;
    const mapY = 1;
    const mapWidth = 25;
    const mapHeight = 15;

    this.drawBox(mapX - 1, mapY - 1, mapWidth + 2, mapHeight + 2);
    this.writeText(mapX + 8, mapY - 1, ' MINI MAP ');

    const viewRadius = 5;
    const startX = Math.max(0, this.playerX - viewRadius);
    const endX = Math.min(this.dungeon.width - 1, this.playerX + viewRadius);
    const startY = Math.max(0, this.playerY - viewRadius);
    const endY = Math.min(this.dungeon.height - 1, this.playerY + viewRadius);

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const tile = this.dungeon.tiles[y][x];
        if (!tile || !tile.discovered) continue;

        const screenX = mapX + (x - startX) * 2 + 1;
        const screenY = mapY + (y - startY) + 1;

        if (x === this.playerX && y === this.playerY) {
          this.setCell(screenX, screenY, ASCII_SYMBOLS.PLAYER);
        } else {
          this.setCell(screenX, screenY, this.getTileSymbol(tile));
        }
      }
    }
  }

  private renderFullMap(): void {
    if (!this.dungeon) return;

    const mapX = 10;
    const mapY = 2;
    const mapWidth = 60;
    const mapHeight = 30;

    this.drawBox(mapX - 1, mapY - 1, mapWidth + 2, mapHeight + 2);
    this.writeText(mapX + 20, mapY - 1, ` DUNGEON MAP - FLOOR ${this.playerY} `);

    for (let y = 0; y < mapHeight && y + this.mapOffsetY < this.dungeon.height; y++) {
      for (let x = 0; x < mapWidth && x + this.mapOffsetX < this.dungeon.width; x++) {
        const tileX = x + this.mapOffsetX;
        const tileY = y + this.mapOffsetY;
        const tile = this.dungeon.tiles[tileY][tileX];

        if (!tile || !tile.discovered) {
          this.setCell(mapX + x, mapY + y, ASCII_SYMBOLS.DARKNESS);
          continue;
        }

        if (tileX === this.playerX && tileY === this.playerY) {
          this.setCell(mapX + x, mapY + y, ASCII_SYMBOLS.PLAYER);
        } else {
          this.setCell(mapX + x, mapY + y, this.getTileSymbol(tile));
        }
      }
    }

    this.writeText(mapX, mapY + mapHeight + 1, 'Press M to close map');
  }

  private getTileSymbol(tile: DungeonTile): string {
    switch (tile.type) {
      case 'wall':
        return ASCII_SYMBOLS.WALL;
      case 'floor':
        return ASCII_SYMBOLS.FLOOR;
      case 'stairs_up':
        return ASCII_SYMBOLS.STAIRS_UP;
      case 'stairs_down':
        return ASCII_SYMBOLS.STAIRS_DOWN;
      case 'chest':
        return ASCII_SYMBOLS.CHEST;
      case 'door':
        return ASCII_SYMBOLS.DOOR_CLOSED;
      case 'trap':
        return ASCII_SYMBOLS.TRAP;
      default:
        return ASCII_SYMBOLS.UNKNOWN;
    }
  }

  private getTileAt(x: number, y: number): DungeonTile | null {
    if (!this.dungeon) return null;
    if (x < 0 || x >= this.dungeon.width || y < 0 || y >= this.dungeon.height) return null;
    return this.dungeon.tiles[y][x];
  }

  private getTileInFront(): DungeonTile | null {
    const [dx, dy] = this.getDirectionVector();
    return this.getTileAt(this.playerX + dx, this.playerY + dy);
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

  private canSeeWall(x: number, y: number, side: 'left' | 'center' | 'right'): boolean {
    const tile = this.getTileAt(x, y);
    if (!tile) return false;

    if (tile.type === 'wall') return true;

    if (side === 'left') {
      const [dx, dy] = this.getLeftVector();
      const leftTile = this.getTileAt(x + dx, y + dy);
      return leftTile?.type === 'wall';
    } else if (side === 'right') {
      const [dx, dy] = this.getRightVector();
      const rightTile = this.getTileAt(x + dx, y + dy);
      return rightTile?.type === 'wall';
    }

    return false;
  }

  private getLeftVector(): [number, number] {
    switch (this.playerFacing) {
      case 'north':
        return [-1, 0];
      case 'south':
        return [1, 0];
      case 'east':
        return [0, -1];
      case 'west':
        return [0, 1];
      default:
        return [0, 0];
    }
  }

  private getRightVector(): [number, number] {
    switch (this.playerFacing) {
      case 'north':
        return [1, 0];
      case 'south':
        return [-1, 0];
      case 'east':
        return [0, 1];
      case 'west':
        return [0, -1];
      default:
        return [0, 0];
    }
  }

  private getPositionsAtDepth(
    depth: number
  ): Array<{ x: number; y: number; side: 'left' | 'center' | 'right'; screenOffset: number }> {
    const positions: Array<{
      x: number;
      y: number;
      side: 'left' | 'center' | 'right';
      screenOffset: number;
    }> = [];
    const [dx, dy] = this.getDirectionVector();
    const [lx, ly] = this.getLeftVector();
    const [rx, ry] = this.getRightVector();

    const forwardX = this.playerX + dx * depth;
    const forwardY = this.playerY + dy * depth;

    positions.push({ x: forwardX - lx, y: forwardY - ly, side: 'left', screenOffset: -1 });
    positions.push({ x: forwardX, y: forwardY, side: 'center', screenOffset: 0 });
    positions.push({ x: forwardX + rx, y: forwardY + ry, side: 'right', screenOffset: 1 });

    return positions;
  }

  private renderUIBorders(): void {
    // Don't draw UI borders that would overlap with content
    // The controls are already at the bottom of the screen
  }

  public renderStatusPanel(party: any): void {
    const panelX = 52;
    const panelY = 12; // Moved up to avoid overlap with message log
    const panelWidth = 25;
    const panelHeight = 6;

    this.drawBox(panelX - 1, panelY - 1, panelWidth + 2, panelHeight + 2);
    this.writeText(panelX + 7, panelY - 1, ' PARTY STATUS ');

    const characters = party.getAliveCharacters();
    for (let i = 0; i < Math.min(characters.length, 5); i++) {
      const char: Character = characters[i];
      const y = panelY + i;

      const name = char.name.substring(0, 8).padEnd(8);
      const hp = `${char.hp}/${char.maxHp}`.padStart(7);
      const mp = `${char.mp}/${char.maxMp}`.padStart(7);

      this.writeText(panelX, y, `${name} HP:${hp} MP:${mp}`);
    }
  }

  public renderMessageLog(messages: string[]): void {
    const logY = 20; // Changed from 25 to fit within grid
    const maxMessages = 3; // Reduced to fit available space

    // Draw a separator line
    this.writeText(0, logY - 1, '─'.repeat(50));

    for (let i = 0; i < maxMessages && i < messages.length; i++) {
      const message = messages[messages.length - 1 - i];
      this.writeText(2, logY + i, message.substring(0, 48)); // Reduced width to avoid overlap
    }
  }

  public renderControls(): void {
    const y = ASCII_GRID_HEIGHT - 2;
    this.writeText(
      2,
      y,
      'WASD/Arrows: Move | SPACE/ENTER: Interact | M: Map | TAB: Inventory | ESC: Menu'
    );
  }

  public renderItemPickupUI(
    itemName: string,
    characters: Character[],
    selectedIndex: number
  ): void {
    const windowX = 20;
    const windowY = 8;
    const windowWidth = 40;
    const windowHeight = 12;

    this.fillRegion(windowX, windowY, windowWidth, windowHeight, ' ');
    this.drawBox(windowX, windowY, windowWidth, windowHeight);

    this.centerTextInRegion(windowX, windowY + 1, windowWidth, 'SELECT CHARACTER TO RECEIVE:');
    this.centerTextInRegion(windowX, windowY + 2, windowWidth, itemName);

    for (let i = 0; i < characters.length; i++) {
      const char = characters[i];
      const y = windowY + 4 + i;
      const prefix = i === selectedIndex ? '> ' : '  ';
      const text = `${prefix}${i + 1}. ${char.name}`;
      this.writeText(windowX + 2, y, text);
    }

    this.writeText(
      windowX + 2,
      windowY + windowHeight - 2,
      'UP/DOWN: Select | ENTER: Confirm | L: Discard'
    );
  }

  private centerTextInRegion(x: number, y: number, width: number, text: string): void {
    const centerX = x + Math.floor((width - text.length) / 2);
    this.writeText(centerX, y, text);
  }

  private fillRegion(x: number, y: number, width: number, height: number, char: string): void {
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        this.setCell(x + dx, y + dy, char);
      }
    }
  }

  public renderCastleStairsPrompt(): void {
    const windowX = 25;
    const windowY = 10;
    const windowWidth = 30;
    const windowHeight = 6;

    this.fillRegion(windowX, windowY, windowWidth, windowHeight, ' ');
    this.drawBox(windowX, windowY, windowWidth, windowHeight);

    this.centerTextInRegion(windowX, windowY + 1, windowWidth, 'CASTLE STAIRS');
    this.centerTextInRegion(windowX, windowY + 2, windowWidth, 'Return to castle?');
    this.centerTextInRegion(windowX, windowY + 4, windowWidth, '(Y/N)');
  }
}
