// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Combat ASCII Rendering', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the game
    await page.goto('http://localhost:8080');

    // Wait for game to load
    await page.waitForTimeout(2000);

    // Enable ASCII rendering
    await page.evaluate(() => {
      window.FeatureFlags.enable('ASCII_RENDERING');
    });
  });

  test('Combat scene renders in ASCII mode', async ({ page }) => {
    // Start from town scene
    await page.waitForTimeout(1000);

    // Go to dungeon
    await page.keyboard.press('2'); // Enter Dungeon option
    await page.waitForTimeout(1000);

    // Move around to trigger combat
    let combatTriggered = false;
    for (let i = 0; i < 20; i++) {
      // Try moving forward
      await page.keyboard.press('w');
      await page.waitForTimeout(500);

      // Check if we're in combat
      const inCombat = await page.evaluate(() => {
        const game = window.game;
        return game && game.getCurrentSceneName && game.getCurrentSceneName() === 'Combat';
      });

      if (inCombat) {
        combatTriggered = true;
        break;
      }

      // Try different directions
      if (i % 4 === 1) await page.keyboard.press('a');
      if (i % 4 === 2) await page.keyboard.press('d');
      if (i % 4 === 3) await page.keyboard.press('s');
    }

    expect(combatTriggered).toBe(true);

    // Verify we're in Combat scene
    const sceneName = await page.evaluate(() => window.game.getCurrentSceneName());
    expect(sceneName).toBe('Combat');

    // Check that ASCII state is initialized
    const asciiStateExists = await page.evaluate(() => {
      const game = window.game;
      const scene = game.sceneManager.currentScene;
      return scene && scene.asciiState !== null && scene.asciiState !== undefined;
    });
    expect(asciiStateExists).toBe(true);

    // Take screenshot for visual verification
    await page.screenshot({ path: 'screenshots/combat-ascii-initial.png' });
  });

  test('Combat menu navigation works in ASCII mode', async ({ page }) => {
    // Navigate to combat (same as above)
    await page.waitForTimeout(1000);
    await page.keyboard.press('2'); // Enter Dungeon
    await page.waitForTimeout(1000);

    // Trigger combat
    let combatTriggered = false;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('w');
      await page.waitForTimeout(500);

      const inCombat = await page.evaluate(() => {
        const game = window.game;
        return game && game.getCurrentSceneName && game.getCurrentSceneName() === 'Combat';
      });

      if (inCombat) {
        combatTriggered = true;
        break;
      }
    }

    expect(combatTriggered).toBe(true);
    await page.waitForTimeout(1000);

    // Test action menu navigation
    const initialAction = await page.evaluate(() => {
      const scene = window.game.sceneManager.currentScene;
      return scene.asciiState ? scene.asciiState.getSelectedAction() : -1;
    });
    expect(initialAction).toBe(0);

    // Move down in menu
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);

    const actionAfterDown = await page.evaluate(() => {
      const scene = window.game.sceneManager.currentScene;
      return scene.asciiState ? scene.asciiState.getSelectedAction() : -1;
    });
    expect(actionAfterDown).toBe(1);

    // Move up in menu
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(200);

    const actionAfterUp = await page.evaluate(() => {
      const scene = window.game.sceneManager.currentScene;
      return scene.asciiState ? scene.asciiState.getSelectedAction() : -1;
    });
    expect(actionAfterUp).toBe(0);

    // Take screenshot
    await page.screenshot({ path: 'screenshots/combat-ascii-menu.png' });
  });

  test('Combat attack action works in ASCII mode', async ({ page }) => {
    // Navigate to combat
    await page.waitForTimeout(1000);
    await page.keyboard.press('2'); // Enter Dungeon
    await page.waitForTimeout(1000);

    // Trigger combat
    let combatTriggered = false;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('w');
      await page.waitForTimeout(500);

      const inCombat = await page.evaluate(() => {
        const game = window.game;
        return game && game.getCurrentSceneName && game.getCurrentSceneName() === 'Combat';
      });

      if (inCombat) {
        combatTriggered = true;
        break;
      }
    }

    expect(combatTriggered).toBe(true);
    await page.waitForTimeout(1000);

    // Select Attack action (should be selected by default)
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Check if we're in target selection mode
    const inTargetMode = await page.evaluate(() => {
      const scene = window.game.sceneManager.currentScene;
      return scene.asciiState ? scene.asciiState.getActionState() === 'select_target' : false;
    });
    expect(inTargetMode).toBe(true);

    // Select a target and attack
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Check if action was executed (should be in waiting state)
    const actionState = await page.evaluate(() => {
      const scene = window.game.sceneManager.currentScene;
      return scene.asciiState ? scene.asciiState.getActionState() : '';
    });
    expect(actionState).toBe('waiting');

    // Take screenshot
    await page.screenshot({ path: 'screenshots/combat-ascii-attack.png' });
  });

  test('Combat ASCII rendering toggles correctly', async ({ page }) => {
    // Navigate to combat
    await page.waitForTimeout(1000);
    await page.keyboard.press('2'); // Enter Dungeon
    await page.waitForTimeout(1000);

    // Trigger combat
    let combatTriggered = false;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('w');
      await page.waitForTimeout(500);

      const inCombat = await page.evaluate(() => {
        const game = window.game;
        return game && game.getCurrentSceneName && game.getCurrentSceneName() === 'Combat';
      });

      if (inCombat) {
        combatTriggered = true;
        break;
      }
    }

    expect(combatTriggered).toBe(true);
    await page.waitForTimeout(1000);

    // Verify ASCII is enabled
    const asciiEnabled = await page.evaluate(() => {
      return window.FeatureFlags.isEnabled('ASCII_RENDERING');
    });
    expect(asciiEnabled).toBe(true);

    // Take screenshot with ASCII
    await page.screenshot({ path: 'screenshots/combat-ascii-on.png' });

    // Disable ASCII rendering
    await page.evaluate(() => {
      window.FeatureFlags.disable('ASCII_RENDERING');
    });
    await page.waitForTimeout(500);

    // Verify ASCII is disabled
    const asciiDisabled = await page.evaluate(() => {
      return !window.FeatureFlags.isEnabled('ASCII_RENDERING');
    });
    expect(asciiDisabled).toBe(true);

    // Take screenshot without ASCII
    await page.screenshot({ path: 'screenshots/combat-ascii-off.png' });

    // Re-enable ASCII
    await page.evaluate(() => {
      window.FeatureFlags.enable('ASCII_RENDERING');
    });
    await page.waitForTimeout(500);

    // Verify ASCII is enabled again
    const asciiReEnabled = await page.evaluate(() => {
      return window.FeatureFlags.isEnabled('ASCII_RENDERING');
    });
    expect(asciiReEnabled).toBe(true);

    // Take final screenshot
    await page.screenshot({ path: 'screenshots/combat-ascii-re-enabled.png' });
  });
});
