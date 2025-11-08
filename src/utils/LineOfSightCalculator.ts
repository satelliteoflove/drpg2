import { DungeonLevel } from '../types/GameTypes';
import { RaycastEngine } from '../ui/RaycastEngine';

export class LineOfSightCalculator {
  private raycastEngine: RaycastEngine;

  constructor(dungeon: DungeonLevel) {
    this.raycastEngine = new RaycastEngine();
    this.raycastEngine.setDungeon(dungeon);
  }

  public hasLineOfSight(
    playerX: number,
    playerY: number,
    targetTileX: number,
    targetTileY: number
  ): boolean {
    const targetCenterX = targetTileX + 0.5;
    const targetCenterY = targetTileY + 0.5;

    const dx = targetCenterX - playerX;
    const dy = targetCenterY - playerY;
    const targetDistance = Math.sqrt(dx * dx + dy * dy);

    if (targetDistance < 0.01) {
      return true;
    }

    const rayAngle = Math.atan2(dy, dx);

    const result = this.raycastEngine.castRay(
      playerX,
      playerY,
      rayAngle,
      targetDistance + 1
    );

    if (!result.hit) {
      return true;
    }

    const hitTileX = Math.floor(result.wallX);
    const hitTileY = Math.floor(result.wallY);

    if (hitTileX === targetTileX && hitTileY === targetTileY) {
      return true;
    }

    const tolerance = 0.6;
    if (result.distance <= targetDistance + tolerance) {
      return false;
    }

    return true;
  }
}
