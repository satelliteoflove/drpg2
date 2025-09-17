# CLAUDE.md - Project Guidelines for Claude Code

## Core Principles
- Write code only - keep all lines executable
- No comments unless explicitly requested
- NEVER create files unless absolutely necessary - prefer editing existing files
- NEVER create documentation files (*.md) unless explicitly requested
- Always update tests after functional changes
- Maintain docs/DOCS_INDEX.yaml when documents change

## Development Commands

```bash
npm run dev          # Start dev server at http://localhost:8080
npm run build        # Production build
npm run typecheck    # TypeScript checking (run before commits)
```

## Architecture Overview

**Hybrid Design**: Services (DI) for engine, OOP for game entities, Scene-based state management

```
src/
├── config/         # Game configuration and data
│   ├── races/      # Race configs (11 races with stat ranges)
│   ├── classes/    # Class configs (14 classes with requirements)
│   ├── progression/# Experience modifiers & spell learning tables
│   └── *.ts        # GameConstants, ItemProperties, etc.
├── core/           # Engine (Game, Scene, Input, RenderingOptimizer)
├── entities/       # Game objects (Character, Party)
├── scenes/         # Game states (MainMenu, CharacterCreation, Town, Dungeon, Combat, Shop, Inventory)
├── systems/        # Game logic (CombatSystem, InventorySystem, SceneManager, ShopSystem)
├── services/       # DI layer (ServiceContainer, ServiceRegistry, GameServices)
├── rendering/      # ASCII system (feature-flagged, CanvasRenderer, ASCIIState)
├── ui/             # UI components (DungeonView, StatusPanel, MessageLog)
├── utils/          # Utilities (DungeonGenerator, SaveManager, ErrorHandler, TypeValidation, FeatureFlags)
├── types/          # TypeScript definitions (GameTypes, SaveGameTypes)
├── data/           # Game data files
└── assets/         # Game assets
```

## Key Patterns
- **Service Container**: DI for engine services
- **Scene Management**: Lifecycle methods (enter/exit/update/render)
- **ASCII Rendering**: Feature-flagged 80x25 grid for AI visualization (`window.FeatureFlags.enable('ascii_rendering')`)
- **TypeScript Strict Mode**: Full type safety enabled

## Wizardry Gaiden IV Implementation

### Current Character System
- **11 Races**: Human, Elf, Dwarf, Gnome, Hobbit, Faerie, Lizman, Dracon, Rawulf, Mook, Felpurr
- **14 Classes**: Fighter, Mage, Priest, Thief, Alchemist (basic); Bishop, Bard, Ranger, Psionic (advanced); Valkyrie, Samurai, Lord, Monk, Ninja (elite)
- **Race-based stat ranges**: Each race has min/max values for ST, IQ, PI, VT, AG, LK
- **Experience modifiers**: 0.8x-1.6x based on race/class combination
- **Pending level-up system**: Characters must visit Inn to level up (no auto-leveling)
- **4 Spell schools**: mage, priest, alchemist, psionic
- **Gender system**: Including Valkyrie female-only restriction
- **Save versioning**: Started at "0.0.3"

### Technical Stack
- **Webpack**: TypeScript via ts-loader, HMR on port 8080
- **TypeScript**: ES2020 target, strict mode, source maps
- **Rendering**: Canvas-based retro aesthetic, ASCII feature flag for AI
- **Storage**: LocalStorage saves, JSON game data

## Feature Flags
Access via `window.FeatureFlags.enable('feature_name')` or URL `?ff_feature_name=true`
- `ascii_rendering` - Enable ASCII visualization
- `ascii_*_scene` - Scene-specific ASCII toggles

## Conventions
- PascalCase for classes/interfaces
- camelCase for functions/variables
- Avoid async functionality
- Maintain docs/DOCS_INDEX.yaml for all doc changes

## Workflow
1. Always run `npm run typecheck` before marking work complete
2. Upon adding or changing an entity or scene, test the intended outcome of that entity or scene
3. Use feature branches for new features
4. The ai/ directory contains plans and logs for AI-assisted development
