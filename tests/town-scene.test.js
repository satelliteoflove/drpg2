const { test, expect } = require('@playwright/test');

test.describe('TownScene Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    // Navigate from MainMenu to Town
    // MainMenu -> New Game -> Character Creation -> Dungeon -> Town
    await page.keyboard.press('Enter'); // Start New Game
    await page.waitForTimeout(500);

    await page.keyboard.press('Enter'); // Continue from New Game
    await page.waitForTimeout(500);

    await page.keyboard.press('Escape'); // Skip Character Creation (creates default party)
    await page.waitForTimeout(500);

    await page.keyboard.press('Escape'); // Go from Dungeon to Town
    await page.waitForTimeout(500);
  });

  test('should display town scene with correct title', async ({ page }) => {
    const canvas = await page.locator('canvas');
    await expect(canvas).toBeVisible();

    const sceneInfo = await page.evaluate(() => {
      const sceneManager = window.game?.sceneManager;
      const scene = sceneManager?.getCurrentScene();
      return {
        name: scene?.getName(),
        menuOptions: scene?.menuOptions,
        selectedOption: scene?.selectedOption,
      };
    });

    expect(sceneInfo.name).toBe('Town');
    expect(sceneInfo.menuOptions).toContain("Boltac's Trading Post");
    expect(sceneInfo.menuOptions).toContain('Temple');
    expect(sceneInfo.menuOptions).toContain('Inn');
    expect(sceneInfo.menuOptions).toContain('Return to Dungeon');
  });

  test('should navigate menu with arrow keys', async ({ page }) => {
    const getSelectedOption = () =>
      page.evaluate(() => {
        const sceneManager = window.game?.sceneManager;
        const scene = sceneManager?.getCurrentScene();
        return scene?.selectedOption;
      });

    const initialOption = await getSelectedOption();
    expect(initialOption).toBe(0);

    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(1);

    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(2);

    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(1);

    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(0);
  });

  test('should navigate menu with W/S keys', async ({ page }) => {
    const getSelectedOption = () =>
      page.evaluate(() => {
        const sceneManager = window.game?.sceneManager;
        const scene = sceneManager?.getCurrentScene();
        return scene?.selectedOption;
      });

    await page.keyboard.press('s');
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(1);

    await page.keyboard.press('s');
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(2);

    await page.keyboard.press('w');
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(1);
  });

  test('should not navigate beyond menu boundaries', async ({ page }) => {
    const getSelectedOption = () =>
      page.evaluate(() => {
        const sceneManager = window.game?.sceneManager;
        const scene = sceneManager?.getCurrentScene();
        return scene?.selectedOption;
      });

    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(0);

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowDown');
    }
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(3);
  });

  test("should enter shop when selecting Boltac's Trading Post", async ({ page }) => {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    const currentScene = await page.evaluate(() => {
      const sceneManager = window.game?.sceneManager;
      return sceneManager?.getCurrentScene()?.getName();
    });
    expect(currentScene).toBe('Shop');
  });

  test('should return to dungeon when selecting Return to Dungeon', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowDown');
    }
    await page.waitForTimeout(100);

    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    const currentScene = await page.evaluate(() => {
      const sceneManager = window.game?.sceneManager;
      return sceneManager?.getCurrentScene()?.getName();
    });
    expect(currentScene).toBe('Dungeon');
  });

  test('should return to dungeon on Escape key', async ({ page }) => {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const currentScene = await page.evaluate(() => {
      const sceneManager = window.game?.sceneManager;
      return sceneManager?.getCurrentScene()?.getName();
    });
    expect(currentScene).toBe('Dungeon');
  });

  test('should handle space key as selection', async ({ page }) => {
    await page.keyboard.press(' ');
    await page.waitForTimeout(500);

    const currentScene = await page.evaluate(() => {
      const sceneManager = window.game?.sceneManager;
      return sceneManager?.getCurrentScene()?.getName();
    });
    expect(currentScene).toBe('Shop');
  });

  test.skip('should toggle ASCII rendering when feature flag changes', async ({ page }) => {
    // Test that feature flag can be toggled
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

    // Navigate away and back to trigger ASCII creation
    await page.keyboard.press('Escape'); // Go to Dungeon
    await page.waitForTimeout(200);
    await page.keyboard.press('Escape'); // Return to Town
    await page.waitForTimeout(200);

    // Check that ASCII state is created
    const withASCII = await page.evaluate(() => {
      const sceneManager = window.game?.sceneManager;
      const scene = sceneManager?.getCurrentScene();
      return {
        sceneName: scene?.getName(),
        hasASCII: !!scene?.asciiState,
        useASCII: scene?.useASCII,
      };
    });

    expect(withASCII.sceneName).toBe('Town');
    expect(withASCII.hasASCII).toBe(true);
    expect(withASCII.useASCII).toBe(true);

    // Disable the flag
    await page.evaluate(() => {
      window.FeatureFlags.disable('ASCII_TOWN_SCENE');
    });

    const disabledFlag = await page.evaluate(() => {
      return window.FeatureFlags.isEnabled('ASCII_TOWN_SCENE');
    });
    expect(disabledFlag).toBe(false);

    // Navigate away and back to see ASCII is not created
    await page.keyboard.press('Escape'); // Go to Dungeon
    await page.waitForTimeout(200);
    await page.keyboard.press('Escape'); // Return to Town
    await page.waitForTimeout(200);

    // Check that ASCII state is not created
    const withoutASCII = await page.evaluate(() => {
      const sceneManager = window.game?.sceneManager;
      const scene = sceneManager?.getCurrentScene();
      return {
        sceneName: scene?.getName(),
        hasASCII: !!scene?.asciiState,
        useASCII: scene?.useASCII,
      };
    });

    expect(withoutASCII.sceneName).toBe('Town');
    expect(withoutASCII.hasASCII).toBe(false);
    expect(withoutASCII.useASCII).toBe(false);
  });

  test('should reset menu selection after scene transitions', async ({ page }) => {
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);

    const selectedBefore = await page.evaluate(() => {
      const sceneManager = window.game?.sceneManager;
      return sceneManager?.getCurrentScene()?.selectedOption;
    });
    expect(selectedBefore).toBe(2);

    // Go to dungeon
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Go back to town
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const selectedAfter = await page.evaluate(() => {
      const sceneManager = window.game?.sceneManager;
      return sceneManager?.getCurrentScene()?.selectedOption;
    });
    // Should reset to 0 after re-entering
    expect(selectedAfter).toBe(0);
  });

  test('should render without errors during rapid input', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowUp');
    }

    await page.waitForTimeout(500);
    expect(consoleErrors).toHaveLength(0);
  });

  test('should handle all menu options correctly', async ({ page }) => {
    const getSceneAndOption = () =>
      page.evaluate(() => {
        const sceneManager = window.game?.sceneManager;
        const scene = sceneManager?.getCurrentScene();
        return {
          name: scene?.getName(),
          selectedOption: scene?.selectedOption,
        };
      });

    // Test Temple (not implemented)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    let state = await getSceneAndOption();
    expect(state.selectedOption).toBe(1);

    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    state = await getSceneAndOption();
    expect(state.name).toBe('Town'); // Should stay in town since not implemented

    // Test Inn (not implemented)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    state = await getSceneAndOption();
    expect(state.selectedOption).toBe(2);

    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    state = await getSceneAndOption();
    expect(state.name).toBe('Town'); // Should stay in town since not implemented
  });
});
