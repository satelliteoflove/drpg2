import { DungeonLevel, DungeonTile, Wall, Room, Connector } from '../types/GameTypes';
import { GAME_CONFIG } from '../config/GameConstants';
import { SeededRandom } from './SeededRandom';
import { DebugLogger } from './DebugLogger';

export class DungeonGenerator {
  private width: number;
  private height: number;
  private rooms: Room[] = [];
  private rng: SeededRandom;
  private seedString: string;
  private currentRegion: number = 0;
  private tiles: DungeonTile[][] = [];
  private doorConnectors: Set<string> = new Set();

  constructor(width: number = 20, height: number = 20, seed?: string) {
    this.width = width % 2 === 0 ? width + 1 : width;
    this.height = height % 2 === 0 ? height + 1 : height;
    this.seedString = seed || SeededRandom.generateSeedString();
    this.rng = new SeededRandom(this.seedString);
  }

  public getSeed(): string {
    return this.seedString;
  }

  public generateLevel(level: number): DungeonLevel {
    this.currentRegion = 0;
    this.rooms = [];
    this.doorConnectors = new Set();

    DebugLogger.debug('DungeonGenerator', 'Starting fresh generation');

    this.initializeTiles();
    this.addRooms();
    this.addMazes();
    this.connectRegions();
    if (GAME_CONFIG.DUNGEON.ROOMS_AND_MAZES.REMOVE_DEAD_ENDS) {
      this.removeDeadEnds();
    }
    this.updateWalls();

    const stairsPositions = this.placeStairs();
    const startPosition = this.findStartPosition();

    return {
      level,
      width: this.width,
      height: this.height,
      tiles: this.tiles,
      overrideZones: [],
      events: [],
      startX: startPosition.x,
      startY: startPosition.y,
      stairsUp: stairsPositions.up,
      stairsDown: stairsPositions.down,
    };
  }

  private initializeTiles(): void {
    this.tiles = [];

    for (let y = 0; y < this.height; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.tiles[y][x] = {
          x,
          y,
          type: 'solid',
          discovered: false,
          hasMonster: false,
          hasItem: false,
          northWall: this.createWall(true),
          southWall: this.createWall(true),
          eastWall: this.createWall(true),
          westWall: this.createWall(true),
          region: undefined,
        };
      }
    }

