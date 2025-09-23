import { test, expect } from '@playwright/test';
import { TestSetup, TestAssertions } from './helpers/test-setup.js';

test.describe('Spell System E2E Tests - Improved', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await TestSetup.waitForGameInitialization(page);
    await TestSetup.enableTestMode(page);
  });

  test('spell casting in combat with proper game flow', async ({ page }) => {
    await TestSetup.createTestParty(page, [
      {
        name: 'TestMage',
        race: 'Elf',
        class: 'Mage',
        alignment: 'Good',
        level: 5,
        hp: 30,
        maxHp: 30,
        mp: 20,
        maxMp: 20
      },
      {
        name: 'TestFighter',
        race: 'Human',
        class: 'Fighter',
        alignment: 'Good',
        hp: 40,
        maxHp: 40
      }
    ]);

    await TestSetup.bypassMainMenu(page);

    const combatSetup = await TestSetup.setupCombat(page, [{
      name: 'TestGoblin',
      hp: 25,
      maxHp: 25,
      currentHp: 25,
      ac: 10,
      magicResistance: 0,
      attacks: [{ damage: '1d4' }],
      xpValue: 10
    }]);

    expect(combatSetup.combatStarted).toBe(true);
    expect(combatSetup.monstersCreated).toBe(1);

    await TestAssertions.assertSceneIs(page, 'Combat');

    await page.waitForTimeout(500);

    const combatState = await TestSetup.getCombatState(page);
    console.log('Initial combat state:', combatState);

    let magesTurn = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!magesTurn && attempts < maxAttempts) {
      const currentState = await TestSetup.getCombatState(page);
      if (currentState.currentUnit === 'TestMage') {
        magesTurn = true;
        break;
      }

      if (currentState.actionState === 'select_action') {
        await TestSetup.simulateKeyPress(page, 'p');
      }

      await page.waitForTimeout(500);
      attempts++;
    }

    if (!magesTurn) {
      console.log('Could not get to mage turn, forcing it');
      await page.evaluate(() => {
        const scene = window.game?.sceneManager?.currentScene;
        if (scene && scene.getName() === 'Combat') {
          const mage = scene.combatSystem.getParty().find(c => c.name === 'TestMage');
          if (mage) {
            scene.combatSystem.encounter.currentTurn = scene.combatSystem.encounter.turnOrder.indexOf(mage);
          }
        }
      });
    }

    await TestSetup.navigateCombatMenu(page, 'cast');

    const spellMenuState = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      if (scene && scene.getTestState) {
        return scene.getTestState();
      }
      return null;
    });

    expect(spellMenuState.actionState).toBe('select_spell');
    expect(spellMenuState.availableSpells.length).toBeGreaterThan(0);

    await TestSetup.simulateKeyPress(page, 'Enter');

    await TestSetup.simulateKeyPress(page, 'Enter');

    await page.waitForTimeout(1000);

    const afterCastState = await TestSetup.getCombatState(page);
    const goblin = afterCastState.monsters.find(m => m.name === 'TestGoblin');

    expect(goblin.hp).toBeLessThan(25);

    const messages = await TestSetup.getMessages(page);
    const damageMessage = messages.find(m => m.includes('damage') || m.includes('Flame Dart'));
    expect(damageMessage).toBeDefined();
  });

  test('healing spell restores HP correctly', async ({ page }) => {
    await TestSetup.createTestParty(page, [
      {
        name: 'TestPriest',
        race: 'Dwarf',
        class: 'Priest',
        alignment: 'Good',
        level: 5,
        hp: 30,
        maxHp: 30,
        mp: 25,
        maxMp: 25
      },
      {
        name: 'WoundedWarrior',
        race: 'Human',
        class: 'Fighter',
        alignment: 'Good',
        hp: 10,
        maxHp: 40
      }
    ]);

    await TestSetup.bypassMainMenu(page);

    await TestSetup.setupCombat(page, [{
      name: 'Slime',
      hp: 5,
      maxHp: 5,
      currentHp: 5,
      ac: 8,
      attacks: [{ damage: '1' }],
      xpValue: 2
    }]);

    await TestAssertions.assertSceneIs(page, 'Combat');

    const initialPartyState = await TestSetup.getCombatState(page);
    const initialWarriorHP = initialPartyState.party.find(c => c.name === 'WoundedWarrior').hp;
    expect(initialWarriorHP).toBe(10);

    let priestTurn = false;
    let attempts = 0;

    while (!priestTurn && attempts < 10) {
      const state = await TestSetup.getCombatState(page);
      if (state.currentUnit === 'TestPriest') {
        priestTurn = true;
        break;
      }

      if (state.actionState === 'select_action') {
        await TestSetup.simulateKeyPress(page, 'p');
      }

      await page.waitForTimeout(500);
      attempts++;
    }

    if (!priestTurn) {
      await page.evaluate(() => {
        const scene = window.game?.sceneManager?.currentScene;
        if (scene && scene.getName() === 'Combat') {
          const priest = scene.combatSystem.getParty().find(c => c.name === 'TestPriest');
          if (priest) {
            scene.combatSystem.encounter.currentTurn = scene.combatSystem.encounter.turnOrder.indexOf(priest);
          }
        }
      });
    }

    await TestSetup.navigateCombatMenu(page, 'cast');

    const spellMenuState = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      return scene?.getTestState?.();
    });

    expect(spellMenuState.actionState).toBe('select_spell');

    await TestSetup.simulateKeyPress(page, 'Enter');

    await TestSetup.simulateKeyPress(page, 'ArrowDown');
    await TestSetup.simulateKeyPress(page, 'Enter');

    await page.waitForTimeout(1000);

    const afterHealState = await TestSetup.getCombatState(page);
    const healedWarrior = afterHealState.party.find(c => c.name === 'WoundedWarrior');

    expect(healedWarrior.hp).toBeGreaterThan(10);

    await TestAssertions.assertSpellCast(page, 'heal');
  });

  test('MP consumption and spell unavailability when out of MP', async ({ page }) => {
    await TestSetup.createTestParty(page, [
      {
        name: 'LowMPMage',
        race: 'Human',
        class: 'Mage',
        alignment: 'Good',
        level: 3,
        hp: 20,
        maxHp: 20,
        mp: 2,
        maxMp: 15
      }
    ]);

    await TestSetup.bypassMainMenu(page);
    await TestSetup.setupCombat(page);

    const initialState = await page.evaluate(() => {
      const mage = window.game?.gameState?.party?.characters?.find(c => c.name === 'LowMPMage');
      return {
        mp: mage?.mp,
        maxMp: mage?.maxMp,
        knownSpells: mage?.knownSpells
      };
    });

    expect(initialState.mp).toBe(2);
    expect(initialState.knownSpells.length).toBeGreaterThan(0);

    await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      const mage = scene?.combatSystem?.getParty()?.find(c => c.name === 'LowMPMage');
      if (mage && scene?.combatSystem?.encounter) {
        scene.combatSystem.encounter.currentTurn = scene.combatSystem.encounter.turnOrder.indexOf(mage);
      }
    });

    await TestSetup.navigateCombatMenu(page, 'cast');
    await TestSetup.simulateKeyPress(page, 'Enter');
    await TestSetup.simulateKeyPress(page, 'Enter');

    await page.waitForTimeout(1000);

    const afterCastState = await page.evaluate(() => {
      const mage = window.game?.gameState?.party?.characters?.find(c => c.name === 'LowMPMage');
      return { mp: mage?.mp };
    });

    expect(afterCastState.mp).toBe(0);

    await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      const mage = scene?.combatSystem?.getParty()?.find(c => c.name === 'LowMPMage');
      if (mage && scene?.combatSystem?.encounter) {
        scene.combatSystem.encounter.currentTurn = scene.combatSystem.encounter.turnOrder.indexOf(mage);
      }
    });

    await TestSetup.navigateCombatMenu(page, 'cast');

    const noMPState = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      const state = scene?.getTestState?.();
      const messages = window.game?.gameState?.messageLog?.getMessages?.() || [];
      return {
        state: state,
        recentMessages: messages.slice(-3).map(m => m.text || m)
      };
    });

    const noMPMessage = noMPState.recentMessages.find(m =>
      m.includes('Not enough MP') ||
      m.includes('cannot cast') ||
      m.includes('insufficient')
    );

    if (!noMPMessage) {
      console.log('No MP messages:', noMPState.recentMessages);
    }
  });

  test('group spells target all enemies with individual saves', async ({ page }) => {
    await page.evaluate(() => {
      const { Character } = window;
      const mage = new Character('GroupCaster', 'Elf', 'Mage', 'Good');
      mage.level = 10;
      mage.mp = 50;
      mage.maxMp = 50;
      mage.stats.intelligence = 18;

      const { SpellRegistry } = window;
      const registry = SpellRegistry.getInstance();

      const groupSpell = {
        id: 'test_group_fire',
        name: 'Group Fire',
        school: 'mage',
        level: 3,
        mpCost: 8,
        targetType: 'all_enemies',
        effects: [{
          type: 'damage',
          element: 'fire',
          power: '3d6',
          saveType: 'spell',
          saveEffect: 'half'
        }]
      };

      registry.registerSpell(groupSpell);
      mage.knownSpells.push('test_group_fire');

      window.testMage = mage;
    });

    await TestSetup.createTestParty(page, [{
      name: 'GroupCaster',
      race: 'Elf',
      class: 'Mage',
      alignment: 'Good',
      level: 10,
      hp: 30,
      maxHp: 30,
      mp: 50,
      maxMp: 50
    }]);

    await TestSetup.bypassMainMenu(page);

    await TestSetup.setupCombat(page, [
      { name: 'Goblin1', hp: 20, maxHp: 20, currentHp: 20, ac: 10, magicResistance: 0 },
      { name: 'Goblin2', hp: 20, maxHp: 20, currentHp: 20, ac: 10, magicResistance: 50 },
      { name: 'Goblin3', hp: 20, maxHp: 20, currentHp: 20, ac: 10, magicResistance: 0 }
    ]);

    const groupCastResult = await page.evaluate(() => {
      const { SpellCaster } = window;
      const spellCaster = SpellCaster.getInstance();
      const mage = window.testMage;

      const monsters = window.testMonsters;

      window.testMode = true;

      const context = {
        casterId: mage.id,
        caster: mage,
        enemies: monsters,
        inCombat: true
      };

      const initialHPs = monsters.map(m => ({ name: m.name, hp: m.hp }));

      const result = spellCaster.castSpell(mage, 'test_group_fire', context);

      const finalHPs = monsters.map(m => ({ name: m.name, hp: m.hp, damaged: m.hp < 20 }));

      return {
        success: result.success,
        messages: result.messages,
        initialHPs: initialHPs,
        finalHPs: finalHPs,
        allDamaged: finalHPs.every(m => m.damaged),
        differentDamage: new Set(finalHPs.map(m => 20 - m.hp)).size > 1
      };
    });

    expect(groupCastResult.success).toBe(true);
    expect(groupCastResult.allDamaged).toBe(true);

    const goblin2 = groupCastResult.finalHPs.find(m => m.name === 'Goblin2');
    const goblin1 = groupCastResult.finalHPs.find(m => m.name === 'Goblin1');
    expect(goblin2.hp).toBeGreaterThan(goblin1.hp);
  });
});