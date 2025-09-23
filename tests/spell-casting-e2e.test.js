import { test, expect } from '@playwright/test';

test.describe('Spell Casting E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForSelector('#game-canvas', { timeout: 5000 });
    await page.waitForTimeout(1000);
  });

  test('user can navigate to spell menu and see available spells', async ({ page }) => {
    await page.evaluate(() => {
      const { GameServices } = window;
      const { Character } = window;
      const { Party } = window;
      const sceneManager = GameServices.getInstance().getSceneManager();

      const mage = new Character('TestMage', 'Human', 'Mage', 'Good');
      mage.mp = 20;
      mage.maxMp = 20;
      mage.hp = 25;
      mage.maxHp = 25;

      const party = new Party();
      party.addCharacter(mage);

      const gameState = {
        party: party,
        currentFloor: 1,
        inCombat: false,
        messageLog: GameServices.getInstance().getMessageLog()
      };

      window.game.gameState = gameState;

      const combatScene = sceneManager.getScene('combat');
      if (combatScene) {
        const monsters = [{
          name: 'Goblin',
          hp: 10,
          maxHp: 10,
          ac: 10,
          attacks: [{ damage: '1d4' }],
          xpValue: 10
        }];

        combatScene.combatSystem.startCombat(
          monsters,
          party.getAliveCharacters(),
          1,
          () => {},
          () => {}
        );
      }

      sceneManager.switchTo('combat');
    });

    await page.waitForTimeout(500);

    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);

    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    const spellMenuVisible = await page.evaluate(() => {
      const canvas = document.querySelector('#game-canvas');
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(20, 420, 600, 320);

      const dataURL = canvas.toDataURL();
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 600;
      tempCanvas.height = 320;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.putImageData(imageData, 0, 0);

      const pixels = imageData.data;
      let textPixels = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i] > 200 && pixels[i + 1] > 200 && pixels[i + 2] > 200) {
          textPixels++;
        }
      }

      return textPixels > 500;
    });

    expect(spellMenuVisible).toBe(true);

    const mpDisplayed = await page.evaluate(() => {
      const canvas = document.querySelector('#game-canvas');
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(220, 445, 100, 25);
      const pixels = imageData.data;

      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i] > 200 && pixels[i + 1] > 200 && pixels[i + 2] > 200) {
          return true;
        }
      }
      return false;
    });

    expect(mpDisplayed).toBe(true);
  });

  test('user can cast damage spell and see enemy HP decrease', async ({ page }) => {
    const setupResult = await page.evaluate(() => {
      const { GameServices } = window;
      const { Character } = window;
      const { Party } = window;
      const sceneManager = GameServices.getInstance().getSceneManager();

      const mage = new Character('BattleMage', 'Human', 'Mage', 'Good');
      mage.mp = 50;
      mage.maxMp = 50;
      mage.hp = 30;
      mage.maxHp = 30;
      mage.level = 5;

      const party = new Party();
      party.addCharacter(mage);

      const gameState = {
        party: party,
        currentFloor: 1,
        inCombat: false,
        messageLog: GameServices.getInstance().getMessageLog()
      };

      window.game.gameState = gameState;

      const combatScene = sceneManager.getScene('combat');
      if (combatScene) {
        const monsters = [{
          name: 'Orc',
          hp: 50,
          maxHp: 50,
          currentHp: 50,
          ac: 12,
          attacks: [{ damage: '1d6' }],
          xpValue: 25,
          magicResistance: 0
        }];

        window.testMonster = monsters[0];

        combatScene.combatSystem.startCombat(
          monsters,
          party.getAliveCharacters(),
          1,
          () => {},
          () => {}
        );
      }

      sceneManager.switchTo('combat');

      return {
        initialHP: window.testMonster.hp,
        hasMage: !!mage,
        hasSpells: mage.knownSpells.length > 0
      };
    });

    expect(setupResult.hasMage).toBe(true);
    expect(setupResult.hasSpells).toBe(true);

    await page.waitForTimeout(500);

    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    const combatResult = await page.evaluate(() => {
      const monster = window.testMonster;
      const messages = window.game?.gameState?.messageLog?.getMessages() || [];
      const lastMessages = messages.slice(-5);

      return {
        currentHP: monster ? monster.hp : -1,
        damaged: monster && monster.hp < 50,
        messages: lastMessages,
        hasFireDamageMessage: lastMessages.some(m =>
          m.text && m.text.includes('fire damage')
        )
      };
    });

    expect(combatResult.damaged).toBe(true);
    expect(combatResult.currentHP).toBeLessThan(setupResult.initialHP);
    expect(combatResult.hasFireDamageMessage).toBe(true);
  });

  test('user can heal party member and see HP increase', async ({ page }) => {
    const setupResult = await page.evaluate(() => {
      const { GameServices } = window;
      const { Character } = window;
      const { Party } = window;
      const sceneManager = GameServices.getInstance().getSceneManager();

      const priest = new Character('Healer', 'Elf', 'Priest', 'Good');
      priest.mp = 30;
      priest.maxMp = 30;
      priest.hp = 25;
      priest.maxHp = 25;

      const warrior = new Character('Tank', 'Dwarf', 'Fighter', 'Good');
      warrior.hp = 10;
      warrior.maxHp = 40;

      const party = new Party();
      party.addCharacter(priest);
      party.addCharacter(warrior);

      window.testWarrior = warrior;
      window.testPriest = priest;

      const gameState = {
        party: party,
        currentFloor: 1,
        inCombat: false,
        messageLog: GameServices.getInstance().getMessageLog()
      };

      window.game.gameState = gameState;

      const combatScene = sceneManager.getScene('combat');
      if (combatScene) {
        const monsters = [{
          name: 'Slime',
          hp: 5,
          maxHp: 5,
          ac: 8,
          attacks: [{ damage: '1d2' }],
          xpValue: 5
        }];

        combatScene.combatSystem.startCombat(
          monsters,
          party.getAliveCharacters(),
          1,
          () => {},
          () => {}
        );
      }

      sceneManager.switchTo('combat');

      return {
        priestMP: priest.mp,
        warriorInitialHP: warrior.hp,
        priestHasSpells: priest.knownSpells.length > 0
      };
    });

    expect(setupResult.priestHasSpells).toBe(true);
    expect(setupResult.warriorInitialHP).toBe(10);

    await page.waitForTimeout(500);

    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    const healResult = await page.evaluate(() => {
      const warrior = window.testWarrior;
      const priest = window.testPriest;
      const messages = window.game?.gameState?.messageLog?.getMessages() || [];
      const lastMessages = messages.slice(-5);

      return {
        warriorCurrentHP: warrior ? warrior.hp : -1,
        priestCurrentMP: priest ? priest.mp : -1,
        healed: warrior && warrior.hp > 10,
        messages: lastMessages,
        hasHealMessage: lastMessages.some(m =>
          m.text && (m.text.includes('recovers') || m.text.includes('HP'))
        )
      };
    });

    expect(healResult.healed).toBe(true);
    expect(healResult.warriorCurrentHP).toBeGreaterThan(setupResult.warriorInitialHP);
    expect(healResult.priestCurrentMP).toBeLessThan(setupResult.priestMP);
  });

  test('MP display updates correctly in status panel', async ({ page }) => {
    await page.evaluate(() => {
      const { GameServices } = window;
      const { Character } = window;
      const { Party } = window;
      const sceneManager = GameServices.getInstance().getSceneManager();

      const mage = new Character('MPTest', 'Human', 'Mage', 'Good');
      mage.mp = 15;
      mage.maxMp = 30;

      const party = new Party();
      party.addCharacter(mage);

      window.testMage = mage;

      const gameState = {
        party: party,
        currentFloor: 1,
        inCombat: false,
        messageLog: GameServices.getInstance().getMessageLog()
      };

      window.game.gameState = gameState;

      const combatScene = sceneManager.getScene('combat');
      if (combatScene) {
        const monsters = [{
          name: 'Rat',
          hp: 3,
          maxHp: 3,
          ac: 8,
          attacks: [{ damage: '1' }],
          xpValue: 2
        }];

        combatScene.combatSystem.startCombat(
          monsters,
          party.getAliveCharacters(),
          1,
          () => {},
          () => {}
        );
      }

      sceneManager.switchTo('combat');
    });

    await page.waitForTimeout(500);

    const mpBarVisible = await page.evaluate(() => {
      const canvas = document.querySelector('#game-canvas');
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(650, 40, 374, 100);
      const pixels = imageData.data;

      let bluePixelCount = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        if (r < 50 && g > 80 && g < 150 && b > 200) {
          bluePixelCount++;
        }
      }

      return bluePixelCount > 20;
    });

    expect(mpBarVisible).toBe(true);

    const initialMP = await page.evaluate(() => window.testMage.mp);

    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    const finalMP = await page.evaluate(() => window.testMage.mp);

    expect(finalMP).toBeLessThan(initialMP);

    const mpBarReduced = await page.evaluate(() => {
      const canvas = document.querySelector('#game-canvas');
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(650, 40, 374, 100);
      const pixels = imageData.data;

      let bluePixelCount = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        if (r < 50 && g > 80 && g < 150 && b > 200) {
          bluePixelCount++;
        }
      }

      return bluePixelCount > 0 && bluePixelCount < 100;
    });

    expect(mpBarReduced).toBe(true);
  });

  test('cannot cast spell without enough MP', async ({ page }) => {
    await page.evaluate(() => {
      const { GameServices } = window;
      const { Character } = window;
      const { Party } = window;
      const sceneManager = GameServices.getInstance().getSceneManager();

      const mage = new Character('NoMP', 'Human', 'Mage', 'Good');
      mage.mp = 1;
      mage.maxMp = 20;

      const party = new Party();
      party.addCharacter(mage);

      const gameState = {
        party: party,
        currentFloor: 1,
        inCombat: false,
        messageLog: GameServices.getInstance().getMessageLog()
      };

      window.game.gameState = gameState;

      const combatScene = sceneManager.getScene('combat');
      if (combatScene) {
        const monsters = [{
          name: 'Bat',
          hp: 5,
          maxHp: 5,
          ac: 12,
          attacks: [{ damage: '1d2' }],
          xpValue: 3
        }];

        window.testMonster = monsters[0];

        combatScene.combatSystem.startCombat(
          monsters,
          party.getAliveCharacters(),
          1,
          () => {},
          () => {}
        );
      }

      sceneManager.switchTo('combat');
    });

    await page.waitForTimeout(500);

    const initialHP = await page.evaluate(() => window.testMonster.hp);

    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    const spellGreyedOut = await page.evaluate(() => {
      const canvas = document.querySelector('#game-canvas');
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(20, 470, 200, 25);
      const pixels = imageData.data;

      let greyPixelCount = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        if (r > 90 && r < 120 && g > 90 && g < 120 && b > 90 && b < 120) {
          greyPixelCount++;
        }
      }

      return greyPixelCount > 50;
    });

    expect(spellGreyedOut).toBe(true);

    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    const result = await page.evaluate(() => {
      const messages = window.game?.gameState?.messageLog?.getMessages() || [];
      const lastMessages = messages.slice(-3);
      const monster = window.testMonster;

      return {
        monsterHP: monster ? monster.hp : -1,
        hasNotEnoughMPMessage: lastMessages.some(m =>
          m.text && (m.text.includes('Not enough MP') || m.text.includes('cannot cast'))
        ),
        messages: lastMessages.map(m => m.text)
      };
    });

    expect(result.monsterHP).toBe(initialHP);
  });

  test('spell selection is cancelled with Escape key', async ({ page }) => {
    await page.evaluate(() => {
      const { GameServices } = window;
      const { Character } = window;
      const { Party } = window;
      const sceneManager = GameServices.getInstance().getSceneManager();

      const mage = new Character('CancelTest', 'Human', 'Mage', 'Good');
      mage.mp = 20;
      mage.maxMp = 20;

      const party = new Party();
      party.addCharacter(mage);

      const gameState = {
        party: party,
        currentFloor: 1,
        inCombat: false,
        messageLog: GameServices.getInstance().getMessageLog()
      };

      window.game.gameState = gameState;

      const combatScene = sceneManager.getScene('combat');
      if (combatScene) {
        const monsters = [{
          name: 'Spider',
          hp: 8,
          maxHp: 8,
          ac: 11,
          attacks: [{ damage: '1d3' }],
          xpValue: 5
        }];

        combatScene.combatSystem.startCombat(
          monsters,
          party.getAliveCharacters(),
          1,
          () => {},
          () => {}
        );
      }

      sceneManager.switchTo('combat');
    });

    await page.waitForTimeout(500);

    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    const spellMenuOpen = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      return scene && scene.actionState === 'select_spell';
    });

    expect(spellMenuOpen).toBe(true);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    const backToMainMenu = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      return scene && scene.actionState === 'select_action';
    });

    expect(backToMainMenu).toBe(true);
  });
});