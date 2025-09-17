export interface StatRequirements {
  strength?: number;
  intelligence?: number;
  piety?: number;
  vitality?: number;
  agility?: number;
  luck?: number;
}

export interface ClassConfig {
  id: string;
  name: string;
  requirements: StatRequirements;
  hpBase: number;
  mpBase?: number;
  genderRestriction?: 'male' | 'female';
  spellSchools: Array<'mage' | 'priest' | 'alchemist' | 'psionic'>;
  tier: 'basic' | 'advanced' | 'elite';
  description?: string;
}