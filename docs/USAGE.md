# DRPG2 Usage Guide

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with Canvas support
- TypeScript knowledge for development

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd drpg2

# Install dependencies
npm install
```

### Development
```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Run type checking
npm run typecheck

# Run tests
npm run test

# Generate documentation
npm run docs
```

## Project Structure

### Core Development Files
```
src/
├── core/           # Game engine core
│   ├── Game.ts     # Main game class
│   ├── Scene.ts    # Scene management
│   └── Input.ts    # Input handling
├── entities/       # Game entities
├── systems/        # Game logic systems  
├── scenes/         # Game scenes
└── ui/            # UI components
```

### Configuration Files
- `webpack.config.js` - Build configuration
- `tsconfig.json` - TypeScript configuration
- `typedoc.json` - Documentation configuration
- `package.json` - Project dependencies and scripts

## Game Development Workflow

### 1. Creating New Scenes
```typescript
import { Scene } from '../core/Scene';
import { GameState } from '../types/GameTypes';
import { SceneManager } from '../core/Scene';

export class MyScene extends Scene {
  constructor(
    private gameState: GameState,
    private sceneManager: SceneManager
  ) {
    super('my_scene');
  }

  public enter(): void {
    // Scene initialization
  }

  public exit(): void {
    // Scene cleanup
  }

  public update(deltaTime: number): void {
    // Scene logic updates
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // Traditional rendering
  }

  public renderLayered(renderContext: SceneRenderContext): void {
    // Layer-based rendering
  }

  public handleInput(key: string): boolean {
    // Input handling
    return true; // Input consumed
  }
}
```

### 2. Adding New Services
```typescript
// 1. Define service interface
export interface IMyService {
  doSomething(): void;
}

// 2. Create service implementation  
export class MyService implements IMyService {
  public doSomething(): void {
    // Implementation
  }
}

// 3. Register in ServiceIdentifiers
export const ServiceIdentifiers = {
  MY_SERVICE: createServiceIdentifier<IMyService>('MyService'),
};

// 4. Register in GameServices
export class GameServices {
  public getMyService(): IMyService {
    return this.serviceContainer.resolve(ServiceIdentifiers.MY_SERVICE);
  }
}
```

### 3. Entity Development
```typescript
export class MyEntity {
  constructor(
    public x: number,
    public y: number,
    private health: number = 100
  ) {}

  public update(deltaTime: number): void {
    // Entity logic
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // Entity rendering
  }

  public takeDamage(amount: number): void {
    this.health -= amount;
  }
}
```

## Canvas Rendering Guide

### Basic Rendering
```typescript
public render(ctx: CanvasRenderingContext2D): void {
  // Clear area
  ctx.clearRect(0, 0, width, height);
  
  // Set styles
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px monospace';
  
  // Draw content
  ctx.fillText('Hello World', x, y);
  ctx.fillRect(x, y, width, height);
}
```

### Layer-Based Rendering
```typescript
public renderLayered(renderContext: SceneRenderContext): void {
  const { renderManager } = renderContext;
  
  // Background layer
  renderManager.renderToLayer('background', (ctx) => {
    this.renderBackground(ctx);
  });
  
  // Entity layer  
  renderManager.renderToLayer('entities', (ctx) => {
    this.renderEntities(ctx);
  });
  
  // UI layer
  renderManager.renderToLayer('ui', (ctx) => {
    this.renderUI(ctx);
  });
}
```

## Input Handling

### Scene Input Handling
```typescript
public handleInput(key: string): boolean {
  switch (key) {
    case 'ArrowUp':
      this.moveUp();
      return true; // Input consumed
      
    case 'Enter':
      this.selectOption();
      return true;
      
    case 'Escape':
      this.sceneManager.switchTo('main_menu');
      return true;
      
    default:
      return false; // Input not handled
  }
}
```

### Input Manager Usage
```typescript
// Set up input callback
this.inputManager.setKeyPressCallback((key: string) => {
  return this.sceneManager.handleInput(key);
});
```

## State Management

### Game State Structure
```typescript
interface GameState {
  party: Party;
  dungeon: DungeonLevel[];
  currentFloor: number;
  inCombat: boolean;
  gameTime: number;
  turnCount: number;
  combatEnabled: boolean;
}
```

### Save/Load System
```typescript
// Auto-save (handled automatically)
// Manual save
this.saveGame();

// Load game (handled automatically on startup)
const savedGame = saveManager.loadGame();
```

## Error Handling

### Safe Canvas Operations
```typescript
import { ErrorHandler } from '../utils/ErrorHandler';

ErrorHandler.safeCanvasOperation(
  () => {
    // Canvas operations that might fail
    ctx.fillText(text, x, y);
    return result;
  },
  defaultValue,
  'MyClass.myMethod'
);
```

### Error Logging
```typescript
import { ErrorSeverity } from '../utils/ErrorHandler';

ErrorHandler.logError(
  'Something went wrong',
  ErrorSeverity.MEDIUM,
  'MyClass.myMethod',
  error
);
```

## Testing

### Unit Test Example
```typescript
import { describe, it, expect } from '@jest/globals';
import { MyClass } from '../src/MyClass';

describe('MyClass', () => {
  it('should do something', () => {
    const instance = new MyClass();
    const result = instance.doSomething();
    expect(result).toBe(expectedValue);
  });
});
```

### Service Testing with Mocks
```typescript
const mockRenderManager = {
  renderToLayer: jest.fn(),
  dispose: jest.fn(),
} as jest.Mocked<RenderManager>;

// Test with mock
const scene = new MyScene(gameState, sceneManager);
scene.setRenderManager(mockRenderManager);
```

## Performance Optimization

### Rendering Best Practices
- Use `renderLayered()` for complex scenes
- Minimize canvas state changes
- Cache frequently drawn sprites
- Use dirty region tracking for selective updates

### Memory Management
- Clean up event listeners in `exit()`
- Dispose of services properly
- Avoid creating objects in render loops

## Debugging

### Debug Information
The game automatically displays:
- Current playtime
- Active scene name
- FPS and performance metrics (when available)

### Development Tools
```bash
# Watch mode for development
npm run watch

# Type checking only
npm run typecheck

# Run with coverage
npm run test:coverage
```

## Configuration

### Game Constants
Modify `src/config/GameConstants.ts`:
```typescript
export const GAME_CONFIG = {
  CANVAS: {
    WIDTH: 800,
    HEIGHT: 600,
  },
  COLORS: {
    BACKGROUND: '#000000',
    TEXT: '#ffffff',
  },
  // ... other settings
};
```

### Webpack Configuration
The project uses Webpack for:
- TypeScript compilation
- Development server with hot reload
- Asset copying and bundling
- Source map generation

This guide covers the essential patterns and practices for developing with the DRPG2 engine. For detailed API documentation, run `npm run docs` and open `docs/api/index.html`.