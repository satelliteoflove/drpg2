# Wizardry Gaiden IV: Status Effects Reference

## Overview

Status effects are abnormal conditions that interfere with a character's ability to perform actions in combat and exploration. They can be inflicted by spells, monster attacks, traps, cursed equipment, or environmental hazards. This document provides comprehensive information on all status effects in Wizardry Gaiden IV.

## Status Effect Categories

```yaml
categories:
  normal_state:
    - OK

  temporary_conditions:
    - Sleeping
    - Poisoned
    - Paralyzed
    - Stoned
    - Silenced
    - Blinded
    - Confused
    - Feared
    - Charmed

  permanent_conditions:
    - Dead
    - Ashed
    - Lost

  special_conditions:
    - Cursed
    - Level Drained
    - Diseased
    - Nauseated
```

## Normal State

### OK
```yaml
name: OK
status_type: normal
description: Character is in normal, healthy condition with no status ailments
effects:
  combat: No restrictions
  exploration: No restrictions
  visual_indicator: None (default state)
cure_methods:
  - Cure any existing status effects
source: Wizardry Gaiden IV (current implementation)
confirmed: true
```

The OK status represents a character in perfect health with no abnormal conditions affecting them. This is the default and desired state for all party members.

---

## Temporary Combat/Exploration Conditions

### Sleeping
```yaml
name: Sleeping
aliases: [Sleep, Asleep]
status_type: temporary
severity: moderate
description: Character is asleep and unable to act until awakened

effects:
  combat:
    - Cannot take any actions
    - Turn is automatically skipped
    - Any damage received wakes the character
    - Damage taken while sleeping is increased
  exploration:
    - Cannot move or interact
    - Vulnerable to ambush

duration:
  base: 1-8 rounds (combat)
  recovery_chance: 20% per round to wake naturally
  instant_wake: Any damage taken

inflicted_by:
  spells:
    - KATINO (Sleep): "Puts 1-3 enemies to sleep"
  monsters:
    - Various monsters with sleep attacks
    - Okikusama's freezing palm (high chance)
  traps:
    - Sleep gas traps in dungeons

cure_methods:
  spells:
    - DIALKO (Soft): "Cures paralysis, silence, and sleep of one character" [Level 3 Priest]
    - MADI (Cure): "Fully heals one character, cures anything less than death" [Level 6 Priest]
  natural:
    - Wakes on next turn (chance based)
    - Instantly on receiving damage
  temple:
    - Not offered (wakes naturally)

racial_resistance:
  - Elves have resistance to sleep

visual_indicator: "Sleeping" or "Asleep" status display

source: Wizardry Wiki, GameFAQs WG4 Guide, Wizardry Gaiden III Spell List
confirmed: true
implementation_notes: |
  When implementing, sleeping characters should:
  - Skip their turn automatically
  - Wake with increased damage multiplier (1.5x-2x suggested)
  - Have chance to wake each round
  - Wake immediately on any damage
```

### Poisoned
```yaml
name: Poisoned
aliases: [Poison]
status_type: temporary
severity: moderate
description: Character is poisoned and gradually loses hit points

effects:
  combat:
    - Loses 1-4 HP per round (or percentage of max HP)
    - Can still fight, cast spells, and use items
    - Full combat capability maintained
  exploration:
    - Loses HP every few steps (poison damage ticks)
    - Can still move and interact normally
    - Auto-cured when exiting dungeon (confirmed)

duration:
  base: Until cured or party exits dungeon
  damage_rate: 1-4 HP per round (combat) or per 10 steps (exploration)

inflicted_by:
  spells:
    - VENAT (Poison Dart): "1-6 damage + poison to single enemy" [Level 1 Alchemist]
  monsters:
    - Monsters with poison attacks
  traps:
    - Poison needle traps
    - Poison gas traps
  items:
    - Poison Dagger (assassin's dagger)

cure_methods:
  spells:
    - ANTLE (Antidote): "Cures poison on single ally" [Level 1 Alchemist]
    - PALNTE (Group Antidote): "Cures poison for entire party" [Level 3 Alchemist]
    - LATUMOFIS (Detoxify): "Cures poison of one character" [Level 4 Priest]
    - MADI (Cure): "Fully heals one character, cures anything less than death" [Level 6 Priest]
  items:
    - Antidote potions
  natural:
    - Auto-cures when exiting dungeon
  temple:
    - Not offered (auto-cures on exit)

racial_resistance:
  - Dwarves are somewhat resistant to poison

visual_indicator: "Poisoned" status display, possible green tint

source: Wizardry Wiki, WG4 Spell List, Temple Requirements Doc
confirmed: true
implementation_notes: |
  Poison damage should:
  - Tick regularly but not be instantly lethal
  - Continue during exploration
  - Not reduce HP below 1 (character can't die from poison alone in some versions)
  - Auto-cure on dungeon exit
```

### Paralyzed
```yaml
name: Paralyzed
aliases: [Paralysis, Paralysed]
status_type: temporary
severity: high
description: Character cannot act in any way - no fighting, casting spells, or using items

effects:
  combat:
    - Cannot take any actions whatsoever
    - Cannot fight, cast spells, or use items
    - Turn is automatically skipped
    - Prevents experience and treasure distribution if active at battle's end
  exploration:
    - Cannot move or interact
    - Completely helpless

duration:
  base: Until cured (does not wear off naturally in most cases)
  recovery_chance: 0% natural recovery during combat

inflicted_by:
  spells:
    - MANIFO: "Paralyze 1 group of monsters" [Level 2 Priest]
  monsters:
    - Various monsters with paralysis attacks
    - Okikusama's freezing palm (high chance)
  traps:
    - Paralysis traps in dungeons

cure_methods:
  spells:
    - DIALKO (Soft): "Cures paralysis, silence, and sleep of one character" [Level 3 Priest]
    - MADI (Cure): "Fully heals one character, cures anything less than death" [Level 6 Priest]
  temple:
    - Cure Paralyzed service: 300 gold, 100% success rate

racial_resistance:
  - Hobbits resist special attacks (may include paralysis)
  - Dracons resist special attacks (may include paralysis)

visual_indicator: "Paralyzed" status display, yellow highlighting

source: Wizardry Wiki, Temple Requirements Doc, GameFAQs Guides
confirmed: true
implementation_notes: |
  Low-level parties cannot cure paralysis without temple services.
  Paralysis is more severe than sleep - no natural recovery.
  Character is completely helpless until cured.
```

