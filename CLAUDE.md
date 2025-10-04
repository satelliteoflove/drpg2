# CLAUDE.md - Project Guidelines for Claude Code

## Core Principles
- Write code only - keep all lines executable
- No comments unless explicitly requested
- NEVER create files unless absolutely necessary - prefer editing existing files
- NEVER create documentation files (*.md) unless explicitly requested
- Use AI Interface (`window.AI`) for all testing and verification
- E2E tests are currently disabled - do not create or run them
- Maintain docs/DOCS_INDEX.yaml when documents change

## Development Commands

```bash
npm run dev          # Start dev server at http://localhost:8080
npm run build        # Production build
npm run typecheck    # TypeScript checking (run before commits)
# npm run test:e2e     # DISABLED - E2E tests are currently disabled
# npm run test:e2e:ui  # DISABLED - E2E tests are currently disabled
```

## Architecture Overview

**Hybrid Design**: Services (DI) for engine, OOP for game entities, Scene-based state management

```
src/
├── config/         # Game configuration and data
│   ├── races/      # Race configs (11 races with stat ranges)
│   ├── classes/    # Class configs (14 classes with requirements)
│   ├── progression/# Experience modifiers & spell learning tables
│   └── *.ts        # GameConstants, ItemProperties, FeatureFlags, etc.
├── core/           # Engine (Game, Scene, Input, RenderManager, AIInterface)
├── entities/       # Game objects (Character, Party)
├── scenes/         # Game states (MainMenu, CharacterCreation, Town, Dungeon, Combat, Shop, Inventory)
├── systems/        # Game logic
│   ├── dungeon/    # Dungeon movement, input handling, item pickup
│   ├── shop/       # Shop inventory and transaction management
│   ├── magic/      # Spell casting, validation, effects, learning
│   └── *.ts        # CombatSystem, InventorySystem, etc.
├── services/       # DI layer (ServiceContainer, ServiceRegistry, GameServices)
├── ui/             # UI components
│   ├── components/ # Reusable UI components (MenuInputHandler, etc.)
│   └── *.ts        # DungeonView, StatusPanel, MessageLog, etc.
├── utils/          # Utilities (DungeonGenerator, SaveManager, ErrorHandler, TypeValidation, DiceRoller, EntityUtils)
├── types/          # TypeScript definitions (GameTypes, SaveGameTypes, SpellTypes)
├── data/           # Game data files
│   └── spells/     # Spell database and definitions
└── assets/         # Game assets
```

## Key Patterns
- **Service Container**: DI for engine services
- **Scene Management**: Lifecycle methods (enter/exit/update/render)
- **AI Interface**: Programmatic game control via `window.AI` for testing and automation
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
- **Rendering**: Canvas-based retro aesthetic with layered rendering system
- **Storage**: LocalStorage saves, JSON game data

## AI Interface for Testing and Automation

The AI Interface (`window.AI`) is the **primary method** for testing and verifying game functionality. Always use this instead of DOM manipulation or visual inspection.

### Quick Reference
- `AI.getState()` - Get complete game state
- `AI.getScene()` - Get current scene name
- `AI.getParty()` - Get party location and character info
- `AI.getDungeon()` - Get dungeon floor and tile info
- `AI.getCombat()` - Get combat state and enemies
- `AI.getActions()` - Get available keyboard actions for current scene
- `AI.describe()` - Get human-readable scene description
- `AI.sendKey(key)` - Simulate keyboard input
- `AI.roll(dice)` - Roll dice (e.g., "3d6+2")

### Testing Best Practices
- **Always verify state changes** through AI Interface, not visual output
- **Use `AI.getActions()`** to know what inputs are valid before sending keys
- **Check scene transitions** with `AI.getScene()` after actions that might change scenes
- **Validate combat outcomes** by comparing before/after states from `AI.getCombat()`
- **Debug with `AI.describe()`** for readable state information in console

## Conventions
- PascalCase for classes/interfaces
- camelCase for functions/variables
- Avoid async functionality
- Maintain docs/DOCS_INDEX.yaml for all doc changes

## Logging and Debugging

**CRITICAL: Always use DebugLogger instead of console.log**

The project has a comprehensive DebugLogger system (`src/utils/DebugLogger.ts`) that must be used for all logging:

