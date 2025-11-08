Wizardry-Style Dungeon Generation System Design

Based on detailed analysis of Wizardry Gaiden IV Tower of Witchcraft Floor F1

## WGIV F1 Map Analysis

### Grid Structure
- Dimensions: 24x24 cells (coordinates 0-23)
- Total cells: 576
- Floor cells: approximately 250-280 (43-49%)
- Wall cells: approximately 290-320 (50-55%)
- Border: Solid rock perimeter (cells at x=0, x=23, y=0, y=23 are always solid)

### Room Inventory

Large Rooms (8x8 or larger):
1. Northwest Corner Room: (1-7, 20-23) = 7x4 room
2. Northeast Corner Room: (17-23, 18-23) = 7x6 room
3. Southeast Large Room: (17-23, 10-15) = 7x6 room
4. Southwest Large Room: (1-8, 8-12) = 8x5 room
5. Center-West Room: (1-7, 14-18) = 7x5 room

Medium Rooms (4x4 to 7x7):
1. Center Room Complex: (9-15, 11-16) = 7x6 with internal walls creating sub-areas
2. North-Central Room: (10-14, 18-21) = 5x4
3. South-Central Room: (9-13, 1-4) = 5x4
4. East-Central Room: (20-23, 13-17) = 4x5
5. Multiple 3x4 and 4x5 rooms scattered throughout

Small Rooms (2x3 to 3x4):
- Junction rooms connecting corridors
- Dead-end reward rooms
- Approximately 10-15 small rooms total

### Room Placement Patterns

Strategic Positioning:
1. Large rooms in corners and along edges
2. Center area has medium-sized room complex
3. Rooms avoid direct adjacency (minimum 1-cell corridor between)
4. Roughly symmetrical distribution around center axis

Room Spacing:
- Minimum 1 cell between rooms (for corridor walls)
- Most rooms have 2-3 cells between them
- Allows for corridor network without cramped feeling

Room Shapes:
- Predominantly rectangular
- Width:Height ratios typically between 1:1 and 2:1
- Very few perfect squares
- Some L-shaped or irregular rooms created by internal walls

### Corridor Network

Corridor Characteristics:
- All corridors are 1 cell wide
- Corridors run along cardinal directions (N/S/E/W)
- No diagonal corridors
- Corridors have full walls on both sides

Connection Strategy:
1. Main circulation corridor: Roughly circular path around center
2. Branch corridors connecting to rooms
3. Some dead-end corridors leading to rewards
4. Multiple paths between major areas (not strictly tree structure)

Corridor Junctions:
- T-junctions: Most common, connect 3 directions
- 4-way intersections: Less common, typically at major circulation points
- L-turns: Common for changing direction
- Dead ends: About 8-10 throughout the map

### Door Placement Analysis

Door Count: Approximately 15-20 doors visible on map

Door Locations:
1. Room Entrances: Every door is at a room entrance/exit
2. Wall Position: Doors are always ON walls, not in floor space
3. Strategic Placement: Control access to important areas

Door Placement Rules (inferred):
1. Large rooms: 2-4 doors, typically on different walls
2. Medium rooms: 1-3 doors
3. Small rooms: 1-2 doors
4. Dead-end rooms: Exactly 1 door
5. Corridor rooms: Doors at both ends

Door Types (from legend):
- Normal doors: Can be opened
- Locked doors: Require keys or switches
- One-way doors: Can only pass in one direction
- Gates: Controlled by switches

Specific Door Positions:
- Never in corners (always along wall centers or offset)
- Typically centered on wall segment
- Allow clear line of sight into/out of room
- Positioned to control traffic flow

### Special Tile Distribution

Stairs:
- Stairs Down: (11, 22) - North-central area, accessible from main circulation
- Stairs Up: Multiple locations in blue zone (bottom center) around (10-12, 2)
- Placement: Always in rooms or major junctions, never in narrow corridors

Teleporters (Color-coded puzzle system):
- Yellow teleporters: (10, 17) and (15, 17) - Paired system in north area
- Purple teleporters: (7, 13) and (13, 13) - Paired system in center
- Green teleporters: (7, 7) and (17, 7) - Paired system in south
- Blue zone: (10-12, 1-4) - Special area with multiple teleport points

Traps:
- Clustered in specific areas (not evenly distributed)
- Often in corridors leading to valuable areas
- Multiple traps in sequence create "trap runs"
- Typical clusters: 3-5 traps in nearby cells

Switches:
- Positioned to require backtracking to activate
- Control gates, traps, or teleporter networks
- Strategic placement for puzzle-solving
- Usually in side rooms or dead ends

Dark Encounter Zones:
- Marked by darker/hatched floor areas on map
- Indicate dangerous enemy spawn zones
- Placed strategically to challenge players
- Multiple zones throughout level

### Puzzle Design Elements

Teleporter Puzzles:
- Color-coded teleporter pairs
- Yellow switches control yellow teleporters
- Requires mapping and experimentation
- Creates non-linear exploration

Gate Puzzles:
- Switches unlock gates in distant areas
- Requires backtracking through dungeon
- Multiple switches may be required (AND logic)
- Gate positions shown in legend

Trap Sequences:
- Multiple traps create challenging passages
- Rewards typically beyond trap sequences
- Can be disabled by switches
- Tests player resource management

Progression Gating:
- Locked doors control access to areas
- Keys or switches required to progress
- Creates intentional exploration order
- Prevents sequence breaking

## Generation Algorithm Design

Based on WGIV patterns, here's a generation system that could create similar dungeons:

### Phase 1: Initialize Grid

```
1. Create 24x24 grid (configurable size)
2. All cells start as SOLID (impassable rock)
3. All wall properties start as {exists: true, type: 'solid'}
4. Border cells remain solid (outer perimeter)
```

### Phase 2: Place Major Rooms

**Preparatory Steps (must be completed first):**

1. **Simplify DungeonTile.type structure:**
   - Change tile.type from 10 types to 2: `'floor' | 'solid'`
   - Remove: 'door', 'stairs_up', 'stairs_down', 'chest', 'trap', 'event', 'corridor', 'wall'
   - Move special tiles to new `special` property on DungeonTile
   - Update all code that checks tile.type for special tiles (DungeonMovementHandler, DungeonScene, etc.)

2. **Add required interfaces to GameTypes.ts:**
   - Room interface (see Appendix B.3 for structure)
   - DungeonGenerationConfig interface (see Configuration section)

3. **Important:** Replace existing DungeonGenerator completely (not V2)
   - No need to preserve old generator
   - Breaking changes acceptable during development
   - Keep same public API: `generateLevel(level: number): DungeonLevel`

```
Algorithm: Strategic Room Placement
(Uses DungeonGenerationConfig interface - see Configuration section)

Input: Room size categories (large, medium, small)
Output: List of placed rooms with positions

1. Define room templates (see Data Structures section for Room interface):
   - Large: 6x6 to 8x8
   - Medium: 4x5 to 6x6
   - Small: 3x3 to 4x4

2. Place large rooms first:
   - Try corners first (NW, NE, SW, SE)
   - Try edge midpoints (N, E, S, W)
   - Try center area
   - Ensure minimum 2-cell spacing between rooms (see Appendix A.1 for overlap detection)
   - Use strategic placement algorithm (see Appendix A.2)
   - Place 3-5 large rooms

3. Place medium rooms:
   - Fill in gaps between large rooms
   - Try to create roughly even distribution
   - Maintain 2-cell spacing
   - Place 5-8 medium rooms

4. Place small rooms:
   - Fill remaining suitable spaces
   - Create junction rooms for corridors
   - Some will be dead-end reward rooms
   - Place 8-12 small rooms

For each room placement:
   - Convert cells to FLOOR type
   - Set all wall properties to {exists: false} (will be recalculated)
   - Store room bounds for later reference
```

**Implementation Details:**

- **Seeded Randomness:** Use `this.rng.random()` everywhere (not `Math.random()`) for reproducible dungeons
- **Strategic Positions:** See Appendix A.2 for complete strategic placement algorithm
- **Overlap Detection:** See Appendix A.1 for overlap checking with spacing buffer
- **Room ID Generation:** Assign unique IDs (e.g., "large_1", "medium_3", "small_7")
- **Fallback Behavior:** If strategic placement fails after trying all positions, attempt random placement (max 100 attempts per room)

**Room Carving Process:**

For each placed room:
1. Iterate through all tiles in room bounds (x to x+width, y to y+height)
2. Set tile.type = 'floor'
3. Set all four walls to `{exists: false, type: 'solid', properties: null}`
   (Walls will be recalculated in Phase 4 based on neighbors)
4. Store Room object in `this.rooms` array for use in later phases

**Post-Phase 2 State:**

