const { test, expect } = require('@playwright/test');

test.describe('Dice Roller Utility Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
  });

  test('dice roller handles all notation types in combat', async ({ page }) => {
    const diceRollerTest = await page.evaluate(() => {
      const DiceRoller = window.DiceRoller;

      if (!DiceRoller) {
        return { error: 'DiceRoller not found on window' };
      }

      const basicRoll = DiceRoller.roll('2d6+3');
      const basicValid = basicRoll >= 5 && basicRoll <= 15;

      const multipleRolls = DiceRoller.rollMultiple('1d6', 3);
      const multipleValid = multipleRolls.length === 3 && multipleRolls.every(r => r >= 1 && r <= 6);

      const advantageRoll = DiceRoller.rollWithAdvantage('1d20');
      const disadvantageRoll = DiceRoller.rollWithDisadvantage('1d20');
      const advDisValid = advantageRoll >= 1 && advantageRoll <= 20 && disadvantageRoll >= 1 && disadvantageRoll <= 20;

      const rangeRoll = DiceRoller.rollInRange(10, 20);
      const rangeValid = rangeRoll >= 10 && rangeRoll <= 20;

      const percentileRoll = DiceRoller.rollPercentile();
      const percentileValid = percentileRoll >= 1 && percentileRoll <= 100;

      const d20Roll = DiceRoller.rollD20();
      const d20Valid = d20Roll >= 1 && d20Roll <= 20;

      const successCheck = DiceRoller.checkSuccess(75);
      const successValid = typeof successCheck === 'boolean';

      const formulaResult = DiceRoller.evaluateFormula('1d8+level*2', 5);
      const formulaValid = formulaResult >= 11 && formulaResult <= 18;

      const negativeModifier = DiceRoller.roll('1d6-2');
      const negativeValid = negativeModifier >= -1 && negativeModifier <= 4;

      const multiDiceTypes = DiceRoller.roll('1d4+1d6+1d8');
      const multiValid = multiDiceTypes >= 3 && multiDiceTypes <= 18;

      return {
        basicRoll: { result: basicRoll, valid: basicValid },
        multipleRolls: { results: multipleRolls, valid: multipleValid },
        advantageDisadvantage: { advantage: advantageRoll, disadvantage: disadvantageRoll, valid: advDisValid },
        rangeRoll: { result: rangeRoll, valid: rangeValid },
        percentileRoll: { result: percentileRoll, valid: percentileValid },
        d20Roll: { result: d20Roll, valid: d20Valid },
        successCheck: { result: successCheck, valid: successValid },
        formulaEvaluation: { result: formulaResult, valid: formulaValid },
        negativeModifier: { result: negativeModifier, valid: negativeValid },
        multiDiceTypes: { result: multiDiceTypes, valid: multiValid }
      };
    });

    if (diceRollerTest.error) {
      throw new Error(diceRollerTest.error);
    }

    expect(diceRollerTest.basicRoll.valid).toBe(true);
    expect(diceRollerTest.multipleRolls.valid).toBe(true);
    expect(diceRollerTest.advantageDisadvantage.valid).toBe(true);
    expect(diceRollerTest.rangeRoll.valid).toBe(true);
    expect(diceRollerTest.percentileRoll.valid).toBe(true);
    expect(diceRollerTest.d20Roll.valid).toBe(true);
    expect(diceRollerTest.successCheck.valid).toBe(true);
    expect(diceRollerTest.formulaEvaluation.valid).toBe(true);
    expect(diceRollerTest.negativeModifier.valid).toBe(true);
    expect(diceRollerTest.multiDiceTypes.valid).toBe(true);
  });

  test('entity utils handles character and monster differences', async ({ page }) => {
    await page.click('button:has-text("New Game")');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="name" i]', 'EntityTest');
    await page.selectOption('select:has(option[value="Human"])', 'Human');
    await page.selectOption('select:has(option[value="Fighter"])', 'Fighter');
    await page.selectOption('select:has(option[value="Good"])', 'Good');

    const genderRadios = await page.$$('input[type="radio"][name="gender"]');
    if (genderRadios.length > 0) {
      await genderRadios[0].click();
    }

    await page.click('button:has-text("Roll Stats"), button:has-text("Roll")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Create Character"), button:has-text("Continue"), button:has-text("Start Adventure"), button:has-text("Accept")');

    await page.waitForTimeout(1000);

    const entityUtilsFullTest = await page.evaluate(() => {
      const EntityUtils = window.EntityUtils;

      const character = window.game?.party?.members[0];
      if (!character) return null;

      const monster = {
        name: 'TestGoblin',
        hp: 20,
        currentHp: 20,
        maxHp: 20,
        ac: 6,
        experience: 15,
        gold: 10,
        attacks: [{ name: 'Bite', damage: '1d6', chance: 0.8 }],
        level: 2,
        agility: 12,
        intelligence: 6,
        vitality: 8,
        luck: 5,
        resistances: { fire: 20, ice: -20 },
        magicResistance: 10,
        isDead: false
      };

      const charName = EntityUtils.getName(character);
      const charHP = EntityUtils.getHP(character);
      const charMaxHP = EntityUtils.getMaxHP(character);
      const charLevel = EntityUtils.getLevel(character);
      const charAC = EntityUtils.getAC(character);
      const charAgility = EntityUtils.getAgility(character);
      const charIntelligence = EntityUtils.getIntelligence(character);
      const charVitality = EntityUtils.getVitality(character);
      const charLuck = EntityUtils.getLuck(character);
      const isChar = EntityUtils.isCharacter(character);
      const charDead = EntityUtils.isDead(character);

      const monName = EntityUtils.getName(monster);
      const monHP = EntityUtils.getHP(monster);
      const monMaxHP = EntityUtils.getMaxHP(monster);
      const monLevel = EntityUtils.getLevel(monster);
      const monAC = EntityUtils.getAC(monster);
      const monAgility = EntityUtils.getAgility(monster);
      const monIntelligence = EntityUtils.getIntelligence(monster);
      const monVitality = EntityUtils.getVitality(monster);
      const monLuck = EntityUtils.getLuck(monster);
      const isMon = EntityUtils.isMonster(monster);
      const monDead = EntityUtils.isDead(monster);

      const charFireRes = EntityUtils.getResistance(character, 'fire');
      const monFireRes = EntityUtils.getResistance(monster, 'fire');
      const monIceRes = EntityUtils.getResistance(monster, 'ice');

      const charMagicRes = EntityUtils.getMagicResistance(character);
      const monMagicRes = EntityUtils.getMagicResistance(monster);

      EntityUtils.setHP(character, 5);
      const charHPAfterSet = EntityUtils.getHP(character);

      EntityUtils.setHP(monster, 10);
      const monHPAfterSet = EntityUtils.getHP(monster);

      const charDamageApplied = EntityUtils.applyDamage(character, 3);
      const charHPAfterDamage = EntityUtils.getHP(character);

      const monDamageApplied = EntityUtils.applyDamage(monster, 15);
      const monHPAfterDamage = EntityUtils.getHP(monster);

      const charHealingApplied = EntityUtils.applyHealing(character, 10);
      const charHPAfterHealing = EntityUtils.getHP(character);

      EntityUtils.setHP(monster, 0);
      const monDeathCheck = EntityUtils.checkDeath(monster);
      const monDeadAfterCheck = EntityUtils.isDead(monster);

      return {
        character: {
          name: charName,
          hp: charHP,
          maxHp: charMaxHP,
          level: charLevel,
          ac: charAC,
          agility: charAgility,
          intelligence: charIntelligence,
          vitality: charVitality,
          luck: charLuck,
          isCharacter: isChar,
          isDead: charDead,
          fireResistance: charFireRes,
          magicResistance: charMagicRes,
          hpAfterSet: charHPAfterSet,
          damageApplied: charDamageApplied,
          hpAfterDamage: charHPAfterDamage,
          healingApplied: charHealingApplied,
          hpAfterHealing: charHPAfterHealing
        },
        monster: {
          name: monName,
          hp: monHP,
          maxHp: monMaxHP,
          level: monLevel,
          ac: monAC,
          agility: monAgility,
          intelligence: monIntelligence,
          vitality: monVitality,
          luck: monLuck,
          isMonster: isMon,
          isDead: monDead,
          fireResistance: monFireRes,
          iceResistance: monIceRes,
          magicResistance: monMagicRes,
          hpAfterSet: monHPAfterSet,
          damageApplied: monDamageApplied,
          hpAfterDamage: monHPAfterDamage,
          deathCheckResult: monDeathCheck,
          isDeadAfterCheck: monDeadAfterCheck
        }
      };
    });

    expect(entityUtilsFullTest).not.toBeNull();

    expect(entityUtilsFullTest.character.isCharacter).toBe(true);
    expect(entityUtilsFullTest.character.hpAfterSet).toBe(5);
    expect(entityUtilsFullTest.character.hpAfterDamage).toBe(2);
    expect(entityUtilsFullTest.character.hpAfterHealing).toBeLessThanOrEqual(entityUtilsFullTest.character.maxHp);

    expect(entityUtilsFullTest.monster.isMonster).toBe(true);
    expect(entityUtilsFullTest.monster.fireResistance).toBe(20);
    expect(entityUtilsFullTest.monster.iceResistance).toBe(-20);
    expect(entityUtilsFullTest.monster.hpAfterSet).toBe(10);
    expect(entityUtilsFullTest.monster.hpAfterDamage).toBe(0);
    expect(entityUtilsFullTest.monster.deathCheckResult).toBe(true);
    expect(entityUtilsFullTest.monster.isDeadAfterCheck).toBe(true);
  });

  test('saving throw calculator ready for future implementation', async ({ page }) => {
    const savingThrowTest = await page.evaluate(() => {
      const SavingThrowCalculator = window.SavingThrowCalculator;

      const testCharacter = {
        name: 'TestFighter',
        class: 'Fighter',
        level: 5,
        stats: {
          strength: 18,
          intelligence: 10,
          piety: 12,
          vitality: 16,
          agility: 14,
          luck: 10
        },
        hp: 40,
        isDead: false
      };

      const testMonster = {
        name: 'TestDragon',
        level: 10,
        intelligence: 14,
        vitality: 20,
        luck: 8,
        hp: 100,
        isDead: false
      };

      const physicalSaveTarget = SavingThrowCalculator.calculateSaveTarget(testCharacter, 'physical', 0);
      const mentalSaveTarget = SavingThrowCalculator.calculateSaveTarget(testCharacter, 'mental', -2);
      const magicalSaveTarget = SavingThrowCalculator.calculateSaveTarget(testCharacter, 'magical', 0);
      const deathSaveTarget = SavingThrowCalculator.calculateSaveTarget(testCharacter, 'death', 0);

      const fighterPhysicalBonus = SavingThrowCalculator.getClassSaveBonus('Fighter', 'physical');
      const magesMagicalBonus = SavingThrowCalculator.getClassSaveBonus('Mage', 'magical');
      const priestDeathBonus = SavingThrowCalculator.getClassSaveBonus('Priest', 'death');

      const monsterPhysicalTarget = SavingThrowCalculator.calculateSaveTarget(testMonster, 'physical', 0);

      const resistanceChance = SavingThrowCalculator.calculateResistanceChance(testCharacter, 'magical', 0);

      const multipleEntities = [testCharacter, testMonster, { ...testCharacter, name: 'Fighter2' }];
      const groupSaves = SavingThrowCalculator.rollGroupSaves(multipleEntities, 'physical', 0);

      return {
        saveTargets: {
          physical: physicalSaveTarget,
          mental: mentalSaveTarget,
          magical: magicalSaveTarget,
          death: deathSaveTarget,
          allValid: physicalSaveTarget > 0 && mentalSaveTarget > 0 && magicalSaveTarget > 0 && deathSaveTarget > 0
        },
        classBonuses: {
          fighterPhysical: fighterPhysicalBonus,
          mageMagical: magesMagicalBonus,
          priestDeath: priestDeathBonus,
          bonusesApplied: fighterPhysicalBonus === -2 && magesMagicalBonus === -3 && priestDeathBonus === -2
        },
        monsterSaves: {
          physical: monsterPhysicalTarget,
          valid: monsterPhysicalTarget > 0
        },
        resistanceCalculation: {
          chance: resistanceChance,
          valid: resistanceChance >= 0 && resistanceChance <= 100
        },
        groupSaves: {
          results: groupSaves,
          count: groupSaves.length,
          allBoolean: groupSaves.every(save => typeof save === 'boolean'),
          valid: groupSaves.length === 3
        }
      };
    });

    expect(savingThrowTest.saveTargets.allValid).toBe(true);
    expect(savingThrowTest.classBonuses.bonusesApplied).toBe(true);
    expect(savingThrowTest.monsterSaves.valid).toBe(true);
    expect(savingThrowTest.resistanceCalculation.valid).toBe(true);
    expect(savingThrowTest.groupSaves.valid).toBe(true);
    expect(savingThrowTest.groupSaves.allBoolean).toBe(true);
  });
});