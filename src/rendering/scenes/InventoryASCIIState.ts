import { BaseASCIIScene } from '../BaseASCIIScene';
import { ASCIIState, ASCII_GRID_HEIGHT, ASCII_GRID_WIDTH } from '../ASCIIState';
import { InputZone, SceneDeclaration } from '../SceneDeclaration';
import { GameState, Item } from '../../types/GameTypes';
import { SceneManager } from '../../core/Scene';
import { Character } from '../../entities/Character';
import { InventorySystem } from '../../systems/InventorySystem';
import { DebugLogger } from '../../utils/DebugLogger';

type InventoryMode =
  | 'character_select'
  | 'inventory'
  | 'equipment'
  | 'trade_select'
  | 'trade_target';

export class InventoryASCIIState extends BaseASCIIScene {
  private gameState: GameState;
  private selectedCharacter: number = 0;
  private selectedItem: number = 0;
  private mode: InventoryMode = 'character_select';
  private tradeFromCharacter: number = 0;
  private scrollOffset: number = 0;

  constructor(gameState: GameState, _sceneManager: SceneManager) {
    super('Inventory', 'ascii_inventory_scene');
    this.gameState = gameState;
  }

  public enter(): void {
    DebugLogger.info('InventoryASCIIState', 'Entering Inventory ASCII state');
    this.selectedCharacter = 0;
    this.selectedItem = 0;
    this.mode = 'character_select';
    this.scrollOffset = 0;
    this.updateGrid();
  }

  public exit(): void {
    DebugLogger.info('InventoryASCIIState', 'Exiting Inventory ASCII state');
  }

  public update(_deltaTime: number): void {
    // Update can trigger grid updates if needed
  }

  public render(): void {
    this.updateGrid();
  }

  public updateSelectedCharacter(index: number): void {
    this.selectedCharacter = index;
    this.updateGrid();
  }

  public updateSelectedItem(index: number): void {
    this.selectedItem = index;
    this.updateGrid();
  }

  public updateMode(mode: InventoryMode): void {
    this.mode = mode;
    this.scrollOffset = 0;
    this.updateGrid();
  }

  public updateTradeFromCharacter(index: number): void {
    this.tradeFromCharacter = index;
    this.updateGrid();
  }

  public updateTradeItem(_itemId: string): void {
    // Trade item ID is not needed for ASCII display
    this.updateGrid();
  }

  private updateGrid(): void {
    const grid = this.asciiState;
    grid.clear();

    switch (this.mode) {
      case 'character_select':
        this.renderCharacterSelect();
        break;
      case 'inventory':
        this.renderInventory();
        break;
      case 'equipment':
        this.renderEquipment();
        break;
      case 'trade_select':
        this.renderTradeSelect();
        break;
      case 'trade_target':
        this.renderTradeTarget();
        break;
    }

    // Draw border
    grid.drawBox(0, 0, ASCII_GRID_WIDTH, ASCII_GRID_HEIGHT - 2);
  }

  private renderCharacterSelect(): void {
    const grid = this.asciiState;

    // Title
    const title = 'PARTY INVENTORY [ASCII MODE]';
    const titleX = Math.floor((ASCII_GRID_WIDTH - title.length) / 2);
    grid.writeText(titleX, 1, title);

    const subtitle = 'Select Character:';
    grid.writeText(5, 4, subtitle);

    if (!this.gameState.party || !this.gameState.party.characters) {
      grid.writeText(5, 7, 'Error: No party data found');
      return;
    }

    if (this.gameState.party.characters.length === 0) {
      grid.writeText(5, 7, 'Error: No characters in party');
      return;
    }

    // Character list
    const startY = 6;
    this.gameState.party.characters.forEach((character: Character, index: number) => {
      const y = startY + index * 2;
      const isSelected = index === this.selectedCharacter;
      const prefix = isSelected ? '> ' : '  ';
      const status = character.isDead ? ' (DEAD)' : '';
      const items = character.inventory ? character.inventory.length : 0;
      const maxItems = 20;

      const line1 = `${prefix}${index + 1}. ${character.name}${status}`;
      const line2 = `     ${character.class} - ${items}/${maxItems} items`;

      grid.writeText(5, y, line1);
      grid.writeText(5, y + 1, line2);
    });

    // Instructions
    const instructY = ASCII_GRID_HEIGHT - 5;
    grid.writeText(5, instructY, 'I: View Inventory  E: View Equipment  T: Trade Items');
    grid.writeText(5, instructY + 1, 'ESC: Exit');
  }

