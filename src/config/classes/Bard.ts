import { ClassConfig } from './types';

export const BardConfig: ClassConfig = {
  id: 'bard',
  name: 'Bard',
  requirements: {
    intelligence: 11,
    luck: 11
  },
  hpBase: 6,
  mpBase: 3,
  spellSchools: ['mage'],
  tier: 'advanced',
  description: 'A versatile performer who uses music and magic with moderate hit points.'
};