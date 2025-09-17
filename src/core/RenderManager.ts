import {
  LayerConfig,
  RenderingOptimizer,
  SpatialPartition,
  SpriteCache,
} from './RenderingOptimizer';
import { GAME_CONFIG } from '../config/GameConstants';
import { ErrorHandler } from '../utils/ErrorHandler';
import { Scene } from './Scene';

export interface RenderStats {
  fps: number;
  frameTime: number;
  drawnObjects: number;
  culledObjects: number;
  cacheHits: number;
  cacheMisses: number;
  layerCount: number;
  dirtyRegions: number;
}

export class RenderManager {
  private optimizer: RenderingOptimizer;
  private spriteCache: SpriteCache;
  private spatialPartition: SpatialPartition;
  private stats: RenderStats;
  private frameStartTime: number = 0;
  private drawnObjects: number = 0;
  private culledObjects: number = 0;
  private cacheHits: number = 0;
  private cacheMisses: number = 0;

  // Layer definitions
  private static readonly LAYERS = {
    BACKGROUND: 'background',
    DUNGEON: 'dungeon',
    ENTITIES: 'entities',
    EFFECTS: 'effects',
    UI: 'ui',
    DEBUG: 'debug',
  };

  constructor(private canvas: HTMLCanvasElement) {
    this.optimizer = new RenderingOptimizer(canvas);
    this.spriteCache = new SpriteCache();
    this.spatialPartition = new SpatialPartition(
      canvas.width,
      canvas.height,
      GAME_CONFIG.RENDERING.SPATIAL_PARTITION_CELL_SIZE || 32
    );

    this.stats = {
      fps: 0,
      frameTime: 0,
      drawnObjects: 0,
      culledObjects: 0,
      cacheHits: 0,
      cacheMisses: 0,
      layerCount: 0,
      dirtyRegions: 0,
    };

    this.setupLayers();
  }

  private setupLayers(): void {
    // Create rendering layers in order
    this.optimizer.createLayer(RenderManager.LAYERS.BACKGROUND, 1, true);
    this.optimizer.createLayer(RenderManager.LAYERS.DUNGEON, 2, true);
    this.optimizer.createLayer(RenderManager.LAYERS.ENTITIES, 3, false);
    this.optimizer.createLayer(RenderManager.LAYERS.EFFECTS, 4, false);
    this.optimizer.createLayer(RenderManager.LAYERS.UI, 5, false);
    this.optimizer.createLayer(RenderManager.LAYERS.DEBUG, 6, false);
  }

  public startFrame(currentTime: number): boolean {
    this.frameStartTime = currentTime;
    this.resetFrameStats();

    // Check if we should skip this frame for performance
    if (this.optimizer.shouldSkipFrame(currentTime)) {
      return false;
    }

    this.optimizer.startFrame(currentTime);
    return true;
  }

  public endFrame(): void {
    const frameTime = performance.now() - this.frameStartTime;

    this.optimizer.renderLayers();

    this.updateStats(frameTime);
  }

