import { BaseASCIIScene } from '../BaseASCIIScene';
import { ASCIIState, ASCII_GRID_WIDTH, ASCII_GRID_HEIGHT } from '../ASCIIState';
import { SceneDeclaration, InputZone } from '../SceneDeclaration';
import { GameState, Item } from '../../types/GameTypes';
import { SceneManager } from '../../core/Scene';
import { ShopSystem, ShopInventory } from '../../systems/ShopSystem';
import { Character } from '../../entities/Character';
import { DebugLogger } from '../../utils/DebugLogger';

type ShopState = 
  | 'main_menu' 
  | 'buying_category' 
  | 'buying_items' 
  | 'buying_character_select' 
  | 'selling_character_select' 
  | 'selling_items' 
  | 'selling_confirmation' 
  | 'pooling_gold';

export class ShopASCIIState extends BaseASCIIScene {
  private gameState: GameState;
  private selectedIndex: number = 0;
  private currentState: ShopState = 'main_menu';
  private shopInventory: ShopInventory;
  private selectedCategory: keyof ShopInventory['categories'] = 'weapons';
  private selectedItem: Item | null = null;
  private selectedCharacterIndex: number = 0;
  private selectedSellingCharacter: Character | null = null;
  private scrollOffset: number = 0;

  private menuOptions: string[] = [
    'Buy Items',
    'Sell Items',
    'Identify Items',
    'Pool Gold',
    'Remove Curses',
    'Leave Shop'
  ];

  private categoryOptions: Array<{key: keyof ShopInventory['categories'], name: string}> = [
    { key: 'weapons', name: 'Weapons' },
    { key: 'armor', name: 'Armor' },
    { key: 'shields', name: 'Shields' },
    { key: 'accessories', name: 'Accessories' },
    { key: 'consumables', name: 'Consumables' }
  ];

  constructor(gameState: GameState, _sceneManager: SceneManager) {
    super('Shop', 'ascii_shop_scene');
    this.gameState = gameState;
    this.shopInventory = ShopSystem.getShopInventory();
  }

  public enter(): void {
    DebugLogger.info('ShopASCIIState', 'Entering Shop ASCII state');
    this.selectedIndex = 0;
    this.currentState = 'main_menu';
    this.selectedItem = null;
    this.selectedCharacterIndex = 0;
    this.selectedSellingCharacter = null;
    this.scrollOffset = 0;
    this.shopInventory = ShopSystem.getShopInventory();
    this.updateGrid();
  }

  public exit(): void {
    DebugLogger.info('ShopASCIIState', 'Exiting Shop ASCII state');
  }

  public update(_deltaTime: number): void {
    // Update can trigger grid updates if needed
  }

  public render(): void {
    this.updateGrid();
  }

  public updateSelectedIndex(index: number): void {
    this.selectedIndex = index;
    this.updateGrid();
  }

  public updateState(state: ShopState): void {
    this.currentState = state;
    this.selectedIndex = 0;
    this.scrollOffset = 0;
    this.updateGrid();
  }

  public updateSelectedCategory(category: keyof ShopInventory['categories']): void {
    this.selectedCategory = category;
    this.updateGrid();
  }

  public updateSelectedItem(item: Item | null): void {
    this.selectedItem = item;
    this.updateGrid();
  }

  public updateSelectedCharacter(index: number): void {
    this.selectedCharacterIndex = index;
    this.updateGrid();
  }

  public updateSellingCharacter(character: Character | null): void {
    this.selectedSellingCharacter = character;
    this.updateGrid();
  }

