// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Combat ASCII Basic Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the game
    await page.goto('http://localhost:8080');

    // Wait for game to load
    await page.waitForTimeout(2000);

    // Enable ASCII rendering and force combat for testing
    await page.evaluate(() => {
      window.FeatureFlags.enable('ASCII_RENDERING');

      // Force switch to combat scene for testing
      const game = window.game;
      if (game && game.sceneManager) {
        // Generate test monsters
        const testMonsters = [
          { name: 'Goblin 1', hp: 10, maxHp: 10, ac: 10, damage: '1d4', experience: 10, gold: 5 },
          { name: 'Goblin 2', hp: 10, maxHp: 10, ac: 10, damage: '1d4', experience: 10, gold: 5 }
        ];

        // Set up game state for combat
        game.gameState.inCombat = true;

        // Switch to combat scene
        game.sceneManager.switchTo('combat');
      }
    });

    // Wait for scene transition
    await page.waitForTimeout(1000);
  });

  test('Combat scene initializes with ASCII state', async ({ page }) => {
    // Verify we're in Combat scene
    const sceneName = await page.evaluate(() => {
      const game = window.game;
      return game ? game.getCurrentSceneName() : 'unknown';
    });
    expect(sceneName).toBe('Combat');

    // Check that ASCII state is initialized
    const asciiStateInfo = await page.evaluate(() => {
      const game = window.game;
      const scene = game?.sceneManager?.currentScene;

      if (!scene) return { exists: false };

      return {
        exists: scene.asciiState !== null && scene.asciiState !== undefined,
        useASCII: scene.useASCII,
        hasCanvasRenderer: scene.canvasRenderer !== null && scene.canvasRenderer !== undefined,
        actionState: scene.asciiState?.getActionState ? scene.asciiState.getActionState() : null
      };
    });

    expect(asciiStateInfo.exists).toBe(true);
    expect(asciiStateInfo.useASCII).toBe(true);
    expect(asciiStateInfo.hasCanvasRenderer).toBe(true);
    expect(asciiStateInfo.actionState).toBeTruthy();

    // Take screenshot for visual verification
    await page.screenshot({ path: 'screenshots/combat-ascii-basic-init.png' });
  });

  test('Combat ASCII state renders grid', async ({ page }) => {
    // Get ASCII grid content
    const gridInfo = await page.evaluate(() => {
      const game = window.game;
      const scene = game?.sceneManager?.currentScene;

      if (!scene || !scene.asciiState) return null;

      // Get the grid
      const grid = scene.asciiState.getGrid();
      if (!grid) return null;

      // Check for combat-specific text
      const gridData = grid.getGrid();
      let hasCombatText = false;
      let hasPartyText = false;
      let hasActionText = false;

      // Convert grid to text for searching
      let fullText = '';
      for (let y = 0; y < gridData.length; y++) {
        for (let x = 0; x < gridData[y].length; x++) {
          fullText += gridData[y][x].char || ' ';
        }
        fullText += '\n';
      }

      hasCombatText = fullText.includes('COMBAT');
      hasPartyText = fullText.includes('PARTY');
      hasActionText = fullText.includes('ACTION') || fullText.includes('Attack');

      return {
        width: gridData[0]?.length || 0,
        height: gridData.length,
        hasCombatText,
        hasPartyText,
        hasActionText,
        sample: fullText.substring(0, 200)
      };
    });

    expect(gridInfo).not.toBeNull();
    expect(gridInfo.width).toBeGreaterThan(0);
    expect(gridInfo.height).toBeGreaterThan(0);
    expect(gridInfo.hasCombatText).toBe(true);

    // Take screenshot
    await page.screenshot({ path: 'screenshots/combat-ascii-basic-grid.png' });
  });

  test('Combat menu navigation works', async ({ page }) => {
    // Get initial selected action
    const initialAction = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      return scene?.asciiState?.getSelectedAction ? scene.asciiState.getSelectedAction() : -1;
    });
    expect(initialAction).toBe(0);

    // Move down in menu
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);

    const actionAfterDown = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      return scene?.asciiState?.getSelectedAction ? scene.asciiState.getSelectedAction() : -1;
    });
    expect(actionAfterDown).toBe(1);

    // Move up in menu
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(200);

    const actionAfterUp = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      return scene?.asciiState?.getSelectedAction ? scene.asciiState.getSelectedAction() : -1;
    });
    expect(actionAfterUp).toBe(0);

    // Take screenshot
    await page.screenshot({ path: 'screenshots/combat-ascii-basic-menu.png' });
  });

  test('Combat ASCII toggle works', async ({ page }) => {
    // Verify ASCII is enabled
    const asciiEnabledInitial = await page.evaluate(() => {
      return window.FeatureFlags.isEnabled('ASCII_RENDERING');
    });
    expect(asciiEnabledInitial).toBe(true);

    // Check ASCII state exists
    const hasASCIIBefore = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      return scene?.asciiState !== null && scene?.asciiState !== undefined;
    });
    expect(hasASCIIBefore).toBe(true);

    // Take screenshot with ASCII
    await page.screenshot({ path: 'screenshots/combat-ascii-basic-on.png' });

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

    // The ASCII state should still exist but not be used
    const stillHasASCII = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      return scene?.asciiState !== null && scene?.asciiState !== undefined;
    });
    expect(stillHasASCII).toBe(true);

    // Take screenshot without ASCII
    await page.screenshot({ path: 'screenshots/combat-ascii-basic-off.png' });

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
    await page.screenshot({ path: 'screenshots/combat-ascii-basic-re-enabled.png' });
  });
});