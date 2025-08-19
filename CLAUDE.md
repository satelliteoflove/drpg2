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

### Core Game Structure
The game follows an Entity-Component-System (ECS) architecture pattern suitable for a Wizardry-like dungeon crawler:

```
src/
├── core/           # Core game engine and main loop
│   ├── Game.ts     # Main game class with render/update loops
│   ├── Scene.ts    # Scene management (dungeon, battle, town)
│   └── Input.ts    # Input handling system
├── entities/       # Game entities (characters, monsters, items)
│   ├── Character.ts
│   ├── Monster.ts
│   ├── Item.ts
│   └── Party.ts
├── systems/        # Game systems (combat, movement, inventory)
│   ├── CombatSystem.ts
│   ├── MovementSystem.ts
│   ├── InventorySystem.ts
│   └── MagicSystem.ts
├── ui/             # User interface components
│   ├── DungeonView.ts    # First-person dungeon rendering
│   ├── BattleScreen.ts   # Combat interface
│   ├── StatusPanel.ts    # Party status display
│   └── MessageLog.ts     # Game messages and feedback
├── utils/          # Utility functions and helpers
│   ├── DungeonGenerator.ts
│   ├── Dice.ts
│   └── SaveManager.ts
└── assets/         # Game assets (sprites, maps, data)
```

### Key Design Patterns

1. **Game Loop**: The main game loop in `Game.ts` uses `requestAnimationFrame` for smooth rendering with delta time calculations for frame-independent updates.

2. **Scene Management**: Different game states (exploration, combat, town) are managed through a scene system allowing clean separation of concerns.

3. **Canvas Rendering**: Direct canvas 2D context rendering for retro aesthetic, with pixel-perfect rendering enabled through CSS.

4. **TypeScript Strict Mode**: Full strict mode enabled for type safety across the entire codebase.

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

## File Naming Conventions

- PascalCase for classes and interfaces: `Character.ts`, `ICombatStats.ts`
- camelCase for functions and variables
- Separate interface definitions in their own files when shared across modules
- Test files adjacent to source files with `.test.ts` suffix (when tests are added)