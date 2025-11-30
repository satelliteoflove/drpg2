import { SpellEffectCategory, SpellTargetScope, WeaponSpeedCategory } from '../types/InitiativeTypes';

export const INITIATIVE = {
  READINESS_THRESHOLD: 20,
  QUEUE_DISPLAY_COUNT: 12,

  SPEED_CALCULATION: {
    AGILITY_DIVISOR: 2,
    LEVEL_DIVISOR: 5,
    BASE_SPEED: 8,
  },

  // SCENARIO 3: Ultra-low fast delays (test if ghost can differentiate)
  ACTION_DELAYS: {
    DEFEND: 2,
    ESCAPE: 1,
    USE_ITEM: 6,
    SKIP_TURN: 2,
  },

  ATTACK_DELAYS: {
    unarmed: 4,
    light: 8,
    standard: 14,
    heavy: 22,
  } as Record<WeaponSpeedCategory, number>,

  SPELL_EFFECT_DELAYS: {
    buff: 4,
    status_cure: 5,
    damage: 6,
    debuff: 6,
    status_inflict: 8,
    healing: 8,
    utility: 6,
    instant_death: 12,
    resurrection: 16,
  } as Record<SpellEffectCategory, number>,

  SPELL_SCOPE_MODIFIERS: {
    self: -2,
    single_ally: 0,
    single_enemy: 0,
    row: 3,
    group: 4,
    all_allies: 5,
    all_enemies: 6,
  } as Record<SpellTargetScope, number>,

  DEFAULT_MONSTER_AGILITY: 10,
  MONSTER_MIN_DELAY: 4,
} as const;

export function calculateBaseSpeed(agility: number, level: number): number {
  const agilityContribution = Math.floor(agility / INITIATIVE.SPEED_CALCULATION.AGILITY_DIVISOR);
  const levelContribution = Math.floor(level / INITIATIVE.SPEED_CALCULATION.LEVEL_DIVISOR);
  return INITIATIVE.SPEED_CALCULATION.BASE_SPEED + agilityContribution + levelContribution;
}

export function calculateSpellDelay(effectCategory: SpellEffectCategory, targetScope: SpellTargetScope): number {
  const baseDelay = INITIATIVE.SPELL_EFFECT_DELAYS[effectCategory] ?? INITIATIVE.SPELL_EFFECT_DELAYS.utility;
  const scopeModifier = INITIATIVE.SPELL_SCOPE_MODIFIERS[targetScope] ?? 0;
  return Math.max(6, baseDelay + scopeModifier);
}

export function calculateAttackDelay(speedCategory: WeaponSpeedCategory, agility: number = 10): number {
  const baseDelay = INITIATIVE.ATTACK_DELAYS[speedCategory] ?? INITIATIVE.ATTACK_DELAYS.standard;
  const agilityModifier = Math.floor((agility - 10) / 4);
  return Math.max(6, baseDelay - agilityModifier);
}
