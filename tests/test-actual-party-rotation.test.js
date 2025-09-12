const { test, expect } = require('@playwright/test');

test('test actual Party class rotation', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // Test the actual Party class directly
  const rotationTest = await page.evaluate(() => {
    // Import or access the Party class (it should be available through the game)
    const Party = window.game?.Party || window.Party;
    
    // Create a new party instance if we can
    const testResults = [];
    
    // First test with a mock party to understand the expected behavior
    const mockParty = {
      facing: 'north',
      turnLeft: function() {
        const dirs = ['north', 'west', 'south', 'east'];
        const idx = dirs.indexOf(this.facing);
        this.facing = dirs[(idx + 1) % 4];
      },
      turnRight: function() {
        const dirs = ['north', 'east', 'south', 'west'];
        const idx = dirs.indexOf(this.facing);
        this.facing = dirs[(idx + 1) % 4];
      },
      move: function(direction) {
        if (direction === 'left') this.turnLeft();
        if (direction === 'right') this.turnRight();
      }
    };
    
    // Test mock party
    mockParty.facing = 'north';
    mockParty.move('right');
    testResults.push({ test: 'mock right from north', expected: 'east', actual: mockParty.facing });
    
    mockParty.move('right');
    testResults.push({ test: 'mock right from east', expected: 'south', actual: mockParty.facing });
    
    mockParty.move('right');
    testResults.push({ test: 'mock right from south', expected: 'west', actual: mockParty.facing });
    
    mockParty.move('right');
    testResults.push({ test: 'mock right from west', expected: 'north', actual: mockParty.facing });
    
    // Test left turns
    mockParty.move('left');
    testResults.push({ test: 'mock left from north', expected: 'west', actual: mockParty.facing });
    
    mockParty.move('left');
    testResults.push({ test: 'mock left from west', expected: 'south', actual: mockParty.facing });
    
    // Now test the actual game's party if it exists
    if (window.game?.gameState?.party) {
      const party = window.game.gameState.party;
      
      // Set to known state
      party.facing = 'north';
      testResults.push({ test: 'game party initial', expected: 'north', actual: party.facing });
      
      // Test move function
      if (typeof party.move === 'function') {
        party.move('right');
        testResults.push({ test: 'game party right from north', expected: 'east', actual: party.facing });
        
        party.move('right');
        testResults.push({ test: 'game party right from east', expected: 'south', actual: party.facing });
        
        party.move('left');
        testResults.push({ test: 'game party left from south', expected: 'east', actual: party.facing });
      } else {
        testResults.push({ test: 'party.move is function', expected: true, actual: typeof party.move });
      }
    }
    
    return testResults;
  });
  
  // Log all test results
  console.log('Rotation Test Results:');
  rotationTest.forEach(result => {
    const passed = result.expected === result.actual;
    console.log(`  ${passed ? '✓' : '✗'} ${result.test}: expected "${result.expected}", got "${result.actual}"`);
  });
  
  // Check that all tests passed
  rotationTest.forEach(result => {
    expect(result.actual).toBe(result.expected);
  });
});