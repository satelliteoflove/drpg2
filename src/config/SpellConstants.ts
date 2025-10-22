export const SPELL_MP_COSTS = {
  LEVEL_1: 3,
  LEVEL_2: 5,
  LEVEL_3: 8,
  LEVEL_4: 12,
  LEVEL_5: 15,
  LEVEL_6: 20,
  LEVEL_7: 30
} as const;

export const SPELL_DURATIONS = {
  SLEEP: '3+1d3',
  FEAR: '3+1d3',
  CONFUSION: '3+1d3',
  PARALYSIS: 'combat',
  PETRIFY: -1,
  POISON: -1,
  COMBAT: 'combat',
  PERMANENT: -1
} as const;

export function getMPCostForLevel(level: number): number {
  switch (level) {
    case 1: return SPELL_MP_COSTS.LEVEL_1;
    case 2: return SPELL_MP_COSTS.LEVEL_2;
    case 3: return SPELL_MP_COSTS.LEVEL_3;
    case 4: return SPELL_MP_COSTS.LEVEL_4;
    case 5: return SPELL_MP_COSTS.LEVEL_5;
    case 6: return SPELL_MP_COSTS.LEVEL_6;
    case 7: return SPELL_MP_COSTS.LEVEL_7;
    default: return 1;
  }
}
