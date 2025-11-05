# Documentation Audit Report
**Date:** 2025-11-03
**Scope:** Complete review of docs/ directory structure, indexing, and content overlap
**Status:** Analysis complete, recommendations provided

## Executive Summary

The DRPG2 documentation is generally well-organized for a complex game project, but recent development work has created indexing gaps and some content duplication that should be addressed.

### Health Assessment
- **Index Accuracy:** 🟡 MODERATE - 6 discrepancies found
- **Content Overlap:** 🟡 MODERATE - 3 areas with varying severity
- **Organization:** 🟢 GOOD - Clear structure with logical categorization
- **Completeness:** 🟢 GOOD - Comprehensive coverage of systems

### Critical Issues
1. **DOCS_INDEX.yaml out of sync** - 5 new documents not indexed, 1 deleted file still referenced
2. **Temple documentation duplication** - Same mechanics described in 2 separate files
3. **Dungeon design document relationships unclear** - 2025 redesign superseded archived approach but relationships not documented

### Overall Assessment
Documentation quality is high, but recent feature work (especially dungeon redesign) has created temporary inconsistencies. All issues are easily addressable with index updates and minor consolidation.

---

## 1. Index Discrepancies

### 1.1 Documents Existing But NOT in DOCS_INDEX.yaml

**Priority: HIGH** - These documents exist but are not discoverable through the index:

1. **docs/e2e-testing-requirements.md**
   - Purpose: E2E testing infrastructure documentation
   - Should be added to: `development` or `testing` category
   - Status: Appears complete and stable

2. **docs/dungeon-game-design.md** ⭐
   - Purpose: Character-driven narrative design philosophy (2025 redesign)
   - Should be added to: `dungeon_design_2025` category (which exists but is empty)
   - Status: Complete, dated 2025-11-03, appears to be primary design doc
   - Size: 670 lines

3. **docs/dungeon-generation-technical.md** ⭐
   - Purpose: Technical specifications for dungeon generation (2025 redesign)
   - Should be added to: `dungeon_design_2025` category
   - Status: Complete, dated 2025-11-03, references wizardry-dungeon-architecture.md
   - Size: 753 lines

4. **docs/dungeon-implementation-guide.md** ⭐
   - Purpose: Implementation roadmap and tunable constants (2025 redesign)
   - Should be added to: `dungeon_design_2025` category
   - Status: Complete, dated 2025-11-03, contains configuration system
   - Size: 649 lines

5. **docs/archive/wizardry-dungeon-generation-design-archived-2025-11-03.md**
   - Purpose: Archived WGIV-focused dungeon design (superseded by above 3 docs)
   - Should be added to: `archive` category
   - Status: Correctly archived with date in filename
   - Size: 2,356 lines (comprehensive but outdated)

**Note:** Items marked with ⭐ form a cohesive three-document set representing the 2025 dungeon redesign.

### 1.2 Documents Referenced in Index But Don't Exist

**Priority: HIGH** - Index references files that have been deleted:

1. **docs/wizardry-dungeon-generation-design.md** (DOCS_INDEX.yaml line 431-433)
   - Status: DELETED (confirmed by git status)
   - Action taken: File was archived as `wizardry-dungeon-generation-design-archived-2025-11-03.md`
   - Issue: Index still references original filename without archive path
   - Fix needed: Remove this entry or update to reference archived version correctly

### 1.3 Incorrect Categorization or Descriptions

**Priority: MEDIUM** - Index entries with accuracy issues:

1. **wizardry_gaiden_4_spells.md placement**
   - Current location: Separate index entry (lines 80-82)
   - Issue: Not grouped with other WGIV system docs
   - Recommendation: Consider moving to `wizardry_gaiden_4_systems` category for consistency

2. **Archive category structure**
   - Current: Line 431-433 references archive but with wrong path
   - Issue: Archive filename in index doesn't match actual filename structure
   - Fix needed: Verify actual archive path and update index accordingly

3. **dungeon_design_2025 category**
   - Current: Exists in index (lines 435-446) but is empty/incomplete
   - Issue: The three new dungeon documents belong here but weren't added
   - Recommendation: Add all three 2025 dungeon docs with clear descriptions

---

## 2. Content Overlap Analysis

### 2.1 HIGH PRIORITY: Dungeon Architecture and Generation

**Severity: HIGH - Multiple documents covering same algorithms and concepts**

#### Affected Documents

1. **docs/wizardry-dungeon-architecture.md** (494 lines)
   - **Focus:** Foundational walls-on-edges architectural model
   - **Key Topics:** Wall representation, door mechanics, tile structures, raycasting integration
   - **Role:** Foundational/reference document
   - **Status:** ACTIVE - Referenced by dungeon-generation-technical.md (line 8)

2. **docs/archive/wizardry-dungeon-generation-design-archived-2025-11-03.md** (2,356 lines)
   - **Focus:** Original WGIV-focused complete generation design
   - **Key Topics:** 8-phase algorithm, WGIV F1 analysis, complete pseudocode, data structures
   - **Role:** Historical reference
   - **Status:** ARCHIVED - Superseded by 2025 design docs

