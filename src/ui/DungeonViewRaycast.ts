import { Direction, DungeonLevel } from '../types/GameTypes';
import { RaycastEngine, RayHit } from './RaycastEngine';
import { WallTextureManager, WallTextureType } from './WallTextureManager';
import { DebugLogger } from '../utils/DebugLogger';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';
import { GAME_CONFIG } from '../config/GameConstants';

export class DungeonViewRaycast {
  private ctx: CanvasRenderingContext2D;
  private currentRenderCtx: CanvasRenderingContext2D;
  private dungeon: DungeonLevel | null = null;
  private playerX: number = 0;
  private playerY: number = 0;
  private playerFacing: Direction = 'north';
  private viewAngleOverride: number | null = null;

  private raycastEngine: RaycastEngine;
  private textureManager: WallTextureManager;
  private performanceMonitor: PerformanceMonitor;

  private readonly VIEW_WIDTH = GAME_CONFIG.DUNGEON_VISUAL.VIEW_WIDTH;
  private readonly VIEW_HEIGHT = GAME_CONFIG.DUNGEON_VISUAL.VIEW_HEIGHT;
  private readonly VIEW_X = GAME_CONFIG.DUNGEON_VISUAL.VIEW_X;
  private readonly VIEW_Y = GAME_CONFIG.DUNGEON_VISUAL.VIEW_Y;
  private readonly INNER_VIEW_WIDTH = GAME_CONFIG.DUNGEON_VISUAL.INNER_VIEW_WIDTH;
  private readonly INNER_VIEW_HEIGHT = GAME_CONFIG.DUNGEON_VISUAL.INNER_VIEW_HEIGHT;

  private readonly FOV = (GAME_CONFIG.DUNGEON_VISUAL.FOV_DEGREES * Math.PI) / 180;
  private readonly RAY_ORIGIN_OFFSET = GAME_CONFIG.DUNGEON_VISUAL.RAY_ORIGIN_OFFSET;

  private tempCanvas: HTMLCanvasElement;
  private tempCtx: CanvasRenderingContext2D;
  private tempImageData: ImageData | null = null;
  private maxWallHeight: number = 0;
  private dungeonScene: any = null;

  constructor(canvas: HTMLCanvasElement, dungeonScene?: any) {
    this.ctx = canvas.getContext('2d')!;
    this.currentRenderCtx = this.ctx;

    this.raycastEngine = new RaycastEngine();
    this.textureManager = new WallTextureManager();
    this.dungeonScene = dungeonScene;
    this.performanceMonitor = PerformanceMonitor.getInstance();

    this.tempCanvas = document.createElement('canvas');
    this.tempCanvas.width = 1;
    this.tempCanvas.height = this.INNER_VIEW_HEIGHT;
    this.tempCtx = this.tempCanvas.getContext('2d')!;
    this.tempCtx.imageSmoothingEnabled = false;

    DebugLogger.info('DungeonViewRaycast', 'Initialized raycasting renderer with canvas pool');
  }

  public setDungeon(dungeon: DungeonLevel): void {
    this.dungeon = dungeon;
    this.raycastEngine.setDungeon(dungeon);
  }

  public setPlayerPosition(x: number, y: number, facing: Direction): void {
    this.playerX = x;
    this.playerY = y;
    this.playerFacing = facing;
  }

  public setViewAngle(angleDegrees: number | null): void {
    this.viewAngleOverride = angleDegrees;
  }

  public render(ctx?: CanvasRenderingContext2D): void {
    if (!this.dungeon) return;

    this.currentRenderCtx = ctx || this.ctx;

    this.currentRenderCtx.fillStyle = '#2a2a2a';
    this.currentRenderCtx.fillRect(
      this.VIEW_X - 5,
      this.VIEW_Y - 5,
      this.VIEW_WIDTH + 10,
      this.VIEW_HEIGHT + 10
    );

    this.currentRenderCtx.strokeStyle = '#666';
    this.currentRenderCtx.lineWidth = 2;
    this.currentRenderCtx.strokeRect(
      this.VIEW_X - 5,
      this.VIEW_Y - 5,
      this.VIEW_WIDTH + 10,
      this.VIEW_HEIGHT + 10
    );

    this.currentRenderCtx.save();
    this.currentRenderCtx.translate(this.VIEW_X, this.VIEW_Y);

    this.currentRenderCtx.fillStyle = '#000';
    this.currentRenderCtx.fillRect(0, 0, this.VIEW_WIDTH, this.VIEW_HEIGHT);

    const innerX = (this.VIEW_WIDTH - this.INNER_VIEW_WIDTH) / 2;
    const innerY = (this.VIEW_HEIGHT - this.INNER_VIEW_HEIGHT) / 2;
    this.currentRenderCtx.save();
    this.currentRenderCtx.translate(innerX, innerY);

    this.renderRaycast();

    this.currentRenderCtx.restore();

    this.renderUI();

    this.currentRenderCtx.restore();
  }