  private updateGrid(): void {
    const grid = this.asciiState;
    grid.clear();

    switch (this.currentState) {
      case 'main_menu':
        this.renderMainMenu();
        break;
      case 'buying_category':
        this.renderCategorySelection();
        break;
      case 'buying_items':
        this.renderItemList();
        break;
      case 'buying_character_select':
        this.renderCharacterSelection();
        break;
      case 'selling_character_select':
        this.renderSellingCharacterSelection();
        break;
      case 'selling_items':
        this.renderSellingItemList();
        break;
      case 'selling_confirmation':
        this.renderSellingConfirmation();
        break;
      case 'pooling_gold':
        this.renderPoolingGold();
        break;
    }

    // Draw border
    grid.drawBox(0, 0, ASCII_GRID_WIDTH, ASCII_GRID_HEIGHT - 2);
  }

  private renderMainMenu(): void {
    const grid = this.asciiState;
    // Title
    const title = 'BOLTAC\'S TRADING POST [ASCII MODE]';
    const titleX = Math.floor((ASCII_GRID_WIDTH - title.length) / 2);
    grid.writeText(titleX, 1, title);

    // Subtitle
    const subtitle = '"Welcome, adventurers! What can I do for you today?"';
    const subtitleX = Math.floor((ASCII_GRID_WIDTH - subtitle.length) / 2);
    grid.writeText(subtitleX, 3, subtitle);

    // Party gold
    const totalGold = this.gameState.party.getTotalGold();
    const goldText = `Party Gold: ${totalGold}`;
    const goldX = Math.floor((ASCII_GRID_WIDTH - goldText.length) / 2);
    grid.writeText(goldX, 5, goldText);

    // Menu options
    const menuStartY = 8;
    this.menuOptions.forEach((option, index) => {
      const prefix = index === this.selectedIndex ? '> ' : '  ';
      const text = `${prefix}${option}`;
      const x = Math.floor((ASCII_GRID_WIDTH - text.length) / 2);
      grid.writeText(x, menuStartY + index, text);
    });

    // Help text at bottom
    const helpText = 'UP/DOWN: Select  ENTER: Choose  ESC: Leave';
    const helpX = Math.floor((ASCII_GRID_WIDTH - helpText.length) / 2);
    grid.writeText(helpX, ASCII_GRID_HEIGHT - 3, helpText);

    // Detail text based on selection
    let detailText = '';
    switch (this.selectedIndex) {
      case 0:
        detailText = `Purchase weapons, armor, and supplies (${this.shopInventory.items.length} items)`;
        break;
      case 1:
        detailText = 'Sell your unwanted items for gold';
        break;
      case 2:
        detailText = 'Identify unknown magical items (50% of value)';
        break;
      case 3:
        detailText = 'Pool all party gold to one character';
        break;
      case 4:
        detailText = 'Remove curses from cursed items (100% of value)';
        break;
      case 5:
        detailText = 'Return to the town';
        break;
    }
    
    if (detailText) {
      const detailX = Math.floor((ASCII_GRID_WIDTH - detailText.length) / 2);
      grid.writeText(detailX, 16, detailText);
    }
  }

  private renderCategorySelection(): void {
    const grid = this.asciiState;
    // Title
    const title = 'SELECT ITEM CATEGORY';
    const titleX = Math.floor((ASCII_GRID_WIDTH - title.length) / 2);
    grid.writeText(titleX, 2, title);

    // Party gold
    const totalGold = this.gameState.party.getTotalGold();
    const goldText = `Party Gold: ${totalGold}`;
    const goldX = Math.floor((ASCII_GRID_WIDTH - goldText.length) / 2);
    grid.writeText(goldX, 4, goldText);

    // Categories
    const startY = 7;
    this.categoryOptions.forEach((category, index) => {
      const itemCount = this.shopInventory.categories[category.key].length;
      const prefix = index === this.selectedIndex ? '> ' : '  ';
      const text = `${prefix}${category.name} (${itemCount} items)`;
      const x = Math.floor((ASCII_GRID_WIDTH - text.length) / 2);
      grid.writeText(x, startY + index * 2, text);
    });

    // Help text
    const helpText = 'UP/DOWN: Select  ENTER: Browse  ESC: Back';
    const helpX = Math.floor((ASCII_GRID_WIDTH - helpText.length) / 2);
    grid.writeText(helpX, ASCII_GRID_HEIGHT - 3, helpText);
  }

