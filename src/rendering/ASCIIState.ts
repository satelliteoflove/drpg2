import { DebugLogger } from '../utils/DebugLogger';

// Constants for ASCII grid dimensions
export const ASCII_GRID_WIDTH = 80;
export const ASCII_GRID_HEIGHT = 25;
export const DEFAULT_EMPTY_CELL = ' ';

// Cell types for different game elements
export type CellType = 
  | 'wall' 
  | 'floor' 
  | 'door' 
  | 'stairs' 
  | 'entity' 
  | 'ui' 
  | 'border'
  | 'text'
  | 'empty';

// Visual style information for cells
export interface CellStyle {
  foreground?: string;  // Text color
  background?: string;  // Background color
  bold?: boolean;       // Bold text
  blink?: boolean;      // Blinking effect
  opacity?: number;     // Transparency (0-1)
}

// Metadata for individual cells
export interface CellMetadata {
  position: { x: number; y: number };
  type: CellType;
  interactive?: boolean;
  entityId?: string;
  style?: CellStyle;
  zIndex?: number;      // Layer ordering
  tooltip?: string;     // Hover text
}

// Main ASCII grid interface
export interface ASCIIGrid {
  width: number;
  height: number;
  cells: string[][];
  metadata: Map<string, CellMetadata>;  // Key: "x,y" format
}

// ASCII state management class
export class ASCIIState {
  private grid: ASCIIGrid;
  private dirtyRegions: Set<string>;  // Track changed cells for optimization
  private previousGrid?: string[][];  // For diff calculations

  constructor(width: number = ASCII_GRID_WIDTH, height: number = ASCII_GRID_HEIGHT) {
    this.grid = this.createEmptyGrid(width, height);
    this.dirtyRegions = new Set();
  }

  private createEmptyGrid(width: number, height: number): ASCIIGrid {
    const cells: string[][] = [];
    for (let y = 0; y < height; y++) {
      const row: string[] = [];
      for (let x = 0; x < width; x++) {
        row.push(DEFAULT_EMPTY_CELL);
      }
      cells.push(row);
    }

    return {
      width,
      height,
      cells,
      metadata: new Map()
    };
  }

  // Set a single cell
  public setCell(
    x: number, 
    y: number, 
    char: string, 
    metadata?: Partial<CellMetadata>
  ): void {
    if (!this.isValidPosition(x, y)) {
      DebugLogger.warn('ASCIIState', `Invalid position: (${x}, ${y})`);
      return;
    }

    const oldChar = this.grid.cells[y][x];
    if (oldChar !== char) {
      this.grid.cells[y][x] = char;
      this.markDirty(x, y);
    }

    if (metadata) {
      const key = this.getCellKey(x, y);
      const existing = this.grid.metadata.get(key);
      this.grid.metadata.set(key, {
        position: { x, y },
        type: metadata.type || existing?.type || 'empty',
        ...existing,
        ...metadata
      });
    }
  }

  // Get a single cell
  public getCell(x: number, y: number): string | null {
    if (!this.isValidPosition(x, y)) {
      return null;
    }
    return this.grid.cells[y][x];
  }

  // Get cell metadata
  public getCellMetadata(x: number, y: number): CellMetadata | undefined {
    return this.grid.metadata.get(this.getCellKey(x, y));
  }

  // Set a rectangular region
  public setRegion(
    x: number,
    y: number,
    width: number,
    height: number,
    char: string,
    type: CellType = 'empty'
  ): void {
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        this.setCell(x + dx, y + dy, char, { type });
      }
    }
  }

  // Draw a box with borders
  public drawBox(
    x: number,
    y: number,
    width: number,
    height: number,
    borderChars: {
      horizontal?: string;
      vertical?: string;
      corner?: string;
    } = {}
  ): void {
    const h = borderChars.horizontal || '-';
    const v = borderChars.vertical || '|';
    const c = borderChars.corner || '+';

    // Top and bottom borders
    for (let dx = 1; dx < width - 1; dx++) {
      this.setCell(x + dx, y, h, { type: 'border' });
      this.setCell(x + dx, y + height - 1, h, { type: 'border' });
    }

    // Left and right borders
    for (let dy = 1; dy < height - 1; dy++) {
      this.setCell(x, y + dy, v, { type: 'border' });
      this.setCell(x + width - 1, y + dy, v, { type: 'border' });
    }

    // Corners
    this.setCell(x, y, c, { type: 'border' });
    this.setCell(x + width - 1, y, c, { type: 'border' });
    this.setCell(x, y + height - 1, c, { type: 'border' });
    this.setCell(x + width - 1, y + height - 1, c, { type: 'border' });
  }

  // Write text at position
  public writeText(
    x: number,
    y: number,
    text: string,
    style?: CellStyle,
    wrap: boolean = false
  ): void {
    let currentX = x;
    let currentY = y;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (char === '\n') {
        currentY++;
        currentX = x;
        continue;
      }

      if (wrap && currentX >= this.grid.width) {
        currentY++;
        currentX = x;
      }

      if (this.isValidPosition(currentX, currentY)) {
        this.setCell(currentX, currentY, char, { type: 'text', style });
        currentX++;
      }
    }
  }

  // Clear the entire grid
  public clear(): void {
    this.previousGrid = this.grid.cells.map(row => [...row]);
    this.grid = this.createEmptyGrid(this.grid.width, this.grid.height);
    this.dirtyRegions.clear();
    
    // Mark entire grid as dirty
    for (let y = 0; y < this.grid.height; y++) {
      for (let x = 0; x < this.grid.width; x++) {
        this.markDirty(x, y);
      }
    }
  }

  // Get the current grid
  public getGrid(): ASCIIGrid {
    return this.grid;
  }

  // Get a copy of the grid as strings for display/debugging
  public toString(): string {
    return this.grid.cells.map(row => row.join('')).join('\n');
  }

  // Get dirty regions for optimized rendering
  public getDirtyRegions(): Set<string> {
    return new Set(this.dirtyRegions);
  }

  // Clear dirty regions after rendering
  public clearDirtyRegions(): void {
    this.dirtyRegions.clear();
  }

  // Calculate diff from previous state
  public getDiff(): Array<{ x: number; y: number; oldChar: string; newChar: string }> {
    const diff: Array<{ x: number; y: number; oldChar: string; newChar: string }> = [];
    
    if (!this.previousGrid) {
      return diff;
    }

    for (let y = 0; y < this.grid.height; y++) {
      for (let x = 0; x < this.grid.width; x++) {
        const oldChar = this.previousGrid[y][x];
        const newChar = this.grid.cells[y][x];
        if (oldChar !== newChar) {
          diff.push({ x, y, oldChar, newChar });
        }
      }
    }

    return diff;
  }

  // Serialize state for saving
  public serialize(): string {
    return JSON.stringify({
      width: this.grid.width,
      height: this.grid.height,
      cells: this.grid.cells,
      metadata: Array.from(this.grid.metadata.entries())
    });
  }

  // Deserialize state from saved data
  public static deserialize(data: string): ASCIIState {
    const parsed = JSON.parse(data);
    const state = new ASCIIState(parsed.width, parsed.height);
    
    state.grid.cells = parsed.cells;
    state.grid.metadata = new Map(parsed.metadata);
    
    return state;
  }

  // Helper methods
  private isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.grid.width && y >= 0 && y < this.grid.height;
  }

  private getCellKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  private markDirty(x: number, y: number): void {
    this.dirtyRegions.add(this.getCellKey(x, y));
  }
}