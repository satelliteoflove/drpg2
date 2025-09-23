const { test, expect } = require('@playwright/test');

test.describe('Combat Edge Cases and Boundary Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
  });

  test('casting spell without enough mp fails gracefully', async ({ page }) => {
    await page.click('button:has-text("New Game")');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="name" i]', 'NoMPMage');
    await page.selectOption('select:has(option[value="Elf"])', 'Elf');
    await page.selectOption('select:has(option[value="Mage"])', 'Mage');
    await page.selectOption('select:has(option[value="Neutral"])', 'Neutral');

    const genderRadios = await page.$$('input[type="radio"][name="gender"]');
    if (genderRadios.length > 0) {
      await genderRadios[0].click();
    }

    await page.click('button:has-text("Roll Stats"), button:has-text("Roll")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Create Character"), button:has-text("Continue"), button:has-text("Start Adventure"), button:has-text("Accept")');

    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      const mage = window.game?.party?.members[0];
      if (mage) {
        mage.learnSpell('m1_magic_missile');
        mage.mp = 0;
      }
    });

    const hasTownScene = await page.evaluate(() => {
      return window.game?.sceneManager?.currentScene?.constructor?.name === 'TownScene';
    });

    if (!hasTownScene) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    await page.keyboard.press('d');
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      if (scene?.constructor?.name === 'DungeonScene') {
        for (let i = 0; i < 50; i++) {
          scene.checkForEncounter(true);
          if (window.game?.sceneManager?.currentScene?.constructor?.name === 'CombatScene') {
            break;
          }
        }
      }
    });

    const noMPTest = await page.evaluate(() => {
      const combat = window.game?.sceneManager?.currentScene?.combat;
      if (!combat) return null;

      const mage = combat.getCurrentUnit();
      if (!mage || mage.class !== 'Mage') return null;

      const mpBefore = mage.mp;
      const result = combat.executePlayerAction('Cast Spell', 0, 'm1_magic_missile');
      const mpAfter = mage.mp;

      return {
        mpBefore,
        mpAfter,
        result,
        failedGracefully: result.toLowerCase().includes('not enough') ||
                         result.toLowerCase().includes('insufficient') ||
                         result.toLowerCase().includes('no mp'),
        mpNotConsumed: mpBefore === mpAfter
      };
    });

    expect(noMPTest).not.toBeNull();
    expect(noMPTest.mpBefore).toBe(0);
    expect(noMPTest.failedGracefully).toBe(true);
    expect(noMPTest.mpNotConsumed).toBe(true);
  });

  test('healing at full hp does not exceed maximum', async ({ page }) => {
    await page.click('button:has-text("New Game")');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="name" i]', 'FullHPPriest');
    await page.selectOption('select:has(option[value="Human"])', 'Human');
    await page.selectOption('select:has(option[value="Priest"])', 'Priest');
    await page.selectOption('select:has(option[value="Good"])', 'Good');

    const genderRadios = await page.$$('input[type="radio"][name="gender"]');
    if (genderRadios.length > 0) {
      await genderRadios[0].click();
    }

    await page.click('button:has-text("Roll Stats"), button:has-text("Roll")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Create Character"), button:has-text("Continue"), button:has-text("Start Adventure"), button:has-text("Accept")');

    await page.waitForTimeout(1000);

    const fullHPTest = await page.evaluate(() => {
      const priest = window.game?.party?.members[0];
      if (!priest) return null;

      priest.learnSpell('p1_heal_wounds');
      priest.mp = priest.maxMp;

      const maxHP = priest.maxHp;
      priest.hp = maxHP;

      const EntityUtils = window.EntityUtils;

      const hpBefore = priest.hp;
      const healingApplied = EntityUtils.applyHealing(priest, 20);
      const hpAfter = priest.hp;

      priest.hp = maxHP - 5;
      const partialHPBefore = priest.hp;
      const partialHealingApplied = EntityUtils.applyHealing(priest, 20);
      const partialHPAfter = priest.hp;

      return {
        maxHP,
        fullHeal: {
          hpBefore,
          hpAfter,
          healingApplied,
          noOverheal: hpAfter === maxHP
        },
        partialHeal: {
          hpBefore: partialHPBefore,
          hpAfter: partialHPAfter,
          healingApplied: partialHealingApplied,
          cappedAtMax: partialHPAfter === maxHP,
          actualHealing: partialHealingApplied === 5
        }
      };
    });

    expect(fullHPTest).not.toBeNull();
    expect(fullHPTest.fullHeal.noOverheal).toBe(true);
    expect(fullHPTest.fullHeal.healingApplied).toBe(0);
    expect(fullHPTest.partialHeal.cappedAtMax).toBe(true);
    expect(fullHPTest.partialHeal.actualHealing).toBe(true);
  });

  test('damage cannot reduce hp below zero', async ({ page }) => {
    await page.click('button:has-text("New Game")');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="name" i]', 'TestFighter');
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

    const zeroBoundaryTest = await page.evaluate(() => {
      const EntityUtils = window.EntityUtils;

      const testMonster = {
        name: 'TestMonster',
        hp: 5,
        currentHp: 5,
        maxHp: 20,
        ac: 10,
        isDead: false
      };

      const exactDamage = EntityUtils.applyDamage(testMonster, 5);
      const hpAfterExact = EntityUtils.getHP(testMonster);

      testMonster.hp = 5;
      testMonster.currentHp = 5;

      const overkillDamage = EntityUtils.applyDamage(testMonster, 100);
      const hpAfterOverkill = EntityUtils.getHP(testMonster);

      const character = window.game?.party?.members[0];
      if (!character) return null;

      character.hp = 1;
      const charDamage = EntityUtils.applyDamage(character, 50);
      const charHPAfter = EntityUtils.getHP(character);

      return {
        exactToZero: {
          damage: exactDamage,
          hpAfter: hpAfterExact,
          isZero: hpAfterExact === 0
        },
        overkill: {
          damage: overkillDamage,
          hpAfter: hpAfterOverkill,
          isZero: hpAfterOverkill === 0,
          notNegative: hpAfterOverkill >= 0
        },
        characterDamage: {
          damage: charDamage,
          hpAfter: charHPAfter,
          isZero: charHPAfter === 0,
          notNegative: charHPAfter >= 0
        }
      };
    });

    expect(zeroBoundaryTest).not.toBeNull();
    expect(zeroBoundaryTest.exactToZero.isZero).toBe(true);
    expect(zeroBoundaryTest.overkill.isZero).toBe(true);
    expect(zeroBoundaryTest.overkill.notNegative).toBe(true);
    expect(zeroBoundaryTest.characterDamage.isZero).toBe(true);
    expect(zeroBoundaryTest.characterDamage.notNegative).toBe(true);
  });

  test('attacking when all enemies defeated handles gracefully', async ({ page }) => {
    await page.click('button:has-text("New Game")');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="name" i]', 'Victor');
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

    const hasTownScene = await page.evaluate(() => {
      return window.game?.sceneManager?.currentScene?.constructor?.name === 'TownScene';
    });

    if (!hasTownScene) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    await page.keyboard.press('d');
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      if (scene?.constructor?.name === 'DungeonScene') {
        for (let i = 0; i < 50; i++) {
          scene.checkForEncounter(true);
          if (window.game?.sceneManager?.currentScene?.constructor?.name === 'CombatScene') {
            break;
          }
        }
      }
    });

    const noTargetsTest = await page.evaluate(() => {
      const combat = window.game?.sceneManager?.currentScene?.combat;
      if (!combat) return null;

      const encounter = combat.getEncounter();
      if (!encounter) return null;

      encounter.monsters.forEach(m => {
        m.hp = 0;
        m.currentHp = 0;
        m.isDead = true;
      });

      const sceneBefore = window.game?.sceneManager?.currentScene?.constructor?.name;

      const result = combat.executePlayerAction('Attack', 0);

      const sceneAfter = window.game?.sceneManager?.currentScene?.constructor?.name;

      return {
        sceneBefore,
        sceneAfter,
        result,
        combatEnded: sceneAfter !== 'CombatScene',
        handledGracefully: result.includes('No targets') || combatEnded
      };
    });

    expect(noTargetsTest).not.toBeNull();
    expect(noTargetsTest.handledGracefully).toBe(true);
  });
});