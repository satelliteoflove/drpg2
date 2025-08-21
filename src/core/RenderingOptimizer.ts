import { ErrorHandler, ErrorSeverity } from '../utils/ErrorHandler';

export interface LayerConfig {
  name: string;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  zIndex: number;
  isDirty: boolean;
  persistent: boolean;
}

export interface DirtyRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class RenderingOptimizer {
  private layers: Map<string, LayerConfig> = new Map();
  private dirtyRegions: Set<DirtyRegion> = new Set();
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private fps: number = 0;
  private skipFrameThreshold: number = 1000 / 30; // 30 FPS threshold
  private targetFPS: number = 60;
  private adaptivePerformance: boolean = true;

  constructor(private mainCanvas: HTMLCanvasElement) {
    this.setupMainLayer();
    this.optimizeForDevice();
  }

  private optimizeForDevice(): void {
    // Detect lower-end devices and adjust performance settings
    const isLowEndDevice = this.detectLowEndDevice();
    if (isLowEndDevice) {
      this.targetFPS = 30;
      this.skipFrameThreshold = 1000 / 15; // More aggressive frame skipping
      this.adaptivePerformance = true;
    }
  }

  private detectLowEndDevice(): boolean {
    // Simple heuristics to detect lower-end devices
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    // Test rendering performance with a simple operation
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      ctx.fillRect(0, 0, 100, 100);
    }
    const end = performance.now();
    
    // If simple operations take too long, assume lower-end device
    return (end - start) > 10; // 10ms threshold
  }

  private setupMainLayer(): void {
    const mainCtx = this.mainCanvas.getContext('2d');
    if (!mainCtx) {
      throw new Error('Failed to get main canvas context');
    }

    this.layers.set('main', {
      name: 'main',
      canvas: this.mainCanvas,
      context: mainCtx,
      zIndex: 0,
      isDirty: true,
      persistent: false,
    });
  }

  public createLayer(
    name: string,
    zIndex: number = 0,
    persistent: boolean = false
  ): LayerConfig {
    if (this.layers.has(name)) {
      ErrorHandler.logError(
        `Layer ${name} already exists`,
        ErrorSeverity.MEDIUM,
        'RenderingOptimizer.createLayer'
      );
      return this.layers.get(name)!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = this.mainCanvas.width;
    canvas.height = this.mainCanvas.height;
    canvas.style.position = 'absolute';
    canvas.style.zIndex = zIndex.toString();
    canvas.style.pointerEvents = 'none';

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error(`Failed to create context for layer ${name}`);
    }

    // Copy rendering settings from main canvas context
    const mainContext = this.mainCanvas.getContext('2d');
    if (mainContext) {
      context.imageSmoothingEnabled = mainContext.imageSmoothingEnabled;
      context.imageSmoothingQuality = mainContext.imageSmoothingQuality;
      context.textBaseline = mainContext.textBaseline;
      context.textAlign = mainContext.textAlign;
    } else {
      // Fallback settings for layer
      context.imageSmoothingEnabled = false; // Pixel art style
      context.imageSmoothingQuality = 'low';
      context.textBaseline = 'top';
      context.textAlign = 'start';
    }

    const layerConfig: LayerConfig = {
      name,
      canvas,
      context,
      zIndex,
      isDirty: true,
      persistent,
    };

    this.layers.set(name, layerConfig);
    return layerConfig;
  }

  public getLayer(name: string): LayerConfig | null {
    return this.layers.get(name) || null;
  }

  public markLayerDirty(name: string): void {
    const layer = this.layers.get(name);
    if (layer) {
      layer.isDirty = true;
    }
  }

  public markRegionDirty(x: number, y: number, width: number, height: number): void {
    this.dirtyRegions.add({ x, y, width, height });
  }

  public clearLayer(name: string): void {
    const layer = this.layers.get(name);
    if (layer) {
      layer.context.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
      layer.isDirty = false;
    }
  }

  public shouldSkipFrame(currentTime: number): boolean {
    const deltaTime = currentTime - this.lastFrameTime;
    
    // Adaptive performance: adjust threshold based on current performance
    if (this.adaptivePerformance && this.frameCount % 60 === 0) {
      if (this.fps < this.targetFPS * 0.8) {
        // Performance is poor, be more aggressive with frame skipping
        this.skipFrameThreshold = Math.min(this.skipFrameThreshold * 1.1, 1000 / 15);
      } else if (this.fps > this.targetFPS * 0.95) {
        // Performance is good, reduce frame skipping
        this.skipFrameThreshold = Math.max(this.skipFrameThreshold * 0.95, 1000 / this.targetFPS);
      }
    }
    
    return deltaTime < this.skipFrameThreshold;
  }

  public startFrame(currentTime: number): void {
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
    this.frameCount++;

    // Calculate FPS every second
    if (this.frameCount % 60 === 0) {
      this.fps = 1000 / deltaTime;
    }
  }

  public renderLayers(): void {
    const mainLayer = this.layers.get('main');
    if (!mainLayer) return;

    // Clear main canvas with background color before compositing layers
    mainLayer.context.fillStyle = '#000';
    mainLayer.context.fillRect(0, 0, mainLayer.canvas.width, mainLayer.canvas.height);

    // Sort layers by z-index and composite them
    const sortedLayers = Array.from(this.layers.values())
      .filter(layer => layer.name !== 'main')
      .sort((a, b) => a.zIndex - b.zIndex);

    // Always composite all layers to main canvas
    for (const layer of sortedLayers) {
      this.compositeLayer(layer, mainLayer);
      // Only mark clean after compositing if it was dirty
      if (layer.isDirty) {
        layer.isDirty = false;
      }
    }

    this.clearDirtyRegions();
  }

  private compositeLayer(sourceLayer: LayerConfig, targetLayer: LayerConfig): void {
    ErrorHandler.safeCanvasOperation(
      () => {
        targetLayer.context.drawImage(sourceLayer.canvas, 0, 0);
        return undefined;
      },
      undefined,
      `RenderingOptimizer.compositeLayer.${sourceLayer.name}`
    );
  }

  private clearDirtyRegions(): void {
    this.dirtyRegions.clear();
  }

  public optimizeImageRendering(context: CanvasRenderingContext2D): void {
    context.imageSmoothingEnabled = false; // Pixel art style
    // Fallback for older browser support
    (context as any).webkitImageSmoothingEnabled = false;
    (context as any).mozImageSmoothingEnabled = false;
    (context as any).msImageSmoothingEnabled = false;
  }

  public batchDrawCalls(
    context: CanvasRenderingContext2D,
    drawFunction: (ctx: CanvasRenderingContext2D) => void
  ): void {
    ErrorHandler.safeCanvasOperation(
      () => {
        context.save();
        drawFunction(context);
        context.restore();
        return undefined;
      },
      undefined,
      'RenderingOptimizer.batchDrawCalls'
    );
  }

  public getFPS(): number {
    return this.fps;
  }

  public getFrameCount(): number {
    return this.frameCount;
  }

  public getDirtyRegionsCount(): number {
    return this.dirtyRegions.size;
  }

  public getLayerCount(): number {
    return this.layers.size;
  }

  public getAllLayers(): Map<string, LayerConfig> {
    return new Map(this.layers);
  }

  public getLayerNames(): string[] {
    return Array.from(this.layers.keys());
  }

  public forceAllLayersDirty(): void {
    for (const layer of this.layers.values()) {
      layer.isDirty = true;
    }
  }

  public verifyLayerIntegrity(): boolean {
    // Check that all layers have correct dimensions and contexts
    for (const layer of this.layers.values()) {
      if (layer.name === 'main') continue;
      
      if (layer.canvas.width !== this.mainCanvas.width || 
          layer.canvas.height !== this.mainCanvas.height) {
        ErrorHandler.logError(
          `Layer ${layer.name} has incorrect dimensions: ${layer.canvas.width}x${layer.canvas.height}, expected: ${this.mainCanvas.width}x${this.mainCanvas.height}`,
          ErrorSeverity.HIGH,
          'RenderingOptimizer.verifyLayerIntegrity'
        );
        return false;
      }
      
      if (!layer.context) {
        ErrorHandler.logError(
          `Layer ${layer.name} has no context`,
          ErrorSeverity.HIGH,
          'RenderingOptimizer.verifyLayerIntegrity'
        );
        return false;
      }
    }
    return true;
  }

  public dispose(): void {
    // Clean up layers except main
    for (const [name, layer] of this.layers) {
      if (name !== 'main' && layer.canvas.parentNode) {
        layer.canvas.parentNode.removeChild(layer.canvas);
      }
    }
    this.layers.clear();
    this.dirtyRegions.clear();
  }
}

