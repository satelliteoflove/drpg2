import { RaceConfig } from './types';

export const Faerie: RaceConfig = {
  id: 'faerie',
  name: 'Faerie',
  stats: {
    strength: { min: 5, max: 15 },
    intelligence: { min: 11, max: 21 },
    piety: { min: 6, max: 16 },
    vitality: { min: 6, max: 16 },
    agility: { min: 14, max: 24 },
    luck: { min: 11, max: 21 }
  },
  description: 'Magical beings with exceptional agility and intelligence but very fragile and weak'
};