const { test, expect } = require('@playwright/test');

test.describe('WGIV Character System Basic Tests', () => {
  test('should create a character and verify WGIV features', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Enable test mode for predictable stats
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

    // Create a Human Fighter
    await page.keyboard.type('TestChar');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    // Select Human (first option - just press Enter)
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    // Select Male gender (first option - just press Enter)
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    // Select Fighter class (first option - just press Enter)
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    // Select Good alignment (first option - just press Enter)
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    // Confirm character creation
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Check that the character was created with correct attributes
    const gameData = await page.evaluate(() => {
      // Try to find the game object and party
      const game = window.game;
      if (!game) return { error: 'No game object found' };

      const gameState = game.gameState || game.services?.gameState;
      if (!gameState) return { error: 'No gameState found' };

      const party = gameState.party;
      if (!party) return { error: 'No party found' };

      const characters = party.characters || party.members;
      if (!characters || characters.length === 0) return { error: 'No characters in party' };

      const character = characters[0];
      return {
        name: character.name,
        race: character.race,
        class: character.class,
        gender: character.gender,
        level: character.level,
        experienceModifier: character.experienceModifier,
        pendingLevelUp: character.pendingLevelUp,
        stats: character.stats
      };
    });

    console.log('Game data:', gameData);

    // Verify the character was created correctly
    expect(gameData.error).toBeUndefined();
    expect(gameData.name).toBe('TestChar');
    expect(gameData.race).toBe('Human');
    expect(gameData.class).toBe('Fighter');
    expect(gameData.gender).toBe('male');
    expect(gameData.level).toBe(1);
    expect(gameData.experienceModifier).toBe(1.0);
    expect(gameData.pendingLevelUp).toBe(false);
    expect(gameData.stats.strength).toBe(15);
  });

  test('should verify all 11 races are available', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const raceData = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      if (scene && scene.races) {
        return scene.races;
      }
      return [];
    });

    expect(raceData).toHaveLength(11);
    expect(raceData).toContain('Human');
    expect(raceData).toContain('Elf');
    expect(raceData).toContain('Dwarf');
    expect(raceData).toContain('Gnome');
    expect(raceData).toContain('Hobbit');
    expect(raceData).toContain('Faerie');
    expect(raceData).toContain('Lizman');
    expect(raceData).toContain('Dracon');
    expect(raceData).toContain('Rawulf');
    expect(raceData).toContain('Mook');
    expect(raceData).toContain('Felpurr');
  });

  test('should verify all 14 classes are available', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const classData = await page.evaluate(() => {
      const scene = window.game?.sceneManager?.currentScene;
      if (scene && scene.classes) {
        return scene.classes;
      }
      return [];
    });

    expect(classData).toHaveLength(14);
    expect(classData).toContain('Fighter');
    expect(classData).toContain('Mage');
    expect(classData).toContain('Priest');
    expect(classData).toContain('Thief');
    expect(classData).toContain('Alchemist');
    expect(classData).toContain('Bishop');
    expect(classData).toContain('Bard');
    expect(classData).toContain('Ranger');
    expect(classData).toContain('Psionic');
    expect(classData).toContain('Valkyrie');
    expect(classData).toContain('Samurai');
    expect(classData).toContain('Lord');
    expect(classData).toContain('Monk');
    expect(classData).toContain('Ninja');
  });

  test('should test experience system with pending level up', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

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

    await page.keyboard.type('ExpTest');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter'); // Race (Human)
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter'); // Gender (Male)
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter'); // Class (Fighter)
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter'); // Alignment (Good)
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter'); // Confirm
    await page.waitForTimeout(500);

    // Add experience and check for pending level up
    const levelData = await page.evaluate(() => {
      const game = window.game;
      const gameState = game?.gameState || game?.services?.gameState;
      const party = gameState?.party;
      const characters = party?.characters || party?.members;

      if (characters && characters.length > 0) {
        const character = characters[0];

        // Add 1000 experience (should be enough for level 2)
        character.addExperience(1000);

        const beforeLevelUp = {
          level: character.level,
          experience: character.experience,
          pendingLevelUp: character.pendingLevelUp
        };

        // Confirm the level up
        if (character.pendingLevelUp && character.confirmLevelUp) {
          character.confirmLevelUp();
        }

        const afterLevelUp = {
          level: character.level,
          pendingLevelUp: character.pendingLevelUp
        };

        return {
          beforeLevelUp,
          afterLevelUp,
          experienceModifier: character.experienceModifier
        };
      }
      return null;
    });

    expect(levelData).toBeTruthy();
    expect(levelData.beforeLevelUp.level).toBe(1);
    expect(levelData.beforeLevelUp.pendingLevelUp).toBe(true);
    expect(levelData.afterLevelUp.level).toBe(2);
    expect(levelData.afterLevelUp.pendingLevelUp).toBe(false);
  });

  test('should verify save game version', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Create a character
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
    await page.waitForTimeout(500);

    // Save the game
    const saveResult = await page.evaluate(() => {
      try {
        // Import SaveManager if available
        const SaveManager = window.SaveManager ||
                           window.game?.SaveManager ||
                           window.game?.services?.SaveManager ||
                           (window.game?.utils ? window.game.utils.SaveManager : null);

        if (!SaveManager) {
          // Try to use the SaveManager module directly
          const { SaveManager: SM } = window.modules?.utils || {};
          if (SM) {
            const gameState = window.game?.gameState || window.game?.services?.gameState;
            SM.saveGame(gameState, 100);
            const saveKey = 'drpg2_save';
            const savedData = localStorage.getItem(saveKey);
            return savedData ? JSON.parse(savedData) : null;
          }
          return { error: 'SaveManager not found' };
        }

        const gameState = window.game?.gameState || window.game?.services?.gameState;
        SaveManager.saveGame(gameState, 100);

        const saveKey = 'drpg2_save';
        const savedData = localStorage.getItem(saveKey);
        return savedData ? JSON.parse(savedData) : null;
      } catch (e) {
        return { error: e.message };
      }
    });

    console.log('Save result:', saveResult);

    expect(saveResult).toBeTruthy();
    expect(saveResult.error).toBeUndefined();
    expect(saveResult.version).toBe('0.0.3');
  });
});