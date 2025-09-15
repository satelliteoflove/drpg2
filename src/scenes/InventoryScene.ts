import { Scene, SceneManager, SceneRenderContext } from '../core/Scene';
import { GameState, Item } from '../types/GameTypes';
import { Character } from '../entities/Character';
import { InventorySystem } from '../systems/InventorySystem';
import { InventoryASCIIState } from '../rendering/scenes/InventoryASCIIState';
import { FeatureFlags, FeatureFlagKey } from '../config/FeatureFlags';
import { CanvasRenderer } from '../rendering/CanvasRenderer';
import { DebugLogger } from '../utils/DebugLogger';

export class InventoryScene extends Scene {
  private gameState: GameState;
  private sceneManager: SceneManager;
  private selectedCharacter: number = 0;
  private selectedItem: number = 0;
  private mode: 'character_select' | 'inventory' | 'equipment' | 'trade_select' | 'trade_target' = 'character_select';
  private tradeFromCharacter: number = 0;
  private tradeItem: string = '';
  private asciiState?: InventoryASCIIState;
  private asciiRenderer?: CanvasRenderer;
  private useASCII: boolean = false;

  constructor(gameState: GameState, sceneManager: SceneManager) {
    super('Inventory');
    this.gameState = gameState;
    this.sceneManager = sceneManager;

    // Check if ASCII rendering should be enabled
    this.useASCII = FeatureFlags.isEnabled(FeatureFlagKey.ASCII_RENDERING) ||
                    FeatureFlags.isEnabled(FeatureFlagKey.ASCII_INVENTORY_SCENE);

    if (this.useASCII) {
      this.asciiState = new InventoryASCIIState(gameState, sceneManager);
      DebugLogger.info('InventoryScene', 'ASCII rendering enabled for Inventory scene');
    }
  }

  public enter(): void {
    this.selectedCharacter = 0;
    this.selectedItem = 0;
    this.mode = 'character_select';

    // Check if ASCII should be enabled on enter
    const shouldUseASCII = FeatureFlags.isEnabled(FeatureFlagKey.ASCII_RENDERING) ||
                            FeatureFlags.isEnabled(FeatureFlagKey.ASCII_INVENTORY_SCENE);

    if (shouldUseASCII && !this.asciiState) {
      this.asciiState = new InventoryASCIIState(this.gameState, this.sceneManager);
      this.useASCII = true;
      DebugLogger.info('InventoryScene', 'ASCII rendering enabled on enter');
    } else if (!shouldUseASCII && this.asciiState) {
      this.asciiState = undefined;
      this.asciiRenderer = undefined;
      this.useASCII = false;
      DebugLogger.info('InventoryScene', 'ASCII rendering disabled on enter');
    }

    // Initialize ASCII state if enabled
    if (this.asciiState) {
      this.asciiState.enter();
      this.syncASCIIState();
    }
  }

  public exit(): void {
    if (this.asciiState) {
      this.asciiState.exit();
    }
  }

