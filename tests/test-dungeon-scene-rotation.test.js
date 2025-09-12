const { test, expect } = require('@playwright/test');

test('test DungeonScene rotation with real Party class', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // Start game and go to dungeon
  await page.evaluate(() => {
    // Start a new game
    if (window.game) {
      window.game.startGame();
    }
  });
  
  await page.waitForTimeout(500);
  
  // Go to dungeon
  await page.evaluate(() => {
    if (window.game && window.game.sceneManager) {
      window.game.sceneManager.switchTo('dungeon');
    }
  });
  
  await page.waitForTimeout(500);
  
  // Enable ASCII mode
  await page.evaluate(() => {
    window.FeatureFlags.enable('ASCII_RENDERING');
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
  
  await page.waitForTimeout(300);
  
  // Get initial facing (should be north for a new game)
  const initialFacing = await page.evaluate(() => {
    return window.game?.gameState?.party?.facing;
  });
  console.log('Initial facing:', initialFacing);
  
  // Add logging to the party's move method
  await page.evaluate(() => {
    const party = window.game?.gameState?.party;
    if (party) {
      const originalMove = party.move.bind(party);
      party.move = function(direction) {
        console.log(`Party.move called with direction: ${direction}, current facing: ${this.facing}`);
        const result = originalMove(direction);
        console.log(`After move, facing is now: ${this.facing}`);
        return result;
      };
    }
  });
  
  // Test keyboard inputs
  console.log('Pressing d key (turn right)...');
  await page.keyboard.press('d');
  await page.waitForTimeout(500);
  
  const afterD = await page.evaluate(() => {
    return window.game?.gameState?.party?.facing;
  });
  console.log('After pressing d:', afterD);
  
  console.log('Pressing ArrowRight key...');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(500);
  
  const afterArrowRight = await page.evaluate(() => {
    return window.game?.gameState?.party?.facing;
  });
  console.log('After pressing ArrowRight:', afterArrowRight);
  
  console.log('Pressing a key (turn left)...');
  await page.keyboard.press('a');
  await page.waitForTimeout(500);
  
  const afterA = await page.evaluate(() => {
    return window.game?.gameState?.party?.facing;
  });
  console.log('After pressing a:', afterA);
  
  // Capture console logs
  const logs = await page.evaluate(() => {
    return window.consoleLogs || [];
  });
  
  console.log('Console logs from page:', logs);
  
  // Now test if rotation works properly
  const rotationSequence = await page.evaluate(async () => {
    const results = [];
    const party = window.game?.gameState?.party;
    
    if (!party) {
      return { error: 'No party found' };
    }
    
    // Reset to north
    party.facing = 'north';
    results.push({ action: 'reset', facing: party.facing });
    
    // Turn right 4 times
    for (let i = 0; i < 4; i++) {
      party.move('right');
      results.push({ action: `turn right ${i+1}`, facing: party.facing });
    }
    
    // Turn left 4 times
    for (let i = 0; i < 4; i++) {
      party.move('left');
      results.push({ action: `turn left ${i+1}`, facing: party.facing });
    }
    
    return results;
  });
  
  console.log('Direct party.move test results:', JSON.stringify(rotationSequence, null, 2));
  
  // Check that rotation sequence is correct
  if (!rotationSequence.error) {
    expect(rotationSequence[0].facing).toBe('north'); // reset
    expect(rotationSequence[1].facing).toBe('east');  // right 1
    expect(rotationSequence[2].facing).toBe('south'); // right 2
    expect(rotationSequence[3].facing).toBe('west');  // right 3
    expect(rotationSequence[4].facing).toBe('north'); // right 4
    expect(rotationSequence[5].facing).toBe('west');  // left 1
    expect(rotationSequence[6].facing).toBe('south'); // left 2
    expect(rotationSequence[7].facing).toBe('east');  // left 3
    expect(rotationSequence[8].facing).toBe('north'); // left 4
  }
});