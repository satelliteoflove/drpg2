const { test, expect } = require('@playwright/test');

test.describe('ShopScene Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);

    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(500);

    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(500);

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);
  });

  test('should display shop main menu', async ({ page }) => {
    const sceneName = await page.evaluate(() => window.AI.getScene());
    expect(sceneName).toBe('Shop');

    const description = await page.evaluate(() => window.AI.describe());
    expect(description).toContain("Boltac's Trading Post");

    const sceneInfo = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.getCurrentScene();
      return {
        state: scene?.currentState,
        menuOptions: scene?.menuOptions,
      };
    });

    expect(sceneInfo.state).toBe('main_menu');
    expect(sceneInfo.menuOptions).toContain('Buy Items');
    expect(sceneInfo.menuOptions).toContain('Sell Items');
    expect(sceneInfo.menuOptions).toContain('Pool Gold');
    expect(sceneInfo.menuOptions).toContain('Leave Shop');
  });

  test('should navigate shop main menu', async ({ page }) => {
    const getSelectedOption = () =>
      page.evaluate(() => {
        const scene = window.game?.sceneManager?.getCurrentScene();
        return scene?.selectedOption;
      });

    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(1);

    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(2);

    await page.evaluate(() => window.AI.sendKey('ArrowUp'));
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(1);
  });

  test('should enter buying category selection', async ({ page }) => {
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);

    const state = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.getCurrentScene();
      return scene?.currentState;
    });
    expect(state).toBe('buying_category');
  });

  test('should navigate buying categories', async ({ page }) => {
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);

    const getSelectedOption = () =>
      page.evaluate(() => {
        const scene = window.game?.sceneManager?.getCurrentScene();
        return scene?.selectedOption;
      });

    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(1);

    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(2);
  });

  test('should enter item selection from category', async ({ page }) => {
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);

    const state = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.getCurrentScene();
      return scene?.currentState;
    });
    expect(state).toBe('buying_items');
  });

  test('should return to main menu with Escape', async ({ page }) => {
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);

    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(200);

    const state = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.getCurrentScene();
      return scene?.currentState;
    });
    expect(state).toBe('main_menu');
  });

  test('should enter selling character selection', async ({ page }) => {
    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(100);

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);

    const state = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.getCurrentScene();
      return scene?.currentState;
    });
    expect(state).toBe('selling_character_select');
  });

  test('should navigate characters for selling', async ({ page }) => {
    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(100);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);

    const getSelectedChar = () =>
      page.evaluate(() => {
        const scene = window.game?.sceneManager?.getCurrentScene();
        return scene?.selectedCharacterIndex;
      });

    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(100);
    expect(await getSelectedChar()).toBe(1);

    await page.evaluate(() => window.AI.sendKey('ArrowUp'));
    await page.waitForTimeout(100);
    expect(await getSelectedChar()).toBe(0);
  });

  test('should enter pooling mode', async ({ page }) => {
    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(100);
    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(100);

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);

    const state = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.getCurrentScene();
      return scene?.currentState;
    });
    expect(state).toBe('pooling');
  });

  test('should navigate pooling characters', async ({ page }) => {
    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(100);
    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(100);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);

    const getPoolingIndex = () =>
      page.evaluate(() => {
        const scene = window.game?.sceneManager?.getCurrentScene();
        return scene?.poolingCharacterIndex;
      });

    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(100);
    expect(await getPoolingIndex()).toBe(1);
  });

  test('should leave shop', async ({ page }) => {
    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(100);
    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(100);
    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(100);

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);

    const sceneName = await page.evaluate(() => window.AI.getScene());
    expect(sceneName).toBe('Town');
  });

  test('should handle multiple state transitions', async ({ page }) => {
    const transitionAndCheck = async (key, expectedState) => {
      await page.evaluate((k) => window.AI.sendKey(k), key);
      await page.waitForTimeout(200);
      return await page.evaluate(() => {
        const scene = window.game?.sceneManager?.getCurrentScene();
        return scene?.currentState;
      });
    };

    let state = await transitionAndCheck('Enter', 'buying_category');
    expect(state).toBe('buying_category');

    state = await transitionAndCheck('Enter', 'buying_items');
    expect(state).toBe('buying_items');

    state = await transitionAndCheck('Escape', 'buying_category');
    expect(state).toBe('buying_category');

    state = await transitionAndCheck('Escape', 'main_menu');
    expect(state).toBe('main_menu');
  });

  test('should maintain party state', async ({ page }) => {
    const partyInfo = await page.evaluate(() => window.AI.getParty());
    expect(partyInfo.characters).toBeDefined();
    expect(partyInfo.characters.length).toBeGreaterThan(0);

    const firstCharGold = partyInfo.characters[0]?.gold || 0;
    expect(firstCharGold).toBeGreaterThanOrEqual(0);
  });
});