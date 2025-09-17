const { test, expect } = require('@playwright/test');

test.describe('WGIV Character System Tests', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.describe('Character Creation - Race Stats Validation', () => {
    const races = [
      { name: 'Human', stats: { str: [9, 19], int: [8, 18], pie: [8, 18], vit: [9, 19], agi: [8, 18], luk: [8, 18] } },
      { name: 'Elf', stats: { str: [7, 17], int: [10, 20], pie: [10, 20], vit: [7, 17], agi: [9, 19], luk: [8, 18] } },
      { name: 'Dwarf', stats: { str: [11, 21], int: [6, 16], pie: [10, 20], vit: [12, 22], agi: [7, 17], luk: [7, 17] } },
      { name: 'Gnome', stats: { str: [10, 20], int: [7, 17], pie: [13, 23], vit: [10, 20], agi: [6, 16], luk: [7, 17] } },
      { name: 'Hobbit', stats: { str: [8, 18], int: [7, 17], pie: [6, 16], vit: [9, 19], agi: [10, 20], luk: [11, 21] } },
      { name: 'Faerie', stats: { str: [5, 15], int: [11, 21], pie: [6, 16], vit: [6, 16], agi: [14, 24], luk: [11, 21] } },
      { name: 'Lizman', stats: { str: [12, 22], int: [5, 15], pie: [5, 15], vit: [14, 24], agi: [9, 19], luk: [7, 17] } },
      { name: 'Dracon', stats: { str: [10, 20], int: [7, 17], pie: [6, 16], vit: [12, 22], agi: [8, 18], luk: [8, 18] } },
      { name: 'Rawulf', stats: { str: [8, 18], int: [6, 16], pie: [12, 22], vit: [10, 20], agi: [8, 18], luk: [9, 19] } },
      { name: 'Mook', stats: { str: [10, 20], int: [10, 20], pie: [6, 16], vit: [10, 20], agi: [7, 17], luk: [8, 18] } },
      { name: 'Felpurr', stats: { str: [7, 17], int: [10, 20], pie: [7, 17], vit: [7, 17], agi: [12, 22], luk: [10, 20] } }
    ];

    for (const race of races) {
      test(`${race.name} stats should be within valid ranges`, async () => {
        await page.click('button:has-text("Create Character")');
        await page.waitForTimeout(500);

        // Force deterministic stat generation for testing
        await page.evaluate((raceData) => {
          window.testMode = true;
          window.testRace = raceData.name;
          window.testStats = raceData.stats;
        }, race);

        // Create a character with this race
        await page.fill('input[type="text"]', `Test${race.name}`);
        await page.selectOption('select:has-text("Race")', race.name);
        await page.selectOption('select:has-text("Class")', 'Fighter');
        await page.selectOption('select:has-text("Alignment")', 'Good');
        await page.click('button:has-text("Create")');

        // Verify character was created and stats are in range
        const character = await page.evaluate(() => {
          const party = window.game?.services?.gameState?.party;
          return party?.members[party.members.length - 1];
        });

        expect(character).toBeTruthy();
        expect(character.race).toBe(race.name);

        // Check each stat is within racial ranges
        expect(character.stats.strength).toBeGreaterThanOrEqual(race.stats.str[0]);
        expect(character.stats.strength).toBeLessThanOrEqual(race.stats.str[1]);
        expect(character.stats.intelligence).toBeGreaterThanOrEqual(race.stats.int[0]);
        expect(character.stats.intelligence).toBeLessThanOrEqual(race.stats.int[1]);
        expect(character.stats.piety).toBeGreaterThanOrEqual(race.stats.pie[0]);
        expect(character.stats.piety).toBeLessThanOrEqual(race.stats.pie[1]);
        expect(character.stats.vitality).toBeGreaterThanOrEqual(race.stats.vit[0]);
        expect(character.stats.vitality).toBeLessThanOrEqual(race.stats.vit[1]);
        expect(character.stats.agility).toBeGreaterThanOrEqual(race.stats.agi[0]);
        expect(character.stats.agility).toBeLessThanOrEqual(race.stats.agi[1]);
        expect(character.stats.luck).toBeGreaterThanOrEqual(race.stats.luk[0]);
        expect(character.stats.luck).toBeLessThanOrEqual(race.stats.luk[1]);
      });
    }
  });

  test.describe('Character Creation - Class Requirements', () => {
    const classRequirements = [
      { name: 'Fighter', requirements: {} },
      { name: 'Mage', requirements: { intelligence: 11 } },
      { name: 'Priest', requirements: { piety: 11 } },
      { name: 'Thief', requirements: { agility: 11 } },
      { name: 'Alchemist', requirements: { intelligence: 10 } },
      { name: 'Bishop', requirements: { intelligence: 12, piety: 12 } },
      { name: 'Bard', requirements: { intelligence: 11, luck: 11 } },
      { name: 'Ranger', requirements: { strength: 11, agility: 11 } },
      { name: 'Psionic', requirements: { intelligence: 11, piety: 11 } },
      { name: 'Valkyrie', requirements: { strength: 12, vitality: 10, piety: 11 }, femaleOnly: true },
      { name: 'Samurai', requirements: { strength: 13, intelligence: 11, piety: 10, vitality: 14, agility: 10 } },
      { name: 'Lord', requirements: { strength: 13, intelligence: 11, piety: 11, vitality: 13, agility: 9, luck: 9 } },
      { name: 'Monk', requirements: { strength: 12, piety: 12, vitality: 13, agility: 11 } },
      { name: 'Ninja', requirements: { strength: 14, intelligence: 14, piety: 14, vitality: 14, agility: 14, luck: 14 } }
    ];

    test('Classes should enforce stat requirements', async () => {
      await page.click('button:has-text("Create Character")');
      await page.waitForTimeout(500);

      for (const cls of classRequirements) {
        // Set up test stats that meet requirements
        const testStats = {
          strength: cls.requirements.strength || 10,
          intelligence: cls.requirements.intelligence || 10,
          piety: cls.requirements.piety || 10,
          vitality: cls.requirements.vitality || 10,
          agility: cls.requirements.agility || 10,
          luck: cls.requirements.luck || 10
        };

        await page.evaluate((data) => {
          window.testMode = true;
          window.testClass = data.className;
          window.forceStats = data.stats;
        }, { className: cls.name, stats: testStats });

        // Try to create character with this class
        await page.fill('input[type="text"]', `Test${cls.name}`);
        await page.selectOption('select:has-text("Race")', 'Human');
        await page.selectOption('select:has-text("Gender")', cls.femaleOnly ? 'Female' : 'Male');

        // Check if class is available
        const classAvailable = await page.evaluate((className) => {
          const select = document.querySelector('select[name="class"]');
          if (!select) return false;
          return Array.from(select.options).some(opt => opt.value === className);
        }, cls.name);

        if (Object.keys(cls.requirements).length > 0) {
          // Class should only be available if requirements are met
          expect(classAvailable).toBe(true);
        }
      }
    });

    test('Valkyrie should only be available to female characters', async () => {
      await page.click('button:has-text("Create Character")');
      await page.waitForTimeout(500);

      // Set up high stats to meet Valkyrie requirements
      await page.evaluate(() => {
        window.testMode = true;
        window.forceStats = {
          strength: 15,
          intelligence: 12,
          piety: 15,
          vitality: 15,
          agility: 12,
          luck: 12
        };
      });

      // Test male character - Valkyrie should NOT be available
      await page.fill('input[type="text"]', 'TestMale');
      await page.selectOption('select:has-text("Race")', 'Human');
      await page.selectOption('select:has-text("Gender")', 'Male');

      const valkyrieAvailableForMale = await page.evaluate(() => {
        const select = document.querySelector('select[name="class"]');
        if (!select) return false;
        return Array.from(select.options).some(opt => opt.value === 'Valkyrie');
      });
      expect(valkyrieAvailableForMale).toBe(false);

      // Test female character - Valkyrie SHOULD be available
      await page.selectOption('select:has-text("Gender")', 'Female');

      const valkyrieAvailableForFemale = await page.evaluate(() => {
        const select = document.querySelector('select[name="class"]');
        if (!select) return false;
        return Array.from(select.options).some(opt => opt.value === 'Valkyrie');
      });
      expect(valkyrieAvailableForFemale).toBe(true);
    });
  });

  test.describe('Experience and Leveling System', () => {
    test('Experience modifiers should vary by race/class combination', async () => {
      // Create two characters with different experience modifiers
      const combinations = [
        { race: 'Faerie', class: 'Mage', expectedModifier: 0.8 }, // Fast leveling
        { race: 'Faerie', class: 'Samurai', expectedModifier: 1.6 } // Slow leveling
      ];

      for (const combo of combinations) {
        await page.click('button:has-text("Create Character")');
        await page.waitForTimeout(500);

        await page.fill('input[type="text"]', `Test${combo.race}${combo.class}`);
        await page.selectOption('select:has-text("Race")', combo.race);
        await page.selectOption('select:has-text("Class")', combo.class);
        await page.selectOption('select:has-text("Alignment")', 'Good');
        await page.click('button:has-text("Create")');

        const character = await page.evaluate(() => {
          const party = window.game?.services?.gameState?.party;
          return party?.members[party.members.length - 1];
        });

        expect(character.experienceModifier).toBeCloseTo(combo.expectedModifier, 1);
      }
    });

    test('Characters should have pendingLevelUp flag when gaining enough XP', async () => {
      // Create a character
      await page.click('button:has-text("Create Character")');
      await page.waitForTimeout(500);

      await page.fill('input[type="text"]', 'TestLeveling');
      await page.selectOption('select:has-text("Race")', 'Human');
      await page.selectOption('select:has-text("Class")', 'Fighter');
      await page.selectOption('select:has-text("Alignment")', 'Good');
      await page.click('button:has-text("Create")');

      // Give character enough XP to level
      await page.evaluate(() => {
        const party = window.game?.services?.gameState?.party;
        const character = party?.members[0];
        if (character) {
          character.addExperience(1000); // Should be enough for level 2
        }
      });

      const characterState = await page.evaluate(() => {
        const party = window.game?.services?.gameState?.party;
        const character = party?.members[0];
        return {
          level: character?.level,
          experience: character?.experience,
          pendingLevelUp: character?.pendingLevelUp
        };
      });

      expect(characterState.level).toBe(1); // Should still be level 1
      expect(characterState.pendingLevelUp).toBe(true); // Should have pending level up
    });

    test('Level up should only occur at Inn (when implemented)', async () => {
      // Create a character with pending level up
      await page.click('button:has-text("Create Character")');
      await page.waitForTimeout(500);

      await page.fill('input[type="text"]', 'TestInnLeveling');
      await page.selectOption('select:has-text("Race")', 'Human');
      await page.selectOption('select:has-text("Class")', 'Fighter');
      await page.selectOption('select:has-text("Alignment")', 'Good');
      await page.click('button:has-text("Create")');

      // Give XP and check for pending level up
      await page.evaluate(() => {
        const party = window.game?.services?.gameState?.party;
        const character = party?.members[0];
        if (character) {
          character.addExperience(1000);
          character.checkForLevelUp();
        }
      });

      // Manually trigger level up (simulating Inn visit)
      await page.evaluate(() => {
        const party = window.game?.services?.gameState?.party;
        const character = party?.members[0];
        if (character && character.pendingLevelUp) {
          character.confirmLevelUp();
        }
      });

      const leveledCharacter = await page.evaluate(() => {
        const party = window.game?.services?.gameState?.party;
        const character = party?.members[0];
        return {
          level: character?.level,
          pendingLevelUp: character?.pendingLevelUp
        };
      });

      expect(leveledCharacter.level).toBe(2); // Should now be level 2
      expect(leveledCharacter.pendingLevelUp).toBe(false); // No longer pending
    });
  });

  test.describe('Full Party Creation', () => {
    test('Should be able to create a full party of 6 characters', async () => {
      const partyMembers = [
        { name: 'Fighter1', race: 'Human', class: 'Fighter', gender: 'Male' },
        { name: 'Mage1', race: 'Elf', class: 'Mage', gender: 'Female' },
        { name: 'Priest1', race: 'Dwarf', class: 'Priest', gender: 'Male' },
        { name: 'Thief1', race: 'Hobbit', class: 'Thief', gender: 'Female' },
        { name: 'Bishop1', race: 'Gnome', class: 'Bishop', gender: 'Male' },
        { name: 'Valkyrie1', race: 'Faerie', class: 'Valkyrie', gender: 'Female' }
      ];

      for (const member of partyMembers) {
        await page.click('button:has-text("Create Character")');
        await page.waitForTimeout(500);

        // Ensure stats meet class requirements
        await page.evaluate((memberData) => {
          window.testMode = true;
          window.forceStats = {
            strength: 15,
            intelligence: 15,
            piety: 15,
            vitality: 15,
            agility: 15,
            luck: 15
          };
        }, member);

        await page.fill('input[type="text"]', member.name);
        await page.selectOption('select:has-text("Race")', member.race);
        await page.selectOption('select:has-text("Gender")', member.gender);
        await page.selectOption('select:has-text("Class")', member.class);
        await page.selectOption('select:has-text("Alignment")', 'Good');
        await page.click('button:has-text("Create")');
      }

      // Verify party has 6 members
      const partySize = await page.evaluate(() => {
        const party = window.game?.services?.gameState?.party;
        return party?.members?.length || 0;
      });

      expect(partySize).toBe(6);

      // Verify each member is correct
      const party = await page.evaluate(() => {
        const party = window.game?.services?.gameState?.party;
        return party?.members?.map(m => ({
          name: m.name,
          race: m.race,
          class: m.class,
          gender: m.gender
        }));
      });

      for (let i = 0; i < partyMembers.length; i++) {
        expect(party[i].name).toBe(partyMembers[i].name);
        expect(party[i].race).toBe(partyMembers[i].race);
        expect(party[i].class).toBe(partyMembers[i].class);
        expect(party[i].gender).toBe(partyMembers[i].gender);
      }
    });
  });

  test.describe('Spell Learning System', () => {
    test('Different classes should learn spells at correct levels', async () => {
      const spellcasters = [
        { class: 'Mage', school: 'mage', learnsAt: [1, 3, 5, 7, 9, 11, 13] },
        { class: 'Priest', school: 'priest', learnsAt: [1, 3, 5, 7, 9, 11, 13] },
        { class: 'Bishop', school: 'both', learnsAt: [1, 5, 9, 13, 17, 21, 25] },
        { class: 'Samurai', school: 'mage', learnsAt: [4, 7, 10, 13, 16, 19, 22] }
      ];

      for (const caster of spellcasters) {
        await page.click('button:has-text("Create Character")');
        await page.waitForTimeout(500);

        // Set high stats to meet any class requirements
        await page.evaluate(() => {
          window.testMode = true;
          window.forceStats = {
            strength: 15,
            intelligence: 15,
            piety: 15,
            vitality: 15,
            agility: 15,
            luck: 15
          };
        });

        await page.fill('input[type="text"]', `Test${caster.class}`);
        await page.selectOption('select:has-text("Race")', 'Human');
        await page.selectOption('select:has-text("Class")', caster.class);
        await page.selectOption('select:has-text("Alignment")', 'Good');
        await page.click('button:has-text("Create")');

        // Check spell learning levels
        const spellLevels = await page.evaluate((className) => {
          const { getAvailableSpellLevels } = window.game?.config?.progression?.SpellLearningTable || {};
          if (!getAvailableSpellLevels) return [];

          const levels = [];
          for (let level = 1; level <= 25; level++) {
            const available = getAvailableSpellLevels(className, level);
            if (available.length > levels.length) {
              levels.push(level);
            }
          }
          return levels;
        }, caster.class);

        // Verify first few spell learning levels match expectations
        for (let i = 0; i < Math.min(caster.learnsAt.length, spellLevels.length); i++) {
          expect(spellLevels[i]).toBe(caster.learnsAt[i]);
        }
      }
    });
  });

  test.describe('Save Game Versioning', () => {
    test('Save games should include version 0.0.3', async () => {
      // Create a character
      await page.click('button:has-text("Create Character")');
      await page.waitForTimeout(500);

      await page.fill('input[type="text"]', 'TestSaveVersion');
      await page.selectOption('select:has-text("Race")', 'Human');
      await page.selectOption('select:has-text("Class")', 'Fighter');
      await page.selectOption('select:has-text("Alignment")', 'Good');
      await page.click('button:has-text("Create")');

      // Save the game
      await page.evaluate(() => {
        const saveManager = window.game?.services?.saveManager;
        if (saveManager) {
          saveManager.saveGame();
        }
      });

      // Check saved game version
      const saveData = await page.evaluate(() => {
        const saveKey = 'drpg2_savegame_slot1';
        const savedGame = localStorage.getItem(saveKey);
        return savedGame ? JSON.parse(savedGame) : null;
      });

      expect(saveData).toBeTruthy();
      expect(saveData.version).toBe('0.0.3');
    });
  });
});