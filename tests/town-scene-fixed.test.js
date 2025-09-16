const { test, expect } = require('@playwright/test');

// Helper function to navigate to Town
async function navigateToTown(page) {
  // Start from MainMenu
  await page.keyboard.press('Enter'); // New Game
  await page.waitForTimeout(500);

  // Now in New Game scene
  await page.keyboard.press('Enter'); // Continue
  await page.waitForTimeout(500);

  // Now in Character Creation
  await page.keyboard.press('Escape'); // Skip to Dungeon with default party
  await page.waitForTimeout(500);

  // Now in Dungeon
  await page.keyboard.press('Escape'); // Go to Town
  await page.waitForTimeout(500);
}

test.describe('TownScene Functionality (Fixed)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);
    await navigateToTown(page);
  });

  test('should display town scene with correct title', async ({ page }) => {
    const sceneInfo = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      const scene = sceneManager?.getCurrentScene();
      return {
        name: scene?.getName(),
        menuOptions: scene?.menuOptions,
        selectedOption: scene?.selectedOption,
      };
    });

    expect(sceneInfo.name).toBe('Town');
    expect(sceneInfo.menuOptions).toContain("Boltac's Trading Post");
    expect(sceneInfo.menuOptions).toContain('Temple');
    expect(sceneInfo.menuOptions).toContain('Inn');
    expect(sceneInfo.menuOptions).toContain('Return to Dungeon');
    expect(sceneInfo.selectedOption).toBe(0);
  });

  test('should navigate menu with arrow keys', async ({ page }) => {
    const getSelectedOption = () =>
      page.evaluate(() => {
        const sceneManager = window.game?.getSceneManager();
        const scene = sceneManager?.getCurrentScene();
        return scene?.selectedOption;
      });

    expect(await getSelectedOption()).toBe(0);

    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(1);

    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(2);

    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(1);

    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    expect(await getSelectedOption()).toBe(0);
  });

  test('should enter shop when selecting first option', async ({ page }) => {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    const currentScene = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      return sceneManager?.getCurrentScene()?.getName();
    });
    expect(currentScene).toBe('Shop');
  });

  test('should return to dungeon on Escape', async ({ page }) => {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const currentScene = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      return sceneManager?.getCurrentScene()?.getName();
    });
    expect(currentScene).toBe('Dungeon');
  });

  test('should return to dungeon when selecting last option', async ({ page }) => {
    // Navigate to last option
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(50);
    }

    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    const currentScene = await page.evaluate(() => {
      const sceneManager = window.game?.getSceneManager();
      return sceneManager?.getCurrentScene()?.getName();
    });
    expect(currentScene).toBe('Dungeon');
  });

  test('should have party with characters and gold', async ({ page }) => {
    const partyInfo = await page.evaluate(() => {
      const gameState = window.game?.getGameState();
      return {
        hasParty: gameState?.party !== undefined,
        characterCount: gameState?.party?.characters?.length || 0,
        firstCharName: gameState?.party?.characters?.[0]?.name,
        firstCharGold: gameState?.party?.characters?.[0]?.gold,
      };
    });

    expect(partyInfo.hasParty).toBe(true);
    expect(partyInfo.characterCount).toBe(4);
    expect(partyInfo.firstCharName).toBe('Fighter');
    expect(partyInfo.firstCharGold).toBe(100);
  });
});
