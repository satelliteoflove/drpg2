# Dungeon Game Design
## Character-Driven Narrative Dungeon Crawler

**Document Purpose:** Design philosophy and game systems for DRPG2 dungeons that serve as dramatic settings for character experiences.

**Last Updated:** 2025-11-03

---

## PART 1: CORE DESIGN PRINCIPLES

### 1.1 Game Identity

**Primary Goal:** Create a character-driven narrative RPG where dungeons are dramatic settings for character experiences, not spatial puzzle boxes.

**Core Pillars:**
1. **Navigation-First Exploration** - Dense, maze-like dungeons where mapping and navigation are primary gameplay
2. **Permanent Consequences** - Characters can permanently die; choices have real weight
3. **Character-Driven Narrative** - Characters grow, age, remember experiences, and eventually die
4. **Meaningful Moments** - 2-3 significant character events per floor create memorable punctuation to exploration
5. **Immersive First-Person** - Raycasting view maintains claustrophobic Wizardry atmosphere

**What This Game Is:**
- Spatial puzzle navigation game with heavy character flavor
- Slow-paced, deliberate exploration ("smell the roses")
- Consequence-driven where loss is real and meaningful
- Text-driven narrative without extensive visual assets

**What This Game Is NOT:**
- Complex spatial puzzle box (not Wizardry Gaiden IV)
- Action-focused dungeon crawler
- Story-driven with dungeons as backdrop
- Visually elaborate environment showcase

### 1.2 Pacing Goals

**Design Philosophy:**
Pacing is controlled through **tunable encounter density parameters** rather than fixed percentages. This allows rapid iteration based on playtest data. The system is designed to be flexible and adjustable without code changes.

**Key Pacing Levers:**
- Combat encounter rate (% per step)
- Room count per floor
- Event count per floor
- Navigation complexity (loops, one-ways, dark zones)

**Target Experience:**
- Navigation: Constant framework of gameplay
- Combat: Frequent enough for XP/loot progression (12-15 encounters per floor estimated)
- Events: 2-3 major character moments per floor (1 per 10-15 rooms)
- Events should feel like important punctuation, not constant interruption

**Resource Pressure:**
- No safe camping zones in dungeons (initially)
- Town is only safe rest location
- Creates "how far can we push?" tension
- Retreat/advance decisions drive exploration rhythm

**Iteration Approach:**
- All pacing parameters exposed as constants
- Telemetry tracking during playtests
- Adjust parameters based on data
- Accept that player behavior variance is natural

---

## PART 2: CHARACTER-DRIVEN SYSTEMS

### 2.1 NPC Interaction System

**NPC Placement:**
- 2-4 NPCs per floor
- Placed in distinctive rooms (larger rooms, dead-ends, central chambers)
- NPCs tied to progression or optional rewards

**NPC Truthfulness:**
- Some NPCs tell truth (helpful)
- Some NPCs lie or mislead (deceitful)
- Some NPCs withhold information unless conditions met
- No universal indicator of trustworthiness
- Deceitful nature may be hinted in dialogue tone

**NPC Interaction Types:**

**Type 1: Information Providers (Progression)**
- Provides clues about key locations
- Uses cryptic descriptions: "The key lies in the chamber with carved pillars"
- May require conditions: item exchange, charisma check, mind reading
- Example: "I saw adventurers hiding something in the collapsed eastern chamber"

**Type 2: Quest Givers (Optional Rewards)**
- Offers reward for service (fetch item, defeat enemy, explore area)
- Rewards: Consumables, temporary buffs, unique loot access
- Example: "Bring me a healing potion and I'll tell you where the treasure is"

**Type 3: Flavor NPCs (Atmospheric)**
- Provides lore, atmosphere, character moments
- No mechanical benefit
- Builds world through character dialogue
- Example: "I've been trapped here for weeks... the sounds at night..."

**Type 4: Hostile/Ambush NPCs**
- Appears friendly but attacks under conditions
- Creates trust/paranoia tension
- Rare (1 per 3-4 floors)

### 2.2 Character Abilities in Exploration

**Thief/Ninja - Secret Detection:**
- **Passive Detection:** Automatic chance to detect hidden doors/levers
  - **CRITICAL:** Detection check triggers ONLY when party moves onto tile with secret wall
  - Does NOT trigger when adjacent to secret
  - Probability = (Level × 10)% base chance
  - Example: Level 5 Thief = 50% chance to auto-detect
  - Triggers on room entry, one check per secret wall on that tile
  - Message: "Throk notices something odd about the northern wall"

