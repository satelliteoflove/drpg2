# Wizardry Gaiden IV: Authentic Spell System

## Overview
Wizardry Gaiden IV features four distinct schools of magic, each with 28 spells across seven power levels. This document contains all 112 authentic spells from the original Game Boy game.

## Magic Schools
- **Mage**: Offensive magic, battlefield control, elemental damage
- **Priest**: Divine magic, healing, protection, resurrection
- **Alchemist**: Transmutation, buffs, elemental clouds, utility
- **Psionic**: Mental/psychic abilities, crowd control, perception

## Spell Mechanics

### MP Costs by Level
| Spell Level | MP Cost |
|-------------|---------|
| Level 1     | 3       |
| Level 2     | 5       |
| Level 3     | 8       |
| Level 4     | 12      |
| Level 5     | 15      |
| Level 6     | 20      |
| Level 7     | 30      |

### Casting Requirements
- **MP Cost**: Each spell level requires MP as shown above
- **Level Requirements**: Characters must reach specific levels to learn spells
- **Class Restrictions**: Only certain classes can learn each school
- **Silence Status**: Prevents all spellcasting
- **Anti-Magic Zones**: Prevent spell casting (items still work)

### Targeting Types
- **self**: Caster only
- **ally**: Single party member
- **enemy**: Single enemy
- **group**: All enemies in one group
- **allAllies**: Entire party
- **allEnemies**: All enemies in combat
- **any**: Any character (living or dead)
- **dead**: Dead/ashed characters only

---

# Mage Spells (28 Total)

## Level 1 Mage Spells

### Fire Dart (HALITO)
- **Target**: Single enemy
- **Effect**: 1-8 fire damage
- **Usage**: Combat only
- **Tags**: offensive, fire

### Armor (MOGREF)
- **Target**: All allies
- **Effect**: -2 AC for duration of combat
- **Usage**: Combat and exploration
- **Tags**: defensive, buff, party

### Sleep (KATINO)
- **Target**: Enemy group
- **Effect**: Sleep 1-3 enemies for 3+1d3 turns
- **Usage**: Combat only
- **Tags**: control, status

### Locate (DUMAPIC)
- **Target**: Self
- **Effect**: Shows party coordinates and facing direction
- **Usage**: Exploration only
- **Tags**: utility, navigation

## Level 2 Mage Spells

### Sleep Cloud (MAKATINO)
- **Target**: All enemies
- **Effect**: Sleep all enemies for 3+1d3 turns
- **Usage**: Combat only
- **Tags**: control, status, area

### X-Ray Vision (DILTO)
- **Target**: Self
- **Effect**: See through walls and check if walls are rock for 40 steps
- **Usage**: Exploration only
- **Tags**: utility, detection

### Confusion (SOPIC)
- **Target**: Enemy group
- **Effect**: Confuse 1-3 enemies for 3+1d3 turns
- **Usage**: Combat only
- **Tags**: control, status

### Light (MILWA)
- **Target**: Self
- **Effect**: Creates light for 30+1d12 steps
- **Usage**: Exploration only
- **Tags**: utility, light

## Level 3 Mage Spells

### Fire Storm (LAHALITO)
- **Target**: Enemy group
- **Effect**: 6-36 fire damage
- **Usage**: Combat only
- **Tags**: offensive, fire, area

### Ice Storm (DALTO)
- **Target**: Enemy group
- **Effect**: 6-36 ice damage
- **Usage**: Combat only
- **Tags**: offensive, ice, area

### Paralysis (MATU)
- **Target**: Enemy group
- **Effect**: Paralyze 1-3 enemies for duration of combat
- **Usage**: Combat only
- **Tags**: control, status

### Levitation (LOMILWA)
- **Target**: All allies
- **Effect**: Party levitates for 40 steps (avoid pit traps)
- **Usage**: Exploration only
- **Tags**: utility, protection

## Level 4 Mage Spells

### Greater Fire (MAHALITO)
- **Target**: Enemy group
- **Effect**: 8-64 fire damage
- **Usage**: Combat only
- **Tags**: offensive, fire, area

