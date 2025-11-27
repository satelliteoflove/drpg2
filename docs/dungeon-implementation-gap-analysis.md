# Dungeon Implementation Gap Analysis
## Current State vs Documentation Requirements

**Analysis Date:** 2025-11-05
**Purpose:** Identify gaps between current dungeon generation code and design documentation

---

## EXECUTIVE SUMMARY

The current dungeon generation system has a solid foundation with room/corridor generation, basic doors, traps, and chests working. However, significant gaps exist in core progression systems (keys/locks), navigation features (one-way doors, dark zones, switches), and character-driven content (NPCs, event modules).

**Implementation Status:**
- ✅ **Fully Implemented:** ~40%
- ⚠️ **Partially Implemented:** ~30%
- ❌ **Not Implemented:** ~30%

**Critical Path for MVP:**
1. Implement key placement and lock system on stairs
2. Implement one-way doors (both complexity and shortcut types)
3. Implement save system triggers (pre-combat, pre-event)
4. Add basic NPC placement
5. Create tunable constants file

---

## PART 1: GRID & SPATIAL LAYOUT

### Room Count
**Status:** ✅ **ALIGNED**

**Documentation Says:** 16-30 rooms per floor (balanced for Rooms & Mazes algorithm)
**Code Does:** 16-30 rooms per floor
```typescript
// Current code:
const largeRooms = 3 + Math.floor(rng.random() * 6);    // 3-8
const mediumRooms = 5 + Math.floor(rng.random() * 5);   // 5-9
const smallRooms = 8 + Math.floor(rng.random() * 6);    // 8-13
// Total: 16-30 rooms
```

**No action required** - room count is appropriate for the Rooms & Mazes generation algorithm.

### Room Size Distribution
**Status:** ⚠️ **DIVERGES**

**Documentation Says:** 40% small, 40% medium, 20% large
**Code Does:** ~45% small, ~30% medium, ~25% large

**Action Required:**
- Rebalance room generation percentages
- Use documented distribution: 40/40/20

### Room Spacing
**Status:** ✅ **ALIGNED**

**Documentation Says:** 2-tile spacing between rooms (required by Rooms & Mazes algorithm)
**Code Does:** `minSpacing: 2` (2-tile gap between rooms)

```typescript
// Current code:
if (!this.canPlaceRoom(x, y, width, height, 2)) {
  // Uses 2-tile spacing for maze corridor generation
}
```

**No action required** - 2-tile spacing is necessary for the Rooms & Mazes algorithm to generate proper maze corridors between rooms.

### Floor Coverage
**Status:** ✅ **MATCHES**

**Documentation Says:** 75-85% floor tiles
**Code Does:** Achieves this through room placement algorithm

---

## PART 2: KEY/LOCK PROGRESSION SYSTEM

### Locked Stairs
**Status:** ❌ **NOT IMPLEMENTED**

**Documentation Says:**
- Stairs down locked at generation
- Requires 1-3 keys based on floor depth
- Lock visibility: OBVIOUS ("The stairs are blocked by a locked gate")

**Code Does:**
- Stairs placed but NOT locked
- No gate blocking stairs
- No key requirement to descend

**Action Required:**
1. Add lock to stairs_down special tile
2. Implement gate entity blocking stairs
3. Add unlock interaction requiring keys
4. Add visual message about locked gate

### Key Placement
**Status:** ❌ **NOT IMPLEMENTED**

**Documentation Says:**
- 1-3 keys placed per floor based on depth
- Keys placed 8+ tiles apart
- Keys in dead-end rooms, dark zones, or with NPCs
- Room feature tags for NPC clues

**Code Does:**
- Locked doors reference key IDs
- NO actual key items placed in dungeon
- No Key entity or item type

**Action Required:**
1. Create Key item type in item system
2. Implement key placement algorithm:
   - Early floors (1-3): 1 key
   - Mid floors (4-6): 2 keys
   - Deep floors (7+): 2-3 keys
3. Place keys in special rooms with minimum spacing
4. Add room feature tags ("carved pillars", "dark altar")
5. Link key IDs to stairs lock

### Key Discovery Clues
**Status:** ❌ **NOT IMPLEMENTED**

**Documentation Says:**
- 60% via NPC dialogue
- 30% via written notes/inscriptions
- 10% via environmental clues
- Cryptic but solvable references to room features

**Code Does:** No clue system exists

**Action Required:**
1. Implement NPC clue generation
2. Create note/inscription system
3. Add environmental description system
4. Link clues to room feature tags

---

