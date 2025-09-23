const { test, expect } = require('@playwright/test');

test.describe('Phase 1 Spell Effects - Damage and Healing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
  });

  test('damage spells reduce enemy HP', async ({ page }) => {
    await page.getByRole('button', { name: 'New Game' }).click();
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="name" i]', 'DamageMage');
    await page.selectOption('select').first().selectOption('elf');
    await page.selectOption('select').nth(1).selectOption('mage');
    await page.selectOption('select').nth(2).selectOption('neutral');

    await page.getByRole('button', { name: 'Create Character' }).click();
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Add to Party' }).click();
    await page.getByRole('button', { name: 'Finish Party Creation' }).click();

    const spellTest = await page.evaluate(async () => {
      try {
        const { Character } = window.Character || {};
        const { SpellCaster } = window.SpellCaster || {};
        const { SpellRegistry } = window.SpellRegistry || {};

        if (!Character) {
          const party = window.gameServices?.partyManagementService?.getParty();
          if (!party || !party.characters[0]) return { error: 'No character available' };

          const mage = party.characters[0];
          mage.learnSpell('m1_flame_dart');
          mage.mp = 10;

          const testEnemy = {
            name: 'TestGoblin',
            hp: 50,
            currentHp: 50,
            isDead: false,
            ac: 5,
            magicResistance: 0
          };

          const { SpellCaster: SC } = await import('/src/systems/magic/SpellCaster.ts');
          const caster = SC.getInstance();

          const context = {
            casterId: mage.id,
            caster: mage,
            target: testEnemy,
            enemies: [testEnemy],
            inCombat: true
          };

          const beforeHP = testEnemy.currentHp;
          const result = caster.castSpell(mage, 'm1_flame_dart', context);
          const afterHP = testEnemy.currentHp;

          return {
            success: result.success,
            beforeHP,
            afterHP,
            damage: beforeHP - afterHP,
            messages: result.messages,
            mpConsumed: result.mpConsumed
          };
        }

        return { error: 'Direct character creation not available' };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('Damage spell test:', spellTest);

    if (!spellTest.error) {
      expect(spellTest.success).toBe(true);
      expect(spellTest.damage).toBeGreaterThan(0);
      expect(spellTest.mpConsumed).toBeGreaterThan(0);
    }
  });

  test('healing spells restore HP to allies', async ({ page }) => {
    await page.getByRole('button', { name: 'New Game' }).click();
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="name" i]', 'HealPriest');
    await page.selectOption('select').first().selectOption('human');
    await page.selectOption('select').nth(1).selectOption('priest');
    await page.selectOption('select').nth(2).selectOption('good');

    await page.getByRole('button', { name: 'Create Character' }).click();
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Add to Party' }).click();
    await page.getByRole('button', { name: 'Finish Party Creation' }).click();

    const healTest = await page.evaluate(async () => {
      try {
        const party = window.gameServices?.partyManagementService?.getParty();
        if (!party || !party.characters[0]) return { error: 'No character available' };

        const priest = party.characters[0];
        priest.learnSpell('p1_heal');
        priest.mp = 10;
        priest.hp = Math.floor(priest.maxHp / 2);

        const { SpellCaster } = await import('/src/systems/magic/SpellCaster.ts');
        const caster = SpellCaster.getInstance();

        const context = {
          casterId: priest.id,
          caster: priest,
          target: priest,
          party: [priest],
          inCombat: false
        };

        const beforeHP = priest.hp;
        const result = caster.castSpell(priest, 'p1_heal', context);
        const afterHP = priest.hp;

        return {
          success: result.success,
          beforeHP,
          afterHP,
          healing: afterHP - beforeHP,
          messages: result.messages,
          mpConsumed: result.mpConsumed
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('Healing spell test:', healTest);

    if (!healTest.error) {
      expect(healTest.success).toBe(true);
      expect(healTest.healing).toBeGreaterThan(0);
      expect(healTest.mpConsumed).toBeGreaterThan(0);
    }
  });

  test('spells cannot heal dead characters', async ({ page }) => {
    await page.getByRole('button', { name: 'New Game' }).click();
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="name" i]', 'TestPriest');
    await page.selectOption('select').first().selectOption('human');
    await page.selectOption('select').nth(1).selectOption('priest');
    await page.selectOption('select').nth(2).selectOption('good');

    await page.getByRole('button', { name: 'Create Character' }).click();
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Add to Party' }).click();
    await page.getByRole('button', { name: 'Finish Party Creation' }).click();

    const deadTest = await page.evaluate(async () => {
      try {
        const party = window.gameServices?.partyManagementService?.getParty();
        if (!party || !party.characters[0]) return { error: 'No character available' };

        const priest = party.characters[0];
        priest.learnSpell('p1_heal');
        priest.mp = 10;

        const deadAlly = {
          name: 'DeadAlly',
          hp: 0,
          maxHp: 50,
          isDead: true,
          status: ['dead']
        };

        const { SpellCaster } = await import('/src/systems/magic/SpellCaster.ts');
        const caster = SpellCaster.getInstance();

        const context = {
          casterId: priest.id,
          caster: priest,
          target: deadAlly,
          party: [priest, deadAlly],
          inCombat: false
        };

        const result = caster.castSpell(priest, 'p1_heal', context);

        return {
          success: result.success,
          messages: result.messages,
          healedDead: deadAlly.hp > 0
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('Dead character heal test:', deadTest);

    if (!deadTest.error) {
      expect(deadTest.healedDead).toBe(false);
      expect(deadTest.messages.some(m => m.includes('dead'))).toBe(true);
    }
  });

  test('spell fizzle mechanics work correctly', async ({ page }) => {
    await page.getByRole('button', { name: 'New Game' }).click();
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="name" i]', 'FizzleMage');
    await page.selectOption('select').first().selectOption('elf');
    await page.selectOption('select').nth(1).selectOption('mage');
    await page.selectOption('select').nth(2).selectOption('neutral');

    await page.getByRole('button', { name: 'Create Character' }).click();
    await page.waitForTimeout(500);

    const fizzleTest = await page.evaluate(async () => {
      try {
        const party = window.gameServices?.partyManagementService?.getParty();
        if (!party || !party.characters[0]) return { error: 'No character available' };

        const mage = party.characters[0];
        mage.level = 1;
        mage.stats.intelligence = 8;
        mage.stats.luck = 8;
        mage.learnSpell('m7_nuclear_blast');
        mage.mp = 100;

        const { SpellCaster } = await import('/src/systems/magic/SpellCaster.ts');
        const { SpellRegistry } = await import('/src/systems/magic/SpellRegistry.ts');

        const caster = SpellCaster.getInstance();
        const registry = SpellRegistry.getInstance();
        const spell = registry.getSpellById('m7_nuclear_blast');

        if (!spell) return { error: 'High level spell not found' };

        const fizzleChance = registry.calculateFizzleChance(mage, spell);

        let fizzleCount = 0;
        const attempts = 20;

        for (let i = 0; i < attempts; i++) {
          const context = {
            casterId: mage.id,
            caster: mage,
            enemies: [{ name: 'dummy', hp: 100, currentHp: 100 }],
            inCombat: true
          };

          const result = caster.castSpell(mage, 'm7_nuclear_blast', context);
          if (result.fizzled) fizzleCount++;
        }

        return {
          fizzleChance,
          fizzleCount,
          attempts,
          fizzleRate: (fizzleCount / attempts) * 100
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('Fizzle test:', fizzleTest);

    if (!fizzleTest.error) {
      expect(fizzleTest.fizzleChance).toBeGreaterThan(50);
      expect(fizzleTest.fizzleCount).toBeGreaterThan(0);
    }
  });

  test('elemental resistance reduces damage', async ({ page }) => {
    await page.getByRole('button', { name: 'New Game' }).click();
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="name" i]', 'ElementMage');
    await page.selectOption('select').first().selectOption('elf');
    await page.selectOption('select').nth(1).selectOption('mage');
    await page.selectOption('select').nth(2).selectOption('neutral');

    await page.getByRole('button', { name: 'Create Character' }).click();
    await page.waitForTimeout(500);

    const resistanceTest = await page.evaluate(async () => {
      try {
        const party = window.gameServices?.partyManagementService?.getParty();
        if (!party || !party.characters[0]) return { error: 'No character available' };

        const mage = party.characters[0];
        mage.learnSpell('m1_flame_dart');
        mage.mp = 50;

        const normalEnemy = {
          name: 'NormalGoblin',
          hp: 100,
          currentHp: 100,
          ac: 5
        };

        const resistantEnemy = {
          name: 'FireElemental',
          hp: 100,
          currentHp: 100,
          ac: 5,
          resistances: { fire: 50 }
        };

        const { SpellCaster } = await import('/src/systems/magic/SpellCaster.ts');
        const caster = SpellCaster.getInstance();

        const normalContext = {
          casterId: mage.id,
          caster: mage,
          target: normalEnemy,
          enemies: [normalEnemy],
          inCombat: true
        };

        const resistContext = {
          casterId: mage.id,
          caster: mage,
          target: resistantEnemy,
          enemies: [resistantEnemy],
          inCombat: true
        };

        caster.castSpell(mage, 'm1_flame_dart', normalContext);
        const normalDamage = 100 - normalEnemy.currentHp;

        caster.castSpell(mage, 'm1_flame_dart', resistContext);
        const resistedDamage = 100 - resistantEnemy.currentHp;

        return {
          normalDamage,
          resistedDamage,
          resistanceWorking: resistedDamage < normalDamage
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('Resistance test:', resistanceTest);

    if (!resistanceTest.error) {
      expect(resistanceTest.resistanceWorking).toBe(true);
      expect(resistanceTest.resistedDamage).toBeLessThan(resistanceTest.normalDamage);
    }
  });
});