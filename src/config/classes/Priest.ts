import { ClassConfig } from './types';

export const PriestConfig: ClassConfig = {
  id: 'priest',
  name: 'Priest',
  requirements: {
    piety: 11
  },
  hpBase: 6,
  mpBase: 3,
  spellSchools: ['priest'],
  tier: 'basic',
  description: 'A divine spellcaster with healing and protective magic, moderate hit points.'
};