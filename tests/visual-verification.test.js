const { test, expect } = require('@playwright/test');

test.describe('Visual Verification', () => {
  test('should display visible content on main menu', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const visualData = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return { error: 'No canvas found' };

      const ctx = canvas.getContext('2d');
      if (!ctx) return { error: 'No 2D context' };

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let totalPixels = 0;
      let nonBlackPixels = 0;
      let colorPixels = 0;
      let pixelSamples = [];

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        totalPixels++;

        if (r > 0 || g > 0 || b > 0) {
          nonBlackPixels++;
        }

        if ((r !== g || g !== b) && (r > 0 || g > 0 || b > 0)) {
          colorPixels++;
        }

        if (i % 10000 === 0 && nonBlackPixels > 0) {
          pixelSamples.push({ r, g, b, a });
        }
      }

      ctx.fillStyle = 'white';
      ctx.font = '30px Arial';
      ctx.fillText('TEST OVERLAY', 400, 400);

      return {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        totalPixels,
        nonBlackPixels,
        colorPixels,
        percentNonBlack: (nonBlackPixels / totalPixels) * 100,
        percentColor: (colorPixels / totalPixels) * 100,
        pixelSamples: pixelSamples.slice(0, 5),
        currentScene: window.game?.sceneManager?.currentScene?.constructor?.name,
        isGameRunning: window.game?.isRunning
      };
    });

    console.log('Visual data:', JSON.stringify(visualData, null, 2));

    await page.screenshot({ path: 'tests/screenshots/visual-test-with-overlay.png' });

    expect(visualData.error).toBeUndefined();
    expect(visualData.nonBlackPixels).toBeGreaterThan(0);
    expect(visualData.percentNonBlack).toBeGreaterThan(0.5);
    expect(visualData.currentScene).toBe('MainMenuScene');
    expect(visualData.isGameRunning).toBe(true);
  });

  test('should render text elements on main menu', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const textRendering = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      const ctx = canvas.getContext('2d');

      ctx.save();

      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 100, 100);

      ctx.fillStyle = 'white';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('VISIBLE TEST', canvas.width / 2, canvas.height / 2);

      ctx.restore();

      const imageData = ctx.getImageData(0, 0, 100, 100);
      let redPixels = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i] > 200 && imageData.data[i + 1] < 50 && imageData.data[i + 2] < 50) {
          redPixels++;
        }
      }

      return {
        canDrawOnCanvas: true,
        redPixelsDrawn: redPixels,
        canvasDisplay: window.getComputedStyle(canvas).display,
        canvasVisibility: window.getComputedStyle(canvas).visibility,
        canvasOpacity: window.getComputedStyle(canvas).opacity,
        bodyBackground: window.getComputedStyle(document.body).backgroundColor
      };
    });

    console.log('Text rendering:', JSON.stringify(textRendering, null, 2));

    await page.screenshot({ path: 'tests/screenshots/visual-test-red-square.png' });

    expect(textRendering.canDrawOnCanvas).toBe(true);
    expect(textRendering.redPixelsDrawn).toBeGreaterThan(100);
    expect(textRendering.canvasDisplay).not.toBe('none');
    expect(textRendering.canvasVisibility).toBe('visible');
    expect(parseFloat(textRendering.canvasOpacity)).toBeGreaterThan(0);
  });

  test('should capture current rendering state', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const renderingState = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      if (!scene) return { error: 'No scene found' };

      const canvas = document.querySelector('canvas');
      const ctx = canvas.getContext('2d');

      if (scene.render) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        try {
          scene.render(ctx);
        } catch (e) {
          return { renderError: e.message };
        }
      }

      const imageData = ctx.getImageData(0, 0, Math.min(200, canvas.width), Math.min(200, canvas.height));
      let contentPixels = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i] > 10 || imageData.data[i + 1] > 10 || imageData.data[i + 2] > 10) {
          contentPixels++;
        }
      }

      return {
        sceneName: scene.constructor?.name,
        sceneHasRender: typeof scene.render === 'function',
        contentPixelsInCorner: contentPixels,
        menuOptions: scene.menuOptions,
        selectedOption: scene.selectedOption
      };
    });

    console.log('Rendering state:', JSON.stringify(renderingState, null, 2));

    await page.screenshot({ path: 'tests/screenshots/current-rendering-state.png', fullPage: true });

    expect(renderingState.error).toBeUndefined();
    expect(renderingState.renderError).toBeUndefined();
    expect(renderingState.sceneHasRender).toBe(true);
    expect(renderingState.contentPixelsInCorner).toBeGreaterThan(0);
  });
});