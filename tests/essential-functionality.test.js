const { test, expect } = require('@playwright/test');

test.describe('Essential Game Functionality', () => {
  test('should load game and expose AI interface', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    const aiInterfaceExists = await page.evaluate(() => {
      return typeof window.AI !== 'undefined';
    });
    expect(aiInterfaceExists).toBe(true);

    const aiMethodsExist = await page.evaluate(() => {
      return {
        getState: typeof window.AI?.getState === 'function',
        getScene: typeof window.AI?.getScene === 'function',
        getParty: typeof window.AI?.getParty === 'function',
        getDungeon: typeof window.AI?.getDungeon === 'function',
        getCombat: typeof window.AI?.getCombat === 'function',
        getShop: typeof window.AI?.getShop === 'function',
        getActions: typeof window.AI?.getActions === 'function',
        describe: typeof window.AI?.describe === 'function',
        sendKey: typeof window.AI?.sendKey === 'function',
        roll: typeof window.AI?.roll === 'function',
      };
    });

    expect(aiMethodsExist.getState).toBe(true);
    expect(aiMethodsExist.getScene).toBe(true);
    expect(aiMethodsExist.getParty).toBe(true);
    expect(aiMethodsExist.getDungeon).toBe(true);
    expect(aiMethodsExist.getCombat).toBe(true);
    expect(aiMethodsExist.getShop).toBe(true);
    expect(aiMethodsExist.getActions).toBe(true);
    expect(aiMethodsExist.describe).toBe(true);
    expect(aiMethodsExist.sendKey).toBe(true);
    expect(aiMethodsExist.roll).toBe(true);

    const gameExists = await page.evaluate(() => {
      return typeof window.game !== 'undefined';
    });
    expect(gameExists).toBe(true);

    const featureFlagsExist = await page.evaluate(() => {
      return typeof window.FeatureFlags !== 'undefined';
    });
    expect(featureFlagsExist).toBe(true);
  });

  test('should start at MainMenu scene', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    const sceneName = await page.evaluate(() => window.AI.getScene());
    expect(sceneName).toBe('MainMenu');

    const description = await page.evaluate(() => window.AI.describe());
    expect(description).toContain('Main Menu');
  });

  test('should navigate from MainMenu to game', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);

    let sceneName = await page.evaluate(() => window.AI.getScene());
    expect(sceneName).toBe('New Game');

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);

    sceneName = await page.evaluate(() => window.AI.getScene());
    expect(sceneName).toBe('Character Creation');

    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(500);

    sceneName = await page.evaluate(() => window.AI.getScene());
    expect(sceneName).toBe('Dungeon');

    const dungeonInfo = await page.evaluate(() => window.AI.getDungeon());
    expect(dungeonInfo.currentFloor).toBe(1);
  });

  test('should navigate between Dungeon and Town', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(500);

    let sceneName = await page.evaluate(() => window.AI.getScene());
    expect(sceneName).toBe('Dungeon');

    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(500);

    sceneName = await page.evaluate(() => window.AI.getScene());
    expect(sceneName).toBe('Town');

    const description = await page.evaluate(() => window.AI.describe());
    expect(description).toContain('Town of Llylgamyn');

    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(500);

    sceneName = await page.evaluate(() => window.AI.getScene());
    expect(sceneName).toBe('Dungeon');
  });

  test('should navigate from Town to Shop', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(500);

    let sceneName = await page.evaluate(() => window.AI.getScene());
    expect(sceneName).toBe('Town');

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);

    sceneName = await page.evaluate(() => window.AI.getScene());
    expect(sceneName).toBe('Shop');

    const description = await page.evaluate(() => window.AI.describe());
    expect(description).toContain("Boltac's Trading Post");

    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(500);

    sceneName = await page.evaluate(() => window.AI.getScene());
    expect(sceneName).toBe('Town');
  });

  test('should handle menu navigation in Town', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(500);

    const initialState = await page.evaluate(() => window.AI.getState());
    const initialMenuPosition = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.getCurrentScene();
      return scene?.selectedOption;
    });
    expect(initialMenuPosition).toBe(0);

    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(100);
    const afterDownPosition = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.getCurrentScene();
      return scene?.selectedOption;
    });
    expect(afterDownPosition).toBe(1);

    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(100);
    const secondDownPosition = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.getCurrentScene();
      return scene?.selectedOption;
    });
    expect(secondDownPosition).toBe(2);

    await page.evaluate(() => window.AI.sendKey('ArrowUp'));
    await page.waitForTimeout(100);
    const afterUpPosition = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.getCurrentScene();
      return scene?.selectedOption;
    });
    expect(afterUpPosition).toBe(1);
  });

  test('should handle Shop menu states', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);

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

  test('should toggle feature flags', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    const performanceFlag = await page.evaluate(() => {
      return window.FeatureFlags.isEnabled('PERFORMANCE_MONITORING');
    });

    await page.evaluate(() => {
      window.FeatureFlags.enable('PERFORMANCE_MONITORING');
    });

    const enabledFlag = await page.evaluate(() => {
      return window.FeatureFlags.isEnabled('PERFORMANCE_MONITORING');
    });
    expect(enabledFlag).toBe(true);

    await page.evaluate(() => {
      window.FeatureFlags.disable('PERFORMANCE_MONITORING');
    });

    const disabledFlag = await page.evaluate(() => {
      return window.FeatureFlags.isEnabled('PERFORMANCE_MONITORING');
    });
    expect(disabledFlag).toBe(false);
  });

  test('should handle rapid scene transitions without errors', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(200);

    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.AI.sendKey('Escape'));
      await page.waitForTimeout(100);
      await page.evaluate(() => window.AI.sendKey('Enter'));
      await page.waitForTimeout(100);
      await page.evaluate(() => window.AI.sendKey('Escape'));
      await page.waitForTimeout(100);
      await page.evaluate(() => window.AI.sendKey('Escape'));
      await page.waitForTimeout(100);
    }

    expect(consoleErrors).toHaveLength(0);
  });

  test('should maintain game state across scenes', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(500);

    const partyInfo = await page.evaluate(() => window.AI.getParty());
    expect(partyInfo.characters).toBeDefined();
    expect(partyInfo.characters.length).toBe(4);

    const gameState = await page.evaluate(() => window.AI.getState());
    expect(gameState.party).toBeDefined();
    expect(gameState.party.characters).toBeDefined();
    expect(gameState.party.characters.length).toBe(4);
    expect(gameState.messageLog).toBeDefined();

    const totalGold = await page.evaluate(() => {
      const state = window.AI.getState();
      return state.party.characters.reduce((sum, char) => sum + (char.gold || 0), 0);
    });
    expect(totalGold).toBeGreaterThan(0);
  });

  test('should provide correct available actions per scene', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(500);

    let actions = await page.evaluate(() => window.AI.getActions());
    expect(actions).toContain('ArrowUp');
    expect(actions).toContain('ArrowDown');
    expect(actions).toContain('ArrowLeft');
    expect(actions).toContain('ArrowRight');
    expect(actions).toContain('m');
    expect(actions).toContain('i');
    expect(actions).toContain('Escape');

    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(500);

    actions = await page.evaluate(() => window.AI.getActions());
    expect(actions).toContain('ArrowUp');
    expect(actions).toContain('ArrowDown');
    expect(actions).toContain('Enter');
    expect(actions).toContain('Escape');

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);

    actions = await page.evaluate(() => window.AI.getActions());
    expect(actions).toContain('ArrowUp');
    expect(actions).toContain('ArrowDown');
    expect(actions).toContain('Enter');
    expect(actions).toContain('b');
    expect(actions).toContain('s');
    expect(actions).toContain('p');
    expect(actions).toContain('Escape');
  });

  test('should roll dice correctly', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    const rollResult = await page.evaluate(() => window.AI.roll('3d6'));
    expect(rollResult).toBeGreaterThanOrEqual(3);
    expect(rollResult).toBeLessThanOrEqual(18);

    const rollWithModifier = await page.evaluate(() => window.AI.roll('1d20+5'));
    expect(rollWithModifier).toBeGreaterThanOrEqual(6);
    expect(rollWithModifier).toBeLessThanOrEqual(25);

    const rollWithNegative = await page.evaluate(() => window.AI.roll('2d10-3'));
    expect(rollWithNegative).toBeGreaterThanOrEqual(-1);
    expect(rollWithNegative).toBeLessThanOrEqual(17);
  });
});