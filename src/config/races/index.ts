import { Human } from './Human';
import { Elf } from './Elf';
import { Dwarf } from './Dwarf';
import { Gnome } from './Gnome';
import { Hobbit } from './Hobbit';
import { Faerie } from './Faerie';
import { Lizman } from './Lizman';
import { Dracon } from './Dracon';
import { Rawulf } from './Rawulf';
import { Mook } from './Mook';
import { Felpurr } from './Felpurr';
import { RaceConfig } from './types';

export const RACES: Record<string, RaceConfig> = {
  human: Human,
  elf: Elf,
  dwarf: Dwarf,
  gnome: Gnome,
  hobbit: Hobbit,
  faerie: Faerie,
  lizman: Lizman,
  dracon: Dracon,
  rawulf: Rawulf,
  mook: Mook,
  felpurr: Felpurr
};

export const RACE_LIST: RaceConfig[] = Object.values(RACES);

export {
  Human,
  Elf,
  Dwarf,
  Gnome,
  Hobbit,
  Faerie,
  Lizman,
  Dracon,
  Rawulf,
  Mook,
  Felpurr
};

export type { RaceConfig, RaceStats, StatRange } from './types';