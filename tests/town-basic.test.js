const { test, expect } = require('@playwright/test');

test.describe('TownScene Basic Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('should navigate to town and back to dungeon', async ({ page }) => {
    // Start a new game first
    await page.keyboard.press('Enter'); // Select "New Game"
    await page.waitForTimeout(500);
    
    // Should be in dungeon now
    const startScene = await page.evaluate(() => {
      return window.game?.getCurrentSceneName?.() || 'unknown';
    });
    console.log('Start scene:', startScene);
    expect(startScene).toBe('Dungeon');
    
    // Navigate to town
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    const townScene = await page.evaluate(() => {
      return window.game?.getCurrentSceneName?.() || 'unknown';
    });
    console.log('After ESC:', townScene);
    expect(townScene).toBe('Town');
    
    // Navigate back to dungeon
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    const dungeonScene = await page.evaluate(() => {
      return window.game?.getCurrentSceneName?.() || 'unknown';
    });
    console.log('After 2nd ESC:', dungeonScene);
    expect(dungeonScene).toBe('Dungeon');
  });

  test('should navigate menu options in town', async ({ page }) => {
    // Start a new game first
    await page.keyboard.press('Enter'); // Select "New Game"
    await page.waitForTimeout(500);
    
    // Navigate to town
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Check we're in town
    const currentScene = await page.evaluate(() => {
      return window.game?.getCurrentSceneName?.() || 'unknown';
    });
    expect(currentScene).toBe('Town');
    
    // Navigate menu
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    
    // Should still be in town after navigation
    const stillInTown = await page.evaluate(() => {
      return window.game?.getCurrentSceneName?.() || 'unknown';
    });
    expect(stillInTown).toBe('Town');
  });

  test('should transition to shop when pressing Enter on first option', async ({ page }) => {
    // Start a new game first
    await page.keyboard.press('Enter'); // Select "New Game"
    await page.waitForTimeout(500);
    
    // Navigate to town
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Press Enter to select first option (Trading Post)
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    const currentScene = await page.evaluate(() => {
      return window.game?.getCurrentSceneName?.() || 'unknown';
    });
    expect(currentScene).toBe('Shop');
    
    // Navigate back to town
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    const backInTown = await page.evaluate(() => {
      return window.game?.getCurrentSceneName?.() || 'unknown';
    });
    expect(backInTown).toBe('Town');
  });
});