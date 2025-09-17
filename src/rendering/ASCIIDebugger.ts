import { ASCIIState, CellMetadata } from './ASCIIState';
import { DebugLogger } from '../utils/DebugLogger';
import { SymbolUtils } from './ASCIISymbols';

// Constants for debug display
const UPDATE_THROTTLE_MS = 100;

// Debug information structure
export interface ASCIIDebugInfo {
  gridDimensions: { width: number; height: number };
  dirtyCount: number;
  metadataCount: number;
  recentChanges: Array<{
    x: number;
    y: number;
    oldChar: string;
    newChar: string;
    timestamp: number;
  }>;
  selectedCell?: {
    x: number;
    y: number;
    char: string;
    metadata?: CellMetadata;
  };
  performanceMetrics?: {
    lastRenderTime: number;
    averageRenderTime: number;
    frameCount: number;
  };
}

// ASCII state debugger
export class ASCIIDebugger {
  private asciiState: ASCIIState | null = null;
  private debugInfo: ASCIIDebugInfo;
  private changeHistory: ASCIIDebugInfo['recentChanges'] = [];
  private maxHistorySize = 50;
  private lastUpdateTime = 0;
  private updateThrottle = UPDATE_THROTTLE_MS;
  private isEnabled = true;
  private debugPanel: HTMLDivElement | null = null;
  private renderTimes: number[] = [];
  private maxRenderTimeSamples = 60;

  constructor() {
    this.debugInfo = {
      gridDimensions: { width: 0, height: 0 },
      dirtyCount: 0,
      metadataCount: 0,
      recentChanges: [],
    };

    this.initializeDebugPanel();
    this.setupKeyboardShortcuts();

    DebugLogger.info('ASCIIDebugger', 'ASCII debugger initialized');
  }

  // Attach to an ASCII state instance
  public attachState(state: ASCIIState): void {
    this.asciiState = state;
    const grid = state.getGrid();
    this.debugInfo.gridDimensions = {
      width: grid.width,
      height: grid.height,
    };

    DebugLogger.info('ASCIIDebugger', `Attached to ASCII state (${grid.width}x${grid.height})`);
  }

  // Update debug information
  public update(forceUpdate: boolean = false): void {
    if (!this.isEnabled || !this.asciiState) return;

    const now = Date.now();
    if (!forceUpdate && now - this.lastUpdateTime < this.updateThrottle) {
      return;
    }

    this.lastUpdateTime = now;

    const grid = this.asciiState.getGrid();
    const dirtyRegions = this.asciiState.getDirtyRegions();
    const diff = this.asciiState.getDiff();

    // Update basic info
    this.debugInfo.dirtyCount = dirtyRegions.size;
    this.debugInfo.metadataCount = grid.metadata.size;

    // Add changes to history
    diff.forEach((change) => {
      this.changeHistory.unshift({
        x: change.x,
        y: change.y,
        oldChar: change.oldChar,
        newChar: change.newChar,
        timestamp: now,
      });
    });

    // Trim history
    if (this.changeHistory.length > this.maxHistorySize) {
      this.changeHistory = this.changeHistory.slice(0, this.maxHistorySize);
    }

    this.debugInfo.recentChanges = this.changeHistory.slice(0, 10);

    // Update performance metrics
    if (this.renderTimes.length > 0) {
      const sum = this.renderTimes.reduce((a, b) => a + b, 0);
      this.debugInfo.performanceMetrics = {
        lastRenderTime: this.renderTimes[this.renderTimes.length - 1],
        averageRenderTime: sum / this.renderTimes.length,
        frameCount: this.renderTimes.length,
      };
    }

    // Log to debug logger
    DebugLogger.debug('ASCIIDebugger', 'State updated', {
      dirtyCount: this.debugInfo.dirtyCount,
      metadataCount: this.debugInfo.metadataCount,
      changeCount: diff.length,
    });

    // Update debug panel
    this.updateDebugPanel();
  }

  // Record render time
  public recordRenderTime(time: number): void {
    this.renderTimes.push(time);
    if (this.renderTimes.length > this.maxRenderTimeSamples) {
      this.renderTimes.shift();
    }
  }

