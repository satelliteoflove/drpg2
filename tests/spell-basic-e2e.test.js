import { test, expect } from '@playwright/test';

test.describe('Basic Spell System E2E', () => {
  test('spell system loads and characters have spells', async ({ page }) => {
    await page.goto('http://localhost:8080');

    await page.waitForTimeout(2000);

    const spellSystemReady = await page.evaluate(() => {
      try {
        const { Character } = window;
        const { SpellRegistry } = window;
        const { SpellCaster } = window;

        if (!Character || !SpellRegistry || !SpellCaster) {
          return { error: 'Missing spell classes' };
        }

        const mage = new Character('TestMage', 'Human', 'Mage', 'Good');
        const priest = new Character('TestPriest', 'Elf', 'Priest', 'Good');

        const registry = SpellRegistry.getInstance();
        const spellCaster = SpellCaster.getInstance();

        const flameDart = registry.getSpellById('flame_dart');
        const heal = registry.getSpellById('heal');

        return {
          success: true,
          mageHasSpells: mage.knownSpells.length > 0,
          mageKnowsFlameDart: mage.knowsSpell('flame_dart'),
          priestHasSpells: priest.knownSpells.length > 0,
          priestKnowsHealing: priest.knowsSpell('heal'),
          flameDartExists: !!flameDart,
          healingExists: !!heal,
          spellCasterExists: !!spellCaster
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    expect(spellSystemReady.success).toBe(true);
    expect(spellSystemReady.mageHasSpells).toBe(true);
    expect(spellSystemReady.mageKnowsFlameDart).toBe(true);
    expect(spellSystemReady.priestHasSpells).toBe(true);
    expect(spellSystemReady.priestKnowsHealing).toBe(true);
    expect(spellSystemReady.flameDartExists).toBe(true);
    expect(spellSystemReady.healingExists).toBe(true);
    expect(spellSystemReady.spellCasterExists).toBe(true);
  });

  test('damage spell reduces enemy HP', async ({ page }) => {
    await page.goto('http://localhost:8080');

    await page.waitForTimeout(2000);

    const combatResult = await page.evaluate(() => {
      try {
        const { Character } = window;
        const { SpellCaster } = window;

        const mage = new Character('BattleMage', 'Human', 'Mage', 'Good');
        mage.level = 20;
        mage.mp = 50;
        mage.stats.intelligence = 20;

        const monster = {
          name: 'TestOrc',
          hp: 50,
          maxHp: 50,
          ac: 10,
          magicResistance: 0
        };

        // Disable fizzling for tests
        window.testMode = true;

        const context = {
          casterId: mage.id,
          caster: mage,
          target: monster,
          targetId: 'test-monster-1',
          enemies: [monster],
          inCombat: true
        };

        const spellCaster = SpellCaster.getInstance();
        const initialHP = monster.hp;
        const initialMP = mage.mp;

        const knowsSpell = mage.knowsSpell('flame_dart');

        // Try casting up to 3 times in case of fizzle
        let result = spellCaster.castSpell(mage, 'flame_dart', context);
        if (result.fizzled && mage.mp >= 2) {
          result = spellCaster.castSpell(mage, 'flame_dart', context);
        }
        if (result.fizzled && mage.mp >= 2) {
          result = spellCaster.castSpell(mage, 'flame_dart', context);
        }

        return {
          success: result.success,
          knowsSpell: knowsSpell,
          knownSpells: mage.knownSpells,
          messages: result.messages || [],
          allMessages: result.messages ? result.messages.join(', ') : 'No messages',
          initialHP: initialHP,
          finalHP: monster.hp,
          damage: initialHP - monster.hp,
          initialMP: initialMP,
          finalMP: mage.mp,
          mpUsed: initialMP - mage.mp,
          messages: result.messages
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    console.log('Combat result:', combatResult);
    expect(combatResult.knowsSpell).toBe(true);
    expect(combatResult.success).toBe(true);
    expect(combatResult.damage).toBeGreaterThan(0);
    expect(combatResult.finalHP).toBeLessThan(combatResult.initialHP);
    expect(combatResult.mpUsed).toBeGreaterThan(0);
    expect(combatResult.finalMP).toBeLessThan(combatResult.initialMP);
  });

  test('healing spell increases ally HP', async ({ page }) => {
    await page.goto('http://localhost:8080');

    await page.waitForTimeout(2000);

    const healResult = await page.evaluate(() => {
      try {
        const { Character } = window;
        const { SpellCaster } = window;

        const priest = new Character('TestHealer', 'Elf', 'Priest', 'Good');
        priest.level = 10;
        priest.mp = 30;
        priest.stats.intelligence = 16;

        const ally = new Character('WoundedWarrior', 'Dwarf', 'Fighter', 'Good');
        ally.hp = 10;
        ally.maxHp = 30;

        // Disable fizzling for tests
        window.testMode = true;

        const context = {
          casterId: priest.id,
          caster: priest,
          target: ally,
          targetId: ally.id,
          party: [priest, ally],
          inCombat: true
        };

        const spellCaster = SpellCaster.getInstance();
        const initialHP = ally.hp;
        const initialMP = priest.mp;

        // Try casting up to 3 times in case of fizzle
        let result = spellCaster.castSpell(priest, 'heal', context);
        if (result.fizzled && priest.mp >= 3) {
          result = spellCaster.castSpell(priest, 'heal', context);
        }
        if (result.fizzled && priest.mp >= 3) {
          result = spellCaster.castSpell(priest, 'heal', context);
        }

        return {
          success: result.success,
          initialHP: initialHP,
          finalHP: ally.hp,
          healing: ally.hp - initialHP,
          initialMP: initialMP,
          finalMP: priest.mp,
          mpUsed: initialMP - priest.mp,
          messages: result.messages
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    expect(healResult.success).toBe(true);
    expect(healResult.healing).toBeGreaterThan(0);
    expect(healResult.finalHP).toBeGreaterThan(healResult.initialHP);
    expect(healResult.mpUsed).toBeGreaterThan(0);
    expect(healResult.finalMP).toBeLessThan(healResult.initialMP);
  });

  test('spell power scaling works correctly', async ({ page }) => {
    await page.goto('http://localhost:8080');

    await page.waitForTimeout(2000);

    const scalingResult = await page.evaluate(() => {
      try {
        const { Character } = window;
        const { SpellCaster } = window;

        const weakMage = new Character('Novice', 'Human', 'Mage', 'Good');
        weakMage.level = 1;
        weakMage.stats.intelligence = 10;
        weakMage.mp = 50;

        const strongMage = new Character('Archmage', 'Human', 'Mage', 'Good');
        strongMage.level = 10;
        strongMage.stats.intelligence = 20;
        strongMage.mp = 50;

        const spellCaster = SpellCaster.getInstance();

        const weakPower = spellCaster.calculateSpellPower(weakMage, null);
        const strongPower = spellCaster.calculateSpellPower(strongMage, null);

        const testMonster1 = {
          name: 'Dummy1',
          hp: 100,
          maxHp: 100,
          ac: 0,
          magicResistance: 0
        };

        const testMonster2 = {
          name: 'Dummy2',
          hp: 100,
          maxHp: 100,
          ac: 0,
          magicResistance: 0
        };

        const context1 = {
          casterId: weakMage.id,
          caster: weakMage,
          target: testMonster1,
          enemies: [testMonster1],
          inCombat: true
        };

        const context2 = {
          casterId: strongMage.id,
          caster: strongMage,
          target: testMonster2,
          enemies: [testMonster2],
          inCombat: true
        };

        spellCaster.castSpell(weakMage, 'flame_dart', context1);
        spellCaster.castSpell(strongMage, 'flame_dart', context2);

        return {
          success: true,
          weakPower: weakPower,
          strongPower: strongPower,
          weakDamage: 100 - testMonster1.hp,
          strongDamage: 100 - testMonster2.hp,
          scalingWorks: strongPower > weakPower
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    expect(scalingResult.success).toBe(true);
    expect(scalingResult.scalingWorks).toBe(true);
    expect(scalingResult.strongPower).toBeGreaterThan(scalingResult.weakPower);
    expect(scalingResult.strongDamage).toBeGreaterThanOrEqual(scalingResult.weakDamage);
  });
});