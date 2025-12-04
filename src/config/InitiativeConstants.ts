import { SpellEffectCategory, SpellTargetScope, WeaponSpeedCategory } from '../types/InitiativeTypes';

export const INITIATIVE = {
  QUEUE_DISPLAY_COUNT: 12,

  AGI_FORMULA: {
    BASE: 10,
    CONSTANT: 10,
  },

  EQUIPMENT_MULTIPLIERS: {
    unarmed: 0.8,
    light: 0.9,
    standard: 1.0,
    heavy: 1.2,
  } as Record<WeaponSpeedCategory, number>,

  BASE_CHARGE_TIMES: {
    ATTACK: 30,
    DEFEND: 10,
    ESCAPE: 10,
    USE_ITEM: 20,
    SKIP_TURN: 10,
  },

  SPELL_CHARGE_TIMES: {
    buff: 20,
    status_cure: 20,
    damage: 30,
    debuff: 30,
    status_inflict: 30,
    healing: 30,
    utility: 20,
    instant_death: 40,
    resurrection: 50,
  } as Record<SpellEffectCategory, number>,

  SPELL_SCOPE_MODIFIERS: {
    self: 0,
    single_ally: 0,
    single_enemy: 0,
    row: 10,
    group: 10,
    all_allies: 20,
    all_enemies: 20,
  } as Record<SpellTargetScope, number>,

  COMBAT_START: {
    INIT_RANGE_MIN: 10,
    INIT_RANGE_MAX: 40,
    SURPRISE_PENALTY: 30,
  },

  DEFAULT_MONSTER_AGILITY: 10,
} as const;

export function calculateAgiMultiplier(agility: number): number {
  const { BASE, CONSTANT } = INITIATIVE.AGI_FORMULA;
  return (BASE + CONSTANT) / (BASE + agility);
}

export function calculateAttackChargeTime(
  agility: number,
  weaponSpeed: WeaponSpeedCategory = 'standard'
): number {
  const agiMultiplier = calculateAgiMultiplier(agility);
  const equipMultiplier = INITIATIVE.EQUIPMENT_MULTIPLIERS[weaponSpeed] ?? 1.0;
  const chargeTime = INITIATIVE.BASE_CHARGE_TIMES.ATTACK * agiMultiplier * equipMultiplier;
  return Math.max(1, Math.floor(chargeTime));
}

export function calculateSpellChargeTime(
  effectCategory: SpellEffectCategory,
  targetScope: SpellTargetScope
): number {
  const baseCharge = INITIATIVE.SPELL_CHARGE_TIMES[effectCategory] ?? INITIATIVE.SPELL_CHARGE_TIMES.utility;
  const scopeModifier = INITIATIVE.SPELL_SCOPE_MODIFIERS[targetScope] ?? 0;
  return Math.max(1, baseCharge + scopeModifier);
}

export function calculateInitialDelay(agility: number, surprised: boolean = false): number {
  const { INIT_RANGE_MIN, INIT_RANGE_MAX, SURPRISE_PENALTY } = INITIATIVE.COMBAT_START;
  const range = INIT_RANGE_MAX - INIT_RANGE_MIN + 1;
  const randomBase = INIT_RANGE_MIN + Math.floor(Math.random() * range);
  const agiMultiplier = calculateAgiMultiplier(agility);
  let delay = Math.max(1, Math.floor(randomBase * agiMultiplier));
  if (surprised) {
    delay += SURPRISE_PENALTY;
  }
  return delay;
}
