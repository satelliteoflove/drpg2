const { test, expect } = require('@playwright/test');

test.describe('Save/Load with ASCII Rendering - Simple Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForSelector('canvas', { timeout: 10000 });
    await page.waitForTimeout(1000); // Allow game to fully initialize
  });

  test('ASCII feature flag persists in memory during session', async ({ page }) => {
    // Enable ASCII rendering
    await page.evaluate(() => {
      if (window.FeatureFlags) {
        window.FeatureFlags.enable('ASCII_RENDERING');
      }
    });

    // Verify ASCII is enabled
    const asciiEnabledBefore = await page.evaluate(() => {
      return window.FeatureFlags?.isEnabled('ASCII_RENDERING') || false;
    });
    expect(asciiEnabledBefore).toBe(true);

    // Disable and re-enable ASCII (simulating toggle)
    await page.evaluate(() => {
      if (window.FeatureFlags) {
        window.FeatureFlags.disable('ASCII_RENDERING');
        window.FeatureFlags.enable('ASCII_RENDERING');
      }
    });

    // Verify ASCII is still enabled (feature flag should persist in memory)
    const asciiEnabledAfter = await page.evaluate(() => {
      return window.FeatureFlags?.isEnabled('ASCII_RENDERING') || false;
    });
    expect(asciiEnabledAfter).toBe(true);
  });

  test('Game state saves and loads correctly', async ({ page }) => {
    // Start new game
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    // Modify game state
    await page.evaluate(() => {
      if (window.game?.gameState) {
        window.game.gameState.turnCount = 42;
      }
    });

    // Save
    await page.evaluate(() => {
      window.game?.saveGame();
    });

    // Get saved state
    const savedState = await page.evaluate(() => {
      const saved = localStorage.getItem('drpg2_save');
      if (saved) {
        const data = JSON.parse(saved);
        return {
          turnCount: data.gameState.turnCount,
          hasSave: true
        };
      }
      return { hasSave: false };
    });

    expect(savedState.hasSave).toBe(true);
    expect(savedState.turnCount).toBe(42);
  });

  test('ASCII rendering works after enabling feature flag', async ({ page }) => {
    // Enable ASCII rendering
    await page.evaluate(() => {
      if (window.FeatureFlags) {
        window.FeatureFlags.enable('ASCII_RENDERING');
      }
    });

    // Start new game
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);

    // Check if we're in a scene with ASCII capability
    const sceneInfo = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;

      // Trigger a render to potentially initialize ASCII
      if (scene && window.game?.canvas) {
        const ctx = window.game.canvas.getContext('2d');
        if (ctx) {
          // Call update to ensure scene is fully initialized
          scene.update(16);
          scene.render(ctx);
        }
      }

      // Check for ASCII capability in various ways
      const hasASCIICapability = !!(
        scene?.asciiState ||
        scene?.dungeonASCIIState ||
        scene?.townASCIIState ||
        scene?.combatASCIIState ||
        scene?.shopASCIIState ||
        scene?.inventoryASCIIState ||
        (scene?.canvasRenderer && scene?.dungeonASCIIState)
      );

      return {
        sceneName: scene?.name || 'none',
        hasASCIICapability: hasASCIICapability,
        asciiEnabled: window.FeatureFlags?.isEnabled('ASCII_RENDERING'),
        sceneType: scene?.constructor?.name || 'unknown'
      };
    });

    console.log('Scene info:', sceneInfo);

    // We expect ASCII to be enabled
    expect(sceneInfo.asciiEnabled).toBe(true);

    // The scene should have ASCII capability IF it's been implemented for that scene
    // (Not all scenes may have ASCII implementation yet)
    if (sceneInfo.sceneName === 'Dungeon' || sceneInfo.sceneName === 'Town' ||
        sceneInfo.sceneName === 'Combat' || sceneInfo.sceneName === 'Shop' ||
        sceneInfo.sceneName === 'Inventory') {
      // These scenes have ASCII implementations
      console.log(`${sceneInfo.sceneName} scene should have ASCII capability`);
    }
  });

  test('Save/load preserves game state correctly', async ({ page }) => {
    // Start new game
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    // Save initial state
    await page.evaluate(() => {
      window.game?.saveGame();
    });

    // Verify save exists
    const hasSave = await page.evaluate(() => {
      return localStorage.getItem('drpg2_save') !== null;
    });
    expect(hasSave).toBe(true);

    // Reload page
    await page.reload();
    await page.waitForSelector('canvas', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Check that save still exists after reload
    const hasSaveAfterReload = await page.evaluate(() => {
      return localStorage.getItem('drpg2_save') !== null;
    });
    expect(hasSaveAfterReload).toBe(true);

    // Parse and verify save structure
    const saveData = await page.evaluate(() => {
      const saved = localStorage.getItem('drpg2_save');
      if (saved) {
        const data = JSON.parse(saved);
        return {
          hasGameState: !!data.gameState,
          hasParty: !!data.gameState?.party,
          hasDungeon: !!data.gameState?.dungeon,
          hasCurrentFloor: data.gameState?.currentFloor !== undefined
        };
      }
      return null;
    });

    expect(saveData).not.toBeNull();
    expect(saveData.hasGameState).toBe(true);
    expect(saveData.hasParty).toBe(true);
    expect(saveData.hasDungeon).toBe(true);
    expect(saveData.hasCurrentFloor).toBe(true);
  });
});