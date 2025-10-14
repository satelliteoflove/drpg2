import { GameState } from '../../types/GameTypes';
import { SceneManager } from '../../core/Scene';
import { ShopStateManager } from './ShopStateManager';
import { ShopTransactionHandler } from './ShopTransactionHandler';
import { MenuInputHandler } from '../../ui/components/MenuInputHandler';
import { DebugLogger } from '../../utils/DebugLogger';

export class ShopInputHandler {
  private gameState: GameState;
  private sceneManager: SceneManager;
  private stateManager: ShopStateManager;
  private transactionHandler: ShopTransactionHandler;
  private messageLog: any;

  constructor(
    gameState: GameState,
    sceneManager: SceneManager,
    stateManager: ShopStateManager,
    transactionHandler: ShopTransactionHandler,
    messageLog: any
  ) {
    this.gameState = gameState;
    this.sceneManager = sceneManager;
    this.stateManager = stateManager;
    this.transactionHandler = transactionHandler;
    this.messageLog = messageLog;
  }

  public handleInput(key: string): boolean {
    const menuState = {
      selectedIndex: this.stateManager.selectedOption,
      maxIndex: this.stateManager.getMaxOptionIndex()
    };

    const action = MenuInputHandler.handleMenuInput(key, menuState, {
      onNavigate: (newIndex) => {
        this.stateManager.selectMenuOption(newIndex);
      }
    });

    if (action.type === 'navigate') {
      return true;
    }

    if (action.type === 'cancel' || key === 'escape') {
      return this.handleCancel();
    }

    if (action.type === 'confirm' || key === 'enter' || key === ' ') {
      return this.handleConfirm();
    }

    return false;
  }

  private handleCancel(): boolean {
    switch (this.stateManager.currentState) {
      case 'main_menu':
        this.sceneManager.switchTo('town');
        return true;

      default:
        return this.stateManager.handleBack();
    }
  }

  private handleConfirm(): boolean {
    switch (this.stateManager.currentState) {
      case 'main_menu':
        return this.handleMainMenuConfirm();

      case 'buying_category':
        return this.handleCategoryConfirm();

      case 'buying_items':
        return this.handleItemSelectConfirm();

      case 'buying_character_select':
        return this.handleBuyConfirm();

      case 'selling_character_select':
        return this.handleSellingCharacterConfirm();

      case 'selling_items':
        return this.handleSellItemConfirm();

      case 'selling_confirmation':
        return this.handleSellConfirmation();

      case 'identifying_character_select':
        return this.handleIdentifyCharacterConfirm();

      case 'identifying_items':
        return this.handleIdentifyItemConfirm();

      case 'identifying_payer_select':
        return this.handleIdentifyPayerConfirm();

      case 'identifying_confirmation':
        return this.handleIdentifyConfirmation();

      case 'pooling_gold':
        return this.handlePoolGoldConfirm();

      default:
        return false;
    }
  }

  private handleMainMenuConfirm(): boolean {
    const option = this.stateManager.menuOptions[this.stateManager.selectedOption];

    switch (option) {
      case 'Buy Items':
        this.stateManager.transitionTo('buying_category');
        return true;

      case 'Sell Items':
        this.stateManager.transitionTo('selling_character_select');
        return true;

      case 'Identify Items':
        const charactersWithUnidentified = this.stateManager.getCharactersWithUnidentifiedItems();
        if (charactersWithUnidentified.length === 0) {
          this.messageLog?.addWarningMessage('No characters have unidentified items');
        } else {
          this.stateManager.transitionTo('identifying_character_select');
        }
        return true;

      case 'Pool Gold':
        this.stateManager.transitionTo('pooling_gold');
        return true;

      case 'Remove Curses':
        this.messageLog?.addSystemMessage('Curse removal not yet implemented');
        return true;

      case 'Leave Shop':
        this.sceneManager.switchTo('town');
        return true;

      default:
        return false;
    }
  }

  private handleCategoryConfirm(): boolean {
    this.stateManager.selectCategory(this.stateManager.selectedOption);
    this.stateManager.transitionTo('buying_items');
    return true;
  }

  private handleItemSelectConfirm(): boolean {
    const item = this.stateManager.getSelectedCategoryItem();
    if (item) {
      this.stateManager.selectItem(item);
      this.stateManager.transitionTo('buying_character_select');
    }
    return true;
  }

  private handleBuyConfirm(): boolean {
    const characters = this.gameState.party.characters;
    const buyer = characters[this.stateManager.selectedCharacterIndex];
    const item = this.stateManager.selectedItem;

    if (!buyer || !item) {
      DebugLogger.warn('ShopInputHandler', 'Missing buyer or item for purchase');
      return false;
    }

    const result = this.transactionHandler.buyItem(item, buyer);

    if (result.success) {
      this.messageLog?.addItemMessage(result.message);
      this.stateManager.transitionTo('main_menu');
    } else {
      this.messageLog?.addWarningMessage(result.message);
    }

    return true;
  }