After Phase 2 completes:
- Dungeon consists of disconnected room islands (floor tiles)
- Solid rock fills all space between rooms
- No corridors exist (rooms are not connected)
- **Game is unplayable at this stage** (expected - Phase 3 adds connectivity)
- Border cells remain SOLID throughout
- Rooms are stored but not yet linked

**Verification Strategy:**

Phase 2 produces unplayable dungeons (no connectivity). Verify correctness via:

1. **AI Interface Inspection:**
   ```javascript
   const dungeon = AI.getDungeon();
   // Check room count, positions, verify no overlaps
   // Inspect tile types (should be 'floor' in rooms, 'solid' elsewhere)
   ```

2. **Unit Tests:**
   - Room count matches config ranges (3-5 large, 5-8 medium, 8-12 small)
   - No room overlaps exist
   - All rooms have minimum 2-cell spacing maintained
   - All rooms within grid bounds (not touching borders)
   - Room size distribution matches configuration
   - All room tiles are 'floor' type
   - All non-room tiles remain 'solid' type

3. **Visual Debugging (optional):**
   - Add temporary debug render mode showing room rectangles
   - Color-code by room type (large=red, medium=yellow, small=green)
   - Display room IDs and boundaries

### Phase 3: Carve Corridor Network

```
Algorithm: Corridor Carving with Guaranteed Connectivity

Input: List of placed rooms
Output: Connected corridor network

1. Build room graph:
   - Each room is a node
   - Calculate distances between room centers
   - Find nearest neighbors for each room

2. Create minimum spanning tree:
   - Use Prim's or Kruskal's algorithm
   - Ensures all rooms connected
   - Minimizes total corridor length

3. Add extra connections:
   - Add 20-30% more connections beyond MST
   - Creates loops and alternate paths
   - Adds redundancy for interesting layout

4. Carve corridors:
   For each connection in graph:
     a. Find path from room A door to room B door
     b. Use A* with preference for:
        - Straight lines
        - Avoiding cutting through rooms
        - Following existing corridors when possible
     c. Carve 1-wide corridor
     d. Ensure corridor has walls on both sides

Note: Junction room creation and connectivity validation are handled in Phase 8
```

### Phase 4: Calculate Wall Properties

```
Algorithm: Wall-on-Edge Calculation

For each floor cell at (x, y):

   North wall:
      if (y-1).type == SOLID:
         cell.northWall = {exists: true, type: 'solid'}
      else:
         cell.northWall = {exists: false}

   South wall:
      if (y+1).type == SOLID:
         cell.southWall = {exists: true, type: 'solid'}
      else:
         cell.southWall = {exists: false}

   East wall:
      if (x+1).type == SOLID:
         cell.eastWall = {exists: true, type: 'solid'}
      else:
         cell.eastWall = {exists: false}

   West wall:
      if (x-1).type == SOLID:
         cell.westWall = {exists: true, type: 'solid'}
      else:
         cell.westWall = {exists: false}

Note: Ensure wall symmetry:
   if cell[x,y].eastWall.exists, then cell[x+1,y].westWall.exists
```

**Implementation Notes:**

1. **This is a recalculation phase:**
   - Phase 2 (carveRoom) sets walls to {exists: false} temporarily
   - Phase 3 (carveCorridorBetweenRooms) sets walls to {exists: false} temporarily
   - Phase 4 (calculateWalls) is the authoritative calculation based on neighbors
   - Phase 2/3 wall setting is not strictly necessary but doesn't break anything

2. **Implicit vs Explicit Symmetry:**
   - Design doc Appendix A.6 shows explicit symmetry (updating both sides)
   - Current implementation uses implicit symmetry (each tile calculates independently)
   - Both approaches work correctly
   - Implicit is simpler, explicit is more defensive

3. **Floor Tiles Only:**
   - Only processes tiles where type === 'floor'
   - Solid tiles keep initial state (all walls exist = true)
   - This is correct: solid rock should be impenetrable from all sides

4. **Optimization Opportunity:**
   - Phase 2/3 could skip wall setting entirely (will be recalculated anyway)
   - Current approach works but does redundant operations
   - Not a bug, just inefficient

### Phase 5: Place Doors

```
Algorithm: Strategic Door Placement

Input: Rooms and corridors
Output: Doors placed on walls

1. Identify room-corridor boundaries:
   For each room:
      a. Find cells where room floor meets corridor floor
      b. These are potential door locations
      c. Group adjacent potential locations

2. Select door positions:
   For each room:
      a. Large rooms: Place 2-4 doors
      b. Medium rooms: Place 1-3 doors
      c. Small rooms: Place 1-2 doors
      d. Prefer doors on different walls
      e. Avoid doors in corners

3. Place doors:
   For each selected position:
      a. Determine which wall (N/S/E/W)
      b. Set wall property: {exists: true, type: 'door', locked: false, open: false}
      c. Update adjacent cell's opposite wall property

4. Designate locked doors:
   - 10-20% of doors start locked
   - Locked doors should gate progression
   - Place keys or switches to unlock
```

**Implementation Notes:**

1. **Wizardry Door Mechanics:**
   - Doors are thresholds, not toggleable barriers
   - Interact key causes instant passage through door
   - Doors auto-close behind player immediately
   - 3x encounter multiplier when passing through doors
   - Normal movement (arrow keys) always blocked by doors
   - Only interact key opens and passes through doors

2. **Door Opening Mechanisms (openMechanism field):**
   - `'player'` (default): Auto-close doors opened by player interaction
     - Always render as closed (snap back after passage)
     - Always block raycasting (appear solid in 3D view)
     - Require interact key to pass through
   - `'key'`: Locked doors requiring key items
     - Block passage with "The door is locked." message
     - Future work: Implement key system and unlock mechanism
   - `'lever'`: Doors controlled by switches/levers
     - Remain open when activated by lever
     - Render as open and allow ray passage when open
     - Future work: Implement lever system
   - `'event'`: Doors controlled by game events
     - Remain open when triggered by game event
     - Render as open and allow ray passage when open
     - Future work: Implement event trigger system

3. **Door Passage Animation:**
   - Uses existing TurnAnimationController for smooth movement
   - Door passage state tracked in DungeonScene during animation
   - Door renders as open only during passage animation frame
   - Movement completes, then door snaps back to closed appearance

4. **Encounter System Integration:**
   - `handleDoorPassage()` method in DungeonMovementHandler
   - Calls `checkForEncounterWithMultiplier(3.0)` after movement
   - Base encounter rate multiplied by 3.0 for door passage
   - Makes door exploration riskier than normal hallway movement

5. **Rendering Integration:**
   - RaycastEngine detects wall type and opening mechanism
   - Player-openable doors always block rays (appear closed)
   - Lever/event doors allow ray passage when open
   - DungeonViewRaycast checks door passage state for texture selection
   - Doors render as 'door' texture normally, 'brick' texture when passing through

6. **Future Work:**
   - Key system: Inventory items that unlock specific doors
   - Lever system: Switches that permanently open/close doors
   - Event system: Game triggers that control door states
   - One-way doors: Allow passage in only one direction
   - Hidden/secret doors: Require discovery before interaction

### Phase 6: Place Special Tiles

```
Algorithm: Strategic Special Tile Placement

1. Place Stairs:
   Stairs Down:
      - Place in center-north area if floor 1
      - Place in accessible room or major junction
      - Never in dead ends or behind locked doors initially

   Stairs Up:
      - Place in different area from stairs down
      - Can be in more hidden location
      - Rewards exploration

2. Place Teleporter Network:
   For each teleporter color (4-6 colors):
      a. Select 2 locations for paired teleporters
      b. Place in separate areas of dungeon
      c. Ensure both locations accessible
      d. Create puzzle by requiring switch activation
      e. Store teleporter mappings

3. Place Traps:
   Trap clusters:
      a. Identify high-value areas (near stairs, treasure)
      b. Identify corridor approaches to these areas
      c. Place 3-5 traps in sequence
      d. Some traps in rooms near treasure
      e. About 15-25 traps total for 24x24 dungeon

4. Place Switches:
   For each puzzle element (gate, teleporter, trap set):
      a. Place switch in different area
      b. Requires backtracking to activate
      c. Provide subtle hints (message, map marker)
      d. About 8-12 switches total

5. Place Treasure:
   - In dead-end rooms (reward exploration)
   - Behind trap sequences
   - In locked rooms
   - Beyond teleporter puzzles
```

**Implementation Status:**

✅ **Phase 6.1: Strategic Stairs Placement - COMPLETE**

Strategic stairs placement replaces random placement with intelligent positioning:

1. **Floor 1 Stairs:**
   - `stairs_down` placed in center-north area when possible
   - Falls back to medium/large rooms if no center-north rooms available
   - `stairs_up` placed in different room from stairs_down
   - Both stairs avoid small rooms for better navigation

