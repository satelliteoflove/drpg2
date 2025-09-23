const { test, expect } = require('@playwright/test');

test.describe('Full Combat Scenario Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
  });

  test('mixed party combat with fighter mage priest', async ({ page, context }) => {
    await page.click('button:has-text("New Game")');
    await page.waitForTimeout(500);

    const party = [
      { name: 'Warrior', race: 'Human', class: 'Fighter', alignment: 'Good' },
      { name: 'Wizard', race: 'Elf', class: 'Mage', alignment: 'Neutral' },
      { name: 'Cleric', race: 'Dwarf', class: 'Priest', alignment: 'Good' }
    ];

    for (let i = 0; i < party.length; i++) {
      const member = party[i];

      if (i > 0) {
        const addButton = await page.$('button:has-text("Add Character"), button:has-text("Add Member"), button:has-text("+")');
        if (addButton) {
          await addButton.click();
          await page.waitForTimeout(500);
        }
      }

      const nameInputs = await page.$$('input[placeholder*="name" i]');
      const targetInput = nameInputs[i] || nameInputs[nameInputs.length - 1];
      await targetInput.fill(member.name);

      const selects = await page.$$(`select`);
      const raceSelectIndex = i * 3;
      const classSelectIndex = i * 3 + 1;
      const alignmentSelectIndex = i * 3 + 2;

      if (selects[raceSelectIndex]) {
        await selects[raceSelectIndex].selectOption(member.race);
      }
      if (selects[classSelectIndex]) {
        await selects[classSelectIndex].selectOption(member.class);
      }
      if (selects[alignmentSelectIndex]) {
        await selects[alignmentSelectIndex].selectOption(member.alignment);
      }

      const genderRadios = await page.$$(`input[type="radio"][name*="gender"]`);
      const targetRadio = genderRadios[i * 2] || genderRadios[0];
      if (targetRadio) {
        await targetRadio.click();
      }

      const rollButtons = await page.$$('button:has-text("Roll Stats"), button:has-text("Roll")');
      if (rollButtons[i]) {
        await rollButtons[i].click();
      } else if (rollButtons.length > 0) {
        await rollButtons[rollButtons.length - 1].click();
      }
      await page.waitForTimeout(500);
    }

    await page.click('button:has-text("Create Party"), button:has-text("Continue"), button:has-text("Start Adventure"), button:has-text("Accept"), button:has-text("Finalize")');
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      const party = window.game?.party;
      if (!party || party.members.length < 3) return null;

      const fighter = party.members.find(m => m.class === 'Fighter');
      const mage = party.members.find(m => m.class === 'Mage');
      const priest = party.members.find(m => m.class === 'Priest');

      if (mage) {
        mage.learnSpell('m1_magic_missile');
        mage.learnSpell('m2_fire_bolt');
        mage.mp = mage.maxMp;
      }

      if (priest) {
        priest.learnSpell('p1_heal_wounds');
        priest.learnSpell('p2_cure_wounds');
        priest.mp = priest.maxMp;
      }

      if (fighter) {
        fighter.takeDamage(15);
      }

      return {
        partyReady: true,
        fighterHP: fighter?.hp,
        mageMP: mage?.mp,
        priestMP: priest?.mp
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

    const combatScenario = await page.evaluate(() => {
      const combat = window.game?.sceneManager?.currentScene?.combat;
      if (!combat) return null;

      const encounter = combat.getEncounter();
      if (!encounter) return null;

      const actions = [];
      const results = [];

      const fighter = encounter.turnOrder.find(u => 'class' in u && u.class === 'Fighter');
      const mage = encounter.turnOrder.find(u => 'class' in u && u.class === 'Mage');
      const priest = encounter.turnOrder.find(u => 'class' in u && u.class === 'Priest');

      const initialState = {
        fighterHP: fighter?.hp,
        mageMP: mage?.mp,
        priestMP: priest?.mp,
        monsterCount: encounter.monsters.filter(m => m.hp > 0).length
      };

      for (let turn = 0; turn < 10; turn++) {
        const currentUnit = combat.getCurrentUnit();
        if (!currentUnit) break;

        if ('class' in currentUnit) {
          let action;
          let result;

          if (currentUnit.class === 'Fighter') {
            result = combat.executePlayerAction('Attack', 0);
            action = { type: 'Fighter Attack', result };
          } else if (currentUnit.class === 'Mage' && currentUnit.mp >= 2) {
            result = combat.executePlayerAction('Cast Spell', 0, 'm1_magic_missile');
            action = { type: 'Mage Cast Spell', result };
          } else if (currentUnit.class === 'Priest' && fighter && fighter.hp < fighter.maxHp && currentUnit.mp >= 3) {
            const fighterIndex = encounter.turnOrder.findIndex(u => u === fighter);
            result = combat.executePlayerAction('Cast Spell', fighterIndex, 'p1_heal_wounds');
            action = { type: 'Priest Heal', result };
          } else {
            result = combat.executePlayerAction('Attack', 0);
            action = { type: `${currentUnit.class} Attack`, result };
          }

          actions.push(action);
        } else {
          const result = combat.executeMonsterTurn();
          if (result) {
            actions.push({ type: 'Monster Attack', result });
          }
        }

        const aliveMonsters = encounter.monsters.filter(m => m.hp > 0).length;
        if (aliveMonsters === 0) {
          results.push({ victory: true });
          break;
        }

        const alivePlayers = encounter.turnOrder.filter(u => 'class' in u && !u.isDead).length;
        if (alivePlayers === 0) {
          results.push({ defeat: true });
          break;
        }
      }

      const finalState = {
        fighterHP: fighter?.hp,
        mageMP: mage?.mp,
        priestMP: priest?.mp,
        monsterCount: encounter.monsters.filter(m => m.hp > 0).length
      };

      return {
        initialState,
        finalState,
        actions,
        results,
        fighterAttacked: actions.some(a => a.type === 'Fighter Attack'),
        mageCastSpell: actions.some(a => a.type === 'Mage Cast Spell'),
        priestHealed: actions.some(a => a.type === 'Priest Heal'),
        monstersAttacked: actions.some(a => a.type === 'Monster Attack'),
        mpConsumed: initialState.mageMP > finalState.mageMP || initialState.priestMP > finalState.priestMP,
        combatProgressed: initialState.monsterCount !== finalState.monsterCount ||
                         initialState.fighterHP !== finalState.fighterHP
      };
    });

    expect(combatScenario).not.toBeNull();
    expect(combatScenario.fighterAttacked).toBe(true);
    expect(combatScenario.combatProgressed).toBe(true);
  });
});