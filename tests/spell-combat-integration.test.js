import { test, expect } from '@playwright/test';

test.describe('Spell Combat Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForSelector('#gameCanvas', { timeout: 5000 });
    await page.waitForTimeout(500);
  });

  test('spell casting menu appears in combat', async ({ page }) => {
    await page.evaluate(() => {
      const { GameServices } = window;
      const { Character } = window;
      const { Party } = window;
      const sceneManager = GameServices.getInstance().getSceneManager();

      const mage = new Character('Gandalf', 'Human', 'Mage', 'Good');
      mage.mp = 20;
      mage.maxMp = 20;

      const party = new Party();
      party.addCharacter(mage);

      const gameState = {
        party: party,
        currentFloor: 1,
        inCombat: true,
        messageLog: GameServices.getInstance().getMessageLog()
      };

      window.game.gameState = gameState;
      sceneManager.switchTo('combat');
    });

    const canvasClick = async (x, y) => {
      await page.mouse.click(x, y);
      await page.waitForTimeout(100);
    };

    await page.keyboard.press('2');
    await page.waitForTimeout(200);

    const hasSpellMenu = await page.evaluate(() => {
      const canvas = document.querySelector('#gameCanvas');
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 420, 600, 320);
      const pixels = imageData.data;

      let whitePixels = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i] > 200 && pixels[i + 1] > 200 && pixels[i + 2] > 200) {
          whitePixels++;
        }
      }

      return whitePixels > 100;
    });

    expect(hasSpellMenu).toBe(true);
  });

  test('MP is displayed in status panel during combat', async ({ page }) => {
    await page.evaluate(() => {
      const { GameServices } = window;
      const { Character } = window;
      const { Party } = window;
      const sceneManager = GameServices.getInstance().getSceneManager();

      const priest = new Character('Cleric', 'Elf', 'Priest', 'Good');
      priest.mp = 15;
      priest.maxMp = 25;

      const party = new Party();
      party.addCharacter(priest);

      const gameState = {
        party: party,
        currentFloor: 1,
        inCombat: true,
        messageLog: GameServices.getInstance().getMessageLog()
      };

      window.game.gameState = gameState;
      sceneManager.switchTo('combat');
    });

    await page.waitForTimeout(500);

    const hasMPBar = await page.evaluate(() => {
      const canvas = document.querySelector('#gameCanvas');
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(650, 0, 374, 300);
      const pixels = imageData.data;

      let bluePixels = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i] < 50 && pixels[i + 1] > 100 && pixels[i + 2] > 200) {
          bluePixels++;
        }
      }

      return bluePixels > 50;
    });

    expect(hasMPBar).toBe(true);
  });

  test('spell casting consumes MP', async ({ page }) => {
    const initialMP = await page.evaluate(() => {
      const { GameServices } = window;
      const { Character } = window;
      const { Party } = window;
      const { Monster } = window;
      const sceneManager = GameServices.getInstance().getSceneManager();

      const mage = new Character('Merlin', 'Human', 'Mage', 'Good');
      mage.mp = 10;
      mage.maxMp = 10;

      const party = new Party();
      party.addCharacter(mage);

      const gameState = {
        party: party,
        currentFloor: 1,
        inCombat: true,
        messageLog: GameServices.getInstance().getMessageLog()
      };

      window.game.gameState = gameState;
      window.testMage = mage;

      const combatScene = sceneManager.getScene('combat');
      if (combatScene) {
        const monsters = [{
          name: 'Goblin',
          hp: 10,
          maxHp: 10,
          ac: 10,
          attacks: [{ damage: '1d4' }],
          xpValue: 10
        }];

        combatScene.combatSystem.startCombat(
          monsters,
          party.getAliveCharacters(),
          1,
          () => {},
          () => {}
        );
      }

      sceneManager.switchTo('combat');
      return mage.mp;
    });

    await page.keyboard.press('2');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    const finalMP = await page.evaluate(() => {
      return window.testMage ? window.testMage.mp : -1;
    });

    expect(finalMP).toBeLessThan(initialMP);
    expect(finalMP).toBeGreaterThanOrEqual(0);
  });

  test('damage spells deal damage to enemies', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { SpellCaster } = window;
      const { SpellRegistry } = window;
      const { Character } = window;
      const { DiceRoller } = window;

      const mage = new Character('BattleMage', 'Human', 'Mage', 'Neutral');
      mage.level = 5;
      mage.mp = 50;
      mage.stats.intelligence = 18;

      const monster = {
        name: 'Orc',
        hp: 30,
        maxHp: 30,
        currentHp: 30,
        ac: 12,
        magicResistance: 0
      };

      const context = {
        casterId: mage.id,
        caster: mage,
        target: monster,
        enemies: [monster],
        inCombat: true
      };

      const spellCaster = SpellCaster.getInstance();
      const registry = SpellRegistry.getInstance();
      const flameDart = registry.getSpellById('flame_dart');

      if (!flameDart) {
        return { error: 'Spell not found' };
      }

      const initialHP = monster.hp;
      const result = spellCaster.castSpell(mage, 'flame_dart', context);
      const finalHP = monster.hp;

      return {
        success: result.success,
        mpConsumed: result.mpConsumed,
        initialHP,
        finalHP,
        damage: initialHP - finalHP
      };
    });

    expect(result.success).toBe(true);
    expect(result.mpConsumed).toBeGreaterThan(0);
    expect(result.damage).toBeGreaterThan(0);
    expect(result.finalHP).toBeLessThan(result.initialHP);
  });

  test('healing spells restore HP to allies', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { SpellCaster } = window;
      const { SpellRegistry } = window;
      const { Character } = window;

      const priest = new Character('Healer', 'Elf', 'Priest', 'Good');
      priest.level = 3;
      priest.mp = 30;
      priest.stats.intelligence = 16;

      const ally = new Character('Warrior', 'Dwarf', 'Fighter', 'Good');
      ally.hp = 10;
      ally.maxHp = 25;

      const context = {
        casterId: priest.id,
        caster: priest,
        target: ally,
        party: [priest, ally],
        inCombat: true
      };

      const spellCaster = SpellCaster.getInstance();
      const registry = SpellRegistry.getInstance();
      const healingTouch = registry.getSpellById('healing_touch');

      if (!healingTouch) {
        return { error: 'Healing spell not found' };
      }

      const initialHP = ally.hp;
      const result = spellCaster.castSpell(priest, 'healing_touch', context);
      const finalHP = ally.hp;

      return {
        success: result.success,
        mpConsumed: result.mpConsumed,
        initialHP,
        finalHP,
        healing: finalHP - initialHP
      };
    });

    expect(result.success).toBe(true);
    expect(result.mpConsumed).toBeGreaterThan(0);
    expect(result.healing).toBeGreaterThan(0);
    expect(result.finalHP).toBeGreaterThan(result.initialHP);
  });

  test('spell power scaling affects damage output', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { SpellCaster } = window;
      const { SpellRegistry } = window;
      const { Character } = window;

      const weakMage = new Character('Novice', 'Human', 'Mage', 'Neutral');
      weakMage.level = 1;
      weakMage.mp = 50;
      weakMage.stats.intelligence = 10;

      const strongMage = new Character('Archmage', 'Elf', 'Mage', 'Neutral');
      strongMage.level = 10;
      strongMage.mp = 50;
      strongMage.stats.intelligence = 20;

      const monster1 = {
        name: 'TestDummy1',
        hp: 100,
        maxHp: 100,
        currentHp: 100,
        ac: 0,
        magicResistance: 0
      };

      const monster2 = {
        name: 'TestDummy2',
        hp: 100,
        maxHp: 100,
        currentHp: 100,
        ac: 0,
        magicResistance: 0
      };

      const spellCaster = SpellCaster.getInstance();

      const context1 = {
        casterId: weakMage.id,
        caster: weakMage,
        target: monster1,
        enemies: [monster1],
        inCombat: true
      };

      const context2 = {
        casterId: strongMage.id,
        caster: strongMage,
        target: monster2,
        enemies: [monster2],
        inCombat: true
      };

      const power1 = spellCaster.calculateSpellPower(weakMage, null);
      const power2 = spellCaster.calculateSpellPower(strongMage, null);

      spellCaster.castSpell(weakMage, 'flame_dart', context1);
      spellCaster.castSpell(strongMage, 'flame_dart', context2);

      return {
        weakMagePower: power1,
        strongMagePower: power2,
        weakDamage: 100 - monster1.hp,
        strongDamage: 100 - monster2.hp
      };
    });

    expect(result.strongMagePower).toBeGreaterThan(result.weakMagePower);
    expect(result.strongDamage).toBeGreaterThan(result.weakDamage);
  });

  test('group spells target all enemies with individual resistance', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { SpellCaster } = window;
      const { SpellRegistry } = window;
      const { Character } = window;

      const mage = new Character('AoEMage', 'Human', 'Mage', 'Neutral');
      mage.level = 7;
      mage.mp = 50;

      const monsters = [
        { name: 'Goblin1', hp: 20, maxHp: 20, currentHp: 20, ac: 10, magicResistance: 0 },
        { name: 'Goblin2', hp: 20, maxHp: 20, currentHp: 20, ac: 10, magicResistance: 50 },
        { name: 'Goblin3', hp: 20, maxHp: 20, currentHp: 20, ac: 10, magicResistance: 90 }
      ];

      const context = {
        casterId: mage.id,
        caster: mage,
        enemies: monsters,
        inCombat: true
      };

      const spellCaster = SpellCaster.getInstance();
      const registry = SpellRegistry.getInstance();

      const meteorSwarm = registry.getSpellById('meteor_swarm');
      if (meteorSwarm) {
        spellCaster.castSpell(mage, 'meteor_swarm', context);
      }

      return {
        monster1Damage: 20 - monsters[0].hp,
        monster2Damage: 20 - monsters[1].hp,
        monster3Damage: 20 - monsters[2].hp,
        allHit: monsters.every(m => m.hp < 20)
      };
    });

    expect(result.allHit).toBe(true);
    expect(result.monster1Damage).toBeGreaterThan(0);
    expect(result.monster2Damage).toBeLessThanOrEqual(result.monster1Damage);
    expect(result.monster3Damage).toBeLessThanOrEqual(result.monster2Damage);
  });
});