import { RaceConfig } from './types';

export const Rawulf: RaceConfig = {
  id: 'rawulf',
  name: 'Rawulf',
  stats: {
    strength: { min: 8, max: 18 },
    intelligence: { min: 6, max: 16 },
    piety: { min: 12, max: 22 },
    vitality: { min: 10, max: 20 },
    agility: { min: 8, max: 18 },
    luck: { min: 9, max: 19 }
  },
  description: 'Wolf-like race with exceptional piety and good luck but limited intelligence'
};