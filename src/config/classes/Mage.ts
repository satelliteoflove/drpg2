import { ClassConfig } from './types';

export const MageConfig: ClassConfig = {
  id: 'mage',
  name: 'Mage',
  requirements: {
    intelligence: 11
  },
  hpBase: 4,
  mpBase: 4,
  spellSchools: ['mage'],
  tier: 'basic',
  description: 'A spellcaster focused on arcane magic with low hit points but high magical power.'
};