### Greater Ice (MADALTO)
- **Target**: Enemy group
- **Effect**: 8-64 ice damage
- **Usage**: Combat only
- **Tags**: offensive, ice, area

### Death (ZILWAN)
- **Target**: Single enemy
- **Effect**: Instant death (not effective on undead)
- **Usage**: Combat only
- **Tags**: instant_death, offensive

### Teleport (MALOR)
- **Target**: Self
- **Effect**: Teleport party by relative coordinates (exploration) or random safe location same floor (combat); fatal if teleport into rock
- **Usage**: Combat and exploration
- **Tags**: utility, teleport, dangerous

## Level 5 Mage Spells

### Petrify (SOZIR)
- **Target**: Enemy group
- **Effect**: Petrify 1-3 enemies permanently (until cured)
- **Usage**: Combat only
- **Tags**: control, status

### Greater Light (MORLIS)
- **Target**: Self
- **Effect**: Creates bright light for 60+1d12 steps
- **Usage**: Exploration only
- **Tags**: utility, light

### Mega Ice (LADALTO)
- **Target**: Enemy group
- **Effect**: 10-80 ice damage
- **Usage**: Combat only
- **Tags**: offensive, ice, area, powerful

### Dispel Magic (KANDI)
- **Target**: All allies
- **Effect**: Removes silence and other dispellable effects from party
- **Usage**: Combat and exploration
- **Tags**: utility, cure, party

## Level 6 Mage Spells

### Mass Paralysis (MABADI)
- **Target**: All enemies
- **Effect**: Paralyze all enemies for duration of combat
- **Usage**: Combat only
- **Tags**: control, status, area

### Mass Death (MAKANITO)
- **Target**: All enemies
- **Effect**: Instant death to all enemies (not effective on undead)
- **Usage**: Combat only
- **Tags**: instant_death, offensive, area

### Mass Petrify (MASOZIR)
- **Target**: All enemies
- **Effect**: Petrify all enemies permanently (until cured)
- **Usage**: Combat only
- **Tags**: control, status, area

### Fear (BADI)
- **Target**: Enemy group
- **Effect**: Fear 1-3 enemies for 3+1d3 turns (causes flee/panic)
- **Usage**: Combat only
- **Tags**: control, status

## Level 7 Mage Spells

### Nuclear Blast (TILTOWAIT)
- **Target**: All enemies
- **Effect**: 10-100 neutral damage
- **Usage**: Combat only
- **Tags**: offensive, ultimate, area

### Ultimate Death (HAMAN)
- **Target**: All enemies
- **Effect**: Instant death to all enemies including undead
- **Usage**: Combat only
- **Tags**: instant_death, offensive, area, ultimate

### Map (CALFO)
- **Target**: Self
- **Effect**: Display 3x3 map of surrounding area
- **Usage**: Exploration only
- **Tags**: utility, navigation

### Summon (GALDI)
- **Target**: Self
- **Effect**: Randomly summons monster from list: Wisp, Creeping Coin, Vampire Lord
- **Usage**: Combat only
- **Tags**: summon, utility

---

# Priest Spells (28 Total)

## Level 1 Priest Spells

### Heal (DIOS)
- **Target**: Single ally
- **Effect**: Restores 1-8 HP
- **Usage**: Combat and exploration
- **Tags**: healing

### Harm (BADIOS)
- **Target**: Single enemy
- **Effect**: 1-8 holy damage
- **Usage**: Combat only
- **Tags**: offensive, holy

### Caster Protection (PORFIC)
- **Target**: Self
- **Effect**: -4 AC for duration of combat
- **Usage**: Combat only
- **Tags**: defensive, buff

### Cure Poison (LATUMAPIC)
- **Target**: Single ally
- **Effect**: Cures poison status
- **Usage**: Combat and exploration
- **Tags**: cure, restoration

## Level 2 Priest Spells