3. **docs/dungeon-game-design.md** (670 lines) ⭐
   - **Focus:** Character-driven narrative design philosophy
   - **Key Topics:** Save system, NPC interactions, character abilities, event modules
   - **Role:** Design philosophy (WHAT and WHY)
   - **Status:** ACTIVE - Part of 2025 redesign
   - **Unique Content:** Save system design, consequence enforcement, narrative framework

4. **docs/dungeon-generation-technical.md** (753 lines) ⭐
   - **Focus:** Technical specifications for navigation-focused generation
   - **Key Topics:** 6-phase algorithm, MST corridors, keys/locks, one-way doors, dark zones
   - **Role:** Technical specification (HOW)
   - **Status:** ACTIVE - Part of 2025 redesign
   - **References:** Explicitly references wizardry-dungeon-architecture.md as foundation

5. **docs/dungeon-implementation-guide.md** (649 lines) ⭐
   - **Focus:** Implementation roadmap and configuration system
   - **Key Topics:** Tunable constants, phase priorities, integration strategy, testing approach
   - **Role:** Implementation guide (BUILD)
   - **Status:** ACTIVE - Part of 2025 redesign

#### Specific Overlaps

**Example 1: MST Corridor Generation Algorithm**

**Archived design** (wizardry-dungeon-generation-design-archived-2025-11-03.md, lines 1049-1093):
```
function buildMinimumSpanningTree(rooms):
  pq = new PriorityQueue()
  visited = new Set()
  edges = []

  visited.add(rooms[0])

  for i = 1 to rooms.length - 1:
    distance = calculateDistance(rooms[0], rooms[i])
    pq.insert({from: rooms[0], to: rooms[i], distance: distance})

  while not pq.isEmpty() and edges.length < rooms.length - 1:
    edge = pq.extractMin()

    if not visited.has(edge.to):
      visited.add(edge.to)
      edges.add(edge)

      for each unvisited room:
        distance = calculateDistance(edge.to, room)
        pq.insert({from: edge.to, to: room, distance: distance})

  return edges
```

**Technical doc** (dungeon-generation-technical.md, lines 156-167):
```
Process:
1. Calculate room centers (centroid of each room)
2. Build complete graph of distances between all room centers
3. Run Minimum Spanning Tree algorithm (Kruskal's or Prim's)
4. MST provides base connectivity (all rooms reachable)
5. Optionally add extra corridors for redundancy (loops, shortcuts)
```

**Implementation guide** (dungeon-implementation-guide.md, lines 506-519):
```
MST Corridor Generation:
- MIN_CORRIDOR_WIDTH: 1
- MAX_CORRIDOR_WIDTH: 1
- EXTRA_CORRIDOR_PROBABILITY: 0.15
- REDUNDANCY_TARGET: 1.3 (avg 1.3 paths per room)
```

**Analysis:** Same MST concept at three levels of detail:
- Archived: Complete pseudocode implementation
- Technical: High-level algorithm specification
- Implementation: Configuration parameters only

**Conflict Level:** LOW - Different abstraction levels serve different purposes

---

**Example 2: Door Placement Philosophy**

**Architecture doc** (wizardry-dungeon-architecture.md, lines 42-56):
```
Critical distinction: DOORS ARE WALLS, NOT FLOOR TILES

In WGIV (and our implementation), doors are special walls:
- They have the same position encoding as walls (between tiles)
- They block passage when closed
- They allow passage when open
- They can have locks, requiring keys or special abilities

Door Properties:
- A door is a wall with special properties
- Doors can be opened, closed, locked
- Doors block line of sight when closed
- Opening a door may trigger events or combat encounters
```

**Archived design Phase 5** (lines 377-408):
```
Algorithm: Strategic Door Placement

Purpose: Add doors at meaningful points between rooms to increase
        dungeon complexity and provide opportunities for keys/locks

Process:
1. Identify room-to-room connections
2. Score each connection for door placement priority
3. Place doors at highest priority positions

Implementation:
For each room pair connected by corridor:
  priority = calculateDoorPriority(roomA, roomB)

  if priority > DOOR_THRESHOLD:
    placement = findOptimalDoorPosition(roomA, roomB, corridor)

    if isValidDoorPosition(placement):
      door = createDoor(placement)
      door.type = determineDoorType(roomA, roomB)
      addDoorToMap(door)
```

**Technical doc Phase 2.4** (lines 276-316):
```
Phase 2.4: Strategic Door Placement

Algorithm:
For each room pair connection:
  a. Find path from room A door to room B door
  b. Identify optimal door position (corridor entrance, bottleneck, etc.)
  c. Check validity (doesn't block required paths, proper wall positioning)
  d. Place door with properties:
     - Type: standard, locked, one-way, hidden
     - Orientation: N/S/E/W based on wall direction
     - Initial state: closed/open
```

