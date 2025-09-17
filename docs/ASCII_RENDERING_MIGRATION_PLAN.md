# ASCII-First Declarative Rendering System Migration Plan

## Overview
This document outlines the migration strategy from our current imperative canvas rendering to an ASCII-first declarative rendering system. This approach will improve maintainability, testability, and provide better compatibility with AI-assisted development.

## Architecture Overview

### Three-Layer Architecture
```
┌─────────────────┐
│  ASCII State    │  Layer 1: Pure game state as ASCII
├─────────────────┤
│Scene Declarative│  Layer 2: Declarative scene descriptions
├─────────────────┤
│ Canvas Renderer │  Layer 3: Canvas rendering engine
└─────────────────┘
```

## Phase 1: Foundation (Week 1)

### 1.1 Core Infrastructure
**Priority: CRITICAL**
**Files to Create:**
- `src/rendering/ASCIIState.ts` - ASCII state management
- `src/rendering/SceneDeclaration.ts` - Scene declaration interfaces
- `src/rendering/CanvasRenderer.ts` - Universal canvas renderer
- `src/rendering/ASCIISymbols.ts` - Symbol definitions

**ASCIIState.ts Structure:**
```typescript
interface ASCIIGrid {
  width: number;
  height: number;
  cells: string[][];
  metadata: Map<string, CellMetadata>;
}

interface CellMetadata {
  position: { x: number; y: number };
  type: 'wall' | 'floor' | 'door' | 'stairs' | 'entity' | 'ui';
  interactive?: boolean;
  entityId?: string;
}
```

### 1.2 ASCII Symbol Definitions
**File: src/rendering/ASCIISymbols.ts**
```typescript
export const ASCII_SYMBOLS = {
  // Dungeon
  WALL: '#',
  FLOOR: '.',
  DOOR: '+',
  DOOR_OPEN: '/',
  STAIRS_UP: '<',
  STAIRS_DOWN: '>',
  CHEST: '=',
  
  // Entities
  PLAYER: '@',
  MONSTER_WEAK: 'g',    // goblin, kobold
  MONSTER_MEDIUM: 'o',  // orc, ogre
  MONSTER_STRONG: 'D',  // dragon, demon
  
  // UI Elements
  BORDER_H: '-',
  BORDER_V: '|',
  CORNER: '+',
  MENU_CURSOR: '>',
  HEALTH_FULL: '*',
  HEALTH_EMPTY: '.',
  
  // Status
  STATUS_OK: 'O',
  STATUS_POISON: 'P',
  STATUS_SLEEP: 'S',
  STATUS_DEAD: 'X'
};
```

## Phase 2: Scene Migration Order

### 2.1 TownScene (Simplest - Start Here) ✅ COMPLETE
**Priority: HIGH**
**Estimated Time: 2 days** (Actual: 1 day)
**Files Modified:** 
- `src/scenes/TownScene.ts`
- `src/rendering/scenes/TownASCIIState.ts`
**Status:** Successfully migrated with feature flag support

**ASCII Representation (80x25):**
```
################################################################################
#                           TOWN OF LLYLGAMYN                                 #
################################################################################
#                                                                              #
#  Castle:                    Shops:                   Temple:                #
#  +-----+                    +-----+                  +-----+                #
#  |  C  |                    |  B  |                  |  T  |                #
#  +-----+                    +-----+                  +-----+                #
#                                                                              #
#  Inn:                       Tavern:                  Edge:                  #
#  +-----+                    +-----+                  +-----+                #
#  |  I  |                    |  V  |                  |  E  |                #
#  +-----+                    +-----+                  +-----+                #
#                                                                              #
#                                                                              #
#  > Enter Castle                                                             #
#    Boltac's Trading Post                                                    #
#    Temple of Cant                                                           #
#    Adventurer's Inn                                                         #
#    Gilgamesh's Tavern                                                       #
#    Edge of Town                                                             #
#                                                                              #
################################################################################
#  Select destination (1-6):                                                  #
################################################################################
```

**Implementation Steps:**
1. Create `TownASCIIState` class extending `ASCIIState`
2. Define town layout in ASCII
3. Create `TownSceneDeclaration` with menu positions
4. Update `TownScene` to use declarative rendering
5. Remove direct canvas calls

### 2.2 ShopScene
**Priority: HIGH**
**Estimated Time: 3 days**
**Files to Modify:** `src/scenes/ShopScene.ts`

