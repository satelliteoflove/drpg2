const { test, expect } = require('@playwright/test');

test.describe('ShopScene Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);
    
    // Navigate from MainMenu to Shop
    // MainMenu -> New Game -> Character Creation -> Dungeon -> Town -> Shop
    await page.keyboard.press('Enter'); // Start New Game
    await page.waitForTimeout(500);
    
    await page.keyboard.press('Enter'); // Continue from New Game
    await page.waitForTimeout(500);
    
    await page.keyboard.press('Escape'); // Skip Character Creation (creates default party)
    await page.waitForTimeout(500);
    
    await page.keyboard.press('Escape'); // Go from Dungeon to Town
    await page.waitForTimeout(500);
    
    await page.keyboard.press('Enter'); // Enter Shop (first option in Town)
    await page.waitForTimeout(500);
  });

  test('should display shop main menu', async ({ page }) => {
    const sceneInfo = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      const scene = sceneManager?.getCurrentScene();
      return {
        name: scene?.getName(),
        state: scene?.currentState,
        menuOptions: scene?.menuOptions
      };
    });
    
    expect(sceneInfo.name).toBe('Shop');
    expect(sceneInfo.state).toBe('main_menu');
    expect(sceneInfo.menuOptions).toContain('Buy Items');
    expect(sceneInfo.menuOptions).toContain('Sell Items');
    expect(sceneInfo.menuOptions).toContain('Pool Gold');
    expect(sceneInfo.menuOptions).toContain('Leave Shop');
  });

  test('should navigate shop main menu', async ({ page }) => {
    const getSelectedOption = () => page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      const scene = sceneManager?.getCurrentScene();
      return scene?.selectedOption;
    });
    
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(1);
    
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(2);
    
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(1);
  });

  test('should enter buying category selection', async ({ page }) => {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    
    const state = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      const scene = sceneManager?.getCurrentScene();
      return scene?.currentState;
    });
    expect(state).toBe('buying_category');
  });

  test('should navigate buying categories', async ({ page }) => {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    
    const getSelectedOption = () => page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      const scene = sceneManager?.getCurrentScene();
      return scene?.selectedOption;
    });
    
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(1);
    
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(2);
  });

  test('should enter item selection from category', async ({ page }) => {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    
    const state = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      const scene = sceneManager?.getCurrentScene();
      return scene?.currentState;
    });
    expect(state).toBe('buying_items');
  });

  test('should return to main menu with Escape', async ({ page }) => {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    
    const state = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      const scene = sceneManager?.getCurrentScene();
      return scene?.currentState;
    });
    expect(state).toBe('main_menu');
  });

  test('should enter selling character selection', async ({ page }) => {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    
    const state = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      const scene = sceneManager?.getCurrentScene();
      return scene?.currentState;
    });
    expect(state).toBe('selling_character_select');
  });

  test('should navigate characters for selling', async ({ page }) => {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    
    const getSelectedChar = () => page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      const scene = sceneManager?.getCurrentScene();
      return scene?.selectedCharacterIndex;
    });
    
    const partySize = await page.evaluate(() => {
      const gameState = window.game?.getGameState();
      return gameState?.party?.length || 0;
    });
    
    if (partySize > 1) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(100);
      expect(await getSelectedChar()).toBe(1);
      
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(100);
      expect(await getSelectedChar()).toBe(0);
    }
  });

  test('should enter gold pooling confirmation', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(50);
    }
    
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    
    const state = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      const scene = sceneManager?.getCurrentScene();
      return scene?.currentState;
    });
    expect(state).toBe('pooling_gold');
  });

  test('should pool gold to selected character', async ({ page }) => {
    const getGoldInfo = () => page.evaluate(() => {
      const state = window.game?.getGameState();
      return {
        partyGold: state?.gold || 0,
        characterGold: state?.party?.characters?.map(c => ({ name: c.name, gold: c.gold })) || []
      };
    });
    
    const initialGold = await getGoldInfo();
    const totalInitial = initialGold.characterGold.reduce((sum, c) => sum + c.gold, 0) + initialGold.partyGold;
    
    // Navigate to Pool Gold option
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(50);
    }
    
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    
    // Select first character to pool to
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    
    const finalGold = await getGoldInfo();
    
    // First character should have all the gold
    expect(finalGold.characterGold[0].gold).toBe(totalInitial);
    
    // Other characters should have 0
    for (let i = 1; i < finalGold.characterGold.length; i++) {
      expect(finalGold.characterGold[i].gold).toBe(0);
    }
    
    // Party gold should still be 0
    expect(finalGold.partyGold).toBe(0);
  });

  test('should cancel gold pooling', async ({ page }) => {
    const getGoldInfo = () => page.evaluate(() => {
      const state = window.game?.getGameState();
      return {
        partyGold: state?.gold || 0,
        characterGold: state?.party?.characters?.map(c => c.gold) || []
      };
    });
    
    const initialGold = await getGoldInfo();
    
    // Navigate to Pool Gold option
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(50);
    }
    
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    
    // Cancel with Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    
    const finalGold = await getGoldInfo();
    
    // Gold should remain unchanged
    expect(finalGold.partyGold).toBe(initialGold.partyGold);
    expect(finalGold.characterGold).toEqual(initialGold.characterGold);
  });

  test('should leave shop and return to town', async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(50);
    }
    
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    const currentScene = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      return sceneManager?.getCurrentScene()?.getName();
    });
    expect(currentScene).toBe('Town');
  });

  test('should handle Escape to return to town', async ({ page }) => {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    const currentScene = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      return sceneManager?.getCurrentScene()?.getName();
    });
    expect(currentScene).toBe('Town');
  });

  test('should handle buying flow with character selection', async ({ page }) => {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    
    const hasItems = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      const scene = sceneManager?.getCurrentScene();
      const category = scene?.selectedCategory;
      return scene?.shopInventory?.categories?.[category]?.length > 0;
    });
    
    if (hasItems) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);
      
      const state = await page.evaluate(() => {
        const sceneManager = window.game?.getSceneManager();
        const scene = sceneManager?.getCurrentScene();
        return scene?.currentState;
      });
      expect(state).toBe('buying_character_select');
    }
  });

  test('should handle multi-level escape navigation', async ({ page }) => {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    
    let state = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      const scene = sceneManager?.getCurrentScene();
      return scene?.currentState;
    });
    expect(state).toBe('buying_category');
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    
    state = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      const scene = sceneManager?.getCurrentScene();
      return scene?.currentState;
    });
    expect(state).toBe('main_menu');
  });

  test('should maintain state across rapid navigation', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(50);
    }
    
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    
    expect(consoleErrors).toHaveLength(0);
  });

  test('should handle complete purchase flow', async ({ page }) => {
    const initialGold = await page.evaluate(() => {
      const gameState = window.game?.getGameState();
      return gameState?.party?.[0]?.gold || 0;
    });
    
    if (initialGold > 0) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);
      
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);
      
      const hasAffordableItem = await page.evaluate(() => {
        const sceneManager = window.game?.getSceneManager();
        const scene = sceneManager?.getCurrentScene();
        const items = scene?.shopInventory?.categories?.[scene?.selectedCategory] || [];
        const gameState = window.game?.getGameState();
        const charGold = gameState?.party?.[0]?.gold || 0;
        return items.some(item => item.value <= charGold);
      });
      
      if (hasAffordableItem) {
        await page.keyboard.press('Enter');
        await page.waitForTimeout(200);
        
        await page.keyboard.press('Enter');
        await page.waitForTimeout(200);
        
        const finalGold = await page.evaluate(() => {
          const gameState = window.game?.getGameState();
          return gameState?.party?.[0]?.gold || 0;
        });
        
        expect(finalGold).toBeLessThan(initialGold);
      }
    }
  });

  test('should display shop inventory correctly', async ({ page }) => {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    
    const categories = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      const scene = sceneManager?.getCurrentScene();
      return scene?.categoryOptions?.map(c => c.name) || [];
    });
    
    expect(categories).toContain('Weapons');
    expect(categories).toContain('Armor');
    expect(categories).toContain('Shields');
    expect(categories).toContain('Accessories');
    expect(categories).toContain('Consumables');
  });
});