2. **Other Floors:**
   - Both stairs placed in medium/large rooms (never small rooms)
   - `stairs_down` placed far from `stairs_up` to encourage exploration
   - Uses Manhattan distance calculation
   - Selects from top third of most distant rooms for variety

3. **Helper Methods:**
   - `findCenterNorthRooms()`: Identifies rooms in center-north quadrant
   - `getTileInRoom()`: Finds valid floor tile within room bounds
   - `getDistanceFromPoint()`: Calculates Manhattan distance for placement

✅ **Phase 6.5: Strategic Treasure Placement - COMPLETE**

Treasure chests placed strategically to reward exploration:

1. **Placement Strategy:**
   - Prioritize dead-end rooms (rooms with only 1 door)
   - Then place in rooms distant from stairs
   - 3-6 chests per dungeon level
   - Never place in rooms that already have special tiles

2. **Treasure Scaling:**
   - Base gold: 50
   - Level multiplier: dungeon_level × 30
   - Random variance: 0-100 gold
   - Example: Floor 3 chest = 50 + 90 + variance = 140-240 gold

3. **Helper Methods:**
   - `findDeadEndRooms()`: Identifies rooms with single door
   - `findStairsPosition()`: Locates stairs for distance calculation
   - `hasTileWithSpecial()`: Prevents overwriting existing special tiles
   - `calculateChestGold()`: Scales gold by dungeon level
   - `calculateChestItems()`: Placeholder for future item generation

4. **Integration:**
   - Called after `placeStairs()` in generation pipeline
   - Before `placeSpecialTiles()` to avoid conflicts
   - Uses room metadata from Phase 2

✅ **Phase 6.3: Strategic Trap Clusters - COMPLETE**

Strategic trap placement creates risk/reward gameplay by clustering traps near valuable areas:

1. **High-Value Target Identification:**
   - Identifies rooms containing stairs (entry/exit points)
   - Identifies rooms containing chests (treasure locations)
   - These rooms become targets for trap protection

2. **Corridor Approach Traps:**
   - Scans 3-tile radius around high-value rooms
   - Identifies corridor tiles leading to valuable rooms
   - Places 3-5 trap sequences along approaches
   - Creates "trap runs" that challenge players before rewards

3. **Room-Based Traps:**
   - Places 1-2 traps inside treasure rooms
   - Random placement within room bounds
   - Creates tension when collecting loot

4. **Trap Difficulty Scaling:**
   - Base damage: 5 + (level × 2) + random variance (0-5)
   - Trap types: 60% spike, 30% poison, 10% paralysis
   - Poison: 30% + (level × 5%) status chance, 3 + level duration
   - Paralysis: 20% + (level × 3%) status chance, 2 turn duration
   - All traps are reusable (not one-time)

5. **Trap Density:**
   - Target count: 15-25 traps for 24x24 dungeon
   - Scales proportionally with dungeon size
   - Formula: (width × height / 576) × (15 + random(10))

6. **Helper Methods:**
   - `identifyHighValueRooms()`: Finds rooms with stairs/chests
   - `getCorridorApproaches()`: Identifies approach tiles within distance
   - `generateTrapProperties()`: Creates scaled trap with type/damage/status
   - `placeTrapClusters()`: Orchestrates strategic placement

7. **Integration:**
   - Called after `placeChests()` in generation pipeline
   - Before `placeSpecialTiles()` to avoid conflicts
   - Marks rooms with `specialTiles` array for tracking

**Pending Implementation:**

- Phase 6.2: Teleporter Network (color pairing, bidirectional links)
- Phase 6.4: Switch System (controls for doors/teleporters/gates)

### Phase 7: Create Encounter Zones

```
Algorithm: Encounter Zone Designation

1. Divide dungeon into regions:
   - Entrance area: Low danger
   - Mid-level areas: Medium danger
   - Deep areas: High danger
   - Boss areas: Extreme danger

2. Create encounter zones:
   For each region:
      a. Identify contiguous floor areas
      b. Assign difficulty level
      c. Assign monster groups for spawning
      d. Set spawn rates
      e. Mark zones on map (for visualization)

3. Balance difficulty curve:
   - Ensure progression of difficulty
   - Place tough encounters guarding rewards
   - Create safe areas near stairs/healing
```

### Phase 8: Validation and Polish

```
Algorithm: Ensure Playability

1. Create junction rooms (deferred from Phase 3):
   - Where corridors cross, expand to 2x2 or 3x3
   - Makes navigation clearer
   - Provides tactical combat spaces

2. Connectivity validation (deferred from Phase 3):
   - Verify all rooms reachable from start via flood fill
   - Verify stairs reachable
   - Fix any unreachable areas by adding corridors
   - Ensure MST + extra connections created fully connected graph

3. Door validation:
   - Ensure locked doors have keys/switches
   - Verify door placement doesn't block progress
   - Add additional doors if rooms too isolated

4. Dead end check:
   - Identify all dead ends
   - Place rewards in dead ends
   - Ensure dead ends serve purpose

5. Difficulty validation:
   - Verify progression gate placement
   - Ensure early areas accessible
   - Validate puzzle solvability

6. Visual polish:
   - Remove awkward single-cell irregularities
   - Straighten walls where appropriate
   - Ensure aesthetic appeal
```

## Data Structures

### Wall Object Structure

```typescript
interface Wall {
  exists: boolean;
  type: 'solid' | 'door' | 'secret' | 'illusory';
  properties?: {
    locked: boolean;
    open: boolean;
    keyId?: string;
    oneWay?: 'north' | 'south' | 'east' | 'west';
    hidden: boolean;
    discovered: boolean;
  };
}
```

### Tile Structure (Revised)

```typescript
interface DungeonTile {
  x: number;
  y: number;
  type: 'floor' | 'solid';

  northWall: Wall;
  southWall: Wall;
  eastWall: Wall;
  westWall: Wall;

  special?: {
    type: 'stairs_up' | 'stairs_down' | 'teleporter' | 'trap' | 'switch' | 'treasure';
    properties?: any;
  };

  discovered: boolean;
  encounterZoneId?: string;
}
```

### Room Structure

```typescript
interface Room {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'large' | 'medium' | 'small' | 'junction';
  doors: DoorPlacement[];
  specialTiles: {x: number, y: number, type: string}[];
}

interface DoorPlacement {
  x: number;
  y: number;
  wall: 'north' | 'south' | 'east' | 'west';
  locked: boolean;
  keyId?: string;
}
```

### Corridor Structure

```typescript
interface Corridor {
  id: string;
  path: {x: number, y: number}[];
  connectsRooms: [string, string];
}
```

## Comparison with Current System

### Current Generator Approach

Room-and-Corridor Algorithm:
1. Generate random rooms
2. Test for overlap, keep non-overlapping
3. Connect rooms with L-shaped corridors
4. Place special tiles randomly in floor cells

Issues:
- Doors are tile types, not wall properties
- No concept of walls-on-edges
- Random room placement lacks intentional design
- Corridor connections simple and predictable
- No puzzle structure

### New Wizardry-Style Approach

Strategic Placement Algorithm:
1. Strategic room placement (corners, edges, center)
2. Intelligent corridor network with loops
3. Doors placed on room-corridor boundaries
4. Puzzle elements integrated from start

Advantages:
- Walls-on-edges enables proper doors
- Strategic layout creates better flow
- Room size variety creates visual interest
- Corridor network more interesting
- Puzzle elements designed into structure
- Mimics hand-crafted dungeon feel

## Implementation Strategy

### Phase 1: Data Structure Migration ✅ COMPLETE
- ✅ Implement Wall interface
- ✅ Update DungeonTile to use Wall objects
- ✅ Update serialization/deserialization
- ✅ Maintain backward compatibility with old saves

**Status:** Completed. Wall objects fully implemented and integrated throughout codebase.

### Phase 2 Preparation: Type Simplification ✅ COMPLETE
- ✅ Simplify DungeonTile.type to 'floor' | 'solid'
- ✅ Move special tiles to tile.special property
- ✅ Add Room and DungeonGenerationConfig interfaces
- ✅ Update all code to use new tile structure (7 files updated)
- ✅ Add save migration logic (version 1.1.0)
- ✅ Verify all TypeScript checks pass

**Status:** Completed 2025-10-28. All preparatory work done. Ready for Phase 2 implementation.

**Files Updated:**
- src/types/GameTypes.ts (interfaces)
- src/utils/DungeonGenerator.ts (tile creation)
- src/utils/SaveManager.ts (migration logic)
- src/systems/dungeon/DungeonMovementHandler.ts (tile checks)
- src/systems/dungeon/DungeonInputHandler.ts (interactions)
- src/ui/RaycastEngine.ts (wall detection)
- src/ui/DungeonViewRaycast.ts (rendering)
- src/ui/DungeonMapView.ts (map rendering)
- src/scenes/DungeonScene.ts (debug display)

