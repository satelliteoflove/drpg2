import { DungeonEvent, DungeonLevel, DungeonTile, OverrideZone } from '../types/GameTypes';
import { GAME_CONFIG } from '../config/GameConstants';

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

    const overrideZones = this.generateOverrideZones(tiles);
    const events = this.generateEvents(tiles);
    const startPosition = this.findValidStartPosition(tiles);

    return {
      level,
      width: this.width,
      height: this.height,
      tiles,
      overrideZones,
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
    
    if (this.level === 1) {
      // Floor 1: Place castle stairs (up to town) at a valid floor location
      if (floorTiles.length >= 2) {
        // Place stairs up (to castle/town) at a random floor tile
        const upStairs = floorTiles[Math.floor(Math.random() * floorTiles.length)];
        upStairs.type = 'stairs_up';
        
        // Place stairs down at a different floor tile
        const remainingTiles = floorTiles.filter(t => t !== upStairs);
        if (remainingTiles.length > 0) {
          const downStairs = remainingTiles[Math.floor(Math.random() * remainingTiles.length)];
          downStairs.type = 'stairs_down';
        }
      }
    } else {
      // Other floors: Use existing random placement
      if (floorTiles.length >= 2) {
        const upStairs = floorTiles[Math.floor(Math.random() * floorTiles.length)];
        upStairs.type = 'stairs_up';

        const downStairs = floorTiles[Math.floor(Math.random() * floorTiles.length)];
        if (downStairs !== upStairs) {
          downStairs.type = 'stairs_down';
        }
      }
    }
  }

  private placeSpecialTiles(tiles: DungeonTile[][]): void {
    const floorTiles = this.getFloorTiles(tiles);
    const numSpecial = Math.min(
      GAME_CONFIG.DUNGEON.MIN_SPECIAL_TILES + Math.floor(Math.random() * GAME_CONFIG.DUNGEON.MAX_EXTRA_SPECIAL_TILES), 
      floorTiles.length
    );

    for (let i = 0; i < numSpecial; i++) {
      const tile = floorTiles[Math.floor(Math.random() * floorTiles.length)];
      const rand = Math.random();

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
        tile.type = 'chest';
      } else if (rand < trapThreshold) {
        tile.type = 'trap';
      } else if (GAME_CONFIG.DUNGEON.ENABLE_DOORS && rand < doorThreshold) {
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
        data: { description: 'Starting area - safe from encounters' }
      });
    }

    // Generate boss zones in largest rooms (if enabled)
    if (GAME_CONFIG.ENCOUNTER.ZONE_GENERATION.ENABLE_BOSS_ZONES) {
      const largeRooms = this.rooms.filter(room => room.width * room.height >= 16);
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
            description: 'Guardian chamber'
          }
        });
      }
    }

    // Generate special mob zones based on level theme (if enabled)
    if (GAME_CONFIG.ENCOUNTER.ZONE_GENERATION.ENABLE_SPECIAL_MOB_ZONES) {
      const numSpecialZones = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < numSpecialZones; i++) {
        const room = this.rooms[Math.floor(Math.random() * this.rooms.length)];
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
              description: `Lair of ${this.getSpecialMonsterGroupsForLevel()[0]}s`
            }
          });
        }
      }
    }

    // Generate high frequency zones in corridors (if enabled)
    if (GAME_CONFIG.ENCOUNTER.ZONE_GENERATION.ENABLE_HIGH_FREQUENCY_ZONES) {
      const numHighFreq = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < numHighFreq; i++) {
        const x1 = Math.floor(Math.random() * (this.width - 4));
        const y1 = Math.floor(Math.random() * (this.height - 4));
        const x2 = x1 + 2 + Math.floor(Math.random() * 3);
        const y2 = y1 + 2 + Math.floor(Math.random() * 3);

        zones.push({
          x1,
          y1,
          x2: Math.min(x2, this.width - 1),
          y2: Math.min(y2, this.height - 1),
          type: 'high_frequency',
          data: {
            encounterRate: 0.08,
            description: 'Dangerous corridor - high monster activity'
          }
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
    // Floor 1: Start at the stairs up position
    if (this.level === 1) {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          if (tiles[y][x].type === 'stairs_up') {
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
      const randomFloor = floorTiles[Math.floor(Math.random() * floorTiles.length)];
      return { x: randomFloor.x, y: randomFloor.y };
    }

    return { x: 1, y: 1 };
  }
}
