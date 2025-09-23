# AI Interface Documentation

The AI Interface provides programmatic access to the game for testing, automation, and AI agents. This replaces the previous ASCII rendering system with a more practical API.

## Overview

The AI Interface (`src/core/AIInterface.ts`) exposes game functionality through a clean API available at `window.AI` in the browser console. This enables:

- Automated testing and validation
- AI agent gameplay
- Debugging and development
- Performance testing

## Available Methods

### State Query Methods

#### `AI.getState()`
Returns the complete GameState object including party, dungeon, combat status, and all game variables.

```javascript
const state = AI.getState();
console.log(state.party.x, state.party.y); // Party position
console.log(state.currentFloor); // Current dungeon floor
console.log(state.inCombat); // Combat status
```

#### `AI.getScene()`
Returns the name of the current scene as a string.

```javascript
AI.getScene(); // Returns: "dungeon", "combat", "town", "shop", etc.
```

#### `AI.getParty()`
Returns structured party information including location and character details.

```javascript
const party = AI.getParty();
// Returns:
{
  location: {
    x: 10,
    y: 15,
    floor: 1,
    facing: "north"
  },
  characters: [
    {
      name: "Aldric",
      class: "Fighter",
      level: 3,
      hp: { current: 25, max: 32 },
      mp: { current: 0, max: 0 },
      status: "OK",
      isDead: false
    }
    // ... more characters
  ]
}
```

#### `AI.getDungeon()`
Returns information about the current dungeon state.

```javascript
const dungeon = AI.getDungeon();
// Returns:
{
  currentFloor: 1,
  tile: "corridor", // or "wall", "door", "stairs_up", "stairs_down", etc.
  hasMonsters: false,
  hasItems: false
}
```

#### `AI.getCombat()`
Returns combat state information when in battle.

```javascript
const combat = AI.getCombat();
// Returns:
{
  inCombat: true,
  enemies: [
    { name: "Orc", hp: 12, status: "OK" },
    { name: "Goblin", hp: 6, status: "OK" }
  ],
  currentTurn: "player"
}
```

### Action Methods

#### `AI.sendKey(key)`
Simulates a keyboard press. Returns true if the input was handled.

```javascript
AI.sendKey("ArrowUp");    // Move forward in dungeon
AI.sendKey("ArrowLeft");  // Turn left
AI.sendKey("a");          // Attack in combat
AI.sendKey("Enter");      // Select menu option
AI.sendKey("Escape");     // Back/Cancel
```

#### `AI.getActions()`
Returns an array of available keyboard actions for the current scene.

```javascript
AI.getActions();
// In dungeon: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "m", "i", "Escape"]
// In combat: ["a", "p", "d", "r", "s", "1-9"]
// In town: ["ArrowUp", "ArrowDown", "Enter", "Escape"]
```

#### `AI.describe()`
Returns a human-readable description of the current scene state.

```javascript
AI.describe();
// Returns: "Dungeon Floor 1 at (10, 15) facing north. Tile: corridor"
// Or: "Combat with 3 enemies. Turn: player"
// Or: "In the Town of Llylgamyn"
```

### Utility Methods

#### `AI.roll(dice)`
Rolls dice using standard notation and returns the result.

```javascript
AI.roll("3d6");      // Roll 3 six-sided dice
AI.roll("1d20+5");   // Roll 1d20 and add 5
AI.roll("2d10-3");   // Roll 2d10 and subtract 3
```

## Usage Examples

### Automated Dungeon Exploration

```javascript
// Simple dungeon explorer
function exploreDungeon() {
  const actions = ["ArrowUp", "ArrowUp", "ArrowLeft", "ArrowUp"];
  for (const action of actions) {
    AI.sendKey(action);
    console.log(AI.describe());

    if (AI.getCombat().inCombat) {
      console.log("Entered combat!");
      break;
    }
  }
}
```

### Combat Automation

```javascript
// Basic combat loop
function autoCombat() {
  while (AI.getCombat().inCombat) {
    const combat = AI.getCombat();
    console.log(`Fighting ${combat.enemies.length} enemies`);

    // Attack first enemy
    AI.sendKey("a");
    AI.sendKey("1");

    // Check if combat ended
    if (!AI.getCombat().inCombat) {
      console.log("Victory!");
      break;
    }
  }
}
```

### Party Health Monitor

```javascript
// Monitor party health
function checkPartyHealth() {
  const party = AI.getParty();
  party.characters.forEach(char => {
    const hpPercent = (char.hp.current / char.hp.max) * 100;
    if (hpPercent < 50) {
      console.warn(`${char.name} is at ${hpPercent.toFixed(0)}% health!`);
    }
    if (char.isDead) {
      console.error(`${char.name} has died!`);
    }
  });
}
```

### Scene Navigation

```javascript
// Navigate through town menu
function visitShop() {
  if (AI.getScene() !== "town") {
    console.log("Must be in town first");
    return;
  }

  // Navigate to shop option (typically second option)
  AI.sendKey("ArrowDown");
  AI.sendKey("Enter");

  if (AI.getScene() === "shop") {
    console.log("Entered shop successfully");
  }
}
```

## Integration with Testing

The AI Interface is designed to work with testing frameworks like Playwright:

```javascript
// In Playwright tests
await page.evaluate(() => {
  // Check game state
  const state = window.AI.getState();
  return state.party.characters.length > 0;
});

await page.evaluate(() => {
  // Simulate movement
  window.AI.sendKey("ArrowUp");
  return window.AI.getParty().location;
});
```

## Debugging Tips

1. **Check current state**: Always verify the current scene with `AI.getScene()` before sending commands
2. **Validate actions**: Use `AI.getActions()` to see what inputs are currently valid
3. **Monitor feedback**: Use `AI.describe()` for human-readable state information
4. **Handle scene transitions**: Some actions cause scene changes; always re-check state after actions

## Implementation Details

The AI Interface is implemented as a facade over the game's internal systems:

- Located at `src/core/AIInterface.ts`
- Instantiated in `src/index.ts` and exposed to `window.AI`
- Provides read-only access to game state
- Actions are validated through the scene system
- Integrates with existing utility classes (DiceRoller, EntityUtils)

## Extending the Interface

To add new functionality to the AI Interface:

1. Add the method to `AIInterface` class in `src/core/AIInterface.ts`
2. Expose it in the `window.AI` object in `src/index.ts`
3. Document the new method here
4. Add tests to verify functionality

## Migration from ASCII System

The AI Interface replaces the ASCII rendering system which was removed for being:
- Performance intensive
- Difficult to maintain
- Less useful than direct API access
- Incompatible with the layered rendering system

Instead of parsing ASCII grids, agents can now query structured data directly through the interface methods.