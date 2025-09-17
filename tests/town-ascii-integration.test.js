const { test, expect } = require('@playwright/test');

test.describe('TownScene ASCII Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('should render Town scene in ASCII mode when flag is enabled', async ({ page }) => {
    // Enable ASCII mode
    await page.evaluate(() => {
      window.FeatureFlags.enable('ascii_town_scene');
    });

    // Navigate to town
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Verify ASCII rendering is active
    const canvas = page.locator('canvas');
    const screenshot = await canvas.screenshot();
    
    // Check for ASCII mode indicator in title
    const hasASCIIIndicator = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // ASCII mode should show clear grid pattern
      let gridLinesFound = false;
      const data = imageData.data;
      
      // Check for consistent spacing (grid pattern)
      for (let y = 0; y < 100; y += 20) {
        let transitions = 0;
        let lastBrightness = 0;
        
        for (let x = 0; x < canvas.width; x++) {
          const idx = (y * canvas.width + x) * 4;
          const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          
          if (Math.abs(brightness - lastBrightness) > 100) {
            transitions++;
          }
          lastBrightness = brightness;
        }
        
        // ASCII grid should have regular transitions
        if (transitions > 20) {
          gridLinesFound = true;
          break;
        }
      }
      
      return gridLinesFound;
    });

    expect(hasASCIIIndicator).toBe(true);
  });

  test('should handle menu navigation in ASCII mode', async ({ page }) => {
    // Enable ASCII mode
    await page.evaluate(() => {
      window.FeatureFlags.enable('ascii_town_scene');
    });

    // Navigate to town
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Test navigation
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);

    // Verify selected option changed
    const selectedOption = await page.evaluate(() => {
      return window.townScene?.asciiState?.getSelectedOption() ?? -1;
    });

    expect(selectedOption).toBeGreaterThanOrEqual(0);
    expect(selectedOption).toBeLessThan(4);
  });

  test('should transition to shop when selecting Trading Post', async ({ page }) => {
    // Enable ASCII mode
    await page.evaluate(() => {
      window.FeatureFlags.enable('ascii_town_scene');
    });

    // Navigate to town
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Select Trading Post (first option)
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Verify we're in shop scene
    const currentScene = await page.evaluate(() => {
      return window.game?.getCurrentSceneName?.() || 'unknown';
    });

    expect(currentScene).toBe('shop');
  });

  test('should return to dungeon on Escape', async ({ page }) => {
    // Enable ASCII mode
    await page.evaluate(() => {
      window.FeatureFlags.enable('ascii_town_scene');
    });

    // Navigate to town
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Press Escape to return to dungeon
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Verify we're back in dungeon
    const currentScene = await page.evaluate(() => {
      return window.game?.getCurrentSceneName?.() || 'unknown';
    });

    expect(currentScene).toBe('dungeon');
  });

  test('should toggle between ASCII and canvas rendering', async ({ page }) => {
    // Start with ASCII disabled
    await page.evaluate(() => {
      window.FeatureFlags.disable('ascii_town_scene');
    });

    // Navigate to town
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Take screenshot of canvas rendering
    const canvas = page.locator('canvas');
    const canvasScreenshot = await canvas.screenshot();

    // Enable ASCII mode
    await page.evaluate(() => {
      window.FeatureFlags.enable('ascii_town_scene');
    });
    
    await page.waitForTimeout(500);

    // Take screenshot of ASCII rendering
    const asciiScreenshot = await canvas.screenshot();

    // Screenshots should be different
    expect(Buffer.compare(canvasScreenshot, asciiScreenshot)).not.toBe(0);
  });

  test('should display correct menu options', async ({ page }) => {
    // Enable ASCII mode
    await page.evaluate(() => {
      window.FeatureFlags.enable('ascii_town_scene');
    });

    // Navigate to town
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Check menu options
    const menuOptions = await page.evaluate(() => {
      const state = window.townScene?.asciiState;
      if (!state) return [];
      
      // Access the private menuOptions through the grid
      const grid = state.getGrid();
      const gridArray = grid.getGrid();
      
      // Look for menu text in the grid
      const options = [];
      for (let y = 10; y < 20; y++) {
        const row = gridArray[y];
        if (row) {
          const text = row.map(cell => cell.char).join('').trim();
          if (text.includes('Trading Post')) options.push('Trading Post');
          if (text.includes('Temple')) options.push('Temple');
          if (text.includes('Inn')) options.push('Inn');
          if (text.includes('Return to Dungeon')) options.push('Return to Dungeon');
        }
      }
      
      return options;
    });

    expect(menuOptions).toContain('Trading Post');
    expect(menuOptions).toContain('Return to Dungeon');
  });
});