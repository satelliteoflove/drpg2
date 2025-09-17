# Wizardry Gaiden IV Character System Migration Analysis

## Current State Analysis

### Existing Character System
The current implementation in `src/entities/Character.ts` follows the classic Wizardry I-III model:

**Races (5):**
- Human, Elf, Dwarf, Gnome, Hobbit

**Classes (8):**
- Fighter, Mage, Priest, Thief
- Bishop, Samurai, Lord, Ninja

**Spell Schools (2):**
- Mage spells
- Priest spells

**Stats System:**
- Standard 3d6 roll for each stat
- Simple race modifiers (hardcoded adjustments)
- Basic class requirements

## Target State (Wizardry Gaiden IV)

### New Races (11 total)
Expanding from 5 to 11 races:
- Human, Elf, Dwarf, Gnome, Hobbit (existing)
- **NEW:** Faerie, Lizman, Dracon, Rawulf, Mook, Felpurr

Each race has specific stat ranges (min-max) rather than simple modifiers.

### New Classes (14 total)
Expanding from 8 to 14 classes:
- Fighter, Mage, Priest, Thief (basic)
- Bishop, Samurai, Lord, Ninja (existing elite)
- **NEW:** Alchemist, Bard, Ranger, Psionic, Valkyrie, Monk

### New Magic System (4 schools)
Expanding from 2 to 4 magic schools:
- Mage (existing)
- Priest (existing)
- **NEW:** Alchemist
- **NEW:** Psionic

### Experience System Changes
- Race/class combination modifiers (0.8 to 1.6 multipliers)
- Different progression curves for each class
- More complex spell learning schedules
- **Leveling requires resting at Inn** (authentic Wizardry mechanic)

## Migration Requirements (v0.0.3 Alpha)

### 1. Type System Updates
- Expand `CharacterRace` type to include 6 new races
- Expand `CharacterClass` type to include 6 new classes
- Update spell type to support 4 magic schools
- Add spell learning progression tables (data only)
- Add save game versioning structure

### 2. Character Creation Overhaul
- Replace simple 3d6 rolls with race-specific stat ranges
- Implement proper stat generation within racial limits
- Update class requirement validation
- Add gender field and restrictions (Valkyrie is female-only)
- **Complete UI redesign for better UX**

### 3. Experience System Overhaul
- Implement race/class experience modifiers
- Create proper experience tables
- Update leveling calculations
- **Add Inn requirement for level advancement**

### 4. Spell Learning Data Structure
- Create spell learning schedules by class/level
- No spell implementation, just data structures
- Track which spell levels are available at character levels

### 5. Inn Scene Implementation
- Create new Inn scene with services
- Implement ASCII rendering layer
- Implement canvas rendering layer
- Add level-up mechanics at Inn
- Ensure cohesive look with new character creation UI

## Implementation Strategy

### Phase 1: Type System & Data Structures
- Update TypeScript types for races and classes
- Create interfaces for new data structures
- Add save game versioning
- Create configuration constants

### Phase 2: Character Generation Overhaul
- Implement race-specific stat generation
- Update class requirement checks
- Add gender field and validation
- **Redesign character creation UI completely**

### Phase 3: Experience System
- Implement experience modifier system
- Create proper leveling tables
- Update experience gain calculations
- **Integrate Inn requirement for leveling**

### Phase 4: Inn Scene Development
- Create Inn scene with multiple services
- Implement ASCII rendering layer
- Implement canvas rendering layer
- Add level-up service
- Add other Inn services (healing, identify, etc.)

### Phase 5: Spell Learning Data
- Create spell learning progression tables
- Add data structures for tracking learned spells
- No spell implementation, structure only

### Phase 6: Testing and Validation
- Test all race/class combinations
- Validate experience progression
- Verify Inn level-up mechanics
- Test save game versioning

## Technical Considerations

### Configuration Architecture
Move hardcoded values to configuration files:
- `config/races/` - Race definitions with stat ranges
- `config/classes/` - Class definitions and requirements
- `config/progression/` - Experience and spell learning tables

### Save Game Versioning
- Add version field to save games
- Design for future compatibility
- No migration needed (alpha stage)

### UI Consistency
- Character creation and Inn should share visual style
- Both need ASCII, canvas, and declarative layers
- Consider shared UI components

## Implementation Details

### Character Creation UI Redesign
- Multi-step wizard approach
- Visual stat rolling with race limits
- Class availability based on stats
- Gender selection (affects class availability)
- Name and alignment selection
- Review and confirm screen

### Inn Scene Features
- Rest/Level Up service
- Healing service
- Identify items (Bishop)
- Party management
- Gold pooling
- Character inspection

### Experience Calculation
```typescript
actualXPRequired = baseXPRequired * raceClassModifier
```
Where modifiers range from 0.8 (fastest) to 1.6 (slowest)

## Files to Modify
1. `src/types/GameTypes.ts` - Type expansions
2. `src/entities/Character.ts` - Core logic updates
3. `src/config/GameConstants.ts` - New configuration
4. `src/config/UIConstants.ts` - UI constants
5. `src/scenes/CharacterCreationScene.ts` - Complete UI overhaul

## New Files to Create
1. `src/config/races/` - Race configuration files
2. `src/config/classes/` - Class configuration files
3. `src/config/progression/` - Experience and spell learning tables
4. `src/scenes/InnScene.ts` - New Inn scene
5. `src/rendering/ascii/InnASCII.ts` - Inn ASCII rendering
6. `src/types/SaveGameTypes.ts` - Versioned save structure

## Testing Requirements
- Verify all 11 races generate valid stats
- Verify all 14 classes have proper requirements
- Test experience gain with all race/class combinations
- Verify leveling only occurs at Inn with sufficient XP
- Test save/load with version field

## Success Criteria
1. All 11 races and 14 classes implemented
2. Character creation UI is intuitive and visually appealing
3. Experience system matches WGIV formula
4. Inn scene functional with level-up mechanics
5. Save games include version for future compatibility
6. ASCII and canvas rendering layers work seamlessly