### Stoned
```yaml
name: Stoned
aliases: [Petrified, Stone, Petrification]
status_type: temporary
severity: high
description: Character has been turned to stone and cannot act

effects:
  combat:
    - Complete inability to act
    - Cannot fight, cast spells, or use items
    - Turn is automatically skipped
    - Prevents experience and treasure distribution if active at battle's end
  exploration:
    - Cannot move or interact
    - Effectively removed from active play
    - Still counts toward party size

duration:
  base: Until cured (permanent without intervention)
  recovery_chance: 0% natural recovery

inflicted_by:
  spells:
    - BOLATU (Rock): "Petrifies one enemy" [Level 2 Mage, Wizardry 5]
    - ROKDO (Petri): "Petrify a group of enemies" [Level 4 Mage, Wizardry 5]
  monsters:
    - Basilisks
    - Medusas
    - Other petrifying monsters

cure_methods:
  spells:
    - MADI (Cure): "Fully heals one character, cures anything less than death" [Level 6 Priest]
    - ZILFIS (Uncurse): May work in some versions (unconfirmed for petrification)
  temple:
    - Cure Stoned service: 300 gold, 100% success rate
    - Alternative formula: 200 gold per character level

visual_indicator: "Stoned" or "Petrified" status display, gray highlighting

source: Wizardry Wiki, Temple Requirements Doc
confirmed: true (cure methods), partial (infliction methods - may not be in WG4)
implementation_notes: |
  Petrification is severe - only high-level spells or temple can cure.
  Character is effectively removed from combat until cured.
  May require special visual representation (gray/stone texture).
```

### Silenced
```yaml
name: Silenced
aliases: [Silence, Sealed, Muted]
status_type: temporary
severity: moderate
description: Character cannot cast any spells

effects:
  combat:
    - Cannot cast any spells (all schools)
    - Can still fight with weapons
    - Can use items
    - All spell options disabled
  exploration:
    - Cannot cast utility spells
    - Can still move and interact physically

duration:
  base: 1-8 rounds (combat)
  recovery_chance: (Target Level × 20%) per round, max 50%

inflicted_by:
  spells:
    - MONTINO (Seal/Silence): "Silences each monster in a group" [Level 2 Priest]
    - BACORTU (Silence Field): "Creates unresistable fizzle field preventing spells" [Level 5 Mage]
  monsters:
    - Monsters with silencing attacks
  areas:
    - Fizzle fields (special dungeon zones)

cure_methods:
  spells:
    - DIALKO (Soft): "Cures paralysis, silence, and sleep" [Level 3 Priest]
    - KUSFIS: "Cures spell-binding" [Level 27+ Priest, Wizardry Variants Daphne]
    - MADI (Cure): "Fully heals one character, cures anything less than death" [Level 6 Priest]
  natural:
    - Recovery chance each round based on character level
  temple:
    - Not offered (recovers naturally)

resistance:
  - Each target has (Level × 10%) chance to resist
  - BACORTU creates unresistable field

visual_indicator: "Silenced" or "Sealed" status display

source: Wizardry Wiki, GameFAQs Spell Lists, Wizardry I-IV Spells
confirmed: true (Wizardry series), partial (WG4 specific mechanics)
implementation_notes: |
  Silence is tactical - disables spellcasters but leaves physical combat.
  MONTINO can be resisted, BACORTU cannot.
  Recovery is level-based with 50% cap.
```

### Blinded
```yaml
name: Blinded
aliases: [Blind, Darkness]
status_type: temporary
severity: low-moderate
description: Character cannot see clearly, reducing accuracy and perception

effects:
  combat:
    - Reduced accuracy (miss chance increased)
    - May attack in wrong direction
    - Lowered senses
  exploration:
    - Reduced trap detection distance
    - Cannot see dungeon clearly
    - Navigation impaired

duration:
  base: 1-8 rounds (combat)
  recovery_chance: Variable per round

inflicted_by:
  spells:
    - DILTO (Darkness): "Blinds enemy group" [Level 2 Psionic]
  monsters:
    - Monsters with blinding attacks
  traps:
    - Flash traps
    - Darkness traps

cure_methods:
  spells:
    - MADI (Cure): "Fully heals one character, cures anything less than death" [Level 6 Priest]
    - Light spells may help (MILWA, LOMILWA)
  natural:
    - Wears off after several rounds
  temple:
    - Not offered (wears off naturally)

visual_indicator: "Blinded" status display, dimmed character portrait

source: Wizardry Wiki, Status Effects
confirmed: partial (Wizardry series, WG4 specifics unconfirmed)
implementation_notes: |
  Blind reduces accuracy but doesn't prevent action.
  May miss or attack wrong target.
  Exploration penalties important for dungeon navigation.
```

