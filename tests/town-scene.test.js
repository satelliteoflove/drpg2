const { test, expect } = require('@playwright/test');

test.describe('TownScene Functionality', () => {
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
  });

  test('should display town scene with correct title', async ({ page }) => {
    const canvas = await page.locator('canvas');
    await expect(canvas).toBeVisible();

    const sceneName = await page.evaluate(() => window.AI.getScene());
    expect(sceneName).toBe('Town');

    const description = await page.evaluate(() => window.AI.describe());
    expect(description).toContain('Town of Llylgamyn');

    const sceneInfo = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.getCurrentScene();
      return {
        menuOptions: scene?.menuOptions,
        selectedOption: scene?.selectedOption,
      };
    });

    expect(sceneInfo.menuOptions).toContain("Boltac's Trading Post");
    expect(sceneInfo.menuOptions).toContain('Temple');
    expect(sceneInfo.menuOptions).toContain('Inn');
    expect(sceneInfo.menuOptions).toContain('Return to Dungeon');
  });

  test('should navigate menu with arrow keys', async ({ page }) => {
    const getSelectedOption = () =>
      page.evaluate(() => {
        const scene = window.game?.sceneManager?.getCurrentScene();
        return scene?.selectedOption;
      });

    const initialOption = await getSelectedOption();
    expect(initialOption).toBe(0);

    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(1);

    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(2);

    await page.evaluate(() => window.AI.sendKey('ArrowUp'));
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(1);

    await page.evaluate(() => window.AI.sendKey('ArrowUp'));
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(0);
  });

  test('should navigate menu with W/S keys', async ({ page }) => {
    const getSelectedOption = () =>
      page.evaluate(() => {
        const scene = window.game?.sceneManager?.getCurrentScene();
        return scene?.selectedOption;
      });

    await page.evaluate(() => window.AI.sendKey('s'));
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(1);

    await page.evaluate(() => window.AI.sendKey('s'));
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(2);

    await page.evaluate(() => window.AI.sendKey('w'));
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(1);
  });

  test('should not navigate beyond menu boundaries', async ({ page }) => {
    const getSelectedOption = () =>
      page.evaluate(() => {
        const scene = window.game?.sceneManager?.getCurrentScene();
        return scene?.selectedOption;
      });

    await page.evaluate(() => window.AI.sendKey('ArrowUp'));
    await page.evaluate(() => window.AI.sendKey('ArrowUp'));
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(0);

    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    }
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(3);
  });

  test("should enter shop when selecting Boltac's Trading Post", async ({ page }) => {
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);

    const currentScene = await page.evaluate(() => window.AI.getScene());
    expect(currentScene).toBe('Shop');

    const description = await page.evaluate(() => window.AI.describe());
    expect(description).toContain("Boltac's Trading Post");
  });

  test('should return to dungeon when selecting Return to Dungeon', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    }
    await page.waitForTimeout(100);

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);

    const currentScene = await page.evaluate(() => window.AI.getScene());
    expect(currentScene).toBe('Dungeon');

    const dungeonInfo = await page.evaluate(() => window.AI.getDungeon());
    expect(dungeonInfo.currentFloor).toBe(1);
  });

  test('should return to dungeon on Escape key', async ({ page }) => {
    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(500);

    const currentScene = await page.evaluate(() => window.AI.getScene());
    expect(currentScene).toBe('Dungeon');
  });

  test('should handle rapid navigation without errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.AI.sendKey('ArrowDown'));
      await page.waitForTimeout(50);
      await page.evaluate(() => window.AI.sendKey('ArrowUp'));
      await page.waitForTimeout(50);
    }

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(100);
    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(100);

    expect(consoleErrors).toHaveLength(0);
  });

  test('should maintain party state in town', async ({ page }) => {
    const partyInfo = await page.evaluate(() => window.AI.getParty());
    expect(partyInfo.characters).toBeDefined();
    expect(partyInfo.characters.length).toBe(4);

    const gameState = await page.evaluate(() => window.AI.getState());
    expect(gameState.party).toBeDefined();
    expect(gameState.currentFloor).toBe(1);
  });

  test('should provide correct available actions', async ({ page }) => {
    const actions = await page.evaluate(() => window.AI.getActions());
    expect(actions).toContain('ArrowUp');
    expect(actions).toContain('ArrowDown');
    expect(actions).toContain('Enter');
    expect(actions).toContain('Escape');
  });
});