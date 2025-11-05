# Dungeon Implementation Guide
## Tunable Constants, Priorities, and Integration

**Document Purpose:** Implementation roadmap and complete tunable constants system for rapid iteration and balance tuning.

**Last Updated:** 2025-11-03

---

## PART 1: TUNABLE CONSTANTS SYSTEM

**Purpose:** All gameplay-affecting values must be exposed as constants to enable rapid iteration and balance tuning without code changes. This section defines all tunable parameters.

### 1.1 Dungeon Generation Constants

```typescript
export const GENERATION_CONSTANTS = {
  // Grid & Spatial
  GRID_SIZE: 20,
  TARGET_ROOM_COUNT_MIN: 30,
  TARGET_ROOM_COUNT_MAX: 40,
  TARGET_COVERAGE_MIN: 75,  // % of tiles as floor
  TARGET_COVERAGE_MAX: 85,

  // Room Size Distribution (should sum to 100)
  ROOM_SIZE_SMALL_PERCENT: 40,   // 2×2, 3×2, 2×3
  ROOM_SIZE_MEDIUM_PERCENT: 40,  // 3×3, 3×4, 4×4
  ROOM_SIZE_LARGE_PERCENT: 20,   // 5×5, 6×6, 5×7

  // Room Size Ranges (tiles)
  ROOM_SIZE_SMALL_MIN: 4,
  ROOM_SIZE_SMALL_MAX: 6,
  ROOM_SIZE_MEDIUM_MIN: 9,
  ROOM_SIZE_MEDIUM_MAX: 16,
  ROOM_SIZE_LARGE_MIN: 25,
  ROOM_SIZE_LARGE_MAX: 42,

  // Connectivity
  MST_ADDITIONAL_CONNECTIONS_MIN: 2,
  MST_ADDITIONAL_CONNECTIONS_MAX: 3,

  // Placement Retries
  ROOM_PLACEMENT_MAX_RETRIES: 100,
  ROOM_PLACEMENT_COLLISION_SPACING: 0,  // Allow shared walls
};
```

### 1.2 Pacing & Encounter Constants

```typescript
export const PACING_CONSTANTS = {
  // Combat Frequency
  ENCOUNTER_RATE_BASE: 20,              // % per step in corridor
  ENCOUNTER_RATE_ROOM_MODIFIER: 0.5,    // Multiplier in rooms
  ENCOUNTER_RATE_CORRIDOR_MODIFIER: 1.0, // Multiplier in corridors
  ENCOUNTER_RATE_MAX: 80,               // Cap to prevent spam

  // NOTE: Encounter difficulty is controlled via per-floor encounter tables,
  // not by scaling multipliers. Each floor has its own monster list.

  // Safe Zones (step-based, not radius-based)
  SAFE_STEPS_FROM_STAIRS_ENTRY: 2,      // Steps safe when entering floor
  SAFE_STEPS_FROM_STAIRS_EXIT: 2,       // Steps safe when ascending stairs
  SAFE_ZONE_POST_COMBAT_STEPS: 3,       // Steps of safety after combat

  // Event Frequency
  EVENTS_PER_FLOOR_MIN: 2,
  EVENTS_PER_FLOOR_MAX: 3,
  FLAVOR_NPCS_PER_FLOOR_MIN: 1,
  FLAVOR_NPCS_PER_FLOOR_MAX: 2,
};
```

### 1.3 Feature Placement Constants

