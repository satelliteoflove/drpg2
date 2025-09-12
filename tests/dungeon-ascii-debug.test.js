const { test, expect } = require('@playwright/test');

test.describe('DungeonScene ASCII Debug', () => {
  test('debug ASCII state initialization', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Check if game is loaded
    const gameExists = await page.evaluate(() => {
      return typeof window.game !== 'undefined';
    });
    
    console.log('Game exists:', gameExists);
    
    // Check current scene
    const currentScene = await page.evaluate(() => {
      if (window.game && window.game.sceneManager) {
        return {
          name: window.game.sceneManager.currentScene?.name,
          hasScene: window.game.sceneManager.currentScene !== null
        };
      }
      return null;
    });
    
    console.log('Current scene:', currentScene);
    
    // Try to navigate to dungeon directly
    await page.evaluate(() => {
      if (window.game && window.game.sceneManager) {
        // Create a minimal game state if needed
        if (!window.game.gameState) {
          window.game.gameState = {
            party: {
              x: 5,
              y: 5,
              facing: 'north',
              getAliveCharacters: () => [],
              characters: []
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
            }
          };
        }
        
        // Switch to dungeon scene
        window.game.sceneManager.switchTo('dungeon');
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Check if we're in dungeon scene
    const inDungeon = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      return {
        name: scene?.name,
        isDungeon: scene?.name === 'Dungeon'
      };
    });
    
    console.log('In dungeon:', inDungeon);
    
    // Enable ASCII rendering BEFORE rendering
    await page.evaluate(() => {
      if (window.FeatureFlags) {
        window.FeatureFlags.enable('ASCII_RENDERING');
        console.log('ASCII enabled:', window.FeatureFlags.isEnabled('ASCII_RENDERING'));
        
        // Also try the scene-specific flag
        window.FeatureFlags.enable('DUNGEON_ASCII', 'Dungeon');
        console.log('DUNGEON_ASCII enabled:', window.FeatureFlags.isEnabled('DUNGEON_ASCII', 'Dungeon'));
      }
    });
    
    await page.waitForTimeout(500);
    
    // Force a render to initialize ASCII components
    await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      if (scene) {
        const canvas = document.querySelector('canvas');
        const ctx = canvas?.getContext('2d');
        if (ctx) {
          console.log('Forcing render...');
          console.log('Scene name:', scene.name);
          
          // Call render multiple times to ensure initialization
          scene.render(ctx);
          scene.render(ctx);
          
          // Check if ASCII state was initialized
          if (scene.getASCIIState) {
            console.log('ASCII State after render:', scene.getASCIIState() ? 'initialized' : 'null');
          }
        }
      }
    });
    
    await page.waitForTimeout(500);
    
    // Check ASCII state using getter methods
    const asciiState = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      if (scene && scene.getASCIIState) {
        const asciiState = scene.getASCIIState();
        const canvasRenderer = scene.getCanvasRenderer();
        return {
          hasASCIIState: asciiState !== undefined && asciiState !== null,
          hasCanvasRenderer: canvasRenderer !== undefined && canvasRenderer !== null,
          sceneName: scene.name,
          asciiStateType: asciiState ? typeof asciiState : 'null'
        };
      }
      return null;
    });
    
    console.log('ASCII state:', asciiState);
    
    // Try to get grid content
    const gridContent = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      if (scene && scene.getASCIIState) {
        const asciiState = scene.getASCIIState();
        if (asciiState) {
          const grid = asciiState.getGrid();
          const sample = grid.cells.slice(0, 5).map(row => row.slice(0, 20).join('')).join('\n');
          return {
            width: grid.width,
            height: grid.height,
            sample: sample,
            hasContent: grid.cells.some(row => row.some(cell => cell !== ' '))
          };
        }
      }
      return null;
    });
    
    console.log('Grid content:', gridContent);
    
    // Take a screenshot for visual debugging
    await page.screenshot({ path: 'test-results/dungeon-ascii-debug.png' });
    
    // Assertions
    expect(gameExists).toBeTruthy();
    expect(inDungeon.isDungeon).toBeTruthy();
    expect(asciiState).toBeTruthy();
    expect(asciiState.hasASCIIState).toBeTruthy();
    expect(gridContent).toBeTruthy();
    expect(gridContent.hasContent).toBeTruthy();
  });
});