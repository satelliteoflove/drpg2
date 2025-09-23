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
        this.messageLog?.addSystemMessage('Item identification not yet implemented');
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
    const characters = this.gameState.party.getCharacters();
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
    const characters = this.gameState.party.getCharacters();
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
}