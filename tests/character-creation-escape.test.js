const { test, expect } = require('@playwright/test');

test.describe.skip('Character Creation Escape', () => {
  test('should return to New Game menu when pressing Escape in character creation', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForFunction(() => typeof window.AI !== 'undefined', { timeout: 2000 });

    let sceneName = await page.evaluate(() => window.AI.getScene());
    expect(sceneName).toBe('MainMenu');

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForFunction(() => window.AI.getScene() === 'New Game', { timeout: 2000 });

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForFunction(() => window.AI.getScene() === 'Character Creation', { timeout: 2000 });

    await page.evaluate(() => window.AI.sendKey('Escape'));
    const newGameReached = await page.waitForFunction(
      () => window.AI.getScene() === 'New Game' || window.AI.getScene() === 'new-game-menu',
      { timeout: 2000 }
    ).catch(() => false);

    if (!newGameReached) {
      const scene = await page.evaluate(() => window.AI.getScene());
      throw new Error(`Failed to return to New Game menu after Escape. Current scene: ${scene}`);
    }

    sceneName = await page.evaluate(() => window.AI.getScene());
    expect(sceneName).toMatch(/New Game|new-game-menu/i);
  });
});