**ASCII Representation:**
```
################################################################################
#                        BOLTAC'S TRADING POST                                #
################################################################################
# Gold: 1234                                                    Pool: 5678    #
################################################################################
# INVENTORY:                          # FOR SALE:                             #
#                                     #                                       #
# > Long Sword         (E)      50g  # > Short Sword              10g        #
#   Leather Armor              100g  #   Chain Mail              100g        #
#   Healing Potion      x3      25g  #   Plate Mail              500g        #
#                                     #   Long Sword +1           250g        #
#                                     #   Healing Potion           50g        #
#                                     #                                       #
################################################################################
# PARTY:                              # ITEM DETAILS:                         #
#                                     #                                       #
# > Fighter    [EQ] [IV] [ID] [PL]   # Short Sword                          #
#   Mage       [EQ] [IV] [ID] [PL]   # Damage: 1-8                          #
#   Priest     [EQ] [IV] [ID] [PL]   # Classes: Fighter, Samurai, Lord      #
#                                     #                                       #
################################################################################
# [B]uy  [S]ell  [I]dentify  [P]ool  [E]xit                     Total: 0g    #
################################################################################
```

### 2.3 CombatScene
**Priority: MEDIUM**
**Estimated Time: 4 days**
**Files to Modify:** `src/scenes/CombatScene.ts`

**ASCII Representation:**
```
################################################################################
#                           ENCOUNTER!                                        #
################################################################################
# ENEMIES:                            # PARTY:                                #
#                                     #                                       #
# Goblin Group A (3)                  # Fighter    HP: 12/15  AC: 5  OK      #
#   Goblin 1       HP: [****  ]       # Mage       HP:  8/8   AC: 10 OK      #
#   Goblin 2       HP: [***   ]       # Priest     HP: 10/10  AC: 8  OK      #
#   Goblin 3       HP: [**** ]        # Thief      HP:  6/9   AC: 7  OK      #
#                                     #                                       #
# Orc Fighter      HP: [******]       #                                       #
#                                     #                                       #
################################################################################
# ACTIONS:                            # MESSAGES:                             #
#                                     #                                       #
# Fighter:                            # Goblin 1 attacks Fighter!            #
# > [F]ight                           # Fighter takes 3 damage!              #
#   [P]arry                           # Fighter attacks Goblin 1!            #
#   [S]pell                           # Critical Hit! 12 damage!             #
#   [I]tem                            # Goblin 1 is defeated!                #
#   [R]un                             #                                       #
#                                     #                                       #
################################################################################
```

### 2.4 DungeonScene (Most Complex)
**Priority: LOW**
**Estimated Time: 5 days**
**Files to Modify:** `src/scenes/DungeonScene.ts`

**ASCII Representation - Full View:**
```
################################################################################
# Floor 1                     N                          HP: 15/15  MP: 8/8   #
#                           [###]                                             #
#                           [#.#]                                             #
#                           [#@#]                                             #
#                         W [#.#] E                                           #
#                           [#.#]                                             #
#                           [#+#]                                             #
#                             S                                               #
################################################################################
# PARTY:                              # MESSAGES:                             #
# Fighter    HP: 15/15  AC: 5  OK     # You enter the dungeon...             #
# Mage       HP:  8/8   AC: 10 OK     # The air is damp and cold.            #
# Priest     HP: 10/10  AC: 8  OK     # You hear distant footsteps.          #
# Thief      HP:  9/9   AC: 7  OK     #                                       #
################################################################################
```

**ASCII Representation - First Person View:**
```
################################################################################
#                                                                              #
#                          +---------+                                        #
#                         /|         |\                                       #
#                        / |         | \                                      #
#                       /  |         |  \                                     #
#                      /   +---------+   \                                    #
#                     /   /           \   \                                   #
#                    /   /             \   \                                  #
#                   /   /               \   \                                 #
#                  +---+                 +---+                                #
#                  |   |                 |   |                                #
#                  |   |                 |   |                                #
#                  |   |                 |   |                                #
#                  |   +-----------------+   |                                #
#                  |                         |                                #
#                  +-------------------------+                                #
#                                                                              #
################################################################################
# [W] Forward  [A] Left  [D] Right  [S] Back  [SPACE] Turn Around            #
################################################################################
```

## Phase 3: Renderer Implementation

### 3.1 CanvasRenderer Class
**File: src/rendering/CanvasRenderer.ts**