### Greater Heal (DIAL)
- **Target**: Single ally
- **Effect**: Restores 2-16 HP
- **Usage**: Combat and exploration
- **Tags**: healing

### Cure Paralysis (DIALKO)
- **Target**: Single ally
- **Effect**: Removes paralysis status
- **Usage**: Combat and exploration
- **Tags**: cure, restoration

### Party Protection (MATU)
- **Target**: All allies
- **Effect**: -2 AC for duration of combat
- **Usage**: Combat only
- **Tags**: defensive, buff, party

### Light (MILWA)
- **Target**: Self
- **Effect**: Creates light for 30+1d12 steps
- **Usage**: Exploration only
- **Tags**: utility, light

## Level 3 Priest Spells

### Greater Harm (BADIAL)
- **Target**: Single enemy
- **Effect**: 2-16 holy damage
- **Usage**: Combat only
- **Tags**: offensive, holy

### Group Heal (DIALMA)
- **Target**: All allies
- **Effect**: Restores 3-24 HP to all party members
- **Usage**: Combat and exploration
- **Tags**: healing, party

### Bless (KALKI)
- **Target**: All allies
- **Effect**: -1 AC for duration of adventure (persists outside combat)
- **Usage**: Combat and exploration
- **Tags**: defensive, buff, party

### Detect Traps (CALFO)
- **Target**: Self
- **Effect**: 95% chance to detect traps in current square
- **Usage**: Exploration only
- **Tags**: utility, detection

## Level 4 Priest Spells

### Holy Word (BADIALMA)
- **Target**: All enemies
- **Effect**: 3-24 holy damage to all enemies
- **Usage**: Combat only
- **Tags**: offensive, holy, area

### Cure Status (BATU)
- **Target**: Single ally
- **Effect**: Cures sleep, fear, and silence
- **Usage**: Combat and exploration
- **Tags**: cure, restoration

### Blessed Protection (BAMATU)
- **Target**: All allies
- **Effect**: -3 AC for duration of combat
- **Usage**: Combat only
- **Tags**: defensive, buff, party

### Cure Stone (DIALBA)
- **Target**: Single ally
- **Effect**: Removes petrification status
- **Usage**: Exploration only
- **Tags**: cure, restoration

## Level 5 Priest Spells

### Cure Multi-Status (BADIAL)
- **Target**: Single ally
- **Effect**: Cures poison, paralysis, sleep, fear, and silence
- **Usage**: Combat and exploration
- **Tags**: cure, restoration

### Resurrect (KADORTO)
- **Target**: Dead ally
- **Effect**: 50% base chance to resurrect from death; if fails, target turns to ash
- **Usage**: Exploration only
- **Tags**: resurrection, restoration, risky

### Banish Undead (BADI)
- **Target**: Single enemy
- **Effect**: Instant death (effective only on undead)
- **Usage**: Combat only
- **Tags**: instant_death, offensive, holy

### Sacred Protection (MAPORFIC)
- **Target**: All allies
- **Effect**: -2 AC for duration of adventure (persists outside combat)
- **Usage**: Combat and exploration
- **Tags**: defensive, buff, party

## Level 6 Priest Spells

### Full Heal (MADI)
- **Target**: Single ally
- **Effect**: Fully restores HP and cures poison, paralysis, petrification, sleep, confusion, fear, charm, berserk, blindness, silence, curse
- **Usage**: Combat and exploration
- **Tags**: healing, restoration, ultimate, cure

### Greater Resurrect (DI)
- **Target**: Dead or ashed ally
- **Effect**: 75% base chance to resurrect from death/ashes; if fails on ashes, permanent death
- **Usage**: Exploration only
- **Tags**: resurrection, restoration, risky

### Greater Banish Undead (BAKADI)
- **Target**: Enemy group
- **Effect**: Instant death to 1-3 enemies (effective only on undead)
- **Usage**: Combat only
- **Tags**: instant_death, offensive, holy, area

### Return to Castle (LOKTOFEIT)
- **Target**: Self
- **Effect**: Instantly returns party to castle; spell is forgotten after use
- **Usage**: Combat and exploration
- **Tags**: utility, teleport, escape

