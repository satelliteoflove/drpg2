import { Character } from '../entities/Character';

export type TempleService =
  | 'cure_paralyzed'
  | 'cure_stoned'
  | 'resurrect_dead'
  | 'resurrect_ashes'
  | 'dispel_curse';

export type TempleState =
  | 'main'
  | 'selectService'
  | 'selectCharacter'
  | 'selectPayer'
  | 'confirmService'
  | 'serviceResult';

export interface ServiceCost {
  cure_paralyzed: number;
  cure_stoned: number;
  resurrect_dead: number;
  resurrect_ashes: number;
  dispel_curse: number;
}

export type ResurrectionOutcome = 'success' | 'turned_to_ashes' | 'lost';

export interface ResurrectionResult {
  outcome: ResurrectionOutcome;
  vitalityLost: number;
  hpRestored: number;
  message: string;
}

export interface ServiceInfo {
  name: string;
  cost: number;
  description: string;
  eligibilityCheck: (character: Character) => boolean;
}

export interface ServiceExecutionResult {
  success: boolean;
  message: string;
  goldSpent: number;
  resurrectionResult?: ResurrectionResult;
}

export interface TempleStateContext {
  currentState: TempleState;
  selectedOption: number;
  selectedService: TempleService | null;
  selectedCharacterIndex: number;
  payerCharacterIndex: number;
  serviceResult: ServiceExecutionResult | null;
  message: string | null;
  confirmationPrompt: string | null;
}