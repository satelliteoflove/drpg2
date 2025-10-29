import { DungeonLevel, Direction } from '../types/GameTypes';

export interface RayHit {
  hit: boolean;
  distance: number;
  wallX: number;
  wallY: number;
  side: 'north' | 'south' | 'east' | 'west';
  textureX: number;
  wallType?: 'solid' | 'door' | 'secret' | 'illusory';
  doorOpen?: boolean;
}

export class RaycastEngine {
  private dungeon: DungeonLevel | null = null;

  public setDungeon(dungeon: DungeonLevel): void {
    this.dungeon = dungeon;
  }

  public castRay(
    playerX: number,
    playerY: number,
    rayAngle: number,
    maxDistance: number = 20
  ): RayHit {
    if (!this.dungeon) {
      return this.createMissHit();
    }

    const rayDirX = Math.cos(rayAngle);
    const rayDirY = Math.sin(rayAngle);

    let mapX = Math.floor(playerX);
    let mapY = Math.floor(playerY);

    const deltaDistX = Math.abs(1 / rayDirX);
    const deltaDistY = Math.abs(1 / rayDirY);

    let stepX: number;
    let stepY: number;
    let sideDistX: number;
    let sideDistY: number;

    if (rayDirX < 0) {
      stepX = -1;
      sideDistX = (playerX - mapX) * deltaDistX;
    } else {
      stepX = 1;
      sideDistX = (mapX + 1.0 - playerX) * deltaDistX;
    }

    if (rayDirY < 0) {
      stepY = -1;
      sideDistY = (playerY - mapY) * deltaDistY;
    } else {
      stepY = 1;
      sideDistY = (mapY + 1.0 - playerY) * deltaDistY;
    }

    let hit = false;
    let side: 0 | 1 = 0;
    let steps = 0;
    let prevMapX = mapX;
    let prevMapY = mapY;

    while (!hit && steps < maxDistance * 2) {
      prevMapX = mapX;
      prevMapY = mapY;

      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        mapX += stepX;
        side = 0;
      } else {
        sideDistY += deltaDistY;
        mapY += stepY;
        side = 1;
      }

      steps++;

      if (this.isWall(mapX, mapY, prevMapX, prevMapY, side, stepX, stepY)) {
        hit = true;
      }

      if (mapX < 0 || mapX >= this.dungeon.width || mapY < 0 || mapY >= this.dungeon.height) {
        hit = true;
      }
    }

    if (!hit) {
      return this.createMissHit();
    }

    let perpWallDist: number;
    if (side === 0) {
      perpWallDist = Math.abs((mapX - playerX + (1 - stepX) / 2) / rayDirX);
    } else {
      perpWallDist = Math.abs((mapY - playerY + (1 - stepY) / 2) / rayDirY);
    }

    let wallSide: 'north' | 'south' | 'east' | 'west';
    let textureX: number;

    if (side === 0) {
      wallSide = stepX > 0 ? 'west' : 'east';
      const wallHitY = playerY + perpWallDist * rayDirY;
      textureX = wallHitY - Math.floor(wallHitY);
    } else {
      wallSide = stepY > 0 ? 'north' : 'south';
      const wallHitX = playerX + perpWallDist * rayDirX;
      textureX = wallHitX - Math.floor(wallHitX);
    }

    let wallType: 'solid' | 'door' | 'secret' | 'illusory' = 'solid';
    let doorOpen = false;

    if (mapX >= 0 && mapX < this.dungeon.width && mapY >= 0 && mapY < this.dungeon.height) {
      const hitTile = this.dungeon.tiles[mapY][mapX];

      if (hitTile.type !== 'solid' && prevMapX >= 0 && prevMapX < this.dungeon.width && prevMapY >= 0 && prevMapY < this.dungeon.height) {
        const fromTile = this.dungeon.tiles[prevMapY][prevMapX];
        let wall;

        if (side === 0) {
          wall = stepX > 0 ? fromTile.eastWall : fromTile.westWall;
        } else {
          wall = stepY > 0 ? fromTile.southWall : fromTile.northWall;
        }

        if (wall) {
          wallType = wall.type;
          doorOpen = wall.properties?.open || false;
        }
      }
    }

