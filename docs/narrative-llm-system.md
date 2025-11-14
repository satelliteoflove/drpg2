# LLM-Assisted Narrative System
## Character-Driven Banter and Dialogue

**Document Purpose:** Design specification for LLM-generated narrative content that creates memorable, distinct characters with fresh experiences across playthroughs.

**Last Updated:** 2025-11-13

**Status:** Ready for Implementation - All ambiguities resolved

---

## PART 1: SYSTEM GOALS

### 1.1 Primary Goals

**Goal 1: Replayability**
- Each playthrough should feel fresh with different character interactions
- Same party composition on different runs produces varied banter
- Dungeon exploration doesn't feel repetitive across multiple games

**Goal 2: Character Personality Expression**
- Each character feels distinct and memorable through their speech
- Personality traits manifest naturally in banter and dialogue
- Players develop attachment to characters through their unique voices

**Goal 3: World Variety (Secondary)**
- NPCs and environments feel alive and unique
- Dungeon atmosphere enhanced through character observations
- Supports the "character-driven narrative" design pillar

### 1.2 Non-Goals (Out of Scope)

**What This System Does NOT Do:**
- Does not affect game mechanics or combat (100% flavor)
- Does not replace hand-authored story beats (complementary)
- Does not require internet (runs on local LLM via oobabooga)
- Does not generate enemy/monster personality (mechanical opponents only)

### 1.3 Design Philosophy

**Core Principle:** Use LLM generation to create variety and personality while maintaining tight control over game structure through templates and constraints.

**Approach:** Start small with party banter MVP, prove the system works, then expand to other narrative events (NPCs, quest givers, event modules).

**Technical Philosophy:** Follow SOLID principles - each service has single responsibility, clear interfaces, dependency injection via ServiceContainer.

---

## PART 2: MVP SCOPE - PARTY BANTER

### 2.1 What is Party Banter?

**Definition:** Spontaneous character comments and conversations that occur during dungeon exploration.

**Characteristics:**
- 100% flavor content (no mechanical impact)
- Ephemeral and atmospheric (not critical story beats)
- Context-aware (references location, recent events, party state)
- Variable participation (1-3+ characters depending on context)

**Examples:**
- Solo musing: "Throk: These walls remind me of the mines back home..."
- Two-person exchange:
  - "Whisper: I sense dark magic ahead."
  - "Bramble: Your senses are always so cheerful, aren't they?"
- Group conversation:
  - "Throk: Another locked door. Typical."
  - "Lyra: Perhaps if you stopped hitting things, we'd have more keys."
  - "Whisper: The key is likely hidden in the darkness ahead."

### 2.2 When Banter Triggers (Hybrid System)

**Trigger Categories:**

**1. Time-Based Triggers:**
- Every 3 minutes of active exploration (180 seconds)
- Timer resets after banter occurs
- Prevents long silence during slow exploration

**2. Distance-Based Triggers:**
- Every 20 steps/tiles explored
- Ensures banter during rapid navigation
- Prevents overwhelming frequency

**3. Event-Driven Triggers (MVP Scope):**
- When character dies
- When party average HP < 30% OR single character < 30% HP
- When entering dark zones

**Trigger Logic:**
```
Banter can trigger when:
  (TimeElapsed >= 180 seconds) OR
  (StepsTaken >= 20 tiles) OR
  (SignificantEvent just occurred)

AND
  (No banter in last 60 seconds)
```

**Trigger Priorities (Highest to Lowest):**
1. Character Death (priority: 100)
2. Low HP Warning (priority: 75)
3. Dark Zone Entry (priority: 50)
4. Ambient Time (priority: 10)
5. Ambient Distance (priority: 10)

Priority values stored in GameConstants for easy editing.

### 2.3 Banter Context (What LLM Knows)

**Full Party State Context:**

The LLM receives comprehensive context to generate relevant, situational banter:

**Character Information:**
- All party members (names, races, classes, levels, alignments)
- Each character's personality traits (4 traits per character)
- Current HP/MP status for each character
- Active status effects (poisoned, cursed, etc.)
- Recent character events (death, resurrection, level-up)

**Location Information:**
- Current dungeon floor number
- Dungeon theme (crypt, mine, laboratory, warren)
- Current room type (corridor, large chamber, dead-end)
- Darkness level (normal, dark zone)
- Time spent on current floor

**Recent Events:**
- Last combat result (victory, defeat, fled)
- Combat difficulty (easy, hard, near-death experience)
- Recent discoveries (treasure, key, secret door)
- Items found in last few minutes
- Traps triggered recently

**Party State:**
- Average party HP percentage
- MP resources remaining
- Inventory space/weight
- Keys collected vs needed

**Context Format (JSON):**
```json
{
  "trigger": {
    "type": "combat_victory|treasure_found|ambient|...",
    "details": "Defeated 3 goblins, party took heavy damage"
  },
  "party": {
    "members": [
      {
        "name": "Throk",
        "race": "Dwarf",
        "class": "Fighter",
        "level": 3,
        "alignment": "Lawful Good",
        "personality": {
          "temperament": "brave",
          "social": "gruff",
          "outlook": "pessimistic",
          "speech": "blunt"
        },
        "hp": 18,
        "maxHp": 32,
        "status": ["wounded"]
      }
    ],
    "avgHpPercent": 45
  },
  "location": {
    "floor": 2,
    "theme": "ancient_crypt",
    "roomType": "corridor",
    "isDark": false
  },
  "recentEvents": [
    "combat_victory_hard",
    "treasure_found_minor"
  ]
}
```

### 2.4 Banter Exchange Size (Variable)

**Exchange Types:**

**Solo Musing (40% of banter):**
- One character makes a comment or observation
- 1-2 sentences
- Simplest to generate
- Good for ambient atmosphere
- Example: "Throk: I've seen darker tombs, but not many."

