import { DungeonEvent, DungeonLevel, DungeonTile, OverrideZone, Wall, Room, Edge, Corridor } from '../types/GameTypes';
import { GAME_CONFIG } from '../config/GameConstants';
import { SeededRandom } from './SeededRandom';
import { PriorityQueue } from './PriorityQueue';
import { Pathfinding, Point } from './Pathfinding';

export class DungeonGenerator {
  private width: number;
  private height: number;
  private level: number;
  private rooms: Room[] = [];
  private corridors: Corridor[] = [];
  private rng: SeededRandom;
  private seedString: string;

  constructor(width: number = 20, height: number = 20, seed?: string) {
    this.width = width;
    this.height = height;
    this.level = 1;
    this.seedString = seed || SeededRandom.generateSeedString();
    this.rng = new SeededRandom(this.seedString);
  }

  public getSeed(): string {
    return this.seedString;
  }

  public generateLevel(level: number): DungeonLevel {
    this.level = level;
    const tiles = this.initializeTiles();
    this.generateRooms(tiles);
    this.generateCorridors(tiles);
    this.placeStairs(tiles);
    this.placeSpecialTiles(tiles);
    this.calculateWalls(tiles);

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

    const largeCount = 3 + Math.floor(this.rng.random() * 3);
    const mediumCount = 5 + Math.floor(this.rng.random() * 4);
    const smallCount = 8 + Math.floor(this.rng.random() * 5);

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
    const sizeRange = roomType === 'large' ? [6, 8] : roomType === 'medium' ? [4, 6] : [3, 4];
    const width = sizeRange[0] + Math.floor(this.rng.random() * (sizeRange[1] - sizeRange[0] + 1));
    const height = sizeRange[0] + Math.floor(this.rng.random() * (sizeRange[1] - sizeRange[0] + 1));

    const strategicPositions = this.getStrategicPositions(roomType, width, height);

    for (const pos of strategicPositions) {
      const room: Room = {
        id: `${roomType}_${this.rooms.length}`,
        x: pos.x,
        y: pos.y,
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

    for (let attempt = 0; attempt < 100; attempt++) {
      const x = 1 + Math.floor(this.rng.random() * (this.width - width - 2));
      const y = 1 + Math.floor(this.rng.random() * (this.height - height - 2));

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

  private getStrategicPositions(roomType: 'large' | 'medium' | 'small', width: number, height: number): Point[] {
    const positions: Point[] = [];

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
    const minSpacing = 2;

    if (newRoom.x < 1 || newRoom.x + newRoom.width >= this.width - 1) return true;
    if (newRoom.y < 1 || newRoom.y + newRoom.height >= this.height - 1) return true;

    for (const room of this.rooms) {
      if (
        newRoom.x < room.x + room.width + minSpacing &&
        newRoom.x + newRoom.width + minSpacing > room.x &&
        newRoom.y < room.y + room.height + minSpacing &&
        newRoom.y + newRoom.height + minSpacing > room.y
      ) {
        return true;
      }
    }

    return false;
  }

  private carveRoom(room: Room, tiles: DungeonTile[][]): void {
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        if (tiles[y] && tiles[y][x]) {
          tiles[y][x].type = 'floor';
          tiles[y][x].northWall = this.createWall(false);
          tiles[y][x].southWall = this.createWall(false);
          tiles[y][x].eastWall = this.createWall(false);
          tiles[y][x].westWall = this.createWall(false);
        }
      }
    }
  }

  private generateCorridors(tiles: DungeonTile[][]): void {
    if (this.rooms.length < 2) return;

    this.corridors = [];

    const mstEdges = this.buildMinimumSpanningTree();
    const extraEdges = this.addExtraConnections(mstEdges, 0.25);
    const allEdges = [...mstEdges, ...extraEdges];

    for (let i = 0; i < allEdges.length; i++) {
      const edge = allEdges[i];
      this.carveCorridorBetweenRooms(edge.from, edge.to, tiles, i);
    }
  }

  private buildMinimumSpanningTree(): Edge[] {
    if (this.rooms.length === 0) return [];

    const pq = new PriorityQueue<Edge>();
    const visited = new Set<string>();
    const edges: Edge[] = [];

    visited.add(this.rooms[0].id);

    for (let i = 1; i < this.rooms.length; i++) {
      const distance = this.calculateDistance(this.rooms[0], this.rooms[i]);
      pq.insert({ from: this.rooms[0], to: this.rooms[i], distance }, distance);
    }

    while (!pq.isEmpty() && visited.size < this.rooms.length) {
      const edge = pq.extractMin();
      if (!edge) break;

      if (visited.has(edge.to.id)) continue;

      edges.push(edge);
      visited.add(edge.to.id);

      for (const room of this.rooms) {
        if (!visited.has(room.id)) {
          const distance = this.calculateDistance(edge.to, room);
          pq.insert({ from: edge.to, to: room, distance }, distance);
        }
      }
    }

    return edges;
  }

  private calculateDistance(roomA: Room, roomB: Room): number {
    const centerAx = roomA.x + Math.floor(roomA.width / 2);
    const centerAy = roomA.y + Math.floor(roomA.height / 2);
    const centerBx = roomB.x + Math.floor(roomB.width / 2);
    const centerBy = roomB.y + Math.floor(roomB.height / 2);

    return Math.abs(centerAx - centerBx) + Math.abs(centerAy - centerBy);
  }

  private addExtraConnections(mstEdges: Edge[], percentage: number): Edge[] {
    const extraEdges: Edge[] = [];
    const existingConnections = new Set<string>();

    for (const edge of mstEdges) {
      existingConnections.add(this.roomPairKey(edge.from, edge.to));
    }

    const allPossibleEdges: Edge[] = [];
    for (let i = 0; i < this.rooms.length; i++) {
      for (let j = i + 1; j < this.rooms.length; j++) {
        const key = this.roomPairKey(this.rooms[i], this.rooms[j]);
        if (!existingConnections.has(key)) {
          const distance = this.calculateDistance(this.rooms[i], this.rooms[j]);
          allPossibleEdges.push({ from: this.rooms[i], to: this.rooms[j], distance });
        }
      }
    }

    allPossibleEdges.sort((a, b) => a.distance - b.distance);

    const numExtra = Math.floor(mstEdges.length * percentage);
    for (let i = 0; i < Math.min(numExtra, allPossibleEdges.length); i++) {
      extraEdges.push(allPossibleEdges[i]);
    }

    return extraEdges;
  }

  private roomPairKey(roomA: Room, roomB: Room): string {
    if (roomA.id < roomB.id) {
      return `${roomA.id}-${roomB.id}`;
    } else {
      return `${roomB.id}-${roomA.id}`;
    }
  }

  private carveCorridorBetweenRooms(from: Room, to: Room, tiles: DungeonTile[][], corridorIndex: number): void {
    const startX = from.x + Math.floor(from.width / 2);
    const startY = from.y + Math.floor(from.height / 2);
    const endX = to.x + Math.floor(to.width / 2);
    const endY = to.y + Math.floor(to.height / 2);

    const path = Pathfinding.findPath(startX, startY, endX, endY, tiles, {
      preferStraightLines: true,
      preferExistingCorridors: true,
      avoidRooms: false
    });

    if (path) {
      const corridor: Corridor = {
        id: `corridor_${corridorIndex}`,
        path: path,
        connectsRooms: [from.id, to.id]
      };

      this.corridors.push(corridor);

      for (const point of path) {
        if (tiles[point.y] && tiles[point.y][point.x]) {
          tiles[point.y][point.x].type = 'floor';
          tiles[point.y][point.x].northWall = this.createWall(false);
          tiles[point.y][point.x].southWall = this.createWall(false);
          tiles[point.y][point.x].eastWall = this.createWall(false);
          tiles[point.y][point.x].westWall = this.createWall(false);
        }
      }
    }
  }

  private placeStairs(tiles: DungeonTile[][]): void {
    const floorTiles = this.getFloorTiles(tiles);

    if (this.level === 1) {
      if (floorTiles.length >= 2) {
        const upStairs = floorTiles[Math.floor(this.rng.random() * floorTiles.length)];
        upStairs.special = { type: 'stairs_up' };

        const remainingTiles = floorTiles.filter((t) => t !== upStairs);
        if (remainingTiles.length > 0) {
          const downStairs = remainingTiles[Math.floor(this.rng.random() * remainingTiles.length)];
          downStairs.special = { type: 'stairs_down' };
        }
      }
    } else {
      if (floorTiles.length >= 2) {
        const upStairs = floorTiles[Math.floor(this.rng.random() * floorTiles.length)];
        upStairs.special = { type: 'stairs_up' };

        const downStairs = floorTiles[Math.floor(this.rng.random() * floorTiles.length)];
        if (downStairs !== upStairs) {
          downStairs.special = { type: 'stairs_down' };
        }
      }
    }
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

  private placeSpecialTiles(tiles: DungeonTile[][]): void {
    const floorTiles = this.getFloorTiles(tiles);
    const numSpecial = Math.min(
      GAME_CONFIG.DUNGEON.MIN_SPECIAL_TILES +
        Math.floor(this.rng.random() * GAME_CONFIG.DUNGEON.MAX_EXTRA_SPECIAL_TILES),
      floorTiles.length
    );

    for (let i = 0; i < numSpecial; i++) {
      const tile = floorTiles[Math.floor(this.rng.random() * floorTiles.length)];
      const rand = this.rng.random();

      // Build probability ranges based on enabled features
      let chestThreshold = 0;
      let trapThreshold = 0;
      let doorThreshold = 0;

      if (GAME_CONFIG.DUNGEON.ENABLE_TREASURE_CHESTS) {
        chestThreshold = GAME_CONFIG.DUNGEON.CHEST_CHANCE;
        trapThreshold = chestThreshold + GAME_CONFIG.DUNGEON.TRAP_CHANCE;
      } else {
        trapThreshold = GAME_CONFIG.DUNGEON.TRAP_CHANCE;
      }

      if (GAME_CONFIG.DUNGEON.ENABLE_DOORS) {
        doorThreshold = trapThreshold + GAME_CONFIG.DUNGEON.DOOR_CHANCE;
      }

      if (GAME_CONFIG.DUNGEON.ENABLE_TREASURE_CHESTS && rand < chestThreshold) {
        tile.special = { type: 'chest' };
      } else if (rand < trapThreshold) {
        tile.special = { type: 'trap' };
      } else if (GAME_CONFIG.DUNGEON.ENABLE_DOORS && rand < doorThreshold) {
        tile.special = { type: 'event' };
      } else {
        tile.special = { type: 'event' };
      }
    }
  }

  private calculateWalls(tiles: DungeonTile[][]): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = tiles[y][x];

        if (tile.type === 'floor') {
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
}
