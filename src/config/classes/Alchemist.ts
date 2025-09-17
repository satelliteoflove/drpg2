import { ClassConfig } from './types';

export const AlchemistConfig: ClassConfig = {
  id: 'alchemist',
  name: 'Alchemist',
  requirements: {
    intelligence: 10
  },
  hpBase: 6,
  mpBase: 3,
  spellSchools: ['alchemist'],
  tier: 'basic',
  description: 'A scholar of alchemy who creates potions and magical items with moderate hit points.'
};