  public update(_deltaTime: number): void {
    if (this.asciiState) {
      this.asciiState.update(_deltaTime);
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // Fallback for direct rendering - should not be used since we have layered rendering
    console.warn('[INVENTORY] Using direct rendering fallback - layered rendering preferred');
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';

    switch (this.mode) {
      case 'character_select':
        this.renderCharacterSelect(ctx);
        break;
      case 'inventory':
        this.renderInventory(ctx);
        break;
      case 'equipment':
        this.renderEquipment(ctx);
        break;
      case 'trade_select':
        this.renderTradeSelect(ctx);
        break;
      case 'trade_target':
        this.renderTradeTarget(ctx);
        break;
    }

    // Instructions
    ctx.fillStyle = '#888';
    ctx.font = '12px monospace';
    ctx.fillText('ESC: Back/Exit | ENTER: Select | UP/DOWN: Navigate', 10, ctx.canvas.height - 60);
  }

  public renderLayered(renderContext: SceneRenderContext): void {
    // Check if ASCII should be enabled at runtime
    const shouldUseASCII = FeatureFlags.isEnabled(FeatureFlagKey.ASCII_RENDERING) ||
                            FeatureFlags.isEnabled(FeatureFlagKey.ASCII_INVENTORY_SCENE);

    if (shouldUseASCII && !this.asciiState) {
      DebugLogger.info('InventoryScene', 'Initializing ASCII state in renderLayered');
      this.asciiState = new InventoryASCIIState(this.gameState, this.sceneManager);
      this.asciiState.enter();
      this.syncASCIIState();
      this.useASCII = true;
    } else if (!shouldUseASCII && this.asciiState) {
      DebugLogger.info('InventoryScene', 'Disabling ASCII state in renderLayered');
      this.asciiState.exit();
      this.asciiState = undefined;
      this.asciiRenderer = undefined;
      this.useASCII = false;
    }

    const { renderManager } = renderContext;

    if (shouldUseASCII && this.asciiState) {
      // ASCII rendering
      renderManager.renderBackground((ctx) => {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      });

      renderManager.renderUI((ctx) => {
        // Create ASCII renderer if needed
        if (!this.asciiRenderer) {
          this.asciiRenderer = new CanvasRenderer(ctx.canvas);
        }

        // Update ASCII state with latest data
        this.syncASCIIState();

        // Render ASCII grid
        if (this.asciiState && this.asciiRenderer) {
          const asciiGrid = this.asciiState.getGrid();
          this.asciiRenderer.renderASCIIGrid(asciiGrid.getGrid());
        }
      });
    } else {
      // Original rendering code
      renderManager.renderBackground((ctx) => {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      });

      renderManager.renderUI((ctx) => {
        ctx.fillStyle = '#fff';
        ctx.font = '16px monospace';

        switch (this.mode) {
          case 'character_select':
            this.renderCharacterSelect(ctx);
            break;
          case 'inventory':
            this.renderInventory(ctx);
            break;
          case 'equipment':
            this.renderEquipment(ctx);
            break;
          case 'trade_select':
            this.renderTradeSelect(ctx);
            break;
          case 'trade_target':
            this.renderTradeTarget(ctx);
            break;
        }

        // Instructions
        ctx.fillStyle = '#888';
        ctx.font = '12px monospace';
        ctx.fillText('ESC: Back/Exit | ENTER: Select | UP/DOWN: Navigate', 10, ctx.canvas.height - 10);
      });
    }
  }

  private renderCharacterSelect(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.fillText('PARTY INVENTORY', 10, 30);
    ctx.fillText('Select Character:', 10, 60);

    if (!this.gameState.party || !this.gameState.party.characters) {
      ctx.fillText('Error: No party data found', 10, 100);
      return;
    }

    if (this.gameState.party.characters.length === 0) {
      ctx.fillText('Error: No characters in party', 10, 100);
      return;
    }

    this.gameState.party.characters.forEach((character: Character, index: number) => {
      const y = 90 + index * 30;
      ctx.fillStyle = index === this.selectedCharacter ? '#ffff00' : '#fff';
      
      const status = character.isDead ? ' (DEAD)' : '';
      const items = character.inventory ? character.inventory.length : 0;
      ctx.fillText(`${index + 1}. ${character.name}${status} - ${items} items`, 20, y);
    });

    ctx.fillStyle = '#aaa';
    ctx.font = '12px monospace';
    ctx.fillText('I: View Inventory | E: View Equipment | T: Trade Items', 10, ctx.canvas.height - 45);
  }

  private renderInventory(ctx: CanvasRenderingContext2D): void {
    const character = this.gameState.party.characters[this.selectedCharacter];
    ctx.fillText(`${character.name}'s INVENTORY`, 10, 30);

    if (character.inventory.length === 0) {
      ctx.fillText('No items', 20, 70);
      return;
    }

    character.inventory.forEach((item: Item, index: number) => {
      const y = 70 + index * 25;
      
      const description = InventorySystem.getItemDescription(item);
      let suffix = '';
      
      if (!item.identified) {
        suffix = ' (?)';
      } else if (item.equipped) {
        suffix = ' [EQUIPPED]';
      } else if (item.cursed && item.identified) {
        suffix = ' [CURSED]';
      }
      
      if (item.type !== 'consumable' && !character.canEquipItem(item)) {
        ctx.fillStyle = index === this.selectedItem ? '#ff8800' : '#888';
      } else {
        // Use rarity color for identified items, or selection color for unidentified
        if (index === this.selectedItem) {
          ctx.fillStyle = '#ffff00'; // Yellow for selection
        } else if (item.identified && item.rarity) {
          ctx.fillStyle = InventorySystem.getRarityColor(item.rarity);
        } else {
          ctx.fillStyle = '#fff'; // White for unidentified/common items
        }
      }
      
      ctx.fillText(`${index + 1}. ${description}${suffix}`, 20, y);
    });

    ctx.fillStyle = '#aaa';
    ctx.font = '12px monospace';
    const selectedItem = character.inventory[this.selectedItem];
    if (selectedItem) {
      const canEquip = selectedItem.type !== 'consumable' && !selectedItem.equipped;
      const canUnequip = selectedItem.equipped;
      const canUse = selectedItem.type === 'consumable' || selectedItem.invokable;
      const canIdentify = !selectedItem.identified && character.class === 'Bishop';
      
      let actions = '';
      if (canEquip) actions += 'Q: Equip | ';
      if (canUnequip) actions += 'U: Unequip | ';
      if (canUse) actions += 'SPACE: Use | ';
      if (canIdentify) actions += 'I: Identify | ';
      actions += 'D: Drop';
      
      ctx.fillText(actions, 10, ctx.canvas.height - 45);
    }
  }

  private renderEquipment(ctx: CanvasRenderingContext2D): void {
    const character = this.gameState.party.characters[this.selectedCharacter];
    ctx.fillText(`${character.name}'s EQUIPMENT`, 10, 30);

    const slots = ['weapon', 'armor', 'shield', 'helmet', 'gauntlets', 'boots', 'accessory'];
    
    slots.forEach((slot, index: number) => {
      const y = 70 + index * 25;
      const item = character.equipment[slot as keyof typeof character.equipment];
      const itemName = item ? item.name : '(empty)';
      
      ctx.fillStyle = '#fff';
      ctx.fillText(`${slot.toUpperCase()}: ${itemName}`, 20, y);
    });
  }

  private renderTradeSelect(ctx: CanvasRenderingContext2D): void {
    const character = this.gameState.party.characters[this.tradeFromCharacter];
    ctx.fillText(`TRADE FROM ${character.name}`, 10, 30);
    ctx.fillText('Select item to trade:', 10, 60);

    if (character.inventory.length === 0) {
      ctx.fillText('No items to trade', 20, 90);
      return;
    }

    character.inventory.forEach((item: Item, index: number) => {
      const y = 90 + index * 25;
      ctx.fillStyle = index === this.selectedItem ? '#ffff00' : '#fff';
      
      const description = InventorySystem.getItemDescription(item);
      ctx.fillText(`${index + 1}. ${description}`, 20, y);
    });
  }

  private renderTradeTarget(ctx: CanvasRenderingContext2D): void {
    ctx.fillText('TRADE TO WHOM?', 10, 30);
    ctx.fillText('Select target character:', 10, 60);

    this.gameState.party.characters.forEach((character: Character, index: number) => {
      if (index === this.tradeFromCharacter) return; // Skip the source character
      
      const y = 90 + index * 30;
      ctx.fillStyle = index === this.selectedCharacter ? '#ffff00' : '#fff';
      
      const status = character.isDead ? ' (DEAD)' : '';
      const weight = InventorySystem.getInventoryWeight(character);
      const capacity = InventorySystem.getCarryCapacity(character);
      ctx.fillText(`${index + 1}. ${character.name}${status} (${weight}/${capacity} weight)`, 20, y);
    });
  }

  public handleInput(key: string): boolean {
    // Check if ASCII rendering is currently active
    const shouldUseASCII = FeatureFlags.isEnabled(FeatureFlagKey.ASCII_RENDERING) ||
                            FeatureFlags.isEnabled(FeatureFlagKey.ASCII_INVENTORY_SCENE);

    let handled = false;
    switch (this.mode) {
      case 'character_select':
        handled = this.handleCharacterSelect(key);
        break;
      case 'inventory':
        handled = this.handleInventory(key);
        break;
      case 'equipment':
        handled = this.handleEquipment(key);
        break;
      case 'trade_select':
        handled = this.handleTradeSelect(key);
        break;
      case 'trade_target':
        handled = this.handleTradeTarget(key);
        break;
    }

    // Sync with ASCII state after handling input
    if (shouldUseASCII && this.asciiState && handled) {
      this.syncASCIIState();
    }

    return handled;
  }

  private handleCharacterSelect(key: string): boolean {
    const characters = this.gameState.party.characters;

    if (key === 'arrowup' || key === 'w') {
      this.selectedCharacter = Math.max(0, this.selectedCharacter - 1);
      return true;
    } else if (key === 'arrowdown' || key === 's') {
      this.selectedCharacter = Math.min(characters.length - 1, this.selectedCharacter + 1);
      return true;
    } else if (key === 'i') {
      this.mode = 'inventory';
      this.selectedItem = 0;
      return true;
    } else if (key === 'e') {
      this.mode = 'equipment';
      return true;
    } else if (key === 't') {
      this.mode = 'trade_select';
      this.tradeFromCharacter = this.selectedCharacter;
      this.selectedItem = 0;
      return true;
    } else if (key === 'escape') {
      this.sceneManager.switchTo('dungeon');
      return true;
    }

    return false;
  }

  private handleInventory(key: string): boolean {
    const character = this.gameState.party.characters[this.selectedCharacter];
    const items = character.inventory;

    if (key === 'arrowup' || key === 'w') {
      this.selectedItem = Math.max(0, this.selectedItem - 1);
      return true;
    } else if (key === 'arrowdown' || key === 's') {
      this.selectedItem = Math.min(items.length - 1, this.selectedItem + 1);
      return true;
    } else if (key === 'q' && items.length > 0) {
      const item = items[this.selectedItem];
      if (item && item.type !== 'consumable' && !item.equipped) {
        if (InventorySystem.equipItem(character, item.id)) {
          this.gameState.messageLog?.addSystemMessage(`${character.name} equipped ${item.name}`);
        } else {
          this.gameState.messageLog?.addWarningMessage(`Cannot equip ${item.name}`);
        }
      }
      return true;
    } else if (key === 'u' && items.length > 0) {
      const item = items[this.selectedItem];
      if (item && item.equipped) {
        const equipSlot = this.getEquipSlot(item.type);
        if (equipSlot && InventorySystem.unequipItem(character, equipSlot)) {
          this.gameState.messageLog?.addSystemMessage(`${character.name} unequipped ${item.name}`);
        } else if (item.cursed) {
          this.gameState.messageLog?.addWarningMessage(`Cannot remove ${item.name} - it is cursed!`);
        }
      }
      return true;
    } else if (key === 'i' && items.length > 0) {
      const item = items[this.selectedItem];
      if (item && !item.identified) {
        const result = InventorySystem.identifyItem(character, item.id);
        this.gameState.messageLog?.addSystemMessage(result.message);
        if (result.cursed) {
          this.gameState.messageLog?.addWarningMessage('The item is cursed!');
        }
      }
      return true;
    } else if (key === ' ' && items.length > 0) {
      const item = items[this.selectedItem];
      if (item && item.type === 'consumable') {
        const result = InventorySystem.useItem(character, item.id);
        this.gameState.messageLog?.addSystemMessage(result);
        // Adjust selection if item was consumed
        if (this.selectedItem >= character.inventory.length) {
          this.selectedItem = Math.max(0, character.inventory.length - 1);
        }
      }
      return true;
    } else if (key === 'd' && items.length > 0) {
      const item = items[this.selectedItem];
      if (item) {
        const droppedItem = InventorySystem.dropItem(character, item.id);
        if (droppedItem) {
          this.gameState.messageLog?.addSystemMessage(`${character.name} dropped ${droppedItem.name}`);
          // Adjust selection if needed
          if (this.selectedItem >= character.inventory.length) {
            this.selectedItem = Math.max(0, character.inventory.length - 1);
          }
        }
      }
      return true;
    } else if (key === 'escape') {
      this.mode = 'character_select';
      return true;
    }

    return false;
  }

  private handleEquipment(key: string): boolean {
    if (key === 'escape') {
      this.mode = 'character_select';
      return true;
    }
    return false;
  }

  private handleTradeSelect(key: string): boolean {
    const character = this.gameState.party.characters[this.tradeFromCharacter];
    const items = character.inventory;

    if (key === 'arrowup' || key === 'w') {
      this.selectedItem = Math.max(0, this.selectedItem - 1);
      return true;
    } else if (key === 'arrowdown' || key === 's') {
      this.selectedItem = Math.min(items.length - 1, this.selectedItem + 1);
      return true;
    } else if (key === 'enter' && items.length > 0) {
      this.tradeItem = items[this.selectedItem].id;
      this.mode = 'trade_target';
      this.selectedCharacter = this.tradeFromCharacter === 0 ? 1 : 0; // Start with a different character
      return true;
    } else if (key === 'escape') {
      this.mode = 'character_select';
      return true;
    }

    return false;
  }

  private handleTradeTarget(key: string): boolean {
    const characters = this.gameState.party.characters;

    if (key === 'arrowup' || key === 'w') {
      do {
        this.selectedCharacter = Math.max(0, this.selectedCharacter - 1);
      } while (this.selectedCharacter === this.tradeFromCharacter && this.selectedCharacter > 0);
      return true;
    } else if (key === 'arrowdown' || key === 's') {
      do {
        this.selectedCharacter = Math.min(characters.length - 1, this.selectedCharacter + 1);
      } while (this.selectedCharacter === this.tradeFromCharacter && this.selectedCharacter < characters.length - 1);
      return true;
    } else if (key === 'enter') {
      const fromCharacter = characters[this.tradeFromCharacter];
      const toCharacter = characters[this.selectedCharacter];
      
      if (InventorySystem.tradeItem(fromCharacter, toCharacter, this.tradeItem)) {
        const item = InventorySystem.getItem(this.tradeItem);
        this.gameState.messageLog?.addSystemMessage(
          `${fromCharacter.name} traded ${item?.name || 'item'} to ${toCharacter.name}`
        );
      } else {
        this.gameState.messageLog?.addWarningMessage('Trade failed - target cannot carry more weight');
      }
      
      this.mode = 'character_select';
      return true;
    } else if (key === 'escape') {
      this.mode = 'trade_select';
      return true;
    }

    return false;
  }

  private getEquipSlot(itemType: string) {
    switch (itemType) {
      case 'weapon': return 'weapon';
      case 'armor': return 'armor';
      case 'shield': return 'shield';
      case 'helmet': return 'helmet';
      case 'gauntlets': return 'gauntlets';
      case 'boots': return 'boots';
      case 'accessory': return 'accessory';
      default: return null;
    }
  }

  private syncASCIIState(): void {
    if (!this.asciiState) return;

    // Sync state with ASCII renderer
    this.asciiState.updateMode(this.mode);
    this.asciiState.updateSelectedCharacter(this.selectedCharacter);
    this.asciiState.updateSelectedItem(this.selectedItem);
    this.asciiState.updateTradeFromCharacter(this.tradeFromCharacter);
    this.asciiState.updateTradeItem(this.tradeItem);
  }
}