## PART 3: ONE-WAY DOOR SYSTEM

**Status:** ❌ **NOT IMPLEMENTED**

**Documentation Says:**
- 2-4 one-way doors per floor
- **Type A (Complexity):** Navigation puzzles in loops, forces alternate return paths
- **Type B (Shortcut):** Quick returns from distant rooms (12+ tiles from stairs)

**Code Does:**
- Wall properties have `oneWay?: Direction` field defined
- No generation logic for one-way doors
- No rendering distinction
- No movement blocking in reverse direction

**Action Required:**
1. Implement one-way door placement algorithm:
   - Identify loops in MST + extra connections
   - Place 1-2 Type A doors on alternate routes
   - Identify far rooms (12+ tiles from stairs)
   - Create 1-2 Type B shortcut corridors
2. Add movement validation in DungeonMovementHandler:
   - Check if door is one-way
   - Block movement if approaching from wrong direction
   - Show message "The door only opens from the other side"
3. Add visual indicator for one-way doors in raycasting
4. Add solvability validation (ensure progression not blocked)

---

## PART 4: DARK ZONES

**Status:** ❌ **NOT IMPLEMENTED**

**Documentation Says:**
- 0-2 dark zones per floor based on depth
- 3×3 to 5×5 area (9-25 tiles)
- Raycasting disabled (pitch black)
- Light spells and torches fail
- Placed in areas with valuable content
- Entry message: "You step into absolute darkness"

**Code Does:**
- DungeonTile has no dark zone flag
- Override zones have 'darkness' event type but not used for vision
- Raycasting always renders normally
- No light source failure messages

**Action Required:**
1. Add `inDarkZone: boolean` to DungeonTile
2. Implement dark zone placement in generation:
   - Probability based on floor depth (33%/66%/100%)
   - Mark contiguous 3×3 to 5×5 tile regions
   - Place valuable content in dark zones
3. Modify DungeonViewRaycast:
   - Check if current tile is in dark zone
   - Return black screen if in dark zone
   - Ignore VIEW_DISTANCE setting
4. Add light spell/torch failure messages:
   - "You try to light a torch, but the flame sputters and dies"
   - "The light spell fizzles, its energy dissipating into the oppressive darkness"
5. Add entry/exit messages when crossing boundary

---

## PART 5: SWITCH/LEVER SYSTEM

**Status:** ❌ **NOT IMPLEMENTED**

**Documentation Says:**
- 0-2 switch/lever pairs per floor (50% chance)
- Simple 1:1 relationship (1 lever opens 1 gate)
- Distance based on floor depth (3-6 tiles early, 10-15 tiles deep)
- Feedback: "You hear distant grinding of stone"
- Gate opens with sound effect

**Code Does:**
- SpecialTile has 'switch' type defined
- No Switch or Lever entity
- No Gate entity
- No linkage system between switch and gate

**Action Required:**
1. Create Switch entity with properties:
   - position
   - linkedGateId
   - activated: boolean
2. Create Gate entity as wall type:
   - Blocks passage when closed
   - Opens when linked switch activated
3. Implement switch/gate placement algorithm:
   - 50% chance per floor
   - Place 1-2 pairs
   - Distance based on floor depth
   - Link IDs between switch and gate
4. Add switch interaction in DungeonMovementHandler:
   - Detect switch on tile
   - Activate switch
   - Find linked gate and open it
   - Play sound and show message
5. Add gate rendering in raycasting (closed vs open)

---

## PART 6: NPC PLACEMENT

**Status:** ❌ **NOT IMPLEMENTED**

**Documentation Says:**
- 2-4 NPCs per floor
- Placed in distinctive rooms (large, dead-end, central, dark zones)
- NPC types:
  - Type 1: Information providers (progression clues)
  - Type 2: Quest givers (optional rewards)
  - Type 3: Flavor NPCs (atmosphere/lore)
  - Type 4: Hostile/ambush (rare, 1 per 3-4 floors)
- NPC truthfulness varies (truthful, deceitful, withholding)
- Mind reading reveals true intentions

**Code Does:**
- No NPC entity in dungeon system
- No NPC placement in generation
- No dialogue system
- No mind reading integration

**Action Required:**
1. Create NPC entity:
   ```typescript
   interface NPC {
     id: string;
     position: Position;
     personality: 'truthful' | 'deceitful' | 'helpful' | 'hostile';
     dialogue: DialogueTree;
     linkedEvent?: string;
     knowsAbout?: string[];  // Key locations, clues
   }
   ```
