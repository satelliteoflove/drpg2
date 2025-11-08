Wizardry Dungeon Architecture Analysis

Based on analysis of Wizardry Gaiden IV Tower of Witchcraft Floor F1 and comparison with current DRPG2 implementation.

## Wizardry Dungeon Model

### Core Concept: Walls on Cell Edges

The fundamental principle of Wizardry dungeons:

Walls exist on the EDGES between cells, not as cells themselves.

Each cell has four possible walls:
- North wall
- South wall
- East wall
- West wall

### Cell Grid Structure

From WGIV F1 analysis:
- Grid dimensions: 24x24 cells
- Each cell is either floor or solid rock
- Floor cells can have 0-4 walls on their edges
- Interior rooms typically have walls only on room perimeters
- Corridors are 1-cell wide passages with walls on sides

### Wall Representation

Wall as Boolean Properties:
- cell[x,y].northWall = true/false
- cell[x,y].southWall = true/false
- cell[x,y].eastWall = true/false
- cell[x,y].westWall = true/false

Wall Sharing:
- Adjacent cells share walls
- If cell[x,y].eastWall = true, then cell[x+1,y].westWall = true
- Walls are symmetric between cells

### Doors in Wizardry

Critical distinction: DOORS ARE WALLS, NOT FLOOR TILES

Door Properties:
- A door is a wall with special properties
- Doors can be opened, closed, locked
- Doors block line of sight when closed
- Doors block movement when closed or locked
- Doors are rendered as walls in the 3D view

Door Position:
- Doors are on cell edges
- A cell has a door on its north wall means the wall between this cell and the cell to the north is a door
- Strategic placement at room entrances and corridor junctions

### Special Tiles

From WGIV F1 map analysis:

Stairs:
- Stairs up and stairs down are floor tiles with special rendering
- Typically placed in rooms or at corridor junctions
- Strategic placement for level connectivity

Traps:
- Floor tiles with hidden properties
- Often placed in corridors leading to valuable areas
- Clustered near treasure or important locations

Teleports:
- Floor tiles that transport party to another location
- Often used for puzzles or shortcuts
- Color-coded in WGIV maps (yellow, green, blue areas)

Switches:
- Floor tiles that trigger events
- Control doors, traps, or other dungeon features
- Often require puzzle-solving to activate

## WGIV F1 Map Analysis

### Dimensions and Scale

Grid Size: 24x24 cells (576 total cells)

Floor Distribution:
- Approximately 40-45% floor cells
- 55-60% solid rock cells
- Efficient use of space with varied room sizes

### Room Design Patterns

Large Rooms:
- 8x8 to 10x10 cells
- Placed in corners and center
- Often contain multiple special tiles
- Clear floor space for combat encounters

Medium Rooms:
- 4x6 to 6x6 cells
- Connected by corridors
- Strategic placement throughout level
- Often contain single special tile or encounter

Small Rooms:
- 2x3 to 3x4 cells
- Junction points or rest areas
- Minimal special features
- Often dead ends or side passages

### Corridor Design

Single-Width Corridors:
- 1 cell wide
- Connect rooms efficiently
- Create chokepoints for encounters
- Force linear exploration

Strategic Placement:
- Corridors form a network connecting all rooms
- Multiple paths between major areas
- Some loops for backtracking
- Dead ends with rewards

### Wall Patterns

Room Perimeters:
- Complete walls around room exteriors
- Doors at strategic entry points
- Usually 1-2 entrances per room

Interior Walls:
- Minimal internal walls in rooms
- Used to create alcoves or sub-areas
- Maze-like sections in some areas

Corridor Walls:
- Full walls on corridor sides
- Openings where corridors intersect rooms
- T-junctions and crossroads common

### Special Tile Placement

Stairs Placement:
- Stairs down: Central area, easily accessible
- Stairs up: Near edge, requires exploration
- Never placed in dead ends
- Always in rooms or corridor junctions

Trap Patterns:
- Corridors leading to treasure rooms
- Near valuable items or encounters
- Clustered in puzzle areas
- Warning pattern (multiple traps in sequence)

Teleport Zones:
- Color-coded groups (yellow, green, blue, purple)
- Form puzzle networks
- Connect distant areas
- Often require switch activation

Switch Mechanics:
- Control traps, doors, or teleports
- Placed strategically to require backtracking
- Some switches unlock gates
- Puzzle-solving element

## Current DRPG2 System Analysis

### Current Implementation

