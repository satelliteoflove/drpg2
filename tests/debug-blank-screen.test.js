const { test, expect } = require('@playwright/test');

test.describe('Debug Blank Screen Issue', () => {
  test('should diagnose and fix the blank screen problem', async ({ page }) => {
    // Enable console logging to see any errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console Error:', msg.text());
      }
    });

    page.on('pageerror', err => {
      console.log('Page Error:', err.message);
    });

    // Navigate to the game
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');

    // Take a screenshot of initial state
    await page.screenshot({ path: 'tests/screenshots/initial-blank.png' });
    console.log('Screenshot saved: initial-blank.png');

    // Check if the page loaded at all
    const title = await page.title();
    console.log('Page title:', title);

    // Check if canvas exists
    const canvasExists = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return {
        exists: !!canvas,
        id: canvas?.id,
        width: canvas?.width,
        height: canvas?.height,
        display: canvas ? window.getComputedStyle(canvas).display : null
      };
    });
    console.log('Canvas info:', canvasExists);

    // Check if the game object exists
    const gameInfo = await page.evaluate(() => {
      return {
        hasWindow: typeof window !== 'undefined',
        hasGame: typeof window.game !== 'undefined',
        gameKeys: window.game ? Object.keys(window.game) : [],
        hasSceneManager: !!window.game?.sceneManager,
        currentScene: window.game?.sceneManager?.currentScene?.constructor?.name,
        isRunning: window.game?.isRunning,
        isPaused: window.game?.isPaused
      };
    });
    console.log('Game info:', gameInfo);

    // Check if there are any rendering errors
    const renderingInfo = await page.evaluate(() => {
      if (!window.game) return { error: 'No game object' };

      const canvas = document.querySelector('canvas');
      if (!canvas) return { error: 'No canvas element' };

      const ctx = canvas.getContext('2d');
      if (!ctx) return { error: 'No 2D context' };

      // Try to draw something directly
      ctx.fillStyle = 'red';
      ctx.fillRect(10, 10, 50, 50);

      return {
        canvasFound: true,
        contextFound: true,
        testDrawn: true,
        canvasVisible: canvas.style.display !== 'none',
        canvasOpacity: window.getComputedStyle(canvas).opacity,
        backgroundColor: window.getComputedStyle(document.body).backgroundColor
      };
    });
    console.log('Rendering info:', renderingInfo);

    // Try to manually start the game if it's not running
    const startResult = await page.evaluate(() => {
      if (window.game && !window.game.isRunning) {
        try {
          window.game.start?.();
          return { started: true };
        } catch (e) {
          return { error: e.message };
        }
      }
      return { alreadyRunning: window.game?.isRunning };
    });
    console.log('Start result:', startResult);

    await page.waitForTimeout(1000);

    // Check scene manager state
    const sceneState = await page.evaluate(() => {
      const sm = window.game?.sceneManager;
      if (!sm) return { error: 'No scene manager' };

      return {
        currentScene: sm.currentScene?.constructor?.name,
        sceneStack: sm.sceneStack?.map(s => s.constructor.name),
        hasMainMenu: !!sm.scenes?.main_menu,
        availableScenes: sm.scenes ? Object.keys(sm.scenes) : []
      };
    });
    console.log('Scene state:', sceneState);

    // Try to render the current scene manually
    const renderTest = await page.evaluate(() => {
      const game = window.game;
      if (!game) return { error: 'No game' };

      const canvas = document.querySelector('canvas');
      const ctx = canvas?.getContext('2d');
      if (!ctx) return { error: 'No context' };

      // Clear and fill with a color to test
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Try to render text
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.fillText('Testing render...', 100, 100);

      // Try to call the scene's render method
      const scene = game.sceneManager?.currentScene;
      if (scene?.render) {
        try {
          scene.render(ctx);
          return { rendered: true, sceneName: scene.constructor.name };
        } catch (e) {
          return { renderError: e.message };
        }
      }

      return { noSceneRender: true };
    });
    console.log('Render test:', renderTest);

    await page.screenshot({ path: 'tests/screenshots/after-render-test.png' });

    // Try pressing Enter to see if we can interact
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    const afterEnter = await page.evaluate(() => {
      return {
        currentScene: window.game?.sceneManager?.currentScene?.constructor?.name,
        gameState: window.game?.gameState ? {
          hasParty: !!window.game.gameState.party,
          partySize: window.game.gameState.party?.characters?.length || 0
        } : null
      };
    });
    console.log('After pressing Enter:', afterEnter);

    await page.screenshot({ path: 'tests/screenshots/after-enter.png' });

    // Verify we can see something
    const pixelData = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;

      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, 100);

      // Check if any pixels are non-black
      let nonBlackPixels = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        if (r > 0 || g > 0 || b > 0) {
          nonBlackPixels++;
        }
      }

      return {
        width: canvas.width,
        height: canvas.height,
        nonBlackPixels,
        percentNonBlack: (nonBlackPixels / (canvas.width * 100)) * 100
      };
    });
    console.log('Pixel analysis:', pixelData);

    // Assertions
    expect(canvasExists.exists).toBe(true);
    expect(gameInfo.hasGame).toBe(true);
    expect(gameInfo.hasSceneManager).toBe(true);
  });

  test('should complete full game flow from menu to dungeon', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Step 1: Main Menu
    console.log('Step 1: Checking Main Menu');
    let state = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      return {
        sceneName: scene?.constructor?.name,
        sceneTitle: scene?.name
      };
    });
    console.log('Initial scene:', state);

    // Take screenshot of main menu
    await page.screenshot({ path: 'tests/screenshots/01-main-menu.png' });

    // Press Enter to select "New Game"
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Step 2: New Game Menu
    console.log('Step 2: New Game Menu');
    state = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      return {
        sceneName: scene?.constructor?.name,
        menuOptions: scene?.menuOptions,
        selectedOption: scene?.selectedOption
      };
    });
    console.log('New Game scene:', state);

    await page.screenshot({ path: 'tests/screenshots/02-new-game-menu.png' });

    // Make sure we select "Manual Character Creation" (first option is selected by default)
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Step 3: Character Creation
    console.log('Step 3: Character Creation');
    state = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      return {
        sceneName: scene?.constructor?.name,
        currentStep: scene?.currentStep,
        races: scene?.races?.length,
        classes: scene?.classes?.length
      };
    });
    console.log('Character Creation scene:', state);

    await page.screenshot({ path: 'tests/screenshots/03-character-creation-name.png' });

    // Create a character
    await page.keyboard.type('HeroOne');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    await page.screenshot({ path: 'tests/screenshots/04-character-creation-race.png' });

    // Select race (Human - default)
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    await page.screenshot({ path: 'tests/screenshots/05-character-creation-gender.png' });

    // Select gender (Male - default)
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    await page.screenshot({ path: 'tests/screenshots/06-character-creation-class.png' });

    // Select class (Fighter - default)
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    await page.screenshot({ path: 'tests/screenshots/07-character-creation-alignment.png' });

    // Select alignment (Good - default)
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    await page.screenshot({ path: 'tests/screenshots/08-character-creation-confirm.png' });

    // Confirm character
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Step 4: Party Menu
    console.log('Step 4: Party Menu');
    state = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      const party = window.game?.gameState?.party;
      return {
        sceneName: scene?.constructor?.name,
        currentStep: scene?.currentStep,
        partySize: party?.characters?.length || 0,
        firstCharacter: party?.characters?.[0]?.name
      };
    });
    console.log('Party state:', state);

    await page.screenshot({ path: 'tests/screenshots/09-party-menu.png' });

    // Select "Start Adventure" (need to press down arrow)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Step 5: Should be in Town or Dungeon
    console.log('Step 5: In Game');
    state = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      return {
        sceneName: scene?.constructor?.name,
        sceneTitle: scene?.name
      };
    });
    console.log('Game scene:', state);

    await page.screenshot({ path: 'tests/screenshots/10-in-game.png' });

    // Final verification
    const finalState = await page.evaluate(() => {
      return {
        currentScene: window.game?.sceneManager?.currentScene?.constructor?.name,
        partySize: window.game?.gameState?.party?.characters?.length || 0,
        currentFloor: window.game?.gameState?.party?.floor,
        dungeonExists: !!window.game?.gameState?.dungeon
      };
    });

    console.log('Final state:', finalState);

    // Assertions
    expect(finalState.partySize).toBeGreaterThan(0);
    expect(finalState.currentScene).toBeTruthy();
    expect(['DungeonScene', 'TownScene']).toContain(finalState.currentScene);
  });
});