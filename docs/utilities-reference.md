# Utility Classes Reference

This document describes the core utility classes that help maintain DRY (Don't Repeat Yourself) principles throughout the codebase.

## DiceRoller

Central utility for all dice rolling and random number generation.

### Location
`src/utils/DiceRoller.ts`

### Methods

#### `static roll(notation: string): number`
Rolls dice using standard notation (e.g., "2d6+3", "1d20", "3d8-2").

```typescript
const damage = DiceRoller.roll("2d6+3"); // Rolls 2 six-sided dice and adds 3
```

#### `static rollMultiple(notation: string, times: number): number[]`
Rolls the same dice notation multiple times.

#### `static rollWithAdvantage(notation: string): number`
Rolls twice and takes the higher result.

#### `static rollWithDisadvantage(notation: string): number`
Rolls twice and takes the lower result.

#### `static rollInRange(min: number, max: number): number`
Generates a random integer within the specified range (inclusive).

#### `static rollPercentile(): number`
Rolls a d100 (1-100).

#### `static rollD20(): number`
Rolls a single d20.

#### `static checkSuccess(chance: number): boolean`
Returns true if a percentile roll is less than or equal to the chance value.

#### `static evaluateFormula(formula: string, level: number = 1): number`
Evaluates complex formulas that may include dice notation and level variables.

```typescript
const healing = DiceRoller.evaluateFormula("1d8+level", 5); // 1d8+5
```

## EntityUtils

Provides unified access to Character and Monster properties, handling the differences between their interfaces.

### Location
`src/utils/EntityUtils.ts`

### Key Type
```typescript
export type CombatEntity = Character | Monster;
```

### Methods

#### Type Checking
- `static isCharacter(entity: CombatEntity): entity is Character`
- `static isMonster(entity: CombatEntity): entity is Monster`

#### Property Access
- `static getName(entity: CombatEntity): string`
- `static getHP(entity: CombatEntity): number` - Returns current HP
- `static getMaxHP(entity: CombatEntity): number` - Returns maximum HP
- `static getLevel(entity: CombatEntity): number`
- `static getAC(entity: CombatEntity): number`
- `static getAgility(entity: CombatEntity): number`
- `static getIntelligence(entity: CombatEntity): number`
- `static getVitality(entity: CombatEntity): number`
- `static getLuck(entity: CombatEntity): number`

#### HP Manipulation
- `static setHP(entity: CombatEntity, hp: number): void`
- `static applyDamage(entity: CombatEntity, damage: number): number` - Returns actual damage dealt
- `static applyHealing(entity: CombatEntity, healing: number): number` - Returns actual healing applied

#### Resistance and Status
- `static getResistance(entity: CombatEntity, element: string): number`
- `static getMagicResistance(entity: CombatEntity): number`
- `static isDead(entity: CombatEntity): boolean`
- `static checkDeath(entity: CombatEntity): boolean` - Checks and updates death status

### Usage Example
```typescript
const target: CombatEntity = getTarget();
const damage = 25;

if (!EntityUtils.isDead(target)) {
  const actualDamage = EntityUtils.applyDamage(target, damage);
  console.log(`${EntityUtils.getName(target)} takes ${actualDamage} damage!`);

  if (EntityUtils.checkDeath(target)) {
    console.log(`${EntityUtils.getName(target)} has been defeated!`);
  }
}
```

## SavingThrowCalculator

Handles all saving throw calculations based on Wizardry mechanics.

### Location
`src/utils/SavingThrowCalculator.ts`

### Save Types
```typescript
export type SaveType = 'physical' | 'mental' | 'magical' | 'death';
```

### Methods

#### `static calculateSaveTarget(entity: CombatEntity, saveType: SaveType, modifier: number = 0): number`
Calculates the target number needed on a d20 roll to succeed.

#### `static makeSavingThrow(entity: CombatEntity, saveType: SaveType, modifier: number = 0): boolean`
Performs a saving throw and returns success/failure.

#### `static calculateResistanceChance(entity: CombatEntity, saveType: SaveType, modifier: number = 0): number`
Returns the percentage chance (0-100) of failing the save.

#### `static checkResistance(entity: CombatEntity, saveType: SaveType, modifier: number = 0): boolean`
Alternative resistance check using percentage-based system.

#### `static getClassSaveBonus(characterClass: string, saveType: SaveType): number`
Returns class-specific bonuses to saving throws.

#### `static makeCharacterSavingThrow(character: Character, saveType: SaveType, modifier: number = 0): boolean`
Special version for characters that includes class bonuses.

#### `static checkStatusResistance(entity: CombatEntity, statusType: string): boolean`
Checks resistance to specific status effects.

#### `static rollGroupSaves(entities: CombatEntity[], saveType: SaveType, modifier: number = 0): boolean[]`
Rolls saving throws for multiple entities (used for group spells).

### Save Type Modifiers

- **Physical**: Modified by Vitality
- **Mental**: Modified by Intelligence
- **Magical**: Modified by Intelligence and Luck
- **Death**: Modified by Vitality and Luck

### Class Save Bonuses

| Class | Physical | Mental | Magical | Death |
|-------|----------|--------|---------|-------|
| Fighter | -2 | 0 | 0 | -1 |
| Samurai | -3 | -1 | 0 | -2 |
| Lord | -2 | 0 | -2 | -2 |
| Mage | 0 | -1 | -3 | 0 |
| Priest | 0 | 0 | -2 | -2 |
| Bishop | 0 | -2 | -2 | 0 |
| Psionic | 0 | -3 | -1 | 0 |

### Usage Example
```typescript
const monster = getMonster();
const spell = getSpell();

// Check if monster resists a sleep spell (mental save)
if (SavingThrowCalculator.makeSavingThrow(monster, 'mental', -2)) {
  console.log("Monster resists the sleep spell!");
} else {
  console.log("Monster falls asleep!");
}

// Group save for fireball
const targets = getAllTargets();
const saves = SavingThrowCalculator.rollGroupSaves(targets, 'magical', 0);
targets.forEach((target, i) => {
  const damage = saves[i] ? baseDamage / 2 : baseDamage;
  EntityUtils.applyDamage(target, damage);
});
```

## Integration with Combat and Magic Systems

These utilities are used throughout the combat and magic systems:

### In CombatSystem
```typescript
import { DiceRoller } from '../utils/DiceRoller';

private rollDamage(damageString: string): number {
  return DiceRoller.roll(damageString);
}
```

### In SpellEffectProcessor
```typescript
import { EntityUtils, CombatEntity } from '../../utils/EntityUtils';
import { SavingThrowCalculator } from '../../utils/SavingThrowCalculator';

protected applyDamage(entity: CombatEntity, damage: number): number {
  return EntityUtils.applyDamage(entity, damage);
}

protected checkSavingThrow(entity: CombatEntity, saveType: string, modifier: number = 0): boolean {
  return SavingThrowCalculator.makeSavingThrow(entity, saveType as any, modifier);
}
```

## Best Practices

1. **Always use DiceRoller** for any random number generation or dice rolling
2. **Always use EntityUtils** when working with entities that could be either Character or Monster
3. **Always use SavingThrowCalculator** for any resistance or saving throw checks
4. **Never duplicate** dice rolling logic - use DiceRoller.roll()
5. **Never duplicate** entity type checking - use EntityUtils.isCharacter() / isMonster()
6. **Never duplicate** saving throw calculations - use SavingThrowCalculator methods

## Adding New Utilities

When adding new utility classes:

1. Place them in `src/utils/`
2. Make methods static where appropriate
3. Export types and interfaces needed by consumers
4. Document all public methods
5. Add unit tests for complex logic
6. Update this document with the new utility