2. Implement NPC placement algorithm:
   - Identify special rooms (large, dead-end, contains keys)
   - Place 2-4 NPCs per floor
   - Assign personality type
   - Generate dialogue
3. Add NPC interaction in DungeonMovementHandler:
   - Detect NPC on tile
   - Show dialogue UI
   - Handle dialogue choices
   - Integrate charisma checks
4. Create dialogue tree system
5. Add mind reading spell integration

---

## PART 7: EVENT MODULE SYSTEM

**Status:** ⚠️ **PARTIALLY IMPLEMENTED**

**Documentation Says:**
- Hand-authored event modules (8-12 total library)
- 2-3 modules placed per floor
- Categories: discovery, hard_choice, memory, flavor
- Module placement in special rooms
- Persist until resolved
- TypeScript interface with choices and outcomes

**Code Does:**
- Generic DungeonEvent system exists
- 6 event types: message, trap, treasure, teleport, spinner, darkness
- Events placed randomly
- No hand-authored module library
- No choice system
- No character reactions

**Action Required:**
1. Create EventModule interface (already defined in docs)
2. Create event module library (8-12 modules):
   - 3-4 discovery modules
   - 2-3 hard choice modules
   - 2-3 memory modules
   - 1-2 flavor modules
3. Implement special room identification:
   - Score rooms by size, dead-end, contains key, in dark zone
   - Select top 3-5 rooms for events
4. Implement module placement algorithm:
   - Select 2-3 modules per floor
   - Check module requirements match room
   - No duplicate modules per floor
5. Create event choice UI:
   - Display event description
   - Show available choices
   - Disable choices if requirements not met
   - Apply outcomes immediately
   - Show character reactions
6. Integrate with save system (save before event presented)

---

## PART 8: CHARACTER ABILITY SYSTEMS

### Thief Secret Detection
**Status:** ❌ **NOT IMPLEMENTED**

**Documentation Says:**
- **Passive detection:** (Level × 10)% chance when moving onto tile with secret
- **Active search:** 30% base + 20% if thief + 5% per thief level
- Search only current tile and walls
- Consumes time (encounter risk)

**Code Does:**
- No secret door system
- No passive detection
- No active search mechanic

**Action Required:**
1. Add secret doors to generation
2. Implement passive detection:
   - Check on tile entry
   - Roll against (thief level × 10)%
   - Reveal secret door if success
3. Implement active search command:
   - Add 'S' key binding
   - Check current tile walls
   - Calculate success chance
   - Consume turn (increment turn counter)
   - Risk random encounter

### Psionic Mind Reading
**Status:** ⚠️ **PARTIALLY IMPLEMENTED**

**Documentation Says:**
- Spell: Read Thoughts (costs MP)
- Reveals NPC true intentions and hidden knowledge
- Shows internal monologue
- Limited by spell points

**Code Does:**
- Spell system exists
- No mind reading spell defined
- No NPC integration

**Action Required:**
1. Define mind reading spell in spell database
2. Add mind reading effect:
   - Target: NPCs
   - Effect: Reveal hidden dialogue/intentions
   - Show internal monologue
3. Integrate with NPC dialogue system

### Charisma Social Checks
**Status:** ❌ **NOT IMPLEMENTED**

**Documentation Says:**
- Checked during NPC interactions
- NPC makes saving throw vs highest party Charisma
- Failure = more cooperative
- Success = neutral/unhelpful

**Code Does:**
- SavingThrowCalculator exists but not integrated
- No NPC interaction system

**Action Required:**
1. Implement charisma check in NPC dialogue:
   - Get highest party Charisma
   - NPC makes saving throw
   - Modify dialogue options based on result
2. Add UI feedback for failed/successful checks

---

## PART 9: SAVE SYSTEM

**Status:** ⚠️ **PARTIALLY IMPLEMENTED**

**Documentation Says:**
Save triggers:
1. Start of combat (BEFORE actions)
2. Before event choices (BEFORE selection)
3. After event resolution (AFTER outcomes applied)
4. After floor completion (stairs down)
5. When entering town
6. After combat completion

**Code Does:**
- Save system exists (SaveManager.ts)
- Saves on scene transitions
- NO save before combat
- NO save before events
- NO save after event resolution

**Action Required:**
1. Add save trigger in CombatSystem.startCombat():
   - Call SaveManager.saveGame() BEFORE combat begins
2. Add save trigger in event presentation:
   - Call SaveManager.saveGame() when event UI opens
3. Add save trigger after event resolution:
   - Call SaveManager.saveGame() after outcomes applied
