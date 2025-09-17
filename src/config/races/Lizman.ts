import { RaceConfig } from './types';

export const Lizman: RaceConfig = {
  id: 'lizman',
  name: 'Lizman',
  stats: {
    strength: { min: 12, max: 22 },
    intelligence: { min: 5, max: 15 },
    piety: { min: 5, max: 15 },
    vitality: { min: 14, max: 24 },
    agility: { min: 9, max: 19 },
    luck: { min: 7, max: 17 }
  },
  description: 'Reptilian warriors with exceptional strength and vitality but very low mental faculties'
};