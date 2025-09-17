import { ClassConfig } from './types';

export const ValkyrieConfig: ClassConfig = {
  id: 'valkyrie',
  name: 'Valkyrie',
  requirements: {
    strength: 12,
    vitality: 10,
    piety: 11
  },
  hpBase: 7,
  mpBase: 2,
  genderRestriction: 'female',
  spellSchools: ['priest'],
  tier: 'elite',
  description: 'A divine warrior maiden with high combat prowess and healing magic.'
};