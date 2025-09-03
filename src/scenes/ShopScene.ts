import { Scene, SceneManager, SceneRenderContext } from '../core/Scene';
import { GameState, Item } from '../types/GameTypes';
import { ShopSystem, ShopInventory } from '../systems/ShopSystem';
import { Character } from '../entities/Character';
import { RenderingUtils } from '../utils/RenderingUtils';
import { GameUtilities } from '../utils/GameUtilities';
import { UI_CONSTANTS } from '../config/UIConstants';
import { DebugLogger } from '../utils/DebugLogger';

type ShopState = 'main_menu' | 'buying_category' | 'buying_items' | 'buying_character_select' | 'selling_character_select' | 'selling_items' | 'selling_confirmation';

export class ShopScene extends Scene {
  private gameState: GameState;
  private sceneManager: SceneManager;
  private selectedOption: number = 0;
  private shopInventory: ShopInventory;
  private currentState: ShopState = 'main_menu';
  private selectedCategory: keyof ShopInventory['categories'] = 'weapons';
  private selectedItem: Item | null = null;
  private selectedCharacterIndex: number = 0;
  private selectedSellingCharacter: Character | null = null;
  
  private menuOptions: string[] = [
    'Buy Items',
    'Sell Items', 
    'Identify Items',
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

  constructor(gameState: GameState, sceneManager: SceneManager) {
    super('Shop');
    this.gameState = gameState;
    this.sceneManager = sceneManager;
    this.shopInventory = ShopSystem.getShopInventory();
  }

  public enter(): void {
    this.selectedOption = 0;
    this.currentState = 'main_menu';
    this.selectedItem = null;
    this.selectedCharacterIndex = 0;
    this.selectedSellingCharacter = null;
    this.shopInventory = ShopSystem.getShopInventory();
  }

  public exit(): void {}

  public update(_deltaTime: number): void {}

  public render(ctx: CanvasRenderingContext2D): void {
    this.renderShopContent(ctx);
  }

  public renderLayered(renderContext: SceneRenderContext): void {
    const { renderManager } = renderContext;

    renderManager.renderBackground((ctx) => {
      RenderingUtils.clearCanvas(ctx);
    });

    renderManager.renderUI((ctx) => {
      this.renderShopContent(ctx);
    });
  }

  private renderShopContent(ctx: CanvasRenderingContext2D): void {
    RenderingUtils.clearCanvas(ctx);
    
    switch (this.currentState) {
      case 'main_menu':
        this.renderMainMenu(ctx);
        break;
      case 'buying_category':
        this.renderCategorySelection(ctx);
        break;
      case 'buying_items':
        this.renderItemList(ctx);
        break;
      case 'buying_character_select':
        this.renderCharacterSelection(ctx);
        break;
      case 'selling_character_select':
        this.renderSellingCharacterSelection(ctx);
        break;
      case 'selling_items':
        this.renderSellingItemList(ctx);
        break;
      case 'selling_confirmation':
        this.renderSellingConfirmation(ctx);
        break;
    }
  }

  public handleInput(key: string): boolean {
    switch (this.currentState) {
      case 'main_menu':
        return this.handleMainMenuInput(key);
      case 'buying_category':
        return this.handleCategoryInput(key);
      case 'buying_items':
        return this.handleItemListInput(key);
      case 'buying_character_select':
        return this.handleCharacterSelectInput(key);
      case 'selling_character_select':
        return this.handleSellingCharacterSelectInput(key);
      case 'selling_items':
        return this.handleSellingItemListInput(key);
      case 'selling_confirmation':
        return this.handleSellingConfirmationInput(key);
      default:
        return false;
    }
  }

  private renderMainMenu(ctx: CanvasRenderingContext2D): void {
    RenderingUtils.renderCenteredText(ctx, 'BOLTAC\'S TRADING POST', UI_CONSTANTS.LAYOUT.HEADER_HEIGHT, {
      color: RenderingUtils.COLORS.WHITE,
      font: RenderingUtils.FONTS.TITLE_LARGE
    });

    RenderingUtils.renderCenteredText(ctx, '"Welcome, adventurers! What can I do for you today?"', UI_CONSTANTS.LAYOUT.HEADER_HEIGHT + 30, {
      color: RenderingUtils.COLORS.WHITE,
      font: RenderingUtils.FONTS.SMALL
    });

    // Show party gold
    const totalGold = this.gameState.party.getTotalGold();
    RenderingUtils.renderCenteredText(ctx, `Party Gold: ${totalGold}`, UI_CONSTANTS.LAYOUT.CONTENT_START_Y, {
      color: RenderingUtils.COLORS.GOLD,
      font: RenderingUtils.FONTS.NORMAL
    });

    RenderingUtils.renderMenu(
      ctx,
      this.menuOptions,
      this.selectedOption,
      0,
      170,
      UI_CONSTANTS.LAYOUT.MENU_ITEM_HEIGHT,
      { centered: true }
    );

    // Detail text setup

    if (this.selectedOption === 0) {
      RenderingUtils.renderText(ctx, 'Purchase weapons, armor, and supplies', 50, 400, {
        color: RenderingUtils.COLORS.GRAY,
        font: RenderingUtils.FONTS.SMALL
      });
      RenderingUtils.renderText(ctx, `Available items: ${this.shopInventory.items.length}`, 50, 420, {
        color: RenderingUtils.COLORS.GRAY,
        font: RenderingUtils.FONTS.SMALL
      });
    } else if (this.selectedOption === 1) {
      RenderingUtils.renderText(ctx, 'Sell your unwanted items for gold', 50, 400, {
        color: RenderingUtils.COLORS.GRAY,
        font: RenderingUtils.FONTS.SMALL
      });
    } else if (this.selectedOption === 2) {
      RenderingUtils.renderText(ctx, 'Identify unknown magical items', 50, 400, {
        color: RenderingUtils.COLORS.GRAY,
        font: RenderingUtils.FONTS.SMALL
      });
      RenderingUtils.renderText(ctx, 'Cost: 50% of item value', 50, 420, {
        color: RenderingUtils.COLORS.GRAY,
        font: RenderingUtils.FONTS.SMALL
      });
    } else if (this.selectedOption === 3) {
      RenderingUtils.renderText(ctx, 'Remove curses from cursed items', 50, 400, {
        color: RenderingUtils.COLORS.GRAY,
        font: RenderingUtils.FONTS.SMALL
      });
      RenderingUtils.renderText(ctx, 'Cost: 100% of item value', 50, 420, {
        color: RenderingUtils.COLORS.GRAY,
        font: RenderingUtils.FONTS.SMALL
      });
    } else {
      RenderingUtils.renderText(ctx, 'Return to the town', 50, 400, {
        color: RenderingUtils.COLORS.GRAY,
        font: RenderingUtils.FONTS.SMALL
      });
    }

    RenderingUtils.renderCenteredText(
      ctx,
      'UP/DOWN to select, ENTER to choose, ESC to leave',
      ctx.canvas.height - 20,
      {
        color: RenderingUtils.COLORS.MUTED,
        font: RenderingUtils.FONTS.TINY
      }
    );
  }

  private renderCategorySelection(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#fff';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT ITEM CATEGORY', ctx.canvas.width / 2, 60);

    const totalGold = this.gameState.party.getTotalGold();
    ctx.font = '16px monospace';
    ctx.fillStyle = '#ffaa00';
    ctx.fillText(`Party Gold: ${totalGold}`, ctx.canvas.width / 2, 100);

    const startY = 150;
    const lineHeight = 50;

    this.categoryOptions.forEach((category, index) => {
      const y = startY + index * lineHeight;
      const itemCount = this.shopInventory.categories[category.key].length;

      if (index === this.selectedOption) {
        ctx.fillStyle = '#ffaa00';
        ctx.fillText(`> ${category.name} (${itemCount}) <`, ctx.canvas.width / 2, y);
      } else {
        ctx.fillStyle = '#fff';
        ctx.fillText(`${category.name} (${itemCount})`, ctx.canvas.width / 2, y);
      }
    });

    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      'UP/DOWN to select, ENTER to browse, ESC to go back',
      ctx.canvas.width / 2,
      ctx.canvas.height - 20
    );
  }

