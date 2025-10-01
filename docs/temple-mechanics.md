# Temple Mechanics

## Overview

The Temple of Divine Restoration provides healing, resurrection, and curse-removal services for adventurers. The temple system follows classic Wizardry mechanics with level-based pricing and automatic gold pooling.

## Service Costs

All temple services use level-based pricing:

```
Final Cost = Base Cost × Character Level
```

### Base Costs

| Service | Base Cost | Formula |
|---------|-----------|---------|
| Cure Paralyzed | 100g | 100g × Level |
| Cure Stoned | 100g | 100g × Level |
| Resurrect from Dead | 200g | 200g × Level |
| Resurrect from Ashes | 500g | 500g × Level |
| Dispel Curse | 50g | 50g × Level |

### Examples

- Level 1 character paralyzed: 100g × 1 = **100g**
- Level 5 character dead: 200g × 5 = **1,000g**
- Level 10 character ashed: 500g × 10 = **5,000g**

## Gold Payment System

### Automatic Gold Pooling

The temple uses automatic gold pooling similar to Wizardry 1-3:

1. **Select Service** - Choose which divine service to perform
2. **Select Character** - Choose the character who needs the service (cost is calculated based on their level)
3. **Select Payer** - Choose which party member attempts to pay first
4. **Automatic Pooling** - If the payer doesn't have enough gold individually, the temple automatically collects from other party members

### Payment Algorithm

```
1. Deduct as much as possible from the payer
2. If cost not fully paid:
   - Iterate through all other party members
   - Deduct from each until cost is fully paid
3. If party's total gold < cost:
   - Service is refused
```

### Example Scenario

Party has 5 members with the following gold:
- Alice: 100g
- Bob: 50g
- Carol: 200g
- Dave: 75g
- Eve: 25g

**Total:** 450g

Need to cure Carol (Level 3) from paralysis: 100g × 3 = **300g**

Player selects Alice as payer:
1. Deduct 100g from Alice (Alice now has 0g)
2. Still need 200g
3. Deduct 50g from Bob (Bob now has 0g)
4. Still need 150g
5. Deduct 150g from Carol (Carol now has 50g)
6. Service is performed!

**Party Total After:** 150g (0+0+50+75+25)

## Service Mechanics

### Cure Paralyzed
- **Eligibility:** Character status = "Paralyzed"
- **Success Rate:** 100%
- **Effect:** Sets status to "OK"

### Cure Stoned
- **Eligibility:** Character status = "Stoned"
- **Success Rate:** 100%
- **Effect:** Sets status to "OK"

### Resurrect from Dead
- **Eligibility:** Character status = "Dead"
- **Success Rate:** Variable (based on Vitality and Level)
- **Success:**
  - Status → "OK"
  - HP → 1
  - Vitality -1
  - Age +1 year
- **Failure:**
  - Status → "Ashed"
  - Vitality -3
  - Age +10 years

### Resurrect from Ashes
- **Eligibility:** Character status = "Ashed"
- **Success Rate:** Very Low (50% of resurrection chance)
- **Success:**
  - Status → "OK"
  - HP → 1
  - Vitality -3
  - Age +10 years
- **Failure:**
  - Status → "Lost" (permanent death)

### Dispel Curse
- **Eligibility:** Character has at least one cursed item equipped
- **Success Rate:** 100%
- **Effect:** Removes `cursed` flag from all equipped items

## UI Flow

1. **Main Menu**
   - Temple Services
   - Leave Temple

2. **Service Selection**
   - Shows all services with base costs
   - Format: "Service Name - Xg × Level"

3. **Character Selection**
   - Shows eligible characters only
   - Displays: Name (Level), Status, Actual Cost
   - Shows "(Insufficient)" if party can't afford

4. **Payer Selection**
   - Shows all party members with their gold
   - Shows if individual can cover full cost

5. **Confirmation**
   - "Service for Character (Cost, starting with Payer)?"
   - Warnings for resurrection services

6. **Result**
   - Success/failure message
   - Automatic return to main menu

## Technical Implementation

### Key Classes

- **TempleStateManager** - Manages state machine and cost calculations
- **TempleServiceHandler** - Executes services and handles gold deduction with pooling
- **TempleUIRenderer** - Renders temple interface with dynamic costs
- **TempleInputHandler** - Handles user input and navigation

### State Machine

```
main → selectService → selectCharacter → selectPayer → confirmService → serviceResult → main
```

### Auto-Pooling Implementation

```typescript
private deductGoldWithPooling(payer: Character, cost: number, allCharacters: Character[]): void {
  let remaining = cost;

  if (payer.gold >= remaining) {
    payer.gold -= remaining;
    return;
  }

  remaining -= payer.gold;
  payer.gold = 0;

  for (const char of allCharacters) {
    if (char === payer) continue;
    if (remaining <= 0) break;

    if (char.gold >= remaining) {
      char.gold -= remaining;
      remaining = 0;
      break;
    } else {
      remaining -= char.gold;
      char.gold = 0;
    }
  }
}
```

## Historical Context

This implementation is based on classic Wizardry mechanics from Wizardry 1-3 and Wizardry Gaiden IV:

- **Level-based costs:** Prevents low-level spam, makes high-level deaths expensive
- **Auto-pooling:** Quality-of-life feature - no manual gold transfer required
- **Resurrection risk:** Maintains tension - death is serious but not permanent
- **Vitality drain:** Permanent consequences discourage recklessness

## References

- Wizardry: Proving Grounds of the Mad Overlord (1981)
- Wizardry Gaiden IV: Throb of the Demon's Heart (1996)
- GAME_CONFIG.DEATH_SYSTEM configuration
- Temple types defined in src/types/TempleTypes.ts
