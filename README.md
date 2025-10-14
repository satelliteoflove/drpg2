# DRPG2 - Wizardry-like Dungeon RPG

A full-featured dungeon role-playing game built with TypeScript and HTML5 Canvas, faithfully implementing the Wizardry Gaiden IV character and magic systems.

## Features

### Core Gameplay
- **Character Creation**: Create characters from 11 races (Human, Elf, Dwarf, Gnome, Hobbit, Faerie, Lizman, Dracon, Rawulf, Mook, Felpurr) and 14 classes across three tiers
- **Party Management**: Form parties of up to 6 characters with tactical front/back positioning
- **First-Person Dungeon Exploration**: Navigate through procedurally generated dungeons with fog of war and classic wireframe 3D view
- **Turn-Based Combat**: Engage in strategic battles with monsters using attacks, spells, and items
- **Character Progression**: Level up characters at the Inn, improve stats, and learn new spells automatically by level
- **Permadeath System**: Characters face permanent consequences including death and resurrection risks

### Magic System (Wizardry Gaiden IV)
- **4 Spell Schools**: Mage, Priest, Alchemist, and Psionic magic with distinct spell lists
- **7 Spell Levels**: Each school has 7 levels of increasingly powerful spells
- **Automatic Spell Learning**: Characters learn spells automatically upon leveling up based on their class
- **Class-Based Casting**: Different fizzle penalties for pure casters, hybrids, and warrior-casters
- **Comprehensive Spell Database**: 50+ spells including damage, healing, buffs, debuffs, utility, and instant death effects

### Town Services
- **Temple of Cant**: Resurrection (from death or ashes), healing, cure paralysis/petrification, and curse removal with authentic level-based pricing
- **Training Grounds**: Create new characters, manage roster, change classes (when qualified)
- **Gilgamesh's Tavern**: Form and manage your active party, distribute gold, and prepare for dungeon expeditions
- **Inn**: Rest to recover HP/MP and level up pending characters with authentic Wizardry mechanics
- **Shop**: Buy, sell, identify items, and uncurse equipment

### Advanced Systems
- **Equipment & Inventory**: Comprehensive item system with weapons, armor, magical items, and enchantments
- **Dungeon Generation**: Procedurally generated multi-floor dungeons with rooms, corridors, and encounter zones
- **Fog of War**: Discover the dungeon as you explore with limited vision range
- **Save/Load System**: Persistent game saves with automatic backup and versioning
- **AI Interface**: Programmatic game control via `window.AI` for automated testing and development
- **Beautiful Graphics**: Retro-inspired pixel-perfect rendering with smooth animations

## Controls

### Dungeon Exploration
- **KJHL** or **Arrow Keys** - Move (vim-style: K=forward, J=back, H=left, L=right)
- **M** - Open map overlay
- **Tab** - Open inventory
- **R** - Rest party
- **Esc** - Return to town

### Town Navigation
- **K/J** or **↑/↓** - Navigate menu options
- **Enter** - Select option
- **Esc** - Go back/Exit to main menu

### Combat
- **↑/↓** - Select action from menu (Attack, Cast Spell, Defend, Run)
- **Enter** - Confirm selected action
- **←/→** - Select target (when attacking or casting)
- **Esc** - Cancel/Go back

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (http://localhost:8080)
npm run dev

# Build for production
npm run build

# Type checking (run before commits)
npm run typecheck

# Run unit tests
npm test
```

## Game Mechanics

### Character Classes (Wizardry Gaiden IV)

**Basic Classes** (Available to all):
- **Fighter**: High HP, excellent melee combat
- **Mage**: Powerful offensive magic school spells
- **Priest**: Divine healing and support magic
- **Thief**: High agility, backstab abilities
- **Alchemist**: Alchemy school spells, item identification

**Advanced Classes** (Higher stat requirements):
- **Bishop**: Multi-school caster (Mage + Priest spells)
- **Bard**: Hybrid fighter-caster with unique abilities
- **Ranger**: Nature warrior with combat and support magic
- **Psionic**: Master of mental/psychic school magic

**Elite Classes** (Very high stat requirements):
- **Valkyrie**: Holy warrior, female only, combines combat and divine magic
- **Samurai**: Master swordsman with limited magic access
- **Lord**: Paladin combining fighter prowess with priest magic
- **Monk**: Unarmed combat specialist with high damage potential
- **Ninja**: Ultimate hybrid with access to all equipment and abilities

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

- Built with TypeScript for type safety with strict mode enabled
- HTML5 Canvas rendering for retro graphics
- Webpack for bundling and hot module reloading in development
- Hybrid architecture combining service-oriented infrastructure with traditional OOP game logic
- Comprehensive spell database with 50+ spells across 4 schools
- Service-based magic system with SpellCaster and SpellRegistry
- Comprehensive save/load system with versioning
- Auto-save every 30 seconds
- AI Interface for automated testing and development

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

### AI Interface (Developer Tool)

The AI Interface provides programmatic access to the game for automated testing and debugging. Access it via `window.AI` in the browser console:

```javascript
// Query game state
AI.getState()           // Complete game state
AI.getScene()           // Current scene name
AI.getParty()           // Party location and characters
AI.getDungeon()         // Dungeon state
AI.getCombat()          // Combat information

// Perform actions
AI.sendKey("ArrowUp")   // Simulate keyboard input
AI.getActions()         // Get valid actions for current scene

// Utilities
AI.describe()           // Human-readable scene description
AI.roll("3d6+2")        // Dice rolling

// Example: Navigate to dungeon
AI.sendKey("ArrowDown") // Select "Enter Dungeon"
AI.sendKey("Enter")     // Confirm
```

For complete AI Interface documentation, see `docs/ai-interface.md`.

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