  private renderItemList(): void {
    const grid = this.asciiState;
    const items = this.shopInventory.categories[this.selectedCategory];
    const categoryName = this.categoryOptions.find(c => c.key === this.selectedCategory)?.name || 'Items';

    // Title
    const title = categoryName.toUpperCase();
    const titleX = Math.floor((ASCII_GRID_WIDTH - title.length) / 2);
    grid.writeText(titleX, 1, title);

    // Party gold
    const totalGold = this.gameState.party.getTotalGold();
    const goldText = `Party Gold: ${totalGold}`;
    const goldX = Math.floor((ASCII_GRID_WIDTH - goldText.length) / 2);
    grid.writeText(goldX, 3, goldText);

    if (items.length === 0) {
      const noItemsText = 'No items available in this category';
      const noItemsX = Math.floor((ASCII_GRID_WIDTH - noItemsText.length) / 2);
      grid.writeText(noItemsX, 10, noItemsText);
    } else {
      // Item list with scrolling
      const maxVisible = 10;
      const startY = 5;
      
      // Adjust scroll offset if needed
      if (this.selectedIndex >= this.scrollOffset + maxVisible) {
        this.scrollOffset = this.selectedIndex - maxVisible + 1;
      } else if (this.selectedIndex < this.scrollOffset) {
        this.scrollOffset = this.selectedIndex;
      }

      const visibleItems = items.slice(this.scrollOffset, this.scrollOffset + maxVisible);

      // Draw item list header
      grid.writeText(5, startY, 'Item Name');
      grid.writeText(ASCII_GRID_WIDTH - 15, startY, 'Price');
      grid.writeText(5, startY + 1, '-'.repeat(70));

      visibleItems.forEach((item, index) => {
        const actualIndex = this.scrollOffset + index;
        const y = startY + 2 + index;
        const isSelected = actualIndex === this.selectedIndex;
        const prefix = isSelected ? '> ' : '  ';
        
        // Item name
        grid.writeText(5, y, `${prefix}${item.name}`);
        
        // Price
        const priceText = `${item.value}g`;
        grid.writeText(ASCII_GRID_WIDTH - 10 - priceText.length, y, priceText);
      });

      // Scroll indicators
      if (this.scrollOffset > 0) {
        grid.writeText(3, startY + 2, '^');
      }
      if (this.scrollOffset + maxVisible < items.length) {
        grid.writeText(3, startY + 2 + maxVisible - 1, 'v');
      }

      // Item details for selected item
      if (this.selectedIndex < items.length) {
        const selectedItem = items[this.selectedIndex];
        const detailY = 17;
        
        grid.writeText(5, detailY, `Type: ${selectedItem.type}`);
        grid.writeText(25, detailY, `Weight: ${selectedItem.weight}`);
        
        if (selectedItem.enchantment !== 0) {
          const enchText = `Enchantment: ${selectedItem.enchantment > 0 ? '+' : ''}${selectedItem.enchantment}`;
          grid.writeText(45, detailY, enchText);
        }
        
        if (selectedItem.classRestrictions && selectedItem.classRestrictions.length > 0) {
          const classText = `Classes: ${selectedItem.classRestrictions.join(', ')}`;
          grid.writeText(5, detailY + 1, classText);
        }
      }
    }

    // Help text
    const helpText = 'UP/DOWN: Select  ENTER: Buy  ESC: Back';
    const helpX = Math.floor((ASCII_GRID_WIDTH - helpText.length) / 2);
    grid.writeText(helpX, ASCII_GRID_HEIGHT - 3, helpText);
  }

