import { GameState } from '../../types/GameTypes';
import { SceneManager } from '../../core/Scene';
import { TavernStateManager } from './TavernStateManager';
import { TavernServiceHandler } from './TavernServiceHandler';
import { MenuInputHandler } from '../../ui/components/MenuInputHandler';
import { Character } from '../../entities/Character';
import { DebugLogger } from '../../utils/DebugLogger';

export class TavernInputHandler {
  private gameState: GameState;
  private sceneManager: SceneManager;
  private stateManager: TavernStateManager;
  private serviceHandler: TavernServiceHandler;
  private messageLog: any;

  constructor(
    gameState: GameState,
    sceneManager: SceneManager,
    stateManager: TavernStateManager,
    serviceHandler: TavernServiceHandler,
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
      case 'addCharacter':
        return this.handleAddCharacterInput(key);
      case 'removeCharacter':
        return this.handleRemoveCharacterInput(key);
      case 'reorderParty':
        return this.handleReorderPartyInput(key);
      case 'divvyGold':
        return this.handleDivvyGoldInput(key);
      case 'confirmDivvy':
        return this.handleConfirmDivvyInput(key);
      default:
        return false;
    }
  }

  private handleMainMenuInput(key: string): boolean {
    const options = this.stateManager.getMainMenuOptions();
    const action = MenuInputHandler.handleMenuInput(
      key,
      {
        selectedIndex: this.stateManager.selectedMenuOption,
        maxIndex: options.length - 1,
      },
      {
        onNavigate: (newIndex: number) => {
          this.stateManager.selectedMenuOption = newIndex;
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
    switch (this.stateManager.selectedMenuOption) {
      case 0: {
        const roster = this.gameState.characterRoster as Character[];
        const party = this.gameState.party.characters;

        if (party.length >= 6) {
          if (this.messageLog?.add) {
            this.messageLog.add('Party is full! (Maximum 6 characters)');
          }
          DebugLogger.info('TavernInputHandler', 'Cannot add character - party is full');
          return;
        }

        const availableCharacters = roster.filter((char: Character) => {
          if (char.isDead) return false;
          if (party.find((p: Character) => p.id === char.id)) return false;
          return true;
        });

        if (availableCharacters.length === 0) {
          if (this.messageLog?.add) {
            this.messageLog.add('No available characters in roster to add.');
          }
          DebugLogger.info('TavernInputHandler', 'Cannot add character - no available characters');
          return;
        }

        this.stateManager.setState('addCharacter');
        this.stateManager.selectedRosterIndex = 0;
        DebugLogger.info('TavernInputHandler', 'Entering addCharacter state');
        break;
      }
      case 1: {
        const party = this.gameState.party.characters;

        if (party.length === 0) {
          if (this.messageLog?.add) {
            this.messageLog.add('No characters in party to remove.');
          }
          DebugLogger.info('TavernInputHandler', 'Cannot remove character - party is empty');
          return;
        }

        this.stateManager.setState('removeCharacter');
        this.stateManager.selectedPartyIndex = 0;
        DebugLogger.info('TavernInputHandler', 'Entering removeCharacter state');
        break;
      }
      case 2: {
        const party = this.gameState.party.characters;
        if (party.length <= 1) {
          if (this.messageLog?.add) {
            this.messageLog.add('Need at least 2 party members to reorder.');
          }
          return;
        }
        this.stateManager.setState('reorderParty');
        this.stateManager.selectedPartyIndex = 0;
        DebugLogger.info('TavernInputHandler', 'Entering reorderParty state');
        break;
      }
      case 3:
        this.stateManager.setState('divvyGold');
        DebugLogger.info('TavernInputHandler', 'Entering divvyGold state');
        break;
      case 4:
        DebugLogger.info('TavernInputHandler', 'Leaving tavern, returning to town');
        this.sceneManager.switchTo('town');
        break;
    }
  }

  private handleAddCharacterInput(key: string): boolean {
    const roster = this.gameState.characterRoster as Character[];
    const party = this.gameState.party.characters;

    const availableCharacters = roster.filter((char: Character) => {
      if (char.isDead) return false;
      if (party.find((p: Character) => p.id === char.id)) return false;
      return true;
    });

    if (availableCharacters.length === 0) {
      if (key === 'escape' || key === 'esc') {
        this.stateManager.setState('main');
        DebugLogger.info('TavernInputHandler', 'Cancelled addCharacter, returning to main');
        return true;
      }
      return false;
    }

    const action = MenuInputHandler.handleMenuInput(
      key,
      {
        selectedIndex: this.stateManager.selectedRosterIndex,
        maxIndex: availableCharacters.length - 1,
      },
      {
        onNavigate: (newIndex: number) => {
          this.stateManager.selectedRosterIndex = newIndex;
        },
        onConfirm: () => {
          const selectedCharacter = availableCharacters[this.stateManager.selectedRosterIndex];
          const success = this.serviceHandler.addCharacterToParty(selectedCharacter.id);

          if (success) {
            DebugLogger.info('TavernInputHandler', `Successfully added ${selectedCharacter.name} to party`);
            this.stateManager.setState('main');
          } else {
            DebugLogger.warn('TavernInputHandler', `Failed to add ${selectedCharacter.name} to party`);
          }
        },
        onCancel: () => {
          this.stateManager.setState('main');
          DebugLogger.info('TavernInputHandler', 'Cancelled addCharacter, returning to main');
        },
      }
    );

    return action.type !== 'none';
  }

  private handleRemoveCharacterInput(key: string): boolean {
    const party = this.gameState.party.characters;

    if (party.length === 0) {
      if (key === 'escape' || key === 'esc') {
        this.stateManager.setState('main');
        DebugLogger.info('TavernInputHandler', 'Cancelled removeCharacter, returning to main');
        return true;
      }
      return false;
    }

    const action = MenuInputHandler.handleMenuInput(
      key,
      {
        selectedIndex: this.stateManager.selectedPartyIndex,
        maxIndex: party.length - 1,
      },
      {
        onNavigate: (newIndex: number) => {
          this.stateManager.selectedPartyIndex = newIndex;
        },
        onConfirm: () => {
          const selectedCharacter = party[this.stateManager.selectedPartyIndex];
          const success = this.serviceHandler.removeCharacterFromParty(selectedCharacter.id);

          if (success) {
            DebugLogger.info('TavernInputHandler', `Successfully removed ${selectedCharacter.name} from party`);
            this.stateManager.setState('main');
          } else {
            DebugLogger.warn('TavernInputHandler', `Failed to remove ${selectedCharacter.name} from party`);
          }
        },
        onCancel: () => {
          this.stateManager.setState('main');
          DebugLogger.info('TavernInputHandler', 'Cancelled removeCharacter, returning to main');
        },
      }
    );

    return action.type !== 'none';
  }

  private handleReorderPartyInput(key: string): boolean {
    const party = this.gameState.party.characters;
    const selectedIndex = this.stateManager.selectedPartyIndex;

    if (key === 'arrowup' || key === 'w') {
      if (selectedIndex > 0) {
        this.stateManager.selectedPartyIndex--;
      }
      return true;
    }

    if (key === 'arrowdown' || key === 's') {
      if (selectedIndex < party.length - 1) {
        this.stateManager.selectedPartyIndex++;
      }
      return true;
    }

    if (key === 'arrowleft' || key === 'a') {
      if (selectedIndex > 0) {
        this.serviceHandler.reorderParty(selectedIndex, selectedIndex - 1);
        this.stateManager.selectedPartyIndex--;
      }
      return true;
    }

    if (key === 'arrowright' || key === 'd') {
      if (selectedIndex < party.length - 1) {
        this.serviceHandler.reorderParty(selectedIndex, selectedIndex + 1);
        this.stateManager.selectedPartyIndex++;
      }
      return true;
    }

    if (key === 'escape' || key === 'esc' || key === 'enter' || key === 'return') {
      this.stateManager.setState('main');
      DebugLogger.info('TavernInputHandler', 'Exited reorderParty, returning to main');
      return true;
    }

    return false;
  }

  private handleDivvyGoldInput(key: string): boolean {
    if (key === 'y') {
      const party = this.gameState.party.characters;

      if (party.length === 0) {
        if (this.messageLog?.add) {
          this.messageLog.add('No party members to distribute gold to.');
        }
        this.stateManager.setState('main');
        return true;
      }

      this.serviceHandler.divvyGold();
      DebugLogger.info('TavernInputHandler', 'Divvied gold among party members');
      this.stateManager.setState('confirmDivvy');
      return true;
    } else if (key === 'n' || key === 'escape' || key === 'esc') {
      DebugLogger.info('TavernInputHandler', 'Cancelled divvyGold, returning to main');
      this.stateManager.setState('main');
      return true;
    }

    return false;
  }

  private handleConfirmDivvyInput(key: string): boolean {
    if (key === 'enter' || key === 'return' || key === 'escape' || key === 'esc') {
      DebugLogger.info('TavernInputHandler', 'Confirmed divvy, returning to main');
      this.stateManager.setState('main');
      return true;
    }

    return false;
  }
}
