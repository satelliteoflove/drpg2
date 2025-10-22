# TEMPORARY: Systems Integration Analysis

**Date**: 2025-10-16
**Status**: Working Document - For Context Maintenance
**Scope**: Magic, Equipment/Item, and Status Effect Systems

---

## Executive Summary

This document analyzes the integration, player experience, and quality of life aspects of three major game systems: magic, equipment/items, and status effects. The analysis identifies both strengths and opportunities for improvement.

**Key Findings:**
- Systems are well-architected but incompletely integrated
- Many spell effects remain unimplemented, reducing tactical depth
- Equipment system lacks player feedback and clarity
- Status effects and modifiers operate independently with no synergies
- Significant opportunities to improve player experience through better integration

---

## 1. Magic System Analysis

### Current State

**Strengths:**
- Comprehensive spell database (100+ spells across 4 schools)
- Type-safe spell ID system
- Well-structured effect types (damage, heal, status, buff, modifier, etc.)
- Fizzle mechanics and MP management
- Level-based spell progression

**Critical Issues:**

#### 1.1 Incomplete Implementation
**Location**: `SpellCaster.ts:226-305`

Many effect types show placeholder messages:
- "Status effect not yet implemented"
- "Buff effect not yet implemented"
- "Cure effect not yet implemented"
- "Instant death effect not yet implemented"
- "Resurrection effect not yet implemented"
- "Teleport effect not yet implemented"
- "Utility effect not yet implemented"
- "Dispel effect not yet implemented"
- "Special effect not yet implemented"

**Player Impact**: Players see spells in their spell list but they do nothing when cast. This is extremely frustrating and makes spellcasters feel underpowered.

#### 1.2 No Visual/Audio Feedback
**Issue**: Spell casting lacks impact. No visual effects, sound effects, or distinctive feedback.

**Player Impact**: Combat feels flat and unexciting. Players can't easily distinguish what's happening in combat.

#### 1.3 Limited Strategic Depth
**Issue**: Without working buff/debuff spells, combat becomes a damage race with no tactical options.

**Player Impact**: Optimal strategy is always "cast highest damage spell" - no interesting choices or counterplay.

#### 1.4 Poor Spell Discovery
**Issue**: Players don't know what spells are available or what they do until learned. No spell preview or description system in UI.

**Player Impact**: Players can't plan character builds or make informed decisions about class selection.

### Integration Issues

#### 1.5 Spell + Equipment Synergies Missing
**Issue**: No interaction between equipped items and spell power/MP costs/fizzle rates. Items with spell bonuses exist in code but aren't applied.

**Example**: A "Staff of Power" could reduce fizzle chance or boost damage, but these mechanics aren't connected.

#### 1.6 Spell + Status Effects Disconnected
**Issue**: Spells can theoretically apply status effects, but the implementation is incomplete. Many status-applying spells don't actually apply their effects.

**Location**: `SpellDatabase.ts` shows spells with `statusType` in effects, but `SpellCaster.ts:226-233` shows status effects aren't processed.

---

## 2. Equipment/Item System Analysis

### Current State

**Strengths:**
- Class and alignment restrictions work correctly
- Cursed items cannot be unequipped (authentic Wizardry mechanic)
- Rarity system with enchantment levels
- Luck-based loot drops
- Weight and encumbrance system

**Critical Issues:**

#### 2.1 Unidentified Items Are Confusing
**Issue**: Players see "?Sword", "?Armor" with no hints about what they might be. Identification is Bishop-only with high failure rates.

**Player Impact**:
- Non-Bishop parties accumulate useless unidentified items
- Players afraid to equip unidentified items due to curse risk
- No meaningful risk/reward decision - just frustration

**Suggestion**: Add contextual hints (weight, visual description, "feels magical") to help players make informed decisions.

#### 2.2 Cursed Item Mechanics Are Opaque
**Location**: `InventorySystem.ts:148-151`

**Issue**: When you equip a cursed item, it auto-identifies but you're stuck with it. Players don't understand:
- How to remove curses
- Why they can't unequip
- What the curse penalty actually does

**Player Impact**: Feels like a gotcha mechanic rather than an interesting risk.

