import { GameState, CharacterClass } from '../../types/GameTypes';
import { Character } from '../../entities/Character';

export class TrainingGroundsServiceHandler {
  private gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  public addCharacterToRoster(character: Character): void {
    this.gameState.characterRoster.push(character);
  }

  public deleteCharacter(index: number): void {
    if (index >= 0 && index < this.gameState.characterRoster.length) {
      this.gameState.characterRoster.splice(index, 1);
    }
  }

  public changeCharacterClass(index: number, newClass: CharacterClass): void {
    const characters = this.gameState.characterRoster as Character[];
    if (index >= 0 && index < characters.length) {
      const character = characters[index];
      character.changeClass(newClass);
    }
  }

  public renameCharacter(index: number, newName: string): void {
    if (index >= 0 && index < this.gameState.characterRoster.length) {
      this.gameState.characterRoster[index].name = newName;
    }
  }
}
