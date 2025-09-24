const { test, expect } = require('@playwright/test');

test.describe('Vim-style hjkl navigation', () => {
  test('should move in dungeon using hjkl keys', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(500);

    await page.evaluate(() => window.AI.sendKey('n'));
    await page.waitForTimeout(200);

    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);

    const startState = await page.evaluate(() => window.AI.getState());
    const startX = startState.party.x;
    const startY = startState.party.y;
    const startFacing = startState.party.facing;

    // Test h (left turn)
    await page.evaluate(() => window.AI.sendKey('h'));
    await page.waitForTimeout(200);
    const afterH = await page.evaluate(() => window.AI.getState());

    // Test l (right turn)
    await page.evaluate(() => window.AI.sendKey('l'));
    await page.waitForTimeout(200);
    const afterL = await page.evaluate(() => window.AI.getState());

    // h and l should rotate left/right
    expect(afterH.party.facing).not.toBe(startFacing);
    expect(afterL.party.facing).toBe(startFacing); // Should be back to original after left then right

    // Test k (forward)
    await page.evaluate(() => window.AI.sendKey('k'));
    await page.waitForTimeout(200);
    const afterK = await page.evaluate(() => window.AI.getState());

    // k should move forward (north if facing north)
    if (startFacing === 'north') {
      expect(afterK.party.y).toBe(startY - 1);
    }

    // Test j (backward)
    await page.evaluate(() => window.AI.sendKey('j'));
    await page.waitForTimeout(200);
    const afterJ = await page.evaluate(() => window.AI.getState());

    // j should move backward to original position
    expect(afterJ.party.x).toBe(startX);
    expect(afterJ.party.y).toBe(startY);
  });

  test('should navigate menus using j/k keys', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(500);

    await page.evaluate(() => window.AI.sendKey('n'));
    await page.waitForTimeout(200);

    const newGameDesc = await page.evaluate(() => window.AI.describe());
    expect(newGameDesc).toContain('new_game');

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