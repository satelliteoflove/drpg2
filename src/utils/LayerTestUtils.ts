// Utility types for layer testing - LayerConfig is used internally by RenderManager
import { RenderManager } from '../core/RenderManager';
import { ErrorHandler, ErrorSeverity } from './ErrorHandler';

export interface LayerDebugInfo {
  name: string;
  zIndex: number;
  isDirty: boolean;
  persistent: boolean;
  canvasWidth: number;
  canvasHeight: number;
  hasContent: boolean;
  contentBounds?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

export interface LayerTestResult {
  passed: boolean;
  message: string;
  layerName?: string;
  details?: any;
}

/**
 * Testing and debugging utilities for the layer rendering system
 */
export class LayerTestUtils {
  private static debugOverlayEnabled = false;
  private static debugOverlayContext: CanvasRenderingContext2D | null = null;

  /**
   * Enable visual debugging overlay for layers
   */
  static enableDebugOverlay(ctx: CanvasRenderingContext2D): void {
    this.debugOverlayEnabled = true;
    this.debugOverlayContext = ctx;
  }

  /**
   * Disable visual debugging overlay
   */
  static disableDebugOverlay(): void {
    this.debugOverlayEnabled = false;
    this.debugOverlayContext = null;
  }

  /**
   * Analyze canvas content to detect if it has any visible content
   */
  static hasVisibleContent(canvas: HTMLCanvasElement): boolean {
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Check if any pixel has non-zero alpha (is visible)
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 0) return true;
    }
    return false;
  }

  /**
   * Get bounding box of visible content in a canvas
   */
  static getContentBounds(canvas: HTMLCanvasElement): { minX: number; minY: number; maxX: number; maxY: number } | null {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let minX = canvas.width, minY = canvas.height;
    let maxX = 0, maxY = 0;
    let hasContent = false;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        if (data[i + 3] > 0) { // Has alpha
          hasContent = true;
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    return hasContent ? { minX, minY, maxX, maxY } : null;
  }

  /**
   * Get detailed information about all layers
   */
  static analyzeLayers(renderManager: RenderManager): LayerDebugInfo[] {
    const layers: LayerDebugInfo[] = [];
    
    // Get all layers from the render manager
    const allLayers = renderManager.getAllLayers();
    
    for (const [name, layer] of allLayers) {
      if (name === 'main') continue; // Skip main layer
      
      const contentBounds = this.getContentBounds(layer.canvas);
      
      layers.push({
        name: layer.name,
        zIndex: layer.zIndex,
        isDirty: layer.isDirty,
        persistent: layer.persistent,
        canvasWidth: layer.canvas.width,
        canvasHeight: layer.canvas.height,
        hasContent: contentBounds !== null,
        contentBounds: contentBounds || undefined,
      });
    }
    
    return layers.sort((a, b) => a.zIndex - b.zIndex);
  }

  /**
   * Test if layer dimensions match main canvas
   */
  static testLayerDimensions(renderManager: RenderManager, mainCanvas: HTMLCanvasElement): LayerTestResult[] {
    const results: LayerTestResult[] = [];
    const layerNames = ['background', 'dungeon', 'entities', 'effects', 'ui', 'debug'];
    
    for (const name of layerNames) {
      const layer = renderManager.getLayer(name);
      if (layer) {
        const widthMatch = layer.canvas.width === mainCanvas.width;
        const heightMatch = layer.canvas.height === mainCanvas.height;
        
        results.push({
          passed: widthMatch && heightMatch,
          message: widthMatch && heightMatch ? 
            `Layer ${name} dimensions match main canvas` : 
            `Layer ${name} dimensions mismatch: ${layer.canvas.width}x${layer.canvas.height} vs ${mainCanvas.width}x${mainCanvas.height}`,
          layerName: name,
          details: {
            layerWidth: layer.canvas.width,
            layerHeight: layer.canvas.height,
            mainWidth: mainCanvas.width,
            mainHeight: mainCanvas.height,
          }
        });
      } else {
        results.push({
          passed: false,
          message: `Layer ${name} not found`,
          layerName: name,
        });
      }
    }
    
    return results;
  }

  /**
   * Test layer z-index ordering
   */
  static testLayerOrdering(renderManager: RenderManager): LayerTestResult[] {
    const results: LayerTestResult[] = [];
    const layers = this.analyzeLayers(renderManager);
    
    // Expected z-index order
    const expectedOrder = ['background', 'dungeon', 'entities', 'effects', 'ui', 'debug'];
    const expectedZIndexes = [1, 2, 3, 4, 5, 6];
    
    for (let i = 0; i < expectedOrder.length; i++) {
      const layer = layers.find(l => l.name === expectedOrder[i]);
      if (layer) {
        const correctZIndex = layer.zIndex === expectedZIndexes[i];
        results.push({
          passed: correctZIndex,
          message: correctZIndex ? 
            `Layer ${layer.name} has correct z-index: ${layer.zIndex}` :
            `Layer ${layer.name} has incorrect z-index: ${layer.zIndex}, expected: ${expectedZIndexes[i]}`,
          layerName: layer.name,
          details: { actual: layer.zIndex, expected: expectedZIndexes[i] }
        });
      }
    }
    
    return results;
  }

  /**
   * Test that layers are properly composited to main canvas
   */
  static testLayerComposition(renderManager: RenderManager, mainCanvas: HTMLCanvasElement): LayerTestResult {
    const mainHasContent = this.hasVisibleContent(mainCanvas);
    const layers = this.analyzeLayers(renderManager);
    const layersWithContent = layers.filter(l => l.hasContent);
    
    if (layersWithContent.length > 0 && !mainHasContent) {
      return {
        passed: false,
        message: `Layer composition failed: ${layersWithContent.length} layers have content but main canvas is empty`,
        details: {
          layersWithContent: layersWithContent.map(l => l.name),
          mainCanvasHasContent: mainHasContent
        }
      };
    }
    
    if (layersWithContent.length === 0 && mainHasContent) {
      return {
        passed: true,
        message: 'Main canvas has content but layers are empty - might be using direct rendering',
        details: {
          layersWithContent: [],
          mainCanvasHasContent: mainHasContent
        }
      };
    }
    
    return {
      passed: true,
      message: 'Layer composition appears correct',
      details: {
        layersWithContent: layersWithContent.map(l => l.name),
        mainCanvasHasContent: mainHasContent
      }
    };
  }

  /**
   * Visual debug overlay showing layer information
   */
  static renderDebugOverlay(renderManager: RenderManager): void {
    if (!this.debugOverlayEnabled || !this.debugOverlayContext) return;
    
    const ctx = this.debugOverlayContext;
    const layers = this.analyzeLayers(renderManager);
    
    // Draw layer information overlay
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, 10, 300, 200);
    
    ctx.fillStyle = '#00ff00';
    ctx.font = '12px monospace';
    ctx.fillText('Layer Debug Info:', 15, 30);
    
    let y = 50;
    for (const layer of layers) {
      const statusColor = layer.isDirty ? '#ffff00' : '#00ff00';
      const contentIndicator = layer.hasContent ? '●' : '○';
      
      ctx.fillStyle = statusColor;
      ctx.fillText(`${contentIndicator} ${layer.name} (z:${layer.zIndex}) ${layer.isDirty ? 'DIRTY' : 'CLEAN'}`, 15, y);
      
      if (layer.contentBounds) {
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText(`  Content: ${layer.contentBounds.minX},${layer.contentBounds.minY} to ${layer.contentBounds.maxX},${layer.contentBounds.maxY}`, 15, y + 12);
        y += 24;
      } else {
        y += 15;
      }
    }
    
    ctx.restore();
  }

  /**
   * Run comprehensive layer tests
   */
  static runLayerTests(renderManager: RenderManager, mainCanvas: HTMLCanvasElement): {
    passed: number;
    failed: number;
    results: LayerTestResult[];
    summary: string;
  } {
    const allResults: LayerTestResult[] = [];
    
    // Test layer dimensions
    allResults.push(...this.testLayerDimensions(renderManager, mainCanvas));
    
    // Test layer ordering
    allResults.push(...this.testLayerOrdering(renderManager));
    
    // Test layer composition
    allResults.push(this.testLayerComposition(renderManager, mainCanvas));
    
    const passed = allResults.filter(r => r.passed).length;
    const failed = allResults.filter(r => !r.passed).length;
    
    const summary = `Layer Tests: ${passed} passed, ${failed} failed`;
    
    // Log results
    ErrorHandler.logError(
      summary,
      failed > 0 ? ErrorSeverity.MEDIUM : ErrorSeverity.LOW,
      'LayerTestUtils.runLayerTests'
    );
    
    return {
      passed,
      failed,
      results: allResults,
      summary
    };
  }

  /**
   * Create a visual test pattern on a canvas for debugging
   */
  static drawTestPattern(ctx: CanvasRenderingContext2D, layerName: string): void {
    const colors = {
      background: '#001100',
      dungeon: '#110000',
      entities: '#000011',
      effects: '#110011',
      ui: '#111100',
      debug: '#111111',
    };
    
    const color = colors[layerName as keyof typeof colors] || '#333333';
    
    ctx.save();
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 100, 100);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.fillText(layerName, 10, 20);
    
    // Draw a border to make layer visible
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    ctx.restore();
  }
}