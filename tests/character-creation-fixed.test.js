const { test, expect } = require('@playwright/test');

test.describe.skip('Character System Tests', () => {
  test('should auto-generate a party successfully', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForFunction(() => typeof window.AI !== 'undefined', { timeout: 2000 });

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForFunction(() => window.AI.getScene() === 'New Game', { timeout: 2000 });

    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(100);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.AI.sendKey('Enter'));

    const sceneResult = await page.waitForFunction(
      () => {
        const scene = window.AI.getScene();
        return scene ? scene.toLowerCase() === 'dungeon' : false;
      },
      { timeout: 2000 }
    ).catch(() => null);

    if (!sceneResult) {
      const currentScene = await page.evaluate(() => window.AI.getScene());
      throw new Error(`Failed to reach dungeon. Current scene: ${currentScene}`);
    }

    const party = await page.evaluate(() => window.AI.getParty());
    expect(party.characters).toBeDefined();
    expect(party.characters.length).toBeGreaterThanOrEqual(3);
    expect(party.characters.length).toBeLessThanOrEqual(6);

    const firstChar = party.characters[0];
    expect(firstChar.name).toBeDefined();
    expect(firstChar.level).toBe(1);

    const hp = typeof firstChar.hp === 'object' ? firstChar.hp.current : firstChar.hp;
    const maxHp = typeof firstChar.hp === 'object' ? firstChar.hp.max : firstChar.maxHp;
    expect(hp).toBeGreaterThan(0);
    expect(maxHp).toBeGreaterThan(0);
  });

  test.skip('should manually create a single character', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForFunction(() => typeof window.AI !== 'undefined', { timeout: 5000 });

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForFunction(() => window.AI.getScene() === 'New Game', { timeout: 2000 });

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForFunction(() => window.AI.getScene() === 'Character Creation', { timeout: 2000 });

    for (const char of 'TestHero') {
      await page.evaluate((c) => window.AI.sendKey(c), char);
    }
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(300);

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);

    const result = await page.evaluate(() => {
      const party = window.AI.getParty();
      const state = window.AI.getState();
      return {
        scene: window.AI.getScene(),
        hasParty: !!party,
        partySize: party?.characters?.length || 0,
        firstCharName: party?.characters?.[0]?.name || null
      };
    });

    if (result.scene === 'Dungeon') {
      expect(result.partySize).toBeGreaterThan(0);
      expect(result.firstCharName).toContain('TestHero');
    } else if (result.scene === 'Party Menu' || result.scene.includes('Party')) {
      expect(result.partySize).toBe(1);
      expect(result.firstCharName).toContain('TestHero');
    } else {
      expect(result.scene).toMatch(/Dungeon|Party/i);
    }
  });

  test('should respect party size limit of 6', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForFunction(() => typeof window.AI !== 'undefined', { timeout: 2000 });

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForFunction(() => window.AI.getScene() === 'New Game', { timeout: 2000 });
    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(100);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.AI.sendKey('Enter'));

    const sceneResult = await page.waitForFunction(
      () => {
        const scene = window.AI.getScene();
        return scene ? scene.toLowerCase() === 'dungeon' : false;
      },
      { timeout: 2000 }
    ).catch(() => null);

    if (!sceneResult) {
      const currentScene = await page.evaluate(() => window.AI.getScene());
      throw new Error(`Failed to reach dungeon. Current scene: ${currentScene}`);
    }

    const party = await page.evaluate(() => window.AI.getParty());
    expect(party.characters.length).toBeLessThanOrEqual(6);
  });
});