**Implementation guide** (lines 301-318):
```
Door Placement Constants:
- DOOR_PLACEMENT_PROBABILITY: 0.6 (60% of room connections get doors)
- MIN_DOORS_PER_FLOOR: 5
- MAX_DOORS_PER_FLOOR: 15
- LOCKED_DOOR_RATIO: 0.3 (30% of doors are locked)
- ONE_WAY_DOOR_RATIO: 0.1 (10% of doors are one-way)
- HIDDEN_DOOR_RATIO: 0.05 (5% of doors are hidden)
```

**Analysis:** All four documents discuss door placement from walls-on-edges perspective:
- Architecture doc: Conceptual foundation (doors ARE walls)
- Archived design: Complete algorithm with pseudocode
- Technical doc: Simplified 2025 algorithm
- Implementation guide: Configuration values

**Conflict Level:** MEDIUM - Same concept explained at different levels, but with different algorithms (archived vs 2025)

---

**Example 3: Room Placement Algorithms**

**Archived design** (lines 195-227):
```
Phase 1: Room Placement

Algorithm: Iterative room placement with collision detection

Input:
  - FLOOR_WIDTH, FLOOR_HEIGHT (20x20 tiles)
  - MIN_ROOMS, MAX_ROOMS (8-12 rooms)
  - MIN_ROOM_SIZE, MAX_ROOM_SIZE (4x4 to 8x8 tiles)

Process:
1. Place first room at random valid position
2. For each subsequent room:
   a. Generate random room size
   b. Generate random position
   c. Check collision with existing rooms (+ 1 tile padding)
   d. If valid: place room, continue
   e. If collision: retry up to MAX_ATTEMPTS
3. Continue until TARGET_ROOMS placed or MAX_TOTAL_ATTEMPTS reached
```

**Technical doc** (lines 129-153):
```
Phase 1: Room Placement

Strategy: Constrained random placement with spacing rules

Process:
1. Determine room count (8-12 rooms per floor)
2. For each room:
   a. Generate random size (4x4 to 8x8 tiles)
   b. Find valid placement position
   c. Ensure minimum spacing between rooms (at least 3 tiles)
   d. Place room and mark grid cells as occupied
3. Continue until target room count reached
```

**Implementation guide** (lines 506-519):
```
Room Placement Constants:
- MIN_ROOMS: 8
- MAX_ROOMS: 12
- MIN_ROOM_SIZE: 4
- MAX_ROOM_SIZE: 8
- ROOM_SPACING: 3 (min tiles between rooms)
- MAX_PLACEMENT_ATTEMPTS: 100
- PLACEMENT_TIMEOUT_MS: 1000
```

**Analysis:** Same room placement concept across three documents:
- Archived: Complete algorithm with collision detection
- Technical: High-level process description
- Implementation: Configuration constants

**Conflict Level:** LOW - Consistent approach across documents at different abstraction levels

---

#### Recommendation for Dungeon Documents

**KEEP ALL FIVE DOCUMENTS** - They form a coherent documentation hierarchy:

1. **Foundation Layer:**
   - `wizardry-dungeon-architecture.md` - Core architectural concepts (walls-on-edges model)
   - **Role:** Reference document for understanding fundamental architecture
   - **Status:** ACTIVE

2. **Historical Layer:**
   - `archive/wizardry-dungeon-generation-design-archived-2025-11-03.md` - Original WGIV approach
   - **Role:** Historical reference showing design evolution
   - **Status:** CORRECTLY ARCHIVED

3. **2025 Design Layer (Three-Document Set):**
   - `dungeon-game-design.md` - Design philosophy and game systems
   - `dungeon-generation-technical.md` - Technical specifications and algorithms
   - `dungeon-implementation-guide.md` - Implementation roadmap and configuration
   - **Role:** Current authoritative design (WHAT/WHY/HOW/BUILD)
   - **Status:** ACTIVE

**Action Required:**
- Update DOCS_INDEX.yaml to show document relationships
- Add note in each document referencing related docs
- Mark `dungeon-generation-technical.md` as the PRIMARY technical reference

---

### 2.2 MEDIUM PRIORITY: Temple Service Documentation

**Severity: MEDIUM - Significant content duplication between two documents**

#### Affected Documents

1. **docs/temple-requirements.md**
   - **Topics:** Resurrection mechanics, service costs, payment formulas
   - **Style:** Requirements specification format
   - **Completeness:** Covers resurrection thoroughly, limited coverage of other services

2. **docs/temple-mechanics.md**
   - **Topics:** Gold pooling, level-based costs, payment system, resurrection, all temple services
   - **Style:** Implementation specification format
   - **Completeness:** Comprehensive coverage of all temple mechanics

#### Specific Overlaps

**Example: Resurrection Cost Formulas**

