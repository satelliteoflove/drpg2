const { test, expect } = require('@playwright/test');

test.describe('Town ASCII Direct Test', () => {
  test('Town should create ASCII state when flag is enabled', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForSelector('canvas', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Check initial scene
    await page.evaluate(() => {
      const currentScene = window.game?.sceneManager?.currentScene;
      console.log('Initial scene:', currentScene?.name || 'no scene');
    });

    // Enable ASCII FIRST (use lowercase with underscore to match the enum value)
    await page.evaluate(() => {
      console.log('Enabling ascii_rendering flag');
      window.FeatureFlags.enable('ascii_rendering');
      const enabled = window.FeatureFlags.isEnabled('ascii_rendering');
      console.log('ascii_rendering enabled:', enabled);
    });

    // First, let's check if the TownScene was already created
    await page.evaluate(() => {
      const scenes = window.game?.sceneManager?.scenes;
      if (scenes) {
        console.log('Available scenes:', Array.from(scenes.keys()));
        const townScene = scenes.get('town');
        console.log('TownScene exists:', !!townScene);
        if (townScene) {
          console.log('TownScene has townASCIIState (before switch):', !!townScene.townASCIIState);
          console.log('TownScene townASCIIState value:', townScene.townASCIIState);
        }
      }
    });

    // Go directly to Town scene and check immediately
    const switchResult = await page.evaluate(() => {
      console.log('Switching to town scene');
      if (window.game?.sceneManager) {
        window.game.sceneManager.switchTo('town');
        // Force the scene switch to happen NOW
        window.game.sceneManager.update(16); // This will process the switch
        const scene = window.game.sceneManager.currentScene;
        console.log('After update, current scene:', scene?.name);
        console.log('Immediately after switch, townASCIIState:', !!scene?.townASCIIState);
        return {
          sceneName: scene?.name,
          hasTownASCIIState: !!scene?.townASCIIState,
          uniqueId: scene?.__uniqueId,
        };
      }
      return null;
    });

    console.log('Switch result:', switchResult);

    await page.waitForTimeout(500);

    // Check the scene state
    const result = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      console.log('Scene type:', scene?.constructor?.name);
      console.log('Scene uniqueId:', scene?.__uniqueId);
      console.log('Scene has townASCIIState property:', 'townASCIIState' in scene);
      console.log('Scene properties:', Object.keys(scene));

      // Also check the actual TownScene from the scenes map
      const townSceneFromMap = window.game?.sceneManager?.scenes?.get('town');

      console.log(
        'Current scene from manager:',
        scene?.name,
        'townASCIIState:',
        !!scene?.townASCIIState
      );
      console.log('Current scene townASCIIState value:', scene?.townASCIIState);
      console.log(
        'Town scene from map:',
        townSceneFromMap?.name,
        'townASCIIState:',
        !!townSceneFromMap?.townASCIIState
      );
      console.log('Town scene from map townASCIIState value:', townSceneFromMap?.townASCIIState);
      console.log('Are they the same object?', scene === townSceneFromMap);

      // Log for debugging
      const info = {
        sceneName: scene?.name,
        asciiEnabled: window.FeatureFlags?.isEnabled('ascii_rendering'),
        hasASCIIStateBeforeRender: !!scene?.townASCIIState,
        renderCount: scene?.renderCount || 0,
      };

      console.log('Before render:', {
        sceneName: scene?.name,
        townASCIIState: scene?.townASCIIState,
        renderCount: scene?.renderCount,
      });

      // Manually trigger render
      if (scene && window.game?.canvas) {
        const ctx = window.game.canvas.getContext('2d');
        if (ctx) {
          console.log('Calling scene.render()...');
          scene.render(ctx);
          console.log('After scene.render():', {
            townASCIIState: scene?.townASCIIState,
            renderCount: scene?.renderCount,
          });
        }
      }

      info.hasASCIIStateAfterRender = !!scene?.townASCIIState;

      // Check if grid has content
      if (scene?.townASCIIState) {
        try {
          const asciiStateObj = scene.townASCIIState.getGrid();
          info.gridExists = !!asciiStateObj;
          info.gridHasContent = false;

          // Debug the structure
          console.log('asciiStateObj type:', typeof asciiStateObj);
          console.log('asciiStateObj keys:', Object.keys(asciiStateObj || {}));

          // The asciiStateObj IS an ASCIIState, we need to call getGrid() to get the ASCIIGrid
          const gridObj = asciiStateObj?.getGrid ? asciiStateObj.getGrid() : asciiStateObj;
          const gridData = gridObj?.cells;

          if (gridData) {
            console.log('Grid data found, type:', typeof gridData);
            console.log('Grid is array:', Array.isArray(gridData));
            console.log('Grid first row:', gridData[0]);
            console.log('Grid cell (0,0):', gridData[0]?.[0]);

            // Check more of the grid to find content
            for (let y = 0; y < Math.min(30, asciiStateObj.height || 30); y++) {
              for (let x = 0; x < Math.min(80, asciiStateObj.width || 80); x++) {
                const cell = gridData[y]?.[x];
                if (cell && cell !== ' ' && cell !== undefined) {
                  info.gridHasContent = true;
                  info.sampleChar = cell;
                  info.sampleLocation = { x, y };
                  console.log(`Found content at (${x},${y}): '${cell}'`);
                  break;
                }
              }
              if (info.gridHasContent) break;
            }
          }
        } catch (e) {
          info.error = e.message;
        }
      }

      return info;
    });

    console.log('Town scene result:', result);

    // Assertions
    expect(result.sceneName).toBe('Town');
    expect(result.asciiEnabled).toBe(true);
    expect(result.hasASCIIStateAfterRender).toBe(true);
    expect(result.gridExists).toBe(true);
    expect(result.gridHasContent).toBe(true);
  });
});
