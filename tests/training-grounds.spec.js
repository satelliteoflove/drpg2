const { test, expect } = require('@playwright/test');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

test.describe('Training Grounds', () => {
  test('should complete full Training Grounds workflow via AI Interface', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => typeof window.AI !== 'undefined' && typeof window.AI.getCurrentScene === 'function', { timeout: 5000 });
    await sleep(500);

    let currentScene = await page.evaluate(() => window.AI.getCurrentScene());

    if (currentScene.toLowerCase() === 'mainmenu') {
      await page.evaluate(() => window.AI.simulateKeypress('Enter'));
      await sleep(500);
      currentScene = await page.evaluate(() => window.AI.getCurrentScene());
    }

    if (currentScene.toLowerCase() !== 'town') {
      throw new Error(`Expected Town scene, got: ${currentScene}`);
    }

    await page.evaluate(() => {
      window.AI.simulateKeypress('ArrowDown');
      window.AI.simulateKeypress('ArrowDown');
      window.AI.simulateKeypress('ArrowDown');
      window.AI.simulateKeypress('Enter');
    });
    await sleep(800);

    let info = await page.evaluate(() => window.AI.getTrainingGroundsInfo());

    if (!info.inTrainingGrounds) {
      const scene = await page.evaluate(() => window.AI.getCurrentScene());
      throw new Error(`Failed to navigate to Training Grounds. Current scene: ${scene}, info: ${JSON.stringify(info)}`);
    }

    expect(info.inTrainingGrounds).toBe(true);
    expect(info.currentState).toBe('main');
    expect(info.rosterCount).toBeGreaterThanOrEqual(0);

    await page.evaluate(() => window.AI.simulateKeypress('Enter'));
    await sleep(100);

    await page.evaluate(() => 'Thorin'.split('').forEach(c => window.AI.simulateKeypress(c)));
    await sleep(100);
    await page.evaluate(() => window.AI.simulateKeypress('Enter'));
    await sleep(100);

    await page.evaluate(() => {
      window.AI.simulateKeypress('ArrowDown');
      window.AI.simulateKeypress('ArrowDown');
    });
    await sleep(100);
    await page.evaluate(() => window.AI.simulateKeypress('Enter'));
    await sleep(200);

    await page.evaluate(() => window.AI.simulateKeypress('Enter'));
    await sleep(100);

    const bonusInfo = await page.evaluate(() => window.AI.getTrainingGroundsInfo());
    expect(bonusInfo.creationData.bonusPoints).toBeGreaterThanOrEqual(7);
    expect(bonusInfo.creationData.bonusPoints).toBeLessThanOrEqual(20);
    expect(bonusInfo.creationData.baseStats).not.toBeNull();

    const totalPoints = bonusInfo.creationData.bonusPoints;
    const isLowRoll = totalPoints <= 10;

    await page.evaluate(() => {
      window.AI.simulateKeypress('ArrowRight');
      window.AI.simulateKeypress('ArrowRight');
      window.AI.simulateKeypress('ArrowRight');
      window.AI.simulateKeypress('ArrowDown');
      window.AI.simulateKeypress('ArrowRight');
      window.AI.simulateKeypress('ArrowRight');
    });
    await sleep(100);

    const remaining = totalPoints - 5;
    if (remaining > 0) {
      await page.evaluate((rem) => {
        window.AI.simulateKeypress('ArrowDown');
        window.AI.simulateKeypress('ArrowDown');
        for (let i = 0; i < Math.min(rem, 10); i++) {
          window.AI.simulateKeypress('ArrowRight');
        }
      }, remaining);
      await sleep(100);
    }

    const allocInfo = await page.evaluate(() => window.AI.getTrainingGroundsInfo());
    expect(allocInfo.creationData.eligibleClasses.length).toBeGreaterThan(0);

    await page.evaluate(() => window.AI.simulateKeypress('Enter'));
    await sleep(100);

    await page.evaluate(() => window.AI.simulateKeypress('Enter'));
    await sleep(100);
    await page.evaluate(() => window.AI.simulateKeypress('Enter'));
    await sleep(100);
    await page.evaluate(() => window.AI.simulateKeypress('y'));
    await sleep(300);

    const afterCreate = await page.evaluate(() => window.AI.getTrainingGroundsInfo());
    expect(afterCreate.rosterCount).toBeGreaterThan(0);

    const roster = await page.evaluate(() => window.AI.getRosterCharacters());
    expect(roster[0].name.toLowerCase()).toBe('thorin');
    expect(roster[0].race).toBe('Dwarf');

    if (isLowRoll) {
      expect(roster[0].level).toBe(4);
    }

    await page.evaluate(() => window.AI.simulateKeypress('ArrowDown'));
    await sleep(100);
    await page.evaluate(() => window.AI.simulateKeypress('Enter'));
    await sleep(100);
    await page.evaluate(() => window.AI.simulateKeypress('Enter'));
    await sleep(200);

    const inspectInfo = await page.evaluate(() => window.AI.getTrainingGroundsInfo());
    expect(inspectInfo.selectedCharacter).toBeDefined();
    expect(inspectInfo.selectedCharacter.name).toBe('Thorin');

    await page.evaluate(() => window.AI.simulateKeypress('Enter'));
    await sleep(200);
    await page.evaluate(() => window.AI.simulateKeypress('Enter'));
    await sleep(100);

    await page.evaluate(() => {
      window.AI.simulateKeypress('ArrowDown');
      window.AI.simulateKeypress('ArrowDown');
    });
    await sleep(100);
    await page.evaluate(() => window.AI.simulateKeypress('Enter'));
    await sleep(100);

    await page.evaluate(() => {
      for (let i = 0; i < 20; i++) window.AI.simulateKeypress('Backspace');
      'ThorinII'.split('').forEach(c => window.AI.simulateKeypress(c));
    });
    await sleep(100);
    await page.evaluate(() => window.AI.simulateKeypress('Enter'));
    await sleep(200);

    const afterRename = await page.evaluate(() => window.AI.getRosterCharacters());
    expect(afterRename[0].name.toLowerCase()).toBe('thorinii');

    await page.evaluate(() => {
      window.AI.simulateKeypress('Escape');
      window.AI.simulateKeypress('Escape');
    });
    await sleep(200);

    await page.evaluate(() => {
      window.AI.simulateKeypress('ArrowDown');
      window.AI.simulateKeypress('ArrowDown');
    });
    await sleep(100);
    await page.evaluate(() => window.AI.simulateKeypress('Enter'));
    await sleep(200);

    await page.evaluate(() => window.AI.simulateKeypress('Enter'));
    await sleep(100);

    await page.evaluate(() => window.AI.simulateKeypress('ArrowDown'));
    await sleep(100);
    await page.evaluate(() => window.AI.simulateKeypress('Enter'));
    await sleep(100);
    await page.evaluate(() => window.AI.simulateKeypress('Enter'));
    await sleep(100);
    await page.evaluate(() => {
      window.AI.simulateKeypress('ArrowDown');
      window.AI.simulateKeypress('ArrowDown');
      window.AI.simulateKeypress('ArrowDown');
    });
    await sleep(100);
    await page.evaluate(() => window.AI.simulateKeypress('Enter'));
    await sleep(100);
    await page.evaluate(() => window.AI.simulateKeypress('y'));
    await sleep(300);

    const afterDelete = await page.evaluate(() => window.AI.getRosterCharacters());
    expect(afterDelete.length).toBe(0);
  });

  test('should verify bonus point system produces valid ranges', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => typeof window.AI !== 'undefined', { timeout: 5000 });
    await sleep(500);

    let currentScene = await page.evaluate(() => window.AI.getCurrentScene());
    if (currentScene.toLowerCase() === 'mainmenu') {
      await page.evaluate(() => {
        window.AI.simulateKeypress('ArrowDown');
        window.AI.simulateKeypress('Enter');
      });
      await sleep(500);
    }

    await page.evaluate(() => {
      window.AI.simulateKeypress('ArrowDown');
      window.AI.simulateKeypress('ArrowDown');
      window.AI.simulateKeypress('ArrowDown');
      window.AI.simulateKeypress('Enter');
    });
    await sleep(300);

    const bonusRolls = [];

    for (let t = 0; t < 10; t++) {
      await page.evaluate(() => window.AI.simulateKeypress('Enter'));
      await sleep(50);
      await page.evaluate((num) => `T${num}`.split('').forEach(c => window.AI.simulateKeypress(c)), t);
      await sleep(50);
      await page.evaluate(() => window.AI.simulateKeypress('Enter'));
      await sleep(50);
      await page.evaluate(() => window.AI.simulateKeypress('Enter'));
      await sleep(100);
      await page.evaluate(() => window.AI.simulateKeypress('Enter'));
      await sleep(100);

      const rollData = await page.evaluate(() => {
        const info = window.AI.getTrainingGroundsInfo();
        return {
          points: info.creationData.bonusPoints,
          level4: info.creationData.startAtLevel4
        };
      });

      bonusRolls.push(rollData);

      await page.evaluate(() => {
        window.AI.simulateKeypress('Escape');
        window.AI.simulateKeypress('Escape');
        window.AI.simulateKeypress('Escape');
      });
      await sleep(100);
    }

    const allValid = bonusRolls.every(r =>
      (r.points >= 7 && r.points <= 10) || (r.points >= 17 && r.points <= 20)
    );

    expect(allValid).toBe(true);

    bonusRolls.forEach(roll => {
      if (roll.points <= 10) {
        expect(roll.level4).toBe(true);
      } else {
        expect(roll.level4).toBe(false);
      }
    });
  });
});
