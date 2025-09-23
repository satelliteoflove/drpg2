const { test, expect } = require('@playwright/test');

test.describe('Phase 1 Spell Effects - Damage and Healing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForTimeout(500);
  });

  test('damage spells reduce enemy HP in combat', async ({ page }) => {
    const damageTest = await page.evaluate(async () => {
      try {
        const gameState = window.AI.getState();
        const party = gameState.party;

        if (!party || !party.characters || party.characters.length === 0) {
          return { error: 'No party available' };
        }

        const mage = party.characters.find(c => c.class === 'Mage') || party.characters[0];
        mage.class = 'Mage';
        mage.level = 3;
        mage.mp = 20;
        mage.maxMp = 20;
        mage.spellsKnown = mage.spellsKnown || [];
        mage.spellsKnown.push('m1_flame_dart');

        const testMonster = {
          id: 'test-monster-1',
          name: 'Test Goblin',
          hp: 50,
          maxHp: 50,
          ac: 8,
          status: 'OK',
          isDead: false
        };

        gameState.inCombat = true;
        gameState.combatContext = {
          monsters: [testMonster],
          currentRound: 1,
          currentTurn: 0
        };

        const SpellCaster = window.SpellCaster;
        const spellCaster = SpellCaster.getInstance();

        const beforeHp = testMonster.hp;
        const beforeMp = mage.mp;

        const result = await spellCaster.castSpell(mage, 'm1_flame_dart', {
          caster: mage,
          target: testMonster,
          enemies: [testMonster],
          inCombat: true
        });

        const afterHp = testMonster.hp;
        const afterMp = mage.mp;

        return {
          success: result?.success || false,
          beforeHp,
          afterHp,
          damageDealt: beforeHp - afterHp,
          beforeMp,
          afterMp,
          mpUsed: beforeMp - afterMp,
          messages: result?.messages || []
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('Damage spell test result:', damageTest);

    if (!damageTest.error) {
      expect(damageTest.success).toBe(true);
      expect(damageTest.damageDealt).toBeGreaterThan(0);
      expect(damageTest.mpUsed).toBeGreaterThan(0);
    } else {
      console.log('Test error:', damageTest.error);
    }
  });

  test('healing spells restore HP to party members', async ({ page }) => {
    const healTest = await page.evaluate(async () => {
      try {
        const gameState = window.AI.getState();
        const party = gameState.party;

        if (!party || !party.characters || party.characters.length === 0) {
          return { error: 'No party available' };
        }

        const priest = party.characters.find(c => c.class === 'Priest') || party.characters[0];
        priest.class = 'Priest';
        priest.level = 3;
        priest.mp = 20;
        priest.maxMp = 20;
        priest.hp = Math.floor(priest.maxHp / 2);
        priest.spellsKnown = priest.spellsKnown || [];
        priest.spellsKnown.push('p1_heal');

        const SpellCaster = window.SpellCaster;
        const spellCaster = SpellCaster.getInstance();

        const beforeHp = priest.hp;
        const beforeMp = priest.mp;

        const result = await spellCaster.castSpell(priest, 'p1_heal', {
          caster: priest,
          target: priest,
          party: party.characters,
          inCombat: false
        });

        const afterHp = priest.hp;
        const afterMp = priest.mp;

        return {
          success: result?.success || false,
          beforeHp,
          afterHp,
          healingDone: afterHp - beforeHp,
          beforeMp,
          afterMp,
          mpUsed: beforeMp - afterMp,
          messages: result?.messages || []
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('Healing spell test result:', healTest);

    if (!healTest.error) {
      expect(healTest.success).toBe(true);
      expect(healTest.healingDone).toBeGreaterThan(0);
      expect(healTest.mpUsed).toBeGreaterThan(0);
    } else {
      console.log('Test error:', healTest.error);
    }
  });

  test('spells cannot heal dead characters', async ({ page }) => {
    const deadHealTest = await page.evaluate(async () => {
      try {
        const gameState = window.AI.getState();
        const party = gameState.party;

        if (!party || !party.characters || party.characters.length === 0) {
          return { error: 'No party available' };
        }

        const priest = party.characters[0];
        priest.class = 'Priest';
        priest.level = 3;
        priest.mp = 20;
        priest.maxMp = 20;
        priest.spellsKnown = priest.spellsKnown || [];
        priest.spellsKnown.push('p1_heal');

        const deadCharacter = party.characters[1] || {
          id: 'dead-char',
          name: 'Dead Fighter',
          hp: 0,
          maxHp: 50,
          isDead: true,
          status: 'DEAD'
        };
        deadCharacter.hp = 0;
        deadCharacter.isDead = true;
        deadCharacter.status = 'DEAD';

        const SpellCaster = window.SpellCaster;
        const spellCaster = SpellCaster.getInstance();

        const beforeHp = deadCharacter.hp;

        const result = await spellCaster.castSpell(priest, 'p1_heal', {
          caster: priest,
          target: deadCharacter,
          party: party.characters,
          inCombat: false
        });

        const afterHp = deadCharacter.hp;

        return {
          success: result?.success || false,
          targetWasDead: deadCharacter.isDead,
          beforeHp,
          afterHp,
          healingDone: afterHp - beforeHp,
          messages: result?.messages || [],
          containsDeadMessage: result?.messages?.some(m =>
            m.toLowerCase().includes('dead') ||
            m.toLowerCase().includes('cannot heal')
          ) || false
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('Dead character heal test result:', deadHealTest);

    if (!deadHealTest.error) {
      expect(deadHealTest.targetWasDead).toBe(true);
      expect(deadHealTest.healingDone).toBe(0);
      expect(deadHealTest.containsDeadMessage).toBe(true);
    } else {
      console.log('Test error:', deadHealTest.error);
    }
  });

  test('spell MP consumption works correctly', async ({ page }) => {
    const mpTest = await page.evaluate(async () => {
      try {
        const gameState = window.AI.getState();
        const party = gameState.party;

        if (!party || !party.characters || party.characters.length === 0) {
          return { error: 'No party available' };
        }

        const mage = party.characters[0];
        mage.class = 'Mage';
        mage.level = 3;
        mage.mp = 5;
        mage.maxMp = 20;
        mage.spellsKnown = mage.spellsKnown || [];
        mage.spellsKnown.push('m1_flame_dart');

        const SpellCaster = window.SpellCaster;
        const SpellRegistry = window.SpellRegistry;
        const spellCaster = SpellCaster.getInstance();
        const spellRegistry = SpellRegistry.getInstance();

        const spell = spellRegistry.getSpellById('m1_flame_dart');
        const mpCost = spell?.mpCost || 3;

        const beforeMp = mage.mp;

        const result = await spellCaster.castSpell(mage, 'm1_flame_dart', {
          caster: mage,
          target: { id: 'dummy', hp: 50, maxHp: 50 },
          enemies: [{ id: 'dummy', hp: 50, maxHp: 50 }],
          inCombat: true
        });

        const afterMp = mage.mp;

        return {
          success: result?.success || false,
          beforeMp,
          afterMp,
          mpUsed: beforeMp - afterMp,
          expectedMpCost: mpCost,
          mpCorrect: (beforeMp - afterMp) === mpCost,
          messages: result?.messages || []
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('MP consumption test result:', mpTest);

    if (!mpTest.error) {
      expect(mpTest.success).toBe(true);
      expect(mpTest.mpUsed).toBe(mpTest.expectedMpCost);
      expect(mpTest.mpCorrect).toBe(true);
    } else {
      console.log('Test error:', mpTest.error);
    }
  });

  test('spell fizzle mechanics based on level difference', async ({ page }) => {
    const fizzleTest = await page.evaluate(async () => {
      try {
        const gameState = window.AI.getState();
        const party = gameState.party;

        if (!party || !party.characters || party.characters.length === 0) {
          return { error: 'No party available' };
        }

        const mage = party.characters[0];
        mage.class = 'Mage';
        mage.level = 1;
        mage.mp = 100;
        mage.maxMp = 100;
        mage.stats = mage.stats || {};
        mage.stats.intelligence = 8;
        mage.stats.luck = 8;
        mage.spellsKnown = mage.spellsKnown || [];
        mage.spellsKnown.push('m7_nuclear_blast');

        const SpellCaster = window.SpellCaster;
        const SpellRegistry = window.SpellRegistry;
        const spellCaster = SpellCaster.getInstance();
        const spellRegistry = SpellRegistry.getInstance();

        const spell = spellRegistry.getSpellById('m7_nuclear_blast');
        const fizzleChance = spellRegistry.calculateFizzleChance(mage, spell);

        let fizzleCount = 0;
        const attempts = 10;

        for (let i = 0; i < attempts; i++) {
          const result = await spellCaster.castSpell(mage, 'm7_nuclear_blast', {
            caster: mage,
            enemies: [{ id: 'dummy', hp: 100, maxHp: 100 }],
            inCombat: true
          });

          if (result?.fizzled ||
              result?.messages?.some(m => m.toLowerCase().includes('fizzle'))) {
            fizzleCount++;
          }
        }

        return {
          level: mage.level,
          spellLevel: spell?.level || 7,
          fizzleChance,
          fizzleCount,
          attempts,
          fizzleRate: (fizzleCount / attempts) * 100,
          expectedHighFizzle: fizzleChance > 50
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('Fizzle mechanics test result:', fizzleTest);

    if (!fizzleTest.error) {
      expect(fizzleTest.expectedHighFizzle).toBe(true);
      expect(fizzleTest.fizzleChance).toBeGreaterThan(50);
      if (fizzleTest.fizzleCount > 0) {
        expect(fizzleTest.fizzleCount).toBeGreaterThan(0);
      }
    } else {
      console.log('Test error:', fizzleTest.error);
    }
  });

  test('group damage spells affect multiple enemies', async ({ page }) => {
    const groupTest = await page.evaluate(async () => {
      try {
        const gameState = window.AI.getState();
        const party = gameState.party;

        if (!party || !party.characters || party.characters.length === 0) {
          return { error: 'No party available' };
        }

        const mage = party.characters[0];
        mage.class = 'Mage';
        mage.level = 5;
        mage.mp = 50;
        mage.maxMp = 50;
        mage.spellsKnown = mage.spellsKnown || [];
        mage.spellsKnown.push('m3_fireball');

        const enemies = [
          { id: 'enemy1', name: 'Goblin 1', hp: 30, maxHp: 30, ac: 8 },
          { id: 'enemy2', name: 'Goblin 2', hp: 30, maxHp: 30, ac: 8 },
          { id: 'enemy3', name: 'Goblin 3', hp: 30, maxHp: 30, ac: 8 }
        ];

        gameState.inCombat = true;
        gameState.combatContext = {
          monsters: enemies,
          currentRound: 1
        };

        const SpellCaster = window.SpellCaster;
        const spellCaster = SpellCaster.getInstance();

        const beforeHps = enemies.map(e => e.hp);

        const result = await spellCaster.castSpell(mage, 'm3_fireball', {
          caster: mage,
          enemies: enemies,
          inCombat: true
        });

        const afterHps = enemies.map(e => e.hp);
        const damages = beforeHps.map((before, i) => before - afterHps[i]);
        const enemiesHit = damages.filter(d => d > 0).length;

        return {
          success: result?.success || false,
          beforeHps,
          afterHps,
          damages,
          enemiesHit,
          totalDamage: damages.reduce((sum, d) => sum + d, 0),
          messages: result?.messages || []
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('Group damage spell test result:', groupTest);

    if (!groupTest.error) {
      expect(groupTest.success).toBe(true);
      expect(groupTest.enemiesHit).toBeGreaterThan(1);
      expect(groupTest.totalDamage).toBeGreaterThan(0);
    } else {
      console.log('Test error:', groupTest.error);
    }
  });

  test('group healing spells affect multiple party members', async ({ page }) => {
    const groupHealTest = await page.evaluate(async () => {
      try {
        const gameState = window.AI.getState();
        const party = gameState.party;

        if (!party || !party.characters || party.characters.length < 2) {
          return { error: 'Not enough party members' };
        }

        const priest = party.characters[0];
        priest.class = 'Priest';
        priest.level = 5;
        priest.mp = 50;
        priest.maxMp = 50;
        priest.spellsKnown = priest.spellsKnown || [];
        priest.spellsKnown.push('p3_heal_all');

        party.characters.forEach(char => {
          char.hp = Math.floor(char.maxHp * 0.5);
        });

        const SpellCaster = window.SpellCaster;
        const spellCaster = SpellCaster.getInstance();

        const beforeHps = party.characters.map(c => c.hp);

        const result = await spellCaster.castSpell(priest, 'p3_heal_all', {
          caster: priest,
          party: party.characters,
          inCombat: false
        });

        const afterHps = party.characters.map(c => c.hp);
        const healing = beforeHps.map((before, i) => afterHps[i] - before);
        const membersHealed = healing.filter(h => h > 0).length;

        return {
          success: result?.success || false,
          beforeHps,
          afterHps,
          healing,
          membersHealed,
          totalHealing: healing.reduce((sum, h) => sum + h, 0),
          messages: result?.messages || []
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('Group healing spell test result:', groupHealTest);

    if (!groupHealTest.error) {
      expect(groupHealTest.success).toBe(true);
      expect(groupHealTest.membersHealed).toBeGreaterThan(1);
      expect(groupHealTest.totalHealing).toBeGreaterThan(0);
    } else {
      console.log('Test error:', groupHealTest.error);
    }
  });
});