  private renderCharacterSelection(): void {
    const grid = this.asciiState;
    // Title
    const title = 'SELECT CHARACTER TO RECEIVE ITEM';
    const titleX = Math.floor((ASCII_GRID_WIDTH - title.length) / 2);
    grid.writeText(titleX, 2, title);

    // Item being purchased
    if (this.selectedItem) {
      const itemText = `Purchasing: ${this.selectedItem.name} (${this.selectedItem.value}g)`;
      const itemX = Math.floor((ASCII_GRID_WIDTH - itemText.length) / 2);
      grid.writeText(itemX, 4, itemText);
    }

    // Party gold
    const totalGold = this.gameState.party.getTotalGold();
    const goldText = `Party Gold: ${totalGold}`;
    const goldX = Math.floor((ASCII_GRID_WIDTH - goldText.length) / 2);
    grid.writeText(goldX, 6, goldText);

    // Character list
    const startY = 8;
    this.gameState.party.characters.forEach((character: Character, index: number) => {
      const y = startY + index * 2;
      const isSelected = index === this.selectedCharacterIndex;
      const prefix = isSelected ? '> ' : '  ';
      const statusText = character.isDead ? ' (DEAD)' : '';
      const inventoryText = ` Items: ${character.inventory.length}/20`;
      
      const line1 = `${prefix}${character.name} - ${character.class}${statusText}`;
      const line2 = `   Gold: ${character.gold}${inventoryText}`;
      
      grid.writeText(20, y, line1);
      grid.writeText(20, y + 1, line2);
    });

    // Help text
    const helpText = 'UP/DOWN: Select  ENTER: Confirm  ESC: Cancel';
    const helpX = Math.floor((ASCII_GRID_WIDTH - helpText.length) / 2);
    grid.writeText(helpX, ASCII_GRID_HEIGHT - 3, helpText);
  }

  private renderSellingCharacterSelection(): void {
    const grid = this.asciiState;
    // Title
    const title = 'SELECT CHARACTER TO SELL FROM';
    const titleX = Math.floor((ASCII_GRID_WIDTH - title.length) / 2);
    grid.writeText(titleX, 2, title);

    // Party gold
    const totalGold = this.gameState.party.getTotalGold();
    const goldText = `Party Gold: ${totalGold}`;
    const goldX = Math.floor((ASCII_GRID_WIDTH - goldText.length) / 2);
    grid.writeText(goldX, 4, goldText);

    // Character list
    const startY = 7;
    this.gameState.party.characters.forEach((character: Character, index: number) => {
      const y = startY + index * 3;
      const isSelected = index === this.selectedCharacterIndex;
      const prefix = isSelected ? '> ' : '  ';
      const statusText = character.isDead ? ' (DEAD)' : '';
      const itemCount = character.inventory.length;
      const sellableItems = character.inventory.filter(item => !item.equipped).length;
      
      const line1 = `${prefix}${character.name} - ${character.class}${statusText}`;
      const line2 = `   Items: ${itemCount} (${sellableItems} sellable)`;
      const line3 = `   Gold: ${character.gold}`;
      
      grid.writeText(20, y, line1);
      grid.writeText(20, y + 1, line2);
      grid.writeText(20, y + 2, line3);
    });

    // Help text
    const helpText = 'UP/DOWN: Select  ENTER: View Items  ESC: Back';
    const helpX = Math.floor((ASCII_GRID_WIDTH - helpText.length) / 2);
    grid.writeText(helpX, ASCII_GRID_HEIGHT - 3, helpText);
  }

