const { test, expect } = require('@playwright/test');

test.describe.skip('Dungeon to Town Transition', () => {
  test('should be able to return to town from dungeon floor 1', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForFunction(() => typeof window.AI !== 'undefined', { timeout: 2000 });

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForFunction(() => window.AI.getScene() === 'New Game', { timeout: 2000 });
    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.AI.sendKey('Enter'));

    const dungeonReached = await page.waitForFunction(
      () => window.AI.getScene()?.toLowerCase() === 'dungeon',
      { timeout: 2000 }
    ).catch(() => false);

    if (!dungeonReached) {
      const scene = await page.evaluate(() => window.AI.getScene());
      throw new Error(`Failed to reach dungeon. Current scene: ${scene}`);
    }

    const initialDungeon = await page.evaluate(() => window.AI.getDungeon());
    expect(initialDungeon.currentFloor).toBe(1);

    await page.evaluate(() => {
      const dungeon = window.AI.getDungeon();
      const party = window.AI.getParty();
      if (dungeon && dungeon.tiles && dungeon.stairs) {
        const stairs = dungeon.stairs.find(s => s.type === 'up');
        if (stairs) {
          window.game.gameState.party.x = stairs.x;
          window.game.gameState.party.y = stairs.y;
        }
      }
    });

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);

    const afterStairs = await page.evaluate(() => window.AI.getState());
    const hasPrompt = afterStairs.prompt || afterStairs.confirmation ||
                      afterStairs.message?.includes('stairs') ||
                      afterStairs.message?.includes('town');

    if (hasPrompt) {
      await page.evaluate(() => window.AI.sendKey('y'));
      await page.waitForTimeout(500);
    }

    const townReached = await page.waitForFunction(
      () => {
        const scene = window.AI.getScene();
        return scene && scene.toLowerCase() === 'town';
      },
      { timeout: 2000 }
    ).catch(() => false);

    if (!townReached) {
      const currentScene = await page.evaluate(() => window.AI.getScene());
      throw new Error(`Failed to reach town. Current scene: ${currentScene}`);
    }

    const finalScene = await page.evaluate(() => window.AI.getScene());
    expect(finalScene.toLowerCase()).toBe('town');

    const description = await page.evaluate(() => window.AI.describe());
    expect(description.toLowerCase()).toContain('town');
  });
});