```typescript
export const FEATURE_CONSTANTS = {
  // Stairs
  STAIRS_MIN_DISTANCE_FROM_ENTRANCE: 15,  // Tiles

  // Keys
  KEY_COUNT_FLOOR_1_3: 1,
  KEY_COUNT_FLOOR_4_6: 2,
  KEY_COUNT_FLOOR_7_PLUS: 3,
  KEY_MIN_DISTANCE_APART: 8,              // Tiles between keys
  KEY_MIN_DISTANCE_FROM_STAIRS: 10,       // Tiles from exit

  // Switches & Levers
  SWITCH_PAIR_PROBABILITY: 50,            // % chance floor has switches
  SWITCH_PAIR_COUNT_MIN: 1,
  SWITCH_PAIR_COUNT_MAX: 2,
  SWITCH_DISTANCE_FLOOR_1_3: { min: 3, max: 6 },
  SWITCH_DISTANCE_FLOOR_4_6: { min: 6, max: 10 },
  SWITCH_DISTANCE_FLOOR_7_PLUS: { min: 10, max: 15 },

  // Dark Zones
  DARK_ZONE_COUNT_MIN: 0,
  DARK_ZONE_COUNT_MAX: 2,
  DARK_ZONE_SIZE_MIN: 9,                  // 3×3 tiles
  DARK_ZONE_SIZE_MAX: 25,                 // 5×5 tiles
  DARK_ZONE_PROBABILITY_FLOOR_1_3: 33,    // % chance
  DARK_ZONE_PROBABILITY_FLOOR_4_6: 66,
  DARK_ZONE_PROBABILITY_FLOOR_7_PLUS: 100,

  // One-Way Doors
  ONE_WAY_COMPLEXITY_COUNT_MIN: 1,        // Navigation puzzles
  ONE_WAY_COMPLEXITY_COUNT_MAX: 2,
  ONE_WAY_SHORTCUT_COUNT_MIN: 1,          // Return paths
  ONE_WAY_SHORTCUT_COUNT_MAX: 2,
  ONE_WAY_SHORTCUT_MIN_DISTANCE: 12,      // From stairs

  // Doors
  DOOR_ROOM_TO_CORRIDOR_PROBABILITY: 100, // Always place
  DOOR_ROOM_TO_ROOM_PROBABILITY: 50,      // Sometimes place

  // Traps (OPTIONAL - Not implemented in MVP)
  TRAPS_ENABLED: false,                   // Disable for now
  TRAP_DENSITY_FLOOR_1_3: 8,
  TRAP_DENSITY_FLOOR_4_6: 12,
  TRAP_DENSITY_FLOOR_7_PLUS: 20,
  TRAP_MAX_CONSECUTIVE: 2,
  TRAP_GAUNTLET_ENABLED: false,
};
```

### 1.4 Character Ability Constants

```typescript
export const ABILITY_CONSTANTS = {
  // Thief - Secret Detection (Passive)
  // Triggers only when party moves onto tile with secret
  THIEF_SECRET_DETECTION_BASE: 10,        // % per level
  THIEF_SECRET_DETECTION_MAX: 90,         // Cap

  // Active Search (searches current tile and walls only)
  SEARCH_BASE_CHANCE: 30,                 // % without thief
  SEARCH_THIEF_FLAT_BONUS: 20,           // Bonus if thief present
  SEARCH_THIEF_PER_LEVEL_BONUS: 5,       // Additional % per level
  SEARCH_MAX_CHANCE: 95,                  // Cap
  SEARCH_TIME_COST: 30,                   // Seconds (affects encounter risk)

  // Psionic - Mind Reading
  MIND_READ_MP_COST: 5,                   // Spell point cost
  MIND_READ_LEVEL_REQUIRED: 3,            // Min level to cast

  // Charisma - Social Checks
  CHARISMA_CHECK_BASE_DC: 15,             // Difficulty Class
  CHARISMA_CHECK_PER_POINT_MODIFIER: 1,   // DC adjustment per CHA
  CHARISMA_CHECK_D20_ROLL: true,          // Use d20 + CHA vs DC
};
```

### 1.5 Event & NPC Constants

```typescript
export const EVENT_CONSTANTS = {
  // Event Placement
  EVENT_MODULE_LIBRARY_SIZE_TARGET: 12,   // Total modules to author
  EVENT_SPECIAL_ROOM_SIZE_MIN: 16,        // Prefer larger rooms
  EVENT_DEAD_END_BONUS_SCORE: 3,          // Scoring for placement
  EVENT_KEY_ROOM_BONUS_SCORE: 5,
  EVENT_DARK_ZONE_BONUS_SCORE: 4,
  EVENT_DISTANCE_SCORE_FACTOR: 0.2,       // Per tile from entrance

  // NPC Behavior
  NPC_TRUTHFUL_PROBABILITY: 60,           // % of NPCs tell truth
  NPC_DECEITFUL_PROBABILITY: 25,          // % of NPCs lie
  NPC_WITHHOLDING_PROBABILITY: 15,        // % withhold info

  // Event Outcome Timing
  EVENT_OUTCOME_APPLY_IMMEDIATE: true,    // Apply outcomes immediately
  EVENT_OUTCOME_VALIDATE_BEFORE_APPLY: true,
};
```