export class SpriteCache {
  private cache: Map<string, HTMLImageElement | HTMLCanvasElement> = new Map();
  private maxCacheSize: number = 100;

  public get(key: string): HTMLImageElement | HTMLCanvasElement | null {
    return this.cache.get(key) || null;
  }

  public set(
    key: string,
    sprite: HTMLImageElement | HTMLCanvasElement
  ): void {
    if (this.cache.size >= this.maxCacheSize) {
      // Remove oldest entry (simple LRU)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, sprite);
  }

  public has(key: string): boolean {
    return this.cache.has(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  public getCacheSize(): number {
    return this.cache.size;
  }

  public getMaxCacheSize(): number {
    return this.maxCacheSize;
  }

  public setMaxCacheSize(size: number): void {
    this.maxCacheSize = size;
    while (this.cache.size > this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }
}

export class SpatialPartition {
  private grid: Map<string, Set<any>> = new Map();
  private cellSize: number;

  constructor(_width: number, _height: number, cellSize: number = 32) {
    this.cellSize = cellSize;
  }

  public insert(x: number, y: number, object: any): void {
    const cellKey = this.getCellKey(x, y);
    if (!this.grid.has(cellKey)) {
      this.grid.set(cellKey, new Set());
    }
    this.grid.get(cellKey)!.add(object);
  }

  public remove(x: number, y: number, object: any): void {
    const cellKey = this.getCellKey(x, y);
    const cell = this.grid.get(cellKey);
    if (cell) {
      cell.delete(object);
      if (cell.size === 0) {
        this.grid.delete(cellKey);
      }
    }
  }

  public query(x: number, y: number, width: number, height: number): Set<any> {
    const result = new Set<any>();
    
    const startCellX = Math.floor(x / this.cellSize);
    const endCellX = Math.floor((x + width) / this.cellSize);
    const startCellY = Math.floor(y / this.cellSize);
    const endCellY = Math.floor((y + height) / this.cellSize);

    for (let cellX = startCellX; cellX <= endCellX; cellX++) {
      for (let cellY = startCellY; cellY <= endCellY; cellY++) {
        const cellKey = `${cellX},${cellY}`;
        const cell = this.grid.get(cellKey);
        if (cell) {
          cell.forEach(obj => result.add(obj));
        }
      }
    }

    return result;
  }

  public clear(): void {
    this.grid.clear();
  }

  private getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  public getCellCount(): number {
    return this.grid.size;
  }

  public getTotalObjects(): number {
    let total = 0;
    this.grid.forEach(cell => total += cell.size);
    return total;
  }
}