**Two-Person Exchange (40% of banter):**
- Two characters have brief back-and-forth
- 2-4 lines total (1-2 lines each)
- Creates character relationships
- Shows personality contrasts
- Example:
  - "Lyra: Must you be so grim all the time, Throk?"
  - "Throk: Must you be so cheerful in a crypt?"

**Group Conversation (20% of banter):**
- 3+ characters participate
- 4-6 lines total
- Reserved for significant moments
- Rich character dynamics
- Example:
  - "Whisper: The darkness here is unnatural."
  - "Bramble: Everything's unnatural to you."
  - "Throk: Both of you, quiet. I hear something."

**Selection Logic:**
- Event-driven triggers favor group conversations
- Ambient triggers favor solo musings or two-person exchanges
- Character personalities influence participation (verbose vs taciturn)

### 2.5 UI Presentation

**Message Log Integration:**

**Display Location:** Existing message log (same as combat messages, movement messages)

**Visual Distinction:**
- **Color:** Each character has their own dialogue color (player-configurable from 256-color HSL palette)
- **Format:** Character name prefix: "Throk: [banter text]"
- **Spacing:** Blank line before AND after banter block for readability

**Example in Message Log:**
```
You moved north.
The corridor continues ahead.

Throk: These walls are closing in. I don't like it.
Whisper: Your claustrophobia is showing again.

You moved north.
```

Note: Each character's full line (name + text) rendered in their dialogueColor.

**Scrollback:**
- Banter persists in message log during session
- Player can scroll back to re-read
- Message log cleared on floor transition (standard behavior)

**No Special UI Elements (MVP):**
- No speech bubbles or overlay popups
- No modal dialogue boxes
- No interruption to gameplay flow
- Banter flows naturally with game messages
- Displays even if player is in menu (inventory, character sheet)

**Player Configuration:**
- Banter can be disabled via GAME_CONFIG.BANTER.DISABLE_BANTER
- Character dialogue colors configurable from character sheet (both Town and Dungeon)

**Future Enhancement Options:**
- Temporary speech bubble overlay (subtle, non-blocking)
- Character portrait icons next to banter
- Sound effects or voice mumbles
- Configuration screen UI (instead of constants)

---

## PART 3: CHARACTER PERSONALITY SYSTEM

### 3.1 Personality Trait Categories

**Four Categories of Traits (use TypeScript enums):**

Each character is assigned one trait from each category for a complete personality profile.

```typescript
enum Temperament {
  Brave = 'brave',
  Cautious = 'cautious',
  Reckless = 'reckless',
  Calculating = 'calculating',
}

enum Social {
  Friendly = 'friendly',
  Gruff = 'gruff',
  Sarcastic = 'sarcastic',
  Earnest = 'earnest',
}

enum Outlook {
  Optimistic = 'optimistic',
  Pessimistic = 'pessimistic',
  Pragmatic = 'pragmatic',
  Idealistic = 'idealistic',
}

enum SpeechStyle {
  Verbose = 'verbose',
  Taciturn = 'taciturn',
  Poetic = 'poetic',
  Blunt = 'blunt',
}
```

**Category 1: Temperament (How they react)**
- Brave - Fearless, rushes into danger, confident
- Cautious - Careful, risk-averse, thinks before acting
- Reckless - Impulsive, thrill-seeking, disregards danger
- Calculating - Analytical, strategic, weighs odds

**Category 2: Social (How they interact)**
- Friendly - Warm, approachable, seeks connection
- Gruff - Rough, brusque, uncomfortable with emotion
- Sarcastic - Mocking, witty, uses humor as shield
- Earnest - Sincere, honest, takes things seriously

**Category 3: Outlook (How they view the world)**
- Optimistic - Hopeful, sees the good, expects success
- Pessimistic - Expects the worst, cynical, dark humor
- Pragmatic - Realistic, practical, focused on results
- Idealistic - Principled, believes in higher purpose

**Category 4: Speech Style (How they talk)**
- Verbose - Long-winded, eloquent, enjoys talking
- Taciturn - Few words, terse, only speaks when needed
- Poetic - Metaphorical, artistic, flowery language
- Blunt - Direct, plain-spoken, no frills

**Total Trait Pool:** 16 traits (4 per category)

### 3.2 Trait Assignment at Character Creation

**Assignment Method:** Random selection

**Process:**
1. When character is created (at end of character creation, before adding to roster)
2. Select one random trait from each category
3. Store traits on Character entity
4. Display on character sheet (visible to player)
5. Also assign random dialogue color from 256-color HSL palette

**Example Character Personalities:**

**Throk the Dwarf Fighter:**
- Temperament: Brave
- Social: Gruff
- Outlook: Pessimistic
- Speech: Blunt
- *Result: Fearless but rough-edged veteran who expects the worst*

**Whisper the Elf Mage:**
- Temperament: Cautious
- Social: Earnest
- Outlook: Idealistic
- Speech: Poetic
- *Result: Thoughtful mystic who speaks in riddles and metaphors*

**Bramble the Hobbit Thief:**
- Temperament: Reckless
- Social: Sarcastic
- Outlook: Pragmatic
- Speech: Verbose
- *Result: Talkative risk-taker with a quick wit and sharp tongue*

### 3.3 Trait Visibility and Color Configuration

