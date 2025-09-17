# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev          # Start development server at http://localhost:8080 with hot reload
npm run build        # Build production bundle
npm run build:dev    # Build development bundle
npm run watch        # Watch files and rebuild on changes
npm run typecheck    # Run TypeScript type checking without emitting files
```

## Project Architecture

### Hybrid Architecture Design
The game implements a hybrid architecture combining two complementary approaches:
- **Service-Oriented Architecture** (with dependency injection) for engine infrastructure
- **Traditional Object-Oriented Programming** for game entities and logic
- **Scene-based state management** for game flow control

This pragmatic approach keeps infrastructure flexible while game logic remains simple and maintainable.

```
src/
├── core/           # Core game engine and main loop
│   ├── Game.ts     # Main game class with render/update loops
│   ├── Scene.ts    # Abstract scene base class
│   ├── Input.ts    # Input handling system (exports InputManager class)
│   └── RenderingOptimizer.ts # Performance optimization with dirty regions
├── entities/       # Game entities
│   ├── Character.ts # Character class with stats and combat
│   └── Party.ts     # Party management
├── scenes/         # Game scenes (state management)
│   ├── MainMenuScene.ts       # Main menu
│   ├── CharacterCreationScene.ts # Character creation
│   ├── TownScene.ts           # Town hub
│   ├── DungeonScene.ts        # Dungeon exploration
│   ├── CombatScene.ts         # Turn-based combat
│   ├── ShopScene.ts           # Shop interface
│   └── InventoryScene.ts      # Inventory management
├── systems/        # Game logic systems
│   ├── CombatSystem.ts        # Combat logic and calculations
│   ├── InventorySystem.ts     # Inventory and equipment management
│   ├── SceneManager.ts        # Scene transitions and lifecycle
│   └── ShopSystem.ts          # Shop mechanics
├── services/       # Service layer and dependency injection
│   ├── ServiceContainer.ts    # IoC container
│   ├── ServiceRegistry.ts     # Service registration
│   ├── GameServices.ts        # Service facade
│   └── interfaces/            # Service interfaces
├── rendering/      # ASCII rendering system (feature-flagged)
│   ├── CanvasRenderer.ts      # ASCII-to-canvas renderer
│   ├── ASCIIState.ts          # ASCII grid state management
│   ├── BaseASCIIScene.ts      # Base class for ASCII scenes
│   └── ascii/                 # Scene-specific ASCII implementations
├── ui/             # User interface components
│   ├── DungeonView.ts         # First-person dungeon rendering
│   ├── StatusPanel.ts         # Party status display
│   └── MessageLog.ts          # Game messages and feedback
├── utils/          # Utility functions and helpers
│   ├── DungeonGenerator.ts    # Procedural dungeon generation
│   ├── SaveManager.ts         # Save/load functionality
│   ├── ErrorHandler.ts        # Error handling and logging
│   ├── TypeValidation.ts      # Runtime type validation
│   └── FeatureFlags.ts        # Feature flag management
├── types/          # TypeScript type definitions
│   └── GameTypes.ts           # Core game interfaces
├── config/         # Game configuration
│   ├── GameConstants.ts       # Game constants and settings
│   └── ItemProperties.ts      # Item templates and data
├── data/           # Game data
│   └── items/                 # Item definitions
└── assets/         # Game assets (sprites, maps, data)
```

### Key Design Patterns

1. **Hybrid Architecture Pattern**:
   - **Services**: Core engine functionality (rendering, input, scenes) use dependency injection
   - **Entities**: Game objects (Character, Party, Items) use traditional OOP with class inheritance
   - **Systems**: Utility classes (CombatSystem, InventorySystem) provide static helper methods

2. **Service Container Pattern**: IoC container (`ServiceContainer`) for dependency injection of engine services.

3. **Scene-Based State Management**: Each game state is a scene with lifecycle methods (`enter()`, `exit()`, `update()`, `render()`).

4. **ASCII-First Rendering System** (Feature-Flagged):
   - **Purpose**: Designed to help AI systems (like Claude Code) "see" and understand the game interface in text form
   - **80x25 ASCII Grid**: Internal state representation for easier AI manipulation
   - **Bidirectional Sync**: Changes can be prototyped in ASCII and then rendered to canvas
   - **Testing**: Enables AI to quickly model UI changes before web implementation
   - **Access**: Enable via `window.FeatureFlags.enable('ascii_rendering')`

5. **Layer-Based Rendering**: Multiple rendering layers (background, entities, effects, UI) with dirty region tracking.

6. **TypeScript Strict Mode**: Full strict mode enabled for type safety across the entire codebase.

## Webpack Configuration

The project uses Webpack for bundling with the following setup:
- TypeScript compilation via `ts-loader`
- HTML template generation with `html-webpack-plugin`
- Asset copying with `copy-webpack-plugin`
- Development server with hot module replacement on port 8080

## TypeScript Configuration

Strict TypeScript configuration with:
- Target: ES2020
- Module: ES2020
- All strict checks enabled (`strict: true`)
- Source maps for debugging
- Declaration files generation

## Game-Specific Considerations

### Wizardry-like Features to Implement
- **First-person dungeon navigation**: Grid-based movement with 90-degree turns
- **Turn-based combat**: Classic party vs monsters encounters
- **Character classes**: Fighter, Mage, Priest, Thief, etc.
- **Spell system**: Level-based magic with spell points
- **Permadeath mechanics**: Characters can permanently die
- **Party management**: Up to 6 characters in active party

### Rendering Approach
- Canvas-based rendering for retro aesthetic
- Tile-based dungeon rendering
- Sprite-based character and monster display
- Text-based UI elements with monospace fonts

### Data Management
- JSON-based game data (monsters, items, spells)
- LocalStorage for save games
- TypeScript interfaces for all game data structures

## Development Workflow

1. Run `npm run dev` to start the development server
2. Make changes to TypeScript files in `src/`
3. Webpack automatically rebuilds and refreshes the browser
4. Use `npm run typecheck` to verify type safety
5. Build for production with `npm run build`

## Feature Flags

The game uses feature flags for gradual rollout of new features:
- **Access**: `window.FeatureFlags` in browser console
- **Enable**: `window.FeatureFlags.enable('feature_name')`
- **URL Override**: `?ff_feature_name=true`
- **Key Flags**:
  - `ascii_rendering` - Global ASCII rendering toggle
  - `ascii_town_scene`, `ascii_dungeon_scene`, etc. - Scene-specific ASCII toggles
  - Designed specifically for AI systems to visualize and manipulate game state

## File Naming Conventions

- PascalCase for classes and interfaces: `Character.ts`, `ICombatStats.ts`
- camelCase for functions and variables
- Separate interface definitions in their own files when shared across modules
- Test files adjacent to source files with `.test.ts` suffix (when tests are added)
- Playwright tests in `tests/` directory for browser functionality
- Strongly avoid asynchronous functionality
- Always update tests after code has been functionally altered
- docs\DOCS_INDEX.yaml is an index of available documents, including design and implementation as well as external references, for the game. Use this index whenever considering how to build a particular solution. Always keep docs\DOCS_INDEX.yaml up to date; *every* time a document is added, updated or removed, ensure that is reflected immediately in docs\DOCS_INDEX.yaml.