#### 2.3 No Item Comparison
**Issue**: When deciding whether to equip an item, players can't compare:
- Current AC vs new AC
- Current damage vs new damage
- Net stat changes

**Player Impact**: Players do mental math or avoid equipment changes entirely.

#### 2.4 Equipment Effects Not Integrated With Combat
**Location**: `InventorySystem.ts:199-217`, `CombatSystem.ts:339-361`

**Issue**: Equipment effects are partially implemented:
- Weapon damage works in combat
- AC bonuses work
- But special effects (stat bonuses, elemental damage, on-hit effects) don't apply to combat calculations

**Example**: "Ring of Healing" has a spell invocation but no way to invoke it in combat UI.

#### 2.5 Consumables Are Underutilized
**Issue**: Potions and scrolls exist but:
- No quick-use in combat
- Unclear when to use them
- No meaningful strategic role

**Player Impact**: Players hoard consumables and never use them (classic RPG problem).

### Integration Issues

#### 2.6 Items Don't Affect Spell Casting
**Issue**: Items with `spellId` field (invokable items) aren't integrated with the spell system. You can't cast spells from items.

**Location**: `InventorySystem.ts:219-271` (useItem method) vs `SpellCaster.ts`

#### 2.7 No Item + Status Effect Interactions
**Issue**: Equipment that grants status resistance exists conceptually but isn't connected to StatusEffectSystem.

**Example**: A "Ring of Poison Resistance" should modify `RACIAL_RESISTANCES` dynamically, but this doesn't happen.

---

## 3. Status Effect System Analysis

### Current State

