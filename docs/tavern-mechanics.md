# Tavern Mechanics

## Overview

Gilgamesh's Tavern is the party management hub in Wizardry Gaiden IV where players assemble their adventuring party from the available character roster. Unlike other town services that provide ongoing support (Inn for rest, Temple for healing, Training Grounds for character creation), the Tavern is specifically for managing which characters are actively adventuring together.

All Tavern services are **completely free** - there are no gold costs for party management.

## Main Menu

When entering Gilgamesh's Tavern, players are presented with four options:

1. **Add Character** - Add a character from the roster to the active party
2. **Remove Character** - Remove a character from the active party back to the roster
3. **Divvy Gold** - Evenly distribute all party gold among active party members
4. **Leave** - Return to town

## Party Management Services

### Add Character to Party

Allows you to recruit characters from the roster into your active adventuring party.

**Requirements:**
- Active party must have fewer than 6 members
- Character must exist in the roster (created at Training Grounds)
- Character must be alive (not Dead, Ashed, or Lost)
- Character must be alignment-compatible with existing party members

**Alignment Compatibility Rules:**
- **Good** characters cannot party with **Evil** characters
- **Neutral** characters can party with anyone
- **Good** can party with **Good** and **Neutral**
- **Evil** can party with **Evil** and **Neutral**

**Process:**
1. Display list of eligible characters from roster
2. Show each character's: Name, Race, Class, Level, Alignment, Status
3. Player selects character to add
4. Character is added to the active party
5. Character is marked as "In Party" in roster

**UI Notes:**
- Gray out incompatible characters with reason displayed
- Show party capacity (e.g., "Party: 3/6")
- Highlight alignment conflicts

### Remove Character from Party

Allows you to send a character from the active party back to the roster.

**Requirements:**
- Character must be in the active party
- No minimum party size enforced (can remove down to 0 members)

**Process:**
1. Display current party members
2. Show each character's: Name, Class, Level, Status, Gold
3. Player selects character to remove
4. Character is removed from active party
5. Character is marked as "In Town" in roster
6. Character retains all equipment, gold, and status

**Important:**
- Removing characters does NOT redistribute their gold
- Dead/Ashed characters can be removed
- Character's inventory and equipment remain unchanged

### Divvy Gold

Pools all gold from active party members and redistributes it evenly.

**Process:**
1. Calculate total gold across all active party members
2. Divide total by number of active party members
3. Each character receives an equal share
4. Remainder gold (if any) goes to the first character

**Formula:**
```
Total Gold = Sum of all party members' gold
Share Per Member = Floor(Total Gold / Party Size)
Remainder = Total Gold % Party Size
```

**Example:**

Party of 4 characters with gold:
- Alice: 127g
- Bob: 53g
- Carol: 200g
- Dave: 8g

**Total:** 388g
**Share:** 97g per member
**Remainder:** 0g

After divvy:
- Alice: 97g
- Bob: 97g
- Carol: 97g
- Dave: 97g

**Notes:**
- Dead/Ashed characters participate in divvy and receive shares
- Pooled gold (separate from character gold) is NOT affected by divvy
- Use this before large purchases to consolidate funds
- Use this to equalize gold distribution after selling items

### Inspect Party

Displays detailed information about the active party.

**Information Shown:**
- Party composition (6 slots, filled/empty)
- Each character's full status
- Formation display (front row / back row)
- Total party gold (individual + pooled)
- Party alignment composition
- Overall party readiness

## Dungeon Entry Requirement

**CRITICAL RULE:**

**The active party MUST have at least 1 living character to enter the dungeon.**

This requirement is enforced when attempting to transition from Town to Dungeon:

**Valid Party States for Dungeon Entry:**
- ✓ 1 or more characters with status "OK"
- ✓ Party with mix of alive and dead characters (as long as 1+ is alive)
- ✗ Empty party (0 characters)
- ✗ Party with only Dead/Ashed characters

**Enforcement:**
- When selecting "Return to Dungeon" from Town menu
- Show warning: "You need at least one living party member to enter the dungeon!"
- Player must return to Tavern and add at least one living character

**Reasoning:**
- Dead characters cannot navigate the dungeon
- At least one conscious character is needed to carry/drag dead party members
- Prevents soft-lock where player cannot progress

## Character Roster vs Active Party

**Character Roster (Training Grounds):**
- All created characters
- Stored persistently in game save
- Characters can be: In Party, In Town, Dead, Ashed, Lost
- No limit on roster size

**Active Party (Tavern):**
- Currently adventuring characters (0-6)
- Only these characters enter the dungeon
- Only these characters participate in combat
- Only these characters can use town services (Inn, Temple, Shop)