Tile-Based Model:
```typescript
interface DungeonTile {
  x: number;
  y: number;
  type: 'wall' | 'floor' | 'door' | 'stairs_up' | 'stairs_down' | 'chest' | 'trap' | 'event' | 'solid' | 'corridor';
  discovered: boolean;
  hasMonster: boolean;
  hasItem: boolean;
  northWall: boolean;
  southWall: boolean;
  eastWall: boolean;
  westWall: boolean;
  properties?: {...};
}
```

Current Door Implementation:
- Doors are tile types (type: 'door')
- Door tiles are walkable floor cells
- Doors have wall properties but are not rendered as walls
- Incompatible with raycasting wall rendering

Current Wall Calculation:
```typescript
calculateWalls(tiles) {
  for each tile {
    if (tile.type !== 'wall') {
      tile.northWall = (adjacent north is wall);
      tile.southWall = (adjacent south is wall);
      tile.westWall = (adjacent west is wall);
      tile.eastWall = (adjacent east is wall);
    }
  }
}
```

### Key Similarities

Both systems:
- Use grid-based dungeon layout
- Store wall information per-cell
- Support special tile types
- Generate rooms and corridors

Wall Storage:
- Both store northWall, southWall, eastWall, westWall
- Boolean representation of wall presence
- Per-cell wall data

### Critical Differences

## Door Representation

Current System:
- Door is a tile type
- Door tile has type = 'door'
- Door is walkable (not a wall)
- Raycasting doesn't hit doors as walls

Wizardry System:
- Door is a wall property
- Wall has isDoor = true
- Door blocks movement when closed
- Raycasting hits doors as special walls

## Wall Rendering in Raycasting

Current Problem:
1. Raycasting checks if adjacent tile is type 'wall'
2. Door tiles are type 'door', not 'wall'
3. Raycaster doesn't render door tiles
4. Doors are invisible in 3D view

Wizardry Solution:
1. Raycasting checks wall properties on cell edges
2. Doors are walls with special properties
3. Raycaster renders doors as textured walls
4. Doors visible and properly positioned

## Tile Type Usage

Current System:
- Many tile types: wall, floor, door, stairs, trap, chest, event, corridor
- Type determines both walkability and rendering
- Conflates floor properties with wall properties

Wizardry System:
- Two main types: floor and solid
- Floor cells have wall properties on edges
- Special tiles (stairs, traps) are floor variants
- Clear separation of cell type and wall properties

## Game Design Comparison

### Current Strengths

Flexibility:
- Easy to add new tile types
- Properties system allows rich tile features
- Simple tile-based collision detection

Generation:
- Room and corridor generation works well
- Good room size variety
- Effective connectivity

### Current Weaknesses for Wizardry-Style

Door Functionality:
- Doors don't work with raycasting
- Doors can't block movement properly
- Door interaction not intuitive

Wall Semantics:
- Wall tile type vs wall properties confusion
- Difficult to have door on cell edge
- Hard to implement locked doors

Rendering Integration:
- Raycasting assumes walls are tile types
- Special tiles need sprite rendering
- No clear rendering hierarchy

### Wizardry Advantages

Clear Semantics:
- Walls are always on cell edges
- Doors are special walls
- Natural fit for grid-based movement

Raycasting Compatible:
- Walls on edges work perfectly with raycasting
- Doors render naturally as textured walls
- Line of sight naturally blocked by walls/doors

Interaction Model:
- Open/close doors is edge interaction
- Lock/unlock naturally applies to walls
- Search walls for secret doors

Strategic Design:
- Door placement controls access
- Locked doors create progression gates
- Secret doors add exploration depth

## Recommendations for DRPG2

### Architectural Changes Needed

1. Wall Representation Refactor

Change wall storage from boolean to object:
```typescript
interface Wall {
  exists: boolean;
  type: 'solid' | 'door' | 'secret';
  properties?: {
    locked?: boolean;
    open?: boolean;
    keyRequired?: string;
  };
}

interface DungeonTile {
  x: number;
  y: number;
  type: 'floor' | 'solid';
  northWall: Wall;
  southWall: Wall;
  eastWall: Wall;
  westWall: Wall;
  special?: 'stairs_up' | 'stairs_down' | 'trap' | 'chest';
}
```

2. Raycasting Integration

Modify raycasting to check wall objects:
```typescript
if (adjacentTile.northWall.exists) {
  let texture = 'brick';
  if (adjacentTile.northWall.type === 'door') {
    texture = adjacentTile.northWall.properties.open ? 'open_door' : 'closed_door';
  }
  renderWall(texture);
}
```

