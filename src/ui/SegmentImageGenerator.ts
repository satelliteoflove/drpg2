interface Point2D {
  x: number;
  y: number;
}

export interface SegmentImages {
  floor: Map<number, HTMLCanvasElement>;
  floorExtendLeft: Map<number, HTMLCanvasElement>;
  floorExtendRight: Map<number, HTMLCanvasElement>;
  floorExtendBoth: Map<number, HTMLCanvasElement>;
  ceiling: Map<number, HTMLCanvasElement>;
  ceilingExtendLeft: Map<number, HTMLCanvasElement>;
  ceilingExtendRight: Map<number, HTMLCanvasElement>;
  ceilingExtendBoth: Map<number, HTMLCanvasElement>;
  leftWall: Map<number, HTMLCanvasElement>;
  rightWall: Map<number, HTMLCanvasElement>;
  frontWall: Map<number, HTMLCanvasElement>;
  leftCorridorFarWall: Map<number, HTMLCanvasElement>;
  rightCorridorFarWall: Map<number, HTMLCanvasElement>;
}

export class SegmentImageGenerator {
  private viewportWidth: number;
  private viewportHeight: number;
  private centerX: number;
  private centerY: number;
  private maxDepth: number;

  constructor(viewportWidth: number = 460, viewportHeight: number = 310, maxDepth: number = 4) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.centerX = viewportWidth / 2;
    this.centerY = viewportHeight / 2;
    this.maxDepth = maxDepth;
  }

  public generateAllSegments(): SegmentImages {
    const segments: SegmentImages = {
      floor: new Map(),
      floorExtendLeft: new Map(),
      floorExtendRight: new Map(),
      floorExtendBoth: new Map(),
      ceiling: new Map(),
      ceilingExtendLeft: new Map(),
      ceilingExtendRight: new Map(),
      ceilingExtendBoth: new Map(),
      leftWall: new Map(),
      rightWall: new Map(),
      frontWall: new Map(),
      leftCorridorFarWall: new Map(),
      rightCorridorFarWall: new Map(),
    };

    for (let depth = 0; depth < this.maxDepth; depth++) {
      segments.floor.set(depth, this.generateFloorSegment(depth));
      segments.floorExtendLeft.set(depth, this.generateFloorSegmentExtendLeft(depth));
      segments.floorExtendRight.set(depth, this.generateFloorSegmentExtendRight(depth));
      segments.floorExtendBoth.set(depth, this.generateFloorSegmentExtendBoth(depth));
      segments.ceiling.set(depth, this.generateCeilingSegment(depth));
      segments.ceilingExtendLeft.set(depth, this.generateCeilingSegmentExtendLeft(depth));
      segments.ceilingExtendRight.set(depth, this.generateCeilingSegmentExtendRight(depth));
      segments.ceilingExtendBoth.set(depth, this.generateCeilingSegmentExtendBoth(depth));
      segments.leftWall.set(depth, this.generateLeftWallSegment(depth));
      segments.rightWall.set(depth, this.generateRightWallSegment(depth));
      segments.leftCorridorFarWall.set(depth, this.generateLeftCorridorFarWallSegment(depth));
      segments.rightCorridorFarWall.set(depth, this.generateRightCorridorFarWallSegment(depth));
    }

    for (let depth = 1; depth <= this.maxDepth; depth++) {
      segments.frontWall.set(depth, this.generateFrontWallSegment(depth));
    }

    return segments;
  }

  private getLayerBounds(depth: number): { left: number; right: number; top: number; bottom: number } {
    const scale = Math.pow(0.5, depth);
    const width = this.viewportWidth * scale;
    const height = this.viewportHeight * scale;

    return {
      left: this.centerX - width / 2,
      right: this.centerX + width / 2,
      top: this.centerY - height / 2,
      bottom: this.centerY + height / 2,
    };
  }

  private generateFloorSegment(depth: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = this.viewportWidth;
    canvas.height = this.viewportHeight;
    const ctx = canvas.getContext('2d')!;

    const curr = this.getLayerBounds(depth);
    const next = this.getLayerBounds(depth + 1);

    const points = [
      { x: curr.left, y: curr.bottom },
      { x: curr.right, y: curr.bottom },
      { x: next.right, y: next.bottom },
      { x: next.left, y: next.bottom },
    ];

    this.drawTiledPattern(ctx, points, 20);

    return canvas;
  }

  private generateFloorSegmentExtendLeft(depth: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = this.viewportWidth;
    canvas.height = this.viewportHeight;
    const ctx = canvas.getContext('2d')!;

    const curr = this.getLayerBounds(depth);
    const next = this.getLayerBounds(depth + 1);

    const points = [
      { x: 0, y: curr.bottom },
      { x: curr.right, y: curr.bottom },
      { x: next.right, y: next.bottom },
      { x: 0, y: next.bottom },
    ];

    this.drawTiledPattern(ctx, points, 20);

    return canvas;
  }

  private generateFloorSegmentExtendRight(depth: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = this.viewportWidth;
    canvas.height = this.viewportHeight;
    const ctx = canvas.getContext('2d')!;

    const curr = this.getLayerBounds(depth);
    const next = this.getLayerBounds(depth + 1);

    const points = [
      { x: curr.left, y: curr.bottom },
      { x: this.viewportWidth, y: curr.bottom },
      { x: this.viewportWidth, y: next.bottom },
      { x: next.left, y: next.bottom },
    ];

    this.drawTiledPattern(ctx, points, 20);

    return canvas;
  }

  private generateFloorSegmentExtendBoth(depth: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = this.viewportWidth;
    canvas.height = this.viewportHeight;
    const ctx = canvas.getContext('2d')!;

    const next = this.getLayerBounds(depth + 1);

    const points = [
      { x: 0, y: this.viewportHeight },
      { x: this.viewportWidth, y: this.viewportHeight },
      { x: this.viewportWidth, y: next.bottom },
      { x: 0, y: next.bottom },
    ];

    this.drawTiledPattern(ctx, points, 20);

    return canvas;
  }

  private generateCeilingSegment(depth: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = this.viewportWidth;
    canvas.height = this.viewportHeight;
    const ctx = canvas.getContext('2d')!;

    const curr = this.getLayerBounds(depth);
    const next = this.getLayerBounds(depth + 1);

    const points = [
      { x: curr.left, y: curr.top },
      { x: curr.right, y: curr.top },
      { x: next.right, y: next.top },
      { x: next.left, y: next.top },
    ];

    this.drawSolidPattern(ctx, points, '#808080');

    return canvas;
  }

  private generateCeilingSegmentExtendLeft(depth: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = this.viewportWidth;
    canvas.height = this.viewportHeight;
    const ctx = canvas.getContext('2d')!;

    const curr = this.getLayerBounds(depth);
    const next = this.getLayerBounds(depth + 1);

    const points = [
      { x: 0, y: curr.top },
      { x: curr.right, y: curr.top },
      { x: next.right, y: next.top },
      { x: 0, y: next.top },
    ];

    this.drawSolidPattern(ctx, points, '#808080');

    return canvas;
  }

  private generateCeilingSegmentExtendRight(depth: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = this.viewportWidth;
    canvas.height = this.viewportHeight;
    const ctx = canvas.getContext('2d')!;

    const curr = this.getLayerBounds(depth);
    const next = this.getLayerBounds(depth + 1);

    const points = [
      { x: curr.left, y: curr.top },
      { x: this.viewportWidth, y: curr.top },
      { x: this.viewportWidth, y: next.top },
      { x: next.left, y: next.top },
    ];

    this.drawSolidPattern(ctx, points, '#808080');

    return canvas;
  }

  private generateCeilingSegmentExtendBoth(depth: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = this.viewportWidth;
    canvas.height = this.viewportHeight;
    const ctx = canvas.getContext('2d')!;

    const next = this.getLayerBounds(depth + 1);

    const points = [
      { x: 0, y: 0 },
      { x: this.viewportWidth, y: 0 },
      { x: this.viewportWidth, y: next.top },
      { x: 0, y: next.top },
    ];

    this.drawSolidPattern(ctx, points, '#808080');

    return canvas;
  }

  private generateLeftWallSegment(depth: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = this.viewportWidth;
    canvas.height = this.viewportHeight;
    const ctx = canvas.getContext('2d')!;

    const curr = this.getLayerBounds(depth);
    const next = this.getLayerBounds(depth + 1);

    const points = [
      { x: curr.left, y: curr.top },
      { x: curr.left, y: curr.bottom },
      { x: next.left, y: next.bottom },
      { x: next.left, y: next.top },
    ];

    this.drawBrickPattern(ctx, points);

    return canvas;
  }

  private generateRightWallSegment(depth: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = this.viewportWidth;
    canvas.height = this.viewportHeight;
    const ctx = canvas.getContext('2d')!;

    const curr = this.getLayerBounds(depth);
    const next = this.getLayerBounds(depth + 1);

    const points = [
      { x: curr.right, y: curr.top },
      { x: curr.right, y: curr.bottom },
      { x: next.right, y: next.bottom },
      { x: next.right, y: next.top },
    ];

    this.drawBrickPattern(ctx, points);

    return canvas;
  }

  private generateLeftCorridorFarWallSegment(depth: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = this.viewportWidth;
    canvas.height = this.viewportHeight;
    const ctx = canvas.getContext('2d')!;

    const curr = this.getLayerBounds(depth);
    const next = this.getLayerBounds(depth + 1);

    const points = [
      { x: curr.left, y: curr.top },
      { x: curr.left, y: curr.bottom },
      { x: next.left, y: next.bottom },
      { x: next.left, y: next.top },
    ];

    this.drawBrickPattern(ctx, points);

    return canvas;
  }

  private generateRightCorridorFarWallSegment(depth: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = this.viewportWidth;
    canvas.height = this.viewportHeight;
    const ctx = canvas.getContext('2d')!;

    const curr = this.getLayerBounds(depth);
    const next = this.getLayerBounds(depth + 1);

    const points = [
      { x: curr.right, y: curr.top },
      { x: curr.right, y: curr.bottom },
      { x: next.right, y: next.bottom },
      { x: next.right, y: next.top },
    ];

    this.drawBrickPattern(ctx, points);

    return canvas;
  }

  private generateFrontWallSegment(depth: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = this.viewportWidth;
    canvas.height = this.viewportHeight;
    const ctx = canvas.getContext('2d')!;

    const bounds = this.getLayerBounds(depth);

    const points = [
      { x: bounds.left, y: bounds.top },
      { x: bounds.right, y: bounds.top },
      { x: bounds.right, y: bounds.bottom },
      { x: bounds.left, y: bounds.bottom },
    ];

    this.drawBrickPattern(ctx, points);

    return canvas;
  }

  private drawBrickPattern(ctx: CanvasRenderingContext2D, points: Point2D[]): void {
    const baseColor = '#B0B0B0';
    const mortarColor = '#505050';

    this.fillPolygon(ctx, points, baseColor);

    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));
    const totalHeight = maxY - minY;

    if (totalHeight < 2) return;

    const brickHeight = Math.max(4, 12);
    const brickWidth = brickHeight * 2.5;

    ctx.strokeStyle = mortarColor;
    ctx.lineWidth = Math.max(2, 3);

    let row = 0;
    for (let y = minY; y < maxY; y += brickHeight) {
      const offset = (row % 2) * (brickWidth / 2);
      const t = (y - minY) / totalHeight;

      const leftX = this.interpolateEdge(points, 'left', t);
      const rightX = this.interpolateEdge(points, 'right', t);

      ctx.beginPath();
      ctx.moveTo(leftX, y);
      ctx.lineTo(rightX, y);
      ctx.stroke();

      const rowWidth = rightX - leftX;
      const numBricks = Math.floor(rowWidth / brickWidth);

      for (let i = 1; i < numBricks; i++) {
        const brickT = (i * brickWidth + offset) / rowWidth;
        if (brickT > 0 && brickT < 1) {
          const drawX = leftX + brickT * rowWidth;
          const nextY = Math.min(y + brickHeight, maxY);
          const nextT = (nextY - minY) / totalHeight;
          const nextLeftX = this.interpolateEdge(points, 'left', nextT);
          const nextRightX = this.interpolateEdge(points, 'right', nextT);
          const endX = nextLeftX + brickT * (nextRightX - nextLeftX);

          ctx.beginPath();
          ctx.moveTo(drawX, y);
          ctx.lineTo(endX, nextY);
          ctx.stroke();
        }
      }

      row++;
    }
  }

  private drawTiledPattern(ctx: CanvasRenderingContext2D, points: Point2D[], tileSize: number): void {
    const baseColor = '#707070';
    const lineColor = '#505050';

    this.fillPolygon(ctx, points, baseColor);

    const nearLeft = points[0];
    const nearRight = points[1];
    const farRight = points[2];
    const farLeft = points[3];

    const minY = Math.min(nearLeft.y, nearRight.y);
    const maxY = Math.max(farLeft.y, farRight.y);
    const totalHeight = maxY - minY;

    if (totalHeight < 2) return;

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;

    for (let y = minY; y < maxY; y += tileSize) {
      const t = (y - minY) / totalHeight;
      const leftX = nearLeft.x + (farLeft.x - nearLeft.x) * t;
      const rightX = nearRight.x + (farRight.x - nearRight.x) * t;

      ctx.beginPath();
      ctx.moveTo(leftX, y);
      ctx.lineTo(rightX, y);
      ctx.stroke();
    }

    const nearWidth = nearRight.x - nearLeft.x;
    const numVerticalLines = Math.floor(nearWidth / tileSize);

    for (let i = 1; i < numVerticalLines; i++) {
      const t = i / numVerticalLines;
      const nearX = nearLeft.x + t * nearWidth;
      const farX = farLeft.x + t * (farRight.x - farLeft.x);

      ctx.beginPath();
      ctx.moveTo(nearX, nearLeft.y);
      ctx.lineTo(farX, farLeft.y);
      ctx.stroke();
    }
  }

  private drawSolidPattern(ctx: CanvasRenderingContext2D, points: Point2D[], color: string): void {
    this.fillPolygon(ctx, points, color);
  }

  private fillPolygon(ctx: CanvasRenderingContext2D, points: Point2D[], fillColor: string): void {
    if (points.length < 3) return;

    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fill();
  }

  private interpolateEdge(points: Point2D[], side: 'left' | 'right', t: number): number {
    if (side === 'left') {
      const topLeft = points[0];
      const bottomLeft = points[3];
      return topLeft.x + (bottomLeft.x - topLeft.x) * t;
    } else {
      const topRight = points[1];
      const bottomRight = points[2];
      return topRight.x + (bottomRight.x - topRight.x) * t;
    }
  }
}
