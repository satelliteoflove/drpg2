import { test, expect } from '@playwright/test';

test.describe('Spell UI Integration', () => {
  test('spell menu opens in combat and allows spell selection', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    // Start new game and create party
    await page.evaluate(() => window.AI.sendKey('enter')); // New game
    await page.waitForTimeout(200);
    await page.evaluate(() => window.AI.sendKey('enter')); // Confirm new game
    await page.waitForTimeout(200);

    // Create a mage character
    while (await page.evaluate(() => window.AI.getScene() === 'character creation')) {
      await page.evaluate(() => window.AI.sendKey('enter')); // Accept character
      await page.waitForTimeout(200);
    }

    await page.waitForTimeout(500);

    // Set up the character as a mage with spells
    await page.evaluate(() => {
      const state = window.AI.getState();
      if (state.party && state.party.characters && state.party.characters[0]) {
        const character = state.party.characters[0];
        character.class = 'mage';
        character.level = 3;
        character.mp = 10;
        character.maxMp = 10;
        character.knownSpells = ['katino', 'halito', 'mogref'];
      }
    });

    while (await page.evaluate(() => window.AI.getScene() !== 'dungeon')) {
      await page.evaluate(() => window.AI.sendKey('enter'));
      await page.waitForTimeout(100);
    }

    await page.evaluate(() => {
      window.AI.sendKey('arrowup');
      window.AI.sendKey('arrowup');
      window.AI.sendKey('arrowup');
      window.AI.sendKey('arrowup');
      window.AI.sendKey('arrowup');
    });
    await page.waitForTimeout(500);

    const combatStarted = await page.evaluate(() => window.AI.getScene() === 'combat');
    if (!combatStarted) {
      console.log('No combat encountered, forcing combat...');
      for (let i = 0; i < 20; i++) {
        await page.evaluate(() => window.AI.sendKey('arrowup'));
        await page.waitForTimeout(100);
        const inCombat = await page.evaluate(() => window.AI.getScene() === 'combat');
        if (inCombat) break;
      }
    }

    expect(await page.evaluate(() => window.AI.getScene())).toBe('combat');

    const combatInfo1 = await page.evaluate(() => window.AI.getCombat());
    expect(combatInfo1.inCombat).toBe(true);
    expect(combatInfo1.spellMenuOpen).toBe(false);

    await page.evaluate(() => window.AI.sendKey('arrowdown'));
    await page.waitForTimeout(100);
    await page.evaluate(() => window.AI.sendKey('arrowdown'));
    await page.waitForTimeout(100);
    await page.evaluate(() => window.AI.sendKey('enter'));
    await page.waitForTimeout(200);

    const combatInfo2 = await page.evaluate(() => window.AI.getCombat());
    expect(combatInfo2.spellMenuOpen).toBe(true);

    const spellMenuInfo = await page.evaluate(() => window.AI.getSpellMenu());
    expect(spellMenuInfo.isOpen).toBe(true);
    expect(spellMenuInfo.knownSpells).toBeDefined();
    expect(spellMenuInfo.knownSpells.length).toBeGreaterThan(0);

    await page.evaluate(() => window.AI.sendKey('1'));
    await page.waitForTimeout(200);

    const combatInfo3 = await page.evaluate(() => window.AI.getCombat());

    if (combatInfo3.selectedSpell) {
      console.log('Spell selected, targeting phase');

      await page.evaluate(() => window.AI.sendKey('enter'));
      await page.waitForTimeout(200);
    }

    const combatInfo4 = await page.evaluate(() => window.AI.getCombat());
    const partyAfter = await page.evaluate(() => window.AI.getParty());

    const caster = partyAfter.characters[0];
    expect(caster.mp.current).toBeLessThan(10);
  });

  test('spell menu navigation works with arrow keys', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    // Start new game and create party
    await page.evaluate(() => window.AI.sendKey('enter')); // New game
    await page.waitForTimeout(200);
    await page.evaluate(() => window.AI.sendKey('enter')); // Confirm new game
    await page.waitForTimeout(200);

    // Create a character
    while (await page.evaluate(() => window.AI.getScene() === 'character creation')) {
      await page.evaluate(() => window.AI.sendKey('enter')); // Accept character
      await page.waitForTimeout(200);
    }

    await page.waitForTimeout(500);

    // Set up the character as a bishop with spells
    await page.evaluate(() => {
      const state = window.AI.getState();
      if (state.party && state.party.characters && state.party.characters[0]) {
        const character = state.party.characters[0];
        character.class = 'bishop';
        character.level = 5;
        character.mp = 20;
        character.maxMp = 20;
        character.knownSpells = ['katino', 'halito', 'mogref', 'dios', 'badios'];
      }
    });

    while (await page.evaluate(() => window.AI.getScene() !== 'dungeon')) {
      await page.evaluate(() => window.AI.sendKey('enter'));
      await page.waitForTimeout(100);
    }

    await page.evaluate(() => {
      for (let i = 0; i < 10; i++) {
        window.AI.sendKey('arrowup');
      }
    });
    await page.waitForTimeout(500);

    const inCombat = await page.evaluate(() => window.AI.getScene() === 'combat');
    if (!inCombat) {
      for (let i = 0; i < 20; i++) {
        await page.evaluate(() => window.AI.sendKey('arrowup'));
        await page.waitForTimeout(100);
        const combat = await page.evaluate(() => window.AI.getScene() === 'combat');
        if (combat) break;
      }
    }

    expect(await page.evaluate(() => window.AI.getScene())).toBe('combat');

    await page.evaluate(() => {
      window.AI.sendKey('arrowdown');
      window.AI.sendKey('arrowdown');
    });
    await page.waitForTimeout(100);
    await page.evaluate(() => window.AI.sendKey('enter'));
    await page.waitForTimeout(200);

    const spellMenuInfo = await page.evaluate(() => window.AI.getSpellMenu());
    expect(spellMenuInfo.isOpen).toBe(true);

    const initialSpellIndex = spellMenuInfo.selectedSpellIndex;

    const navigatedDown = await page.evaluate(() => window.AI.navigateSpellMenu('down'));
    expect(navigatedDown).toBe(true);
    await page.waitForTimeout(100);

    const spellMenuInfo2 = await page.evaluate(() => window.AI.getSpellMenu());
    expect(spellMenuInfo2.selectedSpellIndex).toBeGreaterThan(initialSpellIndex);

    const navigatedUp = await page.evaluate(() => window.AI.navigateSpellMenu('up'));
    expect(navigatedUp).toBe(true);
    await page.waitForTimeout(100);

    const spellMenuInfo3 = await page.evaluate(() => window.AI.getSpellMenu());
    expect(spellMenuInfo3.selectedSpellIndex).toBe(initialSpellIndex);

    await page.evaluate(() => window.AI.sendKey('escape'));
    await page.waitForTimeout(100);

    const combatInfo = await page.evaluate(() => window.AI.getCombat());
    expect(combatInfo.spellMenuOpen).toBe(false);
  });

  test('spell target selection for enemy-targeted spells', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    // Start new game and create party
    await page.evaluate(() => window.AI.sendKey('enter')); // New game
    await page.waitForTimeout(200);
    await page.evaluate(() => window.AI.sendKey('enter')); // Confirm new game
    await page.waitForTimeout(200);

    // Create a character
    while (await page.evaluate(() => window.AI.getScene() === 'character creation')) {
      await page.evaluate(() => window.AI.sendKey('enter')); // Accept character
      await page.waitForTimeout(200);
    }

    await page.waitForTimeout(500);

    // Set up the character as a mage with spells
    await page.evaluate(() => {
      const state = window.AI.getState();
      if (state.party && state.party.characters && state.party.characters[0]) {
        const character = state.party.characters[0];
        character.class = 'mage';
        character.level = 3;
        character.mp = 10;
        character.maxMp = 10;
        character.knownSpells = ['halito'];
      }
    });

    while (await page.evaluate(() => window.AI.getScene() !== 'dungeon')) {
      await page.evaluate(() => window.AI.sendKey('enter'));
      await page.waitForTimeout(100);
    }

    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => window.AI.sendKey('arrowup'));
      await page.waitForTimeout(100);
      const inCombat = await page.evaluate(() => window.AI.getScene() === 'combat');
      if (inCombat) break;
    }

    expect(await page.evaluate(() => window.AI.getScene())).toBe('combat');

    await page.evaluate(() => {
      window.AI.sendKey('arrowdown');
      window.AI.sendKey('arrowdown');
    });
    await page.waitForTimeout(100);
    await page.evaluate(() => window.AI.sendKey('enter'));
    await page.waitForTimeout(200);

    const spellMenuOpen = await page.evaluate(() => window.AI.getCombat().spellMenuOpen);
    expect(spellMenuOpen).toBe(true);

    await page.evaluate(() => window.AI.sendKey('1'));
    await page.waitForTimeout(200);

    const testState = await page.evaluate(() => {
      const scene = window.game.sceneManager.getCurrentScene();
      return scene.getTestState ? scene.getTestState() : null;
    });

    if (testState && testState.actionState === 'spell_target') {
      console.log('Target selection active');

      await page.evaluate(() => window.AI.sendKey('arrowright'));
      await page.waitForTimeout(100);
      await page.evaluate(() => window.AI.sendKey('arrowleft'));
      await page.waitForTimeout(100);

      await page.evaluate(() => window.AI.sendKey('enter'));
      await page.waitForTimeout(200);

      const afterCast = await page.evaluate(() => window.AI.getParty());
      expect(afterCast.characters[0].mp.current).toBeLessThan(10);
    }
  });
});