### 1.6 Difficulty Scaling Constants

```typescript
export const DIFFICULTY_CONSTANTS = {
  // These scale with floor number
  FLOOR_DIFFICULTY_BASE: 1.0,
  FLOOR_DIFFICULTY_PER_FLOOR: 0.15,       // Multiplier increase

  // Applied to:
  DIFFICULTY_AFFECTS_ENCOUNTER_RATE: true,
  DIFFICULTY_AFFECTS_ENCOUNTER_STRENGTH: true,
  DIFFICULTY_AFFECTS_TRAP_DAMAGE: false,  // Traps disabled initially
  DIFFICULTY_AFFECTS_DARK_ZONE_COUNT: true,
};
```

### 1.7 Save System Constants

```typescript
export const SAVE_CONSTANTS = {
  SAVE_VERSION: "1.0.0",

  // Save Trigger Points
  SAVE_ON_COMBAT_START: true,
  SAVE_ON_COMBAT_END: true,
  SAVE_ON_EVENT_START: true,
  SAVE_ON_EVENT_END: true,
  SAVE_ON_FLOOR_COMPLETE: true,
  SAVE_ON_TOWN_ENTRY: true,

  // Save File Management
  SAVE_SLOTS_AVAILABLE: 1,                // Single save per roster
  SAVE_AUTOSAVE_ENABLED: true,
  SAVE_MANUAL_SAVE_ENABLED: false,
};
```

### 1.8 Death & Resurrection Constants

```typescript
export const DEATH_CONSTANTS = {
  // Resurrection Chances (%)
  RESURRECTION_TOWN_BASE_CHANCE: 95,
  RESURRECTION_TOWN_LEVEL_PENALTY: 1,     // -1% per level above 5
  RESURRECTION_FIELD_BASE_CHANCE: 75,     // By party priest
  RESURRECTION_FIELD_LEVEL_PENALTY: 2,

  // Ash Resurrection
  RESURRECTION_ASH_TOWN_CHANCE: 50,
  RESURRECTION_ASH_FIELD_CHANCE: 25,

  // Permanent Death
  RESURRECTION_FAIL_TO_ASH_CHANCE: 100,   // Failed normal res → ash
  RESURRECTION_ASH_FAIL_TO_LOST_CHANCE: 100, // Failed ash res → lost
};
```

### 1.9 Loot & Progression Constants

```typescript
export const LOOT_CONSTANTS = {
  // Loot Sources
  LOOT_FROM_MONSTERS_ONLY: true,          // No treasure chests initially
  LOOT_DROP_RATE_BASE: 80,                // % monsters drop something
  LOOT_QUALITY_FLOOR_SCALING: 0.1,        // Quality increase per floor

  // Gold Drops
  GOLD_DROP_BASE_MIN: 10,
  GOLD_DROP_BASE_MAX: 50,
  GOLD_DROP_FLOOR_MULTIPLIER: 1.2,        // Per floor

  // Item Drops
  ITEM_DROP_RATE: 30,                     // % of loot drops are items
  ITEM_CURSED_PROBABILITY: 5,             // % items are cursed
};
```

### 1.10 UI & Feedback Constants

