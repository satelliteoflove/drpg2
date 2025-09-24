const { test, expect } = require('@playwright/test');

test('hjkl movement in dungeon', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await page.waitForTimeout(500);

  // Start new game with auto-generate
  await page.evaluate(() => window.AI.sendKey('n'));
  await page.waitForTimeout(200);
  await page.evaluate(() => window.AI.sendKey('ArrowDown'));
  await page.evaluate(() => window.AI.sendKey('Enter'));
  await page.waitForTimeout(500);

  // Check we're in dungeon
  const scene = await page.evaluate(() => window.AI.getScene());
  expect(scene.toLowerCase()).toBe('dungeon');

  // Get start state
  const startState = await page.evaluate(() => window.AI.getState());
  console.log('Start state:', {
    x: startState.party.x,
    y: startState.party.y,
    facing: startState.party.facing
  });

  // Try k key for forward
  await page.evaluate(() => window.AI.sendKey('k'));
  await page.waitForTimeout(200);
  const afterK = await page.evaluate(() => window.AI.getState());
  console.log('After k:', {
    x: afterK.party.x,
    y: afterK.party.y,
    facing: afterK.party.facing
  });

  // Try h key for left turn
  await page.evaluate(() => window.AI.sendKey('h'));
  await page.waitForTimeout(200);
  const afterH = await page.evaluate(() => window.AI.getState());
  console.log('After h:', {
    x: afterH.party.x,
    y: afterH.party.y,
    facing: afterH.party.facing
  });

  // Verify movement happened
  const moved = (afterK.party.x !== startState.party.x) || (afterK.party.y !== startState.party.y);
  const turned = afterH.party.facing !== afterK.party.facing;

  expect(moved || turned).toBe(true);
});