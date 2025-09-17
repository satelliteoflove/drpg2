import { ClassConfig } from './types';

export const SamuraiConfig: ClassConfig = {
  id: 'samurai',
  name: 'Samurai',
  requirements: {
    strength: 13,
    intelligence: 11,
    piety: 10,
    vitality: 14,
    agility: 10
  },
  hpBase: 8,
  mpBase: 2,
  spellSchools: ['mage'],
  tier: 'elite',
  description: 'An honorable warrior with discipline in both blade and magic.'
};