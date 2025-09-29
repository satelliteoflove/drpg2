import { test, expect } from '@playwright/test';

test.describe.skip('Spell UI Integration', () => {
  test('spell menu opens in combat and allows spell selection', async ({ page }) => {
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

    if (!dungeonReached) {
      const scene = await page.evaluate(() => window.AI.getScene());
      throw new Error(`Failed to reach dungeon. Current scene: ${scene}`);
    }

    const initialMP = await page.evaluate(() => {
      const party = window.AI.getParty();
      return party?.characters?.[0]?.mp?.current || 0;
    });
    expect(initialMP).toBeGreaterThan(0);

    let combatFound = false;
    for (let attempts = 0; attempts < 10; attempts++) {
      await page.evaluate(() => window.AI.sendKey('ArrowUp'));
      await page.waitForTimeout(100);

      const scene = await page.evaluate(() => window.AI.getScene());
      if (scene === 'Combat') {
        combatFound = true;
        break;
      }
    }

    if (!combatFound) {
      throw new Error('Failed to trigger combat after 10 movement attempts');
    }

    const combatInfo1 = await page.evaluate(() => window.AI.getCombat());
    expect(combatInfo1.inCombat).toBe(true);
    expect(combatInfo1.spellMenuOpen).toBe(false);

    await page.evaluate(() => window.AI.sendKey('m'));
    await page.waitForTimeout(200);

    const combatInfo2 = await page.evaluate(() => window.AI.getCombat());
    expect(combatInfo2.spellMenuOpen).toBe(true);

    const spellMenuInfo = await page.evaluate(() => window.AI.getSpellMenu?.() || {
      isOpen: window.AI.getCombat().spellMenuOpen,
      knownSpells: window.AI.getParty()?.characters?.[0]?.knownSpells || []
    });
    expect(spellMenuInfo.isOpen).toBe(true);

    await page.evaluate(() => window.AI.sendKey('1'));
    await page.waitForTimeout(200);

    const combatInfo3 = await page.evaluate(() => window.AI.getCombat());
    if (combatInfo3.targetSelectionActive) {
      await page.evaluate(() => window.AI.sendKey('Enter'));
      await page.waitForTimeout(500);
    }

    const finalMP = await page.evaluate(() => {
      const party = window.AI.getParty();
      return party?.characters?.[0]?.mp?.current || 0;
    });
    expect(finalMP).toBeLessThan(initialMP);
  });

  test('spell target selection for enemy-targeted spells', async ({ page }) => {
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

    if (!dungeonReached) {
      const scene = await page.evaluate(() => window.AI.getScene());
      throw new Error(`Failed to reach dungeon. Current scene: ${scene}`);
    }

    let combatFound = false;
    for (let attempts = 0; attempts < 10; attempts++) {
      await page.evaluate(() => window.AI.sendKey('ArrowUp'));
      await page.waitForTimeout(100);

      const scene = await page.evaluate(() => window.AI.getScene());
      if (scene === 'Combat') {
        combatFound = true;
        break;
      }
    }

    if (!combatFound) {
      throw new Error('Failed to trigger combat after 10 movement attempts');
    }

    const enemiesBefore = await page.evaluate(() => {
      const combat = window.AI.getCombat();
      return combat.enemies?.length || 0;
    });
    expect(enemiesBefore).toBeGreaterThan(0);

    await page.evaluate(() => window.AI.sendKey('m'));
    await page.waitForTimeout(200);

    const spellMenuOpen = await page.evaluate(() => window.AI.getCombat().spellMenuOpen);
    expect(spellMenuOpen).toBe(true);

    await page.evaluate(() => window.AI.sendKey('1'));
    await page.waitForTimeout(200);

    const targetState = await page.evaluate(() => {
      const combat = window.AI.getCombat();
      return {
        targetSelectionActive: combat.targetSelectionActive,
        selectedTarget: combat.selectedTarget,
        enemyCount: combat.enemies?.length || 0
      };
    });

    if (targetState.targetSelectionActive) {
      if (targetState.enemyCount > 1) {
        await page.evaluate(() => window.AI.sendKey('ArrowRight'));
        await page.waitForTimeout(100);

        const afterTargetChange = await page.evaluate(() => {
          const combat = window.AI.getCombat();
          return combat.selectedTarget;
        });
        expect(afterTargetChange).not.toBe(targetState.selectedTarget);

        await page.evaluate(() => window.AI.sendKey('ArrowLeft'));
        await page.waitForTimeout(100);
      }

      await page.evaluate(() => window.AI.sendKey('Enter'));
      await page.waitForTimeout(500);

      const afterCast = await page.evaluate(() => {
        const party = window.AI.getParty();
        const combat = window.AI.getCombat();
        return {
          mpUsed: party?.characters?.[0]?.mp?.current < party?.characters?.[0]?.mp?.max,
          spellMenuOpen: combat.spellMenuOpen
        };
      });

      expect(afterCast.mpUsed).toBeTruthy();
      expect(afterCast.spellMenuOpen).toBe(false);
    }
  });
});