  private renderSellingItemList(): void {
    const grid = this.asciiState;
    if (!this.selectedSellingCharacter) return;

    const sellableItems = this.selectedSellingCharacter.inventory.filter(item => !item.equipped);

    // Title
    const title = `${this.selectedSellingCharacter.name.toUpperCase()}'S ITEMS`;
    const titleX = Math.floor((ASCII_GRID_WIDTH - title.length) / 2);
    grid.writeText(titleX, 1, title);

    // Party gold
    const totalGold = this.gameState.party.getTotalGold();
    const goldText = `Party Gold: ${totalGold}`;
    const goldX = Math.floor((ASCII_GRID_WIDTH - goldText.length) / 2);
    grid.writeText(goldX, 3, goldText);

    if (sellableItems.length === 0) {
      const noItemsText = 'No sellable items (equipped items cannot be sold)';
      const noItemsX = Math.floor((ASCII_GRID_WIDTH - noItemsText.length) / 2);
      grid.writeText(noItemsX, 10, noItemsText);
    } else {
      // Item list with scrolling
      const maxVisible = 10;
      const startY = 5;
      
      // Adjust scroll offset if needed
      if (this.selectedIndex >= this.scrollOffset + maxVisible) {
        this.scrollOffset = this.selectedIndex - maxVisible + 1;
      } else if (this.selectedIndex < this.scrollOffset) {
        this.scrollOffset = this.selectedIndex;
      }

      const visibleItems = sellableItems.slice(this.scrollOffset, this.scrollOffset + maxVisible);

      // Draw item list header
      grid.writeText(5, startY, 'Item Name');
      grid.writeText(ASCII_GRID_WIDTH - 20, startY, 'Sell Price');
      grid.writeText(5, startY + 1, '-'.repeat(70));

      visibleItems.forEach((item, index) => {
        const actualIndex = this.scrollOffset + index;
        const y = startY + 2 + index;
        const isSelected = actualIndex === this.selectedIndex;
        const prefix = isSelected ? '> ' : '  ';
        const sellPrice = Math.floor(item.value * 0.5);
        
        // Item name
        grid.writeText(5, y, `${prefix}${item.name}`);
        
        // Sell price
        const priceText = `${sellPrice}g`;
        grid.writeText(ASCII_GRID_WIDTH - 10 - priceText.length, y, priceText);
      });

      // Item details for selected item
      if (this.selectedIndex < sellableItems.length) {
        const selectedItem = sellableItems[this.selectedIndex];
        const sellPrice = Math.floor(selectedItem.value * 0.5);
        const detailY = 17;
        
        grid.writeText(5, detailY, `Type: ${selectedItem.type}`);
        grid.writeText(25, detailY, `Original Value: ${selectedItem.value}g`);
        grid.writeText(50, detailY, `Sell Price: ${sellPrice}g`);
        
        if (selectedItem.cursed) {
          grid.writeText(5, detailY + 1, 'CURSED');
        }
      }
    }

    // Help text
    const helpText = 'UP/DOWN: Select  ENTER: Sell  ESC: Back';
    const helpX = Math.floor((ASCII_GRID_WIDTH - helpText.length) / 2);
    grid.writeText(helpX, ASCII_GRID_HEIGHT - 3, helpText);
  }

  private renderSellingConfirmation(): void {
    const grid = this.asciiState;
    if (!this.selectedItem || !this.selectedSellingCharacter) return;

    const sellPrice = Math.floor(this.selectedItem.value * 0.5);

    // Title
    const title = 'CONFIRM SALE';
    const titleX = Math.floor((ASCII_GRID_WIDTH - title.length) / 2);
    grid.writeText(titleX, 3, title);

    // Sale details
    const detailsY = 6;
    const selling = `Selling: ${this.selectedItem.name}`;
    const from = `From: ${this.selectedSellingCharacter.name}`;
    const price = `Sale Price: ${sellPrice} gold`;

    grid.writeText(Math.floor((ASCII_GRID_WIDTH - selling.length) / 2), detailsY, selling);
    grid.writeText(Math.floor((ASCII_GRID_WIDTH - from.length) / 2), detailsY + 2, from);
    grid.writeText(Math.floor((ASCII_GRID_WIDTH - price.length) / 2), detailsY + 4, price);

    // Gold distribution note
    const noteText = 'The gold will be distributed among all party members';
    const noteX = Math.floor((ASCII_GRID_WIDTH - noteText.length) / 2);
    grid.writeText(noteX, detailsY + 7, noteText);

    // Current and new gold
    const currentGold = this.gameState.party.getTotalGold();
    const newGold = currentGold + sellPrice;
    const currentText = `Current Party Gold: ${currentGold}`;
    const newText = `After Sale: ${newGold}`;

    grid.writeText(Math.floor((ASCII_GRID_WIDTH - currentText.length) / 2), detailsY + 10, currentText);
    grid.writeText(Math.floor((ASCII_GRID_WIDTH - newText.length) / 2), detailsY + 11, newText);

    // Confirmation options
    const options = ['Confirm Sale', 'Cancel'];
    const optionsY = 18;
    
    options.forEach((option, index) => {
      const isSelected = index === this.selectedIndex;
      const prefix = isSelected ? '> ' : '  ';
      const text = `${prefix}${option}`;
      const x = Math.floor((ASCII_GRID_WIDTH - text.length) / 2);
      grid.writeText(x, optionsY + index, text);
    });

    // Help text
    const helpText = 'UP/DOWN: Select  ENTER: Confirm  ESC: Cancel';
    const helpX = Math.floor((ASCII_GRID_WIDTH - helpText.length) / 2);
    grid.writeText(helpX, ASCII_GRID_HEIGHT - 3, helpText);
  }

