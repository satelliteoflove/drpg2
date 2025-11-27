# Dungeon Generation Technical Specification
## Navigation-Focused Procedural Generation

**Document Purpose:** Technical specifications and algorithm design for procedurally generating navigation-focused dungeons.

**Last Updated:** 2025-11-03

**Reference:** See `wizardry-dungeon-architecture.md` for foundational walls-on-edges architectural model.

---

## PART 1: TECHNICAL SPECIFICATIONS

### 1.1 Grid and Spatial Layout

**Grid Size:**
- 20×20 tiles per floor
- 400 total tiles available

**Floor Coverage:**
- Target: 75-85% floor tiles (300-340 navigable tiles)
- Remaining 15-25% is solid walls/negative space
- Dense packing with minimal wasted space

**Room Count and Sizes:**
- 16-30 rooms per floor (balanced for Rooms & Mazes algorithm)
- Room size distribution:
  - 40% small rooms (2×2, 3×2 = 4-6 tiles)
  - 40% medium rooms (3×3, 3×4, 4×4 = 9-16 tiles)
  - 20% large rooms (5×5, 6×6, 5×7 = 25-42 tiles)
- Average room size: ~8-10 tiles
- Total room tiles: 240-400 tiles (before corridors)

**Corridor System:**
- Minimum Spanning Tree (MST) for base connectivity
- Add 2-3 additional connections for loops
- Corridors should be 1-tile wide where possible
- Some 2-tile wide corridors acceptable for variety
- Total corridor tiles: 60-100 tiles

**Architecture:**
- Wall-on-edge system (all tiles are floors, walls are edge properties)
- Rooms have 2-tile spacing (required by Rooms & Mazes algorithm for maze corridors)
- Doors placed on room boundaries

### 1.2 Navigation Features

**Key/Lock System (Required):**
- Stairs down are locked at floor generation
- 2-3 keys required to unlock stairs (varies by floor depth)
- Keys placed in spread-out locations (min distance: 8 tiles apart)
- Lock visibility: OBVIOUS ("The stairs are blocked by a locked gate")
- Key location hints: CRYPTIC (via NPCs, notes, clues)

**Switch/Lever System (Optional per floor):**
- 0-2 switch/lever pairs per floor
- Simple 1:1 relationship (1 lever opens 1 gate)
- Proximity varies by dungeon depth:
  - Early floors (1-3): Lever and gate 3-6 tiles apart
  - Mid floors (4-6): Lever and gate 6-10 tiles apart
  - Deep floors (7+): Lever and gate 10-15 tiles apart
- Feedback: Generic message "You hear distant grinding of stone"
- Visual feedback: Gate opens with sound effect, visible in raycasting if in view

**Dark Zones (0-2 per floor):**
- Areas where raycasting is disabled (pitch black)
- Light spells and torches fail in dark zones
- Navigation by memory and drawn maps only
- No reduction in encounter rate
- Traps invisible until triggered
- Size: 3×3 to 5×5 area (9-25 tiles)
- Placement: Often contains valuable rooms (treasure, stairs, NPCs)
- Visual transition: Obvious boundary ("You step into darkness")

**One-Way Passages:**
- Doors/passages traversable in only one direction
- Creates backtracking navigation puzzles
- Placement: 2-4 per floor
- Two types:
  - **Type A - Complexity One-Ways:** Navigation puzzles in loops
  - **Type B - Shortcut One-Ways:** Quick return paths to reduce backtracking

**Traps (NOT in MVP):**
- Placed at choke points (narrow corridors, doorways, junctions)
- CAN be placed adjacent to doors (creates dramatic tension)
- Max 2 consecutive traps in a path
- Gauntlets of 3-5 traps are acceptable in high-danger areas
- Trap density increases with floor depth
- **NOTE:** Traps are deferred to post-MVP - not included in initial implementation

### 1.3 Thematic Consistency

**Theme Scope:**
- One theme per floor (minimum)
- OR one theme per 2-3 floors (preferred for cohesion)
- Theme affects:
  - Wall textures and colors (visual)
  - Encounter types (mechanical)
  - NPC types (narrative)
  - Loot tables (rewards)

**Example Themes:**
- Ancient Crypt: Undead encounters, holy items, decayed appearance, dark colors
- Goblin Warren: Goblinoid encounters, crude weapons, tribal markers, earth tones
- Abandoned Mine: Vermin/constructs, ores/tools, industrial textures, browns/grays
- Wizard Laboratory: Magical constructs, arcane items, mystical symbols, blues/purples

