import { GameState, Item } from '../../types/GameTypes';
import { Character } from '../../entities/Character';
import { ShopInventory } from '../ShopSystem';

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

  constructor(gameState: GameState, _messageLog: any) {
    this.gameState = gameState;
  }

  private drawPanel(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
  }

  public render(ctx: CanvasRenderingContext2D, context: ShopRenderContext): void {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this.renderShopHeader(ctx);
    this.renderGoldDisplay(ctx);

    switch (context.state) {
      case 'main_menu':
        this.renderMainMenu(ctx, context);
        break;
      case 'buying_category':
        this.renderCategorySelection(ctx, context);
        break;
      case 'buying_items':
        this.renderItemList(ctx, context);
        break;
      case 'buying_character_select':
        this.renderCharacterSelection(ctx, context);
        break;
      case 'selling_character_select':
        this.renderSellingCharacterSelection(ctx, context);
        break;
      case 'selling_items':
        this.renderSellingItemList(ctx, context);
        break;
      case 'selling_confirmation':
        this.renderSellingConfirmation(ctx, context);
        break;
      case 'pooling_gold':
        this.renderPoolingGold(ctx, context);
        break;
    }

    this.renderControls(ctx, context.state);
  }

  private renderShopHeader(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SHOP', ctx.canvas.width / 2, 40);

    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, ctx.canvas.width - 20, 50);
  }

  private renderGoldDisplay(ctx: CanvasRenderingContext2D): void {
    const pooledGold = this.gameState.party.pooledGold || 0;
    const partyGold = this.gameState.party.getCharacters().reduce((sum: number, char: Character) => sum + char.gold, 0);

    ctx.fillStyle = '#ffa500';
    ctx.font = '14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Pooled: ${pooledGold}g | Party: ${partyGold}g`, ctx.canvas.width - 20, 40);
  }

  private renderMainMenu(ctx: CanvasRenderingContext2D, context: ShopRenderContext): void {
    const menuY = 120;
    const menuHeight = 280;

    this.drawPanel(ctx, 100, menuY, 600, menuHeight);

    ctx.fillStyle = '#fff';
    ctx.font = '18px monospace';
    ctx.textAlign = 'left';

    context.menuOptions.forEach((option, index) => {
      const y = menuY + 50 + index * 40;
      const isSelected = index === context.selectedOption;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(120, y - 25, 560, 35);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 18px monospace' : '18px monospace';
      ctx.fillText(option, 140, y);

      if (isSelected) {
        ctx.fillText('>', 125, y);
      }
    });

    this.renderPartyStatus(ctx);
  }

  private renderCategorySelection(ctx: CanvasRenderingContext2D, context: ShopRenderContext): void {
    this.drawPanel(ctx, 100, 120, 600, 350);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Select Category', ctx.canvas.width / 2, 160);

    context.categoryOptions.forEach((category, index) => {
      const y = 200 + index * 40;
      const isSelected = index === context.selectedOption;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(120, y - 25, 560, 35);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 18px monospace' : '18px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(category.name, 140, y);

      if (isSelected) {
        ctx.fillText('>', 125, y);
      }
    });
  }

  private renderItemList(ctx: CanvasRenderingContext2D, context: ShopRenderContext): void {
    const items = context.shopInventory.categories[context.selectedCategory] || [];

    this.drawPanel(ctx, 50, 100, 700, 400);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${context.selectedCategory.toUpperCase()} FOR SALE`, ctx.canvas.width / 2, 140);

    if (items.length === 0) {
      ctx.fillStyle = '#999';
      ctx.font = '16px monospace';
      ctx.fillText('No items available in this category', ctx.canvas.width / 2, 250);
      return;
    }

    const startY = 180;
    const itemHeight = 35;

    items.forEach((item, index) => {
      const y = startY + index * itemHeight;
      const isSelected = index === context.selectedOption;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(70, y - 20, 660, 30);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 16px monospace' : '16px monospace';
      ctx.textAlign = 'left';

      const itemName = item.identified ? item.name : item.unidentifiedName || '?Item';
      ctx.fillText(itemName, 90, y);

      ctx.fillStyle = '#ffa500';
      ctx.textAlign = 'right';
      ctx.fillText(`${item.value}g`, 700, y);

      if (isSelected) {
        ctx.fillStyle = '#ffa500';
        ctx.textAlign = 'left';
        ctx.fillText('>', 75, y);

        this.renderItemDetails(ctx, item);
      }
    });
  }

  private renderItemDetails(ctx: CanvasRenderingContext2D, item: Item): void {
    const detailY = 420;
    this.drawPanel(ctx, 50, detailY, 700, 120);

    ctx.fillStyle = '#fff';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';

    if (!item.identified) {
      ctx.fillStyle = '#999';
      ctx.fillText('Unidentified - properties unknown', 70, detailY + 30);
      return;
    }

    const details: string[] = [];
    if (item.type === 'weapon') {
      details.push('Weapon');
    }
    if (item.type === 'armor') {
      details.push('Armor');
    }
    if (item.enchantment) {
      details.push(`Enchantment: ${item.enchantment > 0 ? '+' : ''}${item.enchantment}`);
    }
    if (item.cursed) {
      ctx.fillStyle = '#f66';
      details.push('CURSED');
    }

    details.forEach((detail, index) => {
      ctx.fillText(detail, 70, detailY + 30 + index * 20);
    });
  }

  private renderCharacterSelection(ctx: CanvasRenderingContext2D, context: ShopRenderContext): void {
    const characters = this.gameState.party.getCharacters();

    this.drawPanel(ctx, 100, 120, 600, 400);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Who will buy this item?', ctx.canvas.width / 2, 160);

    if (context.selectedItem) {
      ctx.font = '16px monospace';
      ctx.fillStyle = '#ffa500';
      const itemName = context.selectedItem.identified
        ? context.selectedItem.name
        : context.selectedItem.unidentifiedName || '?Item';
      ctx.fillText(`${itemName} - ${context.selectedItem.value}g`, ctx.canvas.width / 2, 185);
    }

    characters.forEach((character: Character, index: number) => {
      const y = 220 + index * 50;
      const isSelected = index === context.selectedCharacterIndex;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(120, y - 25, 560, 45);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 16px monospace' : '16px monospace';
      ctx.textAlign = 'left';

      ctx.fillText(`${character.name} (${character.class})`, 140, y);

      ctx.font = '14px monospace';
      ctx.fillStyle = character.gold >= (context.selectedItem?.value || 0) ? '#0f0' : '#f66';
      ctx.fillText(`Gold: ${character.gold}g`, 140, y + 20);

      ctx.fillStyle = '#999';
      ctx.fillText(`Inv: ${character.inventory.length}/10`, 280, y + 20);

      if (isSelected) {
        ctx.fillStyle = '#ffa500';
        ctx.fillText('>', 125, y);
      }
    });
  }

  private renderSellingCharacterSelection(ctx: CanvasRenderingContext2D, context: ShopRenderContext): void {
    const characters = this.gameState.party.getCharacters();

    this.drawPanel(ctx, 100, 120, 600, 400);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Who is selling items?', ctx.canvas.width / 2, 160);

    characters.forEach((character: Character, index: number) => {
      const y = 200 + index * 60;
      const isSelected = index === context.selectedOption;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(120, y - 25, 560, 50);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 16px monospace' : '16px monospace';
      ctx.textAlign = 'left';

      ctx.fillText(`${character.name} (${character.class})`, 140, y);

      ctx.font = '14px monospace';
      ctx.fillStyle = '#999';
      const itemCount = character.inventory.length;
      ctx.fillText(`Items: ${itemCount}`, 140, y + 20);

      if (itemCount > 0) {
        const totalValue = character.inventory.reduce((sum: number, item: Item) => sum + Math.floor(item.value * 0.5), 0);
        ctx.fillStyle = '#ffa500';
        ctx.fillText(`Est. value: ${totalValue}g`, 280, y + 20);
      }

      if (isSelected) {
        ctx.fillStyle = '#ffa500';
        ctx.textAlign = 'left';
        ctx.fillText('>', 125, y);
      }
    });
  }

  private renderSellingItemList(ctx: CanvasRenderingContext2D, context: ShopRenderContext): void {
    if (!context.selectedSellingCharacter) return;

    const items = context.selectedSellingCharacter.inventory;

    this.drawPanel(ctx, 50, 100, 700, 450);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${context.selectedSellingCharacter.name}'s Inventory`, ctx.canvas.width / 2, 140);

    if (items.length === 0) {
      ctx.fillStyle = '#999';
      ctx.font = '16px monospace';
      ctx.fillText('No items to sell', ctx.canvas.width / 2, 250);
      return;
    }

    const startY = 180;
    const itemHeight = 35;

    items.forEach((item, index) => {
      const y = startY + index * itemHeight;
      const isSelected = index === context.selectedOption;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(70, y - 20, 660, 30);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 16px monospace' : '16px monospace';
      ctx.textAlign = 'left';

      const itemName = item.identified ? item.name : item.unidentifiedName || '?Item';
      ctx.fillText(itemName, 90, y);

      const sellPrice = Math.floor(item.value * 0.5);
      ctx.fillStyle = '#ffa500';
      ctx.textAlign = 'right';
      ctx.fillText(`${sellPrice}g`, 700, y);

      if (item.equipped) {
        ctx.fillStyle = '#0f0';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('[E]', 60, y);
      }

      if (isSelected) {
        ctx.fillStyle = '#ffa500';
        ctx.textAlign = 'left';
        ctx.fillText('>', 75, y);
      }
    });
  }

  private renderSellingConfirmation(ctx: CanvasRenderingContext2D, context: ShopRenderContext): void {
    if (!context.selectedItem || !context.selectedSellingCharacter) return;

    this.drawPanel(ctx, 150, 200, 500, 250);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Confirm Sale', ctx.canvas.width / 2, 240);

    ctx.font = '16px monospace';
    const itemName = context.selectedItem.identified
      ? context.selectedItem.name
      : context.selectedItem.unidentifiedName || '?Item';

    ctx.fillText(`Sell ${itemName}`, ctx.canvas.width / 2, 280);

    const sellPrice = Math.floor(context.selectedItem.value * 0.5);
    ctx.fillStyle = '#ffa500';
    ctx.fillText(`for ${sellPrice} gold?`, ctx.canvas.width / 2, 310);

    const options = ['Confirm', 'Cancel'];
    options.forEach((option, index) => {
      const y = 360 + index * 40;
      const isSelected = index === context.selectedOption;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(250, y - 20, 300, 35);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 18px monospace' : '18px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(option, ctx.canvas.width / 2, y);

      if (isSelected) {
        ctx.textAlign = 'left';
        ctx.fillText('>', 260, y);
      }
    });
  }

  private renderPoolingGold(ctx: CanvasRenderingContext2D, context: ShopRenderContext): void {
    this.drawPanel(ctx, 100, 150, 600, 350);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Pool Party Gold', ctx.canvas.width / 2, 190);

    ctx.font = '16px monospace';
    ctx.fillStyle = '#fff';

    const characters = this.gameState.party.getCharacters();
    let totalGold = 0;

    ctx.textAlign = 'left';
    characters.forEach((character: Character, index: number) => {
      const y = 240 + index * 30;
      ctx.fillStyle = '#fff';
      ctx.fillText(`${character.name}:`, 150, y);
      ctx.fillStyle = '#ffa500';
      ctx.textAlign = 'right';
      ctx.fillText(`${character.gold}g`, 550, y);
      ctx.textAlign = 'left';
      totalGold += character.gold;
    });

    ctx.strokeStyle = '#666';
    ctx.beginPath();
    ctx.moveTo(150, 380);
    ctx.lineTo(550, 380);
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Total:', 150, 410);
    ctx.fillStyle = '#ffa500';
    ctx.textAlign = 'right';
    ctx.fillText(`${totalGold}g`, 550, 410);

    const options = ['Confirm Pool', 'Cancel'];
    options.forEach((option, index) => {
      const y = 450 + index * 35;
      const isSelected = index === context.selectedOption;

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 16px monospace' : '16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(option, ctx.canvas.width / 2, y);
    });
  }

  private renderPartyStatus(ctx: CanvasRenderingContext2D): void {
    const party = this.gameState.party.getCharacters();
    const startY = 450;

    ctx.fillStyle = '#333';
    ctx.fillRect(50, startY - 10, 700, 120);

    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Party Status:', 60, startY + 10);

    party.forEach((character: Character, index: number) => {
      const x = 60 + (index % 3) * 240;
      const y = startY + 30 + Math.floor(index / 3) * 40;

      ctx.fillStyle = character.isDead ? '#666' : '#fff';
      ctx.font = '11px monospace';
      ctx.fillText(`${character.name} (${character.class})`, x, y);

      if (!character.isDead) {
        ctx.fillStyle = '#0f0';
        ctx.fillText(`HP: ${character.hp}/${character.maxHp}`, x, y + 15);
        ctx.fillStyle = '#ffa500';
        ctx.fillText(`Gold: ${character.gold}`, x + 100, y + 15);
      } else {
        ctx.fillStyle = '#f66';
        ctx.fillText('DEAD', x, y + 15);
      }
    });
  }

  private renderControls(ctx: CanvasRenderingContext2D, state: ShopState): void {
    const controls = this.getControlsForState(state);

    ctx.fillStyle = '#666';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(controls, ctx.canvas.width / 2, ctx.canvas.height - 10);
  }

  private getControlsForState(state: ShopState): string {
    switch (state) {
      case 'main_menu':
        return 'Arrow Keys: Navigate | Enter: Select | Escape: Leave Shop';
      case 'buying_category':
      case 'buying_items':
      case 'buying_character_select':
        return 'Arrow Keys: Navigate | Enter: Select | Escape: Back';
      case 'selling_character_select':
      case 'selling_items':
        return 'Arrow Keys: Navigate | Enter: Select | Escape: Cancel';
      case 'selling_confirmation':
        return 'Arrow Keys: Select | Enter: Confirm | Escape: Cancel';
      case 'pooling_gold':
        return 'Arrow Keys: Select | Enter: Confirm | Escape: Cancel';
      default:
        return 'Escape: Back';
    }
  }
}