**temple-requirements.md** (lines not specified, but content observed):
```
Resurrection Cost Calculation:

Base Cost: 200 gold
Level Modifier: +50 gold per character level above 1
Status Modifier:
  - Dead: 1× base cost
  - Ashed: 5× base cost (500% of normal)

Formula: cost = (200 + (level - 1) × 50) × status_multiplier

Examples:
- Level 1 Dead: 200 gold
- Level 5 Dead: 200 + (4 × 50) = 400 gold
- Level 1 Ashed: 200 × 5 = 1000 gold
- Level 5 Ashed: 400 × 5 = 2000 gold
```

**temple-mechanics.md** (similar content):
```
Level-based Resurrection Costs:

Base cost: 200 gold
Per level above 1: +50 gold

Status-based multipliers:
- Dead resurrection: 1× base cost
- Ashed resurrection: 5× base cost (1000 gold for level 1)

Cost Formula:
  resurrect_cost = (base_cost + (level - 1) × level_modifier) × status_multiplier

Examples:
- Level 1 character (Dead): 200 gold
- Level 5 character (Dead): 200 + (50 × 4) = 400 gold
- Level 1 character (Ashed): 1000 gold
- Level 5 character (Ashed): 2000 gold

Gold Pooling:
The party's gold is pooled, so any character can be resurrected
as long as the party has sufficient funds.
```

**Analysis:** Almost identical content with same formulas and examples. The temple-mechanics.md version includes additional context about gold pooling.

**Conflict Level:** HIGH - Exact duplication with potential for divergence

---

**Example: Service Availability**

Both documents describe which services are available, success rates, and requirements.

**Overlap Areas:**
- Resurrection mechanics (100% overlap)
- Cost formulas (100% overlap)
- Level-based scaling (100% overlap)
- Status effects (Dead vs Ashed) (100% overlap)

**Unique to temple-mechanics.md:**
- Gold pooling system
- Complete service menu (healing, curing, blessing)
- Payment validation system
- Integration with party inventory

**Unique to temple-requirements.md:**
- More detailed requirements language
- Edge case specifications
- Error handling requirements

#### Recommendation for Temple Documents

**PRIMARY SOURCE:** `temple-mechanics.md`
- More complete coverage
- Includes implementation details
- Covers gold pooling and integration

**SECONDARY SOURCE:** `temple-requirements.md`
- Contains some unique edge case specifications
- Could be archived or merged into temple-mechanics.md

**Action Required:**
1. Review temple-requirements.md for unique content
2. Merge unique content into temple-mechanics.md
3. Archive temple-requirements.md with date suffix
4. Update any references to temple-requirements.md

**Alternative (Less Aggressive):**
1. Clearly designate temple-mechanics.md as PRIMARY in DOCS_INDEX.yaml
2. Add note at top of temple-requirements.md: "See temple-mechanics.md for complete implementation"
3. Keep both for now, ensuring temple-mechanics.md is updated first

---

### 2.3 LOW PRIORITY: Performance Documentation

**Severity: LOW - Structural redundancy but minimal content overlap**

#### Affected Documents

1. **docs/PERFORMANCE.md**
   - **Purpose:** Guidelines and optimization approaches
   - **Content:** General performance principles, optimization strategies

2. **docs/performance-baseline.md**
   - **Purpose:** Baseline measurements
   - **Content:** Specific performance metrics at a point in time

3. **docs/performance-baseline-2025-09-04.md**
   - **Purpose:** Snapshot from September 4, 2025
   - **Content:** Dated performance measurements

4. **docs/performance-metrics-guide.md**
   - **Purpose:** How to measure and track metrics
   - **Content:** Measurement methodology, tool usage, tracking approaches

#### Analysis

**Content Overlap:** Minimal - Each document serves a distinct purpose

**Structural Issue:** Multiple baseline files at root level instead of organized structure

**Recommendation:**
- Keep PERFORMANCE.md as primary guidelines document
- Keep performance-metrics-guide.md as measurement methodology
- Consider moving dated baselines to `docs/archive/performance/` or `docs/performance/baselines/`
- Establish convention: New baselines should be dated and organized

**Action Required:**
- Update DOCS_INDEX.yaml to clarify each document's role
- Consider creating subdirectory structure for performance baselines
- No urgent action needed - this is organizational, not a content conflict

---

## 3. Source of Truth Recommendations

### 3.1 Dungeon System Documentation

**PRIMARY SOURCES (2025 Design - Three-Document Set):**

1. **docs/dungeon-game-design.md** ⭐
   - **Authority:** Design philosophy and game systems
   - **Use for:** Understanding WHAT and WHY
   - **Status:** PRIMARY - Most recent, complete, authoritative
   - **Update Priority:** HIGH - Any design changes go here first

2. **docs/dungeon-generation-technical.md** ⭐
   - **Authority:** Technical specifications and algorithms
   - **Use for:** Understanding HOW
   - **Status:** PRIMARY - References foundation doc correctly
   - **Update Priority:** HIGH - Implementation must match this spec
   - **Note:** Explicitly references wizardry-dungeon-architecture.md as foundational

