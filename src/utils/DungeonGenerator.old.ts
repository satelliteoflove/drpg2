import { DungeonEvent, DungeonLevel, DungeonTile, OverrideZone, Wall, Room, Connector } from '../types/GameTypes';
import { GAME_CONFIG } from '../config/GameConstants';
import { SeededRandom } from './SeededRandom';

export class DungeonGenerator {
  private width: number;
  private height: number;
  private level: number;
  private rooms: Room[] = [];
  private rng: SeededRandom;
  private seedString: string;
  private currentRegion: number = 0;

  constructor(width: number = 20, height: number = 20, seed?: string) {
    this.width = width % 2 === 0 ? width + 1 : width;
    this.height = height % 2 === 0 ? height + 1 : height;
    this.level = 1;
    this.seedString = seed || SeededRandom.generateSeedString();
    this.rng = new SeededRandom(this.seedString);
  }

  public getSeed(): string {
    return this.seedString;
  }

  public generateLevel(level: number): DungeonLevel {
    this.level = level;
    this.currentRegion = 0;

    const tiles = this.initializeTiles();

    this.generateRooms(tiles);

    let totalOddTilesCarved = 0;
    let totalAllTilesCarved = 0;
    const oddFloorSample: string[] = [];
    for (let y = 1; y < this.height; y += 2) {
      for (let x = 1; x < this.width; x += 2) {
        if (tiles[y][x].type === 'floor') {
          totalOddTilesCarved++;
          if (oddFloorSample.length < 5) {
            oddFloorSample.push(`(${x},${y}):r${tiles[y][x].region}`);
          }
        }
      }
    }
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (tiles[y][x].type === 'floor') {
          totalAllTilesCarved++;
        }
      }
    }
    console.log(`[DungeonGen] After rooms: ${this.rooms.length} rooms placed, ${totalOddTilesCarved}/100 odd tiles carved, ${totalAllTilesCarved}/400 total tiles carved, currentRegion = ${this.currentRegion}`);
    console.log(`[DungeonGen] Sample odd floor tiles: ${oddFloorSample.join(', ')}`);

    this.fillWithMazes(tiles);
    console.log(`[DungeonGen] After mazes: currentRegion = ${this.currentRegion}`);
    this.logRegionSample(tiles);

    this.connectRegions(tiles);

    this.removeDeadEnds(tiles);

    this.updateWalls(tiles);

    this.placeStairs(tiles);
    this.placeKeys(tiles);

    const overrideZones = this.generateOverrideZones(tiles);
    const events = this.generateEvents(tiles);
    const startPosition = this.findValidStartPosition(tiles);
    const stairsPositions = this.recordStairsPositions(tiles);

    return {
      level,
      width: this.width,
      height: this.height,
      tiles,
      overrideZones,
      events,
      startX: startPosition.x,
      startY: startPosition.y,
      stairsUp: stairsPositions.stairsUp,
      stairsDown: stairsPositions.stairsDown,
    };
  }

  private createWall(exists: boolean): Wall {
    return {
      exists,
      type: 'solid',
      properties: null
    };
  }

  private getOddPosition(min: number, max: number): number {
    let pos = min + Math.floor(this.rng.random() * (max - min));
    return pos % 2 === 0 ? pos + 1 : pos;
  }

  private generateOddRoomDimensions(roomType: 'large' | 'medium' | 'small'): {width: number, height: number} {
    let width: number, height: number;

    if (roomType === 'large') {
      width = 5;
      height = 5;
    } else if (roomType === 'medium') {
      width = 3 + Math.floor(this.rng.random() * 2) * 2;
      height = 3 + Math.floor(this.rng.random() * 2) * 2;
    } else {
      width = 3;
      height = 3;
    }

    return { width, height };
  }

  private directionToDelta(dir: 'north' | 'south' | 'east' | 'west'): [number, number] {
    switch (dir) {
      case 'north': return [0, -1];
      case 'south': return [0, 1];
      case 'east': return [1, 0];
      case 'west': return [-1, 0];
    }
  }

  private initializeTiles(): DungeonTile[][] {
    const tiles: DungeonTile[][] = [];

    for (let y = 0; y < this.height; y++) {
      tiles[y] = [];
      for (let x = 0; x < this.width; x++) {
        tiles[y][x] = {
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
        };
      }
    }

    return tiles;
  }

  private generateRooms(tiles: DungeonTile[][]): void {
    this.rooms = [];

    const largeCount = GAME_CONFIG.DUNGEON.ROOM_GENERATION.LARGE.min +
      Math.floor(this.rng.random() * (GAME_CONFIG.DUNGEON.ROOM_GENERATION.LARGE.max - GAME_CONFIG.DUNGEON.ROOM_GENERATION.LARGE.min + 1));
    const mediumCount = GAME_CONFIG.DUNGEON.ROOM_GENERATION.MEDIUM.min +
      Math.floor(this.rng.random() * (GAME_CONFIG.DUNGEON.ROOM_GENERATION.MEDIUM.max - GAME_CONFIG.DUNGEON.ROOM_GENERATION.MEDIUM.min + 1));
    const smallCount = GAME_CONFIG.DUNGEON.ROOM_GENERATION.SMALL.min +
      Math.floor(this.rng.random() * (GAME_CONFIG.DUNGEON.ROOM_GENERATION.SMALL.max - GAME_CONFIG.DUNGEON.ROOM_GENERATION.SMALL.min + 1));

    console.log(`[DungeonGen] Attempting to place ${largeCount} large, ${mediumCount} medium, ${smallCount} small rooms (total: ${largeCount + mediumCount + smallCount})`);

    for (let i = 0; i < largeCount; i++) {
      const room = this.placeRoomStrategically('large');
      if (room) {
        this.rooms.push(room);
        this.carveRoom(room, tiles);
      }
    }

    for (let i = 0; i < mediumCount; i++) {
      const room = this.placeRoomStrategically('medium');
      if (room) {
        this.rooms.push(room);
        this.carveRoom(room, tiles);
      }
    }

    for (let i = 0; i < smallCount; i++) {
      const room = this.placeRoomStrategically('small');
      if (room) {
        this.rooms.push(room);
        this.carveRoom(room, tiles);
      }
    }
  }


  private placeRoomStrategically(roomType: 'large' | 'medium' | 'small'): Room | null {
    const dimensions = this.generateOddRoomDimensions(roomType);
    const width = dimensions.width;
    const height = dimensions.height;

    const strategicPositions = this.getStrategicPositions(roomType, width, height);

    for (const pos of strategicPositions) {
      const oddX = pos.x % 2 === 0 ? pos.x + 1 : pos.x;
      const oddY = pos.y % 2 === 0 ? pos.y + 1 : pos.y;

      const room: Room = {
        id: `${roomType}_${this.rooms.length}`,
        x: oddX,
        y: oddY,
        width,
        height,
        type: roomType,
        doors: [],
        specialTiles: []
      };

      if (!this.checkRoomOverlap(room)) {
        return room;
      }
    }

    for (let attempt = 0; attempt < GAME_CONFIG.DUNGEON.ROOMS_AND_MAZES.ROOM_ATTEMPTS; attempt++) {
      const x = this.getOddPosition(1, this.width - width - 1);
      const y = this.getOddPosition(1, this.height - height - 1);

      const room: Room = {
        id: `${roomType}_${this.rooms.length}`,
        x,
        y,
        width,
        height,
        type: roomType,
        doors: [],
        specialTiles: []
      };

      if (!this.checkRoomOverlap(room)) {
        return room;
      }
    }

    return null;
  }

  private getStrategicPositions(roomType: 'large' | 'medium' | 'small', width: number, height: number): {x: number, y: number}[] {
    const positions: {x: number, y: number}[] = [];

    if (roomType === 'large') {
      positions.push({ x: 1, y: 1 });
      positions.push({ x: this.width - width - 1, y: 1 });
      positions.push({ x: 1, y: this.height - height - 1 });
      positions.push({ x: this.width - width - 1, y: this.height - height - 1 });
      positions.push({ x: Math.floor((this.width - width) / 2), y: Math.floor((this.height - height) / 2) });
    } else if (roomType === 'medium') {
      positions.push({ x: Math.floor((this.width - width) / 2), y: 1 });
      positions.push({ x: Math.floor((this.width - width) / 2), y: this.height - height - 1 });
      positions.push({ x: 1, y: Math.floor((this.height - height) / 2) });
      positions.push({ x: this.width - width - 1, y: Math.floor((this.height - height) / 2) });
      positions.push({ x: Math.floor((this.width - width) / 4), y: Math.floor((this.height - height) / 4) });
      positions.push({ x: Math.floor(3 * (this.width - width) / 4), y: Math.floor((this.height - height) / 4) });
      positions.push({ x: Math.floor((this.width - width) / 4), y: Math.floor(3 * (this.height - height) / 4) });
      positions.push({ x: Math.floor(3 * (this.width - width) / 4), y: Math.floor(3 * (this.height - height) / 4) });
    } else {
      for (let y = 2; y < this.height - height - 2; y += 4) {
        for (let x = 2; x < this.width - width - 2; x += 4) {
          positions.push({ x, y });
        }
      }
    }

    return positions;
  }

  private checkRoomOverlap(newRoom: Room): boolean {
    if (newRoom.x < 1 || newRoom.x + newRoom.width >= this.width) return true;
    if (newRoom.y < 1 || newRoom.y + newRoom.height >= this.height) return true;

    const spacing = 1;

    for (const room of this.rooms) {
      if (
        newRoom.x < room.x + room.width + spacing &&
        newRoom.x + newRoom.width + spacing > room.x &&
        newRoom.y < room.y + room.height + spacing &&
        newRoom.y + newRoom.height + spacing > room.y
      ) {
        return true;
      }
    }

    return false;
  }

  private carveRoom(room: Room, tiles: DungeonTile[][]): void {
    let totalTiles = 0;
    let oddTiles = 0;

    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        if (tiles[y] && tiles[y][x]) {
          tiles[y][x].type = 'floor';
          tiles[y][x].region = this.currentRegion;
          totalTiles++;
          if (x % 2 === 1 && y % 2 === 1) {
            oddTiles++;
          }
        }
      }
    }

    console.log(`[DungeonGen] Carved ${room.type} room at (${room.x},${room.y}) size ${room.width}x${room.height}: ${totalTiles} total tiles, ${oddTiles} odd tiles`);
    this.currentRegion++;
  }

  private fillWithMazes(tiles: DungeonTile[][]): void {
    let solidCount = 0;
    let floorCount = 0;
    let mazeCount = 0;
    const floorPositions: string[] = [];

    for (let y = 1; y < this.height; y += 2) {
      for (let x = 1; x < this.width; x += 2) {
        if (tiles[y][x].type === 'solid') {
          solidCount++;
          this.growMaze(x, y, tiles);
          this.currentRegion++;
          mazeCount++;
        } else {
          floorCount++;
          if (floorCount <= 10) {
            floorPositions.push(`(${x},${y}):region${tiles[y][x].region}`);
          }
        }
      }
    }

    console.log(`[DungeonGen] fillWithMazes: checked ${solidCount + floorCount} odd tiles, found ${solidCount} solid, ${floorCount} already floor, generated ${mazeCount} mazes`);
    console.log(`[DungeonGen] First 10 floor tiles: ${floorPositions.join(', ')}`);
  }

  private growMaze(startX: number, startY: number, tiles: DungeonTile[][]): void {
    const cells: {x: number, y: number}[] = [];
    let lastDir: 'north' | 'south' | 'east' | 'west' | undefined;

    this.carveCell(startX, startY, tiles);
    cells.push({x: startX, y: startY});

    while (cells.length > 0) {
      const cell = cells[cells.length - 1];
      const unmade = this.getUnmadeNeighbors(cell.x, cell.y, tiles);

      if (unmade.length === 0) {
        cells.pop();
        lastDir = undefined;
        continue;
      }

      let dir: 'north' | 'south' | 'east' | 'west';
      if (lastDir && unmade.includes(lastDir) &&
          this.rng.random() * 100 < GAME_CONFIG.DUNGEON.ROOMS_AND_MAZES.WINDING_PERCENT) {
        dir = lastDir;
      } else {
        dir = unmade[Math.floor(this.rng.random() * unmade.length)];
      }

      const [dx, dy] = this.directionToDelta(dir);
      const nx = cell.x + dx;
      const ny = cell.y + dy;
      const nx2 = nx + dx;
      const ny2 = ny + dy;

      this.carveCell(nx, ny, tiles);
      this.carveCell(nx2, ny2, tiles);

      cells.push({x: nx2, y: ny2});
      lastDir = dir;
    }
  }

  private carveCell(x: number, y: number, tiles: DungeonTile[][]): void {
    tiles[y][x].type = 'floor';
    tiles[y][x].region = this.currentRegion;
  }

  private getUnmadeNeighbors(x: number, y: number, tiles: DungeonTile[][]): ('north' | 'south' | 'east' | 'west')[] {
    const dirs: ('north' | 'south' | 'east' | 'west')[] = [];

    if (this.isInBounds(x, y - 2) && tiles[y - 2][x].type === 'solid') dirs.push('north');
    if (this.isInBounds(x, y + 2) && tiles[y + 2][x].type === 'solid') dirs.push('south');
    if (this.isInBounds(x - 2, y) && tiles[y][x - 2].type === 'solid') dirs.push('west');
    if (this.isInBounds(x + 2, y) && tiles[y][x + 2].type === 'solid') dirs.push('east');

    return dirs;
  }

  private isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  private findConnectors(tiles: DungeonTile[][]): Map<string, Connector> {
    const connectorMap = new Map<string, Connector>();

    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        if (tiles[y][x].type !== 'solid') continue;

        const regions = new Set<number>();

        if (tiles[y - 1][x].type === 'floor' && tiles[y - 1][x].region !== undefined) {
          regions.add(tiles[y - 1][x].region!);
        }
        if (tiles[y + 1][x].type === 'floor' && tiles[y + 1][x].region !== undefined) {
          regions.add(tiles[y + 1][x].region!);
        }
        if (tiles[y][x - 1].type === 'floor' && tiles[y][x - 1].region !== undefined) {
          regions.add(tiles[y][x - 1].region!);
        }
        if (tiles[y][x + 1].type === 'floor' && tiles[y][x + 1].region !== undefined) {
          regions.add(tiles[y][x + 1].region!);
        }

        if (regions.size >= 2) {
          connectorMap.set(`${x},${y}`, {x, y, regions});
        }
      }
    }

    console.log(`[DungeonGen] Found ${connectorMap.size} connectors`);
    if (connectorMap.size > 0) {
      const samples = Array.from(connectorMap.values()).slice(0, 3);
      samples.forEach(c => {
        console.log(`  Connector at (${c.x},${c.y}) connects regions: ${Array.from(c.regions).join(',')}`);
      });
    }

    return connectorMap;
  }

  private connectRegions(tiles: DungeonTile[][]): void {
    const connectorMap = this.findConnectors(tiles);
    const merged = new Map<number, number>();
    const openRegions = new Set<number>();

    openRegions.add(0);
    console.log(`[DungeonGen] connectRegions: Starting with ${this.currentRegion} total regions`);

    let iteration = 0;
    while (openRegions.size < this.currentRegion) {
      iteration++;
      const candidates: Connector[] = [];

      for (const connector of connectorMap.values()) {
        const hasOpen = Array.from(connector.regions).some(r =>
          this.getEffectiveRegion(r, merged) === 0 || openRegions.has(this.getEffectiveRegion(r, merged))
        );
        const hasClosed = Array.from(connector.regions).some(r =>
          !openRegions.has(this.getEffectiveRegion(r, merged))
        );

        if (hasOpen && hasClosed) {
          candidates.push(connector);
        }
      }

      console.log(`[DungeonGen] Iteration ${iteration}: openRegions=${openRegions.size}, candidates=${candidates.length}`);

      if (candidates.length === 0) {
        console.log(`[DungeonGen] WARNING: No candidates found! Regions not fully connected.`);
        console.log(`[DungeonGen] openRegions: ${Array.from(openRegions).join(',')}`);
        console.log(`[DungeonGen] Remaining connectors: ${connectorMap.size}`);
        break;
      }

      const connector = candidates[Math.floor(this.rng.random() * candidates.length)];
      console.log(`[DungeonGen] Carving connector at (${connector.x},${connector.y}) connecting ${Array.from(connector.regions).join(',')}`);

      this.carveJunction(connector, tiles);

      const regionsList = Array.from(connector.regions);

      let destRegion: number | null = null;
      for (const region of regionsList) {
        const effRegion = this.getEffectiveRegion(region, merged);
        if (effRegion === 0 || openRegions.has(effRegion)) {
          destRegion = effRegion;
          break;
        }
      }

      if (destRegion === null) {
        destRegion = this.getEffectiveRegion(regionsList[0], merged);
      }

      for (const region of regionsList) {
        const effRegion = this.getEffectiveRegion(region, merged);
        if (effRegion !== destRegion) {
          merged.set(effRegion, destRegion);
        }
        openRegions.add(effRegion);
      }

      openRegions.add(destRegion);

      this.removeRedundantConnectors(connectorMap, merged, tiles);
    }

    console.log(`[DungeonGen] connectRegions: Finished. Connected ${openRegions.size}/${this.currentRegion} regions`);
  }

  private getEffectiveRegion(region: number, merged: Map<number, number>): number {
    let current = region;
    while (merged.has(current)) {
      current = merged.get(current)!;
    }
    return current;
  }

  private carveJunction(connector: Connector, tiles: DungeonTile[][]): void {
    tiles[connector.y][connector.x].type = 'floor';
    tiles[connector.y][connector.x].region = Array.from(connector.regions)[0];
  }

  private removeRedundantConnectors(connectorMap: Map<string, Connector>, merged: Map<number, number>, tiles: DungeonTile[][]): void {
    for (const [key, connector] of connectorMap.entries()) {
      const effectiveRegions = new Set(
        Array.from(connector.regions).map(r => this.getEffectiveRegion(r, merged))
      );

      if (effectiveRegions.size <= 1) {
        if (this.rng.random() < (1 / GAME_CONFIG.DUNGEON.ROOMS_AND_MAZES.EXTRA_CONNECTOR_CHANCE)) {
          this.carveJunction(connector, tiles);
        }
        connectorMap.delete(key);
      }
    }
  }

  private removeDeadEnds(tiles: DungeonTile[][]): void {
    if (!GAME_CONFIG.DUNGEON.ROOMS_AND_MAZES.REMOVE_DEAD_ENDS) return;

    let done = false;

    while (!done) {
      done = true;

      for (let y = 1; y < this.height - 1; y++) {
        for (let x = 1; x < this.width - 1; x++) {
          if (tiles[y][x].type !== 'floor') continue;

          const exits = this.countExits(x, y, tiles);

          if (exits === 1) {
            tiles[y][x].type = 'solid';
            tiles[y][x].region = undefined;
            done = false;
          }
        }
      }
    }
  }

  private countExits(x: number, y: number, tiles: DungeonTile[][]): number {
    let count = 0;
    if (tiles[y - 1][x].type === 'floor') count++;
    if (tiles[y + 1][x].type === 'floor') count++;
    if (tiles[y][x - 1].type === 'floor') count++;
    if (tiles[y][x + 1].type === 'floor') count++;
    return count;
  }

  private updateWalls(tiles: DungeonTile[][]): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = tiles[y][x];

        const hasNorthWall = y === 0 || tiles[y - 1][x].type === 'solid';
        const hasSouthWall = y === this.height - 1 || tiles[y + 1][x].type === 'solid';
        const hasWestWall = x === 0 || tiles[y][x - 1].type === 'solid';
        const hasEastWall = x === this.width - 1 || tiles[y][x + 1].type === 'solid';

        tile.northWall = this.createWall(hasNorthWall);
        tile.southWall = this.createWall(hasSouthWall);
        tile.westWall = this.createWall(hasWestWall);
        tile.eastWall = this.createWall(hasEastWall);
      }
    }
  }


  private placeStairs(tiles: DungeonTile[][]): void {
    if (this.rooms.length === 0) {
      return;
    }

    if (this.level === 1) {
      const centerNorthRooms = this.findCenterNorthRooms();
      const targetRooms = centerNorthRooms.length > 0 ? centerNorthRooms : this.rooms.filter(r => r.type !== 'small');

      if (targetRooms.length > 0) {
        const downRoom = targetRooms[Math.floor(this.rng.random() * targetRooms.length)];
        const downTile = this.getTileInRoom(downRoom, tiles);
        if (downTile) {
          const requiredKeys = this.generateRequiredKeys();
          downTile.special = {
            type: 'stairs_down',
            properties: {
              locked: true,
              requiredKeyIds: requiredKeys,
            }
          };
        }

        const upRooms = this.rooms.filter(r => r !== downRoom && r.type !== 'small');
        if (upRooms.length > 0) {
          const upRoom = upRooms[Math.floor(this.rng.random() * upRooms.length)];
          const upTile = this.getTileInRoom(upRoom, tiles);
          if (upTile) {
            upTile.special = { type: 'stairs_up' };
          }
        }
      }
    } else {
      const nonSmallRooms = this.rooms.filter(r => r.type !== 'small');
      const targetRooms = nonSmallRooms.length > 0 ? nonSmallRooms : this.rooms;

      if (targetRooms.length >= 2) {
        const upRoom = targetRooms[Math.floor(this.rng.random() * targetRooms.length)];
        const upTile = this.getTileInRoom(upRoom, tiles);
        if (upTile) {
          upTile.special = { type: 'stairs_up' };
        }

        const downRooms = targetRooms.filter(r => r !== upRoom);
        const sortedByDistance = downRooms.sort((a, b) => {
          const distA = this.getDistanceFromPoint(a, upRoom.x, upRoom.y);
          const distB = this.getDistanceFromPoint(b, upRoom.x, upRoom.y);
          return distB - distA;
        });

        if (sortedByDistance.length > 0) {
          const candidateRooms = sortedByDistance.slice(0, Math.max(1, Math.floor(sortedByDistance.length / 3)));
          const downRoom = candidateRooms[Math.floor(this.rng.random() * candidateRooms.length)];
          const downTile = this.getTileInRoom(downRoom, tiles);
          if (downTile) {
            const requiredKeys = this.generateRequiredKeys();
            downTile.special = {
              type: 'stairs_down',
              properties: {
                locked: true,
                requiredKeyIds: requiredKeys,
              }
            };
          }
        }
      }
    }
  }

  private generateRequiredKeys(): string[] {
    const keys: string[] = [];
    let keyCount: number;

    if (this.level <= 3) {
      keyCount = GAME_CONFIG.DUNGEON.DOOR_SYSTEM.KEYS_PER_FLOOR_EARLY;
    } else if (this.level <= 6) {
      keyCount = GAME_CONFIG.DUNGEON.DOOR_SYSTEM.KEYS_PER_FLOOR_MID;
    } else {
      const min = GAME_CONFIG.DUNGEON.DOOR_SYSTEM.KEYS_PER_FLOOR_DEEP.min;
      const max = GAME_CONFIG.DUNGEON.DOOR_SYSTEM.KEYS_PER_FLOOR_DEEP.max;
      keyCount = min + Math.floor(this.rng.random() * (max - min + 1));
    }

    const keyTypes = ['bronze_key', 'silver_key', 'gold_key'];
    const selectedType = keyTypes[Math.min(Math.floor(this.level / 3), keyTypes.length - 1)];

    for (let i = 0; i < keyCount; i++) {
      keys.push(`${selectedType}_${this.level}_${i}`);
    }

    return keys;
  }

  private placeKeys(tiles: DungeonTile[][]): void {
    const stairsDown = this.findTileWithSpecialType(tiles, 'stairs_down');
    if (!stairsDown || !stairsDown.special?.properties?.requiredKeyIds) {
      return;
    }

    const requiredKeyIds = stairsDown.special.properties.requiredKeyIds;
    const minSpacing = 8;

    const availableRooms = this.rooms.filter(r => !this.hasTileWithSpecial(r, tiles));
    const placedKeyPositions: {x: number, y: number}[] = [];

    for (const keyId of requiredKeyIds) {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 50;

      while (!placed && attempts < maxAttempts) {
        attempts++;
        const room = availableRooms[Math.floor(this.rng.random() * availableRooms.length)];
        const tile = this.getTileInRoom(room, tiles);

        if (!tile || tile.special) continue;

        let validPosition = true;
        for (const pos of placedKeyPositions) {
          const distance = Math.abs(tile.x - pos.x) + Math.abs(tile.y - pos.y);
          if (distance < minSpacing) {
            validPosition = false;
            break;
          }
        }

        if (validPosition) {
          const keyType = keyId.split('_')[0] + '_' + keyId.split('_')[1];
          tile.hasItem = true;
          tile.special = {
            type: 'treasure',
            properties: {
              opened: false,
              gold: 0,
              items: [{
                id: keyId,
                name: this.getKeyName(keyType),
                unidentifiedName: this.getKeyName(keyType),
                description: `A key for floor ${this.level}.`,
                type: 'consumable',
                value: 0,
                weight: 0.1,
                identified: true,
                cursed: false,
                blessed: false,
                enchantment: 0,
                equipped: false,
                quantity: 1,
                charges: 1,
                maxCharges: 1,
                effects: [],
              }],
            }
          };
          placedKeyPositions.push({x: tile.x, y: tile.y});
          placed = true;
        }
      }
    }
  }

  private findTileWithSpecialType(tiles: DungeonTile[][], type: string): DungeonTile | null {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (tiles[y][x].special?.type === type) {
          return tiles[y][x];
        }
      }
    }
    return null;
  }

  private getKeyName(keyType: string): string {
    if (keyType.includes('bronze')) return 'Bronze Key';
    if (keyType.includes('silver')) return 'Silver Key';
    if (keyType.includes('gold')) return 'Gold Key';
    return 'Key';
  }

  private hasTileWithSpecial(room: Room, tiles: DungeonTile[][]): boolean {
    for (let dy = 0; dy < room.height; dy++) {
      for (let dx = 0; dx < room.width; dx++) {
        const x = room.x + dx;
        const y = room.y + dy;
        if (tiles[y] && tiles[y][x] && tiles[y][x].special) {
          return true;
        }
      }
    }
    return false;
  }

  private recordStairsPositions(tiles: DungeonTile[][]): {
    stairsUp?: { x: number; y: number };
    stairsDown?: { x: number; y: number };
  } {
    let stairsUp: { x: number; y: number } | undefined;
    let stairsDown: { x: number; y: number } | undefined;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (tiles[y][x].special?.type === 'stairs_up') {
          stairsUp = { x, y };
        }
        if (tiles[y][x].special?.type === 'stairs_down') {
          stairsDown = { x, y };
        }
      }
    }

    return { stairsUp, stairsDown };
  }


  private getFloorTiles(tiles: DungeonTile[][]): DungeonTile[] {
    const floorTiles: DungeonTile[] = [];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (tiles[y][x].type === 'floor') {
          floorTiles.push(tiles[y][x]);
        }
      }
    }

    return floorTiles;
  }

  private generateOverrideZones(tiles: DungeonTile[][]): OverrideZone[] {
    const zones: OverrideZone[] = [];

    // Generate safe zone around starting position (if enabled)
    if (GAME_CONFIG.ENCOUNTER.ZONE_GENERATION.ENABLE_SAFE_ZONES) {
      const startPos = this.findValidStartPosition(tiles);
      zones.push({
        x1: Math.max(0, startPos.x - 2),
        y1: Math.max(0, startPos.y - 2),
        x2: Math.min(this.width - 1, startPos.x + 2),
        y2: Math.min(this.height - 1, startPos.y + 2),
        type: 'safe',
        data: { description: 'Starting area - safe from encounters' },
      });
    }

    // Generate boss zones in largest rooms (if enabled)
    if (GAME_CONFIG.ENCOUNTER.ZONE_GENERATION.ENABLE_BOSS_ZONES) {
      const largeRooms = this.rooms.filter((room) => room.width * room.height >= 16);
      for (const room of largeRooms.slice(0, 2)) {
        zones.push({
          x1: room.x,
          y1: room.y,
          x2: room.x + room.width - 1,
          y2: room.y + room.height - 1,
          type: 'boss',
          data: {
            bossType: 'floor_guardian',
            encounterRate: 1.0,
            monsterGroups: [`boss_level_${this.level}`],
            description: 'Guardian chamber',
          },
        });
      }
    }

    // Generate special mob zones based on level theme (if enabled)
    if (GAME_CONFIG.ENCOUNTER.ZONE_GENERATION.ENABLE_SPECIAL_MOB_ZONES) {
      const numSpecialZones = 1 + Math.floor(this.rng.random() * 2);
      for (let i = 0; i < numSpecialZones; i++) {
        const room = this.rooms[Math.floor(this.rng.random() * this.rooms.length)];
        if (room) {
          zones.push({
            x1: room.x,
            y1: room.y,
            x2: room.x + room.width - 1,
            y2: room.y + room.height - 1,
            type: 'special_mobs',
            data: {
              monsterGroups: this.getSpecialMonsterGroupsForLevel(),
              encounterRate: 0.15,
              description: `Lair of ${this.getSpecialMonsterGroupsForLevel()[0]}s`,
            },
          });
        }
      }
    }

    // Generate high frequency zones in corridors (if enabled)
    if (GAME_CONFIG.ENCOUNTER.ZONE_GENERATION.ENABLE_HIGH_FREQUENCY_ZONES) {
      const numHighFreq = 2 + Math.floor(this.rng.random() * 2);
      for (let i = 0; i < numHighFreq; i++) {
        const x1 = Math.floor(this.rng.random() * (this.width - 4));
        const y1 = Math.floor(this.rng.random() * (this.height - 4));
        const x2 = x1 + 2 + Math.floor(this.rng.random() * 3);
        const y2 = y1 + 2 + Math.floor(this.rng.random() * 3);

        zones.push({
          x1,
          y1,
          x2: Math.min(x2, this.width - 1),
          y2: Math.min(y2, this.height - 1),
          type: 'high_frequency',
          data: {
            encounterRate: 0.08,
            description: 'Dangerous corridor - high monster activity',
          },
        });
      }
    }

    return zones;
  }

  private getSpecialMonsterGroupsForLevel(): string[] {
    const specialMonsters = [
      ['giant_spider', 'dire_wolf', 'owlbear'],
      ['shadow', 'wraith', 'banshee'],
      ['troll_shaman', 'stone_giant', 'chimera'],
      ['dragon_wyrmling', 'lich', 'demon_lord'],
      ['ancient_dragon', 'pit_fiend', 'solar'],
    ];

    const levelIndex = Math.min(this.level - 1, specialMonsters.length - 1);
    return specialMonsters[levelIndex];
  }

  private generateEvents(tiles: DungeonTile[][]): DungeonEvent[] {
    const events: DungeonEvent[] = [];
    const eventTiles = [];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (tiles[y][x].special?.type === 'event') {
          eventTiles.push({ x, y });
        }
      }
    }

    for (const tile of eventTiles) {
      const eventType = this.getRandomEventType();
      events.push({
        x: tile.x,
        y: tile.y,
        type: eventType,
        data: this.getEventData(eventType),
        triggered: false,
      });
    }

    return events;
  }

  private getRandomEventType():
    | 'message'
    | 'trap'
    | 'treasure'
    | 'teleport'
    | 'spinner'
    | 'darkness' {
    const types: ('message' | 'trap' | 'treasure' | 'teleport' | 'spinner' | 'darkness')[] = [
      'message',
      'trap',
      'treasure',
      'teleport',
      'spinner',
      'darkness',
    ];
    return types[Math.floor(this.rng.random() * types.length)];
  }

  private getEventData(type: string): any {
    switch (type) {
      case 'message':
        return { text: 'You sense an ancient presence here...' };
      case 'trap':
        return { damage: 5 + this.level * 2 };
      case 'treasure':
        return { gold: 50 + this.level * 20 };
      case 'teleport':
        return {
          x: Math.floor(this.rng.random() * this.width),
          y: Math.floor(this.rng.random() * this.height),
        };
      case 'spinner':
        return { rotations: 1 + Math.floor(this.rng.random() * 3) };
      case 'darkness':
        return { duration: 10 };
      default:
        return {};
    }
  }

  private findCenterNorthRooms(): Room[] {
    const centerX = this.width / 2;
    const northThreshold = this.height / 3;

    return this.rooms.filter(room => {
      const roomCenterX = room.x + room.width / 2;
      const roomCenterY = room.y + room.height / 2;

      const isInCenterHorizontally = Math.abs(roomCenterX - centerX) < this.width / 4;
      const isInNorthArea = roomCenterY < northThreshold;

      return isInCenterHorizontally && isInNorthArea;
    });
  }

  private getDistanceFromPoint(room: Room, x: number, y: number): number {
    const roomCenterX = room.x + room.width / 2;
    const roomCenterY = room.y + room.height / 2;
    return Math.abs(roomCenterX - x) + Math.abs(roomCenterY - y);
  }

  private getTileInRoom(room: Room, tiles: DungeonTile[][]): DungeonTile | null {
    const roomCenterX = room.x + Math.floor(room.width / 2);
    const roomCenterY = room.y + Math.floor(room.height / 2);

    if (tiles[roomCenterY] && tiles[roomCenterX] && tiles[roomCenterY][roomCenterX].type === 'floor') {
      return tiles[roomCenterY][roomCenterX];
    }

    for (let dy = 0; dy < room.height; dy++) {
      for (let dx = 0; dx < room.width; dx++) {
        const x = room.x + dx;
        const y = room.y + dy;
        if (tiles[y] && tiles[y][x] && tiles[y][x].type === 'floor') {
          return tiles[y][x];
        }
      }
    }

    return null;
  }

  private findValidStartPosition(tiles: DungeonTile[][]): { x: number; y: number } {
    if (this.level === 1) {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          if (tiles[y][x].special?.type === 'stairs_up') {
            return { x, y };
          }
        }
      }
    }

    // Other floors use existing logic
    if (this.rooms.length > 0) {
      const firstRoom = this.rooms[0];
      const centerX = firstRoom.x + Math.floor(firstRoom.width / 2);
      const centerY = firstRoom.y + Math.floor(firstRoom.height / 2);

      if (tiles[centerY] && tiles[centerY][centerX] && tiles[centerY][centerX].type === 'floor') {
        return { x: centerX, y: centerY };
      }
    }

    const floorTiles = this.getFloorTiles(tiles);
    if (floorTiles.length > 0) {
      const randomFloor = floorTiles[Math.floor(this.rng.random() * floorTiles.length)];
      return { x: randomFloor.x, y: randomFloor.y };
    }

    return { x: 1, y: 1 };
  }

  private logRegionSample(tiles: DungeonTile[][]): void {
    console.log('[DungeonGen] Region sample (first 5 floor tiles):');
    let count = 0;
    for (let y = 0; y < this.height && count < 5; y++) {
      for (let x = 0; x < this.width && count < 5; x++) {
        if (tiles[y][x].type === 'floor') {
          console.log(`  (${x},${y}): region=${tiles[y][x].region}`);
          count++;
        }
      }
    }
  }
}
