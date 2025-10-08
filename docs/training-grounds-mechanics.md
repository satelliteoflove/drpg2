# Training Grounds Mechanics

## Overview

The Training Grounds is a core town service in Wizardry Gaiden IV where players manage their character roster. Unlike the Inn or Temple which provide ongoing services during play, the Training Grounds is where you create new characters, modify existing ones, and manage your party composition.

All Training Grounds services are **completely free** - there are no gold costs for any character management operations.

## Main Menu

When entering the Training Grounds, players are presented with four options:

1. **Create a Character** - Begin the character creation process
2. **Inspect a Character** - View and modify existing characters
3. **Roster of Characters** - View all created characters
4. **Leave** - Return to town

## Character Creation

The character creation process follows these steps:

### 1. Name Entry
- Enter a name for your character
- Names can be alphanumeric
- Maximum length typically 8-12 characters

### 2. Race Selection
Choose from 11 available races with different base stat ranges and experience modifiers.
See `wizardry_gaiden_4_character_parameters.md` for complete race statistics.

### 3. Gender Selection
- Male or Female
- Some classes have gender restrictions (e.g., Valkyrie is female-only)

### 4. Bonus Point Allocation

The system determines bonus points to distribute:

**Classic System (Apple II / Original):**
- Roll 1d4+6 (7-10 points base)
- 10% chance to add 10 points (17-20 total)
- If that succeeds and total is 17-19, another 10% chance to add 10 more (27-29 total)
- Distribution: 90% get 7-10 points, 9.25% get 17-20 points, 0.75% get 27-29 points

**Modern System (Remake):**
- Flat 12 bonus points for all characters

**Wizardry Gaiden IV Special Feature:**
- Characters created with 10 or fewer bonus points start at **Level 4** instead of Level 1
- This provides 3 levels of stat boosts and significantly more starting HP
- Helps new characters survive early encounters

**Rules:**
- Must distribute ALL bonus points
- Can only increase stats, not decrease below racial base
- Cannot exceed 18 in any stat at creation
- Must qualify for at least one class

### 5. Class Selection

After distributing points, the game shows which classes you qualify for based on your stats. Each class has minimum stat requirements defined in the game configuration files (`src/config/classes/`).

See `wizardry_gaiden_4_character_parameters.md` for class descriptions and roles.

**Class Tiers:**
- **Basic Classes**: Fighter, Mage, Priest, Thief, Alchemist
- **Advanced Classes**: Bishop, Bard, Ranger, Psionic
- **Elite Classes**: Valkyrie (Female only), Samurai, Lord, Monk, Ninja

The actual stat requirements are maintained in the game's class configuration files to ensure consistency between documentation and implementation.

### 6. Alignment Selection
- Good
- Neutral
- Evil

Alignment affects:
- Party composition (Good and Evil cannot party together)
- Class eligibility (some classes are alignment-restricted)
- Item usability (some items have alignment requirements)

## Inspect Character

When inspecting a character, you can:

### View Character Details
- Complete statistics
- Current equipment
- Spell list
- Status and conditions
- Age and experience

### Delete Character
- Permanently removes the character
- Confirmation prompt required
- Cannot be undone
- Character is erased from roster

### Change Class
Allows multi-classing with specific mechanics:

**Requirements:**
- Must meet stat requirements for new class
- Stats are checked against ClassConfig minimums

**What Happens When Changing Class:**

*Penalties:*
- **Level**: Reset to 1
- **Experience**: Reset to 0
- **Age**: Increases by 1 year (training time)
- **Equipment**: All items become unequipped (but remain in inventory)

*What You Keep:*
- **Stats**: All attributes are retained at their current values
- **Hit Points**: Keep your total HP earned from previous class
- **Magic Points**: Retain a percentage of your maximum MP based on new class
- **Learned Spells**: ALL spells are retained and can be cast even if the new class doesn't normally support them (e.g., a Mage who becomes a Thief can still cast mage spells)
- **Inventory**: All items remain in inventory
- **Gold**: No gold loss

**Example:**
A level 8 Fighter with 45 HP changes to Mage:
- Level becomes 1
- Experience becomes 0
- Age increases from 20 to 21
- Stats remain at their current values
- All equipment unequips
- Keeps 45 HP (excellent for a level 1 Mage!)
- Inventory items stay

