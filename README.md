# DRPG2 - Wizardry-like Dungeon RPG

A full-featured dungeon role-playing game built with TypeScript and HTML5 Canvas.

## Features

### Core Gameplay
- **Character Creation**: Create characters from 11 races (Human, Elf, Dwarf, Gnome, Hobbit, Faerie, Lizman, Dracon, Rawulf, Mook, Felpurr) and 14 classes across three tiers
- **Party Management**: Form parties of up to 6 characters with tactical front/back positioning
- **First-Person Dungeon Exploration**: Navigate through procedurally generated dungeons with fog of war and classic wireframe 3D view
- **Turn-Based Combat**: Engage in strategic battles with monsters using attacks, spells, and items
- **Character Progression**: Level up characters at the Inn, improve stats, and learn new spells automatically by level
- **Permadeath System**: Characters face permanent consequences including death and resurrection risks

### Magic System
- **4 Spell Schools**: Mage, Priest, Alchemist, and Psionic magic with distinct spell lists
- **7 Spell Levels**: Each school has 7 levels of increasingly powerful spells (28 spells per school)
- **Automatic Spell Learning**: Characters learn spells automatically upon leveling up based on their class
- **Class-Based Casting**: Different fizzle penalties for pure casters, hybrids, and warrior-casters
- **Authentic Spell Database**: 112 authentic Wizardry Gaiden IV spells including damage, healing, buffs, debuffs, status effects, utility, teleportation, resurrection, and instant death effects

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

# Start the game (http://localhost:8080)
npm run dev

# Build for production
npm run build
```

## Game Mechanics

### Character Classes

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

- Built with TypeScript and HTML5 Canvas for retro graphics
- Authentic Wizardry Gaiden IV spell database with 112 spells across 4 schools (28 per school, levels 1-7)
- Save/load system with versioning and auto-save every 30 seconds
- Modular, extensible codebase