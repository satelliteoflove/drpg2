import { RaceConfig } from './types';

export const Dwarf: RaceConfig = {
  id: 'dwarf',
  name: 'Dwarf',
  stats: {
    strength: { min: 11, max: 21 },
    intelligence: { min: 6, max: 16 },
    piety: { min: 10, max: 20 },
    vitality: { min: 12, max: 22 },
    agility: { min: 7, max: 17 },
    luck: { min: 7, max: 17 }
  },
  description: 'Hardy and strong race with high vitality and piety but limited intelligence and agility'
};