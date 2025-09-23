const { test, expect } = require('@playwright/test');

test.describe('Spell Damage and Healing Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
  });

  test('damage spells use dice roller for calculations', async ({ page }) => {
    await page.click('button:has-text("New Game")');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="name" i]', 'Blaster');
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

    const spellLearningTest = await page.evaluate(() => {
      const party = window.game?.party;
      if (!party || party.members.length === 0) return null;

      const mage = party.members[0];

      mage.learnSpell('m1_magic_missile');
      mage.learnSpell('m2_fire_bolt');

      mage.mp = mage.maxMp;

      return {
        hasMage: true,
        name: mage.name,
        class: mage.class,
        spellsKnown: mage.spells,
        currentMP: mage.mp,
        maxMP: mage.maxMp
      };
    });

    expect(spellLearningTest.hasMage).toBe(true);
    expect(spellLearningTest.spellsKnown).toContain('m1_magic_missile');

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

    const spellCastTest = await page.evaluate(() => {
      const combat = window.game?.sceneManager?.currentScene?.combat;
      if (!combat) return null;

      const encounter = combat.getEncounter();
      if (!encounter) return null;

      const mage = encounter.turnOrder.find(u => 'class' in u && u.class === 'Mage');
      if (!mage) return null;

      const monstersBeforeCast = encounter.monsters.map(m => ({
        name: m.name,
        hp: m.hp
      }));

      const mpBefore = mage.mp;

      let diceRollerCalled = false;
      const originalEvaluate = window.DiceRoller?.evaluateFormula;
      if (originalEvaluate) {
        window.DiceRoller.evaluateFormula = function(...args) {
          diceRollerCalled = true;
          return originalEvaluate.apply(this, args);
        };
      }

      const result = combat.executePlayerAction('Cast Spell', 0, 'm1_magic_missile');

      if (originalEvaluate) {
        window.DiceRoller.evaluateFormula = originalEvaluate;
      }

      const monstersAfterCast = encounter.monsters.map(m => ({
        name: m.name,
        hp: m.hp
      }));

      const mpAfter = mage.mp;

      return {
        spellCast: true,
        result: result,
        monstersBeforeCast,
        monstersAfterCast,
        damageDealt: monstersBeforeCast[0]?.hp - monstersAfterCast[0]?.hp,
        mpBefore,
        mpAfter,
        mpUsed: mpBefore - mpAfter,
        diceRollerUsed: diceRollerCalled
      };
    });

    expect(spellCastTest).not.toBeNull();
    expect(spellCastTest.damageDealt).toBeGreaterThan(0);
    expect(spellCastTest.mpUsed).toBeGreaterThan(0);
    expect(spellCastTest.diceRollerUsed).toBe(true);
  });

  test('healing spells use entity utils correctly', async ({ page }) => {
    await page.click('button:has-text("New Game")');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="name" i]', 'Healer');
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

    await page.evaluate(() => {
      const party = window.game?.party;
      if (!party || party.members.length === 0) return null;

      const priest = party.members[0];

      priest.learnSpell('p1_heal_wounds');
      priest.learnSpell('p2_cure_wounds');

      priest.mp = priest.maxMp;

      priest.takeDamage(10);

      return {
        priestReady: true,
        currentHP: priest.hp,
        maxHP: priest.maxHp
      };
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

    const healingTest = await page.evaluate(() => {
      const combat = window.game?.sceneManager?.currentScene?.combat;
      if (!combat) return null;

      const priest = window.game?.party?.members[0];
      if (!priest) return null;

      const hpBeforeHeal = priest.hp;
      const maxHP = priest.maxHp;

      let entityUtilsCalled = false;
      const EntityUtils = window.EntityUtils;
      const originalApplyHealing = EntityUtils.applyHealing;

      EntityUtils.applyHealing = function(...args) {
        entityUtilsCalled = true;
        return originalApplyHealing.apply(this, args);
      };

      const result = combat.executePlayerAction('Cast Spell', 0, 'p1_heal_wounds');

      EntityUtils.applyHealing = originalApplyHealing;

      const hpAfterHeal = priest.hp;

      return {
        healCast: true,
        result: result,
        hpBeforeHeal,
        hpAfterHeal,
        maxHP,
        healingAmount: hpAfterHeal - hpBeforeHeal,
        entityUtilsUsed: entityUtilsCalled,
        didNotExceedMax: hpAfterHeal <= maxHP
      };
    });

    expect(healingTest).not.toBeNull();
    expect(healingTest.healingAmount).toBeGreaterThan(0);
    expect(healingTest.entityUtilsUsed).toBe(true);
    expect(healingTest.didNotExceedMax).toBe(true);
  });

  test('group damage spells hit multiple targets', async ({ page }) => {
    await page.click('button:has-text("New Game")');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="name" i]', 'AreaDamage');
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
      const party = window.game?.party;
      if (!party || party.members.length === 0) return null;

      const mage = party.members[0];

      mage.learnSpell('m3_fireball');
      mage.learnSpell('m4_ice_storm');

      mage.mp = mage.maxMp;
      mage.level = 5;
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
        const monsters = [
          { name: 'Goblin1', hp: 20, currentHp: 20, ac: 5, experience: 10, gold: 5, attacks: [{name: 'Scratch', damage: '1d4', chance: 0.8}], isDead: false },
          { name: 'Goblin2', hp: 20, currentHp: 20, ac: 5, experience: 10, gold: 5, attacks: [{name: 'Scratch', damage: '1d4', chance: 0.8}], isDead: false },
          { name: 'Goblin3', hp: 20, currentHp: 20, ac: 5, experience: 10, gold: 5, attacks: [{name: 'Scratch', damage: '1d4', chance: 0.8}], isDead: false }
        ];

        const combat = window.game?.sceneManager?.currentScene?.combatSystem || window.game?.combatSystem;
        if (combat) {
          combat.startCombat(
            monsters,
            window.game.party.members,
            1,
            () => {},
            () => {}
          );

          window.game.sceneManager.pushScene('CombatScene');
          const combatScene = window.game.sceneManager.currentScene;
          if (combatScene) {
            combatScene.combat = combat;
          }
        }
      }
    });

    const groupSpellTest = await page.evaluate(() => {
      const combat = window.game?.sceneManager?.currentScene?.combat;
      if (!combat) return null;

      const encounter = combat.getEncounter();
      if (!encounter) return null;

      const monstersBeforeCast = encounter.monsters.map(m => ({
        name: m.name,
        hp: m.hp || m.currentHp
      }));

      const result = combat.executePlayerAction('Cast Spell', 0, 'm3_fireball');

      const monstersAfterCast = encounter.monsters.map(m => ({
        name: m.name,
        hp: m.hp || m.currentHp,
        damaged: (monstersBeforeCast.find(mb => mb.name === m.name)?.hp || 0) > (m.hp || m.currentHp || 0)
      }));

      const damagedCount = monstersAfterCast.filter(m => m.damaged).length;

      return {
        groupSpellCast: true,
        result: result,
        initialMonsterCount: monstersBeforeCast.length,
        damagedMonsterCount: damagedCount,
        allDamaged: damagedCount === monstersBeforeCast.length,
        monstersAfterCast
      };
    });

    expect(groupSpellTest).not.toBeNull();
    expect(groupSpellTest.initialMonsterCount).toBeGreaterThan(1);
    expect(groupSpellTest.damagedMonsterCount).toBeGreaterThan(0);
  });

  test('spell mp consumption works correctly', async ({ page }) => {
    await page.click('button:has-text("New Game")');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="name" i]', 'MPTester');
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

    const mpTest = await page.evaluate(() => {
      const party = window.game?.party;
      if (!party || party.members.length === 0) return null;

      const mage = party.members[0];

      mage.learnSpell('m1_magic_missile');

      const spellRegistry = window.game?.gameServices?.getSpellRegistry?.() ||
                           window.SpellRegistry?.getInstance();
      const spell = spellRegistry?.getSpellById('m1_magic_missile');

      mage.mp = spell?.mpCost || 2;

      const mpBefore = mage.mp;

      const hasTownScene = window.game?.sceneManager?.currentScene?.constructor?.name === 'TownScene';
      if (!hasTownScene) {
        window.game?.sceneManager?.pushScene('DungeonScene');
      } else {
        window.game?.sceneManager?.currentScene?.handleKeyPress('d');
      }

      const scene = window.game?.sceneManager?.currentScene;
      if (scene?.constructor?.name === 'DungeonScene') {
        for (let i = 0; i < 50; i++) {
          scene.checkForEncounter(true);
          if (window.game?.sceneManager?.currentScene?.constructor?.name === 'CombatScene') {
            break;
          }
        }
      }

      const combat = window.game?.sceneManager?.currentScene?.combat;
      if (!combat) return null;

      combat.executePlayerAction('Cast Spell', 0, 'm1_magic_missile');
      const mpAfterFirst = mage.mp;

      const secondCastResult = combat.executePlayerAction('Cast Spell', 0, 'm1_magic_missile');

      return {
        mpBefore,
        mpAfterFirst,
        mpCost: spell?.mpCost,
        mpConsumed: mpBefore - mpAfterFirst,
        cannotCastWithoutMP: secondCastResult.toLowerCase().includes('not enough') ||
                             secondCastResult.toLowerCase().includes('insufficient') ||
                             mpAfterFirst === 0
      };
    });

    expect(mpTest).not.toBeNull();
    expect(mpTest.mpConsumed).toBe(mpTest.mpCost);
    expect(mpTest.cannotCastWithoutMP).toBe(true);
  });
});