  private renderRaycast(): void {
    const raycastStartTime = performance.now();

    const playerPosX = this.playerX + this.RAY_ORIGIN_OFFSET;
    const playerPosY = this.playerY + this.RAY_ORIGIN_OFFSET;

    const baseAngle = this.viewAngleOverride !== null
      ? this.raycastEngine.getAngleFromDegrees(this.viewAngleOverride)
      : this.raycastEngine.getAngleForDirection(this.playerFacing);

    if (this.viewAngleOverride !== null) {
      DebugLogger.debug(
        'DungeonViewRaycast',
        `Animating: angle override=${this.viewAngleOverride.toFixed(1)}° (${baseAngle.toFixed(2)} rad)`
      );
    }

    for (let x = 0; x < this.INNER_VIEW_WIDTH; x++) {
      const cameraX = (2 * x) / this.INNER_VIEW_WIDTH - 1;
      const rayAngle = baseAngle + cameraX * (this.FOV / 2);

      const hit = this.raycastEngine.castRay(playerPosX, playerPosY, rayAngle, 20);

      if (!hit.hit) continue;

      const lineHeight = this.raycastEngine.calculateWallHeight(hit.distance, this.INNER_VIEW_HEIGHT);

      if (x === Math.floor(this.INNER_VIEW_WIDTH / 2)) {
        DebugLogger.debug(
          'DungeonViewRaycast',
          `Center ray: hit wall at (${hit.wallX},${hit.wallY}), distance=${hit.distance.toFixed(2)}, height=${lineHeight}px, side=${hit.side}`
        );
      }

      const drawStart = Math.max(0, (this.INNER_VIEW_HEIGHT - lineHeight) / 2);
      const drawEnd = Math.min(this.INNER_VIEW_HEIGHT, (this.INNER_VIEW_HEIGHT + lineHeight) / 2);

      this.renderFloorAndCeiling(x, drawStart, drawEnd);

      this.renderWallSlice(x, drawStart, drawEnd, hit);
    }

    const raycastTime = performance.now() - raycastStartTime;
    (this.performanceMonitor as any).raycastTime = raycastTime;
  }

  private renderFloorAndCeiling(x: number, wallStart: number, wallEnd: number): void {
    this.currentRenderCtx.fillStyle = '#3a2a1a';
    this.currentRenderCtx.fillRect(x, wallEnd, 1, this.INNER_VIEW_HEIGHT - wallEnd);

    this.currentRenderCtx.fillStyle = '#1a1a1a';
    this.currentRenderCtx.fillRect(x, 0, 1, wallStart);
  }

  private renderWallSlice(
    x: number,
    drawStart: number,
    drawEnd: number,
    hit: RayHit
  ): void {
    let textureType: WallTextureType = 'brick';

    if (hit.wallType === 'door') {
      let renderAsOpen = hit.doorOpen || false;

      if (this.dungeonScene && typeof this.dungeonScene.getDoorPassageState === 'function') {
        const doorPassage = this.dungeonScene.getDoorPassageState();
        if (doorPassage && doorPassage.x === hit.wallX && doorPassage.y === hit.wallY) {
          renderAsOpen = true;
        }
      }

      textureType = renderAsOpen ? 'brick' : 'door';
    } else if (hit.wallType === 'secret' || hit.wallType === 'illusory') {
      textureType = 'brick';
    }

    const texture = this.textureManager.getTexture(textureType);

    if (!texture) {
      this.currentRenderCtx.fillStyle = '#8B4513';
      this.currentRenderCtx.fillRect(x, drawStart, 1, drawEnd - drawStart);
      return;
    }

    const textureWidth = this.textureManager.getTextureWidth();
    const textureHeight = this.textureManager.getTextureHeight();

    const texX = Math.floor(hit.textureX * textureWidth) % textureWidth;

    const wallHeight = drawEnd - drawStart;

    if (wallHeight > this.maxWallHeight) {
      this.maxWallHeight = wallHeight;
      this.tempCanvas.height = wallHeight;
      this.tempCtx.imageSmoothingEnabled = false;
      this.tempImageData = null;
    }

    if (!this.tempImageData || this.tempImageData.height !== wallHeight) {
      this.tempImageData = this.tempCtx.createImageData(1, wallHeight);
    }

    const ctx = texture.getContext('2d')!;
    const imageData = ctx.getImageData(texX, 0, 1, textureHeight);

    for (let y = 0; y < wallHeight; y++) {
      const texY = Math.floor((y / wallHeight) * textureHeight);
      const srcIndex = texY * 4;
      const dstIndex = y * 4;

      let brightness = 1.0;
      if (hit.distance > 1) {
        brightness = Math.max(0.3, 1.0 - (hit.distance - 1) / 10);
      }

      this.tempImageData.data[dstIndex] = imageData.data[srcIndex] * brightness;
      this.tempImageData.data[dstIndex + 1] = imageData.data[srcIndex + 1] * brightness;
      this.tempImageData.data[dstIndex + 2] = imageData.data[srcIndex + 2] * brightness;
      this.tempImageData.data[dstIndex + 3] = 255;
    }

    this.tempCtx.putImageData(this.tempImageData, 0, 0);

    this.currentRenderCtx.drawImage(
      this.tempCanvas,
      0, 0, 1, wallHeight,
      x, drawStart, 1, wallHeight
    );
  }

