import { ClassConfig } from './types';

export const MonkConfig: ClassConfig = {
  id: 'monk',
  name: 'Monk',
  requirements: {
    strength: 12,
    piety: 12,
    vitality: 13,
    agility: 11
  },
  hpBase: 6,
  mpBase: 3,
  spellSchools: ['psionic'],
  tier: 'elite',
  description: 'A disciplined warrior-monk who combines martial arts with mental powers.'
};