  private renderInventory(): void {
    const grid = this.asciiState;
    const character = this.gameState.party.characters[this.selectedCharacter];

    // Title
    const title = `${character.name.toUpperCase()}'S INVENTORY`;
    const titleX = Math.floor((ASCII_GRID_WIDTH - title.length) / 2);
    grid.writeText(titleX, 1, title);

    if (!character.inventory || character.inventory.length === 0) {
      grid.writeText(20, 8, 'No items');
      const helpText = 'ESC: Back';
      const helpX = Math.floor((ASCII_GRID_WIDTH - helpText.length) / 2);
      grid.writeText(helpX, ASCII_GRID_HEIGHT - 3, helpText);
      return;
    }

    // Item list with scrolling
    const maxVisible = 12;
    const startY = 4;

    // Adjust scroll offset if needed
    if (this.selectedItem >= this.scrollOffset + maxVisible) {
      this.scrollOffset = this.selectedItem - maxVisible + 1;
    } else if (this.selectedItem < this.scrollOffset) {
      this.scrollOffset = this.selectedItem;
    }

    const visibleItems = character.inventory.slice(
      this.scrollOffset,
      this.scrollOffset + maxVisible
    );

    // Draw item list
    visibleItems.forEach((item: Item, index: number) => {
      const actualIndex = this.scrollOffset + index;
      const y = startY + index;
      const isSelected = actualIndex === this.selectedItem;
      const prefix = isSelected ? '> ' : '  ';

      const description = InventorySystem.getItemDescription(item);
      let suffix = '';

      if (!item.identified) {
        suffix = ' (?)';
      } else if (item.equipped) {
        suffix = ' [EQUIPPED]';
      } else if (item.cursed && item.identified) {
        suffix = ' [CURSED]';
      }

      const text = `${prefix}${actualIndex + 1}. ${description}${suffix}`;

      // Color coding for item types (simplified for ASCII)
      if (!character.canEquipItem(item) && item.type !== 'consumable') {
        // Can't equip - would be grayed out
        grid.writeText(5, y, text);
      } else {
        grid.writeText(5, y, text);
      }
    });

    // Scroll indicators
    if (this.scrollOffset > 0) {
      grid.writeText(3, startY, '^');
    }
    if (this.scrollOffset + maxVisible < character.inventory.length) {
      grid.writeText(3, startY + maxVisible - 1, 'v');
    }

    // Item details for selected item
    if (this.selectedItem < character.inventory.length) {
      const selectedItem = character.inventory[this.selectedItem];
      const detailY = 18;

      grid.writeText(5, detailY, `Type: ${selectedItem.type}`);
      grid.writeText(25, detailY, `Weight: ${selectedItem.weight}`);
      grid.writeText(45, detailY, `Value: ${selectedItem.value}g`);

      if (selectedItem.enchantment && selectedItem.enchantment !== 0) {
        const enchText = `Enchantment: ${selectedItem.enchantment > 0 ? '+' : ''}${selectedItem.enchantment}`;
        grid.writeText(5, detailY + 1, enchText);
      }

      // Action hints
      const canEquip = selectedItem.type !== 'consumable' && !selectedItem.equipped;
      const canUnequip = selectedItem.equipped;
      const canUse = selectedItem.type === 'consumable' || selectedItem.invokable;
      const canIdentify = !selectedItem.identified && character.class === 'Bishop';

      let actions = '';
      if (canEquip) actions += 'Q: Equip  ';
      if (canUnequip) actions += 'U: Unequip  ';
      if (canUse) actions += 'SPACE: Use  ';
      if (canIdentify) actions += 'I: Identify  ';
      actions += 'D: Drop  ESC: Back';

      const actionsX = Math.floor((ASCII_GRID_WIDTH - actions.length) / 2);
      grid.writeText(actionsX, ASCII_GRID_HEIGHT - 3, actions);
    }
  }

  private renderEquipment(): void {
    const grid = this.asciiState;
    const character = this.gameState.party.characters[this.selectedCharacter];

    // Title
    const title = `${character.name.toUpperCase()}'S EQUIPMENT`;
    const titleX = Math.floor((ASCII_GRID_WIDTH - title.length) / 2);
    grid.writeText(titleX, 1, title);

    // Equipment slots
    const slots = [
      { key: 'weapon', label: 'WEAPON' },
      { key: 'armor', label: 'ARMOR' },
      { key: 'shield', label: 'SHIELD' },
      { key: 'helmet', label: 'HELMET' },
      { key: 'gauntlets', label: 'GAUNTLETS' },
      { key: 'boots', label: 'BOOTS' },
      { key: 'accessory', label: 'ACCESSORY' },
    ];

    const startY = 5;
    slots.forEach((slot, index) => {
      const y = startY + index * 2;
      const item = character.equipment[slot.key as keyof typeof character.equipment];
      const itemName = item ? item.name : '(empty)';

      const label = `${slot.label}:`;
      grid.writeText(20, y, label.padEnd(12) + itemName);

      if (item) {
        const details = [];
        if (item.enchantment && item.enchantment !== 0) {
          details.push(`+${item.enchantment}`);
        }
        if (item.cursed && item.identified) {
          details.push('CURSED');
        }
        if (!item.identified) {
          details.push('?');
        }

        if (details.length > 0) {
          grid.writeText(35, y + 1, `[${details.join(', ')}]`);
        }
      }
    });

    // Character stats summary
    const statsY = startY + slots.length * 2 + 1;
    grid.writeText(
      20,
      statsY,
      `AC: ${character.getAC()}  HP: ${character.currentHP}/${character.maxHP}`
    );

    // Help text
    const helpText = 'ESC: Back';
    const helpX = Math.floor((ASCII_GRID_WIDTH - helpText.length) / 2);
    grid.writeText(helpX, ASCII_GRID_HEIGHT - 3, helpText);
  }