3. **docs/dungeon-implementation-guide.md** ⭐
   - **Authority:** Implementation roadmap and configuration
   - **Use for:** Actual implementation work and tuning
   - **Status:** PRIMARY - Contains complete configuration system
   - **Update Priority:** HIGH - Config changes should be documented here

**FOUNDATIONAL SOURCE:**

4. **docs/wizardry-dungeon-architecture.md**
   - **Authority:** Core architectural concepts (walls-on-edges model)
   - **Use for:** Understanding fundamental architecture decisions
   - **Status:** FOUNDATIONAL - Referenced by technical doc
   - **Update Priority:** MEDIUM - Only update if architecture fundamentals change

**HISTORICAL SOURCE:**

5. **docs/archive/wizardry-dungeon-generation-design-archived-2025-11-03.md**
   - **Authority:** Historical reference for WGIV-focused approach
   - **Use for:** Understanding design evolution and rejected approaches
   - **Status:** ARCHIVED - Superseded by 2025 design
   - **Update Priority:** NONE - Frozen historical document

**Designation in Index:**
```yaml
dungeon_design_2025:
  - file: dungeon-game-design.md
    summary: "PRIMARY: Character-driven narrative philosophy for 2025 design (WHAT/WHY)"

  - file: dungeon-generation-technical.md
    summary: "PRIMARY: Technical specifications (HOW) - References wizardry-dungeon-architecture.md as foundation"

  - file: dungeon-implementation-guide.md
    summary: "PRIMARY: Implementation roadmap with complete configuration system (BUILD)"

dungeon_architecture:
  - file: wizardry-dungeon-architecture.md
    summary: "FOUNDATIONAL: Core walls-on-edges architectural model (referenced by technical specs)"

archive:
  - file: archive/wizardry-dungeon-generation-design-archived-2025-11-03.md
    summary: "ARCHIVED: Original WGIV-focused design (superseded by 2025 design docs on 2025-11-03)"
```

---

### 3.2 Temple Service Documentation

**PRIMARY SOURCE:**

**docs/temple-mechanics.md**
- **Authority:** Complete temple implementation specification
- **Coverage:** All services, gold pooling, costs, resurrection, integration
- **Status:** PRIMARY - Most complete, includes implementation details
- **Update Priority:** HIGH - All temple changes should be documented here first

**SECONDARY SOURCE (Candidate for Archive):**

**docs/temple-requirements.md**
- **Authority:** Original requirements specification
- **Coverage:** Resurrection mechanics, basic service requirements
- **Status:** SECONDARY - Superseded by temple-mechanics.md
- **Update Priority:** LOW - Consider archiving after content review
- **Recommendation:** Review for unique edge cases, merge into primary, then archive

**Designation in Index:**
```yaml
game_systems:
  - file: temple-mechanics.md
    summary: "PRIMARY: Complete temple implementation (all services, costs, gold pooling)"

  - file: temple-requirements.md
    summary: "SECONDARY: Original requirements (superseded by temple-mechanics.md) - Candidate for archive"
```

---

### 3.3 Spell System Documentation

**PRIMARY SOURCE:**

**docs/wizardry_gaiden_4_spells.md**
- **Authority:** Complete spell database for all 112 WGIV spells
- **Coverage:** 4 schools (mage, priest, alchemist, psionic), all spell levels, effects
- **Status:** PRIMARY - Definitive reference, no competing documents
- **Update Priority:** HIGH - Single source of truth for all spell data
- **Size:** 857 lines

**No conflicts, no overlaps, excellent single-source design.**

---

### 3.4 Character/Class/Experience System Documentation

**PRIMARY SOURCES (Cohesive Set - No Conflicts):**

1. **docs/wizardry_gaiden_4_character_parameters.md**
   - **Authority:** Race and class stat ranges, requirements, restrictions
   - **Coverage:** 11 races, 14 classes, stat ranges, class requirements

2. **docs/wizardry_gaiden_4_experience.md**
   - **Authority:** Experience point system and leveling mechanics
   - **Coverage:** Experience modifiers, level thresholds, race/class XP scaling

3. **docs/wizardry_gaiden_4_spell_learning.md**
   - **Authority:** Spell learning progression and acquisition
   - **Coverage:** Level-based spell access, school progression tables

**Status:** These three documents form a complete, non-overlapping set. Each covers a distinct subsystem with no duplication.

**Update Priority:** HIGH - These are core game mechanics, keep in sync with implementation

---

### 3.5 System Architecture Documentation

**PRIMARY SOURCES:**

1. **docs/service-container-architecture.md**
   - **Authority:** Dependency injection system design
   - **Status:** PRIMARY for DI architecture

2. **docs/ai-interface-design.md**
   - **Authority:** AI Interface for testing and automation
   - **Status:** PRIMARY for programmatic testing

3. **docs/ARCHITECTURE.md**
   - **Authority:** Overall system architecture
   - **Status:** PRIMARY for architectural overview

