const { test, expect } = require('@playwright/test');

test.describe.skip('Character Development', () => {
  test('should gain experience from combat and require Inn visit to level up', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForFunction(() => typeof window.AI !== 'undefined', { timeout: 2000 });

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForFunction(() => window.AI.getScene() === 'New Game', { timeout: 2000 });
    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(100);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.AI.sendKey('Enter'));

    const dungeonReached = await page.waitForFunction(
      () => window.AI.getScene()?.toLowerCase() === 'dungeon',
      { timeout: 2000 }
    ).catch(() => false);
    if (!dungeonReached) throw new Error(`Failed to reach dungeon: ${await page.evaluate(() => window.AI.getScene())}`);

    const initialCharacter = await page.evaluate(() => {
      const party = window.AI.getParty();
      return party?.characters?.[0];
    });
    expect(initialCharacter.level).toBe(1);
    expect(initialCharacter.experience).toBe(0);

    for (let combatAttempts = 0; combatAttempts < 20; combatAttempts++) {
      await page.evaluate(() => window.AI.sendKey('ArrowUp'));
      await page.waitForTimeout(100);

      const scene = await page.evaluate(() => window.AI.getScene());
      if (scene === 'Combat') {
        break;
      }
    }

    const combatScene = await page.evaluate(() => window.AI.getScene());
    expect(combatScene).toBe('Combat');

    while (await page.evaluate(() => window.AI.getScene() === 'Combat')) {
      await page.evaluate(() => window.AI.sendKey('a'));
      await page.waitForTimeout(200);
      await page.evaluate(() => window.AI.sendKey('Enter'));
      await page.waitForTimeout(500);
    }

    const afterCombat = await page.evaluate(() => {
      const party = window.AI.getParty();
      return party?.characters?.[0];
    });

    expect(afterCombat.experience).toBeGreaterThan(0);
    expect(afterCombat.level).toBe(1);

    const xpToAdd = 1000 - afterCombat.experience;
    await page.evaluate((xp) => {
      const party = window.AI.getParty();
      if (party?.characters?.[0] && party.characters[0].addExperience) {
        party.characters[0].addExperience(xp);
      }
    }, xpToAdd);

    const beforeInn = await page.evaluate(() => {
      const party = window.AI.getParty();
      return party?.characters?.[0];
    });
    expect(beforeInn.level).toBe(1);
    expect(beforeInn.pendingLevelUp).toBe(true);

    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForFunction(() => window.AI.getScene() === 'Town', { timeout: 2000 });

    await page.evaluate(() => window.AI.sendKey('i'));
    await page.waitForTimeout(500);

    const atInn = await page.evaluate(() => window.AI.getScene());
    expect(atInn).toContain('Inn');

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);

    const afterInn = await page.evaluate(() => {
      const party = window.AI.getParty();
      return party?.characters?.[0];
    });
    expect(afterInn.level).toBe(2);
    expect(afterInn.pendingLevelUp).toBe(false);
  });

  test('should properly apply HP and MP increases when leveling at Inn', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForFunction(() => typeof window.AI !== 'undefined', { timeout: 2000 });

    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForFunction(() => window.AI.getScene() === 'New Game', { timeout: 2000 });
    await page.evaluate(() => window.AI.sendKey('ArrowDown'));
    await page.waitForTimeout(100);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.AI.sendKey('Enter'));

    const dungeonReached = await page.waitForFunction(
      () => window.AI.getScene()?.toLowerCase() === 'dungeon',
      { timeout: 2000 }
    ).catch(() => false);
    if (!dungeonReached) throw new Error(`Failed to reach dungeon: ${await page.evaluate(() => window.AI.getScene())}`);

    const beforeLevel = await page.evaluate(() => {
      const party = window.AI.getParty();
      const char = party?.characters?.[0];
      return {
        level: char?.level,
        hp: char?.hp,
        maxHp: char?.maxHp,
        mp: char?.mp,
        maxMp: char?.maxMp
      };
    });
    expect(beforeLevel.level).toBe(1);

    await page.evaluate(() => {
      const party = window.AI.getParty();
      if (party?.characters?.[0] && party.characters[0].addExperience) {
        party.characters[0].addExperience(1000);
      }
    });

    await page.evaluate(() => window.AI.sendKey('Escape'));
    await page.waitForFunction(() => window.AI.getScene() === 'Town', { timeout: 2000 });

    await page.evaluate(() => window.AI.sendKey('i'));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.AI.sendKey('Enter'));
    await page.waitForTimeout(500);

    const afterLevel = await page.evaluate(() => {
      const party = window.AI.getParty();
      const char = party?.characters?.[0];
      return {
        level: char?.level,
        hp: char?.hp,
        maxHp: char?.maxHp,
        mp: char?.mp,
        maxMp: char?.maxMp
      };
    });

    expect(afterLevel.level).toBe(2);
    expect(afterLevel.maxHp).toBeGreaterThan(beforeLevel.maxHp);
    expect(afterLevel.hp).toBe(afterLevel.maxHp);
    expect(afterLevel.maxMp).toBeGreaterThanOrEqual(beforeLevel.maxMp);
    expect(afterLevel.mp).toBe(afterLevel.maxMp);
  });
});