import { RaceConfig } from './types';

export const Gnome: RaceConfig = {
  id: 'gnome',
  name: 'Gnome',
  stats: {
    strength: { min: 10, max: 20 },
    intelligence: { min: 7, max: 17 },
    piety: { min: 13, max: 23 },
    vitality: { min: 10, max: 20 },
    agility: { min: 6, max: 16 },
    luck: { min: 7, max: 17 }
  },
  description: 'Small race with exceptional piety and decent strength but limited agility'
};