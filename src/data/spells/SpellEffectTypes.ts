import { SpellEffectType, StatusEffectType, BuffType, ElementalType } from '../../types/SpellTypes';

export interface DamageEffectConfig {
  type: 'damage';
  element: ElementalType;
  baseDamage: string;
  damagePerLevel?: number;
  ignoreDefense?: boolean;
  canCritical?: boolean;
  splashDamage?: boolean;
}

export interface HealingEffectConfig {
  type: 'heal';
  baseHealing: string;
  healingPerLevel?: number;
  cureStatuses?: StatusEffectType[];
  fullHeal?: boolean;
  percentHeal?: number;
  canOverheal?: boolean;
}

export interface StatusEffectConfig {
  type: 'status';
  statusType: StatusEffectType;
  duration?: string;
  saveType: 'physical' | 'mental' | 'magical' | 'death';
  saveModifier?: number;
  power?: number;
  stackable?: boolean;
  resistanceCheck?: boolean;
}

export interface BuffEffectConfig {
  type: 'buff';
  buffType: BuffType;
  value: number | string;
  duration?: string;
  stackable?: boolean;
  partyWide?: boolean;
  percentBonus?: boolean;
}

export interface ModifierEffectConfig {
  type: 'modifier';
  stat: 'ac' | 'attack' | 'damage' | 'speed';
  value: number;
  duration?: string;
  countsOnlyInCombat?: boolean;
  affectsEnemies?: boolean;
  affectsAllies?: boolean;
  partyWide?: boolean;
}

export interface InstantDeathEffectConfig {
  type: 'instant_death';
  saveType: 'death';
  saveModifier?: number;
  undeadOnly?: boolean;
  levelRestriction?: number;
  bossImmune?: boolean;
}

export interface ResurrectionEffectConfig {
  type: 'resurrection';
  successChance: string;
  restorePercent?: number;
  cureAllStatuses?: boolean;
  ashesOnly?: boolean;
}

export interface TeleportEffectConfig {
  type: 'teleport';
  mode: 'relative' | 'absolute' | 'random' | 'town';
  safe?: boolean;
  combatEscape?: boolean;
  requiresCoordinates?: boolean;
}

export interface UtilityEffectConfig {
  type: 'utility';
  utilityType: 'identify' | 'light' | 'locate' | 'detect' | 'unlock' | 'disarm' | 'mapping';
  duration?: string;
  power?: number;
  permanent?: boolean;
}

export interface DispelEffectConfig {
  type: 'dispel';
  dispelType: 'magic' | 'undead' | 'summoned' | 'illusion' | 'curse';
  power?: number;
  affectsAllies?: boolean;
  affectsEnemies?: boolean;
  selective?: boolean;
}

export interface CureEffectConfig {
  type: 'cure';
  cureStatuses?: StatusEffectType[];
  cureGroup?: 'poison' | 'paralysis' | 'petrification' | 'mental' | 'blindness' | 'silence' | 'curse' | 'death' | 'ashes' | 'all';
  cureAll?: boolean;
  removeBuffs?: boolean;
  removeDebuffs?: boolean;
}

export interface SpecialEffectConfig {
  type: 'special';
  specialType: string;
  customLogic?: string;
  parameters?: Record<string, any>;
}

export type SpellEffectConfig =
  | DamageEffectConfig
  | HealingEffectConfig
  | StatusEffectConfig
  | BuffEffectConfig
  | ModifierEffectConfig
  | CureEffectConfig
  | InstantDeathEffectConfig
  | ResurrectionEffectConfig
  | TeleportEffectConfig
  | UtilityEffectConfig
  | DispelEffectConfig
  | SpecialEffectConfig;

export const DAMAGE_FORMULAS = {
  SMALL: '1d8',
  MEDIUM: '2d8',
  LARGE: '4d8',
  HUGE: '6d10',
  MASSIVE: '8d12',
  NUCLEAR: '10d10'
} as const;

export const HEALING_FORMULAS = {
  MINOR: '1d8',
  MODERATE: '2d8',
  MAJOR: '4d8',
  GREATER: '6d8',
  FULL: '999'
} as const;

export const DURATION_FORMULAS = {
  SHORT: '1d4',
  MEDIUM: '2d4',
  LONG: '3d6',
  EXTENDED: '4d6',
  PERMANENT: '-1',
  COMBAT: 'combat',
  STEPS: '30+1d11'
} as const;

export const SAVE_DIFFICULTIES = {
  EASY: 5,
  MODERATE: 0,
  HARD: -5,
  EXTREME: -10,
  IMPOSSIBLE: -20
} as const;

export const SUCCESS_CHANCES = {
  LOW: '25+level*2',
  MODERATE: '50+level',
  HIGH: '70+level/2',
  GUARANTEED: '100'
} as const;

export interface ElementalResistance {
  element: ElementalType;
  resistance: number;
}

export interface StatusImmunity {
  status: StatusEffectType;
  immune: boolean;
}

export interface SpellResistance {
  school?: SpellSchool;
  type?: SpellEffectType;
  resistance: number;
}

export const ELEMENTAL_OPPOSITES: Record<ElementalType, ElementalType | null> = {
  fire: 'ice',
  ice: 'fire',
  lightning: null,
  holy: 'dark',
  dark: 'holy',
  physical: null,
  psychic: null,
  acid: null,
  neutral: null
};

export const STATUS_CURE_GROUPS: Record<string, StatusEffectType[]> = {
  poison: ['poisoned'],
  paralysis: ['paralyzed'],
  petrification: ['stoned'],
  mental: ['sleep', 'confused', 'afraid', 'charmed', 'berserk'],
  blindness: ['blinded'],
  silence: ['silenced'],
  curse: ['cursed'],
  death: ['dead'],
  ashes: ['ashed'],
  all: ['poisoned', 'paralyzed', 'stoned', 'sleep', 'confused', 'afraid',
        'charmed', 'berserk', 'blinded', 'silenced', 'cursed']
};

export const BUFF_STACK_LIMITS: Record<BuffType, number> = {
  ac_bonus: 5,
  attack_bonus: 5,
  defense_bonus: 5,
  speed_bonus: 3,
  resistance: 3,
  regeneration: 1,
  shield: 3,
  invisibility: 1,
  light: 1,
  levitation: 1,
  protection: 3
};

export interface SpellSchool {
  name: 'mage' | 'priest' | 'alchemist' | 'psionic';
  description: string;
  primaryStat: 'intelligence' | 'piety';
  focusAreas: string[];
}

export const SPELL_SCHOOLS: Record<string, SpellSchool> = {
  mage: {
    name: 'mage',
    description: 'Arcane magic focused on elemental damage and battlefield control',
    primaryStat: 'intelligence',
    focusAreas: ['damage', 'debuff', 'utility', 'teleport']
  },
  priest: {
    name: 'priest',
    description: 'Divine magic centered on healing and protection',
    primaryStat: 'piety',
    focusAreas: ['heal', 'buff', 'cure', 'resurrection']
  },
  alchemist: {
    name: 'alchemist',
    description: 'Transmutation magic combining offense and defense',
    primaryStat: 'intelligence',
    focusAreas: ['damage', 'status', 'utility', 'dispel']
  },
  psionic: {
    name: 'psionic',
    description: 'Mental abilities affecting mind and matter',
    primaryStat: 'intelligence',
    focusAreas: ['status', 'damage', 'utility', 'instant_death']
  }
};