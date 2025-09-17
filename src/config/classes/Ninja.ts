import { ClassConfig } from './types';

export const NinjaConfig: ClassConfig = {
  id: 'ninja',
  name: 'Ninja',
  requirements: {
    strength: 14,
    intelligence: 14,
    piety: 14,
    vitality: 14,
    agility: 14,
    luck: 14
  },
  hpBase: 6,
  mpBase: 2,
  spellSchools: ['alchemist'],
  tier: 'elite',
  description: 'A shadow warrior requiring exceptional ability in all stats, skilled in stealth and alchemy.'
};