### Confused
```yaml
name: Confused
aliases: [Confusion, Dazed]
status_type: temporary
severity: moderate-high
description: Character's mind is scrambled, causing random or hostile actions

effects:
  combat:
    - May attack random target (ally or enemy)
    - May do nothing (skip turn)
    - Cannot be controlled by player
    - Actions are randomized each turn
  exploration:
    - May move in random directions
    - Cannot be relied upon

duration:
  base: 1-8 rounds (combat)
  recovery_chance: Variable per round

inflicted_by:
  spells:
    - MENTAL (Confusion): "Confuses single enemy" [Level 1 Psionic]
  monsters:
    - Monsters with confusion attacks
  traps:
    - Confusion gas traps

cure_methods:
  spells:
    - REILIS: "Cures fear, charm, and confusion" [Level 23+ Priest]
    - MADI (Cure): "Fully heals one character, cures anything less than death" [Level 6 Priest]
  natural:
    - Wears off after several rounds
  temple:
    - Not offered (wears off naturally)

visual_indicator: "Confused" status display, question marks or swirls

source: Wizardry Wiki, Wizardry Variants Daphne
confirmed: partial (mechanics vary between Wizardry versions)
implementation_notes: |
  Confusion mechanics:
  - Random target selection each turn
  - Can hit allies or enemies
  - Player loses control of character
  - Different from charm (which switches sides completely)
```

### Feared
```yaml
name: Feared
aliases: [Fear, Afraid, Panic]
status_type: temporary
severity: moderate
description: Character is overcome with fear and may flee or cower

effects:
  combat:
    - May flee from battle (attempt to run)
    - May cower and skip turn (20% chance per round)
    - Weakened defense
    - May miss turns due to fear
  exploration:
    - Loses 1 MP per turn
    - Loses 1 MP every 2 tiles traversed
    - May refuse to enter certain areas

duration:
  base: Until cured or battle ends
  recovery_chance: Variable per round

inflicted_by:
  spells:
    - DILITO (Fear): "Causes fear in enemies" [Level 2 Mage]
    - MORLIS (Panic/Fear): "Cause a group of enemies to fear the party" [Level 4 Mage]
    - MAMORLIS (Curse): "Cause all enemies to fear the party" [Level 5 Mage]
  monsters:
    - Monsters with fear auras
    - High-level demons and undead

cure_methods:
  spells:
    - REILIS: "Cures fear, charm, and confusion" [Level 23+ Priest]
    - MADI (Cure): "Fully heals one character, cures anything less than death" [Level 6 Priest]
  items:
    - Calmative items
  natural:
    - Wears off after battle or several rounds
  temple:
    - Not offered (wears off naturally)

visual_indicator: "Feared" status display, character shaking or cowering

source: Wizardry Wiki, Wizardry Variants Daphne, Data Driven Gamer
confirmed: true (Wizardry series), partial (WG4 specific mechanics)
implementation_notes: |
  Fear has both combat and exploration effects.
  MP drain during exploration is notable resource drain.
  May cause characters to flee battle entirely.
```

### Charmed
```yaml
name: Charmed
aliases: [Charm, Possessed]
status_type: temporary
severity: high
description: Character is under enemy control and fights for the other side

effects:
  combat:
    - Fights for enemy side
    - Attacks own party members
    - Uses abilities against former allies
    - Player loses all control
  exploration:
    - May act against party interests
    - Unreliable for tasks

duration:
  base: Until cured or battle ends
  recovery_chance: Low per round

inflicted_by:
  monsters:
    - Succubi
    - Mind flayers
    - Demons with charm abilities
  spells:
    - Charm spells (if available)

cure_methods:
  spells:
    - REILIS: "Cures fear, charm, and confusion" [Level 23+ Priest]
    - MADI (Cure): "Fully heals one character, cures anything less than death" [Level 6 Priest]
  natural:
    - Low chance to break free each round
  temple:
    - Not offered (wears off after battle)

visual_indicator: "Charmed" status display, heart or magical aura

source: Wizardry Wiki
confirmed: partial (Wizardry series, WG4 specifics unconfirmed)
implementation_notes: |
  Charm effectively removes character from player's party temporarily.
  Character fights for enemy with full abilities.
  More severe than confusion (not random - deliberately hostile).
```

---

## Permanent Death States

### Dead
```yaml
name: Dead
aliases: [Death, Died, Deceased]
status_type: permanent
severity: critical
description: Character has died and requires resurrection

effects:
  combat:
    - Cannot take any actions
    - Effectively removed from combat
    - Does not receive experience or treasure
  exploration:
    - Cannot move or interact
    - Remains in party as corpse
    - Must be carried by living party members

duration:
  base: Permanent until resurrected or becomes Ashed

progression:
  next_state: Ashed (on failed resurrection)
  vitality_loss: -1 Vitality on successful resurrection

inflicted_by:
  combat:
    - HP reduced to 0 or below
    - Instant death spells
    - Massive damage
  traps:
    - Lethal traps
  events:
    - Story events causing death

cure_methods:
  spells:
    - DI spell (lower level resurrection - unconfirmed for WG4)
    - KADORTO (Resurrection): "Raises character from ashes or dead" [Level 7 Priest]
      - Success rate: (4 × Vitality)%
      - Restores to full HP
      - Permanent -1 Vitality loss
  temple:
    - Resurrect from Dead service: 500 gold (estimated)
    - Success rate: (Vitality × 3%) + 50%
    - On success: Returns to life with 1 HP, -1 Vitality
    - On failure: Character turns to Ashed

visual_indicator: "Dead" status display, red highlighting, skull icon

source: Temple Requirements Doc, Wizardry I-IV Spells, Temple Mechanics Doc
confirmed: true
implementation_notes: |
  Dead state progression:
  - OK → Dead (from combat death)
  - Dead → Ashed (from failed resurrection)
  - Each resurrection reduces Vitality permanently
  - If Vitality drops below 3, character becomes Lost
```

