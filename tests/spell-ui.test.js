import { test, expect } from '@playwright/test';

test.describe('Spell UI Integration', () => {
  test('spell menu opens in combat and allows spell selection', async ({ page }) => {
    await page.goto('http://localhost:8080');

    // Fast-fail if AI interface doesn't load
    const aiLoaded = await page.waitForFunction(
      () => typeof window.AI !== 'undefined',
      { timeout: 2000 }
    ).catch(() => false);
    if (!aiLoaded) throw new Error('AI interface failed to load');

    // Navigate to game with state verification
    await page.evaluate(() => window.AI.sendKey('Enter'));
    const menuReached = await page.evaluate(async () => {
      for (let i = 0; i < 20; i++) {
        if (window.AI.getScene() === 'New Game') return true;
        await new Promise(r => setTimeout(r, 100));
      }
      return false;
    });
    if (!menuReached) throw new Error(`Stuck at: ${await page.evaluate(() => window.AI.getScene())}`);

    // Select auto-generate and verify state change
    await page.evaluate(() => {
      window.AI.sendKey('ArrowDown');
      window.AI.sendKey('Enter');
    });

    // Auto-generate should go straight to dungeon (testing shortcut)
    const dungeonReached = await page.evaluate(async () => {
      for (let i = 0; i < 30; i++) {
        const scene = window.AI.getScene();
        if (scene?.toLowerCase() === 'dungeon') return { success: true };
        if (scene === 'MainMenu') return { error: 'Returned to main menu unexpectedly' };
        if (scene === 'Error') return { error: 'Game error state' };
        await new Promise(r => setTimeout(r, 100));
      }
      return { error: `Failed to reach dungeon, stuck at: ${window.AI.getScene()}` };
    });
    if (dungeonReached.error) throw new Error(dungeonReached.error);

    // Find a character with spells (not all classes have MP/spells)
    const partyCheck = await page.evaluate(() => {
      const party = window.AI.getParty();
      if (!party?.characters?.length) return { error: 'No party characters' };

      // Debug: log what we have
      const partyInfo = party.characters.map(c => ({
        name: c.name,
        class: c.class,
        spells: c.knownSpells || [],
        mp: c.mp
      }));
      console.log('Party:', JSON.stringify(partyInfo, null, 2));

      // Find first character with spells
      const casterIndex = party.characters.findIndex(c => c.knownSpells?.length > 0);
      if (casterIndex === -1) {
        return {
          error: 'No party members have spells',
          debug: partyInfo
        };
      }

      const caster = party.characters[casterIndex];
      const mpCurrent = typeof caster.mp === 'object' ? caster.mp?.current : caster.mp;

      return {
        success: true,
        casterIndex: casterIndex,
        casterName: caster.name,
        casterClass: caster.class,
        mp: mpCurrent || 0,
        spellCount: caster.knownSpells.length
      };
    });
    if (partyCheck.error) {
      console.log('Debug party info:', partyCheck.debug);
      throw new Error(partyCheck.error);
    }

    const initialMP = partyCheck.mp;
    const casterIndex = partyCheck.casterIndex;
    expect(initialMP).toBeGreaterThan(0);

    // Trigger combat with fast-fail on stuck state
    const combatResult = await page.evaluate(async () => {
      let lastY = window.AI.getParty()?.location?.y;
      for (let attempts = 0; attempts < 15; attempts++) {
        window.AI.sendKey('ArrowUp');

        // Wait for either movement or scene change
        for (let i = 0; i < 10; i++) {
          const scene = window.AI.getScene();
          if (scene === 'Combat') return { success: true, attempts };
          if (scene !== 'Dungeon' && scene?.toLowerCase() !== 'dungeon') {
            return { error: `Unexpected scene: ${scene}` };
          }
          const newY = window.AI.getParty()?.location?.y;
          if (newY !== lastY) {
            lastY = newY;
            break;
          }
          await new Promise(r => setTimeout(r, 50));
        }
      }
      return { error: 'Could not trigger combat after 15 moves' };
    });
    if (combatResult.error) throw new Error(combatResult.error);

    // Verify combat state and wait for caster's turn
    const waitForCasterTurn = await page.evaluate(async (casterIdx) => {
      for (let i = 0; i < 30; i++) {  // Max 30 turns
        const combat = window.AI.getCombat();
        if (!combat.inCombat) return { error: 'No longer in combat' };

        // Check if it's the caster's turn
        if (combat.currentCharacter === casterIdx) {
          return { success: true, currentChar: casterIdx };
        }

        // If it's someone else's turn, skip it
        window.AI.sendKey('a');  // Attack to advance turn
        await new Promise(r => setTimeout(r, 500));
      }
      return { error: 'Caster turn never came' };
    }, casterIndex);
    if (waitForCasterTurn.error) throw new Error(waitForCasterTurn.error);

    const combatInfo = await page.evaluate(() => window.AI.getCombat());
    expect(combatInfo.inCombat).toBe(true);
    expect(combatInfo.spellMenuOpen).toBe(false);

    // Open spell menu with fast-fail
    const menuResult = await page.evaluate(async () => {
      window.AI.sendKey('m');
      for (let i = 0; i < 20; i++) {
        const combat = window.AI.getCombat();
        if (combat.spellMenuOpen) return { success: true };
        if (!combat.inCombat) return { error: 'Left combat unexpectedly' };
        await new Promise(r => setTimeout(r, 100));
      }
      return { error: 'Spell menu did not open' };
    });
    if (menuResult.error) throw new Error(menuResult.error);

    // Select spell and handle target selection
    const castResult = await page.evaluate(async () => {
      window.AI.sendKey('1');

      // Wait for state change
      for (let i = 0; i < 20; i++) {
        const combat = window.AI.getCombat();
        if (combat.targetSelectionActive) {
          // Cast the spell
          window.AI.sendKey('Enter');

          // Wait for casting to complete
          for (let j = 0; j < 20; j++) {
            const newCombat = window.AI.getCombat();
            if (!newCombat.targetSelectionActive && !newCombat.spellMenuOpen) {
              return { success: true, cast: true };
            }
            await new Promise(r => setTimeout(r, 100));
          }
          return { error: 'Spell casting did not complete' };
        }
        if (!combat.spellMenuOpen) {
          return { success: true, cast: false };
        }
        await new Promise(r => setTimeout(r, 100));
      }
      return { error: 'No state change after selecting spell' };
    });
    if (castResult.error) throw new Error(castResult.error);

    // Verify MP was consumed from the caster
    const finalMP = await page.evaluate((idx) => {
      const party = window.AI.getParty();
      const caster = party?.characters?.[idx];
      if (!caster) return 0;
      return typeof caster.mp === 'object' ? caster.mp?.current : caster.mp;
    }, casterIndex);
    expect(finalMP).toBeLessThan(initialMP);
  });

  test('spell target selection for enemy-targeted spells', async ({ page }) => {
    await page.goto('http://localhost:8080');

    // Fast-fail if AI doesn't load
    const aiLoaded = await page.waitForFunction(
      () => typeof window.AI !== 'undefined',
      { timeout: 2000 }
    ).catch(() => false);
    if (!aiLoaded) throw new Error('AI interface failed to load');

    // Quick navigation to dungeon
    const navigationResult = await page.evaluate(async () => {
      // Start game
      window.AI.sendKey('Enter');
      for (let i = 0; i < 20; i++) {
        if (window.AI.getScene() === 'New Game') break;
        await new Promise(r => setTimeout(r, 100));
      }
      if (window.AI.getScene() !== 'New Game') return { error: 'Failed to reach New Game menu' };

      // Auto-generate goes straight to dungeon
      window.AI.sendKey('ArrowDown');
      window.AI.sendKey('Enter');
      for (let i = 0; i < 30; i++) {
        const scene = window.AI.getScene();
        if (scene?.toLowerCase() === 'dungeon') return { success: true };
        await new Promise(r => setTimeout(r, 100));
      }
      return { error: `Failed to reach dungeon, stuck at: ${window.AI.getScene()}` };
    });
    if (navigationResult.error) throw new Error(navigationResult.error);

    // Trigger combat
    const combatResult = await page.evaluate(async () => {
      for (let attempts = 0; attempts < 15; attempts++) {
        window.AI.sendKey('ArrowUp');

        for (let i = 0; i < 10; i++) {
          if (window.AI.getScene() === 'Combat') {
            const enemies = window.AI.getCombat().enemies;
            if (!enemies?.length) return { error: 'Combat has no enemies' };
            return { success: true, enemyCount: enemies.length };
          }
          await new Promise(r => setTimeout(r, 50));
        }
      }
      return { error: 'Could not trigger combat' };
    });
    if (combatResult.error) throw new Error(combatResult.error);
    expect(combatResult.enemyCount).toBeGreaterThan(0);

    // Test spell targeting
    const targetingResult = await page.evaluate(async () => {
      // Open spell menu
      window.AI.sendKey('m');
      for (let i = 0; i < 20; i++) {
        if (window.AI.getCombat().spellMenuOpen) break;
        await new Promise(r => setTimeout(r, 100));
      }
      if (!window.AI.getCombat().spellMenuOpen) return { error: 'Spell menu did not open' };

      // Select spell
      window.AI.sendKey('1');
      for (let i = 0; i < 20; i++) {
        const combat = window.AI.getCombat();
        if (combat.targetSelectionActive) {
          const initialTarget = combat.selectedTarget;

          // Test target switching if multiple enemies
          if (combat.enemies?.length > 1) {
            window.AI.sendKey('ArrowRight');
            await new Promise(r => setTimeout(r, 200));
            const newTarget = window.AI.getCombat().selectedTarget;
            if (newTarget === initialTarget) return { error: 'Target did not change' };

            window.AI.sendKey('ArrowLeft');
            await new Promise(r => setTimeout(r, 200));
          }

          // Cast spell
          const mpBefore = window.AI.getParty().characters[0].mp.current;
          window.AI.sendKey('Enter');

          // Wait for completion
          for (let j = 0; j < 20; j++) {
            const newCombat = window.AI.getCombat();
            if (!newCombat.targetSelectionActive && !newCombat.spellMenuOpen) {
              const mpAfter = window.AI.getParty().characters[0].mp.current;
              return { success: true, mpUsed: mpBefore - mpAfter };
            }
            await new Promise(r => setTimeout(r, 100));
          }
          return { error: 'Spell did not complete' };
        }
        if (!combat.spellMenuOpen) break;
        await new Promise(r => setTimeout(r, 100));
      }
      return { error: 'No target selection occurred' };
    });

    if (targetingResult.error) throw new Error(targetingResult.error);
    expect(targetingResult.mpUsed).toBeGreaterThan(0);
  });
});