**Strengths:**
- Clean implementation with tick system
- Racial resistances work correctly
- Exclusive status groups prevent conflicts (can't be dead AND sleeping)
- Duration tracking works for both combat and exploration
- Integration with ModifierSystem for stat changes

**Critical Issues:**

#### 3.1 Limited Status Effect Variety
**Current statuses**: OK, Dead, Ashed, Lost, Paralyzed, Stoned, Poisoned, Sleeping

**Missing common effects**:
- Blinded (mentioned in spell types but not implemented)
- Silenced (spell type exists but not as status)
- Confused (spell type exists but not as status)
- Cursed (as a character status, not just item)
- Blessed
- Charmed
- Berserk
- Afraid

**Player Impact**: Tactical combat is shallow without these effects. No crowd control, no support roles.

#### 3.2 Status Effects Are Binary
**Issue**: Effects are either active or not - no stacking, no intensity, no partial resistance.

**Contrast with ModifierSystem**: Modifiers can stack and have power levels, but status effects don't.

**Player Impact**:
- Applying the same debuff multiple times does nothing
- No reward for building around status effects
- No counterplay beyond "hope for resist"

#### 3.3 No Visual Indicators
**Issue**: Players can't easily see what status effects are active on characters/monsters.

**Player Impact**: Combat state is invisible - players don't know who's poisoned, who's buffed, when effects will expire.

#### 3.4 Status + Equipment Synergies Missing
**Issue**: No equipment that grants status immunity or enhanced resistance. Equipment system and status system don't communicate.

### Integration Issues

#### 3.5 ModifierSystem and StatusEffectSystem Are Parallel
**Location**: Both systems exist, both tick independently, but they don't interact.

**Issue**:
- A "poisoned" status should maybe reduce stats (modifier)
- A "blessed" buff should maybe grant resistance to status effects
- These cross-system effects aren't possible with current architecture

**Technical Note**: Both use similar patterns (turnsRemaining, source, power) but don't share infrastructure.

#### 3.6 Spell Effects Don't Apply Status Effects Reliably
**Issue**: Spells define status effects in their data, but the application logic is incomplete.

**Location**:
- `SpellTypes.ts:88-114` defines status/buff in effect types
- `SpellDatabase.ts` has many spells with statusType/buffType
- `SpellCaster.ts:226-233` shows status processing is stubbed out

---

## 4. Cross-System Integration Analysis

### 4.1 Magic → Status Effects
**Current**: Incomplete
**Issue**: Many spells should apply status effects but don't
**Priority**: HIGH - This is core gameplay

**Examples**:
- `m1_sleep` (KATINO) should apply Sleeping status
- `p2_silence` (MONTINO) should apply Silenced status
- `m3_confuse` (KANTIOS) should apply Confused status
- Buff spells should create modifiers

### 4.2 Magic → Equipment
**Current**: Non-existent
**Issue**: No item-based spell bonuses, no spell casting from items
**Priority**: MEDIUM - Nice to have but not critical

**Opportunities**:
- Equipment that reduces MP cost
- Equipment that reduces fizzle chance
- Equipment that boosts spell damage
- Invokable items (rings, wands) that cast spells

### 4.3 Equipment → Status Effects
**Current**: Non-existent
**Issue**: No equipment-granted resistances or status immunities
**Priority**: MEDIUM - Adds tactical depth

**Opportunities**:
- Poison-immune armor
- Petrification-resistant shields
- Equipment that grants regeneration (ongoing status effect)

### 4.4 Status Effects → Equipment
**Current**: Minimal
**Issue**: Status effects don't affect equipment usage
**Priority**: LOW - Edge case

**Opportunities**:
- Paralyzed characters can't change equipment
- Confused characters might unequip items randomly

### 4.5 Combat System Integration
**Current**: Partial
**Issues**:
- Status effects tick in combat correctly
- Modifiers apply to combat calculations (effectiveAC, effectiveAttack)
- But equipment special effects don't apply
- And spell-based buffs don't work

---

## 5. Player Experience Issues

### 5.1 Lack of Transparency

**Problem**: Players can't see:
- Active status effects on units
- Buff/debuff durations
- Equipment stat comparisons
- Resistance chances
- What spells actually do before learning them

**Impact**: Players make blind decisions and feel frustrated when things don't work as expected.

### 5.2 Underpowered Spellcasters

**Problem**: With incomplete spell implementations:
- Mages can only deal damage (limiting tactical options)
- Priests can only heal (no buffs/protection)
- Alchemists are essentially non-functional
- Psionics are non-functional

**Impact**: Fighters are objectively superior. No reason to play caster classes.

### 5.3 Meaningless Loot

**Problem**:
- Unidentified items are scary, not exciting
- No item comparison makes upgrades unclear
- Special item properties don't work

**Impact**: Players ignore loot system, just equip highest AC/damage.

### 5.4 Shallow Combat

**Problem**: Without working status effects, buffs, and debuffs:
- Every combat is "attack until they're dead"
- No crowd control
- No support roles
- No counterplay

**Impact**: Combat is repetitive and boring after a few encounters.

### 5.5 Information Overload Without Context

**Problem**: 100+ spells exist, but:
- No in-game reference
- Can't preview before learning
- Names are cryptic (original Japanese romanization)
- Descriptions are technical, not player-friendly

**Impact**: Players confused about character builds and spell choices.

---

## 6. Technical Debt Assessment

### Architecture Strengths
- Clean separation of concerns (systems are modular)
- Type-safe throughout
- Good use of singleton patterns
- Consistent debug logging

### Architecture Weaknesses

#### 6.1 Systems Don't Communicate
**Issue**: Each system is an island. Cross-system effects require awkward bridging code.

**Example**: To make a spell apply a status effect that creates a modifier, you need to:
1. Process spell effect in SpellCaster
2. Call StatusEffectSystem.applyStatusEffect
3. Have StatusEffectSystem internally create a modifier
4. Call ModifierSystem.applyModifier

This isn't DRY and creates tight coupling.

#### 6.2 Effect Processing Is Scattered
**Issue**: Effect types are defined in one place, processed in multiple places with inconsistent implementations.

**Locations**:
- `SpellTypes.ts` defines effect types
- `SpellCaster.ts` has legacy processing
- `SpellEffectRegistry.ts` has new processing
- Some effects like StatusEffect and ModifierEffect have dedicated processors
- Others don't

**Result**: Confusion about where to implement new effects, duplication of logic.

#### 6.3 Character Has Too Many Responsibilities
**Location**: `Character.ts` has 519 lines handling:
- Stat management
- Equipment
- Inventory
- Spells
- Status effects
- Level progression
- Combat stats (effectiveAC, effectiveAttack)

**Issue**: Violates Single Responsibility Principle. Hard to test, hard to extend.

---

## 7. Recommended Improvements (Prioritized)

### Phase 1: Core Functionality (HIGH PRIORITY)
**Goal**: Make existing features work as players expect

#### 7.1 Complete Spell Effect Implementation
**Effort**: HIGH
**Impact**: CRITICAL

Tasks:
1. Implement status effect application from spells
2. Implement buff/debuff spells (create modifiers)
3. Implement cure spells (remove status effects)
4. Add proper instant death mechanics
5. Add resurrection mechanics
6. Add teleport mechanics
7. Add utility spell effects (light, detect, etc.)

**Benefit**: Spellcasters become viable and fun to play.

#### 7.2 Add Status Effect Variety
**Effort**: MEDIUM
**Impact**: HIGH

Tasks:
1. Implement missing status types (Blinded, Silenced, Confused, Afraid, Charmed, Berserk, Cursed, Blessed)
2. Add to CharacterStatus type
3. Integrate with CombatSystem
4. Add visual indicators in UI

**Benefit**: Combat becomes tactically interesting.

#### 7.3 Visual Feedback for Status Effects
**Effort**: MEDIUM
**Impact**: HIGH

Tasks:
1. Add status effect icons/indicators to character display
2. Show duration timers
3. Add visual feedback when effects are applied/expire
4. Color-code effects (debuffs red, buffs green, etc.)

**Benefit**: Players can understand combat state at a glance.

### Phase 2: Equipment Integration (MEDIUM PRIORITY)
**Goal**: Make equipment interesting and integrated with other systems

#### 7.4 Equipment + Status Effect Resistances
**Effort**: MEDIUM
**Impact**: MEDIUM

Tasks:
1. Add resistance field to Item type
2. When equipment is equipped, modify character's resistance chances
3. Show resistances in character sheet
4. Add equipment with interesting resistance properties

**Benefit**: Equipment becomes strategically interesting, not just stat sticks.

#### 7.5 Invokable Items Work in Combat
**Effort**: MEDIUM
**Impact**: MEDIUM

Tasks:
1. Add "Use Item" functionality to combat UI
2. Connect to SpellCaster for invokable items
3. Track charges properly
4. Add strategic value to consumables

**Benefit**: Consumables become useful, more build variety.

#### 7.6 Item Comparison UI
**Effort**: MEDIUM
**Impact**: MEDIUM

Tasks:
1. Show side-by-side comparison when hovering over equipment
2. Highlight stat changes (green for better, red for worse)
3. Show special properties clearly

**Benefit**: Players can make informed equipment decisions.

### Phase 3: Quality of Life (LOWER PRIORITY)
**Goal**: Polish and player convenience

#### 7.7 Spell Encyclopedia
**Effort**: MEDIUM
**Impact**: LOW

Tasks:
1. Add in-game spell reference
2. Show spell descriptions before learning
3. Group by school and level
4. Mark learned/available/unavailable

**Benefit**: Players can plan builds and understand spells.

#### 7.8 Better Unidentified Item System
**Effort**: LOW
**Impact**: LOW

Tasks:
1. Add descriptive flavor text to unidentified items
2. Add visual hints (glowing, rusted, ornate)
3. Add partial identification (learn type before full properties)

**Benefit**: Unidentified items become exciting rather than frustrating.

#### 7.9 Status Effect Stacking/Intensity
**Effort**: HIGH
**Impact**: LOW

Tasks:
1. Redesign StatusEffectSystem to support stacking
2. Add intensity levels (light poison vs deadly poison)
3. Add resistances that reduce intensity rather than binary block

**Benefit**: More nuanced tactical gameplay, but large refactor.

---

## 8. Design Recommendations

### 8.1 Unified Effect System
**Problem**: Effects are currently split across SpellEffects, StatusEffects, and Modifiers.

**Proposal**: Create a unified EffectSystem that handles all temporary and permanent effects.

**Benefits**:
- Single source of truth for effect processing
- Easier to add cross-system effects
- Consistent behavior everywhere
- Easier to debug

**Risks**:
- Large refactor
- Breaking changes to existing code
- Need migration plan

**Recommendation**: Do this only after Phase 1 is complete. Not urgent.

### 8.2 Event-Driven Effect Application
**Problem**: Systems poll each other (checking if effects should apply).

**Proposal**: Use event system for effect application:
- Events: onSpellCast, onDamageDealt, onEquipmentChange, onStatusApplied
- Systems subscribe to relevant events
- Reduces coupling

**Benefits**:
- Better separation of concerns
- Easier to add new effects
- More modular

**Risks**:
- More complex architecture
- Harder to trace effect chains
- Potential performance overhead

**Recommendation**: Consider for future refactor, not urgent.

### 8.3 Effect Preview System
**Problem**: Players don't know what effects will do before they happen.

**Proposal**: Add preview system that simulates effects without applying them:
- Show expected damage range before casting spell
- Show stat changes before equipping item
- Show probability of status effects

**Benefits**:
- Better player experience
- Reduces trial-and-error frustration
- Enables informed tactical decisions

**Risks**:
- Requires refactoring effect processors to be pure functions
- Need to maintain both "preview" and "apply" code paths

**Recommendation**: Implement after Phase 1 is complete.

---

## 9. Testing Recommendations

### Current Testing Gaps
1. No integration tests between systems
2. Spell effects not tested
3. Equipment + combat interaction not tested
4. Status effect application not tested

### Recommended Test Coverage

#### 9.1 Spell Effect Integration Tests
- Test each spell type applies correct effects
- Test status effects are applied correctly
- Test modifiers are created correctly
- Test spell interactions (buff + damage, debuff + heal)

#### 9.2 Equipment Integration Tests
- Test equipment affects combat calculations
- Test equipment grants resistances
- Test equipment spell bonuses apply
- Test cursed items cannot be removed

#### 9.3 Status Effect Integration Tests
- Test status effects tick correctly in each context
- Test exclusive status groups work
- Test racial resistances work
- Test status effects interact with modifiers

#### 9.4 End-to-End Combat Tests
- Test full combat flow with spells, equipment, status effects
- Test edge cases (character dies while buffed, etc.)
- Test AI behavior with status effects

---

## 10. Summary & Next Steps

### Critical Path to Improved Player Experience
1. **Implement missing spell effects** (especially status/buff/debuff/cure) → Makes spellcasters viable
2. **Add visual status indicators** → Makes combat comprehensible
3. **Complete status effect types** → Adds tactical depth
4. **Fix equipment + combat integration** → Makes loot meaningful
5. **Add item comparison UI** → Improves equipment decisions

### Quick Wins (Low effort, high impact)
1. Add status effect icons to combat UI
2. Show buff/debuff durations
3. Add spell descriptions to UI
4. Fix curse removal (add Remove Curse spell or temple service)
5. Add flavor text to unidentified items

### Long-Term Improvements
1. Unified effect system architecture
2. Equipment + spell synergies
3. Status effect stacking/intensity
4. Effect preview system
5. Event-driven effect architecture

---

## Appendix A: Code Location Reference

### Magic System
- `src/types/SpellTypes.ts` - Type definitions
- `src/data/spells/SpellDatabase.ts` - Spell data (2400+ lines)
- `src/systems/magic/SpellCaster.ts` - Spell execution
- `src/systems/magic/SpellEffectRegistry.ts` - Effect processing
- `src/systems/magic/effects/` - Individual effect processors

### Equipment/Item System
- `src/types/GameTypes.ts` - Item and Equipment types
- `src/config/ItemProperties.ts` - Item templates and restrictions
- `src/systems/InventorySystem.ts` - Item management (720+ lines)

### Status Effect System
- `src/types/StatusEffectTypes.ts` - Status effect types
- `src/systems/StatusEffectSystem.ts` - Status effect management (240 lines)
- `src/systems/ModifierSystem.ts` - Stat modifier management (170 lines)

### Integration Points
- `src/systems/CombatSystem.ts` - Combat orchestration (600+ lines)
- `src/entities/Character.ts` - Character data and behavior (519 lines)

---

## Appendix B: Player Experience Scenarios

### Scenario 1: New Player Tries Mage
**Current Experience**:
1. Create mage character
2. Learn Flame Dart spell
3. Enter combat
4. Cast Flame Dart - works! (damage spell)
5. Level up, learn Sleep spell
6. Cast Sleep - "Status effect not yet implemented"
7. Frustrated - spell seems broken
8. Try more spells - most don't work
9. **Result**: Player thinks mages are buggy, switches to fighter

**Improved Experience** (after Phase 1):
1. Create mage character
2. Learn Flame Dart spell
3. Enter combat
4. Cast Flame Dart - works! See visual effect
5. Level up, learn Sleep spell
6. Cast Sleep - enemies fall asleep (see sleep icons)
7. Attack sleeping enemies - deal double damage
8. **Result**: Player feels powerful and tactical

### Scenario 2: Finding Loot
**Current Experience**:
1. Defeat monsters, get loot
2. See "?Sword" in inventory
3. Try to identify - fails (not a Bishop)
4. Equip it anyway - it's cursed!
5. Can't unequip cursed sword
6. No idea what the curse does
7. Stuck with it - frustrated
8. **Result**: Player avoids looting unidentified items

**Improved Experience** (after Phase 2):
1. Defeat monsters, get loot
2. See "?Ornate Sword (Heavy, Glowing)" - hints it's powerful
3. Check inventory - compare stats to current sword
4. Risk/reward decision: equip or identify first?
5. Equip it - it's cursed but powerful (+3 damage, -2 AC)
6. See curse effect clearly: "Cursed: Cannot unequip. -2 AC"
7. Make strategic decision: keep for damage or find Remove Curse spell?
8. **Result**: Player engaged with risk/reward system

### Scenario 3: Tactical Combat
**Current Experience**:
1. Enter combat with 3 enemies
2. Fighter attacks - good
3. Mage casts damage spell - good
4. Priest heals - good
5. Repeat until enemies dead
6. Every combat feels the same
7. **Result**: Combat is boring

**Improved Experience** (after Phase 1+2):
1. Enter combat with 3 enemies
2. Priest casts Shield on party - see blue shield icons
3. Enemies attack - some blocked by shield
4. Mage casts Sleep on enemy group - 2 fall asleep (see sleep icons)
5. Fighter attacks sleeping enemy - critical hit (double damage)
6. Remaining enemy casts Poison - fighter poisoned (see green drip icon)
7. Priest cures poison - icon disappears
8. **Result**: Combat is engaging and tactical

---

## Implementation Decision & Plan (2025-10-18)

### Decision: Approach 1 - Complete the Existing Systems

After comprehensive analysis, we've chosen to build on the existing StatusEffectSystem and ModifierSystem rather than refactoring. This decision is based on:

1. ✅ **Well-designed existing architecture**: Clean separation between StatusEffectSystem (for conditions) and ModifierSystem (for stat changes)
2. ✅ **Comprehensive type system already in place**: StatusEffectType, SpellEffectType, BuffType all defined
3. ✅ **Working tick systems**: Combat/exploration/town contexts all integrated (Phases 1-7 completed)
4. ⚠️ **Just needs integration completion, not redesign**: Missing pieces are additive, not breaking

### Implementation Phases

**Phase A (COMPLETED 2025-10-20)** - High Impact, Low Effort:
1. ✅ Add missing status types to CharacterStatus type (Silenced, Blinded, Confused, Afraid, Charmed, Berserk, Blessed, Cursed)
   - **Verified**: GameTypes.ts:22-38 includes all status types
2. ✅ Complete spell → status effect processing (expand mapping in StatusEffect.ts)
   - **Implemented**: StatusEffect processor wired into SpellCaster.ts, tested with Petrify/Sleep spells
3. ✅ Implement cure effect processor for healing spells
   - **Verified**: CureEffect.ts exists in src/systems/magic/effects/
4. ✅ Add status icons to combat UI for visual feedback
   - **Implemented**: CombatScene.ts displays 3-letter status codes (STN, SLP, PAR, etc.)
5. ✅ Implement buff/debuff effect processors (semantic wrappers for ModifierSystem)
   - **Verified**: BuffEffect.ts and DebuffEffect.ts exist in src/systems/magic/effects/

**Actual Impact**: Spellcasters are now viable, combat has tactical depth with status effects, status effects visible to player in combat

**Phase B (COMPLETED 2025-10-20)** - Equipment Integration:
1. ✅ Add `resistances: CharacterStatus[]` field to Item type (GameTypes.ts:119)
2. ✅ Create EquipmentModifierManager to apply modifiers on equip/unequip (EquipmentModifierManager.ts)
3. ✅ Integrate equipment resistances into StatusEffectSystem.getResistanceChance() (StatusEffectSystem.ts:149-150)
4. ✅ Add on-hit status effects to weapon attacks (CombatSystem.ts:207-248)

**Enhancements Added**:
- ✅ `resistanceBonus?: number` field added to Item type (GameTypes.ts:120) for configurable resistance values
- ✅ Equipment resistances now stack (sum all equipment bonuses, capped at 95%)
- ✅ 4 resistance items configured with appropriate bonus values:
  - Ring of Poison Resistance: 25%
  - Cloak of Mental Protection: 20% (Confused, Charmed, Afraid)
  - Amulet of Health: 15% (Poisoned)
  - Blessed Armor: 35% (Cursed, Afraid)
- ✅ 3 weapons with on-hit effects fully functional:
  - Poison Dagger: 10% chance to poison (5 turns)
  - Frost Blade: 15% chance to paralyze (3 turns)
  - Sleep Blade: 8% chance to sleep (4 turns)
- ✅ 6 new monsters with thematic status effects:
  - Giant Spider: poison (70% chance)
  - Medusa: petrify (40%), poison (60%)
  - Vampire: paralysis (50%), sleep (40%)
  - Banshee: afraid (60%)
  - Basilisk: petrify (50%), poison (60%)
  - Wraith: paralysis (50%), afraid (40%)
- ✅ "Afraid" effect mapping added to CombatSystem

**Actual Impact**: Equipment is now strategically meaningful with stackable resistances, weapon effects work correctly, and monsters provide tactical challenges with status effects

**Phase C** - Polish & Completeness:
1. Monster attack → status effects (integrate with MonsterAI)
2. Trap → status effects (integrate with DungeonEventSystem)
3. Visual duration indicators (show turns remaining on status icons)
4. Effect preview system (show expected results before casting)

**Expected Impact**: Complete status effect ecosystem, full Wizardry authenticity

### Current Status: Phase A & B Complete (2025-10-20)

**Completed Tasks**:

**Phase A (2025-10-20)**:
- ✅ Research and analysis completed
- ✅ Implementation plan approved
- ✅ TODO tracking established
- ✅ All status types added to type system
- ✅ Spell → status effect processing fully integrated
- ✅ Cure/Buff/Debuff effect processors implemented
- ✅ Visual status indicators added to combat UI
- ✅ Atomic commits created and pushed to repository

**Phase B (2025-10-20)**:
- ✅ Fixed weapon on-hit effect bug (CombatSystem.applyWeaponEffect now actually applies status)
- ✅ Added configurable resistanceBonus field to Item type
- ✅ Updated EquipmentModifierManager to stack resistance bonuses (capped at 95%)
- ✅ Configured 4 resistance items with appropriate bonus values (15-35%)
- ✅ Verified 3 weapons with on-hit effects (poison dagger, frost blade, sleep blade)
- ✅ Added 6 new monsters with thematic status effects (spider, medusa, vampire, banshee, basilisk, wraith)
- ✅ Added "afraid" effect mapping to CombatSystem
- ✅ Type checking passed with no errors

**Key Phase B Features**:
- Equipment resistances stack: Ring (25%) + Amulet (15%) = 40% poison resistance
- Weapon on-hit effects respect monster resistances and show proper feedback
- Monsters can now apply poison, paralysis, sleep, petrify, and afraid to characters
- All resistance items drop from thematically appropriate monsters

**Next Steps**: Phase C remains pending. Consider reviewing game balance before proceeding.

---

## Known UX Issues & Future Improvements

### Equipment Management System (High Priority)

**Logged**: 2025-10-20

**Current State**:
- Equipment can ONLY be managed in the dungeon via Tab → select character → 'e' key
- No equipment management in town
- No unified character management screen
- Inconsistent with traditional Wizardry UX patterns

**Problems**:
1. **Subjective Issues**:
   - Very different from traditional Wizardry (which handles equipment in town)
   - Players expect to manage equipment in a safe location (town/castle), not mid-dungeon
   - Breaks the traditional Wizardry flow: Town (prepare) → Dungeon (explore) → Town (manage)

2. **Objective Issues**:
   - Only accessible in one location (dungeon)
   - No access in town where it makes most sense
   - Forces players to enter dungeon just to change equipment
   - Risk of being interrupted by random encounters while managing inventory
   - Likely a holdover from early development before town functionality existed

**Expected Traditional Wizardry Flow**:
1. **Town/Castle** - Character management hub:
   - View/equip items in safe environment
   - Manage party equipment before entering dungeon
   - Trade items between characters
   - Identify items (at shop or via Bishop)

2. **Dungeon** - Tactical inventory only:
   - Quick item use (potions, scrolls)
   - Emergency equipment swaps (if allowed)
   - Drop excess items to reduce encumbrance

**Proposed Solution** (requires design & implementation plan):
- Add character/equipment management to Town scene
  - Individual character screens accessible from town menu
  - Equipment screen showing all slots with comparison
  - Inventory management with filtering/sorting
  - Item identification service integration

- Unified character sheet accessible from multiple locations:
  - Town: Full access to all equipment/inventory
  - Dungeon: Limited tactical access (use items, quick swaps)
  - Combat: Item use only (potions, scrolls, invokable items)

- Consider traditional Wizardry screens:
  - INSPECT (view character details, equipment, stats)
  - TRADE (move items between characters)
  - EQUIP (dedicated equipment management)

**Dependencies**:
- UI/UX design for character management screens
- Menu navigation system updates
- Input handler integration for town scene
- Possibly unify with existing inventory system in dungeon

**Estimated Effort**: HIGH (3-5 hours)
- Requires UX design decisions
- Menu system refactoring
- Multiple scene integration
- Testing across all access points

**Priority**: HIGH - Core gameplay UX issue affecting player experience

**Status**: LOGGED - Awaiting design & implementation planning session

**Notes**:
- Should follow authentic Wizardry UX patterns where possible
- Consider modern QoL improvements (item comparison, auto-sort, etc.)
- May want to review similar systems in Wizardry I-V for inspiration
- Related to broader character management needs (level up, spell learning, etc.)

**Critical Research Required Before Implementation**:

1. **Cursed Equipment Mechanics** (MUST be researched meticulously):
   - **Current known trigger**: Item becomes cursed when equipped (auto-identifies, cannot unequip)
   - **Research needed from Wizardry Gaiden IV**:
     - Are there OTHER triggers besides equipping?
     - Does alignment mismatch trigger cursing? (e.g., Good character equips Evil-aligned item)
     - Does class restriction violation trigger cursing?
     - Can cursed items become cursed AFTER being equipped? (e.g., time-based, event-based)
     - Are there "hidden curse" items vs "known curse" items?
     - Can you identify a cursed item BEFORE equipping to avoid the curse?
     - What exactly happens when you try to equip cursed item? (immediate bind, saving throw, etc.)
     - Are there degrees of cursing? (minor curse, major curse, permanent curse)
     - Can curses spread to other items or party members?
     - Do cursed items have additional penalties beyond "cannot unequip"?
     - How does REMOVE CURSE spell/service work in Gaiden IV specifically?
   - **Current implementation gap**:
     - We have alignment restrictions (alignmentRestrictions field)
     - We have cursed items that auto-identify on equip (InventorySystem.ts:150-153)
     - But unclear if alignment violations should TRIGGER cursing vs just prevent equipping

2. **UI/UX Consistency Requirements**:
   - **CRITICAL**: New equipment screens MUST match look and feel of existing game screens
   - **Reference screens to study**:
     - Character creation screen layout and styling
     - Town menu structure and navigation
     - Dungeon inventory screen (Tab menu)
     - Combat UI panels
     - Training grounds UI
     - Shop interface
   - **Consistency checklist**:
     - Color scheme (background, text, highlights, borders)
     - Font family and sizes
     - Menu navigation patterns (arrow keys, enter/escape)
     - Border/frame styling (ASCII art, boxes, lines)
     - Status indicators (colors, icons, abbreviations)
     - Layout conventions (left panel, right panel, footer)
     - Animation/transition style (if any)
     - Error/warning message formatting
   - **Assets to review**:
     - Check StatusPanel.ts for character display conventions
     - Check MessageLog.ts for text formatting patterns
     - Check MenuInputHandler.ts for navigation patterns
     - Review existing scene render() methods for layout structure

---

**END OF DOCUMENT**
