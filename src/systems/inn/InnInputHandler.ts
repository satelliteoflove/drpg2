import { GameState } from '../../types/GameTypes';
import { SceneManager } from '../../core/Scene';
import { InnStateManager } from './InnStateManager';
import { InnTransactionHandler } from './InnTransactionHandler';
import { MenuInputHandler } from '../../ui/components/MenuInputHandler';
import { Character } from '../../entities/Character';

export class InnInputHandler {
  private gameState: GameState;
  private sceneManager: SceneManager;
  private stateManager: InnStateManager;
  private transactionHandler: InnTransactionHandler;
  private messageLog: any;

  constructor(
    gameState: GameState,
    sceneManager: SceneManager,
    stateManager: InnStateManager,
    transactionHandler: InnTransactionHandler,
    messageLog: any
  ) {
    this.gameState = gameState;
    this.sceneManager = sceneManager;
    this.stateManager = stateManager;
    this.transactionHandler = transactionHandler;
    this.messageLog = messageLog;
  }

  public handleInput(key: string): boolean {
    const state = this.stateManager.currentState;

    switch (state) {
      case 'main':
        return this.handleMainMenuInput(key);
      case 'selectCharacter':
        return this.handleCharacterSelectionInput(key);
      case 'selectRoom':
        return this.handleRoomSelectionInput(key);
      case 'confirmRest':
        return this.handleConfirmRestInput(key);
      case 'levelupResult':
        return this.handleLevelUpResultInput(key);
      case 'poolGold':
        return this.handlePoolGoldInput(key);
      case 'selectPoolTarget':
        return this.handlePoolTargetSelection(key);
      default:
        return false;
    }
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
      case 0: // Rest Character
        this.stateManager.setState('selectCharacter');
        this.stateManager.selectedOption = 0;
        break;
      case 1: // Pool Gold
        this.stateManager.setState('poolGold');
        this.stateManager.selectedOption = 0;
        break;
      case 2: // Leave Inn
        this.sceneManager.switchTo('town');
        break;
    }
  }

  private handleCharacterSelectionInput(key: string): boolean {
    const characters = this.gameState.party.characters || [];
    const action = MenuInputHandler.handleMenuInput(
      key,
      {
        selectedIndex: this.stateManager.selectedOption,
        maxIndex: characters.length - 1,
      },
      {
        onNavigate: (newIndex: number) => {
          this.stateManager.selectedOption = newIndex;
        },
        onConfirm: () => {
          if (characters.length > 0) {
            this.stateManager.selectedCharacterIndex = this.stateManager.selectedOption;
            this.stateManager.setState('selectRoom');
            this.stateManager.selectedOption = 0;
          }
        },
        onCancel: () => {
          this.stateManager.setState('main');
          this.stateManager.selectedOption = 0;
        },
      }
    );

    return action.type !== 'none';
  }

  private handleRoomSelectionInput(key: string): boolean {
    const roomTypes = this.stateManager.getRoomTypes();
    const action = MenuInputHandler.handleMenuInput(
      key,
      {
        selectedIndex: this.stateManager.selectedOption,
        maxIndex: roomTypes.length - 1,
      },
      {
        onNavigate: (newIndex: number) => {
          this.stateManager.selectedOption = newIndex;
        },
        onConfirm: () => {
          const roomTypeKeys: Array<'stables' | 'cots' | 'economy' | 'merchant' | 'royal'> = ['stables', 'cots', 'economy', 'merchant', 'royal'];
          this.stateManager.selectedRoomType = roomTypeKeys[this.stateManager.selectedOption];

          const character = this.gameState.party.characters?.[this.stateManager.selectedCharacterIndex];
          if (!character) return;

          // Check if character is dead
          if (character.isDead) {
            if (this.messageLog?.add) {
              this.messageLog.add('Dead characters must visit the Temple for resurrection.');
            }
            return;
          }

          const cost = this.stateManager.calculateRestCost(
            this.stateManager.selectedCharacterIndex,
            this.stateManager.selectedRoomType
          );

          if (cost === -1) {
            if (this.messageLog?.add) {
              this.messageLog.add('Dead characters cannot rest at the Inn.');
            }
            return;
          }

          if (cost > 0 && !this.transactionHandler.canAffordService(cost, this.stateManager.selectedCharacterIndex)) {
            if (this.messageLog?.add) {
              this.messageLog.add(`Not enough gold! You need ${cost}g for this stay.`);
            }
            return;
          }

          const weeks = this.stateManager.calculateWeeksNeeded(
            this.stateManager.selectedCharacterIndex,
            this.stateManager.selectedRoomType
          );

          const confirmText = this.stateManager.selectedRoomType === 'stables' ?
            'Rest in the Stables? (Y/N)' :
            weeks > 1 ?
              `Rest for ${weeks} weeks (${cost}g)? (Y/N)` :
              `Rest for ${cost}g? (Y/N)`;

          this.stateManager.confirmationPrompt = confirmText;
          this.stateManager.setState('confirmRest');
        },
        onCancel: () => {
          this.stateManager.setState('selectCharacter');
          this.stateManager.selectedOption = this.stateManager.selectedCharacterIndex;
        },
      }
    );

    return action.type !== 'none';
  }

  private handleConfirmRestInput(key: string): boolean {
    if (key === 'y') {
      if (!this.stateManager.selectedRoomType) return false;

      const cost = this.stateManager.calculateRestCost(
        this.stateManager.selectedCharacterIndex,
        this.stateManager.selectedRoomType
      );

      if (this.transactionHandler.canAffordService(cost, this.stateManager.selectedCharacterIndex)) {
        this.transactionHandler.deductGold(cost, this.stateManager.selectedCharacterIndex);
        const result = this.transactionHandler.restCharacter(
          this.stateManager.selectedCharacterIndex,
          this.stateManager.selectedRoomType
        );

        if (result) {
          this.stateManager.levelUpResults = [result];
          this.stateManager.setState('levelupResult');
        } else {
          this.stateManager.setState('main');
          this.stateManager.selectedOption = 0;
        }
      } else {
        this.stateManager.setState('main');
        if (this.messageLog?.add) {
          this.messageLog.add('Not enough gold!');
        }
      }

      return true;
    } else if (key === 'n' || key === 'escape' || key === 'esc') {
      this.stateManager.setState('selectRoom');
      this.stateManager.confirmationPrompt = null;
      return true;
    }

    return false;
  }

  private handleLevelUpResultInput(key: string): boolean {
    if (key === 'enter' || key === 'return' || key === 'escape' || key === 'esc') {
      this.stateManager.levelUpResults = [];
      this.stateManager.setState('main');
      return true;
    }

    return false;
  }

  private handlePoolGoldInput(key: string): boolean {
    const action = MenuInputHandler.handleMenuInput(
      key,
      {
        selectedIndex: this.stateManager.selectedOption,
        maxIndex: 1,
      },
      {
        onNavigate: (newIndex: number) => {
          this.stateManager.selectedOption = newIndex;
        },
        onConfirm: () => {
          if (this.stateManager.selectedOption === 0) {
            // Proceed to character selection
            this.stateManager.setState('selectPoolTarget');
            this.stateManager.selectedOption = 0;
          } else {
            // Cancel
            this.stateManager.setState('main');
            this.stateManager.selectedOption = 1;
          }
        },
        onCancel: () => {
          this.stateManager.setState('main');
          this.stateManager.selectedOption = 1;
        },
      }
    );

    return action.type !== 'none';
  }

  private handlePoolTargetSelection(key: string): boolean {
    const characters = this.gameState.party.characters || [];
    const action = MenuInputHandler.handleMenuInput(
      key,
      {
        selectedIndex: this.stateManager.selectedOption,
        maxIndex: characters.length - 1,
      },
      {
        onNavigate: (newIndex: number) => {
          this.stateManager.selectedOption = newIndex;
        },
        onConfirm: () => {
          if (characters.length > 0) {
            this.poolGoldToCharacter(this.stateManager.selectedOption);
            this.stateManager.setState('main');
            this.stateManager.selectedOption = 1;
          }
        },
        onCancel: () => {
          this.stateManager.setState('poolGold');
          this.stateManager.selectedOption = 0;
        },
      }
    );

    return action.type !== 'none';
  }

  private poolGoldToCharacter(targetIndex: number): void {
    const characters = this.gameState.party.characters;
    if (!characters || targetIndex >= characters.length) return;

    const targetCharacter = characters[targetIndex];
    let totalPooled = 0;

    // Collect gold from all other characters
    characters.forEach((char: Character, index: number) => {
      if (index !== targetIndex && char.gold > 0) {
        totalPooled += char.gold;
        char.gold = 0;
      }
    });

    // Add to target character
    targetCharacter.gold += totalPooled;

    if (this.messageLog?.add) {
      if (totalPooled > 0) {
        this.messageLog.add(`Pooled ${totalPooled} gold to ${targetCharacter.name}.`);
        this.messageLog.add(`${targetCharacter.name} now has ${targetCharacter.gold} gold.`);
      } else {
        this.messageLog.add('No gold to pool from other party members.');
      }
    }
  }
}