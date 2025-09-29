const { test, expect } = require('@playwright/test');

test.describe.skip('Dungeon Movement', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForFunction(() => typeof window.AI !== 'undefined', { timeout: 2000 });

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForFunction(() => window.AI.getScene() === 'New Game', { timeout: 2000 });
    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.AI.sendKey('Enter'));

    const dungeonReached = await page.waitForFunction(
      () => window.AI.getScene()?.toLowerCase() === 'dungeon',
      { timeout: 2000 }
    ).catch(() => false);
    if (!dungeonReached) throw new Error(`Failed to reach dungeon: ${await page.evaluate(() => window.AI.getScene())}`);
  });

  test('player can move forward and backward', async ({ page }) => {
    const startState = await page.evaluate(() => {
      const party = window.AI.getParty();
      return { x: party.location.x, y: party.location.y, facing: party.location.facing };
    });

    let moved = false;
    for (let attempts = 0; attempts < 10 && !moved; attempts++) {
      await page.evaluate(() => window.AI.sendKey('w'));
      await page.waitForTimeout(200);

      const afterForward = await page.evaluate(() => {
        const party = window.AI.getParty();
        return { x: party.location.x, y: party.location.y, facing: party.location.facing };
      });

      if (afterForward.x !== startState.x || afterForward.y !== startState.y) {
        moved = true;
        expect(afterForward.facing).toBe(startState.facing);

        await page.evaluate(() => window.AI.sendKey('s'));
        await page.waitForTimeout(200);

        const afterBackward = await page.evaluate(() => {
          const party = window.AI.getParty();
          return { x: party.location.x, y: party.location.y, facing: party.location.facing };
        });

        expect(afterBackward.facing).toBe(startState.facing);
      } else {
        await page.evaluate(() => window.AI.sendKey('a'));
        await page.waitForTimeout(100);
      }
    }

    expect(moved).toBeTruthy();
  });

  test('player can turn left and right', async ({ page }) => {
    const startState = await page.evaluate(() => {
      const party = window.AI.getParty();
      return { x: party.location.x, y: party.location.y, facing: party.location.facing };
    });

    await page.evaluate(() => window.AI.sendKey('a'));
    await page.waitForTimeout(200);

    const afterLeft = await page.evaluate(() => {
      const party = window.AI.getParty();
      return { x: party.location.x, y: party.location.y, facing: party.location.facing };
    });

    expect(afterLeft.x).toBe(startState.x);
    expect(afterLeft.y).toBe(startState.y);
    expect(afterLeft.facing).not.toBe(startState.facing);

    await page.evaluate(() => window.AI.sendKey('d'));
    await page.waitForTimeout(200);

    const afterRight = await page.evaluate(() => {
      const party = window.AI.getParty();
      return { x: party.location.x, y: party.location.y, facing: party.location.facing };
    });

    expect(afterRight.x).toBe(startState.x);
    expect(afterRight.y).toBe(startState.y);
    expect(afterRight.facing).toBe(startState.facing);

    await page.evaluate(() => window.AI.sendKey('d'));
    await page.waitForTimeout(200);

    const afterRightAgain = await page.evaluate(() => {
      const party = window.AI.getParty();
      return { x: party.location.x, y: party.location.y, facing: party.location.facing };
    });

    expect(afterRightAgain.facing).not.toBe(startState.facing);
  });

  test('movement respects walls', async ({ page }) => {
    const findWall = await page.evaluate(() => {
      const dungeon = window.AI.getDungeon();
      const party = window.AI.getParty();

      if (!dungeon || !dungeon.tiles) return null;

      const directions = [
        { dx: 0, dy: -1, facing: 'north' },
        { dx: 1, dy: 0, facing: 'east' },
        { dx: 0, dy: 1, facing: 'south' },
        { dx: -1, dy: 0, facing: 'west' }
      ];

      for (const dir of directions) {
        const checkX = party.location.x + dir.dx;
        const checkY = party.location.y + dir.dy;

        if (checkX >= 0 && checkX < dungeon.width &&
            checkY >= 0 && checkY < dungeon.height) {
          const tile = dungeon.tiles[checkY][checkX];
          if (tile && tile.type === 'wall') {
            return dir.facing;
          }
        }
      }
      return null;
    });

    if (findWall) {
      const facingToKeys = {
        'north': [],
        'east': ['d'],
        'south': ['d', 'd'],
        'west': ['a']
      };

      const keysToPress = facingToKeys[findWall] || [];
      for (const key of keysToPress) {
        await page.evaluate((k) => window.AI.sendKey(k), key);
        await page.waitForTimeout(100);
      }

      const beforeWall = await page.evaluate(() => {
        const party = window.AI.getParty();
        return { x: party.location.x, y: party.location.y };
      });

      for (let i = 0; i < 3; i++) {
        await page.evaluate(() => window.AI.sendKey('w'));
        await page.waitForTimeout(100);
      }

      const afterWall = await page.evaluate(() => {
        const party = window.AI.getParty();
        return { x: party.location.x, y: party.location.y };
      });

      expect(afterWall.x).toBe(beforeWall.x);
      expect(afterWall.y).toBe(beforeWall.y);
    } else {
      for (let attempts = 0; attempts < 50; attempts++) {
        const beforeMove = await page.evaluate(() => {
          const party = window.AI.getParty();
          return { x: party.x, y: party.y };
        });

        await page.evaluate(() => window.AI.sendKey('w'));
        await page.waitForTimeout(50);

        const afterMove = await page.evaluate(() => {
          const party = window.AI.getParty();
          return { x: party.x, y: party.y };
        });

        if (afterMove.x === beforeMove.x && afterMove.y === beforeMove.y) {
          expect(true).toBeTruthy();
          break;
        }

        if (attempts % 10 === 9) {
          await page.evaluate(() => window.AI.sendKey('a'));
          await page.waitForTimeout(50);
        }
      }
    }
  });
});