4. Verify existing saves on floor transition and town entry

### Save File Format
**Status:** ✅ **MATCHES**

Current save format includes all required data:
- Party state
- Dungeon levels array
- Current floor
- Combat state
- Game time
- Turn count
- Dungeon seed

---

## PART 10: TUNABLE CONSTANTS SYSTEM

**Status:** ⚠️ **PARTIALLY IMPLEMENTED**

**Documentation Says:**
Complete constants file with 12 sections:
1. Generation constants
2. Pacing constants
3. Feature constants
4. Ability constants
5. Event constants
6. Difficulty constants
7. Save constants
8. Death constants
9. Loot constants
10. UI constants
11. Debug constants
12. Validation constants

**Code Does:**
- GameConstants.ts exists with some constants
- Many documented constants missing
- Constants scattered across files
- No centralized configuration

**Action Required:**
1. Create new file: `src/config/DungeonBalanceConstants.ts`
2. Consolidate all dungeon-related constants:
   - Move existing constants from GameConstants
   - Add missing constants from documentation
   - Organize into documented sections
3. Update all generation code to use new constants
4. Document how to tune parameters

---

## PART 11: VALIDATION & TESTING

### Solvability Validation
**Status:** ❌ **NOT IMPLEMENTED**

**Documentation Says:**
- Verify all keys reachable from entrance
- Verify stairs unlockable with available keys
- Verify no required content in unreachable locations
- Verify one-way doors don't block progression
- Regenerate if validation fails

**Code Does:**
- No validation logic
- No pathfinding checks
- No reachability tests

**Action Required:**
1. Implement solvability validator:
   ```typescript
   validateDungeonSolvability(level: DungeonLevel): boolean {
     // Check all keys reachable
     for (const key of keys) {
       if (!isReachable(entrance, key.position)) return false;
     }
     // Check stairs reachable with keys
     if (!canUnlockStairs(availableKeys)) return false;
     // Check no progression blocked by one-ways
     if (!validateOneWayDoors(level)) return false;
     return true;
   }
   ```
2. Call validator after generation
3. Retry generation if validation fails (max 3 attempts)
4. Log validation failures for debugging

### Debug Tools
**Status:** ⚠️ **PARTIALLY IMPLEMENTED**

**Documentation Says:**
- Reveal map
- Show key locations
- Noclip mode
- Skip to floor
- Regenerate floor
- Dump floor data
- Validate solvability
- Show one-way doors

**Code Does:**
- AI Interface has some debug features
- No reveal map command
- No show key locations
- No noclip mode
- No floor skip
- No solvability validator

**Action Required:**
1. Extend AI Interface with debug commands:
   ```typescript
   window.AI.debug = {
     revealMap: () => {},
     showKeys: () => {},
     noclip: (enable: boolean) => {},
     skipToFloor: (n: number) => {},
     regenerateFloor: () => {},
     dumpFloor: () => {},
     validateSolvability: () => {},
     showOneWayDoors: () => {}
   };
   ```
2. Implement debug visualizations
3. Add toggle flags in GameConstants

---

## PART 12: RENDERING & UI INTEGRATION

### Dark Zone Rendering
**Status:** ❌ **NOT IMPLEMENTED**

**Action Required:**
- Modify DungeonViewRaycast to check for dark zones
- Return black screen in dark zones
- Add transition effects

### One-Way Door Visuals
**Status:** ❌ **NOT IMPLEMENTED**

**Action Required:**
- Add visual indicator in raycasting (arrow texture?)
- Show direction in map view
- Add UI tooltip

### NPC Rendering
**Status:** ❌ **NOT IMPLEMENTED**

**Action Required:**
- Add NPC sprite rendering in 3D view
- Add NPC marker in map view
- Add interaction prompt

### Event UI
**Status:** ❌ **NOT IMPLEMENTED**

**Action Required:**
- Create modal dialogue system for events
- Show event description
- Display choice buttons
- Show character reactions after choice

---

## PART 13: ENCOUNTER SYSTEM INTEGRATION

### Override Zones
**Status:** ⚠️ **PARTIALLY IMPLEMENTED**

**Documentation Says:**
- Safe zones around entrance (no encounters)
- Boss zones in large rooms (high encounter rate + boss spawn)
- Special mob zones (custom monster groups)
- High/low frequency zones

**Code Does:**
- Override zones generated
- Encounter rates defined in constants
- NOT wired to actual encounter spawning
- No monster group filtering