3. Door Interaction System

Add wall interaction mechanics:
- Press ENTER at door to open/close
- Check for keys when door is locked
- Update wall properties when door state changes
- Block movement through closed doors

4. Generation Refactor

Update dungeon generation:
- Create doors on room entrances (walls, not tiles)
- Place locked doors for progression gates
- Add secret doors for exploration rewards
- Remove 'door' as a tile type

### Migration Path

Phase 1: Wall Object Model
- Add Wall interface
- Convert boolean walls to Wall objects
- Update serialization/deserialization
- Maintain backward compatibility

Phase 2: Raycasting Update
- Modify wall detection in raycaster
- Add door texture rendering
- Implement door open/closed rendering
- Test with existing dungeons

Phase 3: Interaction System
- Add door open/close mechanics
- Implement key/lock system
- Add secret door search
- Update UI for door interactions

Phase 4: Generation Update
- Refactor door placement in generator
- Remove 'door' tile type
- Add secret door generation
- Update special tile placement logic

### Testing Strategy

Unit Tests:
- Wall object creation and manipulation
- Door state transitions
- Raycasting with door walls
- Movement blocking with closed doors

Integration Tests:
- Dungeon generation with wall doors
- Door interaction in game loop
- Save/load with wall objects
- Raycasting rendering with doors

Manual Testing:
- Door visibility in 3D view
- Door open/close interactions
- Locked door key requirements
- Secret door discovery

## Expert Game Design Analysis

### Wizardry Model Advantages

Historical Proven Design:
- 40+ years of Wizardry games validate this model
- Players understand wall-based doors intuitively
- Natural fit for grid-based dungeon crawlers

Progression Control:
- Locked doors create clear progression gates
- Keys as progression items are well understood
- Door placement shapes exploration flow

Puzzle Potential:
- Secret doors add discovery rewards
- One-way doors create interesting layouts
- Door switches enable puzzle mechanics

### Implementation Complexity

Migration Effort:
- Moderate refactoring required
- Breaking change to dungeon data format
- Need save game migration or version bump

Raycasting Simplification:
- Actually simplifies raycasting logic
- Natural fit for checking cell edge walls
- Easier to add wall variants (secret, locked, etc.)

Generation Complexity:
- Similar complexity to current system
- More intuitive door placement logic
- Better supports Wizardry-style level design

### Recommendation

Strongly recommend migrating to wall-based door model:

1. Better Alignment: Matches Wizardry architecture that game is based on
2. Raycasting Fix: Solves current door rendering problem
3. Game Design: Enables richer dungeon design patterns
4. Future Proof: Foundation for secret doors, locked doors, wall interactions

The refactor is worthwhile investment for long-term game quality and alignment with Wizardry design principles.

## Dungeon Generation System

The current dungeon generation system uses a simple room-and-corridor approach with tile-based walls. To support the walls-on-edges model and create dungeons matching Wizardry design quality, a new generation system is needed.

See [wizardry-dungeon-generation-design.md](wizardry-dungeon-generation-design.md) for:
- Detailed analysis of WGIV F1 map structure (room placements, corridor networks, door positions, special tiles)
- Complete generation algorithm design with 8 phases (room placement, corridor carving, wall calculation, door placement, special tiles, encounter zones, validation, polish)
- Data structure specifications for wall-based dungeons
- Implementation strategy and testing approach
- Configuration system with WGIV-style presets

Key differences from current system:
- Strategic room placement (corners, edges, center) instead of random
- Intelligent corridor network with loops instead of simple L-shaped connections
- Doors placed on walls at room-corridor boundaries instead of as tile types
- Integrated puzzle design (teleporters, switches, gates) instead of random special tiles
- Wall-on-edge data structures enabling proper raycasting

The new system will produce dungeons with hand-crafted feel while remaining procedurally generated.

## Conclusion

Wizardry dungeon architecture with walls-on-edges and doors-as-walls is fundamentally different from a tile-type system. While DRPG2's current implementation has the wall properties infrastructure, doors as tile types don't work with raycasting. Migrating to wall-based doors will fix the rendering issue and enable authentic Wizardry-style dungeon design.

The WGIV F1 map demonstrates sophisticated level design with strategic door placement, room variety, and special tile distribution that can serve as a model for DRPG2's procedural generation once the wall architecture is updated.
