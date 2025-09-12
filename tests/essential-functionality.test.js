const { test, expect } = require('@playwright/test');

test.describe('Essential Game Functionality', () => {
  test('should load game and expose necessary objects', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);
    
    // Check that game object is exposed
    const gameExists = await page.evaluate(() => {
      return typeof window.game !== 'undefined';
    });
    expect(gameExists).toBe(true);
    
    // Check that essential methods exist
    const methodsExist = await page.evaluate(() => {
      return {
        getSceneManager: typeof window.game?.getSceneManager === 'function',
        getGameState: typeof window.game?.getGameState === 'function',
        getCanvas: typeof window.game?.getCanvas === 'function'
      };
    });
    
    expect(methodsExist.getSceneManager).toBe(true);
    expect(methodsExist.getGameState).toBe(true);
    expect(methodsExist.getCanvas).toBe(true);
    
    // Check FeatureFlags is exposed
    const featureFlagsExist = await page.evaluate(() => {
      return typeof window.FeatureFlags !== 'undefined';
    });
    expect(featureFlagsExist).toBe(true);
  });

  test('should start at MainMenu scene', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);
    
    const sceneName = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      return sceneManager?.getCurrentScene()?.getName();
    });
    
    expect(sceneName).toBe('MainMenu');
  });

  test('should navigate from MainMenu to game', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);
    
    // Press Enter to start new game
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    let sceneName = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      return sceneManager?.getCurrentScene()?.getName();
    });
    
    // Should be in New Game scene
    expect(sceneName).toBe('New Game');
    
    // Continue to Character Creation
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    sceneName = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      return sceneManager?.getCurrentScene()?.getName();
    });
    
    // Should be in Character Creation
    expect(sceneName).toBe('Character Creation');
    
    // Skip character creation with Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    sceneName = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      return sceneManager?.getCurrentScene()?.getName();
    });
    
    // Should be in Dungeon
    expect(sceneName).toBe('Dungeon');
  });

  test('should navigate between Dungeon and Town', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);
    
    // Quick navigate to game
    await page.keyboard.press('Enter'); // New Game
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter'); // Continue
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape'); // Skip character creation
    await page.waitForTimeout(500);
    
    // Should be in Dungeon
    let sceneName = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      return sceneManager?.getCurrentScene()?.getName();
    });
    expect(sceneName).toBe('Dungeon');
    
    // Go to Town
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    sceneName = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      return sceneManager?.getCurrentScene()?.getName();
    });
    expect(sceneName).toBe('Town');
    
    // Return to Dungeon
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    sceneName = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      return sceneManager?.getCurrentScene()?.getName();
    });
    expect(sceneName).toBe('Dungeon');
  });

  test('should navigate from Town to Shop', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);
    
    // Quick navigate to Town
    await page.keyboard.press('Enter'); // New Game
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter'); // Continue
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape'); // Skip character creation
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape'); // Go to Town
    await page.waitForTimeout(500);
    
    // Should be in Town
    let sceneName = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      return sceneManager?.getCurrentScene()?.getName();
    });
    expect(sceneName).toBe('Town');
    
    // Enter Shop (first option)
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    sceneName = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      return sceneManager?.getCurrentScene()?.getName();
    });
    expect(sceneName).toBe('Shop');
    
    // Return to Town
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    sceneName = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      return sceneManager?.getCurrentScene()?.getName();
    });
    expect(sceneName).toBe('Town');
  });

  test('should handle menu navigation in Town', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);
    
    // Quick navigate to Town
    await page.keyboard.press('Enter'); // New Game
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter'); // Continue
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape'); // Skip character creation
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape'); // Go to Town
    await page.waitForTimeout(500);
    
    const getSelectedOption = () => page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      const scene = sceneManager?.getCurrentScene();
      return scene?.selectedOption;
    });
    
    // Test navigation
    let selected = await getSelectedOption();
    expect(selected).toBe(0);
    
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    selected = await getSelectedOption();
    expect(selected).toBe(1);
    
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    selected = await getSelectedOption();
    expect(selected).toBe(2);
    
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    selected = await getSelectedOption();
    expect(selected).toBe(1);
  });

  test('should handle Shop menu states', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);
    
    // Quick navigate to Shop
    await page.keyboard.press('Enter'); // New Game
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter'); // Continue
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape'); // Skip character creation
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape'); // Go to Town
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter'); // Enter Shop
    await page.waitForTimeout(500);
    
    const getShopState = () => page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      const scene = sceneManager?.getCurrentScene();
      return {
        name: scene?.getName(),
        state: scene?.currentState
      };
    });
    
    // Should be in Shop main menu
    let shopInfo = await getShopState();
    expect(shopInfo.name).toBe('Shop');
    expect(shopInfo.state).toBe('main_menu');
    
    // Enter buying category
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    
    shopInfo = await getShopState();
    expect(shopInfo.state).toBe('buying_category');
    
    // Return to main menu
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    
    shopInfo = await getShopState();
    expect(shopInfo.state).toBe('main_menu');
  });

  test('should toggle feature flags', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);
    
    // Test ASCII_TOWN_SCENE flag
    const initialFlag = await page.evaluate(() => {
      return window.FeatureFlags.isEnabled('ASCII_TOWN_SCENE');
    });
    
    // Enable the flag
    await page.evaluate(() => {
      window.FeatureFlags.enable('ASCII_TOWN_SCENE');
    });
    
    const enabledFlag = await page.evaluate(() => {
      return window.FeatureFlags.isEnabled('ASCII_TOWN_SCENE');
    });
    expect(enabledFlag).toBe(true);
    
    // Disable the flag
    await page.evaluate(() => {
      window.FeatureFlags.disable('ASCII_TOWN_SCENE');
    });
    
    const disabledFlag = await page.evaluate(() => {
      return window.FeatureFlags.isEnabled('ASCII_TOWN_SCENE');
    });
    expect(disabledFlag).toBe(false);
  });

  test('should handle rapid scene transitions without errors', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);
    
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Quick navigate to game
    await page.keyboard.press('Enter'); // New Game
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter'); // Continue
    await page.waitForTimeout(200);
    await page.keyboard.press('Escape'); // Skip character creation
    await page.waitForTimeout(200);
    
    // Rapid transitions
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Escape'); // To Town
      await page.waitForTimeout(100);
      await page.keyboard.press('Enter'); // To Shop
      await page.waitForTimeout(100);
      await page.keyboard.press('Escape'); // Back to Town
      await page.waitForTimeout(100);
      await page.keyboard.press('Escape'); // To Dungeon
      await page.waitForTimeout(100);
    }
    
    expect(consoleErrors).toHaveLength(0);
  });

  test('should maintain game state across scenes', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);
    
    // Quick navigate to game
    await page.keyboard.press('Enter'); // New Game
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter'); // Continue
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape'); // Skip character creation (creates default party)
    await page.waitForTimeout(500);
    
    // Check game state exists
    const gameStateInfo = await page.evaluate(() => {
      const gameState = window.game?.getGameState();
      const totalGold = gameState?.party?.characters?.reduce((sum, char) => sum + (char.gold || 0), 0) || 0;
      return {
        hasParty: gameState?.party !== undefined && gameState?.party !== null,
        hasCharacters: gameState?.party?.characters?.length > 0,
        hasGold: totalGold > 0,
        hasMessageLog: gameState?.messageLog !== undefined,
        characterCount: gameState?.party?.characters?.length || 0
      };
    });
    
    expect(gameStateInfo.hasParty).toBe(true);
    expect(gameStateInfo.hasCharacters).toBe(true);
    expect(gameStateInfo.characterCount).toBe(4); // Default party has 4 characters
    expect(gameStateInfo.hasGold).toBe(true);
    expect(gameStateInfo.hasMessageLog).toBe(true);
  });
});