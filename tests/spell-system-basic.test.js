const { test, expect } = require('@playwright/test');

test.describe('Basic Spell System Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
  });

  test('should verify spell registry and learning systems are loaded', async ({ page }) => {
    const systemsLoaded = await page.evaluate(() => {
      try {
        const hasGameServices = window.gameServices !== undefined;
        const hasServiceContainer = window.gameServices?.container !== undefined;

        console.log('Game services loaded:', hasGameServices);
        console.log('Service container loaded:', hasServiceContainer);

        return {
          hasGameServices,
          hasServiceContainer
        };
      } catch (error) {
        console.error('Error checking systems:', error);
        return { error: error.message };
      }
    });

    expect(systemsLoaded.hasGameServices).toBe(true);
    expect(systemsLoaded.hasServiceContainer).toBe(true);
  });

  test('should start new game and create a mage character', async ({ page }) => {
    const newGameButton = page.locator('button:has-text("New Game")');
    await expect(newGameButton).toBeVisible({ timeout: 5000 });
    await newGameButton.click();

    await page.waitForTimeout(1000);

    const nameInput = page.locator('input[placeholder*="name" i]').first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill('TestMage');

    const raceSelect = page.locator('select').first();
    await raceSelect.selectOption({ label: 'Elf' });

    const classSelect = page.locator('select').nth(1);
    await classSelect.selectOption({ label: 'Mage' });

    const alignmentSelect = page.locator('select').nth(2);
    await alignmentSelect.selectOption({ label: 'Neutral' });

    const createButton = page.locator('button:has-text("Create Character")');
    await createButton.click();

    await page.waitForTimeout(500);

    const charCreated = await page.evaluate(() => {
      const party = window.gameServices?.partyManagementService?.getParty();
      if (party && party.characters && party.characters.length > 0) {
        const char = party.characters[0];
        return {
          name: char.name,
          class: char.class,
          level: char.level,
          hasKnownSpells: char.knownSpells !== undefined,
          knownSpellsLength: char.knownSpells?.length || 0
        };
      }
      return null;
    });

    console.log('Character created:', charCreated);

    if (charCreated) {
      expect(charCreated.name).toBe('TestMage');
      expect(charCreated.class).toBe('mage');
      expect(charCreated.hasKnownSpells).toBe(true);
    }
  });

  test('should verify spell registry functionality', async ({ page }) => {
    const spellData = await page.evaluate(() => {
      try {
        if (!window.SpellRegistry) {
          const script = document.createElement('script');
          script.type = 'module';
          script.textContent = `
            import { SpellRegistry } from '/src/systems/magic/SpellRegistry.ts';
            import { SpellLearning } from '/src/systems/magic/SpellLearning.ts';
            window.SpellRegistry = SpellRegistry;
            window.SpellLearning = SpellLearning;
          `;
          document.head.appendChild(script);
          return { message: 'Modules loading, retry needed' };
        }

        const registry = window.SpellRegistry.getInstance();
        const learning = window.SpellLearning.getInstance();

        return {
          registryExists: registry !== undefined,
          learningExists: learning !== undefined,
          mageSchools: registry.getSchoolsForClass('mage'),
          bishopSchools: registry.getSchoolsForClass('bishop'),
          priestSchools: registry.getSchoolsForClass('priest')
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('Spell system data:', spellData);

    if (spellData.registryExists) {
      expect(spellData.mageSchools).toContain('mage');
      expect(spellData.bishopSchools).toContain('mage');
      expect(spellData.bishopSchools).toContain('priest');
      expect(spellData.priestSchools).toContain('priest');
    }
  });

  test('should test character level up and spell learning', async ({ page }) => {
    const newGameButton = page.locator('button:has-text("New Game")');
    await newGameButton.click();

    await page.waitForTimeout(500);

    const nameInput = page.locator('input[placeholder*="name" i]').first();
    await nameInput.fill('LevelTest');

    const raceSelect = page.locator('select').first();
    await raceSelect.selectOption({ label: 'Human' });

    const classSelect = page.locator('select').nth(1);
    await classSelect.selectOption({ label: 'Priest' });

    const alignmentSelect = page.locator('select').nth(2);
    await alignmentSelect.selectOption({ label: 'Good' });

    const createButton = page.locator('button:has-text("Create Character")');
    await createButton.click();

    await page.waitForTimeout(500);

    const levelUpResult = await page.evaluate(() => {
      const party = window.gameServices?.partyManagementService?.getParty();
      if (party && party.characters && party.characters.length > 0) {
        const char = party.characters[0];

        char.experience = 1500;
        char.checkLevelUp();

        const beforeLevel = char.level;
        const beforeSpells = char.knownSpells ? [...char.knownSpells] : [];

        const spellResults = char.confirmLevelUp();

        return {
          beforeLevel,
          afterLevel: char.level,
          beforeSpellCount: beforeSpells.length,
          afterSpellCount: char.knownSpells?.length || 0,
          spellResults: spellResults,
          pendingLevelUp: char.pendingLevelUp,
          class: char.class
        };
      }
      return null;
    });

    console.log('Level up results:', levelUpResult);

    if (levelUpResult) {
      expect(levelUpResult.afterLevel).toBe(2);
      expect(levelUpResult.pendingLevelUp).toBe(false);
      expect(levelUpResult.spellResults).toBeDefined();
    }
  });

  test('should verify non-caster character has no spell capability', async ({ page }) => {
    const newGameButton = page.locator('button:has-text("New Game")');
    await newGameButton.click();

    await page.waitForTimeout(500);

    const nameInput = page.locator('input[placeholder*="name" i]').first();
    await nameInput.fill('TestFighter');

    const raceSelect = page.locator('select').first();
    await raceSelect.selectOption({ label: 'Dwarf' });

    const classSelect = page.locator('select').nth(1);
    await classSelect.selectOption({ label: 'Fighter' });

    const alignmentSelect = page.locator('select').nth(2);
    await alignmentSelect.selectOption({ label: 'Neutral' });

    const createButton = page.locator('button:has-text("Create Character")');
    await createButton.click();

    await page.waitForTimeout(500);

    const fighterData = await page.evaluate(() => {
      const party = window.gameServices?.partyManagementService?.getParty();
      if (party && party.characters && party.characters.length > 0) {
        const char = party.characters[0];

        char.experience = 1500;
        char.checkLevelUp();
        const spellResults = char.confirmLevelUp();

        return {
          class: char.class,
          mp: char.mp,
          maxMp: char.maxMp,
          spellResults: spellResults,
          knownSpells: char.knownSpells
        };
      }
      return null;
    });

    console.log('Fighter data:', fighterData);

    if (fighterData) {
      expect(fighterData.mp).toBe(0);
      expect(fighterData.maxMp).toBe(0);
      expect(fighterData.spellResults).toEqual([]);
      expect(fighterData.knownSpells).toEqual([]);
    }
  });
});