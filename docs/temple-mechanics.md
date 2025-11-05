# Temple Mechanics - Wizardry Gaiden IV

## Overview

The Temple of Divine Restoration provides healing and resurrection services for adventurers. The temple system uses level-based pricing with automatic gold pooling, ensuring that the party can pool resources to save fallen companions.

## Services Offered

### 1. Cure Paralyzed
- **Base Cost**: 100g
- **Actual Cost**: 100g × Character Level
- **Success Rate**: 100%
- **Effect**: Removes Paralyzed status, sets status to OK
- **Eligibility**: Character must have Paralyzed status

### 2. Cure Stoned
- **Base Cost**: 100g
- **Actual Cost**: 100g × Character Level
- **Success Rate**: 100%
- **Effect**: Removes Stoned status, sets status to OK
- **Eligibility**: Character must have Stoned status

### 3. Resurrect from Dead
- **Base Cost**: 200g
- **Actual Cost**: 200g × Character Level
- **Success Rate**: Variable (see Resurrection Mechanics below)
- **Eligibility**: Character must have Dead status
- **On Success**:
  - Status → OK
  - HP → 1
  - Vitality -1
  - Age +1 year
- **On Failure**:
  - Status → Ashed
  - Vitality -3
  - Age +10 years

### 4. Resurrect from Ashes
- **Base Cost**: 500g
- **Actual Cost**: 500g × Character Level
- **Success Rate**: Variable (see Resurrection Mechanics below)
- **Eligibility**: Character must have Ashed status
- **On Success**:
  - Status → OK
  - HP → 1
  - Vitality -3
  - Age +10 years
- **On Failure**:
  - Status → Lost (permanent death)
  - Character is permanently removed from the game

## Services NOT Offered

The Temple does NOT provide:
- **HP/MP Restoration**: Available only at the Inn
- **Poison Cure**: Auto-cures when exiting dungeon
- **Sleep Cure**: Characters wake naturally or via combat
- **Dispel Curse**: Handled at the Shop (cursed equipment identification/removal)

## Level-Based Pricing

All temple services use level-based pricing to reflect the difficulty and power required:

```
Final Cost = Base Cost × Character Level
```

### Cost Examples

| Service | Level 1 | Level 5 | Level 10 | Level 15 |
|---------|---------|---------|----------|----------|
| Cure Paralyzed | 100g | 500g | 1,000g | 1,500g |
| Cure Stoned | 100g | 500g | 1,000g | 1,500g |
| Resurrect Dead | 200g | 1,000g | 2,000g | 3,000g |
| Resurrect Ashes | 500g | 2,500g | 5,000g | 7,500g |

This pricing system prevents low-level death spam while making high-level resurrections appropriately expensive, encouraging careful play.

## Gold Payment System

### Automatic Gold Pooling

The temple uses automatic gold pooling (similar to Wizardry 1-3):

1. **Select Service** - Choose which divine service to perform
2. **Select Character** - Choose the character who needs the service (cost calculated from their level)
3. **Select Payer** - Choose which party member attempts to pay first
4. **Automatic Pooling** - If the payer doesn't have enough gold, the temple automatically collects from other party members

### Payment Algorithm

```
1. Deduct as much as possible from the payer
2. If cost not fully paid:
   - Iterate through all other party members
   - Deduct from each until cost is fully paid
3. If party's total gold < cost:
   - Service is refused
```

### Payment Example

Party has 5 members with the following gold:
- Alice: 100g
- Bob: 50g
- Carol: 200g
- Dave: 75g
- Eve: 25g

**Total:** 450g

Need to resurrect Carol (Level 3) from dead: 200g × 3 = **600g**

**Result:** Service refused - party only has 450g total.

Need to cure Dave (Level 2) from paralysis: 100g × 2 = **200g**

Player selects Alice as payer:
1. Deduct 100g from Alice (Alice now has 0g)
2. Still need 100g
3. Deduct 50g from Bob (Bob now has 0g)
4. Still need 50g
5. Deduct 50g from Carol (Carol now has 150g)
6. Service is performed!

**Party Total After:** 250g (0+0+150+75+25)

### Implementation Code

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

## Resurrection Mechanics

### Success Rate Formulas

**Dead Resurrection:**
```
successChance = min(95%, 50% + (Vitality × 3%) + (Level × 2%))
```

**Ashes Resurrection:**
```
successChance = max(10%, 40% + (Vitality × 3%))
```

### Success Factors

1. **Vitality**: Primary factor in resurrection success
   - Dead: +3% per Vitality point
   - Ashes: +3% per Vitality point