  private renderUI(): void {
    this.currentRenderCtx.fillStyle = '#333';
    this.currentRenderCtx.fillRect(0, this.VIEW_HEIGHT - 60, this.VIEW_WIDTH, 60);

    this.currentRenderCtx.strokeStyle = '#666';
    this.currentRenderCtx.lineWidth = 2;
    this.currentRenderCtx.strokeRect(0, this.VIEW_HEIGHT - 60, this.VIEW_WIDTH, 60);

    this.currentRenderCtx.fillStyle = '#fff';
    this.currentRenderCtx.font = '14px monospace';
    this.currentRenderCtx.textAlign = 'start';
    this.currentRenderCtx.fillText(
      `Position: ${this.playerX}, ${this.playerY}`,
      10,
      this.VIEW_HEIGHT - 40
    );
    this.currentRenderCtx.fillText(`Facing: ${this.playerFacing}`, 10, this.VIEW_HEIGHT - 20);

    if (this.dungeon) {
      this.currentRenderCtx.fillText(`Floor: ${this.dungeon.level}`, 200, this.VIEW_HEIGHT - 40);

      const currentTile = this.getTileAt(this.playerX, this.playerY);
      if (currentTile && currentTile.type !== 'floor') {
        this.currentRenderCtx.fillText(`On: ${currentTile.type}`, 200, this.VIEW_HEIGHT - 20);
      }
    }

    const compassSize = 40;
    const compassX = this.VIEW_WIDTH - compassSize - 10;
    const compassY = this.VIEW_HEIGHT - compassSize - 10;

    this.currentRenderCtx.strokeStyle = '#666';
    this.currentRenderCtx.lineWidth = 2;
    this.currentRenderCtx.beginPath();
    this.currentRenderCtx.arc(compassX, compassY, compassSize / 2, 0, Math.PI * 2);
    this.currentRenderCtx.stroke();

    this.currentRenderCtx.fillStyle = '#ff0000';
    this.currentRenderCtx.font = '12px monospace';
    this.currentRenderCtx.textAlign = 'center';
    this.currentRenderCtx.fillText('N', compassX, compassY - compassSize / 3);

    const arrowLength = compassSize / 3;
    const angle = this.getCompassAngle();
    const arrowX = compassX + Math.sin(angle) * arrowLength;
    const arrowY = compassY - Math.cos(angle) * arrowLength;

    this.currentRenderCtx.strokeStyle = '#ff0000';
    this.currentRenderCtx.lineWidth = 3;
    this.currentRenderCtx.beginPath();
    this.currentRenderCtx.moveTo(compassX, compassY);
    this.currentRenderCtx.lineTo(arrowX, arrowY);
    this.currentRenderCtx.stroke();

    this.currentRenderCtx.textAlign = 'start';
  }

  private getTileAt(x: number, y: number) {
    if (!this.dungeon) {
      return null;
    }

    const tileX = Math.floor(x);
    const tileY = Math.floor(y);

    if (tileX < 0 || tileX >= this.dungeon.width || tileY < 0 || tileY >= this.dungeon.height) {
      return null;
    }

    return this.dungeon.tiles[tileY][tileX];
  }

  private getCompassAngle(): number {
    switch (this.playerFacing) {
      case 'north':
        return 0;
      case 'east':
        return Math.PI / 2;
      case 'south':
        return Math.PI;
      case 'west':
        return (3 * Math.PI) / 2;
      default:
        return 0;
    }
  }
}
