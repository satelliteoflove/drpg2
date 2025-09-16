# DRPG2 - Wizardry-like Dungeon RPG

A full-featured dungeon role-playing game built with TypeScript and HTML5 Canvas, inspired by the classic Wizardry series.

## Features

### ASCII Rendering Mode (AI-Friendly)
- **80x25 ASCII Grid Display**: Text-based rendering for AI systems to understand game state
- **Feature Flag System**: Toggle ASCII mode via `window.FeatureFlags.enable('ascii_rendering')`
- **Scene-Specific Toggles**: Enable ASCII for individual scenes (town, dungeon, combat, etc.)
- **Bidirectional Sync**: Prototype changes in ASCII before implementing in canvas
- **Full Test Coverage**: 42+ Playwright tests for ASCII functionality

### Core Gameplay
- **Character Creation**: Create characters with different races (Human, Elf, Dwarf, Gnome, Hobbit) and classes (Fighter, Mage, Priest, Thief, Bishop, Samurai, Lord, Ninja)
- **Party Management**: Form parties of up to 6 characters with tactical positioning
- **First-Person Dungeon Exploration**: Navigate through procedurally generated dungeons with a classic wireframe 3D view
- **Turn-Based Combat**: Engage in strategic battles with monsters using attacks, spells, and items
- **Character Progression**: Level up characters, improve stats, and learn new spells
- **Permadeath System**: Characters face permanent consequences including death and resurrection risks

### Advanced Systems
- **Equipment & Inventory**: Comprehensive item system with weapons, armor, and magical items
- **Spell System**: Mage and Priest spells with MP costs and level requirements  
- **Dungeon Generation**: Procedurally generated multi-floor dungeons with rooms, corridors, traps, and treasures
- **Save/Load System**: Persistent game saves with automatic backup and permadeath mechanics
- **Beautiful Graphics**: Retro-inspired pixel-perfect rendering with smooth animations

## Controls

### Movement
- **W/↑** - Move forward
- **S/↓** - Move backward  
- **A/←** - Turn left
- **D/→** - Turn right

### Actions
- **Enter/Space** - Interact with objects (doors, chests, stairs)
- **R** - Rest party (recover HP/MP)
- **M/Tab** - Menu (character status, inventory)
- **Esc** - Go back/Cancel

### Combat
- **↑/↓** - Select actions/targets
- **←/→** - Select targets
- **Enter** - Confirm action
- **Esc** - Go back

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck

# Run tests
npm test

# Run specific ASCII tests
npm test -- dungeon-ascii
npm test -- town-ascii
```

## Game Mechanics

### Character Classes
- **Fighter**: High HP, excellent combat skills
- **Mage**: Powerful offensive magic, low HP
- **Priest**: Healing and support magic
- **Thief**: High agility, can disarm traps
- **Bishop**: Both mage and priest spells
- **Samurai**: Elite fighter with some magic (high requirements)
- **Lord**: Ultimate fighter-priest hybrid (very high requirements)  
- **Ninja**: Master of all trades (extremely high requirements)

### Permadeath System
When a character dies, they must be resurrected. Each death:
- Increases chance of permanent loss
- Reduces vitality permanently
- May turn character to ash (unrevivable)
- Characters can be completely lost forever

### Dungeon Features
- **Multi-floor dungeons** with increasing difficulty
- **Treasure chests** containing gold and items
- **Traps** that damage the party
- **Special events** with mysterious effects
- **Monster encounters** with tactical combat
- **Stairs** to ascend/descend floors

## Technical Details

- Built with TypeScript for type safety
- HTML5 Canvas rendering for retro graphics
- Webpack for bundling and development
- Hybrid architecture combining service-oriented infrastructure with traditional OOP game logic
- Comprehensive save/load system
- Auto-save every 30 seconds

## Architecture

The game uses a **hybrid architecture** that combines the best of both worlds:

### Service-Oriented Layer (Infrastructure)
- **Core**: Game engine with dependency injection
- **Services**: IoC container for RenderManager, InputManager, SceneManager
- **Rendering**: Dual rendering system (Canvas and ASCII modes)
- **Scene Management**: State transitions and lifecycle

### Traditional OOP Layer (Game Logic)
- **Entities**: Character, Party, Monster classes with inheritance
- **Systems**: Utility classes for Combat, Inventory, Shop mechanics
- **Game Data**: Items, spells, and equipment as traditional objects
- **Business Logic**: Encapsulated within entity methods

### Supporting Components
- **UI**: Interface components and rendering
- **Utils**: Dungeon generation, save management, error handling
- **Types**: TypeScript interfaces and type definitions

## Development

The codebase is fully TypeScript with strict type checking enabled. All game systems are modular and extensible for easy modification and enhancement.

### Feature Flags

Enable features at runtime via the browser console:

```javascript
// Enable ASCII rendering globally
window.FeatureFlags.enable('ascii_rendering')

// Enable for specific scenes
window.FeatureFlags.enable('ascii_town_scene')

// Check feature status
window.FeatureFlags.status()

// Or use URL parameters
// http://localhost:8080?ff_ascii_rendering=true
```

### Documentation

**Important**: Always refer to `/docs/DOCS_INDEX.yaml` as the primary documentation index. This file is kept up-to-date and provides a searchable index of all available documentation with topics and summaries.

```yaml
# Example: Finding documentation about a specific topic
# Look in docs/DOCS_INDEX.yaml for entries like:
architecture:
  file: ARCHITECTURE.md
  topics: [system design, components, game architecture]

ascii_rendering:
  file: ASCII_RENDERING_GUIDE.md
  topics: [ASCII, rendering, text display]
```

The DOCS_INDEX.yaml file should be:
- Referenced first when looking for any documentation
- Updated immediately when any document is added, modified, or removed
- Used by AI systems (like Claude) to efficiently navigate documentation