import { GameState } from '../../types/GameTypes';
import { Character } from '../../entities/Character';
import { TavernState, TavernStateContext } from '../../types/TavernTypes';

export class TavernStateManager {
  private gameState: GameState;
  public currentState: TavernState = 'main';
  public selectedMenuOption: number = 0;
  public selectedRosterIndex: number = 0;
  public selectedPartyIndex: number = 0;
  public errorMessage: string | null = null;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  public reset(): void {
    this.currentState = 'main';
    this.selectedMenuOption = 0;
    this.selectedRosterIndex = 0;
    this.selectedPartyIndex = 0;
    this.errorMessage = null;
  }

  public setState(state: TavernState): void {
    this.currentState = state;
    this.selectedMenuOption = 0;

    if (state === 'main') {
      this.errorMessage = null;
    }
  }

  public getStateContext(): TavernStateContext {
    return {
      currentState: this.currentState,
      selectedMenuOption: this.selectedMenuOption,
      selectedRosterIndex: this.selectedRosterIndex,
      selectedPartyIndex: this.selectedPartyIndex,
      errorMessage: this.errorMessage
    };
  }

  public getMainMenuOptions(): string[] {
    return [
      'Add Character to Party',
      'Remove Character from Party',
      'Reorder Party',
      'Divvy Gold',
      'Inspect Character',
      'Leave'
    ];
  }

  public getEligibleRosterCharacters(): Character[] {
    if (!this.gameState.characterRoster) return [];

    const roster = this.gameState.characterRoster as Character[];
    const party = this.gameState.party.characters;

    return roster.filter((char: Character) => {
      if (char.isDead) return false;

      if (party.length === 0) return true;

      const isAlignmentCompatible = this.checkAlignmentCompatibility(char, party);
      return isAlignmentCompatible;
    });
  }

  private checkAlignmentCompatibility(character: Character, party: Character[]): boolean {
    if (party.length === 0) return true;

    const newAlign = character.alignment;

    for (const member of party) {
      const memberAlign = member.alignment;

      if (newAlign === 'Good' && memberAlign === 'Evil') {
        return false;
      }
      if (newAlign === 'Evil' && memberAlign === 'Good') {
        return false;
      }
    }

    return true;
  }

  public validateDungeonEntry(): boolean {
    const party = this.gameState.party.characters;

    if (party.length === 0) return false;

    const livingCharacters = party.filter((c: Character) => !c.isDead && c.statuses.length === 0);

    return livingCharacters.length > 0;
  }
}
