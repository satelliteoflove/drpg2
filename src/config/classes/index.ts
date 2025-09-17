export { FighterConfig } from './Fighter';
export { MageConfig } from './Mage';
export { PriestConfig } from './Priest';
export { ThiefConfig } from './Thief';
export { AlchemistConfig } from './Alchemist';
export { BishopConfig } from './Bishop';
export { BardConfig } from './Bard';
export { RangerConfig } from './Ranger';
export { PsionicConfig } from './Psionic';
export { ValkyrieConfig } from './Valkyrie';
export { SamuraiConfig } from './Samurai';
export { LordConfig } from './Lord';
export { MonkConfig } from './Monk';
export { NinjaConfig } from './Ninja';

export * from './types';

import { ClassConfig } from './types';
import { FighterConfig } from './Fighter';
import { MageConfig } from './Mage';
import { PriestConfig } from './Priest';
import { ThiefConfig } from './Thief';
import { AlchemistConfig } from './Alchemist';
import { BishopConfig } from './Bishop';
import { BardConfig } from './Bard';
import { RangerConfig } from './Ranger';
import { PsionicConfig } from './Psionic';
import { ValkyrieConfig } from './Valkyrie';
import { SamuraiConfig } from './Samurai';
import { LordConfig } from './Lord';
import { MonkConfig } from './Monk';
import { NinjaConfig } from './Ninja';

export const ALL_CLASSES: ClassConfig[] = [
  FighterConfig,
  MageConfig,
  PriestConfig,
  ThiefConfig,
  AlchemistConfig,
  BishopConfig,
  BardConfig,
  RangerConfig,
  PsionicConfig,
  ValkyrieConfig,
  SamuraiConfig,
  LordConfig,
  MonkConfig,
  NinjaConfig
];

export const CLASSES_BY_TIER = {
  basic: [FighterConfig, MageConfig, PriestConfig, ThiefConfig, AlchemistConfig],
  advanced: [BishopConfig, BardConfig, RangerConfig, PsionicConfig],
  elite: [ValkyrieConfig, SamuraiConfig, LordConfig, MonkConfig, NinjaConfig]
};

export const CLASSES_BY_ID = ALL_CLASSES.reduce((acc, classConfig) => {
  acc[classConfig.id] = classConfig;
  return acc;
}, {} as Record<string, ClassConfig>);