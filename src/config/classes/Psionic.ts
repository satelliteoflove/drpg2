import { ClassConfig } from './types';

export const PsionicConfig: ClassConfig = {
  id: 'psionic',
  name: 'Psionic',
  requirements: {
    intelligence: 11,
    piety: 11
  },
  hpBase: 4,
  mpBase: 4,
  spellSchools: ['psionic'],
  tier: 'advanced',
  description: 'A mind-bender who uses mental powers and psionic abilities with low hit points.'
};