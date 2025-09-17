import { RaceConfig } from './types';

export const Human: RaceConfig = {
  id: 'human',
  name: 'Human',
  stats: {
    strength: { min: 9, max: 19 },
    intelligence: { min: 8, max: 18 },
    piety: { min: 8, max: 18 },
    vitality: { min: 9, max: 19 },
    agility: { min: 8, max: 18 },
    luck: { min: 8, max: 18 }
  },
  description: 'Balanced race with no particular strengths or weaknesses'
};