import { GameState } from '../../types/GameTypes';
import { Character } from '../../entities/Character';
import {
  TempleService,
  TempleState,
  ServiceCost,
  ServiceInfo,
  TempleStateContext
} from '../../types/TempleTypes';

export class TempleStateManager {
  private gameState: GameState;
  public currentState: TempleState = 'main';
  public selectedOption: number = 0;
  public selectedService: TempleService | null = null;
  public selectedCharacterIndex: number = 0;
  public message: string | null = null;
  public confirmationPrompt: string | null = null;

  private static SERVICE_COSTS: ServiceCost = {
    cure_paralyzed: 300,
    cure_stoned: 300,
    resurrect_dead: 500,
    resurrect_ashes: 1000,
    dispel_curse: 250
  };

  private static SERVICE_INFO: Record<TempleService, ServiceInfo> = {
    cure_paralyzed: {
      name: 'Cure Paralyzed',
      cost: 300,
      description: 'Remove paralysis from a character',
      eligibilityCheck: (character: Character) => character.status === 'Paralyzed'
    },
    cure_stoned: {
      name: 'Cure Stoned',
      cost: 300,
      description: 'Restore a petrified character',
      eligibilityCheck: (character: Character) => character.status === 'Stoned'
    },
    resurrect_dead: {
      name: 'Resurrect from Dead',
      cost: 500,
      description: 'Attempt to bring back a dead character',
      eligibilityCheck: (character: Character) => character.status === 'Dead' && !character.isDead
    },
    resurrect_ashes: {
      name: 'Resurrect from Ashes',
      cost: 1000,
      description: 'Attempt to restore a character from ashes',
      eligibilityCheck: (character: Character) => character.status === 'Ashed'
    },
    dispel_curse: {
      name: 'Dispel Curse',
      cost: 250,
      description: 'Remove curses from equipped items',
      eligibilityCheck: (character: Character) => {
        if (!character.equipment) return false;
        return Object.values(character.equipment).some(item => item?.cursed === true);
      }
    }
  };

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  public reset(): void {
    this.currentState = 'main';
    this.selectedOption = 0;
    this.selectedService = null;
    this.selectedCharacterIndex = 0;
    this.message = null;
    this.confirmationPrompt = null;
  }

  public setState(state: TempleState): void {
    this.currentState = state;
    this.selectedOption = 0;

    if (state === 'main') {
      this.message = null;
      this.confirmationPrompt = null;
      this.selectedService = null;
    }
  }

  public getStateContext(): TempleStateContext {
    return {
      currentState: this.currentState,
      selectedOption: this.selectedOption,
      selectedService: this.selectedService,
      selectedCharacterIndex: this.selectedCharacterIndex,
      serviceResult: null,
      message: this.message,
      confirmationPrompt: this.confirmationPrompt
    };
  }

  public getMainMenuOptions(): string[] {
    return [
      'Temple Services',
      'Leave Temple'
    ];
  }

  public getAllServices(): TempleService[] {
    return [
      'cure_paralyzed',
      'cure_stoned',
      'resurrect_dead',
      'resurrect_ashes',
      'dispel_curse'
    ];
  }

  public getServiceInfo(service: TempleService): ServiceInfo {
    return TempleStateManager.SERVICE_INFO[service];
  }

  public getServiceCost(service: TempleService): number {
    return TempleStateManager.SERVICE_COSTS[service];
  }

  public getAvailableServices(character: Character): TempleService[] {
    return this.getAllServices().filter(service =>
      this.isServiceEligible(character, service)
    );
  }

  public isServiceEligible(character: Character, service: TempleService): boolean {
    const serviceInfo = TempleStateManager.SERVICE_INFO[service];
    return serviceInfo.eligibilityCheck(character);
  }

  public canAffordService(service: TempleService): boolean {
    const cost = this.getServiceCost(service);
    return this.gameState.party.gold >= cost;
  }

  public getCharactersNeedingService(service: TempleService): Character[] {
    if (!this.gameState.party.characters) return [];

    return this.gameState.party.characters.filter((char: Character) =>
      this.isServiceEligible(char, service)
    );
  }

  public getCharactersNeedingAnyService(): Character[] {
    if (!this.gameState.party.characters) return [];

    return this.gameState.party.characters.filter((char: Character) => {
      return this.getAllServices().some(service =>
        this.isServiceEligible(char, service)
      );
    });
  }

  public hasCharactersNeedingService(): boolean {
    return this.getCharactersNeedingAnyService().length > 0;
  }

  public getServiceDescription(service: TempleService, character?: Character): string {
    const serviceInfo = this.getServiceInfo(service);
    const cost = this.getServiceCost(service);
    const canAfford = this.canAffordService(service);

    let description = `${serviceInfo.name} - ${cost}g\n${serviceInfo.description}`;

    if (character) {
      const eligible = this.isServiceEligible(character, service);
      if (!eligible) {
        description += '\n(Character does not need this service)';
      }
    }

    if (!canAfford) {
      description += '\n(Insufficient gold)';
    }

    return description;
  }
}