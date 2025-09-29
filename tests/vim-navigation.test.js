const { test, expect } = require('@playwright/test');

test.describe.skip('Vim-style hjkl navigation', () => {
  test('should move in dungeon using hjkl keys', async ({ page }) => {
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

    const startState = await page.evaluate(() => {
      const party = window.AI.getParty();
      return { x: party.location.x, y: party.location.y, facing: party.location.facing };
    });
    const startX = startState.x;
    const startY = startState.y;
    const startFacing = startState.facing;

    // Test h (left turn)
    await page.evaluate(() => window.AI.sendKey('h'));
    await page.waitForTimeout(200);
    const afterH = await page.evaluate(() => {
      const party = window.AI.getParty();
      return { x: party.location.x, y: party.location.y, facing: party.location.facing };
    });

    // Test l (right turn)
    await page.evaluate(() => window.AI.sendKey('l'));
    await page.waitForTimeout(200);
    const afterL = await page.evaluate(() => {
      const party = window.AI.getParty();
      return { x: party.location.x, y: party.location.y, facing: party.location.facing };
    });

    // h and l should rotate left/right
    expect(afterH.facing).not.toBe(startFacing);
    expect(afterL.facing).toBe(startFacing); // Should be back to original after left then right

    // Test k (forward)
    await page.evaluate(() => window.AI.sendKey('k'));
    await page.waitForTimeout(200);
    const afterK = await page.evaluate(() => {
      const party = window.AI.getParty();
      return { x: party.location.x, y: party.location.y, facing: party.location.facing };
    });

    // k should move forward (north if facing north)
    if (startFacing === 'north') {
      expect(afterK.y).toBe(startY - 1);
    }

    // Test j (backward)
    await page.evaluate(() => window.AI.sendKey('j'));
    await page.waitForTimeout(200);
    const afterJ = await page.evaluate(() => {
      const party = window.AI.getParty();
      return { x: party.location.x, y: party.location.y, facing: party.location.facing };
    });

    // j should move backward to original position
    expect(afterJ.x).toBe(startX);
    expect(afterJ.y).toBe(startY);
  });

  test('should navigate menus using j/k keys', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForFunction(() => typeof window.AI !== 'undefined', { timeout: 2000 });

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForFunction(() => window.AI.getScene() === 'New Game', { timeout: 2000 });

    const newGameDesc = await page.evaluate(() => window.AI.describe());
    expect(newGameDesc.toLowerCase()).toContain('new');

    await page.evaluate(() => window.AI.sendKey('j'));
    await page.waitForTimeout(200);

    const afterDown = await page.evaluate(() => window.AI.describe());
    expect(afterDown).toContain('Auto-generate');

    await page.evaluate(() => window.AI.sendKey('k'));
    await page.waitForTimeout(200);

    const afterUp = await page.evaluate(() => window.AI.describe());
    expect(afterUp).toContain('Create New');
  });
});