  private renderItemList(ctx: CanvasRenderingContext2D): void {
    const items = this.shopInventory.categories[this.selectedCategory];
    const categoryName = this.categoryOptions.find(c => c.key === this.selectedCategory)?.name || 'Items';

    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${categoryName.toUpperCase()}`, ctx.canvas.width / 2, 50);

    const totalGold = this.gameState.party.getTotalGold();
    ctx.font = '14px monospace';
    ctx.fillStyle = '#ffaa00';
    ctx.fillText(`Party Gold: ${totalGold}`, ctx.canvas.width / 2, 75);

    if (items.length === 0) {
      ctx.fillStyle = '#aaa';
      ctx.font = '16px monospace';
      ctx.fillText('No items available in this category', ctx.canvas.width / 2, 200);
    } else {
      const startY = 120;
      const lineHeight = 30;
      const maxVisible = 12;
      const startIndex = Math.max(0, Math.min(this.selectedOption - 6, items.length - maxVisible));
      const visibleItems = items.slice(startIndex, startIndex + maxVisible);

      visibleItems.forEach((item, index) => {
        const actualIndex = startIndex + index;
        const y = startY + index * lineHeight;

        if (actualIndex === this.selectedOption) {
          ctx.fillStyle = '#ffaa00';
        } else {
          ctx.fillStyle = '#fff';
        }

        ctx.font = '14px monospace';
        ctx.textAlign = 'left';
        
        const prefix = actualIndex === this.selectedOption ? '> ' : '  ';
        ctx.fillText(`${prefix}${item.name}`, 50, y);
        
        ctx.textAlign = 'right';
        ctx.fillText(`${item.value}g`, ctx.canvas.width - 50, y);
      });

      // Show item details for selected item
      if (this.selectedOption < items.length) {
        const selectedItem = items[this.selectedOption];
        const detailY = 450;
        
        ctx.fillStyle = '#aaa';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Type: ${selectedItem.type}`, 50, detailY);
        ctx.fillText(`Weight: ${selectedItem.weight}`, 50, detailY + 15);
        ctx.fillText(`Value: ${selectedItem.value} gold`, 50, detailY + 30);
        
