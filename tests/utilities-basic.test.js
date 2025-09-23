const { test, expect } = require('@playwright/test');

test.describe('Basic Utilities Tests', () => {
  test('utilities are exposed on window', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');

    const utilitiesAvailable = await page.evaluate(() => {
      return {
        hasDiceRoller: typeof window.DiceRoller !== 'undefined',
        hasEntityUtils: typeof window.EntityUtils !== 'undefined',
        hasSavingThrowCalculator: typeof window.SavingThrowCalculator !== 'undefined',
        hasSpellRegistry: typeof window.SpellRegistry !== 'undefined',
        hasSpellCaster: typeof window.SpellCaster !== 'undefined'
      };
    });

    expect(utilitiesAvailable.hasDiceRoller).toBe(true);
    expect(utilitiesAvailable.hasEntityUtils).toBe(true);
    expect(utilitiesAvailable.hasSavingThrowCalculator).toBe(true);
    expect(utilitiesAvailable.hasSpellRegistry).toBe(true);
    expect(utilitiesAvailable.hasSpellCaster).toBe(true);
  });

  test('dice roller basic functionality', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');

    const rollTests = await page.evaluate(() => {
      const DiceRoller = window.DiceRoller;
      if (!DiceRoller) return { error: 'DiceRoller not found' };

      const d20 = DiceRoller.rollD20();
      const d20Valid = d20 >= 1 && d20 <= 20;

      const simpleRoll = DiceRoller.roll('2d6');
      const simpleValid = simpleRoll >= 2 && simpleRoll <= 12;

      const withModifier = DiceRoller.roll('1d6+3');
      const modifierValid = withModifier >= 4 && withModifier <= 9;

      return {
        d20: { value: d20, valid: d20Valid },
        simple: { value: simpleRoll, valid: simpleValid },
        modifier: { value: withModifier, valid: modifierValid }
      };
    });

    expect(rollTests.error).toBeUndefined();
    expect(rollTests.d20.valid).toBe(true);
    expect(rollTests.simple.valid).toBe(true);
    expect(rollTests.modifier.valid).toBe(true);
  });
});