import { GameState } from '../../types/GameTypes';
import { SceneManager } from '../../core/Scene';
import { TempleStateManager } from './TempleStateManager';
import { TempleServiceHandler } from './TempleServiceHandler';
import { MenuInputHandler } from '../../ui/components/MenuInputHandler';
import { ServiceExecutionResult } from '../../types/TempleTypes';

export class TempleInputHandler {
  private gameState: GameState;
  private sceneManager: SceneManager;
  private stateManager: TempleStateManager;
  private serviceHandler: TempleServiceHandler;
  private messageLog: any;
  private lastServiceResult: ServiceExecutionResult | null = null;

  constructor(
    gameState: GameState,
    sceneManager: SceneManager,
    stateManager: TempleStateManager,
    serviceHandler: TempleServiceHandler,
    messageLog: any
  ) {
    this.gameState = gameState;
    this.sceneManager = sceneManager;
    this.stateManager = stateManager;
    this.serviceHandler = serviceHandler;
    this.messageLog = messageLog;
  }

  public handleInput(key: string): boolean {
    const state = this.stateManager.currentState;

    switch (state) {
      case 'main':
        return this.handleMainMenuInput(key);
      case 'selectService':
        return this.handleServiceSelectionInput(key);
      case 'selectCharacter':
        return this.handleCharacterSelectionInput(key);
      case 'selectPayer':
        return this.handlePayerSelectionInput(key);
      case 'confirmService':
        return this.handleConfirmServiceInput(key);
      case 'serviceResult':
        return this.handleServiceResultInput(key);
      default:
        return false;
    }
  }

  public getLastServiceResult(): ServiceExecutionResult | null {
    return this.lastServiceResult;
  }

  private handleMainMenuInput(key: string): boolean {
    const options = this.stateManager.getMainMenuOptions();
    const action = MenuInputHandler.handleMenuInput(
      key,
      {
        selectedIndex: this.stateManager.selectedOption,
        maxIndex: options.length - 1,
      },
      {
        onNavigate: (newIndex: number) => {
          this.stateManager.selectedOption = newIndex;
        },
        onConfirm: () => {
          this.selectMainMenuOption();
        },
        onCancel: () => {
          this.sceneManager.switchTo('town');
        },
      }
    );

    return action.type !== 'none';
  }

  private selectMainMenuOption(): void {
    switch (this.stateManager.selectedOption) {
      case 0:
        this.stateManager.setState('selectService');
        this.stateManager.selectedOption = 0;
        break;
      case 1:
        this.sceneManager.switchTo('town');
        break;
    }
  }

  private handleServiceSelectionInput(key: string): boolean {
    const services = this.stateManager.getAllServices();
    const action = MenuInputHandler.handleMenuInput(
      key,
      {
        selectedIndex: this.stateManager.selectedOption,
        maxIndex: services.length - 1,
      },
      {
        onNavigate: (newIndex: number) => {
          this.stateManager.selectedOption = newIndex;
        },
        onConfirm: () => {
          const selectedService = services[this.stateManager.selectedOption];
          this.stateManager.selectedService = selectedService;

          const eligibleCharacters = this.stateManager.getCharactersNeedingService(selectedService);

          if (eligibleCharacters.length === 0) {
            if (this.messageLog?.add) {
              this.messageLog.add('No characters need this service.');
            }
            return;
          }

          this.stateManager.setState('selectCharacter');
          this.stateManager.selectedOption = 0;
        },
        onCancel: () => {
          this.stateManager.setState('main');
          this.stateManager.selectedOption = 0;
        },
      }
    );

    return action.type !== 'none';
  }

  private handleCharacterSelectionInput(key: string): boolean {
    if (!this.stateManager.selectedService) return false;

    const eligibleCharacters = this.stateManager.getCharactersNeedingService(
      this.stateManager.selectedService
    );

    if (eligibleCharacters.length === 0) return false;

    const action = MenuInputHandler.handleMenuInput(
      key,
      {
        selectedIndex: this.stateManager.selectedOption,
        maxIndex: eligibleCharacters.length - 1,
      },
      {
        onNavigate: (newIndex: number) => {
          this.stateManager.selectedOption = newIndex;
        },
        onConfirm: () => {
          const character = eligibleCharacters[this.stateManager.selectedOption];
          const allCharacters = this.gameState.party.characters || [];
          this.stateManager.selectedCharacterIndex = allCharacters.indexOf(character);

          this.stateManager.setState('selectPayer');
          this.stateManager.selectedOption = 0;
        },
        onCancel: () => {
          this.stateManager.setState('selectService');
          const services = this.stateManager.getAllServices();
          this.stateManager.selectedOption = services.indexOf(this.stateManager.selectedService!);
        },
      }
    );

    return action.type !== 'none';
  }

  private handlePayerSelectionInput(key: string): boolean {
    const allCharacters = this.gameState.party.characters || [];
    if (allCharacters.length === 0) return false;

    const action = MenuInputHandler.handleMenuInput(
      key,
      {
        selectedIndex: this.stateManager.selectedOption,
        maxIndex: allCharacters.length - 1,
      },
      {
        onNavigate: (newIndex: number) => {
          this.stateManager.selectedOption = newIndex;
        },
        onConfirm: () => {
          this.stateManager.payerCharacterIndex = this.stateManager.selectedOption;

          const service = this.stateManager.selectedService;
          if (!service) return;

          const character = allCharacters[this.stateManager.selectedCharacterIndex];
          const cost = this.stateManager.getServiceCost(service, character);

          if (!this.stateManager.canPartyAffordService(service, character)) {
            if (this.messageLog?.add) {
              this.messageLog.add(`Party does not have enough gold! Service costs ${cost}g.`);
            }
            return;
          }

          this.stateManager.setState('confirmService');
        },
        onCancel: () => {
          this.stateManager.setState('selectCharacter');
          this.stateManager.selectedOption = 0;
        },
      }
    );

    return action.type !== 'none';
  }

  private handleConfirmServiceInput(key: string): boolean {
    if (key === 'y') {
      this.executeSelectedService();
      return true;
    } else if (key === 'n' || key === 'escape' || key === 'esc') {
      this.stateManager.setState('selectCharacter');
      this.stateManager.selectedOption = 0;
      return true;
    }

    return false;
  }

  private executeSelectedService(): void {
    const service = this.stateManager.selectedService;
    if (!service) return;

    const characters = this.gameState.party.characters;
    if (!characters || this.stateManager.selectedCharacterIndex >= characters.length) return;
    if (this.stateManager.payerCharacterIndex >= characters.length) return;

    const character = characters[this.stateManager.selectedCharacterIndex];
    const payer = characters[this.stateManager.payerCharacterIndex];
    const cost = this.stateManager.getServiceCost(service, character);

    const result = this.serviceHandler.executeService(service, character, payer, cost, characters);
    this.lastServiceResult = result;

    if (this.messageLog?.add) {
      this.messageLog.add(result.message);
    }

    this.stateManager.setState('serviceResult');
  }

  private handleServiceResultInput(key: string): boolean {
    if (key === 'enter' || key === 'return' || key === 'escape' || key === 'esc' || key === ' ') {
      this.lastServiceResult = null;
      this.stateManager.setState('main');
      this.stateManager.selectedOption = 0;
      this.stateManager.selectedService = null;
      return true;
    }

    return false;
  }
}