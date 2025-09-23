const { test, expect } = require('@playwright/test');

test.describe('Character Creation Escape', () => {
  test('should skip character creation with Escape key', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    let sceneName = await page.evaluate(() => window.AI.getScene());
    expect(sceneName).toBe('MainMenu');

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);

    sceneName = await page.evaluate(() => window.AI.getScene());
    expect(sceneName).toBe('New Game');

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);

    sceneName = await page.evaluate(() => window.AI.getScene());
    expect(sceneName).toBe('Character Creation');

    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(1000);

    sceneName = await page.evaluate(() => window.AI.getScene());
    expect(sceneName).toBe('Dungeon');

    const partyInfo = await page.evaluate(() => window.AI.getParty());
    expect(partyInfo.characters).toBeDefined();
    expect(partyInfo.characters.length).toBeGreaterThan(0);
    expect(partyInfo.characters[0].name).toBe('Fighter');

    const gameState = await page.evaluate(() => window.AI.getState());
    expect(gameState.party).toBeDefined();
    expect(gameState.party.characters.length).toBeGreaterThan(0);

    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(500);

    sceneName = await page.evaluate(() => window.AI.getScene());
    expect(sceneName).toBe('Town');

    const description = await page.evaluate(() => window.AI.describe());
    expect(description).toContain('Town of Llylgamyn');

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);

    sceneName = await page.evaluate(() => window.AI.getScene());
    expect(sceneName).toBe('Shop');

    const shopDescription = await page.evaluate(() => window.AI.describe());
    expect(shopDescription).toContain("Boltac's Trading Post");
  });
});