### Ashed
```yaml
name: Ashed
aliases: [Ashes, Ash, Destroyed]
status_type: permanent
severity: critical-extreme
description: Character has been completely destroyed and reduced to ashes

effects:
  combat:
    - Cannot take any actions
    - Completely removed from combat
    - Does not receive experience or treasure
  exploration:
    - Cannot move or interact
    - Remains in party as pile of ashes
    - Extremely difficult to resurrect

duration:
  base: Permanent until resurrected or becomes Lost

progression:
  next_state: Lost (on failed resurrection)
  vitality_loss: -1 Vitality on successful resurrection

inflicted_by:
  resurrection:
    - Failed resurrection from Dead status
  combat:
    - Certain extremely powerful attacks
    - Disintegration spells
  events:
    - Catastrophic failures

cure_methods:
  spells:
    - KADORTO (Resurrection): "Raises character from ashes" [Level 7 Priest]
      - Success rate: (4 × Vitality)%
      - Restores to full HP
      - Permanent -1 Vitality loss
  temple:
    - Resurrect from Ashes service: 1000 gold (estimated)
    - Success rate: (Vitality × 3%) + 40%
    - On success: Returns to life with full HP, -1 Vitality
    - On failure: Character is LOST forever (permanent deletion)

visual_indicator: "Ashed" status display, dark red highlighting

source: Temple Requirements Doc, Wizardry I-IV Spells
confirmed: true
implementation_notes: |
  Ashed is high-risk state:
  - Lower resurrection success rate than Dead
  - Failure means permanent character loss (Lost)
  - Only divine intervention (KADORTO or temple) can help
  - Very expensive temple service
  - Vitality loss means each death weakens character
```

### Lost
```yaml
name: Lost
aliases: [Gone, Permanently Dead]
status_type: permanent
severity: absolute
description: Character is permanently and irrevocably lost - cannot be recovered

effects:
  all_contexts:
    - Character is completely removed from game
    - Cannot be resurrected by any means
    - All items and equipment are lost
    - Character file is deleted/removed from roster

duration:
  base: Permanent - no recovery possible

inflicted_by:
  resurrection:
    - Failed resurrection from Ashed status
  vitality:
    - Vitality drops below 3 (from repeated resurrections)
  events:
    - Certain catastrophic story events (rare)

cure_methods:
  - None - this is permanent character deletion

visual_indicator: Character removed from party/roster entirely

source: Temple Requirements Doc, Temple Mechanics Doc, Tavern Mechanics Doc
confirmed: true
implementation_notes: |
  Lost is the final state - no recovery:
  - Character is permanently deleted
  - Cannot be added back to party
  - Serves as ultimate consequence for death
  - Vitality degradation system leads here:
    - Each resurrection: -1 Vitality
    - If Vitality < 3: Character becomes Lost
  - Risk progression: OK → Dead → Ashed → Lost
```

---

## Special Conditions

### Cursed
```yaml
name: Cursed
aliases: [Curse]
status_type: special
severity: varies
description: Character has cursed items equipped that cannot be removed normally

effects:
  equipment:
    - Cursed items cannot be unequipped normally
    - Cursed items may have negative stat modifiers
    - May have enchantment penalties (-1, -2, etc.)
  combat:
    - Varies by cursed item
    - May reduce stats (ST, IQ, AG, etc.)
    - May reduce AC effectiveness
  exploration:
    - Cursed items remain equipped
    - Inventory slot occupied

duration:
  base: Permanent until curse is removed

inflicted_by:
  items:
    - Equipping unidentified cursed items
    - Cursed weapons (various)
    - Cursed armor (Cursed Plate, Cursed Robe, Cursed Breast)
  spells:
    - Curse spells (if available)

cure_methods:
  spells:
    - ZILFIS/ZILFE (Uncurse): "Destroys one equipped cursed item" [Level 7 Bishop]
  temple:
    - Dispel Curse service: 250 gold per cursed item (estimated)
    - Success rate: 100%
    - Effect: Removes curse, allows unequipping
    - Note: Does not identify items

visual_indicator: Purple indicator on character, cursed items marked in inventory

source: Temple Requirements Doc, Wizardry Wiki, WG4 Items Documentation
confirmed: true
implementation_notes: |
  Cursed items found in WG4:
  - Various cursed weapons with negative stat requirements
  - Cursed Plate (armor)
  - Cursed Robe
  - Cursed Breast (armor)

  Curse mechanics:
  - Items auto-equip and cannot be removed
  - Usually have negative effects (stat penalties, worse AC)
  - Must be identified or removed via temple/spell
  - Bishop's ZILFIS destroys the item (not just uncurses)
```

### Level Drained
```yaml
name: Level Drained
aliases: [Level Drain, Energy Drain, Negative Levels]
status_type: special
severity: extreme
description: Character has lost one or more experience levels

effects:
  character:
    - Level reduced by 1 or more
    - HP reduced (loses hit dice from lost level)
    - Experience set to minimum for new level
    - Lost level must be regained through normal advancement
  combat:
    - Reduced combat effectiveness
    - May lose access to high-level spells
    - Reduced stats from level loss
  permanent:
    - In WG4 heavy mode, level loss is saved
    - XP loss may not be saved (character keeps higher XP in some versions)
    - HP loss is permanent until level regained

duration:
  base: Permanent until level is regained through normal XP gain

inflicted_by:
  monsters:
    - Undead creatures (vampires, wraiths, spectres)
    - High-level undead with energy drain attacks
  traps:
    - Rare level drain traps

cure_methods:
  restoration:
    - Must regain lost level through normal XP advancement
    - Restoration spells may exist but are unconfirmed for WG4
  prevention:
    - Avoid undead with energy drain
    - High luck may reduce chance

visual_indicator: Level number decreased, possibly special "Drained" indicator

source: GameFAQs WG4 Forum, Wizardry Wiki, Steam Community Discussions
confirmed: true (Wizardry series), partial (WG4 mechanics)
implementation_notes: |
  Level drain mechanics:
  - When drained during combat: level decreases immediately
  - HP decreases proportionally
  - After battle: XP set to minimum for new level
  - In WG4 heavy mode: level loss is auto-saved
  - Character must re-earn lost level
  - Can lose all bonus HP from previous class on single drain
  - Very punishing - one of most severe non-death effects
  - 1/20 chance to be hit by undead attacks
```

