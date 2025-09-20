import { CharacterClass } from './GameTypes';

export type SpellSchool = 'mage' | 'priest' | 'alchemist' | 'psionic';

export type SpellTargetType =
  | 'self'
  | 'ally'
  | 'enemy'
  | 'group'
  | 'allAllies'
  | 'allEnemies'
  | 'row'
  | 'any'
  | 'location'
  | 'dead';

export type SpellEffectType =
  | 'damage'
  | 'heal'
  | 'buff'
  | 'debuff'
  | 'cure'
  | 'status'
  | 'instant_death'
  | 'resurrection'
  | 'teleport'
  | 'utility'
  | 'summon'
  | 'dispel'
  | 'special';

export type ElementalType =
  | 'fire'
  | 'ice'
  | 'lightning'
  | 'holy'
  | 'dark'
  | 'physical'
  | 'psychic'
  | 'acid'
  | 'neutral';

export type StatusEffectType =
  | 'sleep'
  | 'paralyzed'
  | 'poisoned'
  | 'silenced'
  | 'blinded'
  | 'confused'
  | 'stoned'
  | 'dead'
  | 'ashed'
  | 'lost'
  | 'afraid'
  | 'charmed'
  | 'berserk'
  | 'protected'
  | 'blessed'
  | 'cursed';

export type BuffType =
  | 'ac_bonus'
  | 'attack_bonus'
  | 'defense_bonus'
  | 'speed_bonus'
  | 'resistance'
  | 'regeneration'
  | 'shield'
  | 'invisibility'
  | 'light'
  | 'levitation'
  | 'protection';

export interface SpellEffect {
  type: SpellEffectType;
  subtype?: string;
  element?: ElementalType;
  power?: number | string;
  duration?: number | string;
  saveType?: 'physical' | 'mental' | 'magical' | 'death';
  saveModifier?: number;
  statusEffect?: StatusEffectType | 'all';
  buffType?: BuffType;
  special?: string;
}

export interface SpellRange {
  min?: number;
  max?: number;
  special?: 'melee' | 'unlimited' | 'self' | 'touch';
}

export interface SpellData {
  id: string;
  name: string;
  originalName?: string;
  school: SpellSchool;
  level: number;
  mpCost: number;
  targetType: SpellTargetType;
  range?: SpellRange;
  inCombat: boolean;
  outOfCombat: boolean;
  description: string;
  effects: SpellEffect[];
  prerequisites?: string[];
  restrictions?: {
    classes?: CharacterClass[];
    minLevel?: number;
    alignment?: ('Good' | 'Neutral' | 'Evil')[];
  };
  fizzleModifier?: number;
  criticalChance?: number;
  tags?: string[];
}

export interface SpellLearningResult {
  spellId: string;
  spellName: string;
  learned: boolean;
  reason?: string;
}

export interface SpellCastingContext {
  casterId: string;
  targetId?: string | string[];
  targetPosition?: { x: number; y: number; z?: number };
  inCombat: boolean;
  combatRound?: number;
  antiMagicZone?: boolean;
  fizzleField?: boolean;
}

export interface SpellCastResult {
  success: boolean;
  fizzled?: boolean;
  resisted?: boolean;
  critical?: boolean;
  damage?: number;
  healing?: number;
  statusesApplied?: StatusEffectType[];
  statusesRemoved?: StatusEffectType[];
  deaths?: string[];
  resurrections?: string[];
  messages: string[];
  mpConsumed: number;
}

export interface ActiveStatusEffect {
  type: StatusEffectType;
  source: string;
  remainingDuration?: number;
  power?: number;
  saveChance?: number;
  stacks?: number;
}

export interface ActiveBuff {
  type: BuffType;
  source: string;
  value: number;
  remainingDuration?: number;
  stacks?: number;
}

export interface SpellValidationResult {
  canCast: boolean;
  reason?: string;
  mpRequired?: number;
  mpAvailable?: number;
  targetValid?: boolean;
  rangeValid?: boolean;
}

export interface SpellListEntry {
  spell: SpellData;
  learned: boolean;
  castable: boolean;
  mpCost: number;
  failureChance: number;
}

export interface SpellProgressionEntry {
  level: number;
  spellsAvailable: string[];
  spellsLearned: string[];
  spellsRemaining: string[];
}