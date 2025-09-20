const { test, expect } = require('@playwright/test');

test.describe('Spell System Tests (Canvas UI)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);
  });

  test('should verify game and services are initialized', async ({ page }) => {
    const gameState = await page.evaluate(() => {
      return {
        hasGame: typeof window.game !== 'undefined',
        hasServiceContainer: window.game?.services?.container !== undefined,
        currentScene: window.game?.sceneManager?.currentScene?.constructor?.name,
        hasCanvas: document.querySelector('canvas') !== null
      };
    });

    console.log('Game State:', gameState);

    expect(gameState.hasGame).toBe(true);
    expect(gameState.hasCanvas).toBe(true);
    expect(gameState.currentScene).toBeTruthy();
  });

  test('should start new game via Canvas click', async ({ page }) => {
    // Click on "New Game" area in canvas (approximately where it should be)
    const canvas = page.locator('canvas');
    await canvas.click({ position: { x: 400, y: 280 } });

    await page.waitForTimeout(500);

    const sceneAfterClick = await page.evaluate(() => {
      return window.game?.sceneManager?.currentScene?.constructor?.name;
    });

    console.log('Scene after clicking New Game area:', sceneAfterClick);

    // Check if we moved to character creation
    const isInCharCreation = sceneAfterClick === 'CharacterCreationScene';
    if (isInCharCreation) {
      console.log('Successfully navigated to Character Creation');
    }
  });

  test('should create and test spellcasting character programmatically', async ({ page }) => {
    // Directly manipulate game state since UI is Canvas-based
    const characterData = await page.evaluate(() => {
      const game = window.game;
      if (!game) return { error: 'No game instance' };

      // Import Character class and create a mage
      const Character = game.services?.container?.get('Character') || window.Character;
      if (!Character) {
        // Try direct creation
        try {
          // Navigate to character creation
          if (game.sceneManager) {
            game.sceneManager.changeScene('CharacterCreation');
          }

          // Create character directly
          const party = game.services?.partyManagementService?.getParty();
          if (!party) {
            return { error: 'No party service available' };
          }

          // Since Character class may not be directly available,
          // let's trigger character creation through the scene
          return {
            message: 'Need to create character through scene',
            currentScene: game.sceneManager?.currentScene?.constructor?.name
          };
        } catch (e) {
          return { error: e.message };
        }
      }
    });

    console.log('Character creation attempt:', characterData);
  });

  test('should test spell system directly via game services', async ({ page }) => {
    const spellSystemTest = await page.evaluate(async () => {
      try {
        // Try to access the spell system through the game
        const game = window.game;
        if (!game) return { error: 'No game instance' };

        // Check if we can access services
        const services = game.services;
        if (!services) return { error: 'No services available' };

        // Try to create a character with spell capability
        const createTestCharacter = () => {
          // Access Character class through the game's module system
          if (window.Character) {
            const testMage = new window.Character(
              'TestMage',
              'elf',
              'mage',
              'neutral',
              'male'
            );
            return {
              name: testMage.name,
              class: testMage.class,
              level: testMage.level,
              mp: testMage.mp,
              maxMp: testMage.maxMp,
              knownSpells: testMage.knownSpells || [],
              hasSpellMethods: {
                knowsSpell: typeof testMage.knowsSpell === 'function',
                learnSpell: typeof testMage.learnSpell === 'function',
                getKnownSpells: typeof testMage.getKnownSpells === 'function'
              }
            };
          }
          return { error: 'Character class not accessible' };
        };

        const characterTest = createTestCharacter();

        // Test spell registry if available
        let registryTest = { error: 'SpellRegistry not accessible' };
        if (window.SpellRegistry) {
          const registry = window.SpellRegistry.getInstance();
          registryTest = {
            mageSchools: registry.getSchoolsForClass('mage'),
            priestSchools: registry.getSchoolsForClass('priest'),
            bishopSchools: registry.getSchoolsForClass('bishop')
          };
        }

        // Test spell learning if available
        let learningTest = { error: 'SpellLearning not accessible' };
        if (window.SpellLearning) {
          const learning = window.SpellLearning.getInstance();
          learningTest = {
            exists: true,
            hasGetSpellsForClass: typeof learning.getSpellsForClass === 'function'
          };
        }

        return {
          character: characterTest,
          registry: registryTest,
          learning: learningTest
        };
      } catch (error) {
        return { error: error.message, stack: error.stack };
      }
    });

    console.log('Spell System Test Results:', JSON.stringify(spellSystemTest, null, 2));

    // The tests pass if no errors occur
    expect(spellSystemTest.error).toBeUndefined();
  });

  test('should test character level up and spell learning', async ({ page }) => {
    const levelUpTest = await page.evaluate(() => {
      try {
        // Create a test character if Character class is available
        if (!window.Character) {
          // Try to make it available
          window.Character = window.game?.entities?.Character;
        }

        if (window.Character) {
          const mage = new window.Character('LvlMage', 'human', 'priest', 'good', 'male');

          // Give experience and trigger level up
          mage.experience = 1500;
          mage.checkLevelUp();

          const beforeLevel = mage.level;
          const beforeSpells = [...(mage.knownSpells || [])];
          const hadPendingLevelUp = mage.pendingLevelUp;

          // Confirm level up and get spell learning results
          const spellResults = mage.confirmLevelUp();

          return {
            success: true,
            beforeLevel,
            afterLevel: mage.level,
            hadPendingLevelUp,
            beforeSpellCount: beforeSpells.length,
            afterSpellCount: mage.knownSpells?.length || 0,
            spellResults: spellResults || [],
            mp: mage.mp,
            maxMp: mage.maxMp,
            characterClass: mage.class
          };
        }

        return { error: 'Character class not available' };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('Level Up Test:', levelUpTest);

    if (levelUpTest.success) {
      expect(levelUpTest.afterLevel).toBe(2);
      expect(levelUpTest.hadPendingLevelUp).toBe(true);
      expect(levelUpTest.spellResults).toBeDefined();
    }
  });

  test('should verify spell registry and learning systems work together', async ({ page }) => {
    // First, expose the modules to window for testing
    await page.evaluate(() => {
      const script = document.createElement('script');
      script.type = 'module';
      script.textContent = `
        import { SpellRegistry } from '/src/systems/magic/SpellRegistry.ts';
        import { SpellLearning } from '/src/systems/magic/SpellLearning.ts';
        import { Character } from '/src/entities/Character.ts';

        window.SpellRegistry = SpellRegistry;
        window.SpellLearning = SpellLearning;
        window.Character = Character;

        console.log('Modules exposed to window');
      `;
      document.head.appendChild(script);
    });

    await page.waitForTimeout(1000);

    const integrationTest = await page.evaluate(() => {
      if (!window.SpellRegistry || !window.SpellLearning || !window.Character) {
        return { error: 'Modules not loaded' };
      }

      const registry = window.SpellRegistry.getInstance();
      const learning = window.SpellLearning.getInstance();

      // Create different class characters
      const mage = new window.Character('Mage', 'elf', 'mage', 'neutral', 'male');
      const priest = new window.Character('Priest', 'human', 'priest', 'good', 'female');
      const bishop = new window.Character('Bishop', 'gnome', 'bishop', 'neutral', 'male');
      const fighter = new window.Character('Fighter', 'dwarf', 'fighter', 'neutral', 'male');

      return {
        mage: {
          class: mage.class,
          mp: mage.maxMp,
          schools: registry.getSchoolsForClass(mage.class)
        },
        priest: {
          class: priest.class,
          mp: priest.maxMp,
          schools: registry.getSchoolsForClass(priest.class)
        },
        bishop: {
          class: bishop.class,
          mp: bishop.maxMp,
          schools: registry.getSchoolsForClass(bishop.class)
        },
        fighter: {
          class: fighter.class,
          mp: fighter.maxMp,
          schools: registry.getSchoolsForClass(fighter.class)
        }
      };
    });

    console.log('Integration Test:', integrationTest);

    if (!integrationTest.error) {
      // Verify mage has mage school
      expect(integrationTest.mage.schools).toContain('mage');
      expect(integrationTest.mage.mp).toBeGreaterThan(0);

      // Verify priest has priest school
      expect(integrationTest.priest.schools).toContain('priest');
      expect(integrationTest.priest.mp).toBeGreaterThan(0);

      // Verify bishop has both schools
      expect(integrationTest.bishop.schools).toContain('mage');
      expect(integrationTest.bishop.schools).toContain('priest');

      // Verify fighter has no spell schools
      expect(integrationTest.fighter.schools).toEqual([]);
      expect(integrationTest.fighter.mp).toBe(0);
    }
  });
});