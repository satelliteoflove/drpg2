const { test, expect } = require('@playwright/test');

test.describe.skip('Essential Game Functionality', () => {
  test('should load game and expose AI interface', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForFunction(() => typeof window.AI !== 'undefined', { timeout: 2000 });

    const aiInterfaceExists = await page.evaluate(() => {
      return typeof window.AI !== 'undefined';
    });
    expect(aiInterfaceExists).toBe(true);

    const aiMethods = ['getState', 'getScene', 'getParty', 'getDungeon', 'getCombat',
                       'getShop', 'getActions', 'describe', 'sendKey', 'roll'];

    const aiMethodsExist = await page.evaluate((methods) => {
      const results = {};
      for (const method of methods) {
        results[method] = typeof window.AI?.[method] === 'function';
      }
      return results;
    }, aiMethods);

    for (const method of aiMethods) {
      expect(aiMethodsExist[method]).toBe(true);
    }

    const gameExists = await page.evaluate(() => {
      return typeof window.game !== 'undefined';
    });
    expect(gameExists).toBe(true);

    const featureFlagsExist = await page.evaluate(() => {
      return typeof window.FeatureFlags !== 'undefined';
    });
    expect(featureFlagsExist).toBe(true);

    const sceneName = await page.evaluate(() => window.AI.getScene());
    expect(sceneName).toBe('MainMenu');
  });

  test('should navigate from Town to Shop', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForFunction(() => typeof window.AI !== 'undefined', { timeout: 2000 });

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForFunction(() => window.AI.getScene() === 'New Game', { timeout: 2000 });

    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(100);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    const dungeonReached = await page.waitForFunction(
      () => window.AI.getScene() === 'Dungeon',
      { timeout: 2000 }
    ).catch(() => false);
    if (!dungeonReached) throw new Error(`Failed to reach Dungeon: ${await page.evaluate(() => window.AI.getScene())}`);

    await page.evaluate(() => window.AI.sendKey('Escape'));
    const townReached = await page.waitForFunction(
      () => window.AI.getScene() === 'Town',
      { timeout: 2000 }
    ).catch(() => false);
    if (!townReached) throw new Error(`Failed to reach Town: ${await page.evaluate(() => window.AI.getScene())}`);

    let sceneName = await page.evaluate(() => window.AI.getScene());
    expect(sceneName).toBe('Town');

    await page.evaluate(() => window.AI.sendKey('s'));
    const shopReached = await page.waitForFunction(
      () => window.AI.getScene() === 'Shop',
      { timeout: 2000 }
    ).catch(() => false);
    if (!shopReached) throw new Error(`Failed to reach Shop: ${await page.evaluate(() => window.AI.getScene())}`);

    sceneName = await page.evaluate(() => window.AI.getScene());
    expect(sceneName).toBe('Shop');

    const description = await page.evaluate(() => window.AI.describe());
    expect(description).toContain("Boltac's Trading Post");

    await page.evaluate(() => window.AI.sendKey('Escape'));
    const backToTown = await page.waitForFunction(
      () => window.AI.getScene() === 'Town',
      { timeout: 2000 }
    ).catch(() => false);
    if (!backToTown) throw new Error(`Failed to reach Town: ${await page.evaluate(() => window.AI.getScene())}`);

    sceneName = await page.evaluate(() => window.AI.getScene());
    expect(sceneName).toBe('Town');
  });

  test('should handle Shop menu states', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForFunction(() => typeof window.AI !== 'undefined', { timeout: 2000 });

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForFunction(() => window.AI.getScene() === 'New Game', { timeout: 2000 });
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForFunction(() => window.AI.getScene() === 'Character Creation', { timeout: 2000 });
    await page.evaluate(() => window.AI.sendKey('Escape'));
    const dungeonReached2 = await page.waitForFunction(
      () => window.AI.getScene() === 'Dungeon',
      { timeout: 2000 }
    ).catch(() => false);
    if (!dungeonReached2) throw new Error(`Failed to reach Dungeon: ${await page.evaluate(() => window.AI.getScene())}`);
    await page.evaluate(() => window.AI.sendKey('Escape'));
    const townReached2 = await page.waitForFunction(
      () => window.AI.getScene() === 'Town',
      { timeout: 2000 }
    ).catch(() => false);
    if (!townReached2) throw new Error(`Failed to reach Town: ${await page.evaluate(() => window.AI.getScene())}`);
    await page.evaluate(() => window.AI.sendKey('s'));
    const shopReached2 = await page.waitForFunction(
      () => window.AI.getScene() === 'Shop',
      { timeout: 2000 }
    ).catch(() => false);
    if (!shopReached2) throw new Error(`Failed to reach Shop: ${await page.evaluate(() => window.AI.getScene())}`);

    let sceneName = await page.evaluate(() => window.AI.getScene());
    expect(sceneName).toBe('Shop');

    const initialShopInfo = await page.evaluate(() => window.AI.getShop());
    expect(initialShopInfo.inShop).toBe(true);
    expect(initialShopInfo.currentState).toBe('main_menu');

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);

    const buyingInfo = await page.evaluate(() => window.AI.getShop());
    expect(buyingInfo.currentState).toBe('buying_category');

    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(200);

    const backToMainInfo = await page.evaluate(() => window.AI.getShop());
    expect(backToMainInfo.currentState).toBe('main_menu');
  });

  test('should handle rapid scene transitions without errors', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForFunction(() => typeof window.AI !== 'undefined', { timeout: 2000 });

    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(100);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(100);
    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(100);

    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.AI.sendKey('Escape'));
      await page.waitForTimeout(50);
      await page.evaluate(() => window.AI.sendKey('s'));
      await page.waitForTimeout(50);
      await page.evaluate(() => window.AI.sendKey('Escape'));
      await page.waitForTimeout(50);
      await page.evaluate(() => window.AI.sendKey('d'));
      await page.waitForTimeout(50);
    }

    expect(consoleErrors).toHaveLength(0);
  });

  test('should maintain game state across scenes', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForFunction(() => typeof window.AI !== 'undefined', { timeout: 2000 });

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForFunction(() => window.AI.getScene() === 'New Game', { timeout: 2000 });
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForFunction(() => window.AI.getScene() === 'Character Creation', { timeout: 2000 });

    for (const char of 'TestChar') {
      await page.evaluate((c) => window.AI.sendKey(c), char);
    }
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    const leftCharCreation = await page.waitForFunction(
      () => window.AI.getScene() !== 'Character Creation',
      { timeout: 2000 }
    ).catch(() => false);
    if (!leftCharCreation) throw new Error('Failed to complete character creation in time');

    const partyInfo = await page.evaluate(() => window.AI.getParty());
    expect(partyInfo.characters).toBeDefined();
    expect(partyInfo.characters.length).toBeGreaterThan(0);

    const gameState = await page.evaluate(() => window.AI.getState());
    expect(gameState.party).toBeDefined();
    expect(gameState.party.characters).toBeDefined();
    expect(gameState.party.characters.length).toBeGreaterThan(0);
    expect(gameState.messageLog).toBeDefined();

    const totalGold = await page.evaluate(() => {
      const state = window.AI.getState();
      return state.party.characters.reduce((sum, char) => sum + (char.gold || 0), 0);
    });
    expect(totalGold).toBeGreaterThan(0);
  });

  test('should provide correct available actions per scene', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForFunction(() => typeof window.AI !== 'undefined', { timeout: 2000 });

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForFunction(() => window.AI.getScene() === 'New Game', { timeout: 2000 });
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForFunction(() => window.AI.getScene() === 'Character Creation', { timeout: 2000 });
    await page.evaluate(() => window.AI.sendKey('Escape'));
    const dungeonReached = await page.waitForFunction(
      () => window.AI.getScene() === 'Dungeon',
      { timeout: 2000 }
    ).catch(() => false);
    if (!dungeonReached) throw new Error(`Failed to reach Dungeon: ${await page.evaluate(() => window.AI.getScene())}`);

    let actions = await page.evaluate(() => window.AI.getActions());
    expect(actions).toContain('ArrowUp');
    expect(actions).toContain('ArrowDown');
    expect(actions).toContain('ArrowLeft');
    expect(actions).toContain('ArrowRight');
    expect(actions).toContain('m');
    expect(actions).toContain('i');
    expect(actions).toContain('Escape');

    await page.evaluate(() => window.AI.sendKey('Escape'));
    const townReached3 = await page.waitForFunction(
      () => window.AI.getScene() === 'Town',
      { timeout: 2000 }
    ).catch(() => false);
    if (!townReached3) throw new Error(`Failed to reach Town: ${await page.evaluate(() => window.AI.getScene())}`);

    actions = await page.evaluate(() => window.AI.getActions());
    expect(actions).toContain('ArrowUp');
    expect(actions).toContain('ArrowDown');
    expect(actions).toContain('Enter');
    expect(actions).toContain('Escape');

    await page.evaluate(() => window.AI.sendKey('s'));
    const shopReached = await page.waitForFunction(
      () => window.AI.getScene() === 'Shop',
      { timeout: 2000 }
    ).catch(() => false);
    if (!shopReached) throw new Error(`Failed to reach Shop: ${await page.evaluate(() => window.AI.getScene())}`);

    actions = await page.evaluate(() => window.AI.getActions());
    expect(actions).toContain('ArrowUp');
    expect(actions).toContain('ArrowDown');
    expect(actions).toContain('Enter');
    expect(actions).toContain('b');
    expect(actions).toContain('s');
    expect(actions).toContain('p');
    expect(actions).toContain('Escape');
  });
});