## Level 7 Priest Spells

### Ultimate Heal (MADI)
- **Target**: All allies
- **Effect**: Fully restores HP to entire party
- **Usage**: Combat and exploration
- **Tags**: healing, ultimate, party

### Ultimate Resurrect (KADOR)
- **Target**: Dead or ashed ally
- **Effect**: 90% base chance to resurrect from death/ashes; if fails on ashes, permanent death
- **Usage**: Exploration only
- **Tags**: resurrection, restoration, risky

### Destroy Demon (MOGATO)
- **Target**: Single enemy
- **Effect**: Instant death (effective only on demons)
- **Usage**: Combat only
- **Tags**: instant_death, offensive, holy

### HP Drain (LABADI)
- **Target**: Single enemy
- **Effect**: Drains HP leaving target with 1-8 HP, transfers drained HP to caster
- **Usage**: Combat only
- **Tags**: offensive, drain, healing

---

# Alchemist Spells (28 Total)

## Level 1 Alchemist Spells

### Attack Boost (OSLO)
- **Target**: All allies
- **Effect**: +2 attack power for 3+1d3 turns
- **Usage**: Combat and exploration
- **Tags**: buff, party, offensive

### Flee Boost (NOLIS)
- **Target**: All allies
- **Effect**: +5 flee chance for 3+1d3 turns
- **Usage**: Combat only
- **Tags**: buff, party, escape

### Breath Effect (NAGRA)
- **Target**: Single ally
- **Effect**: Target's breath weapon damage increased for 3+1d3 turns
- **Usage**: Combat only
- **Tags**: buff, offensive

### Cure Poison (ANTLE)
- **Target**: Single ally
- **Effect**: Cures poison status
- **Usage**: Combat and exploration
- **Tags**: cure, restoration

## Level 2 Alchemist Spells

### Cloud Damage Fire (LIQUREA)
- **Target**: Enemy group
- **Effect**: Creates fire cloud dealing 1-4 damage per turn for 3+1d3 turns
- **Usage**: Combat only
- **Tags**: offensive, cloud, fire, area

### Cloud Damage Ice (COLQUREA)
- **Target**: Enemy group
- **Effect**: Creates ice cloud dealing 1-4 damage per turn for 3+1d3 turns
- **Usage**: Combat only
- **Tags**: offensive, cloud, ice, area

### Haste (PONTI)
- **Target**: Single ally
- **Effect**: Extra attack + improved AC for 3+1d3 turns
- **Usage**: Combat only
- **Tags**: buff, offensive, defensive

### Group Cure Poison (PAMANTLE)
- **Target**: All allies
- **Effect**: Cures poison status for entire party
- **Usage**: Combat and exploration
- **Tags**: cure, restoration, party

## Level 3 Alchemist Spells

### Cloud Damage Neutral (LIQUFIS)
- **Target**: Enemy group
- **Effect**: Creates neutral cloud dealing 1-6 damage per turn for 3+1d3 turns
- **Usage**: Combat only
- **Tags**: offensive, cloud, area

### Cloud Damage Acid/Poison (CALIQUREA)
- **Target**: Enemy group
- **Effect**: Creates acid/poison cloud dealing 1-6 damage per turn for 3+1d3 turns
- **Usage**: Combat only
- **Tags**: offensive, cloud, acid, area

### Lower Resistance (NOFIS)
- **Target**: All enemies
- **Effect**: Reduces enemy spell resistance for duration of combat
- **Usage**: Combat only
- **Tags**: debuff, area

### Raise Resistance (MAFIS)
- **Target**: All allies
- **Effect**: Increases party spell resistance for duration of combat
- **Usage**: Combat only
- **Tags**: buff, party, defensive

## Level 4 Alchemist Spells

### Dispel Cloud (FISQUREA)
- **Target**: All allies
- **Effect**: Removes cloud damage effects from party
- **Usage**: Combat only
- **Tags**: utility, cure, party

