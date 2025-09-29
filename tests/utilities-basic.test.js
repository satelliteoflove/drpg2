const { test, expect } = require('@playwright/test');

test.describe.skip('Basic Utilities Tests', () => {
  test('utilities are exposed on window', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForFunction(() => typeof window.AI !== 'undefined', { timeout: 2000 });

    const utilitiesAvailable = await page.evaluate(() => {
      return {
        hasDiceRoller: typeof window.DiceRoller !== 'undefined',
        hasEntityUtils: typeof window.EntityUtils !== 'undefined',
        hasSavingThrowCalculator: typeof window.SavingThrowCalculator !== 'undefined',
        hasSpellRegistry: typeof window.SpellRegistry !== 'undefined',
        hasSpellCaster: typeof window.SpellCaster !== 'undefined',
        hasCharacter: typeof window.Character !== 'undefined',
        hasParty: typeof window.Party !== 'undefined',
        hasGameServices: typeof window.GameServices !== 'undefined'
      };
    });

    expect(utilitiesAvailable.hasDiceRoller).toBe(true);
    expect(utilitiesAvailable.hasEntityUtils).toBe(true);
    expect(utilitiesAvailable.hasSavingThrowCalculator).toBe(true);
    expect(utilitiesAvailable.hasSpellRegistry).toBe(true);
    expect(utilitiesAvailable.hasSpellCaster).toBe(true);
    expect(utilitiesAvailable.hasCharacter).toBe(true);
    expect(utilitiesAvailable.hasParty).toBe(true);
    expect(utilitiesAvailable.hasGameServices).toBe(true);
  });
});