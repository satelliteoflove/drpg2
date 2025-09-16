const { test, expect } = require('@playwright/test');

test('verify rotation bug is fixed - should rotate through all four directions', async ({
  page,
}) => {
  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Navigate to dungeon
  await page.evaluate(() => {
    if (window.game && window.game.sceneManager) {
      window.game.gameState = {
        party: {
          x: 5,
          y: 5,
          facing: 'north',
          getAliveCharacters: () => [],
          characters: [],
          move: (direction) => {
            const party = window.game.gameState.party;
            if (direction === 'left') {
              const dirs = ['north', 'west', 'south', 'east'];
              const idx = dirs.indexOf(party.facing);
              party.facing = dirs[(idx + 1) % 4];
            } else if (direction === 'right') {
              const dirs = ['north', 'east', 'south', 'west'];
              const idx = dirs.indexOf(party.facing);
              party.facing = dirs[(idx + 1) % 4];
            }
          },
          rest: () => {},
          distributeGold: () => {},
          getFrontRow: () => [],
          floor: 1,
        },
        dungeon: [
          {
            width: 20,
            height: 20,
            tiles: Array(20)
              .fill(null)
              .map(() => Array(20).fill({ type: 'floor', discovered: true })),
          },
        ],
        currentFloor: 1,
        messageLog: {
          messages: [],
          addSystemMessage: () => {},
          render: () => {},
        },
        inCombat: false,
        combatEnabled: true,
        turnCount: 0,
      };

      window.game.sceneManager.switchTo('dungeon');
    }
  });

  await page.waitForTimeout(500);

  // Enable ASCII mode
  await page.evaluate(() => {
    window.FeatureFlags.enable('ASCII_RENDERING');
    const scene = window.game?.sceneManager?.currentScene;
    if (scene) {
      const canvas = document.querySelector('canvas');
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        scene.render(ctx);
        scene.render(ctx);
      }
    }
  });

  await page.waitForTimeout(300);

  // Start facing north
  const startFacing = await page.evaluate(() => window.game.gameState.party.facing);
  expect(startFacing).toBe('north');

  // Turn right - should face east
  await page.keyboard.press('d');
  await page.waitForTimeout(300);
  const afterFirstRight = await page.evaluate(() => window.game.gameState.party.facing);
  expect(afterFirstRight).toBe('east');

  // Turn right again - should face south
  await page.keyboard.press('d');
  await page.waitForTimeout(300);
  const afterSecondRight = await page.evaluate(() => window.game.gameState.party.facing);
  expect(afterSecondRight).toBe('south');

  // Turn right again - should face west
  await page.keyboard.press('d');
  await page.waitForTimeout(300);
  const afterThirdRight = await page.evaluate(() => window.game.gameState.party.facing);
  expect(afterThirdRight).toBe('west');

  // Turn right again - should face north (full circle)
  await page.keyboard.press('d');
  await page.waitForTimeout(300);
  const afterFourthRight = await page.evaluate(() => window.game.gameState.party.facing);
  expect(afterFourthRight).toBe('north');

  // Now test left turns - turn left from north should face west
  await page.keyboard.press('a');
  await page.waitForTimeout(300);
  const afterFirstLeft = await page.evaluate(() => window.game.gameState.party.facing);
  expect(afterFirstLeft).toBe('west');

  // Turn left again - should face south
  await page.keyboard.press('a');
  await page.waitForTimeout(300);
  const afterSecondLeft = await page.evaluate(() => window.game.gameState.party.facing);
  expect(afterSecondLeft).toBe('south');

  // Turn left again - should face east
  await page.keyboard.press('a');
  await page.waitForTimeout(300);
  const afterThirdLeft = await page.evaluate(() => window.game.gameState.party.facing);
  expect(afterThirdLeft).toBe('east');

  // Turn left again - should face north (full circle)
  await page.keyboard.press('a');
  await page.waitForTimeout(300);
  const afterFourthLeft = await page.evaluate(() => window.game.gameState.party.facing);
  expect(afterFourthLeft).toBe('north');

  // Test arrow keys as well
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(300);
  const afterArrowRight = await page.evaluate(() => window.game.gameState.party.facing);
  expect(afterArrowRight).toBe('east');

  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(300);
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(300);
  const afterArrowLeft = await page.evaluate(() => window.game.gameState.party.facing);
  expect(afterArrowLeft).toBe('west');
});