  private renderTradeSelect(): void {
    const grid = this.asciiState;
    const character = this.gameState.party.characters[this.tradeFromCharacter];

    // Title
    const title = `TRADE FROM ${character.name.toUpperCase()}`;
    const titleX = Math.floor((ASCII_GRID_WIDTH - title.length) / 2);
    grid.writeText(titleX, 1, title);

    grid.writeText(5, 3, 'Select item to trade:');

    if (!character.inventory || character.inventory.length === 0) {
      grid.writeText(20, 8, 'No items to trade');
      const helpText = 'ESC: Back';
      const helpX = Math.floor((ASCII_GRID_WIDTH - helpText.length) / 2);
      grid.writeText(helpX, ASCII_GRID_HEIGHT - 3, helpText);
      return;
    }

    // Item list with scrolling
    const maxVisible = 12;
    const startY = 5;

    // Adjust scroll offset if needed
    if (this.selectedItem >= this.scrollOffset + maxVisible) {
      this.scrollOffset = this.selectedItem - maxVisible + 1;
    } else if (this.selectedItem < this.scrollOffset) {
      this.scrollOffset = this.selectedItem;
    }

    const visibleItems = character.inventory.slice(
      this.scrollOffset,
      this.scrollOffset + maxVisible
    );

    visibleItems.forEach((item: Item, index: number) => {
      const actualIndex = this.scrollOffset + index;
      const y = startY + index;
      const isSelected = actualIndex === this.selectedItem;
      const prefix = isSelected ? '> ' : '  ';

      const description = InventorySystem.getItemDescription(item);
      let suffix = '';
      if (item.equipped) suffix = ' [EQUIPPED]';

      grid.writeText(5, y, `${prefix}${actualIndex + 1}. ${description}${suffix}`);
    });

    // Scroll indicators
    if (this.scrollOffset > 0) {
      grid.writeText(3, startY, '^');
    }
    if (this.scrollOffset + maxVisible < character.inventory.length) {
      grid.writeText(3, startY + maxVisible - 1, 'v');
    }

    // Help text
    const helpText = 'UP/DOWN: Select  ENTER: Choose  ESC: Back';
    const helpX = Math.floor((ASCII_GRID_WIDTH - helpText.length) / 2);
    grid.writeText(helpX, ASCII_GRID_HEIGHT - 3, helpText);
  }

  private renderTradeTarget(): void {
    const grid = this.asciiState;

    // Title
    const title = 'TRADE TO WHOM?';
    const titleX = Math.floor((ASCII_GRID_WIDTH - title.length) / 2);
    grid.writeText(titleX, 1, title);

    grid.writeText(5, 3, 'Select target character:');

    const startY = 5;
    let displayIndex = 0;

    this.gameState.party.characters.forEach((character: Character, index: number) => {
      if (index === this.tradeFromCharacter) return; // Skip the source character

      const y = startY + displayIndex * 3;
      const isSelected = index === this.selectedCharacter;
      const prefix = isSelected ? '> ' : '  ';
      const status = character.isDead ? ' (DEAD)' : '';
      const weight = InventorySystem.getInventoryWeight(character);
      const capacity = InventorySystem.getCarryCapacity(character);

      const line1 = `${prefix}${index + 1}. ${character.name}${status}`;
      const line2 = `     ${character.class}`;
      const line3 = `     Weight: ${weight}/${capacity}`;

      grid.writeText(5, y, line1);
      grid.writeText(5, y + 1, line2);
      grid.writeText(5, y + 2, line3);

      displayIndex++;
    });

    // Help text
    const helpText = 'UP/DOWN: Select  ENTER: Trade  ESC: Back';
    const helpX = Math.floor((ASCII_GRID_WIDTH - helpText.length) / 2);
    grid.writeText(helpX, ASCII_GRID_HEIGHT - 3, helpText);
  }

  public getGrid(): ASCIIState {
    return this.asciiState;
  }

  // Required abstract method implementations
  protected setupInputHandlers(): void {
    // Input handlers are managed through the main InventoryScene
  }

  protected updateASCIIState(_deltaTime: number): void {
    // Inventory state updates are handled through explicit update methods
  }

  protected generateSceneDeclaration(): SceneDeclaration {
    // Generate input zones based on current inventory mode
    const zones: InputZone[] = [];

    // Add zones for interactive elements based on current mode
    // This will be expanded as needed

    return {
      id: 'inventory-scene',
      name: 'Inventory Scene',
      layers: [],
      uiElements: [],
      inputZones: zones,
      grid: this.asciiState.getGrid(),
      metadata: {
        mode: this.mode,
        selectedCharacter: this.selectedCharacter,
        selectedItem: this.selectedItem,
      },
    } as any;
  }

  protected setupScene(): void {
    // Initial inventory setup
    this.render();
  }
}