  // Select a cell for inspection
  public selectCell(x: number, y: number): void {
    if (!this.asciiState) return;

    const char = this.asciiState.getCell(x, y);
    const metadata = this.asciiState.getCellMetadata(x, y);

    this.debugInfo.selectedCell = {
      x,
      y,
      char: char || ' ',
      metadata,
    };

    DebugLogger.debug('ASCIIDebugger', `Selected cell (${x}, ${y}): '${char}'`, metadata);
    this.updateDebugPanel();
  }

  // Dump current ASCII grid to console
  public dumpGrid(): void {
    if (!this.asciiState) return;

    const gridString = this.asciiState.toString();
    console.log('=== ASCII Grid Dump ===');
    console.log(gridString);
    console.log('======================');

    DebugLogger.info('ASCIIDebugger', 'Grid dumped to console');
  }

  // Dump metadata for debugging
  public dumpMetadata(): void {
    if (!this.asciiState) return;

    const grid = this.asciiState.getGrid();
    console.log('=== ASCII Metadata Dump ===');
    grid.metadata.forEach((meta, key) => {
      console.log(`${key}: ${JSON.stringify(meta)}`);
    });
    console.log('===========================');

    DebugLogger.info('ASCIIDebugger', `Dumped ${grid.metadata.size} metadata entries`);
  }

  // Create diff visualization
  public visualizeDiff(): string {
    if (!this.asciiState) return '';

    const grid = this.asciiState.getGrid();
    const diff = this.asciiState.getDiff();
    const visualization: string[][] = [];

    // Initialize with spaces
    for (let y = 0; y < grid.height; y++) {
      visualization[y] = [];
      for (let x = 0; x < grid.width; x++) {
        visualization[y][x] = ' ';
      }
    }

    // Mark changed cells
    diff.forEach((change) => {
      visualization[change.y][change.x] = '*';
    });

    return visualization.map((row) => row.join('')).join('\n');
  }

  // Create metadata heatmap
  public createMetadataHeatmap(): string {
    if (!this.asciiState) return '';

    const grid = this.asciiState.getGrid();
    const heatmap: string[][] = [];

    // Initialize with dots
    for (let y = 0; y < grid.height; y++) {
      heatmap[y] = [];
      for (let x = 0; x < grid.width; x++) {
        heatmap[y][x] = '.';
      }
    }

    // Mark cells with metadata
    grid.metadata.forEach((meta, key) => {
      const [xStr, yStr] = key.split(',');
      const x = parseInt(xStr);
      const y = parseInt(yStr);

      // Use different characters for different metadata types
      if (meta.interactive) {
        heatmap[y][x] = 'I';
      } else if (meta.entityId) {
        heatmap[y][x] = 'E';
      } else if (meta.style) {
        heatmap[y][x] = 'S';
      } else {
        heatmap[y][x] = 'M';
      }
    });

    return heatmap.map((row) => row.join('')).join('\n');
  }

