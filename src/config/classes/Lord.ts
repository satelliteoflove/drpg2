import { ClassConfig } from './types';

export const LordConfig: ClassConfig = {
  id: 'lord',
  name: 'Lord',
  requirements: {
    strength: 13,
    intelligence: 11,
    piety: 11,
    vitality: 13,
    agility: 9,
    luck: 9
  },
  hpBase: 8,
  mpBase: 2,
  spellSchools: ['priest'],
  tier: 'elite',
  description: 'A noble leader combining martial prowess with divine authority.'
};