  private handleSellingCharacterConfirm(): boolean {
    const characters = this.gameState.party.characters;
    const character = characters[this.stateManager.selectedOption];

    if (character.inventory.length === 0) {
      this.messageLog?.addWarningMessage(`${character.name} has no items to sell`);
      return true;
    }

    this.stateManager.selectCharacter(this.stateManager.selectedOption);
    this.stateManager.transitionTo('selling_items');
    return true;
  }

  private handleSellItemConfirm(): boolean {
    const item = this.stateManager.getSelectedSellingItem();

    if (!item) {
      DebugLogger.warn('ShopInputHandler', 'No item selected for selling');
      return false;
    }

    if (item.equipped) {
      this.messageLog?.addWarningMessage('Cannot sell equipped items');
      return true;
    }

    this.stateManager.selectItem(item);
    this.stateManager.transitionTo('selling_confirmation');
    return true;
  }

  private handleSellConfirmation(): boolean {
    if (this.stateManager.selectedOption === 0) {
      const seller = this.stateManager.selectedSellingCharacter;
      const item = this.stateManager.selectedItem;

      if (!seller || !item) {
        DebugLogger.warn('ShopInputHandler', 'Missing seller or item for sale');
        return false;
      }

      const result = this.transactionHandler.sellItem(item, seller);

      if (result.success) {
        this.messageLog?.addItemMessage(result.message);

        if (seller.inventory.length > 0) {
          this.stateManager.transitionTo('selling_items');
        } else {
          this.stateManager.transitionTo('main_menu');
        }
      } else {
        this.messageLog?.addWarningMessage(result.message);
      }
    } else {
      this.stateManager.transitionTo('selling_items');
    }

    return true;
  }

  private handlePoolGoldConfirm(): boolean {
    if (this.stateManager.selectedOption === 0) {
      this.transactionHandler.poolPartyGold();
      this.messageLog?.addSystemMessage('Party gold has been pooled');
    }

    this.stateManager.transitionTo('main_menu');
    return true;
  }

  private handleIdentifyCharacterConfirm(): boolean {
    const charactersWithUnidentified = this.stateManager.getCharactersWithUnidentifiedItems();
    const character = charactersWithUnidentified[this.stateManager.selectedOption];

    if (!character) {
      DebugLogger.warn('ShopInputHandler', 'No character selected for identification');
      return false;
    }

    const unidentifiedItems = this.stateManager.getUnidentifiedItemsForCharacter(character);
    if (unidentifiedItems.length === 0) {
      this.messageLog?.addWarningMessage(`${character.name} has no unidentified items`);
      return true;
    }

    this.stateManager.selectedIdentifyingCharacter = character;
    this.stateManager.transitionTo('identifying_items');
    return true;
  }

  private handleIdentifyItemConfirm(): boolean {
    const item = this.stateManager.getSelectedIdentifyingItem();

    if (!item) {
      DebugLogger.warn('ShopInputHandler', 'No item selected for identification');
      return false;
    }

    this.stateManager.selectItem(item);
    this.stateManager.transitionTo('identifying_payer_select');
    return true;
  }

  private handleIdentifyPayerConfirm(): boolean {
    const characters = this.gameState.party.characters;
    const payer = characters[this.stateManager.selectedOption];

    if (!payer) {
      DebugLogger.warn('ShopInputHandler', 'No payer selected for identification');
      return false;
    }

    this.stateManager.selectedPayerCharacter = payer;
    this.stateManager.transitionTo('identifying_confirmation');
    return true;
  }

  private handleIdentifyConfirmation(): boolean {
    if (this.stateManager.selectedOption === 0) {
      const payer = this.stateManager.selectedPayerCharacter;
      const item = this.stateManager.selectedItem;

      if (!payer || !item) {
        DebugLogger.warn('ShopInputHandler', 'Missing payer or item for identification');
        return false;
      }

      const result = this.transactionHandler.identifyItem(item, payer);

      if (result.success) {
        this.messageLog?.addItemMessage(result.message);

        if (this.stateManager.selectedIdentifyingCharacter) {
          const remainingUnidentified = this.stateManager.getUnidentifiedItemsForCharacter(
            this.stateManager.selectedIdentifyingCharacter
          );
          if (remainingUnidentified.length > 0) {
            this.stateManager.transitionTo('identifying_items');
          } else {
            this.stateManager.transitionTo('main_menu');
          }
        } else {
          this.stateManager.transitionTo('main_menu');
        }
      } else {
        this.messageLog?.addWarningMessage(result.message);
      }
    } else {
      this.stateManager.transitionTo('identifying_items');
    }

    return true;
  }
}