- **Active Search:** Party can actively search current tile
  - **Searches current tile and walls of that tile ONLY** (not entire room)
  - Base success: 30%
  - With Thief/Ninja in party: +20% bonus
  - Per level of Thief/Ninja: +5% additional
  - Consumes time (risk of random encounter)
  - Message: "You search the area carefully..."

**Psionic - Mind Reading:**
- **Spell: Read Thoughts** (costs MP)
- Reveals NPC's true intentions and hidden knowledge
- Works on all NPCs (no immunity initially)
- Shows internal monologue or true feelings
- Example output:
  - NPC says: "I don't know anything about keys"
  - Mind reading reveals: "The key is under the altar, but I won't tell them"
- Can communicate with non-verbal NPCs
- Limited by spell points (resource management)

**Charisma - Social Influence:**
- Checked during NPC interactions (saving throw mechanic)
- High charisma = NPC more likely to be helpful/reveal information
- Check: NPC makes saving throw vs. highest party Charisma
- Failure = NPC is more cooperative
- Success = NPC is neutral/unhelpful
- Does NOT work on hostile NPCs or certain personality types

**Other Class Abilities (Future - Low Priority):**
- Mage: Sense magic items/auras
- Priest: Sense evil/undead presence
- Fighter: Notice tactical advantages in rooms
- NOTE: These are optional and low-priority

### 2.3 Character Event Modules (Hand-Authored)

**Important Context:**
- **Dungeons generated at game start:** All floors created when new game begins
- **Events placed at generation time:** Cannot check party composition at placement
- **Party composition varies:** Roster changes, so events can't require specific classes to appear
- **Events are content/narrative only:** Do not modify dungeon physical structure
- **Events persist until resolved:** Don't disappear if player leaves

**Module Library Size:**
- Create 8-12 total event modules initially
- Can expand library over time
- Each module is self-contained (no inter-dependencies)

**Module Placement:**
- 2-3 modules placed per floor at generation time
- Placed in "special" rooms:
  - Larger rooms (4×4 or bigger)
  - Dead-end rooms
  - Rooms in dark zones
  - Rooms containing keys
- Mark special rooms with distinctive descriptions

**Module Categories:**

**Category 1: Discovery Moments (Positive)**
- Find special item that character recognizes/covets
  - Triggers character dialogue about item's significance
  - May reveal character backstory
- Discover shrine or magical feature
  - May offer temporary buff
  - Requires personal offering or choice
- Encounter friendly NPC with valuable information
  - Shares lore, warnings, or shortcuts
  - May require item exchange or social check

**Category 2: Hard Choice Moments (Tension)**
- **Cursed Treasure:**
  - Powerful/valuable items visible
  - Taking them curses random party member
  - Curse: Permanent stat drain or affliction
  - Decision: Take it or leave it? Who volunteers for curse?

- **Collapsing Passage:**
  - Only path forward is collapsing
  - Choice: Rush through (injury risk) or find another way (resource cost)
  - No "good" option, only different consequences

- **Wounded NPC:**
  - Injured NPC needs immediate healing
  - Choice: Use precious resources to help, or leave them
  - Reveals party's moral character

**Category 3: Memory Moments (Story)**
- Location triggers character flashback
  - Character shares backstory with party
  - May reveal fears, motivations, relationships
- Find evidence of previous adventurers (corpse, journal, abandoned gear)
  - Generates discussion about mortality/legacy
  - Party members reflect on their own journey
- Environmental feature reminds character of past event
  - Character shares memory with party
  - Builds relationships between characters

