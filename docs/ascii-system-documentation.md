# ASCII Rendering System Documentation

## Overview

The ASCII rendering system is a complete declarative rendering pipeline that uses an 80x25 ASCII grid as the internal state representation. This grid is then rendered to canvas using the CanvasRenderer, allowing for both traditional canvas rendering and ASCII-first design.

## Architecture

### Three-Layer Architecture

1. **ASCIIState Layer** (Internal Representation)
   - 80x25 grid of ASCII cells
   - Each cell contains character, foreground/background colors, and style
   - Provides methods for drawing text, boxes, lines, and other primitives

2. **SceneDeclaration Layer** (Declarative API)
   - Describes what should be rendered rather than how
   - Contains layers, UI elements, and input zones
   - Enables scene composition and reusability

3. **CanvasRenderer Layer** (Rendering Engine)
   - Converts ASCII grid to canvas rendering
   - Handles font metrics and character spacing
   - Supports both ASCII grid rendering and scene declarations

## Core Components

### ASCIIState (`src/rendering/ASCIIState.ts`)

The foundation of the ASCII system, representing a 2D grid of characters.

```typescript
interface ASCIICell {
  char: string;
  foreground?: string;
  background?: string;
  style?: ASCIIStyle;
}

class ASCIIState {
  constructor(width: number, height: number)
  getCell(x: number, y: number): ASCIICell | null
  setCell(x: number, y: number, char: string, style?: ASCIIStyle): void
  writeText(x: number, y: number, text: string, style?: ASCIIStyle): void
  drawBox(x: number, y: number, width: number, height: number): void
  clear(): void
}
```

### BaseASCIIScene (`src/rendering/BaseASCIIScene.ts`)

Abstract base class for ASCII-rendered scenes.

```typescript
abstract class BaseASCIIScene extends Scene {
  protected asciiState: ASCIIState;
  protected abstract setupInputHandlers(): void;
  protected abstract updateASCIIState(deltaTime: number): void;
  protected abstract generateSceneDeclaration(): SceneDeclaration;
}
```

### CanvasRenderer (`src/rendering/CanvasRenderer.ts`)

Converts ASCII grids and scene declarations to canvas rendering.

```typescript
class CanvasRenderer {
  renderASCIIGrid(grid: ASCIIGrid): void
  renderScene(scene: SceneDeclaration): void
}
```

### ASCIIDebugger (`src/utils/ASCIIDebugger.ts`)

Debugging utility for ASCII grids, providing visualization and inspection tools.

```typescript
class ASCIIDebugger {
  dumpGrid(grid: ASCIIState, sceneName: string, label?: string): void
  compareGrids(grid1: ASCIIState, grid2: ASCIIState, label?: string): void
  logGridStats(grid: ASCIIState, sceneName: string): void
  visualizeGrid(grid: ASCIIState): void
  exportDebugData(): string
}
```

## Scene Implementations

### TownScene ASCII Integration

The TownScene (`src/scenes/TownScene.ts`) demonstrates dynamic feature flag checking and ASCII rendering:

```typescript
public renderLayered(renderContext: SceneRenderContext): void {
  const shouldUseASCII = FeatureFlags.isEnabled(FeatureFlagKey.ASCII_TOWN_SCENE);
  
  if (shouldUseASCII && this.asciiState) {
    this.asciiState.updateSelectedIndex(this.selectedOption);
    this.asciiState.render();
    const grid = this.asciiState.getGrid();
    this.asciiRenderer.renderASCIIGrid(grid);
  } else {
    // Regular canvas rendering
  }
}
```

### ShopScene ASCII Integration

Similar pattern for ShopScene (`src/scenes/ShopScene.ts`):

```typescript
public renderLayered(renderContext: SceneRenderContext): void {
  const shouldUseASCII = FeatureFlags.isEnabled(FeatureFlagKey.ASCII_SHOP_SCENE);
  
  if (shouldUseASCII && this.asciiState) {
    // Update ASCII state with shop-specific data
    this.asciiState.updateState(this.currentState);
    this.asciiState.render();
    const grid = this.asciiState.getGrid();
    this.asciiRenderer.renderASCIIGrid(grid);
  }
}
```

## Feature Flags

The system uses feature flags for runtime toggling:

- `ascii_rendering` - Global ASCII rendering toggle
- `ascii_town_scene` - Town scene ASCII rendering
- `ascii_shop_scene` - Shop scene ASCII rendering
- `ascii_combat_scene` - Combat scene ASCII rendering
- `ascii_dungeon_scene` - Dungeon scene ASCII rendering
- `ascii_debug_overlay` - Debug overlay for ASCII state

### Console Commands

```javascript
// Enable ASCII for town scene
window.FeatureFlags.enable('ascii_town_scene')

// Disable ASCII for shop scene
window.FeatureFlags.disable('ascii_shop_scene')

// Check if feature is enabled
window.FeatureFlags.isEnabled('ascii_town_scene')

// View all feature flag statuses
window.FeatureFlags.status()
```

## Debugging Tools

### ASCIIDebugger Console Commands

```javascript
// Dump the latest ASCII grid
window.ASCIIDebugger.dump()

// Visualize grid with borders
window.ASCIIDebugger.visualize()

// Export all debug data
window.ASCIIDebugger.export()

// Clear debug data from localStorage
window.ASCIIDebugger.clear()
```

### Debug Output

The ASCIIDebugger logs to:
1. **DebugLogger** - Writes to debug log files
2. **localStorage** - Stores last 10 frames for inspection
3. **Console** - Direct console output for immediate feedback

