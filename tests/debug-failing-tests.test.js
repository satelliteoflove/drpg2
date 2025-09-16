const { test, expect } = require('@playwright/test');

test.describe('Debug Failing Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Navigate to dungeon with test state
    await page.evaluate(() => {
      if (window.game && window.game.sceneManager) {
        window.game.gameState = {
          party: {
            x: 5,
            y: 5,
            facing: 'north',
            getAliveCharacters: () => [
              { name: 'Test Fighter', hp: 100, maxHp: 100, mp: 50, maxMp: 50, inventory: [] },
              { name: 'Test Mage', hp: 80, maxHp: 80, mp: 100, maxMp: 100, inventory: [] },
            ],
            characters: [
              {
                name: 'Test Fighter',
                hp: 100,
                maxHp: 100,
                mp: 50,
                maxMp: 50,
                level: 1,
                stats: { luck: 10 },
              },
              {
                name: 'Test Mage',
                hp: 80,
                maxHp: 80,
                mp: 100,
                maxMp: 100,
                level: 1,
                stats: { luck: 10 },
              },
            ],
            move: (direction) => {
              const party = window.game.gameState.party;
              if (direction === 'forward') {
                if (party.facing === 'north') party.y--;
                if (party.facing === 'south') party.y++;
                if (party.facing === 'east') party.x++;
                if (party.facing === 'west') party.x--;
              } else if (direction === 'backward') {
                if (party.facing === 'north') party.y++;
                if (party.facing === 'south') party.y--;
                if (party.facing === 'east') party.x--;
                if (party.facing === 'west') party.x++;
              } else if (direction === 'left') {
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
            addSystemMessage: (msg) => {
              window.game.gameState.messageLog.messages.push({ text: msg });
            },
            addWarningMessage: (msg) => {
              window.game.gameState.messageLog.messages.push({ text: msg });
            },
            render: () => {},
          },
          inCombat: false,
          combatEnabled: true,
          hasEnteredDungeon: false,
          turnCount: 0,
        };

        window.game.sceneManager.switchTo('dungeon');
      }
    });

    await page.waitForTimeout(500);
  });

  test('debug party status panel', async ({ page }) => {
    // Enable ASCII and force render
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

    await page.waitForTimeout(500);

    // Check what's being passed to renderStatusPanel
    const debugInfo = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      if (scene && scene.getASCIIState) {
        const asciiState = scene.getASCIIState();

        // Check the party data
        const party = window.game.gameState.party;
        const aliveChars = party.getAliveCharacters();

        // Manually call renderStatusPanel to debug
        if (asciiState) {
          asciiState.renderStatusPanel(party);

          const grid = asciiState.getGrid();
          const gridString = asciiState.toString();

          // Look for specific areas of the grid
          const statusAreaSample = grid.cells
            .slice(18, 24)
            .map((row) => row.slice(52, 77).join(''))
            .join('\n');

          return {
            partyHasGetAliveCharacters: typeof party.getAliveCharacters === 'function',
            aliveCharactersCount: aliveChars.length,
            aliveCharactersData: aliveChars,
            gridHasPartyStatus: gridString.includes('PARTY STATUS'),
            gridHasHP: gridString.includes('HP:'),
            gridHasMP: gridString.includes('MP:'),
            gridHasTestFighter: gridString.includes('Test Fighter'),
            statusAreaSample: statusAreaSample,
            fullGrid: gridString.substring(0, 500), // First 500 chars for debugging
          };
        }
      }
      return null;
    });

    console.log('Debug Info:', JSON.stringify(debugInfo, null, 2));

    expect(debugInfo).toBeTruthy();
    expect(debugInfo.aliveCharactersCount).toBe(2);
    expect(debugInfo.gridHasPartyStatus).toBeTruthy();
  });

  test('debug message log', async ({ page }) => {
    // Enable ASCII
    await page.evaluate(() => {
      window.FeatureFlags.enable('ASCII_RENDERING');
    });

    // Add messages and render
    const debugInfo = await page.evaluate(() => {
      // Add test messages
      window.game.gameState.messageLog.messages = [
        { text: 'First test message' },
        { text: 'Second test message' },
        { text: 'Third test message' },
      ];

      const scene = window.game?.sceneManager?.currentScene;
      if (scene) {
        const canvas = document.querySelector('canvas');
        const ctx = canvas?.getContext('2d');
        if (ctx) {
          scene.render(ctx);
          scene.render(ctx);
        }

        if (scene.getASCIIState) {
          const asciiState = scene.getASCIIState();
          if (asciiState) {
            const gridString = asciiState.toString();

            // Check message area (bottom of screen)
            const grid = asciiState.getGrid();
            const messageAreaSample = grid.cells
              .slice(24, 29)
              .map((row) => row.slice(0, 80).join(''))
              .join('\n');

            return {
              messageCount: window.game.gameState.messageLog.messages.length,
              messages: window.game.gameState.messageLog.messages,
              gridHasFirstMessage: gridString.includes('First test'),
              gridHasSecondMessage: gridString.includes('Second test'),
              messageAreaSample: messageAreaSample,
              bottomOfGrid: grid.cells
                .slice(20)
                .map((row) => row.join(''))
                .join('\n'),
            };
          }
        }
      }
      return null;
    });

    console.log('Message Debug Info:', JSON.stringify(debugInfo, null, 2));

    expect(debugInfo).toBeTruthy();
    expect(debugInfo.messageCount).toBe(3);
  });

  test('debug movement handling', async ({ page }) => {
    // Enable ASCII
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

    await page.waitForTimeout(500);

    // Get initial state
    const initialState = await page.evaluate(() => {
      return {
        x: window.game.gameState.party.x,
        y: window.game.gameState.party.y,
        facing: window.game.gameState.party.facing,
      };
    });

    console.log('Initial state:', initialState);

    // Try to turn right using keyboard
    await page.keyboard.press('d');
    await page.waitForTimeout(500);

    const afterKeyPress = await page.evaluate(() => {
      return {
        x: window.game.gameState.party.x,
        y: window.game.gameState.party.y,
        facing: window.game.gameState.party.facing,
      };
    });

    console.log("After 'd' key press:", afterKeyPress);

    // Try manual movement call
    const afterManualMove = await page.evaluate(() => {
      // Manually trigger movement
      const scene = window.game?.sceneManager?.currentScene;
      if (scene && scene.handleInput) {
        scene.handleInput('d');
      }

      return {
        x: window.game.gameState.party.x,
        y: window.game.gameState.party.y,
        facing: window.game.gameState.party.facing,
      };
    });

    console.log('After manual handleInput:', afterManualMove);

    // Check if InputManager is working
    const inputDebug = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      if (scene) {
        // Try to access InputManager
        const hasInputManager = scene.inputManager !== undefined;
        const inputManagerType = typeof scene.inputManager;

        return {
          hasInputManager,
          inputManagerType,
          sceneHasHandleInput: typeof scene.handleInput === 'function',
        };
      }
      return null;
    });

    console.log('Input debug:', inputDebug);

    expect(initialState.facing).toBe('north');
    // Movement might not work due to InputManager not being properly initialized
  });
});