**Module Structure:**
```typescript
interface EventModule {
  id: string;
  category: 'discovery' | 'hard_choice' | 'memory' | 'flavor';
  progressionType: 'required' | 'optional' | 'flavor';

  placement: {
    roomSizeMin: number;
    preferDeadEnd: boolean;
    preferDarkZone: boolean;
    preferKeyRoom: boolean;
  };

  title: string;
  description: string;

  choices: EventChoice[];

  state: 'available' | 'in_progress' | 'resolved';
  resolvedChoiceId?: string;
}

interface EventChoice {
  id: string;
  text: string;

  requirements?: {
    requiresClass?: CharacterClass[];
    requiresMinStat?: { stat: string; min: number };
    requiresItem?: string;
  };

  outcome: {
    narrative: string;
    effects: EventEffect[];
    characterReactions?: string[];
  };
}

interface EventEffect {
  type: 'gain_item' | 'lose_item' | 'stat_change' | 'curse' |
        'buff' | 'trigger_combat' | 'reveal_info';
  target: 'random' | 'chooser' | 'all' | 'specific_character';
  data: any;

  canApply(): boolean;
  apply(): boolean;
}
```

**Example Module - "The Cursed Chalice":**
```typescript
const CURSED_CHALICE_EVENT: EventModule = {
  id: 'cursed_chalice_01',
  category: 'hard_choice',
  progressionType: 'optional',

  placement: {
    roomSizeMin: 16,
    preferDeadEnd: true,
    preferDarkZone: false,
    preferKeyRoom: false,
  },

  title: "The Cursed Chalice",
  description:
    "In the center of the chamber, an ornate chalice sits alone on the floor. " +
    "It radiates magical power - clearly valuable. But the air around it feels " +
    "wrong, oppressive. Ancient runes scratched into the floor warn of a curse.",

  choices: [
    {
      id: 'take',
      text: "Take the chalice",
      outcome: {
        narrative:
          "As your fingers close around the chalice, dark energy floods through " +
          "you. One party member gasps in pain as the curse takes hold.",
        effects: [
          {
            type: 'gain_item',
            target: 'chooser',
            data: { itemId: 'chalice_eternal_thirst', cursed: true }
          },
          {
            type: 'curse',
            target: 'random',
            data: {
              curse: 'eternal_thirst',
              effect: { vitalityPenalty: -2, poisonVuln: 0.1 }
            }
          }
        ],
        characterReactions: [
          "Throk: 'Was that worth it?'",
          "Whisper: 'The price of greed...'"
        ]
      }
    },
    {
      id: 'leave',
      text: "Leave it undisturbed",
      outcome: {
        narrative:
          "You resist the temptation. The chalice remains where it sits, " +
          "its malevolent aura unchanged. Perhaps someone else will fall " +
          "prey to its lure.",
        effects: [],
        characterReactions: [
          "Bramble: 'A wise choice. Some treasures aren't worth the cost.'"
        ]
      }
    },
    {
      id: 'destroy',
      text: "Try to destroy the chalice (requires Fighter/Lord/Samurai)",
      requirements: {
        requiresClass: ['Fighter', 'Lord', 'Samurai']
      },
      outcome: {
        narrative:
          "You raise your weapon and bring it down on the chalice. It shatters " +
          "with an unholy shriek, and a dark spirit materializes to defend its prison!",
        effects: [
          {
            type: 'trigger_combat',
            target: 'all',
            data: {
              encounterId: 'cursed_guardian',
              onVictory: { itemId: 'purified_chalice' }
            }
          }
        ]
      }
    }
  ],

  state: 'available'
};
```

**Key Design Principles:**
- Events cannot require specific party composition to *appear* (dungeons pre-generated)
- Events CAN require specific classes for certain *choices* (choices get disabled)
- Events are pure narrative content (no physical dungeon modifications)
- Event outcomes resolve immediately with validation
- Events persist until player resolves them
- Events are hand-authored content integrated into procedural structure

---

## PART 3: SAVE SYSTEM & CONSEQUENCE ENFORCEMENT

### 3.1 Save System Design Philosophy

**Core Principle:** Enforce real consequences. Player cannot undo character deaths or major decisions through save manipulation.

**Problem Being Solved:**
- Standard "save after combat" allows exit-scumming (quit before loss, reload)
- Undermines permanent death, rescue missions, resurrection mechanics
- Players never experience emotional core of the game

**Solution:** Save BEFORE risky moments to lock in commitment.

### 3.2 Save Points

**1. Start of Combat:**
- Game saves immediately when combat is initiated
- BEFORE any combat actions are taken
- Character deaths during combat are permanent (saved)
- Implementation: `OnCombatStart()` → `SaveGame()`

**2. Before Event Choices:**
- Game saves when player is presented with a choice event
- BEFORE player selects an option
- Player must live with consequences of choice
- Implementation: `OnEventPresented()` → `SaveGame()`

