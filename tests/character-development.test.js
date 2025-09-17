const { test, expect } = require('@playwright/test');

test.describe('Character Development System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('should gain experience and trigger pending level up', async ({ page }) => {
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

    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    await page.keyboard.type('LevelTest');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    const xpTest = await page.evaluate(() => {
      const character = window.game?.gameState?.party?.characters?.[0];
      if (!character) return { error: 'No character found' };

      const initialState = {
        level: character.level,
        experience: character.experience,
        pendingLevelUp: character.pendingLevelUp,
        nextLevelXP: character.getExperienceForNextLevel()
      };

      character.addExperience(500);

      const afterSmallXP = {
        level: character.level,
        experience: character.experience,
        pendingLevelUp: character.pendingLevelUp
      };

      const xpNeeded = character.getExperienceForNextLevel() - character.experience;
      character.addExperience(xpNeeded + 1);

      const afterLevelXP = {
        level: character.level,
        experience: character.experience,
        pendingLevelUp: character.pendingLevelUp,
        canLevelUp: character.experience >= character.getExperienceForNextLevel()
      };

      return {
        initialState,
        afterSmallXP,
        afterLevelXP,
        className: character.class,
        race: character.race
      };
    });

    expect(xpTest.initialState.level).toBe(1);
    expect(xpTest.initialState.experience).toBe(0);
    expect(xpTest.initialState.pendingLevelUp).toBe(false);

    expect(xpTest.afterSmallXP.level).toBe(1);
    expect(xpTest.afterSmallXP.experience).toBe(500);
    expect(xpTest.afterSmallXP.pendingLevelUp).toBe(false);

    expect(xpTest.afterLevelXP.level).toBe(1);
    expect(xpTest.afterLevelXP.pendingLevelUp).toBe(true);
    expect(xpTest.afterLevelXP.canLevelUp).toBe(true);
  });

  test('should properly apply level up effects', async ({ page }) => {
    await page.evaluate(() => {
      window.testMode = true;
      window.forceStats = {
        strength: 15,
        intelligence: 15,
        piety: 15,
        vitality: 16,
        agility: 15,
        luck: 15
      };
    });

    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    await page.keyboard.type('HPTest');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    const levelUpEffects = await page.evaluate(() => {
      const character = window.game?.gameState?.party?.characters?.[0];
      if (!character) return { error: 'No character found' };

      const beforeLevelUp = {
        level: character.level,
        maxHp: character.maxHp,
        hp: character.hp,
        maxMp: character.maxMp || 0,
        mp: character.mp || 0,
        stats: { ...character.stats }
      };

      const xpNeeded = character.getExperienceForNextLevel();
      character.addExperience(xpNeeded);

      if (character.pendingLevelUp && character.confirmLevelUp) {
        character.confirmLevelUp();
      }

      const afterLevelUp = {
        level: character.level,
        maxHp: character.maxHp,
        hp: character.hp,
        maxMp: character.maxMp || 0,
        mp: character.mp || 0,
        stats: { ...character.stats },
        pendingLevelUp: character.pendingLevelUp
      };

      character.addExperience(character.getExperienceForNextLevel());
      if (character.pendingLevelUp && character.confirmLevelUp) {
        character.confirmLevelUp();
      }

      const afterSecondLevelUp = {
        level: character.level,
        maxHp: character.maxHp,
        hp: character.hp,
        maxMp: character.maxMp || 0
      };

      return {
        className: character.class,
        race: character.race,
        beforeLevelUp,
        afterLevelUp,
        afterSecondLevelUp
      };
    });

    expect(levelUpEffects.beforeLevelUp.level).toBe(1);
    expect(levelUpEffects.afterLevelUp.level).toBe(2);
    expect(levelUpEffects.afterLevelUp.maxHp).toBeGreaterThan(levelUpEffects.beforeLevelUp.maxHp);
    expect(levelUpEffects.afterLevelUp.hp).toBe(levelUpEffects.afterLevelUp.maxHp);
    expect(levelUpEffects.afterLevelUp.pendingLevelUp).toBe(false);
    expect(levelUpEffects.afterSecondLevelUp.level).toBe(3);
    expect(levelUpEffects.afterSecondLevelUp.maxHp).toBeGreaterThan(levelUpEffects.afterLevelUp.maxHp);
  });

  test('should respect experience modifiers for different race/class combinations', async ({ page }) => {
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

    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    await page.keyboard.type('ModifierTest');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(50);
    }
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    const modifierTest = await page.evaluate(() => {
      const character = window.game?.gameState?.party?.characters?.[0];
      if (!character) return { error: 'No character found' };

      const baseXPForLevel2 = 1000;
      const actualXPNeeded = character.getExperienceForNextLevel();

      character.addExperience(Math.floor(actualXPNeeded * 0.5));
      const halfwayState = {
        level: character.level,
        experience: character.experience,
        pendingLevelUp: character.pendingLevelUp
      };

      character.addExperience(Math.ceil(actualXPNeeded * 0.5) + 1);
      const afterFullXP = {
        level: character.level,
        experience: character.experience,
        pendingLevelUp: character.pendingLevelUp
      };

      return {
        race: character.race,
        class: character.class,
        experienceModifier: character.experienceModifier,
        baseXPForLevel2,
        actualXPNeeded,
        expectedXPNeeded: Math.floor(baseXPForLevel2 * character.experienceModifier),
        halfwayState,
        afterFullXP
      };
    });

    expect(modifierTest.race).toBe('Faerie');
    expect(modifierTest.class).toBe('Mage');
    expect(modifierTest.experienceModifier).toBe(0.8);
    expect(modifierTest.actualXPNeeded).toBe(modifierTest.expectedXPNeeded);
    expect(modifierTest.halfwayState.pendingLevelUp).toBe(false);
    expect(modifierTest.afterFullXP.pendingLevelUp).toBe(true);
  });

  test('should handle spell slots for caster classes on level up', async ({ page }) => {
    await page.evaluate(() => {
      window.testMode = true;
      window.forceStats = {
        strength: 15,
        intelligence: 18,
        piety: 18,
        vitality: 15,
        agility: 15,
        luck: 15
      };
    });

    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    await page.keyboard.type('CasterTest');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    const spellSlotTest = await page.evaluate(() => {
      const character = window.game?.gameState?.party?.characters?.[0];
      if (!character) return { error: 'No character found' };

      const initialSpellSlots = character.spellSlots ? [...character.spellSlots] : null;
      const initialMaxMp = character.maxMp || 0;

      for (let levelTarget = 2; levelTarget <= 5; levelTarget++) {
        const xpNeeded = character.getExperienceForNextLevel();
        character.addExperience(xpNeeded);
        if (character.pendingLevelUp && character.confirmLevelUp) {
          character.confirmLevelUp();
        }
      }

      const afterLeveling = {
        level: character.level,
        spellSlots: character.spellSlots ? [...character.spellSlots] : null,
        maxMp: character.maxMp || 0,
        mp: character.mp || 0
      };

      return {
        class: character.class,
        initialLevel: 1,
        initialSpellSlots,
        initialMaxMp,
        afterLeveling
      };
    });

    expect(spellSlotTest.class).toBe('Mage');
    expect(spellSlotTest.afterLeveling.level).toBe(5);

    if (spellSlotTest.initialSpellSlots) {
      expect(spellSlotTest.afterLeveling.spellSlots).toBeTruthy();
      expect(spellSlotTest.afterLeveling.spellSlots[0]).toBeGreaterThanOrEqual(spellSlotTest.initialSpellSlots[0]);

      let hasIncreasedSlots = false;
      for (let i = 0; i < spellSlotTest.afterLeveling.spellSlots.length; i++) {
        if (spellSlotTest.afterLeveling.spellSlots[i] > (spellSlotTest.initialSpellSlots[i] || 0)) {
          hasIncreasedSlots = true;
          break;
        }
      }
      expect(hasIncreasedSlots).toBe(true);
    } else if (spellSlotTest.initialMaxMp >= 0) {
      expect(spellSlotTest.afterLeveling.maxMp).toBeGreaterThanOrEqual(spellSlotTest.initialMaxMp);
    }
  });

  test('should not auto-level without confirmation (pending system)', async ({ page }) => {
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

    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    await page.keyboard.type('PendingTest');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    const pendingTest = await page.evaluate(() => {
      const character = window.game?.gameState?.party?.characters?.[0];
      if (!character) return { error: 'No character found' };

      const xpForLevel2 = character.getExperienceForNextLevel();
      const xpForLevel3 = 3000;
      const xpForLevel4 = 6000;

      character.addExperience(xpForLevel2 + xpForLevel3 + xpForLevel4);

      const withExcessXP = {
        level: character.level,
        experience: character.experience,
        pendingLevelUp: character.pendingLevelUp,
        totalXP: xpForLevel2 + xpForLevel3 + xpForLevel4
      };

      let levelsGained = 0;
      while (character.pendingLevelUp && character.confirmLevelUp) {
        character.confirmLevelUp();
        levelsGained++;
        if (levelsGained > 10) break;
      }

      const afterConfirmations = {
        level: character.level,
        pendingLevelUp: character.pendingLevelUp,
        levelsGained
      };

      return {
        withExcessXP,
        afterConfirmations
      };
    });

    expect(pendingTest.withExcessXP.level).toBe(1);
    expect(pendingTest.withExcessXP.pendingLevelUp).toBe(true);
    expect(pendingTest.afterConfirmations.level).toBeGreaterThan(1);
    expect(pendingTest.afterConfirmations.pendingLevelUp).toBe(false);
  });

  test('should track HP gains across multiple levels', async ({ page }) => {
    await page.evaluate(() => {
      window.testMode = true;
      window.forceStats = {
        strength: 18,
        intelligence: 15,
        piety: 15,
        vitality: 18,
        agility: 15,
        luck: 15
      };
    });

    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    await page.keyboard.type('HPGrowth');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    const hpGrowthTest = await page.evaluate(() => {
      const character = window.game?.gameState?.party?.characters?.[0];
      if (!character) return { error: 'No character found' };

      const hpProgression = [];

      hpProgression.push({
        level: character.level,
        maxHp: character.maxHp,
        vitality: character.stats.vitality
      });

      for (let i = 0; i < 10; i++) {
        const xpNeeded = character.getExperienceForNextLevel();
        character.addExperience(xpNeeded);

        if (character.pendingLevelUp && character.confirmLevelUp) {
          character.confirmLevelUp();
          hpProgression.push({
            level: character.level,
            maxHp: character.maxHp,
            vitality: character.stats.vitality
          });
        }
      }

      const averageHPGain = (hpProgression[hpProgression.length - 1].maxHp - hpProgression[0].maxHp) / (hpProgression.length - 1);

      return {
        class: character.class,
        hpProgression,
        averageHPGain,
        totalLevels: hpProgression.length
      };
    });

    expect(hpGrowthTest.class).toBe('Fighter');
    expect(hpGrowthTest.totalLevels).toBe(11);

    for (let i = 1; i < hpGrowthTest.hpProgression.length; i++) {
      expect(hpGrowthTest.hpProgression[i].maxHp).toBeGreaterThan(hpGrowthTest.hpProgression[i - 1].maxHp);
      expect(hpGrowthTest.hpProgression[i].level).toBe(hpGrowthTest.hpProgression[i - 1].level + 1);
    }

    expect(hpGrowthTest.averageHPGain).toBeGreaterThan(3);
    expect(hpGrowthTest.averageHPGain).toBeLessThanOrEqual(15);
  });

  test('should calculate correct XP thresholds for high levels', async ({ page }) => {
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

    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    await page.keyboard.type('XPScale');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    const xpScaleTest = await page.evaluate(() => {
      const character = window.game?.gameState?.party?.characters?.[0];
      if (!character) return { error: 'No character found' };

      const xpThresholds = [];

      for (let targetLevel = 2; targetLevel <= 20; targetLevel++) {
        const currentXP = character.experience;
        const xpNeeded = character.getExperienceForNextLevel();

        xpThresholds.push({
          currentLevel: character.level,
          targetLevel: targetLevel,
          currentXP,
          xpNeeded,
          totalXPForLevel: currentXP + xpNeeded
        });

        character.addExperience(xpNeeded);
        if (character.pendingLevelUp && character.confirmLevelUp) {
          character.confirmLevelUp();
        }

        if (character.level >= 20) break;
      }

      return {
        race: character.race,
        class: character.class,
        experienceModifier: character.experienceModifier,
        xpThresholds,
        finalLevel: character.level
      };
    });

    expect(xpScaleTest.xpThresholds.length).toBeGreaterThan(0);

    for (let i = 1; i < xpScaleTest.xpThresholds.length; i++) {
      expect(xpScaleTest.xpThresholds[i].xpNeeded).toBeGreaterThanOrEqual(
        xpScaleTest.xpThresholds[i - 1].xpNeeded
      );
    }

    const level10Threshold = xpScaleTest.xpThresholds.find(t => t.targetLevel === 10);
    const level5Threshold = xpScaleTest.xpThresholds.find(t => t.targetLevel === 5);
    if (level10Threshold && level5Threshold) {
      expect(level10Threshold.totalXPForLevel).toBeGreaterThan(level5Threshold.totalXPForLevel * 3);
    }
  });
});