### Diseased
```yaml
name: Diseased
aliases: [Disease, Plague, Illness]
status_type: special
severity: high
description: Character is afflicted with disease that causes ongoing degradation

effects:
  combat:
    - Random chance of negative conditions each round
    - May randomly lose stat points (-1 to attributes)
    - May lose HP randomly
  exploration:
    - Each 10 minutes of travel: chance of condition or stat loss
    - HP and stamina won't recharge while resting
    - Additional status effects can stack
  permanent:
    - Can cause permanent maximum HP loss
    - Disease never goes away on its own

duration:
  base: Permanent until cured

inflicted_by:
  monsters:
    - Disease-carrying monsters (rats, plague bearers)
  traps:
    - Disease traps
  areas:
    - Diseased/plague areas in dungeon

cure_methods:
  spells:
    - Cure Disease spell (level/name unconfirmed for WG4)
    - May require multiple castings if advanced (3 casts at low power, 1 at high power)
    - MADI may cure (unconfirmed)
  items:
    - Cure Disease potions
  temple:
    - Temple services (unconfirmed availability)

resistance:
  - Water resistance may apply to weapon-sourced disease

visual_indicator: Rat icon or similar disease marker

source: Wizardry 7 Documentation, Wizardry 8 Mechanics
confirmed: partial (Wizardry 7/8, WG4 specifics unconfirmed)
implementation_notes: |
  Disease is progressive and severe:
  - Never goes away without intervention
  - Can cause permanent stat/HP loss
  - Prevents rest recovery
  - Stacks with other conditions
  - Similar to poison but more severe and permanent
  - May not be implemented in WG4
```

### Nauseated
```yaml
name: Nauseated
aliases: [Nausea, Sickness]
status_type: special
severity: moderate
description: Character feels sick and may be unable to act

effects:
  combat:
    - 25% chance per round to gag helplessly (lose turn)
    - -25% miss chance (increased miss rate)
    - -4 evasion AC
    - Can still defend but not as effectively
  exploration:
    - May randomly skip actions
    - Reduced effectiveness

duration:
  base: Temporary - wears off after several rounds or rest

inflicted_by:
  monsters:
    - Monsters with nausea attacks
  traps:
    - Gas traps causing nausea
  items:
    - Spoiled food or potions

cure_methods:
  spells:
    - Cure Lesser Condition spell
  natural:
    - Wears off after rest or several rounds
  items:
    - Anti-nausea items

resistance:
  - Water resistance may apply to weapon-sourced nausea

visual_indicator: Rat icon (similar to disease), green coloring

source: Wizardry 8 Mechanics
confirmed: partial (Wizardry 8, WG4 unconfirmed)
implementation_notes: |
  Nausea vs Disease:
  - Similar icons but different effects
  - Nausea wears off naturally, disease doesn't
  - Nausea reduces combat effectiveness without permanent damage
  - Less severe than disease
  - May not be implemented in WG4
```

### Insanity
```yaml
name: Insanity
aliases: [Insane, Madness]
status_type: special
severity: extreme
description: Character's mind is completely broken, causing chaotic behavior

effects:
  combat:
    - All control is lost
    - 16% chance per round to babble and foam at mouth (skip turn)
    - 16% chance to dance wildly (skip turn)
    - 16% chance to laugh hysterically (skip turn)
    - 12% chance to run amok (attack random target, possibly ally)
    - Cannot cast spells
  exploration:
    - Completely unreliable
    - May act randomly

duration:
  base: Until cured (does not wear off naturally)

inflicted_by:
  monsters:
    - Mind flayers
    - Eldritch horrors
    - High-level psychic enemies
  spells:
    - Insanity-inflicting spells
  events:
    - Seeing horrific sights (Lovecraftian influence)

cure_methods:
  spells:
    - High-level restoration spells
    - MADI may cure (unconfirmed)
  temple:
    - Temple services (unconfirmed)

visual_indicator: Spiral or chaotic pattern, character acting erratically

source: Wizardry 7/8 Documentation, Illnesses Guide
confirmed: partial (Wizardry 7/8, WG4 unconfirmed)
implementation_notes: |
  Insanity is severe mental status:
  - More extreme than confusion
  - Specific behavior percentages
  - Cannot cast spells (like silence but more severe)
  - May attack allies (like charm but random)
  - Requires specific cure
  - May not be implemented in WG4
```

### Spell-Binding
```yaml
name: Spell-Binding
aliases: [Spell Binding, Spell Bound]
status_type: special
severity: moderate
description: Character cannot cast spells except via scrolls or recovery items

effects:
  combat:
    - Cannot cast spells directly
    - Can use spell scrolls
    - Can use recovery items
    - Physical combat unaffected
  exploration:
    - Cannot cast utility spells
    - Scrolls and items still work

duration:
  base: Until cured

inflicted_by:
  monsters:
    - Monsters with spell-binding attacks
  spells:
    - Spell-binding effects

cure_methods:
  spells:
    - KUSFIS: "Cures spell-binding" [Level 27+ Priest, Wizardry Variants Daphne]
  items:
    - Recovery items

visual_indicator: Spell-bound indicator, possibly chains or locks

source: Wizardry Wiki, Wizardry Variants Daphne
confirmed: partial (Wizardry Variants Daphne, WG4 unconfirmed)
implementation_notes: |
  Spell-binding is like silence but allows scrolls.
  Different from silence - more specific restriction.
  May not be distinct from silence in WG4.
```

