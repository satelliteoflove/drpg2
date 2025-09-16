const { test, expect } = require('@playwright/test');

// Helper function to navigate to Shop
async function navigateToShop(page) {
  // Start from MainMenu
  await page.keyboard.press('Enter'); // New Game
  await page.waitForTimeout(500);

  // Now in New Game scene
  await page.keyboard.press('Enter'); // Continue
  await page.waitForTimeout(500);

  // Now in Character Creation
  await page.keyboard.press('Escape'); // Skip to Dungeon with default party
  await page.waitForTimeout(500);

  // Now in Dungeon
  await page.keyboard.press('Escape'); // Go to Town
  await page.waitForTimeout(500);

  // Now in Town
  await page.keyboard.press('Enter'); // Enter Shop (first option)
  await page.waitForTimeout(500);
}

test.describe('ShopScene Functionality (Fixed)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);
    await navigateToShop(page);
  });

  test('should display shop main menu', async ({ page }) => {
    const sceneInfo = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      const scene = sceneManager?.getCurrentScene();
      return {
        name: scene?.getName(),
        state: scene?.currentState,
        menuOptions: scene?.menuOptions,
        selectedOption: scene?.selectedOption,
      };
    });

    expect(sceneInfo.name).toBe('Shop');
    expect(sceneInfo.state).toBe('main_menu');
    expect(sceneInfo.menuOptions).toContain('Buy Items');
    expect(sceneInfo.menuOptions).toContain('Sell Items');
    expect(sceneInfo.menuOptions).toContain('Pool Gold');
    expect(sceneInfo.menuOptions).toContain('Leave Shop');
    expect(sceneInfo.selectedOption).toBe(0);
  });

  test('should navigate shop menu', async ({ page }) => {
    const getSelectedOption = () =>
      page.evaluate(() => {
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
    await page.keyboard.press('Enter'); // Select "Buy Items"
    await page.waitForTimeout(200);

    const state = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      const scene = sceneManager?.getCurrentScene();
      return scene?.currentState;
    });
    expect(state).toBe('buying_category');

    // Can return to main menu
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    const newState = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      const scene = sceneManager?.getCurrentScene();
      return scene?.currentState;
    });
    expect(newState).toBe('main_menu');
  });

  test('should handle gold pooling', async ({ page }) => {
    // First, check what menu options are available
    const menuInfo = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      const scene = sceneManager?.getCurrentScene();
      return {
        menuOptions: scene?.menuOptions,
        selectedOption: scene?.selectedOption,
      };
    });
    console.log('Shop menu options:', menuInfo);

    // Navigate to Pool Gold option (it's at index 3)
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(50);
    }

    const getGoldInfo = () =>
      page.evaluate(() => {
        const state = window.game?.getGameState();
        return {
          partyGold: state?.gold || 0,
          characterGold: state?.party?.characters?.map((c) => c.gold) || [],
        };
      });

    const initialGold = await getGoldInfo();
    const totalBefore =
      initialGold.characterGold.reduce((a, b) => a + b, 0) + initialGold.partyGold;

    // Enter pooling
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    const poolingState = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      const scene = sceneManager?.getCurrentScene();
      return scene?.currentState;
    });
    expect(poolingState).toBe('pooling_gold');

    // Select first character (default) and confirm pooling with Enter
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    const finalGold = await getGoldInfo();
    // First character should have all the gold
    expect(finalGold.characterGold[0]).toBe(totalBefore);
    // Party gold should be 0 (it was pooled to the character)
    expect(finalGold.partyGold).toBe(0);
    // All other characters should have 0 gold
    for (let i = 1; i < finalGold.characterGold.length; i++) {
      expect(finalGold.characterGold[i]).toBe(0);
    }
  });

  test('should return to town on Escape', async ({ page }) => {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const currentScene = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      return sceneManager?.getCurrentScene()?.getName();
    });
    expect(currentScene).toBe('Town');
  });

  test('should leave shop via menu option', async ({ page }) => {
    // Navigate to "Leave Shop" option
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
});
