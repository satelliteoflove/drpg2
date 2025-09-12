const { test, expect } = require('@playwright/test');

test('diagnose rotation bug in actual game', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'log') {
      console.log('PAGE LOG:', msg.text());
    }
  });
  
  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Wait for game to fully initialize
  
  // Click on Main Menu buttons to start game
  console.log('Looking for main menu...');
  
  // Try to click New Game
  const newGameButton = await page.locator('canvas');
  if (newGameButton) {
    // Click in the center area where "New Game" typically is
    await page.mouse.click(400, 300);
    await page.waitForTimeout(1000);
  }
  
  // Now we should be in Town, go to Dungeon
  console.log('Attempting to go to dungeon...');
  
  // Press 'e' to enter dungeon (Town scene shortcut)
  await page.keyboard.press('e');
  await page.waitForTimeout(1000);
  
  // Check if we're in dungeon
  const inDungeon = await page.evaluate(() => {
    const scene = window.game?.sceneManager?.currentScene;
    return scene?.constructor.name === 'DungeonScene';
  });
  
  if (!inDungeon) {
    console.log('Not in dungeon, trying to navigate manually...');
    
    // Try to switch to dungeon directly
    await page.evaluate(() => {
      if (window.game?.sceneManager) {
        window.game.sceneManager.switchTo('dungeon');
      }
    });
    await page.waitForTimeout(1000);
  }
  
  // Log current state
  const gameInfo = await page.evaluate(() => {
    const game = window.game;
    const scene = game?.sceneManager?.currentScene;
    const party = game?.gameState?.party;
    
    return {
      hasGame: !!game,
      currentScene: scene?.constructor.name,
      hasParty: !!party,
      partyFacing: party?.facing,
      partyPosition: party ? { x: party.x, y: party.y } : null
    };
  });
  
  console.log('Game state:', JSON.stringify(gameInfo, null, 2));
  
  // Test rotation with the actual Party instance
  console.log('\n=== Testing Party rotation directly ===');
  
  const rotationTest = await page.evaluate(() => {
    const party = window.game?.gameState?.party;
    const results = [];
    
    if (!party) {
      return { error: 'No party found' };
    }
    
    // Test the move function
    party.facing = 'north';
    results.push({ action: 'start', facing: party.facing });
    
    party.move('right');
    results.push({ action: 'move right', facing: party.facing });
    
    party.move('right');
    results.push({ action: 'move right', facing: party.facing });
    
    party.move('left');
    results.push({ action: 'move left', facing: party.facing });
    
    return results;
  });
  
  console.log('Party rotation test:', JSON.stringify(rotationTest, null, 2));
  
  // Now test keyboard input through DungeonScene
  console.log('\n=== Testing keyboard input through DungeonScene ===');
  
  // Reset facing
  await page.evaluate(() => {
    if (window.game?.gameState?.party) {
      window.game.gameState.party.facing = 'north';
    }
  });
  
  // Monitor what happens when we press keys
  await page.evaluate(() => {
    const party = window.game?.gameState?.party;
    const scene = window.game?.sceneManager?.currentScene;
    
    if (party && scene) {
      // Hook into party.move to log calls
      const originalMove = party.move.bind(party);
      party.move = function(direction) {
        console.log(`[HOOK] party.move called with: ${direction}, current facing: ${this.facing}`);
        const result = originalMove(direction);
        console.log(`[HOOK] after move, facing is: ${this.facing}`);
        return result;
      };
      
      // Hook into scene.handleInput to log calls
      if (scene.handleInput) {
        const originalHandleInput = scene.handleInput.bind(scene);
        scene.handleInput = function(key) {
          console.log(`[HOOK] scene.handleInput called with: ${key}`);
          const result = originalHandleInput(key);
          console.log(`[HOOK] handleInput returned: ${result}`);
          return result;
        };
      }
    }
  });
  
  // Test key presses
  const keyTests = [
    { key: 'd', expected: 'east' },
    { key: 'd', expected: 'south' },
    { key: 'a', expected: 'east' },
    { key: 'a', expected: 'north' },
    { key: 'ArrowRight', expected: 'east' },
    { key: 'ArrowLeft', expected: 'north' }
  ];
  
  for (const test of keyTests) {
    console.log(`\nPressing ${test.key}...`);
    await page.keyboard.press(test.key);
    await page.waitForTimeout(400);  // Wait longer than moveDelay (350ms)
    
    const facing = await page.evaluate(() => window.game?.gameState?.party?.facing);
    console.log(`After ${test.key}: facing = ${facing} (expected ${test.expected})`);
    
    if (facing !== test.expected) {
      console.log(`ERROR: Expected ${test.expected} but got ${facing}`);
    }
  }
  
  // Final summary
  const finalState = await page.evaluate(() => {
    const party = window.game?.gameState?.party;
    const scene = window.game?.sceneManager?.currentScene;
    
    return {
      partyFacing: party?.facing,
      sceneName: scene?.constructor.name,
      partyHasMoveFunction: typeof party?.move === 'function',
      sceneHasHandleInput: typeof scene?.handleInput === 'function'
    };
  });
  
  console.log('\n=== Final State ===');
  console.log(JSON.stringify(finalState, null, 2));
});