### Skill-Binding
```yaml
name: Skill-Binding
aliases: [Skill Binding, Skill Bound]
status_type: special
severity: moderate
description: Character cannot use special skills or abilities

effects:
  combat:
    - Cannot use class-specific skills
    - Cannot use special abilities
    - Physical combat unaffected
    - Spell casting unaffected (unless also spell-bound)
  exploration:
    - Cannot use exploration skills
    - Cannot use special abilities

duration:
  base: Until cured

inflicted_by:
  monsters:
    - Monsters with skill-binding attacks
  spells:
    - Skill-binding effects

cure_methods:
  spells:
    - KUSFIS: "Cures skill-binding" [Level 27+ Priest, Wizardry Variants Daphne]
  items:
    - Recovery items

visual_indicator: Skill-bound indicator

source: Wizardry Wiki, Wizardry Variants Daphne
confirmed: partial (Wizardry Variants Daphne, WG4 unconfirmed)
implementation_notes: |
  Skill-binding prevents special abilities.
  May not be implemented in WG4 if skills system differs.
  Less common than spell-binding.
```

---

## Racial Resistances

```yaml
racial_resistances:
  Elf:
    - Sleep resistance

  Dwarf:
    - Poison resistance (partial)

  Hobbit:
    - Special attacks resistance (may include paralysis, stone, etc.)

  Dracon:
    - Special attacks resistance (may include paralysis, stone, etc.)

  Rawulf:
    - Cold resistance

  Mook:
    - Cold resistance

  Felpurr:
    - Cold resistance

source: GameFAQs WG4 Guide, Wizardry Gaiden Documentation
confirmed: true (WG4)
```

Racial resistances provide natural protection against certain status effects. Elves are notably resistant to sleep effects, while Dwarves have some protection against poison. Hobbits and Dracons resist "special attacks," which may include paralysis and petrification, though exact mechanics are unclear. The cold resistances of Rawulf, Mook, and Felpurr protect against cold-based damage rather than status effects.

---

## Spell Cross-Reference

### Cure Spells

```yaml
cure_spells:
  basic_healing:
    - name: DIOS (Heal)
      level: 1
      school: Priest
      effect: Restores 1-8 HP to single ally
      cures: []

    - name: DIAL (Heal 2)
      level: 3
      school: Priest
      effect: Restores 2-16 HP to single ally
      cures: []

  status_cures:
    - name: DIALKO (Soft)
      level: 3
      school: Priest
      effect: Cures paralysis, silence, and sleep of one character
      cures: [Paralyzed, Silenced, Sleeping]

    - name: LATUMOFIS (Detoxify)
      level: 4
      school: Priest
      effect: Cures poison of one character
      cures: [Poisoned]

    - name: ANTLE (Antidote)
      level: 1
      school: Alchemist
      effect: Cures poison on single ally
      cures: [Poisoned]

    - name: PALNTE (Group Antidote)
      level: 3
      school: Alchemist
      effect: Cures poison for entire party
      cures: [Poisoned]

    - name: REILIS
      level: 23+
      school: Priest
      effect: Cures fear, charm, and confusion
      cures: [Feared, Charmed, Confused]
      source: Wizardry Variants Daphne

    - name: KUSFIS
      level: 27+
      school: Priest
      effect: Cures spell-binding and skill-binding
      cures: [Spell-Binding, Skill-Binding]
      source: Wizardry Variants Daphne

  powerful_cures:
    - name: MADI (Cure)
      level: 6
      school: Priest
      effect: Fully heals one character, cures anything less than death
      cures: [Sleeping, Poisoned, Paralyzed, Stoned, Silenced, Blinded, Confused, Feared, Charmed, Diseased, Nauseated]

    - name: LABADI (Life Steal)
      level: 6
      school: Priest
      effect: Like MABADI, transfers hit points to caster
      cures: []
      note: Offensive spell with healing side effect

  resurrection:
    - name: KADORTO (Resurrection)
      level: 7
      school: Priest
      effect: Raises character from ashes or dead
      cures: [Dead, Ashed]
      success_rate: (4 × Vitality)%
      side_effects: -1 Vitality permanently

  uncurse:
    - name: ZILFIS / ZILFE (Uncurse)
      level: 7
      school: Bishop
      effect: Destroys one equipped cursed item
      cures: [Cursed]
      note: Destroys item completely

    - name: ZILWAN (Dispel)
      level: 6
      school: Alchemist
      effect: Instantly destroys one Undead monster
      cures: []
      note: Combat spell, not status cure
```

### Inflict Spells