**3. After Event Resolution:**
- Game saves after player makes choice and outcomes are applied
- Locks in choice consequences
- Implementation: `OnEventResolved()` → `SaveGame()`

**4. After Floor Completion:**
- Game saves when stairs down are used
- Acts as checkpoint/milestone
- Implementation: `OnFloorTransition()` → `SaveGame()`

**5. When Entering Town:**
- Game saves when party exits dungeon to town
- Represents safe return
- Implementation: `OnTownEntry()` → `SaveGame()`

**6. After Combat Completion:**
- Also save after combat ends successfully
- Ensures victory is recorded
- Implementation: `OnCombatEnd()` → `SaveGame()`

### 3.3 Implementation Details

**Save File Format:**
```json
{
  "save_version": "1.0.0",
  "timestamp": "ISO-8601",
  "save_type": "combat_start|event_choice|floor_complete|town_entry",
  "party_state": { /* full party serialization */ },
  "dungeon_state": { /* current floor state */ },
  "combat_seed": 12345,
  "event_seed": 67890
}
```

**Save Timing Guarantees:**
- Saves must complete BEFORE player can take action
- No player input processed until save is written to disk
- Display "Saving..." indicator if save takes >100ms
- On load, restore to exact moment of save (pre-action)

**Preventing Save Scumming:**
- Single save slot per character roster
- No manual save option
- No "save and quit" that lets player reload earlier
- Optional: Ironman mode (future) with no reload option at all

**Note on Complexity:** For MVP, keep save system simple. Advanced edge case handling (quit between event presentation and resolution) can be addressed later if it becomes a problem.

### 3.4 Death and Resurrection

**Character Death in Combat:**
- Character dies → saved immediately (via combat start save)
- No reload can prevent death
- Body remains on dungeon floor with party

**Party Wipe:**
- All characters dead/incapacitated → party remains in dungeon
- Player sent back to town
- Can create new/alternate party to rescue fallen party
- Rescue mission: Navigate to location, retrieve bodies
- Risk: Random encounters can damage/destroy corpses

**Resurrection System:**
- In town: Priest attempts resurrection (Wizardry-style)
  - Success: Character revived with penalties
  - Failure: Character turned to ash
- By party member (Priest/Bishop):
  - Higher failure rate than town
  - Failure: Character turned to ash
  - Allows field resurrection but risky

**Ash State:**
- Resurrection of ash is possible but very risky
- Failure: Character permanently lost (GONE FOREVER)
- No game mechanic can restore permanently lost characters

**Philosophy:** Death is serious. Players should feel loss. But not be punished with instant game over. Can recover with risk and cost.

---

## PART 4: ENCOUNTER & LOOT SYSTEMS

### 4.1 Encounter System

**Encounter Types:**
1. Random encounters (standard)
2. Fixed encounters (NPC events, bosses)
3. Ambush encounters (triggered by events/traps)

**Encounter Rate:**
- Base rate: 20% per step in corridors
- Modified by:
  - Room size: Larger rooms = lower rate
  - Floor depth: Deeper = higher rate
  - Party status: Injured/noisy = higher rate
  - Time spent: Longer in one area = higher rate

**Encounter Composition:**
- Based on floor theme and depth
- Monster groups fit theme (undead in crypt, goblins in warren)
- Difficulty scales with floor number
- No encounters in safe zones (entrance room, post-stairs)

### 4.2 Loot System

**Loot Source:**
- **PRIMARY:** Monster drops (Wizardry-style)
  - All loot comes from defeated enemies
  - No treasure chests (initially)
  - Monster drop tables by type and level

**Loot Quality:**
- Scales with floor depth and monster difficulty
- Special items from special monsters
- Cursed items possible (rare)

**Future Consideration:**
- May add rare treasure chests for special loot
- Chests would be event-tied (not randomly placed)
- Example: Cursed chest event module

---

## PART 5: OPEN QUESTIONS & FUTURE DESIGN

### 5.1 Unresolved Design Questions

**Question 1: Rescue Mission Mechanics**
- How does alternate party find the fallen party?
  - Marker on map?
  - Last known location recorded?
  - Must explore to find them?
- Can alternate party use fallen party's map?
- What happens to fallen party's loot if not rescued?

