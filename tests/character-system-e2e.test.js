const { test, expect } = require('@playwright/test');

test.describe('WGIV Character System E2E Tests', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should allow creation of characters from all races and classes', async () => {
    // Test creating one character from each race
    const testCases = [
      { name: 'HumanFtr', race: 'Human', class: 'Fighter', gender: 'male' },
      { name: 'ElfMage', race: 'Elf', class: 'Mage', gender: 'female' },
      { name: 'DwarfPrst', race: 'Dwarf', class: 'Priest', gender: 'male' },
      { name: 'GnomeBish', race: 'Gnome', class: 'Bishop', gender: 'male' },
      { name: 'HobbitThf', race: 'Hobbit', class: 'Thief', gender: 'female' },
      { name: 'FaerieAlc', race: 'Faerie', class: 'Alchemist', gender: 'male' }
    ];

    for (const testCase of testCases) {
      // Set up test mode for deterministic stats
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

      // Type character name
      for (const char of testCase.name) {
        await page.keyboard.press(char);
        await page.waitForTimeout(50);
      }
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      // Select race
      const raceIndex = ['Human', 'Elf', 'Dwarf', 'Gnome', 'Hobbit', 'Faerie', 'Lizman', 'Dracon', 'Rawulf', 'Mook', 'Felpurr'].indexOf(testCase.race);
      for (let i = 0; i < raceIndex; i++) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(50);
      }
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      // Select gender
      if (testCase.gender === 'female') {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(50);
      }
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      // Select class
      const classIndex = ['Fighter', 'Mage', 'Priest', 'Thief', 'Alchemist', 'Bishop', 'Bard', 'Ranger', 'Psionic', 'Valkyrie', 'Samurai', 'Lord', 'Monk', 'Ninja'].indexOf(testCase.class);
      for (let i = 0; i < classIndex; i++) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(50);
      }
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      // Select alignment (default to Good)
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      // Confirm character creation
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      // Verify character was created
      const character = await page.evaluate(() => {
        const party = window.game?.gameState?.party?.characters;
        return party ? party[party.length - 1] : null;
      });

      expect(character).toBeTruthy();
      expect(character.name).toBe(testCase.name);
      expect(character.race).toBe(testCase.race);
      expect(character.class).toBe(testCase.class);
      expect(character.gender).toBe(testCase.gender);

      // Go back to create another character (if not the last one)
      if (testCase !== testCases[testCases.length - 1]) {
        await page.keyboard.press('Enter'); // Select "Create Another"
        await page.waitForTimeout(200);
      }
    }

    // Verify we have a full party
    const partySize = await page.evaluate(() => {
      const party = window.game?.gameState?.party?.characters;
      return party ? party.length : 0;
    });
    expect(partySize).toBe(6);
  });

  test('should enforce Valkyrie female-only restriction', async () => {
    // Set up high stats to meet Valkyrie requirements
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

    // Create male character - Valkyrie should not be selectable
    await page.keyboard.type('MaleTest');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    // Select Human race
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    // Select male gender
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    // Try to select Valkyrie (index 9)
    for (let i = 0; i < 9; i++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(50);
    }

    // Check if we can select it
    const canSelectValkyrie = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      if (scene && scene.canSelectClass) {
        return scene.canSelectClass('Valkyrie');
      }
      return false;
    });

    expect(canSelectValkyrie).toBe(false);

    // Go back and try with female
    await page.keyboard.press('Escape'); // Back to gender
    await page.waitForTimeout(200);

    // Select female
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    // Check if Valkyrie is now selectable
    const canSelectValkyrieAsFemale = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      if (scene && scene.canSelectClass) {
        return scene.canSelectClass('Valkyrie');
      }
      return false;
    });

    expect(canSelectValkyrieAsFemale).toBe(true);
  });

  test('should apply race-based stat ranges', async () => {
    const races = [
      { name: 'Faerie', minStr: 5, maxStr: 15, minAgi: 14, maxAgi: 24 },
      { name: 'Lizman', minStr: 12, maxStr: 22, minVit: 14, maxVit: 24 }
    ];

    for (const race of races) {
      // Clear test mode to get normal random stats
      await page.evaluate(() => {
        window.testMode = false;
        delete window.forceStats;
      });

      // Create character
      await page.keyboard.type(`Test${race.name}`);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      // Select race
      const raceIndex = ['Human', 'Elf', 'Dwarf', 'Gnome', 'Hobbit', 'Faerie', 'Lizman', 'Dracon', 'Rawulf', 'Mook', 'Felpurr'].indexOf(race.name);
      for (let i = 0; i < raceIndex; i++) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(50);
      }
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      // Select gender
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      // Select Fighter class (no requirements)
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      // Select alignment
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      // Confirm creation
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      // Check character stats
      const character = await page.evaluate(() => {
        const party = window.game?.gameState?.party?.characters;
        return party ? party[party.length - 1] : null;
      });

      expect(character).toBeTruthy();
      expect(character.race).toBe(race.name);

      // Verify stats are within racial ranges
      if (race.minStr && race.maxStr) {
        expect(character.stats.strength).toBeGreaterThanOrEqual(race.minStr);
        expect(character.stats.strength).toBeLessThanOrEqual(race.maxStr);
      }
      if (race.minAgi && race.maxAgi) {
        expect(character.stats.agility).toBeGreaterThanOrEqual(race.minAgi);
        expect(character.stats.agility).toBeLessThanOrEqual(race.maxAgi);
      }
      if (race.minVit && race.maxVit) {
        expect(character.stats.vitality).toBeGreaterThanOrEqual(race.minVit);
        expect(character.stats.vitality).toBeLessThanOrEqual(race.maxVit);
      }

      // Go back to main menu for next test
      if (race !== races[races.length - 1]) {
        await page.keyboard.press('ArrowDown'); // Select "Start Adventure"
        await page.keyboard.press('ArrowDown'); // Select "Remove Last"
        await page.keyboard.press('Enter');
        await page.waitForTimeout(200);
        await page.keyboard.press('Enter'); // Create Another
        await page.waitForTimeout(200);
      }
    }
  });

  test('should track experience modifiers correctly', async () => {
    const combinations = [
      { race: 'Faerie', class: 'Mage', expectedModifier: 0.8 },
      { race: 'Human', class: 'Fighter', expectedModifier: 1.0 }
    ];

    for (const combo of combinations) {
      // Set up test stats
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

      // Create character
      await page.keyboard.type(`Test${combo.race}${combo.class}`);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      // Select race
      const raceIndex = ['Human', 'Elf', 'Dwarf', 'Gnome', 'Hobbit', 'Faerie', 'Lizman', 'Dracon', 'Rawulf', 'Mook', 'Felpurr'].indexOf(combo.race);
      for (let i = 0; i < raceIndex; i++) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(50);
      }
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      // Select gender
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      // Select class
      const classIndex = ['Fighter', 'Mage', 'Priest', 'Thief', 'Alchemist'].indexOf(combo.class);
      for (let i = 0; i < classIndex; i++) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(50);
      }
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      // Select alignment
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      // Confirm creation
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      // Check experience modifier
      const character = await page.evaluate(() => {
        const party = window.game?.gameState?.party?.characters;
        return party ? party[party.length - 1] : null;
      });

      expect(character).toBeTruthy();
      expect(character.experienceModifier).toBeCloseTo(combo.expectedModifier, 1);

      // Clean up for next test
      if (combo !== combinations[combinations.length - 1]) {
        await page.keyboard.press('ArrowDown'); // Select "Start Adventure"
        await page.keyboard.press('ArrowDown'); // Select "Remove Last"
        await page.keyboard.press('Enter');
        await page.waitForTimeout(200);
        await page.keyboard.press('Enter'); // Create Another
        await page.waitForTimeout(200);
      }
    }
  });

  test('should set pendingLevelUp flag when gaining experience', async () => {
    // Create a test character
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

    await page.keyboard.type('LevelTest');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    // Human Fighter
    await page.keyboard.press('Enter'); // Race
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter'); // Gender
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter'); // Class
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter'); // Alignment
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter'); // Confirm
    await page.waitForTimeout(200);

    // Give the character experience
    await page.evaluate(() => {
      const party = window.game?.gameState?.party?.characters;
      if (party && party.length > 0) {
        const character = party[0];
        character.addExperience(1000); // Should be enough for level 2
      }
    });

    // Check for pending level up
    const characterState = await page.evaluate(() => {
      const party = window.game?.gameState?.party?.characters;
      if (party && party.length > 0) {
        const character = party[0];
        return {
          level: character.level,
          pendingLevelUp: character.pendingLevelUp,
          experience: character.experience
        };
      }
      return null;
    });

    expect(characterState).toBeTruthy();
    expect(characterState.level).toBe(1);
    expect(characterState.pendingLevelUp).toBe(true);

    // Test confirmLevelUp
    await page.evaluate(() => {
      const party = window.game?.gameState?.party?.characters;
      if (party && party.length > 0) {
        const character = party[0];
        character.confirmLevelUp();
      }
    });

    const leveledState = await page.evaluate(() => {
      const party = window.game?.gameState?.party?.characters;
      if (party && party.length > 0) {
        const character = party[0];
        return {
          level: character.level,
          pendingLevelUp: character.pendingLevelUp
        };
      }
      return null;
    });

    expect(leveledState).toBeTruthy();
    expect(leveledState.level).toBe(2);
    expect(leveledState.pendingLevelUp).toBe(false);
  });

  test('should save game with version 0.0.3', async () => {
    // Create a character first
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

    await page.keyboard.type('SaveTest');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter'); // Race
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter'); // Gender
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter'); // Class
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter'); // Alignment
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter'); // Confirm
    await page.waitForTimeout(200);

    // Trigger save
    await page.evaluate(() => {
      const saveManager = window.SaveManager || window.game?.saveManager;
      if (saveManager && window.game?.gameState) {
        saveManager.saveGame(window.game.gameState, 100);
      }
    });

    // Check saved data
    const saveData = await page.evaluate(() => {
      const saveKey = 'drpg2_save';
      const saved = localStorage.getItem(saveKey);
      return saved ? JSON.parse(saved) : null;
    });

    expect(saveData).toBeTruthy();
    expect(saveData.version).toBe('0.0.3');
  });
});