const { test, expect } = require('@playwright/test');

async function navigateToShop(page) {
  await page.evaluate(() => window.AI.sendKey('Enter'));
  await page.waitForFunction(() => window.AI.getScene() === 'New Game', { timeout: 2000 });
  await page.evaluate(() => window.AI.sendKey('ArrowDown'));
  await page.waitForTimeout(100);
  await page.evaluate(() => window.AI.sendKey('Enter'));
  await page.waitForTimeout(200);
  await page.evaluate(() => window.AI.sendKey('Enter'));
  await page.waitForFunction(() => window.AI.getScene() === 'Dungeon', { timeout: 2000 });
  await page.evaluate(() => window.AI.sendKey('Escape'));
  await page.waitForFunction(() => window.AI.getScene() === 'Town', { timeout: 2000 });
  await page.evaluate(() => window.AI.sendKey('s'));
  await page.waitForFunction(() => window.AI.getScene() === 'Shop', { timeout: 2000 });
}

test.describe.skip('ShopScene Functionality (Fixed)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForFunction(() => typeof window.AI !== 'undefined', { timeout: 2000 });
    await navigateToShop(page);
  });

  test('should display shop main menu', async ({ page }) => {
    const sceneName = await page.evaluate(() => window.AI.getScene());
    expect(sceneName).toBe('Shop');

    const shopInfo = await page.evaluate(() => window.AI.getShop());
    expect(shopInfo.inShop).toBe(true);
    expect(shopInfo.currentState).toBe('main_menu');

    const description = await page.evaluate(() => window.AI.describe());
    expect(description).toContain("Boltac's Trading Post");
  });

  test('should navigate shop menu', async ({ page }) => {
    const initialShopInfo = await page.evaluate(() => window.AI.getShop());
    expect(initialShopInfo.currentState).toBe('main_menu');
    const initialSelection = initialShopInfo.selectedOption || 0;

    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(100);

    const afterDown = await page.evaluate(() => window.AI.getShop());
    expect(afterDown.selectedOption).toBe((initialSelection + 1) % afterDown.menuOptions.length);

    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(100);

    const afterDown2 = await page.evaluate(() => window.AI.getShop());
    expect(afterDown2.selectedOption).toBe((initialSelection + 2) % afterDown2.menuOptions.length);

    await page.evaluate(() => window.AI.sendKey('ArrowUp'));
    await page.waitForTimeout(100);

    const afterUp = await page.evaluate(() => window.AI.getShop());
    expect(afterUp.selectedOption).toBe((initialSelection + 1) % afterUp.menuOptions.length);
    expect(afterUp.currentState).toBe('main_menu');
  });

  test('should enter buying category selection', async ({ page }) => {
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);

    const shopInfo = await page.evaluate(() => window.AI.getShop());
    expect(shopInfo.currentState).toBe('buying_category');

    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(200);

    const newShopInfo = await page.evaluate(() => window.AI.getShop());
    expect(newShopInfo.currentState).toBe('main_menu');
  });

  test('should handle gold pooling', async ({ page }) => {
    const shopOptions = await page.evaluate(() => {
      const shop = window.AI.getShop();
      return shop.menuOptions || [];
    });

    const poolGoldIndex = shopOptions.findIndex(opt =>
      opt.toLowerCase().includes('pool') || opt.toLowerCase().includes('gold'));

    if (poolGoldIndex >= 0) {
      for (let i = 0; i < poolGoldIndex; i++) {
        await page.evaluate(() => window.AI.sendKey('ArrowDown'));
        await page.waitForTimeout(50);
      }
    } else {
      await page.evaluate(() => window.AI.sendKey('p'));
      await page.waitForTimeout(100);
    }

    const getGoldInfo = () =>
      page.evaluate(() => {
        const state = window.AI.getState();
        return {
          partyGold: state?.gold || 0,
          characterGold: state?.party?.characters?.map((c) => c.gold) || [],
        };
      });

    const initialGold = await getGoldInfo();
    const totalBefore =
      initialGold.characterGold.reduce((a, b) => a + b, 0) + initialGold.partyGold;

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);

    const shopInfo = await page.evaluate(() => window.AI.getShop());
    expect(shopInfo.currentState).toBe('pooling_gold');

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);

    const finalGold = await getGoldInfo();
    expect(finalGold.characterGold[0]).toBe(totalBefore);
    expect(finalGold.partyGold).toBe(0);
    for (let i = 1; i < finalGold.characterGold.length; i++) {
      expect(finalGold.characterGold[i]).toBe(0);
    }
  });

  test('should return to town on Escape', async ({ page }) => {
    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(500);

    const currentScene = await page.evaluate(() => window.AI.getScene());
    expect(currentScene).toBe('Town');
  });

  test('should leave shop via menu option', async ({ page }) => {
    const shopOptions = await page.evaluate(() => {
      const shop = window.AI.getShop();
      return shop.menuOptions || [];
    });

    const leaveIndex = shopOptions.findIndex(opt =>
      opt.toLowerCase().includes('leave') || opt.toLowerCase().includes('exit'));

    if (leaveIndex >= 0) {
      for (let i = 0; i < leaveIndex; i++) {
        await page.evaluate(() => window.AI.sendKey('ArrowDown'));
        await page.waitForTimeout(50);
      }
      await page.evaluate(() => window.AI.sendKey('Enter'));
    } else {
      await page.evaluate(() => window.AI.sendKey('Escape'));
    }

    await page.waitForFunction(() => window.AI.getScene() === 'Town', { timeout: 2000 });

    const currentScene = await page.evaluate(() => window.AI.getScene());
    expect(currentScene).toBe('Town');
  });
});
