import { CharacterRace, CharacterClass, CharacterAlignment, CharacterStats } from './GameTypes';

export type TrainingGroundsState =
  | 'main'
  | 'createName'
  | 'createRace'
  | 'createGender'
  | 'createBonusPoints'
  | 'createClass'
  | 'createAlignment'
  | 'createConfirm'
  | 'inspectSelectCharacter'
  | 'inspectMenu'
  | 'inspectView'
  | 'inspectDelete'
  | 'inspectDeleteConfirm'
  | 'inspectClassChange'
  | 'inspectClassChangeSelect'
  | 'inspectClassChangeConfirm'
  | 'inspectRename'
  | 'roster';

export interface CharacterCreationData {
  name: string;
  race: CharacterRace | null;
  gender: 'male' | 'female' | null;
  class: CharacterClass | null;
  alignment: CharacterAlignment | null;
  baseStats: CharacterStats | null;
  bonusPoints: number;
  allocatedBonusPoints: Partial<CharacterStats>;
  startAtLevel4: boolean;
}

export interface TrainingGroundsStateContext {
  currentState: TrainingGroundsState;
  selectedOption: number;
  selectedCharacterIndex: number;
  selectedStatIndex: number;
  textInput: string;
  creationData: CharacterCreationData;
  eligibleClasses: CharacterClass[];
  message: string | null;
  confirmationPrompt: string | null;
  rosterCount: number;
  scrollOffset: number;
}
