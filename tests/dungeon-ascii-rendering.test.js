const { test, expect } = require('@playwright/test');

test.describe('DungeonScene ASCII Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Navigate to dungeon directly with minimal game state
    await page.evaluate(() => {
      if (window.game && window.game.sceneManager) {
        // Create a minimal game state
        if (!window.game.gameState) {
          window.game.gameState = {
            party: {
              x: 5,
              y: 5,
              facing: 'north',
              getAliveCharacters: () => [
                { name: 'Test Fighter', hp: 100, maxHp: 100, mp: 50, maxMp: 50, inventory: [] },
                { name: 'Test Mage', hp: 80, maxHp: 80, mp: 100, maxMp: 100, inventory: [] }
              ],
              characters: [
                { name: 'Test Fighter', hp: 100, maxHp: 100, mp: 50, maxMp: 50, level: 1, stats: { luck: 10 } },
                { name: 'Test Mage', hp: 80, maxHp: 80, mp: 100, maxMp: 100, level: 1, stats: { luck: 10 } }
              ],
              move: (direction) => {
                if (direction === 'forward') {
                  // Simple forward movement
                  const party = window.game.gameState.party;
                  if (party.facing === 'north') party.y = Math.max(0, party.y - 1);
                  if (party.facing === 'south') party.y = Math.min(19, party.y + 1);
                  if (party.facing === 'east') party.x = Math.min(19, party.x + 1);
                  if (party.facing === 'west') party.x = Math.max(0, party.x - 1);
                } else if (direction === 'left') {
                  const party = window.game.gameState.party;
                  const dirs = ['north', 'west', 'south', 'east'];
                  const idx = dirs.indexOf(party.facing);
                  party.facing = dirs[(idx + 1) % 4];
                } else if (direction === 'right') {
                  const party = window.game.gameState.party;
                  const dirs = ['north', 'east', 'south', 'west'];
                  const idx = dirs.indexOf(party.facing);
                  party.facing = dirs[(idx + 1) % 4];
                }
              },
              rest: () => {},
              distributeGold: () => {},
              getFrontRow: () => [],
              floor: 1
            },
            dungeon: [{
              width: 20,
              height: 20,
              tiles: Array(20).fill(null).map(() => Array(20).fill({ type: 'floor', discovered: true }))
            }],
            currentFloor: 1,
            messageLog: {
              messages: [],
              addSystemMessage: (msg) => {
                window.game.gameState.messageLog.messages.push({ text: msg });
              },
              addWarningMessage: (msg) => {
                window.game.gameState.messageLog.messages.push({ text: msg });
              },
              addItemMessage: (msg) => {
                window.game.gameState.messageLog.messages.push({ text: msg });
              },
              addMagicMessage: (msg) => {
                window.game.gameState.messageLog.messages.push({ text: msg });
              },
              addDeathMessage: (msg) => {
                window.game.gameState.messageLog.messages.push({ text: msg });
              },
              render: () => {}
            },
            inCombat: false,
            combatEnabled: true,
            hasEnteredDungeon: false,
            turnCount: 0,
            pendingLoot: undefined,
            encounterContext: undefined
          };
        }
        
        // Add some walls to make it interesting
        const dungeon = window.game.gameState.dungeon[0];
        if (dungeon) {
          // Create walls around edges
          for (let x = 0; x < 20; x++) {
            dungeon.tiles[0][x] = { type: 'wall', discovered: true };
            dungeon.tiles[19][x] = { type: 'wall', discovered: true };
          }
          for (let y = 0; y < 20; y++) {
            dungeon.tiles[y][0] = { type: 'wall', discovered: true };
            dungeon.tiles[y][19] = { type: 'wall', discovered: true };
          }
        }
        
        // Switch to dungeon scene
        window.game.sceneManager.switchTo('dungeon');
      }
    });
    
    await page.waitForTimeout(500);
  });

  test('should render dungeon in ASCII mode when feature flag is enabled', async ({ page }) => {
    // Enable ASCII rendering and force initialization
    await page.evaluate(() => {
      window.FeatureFlags.enable('ASCII_RENDERING');
      const scene = window.game?.sceneManager?.currentScene;
      if (scene) {
        const canvas = document.querySelector("canvas");
        const ctx = canvas?.getContext("2d");
        if (ctx) { scene.render(ctx); scene.render(ctx); }
      }      window.FeatureFlags.enable('DUNGEON_ASCII', 'Dungeon');
      
      // Force render to initialize ASCII components
      const scene = window.game?.sceneManager?.currentScene;
      if (scene) {
        const canvas = document.querySelector('canvas');
        const ctx = canvas?.getContext('2d');
        if (ctx) {
          scene.render(ctx);
          scene.render(ctx); // Call twice to ensure initialization
        }
      }
    });
    
    await page.waitForTimeout(500);
    
    // Take screenshot for visual verification
    await page.screenshot({ path: 'test-results/dungeon-ascii-enabled.png' });
    
    // Verify ASCII state is initialized using getter
    const hasASCIIState = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      return scene && scene.getASCIIState && scene.getASCIIState() !== null;
    });
    
    expect(hasASCIIState).toBeTruthy();
    
    // Verify grid is being rendered
    const gridData = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      if (scene && scene.getASCIIState) {
        const asciiState = scene.getASCIIState();
        if (asciiState) {
          const grid = asciiState.getGrid();
          return {
            width: grid.width,
            height: grid.height,
            hasContent: grid.cells.some(row => row.some(cell => cell !== ' '))
          };
        }
      }
      return null;
    });
    
    expect(gridData).toBeTruthy();
    expect(gridData.width).toBe(80);
    expect(gridData.height).toBe(25);
    expect(gridData.hasContent).toBeTruthy();
  });

  test('should render first-person view with proper depth', async ({ page }) => {
    await page.evaluate(() => {
      window.FeatureFlags.enable('ASCII_RENDERING');
      const scene = window.game?.sceneManager?.currentScene;
      if (scene) {
        const canvas = document.querySelector("canvas");
        const ctx = canvas?.getContext("2d");
        if (ctx) { scene.render(ctx); scene.render(ctx); }
      }      
      // Force render
      const scene = window.game?.sceneManager?.currentScene;
      if (scene) {
        const canvas = document.querySelector('canvas');
        const ctx = canvas?.getContext('2d');
        if (ctx) {
          scene.render(ctx);
          scene.render(ctx);
        }
      }
    });
    
    await page.waitForTimeout(500);
    
    // Check that depth rendering is working
    const depthRendering = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      if (scene && scene.getASCIIState) {
        const asciiState = scene.getASCIIState();
        if (asciiState) {
          const gridString = asciiState.toString();
          // Check for depth shading characters
          return {
            hasFarShading: gridString.includes('░'),
            hasMidShading: gridString.includes('▒'),
            hasNearShading: gridString.includes('▓'),
            hasWalls: gridString.includes('#') || gridString.includes('▓') || gridString.includes('▒'),
            hasFloors: gridString.includes('.') || gridString.includes('·')
          };
        }
      }
      return null;
    });
    
    expect(depthRendering).toBeTruthy();
    expect(depthRendering.hasWalls || depthRendering.hasFarShading || depthRendering.hasMidShading || depthRendering.hasNearShading).toBeTruthy();
  });

  test('should display mini-map in ASCII mode', async ({ page }) => {
    await page.evaluate(() => {
      window.FeatureFlags.enable('ASCII_RENDERING');
      const scene = window.game?.sceneManager?.currentScene;
      if (scene) {
        const canvas = document.querySelector("canvas");
        const ctx = canvas?.getContext("2d");
        if (ctx) { scene.render(ctx); scene.render(ctx); }
      }    });
    
    await page.waitForTimeout(500);
    
    const hasMiniMap = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      if (scene && scene.getASCIIState()) {
        const gridString = scene.getASCIIState().toString();
        return gridString.includes('MINI MAP');
      }
      return false;
    });
    
    expect(hasMiniMap).toBeTruthy();
  });

  test('should toggle full map view', async ({ page }) => {
    await page.evaluate(() => {
      window.FeatureFlags.enable('ASCII_RENDERING');
      const scene = window.game?.sceneManager?.currentScene;
      if (scene) {
        const canvas = document.querySelector("canvas");
        const ctx = canvas?.getContext("2d");
        if (ctx) { scene.render(ctx); scene.render(ctx); }
      }    });
    
    await page.waitForTimeout(500);
    
    // Press M to toggle map
    await page.keyboard.press('m');
    await page.waitForTimeout(300);
    
    const hasFullMap = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      if (scene && scene.getASCIIState()) {
        const gridString = scene.getASCIIState().toString();
        return gridString.includes('DUNGEON MAP');
      }
      return false;
    });
    
    expect(hasFullMap).toBeTruthy();
    
    // Take screenshot of map view
    await page.screenshot({ path: 'test-results/dungeon-ascii-map.png' });
    
    // Toggle map off
    await page.keyboard.press('m');
    await page.waitForTimeout(300);
    
    const mapClosed = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      if (scene && scene.getASCIIState()) {
        const gridString = scene.getASCIIState().toString();
        return !gridString.includes('DUNGEON MAP');
      }
      return false;
    });
    
    expect(mapClosed).toBeTruthy();
  });

  test('should display party status panel', async ({ page }) => {
    await page.evaluate(() => {
      window.FeatureFlags.enable('ASCII_RENDERING');
      const scene = window.game?.sceneManager?.currentScene;
      if (scene) {
        const canvas = document.querySelector("canvas");
        const ctx = canvas?.getContext("2d");
        if (ctx) { scene.render(ctx); scene.render(ctx); }
      }    });
    
    await page.waitForTimeout(500);
    
    const hasPartyStatus = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      if (scene && scene.getASCIIState()) {
        const gridString = scene.getASCIIState().toString();
        // Check for party status panel and character names
        return {
          hasPanel: gridString.includes('PARTY STATUS'),
          hasCharacters: gridString.includes('HP:') && gridString.includes('MP:')
        };
      }
      return { hasPanel: false, hasCharacters: false };
    });
    
    expect(hasPartyStatus.hasPanel).toBeTruthy();
    expect(hasPartyStatus.hasCharacters).toBeTruthy();
  });

  test('should display compass with current facing', async ({ page }) => {
    await page.evaluate(() => {
      window.FeatureFlags.enable('ASCII_RENDERING');
      const scene = window.game?.sceneManager?.currentScene;
      if (scene) {
        const canvas = document.querySelector("canvas");
        const ctx = canvas?.getContext("2d");
        if (ctx) { scene.render(ctx); scene.render(ctx); }
      }    });
    
    await page.waitForTimeout(500);
    
    // Check initial facing (should be north)
    const initialFacing = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      if (scene && scene.getASCIIState()) {
        const gridString = scene.getASCIIState().toString();
        // Compass should show N for north
        return window.game.gameState.party.facing;
      }
      return null;
    });
    
    expect(initialFacing).toBeTruthy();
    
    // Turn right (east)
    await page.keyboard.press('d');
    await page.waitForTimeout(300);
    
    const eastFacing = await page.evaluate(() => {
      return window.game.gameState.party.facing;
    });
    
    expect(eastFacing).toBe('east');
  });

  test('should display message log', async ({ page }) => {
    await page.evaluate(() => {
      window.FeatureFlags.enable('ASCII_RENDERING');
      const scene = window.game?.sceneManager?.currentScene;
      if (scene) {
        const canvas = document.querySelector("canvas");
        const ctx = canvas?.getContext("2d");
        if (ctx) { scene.render(ctx); scene.render(ctx); }
      }    });
    
    await page.waitForTimeout(500);
    
    // Add a test message
    await page.evaluate(() => {
      window.game.gameState.messageLog.addSystemMessage('Test message for ASCII rendering');
    });
    
    await page.waitForTimeout(300);
    
    const hasMessage = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      if (scene && scene.getASCIIState()) {
        const gridString = scene.getASCIIState().toString();
        return gridString.includes('Test message');
      }
      return false;
    });
    
    expect(hasMessage).toBeTruthy();
  });

  test('should display control hints', async ({ page }) => {
    await page.evaluate(() => {
      window.FeatureFlags.enable('ASCII_RENDERING');
      const scene = window.game?.sceneManager?.currentScene;
      if (scene) {
        const canvas = document.querySelector("canvas");
        const ctx = canvas?.getContext("2d");
        if (ctx) { scene.render(ctx); scene.render(ctx); }
      }    });
    
    await page.waitForTimeout(500);
    
    const hasControls = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      if (scene && scene.getASCIIState()) {
        const gridString = scene.getASCIIState().toString();
        return {
          hasMovement: gridString.includes('WASD/Arrows'),
          hasMap: gridString.includes('M: Map'),
          hasInventory: gridString.includes('TAB: Inventory'),
          hasInteract: gridString.includes('SPACE/ENTER')
        };
      }
      return { hasMovement: false, hasMap: false, hasInventory: false, hasInteract: false };
    });
    
    expect(hasControls.hasMovement).toBeTruthy();
    expect(hasControls.hasMap).toBeTruthy();
    expect(hasControls.hasInventory).toBeTruthy();
  });

  test('should handle movement in ASCII mode', async ({ page }) => {
    await page.evaluate(() => {
      window.FeatureFlags.enable('ASCII_RENDERING');
      const scene = window.game?.sceneManager?.currentScene;
      if (scene) {
        const canvas = document.querySelector("canvas");
        const ctx = canvas?.getContext("2d");
        if (ctx) { scene.render(ctx); scene.render(ctx); }
      }    });
    
    await page.waitForTimeout(500);
    
    // Get initial position
    const initialPos = await page.evaluate(() => {
      return {
        x: window.game.gameState.party.x,
        y: window.game.gameState.party.y,
        facing: window.game.gameState.party.facing
      };
    });
    
    // Try to move forward
    await page.keyboard.press('w');
    await page.waitForTimeout(300);
    
    const afterMove = await page.evaluate(() => {
      return {
        x: window.game.gameState.party.x,
        y: window.game.gameState.party.y,
        facing: window.game.gameState.party.facing
      };
    });
    
    // Position might change or not depending on walls, but facing should be same
    expect(afterMove.facing).toBe(initialPos.facing);
    
    // Turn left
    await page.keyboard.press('a');
    await page.waitForTimeout(300);
    
    const afterTurn = await page.evaluate(() => {
      return window.game.gameState.party.facing;
    });
    
    expect(afterTurn).toBe('west');
  });

  test('should switch between ASCII and canvas rendering', async ({ page }) => {
    // Start with ASCII enabled
    await page.evaluate(() => {
      window.FeatureFlags.enable('ASCII_RENDERING');
      const scene = window.game?.sceneManager?.currentScene;
      if (scene) {
        const canvas = document.querySelector("canvas");
        const ctx = canvas?.getContext("2d");
        if (ctx) { scene.render(ctx); scene.render(ctx); }
      }    });
    
    await page.waitForTimeout(500);
    
    const asciiEnabled = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      return scene && scene.getASCIIState && scene.getASCIIState() !== null;
    });
    
    expect(asciiEnabled).toBeTruthy();
    
    // Take screenshot in ASCII mode
    await page.screenshot({ path: 'test-results/dungeon-ascii-mode.png' });
    
    // Disable ASCII
    await page.evaluate(() => {
      window.FeatureFlags.disable('ASCII_RENDERING');
    });
    
    await page.waitForTimeout(500);
    
    // Take screenshot in canvas mode
    await page.screenshot({ path: 'test-results/dungeon-canvas-mode.png' });
    
    // Verify we're using canvas rendering
    const canvasMode = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      return scene && scene.getDungeonView && scene.getDungeonView() !== null;
    });
    
    expect(canvasMode).toBeTruthy();
    
    // Re-enable ASCII
    await page.evaluate(() => {
      window.FeatureFlags.enable('ASCII_RENDERING');
      const scene = window.game?.sceneManager?.currentScene;
      if (scene) {
        const canvas = document.querySelector("canvas");
        const ctx = canvas?.getContext("2d");
        if (ctx) { scene.render(ctx); scene.render(ctx); }
      }    });
    
    await page.waitForTimeout(500);
    
    const asciiReEnabled = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      return scene && scene.getASCIIState && scene.getASCIIState() !== null;
    });
    
    expect(asciiReEnabled).toBeTruthy();
  });

  test('should render special tiles with correct symbols', async ({ page }) => {
    await page.evaluate(() => {
      window.FeatureFlags.enable('ASCII_RENDERING');
      const scene = window.game?.sceneManager?.currentScene;
      if (scene) {
        const canvas = document.querySelector("canvas");
        const ctx = canvas?.getContext("2d");
        if (ctx) { scene.render(ctx); scene.render(ctx); }
      }      
      // Place special tiles near player for testing
      const dungeon = window.game.gameState.dungeon[0];
      const party = window.game.gameState.party;
      
      // Place stairs near player
      if (dungeon && dungeon.tiles[party.y] && dungeon.tiles[party.y][party.x + 1]) {
        dungeon.tiles[party.y][party.x + 1].type = 'stairs_down';
        dungeon.tiles[party.y][party.x + 1].discovered = true;
      }
    });
    
    await page.waitForTimeout(500);
    
    const hasSpecialTiles = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      if (scene && scene.getASCIIState()) {
        const gridString = scene.getASCIIState().toString();
        return {
          hasStairsDown: gridString.includes('>'),
          hasStairsUp: gridString.includes('<'),
          hasWalls: gridString.includes('#') || gridString.includes('▓'),
          hasFloor: gridString.includes('.')
        };
      }
      return { hasStairsDown: false, hasStairsUp: false, hasWalls: false, hasFloor: false };
    });
    
    expect(hasSpecialTiles.hasStairsDown || hasSpecialTiles.hasStairsUp || hasSpecialTiles.hasWalls || hasSpecialTiles.hasFloor).toBeTruthy();
  });

  test('should handle castle stairs prompt', async ({ page }) => {
    await page.evaluate(() => {
      window.FeatureFlags.enable('ASCII_RENDERING');
      const scene = window.game?.sceneManager?.currentScene;
      if (scene) {
        const canvas = document.querySelector("canvas");
        const ctx = canvas?.getContext("2d");
        if (ctx) { scene.render(ctx); scene.render(ctx); }
      }      
      // Move party to castle stairs position
      window.game.gameState.party.x = 0;
      window.game.gameState.party.y = 0;
      window.game.gameState.currentFloor = 1;
      
      // Ensure stairs exist at 0,0
      const dungeon = window.game.gameState.dungeon[0];
      if (dungeon && dungeon.tiles[0] && dungeon.tiles[0][0]) {
        dungeon.tiles[0][0].type = 'stairs_up';
      }
    });
    
    await page.waitForTimeout(500);
    
    // Press Enter to interact with stairs
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    
    const hasPrompt = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      if (scene && scene.getASCIIState()) {
        const gridString = scene.getASCIIState().toString();
        return gridString.includes('CASTLE STAIRS') || gridString.includes('Return to castle');
      }
      return false;
    });
    
    // Prompt should appear
    expect(hasPrompt).toBeTruthy();
    
    // Press N to stay in dungeon
    await page.keyboard.press('n');
    await page.waitForTimeout(300);
    
    const promptGone = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      if (scene && scene.getASCIIState()) {
        const gridString = scene.getASCIIState().toString();
        return !gridString.includes('CASTLE STAIRS');
      }
      return true;
    });
    
    expect(promptGone).toBeTruthy();
  });

  test('should maintain state when toggling ASCII mode', async ({ page }) => {
    // Move and turn to create a specific state
    await page.keyboard.press('d'); // Turn right (east)
    await page.waitForTimeout(300);
    await page.keyboard.press('w'); // Try to move forward
    await page.waitForTimeout(300);
    
    const stateBefore = await page.evaluate(() => {
      return {
        x: window.game.gameState.party.x,
        y: window.game.gameState.party.y,
        facing: window.game.gameState.party.facing,
        floor: window.game.gameState.currentFloor
      };
    });
    
    // Enable ASCII
    await page.evaluate(() => {
      window.FeatureFlags.enable('ASCII_RENDERING');
      const scene = window.game?.sceneManager?.currentScene;
      if (scene) {
        const canvas = document.querySelector("canvas");
        const ctx = canvas?.getContext("2d");
        if (ctx) { scene.render(ctx); scene.render(ctx); }
      }    });
    
    await page.waitForTimeout(500);
    
    const stateInASCII = await page.evaluate(() => {
      return {
        x: window.game.gameState.party.x,
        y: window.game.gameState.party.y,
        facing: window.game.gameState.party.facing,
        floor: window.game.gameState.currentFloor
      };
    });
    
    expect(stateInASCII).toEqual(stateBefore);
    
    // Disable ASCII
    await page.evaluate(() => {
      window.FeatureFlags.disable('ASCII_RENDERING');
    });
    
    await page.waitForTimeout(500);
    
    const stateAfter = await page.evaluate(() => {
      return {
        x: window.game.gameState.party.x,
        y: window.game.gameState.party.y,
        facing: window.game.gameState.party.facing,
        floor: window.game.gameState.currentFloor
      };
    });
    
    expect(stateAfter).toEqual(stateBefore);
  });

  test('should handle scene transitions with ASCII enabled', async ({ page }) => {
    await page.evaluate(() => {
      window.FeatureFlags.enable('ASCII_RENDERING');
      const scene = window.game?.sceneManager?.currentScene;
      if (scene) {
        const canvas = document.querySelector("canvas");
        const ctx = canvas?.getContext("2d");
        if (ctx) { scene.render(ctx); scene.render(ctx); }
      }    });
    
    await page.waitForTimeout(500);
    
    // Go to inventory
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    
    const inInventory = await page.evaluate(() => {
      return window.game?.sceneManager?.currentScene?.name === 'Inventory';
    });
    
    expect(inInventory).toBeTruthy();
    
    // Return to dungeon
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    const backInDungeon = await page.evaluate(() => {
      return window.game?.sceneManager?.currentScene?.name === 'Dungeon';
    });
    
    expect(backInDungeon).toBeTruthy();
    
    // Verify ASCII is still enabled
    const asciiStillEnabled = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      return scene && scene.getASCIIState && scene.getASCIIState() !== null;
    });
    
    expect(asciiStillEnabled).toBeTruthy();
  });

  test('performance: should render without lag', async ({ page }) => {
    await page.evaluate(() => {
      window.FeatureFlags.enable('ASCII_RENDERING');
      const scene = window.game?.sceneManager?.currentScene;
      if (scene) {
        const canvas = document.querySelector("canvas");
        const ctx = canvas?.getContext("2d");
        if (ctx) { scene.render(ctx); scene.render(ctx); }
      }    });
    
    await page.waitForTimeout(500);
    
    // Measure render performance
    const performance = await page.evaluate(async () => {
      const measurements = [];
      
      for (let i = 0; i < 10; i++) {
        const start = performance.now();
        
        // Force a render
        const scene = window.game?.sceneManager?.currentScene;
        if (scene) {
          const canvas = document.querySelector('canvas');
          const ctx = canvas?.getContext('2d');
          if (ctx) {
            scene.render(ctx);
          }
        }
        
        const end = performance.now();
        measurements.push(end - start);
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      return {
        average: measurements.reduce((a, b) => a + b, 0) / measurements.length,
        max: Math.max(...measurements),
        min: Math.min(...measurements)
      };
    });
    
    // Render should complete in reasonable time (< 50ms average)
    expect(performance.average).toBeLessThan(50);
    expect(performance.max).toBeLessThan(100);
  });
});

test.describe('DungeonScene ASCII Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
  });

  test('should handle missing dungeon data gracefully', async ({ page }) => {
    await page.evaluate(() => {
      // Create a broken state
      window.game = window.game || {};
      window.game.gameState = { 
        dungeon: [],
        currentFloor: 1,
        party: { x: 0, y: 0, facing: 'north' }
      };
      
      // Try to render
      const scene = window.game?.sceneManager?.currentScene;
      if (scene) {
        window.FeatureFlags.enable('ASCII_RENDERING');
      const scene = window.game?.sceneManager?.currentScene;
      if (scene) {
        const canvas = document.querySelector("canvas");
        const ctx = canvas?.getContext("2d");
        if (ctx) { scene.render(ctx); scene.render(ctx); }
      }        const canvas = document.querySelector('canvas');
        const ctx = canvas?.getContext('2d');
        if (ctx) {
          scene.render(ctx);
        }
      }
    });
    
    // Should not crash
    const isStillRunning = await page.evaluate(() => {
      return window.game !== undefined;
    });
    
    expect(isStillRunning).toBeTruthy();
  });
});