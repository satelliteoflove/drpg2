const { test, expect } = require('@playwright/test');

test('debug party status panel specifically', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // Set up game state
  await page.evaluate(() => {
    if (window.game && window.game.sceneManager) {
      window.game.gameState = {
        party: {
          x: 5,
          y: 5,
          facing: 'north',
          getAliveCharacters: () => [
            { name: 'Fighter', hp: 100, maxHp: 100, mp: 50, maxMp: 50 },
            { name: 'Mage', hp: 80, maxHp: 80, mp: 100, maxMp: 100 }
          ],
          characters: [
            { name: 'Fighter', hp: 100, maxHp: 100, mp: 50, maxMp: 50 },
            { name: 'Mage', hp: 80, maxHp: 80, mp: 100, maxMp: 100 }
          ],
          move: () => {},
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
          addSystemMessage: () => {},
          render: () => {}
        },
        inCombat: false,
        combatEnabled: true
      };
      
      window.game.sceneManager.switchTo('dungeon');
    }
  });
  
  await page.waitForTimeout(500);
  
  // Enable ASCII and render
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
  
  await page.waitForTimeout(500);
  
  // Check the grid content
  const analysis = await page.evaluate(() => {
    const scene = window.game?.sceneManager?.currentScene;
    if (scene && scene.getASCIIState) {
      const asciiState = scene.getASCIIState();
      if (asciiState) {
        const gridString = asciiState.toString();
        
        // Check specific locations where status panel should be
        const grid = asciiState.getGrid();
        
        // Status panel is around X=52, Y=18
        const statusArea = [];
        for (let y = 17; y < 24; y++) {
          const row = grid.cells[y].slice(50, 78).join('');
          statusArea.push(`Y${y}: "${row}"`);
        }
        
        // Search for character names and HP/MP
        const hasPanel = gridString.includes('PARTY STATUS');
        const hasHP = gridString.includes('HP:');
        const hasMP = gridString.includes('MP:');
        const hasFighter = gridString.includes('Fighter');
        const hasMage = gridString.includes('Mage');
        
        // Search for any numbers (HP/MP values)
        const hasNumbers = /\d+\/\d+/.test(gridString);
        
        return {
          hasPanel,
          hasHP,
          hasMP,
          hasFighter,
          hasMage,
          hasNumbers,
          statusArea,
          // Get the party data that was passed
          partyData: window.game.gameState.party.getAliveCharacters()
        };
      }
    }
    return null;
  });
  
  console.log('Status Panel Analysis:', JSON.stringify(analysis, null, 2));
  
  // Take screenshot for visual inspection
  await page.screenshot({ path: 'test-results/debug-status-panel.png' });
  
  expect(analysis).toBeTruthy();
  expect(analysis.hasPanel).toBeTruthy();
  expect(analysis.hasHP || analysis.hasMP).toBeTruthy();
});