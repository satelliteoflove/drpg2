import { GameState, Item } from '../../types/GameTypes';
import { Character } from '../../entities/Character';
import { ShopInventory } from '../ShopSystem';
import { StatusPanel } from '../../ui/StatusPanel';

export type ShopState =
  | 'main_menu'
  | 'buying_category'
  | 'buying_items'
  | 'buying_character_select'
  | 'selling_character_select'
  | 'selling_items'
  | 'selling_confirmation'
  | 'pooling_gold';

export interface ShopRenderContext {
  state: ShopState;
  selectedOption: number;
  selectedCategory: keyof ShopInventory['categories'];
  selectedItem: Item | null;
  selectedCharacterIndex: number;
  selectedSellingCharacter: Character | null;
  shopInventory: ShopInventory;
  menuOptions: string[];
  categoryOptions: Array<{ key: keyof ShopInventory['categories']; name: string }>;
}

export class ShopUIRenderer {
  private gameState: GameState;
  private messageLog: any;
  private statusPanel: StatusPanel | null = null;
  private canvas: HTMLCanvasElement | null = null;

  constructor(gameState: GameState, messageLog: any) {
    this.gameState = gameState;
    this.messageLog = messageLog;
  }

  private drawPanel(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
  }

  public render(ctx: CanvasRenderingContext2D, context: ShopRenderContext): void {
    if (!this.canvas) {
      this.canvas = ctx.canvas;
      this.statusPanel = new StatusPanel(ctx.canvas, 10, 80, 240, 480);
    }

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this.renderShopHeader(ctx);

    if (this.statusPanel) {
      this.statusPanel.render(this.gameState.party, ctx);
    }

    this.renderMainArea(ctx, context);
    this.renderActionMenu(ctx, context);

    if (this.messageLog) {
      this.messageLog.render(ctx);
    }
  }