  // Initialize debug panel
  private initializeDebugPanel(): void {
    if (typeof window === 'undefined' || !document) return;

    // Create debug panel element
    this.debugPanel = document.createElement('div');
    this.debugPanel.id = 'ascii-debug-panel';
    this.debugPanel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      background: rgba(0, 0, 0, 0.9);
      color: #00ff00;
      font-family: monospace;
      font-size: 12px;
      padding: 10px;
      border: 1px solid #00ff00;
      border-radius: 4px;
      z-index: 10000;
      display: none;
      max-height: 500px;
      overflow-y: auto;
    `;

    document.body.appendChild(this.debugPanel);
  }

  // Update debug panel content
  private updateDebugPanel(): void {
    if (!this.debugPanel) return;

    let html = '<h3 style="margin: 0 0 10px 0;">ASCII Debug Info</h3>';

    // Grid dimensions
    html += `<div>Grid: ${this.debugInfo.gridDimensions.width}x${this.debugInfo.gridDimensions.height}</div>`;
    html += `<div>Dirty Cells: ${this.debugInfo.dirtyCount}</div>`;
    html += `<div>Metadata Entries: ${this.debugInfo.metadataCount}</div>`;

    // Performance metrics
    if (this.debugInfo.performanceMetrics) {
      const metrics = this.debugInfo.performanceMetrics;
      html += '<h4 style="margin: 10px 0 5px 0;">Performance</h4>';
      html += `<div>Last Render: ${metrics.lastRenderTime.toFixed(2)}ms</div>`;
      html += `<div>Avg Render: ${metrics.averageRenderTime.toFixed(2)}ms</div>`;
      html += `<div>Frame Count: ${metrics.frameCount}</div>`;
    }

    // Selected cell
    if (this.debugInfo.selectedCell) {
      const cell = this.debugInfo.selectedCell;
      html += '<h4 style="margin: 10px 0 5px 0;">Selected Cell</h4>';
      html += `<div>Position: (${cell.x}, ${cell.y})</div>`;
      html += `<div>Character: '${cell.char}'</div>`;

      if (cell.metadata) {
        html += `<div>Type: ${cell.metadata.type}</div>`;
        if (cell.metadata.interactive) {
          html += `<div>Interactive: Yes</div>`;
        }
        if (cell.metadata.entityId) {
          html += `<div>Entity: ${cell.metadata.entityId}</div>`;
        }
        if (cell.metadata.tooltip) {
          html += `<div>Tooltip: ${cell.metadata.tooltip}</div>`;
        }
      }

      // Check if character is a known symbol
      const symbolKey = SymbolUtils.getSymbolKey(cell.char);
      if (symbolKey) {
        html += `<div>Symbol: ${symbolKey}</div>`;
      }
    }

    // Recent changes
    if (this.debugInfo.recentChanges.length > 0) {
      html += '<h4 style="margin: 10px 0 5px 0;">Recent Changes</h4>';
      html += '<div style="font-size: 10px;">';
      this.debugInfo.recentChanges.slice(0, 5).forEach((change) => {
        const timeDiff = Date.now() - change.timestamp;
        const timeStr = timeDiff < 1000 ? `${timeDiff}ms` : `${(timeDiff / 1000).toFixed(1)}s`;
        html += `<div>(${change.x},${change.y}): '${change.oldChar}' → '${change.newChar}' (${timeStr} ago)</div>`;
      });
      html += '</div>';
    }

    // Shortcuts help
    html += '<h4 style="margin: 10px 0 5px 0;">Shortcuts</h4>';
    html += '<div style="font-size: 10px;">';
    html += '<div>Ctrl+Shift+D: Toggle panel</div>';
    html += '<div>Ctrl+Shift+G: Dump grid</div>';
    html += '<div>Ctrl+Shift+M: Dump metadata</div>';
    html += '</div>';

    this.debugPanel.innerHTML = html;
  }

  // Setup keyboard shortcuts
  private setupKeyboardShortcuts(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.shiftKey) {
        switch (event.key) {
          case 'D':
            event.preventDefault();
            this.togglePanel();
            break;
          case 'G':
            event.preventDefault();
            this.dumpGrid();
            break;
          case 'M':
            event.preventDefault();
            this.dumpMetadata();
            break;
        }
      }
    });
  }

  // Toggle debug panel visibility
  public togglePanel(): void {
    if (!this.debugPanel) return;

    const isVisible = this.debugPanel.style.display !== 'none';
    this.debugPanel.style.display = isVisible ? 'none' : 'block';

    DebugLogger.info('ASCIIDebugger', `Debug panel ${isVisible ? 'hidden' : 'shown'}`);
  }

  // Show debug panel
  public showPanel(): void {
    if (this.debugPanel) {
      this.debugPanel.style.display = 'block';
    }
  }

  // Hide debug panel
  public hidePanel(): void {
    if (this.debugPanel) {
      this.debugPanel.style.display = 'none';
    }
  }

  // Enable/disable debugging
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled && this.debugPanel) {
      this.debugPanel.style.display = 'none';
    }

    DebugLogger.info('ASCIIDebugger', `Debugging ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Export debug data
  public exportDebugData(): string {
    const data = {
      timestamp: new Date().toISOString(),
      debugInfo: this.debugInfo,
      changeHistory: this.changeHistory,
      gridDump: this.asciiState ? this.asciiState.toString() : null,
      metadataHeatmap: this.createMetadataHeatmap(),
      diffVisualization: this.visualizeDiff(),
    };

    return JSON.stringify(data, null, 2);
  }

  // Cleanup
  public destroy(): void {
    if (this.debugPanel && this.debugPanel.parentNode) {
      this.debugPanel.parentNode.removeChild(this.debugPanel);
    }

    this.asciiState = null;
    this.changeHistory = [];
    this.renderTimes = [];

    DebugLogger.info('ASCIIDebugger', 'ASCII debugger destroyed');
  }
}

// Global debugger instance
export const globalASCIIDebugger = new ASCIIDebugger();
