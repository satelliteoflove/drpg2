const { test, expect } = require('@playwright/test');

test.describe('Character Creation Escape', () => {
  test('should skip character creation with Escape key', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    // Start from MainMenu
    let sceneName = await page.evaluate(() => {
      const sceneManager = window.game?.sceneManager;
      return sceneManager?.getCurrentScene()?.getName();
    });
    expect(sceneName).toBe('MainMenu');

    // Go to New Game
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    sceneName = await page.evaluate(() => {
      const sceneManager = window.game?.sceneManager;
      return sceneManager?.getCurrentScene()?.getName();
    });
    expect(sceneName).toBe('New Game');

    // Continue to Character Creation
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    sceneName = await page.evaluate(() => {
      const sceneManager = window.game?.sceneManager;
      return sceneManager?.getCurrentScene()?.getName();
    });
    expect(sceneName).toBe('Character Creation');

    // Press Escape to skip
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    sceneName = await page.evaluate(() => {
      const sceneManager = window.game?.sceneManager;
      return sceneManager?.getCurrentScene()?.getName();
    });
    expect(sceneName).toBe('Dungeon');

    // Check that party was created
    const partyInfo = await page.evaluate(() => {
      const gameState = window.game?.gameState;
      return {
        hasParty: gameState?.party !== undefined,
        partySize: gameState?.party?.characters?.length || 0,
        firstCharName: gameState?.party?.characters?.[0]?.name,
      };
    });

    expect(partyInfo.hasParty).toBe(true);
    expect(partyInfo.partySize).toBeGreaterThan(0);
    expect(partyInfo.firstCharName).toBe('Fighter');

    // Now test navigation to Town
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    sceneName = await page.evaluate(() => {
      const sceneManager = window.game?.sceneManager;
      return sceneManager?.getCurrentScene()?.getName();
    });
    expect(sceneName).toBe('Town');

    // And to Shop
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    sceneName = await page.evaluate(() => {
      const sceneManager = window.game?.sceneManager;
      return sceneManager?.getCurrentScene()?.getName();
    });
    expect(sceneName).toBe('Shop');
  });
});