  private resetFrameStats(): void {
    this.drawnObjects = 0;
    this.culledObjects = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  private updateStats(frameTime: number): void {
    this.stats = {
      fps: this.optimizer.getFPS(),
      frameTime,
      drawnObjects: this.drawnObjects,
      culledObjects: this.culledObjects,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      layerCount: this.optimizer.getLayerCount(),
      dirtyRegions: this.optimizer.getDirtyRegionsCount(),
    };
  }

  public renderScene(scene: Scene): void {
    ErrorHandler.safeCanvasOperation(
      () => {
        // Use the dungeon layer context for scene rendering
        const dungeonLayer = this.optimizer.getLayer(RenderManager.LAYERS.DUNGEON);
        if (dungeonLayer) {
          this.optimizer.clearLayer(RenderManager.LAYERS.DUNGEON);
          scene.render(dungeonLayer.context);
          this.optimizer.markLayerDirty(RenderManager.LAYERS.DUNGEON);
        }

        return undefined;
      },
      undefined,
      'RenderManager.renderScene'
    );
  }

  public renderBackground(renderFn: (ctx: CanvasRenderingContext2D) => void): void {
    const layer = this.optimizer.getLayer(RenderManager.LAYERS.BACKGROUND);
    if (layer) {
      // Always render background - it's the foundation layer
      this.optimizer.clearLayer(RenderManager.LAYERS.BACKGROUND);
      this.optimizer.batchDrawCalls(layer.context, renderFn);
      this.optimizer.markLayerDirty(RenderManager.LAYERS.BACKGROUND);
    }
  }

  public renderDungeon(renderFn: (ctx: CanvasRenderingContext2D) => void): void {
    const layer = this.optimizer.getLayer(RenderManager.LAYERS.DUNGEON);
    if (layer) {
      this.optimizer.clearLayer(RenderManager.LAYERS.DUNGEON);
      this.optimizer.batchDrawCalls(layer.context, renderFn);
      this.optimizer.markLayerDirty(RenderManager.LAYERS.DUNGEON);
    }
  }

  public renderEntities(renderFn: (ctx: CanvasRenderingContext2D) => void): void {
    const layer = this.optimizer.getLayer(RenderManager.LAYERS.ENTITIES);
    if (layer) {
      // Clear entities layer before rendering new content
      this.optimizer.clearLayer(RenderManager.LAYERS.ENTITIES);
      this.optimizer.batchDrawCalls(layer.context, renderFn);
      this.optimizer.markLayerDirty(RenderManager.LAYERS.ENTITIES);
    }
  }

  public renderEffects(renderFn: (ctx: CanvasRenderingContext2D) => void): void {
    const layer = this.optimizer.getLayer(RenderManager.LAYERS.EFFECTS);
    if (layer) {
      // Clear effects layer before rendering new content
      this.optimizer.clearLayer(RenderManager.LAYERS.EFFECTS);
      this.optimizer.batchDrawCalls(layer.context, renderFn);
      this.optimizer.markLayerDirty(RenderManager.LAYERS.EFFECTS);
    }
  }

  public renderUI(renderFn: (ctx: CanvasRenderingContext2D) => void): void {
    const layer = this.optimizer.getLayer(RenderManager.LAYERS.UI);
    if (layer) {
      // Clear UI layer before rendering new content
      this.optimizer.clearLayer(RenderManager.LAYERS.UI);
      this.optimizer.batchDrawCalls(layer.context, renderFn);
      this.optimizer.markLayerDirty(RenderManager.LAYERS.UI);
    }
  }

  public renderDebugInfo(renderFn: (ctx: CanvasRenderingContext2D) => void): void {
    if (!GAME_CONFIG.DEBUG_MODE) return;

    const layer = this.optimizer.getLayer(RenderManager.LAYERS.DEBUG);
    if (layer) {
      this.optimizer.batchDrawCalls(layer.context, renderFn);
      this.optimizer.markLayerDirty(RenderManager.LAYERS.DEBUG);
    }
  }

  public drawSprite(
    layerName: string,
    spriteKey: string,
    x: number,
    y: number,
    width?: number,
    height?: number
  ): void {
    const layer = this.optimizer.getLayer(layerName);
    if (!layer) return;

    const sprite = this.spriteCache.get(spriteKey);
    if (sprite) {
      this.cacheHits++;
    } else {
      this.cacheMisses++;
      // In a real implementation, you would load the sprite here
      return;
    }

    // Simple frustum culling
    if (this.isInViewport(x, y, width ?? sprite.width, height ?? sprite.height)) {
      if (width !== undefined && height !== undefined) {
        layer.context.drawImage(sprite, x, y, width, height);
      } else {
        layer.context.drawImage(sprite, x, y);
      }
      this.drawnObjects++;
    } else {
      this.culledObjects++;
    }
  }

  private isInViewport(x: number, y: number, width: number, height: number): boolean {
    return !(x + width < 0 || x > this.canvas.width || y + height < 0 || y > this.canvas.height);
  }

  public markRegionDirty(x: number, y: number, width: number, height: number): void {
    this.optimizer.markRegionDirty(x, y, width, height);
  }

  public markBackgroundDirty(): void {
    this.optimizer.markLayerDirty(RenderManager.LAYERS.BACKGROUND);
  }

  public markDungeonDirty(): void {
    this.optimizer.markLayerDirty(RenderManager.LAYERS.DUNGEON);
  }

  public addSpriteToCache(key: string, sprite: HTMLImageElement | HTMLCanvasElement): void {
    this.spriteCache.set(key, sprite);
  }

  public getStats(): RenderStats {
    return { ...this.stats };
  }

  public getLayer(name: string): LayerConfig | null {
    return this.optimizer.getLayer(name);
  }

  public resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;

    // Resize all layers
    for (const layer of Object.values(RenderManager.LAYERS)) {
      const layerConfig = this.optimizer.getLayer(layer);
      if (layerConfig && layerConfig.canvas !== this.canvas) {
        layerConfig.canvas.width = width;
        layerConfig.canvas.height = height;
        this.optimizer.markLayerDirty(layer);
      }
    }

    // Update spatial partition
    this.spatialPartition = new SpatialPartition(width, height);
  }

  public getAllLayers(): Map<string, LayerConfig> {
    return this.optimizer.getAllLayers();
  }

  public getLayerNames(): string[] {
    return this.optimizer.getLayerNames();
  }

  public forceAllLayersDirty(): void {
    this.optimizer.forceAllLayersDirty();
  }

  public resetForSceneChange(): void {
    // Clear all dynamic (non-persistent) layers when switching scenes
    this.clearDynamicLayers();
    // Force all layers dirty for the new scene
    this.forceAllLayersDirty();
    // Verify layer integrity after reset
    this.verifyLayerIntegrity();
  }

  private clearDynamicLayers(): void {
    // Clear non-persistent layers that should be reset between scenes
    this.optimizer.clearLayer(RenderManager.LAYERS.DUNGEON);
    this.optimizer.clearLayer(RenderManager.LAYERS.ENTITIES);
    this.optimizer.clearLayer(RenderManager.LAYERS.EFFECTS);
    this.optimizer.clearLayer(RenderManager.LAYERS.UI);
    this.optimizer.clearLayer(RenderManager.LAYERS.DEBUG);
    // Note: Background layer is persistent and will be redrawn by the new scene
  }

  public verifyLayerIntegrity(): boolean {
    return this.optimizer.verifyLayerIntegrity();
  }

  public debugLayers(): void {
    if (GAME_CONFIG.DEBUG_MODE) {
      console.log('=== Layer Debug Info ===');
      const layers = this.getAllLayers();
      for (const [name, layer] of layers) {
        console.log(`Layer ${name}:`, {
          zIndex: layer.zIndex,
          isDirty: layer.isDirty,
          persistent: layer.persistent,
          dimensions: `${layer.canvas.width}x${layer.canvas.height}`,
        });
      }
    }
  }

  public dispose(): void {
    this.optimizer.dispose();
    this.spriteCache.clear();
    this.spatialPartition.clear();
  }
}