```yaml
inflict_spells:
  sleep:
    - name: KATINO (Sleep)
      level: 1
      school: Mage
      effect: Puts 1-3 enemies to sleep
      inflicts: Sleeping

  paralysis:
    - name: MANIFO
      level: 2
      school: Priest
      effect: Paralyze 1 group of monsters
      inflicts: Paralyzed

  silence:
    - name: MONTINO (Seal/Silence)
      level: 2
      school: Priest
      effect: Silences each monster in a group
      inflicts: Silenced
      resistance: (Target Level × 10%) chance to resist
      recovery: (Target Level × 20%) per round, max 50%

    - name: BACORTU (Silence Field)
      level: 5
      school: Mage
      effect: Creates unresistable fizzle field preventing spells
      inflicts: Silenced
      note: Cannot be resisted, unlike MONTINO

  petrification:
    - name: BOLATU (Rock)
      level: 2
      school: Mage
      effect: Petrifies one enemy
      inflicts: Stoned
      source: Wizardry 5

    - name: ROKDO (Petri)
      level: 4
      school: Mage
      effect: Petrify a group of enemies
      inflicts: Stoned
      source: Wizardry 5

  fear:
    - name: DILITO (Fear)
      level: 2
      school: Mage
      effect: Causes fear in enemies
      inflicts: Feared

    - name: MORLIS (Panic/Fear)
      level: 4
      school: Mage
      effect: Cause a group of enemies to fear the party
      inflicts: Feared

    - name: MAMORLIS (Curse)
      level: 5
      school: Mage
      effect: Cause all enemies to fear the party
      inflicts: Feared

  poison:
    - name: VENAT (Poison Dart)
      level: 1
      school: Alchemist
      effect: 1-6 damage + poison to single enemy
      inflicts: Poisoned

  confusion:
    - name: MENTAL (Confusion)
      level: 1
      school: Psionic
      effect: Confuses single enemy
      inflicts: Confused

  blindness:
    - name: DILTO (Darkness)
      level: 2
      school: Psionic
      effect: Blinds enemy group
      inflicts: Blinded
```

---

## Temple Services

Temple of Cant provides the following status-related services:

```yaml
temple_services:
  cure_paralyzed:
    cost: 300 gold
    success_rate: 100%
    cures: Paralyzed

  cure_stoned:
    cost: 300 gold
    success_rate: 100%
    cures: Stoned
    alternative_formula: 200 gold per character level

  resurrect_from_dead:
    cost: 500 gold (estimated)
    success_rate: (Vitality × 3%) + 50%
    cures: Dead
    on_success:
      - Returns to life with 1 HP
      - Vitality permanently reduced by 1
    on_failure:
      - Character turns to Ashed
    requirements:
      - Character must have Dead status

  resurrect_from_ashes:
    cost: 1000 gold (estimated)
    success_rate: (Vitality × 3%) + 40%
    cures: Ashed
    on_success:
      - Returns to life with full HP
      - Vitality permanently reduced by 1
    on_failure:
      - Character is LOST forever (permanent deletion)
    requirements:
      - Character must have Ashed status

  dispel_curse:
    cost: 250 gold per cursed item (estimated)
    success_rate: 100%
    cures: Cursed
    effect: Removes curse from equipped items, allowing them to be unequipped
    note: Does not identify items - only removes curse

payment_notes:
  - Gold deducted BEFORE service (no refunds on failure)
  - Dead/Ashed characters cannot pay (must use party pooled gold)
  - Deduct from pooled gold first, then character's individual gold

source: Temple Requirements Doc, Temple Mechanics Doc
```

---

## Implementation Guidelines

### Status Effect Priority

When multiple status effects are present, implement the following priority for display and effect resolution:

```yaml
priority_order:
  1_most_severe: Lost (character removed)
  2_critical: [Ashed, Dead]
  3_incapacitating: [Stoned, Paralyzed]
  4_debilitating: [Sleeping, Insanity, Charmed]
  5_hindering: [Confused, Feared, Silenced]
  6_damaging: [Poisoned, Diseased, Level Drained]
  7_minor: [Blinded, Nauseated, Spell-Binding, Skill-Binding]
  8_equipment: Cursed
  9_normal: OK
```

### Visual Indicators

```yaml
visual_indicators:
  OK: No indicator (default)
  Sleeping: "Sleeping" text, character with closed eyes, blue tint
  Poisoned: "Poisoned" text, green tint or dripping poison
  Paralyzed: "Paralyzed" text, yellow highlighting, frozen pose
  Stoned: "Stoned" text, gray highlighting or stone texture
  Silenced: "Silenced" text, X over mouth or sealed lips
  Blinded: "Blinded" text, dimmed portrait or darkness
  Confused: "Confused" text, question marks or swirls
  Feared: "Feared" text, character cowering or shaking
  Charmed: "Charmed" text, hearts or magical aura
  Dead: "Dead" text, red highlighting, skull icon
  Ashed: "Ashed" text, dark red highlighting, ash pile
  Lost: Character removed from display
  Cursed: Purple indicator on character, cursed items marked
  Level Drained: Level decreased, possibly "Drained" text
  Diseased: Rat icon or disease marker
  Nauseated: Green coloring, sickness indicator
  Insanity: Spiral or chaotic pattern
```

### Stacking Rules

```yaml
stacking_rules:
  exclusive_states:
    - Only one death state: [OK, Dead, Ashed, Lost]
    - Sleep and Paralysis don't stack (Paralysis takes priority)

  stackable_conditions:
    - Poison can stack with other conditions
    - Cursed can stack with any combat condition
    - Level Drain can stack with other conditions
    - Disease can stack and worsen other conditions

  override_behavior:
    - Death overrides all temporary conditions
    - Paralysis overrides Sleep
    - Stoned overrides most other conditions (effectively removed from combat)
```

### Duration Tracking

```yaml
duration_tracking:
  permanent_until_cured:
    - Paralyzed
    - Stoned
    - Silenced (in some cases)
    - Cursed
    - Dead
    - Ashed
    - Lost
    - Level Drained
    - Diseased

  temporary_with_duration:
    - Sleeping: 1-8 rounds
    - Poisoned: Until cured or exit dungeon
    - Confused: 1-8 rounds
    - Feared: Until cured or battle ends
    - Blinded: 1-8 rounds
    - Nauseated: Several rounds or until rest

  chance_based_recovery:
    - Sleeping: 20% per round + instant on damage
    - Silenced: (Level × 20%) per round, max 50%
    - Confused: Variable per round
    - Feared: Variable per round
```