A level 10 Mage who knows level 1-5 mage spells changes to Fighter:
- Level becomes 1
- Experience becomes 0
- Still knows and can cast all mage spells (even though Fighters normally can't)
- Retains percentage of MP to cast those spells
- Creates a spell-casting warrior hybrid

### Rename Character
- Change character's name
- No penalties or costs
- Useful for customization or fixing typos

## Character Roster

The roster view shows:
- All created characters
- Character name, race, class, level
- Current status (OK, Dead, Ashed, etc.)
- Current location (In Party, In Town, Lost, etc.)
- Allows quick overview of available characters

## Cost Structure

**All Training Grounds services are FREE:**
- Creating characters: Free
- Deleting characters: Free
- Changing class: Free
- Renaming characters: Free
- Viewing roster: Free

The Training Grounds is publicly accessible to encourage experimentation and party optimization.

## Multi-Classing Strategy

Since stats are retained and spells can be cast regardless of class, multi-classing becomes extremely powerful:

1. **HP Building**: Start as Fighter/Samurai/Lord to build HP pool
2. **Spell Learning**: Switch to spellcaster class to learn spells
3. **Hybrid Creation**: Switch to any class while keeping HP, stats, and all spells

**Common Paths:**
- Fighter → Mage → Thief (high HP, spell-casting thief with good stats)
- Mage → Fighter (warrior who can cast offensive spells)
- Priest → Ninja (stealthy assassin with healing magic)
- Multiple caster classes → Fighter (ultimate spell-sword with all magic schools)

**Benefits:**
- Keep all stats at their developed levels (no loss of training)
- Retain all learned spells regardless of new class compatibility
- Build massive HP pools before becoming fragile casters
- Create unique hybrid combinations impossible at character creation

**Risks:**
- Age increases with each class change
- High age may affect vitality caps
- Level 1 vulnerability immediately after change
- Must meet stat requirements for new class

## Typical Workflow

### Creating New Characters
1. Enter Training Grounds
2. Create 4-6 characters
3. Balance character types (fighters, spellcasters, thief)
4. Leave Training Grounds
5. (Go to Tavern to form active party - see `tavern-mechanics.md`)
6. Begin adventuring

### Managing Existing Roster
1. Enter Training Grounds
2. Inspect character to view stats
3. Change class if desired (for multi-classing)
4. Delete obsolete characters
5. Rename for clarity
6. Leave Training Grounds

### Character Optimization
1. Create character with good stat roll
2. Choose initial class for base building
3. Level up in dungeon
4. Return to Training Grounds
5. Change to target class
6. Continue adventuring with hybrid abilities

## Historical Context

The Training Grounds system is based on:

**Wizardry I-III (1981-1983):**
- Original Training Grounds concept
- Free character creation and management
- Class changing with level/XP reset
- HP and spell retention

**Wizardry Gaiden IV (1996):**
- Refined the system for Japanese market
- 11 races, 14 classes
- Enhanced multi-classing strategy
- Maintained free service model

**Design Philosophy:**
- Encourages experimentation
- Rewards strategic planning
- No penalty for trying different builds
- Core service separate from gold economy

## Training Dungeon (Wizardry Gaiden IV Feature)

In addition to the Training Grounds service, WGIV includes a **Training Dungeon** - a separate controlled environment for new parties to gain experience:

**Features:**
- Predictable, non-random encounters for learning combat
- Healing stations on each floor
- Fast exit available at any time
- No gold or item drops from monsters
- Safe environment to test party composition
- Ideal for leveling newly multi-classed characters

**Purpose:**
- Learn combat mechanics without risk
- Build initial levels for fragile characters
- Test spell combinations and tactics
- Practice with newly created party configurations

This is completely separate from the Training Grounds character management service but complements it by providing a safe place to develop newly created or class-changed characters.

## Integration with Other Town Services

**Training Grounds vs Temple:**
- Training Grounds: Character roster management (free)
- Temple: Status recovery and resurrection (costs gold)

**Training Grounds vs Inn:**
- Training Grounds: Character creation/modification (free)
- Inn: HP/MP recovery and level-up (costs gold)

**Training Grounds vs Tavern:**
- Training Grounds: Individual character management (free)
- Tavern: Party formation and gold distribution (free) - see `tavern-mechanics.md`

**Training Grounds vs Shop:**
- Training Grounds: Character services (free)
- Shop: Equipment purchase/sale (costs gold)

The Training Grounds is unique in being entirely separate from the gold economy, emphasizing that character development choices should be unrestricted by financial constraints.

## Technical Notes

### Validation Required
- Stat requirements check (ClassConfig)
- Gender restrictions (Valkyrie)
- Alignment restrictions (class-specific)
- Name uniqueness (prevent duplicates)
- Roster size limits (if any)

### State Persistence
- Character roster saved with game state
- Class change history (optional tracking)
- Deletion is permanent (no undo)

### UI/UX Considerations
- Clear stat requirement display
- Class change warnings (level reset, age increase)
- Delete confirmation (permanent action)
- Multi-step flows with back navigation
- Real-time class eligibility updates as stats change

## References

### External Sources
- Wizardry: Proving Grounds of the Mad Overlord (1981)
- Wizardry Gaiden IV: Throb of the Demon's Heart (1996)

### Related Documentation
- `wizardry_gaiden_4_character_parameters.md` - Complete race and class information
- `wizardry_gaiden_4_experience.md` - Experience system and race/class modifiers
- `wizardry_gaiden_4_spell_learning.md` - Spell progression tables by class and level

### Implementation Files
- `src/config/races/` - Race configuration with stat ranges
- `src/config/classes/` - Class configuration with stat requirements
- `src/config/progression/` - Experience and spell learning tables
