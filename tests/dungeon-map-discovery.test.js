const { test, expect } = require('@playwright/test');

test.describe.skip('Dungeon Map Discovery', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForFunction(() => window.AI?.getState, { timeout: 2000 });

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

  test('should discover tiles as player moves', async ({ page }) => {
    const initialState = await page.evaluate(() => {
      const state = window.AI.getState();
      const dungeon = window.AI.getDungeon();
      const party = window.AI.getParty();

      let discoveredCount = 0;
      let undiscoveredCount = 0;
      if (dungeon && dungeon.tiles) {
        for (const row of dungeon.tiles) {
          for (const tile of row) {
            if (tile.discovered) discoveredCount++;
            else undiscoveredCount++;
          }
        }
      }

      return {
        scene: window.AI.getScene(),
        partyPos: { x: party.location.x, y: party.location.y, facing: party.location.facing },
        discoveredTiles: discoveredCount,
        undiscoveredTiles: undiscoveredCount
      };
    });

    expect(initialState.scene.toLowerCase()).toBe('dungeon');
    expect(initialState.discoveredTiles).toBeGreaterThan(0);
    expect(initialState.undiscoveredTiles).toBeGreaterThan(0);

    const directions = ['w', 'a', 's', 'd'];
    let moved = false;
    let lastPos = initialState.partyPos;

    for (const dir of directions) {
      await page.evaluate((key) => window.AI.sendKey(key), dir);
      await page.waitForTimeout(200);

      const currentPos = await page.evaluate(() => {
        const party = window.AI.getParty();
        return { x: party.location.x, y: party.location.y, facing: party.location.facing };
      });

      if (currentPos.x !== lastPos.x || currentPos.y !== lastPos.y) {
        moved = true;
        lastPos = currentPos;
      }
    }

    expect(moved).toBeTruthy();

    const afterMoving = await page.evaluate(() => {
      const dungeon = window.AI.getDungeon();
      const party = window.AI.getParty();

      let discoveredCount = 0;
      let undiscoveredFarCount = 0;
      const viewDistance = dungeon.viewDistance || 3;

      if (dungeon && dungeon.tiles) {
        for (let y = 0; y < dungeon.tiles.length; y++) {
          for (let x = 0; x < dungeon.tiles[y].length; x++) {
            const tile = dungeon.tiles[y][x];
            if (tile.discovered) {
              discoveredCount++;
            } else {
              const distance = Math.max(Math.abs(x - party.location.x), Math.abs(y - party.location.y));
              if (distance > viewDistance) {
                undiscoveredFarCount++;
              }
            }
          }
        }
      }

      return {
        partyPos: { x: party.location.x, y: party.location.y },
        discoveredTiles: discoveredCount,
        undiscoveredFarTiles: undiscoveredFarCount
      };
    });

    expect(afterMoving.discoveredTiles).toBeGreaterThan(initialState.discoveredTiles);
    expect(afterMoving.undiscoveredFarTiles).toBeGreaterThan(0);
  });

  test('map shows walls and discovered areas', async ({ page }) => {
    await page.evaluate(() => window.AI.sendKey('m'));
    await page.waitForTimeout(200);

    const dungeonInfo = await page.evaluate(() => {
      const dungeon = window.AI.getDungeon();
      const party = window.AI.getParty();

      if (!dungeon || !dungeon.tiles) return null;

      let wallCount = 0;
      let floorCount = 0;
      let discoveredCount = 0;

      for (const row of dungeon.tiles) {
        for (const tile of row) {
          if (tile.type === 'wall') wallCount++;
          else if (tile.type === 'floor') floorCount++;
          if (tile.discovered) discoveredCount++;
        }
      }

      return {
        wallCount,
        floorCount,
        discoveredCount,
        partyPosition: { x: party.location.x, y: party.location.y }
      };
    });

    expect(dungeonInfo).not.toBeNull();
    expect(dungeonInfo.wallCount).toBeGreaterThan(0);
    expect(dungeonInfo.floorCount).toBeGreaterThan(0);
    expect(dungeonInfo.discoveredCount).toBeGreaterThan(0);

    const tilesNearParty = await page.evaluate(() => {
      const dungeon = window.AI.getDungeon();
      const party = window.AI.getParty();

      if (!dungeon || !dungeon.tiles) return [];

      const nearbyTiles = [];
      const viewDistance = 3;

      for (let dy = -viewDistance; dy <= viewDistance; dy++) {
        for (let dx = -viewDistance; dx <= viewDistance; dx++) {
          const tileX = party.location.x + dx;
          const tileY = party.location.y + dy;

          if (tileX >= 0 && tileX < dungeon.width &&
              tileY >= 0 && tileY < dungeon.height) {
            const tile = dungeon.tiles[tileY][tileX];
            if (tile) {
              nearbyTiles.push({
                x: tileX,
                y: tileY,
                type: tile.type,
                discovered: tile.discovered
              });
            }
          }
        }
      }

      return nearbyTiles;
    });

    const discoveredNearby = tilesNearParty.filter(t => t.discovered);
    expect(discoveredNearby.length).toBeGreaterThan(0);

    const hasWalls = tilesNearParty.some(t => t.type === 'wall');
    const hasFloors = tilesNearParty.some(t => t.type === 'floor');
    expect(hasWalls || hasFloors).toBeTruthy();

    await page.evaluate(() => window.AI.sendKey('m'));
  });
});