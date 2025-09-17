const { test, expect } = require('@playwright/test');

test.describe('Complete Game Flow Validation', () => {
  test('confirms game is fully playable from start to dungeon', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const mainMenuState = await page.evaluate(() => ({
      scene: window.game?.sceneManager?.currentScene?.constructor?.name,
      isRunning: window.game?.isRunning,
      hasCanvas: !!document.querySelector('canvas')
    }));
    expect(mainMenuState.scene).toBe('MainMenuScene');
    expect(mainMenuState.isRunning).toBe(true);
    expect(mainMenuState.hasCanvas).toBe(true);

    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    const newGameState = await page.evaluate(() => ({
      scene: window.game?.sceneManager?.currentScene?.constructor?.name,
      menuOptions: window.game?.sceneManager?.currentScene?.menuOptions
    }));
    expect(newGameState.scene).toBe('NewGameScene');
    expect(newGameState.menuOptions).toContain('Manual Character Creation');

    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    const charCreationState = await page.evaluate(() => ({
      scene: window.game?.sceneManager?.currentScene?.constructor?.name,
      currentStep: window.game?.sceneManager?.currentScene?.currentStep,
      races: window.game?.sceneManager?.currentScene?.races?.length,
      classes: window.game?.sceneManager?.currentScene?.classes?.length
    }));
    expect(charCreationState.scene).toBe('CharacterCreationScene');
    expect(charCreationState.currentStep).toBe('name');
    expect(charCreationState.races).toBe(11);
    expect(charCreationState.classes).toBe(14);

    await page.keyboard.type('TestHero');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    const partyState = await page.evaluate(() => ({
      scene: window.game?.sceneManager?.currentScene?.constructor?.name,
      currentStep: window.game?.sceneManager?.currentScene?.currentStep,
      partySize: window.game?.gameState?.party?.characters?.length || 0,
      characterName: window.game?.gameState?.party?.characters?.[0]?.name
    }));
    expect(partyState.partySize).toBe(1);
    expect(partyState.characterName).toBe('TESTHERO');

    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    const dungeonState = await page.evaluate(() => ({
      scene: window.game?.sceneManager?.currentScene?.constructor?.name,
      dungeonExists: !!window.game?.gameState?.dungeon,
      currentFloor: window.game?.gameState?.party?.floor,
      hasParty: !!window.game?.gameState?.party
    }));
    expect(dungeonState.scene).toBe('DungeonScene');
    expect(dungeonState.dungeonExists).toBe(true);
    expect(dungeonState.currentFloor).toBe(1);
    expect(dungeonState.hasParty).toBe(true);

    await page.screenshot({ path: 'tests/screenshots/validation-complete.png' });

    console.log('✓ Main menu loads correctly');
    console.log('✓ Can navigate to New Game menu');
    console.log('✓ Can access character creation with 11 races and 14 classes');
    console.log('✓ Can create a character successfully');
    console.log('✓ Character is added to party');
    console.log('✓ Can start adventure and enter dungeon');
    console.log('✓ Game is fully playable');
  });
});