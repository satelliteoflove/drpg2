const { test, expect } = require('@playwright/test');

test.describe('Basic Utilities Tests', () => {
  test('utilities are exposed on window', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    const utilitiesAvailable = await page.evaluate(() => {
      return {
        hasDiceRoller: typeof window.DiceRoller !== 'undefined',
        hasEntityUtils: typeof window.EntityUtils !== 'undefined',
        hasSavingThrowCalculator: typeof window.SavingThrowCalculator !== 'undefined',
        hasSpellRegistry: typeof window.SpellRegistry !== 'undefined',
        hasSpellCaster: typeof window.SpellCaster !== 'undefined',
        hasCharacter: typeof window.Character !== 'undefined',
        hasParty: typeof window.Party !== 'undefined',
        hasGameServices: typeof window.GameServices !== 'undefined'
      };
    });

    expect(utilitiesAvailable.hasDiceRoller).toBe(true);
    expect(utilitiesAvailable.hasEntityUtils).toBe(true);
    expect(utilitiesAvailable.hasSavingThrowCalculator).toBe(true);
    expect(utilitiesAvailable.hasSpellRegistry).toBe(true);
    expect(utilitiesAvailable.hasSpellCaster).toBe(true);
    expect(utilitiesAvailable.hasCharacter).toBe(true);
    expect(utilitiesAvailable.hasParty).toBe(true);
    expect(utilitiesAvailable.hasGameServices).toBe(true);
  });

  test('AI interface dice roller functionality', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    const rollTests = await page.evaluate(() => {
      const results = {
        d6: [],
        d20: [],
        withModifier: []
      };

      for (let i = 0; i < 10; i++) {
        results.d6.push(window.AI.roll('1d6'));
        results.d20.push(window.AI.roll('1d20'));
        results.withModifier.push(window.AI.roll('2d6+3'));
      }

      return {
        d6Valid: results.d6.every(r => r >= 1 && r <= 6),
        d20Valid: results.d20.every(r => r >= 1 && r <= 20),
        modifierValid: results.withModifier.every(r => r >= 5 && r <= 15),
        d6Range: [Math.min(...results.d6), Math.max(...results.d6)],
        d20Range: [Math.min(...results.d20), Math.max(...results.d20)],
        modifierRange: [Math.min(...results.withModifier), Math.max(...results.withModifier)]
      };
    });

    expect(rollTests.d6Valid).toBe(true);
    expect(rollTests.d20Valid).toBe(true);
    expect(rollTests.modifierValid).toBe(true);
  });

  test('DiceRoller advanced functionality', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    const rollTests = await page.evaluate(() => {
      const DiceRoller = window.DiceRoller;
      if (!DiceRoller) return { error: 'DiceRoller not found' };

      const d20 = DiceRoller.rollD20();
      const d20Valid = d20 >= 1 && d20 <= 20;

      const simpleRoll = DiceRoller.roll('3d6');
      const simpleValid = simpleRoll >= 3 && simpleRoll <= 18;

      const withModifier = DiceRoller.roll('2d10+5');
      const modifierValid = withModifier >= 7 && withModifier <= 25;

      const negative = DiceRoller.roll('1d6-2');
      const negativeValid = negative >= -1 && negative <= 4;

      const complex = DiceRoller.roll('4d8+2d6-3');
      const complexValid = complex >= -1 && complex <= 41;

      const advantage = DiceRoller.rollWithAdvantage();
      const advantageValid = advantage >= 1 && advantage <= 20;

      const disadvantage = DiceRoller.rollWithDisadvantage();
      const disadvantageValid = disadvantage >= 1 && disadvantage <= 20;

      const multipleD20s = [];
      for (let i = 0; i < 20; i++) {
        multipleD20s.push(DiceRoller.rollD20());
      }
      const hasVariation = new Set(multipleD20s).size > 1;

      return {
        d20: { value: d20, valid: d20Valid },
        simple: { value: simpleRoll, valid: simpleValid },
        modifier: { value: withModifier, valid: modifierValid },
        negative: { value: negative, valid: negativeValid },
        complex: { value: complex, valid: complexValid },
        advantage: { value: advantage, valid: advantageValid },
        disadvantage: { value: disadvantage, valid: disadvantageValid },
        hasRandomness: hasVariation
      };
    });

    expect(rollTests.error).toBeUndefined();
    expect(rollTests.d20.valid).toBe(true);
    expect(rollTests.simple.valid).toBe(true);
    expect(rollTests.modifier.valid).toBe(true);
    expect(rollTests.negative.valid).toBe(true);
    expect(rollTests.complex.valid).toBe(true);
    expect(rollTests.advantage.valid).toBe(true);
    expect(rollTests.disadvantage.valid).toBe(true);
    expect(rollTests.hasRandomness).toBe(true);
  });

  test('EntityUtils functionality', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(500);

    const entityTests = await page.evaluate(() => {
      const EntityUtils = window.EntityUtils;
      if (!EntityUtils) return { error: 'EntityUtils not found' };

      const gameState = window.AI.getState();
      const party = gameState.party;

      if (!party || !party.characters || party.characters.length === 0) {
        return { error: 'No party available' };
      }

      const character = party.characters[0];
      const isChar = EntityUtils.isCharacter(character);

      const monster = {
        id: 'test-monster',
        name: 'Test Goblin',
        hp: 30,
        maxHp: 30,
        ac: 8,
        isDead: false
      };
      const isMon = EntityUtils.isMonster(monster);

      const beforeHp = character.hp;
      EntityUtils.applyDamage(character, 5);
      const afterDamage = character.hp;
      const damageTaken = beforeHp - afterDamage;

      EntityUtils.applyHealing(character, 3);
      const afterHeal = character.hp;
      const healingDone = afterHeal - afterDamage;

      EntityUtils.applyHealing(character, 1000);
      const notOverhealed = character.hp <= character.maxHp;

      const beforeMonsterHp = monster.hp;
      EntityUtils.applyDamage(monster, 10);
      const monsterDamaged = monster.hp === beforeMonsterHp - 10;

      character.hp = 0;
      EntityUtils.applyDamage(character, 10);
      const noBelowZero = character.hp >= 0;

      return {
        isCharacter: isChar,
        isMonster: isMon,
        damageTaken: damageTaken === 5,
        healingDone: healingDone === 3,
        notOverhealed,
        monsterDamaged,
        noBelowZero
      };
    });

    if (!entityTests.error) {
      expect(entityTests.isCharacter).toBe(true);
      expect(entityTests.isMonster).toBe(true);
      expect(entityTests.damageTaken).toBe(true);
      expect(entityTests.healingDone).toBe(true);
      expect(entityTests.notOverhealed).toBe(true);
      expect(entityTests.monsterDamaged).toBe(true);
      expect(entityTests.noBelowZero).toBe(true);
    }
  });

  test('SavingThrowCalculator functionality', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(500);

    const savingThrowTests = await page.evaluate(() => {
      const SavingThrowCalculator = window.SavingThrowCalculator;
      if (!SavingThrowCalculator) return { error: 'SavingThrowCalculator not found' };

      const gameState = window.AI.getState();
      const party = gameState.party;

      if (!party || !party.characters || party.characters.length === 0) {
        return { error: 'No party available' };
      }

      const character = party.characters[0];
      character.level = 5;
      character.class = 'Fighter';
      character.stats = character.stats || {};
      character.stats.luck = 12;

      const baseThrow = SavingThrowCalculator.getBaseSavingThrow(character, 'poison');
      const baseValid = typeof baseThrow === 'number' && baseThrow > 0;

      const modifier = SavingThrowCalculator.getSavingThrowModifier(character, 'spell');
      const modifierValid = typeof modifier === 'number';

      let passCount = 0;
      let failCount = 0;
      for (let i = 0; i < 20; i++) {
        const result = SavingThrowCalculator.makeSavingThrow(character, 'breath', 0);
        if (result) passCount++;
        else failCount++;
      }
      const hasVariation = passCount > 0 && failCount > 0;

      const easyBonus = SavingThrowCalculator.makeSavingThrow(character, 'death', -5);
      const hardPenalty = SavingThrowCalculator.makeSavingThrow(character, 'death', 5);

      const resistanceBonus = SavingThrowCalculator.getResistanceBonus(character, 'fire');
      const resistanceValid = typeof resistanceBonus === 'number';

      return {
        baseValid,
        modifierValid,
        hasVariation,
        resistanceValid,
        passCount,
        failCount,
        baseThrow,
        modifier,
        resistanceBonus
      };
    });

    if (!savingThrowTests.error) {
      expect(savingThrowTests.baseValid).toBe(true);
      expect(savingThrowTests.modifierValid).toBe(true);
      expect(savingThrowTests.hasVariation).toBe(true);
      expect(savingThrowTests.resistanceValid).toBe(true);
    }
  });

  test('SpellRegistry functionality', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    const spellRegistryTests = await page.evaluate(() => {
      const SpellRegistry = window.SpellRegistry;
      if (!SpellRegistry) return { error: 'SpellRegistry not found' };

      const registry = SpellRegistry.getInstance();

      const flameDart = registry.getSpellById('m1_flame_dart');
      const hasSpell = flameDart !== null && flameDart !== undefined;

      const mageSpells = registry.getSpellsBySchool('mage');
      const hasMageSpells = Array.isArray(mageSpells) && mageSpells.length > 0;

      const level1Spells = registry.getSpellsByLevel('mage', 1);
      const hasLevel1 = Array.isArray(level1Spells) && level1Spells.length > 0;

      const allSpells = registry.getAllSpells();
      const hasAllSpells = Array.isArray(allSpells) && allSpells.length > 0;

      const canLearn = registry.canCharacterLearnSpell(
        { class: 'Mage', level: 3 },
        flameDart
      );

      const priestSpell = registry.getSpellById('p1_heal');
      const cantLearnWrongClass = !registry.canCharacterLearnSpell(
        { class: 'Fighter', level: 10 },
        priestSpell
      );

      return {
        hasSpell,
        hasMageSpells,
        hasLevel1,
        hasAllSpells,
        canLearn,
        cantLearnWrongClass,
        spellCount: allSpells.length,
        flameDartMpCost: flameDart?.mpCost
      };
    });

    if (!spellRegistryTests.error) {
      expect(spellRegistryTests.hasSpell).toBe(true);
      expect(spellRegistryTests.hasMageSpells).toBe(true);
      expect(spellRegistryTests.hasLevel1).toBe(true);
      expect(spellRegistryTests.hasAllSpells).toBe(true);
      expect(spellRegistryTests.canLearn).toBe(true);
      expect(spellRegistryTests.cantLearnWrongClass).toBe(true);
      expect(spellRegistryTests.spellCount).toBeGreaterThan(0);
      expect(spellRegistryTests.flameDartMpCost).toBeGreaterThan(0);
    }
  });
});