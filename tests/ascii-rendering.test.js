const { chromium } = require('playwright');

async function testASCIIRendering() {
  console.log('Starting ASCII rendering tests...');
  
  const browser = await chromium.launch({ 
    headless: true,  // Set to false to see the browser
    devtools: false 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Browser error:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    console.error('Page error:', error.message);
  });
  
  try {
    console.log('1. Navigating to game...');
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(2000);  // Wait for game to initialize
    
    console.log('2. Testing feature flag availability...');
    const featureFlagsAvailable = await page.evaluate(() => {
      return typeof window.FeatureFlags !== 'undefined';
    });
    console.log(`   FeatureFlags available: ${featureFlagsAvailable}`);
    
    console.log('3. Testing ASCIIDebugger availability...');
    const debuggerAvailable = await page.evaluate(() => {
      return typeof window.ASCIIDebugger !== 'undefined';
    });
    console.log(`   ASCIIDebugger available: ${debuggerAvailable}`);
    
    console.log('4. Enabling ASCII rendering for TownScene...');
    await page.evaluate(() => {
      if (window.FeatureFlags) {
        window.FeatureFlags.enable('ascii_town_scene');
      }
    });
    
    console.log('5. Checking if ASCII is enabled...');
    const asciiEnabled = await page.evaluate(() => {
      return window.FeatureFlags ? window.FeatureFlags.isEnabled('ascii_town_scene') : false;
    });
    console.log(`   ASCII enabled: ${asciiEnabled}`);
    
    console.log('6. Navigating to Town scene...');
    // Press 'T' to go to town
    await page.keyboard.press('t');
    await page.waitForTimeout(1000);
    
    console.log('7. Checking for ASCII grid in localStorage...');
    const hasASCIIData = await page.evaluate(() => {
      const latestKey = localStorage.getItem('ascii-debug-latest');
      if (latestKey) {
        const data = localStorage.getItem(latestKey);
        return data !== null;
      }
      return false;
    });
    console.log(`   ASCII data in localStorage: ${hasASCIIData}`);
    
    if (hasASCIIData) {
      console.log('8. Retrieving ASCII grid data...');
      const gridData = await page.evaluate(() => {
        const latestKey = localStorage.getItem('ascii-debug-latest');
        if (latestKey) {
          const data = JSON.parse(localStorage.getItem(latestKey) || '{}');
          return {
            scene: data.scene,
            frame: data.frame,
            width: data.width,
            height: data.height,
            nonEmptyCount: data.nonEmptyCount,
            hasGrid: !!data.grid
          };
        }
        return null;
      });
      
      if (gridData) {
        console.log('   Grid Data:');
        console.log(`   - Scene: ${gridData.scene}`);
        console.log(`   - Frame: ${gridData.frame}`);
        console.log(`   - Size: ${gridData.width}x${gridData.height}`);
        console.log(`   - Non-empty cells: ${gridData.nonEmptyCount}`);
        console.log(`   - Has grid content: ${gridData.hasGrid}`);
      }
    }
    
    console.log('9. Checking for rendering errors...');
    const errors = await page.evaluate(() => {
      // Check if there are any recent errors in console
      return new Promise(resolve => {
        const originalError = console.error;
        let errorCount = 0;
        console.error = function(...args) {
          errorCount++;
          originalError.apply(console, args);
        };
        setTimeout(() => {
          console.error = originalError;
          resolve(errorCount);
        }, 1000);
      });
    });
    console.log(`   Errors detected: ${errors}`);
    
    console.log('10. Taking screenshot...');
    await page.screenshot({ path: 'ascii-rendering-test.png' });
    console.log('    Screenshot saved as ascii-rendering-test.png');
    
    console.log('\n=== Test Summary ===');
    console.log(`FeatureFlags: ${featureFlagsAvailable ? '✓' : '✗'}`);
    console.log(`ASCIIDebugger: ${debuggerAvailable ? '✓' : '✗'}`);
    console.log(`ASCII Enabled: ${asciiEnabled ? '✓' : '✗'}`);
    console.log(`Grid Data: ${hasASCIIData ? '✓' : '✗'}`);
    console.log(`No Errors: ${errors === 0 ? '✓' : '✗ (' + errors + ' errors)'}`);
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
    console.log('\nTest completed.');
  }
}

// Run the test
testASCIIRendering().catch(console.error);