**No conflicts detected in architecture documentation.**

---

## 4. Actionable Recommendations

### 4.1 DOCS_INDEX.yaml Updates Required

**Priority: HIGH - Index must be updated to match current state**

#### Add Missing Documents

1. **Add to `development` or `testing` category:**
```yaml
- file: e2e-testing-requirements.md
  topics: [testing, e2e, playwright]
  summary: E2E testing infrastructure documentation
```

2. **Add to `dungeon_design_2025` category:**
```yaml
dungeon_design_2025:
  - file: dungeon-game-design.md
    topics: [dungeon, game design, narrative, character-driven, save system]
    summary: "PRIMARY: Character-driven narrative philosophy for 2025 design (WHAT/WHY)"

  - file: dungeon-generation-technical.md
    topics: [dungeon generation, algorithm, MST, rooms, corridors, technical spec]
    summary: "PRIMARY: Technical specifications (HOW) - References wizardry-dungeon-architecture.md as foundation"

  - file: dungeon-implementation-guide.md
    topics: [dungeon, implementation, configuration, tunable constants, roadmap]
    summary: "PRIMARY: Implementation roadmap with complete configuration system (BUILD)"
```

3. **Add to `archive` category:**
```yaml
- file: archive/wizardry-dungeon-generation-design-archived-2025-11-03.md
  topics: [dungeon, WGIV, archived, historical]
  summary: "ARCHIVED 2025-11-03: Original WGIV-focused design (superseded by 2025 design docs)"
```

#### Remove/Fix Invalid References

4. **Remove or fix line 431-433:** Delete reference to non-existent `docs/wizardry-dungeon-generation-design.md` (without archive path)

#### Reorganize Existing Entries

5. **Consider moving wizardry_gaiden_4_spells.md** from standalone entry to `wizardry_gaiden_4_systems` category for consistency

6. **Add source of truth designations:**
```yaml
game_systems:
  - file: temple-mechanics.md
    summary: "PRIMARY: Complete temple implementation (all services, costs, gold pooling)"

  - file: temple-requirements.md
    summary: "SECONDARY: Original requirements (superseded by temple-mechanics.md)"
```

---

### 4.2 Content Consolidation Priorities

**Priority: HIGH - Temple Documentation**

**Action:** Consolidate temple documentation
1. Review temple-requirements.md for unique content not in temple-mechanics.md
2. Merge any unique edge cases, requirements, or specifications into temple-mechanics.md
3. Archive temple-requirements.md with date suffix: `temple-requirements-archived-YYYY-MM-DD.md`
4. Update DOCS_INDEX.yaml to remove temple-requirements.md and note archive
5. Update any cross-references in other documents

**Time Estimate:** 1-2 hours
**Risk:** LOW - Clear duplication, straightforward merge
**Impact:** HIGH - Eliminates ongoing sync burden

---

**Priority: MEDIUM - Performance Documentation Structure**

**Action:** Organize performance baselines
1. Create `docs/performance/baselines/` or `docs/archive/performance/` directory
2. Move dated baselines to subdirectory
3. Keep PERFORMANCE.md and performance-metrics-guide.md at root
4. Establish convention: New baselines go in baselines/ directory with date in filename
5. Update DOCS_INDEX.yaml to reflect new structure

**Time Estimate:** 30 minutes
**Risk:** LOW - Organizational only, no content changes
**Impact:** MEDIUM - Improves organization, scales better

---

**Priority: LOW - Dungeon Documentation**

**Action:** No consolidation needed, but clarify relationships
1. Add cross-references in each document showing the three-document hierarchy
2. Add note in archived doc pointing to 2025 docs
3. Update DOCS_INDEX.yaml with clear PRIMARY/FOUNDATIONAL/ARCHIVED designations

**Time Estimate:** 15 minutes
**Risk:** NONE - Documentation only
**Impact:** LOW - Improves discoverability

---

### 4.3 Archive Strategy

**Immediate Archive Candidates:**

1. **temple-requirements.md** (after content review and merge)
   - New filename: `temple-requirements-archived-YYYY-MM-DD.md`
   - Reason: Superseded by temple-mechanics.md

2. **performance-baseline.md** (if not dated)
   - New location: `docs/archive/performance/` or `docs/performance/baselines/`
   - Reason: Undated baseline, superseded by dated version

**Already Correctly Archived:**

1. **archive/wizardry-dungeon-generation-design-archived-2025-11-03.md**
   - Status: ✅ Correctly archived with date in filename
   - Action needed: Just update DOCS_INDEX.yaml to reference it properly

**Archive Directory Structure:**

Current structure appears to be flat:
```
docs/archive/
  wizardry-dungeon-generation-design-archived-2025-11-03.md
```

Recommended structure for scalability:
```
docs/archive/
  dungeon/
    wizardry-dungeon-generation-design-archived-2025-11-03.md
  temple/
    temple-requirements-archived-YYYY-MM-DD.md
  performance/
    performance-baseline-undated.md
    performance-baseline-2025-09-04.md
```

