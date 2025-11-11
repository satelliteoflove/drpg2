import { GameState, Item } from '../../types/GameTypes';
import { Character } from '../../entities/Character';
import { GAME_CONFIG } from '../../config/GameConstants';
import { DebugLogger } from '../../utils/DebugLogger';
import { MenuInputHandler } from '../../ui/components/MenuInputHandler';

export interface ItemPickupState {
  active: boolean;
  items: Item[];
  currentItemIndex: number;
  selectedCharacterIndex: number;
}

export class DungeonItemPickupUI {
  private gameState: GameState;
  private messageLog: any;
  private pickupState: ItemPickupState;

  constructor(gameState: GameState, messageLog: any) {
    this.gameState = gameState;
    this.messageLog = messageLog;
    this.pickupState = {
      active: false,
      items: [],
      currentItemIndex: 0,
      selectedCharacterIndex: 0,
    };
  }

  public startItemPickup(items: Item[]): void {
    if (!items || items.length === 0) {
      DebugLogger.warn('DungeonItemPickupUI', 'No items to pickup');
      return;
    }

    this.pickupState.active = true;
    this.pickupState.items = items;
    this.pickupState.currentItemIndex = 0;
    this.pickupState.selectedCharacterIndex = 0;

    const firstItem = items[0];
    this.messageLog?.addSystemMessage(
      `Found ${this.getItemDisplayName(firstItem)}. Who should take it?`
    );
  }

  public handleInput(key: string): boolean {
    if (!this.pickupState.active) return false;

    const aliveCharacters = this.gameState.party.getAliveCharacters();

    const menuState = MenuInputHandler.createMenuState(
      aliveCharacters.length,
      this.pickupState.selectedCharacterIndex
    );

    const action = MenuInputHandler.handleMenuInput(key, menuState, {
      onNavigate: (newIndex) => {
        this.pickupState.selectedCharacterIndex = newIndex;
      },
      onConfirm: () => {
        this.assignItemToCharacter(this.pickupState.selectedCharacterIndex);
      },
      onCancel: () => {
        this.discardCurrentItem();
      }
    });

    if (action.type !== 'none') {
      return true;
    }

    const num = parseInt(key);
    if (!isNaN(num) && num >= 1 && num <= aliveCharacters.length) {
      this.assignItemToCharacter(num - 1);
      return true;
    }

    if (key === 'l') {
      this.discardCurrentItem();
      return true;
    }

    return false;
  }

  public isActive(): boolean {
    return this.pickupState.active;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.pickupState.active) return;

    const aliveCharacters = this.gameState.party.getAliveCharacters();
    if (aliveCharacters.length === 0 || this.pickupState.items.length === 0) return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const windowX = 200;
    const windowY = 150;
    const windowWidth = 400;
    const windowHeight = 300;

    ctx.fillStyle = '#222';
    ctx.fillRect(windowX, windowY, windowWidth, windowHeight);
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 2;
    ctx.strokeRect(windowX, windowY, windowWidth, windowHeight);

    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    const currentItem = this.pickupState.items[this.pickupState.currentItemIndex];
    ctx.fillText('Select character to receive:', windowX + windowWidth / 2, windowY + 30);
    ctx.fillText(this.getItemDisplayName(currentItem), windowX + windowWidth / 2, windowY + 50);

    ctx.font = '12px monospace';
    ctx.fillText(
      `Item ${this.pickupState.currentItemIndex + 1} of ${this.pickupState.items.length}`,
      windowX + windowWidth / 2,
      windowY + 70
    );

    ctx.textAlign = 'left';
    ctx.font = '14px monospace';
    let listY = windowY + 100;

    aliveCharacters.forEach((char: Character, index: number) => {
      const isSelected = index === this.pickupState.selectedCharacterIndex;
      const inventorySpace = GAME_CONFIG.ITEMS.INVENTORY.MAX_ITEMS_PER_CHARACTER - char.inventory.length;
      const isFull = inventorySpace <= 0;

      if (isSelected) {
        ctx.fillStyle = '#444';
        ctx.fillRect(windowX + 20, listY - 15, windowWidth - 40, 20);
      }

      ctx.fillStyle = isFull ? '#666' : isSelected ? '#ffa' : '#aaa';
      ctx.fillText(
        `${index + 1}. ${char.name} (${char.inventory.length}/${GAME_CONFIG.ITEMS.INVENTORY.MAX_ITEMS_PER_CHARACTER} items)`,
        windowX + 30,
        listY
      );

      if (isFull) {
        ctx.fillStyle = '#f66';
        ctx.fillText(' [FULL]', windowX + 250, listY);
      }

      listY += 25;
    });

    ctx.fillStyle = '#888';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      'Enter/Space: Give item | Escape/L: Discard | 1-6: Quick select',
      windowX + windowWidth / 2,
      windowY + windowHeight - 20
    );
  }

  private assignItemToCharacter(characterIndex: number): void {
    const aliveCharacters = this.gameState.party.getAliveCharacters();
    const character = aliveCharacters[characterIndex];
    const item = this.pickupState.items[this.pickupState.currentItemIndex];

    if (character.inventory.length >= GAME_CONFIG.ITEMS.INVENTORY.MAX_ITEMS_PER_CHARACTER) {
      this.messageLog?.addWarningMessage(`${character.name}'s inventory is full!`);
      return;
    }

    // Only stack identified consumables with the same ID
    const existingItem = character.inventory.find(
      (i: Item) =>
        i.id === item.id &&
        i.type === 'consumable' &&
        i.identified === true &&
        item.identified === true
    );

    if (existingItem && item.type === 'consumable' && item.identified) {
      existingItem.quantity = (existingItem.quantity || 1) + (item.quantity || 1);
    } else {
      // For unidentified items or non-consumables, always add as a new inventory slot
      character.inventory.push(item);
    }

    this.messageLog?.addItemMessage(
      `${character.name} takes ${this.getItemDisplayName(item)}`
    );

    this.moveToNextItem();
  }

  private discardCurrentItem(): void {
    const item = this.pickupState.items[this.pickupState.currentItemIndex];
    this.messageLog?.addSystemMessage(`Discarded ${this.getItemDisplayName(item)}.`);
    this.moveToNextItem();
  }

  private moveToNextItem(): void {
    this.pickupState.currentItemIndex++;

    if (this.pickupState.currentItemIndex >= this.pickupState.items.length) {
      this.pickupState.active = false;
      this.pickupState.items = [];
      this.messageLog?.addSystemMessage('Finished distributing items.');
    } else {
      const nextItem = this.pickupState.items[this.pickupState.currentItemIndex];
      this.messageLog?.addSystemMessage(
        `Found ${this.getItemDisplayName(nextItem)}. Who should take it?`
      );
      this.pickupState.selectedCharacterIndex = 0;
    }
  }

  private getItemDisplayName(item: Item): string {
    return item.identified ? item.name : (item.unidentifiedName || '?Item');
  }

  public reset(): void {
    this.pickupState = {
      active: false,
      items: [],
      currentItemIndex: 0,
      selectedCharacterIndex: 0,
    };
  }
}