  private renderShopHeader(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(10, 10, ctx.canvas.width - 20, 60);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, ctx.canvas.width - 20, 60);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BOLTAC\'S TRADING POST', ctx.canvas.width / 2, 45);

    const pooledGold = this.gameState.party.pooledGold || 0;
    const partyGold = this.gameState.party.characters.reduce((sum: number, char: Character) => sum + char.gold, 0);

    ctx.fillStyle = '#ffa500';
    ctx.font = '14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Pooled: ${pooledGold}g | Party: ${partyGold}g`, ctx.canvas.width - 30, 45);
  }

  private renderMainArea(ctx: CanvasRenderingContext2D, context: ShopRenderContext): void {
    const mainX = 260;
    const mainY = 80;
    const mainWidth = 500;
    const mainHeight = 480;

    this.drawPanel(ctx, mainX, mainY, mainWidth, mainHeight);

    switch (context.state) {
      case 'main_menu':
        this.renderMainMenu(ctx, mainX, mainY, mainWidth, mainHeight, context);
        break;
      case 'buying_category':
        this.renderCategorySelection(ctx, mainX, mainY, mainWidth, mainHeight, context);
        break;
      case 'buying_items':
        this.renderItemList(ctx, mainX, mainY, mainWidth, mainHeight, context);
        break;
      case 'buying_character_select':
        this.renderCharacterSelection(ctx, mainX, mainY, mainWidth, mainHeight, context);
        break;
      case 'selling_character_select':
        this.renderSellingCharacterSelection(ctx, mainX, mainY, mainWidth, mainHeight, context);
        break;
      case 'selling_items':
        this.renderSellingItemList(ctx, mainX, mainY, mainWidth, mainHeight, context);
        break;
      case 'selling_confirmation':
        this.renderSellingConfirmation(ctx, mainX, mainY, mainWidth, mainHeight, context);
        break;
      case 'pooling_gold':
        this.renderPoolingGold(ctx, mainX, mainY, mainWidth, mainHeight, context);
        break;
    }
  }

  private renderMainMenu(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, context: ShopRenderContext): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Welcome to Boltac\'s Trading Post', x + width / 2, y + 60);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Buy and sell items, manage gold', x + width / 2, y + 90);

    ctx.textAlign = 'left';
    let yPos = y + 140;

    context.menuOptions.forEach((option, index) => {
      const isSelected = index === context.selectedOption;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 40, yPos - 15, width - 80, 30);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 16px monospace' : '16px monospace';

      if (isSelected) {
        ctx.fillText('>', x + 50, yPos);
      }

      ctx.fillText(option, x + 70, yPos);

      yPos += 40;
    });
  }

  private renderCategorySelection(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, context: ShopRenderContext): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT CATEGORY', x + width / 2, y + 40);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Choose what to buy', x + width / 2, y + 70);

    ctx.textAlign = 'left';
    let yPos = y + 120;

    context.categoryOptions.forEach((category, index) => {
      const isSelected = index === context.selectedOption;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 40, yPos - 15, width - 80, 30);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 16px monospace' : '16px monospace';

      if (isSelected) {
        ctx.fillText('>', x + 50, yPos);
      }

      ctx.fillText(category.name, x + 70, yPos);

      yPos += 40;
    });
  }

  private renderItemList(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, context: ShopRenderContext): void {
    const items = context.shopInventory.categories[context.selectedCategory] || [];

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${context.selectedCategory.toUpperCase()} FOR SALE`, x + width / 2, y + 40);

    if (items.length === 0) {
      ctx.fillStyle = '#999';
      ctx.font = '14px monospace';
      ctx.fillText('No items available in this category', x + width / 2, y + 150);
      return;
    }

    const startY = y + 80;
    const itemHeight = 30;
    const maxItems = 10;

    items.slice(0, maxItems).forEach((item, index) => {
      const itemY = startY + index * itemHeight;
      const isSelected = index === context.selectedOption;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 20, itemY - 18, width - 40, 28);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 14px monospace' : '14px monospace';
      ctx.textAlign = 'left';

      if (isSelected) {
        ctx.fillText('>', x + 25, itemY);
      }

      const itemName = item.identified ? item.name : item.unidentifiedName || '?Item';
      ctx.fillText(itemName, x + 45, itemY);

      ctx.fillStyle = '#ffa500';
      ctx.textAlign = 'right';
      ctx.fillText(`${item.value}g`, x + width - 30, itemY);

      if (isSelected) {
        this.renderItemDetails(ctx, item, x, y, width, height);
      }
    });
  }

  private renderItemDetails(ctx: CanvasRenderingContext2D, item: Item, x: number, y: number, width: number, height: number): void {
    const detailY = y + height - 100;

    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 20, detailY, width - 40, 90);

    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';

    if (!item.identified) {
      ctx.fillStyle = '#999';
      ctx.fillText('Unidentified - properties unknown', x + 30, detailY + 25);
      return;
    }

    const details: string[] = [];
    if (item.type === 'weapon') {
      details.push('Type: Weapon');
    }
    if (item.type === 'armor') {
      details.push('Type: Armor');
    }
    if (item.enchantment) {
      details.push(`Enchantment: ${item.enchantment > 0 ? '+' : ''}${item.enchantment}`);
    }
    if (item.cursed) {
      ctx.fillStyle = '#f66';
      details.push('CURSED');
    }

    details.forEach((detail, index) => {
      ctx.fillText(detail, x + 30, detailY + 25 + index * 18);
    });
  }

  private renderCharacterSelection(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, context: ShopRenderContext): void {
    const characters = this.gameState.party.characters;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WHO WILL BUY THIS ITEM?', x + width / 2, y + 40);

    if (context.selectedItem) {
      ctx.font = '14px monospace';
      ctx.fillStyle = '#ffa500';
      const itemName = context.selectedItem.identified
        ? context.selectedItem.name
        : context.selectedItem.unidentifiedName || '?Item';
      ctx.fillText(`${itemName} - ${context.selectedItem.value}g`, x + width / 2, y + 70);
    }

    ctx.textAlign = 'left';
    let yPos = y + 110;

    characters.forEach((character: Character, index: number) => {
      const isSelected = index === context.selectedCharacterIndex;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 40, yPos - 15, width - 80, 45);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 14px monospace' : '14px monospace';

      if (isSelected) {
        ctx.fillText('>', x + 50, yPos);
      }

      ctx.fillText(`${character.name} (${character.class})`, x + 70, yPos);

      ctx.font = '12px monospace';
      ctx.fillStyle = character.gold >= (context.selectedItem?.value || 0) ? '#0f0' : '#f66';
      ctx.fillText(`Gold: ${character.gold}g`, x + 70, yPos + 18);

      ctx.fillStyle = '#999';
      ctx.fillText(`Inv: ${character.inventory.length}/10`, x + 220, yPos + 18);

      yPos += 55;
    });
  }

  private renderSellingCharacterSelection(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, context: ShopRenderContext): void {
    const characters = this.gameState.party.characters;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WHO IS SELLING ITEMS?', x + width / 2, y + 40);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Choose a character to sell items', x + width / 2, y + 70);

    ctx.textAlign = 'left';
    let yPos = y + 110;

    characters.forEach((character: Character, index: number) => {
      const isSelected = index === context.selectedOption;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 40, yPos - 15, width - 80, 50);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 14px monospace' : '14px monospace';

      if (isSelected) {
        ctx.fillText('>', x + 50, yPos);
      }

      ctx.fillText(`${character.name} (${character.class})`, x + 70, yPos);

      ctx.font = '12px monospace';
      ctx.fillStyle = '#999';
      const itemCount = character.inventory.length;
      ctx.fillText(`Items: ${itemCount}`, x + 70, yPos + 18);

      if (itemCount > 0) {
        const totalValue = character.inventory.reduce((sum: number, item: Item) => sum + Math.floor(item.value * 0.5), 0);
        ctx.fillStyle = '#ffa500';
        ctx.fillText(`Est. value: ${totalValue}g`, x + 200, yPos + 18);
      }

      yPos += 60;
    });
  }

  private renderSellingItemList(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, context: ShopRenderContext): void {
    if (!context.selectedSellingCharacter) return;

    const items = context.selectedSellingCharacter.inventory;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${context.selectedSellingCharacter.name}'s Inventory`, x + width / 2, y + 40);

    if (items.length === 0) {
      ctx.fillStyle = '#999';
      ctx.font = '14px monospace';
      ctx.fillText('No items to sell', x + width / 2, y + 150);
      return;
    }

    const startY = y + 80;
    const itemHeight = 30;

    items.forEach((item, index) => {
      const itemY = startY + index * itemHeight;
      const isSelected = index === context.selectedOption;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 20, itemY - 18, width - 40, 28);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 14px monospace' : '14px monospace';
      ctx.textAlign = 'left';

      if (item.equipped) {
        ctx.fillStyle = '#0f0';
        ctx.font = '10px monospace';
        ctx.fillText('[E]', x + 25, itemY);
        ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
        ctx.font = isSelected ? 'bold 14px monospace' : '14px monospace';
      }

      if (isSelected) {
        ctx.fillText('>', x + 35, itemY);
      }

      const itemName = item.identified ? item.name : item.unidentifiedName || '?Item';
      ctx.fillText(itemName, x + (item.equipped ? 55 : 55), itemY);

      const sellPrice = Math.floor(item.value * 0.5);
      ctx.fillStyle = '#ffa500';
      ctx.textAlign = 'right';
      ctx.fillText(`${sellPrice}g`, x + width - 30, itemY);
    });
  }

  private renderSellingConfirmation(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, context: ShopRenderContext): void {
    if (!context.selectedItem || !context.selectedSellingCharacter) return;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CONFIRM SALE', x + width / 2, y + 60);

    ctx.font = '16px monospace';
    const itemName = context.selectedItem.identified
      ? context.selectedItem.name
      : context.selectedItem.unidentifiedName || '?Item';

    ctx.fillText(`Sell ${itemName}`, x + width / 2, y + 120);

    const sellPrice = Math.floor(context.selectedItem.value * 0.5);
    ctx.fillStyle = '#ffa500';
    ctx.fillText(`for ${sellPrice} gold?`, x + width / 2, y + 160);

    const options = ['Confirm', 'Cancel'];
    let yPos = y + 220;

    options.forEach((option, index) => {
      const isSelected = index === context.selectedOption;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 150, yPos - 20, 200, 35);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 16px monospace' : '16px monospace';
      ctx.textAlign = 'center';

      if (isSelected) {
        ctx.textAlign = 'left';
        ctx.fillText('>', x + 160, yPos);
        ctx.textAlign = 'center';
      }

      ctx.fillText(option, x + width / 2, yPos);

      yPos += 45;
    });
  }

  private renderPoolingGold(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, context: ShopRenderContext): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('POOL PARTY GOLD', x + width / 2, y + 40);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Combine all party gold into shared pool', x + width / 2, y + 70);

    const characters = this.gameState.party.characters;
    let totalGold = 0;

    ctx.textAlign = 'left';
    let yPos = y + 120;

    characters.forEach((character: Character) => {
      ctx.fillStyle = '#fff';
      ctx.font = '14px monospace';
      ctx.fillText(`${character.name}:`, x + 60, yPos);
      ctx.fillStyle = '#ffa500';
      ctx.textAlign = 'right';
      ctx.fillText(`${character.gold}g`, x + width - 60, yPos);
      ctx.textAlign = 'left';
      totalGold += character.gold;
      yPos += 28;
    });

    yPos += 10;
    ctx.strokeStyle = '#666';
    ctx.beginPath();
    ctx.moveTo(x + 60, yPos);
    ctx.lineTo(x + width - 60, yPos);
    ctx.stroke();

    yPos += 25;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Total:', x + 60, yPos);
    ctx.fillStyle = '#ffa500';
    ctx.textAlign = 'right';
    ctx.fillText(`${totalGold}g`, x + width - 60, yPos);

    const options = ['Confirm Pool', 'Cancel'];
    yPos = y + 350;

    options.forEach((option, index) => {
      const isSelected = index === context.selectedOption;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 120, yPos - 20, 260, 35);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 16px monospace' : '16px monospace';
      ctx.textAlign = 'center';

      if (isSelected) {
        ctx.textAlign = 'left';
        ctx.fillText('>', x + 130, yPos);
        ctx.textAlign = 'center';
      }

      ctx.fillText(option, x + width / 2, yPos);

      yPos += 45;
    });
  }

  private renderActionMenu(ctx: CanvasRenderingContext2D, context: ShopRenderContext): void {
    const menuX = 770;
    const menuY = 80;
    const menuWidth = 240;
    const menuHeight = 480;

    this.drawPanel(ctx, menuX, menuY, menuWidth, menuHeight);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SHOP SERVICES', menuX + menuWidth / 2, menuY + 25);

    ctx.fillStyle = '#aaa';
    ctx.font = '11px monospace';

    const controlText = this.getControlText(context.state);
    const lines = controlText.split('\n');
    let yPos = menuY + menuHeight - 15 - (lines.length - 1) * 15;

    lines.forEach(line => {
      ctx.fillText(line, menuX + menuWidth / 2, yPos);
      yPos += 15;
    });
  }

  private getControlText(state: ShopState): string {
    switch (state) {
      case 'main_menu':
        return 'UP/DOWN: Select\nENTER: Choose\nESC: Leave Shop';
      case 'buying_category':
        return 'UP/DOWN: Select\nENTER: Choose\nESC: Back';
      case 'buying_items':
        return 'UP/DOWN: Select\nENTER: Buy Item\nESC: Back';
      case 'buying_character_select':
        return 'UP/DOWN: Select\nENTER: Confirm\nESC: Cancel';
      case 'selling_character_select':
        return 'UP/DOWN: Select\nENTER: Choose\nESC: Back';
      case 'selling_items':
        return 'UP/DOWN: Select\nENTER: Sell Item\nESC: Back';
      case 'selling_confirmation':
        return 'UP/DOWN: Select\nENTER: Confirm\nESC: Cancel';
      case 'pooling_gold':
        return 'UP/DOWN: Select\nENTER: Confirm\nESC: Cancel';
      default:
        return 'ESC: Back';
    }
  }

}