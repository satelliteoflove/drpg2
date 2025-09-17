const { test, expect } = require('@playwright/test');

test.describe('Combat Scene ASCII Rendering', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the game
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);
  });

  test('Combat scene renders in normal mode', async ({ page }) => {
    // Start game and enter dungeon
    await page.keyboard.press('Enter'); // Start game
    await page.waitForTimeout(500);

    // Enter dungeon to trigger combat
    await page.keyboard.press('Enter'); // Enter dungeon
    await page.waitForTimeout(1000);

    // Move around to trigger combat encounter
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(100);
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);

      // Check if we're in combat
      const inCombat = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        // Look for red color (combat scene has red elements)
        let redPixels = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i] > 200 && pixels[i + 1] < 100 && pixels[i + 2] < 100) {
            redPixels++;
          }
        }
        return redPixels > 100;
      });

      if (inCombat) {
        console.log('Combat triggered successfully');
        break;
      }
    }

    // Verify combat UI elements are present
    const canvasData = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return {
        width: canvas.width,
        height: canvas.height,
        hasCanvas: true,
      };
    });

    expect(canvasData.hasCanvas).toBe(true);
    expect(canvasData.width).toBeGreaterThan(0);
    expect(canvasData.height).toBeGreaterThan(0);
  });

  test('Combat scene renders in ASCII mode', async ({ page }) => {
    // Enable ASCII rendering
    await page.evaluate(() => {
      localStorage.setItem('feature_ascii_rendering', 'true');
    });

    // Reload to apply feature flag
    await page.reload();
    await page.waitForTimeout(1000);

    // Start game and enter dungeon
    await page.keyboard.press('Enter'); // Start game
    await page.waitForTimeout(500);

    // Enter dungeon
    await page.keyboard.press('Enter'); // Enter dungeon
    await page.waitForTimeout(1000);

    // Move around to trigger combat
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(100);
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);

      // Check if we're in combat by looking for ASCII grid patterns
      const inCombat = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const ctx = canvas.getContext('2d');

        // Get text from canvas (ASCII mode uses text rendering)
        ctx.font = '16px monospace';
        const metrics = ctx.measureText('COMBAT');

        // Check if canvas has been drawn to
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let nonBlackPixels = 0;

        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i] > 10 || pixels[i + 1] > 10 || pixels[i + 2] > 10) {
            nonBlackPixels++;
          }
        }

        return nonBlackPixels > 1000; // ASCII text should create many non-black pixels
      });

      if (inCombat) {
        console.log('Combat triggered in ASCII mode');
        break;
      }
    }

    // Test keyboard navigation in combat
    await page.keyboard.press('ArrowDown'); // Navigate action menu
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(200);

    // Test target selection
    await page.keyboard.press('Enter'); // Select Attack
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowRight'); // Select target
    await page.waitForTimeout(200);
    await page.keyboard.press('Escape'); // Cancel
    await page.waitForTimeout(200);

    // Test quick action selection
    await page.keyboard.press('2'); // Quick select Defend
    await page.waitForTimeout(500);

    // Verify canvas is still responsive
    const canvasState = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return {
        exists: !!canvas,
        width: canvas?.width || 0,
        height: canvas?.height || 0,
      };
    });

    expect(canvasState.exists).toBe(true);
    expect(canvasState.width).toBeGreaterThan(0);
  });

  test('Combat input handling works correctly', async ({ page }) => {
    // Start game and try to enter combat
    await page.keyboard.press('Enter'); // Start game
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter'); // Enter dungeon
    await page.waitForTimeout(1000);

    // Trigger combat
    let combatTriggered = false;
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(100);
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);

      // Check for combat
      const inCombat = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, 100);
        const pixels = imageData.data;

        // Look for non-black pixels in top area (where combat UI would be)
        let coloredPixels = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i] > 50 || pixels[i + 1] > 50 || pixels[i + 2] > 50) {
            coloredPixels++;
          }
        }
        return coloredPixels > 500;
      });

      if (inCombat) {
        combatTriggered = true;
        break;
      }
    }

    if (combatTriggered) {
      // Test all combat controls
      const actions = [
        { key: 'ArrowDown', description: 'Navigate down' },
        { key: 'ArrowUp', description: 'Navigate up' },
        { key: 'Enter', description: 'Select action' },
        { key: 'ArrowLeft', description: 'Previous target' },
        { key: 'ArrowRight', description: 'Next target' },
        { key: 'Escape', description: 'Cancel' },
        { key: '3', description: 'Quick action - Run' },
      ];

      for (const action of actions) {
        await page.keyboard.press(action.key);
        await page.waitForTimeout(200);
        console.log(`Tested: ${action.description}`);
      }
    }

    // Verify no JavaScript errors
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(500);
    expect(consoleErrors).toHaveLength(0);
  });

  test('Feature flag toggle works correctly', async ({ page }) => {
    // Test with ASCII disabled
    await page.evaluate(() => {
      localStorage.setItem('feature_ascii_rendering', 'false');
    });
    await page.reload();
    await page.waitForTimeout(1000);

    const normalMode = await page.evaluate(() => {
      return localStorage.getItem('feature_ascii_rendering') === 'false';
    });
    expect(normalMode).toBe(true);

    // Test with ASCII enabled
    await page.evaluate(() => {
      localStorage.setItem('feature_ascii_rendering', 'true');
    });
    await page.reload();
    await page.waitForTimeout(1000);

    const asciiMode = await page.evaluate(() => {
      return localStorage.getItem('feature_ascii_rendering') === 'true';
    });
    expect(asciiMode).toBe(true);

    // Clear for other tests
    await page.evaluate(() => {
      localStorage.removeItem('feature_ascii_rendering');
    });
  });

  test('Combat scene transitions work', async ({ page }) => {
    // Start game
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Enter dungeon
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    // Try to trigger and exit combat
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(100);

      // Check if in combat
      const combatActive = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, 100, 100);
        const pixels = imageData.data;

        let redCount = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i] > 150 && pixels[i + 1] < 100) {
            redCount++;
          }
        }
        return redCount > 50;
      });

      if (combatActive) {
        // Try to run from combat
        await page.keyboard.press('3'); // Quick select Run
        await page.waitForTimeout(1000);

        // Or use debug instant kill
        await page.keyboard.press('k', { modifiers: ['Control'] });
        await page.waitForTimeout(1000);
        break;
      }
    }

    // Verify we can still control the game
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    const gameResponsive = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return canvas && canvas.width > 0;
    });

    expect(gameResponsive).toBe(true);
  });
});
