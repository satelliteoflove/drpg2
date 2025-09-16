**DRPG2 - Dungeon Crawler Game Engine v1.0.0**

***

# DRPG2 - Wizardry-like Dungeon RPG

A full-featured dungeon role-playing game built with TypeScript and HTML5 Canvas, inspired by the classic Wizardry series.

## Features

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
- Hybrid architecture: service-oriented infrastructure + traditional OOP game logic
- Comprehensive save/load system
- Auto-save every 30 seconds

## Architecture

The game follows clean separation of concerns:

- **Core**: Game engine, scenes, input handling
- **Entities**: Character, Party, and game objects
- **Systems**: Combat, Inventory, and game mechanics
- **UI**: Rendering components and user interface
- **Utils**: Dungeon generation, save management
- **Types**: TypeScript interfaces and types

## Development

The codebase is fully TypeScript with strict type checking enabled. All game systems are modular and extensible for easy modification and enhancement.
