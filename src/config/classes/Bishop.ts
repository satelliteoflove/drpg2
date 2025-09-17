import { ClassConfig } from './types';

export const BishopConfig: ClassConfig = {
  id: 'bishop',
  name: 'Bishop',
  requirements: {
    intelligence: 12,
    piety: 12
  },
  hpBase: 4,
  mpBase: 4,
  spellSchools: ['mage', 'priest'],
  tier: 'advanced',
  description: 'A dual-school spellcaster mastering both arcane and divine magic with low hit points.'
};