**Character States:**
- **In Party**: Currently in active party, adventuring
- **In Town**: In roster but not in active party
- **Lost**: Permanently dead, removed from roster (cannot be added)

## Cost Structure

**All Tavern services are FREE:**
- Adding characters: Free
- Removing characters: Free
- Divvy gold: Free
- Inspect party: Free

The Tavern is a public gathering place and charges no fees for party management.

## Typical Workflow

### Starting a New Game
1. Create characters at Training Grounds
2. Go to Tavern
3. Add characters to party (up to 6)
4. Divvy gold to equalize starting funds
5. Return to town → Visit Shop to buy equipment
6. Enter dungeon when ready

### Managing Party Composition
1. Return to town from dungeon
2. Go to Tavern
3. Remove injured/dead characters
4. Add fresh characters from roster
5. Divvy gold to share wealth
6. Return to dungeon with new composition

### Preparing for Expensive Purchase
1. Go to Tavern
2. Divvy gold to pool funds
3. Go to Shop
4. Purchase expensive item with pooled resources
5. Return to dungeon

## UI Design

Following Temple/Inn/Training Grounds aesthetic:

### Main Menu Screen
```
┌─────────────────────────────────────────────────────┐
│           GILGAMESH'S TAVERN                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│   > Add Character to Party           Party: 3/6   │
│     Remove Character from Party                    │
│     Divvy Gold                                     │
│     Leave                                          │
│                                                     │
│   ─────────────────────────────────────────────   │
│   A gathering place for adventurers to form       │
│   parties and prepare for dungeon expeditions.    │
│                                                     │
├─────────────────────────────────────────────────────┤
│   Current Party:                                   │
│   1. Alice     Fighter  Lv5  GOOD     HP: 42/42  │
│   2. Bob       Mage     Lv4  NEUTRAL  HP: 18/18  │
│   3. Carol     Priest   Lv4  GOOD     HP: 24/24  │
│   4. [Empty]                                       │
│   5. [Empty]                                       │
│   6. [Empty]                                       │
└─────────────────────────────────────────────────────┘
```

### Add Character Screen
```
┌─────────────────────────────────────────────────────┐
│           ADD CHARACTER TO PARTY                    │
├─────────────────────────────────────────────────────┤
│   Available Characters:                  Party: 3/6│
│                                                     │
│   > Dave      Thief    Lv3  NEUTRAL   OK          │
│     Eve       Samurai  Lv6  GOOD      OK          │
│     Frank     Lord     Lv5  GOOD      OK          │
│     Mallory   Ninja    Lv7  EVIL      (Incomp.)   │
│     Oscar     Bishop   Lv2  NEUTRAL   DEAD         │
│                                                     │
│   ─────────────────────────────────────────────   │
│   Select a character to add to your party.        │
│   Incompatible alignments shown in gray.          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Remove Character Screen
```
┌─────────────────────────────────────────────────────┐
│         REMOVE CHARACTER FROM PARTY                 │
├─────────────────────────────────────────────────────┤
│   Active Party:                                    │
│                                                     │
│   > Alice     Fighter  Lv5  GOOD     42/42  127g  │
│     Bob       Mage     Lv4  NEUTRAL  18/18   53g  │
│     Carol     Priest   Lv4  GOOD     24/24  200g  │
│                                                     │
│   ─────────────────────────────────────────────   │
│   Select a character to remove from the party.    │
│   Character will return to town roster.           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Divvy Gold Screen
```
┌─────────────────────────────────────────────────────┐
│              DIVVY GOLD                             │
├─────────────────────────────────────────────────────┤
│   Current Gold Distribution:                       │
│                                                     │
│   Alice     Fighter  Lv5    127g                  │
│   Bob       Mage     Lv4     53g                  │
│   Carol     Priest   Lv4    200g                  │
│                                                     │
│   Total: 380g                                      │
│                                                     │
│   After Divvy: 126g each (2g to Alice)            │
│                                                     │
│   ─────────────────────────────────────────────   │
│   Confirm divvy gold evenly among party? (Y/N)    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Integration with Other Town Services

**Tavern vs Training Grounds:**
- Training Grounds: Create, delete, modify individual characters
- Tavern: Assemble characters into active adventuring party

**Tavern vs Temple:**
- Temple: Heal/resurrect characters in active party
- Tavern: Add/remove characters from active party (alternative to resurrection for dead members)

**Tavern vs Inn:**
- Inn: Rest active party members
- Tavern: Change party composition (swap tired characters for fresh ones)

**Tavern vs Shop:**
- Shop: Equip active party members
- Tavern: Divvy gold before shopping for expensive items

**Tavern → Dungeon:**
- Tavern determines who enters dungeon
- Requires at least 1 living character in active party

## Historical Context

This implementation is based on **Gilgamesh's Tavern** from Wizardry I-III:

**Wizardry: Proving Grounds of the Mad Overlord (1981):**
- First appearance of tavern party management
- ADD, REMOVE, DIVVY GOLD functions
- Owing to PLATO multiplayer roots, characters were shared - tavern was where you assembled your personal party
- Maximum 6 party members
- Alignment compatibility enforced

**Wizardry Gaiden IV: Throb of the Demon's Heart (1996):**
- Retained classic tavern mechanics
- Streamlined UI for console play
- Free service model maintained

**Design Philosophy:**
- Party composition is strategic but should be frictionless
- No cost for experimentation
- Alignment restrictions create meaningful party building decisions
- Gold pooling through divvy encourages cooperation

## Technical Implementation

### Key Components

**TavernStateManager:**
- Manages state machine (main → add/remove/divvy → result → main)
- Validates party size (0-6)
- Validates alignment compatibility
- Tracks roster vs active party

**TavernServiceHandler:**
- Executes add/remove character operations
- Executes divvy gold calculation and distribution
- Updates character states (In Party / In Town)

**TavernUIRenderer:**
- Renders tavern interface
- Displays roster with eligibility indicators
- Shows party capacity and composition
- Renders gold distribution preview

**TavernInputHandler:**
- Handles menu navigation
- Character selection
- Confirmation dialogs

### State Machine

```
main → selectService → (add/remove/divvy/inspect) → confirmAction → result → main
                               ↓
                          characterSelect (for add/remove)
