# ASCII Rendering System - API Reference

## Table of Contents
1. [Core Classes](#core-classes)
2. [Scene ASCII States](#scene-ascii-states)
3. [Interfaces](#interfaces)
4. [Enums](#enums)
5. [Utility Functions](#utility-functions)
6. [Global Objects](#global-objects)

---

## Core Classes

### ASCIIState

**Location:** `src/rendering/ASCIIState.ts`

The main class for managing an ASCII character grid.

#### Constructor
```typescript
constructor(width: number = 80, height: number = 25)
```

#### Properties
```typescript
static readonly GRID_WIDTH: number = 80
static readonly GRID_HEIGHT: number = 25
readonly width: number
readonly height: number
```

#### Methods

##### getCell
```typescript
getCell(x: number, y: number): ASCIICell | null
```
Returns the cell at the specified coordinates, or null if out of bounds.

##### setCell
```typescript
setCell(x: number, y: number, char: string, style?: ASCIIStyle): void
```
Sets a single cell with a character and optional style.

##### writeText
```typescript
writeText(x: number, y: number, text: string, style?: ASCIIStyle): void
```
Writes a string of text starting at the specified position.

##### drawBox
```typescript
drawBox(x: number, y: number, width: number, height: number, style?: ASCIIStyle): void
```
Draws a box using box-drawing characters.

##### fillRect
```typescript
fillRect(x: number, y: number, width: number, height: number, char: string, style?: ASCIIStyle): void
```
Fills a rectangular area with a specific character.

##### drawLine
```typescript
drawLine(x1: number, y1: number, x2: number, y2: number, char: string, style?: ASCIIStyle): void
```
Draws a line between two points.

##### clear
```typescript
clear(): void
```
Clears the entire grid.

##### getGrid
```typescript
getGrid(): ASCIIGrid
```
Returns the internal grid structure.

---

### CanvasRenderer

**Location:** `src/rendering/CanvasRenderer.ts`

Renders ASCII grids to HTML5 Canvas.

#### Constructor
```typescript
constructor(ctx: CanvasRenderingContext2D)
```

#### Methods

##### renderASCIIGrid
```typescript
renderASCIIGrid(grid: ASCIIGrid): void
```
Renders an entire ASCII grid to the canvas.

##### renderCell
```typescript
renderCell(cell: ASCIICell, x: number, y: number): void
```
Renders a single cell at the specified grid position.

##### calculateFontMetrics
```typescript
calculateFontMetrics(): FontMetrics
```
Calculates character width and height for the current font.

##### setFont
```typescript
setFont(font: string): void
```
Sets the font for rendering (default: "16px monospace").

---

### BaseASCIIScene

**Location:** `src/rendering/BaseASCIIScene.ts`

Abstract base class for scenes with ASCII rendering support.

#### Constructor
```typescript
constructor(gameState: GameState, sceneManager: SceneManager)
```

#### Abstract Methods
```typescript
protected abstract setupInputHandlers(): void
protected abstract updateASCIIState(deltaTime: number): void
protected abstract generateSceneDeclaration(): SceneDeclaration
```

#### Protected Properties
```typescript
protected asciiState: ASCIIState
protected gameState: GameState
protected sceneManager: SceneManager
```

---

## Scene ASCII States

### DungeonASCIIState

**Location:** `src/rendering/scenes/DungeonASCIIState.ts`

Manages ASCII rendering for the dungeon scene.

#### Constructor
```typescript
constructor(gameState: GameState, sceneManager: SceneManager)
```

#### Key Methods

##### render
```typescript
render(): void
```
Renders the complete dungeon view including first-person perspective, minimap, and status.

##### drawFirstPersonView
```typescript
private drawFirstPersonView(): void
```
Renders the 3D dungeon perspective in ASCII.

##### drawMiniMap
```typescript
private drawMiniMap(): void
```
Renders the minimap showing explored areas.

##### updateFromDungeonScene
```typescript
updateFromDungeonScene(scene: DungeonScene): void
```
Synchronizes state from the DungeonScene.

##### handleMovement
```typescript
handleMovement(direction: 'forward' | 'backward' | 'left' | 'right'): void
```
Handles player movement and rotation.

---

### TownASCIIState

**Location:** `src/rendering/scenes/TownASCIIState.ts`

Manages ASCII rendering for the town scene.

#### Constructor
```typescript
constructor(gameState: GameState, sceneManager: SceneManager)
```

#### Key Methods

##### render
```typescript
render(): void
```
Renders the town menu and location display.

##### updateSelectedIndex
```typescript
updateSelectedIndex(index: number): void
```
Updates the currently selected menu item.

##### drawMenu
```typescript
private drawMenu(): void
```
Draws the town location menu.

---

### ShopASCIIState

**Location:** `src/rendering/scenes/ShopASCIIState.ts`

Manages ASCII rendering for the shop scene.

#### Constructor
```typescript
constructor(gameState: GameState, sceneManager: SceneManager, shopSystem: ShopSystem)
```

#### Key Methods

##### render
```typescript
render(): void
```
Renders the shop interface with items and prices.

##### updateState
```typescript
updateState(state: ShopState): void
```
Updates the current shop state (buy/sell/identify/pool).

##### drawItemList
```typescript
private drawItemList(items: Item[], startY: number): void
```
Renders a scrollable list of items.

##### drawGoldDisplay
```typescript
private drawGoldDisplay(): void
```
Shows party and shop gold amounts.

---

### InventoryASCIIState

**Location:** `src/rendering/scenes/InventoryASCIIState.ts`

Manages ASCII rendering for the inventory scene.

#### Constructor
```typescript
constructor(gameState: GameState, sceneManager: SceneManager)
```

#### Key Methods

##### render
```typescript
render(): void
```
Renders character stats, equipment, and inventory.

##### setMode
```typescript
setMode(mode: 'character_select' | 'inventory' | 'equipment' | 'trade'): void
```
Sets the current inventory mode.

##### drawCharacterStats
```typescript
private drawCharacterStats(character: Character): void
```
Displays character attributes and status.

##### drawEquipment
```typescript
private drawEquipment(character: Character): void
```
Shows equipped items by slot.

---

### CombatASCIIState

**Location:** `src/rendering/scenes/CombatASCIIState.ts`

Manages ASCII rendering for combat scenes.

#### Constructor
```typescript
constructor(gameState: GameState, sceneManager: SceneManager, combatSystem: CombatSystem)
```

#### Key Methods

##### render
```typescript
render(): void
```
Renders the combat screen with monsters and party status.

##### updateFromCombatScene
```typescript
updateFromCombatScene(scene: CombatScene): void
```
Synchronizes state from the CombatScene.

##### drawMonsters
```typescript
private drawMonsters(): void
```
Displays enemy monsters and their status.

##### drawActionMenu
```typescript
private drawActionMenu(): void
```
Shows available combat actions.

##### drawCombatLog
```typescript
private drawCombatLog(): void
```
Displays recent combat messages.

---

## Interfaces

### ASCIICell

```typescript
interface ASCIICell {
    char: string;
    foreground?: string;
    background?: string;
    style?: ASCIIStyle;
}
```

### ASCIIStyle

```typescript
interface ASCIIStyle {
    foreground?: string;
    background?: string;
    bold?: boolean;
    dim?: boolean;
    italic?: boolean;
    underline?: boolean;
    blink?: boolean;
    reverse?: boolean;
    hidden?: boolean;
    strikethrough?: boolean;
}
```

### ASCIIGrid

```typescript
interface ASCIIGrid {
    width: number;
    height: number;
    cells: ASCIICell[][];
}
```

### SceneDeclaration

```typescript
interface SceneDeclaration {
    name: string;
    layers: Layer[];
    inputZones?: InputZone[];
    metadata?: Record<string, any>;
}
```

### Layer

```typescript
interface Layer {
    id: string;
    type: 'ascii' | 'canvas' | 'composite';
    visible: boolean;
    opacity?: number;
    content: ASCIIState | CanvasContent;
}
```

### InputZone

```typescript
interface InputZone {
    id: string;
    bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    type: 'button' | 'menu-item' | 'grid-cell' | 'custom';
    enabled?: boolean;
    onActivate?: () => void;
    onHover?: () => void;
    onLeave?: () => void;
}
```

### FontMetrics

```typescript
interface FontMetrics {
    charWidth: number;
    charHeight: number;
    baseline: number;
    font: string;
}
```

---

## Enums

### FeatureFlagKey

```typescript
enum FeatureFlagKey {
    ASCII_RENDERING = 'ascii_rendering',
    ASCII_DUNGEON_SCENE = 'ascii_dungeon_scene',
    ASCII_TOWN_SCENE = 'ascii_town_scene',
    ASCII_SHOP_SCENE = 'ascii_shop_scene',
    ASCII_INVENTORY_SCENE = 'ascii_inventory_scene',
    ASCII_COMBAT_SCENE = 'ascii_combat_scene',
    ASCII_DEBUG_OVERLAY = 'ascii_debug_overlay'
}
```

### ASCIISymbols

```typescript
enum ASCIISymbols {
    // Box Drawing
    BOX_HORIZONTAL = '─',
    BOX_VERTICAL = '│',
    BOX_TOP_LEFT = '┌',
    BOX_TOP_RIGHT = '┐',
    BOX_BOTTOM_LEFT = '└',
    BOX_BOTTOM_RIGHT = '┘',
    BOX_CROSS = '┼',
    BOX_T_DOWN = '┬',
    BOX_T_UP = '┴',
    BOX_T_RIGHT = '├',
    BOX_T_LEFT = '┤',

    // Blocks
    BLOCK_FULL = '█',
    BLOCK_DARK = '▓',
    BLOCK_MEDIUM = '▒',
    BLOCK_LIGHT = '░',

    // Game Symbols
    PLAYER = '@',
    MONSTER = 'M',
    CHEST = '□',
    DOOR = '+',
    STAIRS_UP = '<',
    STAIRS_DOWN = '>',
    WALL = '#',
    FLOOR = '.',
    GOLD = '$',
    POTION = '!',
    SCROLL = '?',
    WEAPON = ')',
    ARMOR = '[',
    CURSOR = '>',

    // Status Symbols
    HEART = '♥',
    DIAMOND = '♦',
    CLUB = '♣',
    SPADE = '♠',
    STAR = '★',
    BULLET = '•',
    ARROW_UP = '↑',
    ARROW_DOWN = '↓',
    ARROW_LEFT = '←',
    ARROW_RIGHT = '→'
}
```

---

## Utility Functions

### ASCIIDebugger

**Location:** `src/rendering/ASCIIDebugger.ts`

Global debugging utility for ASCII grids.

#### Static Methods

##### dump
```typescript
static dump(grid?: ASCIIState, label?: string): void
```
Dumps the current or specified grid to console.

##### visualize
```typescript
static visualize(grid?: ASCIIState): void
```
Renders grid with visible borders and coordinates.

##### export
```typescript
static export(): string
```
Exports all debug data as JSON string.

##### clear
```typescript
static clear(): void
```
Clears debug data from localStorage.

##### compareGrids
```typescript
static compareGrids(grid1: ASCIIState, grid2: ASCIIState): void
```
Shows differences between two grids.

---

### InputHandler

**Location:** `src/rendering/InputHandler.ts`

Handles input for ASCII-based scenes.

#### Methods

##### registerZone
```typescript
registerZone(zone: InputZone): void
```
Registers an input zone for interaction.

##### handleClick
```typescript
handleClick(x: number, y: number): boolean
```
Processes click events, returns true if handled.

##### handleKey
```typescript
handleKey(key: string): boolean
```
Processes keyboard events, returns true if handled.

##### getZoneAt
```typescript
getZoneAt(x: number, y: number): InputZone | null
```
Returns the input zone at the specified coordinates.

---

## Global Objects

### window.FeatureFlags

Global feature flag management.

#### Methods

##### enable
```typescript
FeatureFlags.enable(key: string): void
```
Enables a feature flag.

##### disable
```typescript
FeatureFlags.disable(key: string): void
```
Disables a feature flag.

##### isEnabled
```typescript
FeatureFlags.isEnabled(key: string): boolean
```
Checks if a feature flag is enabled.

##### toggle
```typescript
FeatureFlags.toggle(key: string): void
```
Toggles a feature flag.

##### status
```typescript
FeatureFlags.status(): Record<string, boolean>
```
Returns all feature flag statuses.

##### reset
```typescript
FeatureFlags.reset(): void
```
Resets all flags to defaults.

---

### window.ASCIIDebugger

Global ASCII debugging interface.

#### Methods

##### dump
```typescript
ASCIIDebugger.dump(): void
```
Dumps the current scene's ASCII grid.

##### visualize
```typescript
ASCIIDebugger.visualize(): void
```
Shows grid with borders and coordinates.

##### export
```typescript
ASCIIDebugger.export(): string
```
Exports debug data as JSON.

##### clear
```typescript
ASCIIDebugger.clear(): void
```
Clears debug data.

##### getLastGrid
```typescript
ASCIIDebugger.getLastGrid(): ASCIIGrid | null
```
Returns the most recent grid snapshot.

---

## Usage Examples

### Creating an ASCII Grid

```typescript
import { ASCIIState, ASCIIStyle } from './rendering/ASCIIState';

const grid = new ASCIIState(80, 25);

// Write text
grid.writeText(10, 5, 'Hello World', {
    foreground: '#FFFF00',
    bold: true
});

// Draw a box
grid.drawBox(5, 3, 20, 10);

// Fill an area
grid.fillRect(30, 10, 10, 5, '█', {
    foreground: '#FF0000'
});
```

### Rendering to Canvas

```typescript
import { CanvasRenderer } from './rendering/CanvasRenderer';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const renderer = new CanvasRenderer(ctx);

// Render the grid
renderer.renderASCIIGrid(grid.getGrid());
```

### Implementing a Scene

```typescript
import { BaseASCIIScene } from './rendering/BaseASCIIScene';

class MyScene extends BaseASCIIScene {
    protected setupInputHandlers(): void {
        // Register input zones
        this.inputHandler.registerZone({
            id: 'menu-item-1',
            bounds: { x: 10, y: 5, width: 20, height: 1 },
            type: 'menu-item',
            onActivate: () => this.selectMenuItem(0)
        });
    }

    protected updateASCIIState(deltaTime: number): void {
        // Update dynamic elements
        this.asciiState.clear();
        this.drawMenu();
        this.drawStatus();
    }

    protected generateSceneDeclaration(): SceneDeclaration {
        return {
            name: 'MyScene',
            layers: [
                {
                    id: 'main',
                    type: 'ascii',
                    visible: true,
                    content: this.asciiState
                }
            ]
        };
    }
}
```

### Using Feature Flags

```typescript
// In scene render method
public render(ctx: CanvasRenderingContext2D): void {
    const useASCII = FeatureFlags.isEnabled(FeatureFlagKey.ASCII_MY_SCENE);

    if (useASCII) {
        this.renderASCII(ctx);
    } else {
        this.renderCanvas(ctx);
    }
}

// Runtime toggling
window.FeatureFlags.enable('ascii_my_scene');
```

### Debugging

```typescript
// During development
window.ASCIIDebugger.dump();

// Check specific cell
const grid = scene.asciiState.getGrid();
const cell = grid.getCell(40, 12);
console.log(`Cell at (40,12): "${cell?.char}" fg:${cell?.foreground}`);

// Export for analysis
const debugData = window.ASCIIDebugger.export();
console.log(JSON.parse(debugData));
```

---

## Type Definitions

### Complete Type Definitions File

```typescript
// types/ascii-rendering.d.ts

declare module 'ascii-rendering' {
    export interface ASCIICell {
        char: string;
        foreground?: string;
        background?: string;
        style?: ASCIIStyle;
    }

    export interface ASCIIStyle {
        foreground?: string;
        background?: string;
        bold?: boolean;
        dim?: boolean;
        italic?: boolean;
        underline?: boolean;
        blink?: boolean;
        reverse?: boolean;
        hidden?: boolean;
        strikethrough?: boolean;
    }

    export interface ASCIIGrid {
        width: number;
        height: number;
        cells: ASCIICell[][];
    }

    export class ASCIIState {
        static readonly GRID_WIDTH: number;
        static readonly GRID_HEIGHT: number;
        constructor(width?: number, height?: number);
        getCell(x: number, y: number): ASCIICell | null;
        setCell(x: number, y: number, char: string, style?: ASCIIStyle): void;
        writeText(x: number, y: number, text: string, style?: ASCIIStyle): void;
        drawBox(x: number, y: number, width: number, height: number, style?: ASCIIStyle): void;
        fillRect(x: number, y: number, width: number, height: number, char: string, style?: ASCIIStyle): void;
        drawLine(x1: number, y1: number, x2: number, y2: number, char: string, style?: ASCIIStyle): void;
        clear(): void;
        getGrid(): ASCIIGrid;
    }

    export class CanvasRenderer {
        constructor(ctx: CanvasRenderingContext2D);
        renderASCIIGrid(grid: ASCIIGrid): void;
        renderCell(cell: ASCIICell, x: number, y: number): void;
        calculateFontMetrics(): FontMetrics;
        setFont(font: string): void;
    }
}
```

---

## Version History

### v1.0.0 (2025-09-15)
- Initial complete API documentation
- All 5 main scenes implemented
- 42 tests passing
- 0 TypeScript errors
- Full feature flag support
- Save/load functionality verified

---

## See Also

- [ASCII_RENDERING_GUIDE.md](./ASCII_RENDERING_GUIDE.md) - Complete developer guide
- [ascii-system-documentation.md](./ascii-system-documentation.md) - System overview
- [lessons-learned.md](./lessons-learned.md) - Implementation insights