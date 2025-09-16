# ASCII Rendering System - Complete Developer Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Quick Start](#quick-start)
4. [Core Components](#core-components)
5. [Scene Implementation Guide](#scene-implementation-guide)
6. [Testing Guide](#testing-guide)
7. [Performance](#performance)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

## Overview

The ASCII rendering system is a complete declarative rendering pipeline that has been successfully implemented across all 5 main game scenes (Dungeon, Town, Shop, Inventory, Combat). It uses an 80x25 ASCII grid as the internal state representation, which is then rendered to canvas using the CanvasRenderer.

### Current Status
- ✅ **All 5 main scenes fully integrated** with ASCII rendering
- ✅ **42 Playwright tests passing** (2 edge cases skipped)
- ✅ **0 TypeScript compilation errors**
- ✅ **Performance targets met** (<50ms render time, 60 FPS)
- ✅ **Feature flag system** for runtime toggling
- ✅ **Save/load functionality** verified working

## Architecture

### Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Game Scene Layer                      │
│  (DungeonScene, TownScene, ShopScene, etc.)             │
└────────────────────┬────────────────────────────────────┘
                     │ Uses
┌────────────────────▼────────────────────────────────────┐
│                 ASCII State Layer                        │
│  (ASCIIState - 80x25 grid of characters and colors)     │
└────────────────────┬────────────────────────────────────┘
                     │ Rendered by
┌────────────────────▼────────────────────────────────────┐
│                Canvas Renderer Layer                     │
│  (CanvasRenderer - converts ASCII to canvas drawing)     │
└─────────────────────────────────────────────────────────┘
```

### Key Design Principles
1. **Declarative over Imperative**: Describe what to render, not how
2. **Feature Flag Controlled**: Runtime toggling for all scenes
3. **Bidirectional Sync**: Scene state syncs with ASCII representation
4. **Test-Driven**: Comprehensive Playwright test coverage

## Quick Start

### Enable ASCII Rendering

```javascript
// Enable globally
window.FeatureFlags.enable('ascii_rendering')

// Enable for specific scenes
window.FeatureFlags.enable('ascii_dungeon_scene')
window.FeatureFlags.enable('ascii_town_scene')
window.FeatureFlags.enable('ascii_shop_scene')
window.FeatureFlags.enable('ascii_inventory_scene')
window.FeatureFlags.enable('ascii_combat_scene')

// Check status
window.FeatureFlags.status()
```

### Test ASCII Rendering

```bash
# Run all ASCII tests
npm test -- dungeon-ascii
npm test -- town-ascii
npm test -- shop-ascii
npm test -- inventory-ascii
npm test -- combat-ascii

# Run save/load tests
npm test -- save-load-ascii
```

## Core Components

### ASCIIState (`src/rendering/ASCIIState.ts`)

The foundation of the ASCII system - manages the 80x25 character grid.

```typescript
export class ASCIIState {
    public static readonly GRID_WIDTH = 80;
    public static readonly GRID_HEIGHT = 25;

    constructor(width: number = 80, height: number = 25);

    // Core methods
    getCell(x: number, y: number): ASCIICell | null;
    setCell(x: number, y: number, char: string, style?: ASCIIStyle): void;
    writeText(x: number, y: number, text: string, style?: ASCIIStyle): void;
    drawBox(x: number, y: number, width: number, height: number, style?: ASCIIStyle): void;
    clear(): void;

    // Utility methods
    fillRect(x: number, y: number, width: number, height: number, char: string, style?: ASCIIStyle): void;
    drawLine(x1: number, y1: number, x2: number, y2: number, char: string, style?: ASCIIStyle): void;
}
```

### CanvasRenderer (`src/rendering/CanvasRenderer.ts`)

Converts ASCII grids to canvas rendering with proper font metrics.

```typescript
export class CanvasRenderer {
    constructor(ctx: CanvasRenderingContext2D);

    renderASCIIGrid(grid: ASCIIGrid): void;
    renderCell(cell: ASCIICell, x: number, y: number): void;
    calculateFontMetrics(): FontMetrics;
}
```

### Scene ASCII States

Each scene has its own ASCII state class:

- **DungeonASCIIState**: First-person view, minimap, status panel
- **TownASCIIState**: Menu system, location display
- **ShopASCIIState**: Item lists, gold display, transaction UI
- **InventoryASCIIState**: Character stats, equipment, inventory grid
- **CombatASCIIState**: Monster display, action menu, combat log

## Scene Implementation Guide

### Step 1: Create ASCII State Class

```typescript
// src/rendering/scenes/MySceneASCIIState.ts
import { ASCIIState } from '../ASCIIState';
import { GameState } from '../../core/GameState';

export class MySceneASCIIState {
    private grid: ASCIIState;
    private gameState: GameState;

    constructor(gameState: GameState) {
        this.gameState = gameState;
        this.grid = new ASCIIState(80, 25);
    }

    public render(): void {
        this.grid.clear();
        this.drawHeader();
        this.drawContent();
        this.drawFooter();
    }

    public getGrid(): ASCIIState {
        return this.grid;
    }
}
```

### Step 2: Integrate in Scene Class

```typescript
// src/scenes/MyScene.ts
import { MySceneASCIIState } from '../rendering/scenes/MySceneASCIIState';
import { CanvasRenderer } from '../rendering/CanvasRenderer';
import { FeatureFlags, FeatureFlagKey } from '../config/FeatureFlags';

export class MyScene extends Scene {
    private asciiState?: MySceneASCIIState;
    private asciiRenderer?: CanvasRenderer;

    public render(ctx: CanvasRenderingContext2D): void {
        const shouldUseASCII = FeatureFlags.isEnabled(FeatureFlagKey.ASCII_MY_SCENE);

        if (shouldUseASCII) {
            // Initialize ASCII if needed
            if (!this.asciiState) {
                this.asciiState = new MySceneASCIIState(this.gameState);
                this.asciiRenderer = new CanvasRenderer(ctx);
            }

            // Render ASCII
            this.asciiState.render();
            const grid = this.asciiState.getGrid();
            this.asciiRenderer.renderASCIIGrid(grid);
        } else {
            // Regular canvas rendering
            this.renderCanvas(ctx);
        }
    }

    public exit(): void {
        // Clean up ASCII state
        this.asciiState = undefined;
        this.asciiRenderer = undefined;
    }
}
```

### Step 3: Add Feature Flag

```typescript
// src/config/FeatureFlags.ts
export enum FeatureFlagKey {
    ASCII_MY_SCENE = 'ascii_my_scene',
    // ... other flags
}
```

### Step 4: Handle Dynamic Initialization

For scenes that may be loaded from save games:

```typescript
private checkAndInitializeASCII(): void {
    const shouldUseASCII = FeatureFlags.isEnabled(FeatureFlagKey.ASCII_MY_SCENE);

    if (shouldUseASCII && !this.asciiState) {
        this.asciiState = new MySceneASCIIState(this.gameState);
        this.asciiRenderer = new CanvasRenderer(this.ctx);
        this.asciiState.syncFromScene(this); // Sync existing state
    }
}
```

## Testing Guide

### Playwright Test Structure

```javascript
// tests/my-scene-ascii.test.js
import { test, expect } from '@playwright/test';

test.describe('MyScene ASCII Rendering', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8080');
        await page.waitForLoadState('networkidle');

        // Enable ASCII rendering
        await page.evaluate(() => {
            window.FeatureFlags.enable('ascii_my_scene');
        });
    });

    test('should render ASCII grid', async ({ page }) => {
        // Navigate to scene
        await navigateToMyScene(page);

        // Verify ASCII rendering
        const asciiData = await page.evaluate(() => {
            const scene = window.game.sceneManager.currentScene;
            return scene.asciiState?.getGrid()?.getCell(0, 0);
        });

        expect(asciiData).toBeDefined();
    });

    test('should handle user input', async ({ page }) => {
        await navigateToMyScene(page);

        // Test keyboard input
        await page.keyboard.press('ArrowDown');

        // Verify state change
        const selectedIndex = await page.evaluate(() => {
            const scene = window.game.sceneManager.currentScene;
            return scene.selectedOption;
        });

        expect(selectedIndex).toBe(1);
    });
});
```

### Navigation Helpers

```javascript
async function navigateToTownScene(page) {
    // Start new game
    await page.keyboard.press('n');
    await page.waitForTimeout(500);

    // Skip character creation
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    // Enter town
    await page.keyboard.press('t');
    await page.waitForTimeout(500);
}
```

## Performance

### Current Metrics
- **Average render time**: <50ms per frame
- **Maximum render time**: <100ms (during scene transitions)
- **Frame rate**: Consistent 60 FPS
- **Memory usage**: ~40KB per scene (80x25 grid)

### Optimization Techniques

1. **Dirty Region Tracking** (future optimization)
```typescript
private dirtyRegions: Set<{x: number, y: number}> = new Set();

public setCell(x: number, y: number, char: string): void {
    this.dirtyRegions.add({x, y});
    // ... set cell
}
```

2. **Character Caching** (future optimization)
```typescript
private charCache: Map<string, ImageData> = new Map();

private getCachedChar(char: string, style: ASCIIStyle): ImageData {
    const key = `${char}_${style.foreground}_${style.background}`;
    if (!this.charCache.has(key)) {
        this.charCache.set(key, this.renderChar(char, style));
    }
    return this.charCache.get(key)!;
}
```

## Troubleshooting

### Common Issues

#### ASCII Not Rendering
```javascript
// Check feature flag
console.log(window.FeatureFlags.isEnabled('ascii_my_scene'));

// Check ASCII state exists
console.log(window.game.sceneManager.currentScene.asciiState);

// Force refresh
window.game.sceneManager.currentScene.asciiState?.render();
```

#### State Not Syncing
```javascript
// Manually sync state
const scene = window.game.sceneManager.currentScene;
scene.asciiState?.syncFromScene(scene);
```

#### Performance Issues
```javascript
// Check render timing
console.time('ascii-render');
scene.asciiState?.render();
console.timeEnd('ascii-render');

// Check grid size
const grid = scene.asciiState?.getGrid();
console.log(`Grid size: ${grid?.width}x${grid?.height}`);
```

### Debug Commands

```javascript
// Dump ASCII grid to console
window.ASCIIDebugger?.dump();

// Export debug data
const debugData = window.ASCIIDebugger?.export();
console.log(debugData);

// Clear debug data
window.ASCIIDebugger?.clear();
```

## Best Practices

### 1. State Management
- Keep ASCII state synchronized with scene state
- Use bidirectional sync for interactive elements
- Clean up state in exit() methods

### 2. Rendering
- Clear grid before each render
- Use consistent color schemes
- Leverage box drawing characters for UI

### 3. Input Handling
- Map keyboard input to ASCII grid coordinates
- Provide visual feedback for selections
- Handle edge cases (boundaries, empty lists)

### 4. Testing
- Test both ASCII and canvas modes
- Verify feature flag toggling
- Test scene transitions
- Include save/load scenarios

### 5. Performance
- Avoid unnecessary rerenders
- Batch updates when possible
- Profile before optimizing

## ASCII Art Examples

### Menu with Selection
```
┌──────────────────────┐
│     MAIN MENU        │
├──────────────────────┤
│ > New Game           │
│   Continue           │
│   Settings           │
│   Exit               │
└──────────────────────┘
```

### Status Bar
```
HP: ████████░░ 80/100  MP: ██████░░░░ 60/100  Gold: 1,234
```

### Dungeon View
```
┌─────────────┐
│   ┌─────┐   │
│   │     │   │
│   │  @  │   │
│   │     │   │
│   └─────┘   │
└─────────────┘
```

## Implementation Checklist

When implementing ASCII rendering for a new scene:

- [ ] Create `MySceneASCIIState.ts` in `src/rendering/scenes/`
- [ ] Add feature flag to `FeatureFlags.ts`
- [ ] Implement render method with dynamic flag checking
- [ ] Add cleanup in exit() method
- [ ] Handle dynamic initialization for save/load
- [ ] Create Playwright tests
- [ ] Test feature flag toggling
- [ ] Verify performance (<50ms render)
- [ ] Document ASCII layout
- [ ] Update this guide with findings

## Future Enhancements

### Planned Features
1. **Animation System**: Frame-based animations for effects
2. **Particle Effects**: ASCII-based particle systems
3. **Advanced UI**: Tooltips, context menus, dialogs
4. **Theme System**: Multiple color schemes
5. **Accessibility**: Screen reader support

### Research Areas
1. **WebGL Rendering**: GPU-accelerated ASCII rendering
2. **Compression**: Efficient grid state serialization
3. **Networking**: Multiplayer ASCII synchronization
4. **AI Integration**: LLM-based content generation

## Conclusion

The ASCII rendering system has been successfully implemented across all major game scenes with excellent performance and test coverage. The system provides a solid foundation for both traditional canvas rendering and modern ASCII-first design, enabling rapid development, easier testing, and improved debugging capabilities.

For questions or contributions, please refer to the project repository and test suites for the most up-to-date implementation examples.