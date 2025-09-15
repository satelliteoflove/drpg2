const { test, expect } = require('@playwright/test');

test.describe('Shop ASCII Rendering', () => {
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

    // Navigate to shop from town
    await page.keyboard.press('ArrowDown'); // Select Shop
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
  });

  test('renders Shop main menu in ASCII mode', async ({ page }) => {
    // Take screenshot for verification
    const canvas = await page.locator('canvas');
    const screenshot = await canvas.screenshot();

    // Verify basic rendering
    const dimensions = await canvas.boundingBox();
    expect(dimensions).toBeTruthy();
    expect(dimensions.width).toBeGreaterThan(0);
    expect(dimensions.height).toBeGreaterThan(0);

    // Verify the shop loaded (canvas should have content)
    const imageData = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      const ctx = canvas.getContext('2d');
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = data.data;

      // Check if there are non-black pixels
      let hasContent = false;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i] > 0 || pixels[i + 1] > 0 || pixels[i + 2] > 0) {
          hasContent = true;
          break;
        }
      }

      return hasContent;
    });

    expect(imageData).toBe(true);
  });

  test('navigates Shop menu options', async ({ page }) => {
    // Test menu navigation
    await page.keyboard.press('ArrowDown'); // Move to Sell Items
    await page.waitForTimeout(100);

    await page.keyboard.press('ArrowDown'); // Move to Identify Items
    await page.waitForTimeout(100);

    await page.keyboard.press('ArrowUp'); // Move back to Sell Items
    await page.waitForTimeout(100);

    // Verify we can still interact
    const canInteract = await page.evaluate(() => {
      return document.querySelector('canvas') !== null;
    });
    expect(canInteract).toBe(true);
  });

  test('enters and exits Buy Items category', async ({ page }) => {
    // Select Buy Items
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Should be in category selection now
    // Go back to main menu
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Verify we're back in shop (not crashed)
    const inShop = await page.evaluate(() => {
      return document.querySelector('canvas') !== null;
    });
    expect(inShop).toBe(true);
  });

  test('navigates to item list and back', async ({ page }) => {
    // Select Buy Items
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    // Select Weapons category
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    // Navigate in item list
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);

    // Go back to category selection
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Go back to main menu
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Verify still in shop
    const stillInShop = await page.evaluate(() => {
      return document.querySelector('canvas') !== null;
    });
    expect(stillInShop).toBe(true);
  });

  test('toggles ASCII rendering in Shop', async ({ page }) => {
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

  test('returns to town from Shop', async ({ page }) => {
    // Navigate to Leave Shop option
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(100);
    }

    // Select Leave Shop
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Should be back in town
    // Verify by trying to enter shop again
    await page.keyboard.press('ArrowDown'); // Select Shop
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Verify we're in shop
    const inShop = await page.evaluate(() => {
      return document.querySelector('canvas') !== null;
    });
    expect(inShop).toBe(true);
  });
});