### Test Page

Access the test page at `/test-ascii-system.html` for:
- Feature flag control
- Grid visualization
- Debug data export
- Real-time grid statistics

## Implementation Guidelines

### Adding ASCII Support to a Scene

1. **Create ASCII State Class**
   ```typescript
   export class MySceneASCIIState extends BaseASCIIScene {
     protected setupScene(): void {
       // Initialize ASCII grid layout
     }
     
     protected updateASCIIState(deltaTime: number): void {
       // Update dynamic elements
     }
   }
   ```

2. **Integrate in Scene Class**
   ```typescript
   private asciiState?: MySceneASCIIState;
   private asciiRenderer?: CanvasRenderer;
   
   public renderLayered(renderContext: SceneRenderContext): void {
     const shouldUseASCII = FeatureFlags.isEnabled(FeatureFlagKey.ASCII_MY_SCENE);
     
     if (shouldUseASCII) {
       // Initialize and render ASCII
     }
   }
   ```

3. **Add Feature Flag**
   ```typescript
   export enum FeatureFlagKey {
     ASCII_MY_SCENE = 'ascii_my_scene'
   }
   ```

### Best Practices

1. **Separation of Concerns**
   - Keep ASCII logic in dedicated ASCIIState classes
   - Scene classes should only handle toggling between rendering modes
   - Use feature flags for runtime control

2. **Performance**
   - Update ASCII state only when necessary
   - Use dirty region tracking for partial updates
   - Throttle update frequency (60 FPS max)

3. **Debugging**
   - Use ASCIIDebugger for development
   - Add periodic grid dumps in render methods
   - Log state transitions and important events

4. **Testing**
   - Use debug logging for automated verification
   - Check localStorage for grid snapshots
   - Use test pages for manual verification

## Grid Coordinate System

- Origin (0,0) is top-left
- X increases rightward (0-79)
- Y increases downward (0-24)
- Standard ASCII box drawing characters supported

## Character Set

The system supports:
- Standard ASCII characters (32-126)
- Box drawing characters (│, ─, ┌, ┐, └, ┘, ├, ┤, ┬, ┴, ┼)
- Block characters (█, ▓, ▒, ░)
- Special symbols defined in ASCIISymbols.ts

## Color Support

Colors use CSS color strings:
- Hex: `#FFFFFF`, `#FF0000`
- Named: `white`, `red`, `green`
- RGB: `rgb(255, 0, 0)`
- RGBA: `rgba(255, 0, 0, 0.5)`

## Future Enhancements

1. **Animation System**
   - Frame-based animations
   - Transition effects
   - Particle systems

2. **Advanced Rendering**
   - Multi-layer composition
   - Transparency and blending
   - Custom fonts per cell

3. **Input Handling**
   - Mouse support for ASCII grid
   - Keyboard navigation helpers
   - Touch gesture support

4. **Persistence**
   - Save/load ASCII states
   - Replay system for debugging
   - Network synchronization

## Troubleshooting

### ASCII Not Rendering

1. Check feature flag is enabled: `window.FeatureFlags.isEnabled('ascii_town_scene')`
2. Verify ASCIIDebugger shows grid data: `window.ASCIIDebugger.dump()`
3. Check browser console for errors
4. Ensure canvas dimensions match expected size

### Performance Issues

1. Check render frequency in debug logs
2. Reduce update frequency if needed
3. Use dirty region tracking
4. Profile with browser dev tools

### Debug Data Not Available

1. Ensure ASCIIDebugger is imported: Check for `import './utils/ASCIIDebugger'` in index.ts
2. Verify localStorage is not full
3. Check console for initialization errors

## Examples

### Drawing a Menu

```typescript
private drawMenu(grid: ASCIIState): void {
  // Draw border
  grid.drawBox(10, 5, 60, 15);
  
  // Draw title
  grid.writeText(35, 6, 'MAIN MENU', { foreground: '#FFFF00', bold: true });
  
  // Draw options
  const options = ['New Game', 'Load Game', 'Settings', 'Exit'];
  options.forEach((option, i) => {
    const y = 8 + i * 2;
    if (i === this.selectedIndex) {
      grid.writeText(12, y, '>', { foreground: '#FFAA00' });
    }
    grid.writeText(14, y, option, { 
      foreground: i === this.selectedIndex ? '#FFAA00' : '#FFFFFF' 
    });
  });
}
```

### Creating ASCII Art

```typescript
private drawLogo(grid: ASCIIState): void {
  const logo = [
    ' ██████╗ ██████╗ ██████╗  ██████╗ ',
    ' ██╔══██╗██╔══██╗██╔══██╗██╔════╝ ',
    ' ██║  ██║██████╔╝██████╔╝██║  ███╗',
    ' ██║  ██║██╔══██╗██╔═══╝ ██║   ██║',
    ' ██████╔╝██║  ██║██║     ╚██████╔╝',
    ' ╚═════╝ ╚═╝  ╚═╝╚═╝      ╚═════╝ '
  ];
  
  logo.forEach((line, i) => {
    grid.writeText(22, 2 + i, line, { foreground: '#00FF00' });
  });
}
```

## Conclusion

The ASCII rendering system provides a robust foundation for creating text-based interfaces with modern web technologies. By combining the simplicity of ASCII with the power of canvas rendering, it enables rapid prototyping and unique visual styles while maintaining full compatibility with existing game systems.