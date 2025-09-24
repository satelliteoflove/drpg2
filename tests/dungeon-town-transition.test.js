const { test, expect } = require('@playwright/test');

test.describe('Dungeon to Town Transition', () => {
  test('should be able to return to town from dungeon floor 1', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForFunction(() => window.AI?.getState, { timeout: 10000 });

    // Start new game (select New Game option which is first in menu)
    console.log('Starting new game...');
    await page.evaluate(() => window.AI.sendKey('Enter')); // Select "New Game"
    await page.waitForTimeout(500);

    // Check we're in new game scene
    const newGameScene = await page.evaluate(() => window.AI.getScene());
    console.log('Scene after Enter key:', newGameScene);

    // Use auto-generate party option
    console.log('Using auto-generate party...');

    // Try different arrow key formats
    const keyResult = await page.evaluate(() => {
      const result1 = window.AI.sendKey('ArrowDown'); // Try ArrowDown
      const scene1 = window.AI.getScene();
      const desc1 = window.AI.describe();

      return { result: result1, scene: scene1, description: desc1 };
    });
    console.log('After ArrowDown:', keyResult);

    await page.waitForTimeout(200);

    await page.evaluate(() => {
      window.AI.sendKey('Enter'); // Confirm auto-generate
    });
    await page.waitForTimeout(1000);

    // Check what scene we're in after auto-generate
    const sceneAfterAutoGen = await page.evaluate(() => window.AI.getScene());
    console.log('Scene after auto-generate:', sceneAfterAutoGen);

    // Check AI.describe() for more context
    const description = await page.evaluate(() => window.AI.describe());
    console.log('Scene description:', description);

    // If still in main menu, something went wrong with auto-generate
    if (sceneAfterAutoGen === 'MainMenu' || sceneAfterAutoGen === 'main_menu') {
      throw new Error('Auto-generate did not transition to dungeon scene');
    }

    // Wait for dungeon
    await page.waitForFunction(() => {
      const scene = window.AI.getScene();
      return scene === 'dungeon' || scene === 'Dungeon';
    }, { timeout: 10000 });

    let dungeonState = await page.evaluate(() => {
      const state = window.AI.getState();
      const party = window.AI.getParty();
      const dungeon = window.AI.getDungeon();
      return {
        floor: state.currentFloor,
        position: { x: party.x, y: party.y },
        currentTile: dungeon?.currentTile,
        description: window.AI.describe()
      };
    });
    console.log('Initial dungeon state:', dungeonState);

    // Check if we're already on stairs_up based on the description
    if (dungeonState.description.includes('stairs_up')) {
      console.log('Already on stairs_up at spawn!');
    } else {
      // Find stairs up on floor 1 if not already there
      console.log('Looking for stairs up on floor 1...');
      const stairsInfo = await page.evaluate(() => {
        const state = window.AI.getState();
        const currentFloor = state.dungeon[state.currentFloor - 1];
        if (!currentFloor || !currentFloor.tiles) return null;

        for (let y = 0; y < currentFloor.height; y++) {
          for (let x = 0; x < currentFloor.width; x++) {
            if (currentFloor.tiles[y][x].type === 'stairs_up') {
              return { x, y, tile: currentFloor.tiles[y][x] };
            }
          }
        }
        return null;
      });
      console.log('Stairs up location:', stairsInfo);

      if (!stairsInfo) {
        throw new Error('No stairs_up found on floor 1');
      }

      // Navigate to stairs if needed
      console.log('Navigating to stairs...');
      let moveCount = 0;
      const maxMoves = 50;

      while (moveCount < maxMoves) {
        const currentPos = await page.evaluate(() => {
          const party = window.AI.getParty();
          return { x: party.x, y: party.y };
        });

        if (currentPos.x === stairsInfo.x && currentPos.y === stairsInfo.y) {
          console.log('Reached stairs!');
          break;
        }

        // Simple movement towards stairs
        if (currentPos.x < stairsInfo.x) {
          await page.evaluate(() => window.AI.sendKey('d')); // turn right
          await page.waitForTimeout(100);
          await page.evaluate(() => window.AI.sendKey('w')); // move forward
        } else if (currentPos.x > stairsInfo.x) {
          await page.evaluate(() => window.AI.sendKey('a')); // turn left
          await page.waitForTimeout(100);
          await page.evaluate(() => window.AI.sendKey('w')); // move forward
        } else if (currentPos.y < stairsInfo.y) {
          await page.evaluate(() => window.AI.sendKey('s')); // move down
        } else if (currentPos.y > stairsInfo.y) {
          await page.evaluate(() => window.AI.sendKey('w')); // move up
        }

        await page.waitForTimeout(100);
        moveCount++;
      }
    }

    // Try to use stairs with Enter
    console.log('Pressing Enter on stairs...');
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);

    // Check for prompt
    let messages = await page.evaluate(() => {
      const state = window.AI.getState();
      const desc = window.AI.describe();
      const scene = window.AI.getScene();

      // Look for the message in the message log
      let hasPromptInLog = false;
      if (state.messageLog && state.messageLog.messages) {
        hasPromptInLog = state.messageLog.messages.some(msg =>
          msg.text && (msg.text.includes('castle entrance') ||
                      msg.text.includes('return to town') ||
                      msg.text.includes('(Y/N)'))
        );
      }

      return {
        hasPromptInLog,
        description: desc,
        scene: scene,
        messageCount: state.messageLog?.messages?.length || 0,
        lastMessage: state.messageLog?.messages?.[state.messageLog.messages.length - 1]?.text
      };
    });
    console.log('After Enter - Messages:', messages);

    // Look for the castle entrance prompt in the description or message log
    const hasPrompt = messages.hasPromptInLog ||
                      messages.description?.includes('castle entrance') ||
                      messages.description?.includes('return to town') ||
                      messages.description?.includes('(Y/N)');

    if (hasPrompt) {
      console.log('Got prompt! Pressing Y to go to town...');
      await page.evaluate(() => window.AI.sendKey('y'));
      await page.waitForTimeout(500);

      const afterY = await page.evaluate(() => {
        return {
          scene: window.AI.getScene(),
          description: window.AI.describe()
        };
      });
      console.log('After pressing Y:', afterY);

      expect(afterY.scene.toLowerCase()).toBe('town');
    } else {
      // Try moving forward on stairs
      console.log('No prompt from Enter, trying to move forward on stairs...');
      await page.evaluate(() => window.AI.sendKey('w'));
      await page.waitForTimeout(500);

      messages = await page.evaluate(() => {
        const state = window.AI.getState();
        const desc = window.AI.describe();
        const scene = window.AI.getScene();

        // Look for the message in the message log
        let hasPromptInLog = false;
        if (state.messageLog && state.messageLog.messages) {
          hasPromptInLog = state.messageLog.messages.some(msg =>
            msg.text && (msg.text.includes('castle entrance') ||
                        msg.text.includes('return to town') ||
                        msg.text.includes('(Y/N)'))
          );
        }

        return {
          hasPromptInLog,
          description: desc,
          scene: scene,
          lastMessage: state.messageLog?.messages?.[state.messageLog.messages.length - 1]?.text
        };
      });
      console.log('After moving forward:', messages);

      const hasPromptAfterMove = messages.hasPromptInLog ||
                                  messages.description?.includes('castle entrance') ||
                                  messages.description?.includes('return to town') ||
                                  messages.description?.includes('(Y/N)');

      if (hasPromptAfterMove) {
        console.log('Got prompt after move! Pressing Y...');
        await page.evaluate(() => window.AI.sendKey('y'));
        await page.waitForTimeout(500);

        const finalScene = await page.evaluate(() => window.AI.getScene());
        console.log('Final scene:', finalScene);
        expect(finalScene.toLowerCase()).toBe('town');
      } else {
        throw new Error('Could not trigger town transition prompt');
      }
    }
  });
});