### Spell Reflect (BANOKA)
- **Target**: Single ally
- **Effect**: 50% chance to reflect spells for 3 turns
- **Usage**: Combat only
- **Tags**: defensive, buff

### Extended Attack Boost (MAOSLO)
- **Target**: All allies
- **Effect**: +2 attack power for 6+1d3 turns
- **Usage**: Combat and exploration
- **Tags**: buff, party, offensive

### Cure Multi-Status (MORFIS)
- **Target**: Single ally
- **Effect**: Cures poison, paralysis, petrification, and sleep
- **Usage**: Combat and exploration
- **Tags**: cure, restoration

## Level 5 Alchemist Spells

### Summon (GALDI)
- **Target**: Self
- **Effect**: Randomly summons monster from list: Fighter, Thief, Mage, Priest, Alchemist, Bishop
- **Usage**: Combat only
- **Tags**: summon, utility

### Group Cure Multi-Status (PAMORFIS)
- **Target**: All allies
- **Effect**: Cures poison, paralysis, petrification, and sleep for entire party
- **Usage**: Combat and exploration
- **Tags**: cure, restoration, party

### Drain Speed (SOQUREA)
- **Target**: Enemy group
- **Effect**: Reduces speed of enemy group for duration of combat
- **Usage**: Combat only
- **Tags**: debuff, control, area

### Identify (CALDU)
- **Target**: Self
- **Effect**: Identifies all unidentified items in inventory
- **Usage**: Exploration only
- **Tags**: utility

## Level 6 Alchemist Spells

### Remove Curse (ZILFE)
- **Target**: Any item
- **Effect**: Removes curse from item and destroys it (WARNING: Has critical bug in original game)
- **Usage**: Exploration only
- **Tags**: utility, curse, buggy

### Unlock (CALNOVA)
- **Target**: Chest or door
- **Effect**: Safely unlocks chests and doors
- **Usage**: Exploration only
- **Tags**: utility

### Greater Haste (MAPONTI)
- **Target**: All allies
- **Effect**: Extra attack + improved AC for all party members for 3+1d3 turns
- **Usage**: Combat only
- **Tags**: buff, offensive, defensive, party

### Restoration (MABUREDEIM)
- **Target**: Single ally
- **Effect**: Restores 10-80 HP
- **Usage**: Combat and exploration
- **Tags**: healing

## Level 7 Alchemist Spells

### Mega Damage (ALIKUS)
- **Target**: Single enemy
- **Effect**: 65-130 neutral damage
- **Usage**: Combat only
- **Tags**: offensive, ultimate

### Ultimate Restoration (MAMABUREDEIM)
- **Target**: All allies
- **Effect**: Restores 10-80 HP to entire party
- **Usage**: Combat and exploration
- **Tags**: healing, ultimate, party

### Ultimate Unlock (MACALNOVA)
- **Target**: Chest or door
- **Effect**: Unlocks any locked chest or door safely
- **Usage**: Exploration only
- **Tags**: utility, ultimate

### Ultimate Identify (MACALDU)
- **Target**: Self
- **Effect**: Identifies all items including cursed items safely
- **Usage**: Exploration only
- **Tags**: utility, ultimate

---

# Psionic Spells (28 Total)

## Level 1 Psionic Spells

### Psi Damage Confuse (SIOS)
- **Target**: Single enemy
- **Effect**: 1-10 psychic damage + confusion for 3+1d3 turns
- **Usage**: Combat only
- **Tags**: offensive, psychic, control

### Psi Heal (DIOMAS)
- **Target**: Single ally
- **Effect**: Restores 1-8 HP
- **Usage**: Combat and exploration
- **Tags**: healing

### AC Swap (POBA)
- **Target**: All enemies and all allies
- **Effect**: Raises all enemies AC by 1, lowers all allies AC by 1 for duration of combat
- **Usage**: Combat only
- **Tags**: buff, debuff, party

