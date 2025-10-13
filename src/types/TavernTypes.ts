export type TavernState =
  | 'main'
  | 'addCharacter'
  | 'removeCharacter'
  | 'reorderParty'
  | 'divvyGold'
  | 'confirmDivvy';

export interface TavernStateContext {
  currentState: TavernState;
  selectedMenuOption: number;
  selectedRosterIndex: number;
  selectedPartyIndex: number;
  errorMessage: string | null;
}

export type TavernMenuOption =
  | 'addCharacter'
  | 'removeCharacter'
  | 'divvyGold'
  | 'leave';