---

## Monster Attacks and Status Effects

```yaml
monster_status_attacks:
  confirmed:
    - Okikusama:
        attack: Freezing palm
        damage: Low
        status: [Sleeping, Paralyzed]
        chance: High
        note: Low-level party cannot cure these effects

  common_monster_types:
    - Undead:
        likely_inflict: [Level Drain, Fear]
        examples: [Vampires, Wraiths, Spectres]

    - Poison_creatures:
        likely_inflict: [Poisoned]
        examples: [Giant Spiders, Snakes]

    - Mind_creatures:
        likely_inflict: [Confused, Charmed, Insanity]
        examples: [Mind Flayers, Succubi]

    - Stone_creatures:
        likely_inflict: [Stoned]
        examples: [Basilisks, Medusas, Gorgons]

source: GameFAQs WG4 Guide
```

---

## Dungeon Hazards

```yaml
trap_types:
  common_traps:
    - Sleep gas traps → Sleeping
    - Poison needle traps → Poisoned
    - Poison gas traps → Poisoned
    - Paralysis traps → Paralyzed
    - Flash traps → Blinded
    - Confusion gas traps → Confused

  rare_traps:
    - Level drain traps → Level Drained
    - Disease traps → Diseased
    - Petrification traps → Stoned

  environmental:
    - Fizzle fields → Silenced (prevents all magic)
    - Darkness zones → Blinded
    - Diseased/plague areas → Diseased

implementation_note: |
  Trap effects should respect:
  - Racial resistances
  - Character luck stat (for avoidance)
  - Thief disarm attempts
  - Detect magic/trap spells
```

---

## Items and Equipment

```yaml
status_related_items:
  weapons_with_status:
    - Poison Dagger:
        name: Assassin's Dagger
        item_id: 134
        status: Poisoned
        type: weapon

  cursed_weapons:
    - Various cursed weapons with negative stat requirements
    - Auto-equip and cannot be removed without uncurse

  cursed_armor:
    - Cursed Plate (item #235)
    - Cursed Robe (item #254)
    - Cursed Breast (item #265)

  consumables:
    - Antidote potions → Cures Poisoned
    - Cure Disease potions → Cures Diseased (unconfirmed)
    - Calmative items → Cures Feared
    - Recovery items → Various status cures

  special_items:
    - Life Stone (item #390) → May relate to resurrection
    - Spell scrolls → Allow spell casting when Silenced

source: WG4 Items Documentation
```

---

## Sources and References

```yaml
sources:
  primary:
    - Wizardry Wiki (wizardry.wiki.gg)
      url: https://wizardry.wiki.gg/wiki/Status_effects
      coverage: General Wizardry series status effects

    - GameFAQs Wizardry Gaiden IV Guide
      coverage: WG4-specific mechanics, monsters, racial resistances

    - GameFAQs Wizardry Gaiden I Walkthrough
      url: https://gamefaqs.gamespot.com/gameboy/569684-wizardry-gaiden-i-suffering-of-the-queen/faqs/68803
      coverage: Spell name translations, status effect mechanics

    - GameFAQs Wizardry Gaiden III Spell List
      coverage: Spell descriptions and status effects

  project_documentation:
    - docs/temple-requirements.md
      coverage: Temple services, resurrection mechanics, vitality degradation

    - docs/temple-mechanics.md
      coverage: Temple service costs and implementation

    - docs/wizardry_gaiden_4_spells.md
      coverage: Spell system and status-related spells

    - docs/wizardry_gaiden_4_items_*.md
      coverage: Cursed items, status-inflicting weapons

    - src/types/GameTypes.ts
      coverage: Currently implemented status types

  supplementary:
    - Wizardry I-IV Spells (Wizardry Wiki/Fandom)
      coverage: Classic spell effects and names

    - Wizardry Variants Daphne documentation
      coverage: Modern Wizardry mechanics (REILIS, KUSFIS)

    - Wizardry 7/8 documentation
      coverage: Disease, nausea, insanity mechanics
```

---

## Notes on Confirmation Status

```yaml
confirmation_levels:
  confirmed_for_wg4:
    - OK, Dead, Ashed, Lost (in current codebase)
    - Sleeping, Poisoned, Paralyzed, Stoned (in CharacterStatus type)
    - Racial resistances (Elf/sleep, Dwarf/poison, etc.)
    - Temple services and costs
    - Resurrection mechanics and vitality degradation
    - Cursed items system

  confirmed_for_wizardry_series:
    - Sleep, Paralysis, Poison, Stoned, Silence, Fear, Confusion, Charm
    - Spell names and effects (DIALKO, KATINO, MADI, etc.)
    - Level Drain mechanics
    - Basic combat and exploration effects

  partial_confirmation:
    - Petrification spells (BOLATU, ROKDO from Wizardry 5)
    - Disease and Nausea (from Wizardry 7/8)
    - Insanity (from Wizardry 7/8)
    - REILIS and KUSFIS (from Wizardry Variants Daphne)
    - Specific monster attacks (Okikusama confirmed, others inferred)

  unconfirmed_for_wg4:
    - Exact spell availability (which spells exist in WG4)
    - Spell-Binding and Skill-Binding (may not be distinct from Silence)
    - Disease system (may not be implemented)
    - Nausea system (may not be implemented)
    - Insanity (may not be implemented)
    - Specific trap types and dungeon hazards
    - Some cure spell details (exact MP costs, level requirements)
```

All status effects marked as "unconfirmed" should be verified against original WG4 game mechanics before full implementation. The documentation includes them for completeness and to support future feature development.
