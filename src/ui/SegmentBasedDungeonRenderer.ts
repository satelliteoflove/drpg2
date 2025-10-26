import { GAME_CONFIG } from '../config/GameConstants';
import { SegmentImages } from './SegmentImageGenerator';

interface ColorScheme {
  wall: string;
  mortar: string;
  floor: string;
  ceiling: string;
}

interface CorridorSegment {
  depth: number;
  hasLeftWall: boolean;
  hasRightWall: boolean;
  hasFrontWall: boolean;
  hasLeftCorridorFarWall: boolean;
  hasRightCorridorFarWall: boolean;
}

export class SegmentBasedDungeonRenderer {
  private segments: SegmentImages;
  private colorScheme: ColorScheme;

  constructor(segments: SegmentImages) {
    this.segments = segments;
    const schemeName = GAME_CONFIG.DUNGEON_VISUAL.COLOR_SCHEME;
    this.colorScheme = GAME_CONFIG.DUNGEON_VISUAL.SCHEMES[schemeName];
  }

  public drawCorridor(
    ctx: CanvasRenderingContext2D,
    corridorSegments: CorridorSegment[],
    _viewDistance: number
  ): void {
    corridorSegments.sort((a, b) => b.depth - a.depth);

    for (const segment of corridorSegments) {
      this.drawCorridorSegment(ctx, segment);
    }
  }

  private drawCorridorSegment(ctx: CanvasRenderingContext2D, segment: CorridorSegment): void {
    const depth = segment.depth;
    const layerBrightness = Math.pow(0.5, depth);

    let floorCanvas: HTMLCanvasElement | undefined;
    if (!segment.hasLeftWall && !segment.hasRightWall) {
      floorCanvas = this.segments.floorExtendBoth.get(depth);
    } else if (!segment.hasLeftWall) {
      floorCanvas = this.segments.floorExtendLeft.get(depth);
    } else if (!segment.hasRightWall) {
      floorCanvas = this.segments.floorExtendRight.get(depth);
    } else {
      floorCanvas = this.segments.floor.get(depth);
    }

    if (floorCanvas) {
      this.drawSegment(ctx, floorCanvas, this.colorScheme.floor, layerBrightness, 0);
    }

    let ceilingCanvas: HTMLCanvasElement | undefined;
    if (!segment.hasLeftWall && !segment.hasRightWall) {
      ceilingCanvas = this.segments.ceilingExtendBoth.get(depth);
    } else if (!segment.hasLeftWall) {
      ceilingCanvas = this.segments.ceilingExtendLeft.get(depth);
    } else if (!segment.hasRightWall) {
      ceilingCanvas = this.segments.ceilingExtendRight.get(depth);
    } else {
      ceilingCanvas = this.segments.ceiling.get(depth);
    }

    if (ceilingCanvas) {
      this.drawSegment(ctx, ceilingCanvas, this.colorScheme.ceiling, layerBrightness, -75);
    }

    if (segment.hasLeftWall) {
      const leftWallCanvas = this.segments.leftWall.get(depth);
      if (leftWallCanvas) {
        this.drawSegment(ctx, leftWallCanvas, this.colorScheme.wall, layerBrightness, -30);
      }
    }

    if (segment.hasRightWall) {
      const rightWallCanvas = this.segments.rightWall.get(depth);
      if (rightWallCanvas) {
        this.drawSegment(ctx, rightWallCanvas, this.colorScheme.wall, layerBrightness, -30);
      }
    }

    if (segment.hasLeftCorridorFarWall) {
      const leftCorridorWall = this.segments.leftCorridorFarWall.get(depth);
      if (leftCorridorWall) {
        this.drawSegment(ctx, leftCorridorWall, this.colorScheme.wall, layerBrightness, -30);
      }
    }

    if (segment.hasRightCorridorFarWall) {
      const rightCorridorWall = this.segments.rightCorridorFarWall.get(depth);
      if (rightCorridorWall) {
        this.drawSegment(ctx, rightCorridorWall, this.colorScheme.wall, layerBrightness, -30);
      }
    }

    if (segment.hasFrontWall) {
      const frontWallCanvas = this.segments.frontWall.get(depth + 1);
      if (frontWallCanvas) {
        const frontLayerBrightness = Math.pow(0.5, depth + 1);
        this.drawSegment(ctx, frontWallCanvas, this.colorScheme.wall, frontLayerBrightness, 0);
      }
    }
  }