**Visual Variety (No Artist):**
- Different wall colors per theme
- Different texture patterns (brick, stone, wood, metal)
- Different ambient lighting colors
- Environmental text descriptions vary by theme

---

## PART 2: DUNGEON GENERATION ALGORITHM

### 2.1 Generation Phases Overview

```
Phase 1: Spatial Foundation (Rooms & Corridors)
Phase 2: Feature Placement (Doors, Stairs, Keys, Switches)
Phase 3: Hazard Placement (Traps, Dark Zones)
Phase 4: NPC & Event Placement (Character Moments)
Phase 5: Theming & Polish (Visual Variety, Descriptions)
Phase 6: Validation & Testing (Ensure solvability)
```

### 2.2 Phase 1: Spatial Foundation

**Step 1.1: Room Generation**
```
Input: Floor number, theme, target room count (16-30)

Process:
1. Generate room sizes from distribution:
   - Roll for room size: 40% small, 40% medium, 20% large
   - Width/height within size category

2. Place rooms using random placement with collision detection:
   - Start with largest rooms first
   - Place in random positions
   - Check for collisions with existing rooms
   - Maintain 2-tile spacing between rooms (for maze corridor generation)
   - Retry if collision within spacing requirement
   - Max retries: 100 per room

3. Continue until:
   - Target room count reached, OR
   - Floor coverage reaches 85%, OR
   - Placement attempts exhausted

Output: List of rooms with (x, y, width, height)
```

**Step 1.2: Room Connectivity (MST)**
```
Input: List of rooms

Process:
1. Calculate room centers (centroid of each room)
2. Build complete graph of distances between all room centers
3. Run Minimum Spanning Tree algorithm (Kruskal's or Prim's)
4. MST provides base connectivity (all rooms reachable)

Output: List of room pairs to connect (MST edges)
```

**Step 1.3: Corridor Carving**
```
Input: Room connection list from MST

Process:
1. For each room pair connection:
   - Use A* pathfinding to connect room centers
   - Prefer axis-aligned paths (Manhattan distance)
   - Carve 1-tile wide corridor
   - If blocked, try 2-tile wide corridor

2. Add corridors to floor map

Output: Floor map with rooms and corridors
```

**Step 1.4: Loop Creation**
```
Input: Floor map with MST corridors

Process:
1. Identify remaining unconnected room pairs with short distances
2. Sort by distance
3. Add 2-3 additional connections:
   - Creates loops in dungeon
   - Enables multiple paths
   - Prevents single chokepoints

4. Carve additional corridors

Output: Floor map with loops
```

**Step 1.5: Wall Placement**
```
Input: Floor map with navigable tiles marked

Process:
1. For each tile edge:
   - If one side is navigable and other is not → place wall
   - Store walls as edge properties (not solid tiles)

2. Generate wall adjacency data for raycasting

Output: Complete spatial foundation with walls on edges
```

### 2.3 Phase 2: Feature Placement

**Step 2.1: Stairs Placement**
```
Input: Floor map, floor number

Process:
1. Stairs UP (entrance):
   - Placed at edge/corner of floor
   - First room players enter
   - Mark as entrance room

2. Stairs DOWN (exit - LOCKED):
   - Placed far from entrance (distance > 15 tiles)
   - Prefer: Large room, central location, or isolated area
   - Add locked gate blocking stairs
   - Mark as exit room

Output: Entrance and exit locations, exit locked
```

**Step 2.2: Key Placement**
```
Input: Floor map, floor number

Process:
1. Determine number of keys needed:
   - Early floors (1-3): 1 key
   - Mid floors (4-6): 2 keys
   - Deep floors (7+): 2-3 keys

2. Place keys in spread-out locations:
   - Minimum distance between keys: 8 tiles
   - Minimum distance from stairs: 10 tiles
   - Prefer: Dead-end rooms, rooms in dark zones, rooms with NPCs

3. For each key, tag the room with distinctive feature:
   - "carved pillars", "collapsed corner", "dark altar", etc.
   - Tag used for NPC clues

Output: Key locations with room feature tags
```

