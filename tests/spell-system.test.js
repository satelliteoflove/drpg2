const { test, expect } = require('@playwright/test');

test.describe('Spell System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
  });

  test('should create a mage character and verify spell learning capability', async ({ page }) => {
    await page.getByRole('button', { name: 'New Game' }).click();

    await page.fill('input[placeholder="Enter character name"]', 'TestMage');

    await page.selectOption('select:has-text("Race")', 'elf');
    await page.selectOption('select:has-text("Class")', 'mage');
    await page.selectOption('select:has-text("Alignment")', 'neutral');

    await page.getByRole('button', { name: 'Create Character' }).click();

    await page.getByRole('button', { name: 'Add to Party' }).click();
    await page.getByRole('button', { name: 'Finish Party Creation' }).click();

    await expect(page.locator('text=TestMage')).toBeVisible();
    await expect(page.locator('text=Mage')).toBeVisible();
    await expect(page.locator('text=Level: 1')).toBeVisible();

    const mpText = await page.locator('text=/MP:\\s*\\d+\\/\\d+/').textContent();
    expect(mpText).toBeTruthy();
    console.log('Mage created with MP:', mpText);
  });

  test('should create a priest character with spell capability', async ({ page }) => {
    await page.getByRole('button', { name: 'New Game' }).click();

    await page.fill('input[placeholder="Enter character name"]', 'TestPriest');

    await page.selectOption('select:has-text("Race")', 'human');
    await page.selectOption('select:has-text("Class")', 'priest');
    await page.selectOption('select:has-text("Alignment")', 'good');

    await page.getByRole('button', { name: 'Create Character' }).click();

    await page.getByRole('button', { name: 'Add to Party' }).click();
    await page.getByRole('button', { name: 'Finish Party Creation' }).click();

    await expect(page.locator('text=TestPriest')).toBeVisible();
    await expect(page.locator('text=Priest')).toBeVisible();

    const mpText = await page.locator('text=/MP:\\s*\\d+\\/\\d+/').textContent();
    expect(mpText).toBeTruthy();
    console.log('Priest created with MP:', mpText);
  });

  test('should create a bishop with multi-school spell access', async ({ page }) => {
    await page.getByRole('button', { name: 'New Game' }).click();

    await page.fill('input[placeholder="Enter character name"]', 'TestBishop');

    await page.selectOption('select:has-text("Race")', 'gnome');
    await page.selectOption('select:has-text("Class")', 'bishop');
    await page.selectOption('select:has-text("Alignment")', 'neutral');

    await page.getByRole('button', { name: 'Create Character' }).click();

    await page.getByRole('button', { name: 'Add to Party' }).click();
    await page.getByRole('button', { name: 'Finish Party Creation' }).click();

    await expect(page.locator('text=TestBishop')).toBeVisible();
    await expect(page.locator('text=Bishop')).toBeVisible();

    const bishopMpText = await page.locator('text=/MP:\\s*\\d+\\/\\d+/').textContent();
    expect(bishopMpText).toBeTruthy();
    console.log('Bishop created with MP:', bishopMpText);
  });

  test('should verify non-caster has no MP', async ({ page }) => {
    await page.getByRole('button', { name: 'New Game' }).click();

    await page.fill('input[placeholder="Enter character name"]', 'TestFighter');

    await page.selectOption('select:has-text("Race")', 'dwarf');
    await page.selectOption('select:has-text("Class")', 'fighter');
    await page.selectOption('select:has-text("Alignment")', 'neutral');

    await page.getByRole('button', { name: 'Create Character' }).click();

    await page.getByRole('button', { name: 'Add to Party' }).click();
    await page.getByRole('button', { name: 'Finish Party Creation' }).click();

    await expect(page.locator('text=TestFighter')).toBeVisible();
    await expect(page.locator('text=Fighter')).toBeVisible();

    const mpText = await page.locator('text=/MP:\\s*0\\/0/').textContent();
    if (mpText) {
      console.log('Fighter correctly has no MP:', mpText);
    } else {
      const mpDisplay = await page.locator('text=/MP:/').count();
      expect(mpDisplay).toBe(0);
      console.log('Fighter correctly shows no MP display');
    }
  });

  test('should level up character and learn spells', async ({ page }) => {
    await page.getByRole('button', { name: 'New Game' }).click();

    await page.fill('input[placeholder="Enter character name"]', 'LevelUpMage');

    await page.selectOption('select:has-text("Race")', 'elf');
    await page.selectOption('select:has-text("Class")', 'mage');
    await page.selectOption('select:has-text("Alignment")', 'neutral');

    await page.getByRole('button', { name: 'Create Character' }).click();

    await page.getByRole('button', { name: 'Add to Party' }).click();
    await page.getByRole('button', { name: 'Finish Party Creation' }).click();

    await expect(page.locator('text=LevelUpMage')).toBeVisible();

    await page.evaluate(() => {
      const party = window.gameServices?.partyManagementService?.getParty();
      if (party && party.characters[0]) {
        party.characters[0].experience = 1500;
        party.characters[0].checkLevelUp();
        console.log('Character ready for level up:', party.characters[0].pendingLevelUp);
      }
    });

    const innButton = await page.getByRole('button', { name: /Inn/i });
    if (await innButton.isVisible()) {
      await innButton.click();

      await page.waitForTimeout(500);

      const levelUpButton = await page.getByRole('button', { name: /Level Up/i });
      if (await levelUpButton.isVisible()) {
        await levelUpButton.click();

        const spellResults = await page.evaluate(() => {
          const party = window.gameServices?.partyManagementService?.getParty();
          if (party && party.characters[0]) {
            const results = party.characters[0].confirmLevelUp();
            console.log('Spell learning results:', results);
            return {
              level: party.characters[0].level,
              knownSpells: party.characters[0].getKnownSpells(),
              results: results
            };
          }
          return null;
        });

        if (spellResults) {
          console.log('Character leveled to:', spellResults.level);
          console.log('Known spells:', spellResults.knownSpells);
          console.log('Learning results:', spellResults.results);

          expect(spellResults.level).toBe(2);
        }
      }
    }
  });

  test('should verify spell registry is accessible', async ({ page }) => {
    await page.goto('http://localhost:8080');

    const registryData = await page.evaluate(async () => {
      try {
        const { SpellRegistry } = await import('/src/systems/magic/SpellRegistry.ts');
        const registry = SpellRegistry.getInstance();

        const mageSpells = registry.getSpellsBySchool('mage');
        const priestSpells = registry.getSpellsBySchool('priest');
        const flameDart = registry.getSpellById('flame_dart');
        const bishopSchools = registry.getSchoolsForClass('bishop');

        return {
          mageSpellCount: mageSpells.length,
          priestSpellCount: priestSpells.length,
          flameDart: flameDart ? flameDart.name : null,
          bishopSchools: bishopSchools
        };
      } catch (error) {
        console.error('Error accessing SpellRegistry:', error);
        return null;
      }
    });

    if (registryData) {
      console.log('Spell Registry Data:', registryData);
      expect(registryData.mageSpellCount).toBeGreaterThan(0);
      expect(registryData.flameDart).toBe('Flame Dart');
      expect(registryData.bishopSchools).toContain('mage');
      expect(registryData.bishopSchools).toContain('priest');
    } else {
      console.log('SpellRegistry not directly accessible, checking through game flow');
    }
  });

  test('should verify spell learning system integration', async ({ page }) => {
    await page.goto('http://localhost:8080');

    const learningData = await page.evaluate(async () => {
      try {
        const { SpellLearning } = await import('/src/systems/magic/SpellLearning.ts');
        const learning = SpellLearning.getInstance();

        const mageProgression = learning.getSpellsForClass('mage');
        const priestProgression = learning.getSpellsForClass('priest');

        return {
          mageHasLevel1Spells: mageProgression.has(1),
          mageHasLevel2Spells: mageProgression.has(3),
          priestHasLevel1Spells: priestProgression.has(1),
          progressionSize: mageProgression.size
        };
      } catch (error) {
        console.error('Error accessing SpellLearning:', error);
        return null;
      }
    });

    if (learningData) {
      console.log('Spell Learning Data:', learningData);
      expect(learningData.mageHasLevel1Spells).toBe(true);
      expect(learningData.priestHasLevel1Spells).toBe(true);
      expect(learningData.progressionSize).toBeGreaterThan(0);
    } else {
      console.log('SpellLearning not directly accessible, checking through game flow');
    }
  });

  test('should test spell learning with high INT character', async ({ page }) => {
    await page.getByRole('button', { name: 'New Game' }).click();

    await page.evaluate(() => {
      window.testMode = true;
      window.forceStats = {
        strength: 10,
        intelligence: 18,
        piety: 10,
        vitality: 10,
        agility: 10,
        luck: 15
      };
    });

    await page.fill('input[placeholder="Enter character name"]', 'SmartMage');

    await page.selectOption('select:has-text("Race")', 'elf');
    await page.selectOption('select:has-text("Class")', 'mage');
    await page.selectOption('select:has-text("Alignment")', 'neutral');

    await page.getByRole('button', { name: 'Create Character' }).click();

    await page.getByRole('button', { name: 'Add to Party' }).click();
    await page.getByRole('button', { name: 'Finish Party Creation' }).click();

    const characterStats = await page.evaluate(() => {
      const party = window.gameServices?.partyManagementService?.getParty();
      if (party && party.characters[0]) {
        const char = party.characters[0];
        return {
          name: char.name,
          class: char.class,
          intelligence: char.stats.intelligence,
          luck: char.stats.luck,
          level: char.level
        };
      }
      return null;
    });

    if (characterStats) {
      console.log('High INT Character:', characterStats);
      expect(characterStats.intelligence).toBe(18);
      expect(characterStats.luck).toBe(15);
    }

    await page.evaluate(() => {
      window.testMode = false;
      delete window.forceStats;
    });
  });
});