**Question 2: Character Aging System**
- How fast do characters age? (real-time vs game-time)
- What are effects of aging? (stat decay, retirement, death)
- Can aging be slowed/stopped?
- Does aging create gameplay pressure?

**Question 3: Character Memory System**
- What do characters remember?
- How are memories stored? (text tags, stats, flags)
- Do memories affect future events?
- Can characters share memories (storytelling mechanic)?

**Question 4: Event Module Replayability**
- Can same event appear on multiple floors?
- Should events remember if player has seen them before?
- Do event outcomes persist across playthroughs?
- Should rare events be truly rare (1% chance)?

**Question 5: NPC Persistence**
- Do NPCs persist across floors?
- Can player encounter same NPC again later?
- Do NPCs remember player choices?
- Can NPCs die/leave?

### 5.2 Systems for Future Expansion

**Not Included in MVP, but designed for:**

**Teleporter Networks:**
- Multiple linked teleporters
- Coordinated destinations
- Visual/audio feedback
- Could be added in Phase 3

**Rotating Rooms:**
- Entire room sections rotate 90°
- Changes corridor connections
- Complex spatial puzzle
- Would require significant new code

**Multi-Floor Connections:**
- Shafts/pits that drop multiple floors
- Shortcuts between non-adjacent floors
- Emergency escape routes
- Affects floor generation (must coordinate)

**Camping/Rest Zones:**
- Optional risky rest points
- Trade safety for ambush risk
- Save point alternative to town
- Currently excluded, but easy to add later

**Environmental Hazards:**
- Flooding rooms (timed challenge)
- Collapsing ceilings (damage over time)
- Poison gas areas (resource drain)
- Would integrate with existing tile properties

**Faction System:**
- NPCs belong to factions
- Player actions affect faction rep
- Affects NPC behavior
- Would add depth to NPC interactions

**Traps System:**
- If testing reveals players miss traps
- Implement as authored content in events
- Not random placement
- Telegraphed and fair

### 5.3 Performance Considerations

**Generation Time:**
- Target: <500ms to generate floor
- Most expensive: Room placement with collision detection
- Optimization: Spatial hashing for collision checks
- Fallback: If generation fails after N attempts, use simpler algorithm

**Memory Usage:**
- Each floor ~50-100KB serialized
- Could cache 3-5 floors in memory
- Lazy load floors as needed
- Serialize to localStorage for web build

**Rendering Performance:**
- Raycasting is computationally expensive
- Dark zones reduce raycasting load (helpful!)
- Optimize: Only raycast visible tiles
- Future: WebGL shader-based raycasting

---

## PART 6: SUCCESS METRICS

### 6.1 MVP Success Criteria

**MVP is successful when:**
- Players can explore a dense 20×20 dungeon
- Finding keys and unlocking stairs requires exploration
- Character death is permanent and creates emotional weight
- Navigation feels like classic Wizardry
- Save system prevents save scumming
- One-way doors create navigation variety
- All pacing parameters are tunable

### 6.2 Enhanced Version Success Criteria

**Enhanced version is successful when:**
- 2-3 memorable character moments per floor
- Character abilities matter in exploration
- NPCs create social tension (lies, mind reading)
- Dark zones create claustrophobic tension
- Switches add light puzzle solving
- Pacing feels right based on playtest data

### 6.3 Polished Game Success Criteria

**Polished game is successful when:**
- Replayability through varied event combinations
- Rescue missions create dramatic stakes
- Ironman mode offers ultimate challenge
- Character stories emerge naturally from gameplay
- Players feel emotionally invested in characters
- Balance is refined through iterative tuning

---

## CONCLUSION

**Remember the core goal:** Create a game where dungeons are **dramatic settings for character experiences**, not puzzle boxes. Everything should serve that goal. Characters come first, dungeons provide the framework for their stories.

**Flexibility is key:** The tunable constants system allows rapid iteration without code changes. Use it to find the right balance through playtesting rather than trying to solve pacing theoretically.

**Design philosophy:** Start simple, iterate based on playtest feedback and telemetry data. A simple, working system is better than a complex, broken one. Let data drive balance decisions, not hunches.

---

**Version:** 1.1 (Integrated from Requirements)
**Date:** 2025-11-03
**Author:** Collaborative design session (Christopher + Claude)
**Status:** Ready for implementation
