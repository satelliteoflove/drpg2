import { CharacterStatus } from './GameTypes';

export interface ActiveStatusEffect {
  type: CharacterStatus;
  turnsRemaining?: number;
}

export type StatusEffectContext = 'combat' | 'exploration' | 'town';

export interface StatusApplicationOptions {
  duration?: number;
  ignoreResistance?: boolean;
}

export const EXCLUSIVE_STATUS_GROUPS: CharacterStatus[][] = [
  ['OK', 'Dead', 'Ashed', 'Lost'],
  ['Sleeping', 'Paralyzed'],
];

export const STACKABLE_STATUSES: CharacterStatus[] = ['Poisoned'];

export const RACIAL_RESISTANCES: Record<string, CharacterStatus[]> = {
  Elf: ['Sleeping'],
  Dwarf: ['Poisoned'],
  Hobbit: ['Paralyzed', 'Stoned'],
  Dracon: ['Paralyzed', 'Stoned'],
};