    return {
      hit: true,
      distance: perpWallDist,
      wallX: mapX,
      wallY: mapY,
      side: wallSide,
      textureX: textureX,
      wallType: wallType,
      doorOpen: doorOpen,
    };
  }

  public getAngleForDirection(direction: Direction): number {
    switch (direction) {
      case 'north':
        return -Math.PI / 2;
      case 'south':
        return Math.PI / 2;
      case 'east':
        return 0;
      case 'west':
        return Math.PI;
      default:
        return 0;
    }
  }

  public getAngleFromDegrees(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  private isWall(x: number, y: number, fromX?: number, fromY?: number, side?: 0 | 1, stepX?: number, stepY?: number): boolean {
    if (!this.dungeon) return true;
    if (x < 0 || x >= this.dungeon.width || y < 0 || y >= this.dungeon.height) {
      return true;
    }
    const tile = this.dungeon.tiles[y][x];

    if (tile.type === 'solid') {
      return true;
    }

    if (fromX !== undefined && fromY !== undefined && side !== undefined && stepX !== undefined && stepY !== undefined) {
      if (fromX >= 0 && fromX < this.dungeon.width && fromY >= 0 && fromY < this.dungeon.height) {
        const fromTile = this.dungeon.tiles[fromY][fromX];

        if (side === 0) {
          const wall = stepX > 0 ? fromTile.eastWall : fromTile.westWall;
          if (wall.exists) {
            const openMechanism = wall.properties?.openMechanism || 'player';
            if (openMechanism === 'lever' || openMechanism === 'event') {
              if (!wall.properties?.open) return true;
            } else {
              return true;
            }
          }
        } else {
          const wall = stepY > 0 ? fromTile.southWall : fromTile.northWall;
          if (wall.exists) {
            const openMechanism = wall.properties?.openMechanism || 'player';
            if (openMechanism === 'lever' || openMechanism === 'event') {
              if (!wall.properties?.open) return true;
            } else {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  private createMissHit(): RayHit {
    return {
      hit: false,
      distance: 999,
      wallX: 0,
      wallY: 0,
      side: 'north',
      textureX: 0,
    };
  }

  public calculateWallHeight(distance: number, viewHeight: number): number {
    if (distance <= 0.1) distance = 0.1;
    return Math.floor(viewHeight / distance);
  }

  public getVisibleSpecialTiles(
    playerX: number,
    playerY: number,
    playerAngle: number,
    fov: number,
    maxDistance: number = 5
  ): Array<{ x: number; y: number; distance: number; angle: number; type: string; opened?: boolean }> {
    if (!this.dungeon) return [];

    const visibleTiles: Array<{ x: number; y: number; distance: number; angle: number; type: string; opened?: boolean }> = [];

    const startX = Math.max(0, Math.floor(playerX - maxDistance));
    const endX = Math.min(this.dungeon.width - 1, Math.floor(playerX + maxDistance));
    const startY = Math.max(0, Math.floor(playerY - maxDistance));
    const endY = Math.min(this.dungeon.height - 1, Math.floor(playerY + maxDistance));

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const tile = this.dungeon.tiles[y][x];

        if (tile.special && (tile.special.type === 'stairs_up' || tile.special.type === 'stairs_down' || tile.special.type === 'chest')) {
          const tileCenterX = x + 0.5;
          const tileCenterY = y + 0.5;

          const dx = tileCenterX - playerX;
          const dy = tileCenterY - playerY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > maxDistance) continue;

          const angleToTile = Math.atan2(dy, dx);
          let angleDiff = angleToTile - playerAngle;

          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

          const halfFov = fov / 2;
          if (Math.abs(angleDiff) <= halfFov) {
            visibleTiles.push({
              x: tileCenterX,
              y: tileCenterY,
              distance,
              angle: angleDiff,
              type: tile.special.type,
              opened: tile.special.properties?.opened
            });
          }
        }
      }
    }

    visibleTiles.sort((a, b) => b.distance - a.distance);

    return visibleTiles;
  }
}