```typescript
export const UI_CONSTANTS = {
  // Messages
  MESSAGE_LOG_MAX_LINES: 100,
  MESSAGE_FADE_TIME_MS: 5000,
  MESSAGE_IMPORTANT_COLOR: "#FF0000",
  MESSAGE_SYSTEM_COLOR: "#00FF00",

  // Raycasting
  RAYCAST_VIEW_DISTANCE: 6,               // Tiles
  RAYCAST_VIEW_DISTANCE_DARK_ZONE: 0,     // Disabled in dark
  RAYCAST_FOV_ANGLE: 60,                  // Degrees

  // Dark Zone Messages
  DARK_ZONE_TORCH_FAIL_MSG: "You try to light a torch, but the flame sputters and dies. The darkness here is unnatural.",
  DARK_ZONE_SPELL_FAIL_MSG: "The light spell fizzles, its energy dissipating into the oppressive darkness.",
  DARK_ZONE_ENTRY_MSG: "You step into absolute darkness. Your light source is useless.",

  // Interaction Prompts
  PROMPT_SEARCH_KEY: "S",
  PROMPT_INTERACT_KEY: "E",
  PROMPT_MAP_KEY: "M",
};
```

### 1.11 Debug & Testing Constants

```typescript
export const DEBUG_CONSTANTS = {
  DEBUG_MODE_ENABLED: false,
  DEBUG_REVEAL_MAP: false,
  DEBUG_SHOW_KEY_LOCATIONS: false,
  DEBUG_NOCLIP: false,
  DEBUG_GOD_MODE: false,

  // Telemetry
  TELEMETRY_ENABLED: true,
  TELEMETRY_TRACK_PACING: true,
  TELEMETRY_TRACK_DEATHS: true,
  TELEMETRY_TRACK_EVENT_CHOICES: true,
};
```

### 1.12 Validation Constants

```typescript
export const VALIDATION_CONSTANTS = {
  // Solvability Checks
  VALIDATE_KEYS_REACHABLE: true,
  VALIDATE_STAIRS_UNLOCKABLE: true,
  VALIDATE_NPCS_ACCESSIBLE: true,
  VALIDATE_NO_INFINITE_LOOPS: true,

  // Generation Failure Handling
  MAX_GENERATION_ATTEMPTS: 3,
  FALLBACK_TO_SIMPLE_GENERATION: true,
};
```

**Usage Note:** All constants should be centralized in a single configuration file (e.g., `GameBalance.ts`) to enable easy tuning and experimentation.

---

## PART 2: IMPLEMENTATION PRIORITIES

### 2.1 MVP - Core Functionality (Phase 1)

**Must Have:**
1. Basic spatial generation (rooms, corridors, walls)
2. Stairs placement (locked exit)
3. Simple key/lock system (1 key per floor)
4. Door placement (including one-way doors - both types)
5. Save system (combat start, event start/end, floor complete, town entry)
6. Permadeath and resurrection
7. Theme system (visual only)
8. Random encounters

**NOT in MVP:**
- Traps (optional for future)
- Dark zones (Phase 2)
- Switches/levers (Phase 2)

**Success Criteria:**
- Playable dungeon floor that requires exploration to find key and unlock stairs
- Character death is permanent and meaningful
- Navigation feels like classic Wizardry
- One-way doors create navigation variety

### 2.2 Enhanced Features (Phase 2)

**Should Have:**
1. Dark zones with raycasting disabled (0-2 per floor)
2. Switch/lever pairs
3. NPC placement (simple dialogue)
4. Character ability checks (thief secrets, charisma)
5. Multiple keys per floor (2-3)
6. Event modules (2-3 per floor)
7. Enhanced room descriptions
8. Psionic mind reading

**Success Criteria:**
- Character moments create memorable experiences
- Exploration has variety beyond pure navigation
- Character abilities matter during exploration

### 2.3 Polish & Expansion (Phase 3)

**Nice to Have:**
1. Expanded event modules library (8-12 modules)
2. Rescue missions for fallen parties
3. Ironman mode option
4. Environmental effects (fog, sounds)
5. Treasure chest events (rare special chests)
6. Secret doors and rooms
7. Traps system (if desired after MVP testing)
8. Teleporter system (simple, not networks)

**Success Criteria:**
- Game feels polished and complete
- Replayability through varied event combinations
- All character abilities have meaningful use

---

## PART 3: TECHNICAL CONSIDERATIONS

