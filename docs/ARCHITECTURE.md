# DRPG2 Architecture Guide

## Overview

DRPG2 is a TypeScript-based dungeon crawler game engine inspired by classic Wizardry-style RPGs. The engine follows a modular architecture with service-oriented design patterns, Entity-Component-System (ECS) concepts, and clean separation of concerns.

## Core Architecture Principles

### 1. Service-Oriented Architecture
- **Service Container**: Centralized dependency injection using `ServiceContainer`
- **Service Interfaces**: Abstract contracts for all major systems
- **Service Registry**: Singleton pattern for global service access
- **Loose Coupling**: Components depend on interfaces, not concrete implementations

### 2. Scene-Based State Management
- **Scene System**: Each game state (menu, dungeon, combat) is a separate scene
- **Scene Manager**: Handles transitions and lifecycle management
- **Layered Rendering**: Support for both traditional and layer-based rendering approaches

### 3. Canvas Rendering Pipeline
- **Direct Canvas Access**: 2D context for pixel-perfect retro aesthetics
- **Rendering Optimization**: Frame-based optimization with dirty region tracking
- **Layer Compositing**: Separate rendering layers for background, entities, effects, UI
- **Performance Monitoring**: Built-in FPS tracking and render statistics

## Directory Structure

```
src/
├── core/           # Core game engine components
├── entities/       # Game entities (characters, monsters, items)
├── systems/        # Game logic systems (combat, movement, inventory)
├── services/       # Service layer and dependency injection
├── scenes/         # Game scenes (main menu, dungeon, combat)
├── ui/            # User interface components
├── utils/         # Utility functions and helpers
├── types/         # TypeScript type definitions
├── config/        # Game configuration and constants
└── assets/        # Game assets and data
```

## Core Components

### Game Class (`core/Game.ts`)
The main game class that orchestrates all systems:
- **Canvas Management**: Initializes and manages the HTML5 canvas
- **Service Initialization**: Sets up the service container and dependencies
- **Game Loop**: Manages the main update/render cycle using `requestAnimationFrame`
- **Scene Orchestration**: Handles scene transitions and lifecycle
- **Save/Load System**: Manages game persistence with auto-save functionality

### Service Layer (`services/`)
Implements dependency injection and service management:
- **ServiceContainer**: IoC container for dependency registration and resolution
- **GameServices**: Facade for accessing all game services
- **Service Interfaces**: Abstract contracts for all services
- **ServiceRegistry**: Global singleton for service access

### Scene System (`core/Scene.ts`)
Manages different game states:
- **Abstract Scene**: Base class defining scene lifecycle
- **Scene Manager**: Handles scene transitions and updates
- **Dual Rendering**: Support for both traditional and layered rendering
- **Input Delegation**: Routes input to the active scene

### Rendering System
Multi-layered rendering approach:
- **RenderManager**: High-level rendering interface
- **RenderingOptimizer**: Performance optimization with dirty regions
- **Layer Management**: Separate canvases for different visual layers
- **Sprite Caching**: LRU cache for frequently used sprites

## Design Patterns

### 1. Dependency Injection
```typescript
// Service registration
serviceContainer.register(ServiceIdentifiers.RENDER_MANAGER, RenderManager);

// Service resolution
const renderManager = services.getRenderManager();
```

### 2. Scene Pattern
```typescript
export abstract class Scene {
  public abstract enter(): void;
  public abstract exit(): void;
  public abstract update(deltaTime: number): void;
  public abstract render(ctx: CanvasRenderingContext2D): void;
  public abstract handleInput(key: string): boolean;
}
```

### 3. Service Locator
```typescript
export class GameServices {
  private serviceContainer: ServiceContainer;
  
  public getRenderManager(): RenderManager {
    return this.serviceContainer.resolve(ServiceIdentifiers.RENDER_MANAGER);
  }
}
```

## Data Flow

### 1. Game Initialization
1. Canvas setup and context creation
2. Service container initialization
3. Service registration and dependency injection
4. Scene creation and setup
5. Input system initialization

### 2. Game Loop
1. **Input Processing**: Capture and delegate user input
2. **Scene Update**: Update active scene logic with delta time
3. **Rendering**: Clear canvas and render scene content
4. **Debug Info**: Render performance and debug information

### 3. Scene Transitions
1. Current scene `exit()` called
2. New scene loaded from scene manager
3. New scene `enter()` called
4. Input delegation updated

## Error Handling

### ErrorHandler System
- **Safe Operations**: Wrapper for canvas operations with error recovery
- **Error Logging**: Categorized error logging with severity levels
- **Graceful Degradation**: Continue operation when possible after errors

### Type Validation
- **Runtime Validation**: Validate save data and external inputs
- **Type Safety**: Comprehensive TypeScript strict mode configuration
- **Error Recovery**: Fallback to default states on validation failures

## Performance Considerations

### Rendering Optimizations
- **Frame Skipping**: Skip rendering frames under performance pressure
- **Dirty Regions**: Only redraw changed areas of the screen
- **Layer Caching**: Cache static layers to avoid unnecessary redraws
- **Sprite Caching**: LRU cache for frequently accessed sprites

### Memory Management
- **Service Disposal**: Proper cleanup of services and resources
- **Event Cleanup**: Remove event listeners on scene transitions
- **Canvas Cleanup**: Clear canvas contexts to prevent memory leaks

## Configuration System

### GameConstants
Centralized configuration for:
- Canvas dimensions and rendering settings
- Color schemes and UI constants
- Performance thresholds and optimization settings
- Auto-save intervals and game mechanics

## Testing Strategy

### Unit Testing
- **Jest Framework**: TypeScript-first testing setup
- **Service Testing**: Mock services for isolated unit tests
- **Utility Testing**: Comprehensive testing of utility functions
- **Error Handling**: Test error conditions and recovery

### Integration Testing
- **Scene Testing**: Test scene transitions and lifecycle
- **Service Integration**: Test service interactions
- **Game Loop**: Test update/render cycle integration

## Future Architecture Improvements

### Planned Enhancements
1. **Component System**: Full ECS implementation for entities
2. **Asset Pipeline**: Structured asset loading and management
3. **Audio System**: Service-based audio management
4. **Network Layer**: Multiplayer support infrastructure
5. **Plugin System**: Extensible architecture for game mods

### Performance Optimizations
1. **WebGL Rendering**: GPU-accelerated rendering option
2. **Worker Threads**: Background processing for heavy computations
3. **Asset Streaming**: Dynamic loading of game content
4. **Memory Pooling**: Object pooling for frequently created objects

This architecture provides a solid foundation for a complex dungeon crawler game while maintaining code organization, testability, and performance.