**Action Required:**
1. Modify encounter logic in DungeonMovementHandler:
   - Check current tile's encounterZoneId
   - Find matching OverrideZone
   - Use zone's encounter rate
   - Filter monsters by zone's monsterGroups
2. Implement boss spawn logic:
   - Check if zone type is 'boss'
   - Spawn boss encounter instead of random
3. Implement special mob filtering:
   - Use zone's monsterGroups array
   - Only spawn monsters from that list

---

## PART 14: MISSING FEATURES (PHASE 2+)

These are documented but explicitly marked as post-MVP:

### Secret Doors (Phase 2)
- Not implemented
- Requires wall type 'secret'
- Search mechanic
- Discovery system

### Teleporters (Phase 3)
- Basic event exists
- No network system
- No visual feedback

### Environmental Effects (Phase 3)
- Not implemented
- Would include fog, sounds, descriptions

### Rescue Missions (Phase 3)
- Not implemented
- Requires party persistence in dungeon
- Alternate party creation

### Ironman Mode (Phase 3)
- Not implemented
- No reload option

---

## PART 15: PRIORITY ACTION PLAN

### CRITICAL (MVP Blockers)
**Must implement for playable MVP:**

1. **Implement Key/Lock System** (8 hours)
   - Create Key item type
   - Implement key placement algorithm
   - Lock stairs_down with gate
   - Add unlock interaction
   - Add key discovery feedback

2. **Implement One-Way Doors** (6 hours)
   - Add one-way door placement logic
   - Implement movement blocking
   - Add visual indicators
   - Validate solvability

3. **Fix Save System Triggers** (4 hours)
   - Save before combat
   - Save before events
   - Save after event resolution

4. **Create Tunable Constants File** (2 hours)
   - Consolidate all constants
   - Document tuning process
   - Update all references

**Total MVP Critical Path: ~20 hours**

### HIGH PRIORITY (MVP Polish)
**Should implement for good MVP experience:**

6. **Basic NPC Placement** (8 hours)
   - Create NPC entity
   - Implement placement algorithm
   - Add simple dialogue system
   - Add interaction UI

7. **Wire Override Zones to Encounters** (4 hours)
   - Connect zones to encounter spawning
   - Implement boss zones
   - Add safe zones

8. **Implement Solvability Validation** (4 hours)
   - Create validator function
   - Add reachability checks
   - Retry generation on failure

**Total High Priority: ~16 hours**

### MEDIUM PRIORITY (Enhanced Features)
**Nice to have for enhanced version:**

9. **Dark Zones** (6 hours)
   - Add dark zone placement
   - Modify raycasting
   - Add light source failure messages

10. **Switch/Lever System** (8 hours)
    - Create switch and gate entities
    - Implement placement algorithm
    - Add interaction logic
    - Add rendering

11. **Event Module System** (12 hours)
    - Create module library (8-12 modules)
    - Implement special room identification
    - Add event choice UI
    - Integrate with save system

12. **Character Abilities** (8 hours)
    - Thief secret detection
    - Active search mechanic
    - Charisma checks in dialogue
    - Mind reading spell

**Total Medium Priority: ~34 hours**

### LOW PRIORITY (Polish & Future)
**Can defer to post-MVP:**

13. **Secret Doors** (6 hours)
14. **Debug Tools** (4 hours)
15. **Teleporter Networks** (8 hours)
16. **Environmental Effects** (6 hours)

**Total Low Priority: ~24 hours**

---

## ESTIMATED TOTAL IMPLEMENTATION TIME

- **Critical MVP:** 20 hours
- **High Priority:** 16 hours
- **Medium Priority:** 34 hours
- **Low Priority:** 24 hours

**Total:** ~94 hours (~12 working days)

**Recommended Phasing:**
1. **Week 1:** Complete Critical MVP (playable dungeon with progression)
2. **Week 2:** Complete High Priority (polish MVP experience)
3. **Week 3+:** Medium/Low priority (enhanced features)

---

## CONCLUSION

The current implementation has a solid spatial foundation but lacks critical progression systems (keys/locks, one-way doors) and character-driven content (NPCs, events). The MVP is achievable with ~2 weeks of focused work addressing Critical and High Priority items.

**Next Steps:**
1. Review and approve this gap analysis
2. Prioritize which features to implement first
3. Begin implementation with Critical MVP items
4. Test and iterate on parameters using tunable constants

**Key Success Metrics:**
- ✅ Player must find keys to unlock stairs
- ✅ One-way doors create navigation variety
- ✅ NPCs provide guidance and character moments
- ✅ Solvability validation prevents broken dungeons
- ✅ All parameters tunable without code changes