**Step 2.3: Switch/Lever Placement (Optional)**
```
Input: Floor map, floor number

Process:
1. Decide if floor has switches: 50% chance
2. If yes, place 1-2 switch/gate pairs:

   For each pair:
   a. Place gate blocking a corridor or door
      - Choose strategic location (blocks alternate path)

   b. Place lever based on floor depth:
      - Early floors: 3-6 tiles from gate
      - Mid floors: 6-10 tiles from gate
      - Deep floors: 10-15 tiles from gate

   c. Link lever to gate (ID reference)

Output: Switch/gate pairs with linkage data
```

**Step 2.4: Door Placement**
```
Input: Floor map with rooms and corridors

Process:
1. Place doors at room entrances:
   - Every room-to-corridor boundary: door
   - Some room-to-room boundaries: door (50% chance)

2. Door types:
   - Standard: Opens both directions

3. One-Way Doors (two types):

   Type A - Complexity One-Ways (navigation puzzles):
   - Place 1-2 per floor
   - Located on alternate routes in loops
   - Forces player to find different path back
   - Never on only path to required content

   Type B - Shortcut One-Ways (reduce backtracking):
   - Place 1-2 per floor
   - Located in far rooms (12+ tiles from stairs)
   - Creates quick return path toward stairs/entrance
   - Can only be used as return route, not to skip exploration

   Placement algorithm:
   a. Identify loops (from MST + additional connections)
   b. Select 1-2 loop connections for Type A one-ways
   c. Verify solvability (remove doesn't break progression)
   d. Identify far rooms (distance > 12 tiles)
   e. Create corridors from 1-2 far rooms toward stairs
   f. Make these corridors one-way (Type B shortcuts)

Output: Doors placed on walls, including 2-4 one-way doors
```

### 2.4 Phase 3: Hazard Placement

**Step 3.1: Dark Zone Placement**
```
Input: Floor map, floor number

Process:
1. Number of dark zones (reduced frequency):
   - Early floors (1-3): 0-1 dark zones (33% chance)
   - Mid floors (4-6): 0-2 dark zones (66% chance)
   - Deep floors (7+): 1-2 dark zones (100% chance)

2. For each dark zone:
   - Size: 3×3 to 5×5 area
   - Location: Area with 2-3 rooms and connecting corridors
   - Contains valuable content: key, treasure, or NPC

3. Mark all tiles in zone as "dark"
   - Raycasting disabled in these tiles
   - Light spells and torches fail
   - Display failure messages when attempted:
     * Torch: "You try to light a torch, but the flame sputters and dies.
              The darkness here is unnatural."
     * Spell: "The light spell fizzles, its energy dissipating into the
              oppressive darkness."
   - Entry message: "You step into absolute darkness. Your light source is useless."

Output: Dark zone boundaries marked
```

**Step 3.2: Trap Placement (OPTIONAL - Not in MVP)**
```
Input: Floor map with corridors and doors

NOTE: Traps are DISABLED for MVP implementation. Include this algorithm for future reference.

Process (when enabled):
1. Identify trap candidate locations:
   - Narrow corridors (1-tile wide)
   - Doorway approaches (including adjacent to doors - allowed for drama)
   - Junction points (3+ direction choices)
   - Corners

2. Place traps with density based on floor depth:
   - Early floors: 5-8 traps
   - Mid floors: 8-12 traps
   - Deep floors: 12-20 traps

3. Rules:
   - Max 2 consecutive traps on same path (unless gauntlet)
   - Gauntlet zones (optional): 3-5 consecutive traps
   - Trap types vary: spike, pit, poison, alarm, etc.

Output: Trap locations and types (when implemented)
```

### 2.5 Phase 4: NPC & Event Placement

**Step 4.1: Identify Special Rooms**
```
Input: Floor map with all features placed

Process:
1. Candidate rooms for events:
   - Larger rooms (5×5 or bigger)
   - Dead-end rooms with treasure/features
   - Central chambers
   - Rooms in dark zones

2. Score each candidate:
   - Size: +1 per tile over 16
   - Dead-end: +3
   - Contains key: +5
   - In dark zone: +4
   - Distance from entrance: +1 per 5 tiles

3. Select top 3-5 rooms as special rooms

Output: List of special rooms for events
```

**Step 4.2: Select Event Modules**
```
Input: Special room list, event module library

Process:
1. Roll for number of events this floor: 2-3 events
2. For each event slot:
   - Randomly select module from library
   - Check module requirements match room
   - Ensure no duplicate modules on same floor

3. Assign module to special room

Output: Module assignments to rooms
```

