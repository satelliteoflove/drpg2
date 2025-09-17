import { RaceConfig } from './types';

export const Hobbit: RaceConfig = {
  id: 'hobbit',
  name: 'Hobbit',
  stats: {
    strength: { min: 8, max: 18 },
    intelligence: { min: 7, max: 17 },
    piety: { min: 6, max: 16 },
    vitality: { min: 9, max: 19 },
    agility: { min: 10, max: 20 },
    luck: { min: 11, max: 21 }
  },
  description: 'Lucky and agile small folk with good fortune but limited spiritual connection'
};