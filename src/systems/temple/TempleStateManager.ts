import { GameState } from '../../types/GameTypes';
import { Character } from '../../entities/Character';
import {
  TempleService,
  TempleState,
  ServiceCost,
  ServiceInfo,
  TempleStateContext
} from '../../types/TempleTypes';
import { GAME_CONFIG } from '../../config/GameConstants';

export class TempleStateManager {
  private gameState: GameState;
  public currentState: TempleState = 'main';
  public selectedOption: number = 0;
  public selectedService: TempleService | null = null;
  public selectedCharacterIndex: number = 0;
  public payerCharacterIndex: number = 0;
  public message: string | null = null;
  public confirmationPrompt: string | null = null;

  private static BASE_SERVICE_COSTS: ServiceCost = {
    cure_paralyzed: GAME_CONFIG.TEMPLE.SERVICE_COSTS.CURE_PARALYZED,
    cure_stoned: GAME_CONFIG.TEMPLE.SERVICE_COSTS.CURE_STONED,
    resurrect_dead: GAME_CONFIG.TEMPLE.SERVICE_COSTS.RESURRECT_DEAD,
    resurrect_ashes: GAME_CONFIG.TEMPLE.SERVICE_COSTS.RESURRECT_ASHES
  };

  private static SERVICE_INFO: Record<TempleService, ServiceInfo> = {
    cure_paralyzed: {
      name: 'Cure Paralyzed',
      cost: GAME_CONFIG.TEMPLE.SERVICE_COSTS.CURE_PARALYZED,
      description: 'Remove paralysis from a character (Base Cost × Level)',
      eligibilityCheck: (character: Character) => character.hasStatus('Paralyzed')
    },
    cure_stoned: {
      name: 'Cure Stoned',
      cost: GAME_CONFIG.TEMPLE.SERVICE_COSTS.CURE_STONED,
      description: 'Restore a petrified character (Base Cost × Level)',
      eligibilityCheck: (character: Character) => character.hasStatus('Stoned')
    },
    resurrect_dead: {
      name: 'Resurrect from Dead',
      cost: GAME_CONFIG.TEMPLE.SERVICE_COSTS.RESURRECT_DEAD,
      description: 'Attempt to bring back a dead character (Base Cost × Level)',
      eligibilityCheck: (character: Character) => character.hasStatus('Dead')
    },
    resurrect_ashes: {
      name: 'Resurrect from Ashes',
      cost: GAME_CONFIG.TEMPLE.SERVICE_COSTS.RESURRECT_ASHES,
      description: 'Attempt to restore a character from ashes (Base Cost × Level)',
      eligibilityCheck: (character: Character) => character.hasStatus('Ashed')
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
    this.payerCharacterIndex = 0;
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
      payerCharacterIndex: this.payerCharacterIndex,
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
      'resurrect_ashes'
    ];
  }

  public getServiceInfo(service: TempleService): ServiceInfo {
    return TempleStateManager.SERVICE_INFO[service];
  }

  public getServiceCost(service: TempleService, character: Character): number {
    const baseCost = TempleStateManager.BASE_SERVICE_COSTS[service];
    return baseCost * character.level;
  }

  public getBaseCost(service: TempleService): number {
    return TempleStateManager.BASE_SERVICE_COSTS[service];
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

  public canPartyAffordService(service: TempleService, character: Character): boolean {
    const cost = this.getServiceCost(service, character);
    const partyTotalGold = this.gameState.party.characters.reduce((total: number, char: Character) => total + char.gold, 0);
    return partyTotalGold >= cost;
  }

  public canAnyoneAffordService(service: TempleService, character: Character): boolean {
    return this.canPartyAffordService(service, character);
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
    const baseCost = this.getBaseCost(service);

    let description = `${serviceInfo.name} - ${baseCost}g × Level\n${serviceInfo.description}`;

    if (character) {
      const cost = this.getServiceCost(service, character);
      const canAfford = this.canPartyAffordService(service, character);
      const eligible = this.isServiceEligible(character, service);

      description += `\n\nCost for ${character.name} (Lv.${character.level}): ${cost}g`;

      if (!eligible) {
        description += '\n(Character does not need this service)';
      }

      if (!canAfford) {
        description += '\n(Party cannot afford this service)';
      }
    }

    return description;
  }
}