### 3.1 Existing Codebase Integration

**Current Systems:**
- TypeScript with strict mode
- Canvas-based rendering
- Raycasting engine already implemented
- Wall-on-edge architecture already implemented
- Room generation phases 1-3 completed
- MST corridors working
- Trap placement working
- Stairs placement working
- Chest placement working (may be removed)

**What Needs Modification:**
1. **Room size distribution:** Currently 2×2, 3×3 small rooms → Change to 2×2 through 6×6 distribution
2. **Room count target:** Currently 49-65 rooms → Change to 30-40 rooms
3. **Spacing:** Currently minSpacing=0 (good, keep this)
4. **Grid size:** Currently 24×24 → Change to 20×20
5. **Trap placement:** Currently avoids doors → Allow traps adjacent to doors (or disable traps for MVP)
6. **Chest system:** Currently placing chests → Remove or repurpose for event modules

**What Can Be Reused:**
- Basic room placement algorithm
- MST corridor generation
- Wall-on-edge rendering
- Stairs placement logic
- Trap placement algorithm (with modifications, or disable for MVP)
- DungeonGenerator class structure

### 3.2 New Systems to Implement

**Priority 1 (MVP):**

1. **Key/lock system**
   - Lock entity on stairs
   - Key items placed in rooms
   - Unlock interaction

2. **One-way door system**
   - Type A (complexity) and Type B (shortcuts)
   - Solvability validation

3. **Save system modifications**
   - Pre-combat save trigger
   - Pre-event and post-event save triggers
   - Save format updates

4. **NPC system**
   - NPC entity class
   - Dialogue system
   - Interaction UI

**Priority 2 (Enhanced):**

5. **Dark zone system**
   - Zone marking on tiles
   - Raycasting disable logic
   - Light spell/torch failure messages

6. **Switch/lever system**
   - Lever entity
   - Gate entity
   - Linkage system
   - Interaction and feedback

7. **Event module system**
   - Module data structure
   - Module library
   - Module placement algorithm
   - Event UI and choice handling

**Priority 3 (Polish):**

8. **Character ability checks**
   - Thief secret detection (passive at tile entry)
   - Psionic mind reading spell
   - Charisma checks during NPC interaction

9. **Rescue missions**
   - Party state persistence in dungeon
   - Alternate party creation
   - Body retrieval mechanics

---

## PART 4: AI AGENT IMPLEMENTATION GUIDE

### 4.1 Recommended Approach

**Step-by-step Implementation:**
1. Start with Phase 1 (MVP) systems
2. Modify existing room generation to new parameters (30-40 rooms, 20×20 grid)
3. Implement key/lock system
4. Implement one-way door system (both types)
5. Implement save system changes (critical for game identity)
6. Add basic NPCs and dialogue
7. Test solvability and playability
8. Use telemetry to measure actual pacing
9. Iterate on parameters until feel is right
10. Move to Phase 2 once MVP is solid

### 4.2 Critical Path Items

**Must implement for MVP:**
- Save system (enforces game identity)
- Key/lock system (creates exploration goal)
- One-way doors (adds navigation variety)
- Solvability validation (ensures playability)
- NPC dialogue system (enables character moments)
- Constants file (enables iteration)

### 4.3 Can Be Deferred

**Post-MVP features:**
- Event module library (start with 2-3 modules)
- Dark zones (impactful but not essential)
- Switch/lever system (adds variety but not core)
- Rescue missions (complex, can wait)
- Traps (may not be needed at all)

### 4.4 Integration Strategy

**Modifying Existing Generator:**

1. **Update grid parameters:**
   ```typescript
   const GRID_SIZE = 20;  // Was: 24
   const TARGET_ROOMS = { min: 30, max: 40 };  // Was: 49-65
   ```

2. **Update room size distribution:**
   ```typescript
   const ROOM_SIZES = {
     small: { percent: 40, minTiles: 4, maxTiles: 6 },
     medium: { percent: 40, minTiles: 9, maxTiles: 16 },
     large: { percent: 20, minTiles: 25, maxTiles: 42 }
   };
   ```

