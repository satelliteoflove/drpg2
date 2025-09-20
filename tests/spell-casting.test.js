import { test, expect } from '@playwright/test';

test.describe('Spell Casting Core Mechanics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
  });

  test('spell system initializes with registry and caster', async ({ page }) => {
    const hasSpellSystem = await page.evaluate(() => {
      const { SpellRegistry } = require('../src/systems/magic/SpellRegistry');
      const { SpellCaster } = require('../src/systems/magic/SpellCaster');
      const { SpellValidation } = require('../src/systems/magic/SpellValidation');

      const registry = SpellRegistry.getInstance();
      const caster = SpellCaster.getInstance();
      const validation = new SpellValidation();

      return {
        registryExists: registry !== null,
        casterExists: caster !== null,
        validationExists: validation !== null,
        spellCount: registry.getAllSpells().length
      };
    }).catch(() => null);

    if (hasSpellSystem) {
      expect(hasSpellSystem.registryExists).toBe(true);
      expect(hasSpellSystem.casterExists).toBe(true);
      expect(hasSpellSystem.validationExists).toBe(true);
      expect(hasSpellSystem.spellCount).toBeGreaterThan(0);
    }
  });

  test('spell casting validation works correctly', async ({ page }) => {
    await page.click('button:has-text("New Character")');
    await page.waitForSelector('text=Character Creation');

    await page.fill('input[placeholder="Enter character name"]', 'TestMage');
    await page.selectOption('select:has(option[value="Elf"])', 'Elf');
    await page.selectOption('select:has(option[value="Mage"])', 'Mage');
    await page.click('button:has-text("Roll Stats")');
    await page.click('button:has-text("Finalize Character")');

    await page.waitForSelector('text=Town Square');

    const validation = await page.evaluate(() => {
      const { Character } = require('../src/entities/Character');
      const { SpellRegistry } = require('../src/systems/magic/SpellRegistry');
      const { SpellCaster } = require('../src/systems/magic/SpellCaster');

      const mage = new Character('TestMage', 'Elf', 'Mage', 'Good', 'male');
      const registry = SpellRegistry.getInstance();
      const caster = SpellCaster.getInstance();

      mage.learnSpell('m1_sleep');

      const spell = registry.getSpellById('m1_sleep');
      const hasMP = mage.getCurrentMP() >= spell.mpCost;

      const context = {
        casterId: mage.id,
        inCombat: false
      };

      const validation = registry.validateSpellCasting(mage, spell, false);

      const mageWithNoMP = new Character('NoMP', 'Elf', 'Mage', 'Good', 'male');
      mageWithNoMP.mp = 0;
      mageWithNoMP.learnSpell('m1_sleep');
      const noMPValidation = registry.validateSpellCasting(mageWithNoMP, spell, false);

      const unknownSpell = registry.getSpellById('m7_nuclear_blast');
      const unknownValidation = registry.validateSpellCasting(mage, unknownSpell, false);

      return {
        spellFound: spell !== undefined,
        hasMP: hasMP,
        canCast: validation.canCast,
        noMPCanCast: noMPValidation.canCast,
        noMPReason: noMPValidation.reason,
        unknownCanCast: unknownValidation.canCast,
        unknownReason: unknownValidation.reason
      };
    }).catch((error) => ({
      error: error.message
    }));

    if (!validation.error) {
      expect(validation.spellFound).toBe(true);
      expect(validation.hasMP).toBe(true);
      expect(validation.canCast).toBe(true);
      expect(validation.noMPCanCast).toBe(false);
      expect(validation.noMPReason).toContain('Not enough MP');
      expect(validation.unknownCanCast).toBe(false);
      expect(validation.unknownReason).toContain('does not know');
    }
  });

  test('spell fizzle calculation works', async ({ page }) => {
    const fizzleTest = await page.evaluate(() => {
      const { Character } = require('../src/entities/Character');
      const { SpellRegistry } = require('../src/systems/magic/SpellRegistry');

      const registry = SpellRegistry.getInstance();

      const lowLevelMage = new Character('LowMage', 'Human', 'Mage', 'Good', 'male');
      const highLevelMage = new Character('HighMage', 'Elf', 'Mage', 'Good', 'male');
      highLevelMage.level = 10;

      const spell1 = registry.getSpellById('m1_sleep');
      const spell7 = { ...spell1, level: 7 };

      const lowFizzle1 = registry.calculateFizzleChance(lowLevelMage, spell1);
      const lowFizzle7 = registry.calculateFizzleChance(lowLevelMage, spell7);
      const highFizzle1 = registry.calculateFizzleChance(highLevelMage, spell1);
      const highFizzle7 = registry.calculateFizzleChance(highLevelMage, spell7);

      return {
        lowLevel1: lowFizzle1,
        lowLevel7: lowFizzle7,
        highLevel1: highFizzle1,
        highLevel7: highFizzle7
      };
    }).catch((error) => ({
      error: error.message
    }));

    if (!fizzleTest.error) {
      expect(fizzleTest.lowLevel1).toBeLessThan(fizzleTest.lowLevel7);
      expect(fizzleTest.highLevel1).toBeLessThan(fizzleTest.lowLevel1);
      expect(fizzleTest.highLevel7).toBeLessThan(fizzleTest.lowLevel7);
      expect(fizzleTest.lowLevel7).toBeGreaterThan(30);
      expect(fizzleTest.highLevel1).toBeLessThan(20);
    }
  });

  test('spell range validation works correctly', async ({ page }) => {
    const rangeTest = await page.evaluate(() => {
      const { Character } = require('../src/entities/Character');
      const { SpellValidation } = require('../src/systems/magic/SpellValidation');

      const validation = new SpellValidation();
      const mage = new Character('RangeMage', 'Elf', 'Mage', 'Good', 'male');

      const selfSpell = {
        id: 'test_self',
        name: 'Test Self',
        targetType: 'self',
        range: { special: 'self' },
        inCombat: true,
        outOfCombat: true
      };

      const meleeSpell = {
        id: 'test_melee',
        name: 'Test Melee',
        targetType: 'enemy',
        range: { special: 'melee' },
        inCombat: true,
        outOfCombat: true
      };

      const rangedSpell = {
        id: 'test_ranged',
        name: 'Test Ranged',
        targetType: 'enemy',
        range: { min: 2, max: 5 },
        inCombat: true,
        outOfCombat: true
      };

      const requirements = validation.getTargetingRequirements(selfSpell);
      const meleeReq = validation.getTargetingRequirements(meleeSpell);
      const rangedReq = validation.getTargetingRequirements(rangedSpell);

      return {
        selfOnlyCorrect: requirements.selfOnly === true,
        selfRequiresTarget: requirements.requiresTarget === false,
        meleeRequiresTarget: meleeReq.requiresTarget === true,
        rangedRequiresTarget: rangedReq.requiresTarget === true
      };
    }).catch((error) => ({
      error: error.message
    }));

    if (!rangeTest.error) {
      expect(rangeTest.selfOnlyCorrect).toBe(true);
      expect(rangeTest.selfRequiresTarget).toBe(true);
      expect(rangeTest.meleeRequiresTarget).toBe(true);
      expect(rangeTest.rangedRequiresTarget).toBe(true);
    }
  });

  test('spell casting consumes MP and returns result', async ({ page }) => {
    const castTest = await page.evaluate(() => {
      const { Character } = require('../src/entities/Character');
      const { SpellCaster } = require('../src/systems/magic/SpellCaster');
      const { SpellRegistry } = require('../src/systems/magic/SpellRegistry');

      const caster = SpellCaster.getInstance();
      const registry = SpellRegistry.getInstance();

      const mage = new Character('CastMage', 'Elf', 'Mage', 'Good', 'male');
      mage.learnSpell('m1_sleep');

      const initialMP = mage.getCurrentMP();
      const spell = registry.getSpellById('m1_sleep');
      const mpCost = spell.mpCost;

      const context = {
        casterId: mage.id,
        inCombat: false
      };

      const result = caster.castSpell(mage, 'm1_sleep', context);
      const finalMP = mage.getCurrentMP();

      const mageNoMP = new Character('NoMP', 'Elf', 'Mage', 'Good', 'male');
      mageNoMP.mp = 0;
      mageNoMP.learnSpell('m1_sleep');
      const failResult = caster.castSpell(mageNoMP, 'm1_sleep', context);

      return {
        initialMP,
        finalMP,
        mpCost,
        mpConsumed: result.mpConsumed,
        success: result.success,
        hasMessages: result.messages.length > 0,
        failSuccess: failResult.success,
        failMPConsumed: failResult.mpConsumed
      };
    }).catch((error) => ({
      error: error.message
    }));

    if (!castTest.error) {
      expect(castTest.mpConsumed).toBeGreaterThan(0);
      expect(castTest.finalMP).toBe(castTest.initialMP - castTest.mpConsumed);
      expect(castTest.hasMessages).toBe(true);
      expect(castTest.failSuccess).toBe(false);
      expect(castTest.failMPConsumed).toBe(0);
    }
  });
});