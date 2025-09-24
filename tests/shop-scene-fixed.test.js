const { test, expect } = require('@playwright/test');

// Helper function to navigate to Shop
async function navigateToShop(page) {
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
}

test.describe('ShopScene Functionality (Fixed)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);
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

    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(100);
    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(100);
    await page.evaluate(() => window.AI.sendKey('ArrowUp'));
    await page.waitForTimeout(100);

    const shopInfo = await page.evaluate(() => window.AI.getShop());
    expect(shopInfo.currentState).toBe('main_menu');
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
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.AI.sendKey('ArrowDown'));
      await page.waitForTimeout(50);
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
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.AI.sendKey('ArrowDown'));
      await page.waitForTimeout(50);
    }

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);

    const currentScene = await page.evaluate(() => window.AI.getScene());
    expect(currentScene).toBe('Town');
  });
});