```typescript
// NEVER do this:
console.log('Something happened');  // ❌ WRONG

// ALWAYS do this:
DebugLogger.info('ModuleName', 'Something happened', { data });  // ✅ CORRECT
```

### DebugLogger Usage:
- `DebugLogger.debug()` - Detailed debug information
- `DebugLogger.info()` - General information about execution
- `DebugLogger.warn()` - Warning conditions
- `DebugLogger.error()` - Error conditions

### DebugLogger Features:
- Configurable via localStorage settings
- Export logs to file (Ctrl+Shift+L)
- Maintains history for debugging
- Integrates with development workflow
- Can capture ASCII snapshots

Even in test scripts or utilities, prefer DebugLogger over console.log for consistency and better debugging capabilities.

## Testing Workflow

### Using the AI Interface for Testing
1. **Use the browser console to verify functionality**:
   ```javascript
   // Test new features interactively
   AI.getScene();  // Verify correct scene
   AI.sendKey('a'); // Test input handling
   AI.getState();  // Verify state changes
   ```

**Important**: When adding new properties to game entities (Character, Party, Monster, etc.), always update the AI Interface (`src/core/AIInterface.ts`) to expose that data for testing. For example, when `knownSpells` was added to Character, it needed to be added to the `getPartyInfo()` method so tests could verify spell assignments.

2. **E2E Testing is Currently Disabled**
   - Do not write new Playwright/E2E tests
   - Use manual testing with the AI Interface in browser console
   - Focus on unit tests if needed

### Development Process
1. Always run `npm run typecheck` before marking work complete
2. Use `AI.describe()` in browser console to understand current game state
3. Use feature branches for new features
4. The ai/ directory contains plans and logs for AI-assisted development

## Utility Classes and DRY Principles

To maintain DRY (Don't Repeat Yourself) code:
- **Always use DiceRoller** (`src/utils/DiceRoller.ts`) for any dice rolling or random number generation
- **Always use EntityUtils** (`src/utils/EntityUtils.ts`) when working with Character or Monster entities
- **Always use SavingThrowCalculator** (`src/utils/SavingThrowCalculator.ts`) for saving throws and resistance checks
- Never duplicate dice rolling logic - use `DiceRoller.roll(notation)`
- Never duplicate entity type checking - use `EntityUtils.isCharacter()` or `EntityUtils.isMonster()`
- Never duplicate HP manipulation - use `EntityUtils.applyDamage()` or `EntityUtils.applyHealing()`
- See `docs/utilities-reference.md` for complete utility documentation

## Dependency Injection

The magic and combat systems are registered as services:
- Access via `GameServices` methods: `getSpellCaster()`, `getCombatSystem()`, etc.
- SpellRegistry and SpellCaster are singletons - use `getInstance()`
- Services are registered in `src/services/GameServices.ts`
- Service identifiers in `src/services/ServiceIdentifiers.ts`

## Debugging and Development with AI Interface

When implementing new features or fixing bugs:

1. **Start with manual testing in browser console**:
   ```javascript
   // Understand current state
   AI.describe()
   AI.getState()

   // Test your changes
   AI.sendKey('your_key')
   AI.getState() // Verify change happened
   ```

2. **Write assertions based on state, not visuals**:
   ```javascript
   // Instead of checking if a menu appears visually
   // Check the actual game state
   const beforeScene = AI.getScene();
   AI.sendKey('Enter');
   const afterScene = AI.getScene();
   console.assert(beforeScene !== afterScene, 'Scene should have changed');
   ```

3. **Use the AI Interface to reproduce bugs**:
   ```javascript
   // Create reproducible bug scenarios
   function reproduceBug() {
     // Navigate to specific state
     while (AI.getScene() !== 'dungeon') {
       AI.sendKey('Escape');
     }
     // Trigger the bug
     AI.sendKey('m'); // Open map
     return AI.getState(); // Capture state for debugging
   }
   ```

4. **Validate game logic through the interface**:
   ```javascript
   // Test damage calculation
   const enemyHp = AI.getCombat().enemies[0].hp;
   AI.sendKey('a'); // Attack
   AI.sendKey('1'); // Select first enemy
   const newHp = AI.getCombat().enemies[0].hp;
   console.log(`Damage dealt: ${enemyHp - newHp}`);
   ```
