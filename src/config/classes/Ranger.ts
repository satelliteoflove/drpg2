import { ClassConfig } from './types';

export const RangerConfig: ClassConfig = {
  id: 'ranger',
  name: 'Ranger',
  requirements: {
    strength: 11,
    agility: 11
  },
  hpBase: 7,
  mpBase: 2,
  spellSchools: ['alchemist'],
  tier: 'advanced',
  description: 'A wilderness warrior with nature magic and high hit points.'
};