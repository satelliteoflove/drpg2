import { RaceConfig } from './types';

export const Felpurr: RaceConfig = {
  id: 'felpurr',
  name: 'Felpurr',
  stats: {
    strength: { min: 7, max: 17 },
    intelligence: { min: 10, max: 20 },
    piety: { min: 7, max: 17 },
    vitality: { min: 7, max: 17 },
    agility: { min: 12, max: 22 },
    luck: { min: 10, max: 20 }
  },
  description: 'Cat-like race with high agility and intelligence but lower physical resilience'
};