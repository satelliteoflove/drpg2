import { GameState } from '../../types/GameTypes';
import { Character } from '../../entities/Character';
import { DebugLogger } from '../../utils/DebugLogger';

export class TavernServiceHandler {
  private gameState: GameState;
  private messageLog: any;

  constructor(gameState: GameState, messageLog: any) {
    this.gameState = gameState;
    this.messageLog = messageLog;
  }

  public addCharacterToParty(characterId: string): boolean {
    const character = this.findCharacterInRoster(characterId);

    if (!character) {
      DebugLogger.warn('TavernServiceHandler', `Character ${characterId} not found in roster`);
      return false;
    }

    if (this.gameState.party.characters.length >= 6) {
      if (this.messageLog?.add) {
        this.messageLog.add('Party is full! Maximum 6 characters allowed.');
      }
      DebugLogger.info('TavernServiceHandler', 'Cannot add character: party is full');
      return false;
    }

    if (character.isDead) {
      if (this.messageLog?.add) {
        this.messageLog.add(`${character.name} is dead and cannot join the party.`);
      }
      DebugLogger.info('TavernServiceHandler', `Cannot add dead character: ${character.name}`);
      return false;
    }

    if (!this.isAlignmentCompatible(character, this.gameState.party.characters)) {
      if (this.messageLog?.add) {
        this.messageLog.add(`${character.name}'s alignment is incompatible with the party.`);
      }
      DebugLogger.info('TavernServiceHandler', `Alignment incompatible: ${character.name} (${character.alignment})`);
      return false;
    }

    const success = this.gameState.party.addCharacter(character);

    if (success) {
      if (this.messageLog?.add) {
        this.messageLog.add(`${character.name} has joined the party!`);
      }
      DebugLogger.info('TavernServiceHandler', `Added ${character.name} to party`);
    }

    return success;
  }

  public removeCharacterFromParty(characterId: string): boolean {
    const characterIndex = this.gameState.party.characters.findIndex(
      (c: Character) => c.id === characterId
    );

    if (characterIndex === -1) {
      DebugLogger.warn('TavernServiceHandler', `Character ${characterId} not found in party`);
      return false;
    }

    const character = this.gameState.party.characters[characterIndex];
    const success = this.gameState.party.removeCharacter(characterId);

    if (success) {
      if (this.messageLog?.add) {
        this.messageLog.add(`${character.name} has left the party.`);
      }
      DebugLogger.info('TavernServiceHandler', `Removed ${character.name} from party`);
    }

    return success;
  }

  public divvyGold(): void {
    const party = this.gameState.party.characters;

    if (party.length === 0) {
      DebugLogger.warn('TavernServiceHandler', 'Cannot divvy gold: party is empty');
      return;
    }

    const totalGold = party.reduce((sum: number, char: Character) => sum + char.gold, 0);
    const sharePerMember = Math.floor(totalGold / party.length);
    const remainder = totalGold % party.length;

    party.forEach((char: Character, index: number) => {
      char.gold = sharePerMember;
      if (index === 0) {
        char.gold += remainder;
      }
    });

    if (this.messageLog?.add) {
      this.messageLog.add(`Gold redistributed: ${sharePerMember}g per member.`);
      if (remainder > 0) {
        this.messageLog.add(`${party[0].name} received ${remainder}g extra (remainder).`);
      }
    }

    DebugLogger.info('TavernServiceHandler', `Divvied ${totalGold}g among ${party.length} members: ${sharePerMember}g each, ${remainder}g remainder`);
  }

  public isAlignmentCompatible(character: Character, party: Character[]): boolean {
    if (party.length === 0) {
      return true;
    }

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

  private findCharacterInRoster(characterId: string): Character | null {
    const roster = this.gameState.characterRoster as Character[];
    const character = roster.find((c: Character) => c.id === characterId);
    return character || null;
  }
}
