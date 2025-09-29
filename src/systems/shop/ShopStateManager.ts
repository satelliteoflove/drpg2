import { GameState, Item } from '../../types/GameTypes';
import { Character } from '../../entities/Character';
import { ShopInventory } from '../ShopSystem';
import { DebugLogger } from '../../utils/DebugLogger';

export type ShopState =
  | 'main_menu'
  | 'buying_category'
  | 'buying_items'
  | 'buying_character_select'
  | 'selling_character_select'
  | 'selling_items'
  | 'selling_confirmation'
  | 'pooling_gold';

export class ShopStateManager {
  private gameState: GameState;

  public currentState: ShopState = 'main_menu';
  public selectedOption: number = 0;
  public selectedCategory: keyof ShopInventory['categories'] = 'weapons';
  public selectedItem: Item | null = null;
  public selectedCharacterIndex: number = 0;
  public selectedSellingCharacter: Character | null = null;

  public readonly menuOptions: string[] = [
    'Buy Items',
    'Sell Items',
    'Identify Items',
    'Pool Gold',
    'Remove Curses',
    'Leave Shop',
  ];

  public readonly categoryOptions: Array<{ key: keyof ShopInventory['categories']; name: string }> = [
    { key: 'weapons', name: 'Weapons' },
    { key: 'armor', name: 'Armor' },
    { key: 'shields', name: 'Shields' },
    { key: 'accessories', name: 'Accessories' },
    { key: 'consumables', name: 'Consumables' },
  ];

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  public reset(): void {
    this.currentState = 'main_menu';
    this.selectedOption = 0;
    this.selectedItem = null;
    this.selectedCharacterIndex = 0;
    this.selectedSellingCharacter = null;

    DebugLogger.debug('ShopStateManager', 'State reset to main menu');
  }

  public transitionTo(newState: ShopState): void {
    const previousState = this.currentState;
    this.currentState = newState;
    this.selectedOption = 0;

    DebugLogger.debug('ShopStateManager',
      `State transition: ${previousState} -> ${newState}`);

    switch (newState) {
      case 'main_menu':
        this.selectedItem = null;
        this.selectedSellingCharacter = null;
        break;
      case 'buying_category':
        this.selectedCategory = 'weapons';
        break;
      case 'selling_character_select':
        this.selectedSellingCharacter = null;
        break;
    }
  }

  public selectMenuOption(index: number): void {
    const maxIndex = this.getMaxOptionIndex();
    this.selectedOption = Math.max(0, Math.min(index, maxIndex));
  }

  public navigateUp(): void {
    const maxIndex = this.getMaxOptionIndex();
    if (this.selectedOption > 0) {
      this.selectedOption--;
    } else {
      this.selectedOption = maxIndex;
    }
  }

  public navigateDown(): void {
    const maxIndex = this.getMaxOptionIndex();
    if (this.selectedOption < maxIndex) {
      this.selectedOption++;
    } else {
      this.selectedOption = 0;
    }
  }

  public getMaxOptionIndex(): number {
    switch (this.currentState) {
      case 'main_menu':
        return this.menuOptions.length - 1;
      case 'buying_category':
        return this.categoryOptions.length - 1;
      case 'buying_items':
        return this.getCurrentCategoryItems().length - 1;
      case 'buying_character_select':
        return this.gameState.party.characters.length - 1;
      case 'selling_character_select':
        return this.gameState.party.characters.length - 1;
      case 'selling_items':
        return this.selectedSellingCharacter
          ? this.selectedSellingCharacter.inventory.length - 1
          : 0;
      case 'selling_confirmation':
      case 'pooling_gold':
        return 1; // Yes/No options
      default:
        return 0;
    }
  }

  public selectCategory(index: number): void {
    if (index >= 0 && index < this.categoryOptions.length) {
      this.selectedCategory = this.categoryOptions[index].key;
      DebugLogger.debug('ShopStateManager', `Selected category: ${this.selectedCategory}`);
    }
  }

  public selectItem(item: Item | null): void {
    this.selectedItem = item;
    if (item) {
      DebugLogger.debug('ShopStateManager',
        `Selected item: ${item.identified ? item.name : item.unidentifiedName}`);
    }
  }

  public selectCharacter(index: number): void {
    const characters = this.gameState.party.characters;
    if (index >= 0 && index < characters.length) {
      this.selectedCharacterIndex = index;

      if (this.currentState === 'selling_character_select') {
        this.selectedSellingCharacter = characters[index];
        DebugLogger.debug('ShopStateManager',
          `Selected selling character: ${characters[index].name}`);
      }
    }
  }

  public getCurrentCategoryItems(): Item[] {
    const shopInventory = require('../ShopSystem').ShopSystem.getShopInventory();
    return shopInventory.categories[this.selectedCategory] || [];
  }

  public getSelectedCategoryItem(): Item | null {
    const items = this.getCurrentCategoryItems();
    if (this.selectedOption >= 0 && this.selectedOption < items.length) {
      return items[this.selectedOption];
    }
    return null;
  }

  public getSelectedSellingItem(): Item | null {
    if (!this.selectedSellingCharacter) return null;

    const items = this.selectedSellingCharacter.inventory;
    if (this.selectedOption >= 0 && this.selectedOption < items.length) {
      return items[this.selectedOption];
    }
    return null;
  }

  public canTransitionTo(state: ShopState): boolean {
    switch (state) {
      case 'buying_items':
        return this.selectedCategory !== null;
      case 'buying_character_select':
        return this.selectedItem !== null;
      case 'selling_items':
        return this.selectedSellingCharacter !== null;
      case 'selling_confirmation':
        return this.selectedItem !== null && this.selectedSellingCharacter !== null;
      default:
        return true;
    }
  }

  public getBackState(): ShopState | null {
    switch (this.currentState) {
      case 'buying_category':
        return 'main_menu';
      case 'buying_items':
        return 'buying_category';
      case 'buying_character_select':
        return 'buying_items';
      case 'selling_character_select':
        return 'main_menu';
      case 'selling_items':
        return 'selling_character_select';
      case 'selling_confirmation':
        return 'selling_items';
      case 'pooling_gold':
        return 'main_menu';
      default:
        return null;
    }
  }

  public handleBack(): boolean {
    const backState = this.getBackState();
    if (backState) {
      this.transitionTo(backState);
      return true;
    }
    return false;
  }

  public getStateContext(): any {
    return {
      state: this.currentState,
      selectedOption: this.selectedOption,
      selectedCategory: this.selectedCategory,
      selectedItem: this.selectedItem,
      selectedCharacterIndex: this.selectedCharacterIndex,
      selectedSellingCharacter: this.selectedSellingCharacter,
      menuOptions: this.menuOptions,
      categoryOptions: this.categoryOptions,
      shopInventory: require('../ShopSystem').ShopSystem.getShopInventory()
    };
  }
}