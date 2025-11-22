import { CharacterClass, CharacterRace, CharacterAlignment, CharacterStatus } from './GameTypes';

export enum Temperament {
  Brave = 'brave',
  Cautious = 'cautious',
  Reckless = 'reckless',
  Calculating = 'calculating',
}

export enum Social {
  Friendly = 'friendly',
  Gruff = 'gruff',
  Sarcastic = 'sarcastic',
  Earnest = 'earnest',
}

export enum Outlook {
  Optimistic = 'optimistic',
  Pessimistic = 'pessimistic',
  Pragmatic = 'pragmatic',
  Idealistic = 'idealistic',
}

export enum SpeechStyle {
  Verbose = 'verbose',
  Taciturn = 'taciturn',
  Poetic = 'poetic',
  Blunt = 'blunt',
}

export enum BanterTriggerType {
  CharacterDeath = 'character_death',
  LowHpWarning = 'low_hp_warning',
  DarkZoneEntry = 'dark_zone_entry',
  AmbientTime = 'ambient_time',
  AmbientDistance = 'ambient_distance',
}

export enum GameEventType {
  CharacterDeath = 'character_death',
  DarkZoneEntry = 'dark_zone_entry',
  CombatVictory = 'combat_victory',
  TreasureFound = 'treasure_found',
}

export interface PersonalityTraits {
  temperament: Temperament;
  social: Social;
  outlook: Outlook;
  speech: SpeechStyle;
}

export interface BanterTrigger {
  type: BanterTriggerType;
  priority: number;
  details: string;
  timestamp: number;
}

export interface CharacterInfo {
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

export interface LocationInfo {
  floor: number;
  isDark: boolean;
  timeInDungeonMinutes: number;
}

export interface PartyInfo {
  members: CharacterInfo[];
  avgHpPercent: number;
  avgMpPercent: number;
  hasActiveStatusEffects: boolean;
}

export interface GameEvent {
  type: GameEventType;
  timestamp: number;
  characterName?: string;
  details: string;
  acknowledged?: boolean;
}

export interface MinimalContext {
  trigger: BanterTrigger;
  speaker: CharacterInfo;
  location: LocationInfo;
}

export interface StandardContext extends MinimalContext {
  party: PartyInfo;
}

export interface RichContext extends StandardContext {
  recentEvents: GameEvent[];
}

export interface BanterLine {
  characterName: string;
  text: string;
}

export interface BanterResponse {
  exchangeType: 'solo' | 'two_person' | 'group';
  participants: string[];
  lines: BanterLine[];
  generatedAt: number;
}

export interface BuiltPrompt {
  systemPrompt: string;
  userPrompt: string;
  metadata: {
    triggerType: BanterTriggerType;
    exchangeType: 'solo' | 'two_person' | 'group';
    speaker: string;
    estimatedTokens: number;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface TriggerDetector {
  checkTriggers(gameState: any): BanterTrigger | null;
  markTriggerFired(gameState: any, triggerType?: string): void;
}

export interface BanterGenerator {
  generate(context: MinimalContext | StandardContext | RichContext): Promise<BanterResponse>;
}

export interface BanterPresenter {
  display(response: BanterResponse, messageLog: any, party: any): void;
  displayErrorMessage(messageLog: any): void;
}

export interface BanterEventTracker {
  recordEvent(event: GameEvent): void;
  getRecentEvents(maxAge?: number): GameEvent[];
  getUnacknowledgedEvents(eventType?: string): GameEvent[];
  markEventAcknowledged(event: GameEvent): void;
  clearEvents(): void;
  recordCharacterDeath(characterName: string): void;
  recordDarkZoneEntry(): void;
  recordCombatVictory(details: string): void;
  recordTreasureFound(details: string): void;
}

export interface BanterValidator {
  validate(
    response: BanterResponse,
    context: MinimalContext | StandardContext | RichContext
  ): ValidationResult;
}

export interface BanterMetrics {
  recordGeneration(timeMs: number, success: boolean): void;
  recordValidationFailure(): void;
  recordApiFailure(): void;
  recordSuccess(triggerType: BanterTriggerType): void;
  getMetrics(): MetricsData;
  getStats(): any;
}

export interface MetricsData {
  totalGenerations: number;
  successfulGenerations: number;
  failedGenerations: number;
  validationFailures: number;
  apiFailures: number;
  averageGenerationTimeMs: number;
  p95GenerationTimeMs: number;
  consecutiveFailures: number;
  banterByTriggerType: Record<BanterTriggerType, number>;
}

export interface CharacterPersonalityService {
  assignRandomPersonality(character: any): void;
  assignRandomDialogueColor(character: any): void;
  initializeCharacterPersonality(character: any): void;
}
