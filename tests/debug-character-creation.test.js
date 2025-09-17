const { test, expect } = require('@playwright/test');

test.describe('Debug Character Creation', () => {
  test('debug the actual character creation flow', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Check initial state
    let gameState = await page.evaluate(() => {
      return {
        hasGame: !!window.game,
        hasSceneManager: !!window.game?.sceneManager,
        currentScene: window.game?.sceneManager?.currentScene?.constructor?.name,
        currentStep: window.game?.sceneManager?.currentScene?.currentStep,
        partySize: window.game?.gameState?.party?.characters?.length || 0
      };
    });

    console.log('Initial state:', gameState);

    // Type a name and see what happens
    await page.keyboard.type('TestChar');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    gameState = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      return {
        sceneName: scene?.constructor?.name,
        currentStep: scene?.currentStep,
        nameInput: scene?.nameInput,
        races: scene?.races?.length,
        classes: scene?.classes?.length
      };
    });

    console.log('After name entry:', gameState);

    // Try selecting race
    await page.keyboard.press('Enter'); // Select first race (Human)
    await page.waitForTimeout(500);

    gameState = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      return {
        currentStep: scene?.currentStep,
        currentCharacter: {
          race: scene?.currentCharacter?.race,
          gender: scene?.currentCharacter?.gender
        }
      };
    });

    console.log('After race selection:', gameState);

    // Select gender
    await page.keyboard.press('Enter'); // Select male
    await page.waitForTimeout(500);

    gameState = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      return {
        currentStep: scene?.currentStep,
        currentCharacter: {
          race: scene?.currentCharacter?.race,
          gender: scene?.currentCharacter?.gender
        }
      };
    });

    console.log('After gender selection:', gameState);

    // Select class
    await page.keyboard.press('Enter'); // Select Fighter
    await page.waitForTimeout(500);

    gameState = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      return {
        currentStep: scene?.currentStep,
        currentCharacter: {
          race: scene?.currentCharacter?.race,
          gender: scene?.currentCharacter?.gender,
          class: scene?.currentCharacter?.class
        }
      };
    });

    console.log('After class selection:', gameState);

    // Select alignment
    await page.keyboard.press('Enter'); // Select Good
    await page.waitForTimeout(500);

    gameState = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      return {
        currentStep: scene?.currentStep,
        currentCharacter: scene?.currentCharacter
      };
    });

    console.log('After alignment selection:', gameState);

    // Confirm creation
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    gameState = await page.evaluate(() => {
      return {
        currentStep: window.game?.sceneManager?.currentScene?.currentStep,
        partySize: window.game?.gameState?.party?.characters?.length || 0,
        firstCharacter: window.game?.gameState?.party?.characters?.[0] ? {
          name: window.game.gameState.party.characters[0].name,
          race: window.game.gameState.party.characters[0].race,
          class: window.game.gameState.party.characters[0].class,
          gender: window.game.gameState.party.characters[0].gender,
          level: window.game.gameState.party.characters[0].level
        } : null
      };
    });

    console.log('After confirmation:', gameState);

    // Verify character was created
    expect(gameState.partySize).toBeGreaterThan(0);
    expect(gameState.firstCharacter).toBeTruthy();
    expect(gameState.firstCharacter?.name).toBe('TestChar');
  });
});