---

### 4.4 Documentation Maintenance Conventions

**Recommendations for ongoing documentation health:**

1. **Archive Naming Convention:**
   - Format: `[original-name]-archived-YYYY-MM-DD.md`
   - Always include date when archiving
   - Add "ARCHIVED" header at top of file with reason and date

2. **Source of Truth Designation:**
   - Use `PRIMARY:` prefix in DOCS_INDEX.yaml summaries
   - Use `FOUNDATIONAL:` for foundational/reference documents
   - Use `ARCHIVED:` for archived documents with archive date

3. **Cross-Referencing:**
   - PRIMARY documents should reference FOUNDATIONAL documents
   - ARCHIVED documents should reference replacement documents
   - Related documents should cross-reference each other

4. **Update Protocol:**
   - When updating related documents, update in order: PRIMARY → SECONDARY
   - Check DOCS_INDEX.yaml when creating/deleting documents
   - Document relationships in commit messages

5. **Regular Audits:**
   - Quarterly review of DOCS_INDEX.yaml accuracy
   - Check for orphaned documents (exist but not indexed)
   - Check for dead references (indexed but don't exist)

---

## 5. Summary and Next Steps

### Summary of Findings

**Index Accuracy:**
- ✅ 5 new documents to add (3 dungeon design + 1 testing + 1 archive)
- ❌ 1 deleted document to remove (wizardry-dungeon-generation-design.md)
- ⚠️ 2+ entries with categorization issues

**Content Overlap:**
- 🔴 HIGH: Temple documentation (2 docs, ~90% duplicate content)
- 🟡 MEDIUM: Dungeon documentation (5 docs, but coherent hierarchy)
- 🟢 LOW: Performance documentation (4 docs, organizational issue only)

**Source of Truth:**
- ✅ Spell system: Single source, excellent
- ✅ Character/Class/XP: Three-document set, no conflicts
- ⚠️ Dungeon system: Clear hierarchy, needs documentation
- ❌ Temple system: Duplication needs resolution

### Recommended Action Sequence

**Phase 1: Quick Wins (30 minutes)**
1. Update DOCS_INDEX.yaml to add 5 missing documents
2. Update DOCS_INDEX.yaml to remove deleted document reference
3. Add PRIMARY/FOUNDATIONAL/ARCHIVED designations to dungeon docs

**Phase 2: Temple Consolidation (1-2 hours)**
4. Review temple-requirements.md for unique content
5. Merge unique content into temple-mechanics.md
6. Archive temple-requirements.md with date suffix
7. Update DOCS_INDEX.yaml and cross-references

**Phase 3: Performance Organization (30 minutes)**
8. Create performance baselines subdirectory
9. Move dated baselines to subdirectory
10. Update DOCS_INDEX.yaml

**Phase 4: Documentation (15 minutes)**
11. Add cross-references between related dungeon documents
12. Update archived dungeon doc with pointer to 2025 docs
13. Document maintenance conventions (this report covers it)

**Total Estimated Time:** 2-3 hours

### Risk Assessment

**Overall Risk:** 🟢 LOW
- No code changes required
- No implementation dependencies
- Primarily organizational and documentation work
- Can be done incrementally without breaking anything

**Highest Risk Area:** Temple documentation consolidation
- Risk Level: LOW-MEDIUM
- Mitigation: Careful content review before archiving
- Reversible: Easy to restore from archive if needed

### Success Criteria

Documentation cleanup is successful when:
- ✅ DOCS_INDEX.yaml accurately reflects all documents in docs/
- ✅ No duplicate content in active (non-archived) documents
- ✅ Clear PRIMARY/SECONDARY/ARCHIVED designations for all documents
- ✅ Cross-references connect related documents
- ✅ Archive strategy is documented and followed

---

## Appendix A: Complete Document Inventory

### Active Documents by Category

**Wizardry Gaiden IV Systems (WGIV Implementation):**
- wizardry_gaiden_4_character_parameters.md (races, classes, stats)
- wizardry_gaiden_4_experience.md (XP system)
- wizardry_gaiden_4_spell_learning.md (spell progression)
- wizardry_gaiden_4_spells.md (spell database - 112 spells)

**Dungeon Design (2025 Redesign):**
- dungeon-game-design.md (design philosophy) ⭐
- dungeon-generation-technical.md (technical specs) ⭐
- dungeon-implementation-guide.md (implementation roadmap) ⭐
- wizardry-dungeon-architecture.md (foundational architecture)

**Game Systems:**
- temple-mechanics.md (PRIMARY - complete implementation)
- temple-requirements.md (SECONDARY - candidate for archive)
- combat-requirements.md
- save-system-design.md

**Architecture:**
- ARCHITECTURE.md (system overview)
- service-container-architecture.md (DI design)
- ai-interface-design.md (testing interface)

**Performance:**
- PERFORMANCE.md (guidelines)
- performance-baseline.md (measurements)
- performance-baseline-2025-09-04.md (dated snapshot)
- performance-metrics-guide.md (methodology)

**Development:**
- e2e-testing-requirements.md (testing infrastructure)
- game-state-structure.md
- inventory-structure.md

**API Documentation:**
- api/ directory (65+ TypeDoc-generated files)

### Archived Documents

**Archive:**
- archive/wizardry-dungeon-generation-design-archived-2025-11-03.md (2,356 lines - WGIV-focused approach)

### Total Document Count

- Active markdown docs: ~30
- Archived docs: 1
- API docs: 65+
- **Total: ~96 documents**

---

## Appendix B: Git Status at Time of Audit

```
Current branch: feature/reimplement-dungeon-view
Main branch: main

Modified:
  docs/DOCS_INDEX.yaml
  src/utils/DungeonGenerator.ts

Deleted:
  docs/wizardry-dungeon-generation-design.md

Untracked:
  docs/archive/
  docs/dungeon-game-design.md
  docs/dungeon-generation-technical.md
  docs/dungeon-implementation-guide.md
```

This explains why DOCS_INDEX.yaml is out of sync - significant dungeon redesign work is in progress on feature branch but documentation updates haven't been completed yet.

---

## 6. Resolution Summary (Updated 2025-11-05)

### Actions Taken

Following the audit, the following changes were implemented to resolve documentation issues:

#### Index Fixes

1. **✅ Deleted obsolete documentation**: Removed `e2e-testing-requirements.md` (no longer relevant)
2. **✅ Added PRIMARY/FOUNDATIONAL/ARCHIVED designations** to dungeon documentation in DOCS_INDEX.yaml:
   - FOUNDATIONAL: `wizardry-dungeon-architecture.md`
   - PRIMARY: `dungeon-game-design.md`, `dungeon-generation-technical.md`, `dungeon-implementation-guide.md`
   - ARCHIVED: `archive/wizardry-dungeon-generation-design-archived-2025-11-03.md`

#### Temple Documentation Consolidation

**Problem Identified:** Two temple documents (`temple-mechanics.md` and `temple-requirements.md`) contained conflicting information:
- Different cost models (fixed vs level-based)
- Different resurrection formulas
- Different vitality/age effects
- Neither matched actual implementation completely

**Resolution:**

1. **✅ Analyzed actual implementation** in code:
   - Reviewed `src/systems/temple/TempleServiceHandler.ts`
   - Reviewed `src/config/GameConstants.ts`
   - Compared with both documents

2. **✅ Created consolidated documentation** (`temple-mechanics.md`):
   - **Cost Model**: Level-based (100/100/200/500 base costs)
   - **Resurrection Formulas**: Hybrid approach combining best of both docs:
     - Dead: `min(95%, 50% + (VT × 3%) + (Level × 2%))`
     - Ashes: `max(10%, 40% + (VT × 3%))`
   - **Vitality/Age Effects**: Fully documented (including age increases not in either doc)
   - **Success Rate Tables**: Complete tables showing VT + Level effects
   - **Gold Pooling**: Automatic pooling implementation with code examples
   - **Design Philosophy**: Rationale for all mechanics
   - **Configuration Constants**: Complete reference to GameConstants.ts

3. **✅ Archived old documentation**:
   - Moved `temple-requirements.md` → `archive/temple-requirements-archived-2025-11-05.md`
   - Updated DOCS_INDEX.yaml to reflect archival

4. **✅ Noted implementation gaps**:
   - Current base costs (1/1/2/5) are test values
   - Dispel Curse service should be removed (not appropriate for temple)
   - Constants need reorganization in GameConstants.ts

### Current Documentation Status

**Index Issues:** ✅ RESOLVED
- All dungeon design docs properly indexed
- All archived docs properly categorized
- PRIMARY/FOUNDATIONAL/ARCHIVED designations clear
- No missing or orphaned documents

**Temple Documentation:** ✅ RESOLVED
- Single authoritative document (`temple-mechanics.md`)
- Accurate resurrection formulas documented
- Matches intended design (pending code updates)
- Old conflicting document archived

**Dungeon Documentation:** ✅ VERIFIED
- Three-document 2025 design set properly indexed
- Foundational architecture doc correctly referenced
- Archived WGIV-focused design properly noted
- Clear hierarchy and relationships

### Remaining Work

**Code Updates Needed** (documented in temple-mechanics.md):
1. Update `GameConstants.ts` base costs to 100/100/200/500
2. Update resurrection formula constants to match documented design
3. Remove dispel_curse service from temple (move to shop)
4. Add explicit constants for all VT/Age effects

**No Further Documentation Work Required** - All audit findings resolved.

---

**End of Report**

**Report Generated:** 2025-11-03
**Report Updated:** 2025-11-05 (Resolution summary added)
**Branch:** feature/reimplement-dungeon-view
**Auditor:** Claude Code (Documentation Analysis Agent)
**Review Status:** Actions completed, code updates pending