2. **Level**: Affects dead resurrection only
   - +2% per character level
   - Rewards investment in high-level characters
3. **Maximum**: Dead resurrection caps at 95%
4. **Minimum**: Ashes resurrection floors at 10%

### Success Rate Tables

#### Resurrect from Dead

| Vitality | Level 1 | Level 5 | Level 10 | Level 15 | Level 20 |
|----------|---------|---------|----------|----------|----------|
| 15       | 95%*    | 95%*    | 95%*     | 95%*     | 95%*     |
| 12       | 88%     | 95%*    | 95%*     | 95%*     | 95%*     |
| 10       | 82%     | 92%     | 95%*     | 95%*     | 95%*     |
| 8        | 76%     | 86%     | 95%*     | 95%*     | 95%*     |
| 5        | 67%     | 77%     | 87%      | 95%*     | 95%*     |
| 3        | 61%     | 71%     | 81%      | 91%      | 95%*     |

*Capped at 95% maximum success chance

**Key Insights:**
- High vitality characters (12+) are very safe to resurrect, especially at higher levels
- Low vitality characters (3-5) face real risk, but level helps significantly
- At level 10+, even low vitality characters have reasonable chances

#### Resurrect from Ashes

| Vitality | Success Rate | Notes |
|----------|--------------|-------|
| 15       | 85%          | Relatively safe |
| 12       | 76%          | Good odds |
| 10       | 70%          | Decent chance |
| 8        | 64%          | Risky |
| 5        | 55%          | Very risky |
| 3        | 49%          | Nearly a coin flip |

**Key Insights:**
- No level bonus for ashes - vitality is everything
- Even high vitality characters face real danger
- Low vitality characters (<5) have less than 50/50 odds
- Permanent death is a real possibility

### Risk Progression

```
OK → Dead → Ashed → Lost
     ↑       ↑       ↑
   Combat  Failed   Failed
   Death   Resurrect Ashes
           (Town)    (Town)
```

### Vitality and Age Effects

Resurrection always has consequences:

| Outcome | HP | Vitality | Age | Note |
|---------|----|---------:|----:|------|
| **Dead → Success** | 1 | -1 | +1 year | Minor consequences |
| **Dead → Failure** | - | -3 | +10 years | Character becomes Ashed with harsh penalties |
| **Ashes → Success** | 1 | -3 | +10 years | Heavy toll even on success |
| **Ashes → Failure** | - | - | - | Character is Lost forever |

#### Why These Penalties Matter

1. **Vitality Loss**: Each resurrection permanently reduces Vitality
   - Affects future resurrection chances
   - Once Vitality drops too low, characters become unreliable
   - Creates tension: "Can we risk another death?"

2. **Age Increase**: Characters age faster when dying/resurrecting
   - Age +1 year on successful dead resurrection (minor)
   - Age +10 years on ashes or failed dead resurrection (harsh)
   - Limits the total lifespan/usefulness of the character
   - Punishes reckless play by shortening character careers
   - Failed resurrections age characters dramatically

3. **Compound Risk**: Multiple deaths spiral
   - Lower vitality → lower success rates → more failures → even lower vitality
   - Failed resurrections rapidly age characters
   - Eventually characters become too risky to use

### Vitality Degradation Example

Character starts with Vitality 12:

1. **First death** (successful resurrection): VT 12 → 11 (88% → 85% next time)
2. **Second death** (successful resurrection): VT 11 → 10 (85% → 82% next time)
3. **Third death** (failed, turns to ashes): VT 10 → 7 (70% ashes chance)
4. **Ashes resurrection** (successful): VT 7 → 4 (61% ashes chance if it happens again)
5. **Another death**: VT 4 → 3 (52% ashes chance - very dangerous now)

After 3-4 resurrections, characters become high-risk.

## Town vs Dungeon Resurrection

### Temple Services (Town)

The formulas and success rates documented above apply to **Temple services in town**.

**Characteristics:**
- Generally reliable (95% cap for dead at high VT/Level)
- Level-based costs ensure affordability at low levels
- Safe environment for attempting risky ashes resurrections
- Recommended for all resurrections when possible

### Priest Spells (Dungeon)

Priest resurrection spells cast **in the dungeon** are intentionally riskier:

**Design Intent:**
- Lower base success rates
- Higher penalties on failure
- Risk/reward decision: attempt now or carry body to town?
- Creates tension during dungeon exploration
- Balances the convenience of in-dungeon resurrection