```

### Alignment Compatibility Check

```typescript
function isAlignmentCompatible(newCharacter: Character, party: Character[]): boolean {
  if (party.length === 0) return true;

  const newAlign = newCharacter.alignment;

  for (const member of party) {
    const memberAlign = member.alignment;

    if (newAlign === 'good' && memberAlign === 'evil') return false;
    if (newAlign === 'evil' && memberAlign === 'good') return false;
  }

  return true;
}
```

### Divvy Gold Algorithm

```typescript
function divvyGold(party: Character[]): void {
  if (party.length === 0) return;

  const totalGold = party.reduce((sum, char) => sum + char.gold, 0);
  const sharePerMember = Math.floor(totalGold / party.length);
  const remainder = totalGold % party.length;

  party.forEach((char, index) => {
    char.gold = sharePerMember;
    if (index === 0) {
      char.gold += remainder;
    }
  });
}
```

### Dungeon Entry Validation

```typescript
function canEnterDungeon(party: Character[]): boolean {
  if (party.length === 0) return false;

  const livingCharacters = party.filter(char => !char.isDead && char.status === 'OK');
  return livingCharacters.length > 0;
}
```

## Validation Required

- **Party size**: 0-6 characters maximum
- **Alignment compatibility**: Good/Evil cannot party together
- **Character availability**: Cannot add Lost characters
- **Dungeon entry**: At least 1 living character required
- **Character uniqueness**: Same character cannot be in party twice

## State Persistence

- **Active party**: Saved with game state (Character[] in Party.characters)
- **Character roster**: Saved with game state (separate roster array)
- **Character states**: Track "In Party" vs "In Town" for each roster character
- **Gold distribution**: Persisted with individual character data

## Testing Scenarios

1. **Add Character**: Add character to empty party
2. **Add Character**: Add character to partial party (alignment compatible)
3. **Add Character**: Attempt to add 7th character (should fail)
4. **Add Character**: Attempt to add Evil character to Good party (should fail)
5. **Remove Character**: Remove character from party
6. **Remove Character**: Remove last character (party becomes empty)
7. **Divvy Gold**: Divvy gold with even split
8. **Divvy Gold**: Divvy gold with remainder
9. **Divvy Gold**: Divvy gold with 1 character
10. **Dungeon Entry**: Attempt entry with empty party (should fail)
11. **Dungeon Entry**: Attempt entry with only dead characters (should fail)
12. **Dungeon Entry**: Successful entry with 1+ living character

## References

### External Sources
- Wizardry: Proving Grounds of the Mad Overlord (1981) - Gilgamesh's Tavern
- Wizardry Gaiden IV: Throb of the Demon's Heart (1996)

### Related Documentation
- `training-grounds-mechanics.md` - Character creation and roster management
- `temple-mechanics.md` - Temple services for party members
- `wizardry_gaiden_4_character_parameters.md` - Alignment and class information

### Implementation Files
- `src/entities/Party.ts` - Party class with addCharacter/removeCharacter methods
- `src/scenes/TavernScene.ts` - Tavern scene implementation
- `src/types/GameTypes.ts` - Character and Party type definitions
