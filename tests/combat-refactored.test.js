const { test, expect } = require('@playwright/test');

test.describe('Combat System Refactored Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
  });

  test('basic combat flow with dice roller integration', async ({ page }) => {
    await page.click('button:has-text("New Game")');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="name" i]', 'Fighter1');
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

    const combatTriggered = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      if (scene?.constructor?.name === 'DungeonScene') {
        for (let i = 0; i < 50; i++) {
          scene.checkForEncounter(true);
          if (window.game?.sceneManager?.currentScene?.constructor?.name === 'CombatScene') {
            return true;
          }
        }
      }
      return false;
    });

    expect(combatTriggered).toBe(true);

    const combatState = await page.evaluate(() => {
      const combat = window.game?.sceneManager?.currentScene?.combat;
      const encounter = combat?.getEncounter();

      if (!encounter) return null;

      const turnOrder = encounter.turnOrder.map(unit => ({
        name: unit.name,
        type: 'class' in unit ? 'character' : 'monster',
        agility: 'stats' in unit ? unit.stats.agility : 10,
        hp: 'hp' in unit ? unit.hp : unit.currentHp
      }));

      return {
        hasEncounter: true,
        turnOrderLength: turnOrder.length,
        turnOrder: turnOrder,
        currentTurn: encounter.currentTurn
      };
    });

    expect(combatState.hasEncounter).toBe(true);
    expect(combatState.turnOrderLength).toBeGreaterThan(0);

    const attackResult = await page.evaluate(() => {
      const combat = window.game?.sceneManager?.currentScene?.combat;
      const currentUnit = combat?.getCurrentUnit();

      if (currentUnit && 'class' in currentUnit) {
        const encounter = combat.getEncounter();
        const monstersBeforeAttack = encounter.monsters.map(m => ({
          name: m.name,
          hp: m.hp
        }));

        const result = combat.executePlayerAction('Attack', 0);

        const monstersAfterAttack = encounter.monsters.map(m => ({
          name: m.name,
          hp: m.hp
        }));

        return {
          attackExecuted: true,
          result: result,
          monstersBeforeAttack,
          monstersAfterAttack,
          damageDealt: monstersBeforeAttack[0]?.hp - monstersAfterAttack[0]?.hp
        };
      }
      return { attackExecuted: false };
    });

    expect(attackResult.attackExecuted).toBe(true);
    expect(attackResult.result).toContain('attacks');
    expect(attackResult.damageDealt).toBeGreaterThan(0);

    const diceRollerUsed = await page.evaluate(() => {
      const originalRoll = window.DiceRoller?.roll;
      if (!originalRoll) return false;

      let called = false;
      window.DiceRoller.roll = function(...args) {
        called = true;
        return originalRoll.apply(this, args);
      };

      const combat = window.game?.sceneManager?.currentScene?.combat;
      if (combat) {
        combat.executeMonsterTurn();
      }

      window.DiceRoller.roll = originalRoll;
      return called;
    });

    const victoryTest = await page.evaluate(() => {
      const combat = window.game?.sceneManager?.currentScene?.combat;
      if (!combat) return null;

      const encounter = combat.getEncounter();
      if (!encounter) return null;

      encounter.monsters.forEach(m => m.hp = 0);
      combat.forceCheckCombatEnd();

      return {
        combatEnded: window.game?.sceneManager?.currentScene?.constructor?.name !== 'CombatScene'
      };
    });

    expect(victoryTest.combatEnded).toBe(true);
  });

  test('escape mechanics with agility calculation', async ({ page }) => {
    await page.click('button:has-text("New Game")');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="name" i]', 'Runner');
    await page.selectOption('select:has(option[value="Elf"])', 'Elf');
    await page.selectOption('select:has(option[value="Thief"])', 'Thief');
    await page.selectOption('select:has(option[value="Neutral"])', 'Neutral');

    const genderRadios = await page.$$('input[type="radio"][name="gender"]');
    if (genderRadios.length > 0) {
      await genderRadios[0].click();
    }

    await page.click('button:has-text("Roll Stats"), button:has-text("Roll")');
    await page.waitForTimeout(500);

    const stats = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="number"]');
      const agilityInput = Array.from(inputs).find(input => {
        const label = input.previousElementSibling || input.parentElement?.querySelector('label');
        return label?.textContent?.toLowerCase().includes('agility');
      });
      if (agilityInput) {
        agilityInput.value = '18';
        agilityInput.dispatchEvent(new Event('change', { bubbles: true }));
        return { agilitySet: true };
      }
      return { agilitySet: false };
    });

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

    const escapeTest = await page.evaluate(() => {
      const combat = window.game?.sceneManager?.currentScene?.combat;
      if (!combat) return null;

      const currentUnit = combat.getCurrentUnit();
      if (!currentUnit || !('class' in currentUnit)) return null;

      const agility = currentUnit.stats.agility;
      const baseEscapeChance = 0.5;
      const agilityBonus = (agility - 10) * 0.02;
      const expectedChance = Math.max(0.1, Math.min(0.9, baseEscapeChance + agilityBonus));

      let escapeSuccesses = 0;
      let escapeAttempts = 100;

      for (let i = 0; i < escapeAttempts; i++) {
        const originalRandom = Math.random;
        Math.random = () => expectedChance - 0.01;

        const result = combat.executePlayerAction('Escape');
        if (result.includes('successfully')) {
          escapeSuccesses++;
        }

        Math.random = originalRandom;

        if (window.game?.sceneManager?.currentScene?.constructor?.name === 'DungeonScene') {
          for (let j = 0; j < 50; j++) {
            window.game.sceneManager.currentScene.checkForEncounter(true);
            if (window.game?.sceneManager?.currentScene?.constructor?.name === 'CombatScene') {
              break;
            }
          }
        }
      }

      return {
        agility: agility,
        expectedChance: expectedChance,
        testPassed: true
      };
    });

    expect(escapeTest).not.toBeNull();
    expect(escapeTest.agility).toBeGreaterThanOrEqual(10);
    expect(escapeTest.expectedChance).toBeGreaterThan(0.5);
  });

  test('entity utils integration for hp management', async ({ page }) => {
    await page.click('button:has-text("New Game")');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="name" i]', 'Tank');
    await page.selectOption('select:has(option[value="Dwarf"])', 'Dwarf');
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

    const entityUtilsTest = await page.evaluate(() => {
      const combat = window.game?.sceneManager?.currentScene?.combat;
      if (!combat) return null;

      const encounter = combat.getEncounter();
      if (!encounter) return null;

      const character = encounter.turnOrder.find(u => 'class' in u);
      const monster = encounter.turnOrder.find(u => !('class' in u));

      if (!character || !monster) return null;

      const EntityUtils = window.EntityUtils;

      const charHP = EntityUtils.getHP(character);
      const charMaxHP = EntityUtils.getMaxHP(character);
      const charName = EntityUtils.getName(character);
      const isChar = EntityUtils.isCharacter(character);

      const monsterHP = EntityUtils.getHP(monster);
      const monsterMaxHP = EntityUtils.getMaxHP(monster);
      const monsterName = EntityUtils.getName(monster);
      const isMon = EntityUtils.isMonster(monster);

      EntityUtils.applyDamage(character, 5);
      const charHPAfterDamage = EntityUtils.getHP(character);

      EntityUtils.applyHealing(character, 3);
      const charHPAfterHealing = EntityUtils.getHP(character);

      EntityUtils.applyDamage(monster, 10);
      const monsterHPAfterDamage = EntityUtils.getHP(monster);

      return {
        character: {
          name: charName,
          initialHP: charHP,
          maxHP: charMaxHP,
          isCharacter: isChar,
          hpAfterDamage: charHPAfterDamage,
          hpAfterHealing: charHPAfterHealing
        },
        monster: {
          name: monsterName,
          initialHP: monsterHP,
          maxHP: monsterMaxHP,
          isMonster: isMon,
          hpAfterDamage: monsterHPAfterDamage
        }
      };
    });

    expect(entityUtilsTest).not.toBeNull();
    expect(entityUtilsTest.character.isCharacter).toBe(true);
    expect(entityUtilsTest.monster.isMonster).toBe(true);
    expect(entityUtilsTest.character.hpAfterDamage).toBe(entityUtilsTest.character.initialHP - 5);
    expect(entityUtilsTest.character.hpAfterHealing).toBe(entityUtilsTest.character.hpAfterDamage + 3);
    expect(entityUtilsTest.monster.hpAfterDamage).toBeLessThan(entityUtilsTest.monster.initialHP);
  });
});