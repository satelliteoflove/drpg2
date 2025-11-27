# Combat System

## Overview

The combat system uses a hybrid approach with two defensive mechanics:
- **Evasion**: Determines whether attacks hit (miss/hit check)
- **Damage Reduction (DR)**: Reduces damage taken when hits land

This design reflects real-world armor behavior: armor both deflects attacks (glancing blows) and absorbs impact (padding).

## Hit Roll Formula

```
Hit if: d20 + attackerAccuracy >= hitThreshold

hitThreshold = BASE_THRESHOLD + defenderEvasion
             = 10 + defenderEvasion

attackerAccuracy = level + floor(agility / ACCURACY_AGILITY_DIVISOR)
                 = level + floor(agility / 4)

defenderEvasion = floor(agility / EVASION_AGILITY_DIVISOR) + equipmentBonus + buffBonus
                = floor(agility / 3) + equipmentBonus + buffBonus
```

### Example Hit Calculations

| Attacker | Level | AGI | Accuracy | Target | EVA | Threshold | Hit on d20... |
|----------|-------|-----|----------|--------|-----|-----------|---------------|
| Fighter  | 1     | 12  | 1+3=4    | Slime  | 2   | 12        | 8+            |
| Fighter  | 1     | 12  | 4        | Goblin | 5   | 15        | 11+           |
| Fighter  | 1     | 12  | 4        | Orc    | 2   | 12        | 8+            |
| Orc      | 2     | 10  | 4        | Fighter| 6   | 16        | 12+           |

## Damage Formula

```
baseDamage = weaponDice + floor(STR / STR_DIVISOR)
           = weaponDice + floor(STR / 4)

finalDamage = max(MIN_DAMAGE, baseDamage - targetDamageReduction)
            = max(1, baseDamage - DR)
```

### Example Damage Calculations

| Attacker | STR | Weapon | Weapon Dice | STR Bonus | Base Damage | Target DR | Final Damage |
|----------|-----|--------|-------------|-----------|-------------|-----------|--------------|
| Fighter  | 16  | Sword  | 1d8 (avg 4.5) | 4       | 8-9         | 0 (Slime) | 8-9          |
| Fighter  | 16  | Sword  | 1d8 (avg 4.5) | 4       | 8-9         | 1 (Goblin)| 7-8          |
| Fighter  | 16  | Sword  | 1d8 (avg 4.5) | 4       | 8-9         | 4 (Orc)   | 4-5          |

## Character Stats

### Evasion
- **Base**: `floor(agility / 3)`
- **Equipment bonuses**: Added from armor, shields, accessories
- **Buff bonuses**: Temporary bonuses from spells and effects
- **Getter**: `character.effectiveEvasion` (includes all bonuses)

### Damage Reduction
- **Base**: 0 (characters start with no innate DR)
- **Equipment bonuses**: Added from armor
- **Buff bonuses**: Temporary bonuses from spells (e.g., Shield spells)
- **Getter**: `character.effectiveDamageReduction` (includes all bonuses)

### Accuracy
- **Formula**: `level + floor(agility / 4)`
- **Getter**: `character.accuracy`

## Monster Stats

Monsters have fixed evasion and DR values based on their type and level:

| Monster | Base Evasion | Base DR | Notes |
|---------|--------------|---------|-------|
| Slime   | 2            | 0       | Easy to hit, no armor |
| Goblin  | 5            | 1       | Agile, light armor |
| Skeleton| 4            | 2       | Bone provides some protection |
| Orc     | 2            | 4       | Slow but heavily armored |
| Troll   | 3            | 5       | Thick hide, regenerates |

Monster stats scale with level:
```
evasion = baseEvasion + floor(level / 4)
damageReduction = baseDamageReduction + floor(level / 5)
```

## Equipment Effects

### Armor
Armor provides both evasion (dodging) and damage reduction (absorption):

| Armor         | Evasion | DR | Notes |
|---------------|---------|-----|-------|
| Robe          | +1      | +0  | Mage gear, mobility |
| Leather Armor | +2      | +1  | Light protection |
| Blessed Armor | +1      | +5  | Heavy holy protection |

### Spells

Defensive spells can buff either stat:

| Spell Type | Effect | Duration |
|------------|--------|----------|
| Protection | +evasion | Combat/Adventure |
| Shield     | +DR | Combat |
| Debuff     | -evasion on enemies | Combat |

## Combat Actions

### Attack
1. Roll d20 + accuracy
2. Compare against 10 + target evasion
3. If hit: roll weapon damage + STR/4, subtract target DR (min 1 damage)
4. If miss: no damage

### Defend
Grants +2 evasion for 1 turn (makes you harder to hit).

### Spell Damage
Spells bypass the hit roll and deal damage directly, reduced only by DR.

## Configuration

All combat formulas use constants from `GameConstants.ts`:

```typescript
COMBAT: {
  HIT_ROLL: {
    BASE_THRESHOLD: 10,
    ACCURACY_LEVEL_BONUS: 1,
    ACCURACY_AGILITY_DIVISOR: 4,
    EVASION_AGILITY_DIVISOR: 3,
    D20_SIDES: 20,
  },
  DAMAGE: {
    STRENGTH_DIVISOR: 4,
    MIN_DAMAGE: 1,
    UNARMED_DICE: '1d2',
  },
  MONSTER_ACCURACY: {
    LEVEL_BONUS: 1,
    BASE_AGILITY: 10,
    AGILITY_DIVISOR: 4,
  },
}
```

## Implementation Files

- `src/config/GameConstants.ts` - Combat formula constants
- `src/entities/Character.ts` - Character stats and getters
- `src/types/GameTypes.ts` - ICharacter and Monster interfaces
- `src/utils/EntityUtils.ts` - Helper methods for entity stats
- `src/systems/combat/helpers/DamageCalculator.ts` - Hit roll and damage calculation
- `src/systems/magic/effects/DamageEffect.ts` - Spell damage calculation
- `src/systems/ModifierSystem.ts` - Temporary stat modifiers
- `src/systems/EquipmentModifierManager.ts` - Equipment stat bonuses