        if (selectedItem.enchantment !== 0) {
          ctx.fillText(`Enchantment: ${selectedItem.enchantment > 0 ? '+' : ''}${selectedItem.enchantment}`, 200, detailY);
        }
        
        if (selectedItem.classRestrictions && selectedItem.classRestrictions.length > 0) {
          ctx.fillText(`Classes: ${selectedItem.classRestrictions.join(', ')}`, 200, detailY + 15);
        }
      }
    }

    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      'UP/DOWN to select, ENTER to buy, ESC to go back',
      ctx.canvas.width / 2,
      ctx.canvas.height - 20
    );
  }

  private renderCharacterSelection(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT CHARACTER TO RECEIVE ITEM', ctx.canvas.width / 2, 50);

    if (this.selectedItem) {
      ctx.font = '16px monospace';
      ctx.fillStyle = '#ffaa00';
      ctx.fillText(`Purchasing: ${this.selectedItem.name} (${this.selectedItem.value}g)`, ctx.canvas.width / 2, 80);
    }

    const totalGold = this.gameState.party.getTotalGold();
    ctx.font = '14px monospace';
    ctx.fillText(`Party Gold: ${totalGold}`, ctx.canvas.width / 2, 105);

    const startY = 140;
    const lineHeight = 40;

    this.gameState.party.characters.forEach((character: Character, index: number) => {
      const y = startY + index * lineHeight;

      if (index === this.selectedCharacterIndex) {
        ctx.fillStyle = '#ffaa00';
      } else {
        ctx.fillStyle = '#fff';
      }

      ctx.font = '16px monospace';
      ctx.textAlign = 'left';
      
      const prefix = index === this.selectedCharacterIndex ? '> ' : '  ';
      const statusText = character.isDead ? ' (DEAD)' : '';
      const inventoryText = ` (${character.inventory.length}/20)`;
      
      ctx.fillText(`${prefix}${character.name} - ${character.class}${statusText}${inventoryText}`, 50, y);
      
      ctx.font = '12px monospace';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`Gold: ${character.gold}`, 50, y + 15);
    });

    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      'UP/DOWN to select, ENTER to confirm purchase, ESC to cancel',
      ctx.canvas.width / 2,
      ctx.canvas.height - 20
    );
  }

  private handleMainMenuInput(key: string): boolean {
    const nav = GameUtilities.handleMenuNavigation(key, this.selectedOption, this.menuOptions.length - 1);
    if (nav.handled) {
      this.selectedOption = nav.newIndex;
      return true;
    }

    const action = GameUtilities.isActionKey(key);
    if (action === 'confirm') {
      this.selectMainMenuOption();
      return true;
    } else if (action === 'cancel') {
      this.sceneManager.switchTo('town');
      return true;
    }
    
    return false;
  }

  private handleCategoryInput(key: string): boolean {
    const nav = GameUtilities.handleMenuNavigation(key, this.selectedOption, this.categoryOptions.length - 1);
    if (nav.handled) {
      this.selectedOption = nav.newIndex;
      return true;
    }

    const action = GameUtilities.isActionKey(key);
    if (action === 'confirm') {
      this.selectedCategory = this.categoryOptions[this.selectedOption].key;
      this.currentState = 'buying_items';
      this.selectedOption = 0;
      return true;
    } else if (action === 'cancel') {
      this.currentState = 'main_menu';
      this.selectedOption = 0;
      return true;
    }
    
    return false;
  }

  private handleItemListInput(key: string): boolean {
    const items = this.shopInventory.categories[this.selectedCategory];
    
    switch (key) {
      case 'arrowup':
      case 'w':
        this.selectedOption = Math.max(0, this.selectedOption - 1);
        return true;

      case 'arrowdown':
      case 's':
        this.selectedOption = Math.min(items.length - 1, this.selectedOption + 1);
        return true;

      case 'enter':
      case ' ':
        if (items.length > 0 && this.selectedOption < items.length) {
          this.selectedItem = items[this.selectedOption];
          this.currentState = 'buying_character_select';
          this.selectedCharacterIndex = 0;
        }
        return true;

      case 'escape':
        this.currentState = 'buying_category';
        this.selectedOption = this.categoryOptions.findIndex(c => c.key === this.selectedCategory);
        return true;
    }
    return false;
  }

  private handleCharacterSelectInput(key: string): boolean {
    switch (key) {
      case 'arrowup':
      case 'w':
        this.selectedCharacterIndex = Math.max(0, this.selectedCharacterIndex - 1);
        return true;

      case 'arrowdown':
      case 's':
        this.selectedCharacterIndex = Math.min(this.gameState.party.characters.length - 1, this.selectedCharacterIndex + 1);
        return true;

      case 'enter':
      case ' ':
        this.attemptPurchase();
        return true;

      case 'escape':
        this.currentState = 'buying_items';
        this.selectedItem = null;
        return true;
    }
    return false;
  }

  private selectMainMenuOption(): void {
    switch (this.selectedOption) {
      case 0: // Buy Items
        this.currentState = 'buying_category';
        this.selectedOption = 0;
        break;
        
      case 1: // Sell Items
        this.currentState = 'selling_character_select';
        this.selectedCharacterIndex = 0;
        break;
        
      case 2: // Identify Items
        DebugLogger.info('ShopScene', 'Identify Items not yet implemented');
        break;
        
      case 3: // Remove Curses
        DebugLogger.info('ShopScene', 'Remove Curses not yet implemented');
        break;
        
      case 4: // Leave Shop
        this.sceneManager.switchTo('town');
        break;
    }
  }

  private attemptPurchase(): void {
    if (!this.selectedItem) return;

    const character = this.gameState.party.characters[this.selectedCharacterIndex];
    const result = ShopSystem.buyItem(this.gameState.party, this.selectedItem, character);

    // Add message to game log
    this.gameState.messageLog.addSystemMessage(result.message);

    if (result.success) {
      // Return to item list after successful purchase
      this.currentState = 'buying_items';
      this.selectedItem = null;
      
      // Update shop inventory if needed (for now, items are unlimited)
      this.shopInventory = ShopSystem.getShopInventory();
    }
    // If purchase failed, stay on character selection screen to show the error message
  }

  private renderSellingCharacterSelection(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT CHARACTER TO SELL FROM', ctx.canvas.width / 2, 50);

    const totalGold = this.gameState.party.getTotalGold();
    ctx.font = '14px monospace';
    ctx.fillStyle = '#ffaa00';
    ctx.fillText(`Party Gold: ${totalGold}`, ctx.canvas.width / 2, 80);

    const startY = 120;
    const lineHeight = 50;

    this.gameState.party.characters.forEach((character: Character, index: number) => {
      const y = startY + index * lineHeight;

      if (index === this.selectedCharacterIndex) {
        ctx.fillStyle = '#ffaa00';
      } else {
        ctx.fillStyle = '#fff';
      }

      ctx.font = '16px monospace';
      ctx.textAlign = 'left';
      
      const prefix = index === this.selectedCharacterIndex ? '> ' : '  ';
      const statusText = character.isDead ? ' (DEAD)' : '';
      const itemCount = character.inventory.length;
      const sellableItems = character.inventory.filter(item => !item.equipped).length;
      
      ctx.fillText(`${prefix}${character.name} - ${character.class}${statusText}`, 50, y);
      
      ctx.font = '12px monospace';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`Items: ${itemCount} (${sellableItems} sellable)`, 50, y + 15);
      ctx.fillText(`Gold: ${character.gold}`, 50, y + 30);
    });

    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      'UP/DOWN to select, ENTER to view items, ESC to go back',
      ctx.canvas.width / 2,
      ctx.canvas.height - 20
    );
  }

  private renderSellingItemList(ctx: CanvasRenderingContext2D): void {
    if (!this.selectedSellingCharacter) return;

    const sellableItems = this.selectedSellingCharacter.inventory.filter(item => !item.equipped);

    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.selectedSellingCharacter.name.toUpperCase()}'S ITEMS`, ctx.canvas.width / 2, 50);

    const totalGold = this.gameState.party.getTotalGold();
    ctx.font = '14px monospace';
    ctx.fillStyle = '#ffaa00';
    ctx.fillText(`Party Gold: ${totalGold}`, ctx.canvas.width / 2, 75);

    if (sellableItems.length === 0) {
      ctx.fillStyle = '#aaa';
      ctx.font = '16px monospace';
      ctx.fillText('No sellable items (equipped items cannot be sold)', ctx.canvas.width / 2, 200);
    } else {
      const startY = 120;
      const lineHeight = 30;
      const maxVisible = 12;
      const startIndex = Math.max(0, Math.min(this.selectedOption - 6, sellableItems.length - maxVisible));
      const visibleItems = sellableItems.slice(startIndex, startIndex + maxVisible);

      visibleItems.forEach((item, index) => {
        const actualIndex = startIndex + index;
        const y = startY + index * lineHeight;

        if (actualIndex === this.selectedOption) {
          ctx.fillStyle = '#ffaa00';
        } else {
          ctx.fillStyle = '#fff';
        }

        ctx.font = '14px monospace';
        ctx.textAlign = 'left';
        
        const prefix = actualIndex === this.selectedOption ? '> ' : '  ';
        const sellPrice = Math.floor(item.value * 0.5); // 50% of item value
        ctx.fillText(`${prefix}${item.name}`, 50, y);
        
        ctx.textAlign = 'right';
        ctx.fillText(`${sellPrice}g`, ctx.canvas.width - 50, y);
      });

      // Show item details for selected item
      if (this.selectedOption < sellableItems.length) {
        const selectedItem = sellableItems[this.selectedOption];
        const detailY = 450;
        const sellPrice = Math.floor(selectedItem.value * 0.5);
        
        ctx.fillStyle = '#aaa';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Type: ${selectedItem.type}`, 50, detailY);
        ctx.fillText(`Weight: ${selectedItem.weight}`, 50, detailY + 15);
        ctx.fillText(`Original Value: ${selectedItem.value}g`, 50, detailY + 30);
        ctx.fillText(`Sell Price: ${sellPrice}g`, 50, detailY + 45);
        
        if (selectedItem.enchantment !== 0) {
          ctx.fillText(`Enchantment: ${selectedItem.enchantment > 0 ? '+' : ''}${selectedItem.enchantment}`, 250, detailY);
        }
        
        if (selectedItem.cursed) {
          ctx.fillStyle = '#ff6666';
          ctx.fillText('CURSED', 250, detailY + 15);
        }
      }
    }

    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      'UP/DOWN to select, ENTER to sell, ESC to go back',
      ctx.canvas.width / 2,
      ctx.canvas.height - 20
    );
  }

  private renderSellingConfirmation(ctx: CanvasRenderingContext2D): void {
    if (!this.selectedItem || !this.selectedSellingCharacter) return;

    const sellPrice = Math.floor(this.selectedItem.value * 0.5);

    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CONFIRM SALE', ctx.canvas.width / 2, 80);

    ctx.font = '16px monospace';
    ctx.fillStyle = '#ffaa00';
    ctx.fillText(`Selling: ${this.selectedItem.name}`, ctx.canvas.width / 2, 130);
    ctx.fillText(`From: ${this.selectedSellingCharacter.name}`, ctx.canvas.width / 2, 160);
    ctx.fillText(`Sale Price: ${sellPrice} gold`, ctx.canvas.width / 2, 190);

    ctx.fillStyle = '#aaa';
    ctx.font = '14px monospace';
    ctx.fillText('The gold will be distributed among all party members', ctx.canvas.width / 2, 230);

    const currentGold = this.gameState.party.getTotalGold();
    const newGold = currentGold + sellPrice;
    ctx.fillStyle = '#fff';
    ctx.fillText(`Current Party Gold: ${currentGold}`, ctx.canvas.width / 2, 280);
    ctx.fillText(`After Sale: ${newGold}`, ctx.canvas.width / 2, 300);

    // Show confirmation options
    const confirmY = 360;
    const options = ['Confirm Sale', 'Cancel'];
    
    options.forEach((option, index) => {
      const y = confirmY + index * 40;

      if (index === this.selectedOption) {
        ctx.fillStyle = '#ffaa00';
        ctx.fillText(`> ${option} <`, ctx.canvas.width / 2, y);
      } else {
        ctx.fillStyle = '#fff';
        ctx.fillText(option, ctx.canvas.width / 2, y);
      }
    });

    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      'UP/DOWN to select, ENTER to confirm, ESC to cancel',
      ctx.canvas.width / 2,
      ctx.canvas.height - 20
    );
  }

  private handleSellingCharacterSelectInput(key: string): boolean {
    switch (key) {
      case 'arrowup':
      case 'w':
        this.selectedCharacterIndex = Math.max(0, this.selectedCharacterIndex - 1);
        return true;

      case 'arrowdown':
      case 's':
        this.selectedCharacterIndex = Math.min(this.gameState.party.characters.length - 1, this.selectedCharacterIndex + 1);
        return true;

      case 'enter':
      case ' ':
        this.selectedSellingCharacter = this.gameState.party.characters[this.selectedCharacterIndex];
        this.currentState = 'selling_items';
        this.selectedOption = 0;
        return true;

      case 'escape':
        this.currentState = 'main_menu';
        this.selectedOption = 1; // Return to "Sell Items" option
        return true;
    }
    return false;
  }

  private handleSellingItemListInput(key: string): boolean {
    if (!this.selectedSellingCharacter) return false;
    
    const sellableItems = this.selectedSellingCharacter.inventory.filter(item => !item.equipped);
    
    switch (key) {
      case 'arrowup':
      case 'w':
        this.selectedOption = Math.max(0, this.selectedOption - 1);
        return true;

      case 'arrowdown':
      case 's':
        this.selectedOption = Math.min(sellableItems.length - 1, this.selectedOption + 1);
        return true;

      case 'enter':
      case ' ':
        if (sellableItems.length > 0 && this.selectedOption < sellableItems.length) {
          this.selectedItem = sellableItems[this.selectedOption];
          this.currentState = 'selling_confirmation';
          this.selectedOption = 0;
        }
        return true;

      case 'escape':
        this.currentState = 'selling_character_select';
        this.selectedOption = this.gameState.party.characters.indexOf(this.selectedSellingCharacter);
        this.selectedSellingCharacter = null;
        return true;
    }
    return false;
  }

  private handleSellingConfirmationInput(key: string): boolean {
    switch (key) {
      case 'arrowup':
      case 'w':
        this.selectedOption = Math.max(0, this.selectedOption - 1);
        return true;

      case 'arrowdown':
      case 's':
        this.selectedOption = Math.min(1, this.selectedOption + 1); // 0 = Confirm, 1 = Cancel
        return true;

      case 'enter':
      case ' ':
        if (this.selectedOption === 0) {
          this.executeSale();
        } else {
          this.cancelSale();
        }
        return true;

      case 'escape':
        this.cancelSale();
        return true;
    }
    return false;
  }

  private executeSale(): void {
    if (!this.selectedItem || !this.selectedSellingCharacter) return;

    const result = ShopSystem.sellItem(this.gameState.party, this.selectedItem, this.selectedSellingCharacter);

    // Add message to game log
    this.gameState.messageLog.addSystemMessage(result.message);

    if (result.success) {
      // Return to selling character selection after successful sale
      this.currentState = 'selling_character_select';
      this.selectedItem = null;
      this.selectedSellingCharacter = null;
      this.selectedOption = 0;
    } else {
      // If sale failed, go back to item list
      this.currentState = 'selling_items';
      this.selectedItem = null;
      this.selectedOption = 0;
    }
  }

  private cancelSale(): void {
    this.currentState = 'selling_items';
    this.selectedItem = null;
    this.selectedOption = 0;
  }
}