### Charm/Paralyze (GENES)
- **Target**: Single NPC (exploration) or enemy (combat)
- **Effect**: Charm NPC or paralyze enemy for duration of combat
- **Usage**: Combat and exploration
- **Tags**: control, status, charm

## Level 2 Psionic Spells

### Greater Psi Damage Confuse (RIOS)
- **Target**: Single enemy
- **Effect**: 2-16 psychic damage + confusion for 3+1d3 turns
- **Usage**: Combat only
- **Tags**: offensive, psychic, control

### Detect Doors (DIAFIC)
- **Target**: Self
- **Effect**: Detects hidden doors for 200 steps
- **Usage**: Exploration only
- **Tags**: utility, detection

### See Through Walls (CALKO)
- **Target**: Self
- **Effect**: See through walls or check if block is rock for 30 steps
- **Usage**: Exploration only
- **Tags**: utility, detection

### Calm (KALRAS)
- **Target**: Enemy group
- **Effect**: Calms 1-3 enemies, removing berserk/aggressive status
- **Usage**: Combat only
- **Tags**: control, status

## Level 3 Psionic Spells

### Confusion (LORKS)
- **Target**: Enemy group
- **Effect**: Confuse 1-3 enemies for 3+1d3 turns
- **Usage**: Combat only
- **Tags**: control, status

### Read Mind (NOBAIS)
- **Target**: Single NPC
- **Effect**: Read NPC's mind to reveal hidden information
- **Usage**: Exploration only
- **Tags**: utility, detection

### Greater AC Swap (MAPOBA)
- **Target**: All enemies and all allies
- **Effect**: Raises all enemies AC by 2, lowers all allies AC by 2 for duration of combat
- **Usage**: Combat only
- **Tags**: buff, debuff, party

### Hide (REIMAR)
- **Target**: Self
- **Effect**: Hides caster from enemies for 3+1d3 turns
- **Usage**: Combat only
- **Tags**: defensive, stealth

## Level 4 Psionic Spells

### Greater Psi Damage (MASIOS)
- **Target**: Enemy group
- **Effect**: 3-24 psychic damage to group + confusion for 3+1d3 turns
- **Usage**: Combat only
- **Tags**: offensive, psychic, control, area

### Restoration (BUREDEIM)
- **Target**: Single ally
- **Effect**: Restores 4-32 HP
- **Usage**: Combat and exploration
- **Tags**: healing

### Spell Power Boost (KUREMAR)
- **Target**: Self
- **Effect**: Increases caster's offensive spell damage by 25% for 3 turns
- **Usage**: Combat only
- **Tags**: buff, offensive

### Psi Damage (BADUMAS)
- **Target**: Single enemy
- **Effect**: 4-32 psychic damage
- **Usage**: Combat only
- **Tags**: offensive, psychic

## Level 5 Psionic Spells

### Summon (ZAKALDI)
- **Target**: Self
- **Effect**: Randomly summons monster from psionic list: Samurai, Lord, Ninja, Psionic
- **Usage**: Combat only
- **Tags**: summon, utility

### Extended Map (MAKALMA)
- **Target**: Self
- **Effect**: Display 5x5 map including unexplored areas
- **Usage**: Exploration only
- **Tags**: utility, navigation

### Drain MP (HAKANIDO)
- **Target**: Single enemy
- **Effect**: Drains 1-8 MP from enemy, transfers to caster
- **Usage**: Combat only
- **Tags**: offensive, drain

### Fear (DALOSTO)
- **Target**: Enemy group
- **Effect**: Fear 1-3 enemies for 3+1d3 turns (causes flee/panic)
- **Usage**: Combat only
- **Tags**: control, status

## Level 6 Psionic Spells

### Identify (CALDU)
- **Target**: Self
- **Effect**: Identifies all unidentified items in inventory
- **Usage**: Exploration only
- **Tags**: utility

### Greater Restoration (MAMORLIS)
- **Target**: All allies
- **Effect**: Restores 6-48 HP to entire party
- **Usage**: Combat and exploration
- **Tags**: healing, party