**Note:** Priest spell resurrection mechanics are documented separately in the magic system documentation.

## UI Flow

1. **Main Menu**
   - Temple Services
   - Leave Temple

2. **Service Selection**
   - Shows all services with base costs
   - Format: "Service Name - Xg × Level"
   - Only shows services that have eligible characters

3. **Character Selection**
   - Shows eligible characters only
   - Displays: Name (Level X), Status, Actual Cost
   - Shows "(Insufficient Gold)" if party can't afford
   - Shows success rate for resurrections

4. **Payer Selection**
   - Shows all party members with their gold
   - Indicates if individual can cover full cost
   - Shows total party gold available

5. **Confirmation**
   - "Service for Character (Cost, starting with Payer)?"
   - Shows success rate and consequences for resurrections
   - Warnings for ashes resurrection (permanent death risk)

6. **Result**
   - Success/failure message
   - Vitality and age changes displayed
   - Automatic return to main menu

## Technical Implementation

### Key Classes

- **TempleStateManager** - Manages state machine and cost calculations
- **TempleServiceHandler** - Executes services and handles gold deduction with pooling
- **TempleUIRenderer** - Renders temple interface with dynamic costs and success rates
- **TempleInputHandler** - Handles user input and navigation

### State Machine

```
main → selectService → selectCharacter → selectPayer → confirmService → serviceResult → main
```

### Configuration Constants

All values are defined in `src/config/GameConstants.ts`:

```typescript
TEMPLE: {
  SERVICE_COSTS: {
    CURE_PARALYZED: 100,
    CURE_STONED: 100,
    RESURRECT_DEAD: 200,
    RESURRECT_ASHES: 500,
  },
  RESURRECTION: {
    DEAD_BASE_CHANCE: 0.5,
    DEAD_VITALITY_MULTIPLIER: 0.03,
    DEAD_LEVEL_BONUS: 0.02,
    ASHES_BASE_CHANCE: 0.4,
    ASHES_VITALITY_MULTIPLIER: 0.03,
    MAX_SUCCESS_CHANCE: 0.95,
    MIN_SUCCESS_CHANCE: 0.1,
    HP_RESTORED_ON_SUCCESS: 1,
    DEAD_SUCCESS_VT_LOSS: 1,
    DEAD_SUCCESS_AGE_INCREASE: 1,
    DEAD_FAILURE_VT_LOSS: 3,
    DEAD_FAILURE_AGE_INCREASE: 10,
    ASHES_SUCCESS_VT_LOSS: 3,
    ASHES_SUCCESS_AGE_INCREASE: 10,
  }
}
```

These constants are tunable for game balance adjustments.

## Design Philosophy

This implementation is based on classic Wizardry mechanics from Wizardry 1-3 and Wizardry Gaiden IV:

### Core Principles

1. **Death is Serious**: Characters can die permanently, creating real stakes
2. **Investment Matters**: Level bonus rewards players who've developed characters
3. **Vitality is Critical**: High vitality characters are safer investments
4. **Progressive Risk**: Multiple deaths create downward spiral
5. **Age as Resource**: Characters have finite useful lifespans
6. **Convenience Costs**: Town resurrections are safer than dungeon attempts

### Balance Considerations

- **Level-based costs**: Prevents low-level death spam, makes high-level deaths expensive
- **Auto-pooling**: Quality-of-life feature - no manual gold transfer required
- **Resurrection risk**: Maintains tension - death is serious but not always permanent
- **Vitality drain**: Permanent consequences discourage recklessness
- **Age acceleration**: Failed resurrections shorten character careers significantly
- **95% cap**: Even optimal characters face small failure chance
- **10% floor**: Even worst-case ashes resurrections have slim hope

## Integration Points

### Character Status System
- Update `Character.status` property
- Update `Character.stats.vitality` on resurrection
- Update `Character.age` on resurrection
- Set HP to 1 for successful resurrections
- Handle Lost status (remove from party permanently)

### Save System
- Save after successful services
- Track character death count
- Record Vitality changes
- Track age changes

### Message Log
- Service purchase confirmation
- Success/failure messages
- Vitality loss warnings
- Age increase notifications
- Lost character final messages

## References

- Wizardry: Proving Grounds of the Mad Overlord (1981)
- Wizardry Gaiden IV: Throb of the Demon's Heart (1996)
- `src/config/GameConstants.ts` - All tunable constants
- `src/types/TempleTypes.ts` - Type definitions
- `src/systems/temple/` - Implementation classes
- `src/scenes/TempleScene.ts` - Scene management