    DebugLogger.debug('DungeonGenerator', `Initialized ${this.width}x${this.height} tiles (all solid)`);
  }

  private createWall(exists: boolean): Wall {
    return {
      exists,
      type: 'solid',
      properties: null
    };
  }

  private addRooms(): void {
    const numAttempts = GAME_CONFIG.DUNGEON.ROOMS_AND_MAZES.ROOM_ATTEMPTS;
    let roomsPlaced = 0;
    let oddTilesCarved = 0;

    for (let i = 0; i < numAttempts; i++) {
      const minSize = GAME_CONFIG.DUNGEON.MIN_ROOM_SIZE;
      const maxSize = minSize + GAME_CONFIG.DUNGEON.MAX_ROOM_EXTRA_SIZE;
      const size = this.randomOddInRange(minSize, maxSize);
      const width = size;
      const height = size;

      const x = this.randomOddInRange(1, this.width - width - 1);
      const y = this.randomOddInRange(1, this.height - height - 1);

      const room: Room = {
        id: `room_${roomsPlaced}`,
        x,
        y,
        width,
        height,
        type: 'medium',
        doors: [],
        specialTiles: []
      };

      if (!this.roomOverlaps(room)) {
        const oddBefore = this.countOddFloorTiles();
        this.carveRoom(room);
        const oddAfter = this.countOddFloorTiles();
        oddTilesCarved += (oddAfter - oddBefore);
        this.rooms.push(room);
        roomsPlaced++;
      }
    }

    const totalOddTiles = Math.floor(this.width / 2) * Math.floor(this.height / 2);
    DebugLogger.debug('DungeonGenerator', `Placed ${roomsPlaced} rooms, carved ${oddTilesCarved}/${totalOddTiles} odd tiles (expected: ${totalOddTiles - oddTilesCarved} solid odd tiles remaining)`);
  }

  private randomOddInRange(min: number, max: number): number {
    min = min % 2 === 0 ? min + 1 : min;
    max = max % 2 === 0 ? max - 1 : max;

    const range = (max - min) / 2 + 1;
    const offset = Math.floor(this.rng.random() * range);
    return min + offset * 2;
  }

  private roomOverlaps(room: Room): boolean {
    for (const other of this.rooms) {
      if (room.x < other.x + other.width &&
          room.x + room.width > other.x &&
          room.y < other.y + other.height &&
          room.y + room.height > other.y) {
        return true;
      }
    }
    return false;
  }

  private carveRoom(room: Room): void {
    let tilesCarved = 0;
    let oddTilesCarved = 0;
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        this.tiles[y][x].type = 'floor';
        this.tiles[y][x].region = this.currentRegion;
        tilesCarved++;
        if (x % 2 === 1 && y % 2 === 1) oddTilesCarved++;
      }
    }
    DebugLogger.debug('DungeonGenerator', `  Room at (${room.x},${room.y}) ${room.width}x${room.height}: carved ${tilesCarved} total tiles, ${oddTilesCarved} odd tiles`);
    this.currentRegion++;
  }

  private addMazes(): void {
    let mazesStarted = 0;
    let oddTilesChecked = 0;
    let oddSolidTiles = 0;
    let oddFloorBeforeMazes = 0;

    for (let y = 1; y < this.height; y += 2) {
      for (let x = 1; x < this.width; x += 2) {
        oddTilesChecked++;
        if (this.tiles[y][x].type === 'solid') {
          oddSolidTiles++;
          this.growMaze(x, y);
          mazesStarted++;
          this.currentRegion++;
        } else {
          oddFloorBeforeMazes++;
        }
      }
    }

    const oddFloorAfterMazes = this.countOddFloorTiles();
    const oddCarvedByMazes = oddFloorAfterMazes - oddFloorBeforeMazes;
    DebugLogger.debug('DungeonGenerator', `Started ${mazesStarted} mazes at solid odd tiles (${oddSolidTiles} found)`);
    DebugLogger.debug('DungeonGenerator', `Odd tiles: ${oddFloorBeforeMazes} floor before mazes, ${oddFloorAfterMazes} after mazes (${oddCarvedByMazes} carved by mazes)`);
  }

  private growMaze(startX: number, startY: number): void {
    const cells: {x: number, y: number}[] = [];
    let lastDir: 'n' | 's' | 'e' | 'w' | null = null;
    let tilesCarved = 0;
    let oddTilesCarved = 0;

    this.carveTile(startX, startY);
    cells.push({x: startX, y: startY});
    tilesCarved++;
    oddTilesCarved++;

    while (cells.length > 0) {
      const cell = cells[cells.length - 1];

      const unmadeNeighbors = this.getUnmadeNeighbors(cell.x, cell.y);

      if (unmadeNeighbors.length === 0) {
        cells.pop();
        lastDir = null;
        continue;
      }

      let dir: 'n' | 's' | 'e' | 'w';
      const windingPercent = GAME_CONFIG.DUNGEON.ROOMS_AND_MAZES.WINDING_PERCENT;
      if (lastDir && unmadeNeighbors.includes(lastDir) && this.rng.random() * 100 > windingPercent) {
        dir = lastDir;
      } else {
        dir = unmadeNeighbors[Math.floor(this.rng.random() * unmadeNeighbors.length)];
      }

      const dx = dir === 'e' ? 1 : (dir === 'w' ? -1 : 0);
      const dy = dir === 's' ? 1 : (dir === 'n' ? -1 : 0);

      const betweenX = cell.x + dx;
      const betweenY = cell.y + dy;
      const nextX = cell.x + dx * 2;
      const nextY = cell.y + dy * 2;

      this.carveTile(betweenX, betweenY);
      this.carveTile(nextX, nextY);
      tilesCarved += 2;
      oddTilesCarved++;

      cells.push({x: nextX, y: nextY});
      lastDir = dir;
    }

    DebugLogger.debug('DungeonGenerator', `  Maze at (${startX},${startY}): carved ${tilesCarved} total tiles, ${oddTilesCarved} odd tiles`);
  }

  private carveTile(x: number, y: number): void {
    this.tiles[y][x].type = 'floor';
    this.tiles[y][x].region = this.currentRegion;
  }

  private getUnmadeNeighbors(x: number, y: number): ('n' | 's' | 'e' | 'w')[] {
    const neighbors: ('n' | 's' | 'e' | 'w')[] = [];

    if (y >= 2 && this.tiles[y - 2][x].type === 'solid') neighbors.push('n');
    if (y < this.height - 2 && this.tiles[y + 2][x].type === 'solid') neighbors.push('s');
    if (x < this.width - 2 && this.tiles[y][x + 2].type === 'solid') neighbors.push('e');
    if (x >= 2 && this.tiles[y][x - 2].type === 'solid') neighbors.push('w');

    return neighbors;
  }

  private connectRegions(): void {
    const connectors = this.findAllConnectors();
    DebugLogger.debug('DungeonGenerator', `Found ${connectors.length} connectors`);

    const merged = new Map<number, number>();
    const openRegions = new Set<number>([0]);
    const openedConnectors: Connector[] = [];

    while (openRegions.size < this.currentRegion) {
      const candidates = connectors.filter(c => {
        const regions = Array.from(c.regions).map(r => this.getRoot(r, merged));
        return regions.some(r => openRegions.has(r)) &&
               regions.some(r => !openRegions.has(r));
      });

      if (candidates.length === 0) {
        DebugLogger.debug('DungeonGenerator', `No more connectors, connected ${openRegions.size}/${this.currentRegion} regions`);
        break;
      }

      const connector = candidates[Math.floor(this.rng.random() * candidates.length)];
      this.openConnector(connector);
      openedConnectors.push(connector);

      const regions = Array.from(connector.regions).map(r => this.getRoot(r, merged));
      const mainRegion = regions.find(r => openRegions.has(r)) || regions[0];

      for (const region of regions) {
        if (region !== mainRegion) {
          merged.set(region, mainRegion);
        }
        openRegions.add(region);
      }

      connectors.splice(connectors.indexOf(connector), 1);

      for (let i = connectors.length - 1; i >= 0; i--) {
        const c = connectors[i];
        const cRegions = Array.from(c.regions).map(r => this.getRoot(r, merged));
        if (new Set(cRegions).size < 2) {
          connectors.splice(i, 1);
        }
      }
    }

    DebugLogger.debug('DungeonGenerator', `Connected ${openRegions.size}/${this.currentRegion} regions with ${openedConnectors.length} connectors`);

    const extraConnectorChance = GAME_CONFIG.DUNGEON.ROOMS_AND_MAZES.EXTRA_CONNECTOR_CHANCE;
    let extraConnectors = 0;

    for (const connector of connectors) {
      if (this.rng.random() * 100 < extraConnectorChance) {
        this.openConnector(connector);
        extraConnectors++;
      }
    }

    DebugLogger.debug('DungeonGenerator', `Added ${extraConnectors} extra connectors for loops (${extraConnectorChance}% chance)`);
  }

  private openConnector(connector: Connector): void {
    this.tiles[connector.y][connector.x].type = 'floor';
    this.doorConnectors.add(`${connector.x},${connector.y}`);
  }

  private findAllConnectors(): Connector[] {
    const connectors: Connector[] = [];

    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        if (this.tiles[y][x].type !== 'solid') continue;

        const regions = new Set<number>();

        if (this.tiles[y - 1][x].type === 'floor' && this.tiles[y - 1][x].region !== undefined) {
          regions.add(this.tiles[y - 1][x].region!);
        }
        if (this.tiles[y + 1][x].type === 'floor' && this.tiles[y + 1][x].region !== undefined) {
          regions.add(this.tiles[y + 1][x].region!);
        }
        if (this.tiles[y][x - 1].type === 'floor' && this.tiles[y][x - 1].region !== undefined) {
          regions.add(this.tiles[y][x - 1].region!);
        }
        if (this.tiles[y][x + 1].type === 'floor' && this.tiles[y][x + 1].region !== undefined) {
          regions.add(this.tiles[y][x + 1].region!);
        }

        if (regions.size >= 2) {
          connectors.push({x, y, regions});
        }
      }
    }

    return connectors;
  }

  private getRoot(region: number, merged: Map<number, number>): number {
    if (!merged.has(region)) return region;
    const parent = merged.get(region)!;
    const root = this.getRoot(parent, merged);
    merged.set(region, root);
    return root;
  }

  private removeDeadEnds(): void {
    const oddBefore = this.countOddFloorTiles();
    let removed = 0;
    let done = false;

    while (!done) {
      done = true;

      for (let y = 1; y < this.height - 1; y++) {
        for (let x = 1; x < this.width - 1; x++) {
          if (this.tiles[y][x].type !== 'floor') continue;

          let exits = 0;
          if (this.tiles[y - 1][x].type === 'floor') exits++;
          if (this.tiles[y + 1][x].type === 'floor') exits++;
          if (this.tiles[y][x - 1].type === 'floor') exits++;
          if (this.tiles[y][x + 1].type === 'floor') exits++;

          if (exits === 1) {
            this.tiles[y][x].type = 'solid';
            done = false;
            removed++;
          }
        }
      }
    }

    const oddAfter = this.countOddFloorTiles();
    const oddRemoved = oddBefore - oddAfter;
    DebugLogger.debug('DungeonGenerator', `Removed ${removed} total dead ends (${oddRemoved} odd tiles removed)`);
  }

  private updateWalls(): void {
    const enableDoors = GAME_CONFIG.DUNGEON.ENABLE_DOORS;
    const doorChance = GAME_CONFIG.DUNGEON.DOOR_CHANCE;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.tiles[y][x].type !== 'floor') continue;

        const northIsDoorConnector = y > 0 && this.doorConnectors.has(`${x},${y - 1}`);
        const southIsDoorConnector = y < this.height - 1 && this.doorConnectors.has(`${x},${y + 1}`);
        const westIsDoorConnector = x > 0 && this.doorConnectors.has(`${x - 1},${y}`);
        const eastIsDoorConnector = x < this.width - 1 && this.doorConnectors.has(`${x + 1},${y}`);

        this.tiles[y][x].northWall.exists = y === 0 || this.tiles[y - 1][x].type === 'solid';
        this.tiles[y][x].southWall.exists = y === this.height - 1 || this.tiles[y + 1][x].type === 'solid';
        this.tiles[y][x].westWall.exists = x === 0 || this.tiles[y][x - 1].type === 'solid';
        this.tiles[y][x].eastWall.exists = x === this.width - 1 || this.tiles[y][x + 1].type === 'solid';

        if (enableDoors) {
          if (northIsDoorConnector && this.rng.random() < doorChance) {
            this.placeDoorWall(this.tiles[y][x].northWall);
          }
          if (southIsDoorConnector && this.rng.random() < doorChance) {
            this.placeDoorWall(this.tiles[y][x].southWall);
          }
          if (westIsDoorConnector && this.rng.random() < doorChance) {
            this.placeDoorWall(this.tiles[y][x].westWall);
          }
          if (eastIsDoorConnector && this.rng.random() < doorChance) {
            this.placeDoorWall(this.tiles[y][x].eastWall);
          }
        }
      }
    }
  }

  private placeDoorWall(wall: Wall): void {
    wall.exists = true;
    wall.type = 'door';
    wall.properties = {
      locked: false,
      open: false,
      openMechanism: 'player',
      keyId: undefined,
      oneWay: undefined,
      hidden: false,
      discovered: true
    };
  }

  private placeStairs(): {up?: {x: number, y: number}, down?: {x: number, y: number}} {
    const floorTiles = this.getAllFloorTiles();

    if (floorTiles.length < 2) {
      return {};
    }

    const upTile = floorTiles[Math.floor(this.rng.random() * floorTiles.length)];
    upTile.special = {type: 'stairs_up'};

    const downTile = floorTiles[Math.floor(this.rng.random() * floorTiles.length)];
    downTile.special = {type: 'stairs_down'};

    return {
      up: {x: upTile.x, y: upTile.y},
      down: {x: downTile.x, y: downTile.y}
    };
  }

  private findStartPosition(): {x: number, y: number} {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.tiles[y][x];
        if (tile.type === 'floor' && tile.special?.type === 'stairs_up') {
          return {x: tile.x, y: tile.y};
        }
      }
    }

    const floorTiles = this.getAllFloorTiles();
    if (floorTiles.length === 0) {
      return {x: 1, y: 1};
    }
    return {x: floorTiles[0].x, y: floorTiles[0].y};
  }

  private getAllFloorTiles(): DungeonTile[] {
    const tiles: DungeonTile[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.tiles[y][x].type === 'floor') {
          tiles.push(this.tiles[y][x]);
        }
      }
    }
    return tiles;
  }

  private countOddFloorTiles(): number {
    let count = 0;
    for (let y = 1; y < this.height; y += 2) {
      for (let x = 1; x < this.width; x += 2) {
        if (this.tiles[y][x].type === 'floor') {
          count++;
        }
      }
    }
    return count;
  }
}
