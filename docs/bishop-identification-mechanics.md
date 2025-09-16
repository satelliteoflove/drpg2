# Bishop Identification Mechanics

## Overview

The Bishop identification system in DRPG2 faithfully implements the classic Wizardry (1-5) mechanics, providing an authentic experience where Bishops serve their traditional role as the party's item identifier.

## Current Implementation (Authentic)

### Core Mechanics

#### Bishop Exclusivity
- **Only Bishops can identify items** in the dungeon (implemented in `InventorySystem.identifyItem()`)
- Other classes must use shop identification services
- Enforced via class check that returns 0% chance for non-Bishops

#### Success Rate Formula
```typescript
// From Character.ts lines 334-337
const successRate = (this.level * 0.05) + 0.10;
return Math.min(successRate, 1.0); // Cap at 100%
```

**Success Rates by Level:**
- Level 1 Bishop: 15% chance to identify
- Level 5 Bishop: 35% chance to identify
- Level 10 Bishop: 60% chance to identify
- Level 14 Bishop: 80% chance to identify
- Level 18+ Bishop: 100% chance to identify (capped)

#### Curse Risk Formula
```typescript
// From InventorySystem.ts lines 384-389
const curseRisk = Math.max(0, 0.35 - (bishop.level * 0.03));
```

**Curse Risk by Level:**
- Level 1 Bishop: 32% curse risk
- Level 5 Bishop: 20% curse risk
- Level 10 Bishop: 5% curse risk
- Level 12+ Bishop: 0% curse risk (safe)

### Implementation Details

#### Character Class (`src/entities/Character.ts`)
```typescript
public getIdentificationChance(): number {
    // Only Bishops can identify items
    if (this.characterClass !== 'Bishop') {
        return 0;
    }
    // Authentic Wizardry formula
    const successRate = (this.level * 0.05) + 0.10;
    return Math.min(successRate, 1.0);
}
```

#### Inventory System (`src/systems/InventorySystem.ts`)
The `identifyItem()` method implements the complete identification flow:

1. **Bishop Check**: Validates character is a Bishop (lines 369-375)
2. **Success Calculation**: Uses authentic formula (lines 377-382)
3. **Curse Risk**: Separate risk calculation for cursed items (lines 384-389)
4. **Curse Behavior**: Cursed items auto-equip on failed identification (lines 394-417)
5. **Multiple Attempts**: Allows retrying on unidentified items

### Shop Identification Service

#### Shop System (`src/systems/ShopSystem.ts`)
```typescript
public identifyItem(itemId: string): IdentificationResult {
    // 100% success rate at shops
    // Cost: 50% of item value (configurable)
    // No curse risk
}
```

**Shop Mechanics:**
- 100% successful identification
- Costs 50% of item's base value (default, configurable)
- No curse risk
- Available to all classes

## Game Balance Impact

### Bishop Value Proposition
- **Essential for Dungeon Parties**: Only class that can identify items in the field
- **Risk/Reward Dynamic**: Low-level Bishops face real curse danger
- **Progression Incentive**: Bishop levels directly improve identification safety
- **Resource Management**: Choose between risky Bishop attempts or expensive shop fees

### Cursed Item Mechanics
- **Auto-Equip on Curse**: Cursed items forcibly equip when curse triggers
- **Cannot Unequip**: Cursed items cannot be removed without special means
- **Identification Reveals Curse**: Curse becomes known when it triggers
- **Shop Safety**: Shops never trigger curses

## Configuration

### Game Constants (`src/config/GameConstants.ts`)
```typescript
IDENTIFICATION: {
    BASE_CHANCE: 0.10,           // 10% base chance
    LEVEL_MULTIPLIER: 0.05,      // 5% per level
    MAX_CHANCE: 1.0,             // 100% cap
    CURSE_BASE_RISK: 0.35,       // 35% base curse risk
    CURSE_RISK_REDUCTION: 0.03,  // 3% reduction per level
    SHOP_COST_MULTIPLIER: 0.5    // 50% of item value
}
```

## Testing Verification

### Test Coverage
The implementation has been verified through:
- Unit tests for Character class identification methods
- Integration tests for InventorySystem identification flow
- Playwright tests for UI behavior
- Manual testing of curse mechanics

### Key Test Scenarios

#### Level 1 Bishop
- ✅ 15% success rate confirmed
- ✅ 32% curse risk on cursed items
- ✅ Non-Bishops cannot attempt

#### Level 10 Bishop
- ✅ 60% success rate confirmed
- ✅ 5% curse risk on cursed items
- ✅ Multiple attempts allowed

#### Shop Identification
- ✅ 100% success rate
- ✅ No curse risk
- ✅ Proper cost calculation

## Comparison with Other Wizardry Games

### Classic Wizardry (1-5)
Our implementation matches the authentic mechanics exactly:
- Bishop-only identification
- Level-based success formula
- Separate curse risk calculation
- No resource consumption

### Later Wizardry (6-8)
These games changed the system significantly:
- Multiple classes could learn Identify spells
- Artifacts skill available to all classes
- Bishop received different bonuses
- Not relevant for our classic implementation

## Future Enhancements

### Potential Additions (Not Yet Implemented)
1. **Uncurse Service**: Temple service to remove curses
2. **Blessed Items**: Positive identification bonuses
3. **Bishop Specialization**: Advanced identification abilities at high levels
4. **Identification Scrolls**: Consumable items for emergency identification

## References
- Wizardry Fan Page by Snafaru - Game Code Calculations and Formulas
- Data Driven Gamer: The not-so-basic mechanics of Wizardry
- Wizardry Wiki - Bishop class documentation
- DRPG2 Source Code - Actual implementation reference