  private drawSegment(
    ctx: CanvasRenderingContext2D,
    segmentCanvas: HTMLCanvasElement,
    tintColor: string,
    layerBrightness: number,
    brightnessAdjust: number
  ): void {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = segmentCanvas.width;
    tempCanvas.height = segmentCanvas.height;
    const tempCtx = tempCanvas.getContext('2d')!;

    tempCtx.drawImage(segmentCanvas, 0, 0);

    const rgb = this.hexToRgb(tintColor);
    if (!rgb) {
      ctx.drawImage(tempCanvas, 0, 0);
      return;
    }

    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;

    const brightnessScale = layerBrightness;
    const adjustment = brightnessAdjust / 255;

    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i];

      const normalizedGray = gray / 255;
      const adjustedGray = Math.max(0, Math.min(1, normalizedGray + adjustment));
      const shadedGray = adjustedGray * brightnessScale;

      data[i] = Math.floor(shadedGray * rgb.r);
      data[i + 1] = Math.floor(shadedGray * rgb.g);
      data[i + 2] = Math.floor(shadedGray * rgb.b);
    }

    tempCtx.putImageData(imageData, 0, 0);
    ctx.drawImage(tempCanvas, 0, 0);
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  public drawDoor(ctx: CanvasRenderingContext2D, depth: number): void {
    const vanishingPoint = { x: 230, y: 155 };
    const viewportWidth = 460;
    const viewportHeight = 310;

    const scale = Math.pow(0.5, depth);
    const doorWidth = viewportWidth * scale * 0.7;
    const doorHeight = viewportHeight * scale * 0.65;

    const doorLeft = vanishingPoint.x - doorWidth / 2;
    const doorTop = vanishingPoint.y - doorHeight / 2;

    const layerBrightness = Math.pow(0.5, depth);
    const woodColor = this.applySimpleShading('#8B4513', layerBrightness);
    const darkWoodColor = this.applySimpleShading('#654321', layerBrightness);
    const goldColor = this.applySimpleShading('#DAA520', layerBrightness);

    ctx.fillStyle = woodColor;
    ctx.fillRect(doorLeft, doorTop, doorWidth, doorHeight);

    const panelInset = Math.max(4, doorWidth * 0.1);
    ctx.strokeStyle = darkWoodColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(
      doorLeft + panelInset,
      doorTop + panelInset,
      doorWidth - panelInset * 2,
      doorHeight - panelInset * 2
    );

    const knobX = doorLeft + doorWidth * 0.85;
    const knobY = doorTop + doorHeight * 0.5;
    const knobSize = Math.max(3, doorWidth * 0.03);

    ctx.fillStyle = goldColor;
    ctx.beginPath();
    ctx.arc(knobX, knobY, knobSize, 0, Math.PI * 2);
    ctx.fill();
  }

  public drawChest(ctx: CanvasRenderingContext2D, depth: number): void {
    const vanishingPoint = { x: 230, y: 155 };
    const viewportWidth = 460;
    const viewportHeight = 310;

    const scale = Math.pow(0.5, depth);
    const chestWidth = viewportWidth * scale * 0.4;
    const chestHeight = viewportHeight * scale * 0.3;

    const chestLeft = vanishingPoint.x - chestWidth / 2;
    const chestBottom = vanishingPoint.y + viewportHeight * scale * 0.3;
    const chestTop = chestBottom - chestHeight;

    const layerBrightness = Math.pow(0.5, depth);
    const woodColor = this.applySimpleShading('#8B4513', layerBrightness);
    const darkWoodColor = this.applySimpleShading('#654321', layerBrightness);
    const goldColor = this.applySimpleShading('#DAA520', layerBrightness);

    ctx.fillStyle = woodColor;
    ctx.fillRect(chestLeft, chestTop, chestWidth, chestHeight);

    const lidHeight = chestHeight * 0.15;
    ctx.strokeStyle = darkWoodColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(chestLeft, chestTop, chestWidth, chestHeight);

    ctx.beginPath();
    ctx.moveTo(chestLeft, chestTop + lidHeight);
    ctx.lineTo(chestLeft + chestWidth, chestTop + lidHeight);
    ctx.stroke();

    const lockSize = Math.max(4, chestWidth * 0.08);
    const lockX = vanishingPoint.x;
    const lockY = chestTop + chestHeight * 0.4;

    ctx.fillStyle = goldColor;
    ctx.fillRect(lockX - lockSize / 2, lockY - lockSize / 2, lockSize, lockSize);
  }

  private applySimpleShading(color: string, brightness: number): string {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;

    const shadedR = Math.floor(rgb.r * brightness);
    const shadedG = Math.floor(rgb.g * brightness);
    const shadedB = Math.floor(rgb.b * brightness);

    return `rgb(${shadedR}, ${shadedG}, ${shadedB})`;
  }
}
