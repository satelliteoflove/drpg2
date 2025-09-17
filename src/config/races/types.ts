export interface StatRange {
  min: number;
  max: number;
}

export interface RaceStats {
  strength: StatRange;
  intelligence: StatRange;
  piety: StatRange;
  vitality: StatRange;
  agility: StatRange;
  luck: StatRange;
}

export interface RaceConfig {
  id: string;
  name: string;
  stats: RaceStats;
  description?: string;
}