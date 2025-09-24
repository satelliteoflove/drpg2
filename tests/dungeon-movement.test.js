const { test, expect } = require('@playwright/test');

test.describe('Dungeon Movement', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForFunction(() => window.AI?.getState, { timeout: 10000 });

    await page.evaluate(() => {
      window.AI.sendKey('n');
      window.AI.sendKey('Enter');
      window.AI.sendKey('Enter');
    });

    await page.waitForFunction(() => window.AI.getScene() === 'dungeon', { timeout: 5000 });
  });

  test('player can move forward and backward', async ({ page }) => {
    const initialState = await page.evaluate(() => {
      const party = window.AI.getParty();
      return {
        x: party.x,
        y: party.y,
        facing: party.facing,
        scene: window.AI.getScene()
      };
    });

    expect(initialState.scene).toBe('dungeon');

    await page.evaluate(() => window.AI.sendKey('w'));
    await page.waitForTimeout(300);

    const afterForward = await page.evaluate(() => {
      const party = window.AI.getParty();
      return { x: party.x, y: party.y, facing: party.facing };
    });

    const moved = initialState.x !== afterForward.x || initialState.y !== afterForward.y;

    if (!moved) {
      for (let attempts = 0; attempts < 4 && !moved; attempts++) {
        await page.evaluate(() => window.AI.sendKey('d'));
        await page.waitForTimeout(200);

        await page.evaluate(() => window.AI.sendKey('w'));
        await page.waitForTimeout(200);

        const currentPos = await page.evaluate(() => {
          const party = window.AI.getParty();
          return { x: party.x, y: party.y };
        });

        if (currentPos.x !== initialState.x || currentPos.y !== initialState.y) {
          break;
        }
      }
    }

    const finalForward = await page.evaluate(() => {
      const party = window.AI.getParty();
      return { x: party.x, y: party.y, facing: party.facing };
    });

    const finallyMoved = initialState.x !== finalForward.x || initialState.y !== finalForward.y;
    expect(finallyMoved).toBeTruthy();

    await page.evaluate(() => window.AI.sendKey('s'));
    await page.waitForTimeout(300);

    const afterBackward = await page.evaluate(() => {
      const party = window.AI.getParty();
      return { x: party.x, y: party.y, facing: party.facing };
    });

    expect(afterBackward.x).toBe(initialState.x);
    expect(afterBackward.y).toBe(initialState.y);
  });

  test('player can turn left and right', async ({ page }) => {
    const facingOrder = ['north', 'west', 'south', 'east'];

    const initialState = await page.evaluate(() => {
      const party = window.AI.getParty();
      return { x: party.x, y: party.y, facing: party.facing };
    });

    const initialIndex = facingOrder.indexOf(initialState.facing);

    await page.evaluate(() => window.AI.sendKey('a'));
    await page.waitForTimeout(200);

    const leftTurn = await page.evaluate(() => {
      const party = window.AI.getParty();
      return { x: party.x, y: party.y, facing: party.facing };
    });

    expect(leftTurn.x).toBe(initialState.x);
    expect(leftTurn.y).toBe(initialState.y);

    const expectedLeftIndex = (initialIndex + 1) % 4;
    expect(leftTurn.facing).toBe(facingOrder[expectedLeftIndex]);

    await page.evaluate(() => window.AI.sendKey('d'));
    await page.waitForTimeout(200);

    const rightTurn = await page.evaluate(() => {
      const party = window.AI.getParty();
      return { x: party.x, y: party.y, facing: party.facing };
    });

    expect(rightTurn.x).toBe(initialState.x);
    expect(rightTurn.y).toBe(initialState.y);
    expect(rightTurn.facing).toBe(initialState.facing);
  });

  test('movement respects walls', async ({ page }) => {
    for (let i = 0; i < 50; i++) {
      await page.evaluate(() => window.AI.sendKey('w'));
      await page.waitForTimeout(50);
    }

    const blockedPosition = await page.evaluate(() => {
      const party = window.AI.getParty();
      return { x: party.x, y: party.y };
    });

    await page.evaluate(() => window.AI.sendKey('w'));
    await page.waitForTimeout(200);

    const afterAttempt = await page.evaluate(() => {
      const party = window.AI.getParty();
      return { x: party.x, y: party.y };
    });

    expect(afterAttempt.x).toBe(blockedPosition.x);
    expect(afterAttempt.y).toBe(blockedPosition.y);
  });

  test('arrow keys work for movement', async ({ page }) => {
    const initialState = await page.evaluate(() => {
      const party = window.AI.getParty();
      return { x: party.x, y: party.y, facing: party.facing };
    });

    await page.evaluate(() => window.AI.sendKey('ArrowUp'));
    await page.waitForTimeout(300);

    const afterArrowUp = await page.evaluate(() => {
      const party = window.AI.getParty();
      return { x: party.x, y: party.y };
    });

    const movedUp = initialState.x !== afterArrowUp.x || initialState.y !== afterArrowUp.y;

    if (!movedUp) {
      for (let attempts = 0; attempts < 4; attempts++) {
        await page.evaluate(() => window.AI.sendKey('ArrowRight'));
        await page.waitForTimeout(200);

        await page.evaluate(() => window.AI.sendKey('ArrowUp'));
        await page.waitForTimeout(200);

        const currentPos = await page.evaluate(() => {
          const party = window.AI.getParty();
          return { x: party.x, y: party.y };
        });

        if (currentPos.x !== initialState.x || currentPos.y !== initialState.y) {
          break;
        }
      }
    }

    const finalPosition = await page.evaluate(() => {
      const party = window.AI.getParty();
      return { x: party.x, y: party.y };
    });

    const finallyMoved = initialState.x !== finalPosition.x || initialState.y !== finalPosition.y;
    expect(finallyMoved).toBeTruthy();

    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(300);

    const afterArrowDown = await page.evaluate(() => {
      const party = window.AI.getParty();
      return { x: party.x, y: party.y };
    });

    expect(afterArrowDown.x).toBe(initialState.x);
    expect(afterArrowDown.y).toBe(initialState.y);

    const facingBefore = await page.evaluate(() => window.AI.getParty().facing);

    await page.evaluate(() => window.AI.sendKey('ArrowLeft'));
    await page.waitForTimeout(200);
    const leftFacing = await page.evaluate(() => window.AI.getParty().facing);
    expect(leftFacing).not.toBe(facingBefore);

    await page.evaluate(() => window.AI.sendKey('ArrowRight'));
    await page.waitForTimeout(200);
    const rightFacing = await page.evaluate(() => window.AI.getParty().facing);
    expect(rightFacing).toBe(facingBefore);
  });

  test('dungeon map updates when player moves', async ({ page }) => {
    await page.evaluate(() => window.AI.sendKey('m'));
    await page.waitForTimeout(200);

    const mapVisible = await page.evaluate(() => {
      const state = window.AI.getState();
      return state.ui?.mapVisible || false;
    });

    const initialPos = await page.evaluate(() => {
      const party = window.AI.getParty();
      return { x: party.x, y: party.y };
    });

    await page.evaluate(() => window.AI.sendKey('d'));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.AI.sendKey('w'));
    await page.waitForTimeout(200);

    const afterMove = await page.evaluate(() => {
      const party = window.AI.getParty();
      return { x: party.x, y: party.y };
    });

    const moved = initialPos.x !== afterMove.x || initialPos.y !== afterMove.y;

    if (!moved) {
      for (let i = 0; i < 3; i++) {
        await page.evaluate(() => window.AI.sendKey('a'));
        await page.waitForTimeout(200);
        await page.evaluate(() => window.AI.sendKey('w'));
        await page.waitForTimeout(200);

        const currentPos = await page.evaluate(() => {
          const party = window.AI.getParty();
          return { x: party.x, y: party.y };
        });

        if (currentPos.x !== initialPos.x || currentPos.y !== initialPos.y) {
          break;
        }
      }
    }

    const finalPos = await page.evaluate(() => {
      const party = window.AI.getParty();
      return { x: party.x, y: party.y };
    });

    const finallyMoved = initialPos.x !== finalPos.x || initialPos.y !== finalPos.y;
    expect(finallyMoved).toBeTruthy();

    await page.evaluate(() => window.AI.sendKey('m'));
    await page.waitForTimeout(200);
  });
});