3. **Disable/defer MVP-excluded features:**
   ```typescript
   const TRAPS_ENABLED = false;
   const DARK_ZONES_ENABLED = false;  // Phase 2
   const SWITCHES_ENABLED = false;     // Phase 2
   ```

4. **Add new features:**
   - Implement `KeyLockSystem` class
   - Implement `OneWayDoorSystem` class
   - Extend `DungeonFloor` interface with new feature arrays
   - Add solvability validation to generation pipeline

### 4.5 Testing Strategy

**Automated validation:**
- Solvability test suite (keys reachable, stairs unlockable)
- Coverage test (75-85% floor tiles)
- One-way door validation (no progression blocked)

**Manual playtesting:**
- Can player find all keys?
- Does navigation feel good?
- Are one-way shortcuts helpful?
- Is pacing appropriate?

**Iteration loop:**
1. Generate floor
2. Playtest
3. Collect telemetry data
4. Adjust constants
5. Repeat

### 4.6 Design Philosophy

**Remember:**
- Start simple, iterate based on playtest feedback and telemetry data
- A simple, working system is better than a complex, broken one
- Let data drive balance decisions, not hunches
- Flexibility is key - tunable constants enable rapid iteration without code changes
- Dungeons are **dramatic settings for character experiences**, not puzzle boxes

---

## PART 5: IMPLEMENTATION CHECKLIST

### 5.1 Phase 1 (MVP) Checklist

**Generation System:**
- [ ] Update GRID_SIZE to 20×20
- [ ] Update room count target to 30-40
- [ ] Update room size distribution (40% small, 40% medium, 20% large)
- [ ] Verify MST corridor connectivity works with new parameters
- [ ] Add loop creation (2-3 additional connections)

**Key/Lock System:**
- [ ] Create Key entity type
- [ ] Create Lock entity type
- [ ] Implement key placement algorithm (distance-based)
- [ ] Implement locked stairs
- [ ] Implement unlock interaction
- [ ] Add room feature tags for NPC clues

**One-Way Doors:**
- [ ] Extend Door interface with direction property
- [ ] Implement Type A (complexity) one-way placement
- [ ] Implement Type B (shortcut) one-way placement
- [ ] Add solvability validation for one-ways

**Save System:**
- [ ] Add pre-combat save trigger
- [ ] Add pre-event save trigger
- [ ] Add post-event save trigger
- [ ] Test save/load with new floor structure

**Basic NPCs:**
- [ ] Create NPC entity class
- [ ] Implement simple dialogue system
- [ ] Create NPC interaction UI
- [ ] Link NPCs to key clues

### 5.2 Phase 2 (Enhanced) Checklist

**Dark Zones:**
- [ ] Add dark zone marking to tiles
- [ ] Implement raycasting disable in dark zones
- [ ] Add light spell failure messages
- [ ] Add torch failure messages
- [ ] Add dark zone entry messages

**Switches/Levers:**
- [ ] Create Lever entity
- [ ] Create Gate entity
- [ ] Implement lever-gate linkage system
- [ ] Add activation feedback messages

**Event Modules:**
- [ ] Design event module data structure
- [ ] Create 2-3 initial event modules
- [ ] Implement special room identification
- [ ] Implement module placement algorithm
- [ ] Create event choice UI

**Character Abilities:**
- [ ] Implement thief passive secret detection
- [ ] Implement active search mechanic
- [ ] Implement psionic mind reading
- [ ] Implement charisma checks for NPCs

### 5.3 Phase 3 (Polish) Checklist

**Expanded Content:**
- [ ] Create 8-12 total event modules
- [ ] Add secret doors/rooms
- [ ] Add environmental effects
- [ ] Add treasure chest events

**Advanced Systems:**
- [ ] Implement rescue missions
- [ ] Add ironman mode option
- [ ] Add teleporter system (if desired)
- [ ] Add traps system (if playtesting shows need)

---

**Version:** 1.1 (Integrated from Requirements)
**Date:** 2025-11-03
**Author:** Collaborative design session (Christopher + Claude)
**Status:** Ready for implementation
