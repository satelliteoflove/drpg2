import { RaceConfig } from './types';

export const Mook: RaceConfig = {
  id: 'mook',
  name: 'Mook',
  stats: {
    strength: { min: 10, max: 20 },
    intelligence: { min: 10, max: 20 },
    piety: { min: 6, max: 16 },
    vitality: { min: 10, max: 20 },
    agility: { min: 7, max: 17 },
    luck: { min: 8, max: 18 }
  },
  description: 'Balanced warrior race with good strength and intelligence but limited spiritual connection'
};