### Phase 2: Place Major Rooms ✅ COMPLETE
- ✅ Implement strategic room placement algorithm
- ✅ Large rooms (6x6-8x8) at corners and center
- ✅ Medium rooms (4x4-6x6) at edge midpoints and quarter positions
- ✅ Small rooms (3x3-4x4) fill gaps in grid
- ✅ 2-cell minimum spacing between all rooms
- ✅ Fallback to random placement if strategic positions occupied
- Result: Disconnected room islands (unplayable, no corridors yet)
- See detailed algorithm and verification strategy in Phase 2 section

**Status:** Completed 2025-10-28. Strategic placement follows Wizardry design patterns.

### Phase 3: Carve Corridor Network ✅ COMPLETE
- ✅ Implement Priority Queue utility (for MST)
- ✅ Implement A* pathfinding utility
- ✅ Build room connectivity graph
- ✅ Create minimum spanning tree (Prim's algorithm)
- ✅ Add extra connections for loops (25% beyond MST)
- ✅ Carve corridors between rooms using A* pathfinding
- Result: Connected, navigable dungeon (playable!)
- Note: Junction rooms and connectivity validation deferred to Phase 8
- See detailed algorithm in Phase 3 section

**Status:** Completed 2025-10-28. All rooms connected via MST + extra edges.

**Files Created/Modified:**
- src/utils/PriorityQueue.ts (new - min-heap for Prim's algorithm)
- src/utils/Pathfinding.ts (new - A* with cost modifiers)
- src/types/GameTypes.ts (Edge, Corridor interfaces added)
- src/utils/DungeonGenerator.ts (Phase 2 + 3 implementation)

### Lessons Learned from Phase 2 & 3 Implementation

**Wall Property Management:**
- Originally set walls to `{exists: false}` during room/corridor carving
- This is recalculated in Phase 4 anyway (wasteful but not broken)
- Better approach: Don't touch walls in Phase 2/3, let Phase 4 handle it
- Current implementation works correctly despite inefficiency

**Design Decisions:**
- Implicit symmetry chosen over explicit (simpler, works correctly)
- Only floor tiles processed in Phase 4 (solid tiles irrelevant)
- MST + 25% extra connections provides good connectivity without overconnecting

### Phase 4: Calculate Wall Properties ✅ COMPLETE
- ✅ Wall calculation already implemented in calculateWalls()
- ✅ Runs after Phase 2 (rooms) and Phase 3 (corridors)
- ✅ Recalculates all walls based on tile adjacency
- Uses implicit symmetry (each tile checks neighbors independently)
- Only processes floor tiles (solid tiles keep initial all-walls-exist state)
- See detailed algorithm in Phase 4 section

**Status:** Already implemented. Works correctly but uses implicit symmetry approach rather than explicit symmetry shown in Appendix A.6.

**Optimization Opportunities (deferred):**
- Phase 2/3 could skip wall setting entirely (will be recalculated anyway)
- Could implement explicit symmetry for more defensive programming
- Not critical - current implementation is correct

### Phase 5: Place Doors
- Find room-corridor boundaries
- Strategic door placement on walls
- Mark some doors as locked
- See detailed algorithm in Phase 5 section

### Phase 6: Place Special Tiles
- Stairs, teleporters, traps, switches, treasure
- See detailed algorithm in Phase 6 section

### Phase 7: Create Encounter Zones
- Divide dungeon into difficulty regions
- Assign monster groups
- See detailed algorithm in Phase 7 section

### Phase 8: Validation and Polish
- Connectivity verification
- Door/key validation
- Dead end rewards
- See detailed algorithm in Phase 8 section

## Testing Strategy

### Unit Tests
- Room placement algorithm
- Corridor connectivity
- Wall calculation correctness
- Door placement rules
- Special tile distribution

### Integration Tests
- Generate 100 dungeons, verify all connected
- Verify all dungeons have stairs
- Verify door placement valid
- Verify puzzle elements present

### Manual Tests
- Play through generated dungeons
- Verify doors visible and interactable
- Verify progression makes sense
- Verify visual appeal

### Comparison Tests
- Generate WGIV-style dungeon
- Compare to actual WGIV metrics:
  - Room count and sizes
  - Corridor complexity
  - Door count
  - Special tile distribution

## Configuration

### Generation Parameters

```typescript
interface DungeonGenerationConfig {
  width: number;
  height: number;
  seed?: string;

  rooms: {
    large: { count: [number, number], size: [number, number] };
    medium: { count: [number, number], size: [number, number] };
    small: { count: [number, number], size: [number, number] };
  };

  corridors: {
    width: number;
    extraConnections: number;
  };

  doors: {
    perLargeRoom: [number, number];
    perMediumRoom: [number, number];
    perSmallRoom: [number, number];
    lockedPercentage: number;
  };

  specialTiles: {
    teleporterPairs: number;
    trapsPerZone: [number, number];
    switches: number;
    treasureRooms: number;
  };
}
```

### Presets

WGIV Style:
- Large rooms: 3-5, size 6x6 to 8x8
- Medium rooms: 5-8, size 4x4 to 6x6
- Small rooms: 8-12, size 3x3 to 4x4
- Extra connections: 25%
- Locked doors: 15%
- Teleporter pairs: 4-6
- Trap clusters: 4-6
- Switches: 8-12

Classic Wizardry:
- Smaller, more uniform rooms
- More corridors, less open space
- Fewer special features
- Higher density

Modern Variant:
- Larger rooms
- More open layouts
- More special features
- More branching paths

## Conclusion

This generation system based on WGIV analysis would create dungeons with:
- Proper walls-on-edges architecture
- Strategic room placement
- Interesting corridor networks
- Proper door mechanics
- Integrated puzzle elements
- Hand-crafted feel despite procedural generation

The system is more complex than simple room-and-corridor but produces much better results that match Wizardry design principles and enable proper door/wall mechanics for raycasting rendering.

## Appendix A: Algorithm Pseudocode

### A.1: Room Overlap Detection

```
function checkRoomOverlap(newRoom, existingRooms, minSpacing):
  for each room in existingRooms:
    // Check if rectangles overlap with spacing buffer
    if (newRoom.x < room.x + room.width + minSpacing AND
        newRoom.x + newRoom.width + minSpacing > room.x AND
        newRoom.y < room.y + room.height + minSpacing AND
        newRoom.y + newRoom.height + minSpacing > room.y):
      return true  // Overlap detected

  return false  // No overlap
```

### A.2: Strategic Room Placement

```
function placeRoomStrategically(roomType, existingRooms, gridWidth, gridHeight):
  // Define strategic positions based on room type
  if roomType == 'large':
    positions = [
      {x: 1, y: 1},                          // NW corner
      {x: gridWidth - roomWidth - 1, y: 1},  // NE corner
      {x: 1, y: gridHeight - roomHeight - 1}, // SW corner
      {x: gridWidth - roomWidth - 1, y: gridHeight - roomHeight - 1}, // SE corner
      {x: gridWidth/2 - roomWidth/2, y: gridHeight/2 - roomHeight/2}  // Center
    ]
  else if roomType == 'medium':
    // Edge midpoints and offset from center
    positions = calculateMediumRoomPositions()
  else:
    // Fill gaps between existing rooms
    positions = findGapsInGrid(existingRooms)

  // Try each position in order
  for each pos in positions:
    room = {x: pos.x, y: pos.y, width: roomWidth, height: roomHeight}

    // Check bounds
    if room.x + room.width >= gridWidth - 1:
      continue
    if room.y + room.height >= gridHeight - 1:
      continue

    // Check overlap
    if checkRoomOverlap(room, existingRooms, minSpacing):
      continue

    // Valid placement found
    return room

  // All positions failed, try random placement
  return placeRoomRandom(roomType, existingRooms, gridWidth, gridHeight)
```

### A.3: Minimum Spanning Tree (Prim's Algorithm)

```
function buildMinimumSpanningTree(rooms):
  // Priority queue: stores edges sorted by distance
  pq = new PriorityQueue()
  visited = new Set()
  edges = []

  // Start with first room
  visited.add(rooms[0])

  // Add all edges from first room
  for i = 1 to rooms.length - 1:
    distance = calculateDistance(rooms[0], rooms[i])
    pq.insert({from: rooms[0], to: rooms[i], distance: distance})

  // Build MST
  while visited.size < rooms.length AND pq.notEmpty():
    edge = pq.extractMin()

    if visited.contains(edge.to):
      continue

    // Add edge to MST
    edges.push(edge)
    visited.add(edge.to)

    // Add new edges from newly visited room
    for each room in rooms:
      if not visited.contains(room):
        distance = calculateDistance(edge.to, room)
        pq.insert({from: edge.to, to: room, distance: distance})

  return edges

function calculateDistance(roomA, roomB):
  // Manhattan distance between room centers
  centerAx = roomA.x + roomA.width / 2
  centerAy = roomA.y + roomA.height / 2
  centerBx = roomB.x + roomB.width / 2
  centerBy = roomB.y + roomB.height / 2

  return abs(centerAx - centerBx) + abs(centerAy - centerBy)
```

### A.4: Add Extra Connections

```
function addExtraConnections(rooms, mstEdges, percentage):
  extraEdges = []
  existingConnections = new Set()

  // Track MST connections
  for each edge in mstEdges:
    existingConnections.add(roomPairKey(edge.from, edge.to))

  // Calculate all possible edges
  allEdges = []
  for i = 0 to rooms.length - 1:
    for j = i + 1 to rooms.length - 1:
      key = roomPairKey(rooms[i], rooms[j])
      if not existingConnections.contains(key):
        distance = calculateDistance(rooms[i], rooms[j])
        allEdges.push({from: rooms[i], to: rooms[j], distance: distance})

  // Sort by distance
  allEdges.sortBy(edge => edge.distance)

  // Add percentage of shortest non-MST edges
  numExtra = floor(mstEdges.length * percentage)
  for i = 0 to min(numExtra, allEdges.length) - 1:
    extraEdges.push(allEdges[i])

  return extraEdges

function roomPairKey(roomA, roomB):
  // Create unique key for room pair (order-independent)
  if roomA.id < roomB.id:
    return roomA.id + "-" + roomB.id
  else:
    return roomB.id + "-" + roomA.id
```

### A.5: A* Pathfinding for Corridors

```
function findCorridorPath(startX, startY, endX, endY, grid):
  openSet = new PriorityQueue()  // Min-heap by f-score
  closedSet = new Set()

  startNode = {x: startX, y: startY, g: 0, h: heuristic(startX, startY, endX, endY), parent: null}
  startNode.f = startNode.g + startNode.h
  openSet.insert(startNode)

  while openSet.notEmpty():
    current = openSet.extractMin()

    // Goal reached
    if current.x == endX AND current.y == endY:
      return reconstructPath(current)

    closedSet.add(coordKey(current.x, current.y))

    // Explore neighbors (4-directional)
    neighbors = [
      {x: current.x, y: current.y - 1},  // North
      {x: current.x, y: current.y + 1},  // South
      {x: current.x - 1, y: current.y},  // West
      {x: current.x + 1, y: current.y}   // East
    ]

    for each neighbor in neighbors:
      // Bounds check
      if neighbor.x < 1 OR neighbor.x >= grid.width - 1:
        continue
      if neighbor.y < 1 OR neighbor.y >= grid.height - 1:
        continue

      key = coordKey(neighbor.x, neighbor.y)
      if closedSet.contains(key):
        continue

      // Calculate costs
      moveCost = 1

      // Prefer straight lines (reduce direction changes)
      if current.parent != null:
        prevDx = current.x - current.parent.x
        prevDy = current.y - current.parent.y
        newDx = neighbor.x - current.x
        newDy = neighbor.y - current.y
        if prevDx != newDx OR prevDy != newDy:
          moveCost += 0.5  // Penalty for turning

      // Prefer following existing corridors
      tile = grid[neighbor.y][neighbor.x]
      if tile.type == 'floor' AND not tile.isRoom:
        moveCost -= 0.3  // Bonus for existing corridor

      // Avoid cutting through rooms
      if tile.type == 'floor' AND tile.isRoom:
        moveCost += 2.0  // Heavy penalty

      g = current.g + moveCost
      h = heuristic(neighbor.x, neighbor.y, endX, endY)
      f = g + h

      // Check if this path is better
      existingNode = openSet.find(key)
      if existingNode != null AND g >= existingNode.g:
        continue

      neighborNode = {x: neighbor.x, y: neighbor.y, g: g, h: h, f: f, parent: current}
      openSet.insertOrUpdate(neighborNode, key)

  // No path found (should not happen in valid dungeon)
  return null

function heuristic(x1, y1, x2, y2):
  // Manhattan distance with slight diagonal preference
  dx = abs(x2 - x1)
  dy = abs(y2 - y1)
  return dx + dy + 0.001 * min(dx, dy)

function reconstructPath(node):
  path = []
  current = node
  while current != null:
    path.prepend({x: current.x, y: current.y})
    current = current.parent
  return path

function coordKey(x, y):
  return x + "," + y
```

### A.6: Wall Calculation with Symmetry

```
function calculateWalls(tiles):
  for y = 0 to tiles.height - 1:
    for x = 0 to tiles.width - 1:
      tile = tiles[y][x]

      if tile.type == 'solid':
        continue  // Solid tiles don't need wall calculations

      // North wall
      if y == 0 OR tiles[y-1][x].type == 'solid':
        tile.northWall = createWall('solid')
        // Ensure symmetry
        if y > 0:
          tiles[y-1][x].southWall = createWall('solid')
      else:
        tile.northWall = createWall('none')

      // South wall
      if y == tiles.height - 1 OR tiles[y+1][x].type == 'solid':
        tile.southWall = createWall('solid')
        // Ensure symmetry
        if y < tiles.height - 1:
          tiles[y+1][x].northWall = createWall('solid')
      else:
        tile.southWall = createWall('none')

      // West wall
      if x == 0 OR tiles[y][x-1].type == 'solid':
        tile.westWall = createWall('solid')
        // Ensure symmetry
        if x > 0:
          tiles[y][x-1].eastWall = createWall('solid')
      else:
        tile.westWall = createWall('none')

      // East wall
      if x == tiles.width - 1 OR tiles[y][x+1].type == 'solid':
        tile.eastWall = createWall('solid')
        // Ensure symmetry
        if x < tiles.width - 1:
          tiles[y][x+1].westWall = createWall('solid')
      else:
        tile.eastWall = createWall('none')

function createWall(type):
  if type == 'solid':
    return {exists: true, type: 'solid', properties: null}
  else if type == 'none':
    return {exists: false, type: 'solid', properties: null}
  else:
    return {exists: true, type: type, properties: {locked: false, open: false}}
```

### A.7: Door Placement Selection

```
function placeDoors(rooms, tiles):
  for each room in rooms:
    // Determine door count based on room size
    if room.type == 'large':
      doorCount = random(2, 4)
    else if room.type == 'medium':
      doorCount = random(1, 3)
    else:
      doorCount = random(1, 2)

    // Find potential door locations
    potentialDoors = findRoomCorridorBoundaries(room, tiles)

    if potentialDoors.length == 0:
      continue  // No valid door positions

    // Select door positions
    selectedDoors = selectDoorPositions(potentialDoors, doorCount, room)

    // Place doors
    for each doorPos in selectedDoors:
      placeDoorAtPosition(doorPos, tiles)

function findRoomCorridorBoundaries(room, tiles):
  boundaries = []

  // Check each cell on room perimeter
  for x = room.x to room.x + room.width - 1:
    // North edge
    if room.y > 0:
      outsideTile = tiles[room.y - 1][x]
      if outsideTile.type == 'floor' AND not outsideTile.isRoom:
        boundaries.push({x: x, y: room.y, wall: 'north'})

    // South edge
    if room.y + room.height < tiles.height:
      outsideTile = tiles[room.y + room.height][x]
      if outsideTile.type == 'floor' AND not outsideTile.isRoom:
        boundaries.push({x: x, y: room.y + room.height - 1, wall: 'south'})

  for y = room.y to room.y + room.height - 1:
    // West edge
    if room.x > 0:
      outsideTile = tiles[y][room.x - 1]
      if outsideTile.type == 'floor' AND not outsideTile.isRoom:
        boundaries.push({x: room.x, y: y, wall: 'west'})

    // East edge
    if room.x + room.width < tiles.width:
      outsideTile = tiles[y][room.x + room.width]
      if outsideTile.type == 'floor' AND not outsideTile.isRoom:
        boundaries.push({x: room.x + room.width - 1, y: y, wall: 'east'})

  return boundaries

function selectDoorPositions(potentialDoors, count, room):
  selected = []
  wallUsage = {north: 0, south: 0, east: 0, west: 0}

  // Group potential doors by wall
  doorsByWall = groupBy(potentialDoors, door => door.wall)

  // Try to distribute doors across different walls
  availableWalls = Object.keys(doorsByWall)

  while selected.length < count AND availableWalls.length > 0:
    // Pick wall with fewest doors
    wall = availableWalls.reduce((min, w) =>
      wallUsage[w] < wallUsage[min] ? w : min
    )

    // Pick door from this wall (prefer center positions)
    doors = doorsByWall[wall]
    if doors.length > 0:
      centerDoor = findCenterMostDoor(doors, room)
      selected.push(centerDoor)
      wallUsage[wall]++

      // Remove used door from pool
      doorsByWall[wall] = doors.filter(d => d != centerDoor)
      if doorsByWall[wall].length == 0:
        availableWalls = availableWalls.filter(w => w != wall)
    else:
      availableWalls = availableWalls.filter(w => w != wall)

  return selected

function findCenterMostDoor(doors, room):
  roomCenterX = room.x + room.width / 2
  roomCenterY = room.y + room.height / 2

  bestDoor = doors[0]
  bestDistance = Number.MAX_VALUE

  for each door in doors:
    distance = abs(door.x - roomCenterX) + abs(door.y - roomCenterY)
    if distance < bestDistance:
      bestDistance = distance
      bestDoor = door

  return bestDoor

function placeDoorAtPosition(doorPos, tiles):
  tile = tiles[doorPos.y][doorPos.x]

  // Set wall as door
  if doorPos.wall == 'north':
    tile.northWall = {exists: true, type: 'door', properties: {locked: false, open: false}}
  else if doorPos.wall == 'south':
    tile.southWall = {exists: true, type: 'door', properties: {locked: false, open: false}}
  else if doorPos.wall == 'west':
    tile.westWall = {exists: true, type: 'door', properties: {locked: false, open: false}}
  else if doorPos.wall == 'east':
    tile.eastWall = {exists: true, type: 'door', properties: {locked: false, open: false}}

  // Ensure symmetry on adjacent tile
  ensureWallSymmetry(doorPos, tiles)
```

## Appendix B: Example Data Structures

### B.1: Wall Object Examples

Solid Wall (no door):
```json
{
  "exists": true,
  "type": "solid",
  "properties": null
}
```

Closed Unlocked Door:
```json
{
  "exists": true,
  "type": "door",
  "properties": {
    "locked": false,
    "open": false,
    "keyId": null,
    "oneWay": null,
    "hidden": false,
    "discovered": true
  }
}
```

Locked Door Requiring Key:
```json
{
  "exists": true,
  "type": "door",
  "properties": {
    "locked": true,
    "open": false,
    "keyId": "silver_key_1",
    "oneWay": null,
    "hidden": false,
    "discovered": true
  }
}
```

Secret Door (hidden until discovered):
```json
{
  "exists": true,
  "type": "secret",
  "properties": {
    "locked": false,
    "open": false,
    "keyId": null,
    "oneWay": null,
    "hidden": true,
    "discovered": false
  }
}
```

No Wall:
```json
{
  "exists": false,
  "type": "solid",
  "properties": null
}
```

### B.2: Complete DungeonTile Example

Floor tile with north door and east wall:
```json
{
  "x": 10,
  "y": 5,
  "type": "floor",
  "northWall": {
    "exists": true,
    "type": "door",
    "properties": {
      "locked": false,
      "open": true,
      "keyId": null,
      "oneWay": null,
      "hidden": false,
      "discovered": true
    }
  },
  "southWall": {
    "exists": false,
    "type": "solid",
    "properties": null
  },
  "eastWall": {
    "exists": true,
    "type": "solid",
    "properties": null
  },
  "westWall": {
    "exists": false,
    "type": "solid",
    "properties": null
  },
  "special": {
    "type": "trap",
    "properties": {
      "damage": 15,
      "disarmed": false,
      "visible": false
    }
  },
  "discovered": true,
  "encounterZoneId": "zone_3"
}
```

Solid tile (impassable rock):
```json
{
  "x": 0,
  "y": 0,
  "type": "solid",
  "northWall": {"exists": true, "type": "solid", "properties": null},
  "southWall": {"exists": true, "type": "solid", "properties": null},
  "eastWall": {"exists": true, "type": "solid", "properties": null},
  "westWall": {"exists": true, "type": "solid", "properties": null},
  "special": null,
  "discovered": false,
  "encounterZoneId": null
}
```

### B.3: Room Object Example

Large room with 3 doors:
```json
{
  "id": "room_1",
  "x": 2,
  "y": 18,
  "width": 7,
  "height": 5,
  "type": "large",
  "doors": [
    {
      "x": 5,
      "y": 18,
      "wall": "north",
      "locked": false,
      "keyId": null
    },
    {
      "x": 8,
      "y": 20,
      "wall": "east",
      "locked": true,
      "keyId": "brass_key"
    },
    {
      "x": 5,
      "y": 22,
      "wall": "south",
      "locked": false,
      "keyId": null
    }
  ],
  "specialTiles": [
    {
      "x": 5,
      "y": 20,
      "type": "stairs_down"
    },
    {
      "x": 3,
      "y": 19,
      "type": "treasure"
    }
  ]
}
```

### B.4: Corridor Object Example

Corridor connecting two rooms:
```json
{
  "id": "corridor_3",
  "path": [
    {"x": 8, "y": 15},
    {"x": 9, "y": 15},
    {"x": 10, "y": 15},
    {"x": 11, "y": 15},
    {"x": 11, "y": 14},
    {"x": 11, "y": 13},
    {"x": 12, "y": 13}
  ],
  "connectsRooms": ["room_2", "room_5"]
}
```

### B.5: Complete DungeonLevel Output

Minimal example showing structure:
```json
{
  "level": 1,
  "width": 24,
  "height": 24,
  "tiles": [
    [
      {"x": 0, "y": 0, "type": "solid", ...},
      {"x": 1, "y": 0, "type": "solid", ...},
      ...
    ],
    ...
  ],
  "overrideZones": [
    {
      "x1": 3,
      "y1": 8,
      "x2": 6,
      "y2": 11,
      "type": "safe",
      "data": {
        "description": "Starting area - safe from encounters"
      }
    },
    {
      "x1": 15,
      "y1": 15,
      "x2": 21,
      "y2": 21,
      "type": "boss",
      "data": {
        "bossType": "floor_guardian",
        "encounterRate": 1.0,
        "monsterGroups": ["boss_level_1"],
        "description": "Guardian chamber"
      }
    }
  ],
  "events": [
    {
      "x": 10,
      "y": 12,
      "type": "teleport",
      "data": {
        "targetX": 18,
        "targetY": 6
      },
      "triggered": false
    }
  ],
  "startX": 5,
  "startY": 20,
  "stairsUp": {"x": 5, "y": 20},
  "stairsDown": {"x": 18, "y": 10}
}
```

## Appendix C: Integration Guide

### C.1: Current System Overview

The dungeon generation system integrates with several key components:

**File: `src/utils/DungeonGenerator.ts`**
- Current implementation uses simple room-and-corridor algorithm
- Returns `DungeonLevel` object consumed by game systems
- Constructor: `new DungeonGenerator(width, height, seed?)`
- Main method: `generateLevel(level: number): DungeonLevel`

**File: `src/core/Game.ts`**
- Instantiates DungeonGenerator when starting new game
- Generates 10 dungeon levels at game start
- Stores dungeons in `gameState.dungeon` array
- Code location: `generateNewDungeon()` method (lines 147-156)

**File: `src/services/GameServices.ts`**
- May instantiate generator for dungeon-related services
- Provides service layer access to dungeon functionality

**File: `src/scenes/CharacterCreationScene.ts`**
- Uses dungeon generator during character creation flow
- Ensures dungeon exists for new party

### C.2: Data Flow

```
DungeonGenerator.generateLevel()
  └─> returns DungeonLevel
      └─> stored in GameState.dungeon[]
          └─> accessed by DungeonScene
              └─> passed to DungeonMovementHandler
                  └─> tile data used for movement/collision
              └─> passed to DungeonViewRaycast
                  └─> tile data used for rendering
                      └─> RaycastEngine.castRay()
                          └─> checks tile.type for walls
```

### C.3: Key Type Definitions

**File: `src/types/GameTypes.ts`**

Current DungeonTile interface:
```typescript
export interface DungeonTile {
  x: number;
  y: number;
  type: 'wall' | 'floor' | 'door' | 'stairs_up' | 'stairs_down' | 'chest' | 'trap' | 'event' | 'solid' | 'corridor';
  discovered: boolean;
  hasMonster: boolean;
  hasItem: boolean;
  northWall: boolean;  // Currently boolean, needs to be Wall object
  southWall: boolean;
  eastWall: boolean;
  westWall: boolean;
  properties?: {...};
}
```

Current DungeonLevel interface:
```typescript
export interface DungeonLevel {
  level: number;
  width: number;
  height: number;
  tiles: DungeonTile[][];
  overrideZones: OverrideZone[];
  events: DungeonEvent[];
  startX: number;
  startY: number;
  stairsUp?: {x: number, y: number};
  stairsDown?: {x: number, y: number};
}
```

### C.4: Raycasting Integration

**File: `src/ui/RaycastEngine.ts`**

Current wall detection (line 144):
```typescript
return tile.type === 'wall';
```

**Needs to change to:**
```typescript
// Check if wall exists on the hit side
if (side === 'north') return tile.northWall.exists;
if (side === 'south') return tile.southWall.exists;
if (side === 'east') return tile.eastWall.exists;
if (side === 'west') return tile.westWall.exists;
```

**File: `src/ui/DungeonViewRaycast.ts`**

Texture selection (line 176):
```typescript
const tile = this.getTileAt(wallX, wallY);
let textureType: WallTextureType = 'brick';

if (tile && tile.type === 'door') {
  textureType = 'door';
}
```

**Needs to change to:**
```typescript
const tile = this.getTileAt(wallX, wallY);
let textureType: WallTextureType = 'brick';

// Determine which wall was hit
const wall = this.getHitWall(tile, hit.side);
if (wall && wall.type === 'door') {
  textureType = wall.properties.open ? 'open_door' : 'closed_door';
} else if (wall && wall.type === 'secret' && !wall.properties.discovered) {
  textureType = 'brick';  // Secret doors look like walls
}
```

### C.5: Movement System Integration

**File: `src/systems/dungeon/DungeonMovementHandler.ts`**

Current door blocking logic would need updating. Closed doors should block movement:

```typescript
private canMoveToTile(tile: DungeonTile, fromX: number, fromY: number): boolean {
  if (tile.type === 'wall' || tile.type === 'solid') {
    return false;
  }

  // Check for closed doors on the wall between current and target tile
  const direction = this.getDirection(fromX, fromY, tile.x, tile.y);
  const wall = this.getWallInDirection(tile, direction);

  if (wall && wall.type === 'door' && !wall.properties.open) {
    return false;  // Door is closed
  }

  return true;
}
```

### C.6: New Generator Class Structure

**File: `src/utils/DungeonGeneratorV2.ts` (new file)**

Suggested class structure:
```typescript
export class DungeonGeneratorV2 {
  private width: number;
  private height: number;
  private level: number;
  private rng: SeededRandom;
  private seedString: string;
  private config: DungeonGenerationConfig;

  // Internal state
  private rooms: Room[] = [];
  private corridors: Corridor[] = [];
  private tiles: DungeonTile[][];

  constructor(width: number, height: number, seed?: string, config?: Partial<DungeonGenerationConfig>);

  public getSeed(): string;
  public generateLevel(level: number): DungeonLevel;

  // Phase 1
  private initializeGrid(): void;

  // Phase 2
  private placeRooms(): void;
  private placeRoomStrategically(roomType: string): Room | null;
  private checkRoomOverlap(room: Room): boolean;

  // Phase 3
  private carveCorridors(): void;
  private buildRoomGraph(): Edge[];
  private addExtraConnections(mstEdges: Edge[]): Edge[];
  private carveCorridorPath(edge: Edge): void;

  // Phase 4
  private calculateWalls(): void;

  // Phase 5
  private placeDoors(): void;
  private findRoomCorridorBoundaries(room: Room): DoorPosition[];
  private selectDoorPositions(boundaries: DoorPosition[], count: number): DoorPosition[];

  // Phase 6
  private placeSpecialTiles(): void;

  // Phase 7
  private createEncounterZones(): OverrideZone[];

  // Phase 8
  private validate(): boolean;
  private fixConnectivity(): void;
}
```

### C.7: Migration Strategy

**Step 1: Add Wall Interface**
```typescript
// In src/types/GameTypes.ts
export interface Wall {
  exists: boolean;
  type: 'solid' | 'door' | 'secret' | 'illusory';
  properties?: WallProperties;
}

export interface WallProperties {
  locked: boolean;
  open: boolean;
  keyId?: string;
  oneWay?: Direction;
  hidden: boolean;
  discovered: boolean;
}
```

**Step 2: Update DungeonTile Interface**
```typescript
export interface DungeonTile {
  x: number;
  y: number;
  type: 'floor' | 'solid';  // Simplified from many types

  northWall: Wall;  // Changed from boolean
  southWall: Wall;
  eastWall: Wall;
  westWall: Wall;

  special?: SpecialTile;  // Replaces tile type variants
  discovered: boolean;
  encounterZoneId?: string;
}

export interface SpecialTile {
  type: 'stairs_up' | 'stairs_down' | 'teleporter' | 'trap' | 'switch' | 'treasure';
  properties?: any;
}
```

**Step 3: Create Feature Flag**
```typescript
// In src/config/FeatureFlags.ts or GameConstants.ts
DUNGEON: {
  USE_V2_GENERATOR: false,  // Toggle new generator
  // ... existing config
}
```

**Step 4: Implement Conversion Functions**
```typescript
// Helper to convert old format to new format (for save compatibility)
function convertLegacyTile(oldTile: OldDungeonTile): DungeonTile {
  const newTile: DungeonTile = {
    x: oldTile.x,
    y: oldTile.y,
    type: oldTile.type === 'wall' ? 'solid' : 'floor',
    northWall: oldTile.northWall ?
      {exists: true, type: 'solid', properties: null} :
      {exists: false, type: 'solid', properties: null},
    // ... convert other walls
    special: convertSpecialType(oldTile.type),
    discovered: oldTile.discovered,
    encounterZoneId: null
  };
  return newTile;
}
```

**Step 5: Update Game.ts**
```typescript
private generateNewDungeon(): void {
  const GeneratorClass = GAME_CONFIG.DUNGEON.USE_V2_GENERATOR ?
    DungeonGeneratorV2 : DungeonGenerator;

  const generator = new GeneratorClass(20, 20, this.gameState.dungeonSeed);
  this.gameState.dungeon = [];
  this.gameState.dungeonSeed = generator.getSeed();

  for (let i = 1; i <= 10; i++) {
    this.gameState.dungeon.push(generator.generateLevel(i));
  }
  // ... rest of method
}
```

### C.8: Testing Integration Points

Files to update and test:
- `src/utils/DungeonGenerator.ts` (or new V2 class)
- `src/types/GameTypes.ts` (Wall interface)
- `src/ui/RaycastEngine.ts` (wall detection)
- `src/ui/DungeonViewRaycast.ts` (door rendering)
- `src/systems/dungeon/DungeonMovementHandler.ts` (door blocking)
- `src/core/Game.ts` (generator instantiation)
- Save/load system (conversion functions)

## Appendix D: Edge Case Handling

### D.1: Room Placement Failures

**Problem:** Strategic placement positions all occupied or invalid.

**Solution:** Fallback to random placement with retry limit.

```
function placeRoomWithFallback(roomType):
  // Try strategic placement
  room = placeRoomStrategically(roomType)

  if room != null:
    return room

  // Fallback to random placement
  maxRetries = 100
  for attempt = 1 to maxRetries:
    x = random(1, gridWidth - roomWidth - 1)
    y = random(1, gridHeight - roomHeight - 1)
    room = {x: x, y: y, width: roomWidth, height: roomHeight}

    if not checkRoomOverlap(room):
      return room

  // Complete failure
  return null

function placeAllRooms():
  placedRooms = []

  // Try to place minimum room count
  minRooms = config.rooms.large.count[0] +
             config.rooms.medium.count[0] +
             config.rooms.small.count[0]

  for each roomType in ['large', 'medium', 'small']:
    count = random(config.rooms[roomType].count[0], config.rooms[roomType].count[1])
    for i = 1 to count:
      room = placeRoomWithFallback(roomType)
      if room != null:
        placedRooms.push(room)

  // Verify minimum room count met
  if placedRooms.length < minRooms:
    throw Error("Failed to place minimum room count - regenerate dungeon")

  return placedRooms
```

### D.2: Connectivity Validation

**Problem:** Some rooms not reachable from starting position.

**Solution:** Flood fill validation and corridor repair.

```
function validateConnectivity(tiles, startX, startY):
  // Flood fill from start position
  visited = new Set()
  queue = [{x: startX, y: startY}]
  floorCellCount = 0
  reachableCellCount = 0

  // Count total floor cells
  for each tile in tiles:
    if tile.type == 'floor':
      floorCellCount++

  // Flood fill
  while queue.notEmpty():
    current = queue.dequeue()
    key = coordKey(current.x, current.y)

    if visited.contains(key):
      continue

    visited.add(key)
    tile = tiles[current.y][current.x]

    if tile.type == 'floor':
      reachableCellCount++

      // Add neighbors
      neighbors = getFloorNeighbors(current.x, current.y, tiles)
      for each neighbor in neighbors:
        queue.enqueue(neighbor)

  // Check if all floor cells reachable
  return reachableCellCount >= floorCellCount * 0.95  // Allow 5% unreachable

function fixConnectivity(rooms, tiles):
  // Find unreachable rooms
  unreachableRooms = []
  reachableRooms = []

  for each room in rooms:
    centerX = room.x + room.width / 2
    centerY = room.y + room.height / 2
    if isReachable(centerX, centerY, tiles):
      reachableRooms.push(room)
    else:
      unreachableRooms.push(room)

  // Connect unreachable rooms to nearest reachable room
  for each unreachableRoom in unreachableRooms:
    nearestRoom = findNearestRoom(unreachableRoom, reachableRooms)
    forceCorridor(unreachableRoom, nearestRoom, tiles)
    reachableRooms.push(unreachableRoom)  // Now reachable

function forceCorridor(roomA, roomB, tiles):
  // Create corridor even if it cuts through solid rock
  startX = roomA.x + roomA.width / 2
  startY = roomA.y + roomA.height / 2
  endX = roomB.x + roomB.width / 2
  endY = roomB.y + roomB.height / 2

  // Simple L-shaped corridor (guaranteed to connect)
  for x = startX to endX step sign(endX - startX):
    tiles[startY][x].type = 'floor'

  for y = startY to endY step sign(endY - startY):
    tiles[y][endX].type = 'floor'
```

### D.3: Door Placement Fallback

**Problem:** Room has no corridor boundaries (isolated room after failed corridor).

**Solution:** Skip door placement or force corridor connection.

```
function placeDoorsSafely(rooms, tiles):
  for each room in rooms:
    boundaries = findRoomCorridorBoundaries(room, tiles)

    if boundaries.length == 0:
      // No corridor connections - this is an error state
      logWarning("Room " + room.id + " has no corridor connections")

      // Option 1: Force a connection
      nearestCorridor = findNearestCorridor(room, tiles)
      if nearestCorridor != null:
        forceConnection(room, nearestCorridor, tiles)
        boundaries = findRoomCorridorBoundaries(room, tiles)

      // Option 2: Skip this room's doors
      if boundaries.length == 0:
        continue

    // Proceed with normal door placement
    placeDoors(room, boundaries, tiles)
```

### D.4: Minimum Room Count Failures

**Problem:** Cannot place required minimum rooms.

**Solution:** Regenerate entire dungeon with different seed.

```
function generateLevelWithRetry(level, maxAttempts = 5):
  for attempt = 1 to maxAttempts:
    try:
      dungeon = generateLevel(level)

      // Validate dungeon quality
      if dungeon.rooms.length >= minRoomCount AND
         validateConnectivity(dungeon.tiles, dungeon.startX, dungeon.startY):
        return dungeon

      logWarning("Dungeon generation attempt " + attempt + " failed validation")

    catch (error):
      logWarning("Dungeon generation attempt " + attempt + " failed: " + error.message)

    // Generate new seed for retry
    this.rng = new SeededRandom()

  // All attempts failed
  throw Error("Failed to generate valid dungeon after " + maxAttempts + " attempts")
```

### D.5: Performance Limits and Timeouts

**Problem:** Generation takes too long (infinite loops, excessive retries).

**Solution:** Timeout checks and operation limits.

```
class DungeonGeneratorV2:
  private startTime: number
  private maxGenerationTime: number = 10000  // 10 seconds
  private operationCounts: Map<string, number> = new Map()

  private checkTimeout(operation: string):
    elapsed = Date.now() - this.startTime
    if elapsed > this.maxGenerationTime:
      throw Error("Dungeon generation timeout: " + operation)

    // Track operation counts
    count = this.operationCounts.get(operation) || 0
    this.operationCounts.set(operation, count + 1)

    // Check operation limits
    if operation == "room_placement" AND count > 1000:
      throw Error("Too many room placement attempts")

    if operation == "corridor_pathfinding" AND count > 500:
      throw Error("Too many pathfinding attempts")

  public generateLevel(level):
    this.startTime = Date.now()
    this.operationCounts.clear()

    try:
      // ... generation phases with checkTimeout() calls
      this.checkTimeout("initialization")
      this.initializeGrid()

      this.checkTimeout("room_placement")
      this.placeRooms()

      this.checkTimeout("corridor_carving")
      this.carveCorridors()

      // ... more phases

      return this.buildDungeonLevel()

    catch (error):
      if error.message.includes("timeout"):
        logError("Generation timeout - trying with simpler parameters")
        return this.generateSimplifiedDungeon(level)
      throw error

  private generateSimplifiedDungeon(level):
    // Fallback to very simple dungeon
    // Smaller rooms, fewer corridors, guaranteed to succeed quickly
    // ...
```

### D.6: Degenerate Dungeon Detection

**Problem:** Dungeon generated but has poor quality (tiny, linear, boring).

**Solution:** Quality metrics and regeneration if below threshold.

```
function assessDungeonQuality(dungeon):
  metrics = {
    roomCount: dungeon.rooms.length,
    floorCellCount: countFloorCells(dungeon.tiles),
    corridorLength: calculateTotalCorridorLength(dungeon),
    connectivity: calculateConnectivityScore(dungeon),
    specialTileCount: countSpecialTiles(dungeon),
    doorCount: countDoors(dungeon)
  }

  // Calculate overall quality score (0-100)
  score = 0

  // Room count (0-25 points)
  if metrics.roomCount >= 15:
    score += 25
  else if metrics.roomCount >= 10:
    score += 15
  else if metrics.roomCount >= 5:
    score += 5

  // Floor coverage (0-25 points)
  totalCells = dungeon.width * dungeon.height
  floorPercentage = metrics.floorCellCount / totalCells
  if floorPercentage >= 0.40:
    score += 25
  else if floorPercentage >= 0.30:
    score += 15
  else if floorPercentage >= 0.20:
    score += 5

  // Connectivity (0-20 points)
  if metrics.connectivity >= 1.5:  // Multiple paths between areas
    score += 20
  else if metrics.connectivity >= 1.2:
    score += 10
  else if metrics.connectivity >= 1.0:
    score += 5

  // Special features (0-30 points)
  if metrics.doorCount >= 10:
    score += 10
  if metrics.specialTileCount >= 15:
    score += 10
  if hasStairs(dungeon):
    score += 10

  return score

function generateQualityDungeon(level, minQuality = 60):
  maxAttempts = 3
  for attempt = 1 to maxAttempts:
    dungeon = generateLevel(level)
    quality = assessDungeonQuality(dungeon)

    if quality >= minQuality:
      logInfo("Dungeon quality: " + quality + "/100")
      return dungeon

    logWarning("Dungeon quality too low (" + quality + "/100), regenerating...")

  // Return best of 3 attempts
  return dungeon
```

### D.7: Save Format Version Migration

**Problem:** Old save files have boolean walls, new system uses Wall objects.

**Solution:** Version detection and automatic migration.

```
function loadDungeon(saveData):
  // Detect save version
  version = saveData.version || "0.0.0"

  if isVersionBefore(version, "1.0.0"):
    // Old format with boolean walls
    return migrateLegacyDungeon(saveData)
  else:
    // New format with Wall objects
    return saveData

function migrateLegacyDungeon(oldData):
  newTiles = []

  for each row in oldData.tiles:
    newRow = []
    for each oldTile in row:
      newTile = {
        x: oldTile.x,
        y: oldTile.y,
        type: oldTile.type == 'wall' || oldTile.type == 'solid' ? 'solid' : 'floor',
        northWall: booleanToWall(oldTile.northWall),
        southWall: booleanToWall(oldTile.southWall),
        eastWall: booleanToWall(oldTile.eastWall),
        westWall: booleanToWall(oldTile.westWall),
        special: extractSpecialType(oldTile),
        discovered: oldTile.discovered,
        encounterZoneId: null
      }
      newRow.push(newTile)
    newTiles.push(newRow)

  return {
    ...oldData,
    tiles: newTiles,
    version: "1.0.0"
  }

function booleanToWall(hasWall):
  if hasWall:
    return {exists: true, type: 'solid', properties: null}
  else:
    return {exists: false, type: 'solid', properties: null}

function extractSpecialType(oldTile):
  specialTypes = ['stairs_up', 'stairs_down', 'trap', 'chest', 'event']
  if specialTypes.includes(oldTile.type):
    return {type: oldTile.type, properties: oldTile.properties}
  return null
```

## End of Document

This document now contains everything needed to implement a Wizardry-style dungeon generation system, including:
- Detailed WGIV F1 analysis
- 8-phase generation algorithm
- Complete data structures
- Algorithm pseudocode with all key functions
- Example JSON data for all structures
- Integration guide with current codebase
- Edge case handling for all failure modes

The system can be implemented by following the phases in order, using the pseudocode as a guide, and integrating with the existing codebase as documented in Appendix C.