**Step 4.3: Place NPCs**
```
Input: Floor map, event modules assigned

Process:
1. For each event module that requires NPC:
   - Place NPC in assigned room
   - Set NPC personality (truthful, deceitful, helpful, etc.)
   - Generate NPC dialogue based on module

2. Additional flavor NPCs (optional):
   - 1-2 extra NPCs for atmosphere
   - Not tied to progression
   - Provide lore, warnings, or character moments

Output: NPC locations with dialogue data
```

**Step 4.4: Scatter Clues and Information**
```
Input: Key locations with feature tags, NPC locations

Process:
1. For each key, determine clue method:
   - 60%: NPC dialogue
   - 30%: Written note/inscription
   - 10%: Environmental clue (visual in room)

2. Generate clue text:
   - Reference room feature tag
   - Cryptic but solvable
   - Example: "The key lies beneath the carved pillars"

3. Place clues:
   - Assign to NPC dialogue
   - Or place note object in another room

Output: Clues distributed across floor
```

### 2.6 Phase 5: Theming & Polish

**Step 5.1: Apply Visual Theme**
```
Input: Floor map, theme selection

Process:
1. Assign wall textures based on theme:
   - Crypt: Dark stone, decay
   - Warren: Rough earth, crude wood
   - Mine: Industrial stone, metal supports
   - Laboratory: Smooth walls, arcane symbols

2. Assign wall colors (palette per theme)
3. Generate ambient descriptions per room:
   - Template descriptions with theme variations
   - Example: "The [crypt_adjective] chamber [crypt_detail]"

Output: Visual and textual theme data per tile/room
```

**Step 5.2: Generate Room Descriptions**
```
Input: Rooms with features and theme

Process:
1. For each room, generate text description:
   - Size and shape
   - Wall appearance (theme)
   - Features present (doors, stairs, NPCs, objects)
   - Atmospheric details (sounds, smells, decay)

2. Special rooms get enhanced descriptions:
   - More detail and character
   - Hint at significance

3. Store descriptions per room ID

Output: Room description database
```

### 2.7 Phase 6: Validation & Testing

**Step 6.1: Solvability Check**
```
Input: Complete floor map

Process:
1. Verify all keys are reachable:
   - Run pathfinding from entrance to each key
   - If key unreachable, regenerate or move key

2. Verify stairs are unlockable:
   - Check keys can be collected
   - Check levers can reach gates (if gating progression)

3. Verify no required content in impossible locations:
   - No required NPCs in unreachable rooms
   - No progression items trapped by one-way doors

Output: Pass/fail solvability
If fail: Log error and regenerate floor
```

**Step 6.2: Difficulty Balancing**
```
Input: Complete floor map, floor number

Process:
1. Calculate floor difficulty score:
   - Trap count
   - Dark zone coverage
   - Key distance from entrance
   - Number of required interactions

2. Compare to target difficulty for floor number
3. Adjust if too easy/hard:
   - Add/remove traps
   - Add/remove dark zones
   - Adjust key placement

Output: Balanced floor difficulty
```

**Step 6.3: Final Cleanup**
```
Input: Validated floor map

Process:
1. Remove unreachable rooms (if any)
2. Optimize wall data structures for rendering
3. Generate minimap data
4. Serialize floor to dungeon file

Output: Complete, playable dungeon floor
```

---

## PART 3: DATA STRUCTURES

### 3.1 Floor Data Structure

**Complete Floor Definition:**
```typescript
interface DungeonFloor {
  floorNumber: number;
  gridSize: { width: number; height: number };
  theme: ThemeType;
  tiles: Tile[][];
  rooms: Room[];
  corridors: Corridor[];
  features: {
    stairs: { up: Position; down: Position };
    keys: Key[];
    switches: SwitchGatePair[];
    darkZones: DarkZone[];
    traps: Trap[];
    npcs: NPC[];
    events: EventModule[];
  };
  metadata: {
    roomCount: number;
    coveragePercent: number;
    difficulty: number;
    seed: string;
  };
}
```

### 3.2 Feature Structures

**Event Module:**
```typescript
interface EventModule {
  id: string;
  category: 'discovery' | 'hard_choice' | 'memory';
  roomId: string;
  description: string;
  choices: EventChoice[];
  progressionType: 'required' | 'optional' | 'flavor';
}
```