**Character Sheet Display:**
- Personality section on character sheet
- Shows all 4 traits clearly
- Visible during creation and throughout game
- No hidden traits (player knows their characters' personalities)
- Dialogue color displayed and configurable

**Example Character Sheet Section:**
```
Name: Throk
Race: Dwarf
Class: Fighter
Level: 3
Alignment: Lawful Good

Personality:
  Temperament: Brave
  Social: Gruff
  Outlook: Pessimistic
  Speech: Blunt

Dialogue Color: [color swatch] (Press C to change)
```

**Color Picker UI:**
- Accessible from character sheet in Town or Dungeon
- Grid layout: 32 columns × 8 rows = 256 colors
- Keyboard navigation: Arrow keys to navigate, Enter to select, Escape to cancel
- 256-color HSL palette: 32 hues × 8 brightness levels

**Player Understanding:**
- Traits inform player expectations
- Player learns how characters will react
- Creates anticipation for banter
- Colors help distinguish characters in message log

### 3.4 Trait Influence on Banter

**How Traits Shape LLM Generation:**

Traits are included in LLM prompt to guide personality expression:

**Prompt Structure:**
```
Character: Throk, a male Dwarf Fighter, level 3, Lawful Good alignment.
Personality: Brave, Gruff, Pessimistic, Blunt.

Context: Party just defeated 3 goblins in a hard fight. Party HP is low (45%).
Location: Ancient crypt, floor 2, dark corridor.

Generate a brief comment from Throk reacting to this situation.
Throk is brave but expects the worst. He's gruff and speaks bluntly.
1-2 sentences maximum.
```

**Expected Output:**
"We lived. Barely. More of them ahead, I'm sure."

**Trait Combinations Create Unique Voices:**
- Brave + Gruff + Pessimistic + Blunt = Stoic veteran
- Cautious + Friendly + Optimistic + Verbose = Encouraging mentor
- Reckless + Sarcastic + Pragmatic + Taciturn = Witty troublemaker

### 3.5 Data Structure

**Character Entity Extension:**

```typescript
interface PersonalityTraits {
  temperament: Temperament;
  social: Social;
  outlook: Outlook;
  speech: SpeechStyle;
}

interface Character {
  name: string;
  race: CharacterRace;
  class: CharacterClass;
  alignment: CharacterAlignment;
  level: number;

  personality: PersonalityTraits;
  dialogueColor: string;
}
```

**Color Palette Utility:**

```typescript
class ColorPalette {
  private static palette: string[] | null = null;

  public static getHSLPalette(): string[] {
    if (this.palette) return this.palette;

    const colors: string[] = [];
    const hues = 32;
    const lightnesses = 8;

    for (let h = 0; h < hues; h++) {
      for (let l = 0; l < lightnesses; l++) {
        const hue = (h * 360) / hues;
        const lightness = 30 + (l * 50) / (lightnesses - 1);
        const saturation = 70;

        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
      }
    }

    this.palette = colors;
    return colors;
  }
}
```

---

## PART 4: LLM INTEGRATION ARCHITECTURE

### 4.1 Local LLM via oobabooga

**Why Local LLM:**
- No API costs (running Wayfarer-12B locally)
- No internet dependency
- Fast response times on local hardware
- Complete control over model and parameters
- Privacy (no data sent externally)

**Model: Wayfarer-12B**
- Narrative-focused 12B parameter model
- Trained on storytelling and RPG content
- Uses ChatML prompt format
- Supports up to 32k context window
- Recommended for second-person narrative generation

**API Service Layer:**

```typescript
interface BanterGenerator {
  generate(context: BanterContext): Promise<BanterResponse>;
}
```

**Configuration (in GameConstants.ts):**
```typescript
BANTER: {
  LLM: {
    ENDPOINT: 'http://localhost:5000/v1/chat/completions',
    MODEL: 'wayfarer-12b',
    MAX_INPUT_TOKENS: 8000,
    MAX_OUTPUT_TOKENS: 256,
    TEMPERATURE: 0.8,
    REPETITION_PENALTY: 1.05,
    MIN_P: 0.025,
    TIMEOUT_MS: 5000,
  }
}
```

**IMPORTANT - API Request Format:**

The oobabooga `/v1/chat/completions` endpoint uses **OpenAI-compatible message format**.

**Implementation:**
```typescript
interface BuiltPrompt {
  systemPrompt: string;
  userPrompt: string;
  metadata: {
    triggerType: BanterTriggerType;
    exchangeType: 'solo' | 'two_person' | 'group';
    speaker: string;
    estimatedTokens: number;
  };
}

// PromptBuilder returns structured data
const builtPrompt = PromptBuilder.buildPrompt(context);

// BanterGenerator uses it directly
fetch(endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'system', content: builtPrompt.systemPrompt },
      { role: 'user', content: builtPrompt.userPrompt }
    ],
    temperature: 0.8,
    max_tokens: 256,
    repetition_penalty: 1.05,
    min_p: 0.025
  })
})
```

**Design Principles:**
- PromptBuilder returns structured `BuiltPrompt` interface, not formatted strings
- System and user prompts are plain text (no ChatML tags)
- BanterGenerator receives prompts ready to send to API
- No conversion or parsing needed between builder and generator
- Metadata included for logging and debugging

### 4.2 Async Generation with Queue

**Problem:** LLM generation takes 2-5 seconds, can't block gameplay.

**Solution:** Async generation with queue management (no caching in MVP).

**Flow:**

1. **Trigger fires** (time/distance/event)
2. **Add to generation queue**
3. **Process queue asynchronously** (one at a time)
4. **Generate in background** (non-blocking API call)
5. **Display when complete** (2-5 seconds later)
6. **Player may have moved on** (banter appears in message log regardless)

**Implementation Pattern:**

```typescript
class BanterOrchestrator {
  private generationQueue: BanterTrigger[] = [];
  private isGenerating = false;

  public update(deltaTime: number, gameState: GameState): void {
    const trigger = this.triggerDetector.checkTriggers(gameState);

    if (trigger) {
      this.generationQueue.push(trigger);
      this.triggerDetector.markTriggerFired();
    }

    if (!this.isGenerating && this.generationQueue.length > 0) {
      this.processNextTrigger(gameState);
    }
  }

  private async processNextTrigger(gameState: GameState): Promise<void> {
    if (this.generationQueue.length === 0) return;

    this.isGenerating = true;
    const trigger = this.generationQueue.shift()!;

    try {
      const context = this.contextBuilder.buildContext(trigger, gameState);
      const response = await this.generator.generate(context);
      const validation = this.validator.validate(response, context);

      if (validation.valid) {
        this.presenter.display(response, gameState);
      } else {
        this.displayErrorMessage(gameState);
      }
    } catch (error) {
      this.displayErrorMessage(gameState);
    } finally {
      this.isGenerating = false;
    }
  }
}
```

**Player Experience:**
- Trigger fires (e.g., entering dark zone)
- Player continues exploring
- 2-5 seconds later, banter appears in message log
- Feels natural (characters reacting to what just happened)

### 4.3 Service Architecture (SOLID Principles)

**Separation of Concerns:**

The banter system is decomposed into focused services, each with single responsibility:

1. **BanterOrchestrator** - Coordinates the entire flow
   - Integrates all other services
   - Manages generation queue
   - Handles timing and state

2. **TriggerDetector** - Detects when banter should occur
   - Time/distance/event triggers
   - Priority ordering
   - Cooldown enforcement

3. **BanterGenerator** - Communicates with LLM
   - Constructs prompts
   - Calls oobabooga API
   - Parses responses

4. **BanterValidator** - Prevents hallucinations
   - Validates character names
   - Rejects item references
   - Enforces format

5. **BanterPresenter** - Displays banter in message log
   - Formats with character colors
   - Adds spacing

6. **BanterEventTracker** - Tracks recent game events
   - Records deaths, dark zones, etc.
   - Provides event history for context

7. **BanterMetrics** - Collects performance data
   - Timing, success rates
   - Trigger frequencies
   - Periodic logging

**All services registered as singletons in ServiceRegistry.**

### 4.4 Context Collection (Tiered Strategy)

**Tiered Context System:**

Send different amounts of context based on trigger importance to stay within 8k token budget.

**Tier 1 - Minimal** (~500 tokens, for ambient triggers):
```typescript
interface MinimalContext {
  trigger: BanterTrigger;
  speaker: CharacterInfo;
  location: LocationInfo;
}
```

**Tier 2 - Standard** (~2000 tokens, for event triggers):
```typescript
interface StandardContext extends MinimalContext {
  party: PartyInfo;
}
```

**Tier 3 - Rich** (~4000 tokens, for critical events):
```typescript
interface RichContext extends StandardContext {
  recentEvents: GameEvent[];
}
```

**Tier Selection Logic:**
- Character Death → Rich context (full event history)
- Low HP Warning, Dark Zone → Standard context (party state)
- Ambient Time/Distance → Minimal context (just speaker + location)

**Benefits:**
- Saves tokens on low-priority triggers
- Provides detailed context where it matters
- Keeps well under 8k token budget

### 4.5 LLM Prompt Design (ChatML Format)

**Wayfarer-12B uses ChatML format:**

```
<|im_start|>system
{system prompt}<|im_end|>
<|im_start|>user
{user prompt}<|im_end|>
<|im_start|>assistant
```

**System Prompt (Comprehensive, sent once):**

```
<|im_start|>system
You generate character banter for a medieval fantasy dungeon crawler RPG.

PERSONALITY TRAITS:

Temperament (how they react):
- Brave: Fearless, confident, rushes into danger
- Cautious: Careful, risk-averse, thinks before acting
- Reckless: Impulsive, thrill-seeking, disregards safety
- Calculating: Analytical, strategic, weighs odds

Social (how they interact):
- Friendly: Warm, approachable, seeks connection
- Gruff: Rough, brusque, uncomfortable with emotion
- Sarcastic: Mocking, witty, uses humor as shield
- Earnest: Sincere, honest, takes things seriously

Outlook (how they view the world):
- Optimistic: Hopeful, sees the good, expects success
- Pessimistic: Expects worst, cynical, dark humor
- Pragmatic: Realistic, practical, focused on results
- Idealistic: Principled, believes in higher purpose

Speech Style (how they talk):
- Verbose: Long-winded, eloquent, enjoys talking
- Taciturn: Few words, terse, speaks when needed
- Poetic: Metaphorical, artistic, flowery language
- Blunt: Direct, plain-spoken, no frills

OUTPUT RULES:
- Match character personality exactly
- Solo musing: 1-2 sentences max
- Two-person exchange: 2-4 lines total
- Group conversation: 4-6 lines total
- Format each line as: "Name: dialogue"
- Use medieval fantasy tone (no modern slang)
- DO NOT mention specific items or equipment
- DO NOT reference events not provided in context
- Keep responses brief and conversational<|im_end|>
```

**User Prompt (Per-generation, minimal):**

```
<|im_start|>user
Character: Throk, Dwarf Fighter, level 3
Personality: brave, gruff, pessimistic, blunt

Location: Floor 2, dark zone
Trigger: Party entered dark zone

Generate a brief solo musing from Throk.<|im_end|>
<|im_start|>assistant
```

**Key Differences from Original:**
- System prompt contains ALL trait descriptions (sent once, not repeated)
- User prompt is minimal (just context + character traits)
- Reduces redundancy and token usage
- Better suited for 12B model with limited context

### 4.6 Error Handling and Fallbacks

**Failure Scenarios:**

**1. API Unavailable (oobabooga not running):**
- Action: Log error to debug.log with full details
- Fallback: Display "Banter system failure." in message log (red color #ff6666)
- User Impact: Visible error message, gameplay continues
- Recovery: Retry on next trigger

**2. Generation Timeout (>5 seconds):**
- Action: Cancel request, log timeout
- Fallback: Display "Banter system failure." in message log
- User Impact: Visible error message
- Recovery: Retry on next trigger

**3. Invalid/Inappropriate Response:**
- Action: Validate response format and content
- Fallback: Display "Banter system failure." in message log
- User Impact: Visible error message
- Recovery: Log validation errors for prompt tuning

**4. Network Error:**
- Action: Log parse error and raw response (if available)
- Fallback: Display "Banter system failure." in message log
- Recovery: Retry on next trigger

**5. Multiple Consecutive Failures (3+):**
- Action: Log alert to debug.log for investigation
- Fallback: Continue trying (don't disable system)
- User Impact: Multiple error messages visible
- Recovery: Manual intervention may be needed

**Error Logging:**

All failures logged to debug.log with comprehensive details:

```typescript
DebugLogger.error('BanterGenerator', 'Generation failed', {
  error: error.message,
  trigger: context.trigger.type,
  speaker: context.speaker.name,
  generationTimeMs: elapsedTime,
  promptSummary: `${context.trigger.type} - ${context.speaker.name}`,
});
```

**Full Logging for Troubleshooting:**
- Log everything: prompts, responses, validation errors
- Enables AI-assisted debugging via direct file read
- No need to ask user for console output

**Graceful Degradation:**
- Banter is 100% flavor (no gameplay impact)
- Failures show visible error message but don't break game
- Core gameplay continues normally
- Player aware of system failure (transparent error reporting)

**No Silent Failures:**
- Always show "Banter system failure." to player
- Makes debugging easier (player knows when system breaks)
- Transparent about technical issues

---

## PART 5: DATA STRUCTURES AND TYPES

### 5.1 Banter Context

```typescript
enum BanterTriggerType {
  CharacterDeath = 'character_death',
  LowHpWarning = 'low_hp_warning',
  DarkZoneEntry = 'dark_zone_entry',
  AmbientTime = 'ambient_time',
  AmbientDistance = 'ambient_distance',
}

interface BanterTrigger {
  type: BanterTriggerType;
  priority: number;
  details: string;
  timestamp: number;
}

interface MinimalContext {
  trigger: BanterTrigger;
  speaker: CharacterInfo;
  location: LocationInfo;
}

interface StandardContext extends MinimalContext {
  party: PartyInfo;
}

interface RichContext extends StandardContext {
  recentEvents: GameEvent[];
}

interface PartyInfo {
  members: CharacterInfo[];
  avgHpPercent: number;
  avgMpPercent: number;
  hasActiveStatusEffects: boolean;
}

interface CharacterInfo {
  name: string;
  race: CharacterRace;
  class: CharacterClass;
  level: number;
  alignment: CharacterAlignment;
  personality: PersonalityTraits;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  status: CharacterStatus[];
}

interface LocationInfo {
  floor: number;
  isDark: boolean;
}

enum GameEventType {
  CharacterDeath = 'character_death',
  DarkZoneEntry = 'dark_zone_entry',
  CombatVictory = 'combat_victory',
  TreasureFound = 'treasure_found',
}

interface GameEvent {
  type: GameEventType;
  timestamp: number;
  characterName?: string;
  details: string;
}
```

### 5.2 Banter Response

```typescript
interface BanterResponse {
  exchangeType: 'solo' | 'two_person' | 'group';
  participants: string[];
  lines: BanterLine[];
  generatedAt: number;
}

interface BanterLine {
  characterName: string;
  text: string;
}
```

### 5.3 Validation

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
}

interface BanterValidator {
  validate(
    response: BanterResponse,
    context: MinimalContext | StandardContext | RichContext
  ): ValidationResult;
}
```

**Validation Rules:**
- Only characters in the party can speak
- No references to specific items or equipment
- No modern slang (cool, okay, yeah, etc.)
- Format must be "Name: dialogue"
- No empty lines

### 5.4 Service Interfaces

```typescript
interface TriggerDetector {
  checkTriggers(gameState: GameState): BanterTrigger | null;
  markTriggerFired(): void;
}

interface BanterGenerator {
  generate(context: MinimalContext | StandardContext | RichContext): Promise<BanterResponse>;
}

interface BanterPresenter {
  display(response: BanterResponse, gameState: GameState): void;
}

interface BanterEventTracker {
  recordEvent(event: GameEvent): void;
  getRecentEvents(maxAge?: number): GameEvent[];
  clearEvents(): void;
  recordCharacterDeath(characterName: string): void;
  recordDarkZoneEntry(): void;
}

interface BanterMetrics {
  recordGeneration(timeMs: number, success: boolean): void;
  recordValidationFailure(): void;
  recordApiFailure(): void;
  recordSuccess(triggerType: BanterTriggerType): void;
  getMetrics(): MetricsData;
  getStats(): any;
}
```

---

## PART 6: IMPLEMENTATION PLAN

### 6.1 Phase 1: Foundation & Data Structures (Week 1)

**Tasks:**

1. **Create Type Definitions and Enums**
   - Create Temperament, Social, Outlook, SpeechStyle enums
   - Create BanterTriggerType enum
   - Create GameEventType enum
   - Define all interfaces (PersonalityTraits, BanterTrigger, contexts, etc.)

2. **Extend Character Entity**
   - Add PersonalityTraits field
   - Add dialogueColor field
   - Implement random trait assignment in constructor
   - Implement random color assignment from ColorPalette

3. **Create ColorPalette Utility**
   - Implement 256-color HSL palette generation
   - 32 hues × 8 lightness levels
   - Static palette caching

4. **Add Configuration to GameConstants**
   - Add BANTER section with all config
   - Trigger thresholds (180s, 20 steps, 60s cooldown)
   - Trigger priorities (100, 75, 50, 10, 10)
   - LLM configuration (endpoint, model, temperature, etc.)
   - DISABLE_BANTER flag

5. **Create Service Identifiers**
   - Add all banter service identifiers to ServiceIdentifiers.ts

**Deliverable:** Data structures complete, Character has personality & color

### 6.2 Phase 2: Core Services (Week 1-2)

**Tasks:**

6. **Create BanterEventTracker Service**
   - Implement event recording
   - Rolling 10-event history
   - recordCharacterDeath() and recordDarkZoneEntry() methods
   - getRecentEvents() with max age filter

7. **Create TriggerDetector Service**
   - Implement time-based trigger (180s)
   - Implement distance-based trigger (20 steps with position tracking)
   - Implement event-based triggers (death, low HP, dark zone)
   - Implement cooldown (60s)
   - Implement priority ordering
   - markTriggerFired() method

8. **Create BanterMetrics Service**
   - Track generation timing (avg, p95)
   - Track success/failure rates
   - Track validation failures
   - Track API failures
   - Track banter by trigger type
   - Periodic logging (every 5 minutes)
   - getStats() method

9. **Integrate EventTracker into Game**
   - Hook into DungeonScene for dark zone detection
   - Hook into CombatSystem for death detection
   - Test event recording via debug.log

**Deliverable:** All tracking and detection services working

### 6.3 Phase 3: LLM Integration (Week 2)

**Tasks:**

10. **Create ContextBuilder Utility**
    - Implement tiered context building (Minimal/Standard/Rich)
    - Tier selection based on trigger type
    - buildCharacterInfo(), buildPartyInfo(), buildLocationInfo()
    - selectSpeaker() logic

11. **Create PromptBuilder Utility**
    - ChatML format implementation
    - System prompt (comprehensive, with all trait descriptions)
    - User prompt (minimal, per-generation)
    - selectExchangeType() logic

12. **Create BanterGenerator Service**
    - Implement callLLMAPI() with fetch + timeout
    - Implement prompt building
    - Implement response parsing (extract dialogue lines)
    - Error handling and logging
    - Integration with BanterMetrics

13. **Create BanterValidator Service**
    - checkCharacterNames() rule
    - checkNoItemReferences() rule
    - checkNoModernSlang() rule
    - checkFormat() rule
    - Track consecutive failures

**Deliverable:** Complete generation pipeline (context → prompt → API → validation)

### 6.4 Phase 4: Presentation & Orchestration (Week 2-3)

**Tasks:**

14. **Extend MessageLog**
    - Add addBanterExchange() method
    - Handle character color lookups
    - Add blank lines before/after banter

15. **Create BanterPresenter Service**
    - Implement display() method
    - Character color mapping
    - Message log integration
    - Error message display ("Banter system failure.")

16. **Create BanterOrchestrator Service**
    - Integrate all services via constructor DI
    - Implement update() method (hook into game loop)
    - Implement generation queue
    - Implement async processNextTrigger()
    - Error handling with error message display

17. **Register All Services**
    - Update ServiceRegistry with all banter services
    - Register as singletons
    - Wire up dependencies

18. **Integrate into DungeonScene**
    - Hook BanterOrchestrator.update() into DungeonScene.update()
    - Check DISABLE_BANTER flag
    - Test end-to-end flow

**Deliverable:** Complete banter system working in-game

### 6.5 Phase 5: UI - Color Picker (Week 3)

**Tasks:**

19. **Add Color Picker to CharacterSheetScene**
    - Add 'colorPicker' mode
    - Implement 32×8 grid rendering
    - Implement keyboard navigation (arrows, enter, escape)
    - Show currently selected color
    - Persist color to Character.dialogueColor

20. **Update Character Sheet Display**
    - Show current dialogue color
    - Show "Press C to change color" hint
    - Test in both Town and Dungeon scenes

**Deliverable:** Player can configure character dialogue colors

### 6.6 Phase 6: Testing, Tuning & Polish (Week 3)

**Tasks:**

21. **Run Typecheck**
    - npm run typecheck
    - Fix all type errors

22. **Test All Trigger Types**
    - Ambient time trigger (wait 3 minutes)
    - Ambient distance trigger (walk 20 steps)
    - Character death trigger
    - Low HP trigger (individual and party average)
    - Dark zone entry trigger

23. **Test Error Scenarios**
    - oobabooga offline
    - Timeout (>5s)
    - Bad LLM response (validation fails)
    - Multiple consecutive failures

24. **Review debug.log**
    - Check all logging is working
    - Verify metrics are being tracked
    - Review any unexpected errors

25. **Prompt Tuning**
    - Test various scenarios
    - Adjust system prompt if needed
    - Adjust temperature/sampling if needed
    - Iterate based on quality

26. **Add AI Interface Extensions**
    - window.AI.banter.trigger()
    - window.AI.banter.getMetrics()
    - window.AI.banter.getEventHistory()

**Deliverable:** Fully tested, production-ready banter system

### 6.7 Phase 7: Future Enhancements (Post-MVP)

**Potential Additions:**

- **Pre-generation optimization:** Generate during idle time
- **Caching system:** Add back caching with variety (multiple cached options)
- **NPC dialogue system:** Extend to quest givers and info providers
- **Event module integration:** LLM-generated event descriptions
- **Character memory:** Track banter history for continuity
- **Relationship system:** Characters develop opinions of each other
- **UI improvements:** Speech bubble overlays, portraits
- **Configuration screen:** Replace GameConstants with in-game UI

---

## PART 7: TESTING AND VALIDATION

### 7.1 Unit Tests

**Test Coverage:**

1. **Personality Trait Assignment**
   - Each character gets exactly one trait per category
   - Traits are randomly distributed across party
   - No duplicate trait sets across all characters (statistically)

2. **Trigger Detection**
   - Time-based triggers fire correctly
   - Distance-based triggers fire correctly
   - Event-driven triggers fire on events
   - Cooldown prevents spam

3. **Context Collection**
   - BanterContext accurately reflects game state
   - All required fields populated
   - Recent events tracked correctly

4. **Cache Operations**
   - Cache stores and retrieves correctly
   - Cache keys are consistent
   - Cache eviction works

5. **Error Handling**
   - Network failures handled gracefully
   - Timeouts handled gracefully
   - Invalid responses rejected
   - Logging works correctly

### 7.2 Integration Tests

**Test Scenarios:**

1. **End-to-End Flow**
   - Trigger fires → context collected → API called → response displayed
   - Verify message appears in log with correct formatting
   - Verify character names prefixed correctly

2. **Async Timing**
   - Generation completes while player continues exploration
   - Banter appears 2-5 seconds after trigger
   - Multiple queued generations handled correctly

3. **Cache Hit/Miss**
   - Similar contexts produce cache hits
   - Different contexts produce cache misses
   - Cache eviction clears old entries

4. **Error Recovery**
   - API failure doesn't crash game
   - Next trigger works after failure
   - Rate limiting gracefully reduces frequency

### 7.3 Playtest Criteria

**Evaluation Questions:**

1. **Frequency:** Does banter feel too frequent, too rare, or just right?
2. **Relevance:** Does banter make sense for the situation?
3. **Personality:** Do characters feel distinct and consistent?
4. **Quality:** Is the generated text engaging and well-written?
5. **Latency:** Does the 3-5 second delay feel natural or annoying?
6. **Integration:** Does banter enhance or distract from exploration?

**Tuning Parameters:**
- Adjust trigger thresholds (time, distance)
- Adjust cooldown period
- Adjust prompt for quality
- Adjust exchange type distribution (solo/two-person/group)

### 7.4 Debug Tools

**AI Interface Extensions:**

```typescript
window.AI.banter = {
  trigger: (type: string) => void;
  showContext: () => BanterContext;
  showCache: () => Map<string, BanterResponse>;
  clearCache: () => void;
  testGeneration: (characterName: string) => Promise<BanterResponse>;
  showTriggerStats: () => TriggerStatistics;
};
```

**Debug Logging:**

All banter system events logged to debug.log:
- Trigger fires (type, context summary)
- Generation starts (prompt preview)
- Generation completes (timing, token count)
- Display occurs (text shown)
- Errors (full details)

---

## PART 8: OPEN QUESTIONS AND FUTURE CONSIDERATIONS

### 8.1 Unresolved Design Questions

**Question 1: Prompt Engineering**
- What prompt temperature/sampling parameters work best?
- Should we use few-shot examples in prompts?
- How much context is too much context?

**Question 2: Character Voice Consistency**
- How consistent should a character's voice be across different banters?
- Should we track previous banter to maintain continuity?
- Should characters reference past conversations?

**Question 3: Party Dynamics**
- Should characters develop relationships over time?
- Should some character pairs banter more than others?
- Should alignments affect who talks to whom?

**Question 4: Cost and Rate Limiting**
- How many API calls per play session is reasonable?
- What's the cost per playthrough?
- Should we implement client-side rate limiting?

**Question 5: Multilingual Support**
- Should banter support multiple languages?
- Can LLM generate in player's language?
- How to handle language settings?

### 8.2 Expansion Roadmap

**After Banter MVP, Extend to:**

**NPC Dialogue System:**
- Apply same personality framework to NPCs
- LLM-generated clues with personality
- Quest giver dialogue variations

**Event Module Descriptions:**
- LLM-generated event descriptions
- Personality-flavored choice text
- Character reactions to event outcomes

**Combat Banter:**
- Pre-combat taunts and war cries
- Victory celebrations
- Defeat lamentations

**Town Service Interactions:**
- Tavern keeper personality
- Temple priest dialogue
- Shop merchant banter

**Environmental Descriptions:**
- LLM-generated room descriptions
- Theme-appropriate atmosphere
- Character observations on surroundings

### 8.3 Technical Debt and Risks

**Known Risks:**

1. **API Dependency:** Game requires internet for banter
   - Mitigation: Graceful degradation, banter is optional

2. **API Costs:** Frequent generation could be expensive
   - Mitigation: Caching, rate limiting, monitoring

3. **Quality Variability:** LLM might generate poor text
   - Mitigation: Prompt tuning, validation, discard bad responses

4. **Latency:** 3-5 second delay might feel slow
   - Mitigation: Pre-generation (future), async display

5. **Content Moderation:** LLM might generate inappropriate content
   - Mitigation: Content filtering, prompt constraints, validation

**Technical Debt:**

- No persistent storage of generated content (OK for MVP)
- No pre-generation optimization (future enhancement)
- No character relationship tracking (future feature)
- No banter history/memory (future feature)

---

## APPENDIX A: EXAMPLE PROMPTS

### A.1 Solo Musing Prompt

```
System: You are a narrative generator for a dungeon crawler RPG.
Generate brief character comments that fit their personality.

Character: Throk, male Dwarf Fighter, level 3, Lawful Good
Personality:
- Brave: Fearless, confident in danger
- Gruff: Rough around edges, uncomfortable with emotion
- Pessimistic: Expects the worst, cynical
- Blunt: Direct, plain-spoken, no frills

Context:
- Location: Ancient crypt, floor 2, dark corridor
- Trigger: Party just finished combat, hard victory, low HP (45%)
- Recent: Defeated 3 goblins, party wounded, found minor treasure

Generate a brief comment from Throk reacting to this hard-fought victory.
He's brave but expects more danger. He's gruff and speaks bluntly.
1-2 sentences maximum.

Format: "Throk: [comment]"
```

**Expected Output:**
```
Throk: We lived. Barely. More of them ahead, I'm sure.
```

### A.2 Two-Person Exchange Prompt

```
System: You are a narrative generator for a dungeon crawler RPG.
Generate brief dialogue exchanges between two characters.

Characters:
1. Lyra, female Elf Mage, level 2, Neutral Good
   Personality: Cautious, Friendly, Optimistic, Verbose

2. Throk, male Dwarf Fighter, level 3, Lawful Good
   Personality: Brave, Gruff, Pessimistic, Blunt

Context:
- Location: Ancient crypt, floor 2, large chamber
- Trigger: Party entering dark zone
- Situation: About to step into absolute darkness

Generate a brief exchange where Lyra and Throk react to entering darkness.
Lyra is cautious and talks a lot. Throk is brave but expects danger.
2-4 lines total (1-2 per character).

Format:
"Lyra: [line]"
"Throk: [line]"
```

**Expected Output:**
```
Lyra: Perhaps we should reconsider. I've read about places where light itself dies, and none who enter return to tell the tale.
Throk: Good thing I'm not much for telling tales. Let's go.
```

### A.3 Group Conversation Prompt

```
System: You are a narrative generator for a dungeon crawler RPG.
Generate brief group dialogue between multiple characters.

Characters:
1. Throk, male Dwarf Fighter, level 3, Lawful Good
   Personality: Brave, Gruff, Pessimistic, Blunt

2. Whisper, female Elf Mage, level 2, Neutral Good
   Personality: Cautious, Earnest, Idealistic, Poetic

3. Bramble, male Hobbit Thief, level 2, Chaotic Neutral
   Personality: Reckless, Sarcastic, Pragmatic, Verbose

Context:
- Location: Ancient crypt, floor 2, treasure room
- Trigger: Found cursed treasure (valuable but dangerous)
- Situation: Party debating whether to take cursed chalice

Generate a brief group conversation about the cursed treasure.
Throk is blunt and expects danger. Whisper speaks poetically and earnestly.
Bramble is sarcastic and talks a lot. Show their personality clash.
4-6 lines total.

Format:
"Character: [line]"
```

**Expected Output:**
```
Whisper: The shadows cling to it like a shroud. This vessel hungers.
Bramble: Well yes, it's a chalice. Chalices tend to be hungry for, you know, liquid. Maybe we fill it with something nice?
Throk: We leave it.
Bramble: Oh come now, where's your sense of adventure? It's probably cursed, sure, but it's also probably valuable, and I'm all about that particular combination.
Whisper: Some prices are paid in more than gold, friend.
Throk: We. Leave. It.
```

---

## APPENDIX B: PERSONALITY TRAIT REFERENCE

### B.1 Complete Trait Descriptions

**Temperament Traits:**

- **Brave**
  - Fearless in face of danger
  - Confident and bold
  - Rushes into threats
  - Inspires others through example
  - Speech: Direct, commanding, assertive

- **Cautious**
  - Careful and risk-averse
  - Thinks before acting
  - Notices dangers others miss
  - Prefers planning to improvisation
  - Speech: Questioning, warning, hesitant

- **Reckless**
  - Impulsive and thrill-seeking
  - Disregards personal safety
  - Acts first, thinks later
  - Seeks excitement and challenge
  - Speech: Enthusiastic, hasty, bold

- **Calculating**
  - Analytical and strategic
  - Weighs odds carefully
  - Plans several moves ahead
  - Slow to commit but decisive
  - Speech: Measured, logical, precise

**Social Traits:**

- **Friendly**
  - Warm and approachable
  - Seeks connection with others
  - Offers comfort and support
  - Enjoys camaraderie
  - Speech: Encouraging, kind, inclusive

- **Gruff**
  - Rough and brusque
  - Uncomfortable with emotion
  - Hides kindness behind roughness
  - Loyal but shows it through actions
  - Speech: Terse, growling, matter-of-fact

- **Sarcastic**
  - Uses humor as defense
  - Mocking and witty
  - Deflects emotion with jokes
  - Sharp-tongued observations
  - Speech: Ironic, joking, cutting

- **Earnest**
  - Sincere and honest
  - Takes things seriously
  - Wears heart on sleeve
  - Genuine in all interactions
  - Speech: Heartfelt, direct, open

**Outlook Traits:**

- **Optimistic**
  - Hopeful and positive
  - Sees good in situations
  - Expects success
  - Lifts others' spirits
  - Speech: Bright, encouraging, upbeat

- **Pessimistic**
  - Expects the worst
  - Cynical worldview
  - Prepared for failure
  - Dark or gallows humor
  - Speech: Grim, resigned, sardonic

- **Pragmatic**
  - Realistic and practical
  - Focused on what works
  - Neither overly positive nor negative
  - Results-oriented
  - Speech: Straightforward, practical, unsentimental

- **Idealistic**
  - Believes in higher purpose
  - Driven by principles
  - Hopes for better world
  - Moral and philosophical
  - Speech: Lofty, principled, inspiring

**Speech Style Traits:**

- **Verbose**
  - Long-winded and eloquent
  - Enjoys talking
  - Uses many words when few would do
  - Tells stories and elaborates
  - Speech: Lengthy, detailed, flowery

- **Taciturn**
  - Few words, terse
  - Only speaks when necessary
  - Values silence
  - Economical with language
  - Speech: Brief, clipped, minimal

- **Poetic**
  - Metaphorical and artistic
  - Uses imagery and symbolism
  - Speaks in riddles or verses
  - Aesthetic language
  - Speech: Lyrical, figurative, beautiful

- **Blunt**
  - Direct and plain-spoken
  - No frills or decoration
  - Says exactly what they mean
  - Values clarity over artistry
  - Speech: Simple, direct, unadorned

---

**Version:** 2.0 (Revised - All Ambiguities Resolved)
**Date:** 2025-11-13
**Author:** Collaborative design session (Christopher + Claude Code)
**Status:** Complete specification, ready for implementation

**Major Revisions from v1.0:**
- Service architecture redesigned (SOLID principles, 7 separate services)
- No caching in MVP (deferred to post-MVP)
- Tiered context collection (Minimal/Standard/Rich)
- Enums instead of string unions (better type safety)
- ChatML prompt format for Wayfarer-12B
- 256-color HSL palette for character dialogue colors
- Trigger priorities stored as editable constants
- Comprehensive error logging (all logged to debug.log)
- Error messages displayed to user ("Banter system failure.")
- Metrics system with periodic logging (every 5 minutes)
- Event tracking system (BanterEventTracker service)
- Validation system (prevents hallucinations)
- Detailed implementation plan (6 phases, ~3 weeks)
