import { RaceConfig } from './types';

export const Elf: RaceConfig = {
  id: 'elf',
  name: 'Elf',
  stats: {
    strength: { min: 7, max: 17 },
    intelligence: { min: 10, max: 20 },
    piety: { min: 10, max: 20 },
    vitality: { min: 7, max: 17 },
    agility: { min: 9, max: 19 },
    luck: { min: 8, max: 18 }
  },
  description: 'Intelligent and pious race with high magical aptitude but lower physical strength'
};