  private renderPoolingGold(): void {
    const grid = this.asciiState;
    // Title
    const title = 'POOL PARTY GOLD';
    const titleX = Math.floor((ASCII_GRID_WIDTH - title.length) / 2);
    grid.writeText(titleX, 2, title);

    // Show current gold distribution
    const goldInfo = ShopSystem.viewGoldDistribution(this.gameState.party);
    
    const totalText = `Total Party Gold: ${goldInfo.totalGold}`;
    const totalX = Math.floor((ASCII_GRID_WIDTH - totalText.length) / 2);
    grid.writeText(totalX, 4, totalText);
    
    const distText = 'Current Distribution:';
    const distX = Math.floor((ASCII_GRID_WIDTH - distText.length) / 2);
    grid.writeText(distX, 6, distText);
    
    // Character gold list
    const startY = 8;
    goldInfo.goldByCharacter.forEach((charGold, index) => {
      const isSelected = index === this.selectedCharacterIndex;
      const prefix = isSelected ? '> ' : '  ';
      const text = `${prefix}${charGold.name}: ${charGold.gold} gold`;
      const x = Math.floor((ASCII_GRID_WIDTH - text.length) / 2);
      grid.writeText(x, startY + index, text);
    });
    
    // Instructions
    const instructY = startY + this.gameState.party.characters.length + 2;
    const instruction1 = 'Select character to receive all gold';
    const instruction2 = '[Enter] Pool to selected | [D] Distribute evenly | [Escape] Cancel';
    
    grid.writeText(Math.floor((ASCII_GRID_WIDTH - instruction1.length) / 2), instructY, instruction1);
    grid.writeText(Math.floor((ASCII_GRID_WIDTH - instruction2.length) / 2), instructY + 2, instruction2);
  }

  public getGrid(): ASCIIState {
    return this.asciiState;
  }

  // Required abstract method implementations
  protected setupInputHandlers(): void {
    // Input handlers are managed through input zones in the scene declaration
  }

  protected updateASCIIState(_deltaTime: number): void {
    // Shop state updates are handled through explicit update methods
    // No continuous updates needed for the shop scene
  }

  protected generateSceneDeclaration(): SceneDeclaration {
    // Generate input zones based on current shop state
    const zones: InputZone[] = [];
    
    // Add zones for menu items or shop items based on current state
    // This will be expanded as needed for interactive elements
    
    return {
      id: 'shop-scene',
      name: 'Shop Scene',
      layers: [],
      uiElements: [],
      inputZones: zones,
      grid: this.asciiState.getGrid(),
      metadata: {
        currentState: this.currentState,
        selectedIndex: this.selectedIndex
      }
    } as any;
  }

  protected setupScene(): void {
    // Initial shop setup
    this.render();
  }
}