# Bishop Identification Mechanics

## Research Findings: Classic Wizardry vs Current Implementation

### Classic Wizardry (1-5) Mechanics

Based on research of the original Wizardry games, the Bishop identification system worked as follows:

#### Key Facts
1. **Bishop Exclusivity**: ONLY Bishops could identify items in the dungeon (other classes must pay at shops)
2. **No Spell Cost**: Identification doesn't consume spell points or resources
3. **Multiple Attempts Allowed**: Can retry identification on the same item
4. **Item Must Be In Bishop's Inventory**: The Bishop must be holding the item to identify it

#### Success Rate Formula
```
Success Rate = (Bishop Level × 5%) + 10%
```

Examples:
- Level 1 Bishop: 15% chance to identify
- Level 5 Bishop: 35% chance to identify
- Level 10 Bishop: 60% chance to identify
- Level 14 Bishop: 80% chance to identify
- Level 18 Bishop: 100% chance to identify (capped)

#### Curse Risk Formula
```
Curse Risk = 35% - (Bishop Level × 3%)
```

This represents the chance of accidentally equipping a cursed item during identification, regardless of success.

Examples:
- Level 1 Bishop: 32% curse risk
- Level 5 Bishop: 20% curse risk
- Level 10 Bishop: 5% curse risk
- Level 12+ Bishop: 0% curse risk (no risk)

### Current Implementation (Incorrect)

Our current implementation deviates significantly from the authentic mechanics:

#### Current Problems
1. **All Classes Can Identify**: Currently allows any class to attempt identification (should be Bishop-only)
2. **Rates Too High**: Base 50% + bonuses (should start at 15% for level 1 Bishop)
3. **Wrong Formula**: Using flat bonuses instead of level-based percentage
4. **Incorrect Curse Mechanic**: Using a flat 95% threshold instead of level-based risk

#### Current Formula (Wrong)
```
Current Success Rate = 50% base
  + 25% if Bishop
  + (Level × 2%) if Bishop
  + (Level × 1%) if not Bishop
  + INT bonuses
  = Up to 95% cap
```

This gives a level 1 Bishop with average INT approximately 77% success rate, when it should be 15%.

### Later Wizardry Games (6-8)

- Wizardry 8 changed the system: multiple classes could learn Identify spells
- Artifacts skill available to all classes (Bishop gets 25% bonus)
- Bishop gained ability to remove cursed items
- Different from classic mechanics, not relevant for a Wizardry 1-5 style game

## Recommended Fix

To match authentic Wizardry 1-5 mechanics, we should:

### 1. Restrict Identification to Bishops Only
```typescript
if (character.class !== 'Bishop') {
  return { 
    success: false, 
    message: 'Only Bishops can identify items. Visit a shop for identification service.' 
  };
}
```

### 2. Implement Correct Success Formula
```typescript
const successRate = Math.min(1.0, (character.level * 0.05) + 0.10);
```

### 3. Implement Curse Risk Formula
```typescript
const curseRisk = Math.max(0, 0.35 - (character.level * 0.03));
```

### 4. Update Identification Logic
```typescript
const roll = Math.random();

if (roll < successRate) {
  // Successful identification
  item.identified = true;
  
  // Check curse risk separately
  if (item.cursed && Math.random() < curseRisk) {
    // Force equip cursed item
    this.equipItem(character, itemId);
    return { 
      success: true, 
      cursed: true,
      message: `Identified ${item.name} but it's cursed and bonds to ${character.name}!` 
    };
  }
  
  return { 
    success: true, 
    cursed: item.cursed,
    message: `Identified: ${item.name}` 
  };
} else {
  // Failed identification
  
  // Still check curse risk on failure
  if (item.cursed && Math.random() < curseRisk) {
    // Force equip cursed item
    this.equipItem(character, itemId);
    item.identified = true; // Curse reveals itself
    return { 
      success: false, 
      cursed: true,
      message: `Failed to identify, but the ${item.name} is cursed and bonds to ${character.name}!` 
    };
  }
  
  return { 
    success: false, 
    message: 'Failed to identify the item' 
  };
}
```

### 5. Shop Identification Service
- Shops should offer 100% successful identification for a fee
- Fee typically equals half the item's base value
- No curse risk when identified at shop

## Impact on Game Balance

### Current System (Too Easy)
- All classes can identify = Bishop less valuable
- High success rates = less risk/reward tension
- Minimal curse danger = cursed items not threatening

### Authentic System (Balanced)
- Bishop exclusivity = Bishop essential for dungeon delving parties
- Low early rates = meaningful resource management (shop fees vs attempts)
- Curse risk = real danger in early game, Bishop levels become valuable
- Multiple attempts = time/risk trade-off in dungeons

## Testing Scenarios

### Test Case 1: Level 1 Bishop
- Should have 15% success rate
- Should have 32% curse risk if item is cursed
- Non-Bishop classes should be unable to attempt

### Test Case 2: Level 10 Bishop
- Should have 60% success rate
- Should have 5% curse risk if item is cursed
- Multiple attempts should be allowed

### Test Case 3: Non-Bishop Classes
- Should receive error message when attempting identification
- Should be directed to shop for identification service

## References
- Wizardry Fan Page by Snafaru - Game Code Calculations and Formulas
- Data Driven Gamer: The not-so-basic mechanics of Wizardry
- Wizardry Wiki - Bishop class documentation
- Steam Community discussions on Bishop identification mechanics