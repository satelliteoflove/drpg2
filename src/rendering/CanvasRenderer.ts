import { ASCIIGrid, CellStyle, CellMetadata, ASCII_GRID_WIDTH, ASCII_GRID_HEIGHT } from './ASCIIState';
import { SceneDeclaration, RenderLayer } from './SceneDeclaration';
import { SymbolUtils } from './ASCIISymbols';
import { DebugLogger } from '../utils/DebugLogger';

// Constants for rendering
const CHAR_WIDTH = 10;
const CHAR_HEIGHT = 20;
const DEFAULT_FONT = 'monospace';
const DEFAULT_FONT_SIZE = 16;
const DEFAULT_FG_COLOR = '#FFFFFF';
const DEFAULT_BG_COLOR = '#000000';

// Cache for character rendering
interface CharacterCache {
  char: string;
  style: CellStyle;
  canvas: HTMLCanvasElement;
}

// Renderer configuration
export interface RendererConfig {
  charWidth?: number;
  charHeight?: number;
  fontFamily?: string;
  fontSize?: number;
  antialiasing?: boolean;
  letterSpacing?: number;
  lineHeight?: number;
  defaultForeground?: string;
  defaultBackground?: string;
}

// Canvas ASCII Renderer
export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: Required<RendererConfig>;
  private characterCache: Map<string, CharacterCache>;
  private offscreenCanvas?: HTMLCanvasElement;
  private offscreenCtx?: CanvasRenderingContext2D;
  private lastRenderTime: number = 0;
  private frameCount: number = 0;

  constructor(canvas: HTMLCanvasElement, config: RendererConfig = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.ctx = ctx;

    // Initialize configuration with defaults
    this.config = {
      charWidth: config.charWidth || CHAR_WIDTH,
      charHeight: config.charHeight || CHAR_HEIGHT,
      fontFamily: config.fontFamily || DEFAULT_FONT,
      fontSize: config.fontSize || DEFAULT_FONT_SIZE,
      antialiasing: config.antialiasing !== false,
      letterSpacing: config.letterSpacing || 0,
      lineHeight: config.lineHeight || 1.0,
      defaultForeground: config.defaultForeground || DEFAULT_FG_COLOR,
      defaultBackground: config.defaultBackground || DEFAULT_BG_COLOR
    };

    this.characterCache = new Map();
    this.setupCanvas();
    this.createOffscreenCanvas();
  }

  private setupCanvas(): void {
    // Set canvas size based on ASCII grid dimensions
    const width = this.config.charWidth * ASCII_GRID_WIDTH;
    const height = this.config.charHeight * ASCII_GRID_HEIGHT;
    
    this.canvas.width = width;
    this.canvas.height = height;

    // Configure context
    this.ctx.imageSmoothingEnabled = this.config.antialiasing;
    this.ctx.font = `${this.config.fontSize}px ${this.config.fontFamily}`;
    this.ctx.textBaseline = 'top';
    
    DebugLogger.info('CanvasRenderer', `Canvas initialized: ${width}x${height}px`);
  }

  private createOffscreenCanvas(): void {
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = this.canvas.width;
    this.offscreenCanvas.height = this.canvas.height;
    
    const ctx = this.offscreenCanvas.getContext('2d');
    if (ctx) {
      this.offscreenCtx = ctx;
      this.offscreenCtx.imageSmoothingEnabled = this.config.antialiasing;
      this.offscreenCtx.font = `${this.config.fontSize}px ${this.config.fontFamily}`;
      this.offscreenCtx.textBaseline = 'top';
    }
  }

  // Main render method for ASCII grid
  public renderASCIIGrid(grid: ASCIIGrid, dirtyRegions?: Set<string>): void {
    const startTime = performance.now();
    
    // If no dirty regions provided, render everything
    if (!dirtyRegions || dirtyRegions.size === 0) {
      // Clear canvas
      this.ctx.fillStyle = this.config.defaultBackground;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Render each cell
      for (let y = 0; y < grid.height; y++) {
        for (let x = 0; x < grid.width; x++) {
          const char = grid.cells[y][x];
          const metadata = grid.metadata.get(`${x},${y}`);
          this.renderCharacter(x, y, char, metadata);
        }
      }
    } else {
      // Only render dirty regions for optimization
      dirtyRegions.forEach(key => {
        const [xStr, yStr] = key.split(',');
        const x = parseInt(xStr);
        const y = parseInt(yStr);
        
        // Clear the specific cell
        const pixelX = x * this.config.charWidth;
        const pixelY = y * this.config.charHeight;
        this.ctx.fillStyle = this.config.defaultBackground;
        this.ctx.fillRect(pixelX, pixelY, this.config.charWidth, this.config.charHeight);
        
        // Render the character
        const char = grid.cells[y][x];
        const metadata = grid.metadata.get(key);
        this.renderCharacter(x, y, char, metadata);
      });
    }

    // Update performance metrics
    this.frameCount++;
    this.lastRenderTime = performance.now() - startTime;
    
    if (this.frameCount % 60 === 0) {
      const cellsRendered = dirtyRegions ? dirtyRegions.size : grid.width * grid.height;
      DebugLogger.debug('CanvasRenderer', 
        `Render time: ${this.lastRenderTime.toFixed(2)}ms, Cells: ${cellsRendered}`);
    }
  }

  // Render a single character at grid position
  private renderCharacter(
    gridX: number, 
    gridY: number, 
    char: string, 
    metadata?: CellMetadata
  ): void {
    // Calculate pixel position
    const x = gridX * this.config.charWidth;
    const y = gridY * this.config.charHeight;

    // Get style with symbol-based color fallback
    const style = metadata?.style || {};
    let fgColor = style.foreground;
    let bgColor = style.background;
    
    // Use symbol-based coloring if no explicit colors provided
    if (!fgColor || !bgColor) {
      const symbolKey = SymbolUtils.getSymbolKey(char);
      if (symbolKey) {
        const symbolColors = SymbolUtils.getSymbolColor(symbolKey);
        if (symbolColors) {
          fgColor = fgColor || symbolColors.foreground;
          bgColor = bgColor || symbolColors.background;
        }
      }
    }
    
    fgColor = fgColor || this.config.defaultForeground;
    bgColor = bgColor || this.config.defaultBackground;

    // Apply opacity if specified
    const prevAlpha = this.ctx.globalAlpha;
    if (style.opacity !== undefined) {
      this.ctx.globalAlpha = style.opacity;
    }

    // Draw background
    if (bgColor !== this.config.defaultBackground) {
      this.ctx.fillStyle = bgColor;
      this.ctx.fillRect(x, y, this.config.charWidth, this.config.charHeight);
    }

    // Skip empty characters
    if (char === ' ' || char === '') {
      this.ctx.globalAlpha = prevAlpha;
      return;
    }

    // Check cache for non-blinking characters
    if (!style.blink) {
      const cacheKey = this.getCacheKey(char, style);
      const cached = this.characterCache.get(cacheKey);
      
      if (cached) {
        this.ctx.drawImage(cached.canvas, x, y);
        this.ctx.globalAlpha = prevAlpha;
        return;
      }
    }

    // Handle blinking effect
    if (style.blink) {
      const blinkPhase = Math.floor(Date.now() / 500) % 2;
      if (blinkPhase === 0) {
        this.ctx.globalAlpha = prevAlpha;
        return;
      }
    }

    // Draw character
    this.ctx.fillStyle = fgColor;
    
    if (style.bold) {
      this.ctx.font = `bold ${this.config.fontSize}px ${this.config.fontFamily}`;
    }

    // Center character in cell
    const charX = x + Math.floor((this.config.charWidth - this.ctx.measureText(char).width) / 2);
    const charY = y + Math.floor((this.config.charHeight - this.config.fontSize) / 2);
    
    this.ctx.fillText(char, charX, charY);

    // Reset font if it was bold
    if (style.bold) {
      this.ctx.font = `${this.config.fontSize}px ${this.config.fontFamily}`;
    }

    // Restore global alpha
    this.ctx.globalAlpha = prevAlpha;

    // Add to cache if not blinking
    if (!style.blink) {
      this.cacheCharacter(char, style, x, y);
    }
  }

  // Render a complete scene declaration
  public renderScene(scene: SceneDeclaration): void {
    const startTime = performance.now();

    // Clear canvas with scene background
    const bgColor = scene.renderConfig?.clearColor || this.config.defaultBackground;
    this.ctx.fillStyle = bgColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render layers in order
    scene.layers
      .filter(layer => layer.visible)
      .sort((a, b) => a.zIndex - b.zIndex)
      .forEach(layer => {
        this.renderLayer(layer);
      });

    // Render UI elements
    this.renderUIElements(scene);

    // Render animations if any
    if (scene.animations) {
      this.renderAnimations(scene);
    }

    this.lastRenderTime = performance.now() - startTime;
  }

  // Render a single layer
  private renderLayer(layer: RenderLayer): void {
    if (!layer.visible) return;

    // Apply layer opacity if needed
    const prevAlpha = this.ctx.globalAlpha;
    if (layer.opacity !== undefined) {
      this.ctx.globalAlpha = layer.opacity;
    }

    // Apply blend mode if specified
    const prevComposite = this.ctx.globalCompositeOperation;
    if (layer.blendMode && layer.blendMode !== 'normal') {
      this.ctx.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation;
    }

    // Render the layer's grid
    this.renderASCIIGrid(layer.grid);

    // Restore context state
    this.ctx.globalAlpha = prevAlpha;
    this.ctx.globalCompositeOperation = prevComposite;
  }

  // Render UI elements
  private renderUIElements(scene: SceneDeclaration): void {
    scene.uiElements
      .filter(element => element.visible)
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
      .forEach(element => {
        switch (element.type) {
          case 'text':
            this.renderTextElement(element);
            break;
          case 'box':
            this.renderBoxElement(element);
            break;
          case 'list':
            this.renderListElement(element);
            break;
          case 'bar':
            this.renderBarElement(element);
            break;
        }
      });
  }

  // Render text UI element
  private renderTextElement(element: any): void {
    const x = element.position.x * this.config.charWidth;
    const y = element.position.y * this.config.charHeight;
    
    const style = element.style || {};
    this.ctx.fillStyle = style.foreground || this.config.defaultForeground;
    
    if (style.bold) {
      this.ctx.font = `bold ${this.config.fontSize}px ${this.config.fontFamily}`;
    }
    
    if (typeof element.content === 'string') {
      this.ctx.fillText(element.content, x, y);
    } else if (Array.isArray(element.content)) {
      element.content.forEach((line: string, index: number) => {
        this.ctx.fillText(line, x, y + index * this.config.charHeight);
      });
    }
    
    if (style.bold) {
      this.ctx.font = `${this.config.fontSize}px ${this.config.fontFamily}`;
    }
  }

  // Render box UI element
  private renderBoxElement(element: any): void {
    if (!element.size) return;
    
    const x = element.position.x * this.config.charWidth;
    const y = element.position.y * this.config.charHeight;
    const width = element.size.width * this.config.charWidth;
    const height = element.size.height * this.config.charHeight;
    
    const style = element.style || {};
    this.ctx.strokeStyle = style.foreground || this.config.defaultForeground;
    this.ctx.lineWidth = 1;
    
    this.ctx.strokeRect(x, y, width, height);
  }

  // Render list UI element
  private renderListElement(element: any): void {
    if (!Array.isArray(element.content)) return;
    
    const x = element.position.x * this.config.charWidth;
    let y = element.position.y * this.config.charHeight;
    
    const style = element.style || {};
    this.ctx.fillStyle = style.foreground || this.config.defaultForeground;
    
    element.content.forEach((item: string) => {
      this.ctx.fillText(item, x, y);
      y += this.config.charHeight;
    });
  }

  // Render bar UI element (health bar, mana bar, etc)
  private renderBarElement(element: any): void {
    if (!element.size) return;
    
    const x = element.position.x * this.config.charWidth;
    const y = element.position.y * this.config.charHeight;
    const width = element.size.width * this.config.charWidth;
    const height = element.size.height * this.config.charHeight;
    
    const style = element.style || {};
    
    // Draw background
    this.ctx.fillStyle = style.background || '#333333';
    this.ctx.fillRect(x, y, width, height);
    
    // Draw filled portion
    const fillPercent = element.content ? parseFloat(element.content) / 100 : 0;
    this.ctx.fillStyle = style.foreground || '#00FF00';
    this.ctx.fillRect(x, y, width * fillPercent, height);
  }

  // Render animations
  private renderAnimations(_scene: SceneDeclaration): void {
    // This would handle animation frames
    // Implementation depends on animation system design
  }

  // Cache management
  private getCacheKey(char: string, style: CellStyle): string {
    return `${char}_${style.foreground || 'default'}_${style.background || 'default'}_${style.bold ? 'bold' : 'normal'}`;
  }

  private cacheCharacter(char: string, style: CellStyle, x: number, y: number): void {
    if (this.characterCache.size > 1000) {
      // Clear cache if it gets too large
      this.characterCache.clear();
    }

    const cacheCanvas = document.createElement('canvas');
    cacheCanvas.width = this.config.charWidth;
    cacheCanvas.height = this.config.charHeight;
    
    const cacheCtx = cacheCanvas.getContext('2d');
    if (!cacheCtx) return;

    // Copy the character to cache
    cacheCtx.drawImage(
      this.canvas,
      x, y,
      this.config.charWidth, this.config.charHeight,
      0, 0,
      this.config.charWidth, this.config.charHeight
    );

    this.characterCache.set(this.getCacheKey(char, style), {
      char,
      style,
      canvas: cacheCanvas
    });
  }

  // Clear the cache
  public clearCache(): void {
    this.characterCache.clear();
  }

  // Get performance metrics
  public getPerformanceMetrics(): { lastRenderTime: number; frameCount: number } {
    return {
      lastRenderTime: this.lastRenderTime,
      frameCount: this.frameCount
    };
  }

  // Update configuration
  public updateConfig(config: Partial<RendererConfig>): void {
    Object.assign(this.config, config);
    this.setupCanvas();
    this.clearCache();
  }
}