**NPC Definition:**
```typescript
interface NPC {
  id: string;
  position: Position;
  personality: 'truthful' | 'deceitful' | 'helpful' | 'hostile';
  dialogue: DialogueTree;
  linkedEvent?: string;
  knowsAbout?: string[];  // Key locations, clues, etc.
}
```

**Key Definition:**
```typescript
interface Key {
  id: string;
  position: Position;
  roomFeatureTag: string;  // For NPC clues
  required: boolean;
}
```

**Switch/Gate Pair:**
```typescript
interface SwitchGatePair {
  switchId: string;
  switchPosition: Position;
  gateId: string;
  gatePosition: Position;
  activated: boolean;
}
```

**Dark Zone:**
```typescript
interface DarkZone {
  id: string;
  bounds: { x: number; y: number; width: number; height: number };
  tiles: Position[];
}
```

### 3.3 Generation Configuration

**Configurable Parameters (for testing/tuning):**
```typescript
interface GenerationConfig {
  gridSize: number;  // Default: 20
  targetRoomCount: { min: number; max: number };  // Default: 16-30
  targetCoverage: { min: number; max: number };  // Default: 75-85%
  roomSizeDistribution: {
    small: number;   // Default: 40%
    medium: number;  // Default: 40%
    large: number;   // Default: 20%
  };
  loopConnectionCount: { min: number; max: number };  // Default: 2-3
  keyCount: (floorNumber: number) => number;
  darkZoneCount: (floorNumber: number) => number;
  eventCount: { min: number; max: number };  // Default: 2-3
  switchPairProbability: number;  // Default: 50%
  oneWayDoorCounts: {
    complexity: { min: number; max: number };  // Default: 1-2
    shortcut: { min: number; max: number };    // Default: 1-2
  };
}
```

---

## PART 4: TESTING & VALIDATION

### 4.1 Automated Tests

**Required Test Suite:**
1. **Solvability test:** All keys reachable, stairs unlockable
2. **Coverage test:** Floor coverage within target range (75-85%)
3. **Connectivity test:** All rooms reachable from entrance
4. **Feature placement test:** Required features present and valid
5. **Theme consistency test:** All tiles have valid theme data
6. **One-way door test:** No progression blocked by one-way doors

### 4.2 Manual Playtest Criteria

**Validation Checklist:**
1. Can player navigate to all keys?
2. Do NPCs provide solvable clues?
3. Are character moments spaced appropriately?
4. Does difficulty feel appropriate for floor depth?
5. Are save points working correctly?
6. Do one-way shortcuts reduce tedious backtracking?

### 4.3 Debug Tools

**Recommended Debug Features:**
```typescript
interface DebugTools {
  revealMap: boolean;           // Show entire floor map
  showKeyLocations: boolean;    // Highlight key positions
  noclip: boolean;             // Walk through walls
  skipToFloor: (n: number) => void;
  regenerateFloor: () => void;
  dumpFloorData: () => void;   // Export floor JSON
  validateSolvability: () => boolean;
  showOneWayDoors: boolean;     // Highlight one-way doors
}
```

**Debug Commands (for AI Interface):**
```typescript
window.AI.debug = {
  generateFloor: (seed: string) => DungeonFloor,
  testSolvability: () => boolean,
  listKeys: () => Key[],
  listNPCs: () => NPC[],
  showEventModules: () => EventModule[],
  showOneWayDoors: () => Door[],
};
```

---

## PART 5: PERFORMANCE CONSIDERATIONS

### 5.1 Generation Time

**Target:** <500ms to generate floor

**Optimization Strategies:**
- Most expensive operation: Room placement with collision detection
- Optimization: Spatial hashing for collision checks
- Fallback: If generation fails after N attempts, use simpler algorithm

### 5.2 Memory Usage

**Resource Management:**
- Each floor ~50-100KB serialized
- Could cache 3-5 floors in memory
- Lazy load floors as needed
- Serialize to localStorage for web build

### 5.3 Rendering Performance

**Raycasting Optimization:**
- Raycasting is computationally expensive
- Dark zones reduce raycasting load (helpful!)
- Optimize: Only raycast visible tiles
- Future: WebGL shader-based raycasting

---

**Version:** 1.1 (Integrated from Requirements)
**Date:** 2025-11-03
**Author:** Collaborative design session (Christopher + Claude)
**Status:** Ready for implementation
