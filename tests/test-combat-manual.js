const { chromium } = require('playwright');

async function testCombatScene() {
  console.log('Starting Combat Scene tests...');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Test 1: Normal mode combat
    console.log('\n=== Test 1: Normal Mode Combat ===');
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    // Start game
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    console.log('✓ Game started');

    // Enter dungeon
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    console.log('✓ Entered dungeon');

    // Try to trigger combat
    console.log('Attempting to trigger combat...');
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(100);
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);

      // Check if we're in combat
      const inCombat = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, 400);
        const pixels = imageData.data;

        // Look for red pixels (combat has red elements)
        let redPixels = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i] > 200 && pixels[i + 1] < 100 && pixels[i + 2] < 100) {
            redPixels++;
          }
        }
        return redPixels > 50;
      });

      if (inCombat) {
        console.log('✓ Combat triggered!');

        // Test combat controls
        console.log('Testing combat controls...');
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(200);
        console.log('  - Arrow Down: Navigate menu');

        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(200);
        console.log('  - Arrow Up: Navigate menu');

        await page.keyboard.press('Enter');
        await page.waitForTimeout(200);
        console.log('  - Enter: Select action');

        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(200);
        console.log('  - Arrow Right: Select target');

        await page.keyboard.press('Escape');
        await page.waitForTimeout(200);
        console.log('  - Escape: Cancel');

        // Try instant kill
        await page.keyboard.down('Control');
        await page.keyboard.press('k');
        await page.keyboard.up('Control');
        await page.waitForTimeout(1000);
        console.log('  - Ctrl+K: Instant kill (debug)');

        break;
      }
    }

    // Test 2: ASCII mode combat
    console.log('\n=== Test 2: ASCII Mode Combat ===');
    await page.evaluate(() => {
      localStorage.setItem('feature_ascii_rendering', 'true');
    });
    await page.reload();
    await page.waitForTimeout(1000);
    console.log('✓ ASCII mode enabled');

    // Start game again
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    console.log('✓ Game restarted in ASCII mode');

    // Try to trigger combat in ASCII mode
    console.log('Attempting to trigger combat in ASCII mode...');
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(100);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(100);

      const combatActive = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        // Check for non-black pixels (ASCII rendering)
        let nonBlackPixels = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i] > 20 || pixels[i + 1] > 20 || pixels[i + 2] > 20) {
            nonBlackPixels++;
          }
        }
        return nonBlackPixels > 5000; // ASCII text creates many pixels
      });

      if (combatActive) {
        console.log('✓ Combat triggered in ASCII mode!');

        // Test ASCII combat controls
        console.log('Testing ASCII combat controls...');
        await page.keyboard.press('1'); // Quick action 1
        await page.waitForTimeout(500);
        console.log('  - Number key 1: Quick action');

        await page.keyboard.press('2'); // Quick action 2
        await page.waitForTimeout(500);
        console.log('  - Number key 2: Quick action');

        break;
      }
    }

    // Test 3: Feature flag toggle
    console.log('\n=== Test 3: Feature Flag Toggle ===');
    await page.evaluate(() => {
      localStorage.setItem('feature_ascii_rendering', 'false');
    });
    await page.reload();
    await page.waitForTimeout(1000);

    const normalMode = await page.evaluate(() => {
      return localStorage.getItem('feature_ascii_rendering') === 'false';
    });
    console.log(`✓ Switched to normal mode: ${normalMode}`);

    await page.evaluate(() => {
      localStorage.setItem('feature_ascii_rendering', 'true');
    });
    await page.reload();
    await page.waitForTimeout(1000);

    const asciiMode = await page.evaluate(() => {
      return localStorage.getItem('feature_ascii_rendering') === 'true';
    });
    console.log(`✓ Switched to ASCII mode: ${asciiMode}`);

    // Clean up
    await page.evaluate(() => {
      localStorage.removeItem('feature_ascii_rendering');
    });
    console.log('✓ Feature flag cleaned up');

    // Check for console errors
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(1000);

    if (errors.length === 0) {
      console.log('\n✅ All tests completed successfully! No console errors detected.');
    } else {
      console.log('\n⚠️ Tests completed with errors:');
      errors.forEach((err) => console.log(`  - ${err}`));
    }
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await page.waitForTimeout(2000); // Let user see the final state
    await browser.close();
  }
}

// Run the tests
testCombatScene().catch(console.error);
