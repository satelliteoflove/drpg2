# Wizardry Gaiden IV: Spell System

## Overview
Wizardry Gaiden IV features four distinct schools of magic, each with unique spells across seven power levels. Spells consume Magic Points (MP) and have various targeting options, ranges, and effects.

## Magic Schools

### Mage Spells
Focused on offensive magic, battlefield control, and utility spells. Masters of elemental damage and enemy debuffs.

### Priest Spells
Divine magic centered on healing, protection, and undead control. Essential for party survival and support.

### Alchemist Spells
Transmutation and elemental magic, combining aspects of both offensive and defensive capabilities with unique material manipulation.

### Psionic Spells
Mental and psychic abilities that affect both mind and matter. Unique crowd control and perception abilities.

## Spell Mechanics

### Casting Requirements
- **MP Cost**: Each spell level requires increasingly more MP
- **Level Requirements**: Characters must reach specific levels to learn spells
- **Class Restrictions**: Only certain classes can learn each school
- **Silence Status**: Prevents all spellcasting
- **Range Limitations**: Combat spells have range restrictions

### Targeting Types
- **Single Target**: Affects one enemy or ally
- **Group**: Affects all enemies in one group (up to 6)
- **All Enemies**: Affects every enemy in combat
- **Party Member**: Targets one party member
- **Entire Party**: Affects all party members
- **Self Only**: Caster only

## Spell Lists by School

### Level 1 Mage Spells
- **HALITO**: Flame dart - 1-8 fire damage to single enemy
- **MOGREF**: Armor boost - Reduces party AC by 2
- **KATINO**: Sleep - Puts 1-3 enemies to sleep
- **DUMAPIC**: Location - Shows party coordinates and facing

### Level 1 Priest Spells
- **DIOS**: Heal - Restores 1-8 HP to single ally
- **BADIOS**: Harm - Deals 1-8 damage to single enemy
- **KALKI**: Bless - Reduces party AC by 1
- **MILWA**: Light - Creates light for dungeon exploration

### Level 1 Alchemist Spells
- **OSLO**: Shield - Reduces party AC by 2
- **VENAT**: Poison dart - 1-6 damage + poison to single enemy
- **ANTLE**: Antidote - Cures poison on single ally
- **MELIM**: Identify - Reveals item properties

### Level 1 Psionic Spells
- **POBA**: Mind shield - Reduces AC for both party and enemies
- **MENTAL**: Confusion - Confuses single enemy
- **DETECT**: Sense - Reveals hidden doors and traps
- **TILT**: Telekinesis - Minor damage to single enemy

### Level 2-3 Spells (Examples)

#### Mage
- **DALTO** (L3): Ice storm - 6-36 cold damage to group
- **LAHALITO** (L3): Flame storm - 6-36 fire damage to group
- **MAHALITO** (L4): Greater flame - 8-64 fire damage to group

#### Priest
- **DIALKO** (L2): Paralysis cure - Removes paralysis
- **BADIAL** (L3): Greater harm - 2-16 damage to single enemy
- **DIAL** (L3): Greater heal - Restores 2-16 HP

#### Alchemist
- **MEROLK** (L2): Levitation - Party avoids pit traps
- **DALQUAR** (L3): Acid splash - 4-24 damage to group
- **PALNTE** (L3): Group antidote - Cures poison for party

#### Psionic
- **DILTO** (L2): Darkness - Blinds enemy group
- **MORLIS** (L2): Fear - Causes enemies to flee
- **BOLATU** (L3): Mind blast - 3-24 psychic damage to group

### High-Level Spells (L5-7)

#### Ultimate Mage Spells
- **TILTOWAIT** (L7): Nuclear blast - 10-100 damage to all enemies
- **MALOR** (L7): Teleport - Instant travel to any dungeon location
- **MAHAMAN** (L7): Wish - Reality alteration (dangerous)

#### Ultimate Priest Spells
- **MADI** (L6): Full heal - Complete HP restoration
- **KADORTO** (L7): Resurrection - Revive dead party member
- **LABADI** (L6): Greater dispel - Removes all status effects

#### Ultimate Alchemist Spells
- **MALNYM** (L6): Transmutation - Change matter state
- **ABRIDAL** (L7): Disintegration - Instant death to group
- **ZILWAN** (L6): Dispel undead - Destroys undead instantly

#### Ultimate Psionic Spells
- **MINDKILL** (L7): Psychic destruction - Instant death, single target
- **PACCSI** (L6): Mass hypnosis - Sleep all enemies
- **ASTRAL** (L7): Astral projection - Scout ahead safely

## MP Costs by Level

| Spell Level | Base MP Cost |
|-------------|-------------|
| Level 1     | 1-2         |
| Level 2     | 2-3         |
| Level 3     | 3-4         |
| Level 4     | 4-5         |
| Level 5     | 5-6         |
| Level 6     | 6-8         |
| Level 7     | 8-10        |

## Special Mechanics

### Fizzle Fields
- Areas that prevent all magic use
- Can be created by spells or monsters
- Affects both parties equally

### Spell Resistance
- Some monsters resist certain spell schools
- Undead immune to mental/sleep effects
- Elemental creatures may absorb matching damage

### Spell Memorization
- Unlike earlier Wizardry games, spells use MP system
- No need to memorize specific spells before resting
- All known spells available if MP sufficient

### Critical Spell Effects
- Some spells can critical for increased effect
- Based on caster level and luck stat
- Damage spells can deal double damage
- Healing spells can restore extra HP

## Class-Specific Spell Access

| Class      | Mage | Priest | Alchemist | Psionic |
|------------|------|--------|-----------|---------|
| Fighter    | No   | No     | No        | No      |
| Mage       | Yes  | No     | No        | No      |
| Priest     | No   | Yes    | No        | No      |
| Thief      | No   | No     | No        | No      |
| Alchemist  | No   | No     | Yes       | No      |
| Bishop     | Yes  | Yes    | Later     | Later   |
| Bard       | Some | Some   | No        | No      |
| Ranger     | No   | Some   | Some      | No      |
| Psionic    | No   | No     | No        | Yes     |
| Valkyrie   | No   | Yes    | No        | No      |
| Samurai    | Yes  | No     | No        | No      |
| Lord       | No   | Yes    | No        | No      |
| Monk       | No   | Some   | No        | Some    |
| Ninja      | Some | No     | Some      | No      |

## Spell Combinations
Some spells work synergistically:
- **MOGREF** + **KALKI**: Stack for maximum AC reduction
- **KATINO** + area damage: Sleeping enemies take extra damage
- **MILWA** + **DUMAPIC**: Essential dungeon exploration combo
- **MADI** + **LABADI**: Full restoration combo