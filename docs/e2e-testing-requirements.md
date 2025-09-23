# E2E Testing Requirements for DRPG2

## What Makes Game Flow Testing Complex

The complexity stems from multiple interdependent systems that must be properly initialized in a specific order:

### 1. **Initialization Chain Dependencies**
The game has a complex initialization sequence:
```
Game constructor → GameServices → ServiceContainer → Individual Services
                → GameState (MessageLog, Party, Dungeon)
                → SceneManager → Individual Scenes
                → InputManager → Event Listeners
                → RenderManager → Canvas Layers
                → Game Loop (update/render cycle)
```

Each component depends on others being properly initialized first. Attempting to bypass this chain (like tests directly switching scenes) fails because:
- Scenes expect GameState to exist with MessageLog, Party, Dungeon
- Combat system needs proper party/monster initialization
- Rendering requires canvas context and layer management
- Input handling needs event listeners attached

### 2. **Scene Lifecycle Management**
Scenes have strict lifecycle methods that must be called in order:
- `exit()` on current scene → cleanup state
- `enter()` on new scene → initialize state
- `update()` in game loop → process changes
- `render()` in game loop → draw to canvas

The SceneManager queues scene changes and processes them during the update cycle, meaning:
- Direct scene switching bypasses the queue
- Tests can't immediately verify scene changes
- State may be inconsistent without proper lifecycle calls

### 3. **Service Container Architecture**
The game uses dependency injection through GameServices, but:
- GameServices lacks a singleton getInstance() method
- Services are created per Game instance
- Tests trying to access `GameServices.getInstance()` fail
- No way to access the game's service instances from outside

### 4. **Canvas-Based UI Testing Challenges**
Unlike DOM-based applications, the game renders everything to a canvas:
- No DOM elements to query
- Must analyze pixel data to verify UI state
- Text rendering varies by font/browser
- Coordinate-based testing is fragile
- No accessibility tree for test frameworks

## Missing Test Infrastructure

### 1. **Test Mode Support**
Currently only has basic `window.testMode` for disabling fizzling. Needs:
- Deterministic random number generation
- Disable animations/transitions
- Skip timing-based mechanics
- Force immediate scene transitions
- Bypass user prompts/confirmations

### 2. **Game Access Layer**
Tests need proper access to game internals:
```javascript
// Current (broken)
GameServices.getInstance() // Doesn't exist

// Needed
window.game.services // Access to service container
window.game.sceneManager // Direct scene access
window.game.gameState // State manipulation
```

### 3. **Scene Testing Utilities**
Helper functions for common test scenarios:
```javascript
// Skip main menu and start combat directly
await TestUtils.startCombatScene(party, monsters);

// Fast-forward through character creation
await TestUtils.createTestParty(specs);

// Verify scene state without pixel checking
const combatState = await TestUtils.getCombatState();
```

### 4. **Deterministic Test Data**
Tests need consistent, predictable data:
- Fixed character stats (no random rolls)
- Known spell effects (no fizzling)
- Predictable monster behavior
- Controlled dice rolls

## Required Changes for Effective E2E Testing

### 1. **Add GameServices Singleton Pattern**
```typescript
class GameServices {
  private static instance: GameServices;

  public static getInstance(): GameServices {
    if (!this.instance && window.game?.services) {
      this.instance = window.game.services;
    }
    return this.instance;
  }
}
```

### 2. **Expose Game Internals for Testing**
```typescript
// In Game class
public getServices(): GameServices { return this.services; }
public getSceneManager(): SceneManager { return this.sceneManager; }
public getGameState(): GameState { return this.gameState; }

// In index.ts
(window as any).game = {
  instance: game,
  services: game.getServices(),
  sceneManager: game.getSceneManager(),
  gameState: game.getGameState(),
};
```

### 3. **Create Test Setup Utilities**
```javascript
class TestSetup {
  static async initializeGame() {
    // Wait for game to fully initialize
    await page.waitForSelector('#game-canvas');
    await page.waitForFunction(() => window.game?.instance?.isRunning);
  }

  static async bypassMainMenu() {
    // Directly set up game state
    await page.evaluate(() => {
      const game = window.game.instance;
      // Initialize party and skip to desired scene
    });
  }

  static async setupCombat(partyConfig, monsterConfig) {
    // Create deterministic combat scenario
  }
}
```

### 4. **Add Scene State Queries**
Instead of pixel-based verification, add methods to query scene state:
```typescript
class CombatScene {
  public getTestState() {
    return {
      actionState: this.actionState,
      currentUnit: this.combatSystem.getCurrentUnit(),
      monsters: this.combatSystem.getMonsters(),
      party: this.combatSystem.getParty(),
      spellMenuOpen: this.actionState === 'select_spell',
      availableSpells: this.getAvailableSpells(),
    };
  }
}
```

### 5. **Implement Test Mode Flags**
```typescript
class TestMode {
  static flags = {
    deterministicRandom: false,
    skipAnimations: false,
    immediateTransitions: false,
    verboseLogging: false,
  };

  static enable(flag: string) {
    this.flags[flag] = true;
  }
}
```

## Alternative Testing Approaches

### 1. **Unit Test Core Logic**
Instead of E2E testing everything through the UI:
- Test SpellCaster.castSpell() directly
- Test CombatSystem.processTurn() in isolation
- Test damage calculations without rendering

### 2. **Integration Tests at Service Level**
Test service interactions without full game initialization:
```javascript
const spellCaster = new SpellCaster();
const combat = new CombatSystem();
// Test spell casting within combat
```

### 3. **Snapshot Testing**
For UI verification, use visual regression testing:
- Capture canvas state as images
- Compare against known good snapshots
- Flag visual differences

### 4. **State-Based Testing**
Focus on game state changes rather than UI:
```javascript
// Instead of checking if spell menu is visible
const state = await game.getCombatState();
expect(state.actionState).toBe('select_spell');
expect(state.availableSpells).toContain('flame_dart');
```

## Summary

Effective E2E testing of DRPG2 requires:
1. **Proper test infrastructure** - Singleton access, test utilities, deterministic mode
2. **State-based verification** - Query game state instead of pixels
3. **Bypass initialization complexity** - Skip directly to test scenarios
4. **Separate concerns** - Unit test logic, integration test services, E2E test critical paths
5. **Test mode support** - Deterministic behavior, immediate transitions, debug access

The current approach of trying to test through normal game flow is complex because:
- The game wasn't designed with testing in mind
- Canvas-based rendering makes UI verification difficult
- Complex initialization chain prevents easy test setup
- No test utilities or helpers exist
- Service architecture lacks test access points

Implementing these changes would make testing significantly more reliable and maintainable.