```typescript
class CanvasRenderer {
  private charWidth = 10;
  private charHeight = 20;
  private colors = {
    text: '#FFFFFF',
    background: '#000000',
    border: '#808080',
    highlight: '#FFFF00',
    danger: '#FF0000',
    health: '#00FF00'
  };

  public render(
    ctx: CanvasRenderingContext2D,
    asciiGrid: ASCIIGrid,
    declaration: SceneDeclaration
  ): void {
    // 1. Clear canvas
    this.clearCanvas(ctx);
    
    // 2. Render ASCII grid
    this.renderASCIIGrid(ctx, asciiGrid);
    
    // 3. Apply style overlays
    this.applyStyles(ctx, declaration.styles);
    
    // 4. Render interactive elements
    this.renderInteractive(ctx, declaration.interactive);
  }

  private renderASCIIGrid(
    ctx: CanvasRenderingContext2D,
    grid: ASCIIGrid
  ): void {
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const char = grid.cells[y][x];
        const metadata = grid.metadata.get(`${x},${y}`);
        
        // Determine color based on metadata
        const color = this.getColorForCell(metadata);
        
        // Render character
        this.renderChar(ctx, char, x, y, color);
      }
    }
  }
}
```

## Phase 4: Testing Strategy

### 4.1 ASCII State Testing
**File: src/rendering/__tests__/ASCIIState.test.ts**

Test cases:
- Grid initialization
- Cell updates
- Metadata management
- State serialization/deserialization
- Boundary checks

### 4.2 Scene Declaration Testing
**File: src/rendering/__tests__/SceneDeclaration.test.ts**

Test cases:
- Declaration validation
- Style application
- Interactive element registration
- Event handling

### 4.3 Renderer Testing
**File: src/rendering/__tests__/CanvasRenderer.test.ts**

Test cases:
- ASCII to canvas conversion
- Color mapping
- Font rendering
- Performance benchmarks

## Phase 5: Migration Strategy

### 5.1 Parallel Implementation
1. Keep existing rendering code intact
2. Build new system alongside
3. Add feature flag for switching
4. Test both systems in parallel
5. Gradually migrate scenes

### 5.2 Feature Flag Implementation
```typescript
// src/config/FeatureFlags.ts
export const FEATURE_FLAGS = {
  USE_ASCII_RENDERER: false, // Switch to true per scene
  ASCII_RENDERER_SCENES: {
    town: false,
    shop: false,
    combat: false,
    dungeon: false
  }
};
```

### 5.3 Backward Compatibility
```typescript
// In each Scene class
render(ctx: CanvasRenderingContext2D): void {
  if (FEATURE_FLAGS.ASCII_RENDERER_SCENES[this.sceneType]) {
    this.renderDeclarative(ctx);
  } else {
    this.renderImperative(ctx); // Existing code
  }
}
```

## Phase 6: Benefits Realization

### 6.1 Immediate Benefits ✅ VALIDATED
- **Testability**: ASCII states can be tested without canvas ✅ Playwright tests added
- **Debugging**: ASCII representation visible in DebugLogger ✅ Working
- **Save Files**: Human-readable save states
- **Replay System**: Record/playback of ASCII states

### 6.2 Future Benefits
- **Multiplayer**: ASCII state easy to sync
- **Mod Support**: ASCII templates for custom content
- **Terminal Version**: Direct ASCII output option
- **AI Integration**: Clear state representation for AI tools

## Timeline

### Week 1: Foundation
- Day 1-2: Core infrastructure
- Day 3-4: ASCII symbols and state management
- Day 5: Canvas renderer skeleton

### Week 2: Simple Scenes
- Day 1-2: TownScene migration
- Day 3-5: ShopScene migration

### Week 3: Complex Scenes
- Day 1-3: CombatScene migration
- Day 4-5: Testing and debugging

### Week 4: Dungeon and Polish
- Day 1-3: DungeonScene migration
- Day 4-5: Performance optimization and polish

## Success Metrics

1. **Code Reduction**: Target 40% reduction in rendering code
2. **Test Coverage**: 90% coverage of ASCII state logic
3. **Performance**: No degradation in frame rate
4. **Maintainability**: Single source of truth for rendering
5. **Debugging**: All game state visible in ASCII

## Risk Mitigation

### Risk 1: Performance Impact
**Mitigation**: Profile and optimize hot paths, cache ASCII grids

### Risk 2: Visual Regression
**Mitigation**: Screenshot testing, parallel implementation

### Risk 3: Complexity Increase
**Mitigation**: Clear documentation, gradual migration

## Completed Work (2025-09-12)

1. ✅ Phase 1 foundation implemented
2. ✅ TownScene ASCII migration complete
3. ✅ Feature flag system working
4. ✅ Comprehensive Playwright test coverage added
5. ✅ Navigation flow fixes implemented

## Next Steps

1. Migrate ShopScene to ASCII renderer
2. Add ASCII state persistence
3. Implement performance monitoring for ASCII vs Canvas
4. Create ASCII state replay system
5. Document ASCII template format for modding

## References

- Original rendering code: `src/scenes/*.ts`
- Debug logger: `src/utils/DebugLogger.ts`
- Rendering utilities: `src/utils/RenderingUtils.ts`
- UI constants: `src/config/UIConstants.ts`