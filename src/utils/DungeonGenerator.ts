import { DungeonEvent, DungeonLevel, DungeonTile, EncounterZone } from '../types/GameTypes';

export class DungeonGenerator {
  private width: number;
  private height: number;
  private level: number;
  private rooms: { x: number; y: number; width: number; height: number }[] = [];

  constructor(width: number = 20, height: number = 20) {
    this.width = width;
    this.height = height;
    this.level = 1;
  }

  public generateLevel(level: number): DungeonLevel {
    this.level = level;
    const tiles = this.initializeTiles();
    this.generateRooms(tiles);
    this.generateCorridors(tiles);
    this.placeStairs(tiles);
    this.placeSpecialTiles(tiles);
    this.calculateWalls(tiles);

    const encounters = this.generateEncounterZones();
    const events = this.generateEvents(tiles);
    const startPosition = this.findValidStartPosition(tiles);

    return {
      level,
      width: this.width,
      height: this.height,
      tiles,
      encounters,
      events,
      startX: startPosition.x,
      startY: startPosition.y,
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
          type: 'wall',
          discovered: false,
          hasMonster: false,
          hasItem: false,
          northWall: true,
          southWall: true,
          eastWall: true,
          westWall: true,
        };
      }
    }

    return tiles;
  }

  private generateRooms(tiles: DungeonTile[][]): void {
    const numRooms = 5 + Math.floor(Math.random() * 5);
    const rooms: { x: number; y: number; width: number; height: number }[] = [];

    for (let i = 0; i < numRooms; i++) {
      const roomWidth = 3 + Math.floor(Math.random() * 5);
      const roomHeight = 3 + Math.floor(Math.random() * 5);
      const x = 1 + Math.floor(Math.random() * (this.width - roomWidth - 2));
      const y = 1 + Math.floor(Math.random() * (this.height - roomHeight - 2));

      let overlaps = false;
      for (const room of rooms) {
        if (
          x < room.x + room.width + 1 &&
          x + roomWidth + 1 > room.x &&
          y < room.y + room.height + 1 &&
          y + roomHeight + 1 > room.y
        ) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        rooms.push({ x, y, width: roomWidth, height: roomHeight });

        for (let ry = y; ry < y + roomHeight; ry++) {
          for (let rx = x; rx < x + roomWidth; rx++) {
            if (tiles[ry] && tiles[ry][rx]) {
              tiles[ry][rx].type = 'floor';
            }
          }
        }
      }
    }

    this.rooms = rooms;
  }

  private generateCorridors(tiles: DungeonTile[][]): void {
    const floorTiles: DungeonTile[] = [];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (tiles[y][x].type === 'floor') {
          floorTiles.push(tiles[y][x]);
        }
      }
    }

    for (let i = 0; i < 10; i++) {
      if (floorTiles.length < 2) break;

      const start = floorTiles[Math.floor(Math.random() * floorTiles.length)];
      const end = floorTiles[Math.floor(Math.random() * floorTiles.length)];

      this.createCorridor(tiles, start.x, start.y, end.x, end.y);
    }
  }

  private createCorridor(
    tiles: DungeonTile[][],
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): void {
    let x = x1;
    let y = y1;

    while (x !== x2 || y !== y2) {
      if (tiles[y] && tiles[y][x]) {
        tiles[y][x].type = 'floor';
      }

      if (Math.random() < 0.5) {
        if (x < x2) x++;
        else if (x > x2) x--;
        else if (y < y2) y++;
        else if (y > y2) y--;
      } else {
        if (y < y2) y++;
        else if (y > y2) y--;
        else if (x < x2) x++;
        else if (x > x2) x--;
      }

      if (x < 1) x = 1;
      if (x >= this.width - 1) x = this.width - 2;
      if (y < 1) y = 1;
      if (y >= this.height - 1) y = this.height - 2;
    }
  }

  private placeStairs(tiles: DungeonTile[][]): void {
    const floorTiles = this.getFloorTiles(tiles);

    if (floorTiles.length >= 2) {
      const upStairs = floorTiles[Math.floor(Math.random() * floorTiles.length)];
      upStairs.type = 'stairs_up';

      const downStairs = floorTiles[Math.floor(Math.random() * floorTiles.length)];
      if (downStairs !== upStairs) {
        downStairs.type = 'stairs_down';
      }
    }
  }

  private placeSpecialTiles(tiles: DungeonTile[][]): void {
    const floorTiles = this.getFloorTiles(tiles);
    const numSpecial = Math.min(3 + Math.floor(Math.random() * 3), floorTiles.length);

    for (let i = 0; i < numSpecial; i++) {
      const tile = floorTiles[Math.floor(Math.random() * floorTiles.length)];
      const rand = Math.random();

      if (rand < 0.3) {
        tile.type = 'chest';
      } else if (rand < 0.5) {
        tile.type = 'trap';
      } else if (rand < 0.7) {
        tile.type = 'door';
      } else {
        tile.type = 'event';
      }
    }
  }

  private calculateWalls(tiles: DungeonTile[][]): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = tiles[y][x];

        if (tile.type !== 'wall') {
          tile.northWall = y === 0 || tiles[y - 1][x].type === 'wall';
          tile.southWall = y === this.height - 1 || tiles[y + 1][x].type === 'wall';
          tile.westWall = x === 0 || tiles[y][x - 1].type === 'wall';
          tile.eastWall = x === this.width - 1 || tiles[y][x + 1].type === 'wall';
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

  private generateEncounterZones(): EncounterZone[] {
    const zones: EncounterZone[] = [];
    const numZones = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < numZones; i++) {
      const x1 = Math.floor(Math.random() * (this.width - 5));
      const y1 = Math.floor(Math.random() * (this.height - 5));
      const x2 = x1 + 3 + Math.floor(Math.random() * 5);
      const y2 = y1 + 3 + Math.floor(Math.random() * 5);

      zones.push({
        x1,
        y1,
        x2: Math.min(x2, this.width - 1),
        y2: Math.min(y2, this.height - 1),
        monsterGroups: this.getMonsterGroupsForLevel(),
        encounterRate: 0.1 + this.level * 0.02,
      });
    }

    return zones;
  }

  private getMonsterGroupsForLevel(): string[] {
    const allMonsters = [
      ['slime', 'rat', 'bat'],
      ['goblin', 'kobold', 'zombie'],
      ['orc', 'skeleton', 'ghoul'],
      ['ogre', 'wight', 'gargoyle'],
      ['troll', 'vampire', 'demon'],
    ];

    const levelIndex = Math.min(this.level - 1, allMonsters.length - 1);
    return allMonsters[levelIndex];
  }

  private generateEvents(tiles: DungeonTile[][]): DungeonEvent[] {
    const events: DungeonEvent[] = [];
    const eventTiles = [];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (tiles[y][x].type === 'event') {
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
    return types[Math.floor(Math.random() * types.length)];
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
          x: Math.floor(Math.random() * this.width),
          y: Math.floor(Math.random() * this.height),
        };
      case 'spinner':
        return { rotations: 1 + Math.floor(Math.random() * 3) };
      case 'darkness':
        return { duration: 10 };
      default:
        return {};
    }
  }

  private findValidStartPosition(tiles: DungeonTile[][]): { x: number; y: number } {
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
      const randomFloor = floorTiles[Math.floor(Math.random() * floorTiles.length)];
      return { x: randomFloor.x, y: randomFloor.y };
    }

    return { x: 1, y: 1 };
  }
}