### Greater Psi Heal (MADIOS)
- **Target**: Single ally
- **Effect**: Restores 6-48 HP
- **Usage**: Combat and exploration
- **Tags**: healing

### Ultimate Restoration (BURENES)
- **Target**: Single ally
- **Effect**: Restores 8-64 HP
- **Usage**: Combat and exploration
- **Tags**: healing

## Level 7 Psionic Spells

### Ultimate Psi Damage (GULTOMAS)
- **Target**: Enemy group
- **Effect**: 10-80 psychic damage + random multi-status (sleep/paralysis/confusion/petrification)
- **Usage**: Combat only
- **Tags**: offensive, psychic, area, ultimate, status

### NPC List (NOSBADI)
- **Target**: Self
- **Effect**: Display list of all NPCs met during adventure
- **Usage**: Exploration only
- **Tags**: utility

### Mega Psi Damage (LASIOS)
- **Target**: Single enemy
- **Effect**: 10-80 psychic damage + confusion for 3+1d3 turns
- **Usage**: Combat only
- **Tags**: offensive, psychic, control, ultimate

### Stat Boost (IHALON)
- **Target**: Single ally
- **Effect**: Choose: rejuvenate age, boost ST/IQ/PI/VT/AG/LK, or change personality (if age ≤19 and stat maxed); spell is forgotten after use
- **Usage**: Exploration only
- **Tags**: utility, ultimate, stat

---

# Class Spell Access

| Class      | Mage | Priest | Alchemist | Psionic |
|------------|------|--------|-----------|---------|
| Fighter    | No   | No     | No        | No      |
| Mage       | Yes  | No     | No        | No      |
| Priest     | No   | Yes    | No        | No      |
| Thief      | No   | No     | No        | No      |
| Alchemist  | No   | No     | Yes       | No      |
| Bishop     | Yes  | Yes    | Yes*      | Yes*    |
| Bard       | Yes* | Yes*   | No        | No      |
| Ranger     | No   | Yes*   | Yes*      | No      |
| Psionic    | No   | No     | No        | Yes     |
| Valkyrie   | No   | Yes    | No        | No      |
| Samurai    | Yes* | No     | No        | No      |
| Lord       | No   | Yes*   | No        | No      |
| Monk       | No   | Yes*   | No        | Yes*    |
| Ninja      | Yes* | No     | Yes*      | No      |

*Limited access - only gains access to school at higher levels

---

# Special Spell Mechanics

## Fizzle System
- Fizzle chance based on caster level, primary stat (INT/PIE), and LUK
- Poor class fit (e.g., low-INT Lizman Mage) has frequent fizzles at low levels
- High-level/high-stat casters rarely fizzle

## Spell Resistance
- Some monsters resist certain spell schools
- Undead immune to sleep/mental effects
- Level difference affects resistance
- Bosses immune to instant death

## Status Effect Duration
- Most status effects last 3+1d3 turns
- Petrification, poison, and curse are permanent until cured
- Combat-only buffs end when combat ends
- Adventure-duration buffs persist outside combat

## Teleportation Risk
- MALOR uses relative coordinates (not destination)
- Teleporting into rock = instant party death, permanent character loss
- Safe in combat (random safe location on same floor)
- Some areas protected against teleportation

## Resurrection Risk
- Player-cast resurrection has failure chance based on caster level
- Failure on dead character → turns to ash
- Failure on ashed character → permanent death (LOST)
- Temple resurrection more reliable but expensive

## Cloud Damage
- Damage-over-time effects that persist for multiple turns
- Can be dispelled with FISQUREA (Alchemist L4)
- Affected by spell resistance

## Spell Stacking
- Different AC buffs stack (MOGREF + KALKI)
- Same spell cannot be cast multiple times for extended duration
- Opposing effects cancel each other

## Special One-Use Spells
- **LOKTOFEIT** (Priest L6): Forgotten after use
- **IHALON** (Psionic L7): Forgotten after use

## Bugs from Original Game
- **ZILFE** (Alchemist L6): Has critical bug in original - removes curse but destroys item
