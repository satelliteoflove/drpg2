const { test, expect } = require('@playwright/test');

test.describe('Debug App Loading', () => {
  test('should check console errors and app initialization', async ({ page }) => {
    const consoleMessages = [];
    const consoleErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else {
        consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
      }
    });

    page.on('pageerror', error => {
      consoleErrors.push(`Page error: ${error.message}`);
    });

    await page.goto('http://localhost:8080');
    await page.waitForTimeout(2000);

    console.log('=== Console Errors ===');
    consoleErrors.forEach(err => console.log(err));

    console.log('\n=== Console Messages ===');
    consoleMessages.slice(0, 10).forEach(msg => console.log(msg));

    const appState = await page.evaluate(() => {
      return {
        hasCanvas: document.querySelector('canvas') !== null,
        hasGameServices: typeof window.gameServices !== 'undefined',
        hasGame: typeof window.game !== 'undefined',
        bodyContent: document.body.innerText.substring(0, 200),
        buttonCount: document.querySelectorAll('button').length,
        buttons: Array.from(document.querySelectorAll('button')).map(b => b.innerText),
        scripts: Array.from(document.querySelectorAll('script')).map(s => s.src || 'inline'),
        errors: window.errors || []
      };
    });

    console.log('\n=== App State ===');
    console.log('Has Canvas:', appState.hasCanvas);
    console.log('Has GameServices:', appState.hasGameServices);
    console.log('Has Game:', appState.hasGame);
    console.log('Button Count:', appState.buttonCount);
    console.log('Buttons:', appState.buttons);
    console.log('Body Content Preview:', appState.bodyContent);
    console.log('Scripts loaded:', appState.scripts);

    // Check if webpack-dev-server error overlay is showing
    const errorOverlay = await page.evaluate(() => {
      const overlay = document.querySelector('iframe[id="webpack-dev-server-client-overlay"]');
      if (overlay) {
        try {
          const overlayDoc = overlay.contentDocument || overlay.contentWindow.document;
          return overlayDoc.body.innerText;
        } catch (e) {
          return 'Error overlay present but cannot read content';
        }
      }
      return null;
    });

    if (errorOverlay) {
      console.log('\n=== Webpack Error Overlay ===');
      console.log(errorOverlay);
    }

    expect(consoleErrors.length).toBe(0);
  });
});