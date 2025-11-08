# Temple Service Requirements - Wizardry Gaiden IV

## Overview
The Temple of Cant provides healing and resurrection services for adventurers in Llylgamyn. Unlike the Inn, the Temple specializes in status effect removal and bringing characters back from death.

## Services Offered

### 1. Cure Paralyzed
- **Cost**: 300 gold
- **Success Rate**: 100%
- **Effect**: Removes Paralyzed status
- **Eligibility**: Character must have Paralyzed status

### 2. Cure Stoned
- **Cost**: 300 gold
- **Success Rate**: 100%
- **Effect**: Removes Stoned status
- **Eligibility**: Character must have Stoned status

### 3. Resurrect from Dead
- **Cost**: 500 gold (estimated)
- **Success Rate**: (Vitality × 3%) + 50%
- **On Success**: Character returns to life with 1 HP, Vitality permanently reduced by 1
- **On Failure**: Character turns to Ashes
- **Eligibility**: Character must have Dead status
- **Side Effects**:
  - Permanent loss of 1 Vitality point
  - If Vitality drops below 3, character is LOST forever

### 4. Resurrect from Ashes
- **Cost**: 1000 gold (estimated)
- **Success Rate**: (Vitality × 3%) + 40%
- **On Success**: Character returns to life with full HP restored, Vitality permanently reduced by 1
- **On Failure**: Character is LOST forever (file erased)
- **Eligibility**: Character must have Ashed status
- **Side Effects**:
  - Permanent loss of 1 Vitality point
  - If Vitality drops below 3, character is LOST forever
  - High risk - failure means permanent character loss

### 5. Dispel Curse
- **Cost**: 250 gold per cursed item (estimated)
- **Success Rate**: 100%
- **Effect**: Removes curse from equipped items, allowing them to be unequipped
- **Eligibility**: Character has cursed items equipped
- **Note**: Does not identify items - only removes curse

## Services NOT Offered

Based on WGIV mechanics, the Temple does NOT provide:
- **HP Restoration**: Available only at the Inn
- **MP Restoration**: Available only at the Inn
- **Poison Cure**: Auto-cures when exiting dungeon
- **Sleep Cure**: Characters wake naturally or via combat

## Resurrection Mechanics

### Success Factors
1. **Vitality**: Primary factor in resurrection success
   - Dead: Base 50% + (Vitality × 3%)
   - Ashes: Base 40% + (Vitality × 3%)
2. **Luck**: Affects resurrection success (exact formula unknown)
3. **Age**: Does NOT affect resurrection success (contrary to some documentation)

### Risk Progression
```
OK → Dead → Ashed → Lost
     ↑       ↑       ↑
   Combat  Failed   Failed
   Death   Resurrect Ashes
```

### Vitality Degradation
- Each successful resurrection reduces Vitality by 1 permanently
- Character with Vitality below 3 becomes LOST
- Lost characters are permanently removed from the game
- No way to restore lost Vitality

### Example Success Rates
| Vitality | Dead Success | Ashes Success |
|----------|--------------|---------------|
| 18       | 104%* (100%) | 94%           |
| 15       | 95%          | 85%           |
| 12       | 86%          | 76%           |
| 10       | 80%          | 70%           |
| 8        | 74%          | 64%           |
| 5        | 65%          | 55%           |
| 3        | 59%          | 49%           |

*Success rates above 100% are capped at 100%

## UI Design Requirements

Following Inn/Shop patterns:
- **Left Panel**: Party roster with status conditions highlighted
- **Center Panel**: Service menu and result messages
- **Right Panel**: Service costs and party gold display

### Status Display
- Highlight characters needing services:
  - Dead (red)
  - Ashed (dark red)
  - Paralyzed (yellow)
  - Stoned (gray)
  - Cursed items (purple indicator)

### Service Menu Flow
1. Main Menu → Select Service Type
2. Select Character → Show eligible characters only
3. Confirm Service → Show cost and success rate
4. Execute Service → Show result message
5. Return to Main or Exit to Town

## Gold Transaction
- Deduct from pooled gold first
- If insufficient, deduct from character's individual gold
- Gold deducted BEFORE service (no refunds on failure)
- Dead/Ashed characters cannot pay (must use party gold)

## Integration Points

### Character Status System
- Update `Character.status` property
- Update `Character.stats.vitality` on successful resurrection
- Set HP to 1 for Dead resurrection, maxHp for Ashes resurrection
- Handle LOST status (remove from party permanently)

### Save System
- Save after successful services
- Track character death count
- Record Vitality changes

### Message Log
- Service purchase confirmation
- Success/failure messages
- Vitality loss warnings
- Lost character final messages

## Technical Notes

### TypeScript Types Needed
- `TempleService` enum
- `TempleState` type
- `ResurrectionResult` type
- Service cost constants

### State Management
- Similar to InnStateManager pattern
- Track selected service and character
- Calculate success rates
- Validate service eligibility

### Service Handler
- Execute status cures (100% success)
- Execute resurrections (calculated chance)
- Handle Vitality reduction
- Handle character LOST status
- Process gold transactions

## Testing Requirements

1. **Status Cures**: Verify paralysis and stone removal
2. **Resurrections**: Test success and failure paths
3. **Vitality System**: Confirm permanent reduction
4. **Lost Characters**: Verify removal from party
5. **Gold Transactions**: Test pooled and individual gold
6. **Edge Cases**:
   - Insufficient gold
   - Vitality at 3 (last resurrection)
   - Multiple resurrections in sequence
   - Lost character cleanup