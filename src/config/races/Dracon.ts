import { RaceConfig } from './types';

export const Dracon: RaceConfig = {
  id: 'dracon',
  name: 'Dracon',
  stats: {
    strength: { min: 10, max: 20 },
    intelligence: { min: 7, max: 17 },
    piety: { min: 6, max: 16 },
    vitality: { min: 12, max: 22 },
    agility: { min: 8, max: 18 },
    luck: { min: 8, max: 18 }
  },
  description: 'Dragon-descended race with good strength and vitality but limited spiritual connection'
};