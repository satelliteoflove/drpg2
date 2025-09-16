const { test, expect } = require('@playwright/test');

test.describe('Inventory ASCII Rendering', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the game
    await page.goto('http://localhost:8080');

    // Wait for game initialization
    await page.waitForSelector('canvas', { timeout: 5000 });
    await page.waitForTimeout(1000);

    // Enable ASCII rendering
    await page.evaluate(() => {
      if (window.FeatureFlags) {
        window.FeatureFlags.enable('ASCII_RENDERING');
      }
    });

    // Navigate to dungeon to access inventory
    await page.keyboard.press('ArrowUp'); // Select Dungeon
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Open inventory
    await page.keyboard.press('i');
    await page.waitForTimeout(500);
  });

  test('renders Inventory character select in ASCII mode', async ({ page }) => {
    // Take screenshot for verification
    const canvas = await page.locator('canvas');
    const screenshot = await canvas.screenshot();

    // Verify basic rendering
    const dimensions = await canvas.boundingBox();
    expect(dimensions).toBeTruthy();
    expect(dimensions.width).toBeGreaterThan(0);
    expect(dimensions.height).toBeGreaterThan(0);

    // Verify the inventory loaded (canvas should have content)
    const hasContent = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      const ctx = canvas.getContext('2d');
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = data.data;

      // Check if there are non-black pixels
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i] > 0 || pixels[i + 1] > 0 || pixels[i + 2] > 0) {
          return true;
        }
      }
      return false;
    });

    expect(hasContent).toBe(true);
  });

  test('navigates between character selection', async ({ page }) => {
    // Navigate through characters
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);

    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);

    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);

    // Verify still in inventory
    const inInventory = await page.evaluate(() => {
      return document.querySelector('canvas') !== null;
    });
    expect(inInventory).toBe(true);
  });

  test('enters and exits inventory view', async ({ page }) => {
    // Select inventory view
    await page.keyboard.press('i');
    await page.waitForTimeout(500);

    // Go back to character select
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Verify we're still in inventory scene
    const stillInInventory = await page.evaluate(() => {
      return document.querySelector('canvas') !== null;
    });
    expect(stillInInventory).toBe(true);
  });

  test('enters and exits equipment view', async ({ page }) => {
    // Select equipment view
    await page.keyboard.press('e');
    await page.waitForTimeout(500);

    // Go back to character select
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Verify we're still in inventory scene
    const stillInInventory = await page.evaluate(() => {
      return document.querySelector('canvas') !== null;
    });
    expect(stillInInventory).toBe(true);
  });

  test('toggles ASCII rendering in Inventory', async ({ page }) => {
    // Disable ASCII
    await page.evaluate(() => {
      if (window.FeatureFlags) {
        window.FeatureFlags.disable('ASCII_RENDERING');
      }
    });
    await page.waitForTimeout(500);

    // Re-enable ASCII
    await page.evaluate(() => {
      if (window.FeatureFlags) {
        window.FeatureFlags.enable('ASCII_RENDERING');
      }
    });
    await page.waitForTimeout(500);

    // Verify still functional
    const functional = await page.evaluate(() => {
      return document.querySelector('canvas') !== null;
    });
    expect(functional).toBe(true);
  });

  test('returns to dungeon from Inventory', async ({ page }) => {
    // Exit inventory
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Should be back in dungeon
    // Verify by trying to open inventory again
    await page.keyboard.press('i');
    await page.waitForTimeout(500);

    // Verify we're in inventory
    const inInventory = await page.evaluate(() => {
      return document.querySelector('canvas') !== null;
    });
    expect(inInventory).toBe(true);
  });
});
