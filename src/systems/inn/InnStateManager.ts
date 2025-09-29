import { GameState } from '../../types/GameTypes';
import { Character } from '../../entities/Character';

export type InnState = 'main' | 'selectCharacter' | 'selectRoom' | 'confirmRest' | 'levelupResult' | 'party' | 'poolGold' | 'selectPoolTarget';

export type RoomType = 'stables' | 'cots' | 'economy' | 'merchant' | 'royal';

export interface RoomTypeInfo {
  name: string;
  cost: number;
  hpPerWeek: number;
  weeksToStay: number;
  mpRestore: boolean;
  description: string;
  ageInDays: number;
}

export interface LevelUpResult {
  character: Character;
  oldLevel: number;
  newLevel: number;
  hpGained: number;
  mpGained: number;
  spellsLearned: string[];
}

export interface InnStateContext {
  currentState: InnState;
  selectedOption: number;
  selectedCharacterIndex: number;
  selectedRoomType: RoomType | null;
  levelUpResults: LevelUpResult[];
  message: string | null;
  confirmationPrompt: string | null;
}

export class InnStateManager {
  private gameState: GameState;
  public currentState: InnState = 'main';
  public selectedOption: number = 0;
  public selectedCharacterIndex: number = 0;
  public selectedRoomType: RoomType | null = null;
  public levelUpResults: LevelUpResult[] = [];
  public message: string | null = null;
  public confirmationPrompt: string | null = null;

  private static ROOM_TYPES: Record<RoomType, RoomTypeInfo> = {
    stables: {
      name: 'Stables',
      cost: 0,
      hpPerWeek: 0,
      weeksToStay: 0,
      mpRestore: true,
      description: 'Free. Restores MP only. Ages 1 day.',
      ageInDays: 1
    },
    cots: {
      name: 'Cots',
      cost: 10,
      hpPerWeek: 1,
      weeksToStay: 1,
      mpRestore: true,
      description: '10g per week. Recovers 1 HP per week.',
      ageInDays: 7
    },
    economy: {
      name: 'Economy Rooms',
      cost: 50,
      hpPerWeek: 3,
      weeksToStay: 1,
      mpRestore: true,
      description: '50g per week. Recovers 3 HP per week.',
      ageInDays: 7
    },
    merchant: {
      name: 'Merchant Suites',
      cost: 200,
      hpPerWeek: 7,
      weeksToStay: 1,
      mpRestore: true,
      description: '200g per week. Recovers 7 HP per week.',
      ageInDays: 7
    },
    royal: {
      name: 'Royal Suite',
      cost: 500,
      hpPerWeek: 10,
      weeksToStay: 1,
      mpRestore: true,
      description: '500g per week. Recovers 10 HP per week.',
      ageInDays: 7
    }
  };

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  public reset(): void {
    this.currentState = 'main';
    this.selectedOption = 0;
    this.selectedCharacterIndex = 0;
    this.selectedRoomType = null;
    this.levelUpResults = [];
    this.message = null;
    this.confirmationPrompt = null;
  }

  public setState(state: InnState): void {
    this.currentState = state;
    this.selectedOption = 0;

    if (state === 'main') {
      this.message = null;
      this.confirmationPrompt = null;
    }
  }

  public getStateContext(): InnStateContext {
    return {
      currentState: this.currentState,
      selectedOption: this.selectedOption,
      selectedCharacterIndex: this.selectedCharacterIndex,
      selectedRoomType: this.selectedRoomType,
      levelUpResults: this.levelUpResults,
      message: this.message,
      confirmationPrompt: this.confirmationPrompt
    };
  }

  public getMainMenuOptions(): string[] {
    return [
      'Rest Character',
      'Pool Gold',
      'Party Management',
      'Leave Inn'
    ];
  }


  public getPartyOptions(): string[] {
    return [
      'Inspect Character',
      'Remove from Party',
      'Reorder Party',
      'Back to Main'
    ];
  }

  public getCharactersWithPendingLevelUp(): Character[] {
    if (!this.gameState.party.characters) return [];

    return this.gameState.party.characters.filter((char: Character) =>
      !char.isDead && char.pendingLevelUp
    );
  }


  public getRoomTypes(): RoomTypeInfo[] {
    return Object.values(InnStateManager.ROOM_TYPES);
  }

  public getRoomTypeInfo(type: RoomType): RoomTypeInfo {
    return InnStateManager.ROOM_TYPES[type];
  }

  public calculateRestCost(characterIndex: number, roomType: RoomType): number {
    if (!this.gameState.party.characters || characterIndex >= this.gameState.party.characters.length) {
      return 0;
    }

    const room = InnStateManager.ROOM_TYPES[roomType];
    const character = this.gameState.party.characters[characterIndex];

    // Dead characters cannot rest at the inn
    if (character.isDead) {
      return -1; // Signal that dead characters need the temple
    }

    // Calculate how many weeks needed to fully heal
    if (roomType === 'stables') {
      return 0; // Stables are free
    }

    const hpNeeded = character.maxHp - character.hp;
    if (hpNeeded <= 0 && character.mp === character.maxMp) {
      return 0; // Already fully healed
    }

    const weeksNeeded = room.hpPerWeek > 0 ? Math.ceil(hpNeeded / room.hpPerWeek) : 1;
    return room.cost * Math.max(1, weeksNeeded);
  }

  public calculateWeeksNeeded(characterIndex: number, roomType: RoomType): number {
    if (!this.gameState.party.characters || characterIndex >= this.gameState.party.characters.length) {
      return 0;
    }

    const room = InnStateManager.ROOM_TYPES[roomType];
    const character = this.gameState.party.characters[characterIndex];

    if (roomType === 'stables') {
      return 0; // Stables don't use weeks
    }

    const hpNeeded = character.maxHp - character.hp;
    if (hpNeeded <= 0 && character.mp === character.maxMp) {
      return 1; // Minimum 1 week to apply level-ups
    }

    return room.hpPerWeek > 0 ? Math.ceil(hpNeeded / room.hpPerWeek) : 1;
  }

}