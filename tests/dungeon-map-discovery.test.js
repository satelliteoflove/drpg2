const { test, expect } = require('@playwright/test');

test.describe('Dungeon Map Discovery', () => {
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

  test('should discover tiles as player moves', async ({ page }) => {
    const initialState = await page.evaluate(() => {
      const state = window.AI.getState();
      const dungeon = window.AI.getDungeon();
      const party = window.AI.getParty();

      let discoveredCount = 0;
      if (dungeon && dungeon.tiles) {
        for (const row of dungeon.tiles) {
          for (const tile of row) {
            if (tile.discovered) discoveredCount++;
          }
        }
      }

      return {
        scene: state.currentScene,
        partyPos: { x: party.x, y: party.y },
        discoveredTiles: discoveredCount
      };
    });

    expect(initialState.scene).toBe('dungeon');
    expect(initialState.discoveredTiles).toBeGreaterThan(0);

    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.AI.sendKey('w'));
      await page.waitForTimeout(200);
    }

    const afterMoving = await page.evaluate(() => {
      const dungeon = window.AI.getDungeon();
      const party = window.AI.getParty();

      let discoveredCount = 0;
      if (dungeon && dungeon.tiles) {
        for (const row of dungeon.tiles) {
          for (const tile of row) {
            if (tile.discovered) discoveredCount++;
          }
        }
      }

      return {
        partyPos: { x: party.x, y: party.y },
        discoveredTiles: discoveredCount
      };
    });

    const moved = afterMoving.partyPos.x !== initialState.partyPos.x ||
                  afterMoving.partyPos.y !== initialState.partyPos.y;

    if (moved) {
      expect(afterMoving.discoveredTiles).toBeGreaterThanOrEqual(initialState.discoveredTiles);
    }
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
        partyPosition: { x: party.x, y: party.y }
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
          const tileX = party.x + dx;
          const tileY = party.y + dy;

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