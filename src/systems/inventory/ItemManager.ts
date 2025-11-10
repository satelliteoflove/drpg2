import { Character } from '../../entities/Character';
import { Equipment, Item } from '../../types/GameTypes';
import { canAlignmentUseItem, canClassEquipItem } from '../../config/ItemProperties';
import { DataLoader } from '../../utils/DataLoader';
import { EquipmentModifierManager } from '../EquipmentModifierManager';
import { ItemUtils } from '../../utils/ItemUtils';

export class ItemManager {
  private static instance: ItemManager | null = null;

  public static getInstance(): ItemManager {
    if (!ItemManager.instance) {
      ItemManager.instance = new ItemManager();
    }
    return ItemManager.instance;
  }

  private equipmentManager: EquipmentModifierManager;

  constructor() {
    this.equipmentManager = EquipmentModifierManager.getInstance();
  }

  public getItem(itemId: string): Item | null {
    return DataLoader.createItemInstance(itemId);
  }

  public addItemToInventory(character: Character, itemOrId: string | Item): boolean {
    let item: Item | null;

    if (typeof itemOrId === 'string') {
      item = this.getItem(itemOrId);
      if (!item) return false;
    } else {
      item = itemOrId;
    }

    const existingItem = character.inventory.find(
      (i) =>
        i.id === item.id &&
        i.type === 'consumable' &&
        i.identified === true &&
        item.identified === true
    );

    if (existingItem && item.type === 'consumable' && item.identified) {
      existingItem.quantity = (existingItem.quantity || 1) + (item.quantity || 1);
    } else {
      character.inventory.push(item);
    }

    return true;
  }

  public removeItemFromInventory(character: Character, itemId: string): boolean {
    const itemIndex = character.inventory.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return false;

    const item = character.inventory[itemIndex];
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      character.inventory.splice(itemIndex, 1);
    }

    return true;
  }

  public equipItem(character: Character, itemId: string): boolean {
    const itemIndex = character.inventory.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return false;

    const item = character.inventory[itemIndex];
    if (item.type === 'consumable') return false;

    if (!canClassEquipItem(character.class, item)) {
      return false;
    }

    if (!canAlignmentUseItem(character.alignment, item)) {
      return false;
    }

    const equipSlot = ItemUtils.getEquipSlot(item.type);
    if (!equipSlot) return false;

    const currentEquipped = character.equipment[equipSlot];
    if (currentEquipped) {
      if (currentEquipped.cursed) {
        return false;
      }
      this.unequipItem(character, equipSlot);
    }

    character.equipment[equipSlot] = item;
    item.equipped = true;
    character.inventory.splice(itemIndex, 1);

    if (item.cursed && !item.identified) {
      item.identified = true;
    }

    this.equipmentManager.applyEquipmentModifiers(character, item, true);

    return true;
  }

  public unequipItem(character: Character, equipSlot: keyof Equipment): boolean {
    const item = character.equipment[equipSlot];
    if (!item) return false;

    if (item.cursed) {
      return false;
    }

    character.equipment[equipSlot] = undefined;
    item.equipped = false;
    character.inventory.push(item);

    this.equipmentManager.applyEquipmentModifiers(character, item, false);

    return true;
  }

  public useItem(character: Character, itemId: string): string {
    const itemIndex = character.inventory.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return 'Item not found';

    const item = character.inventory[itemIndex];
    if (item.type !== 'consumable' && !item.invokable) return 'Item cannot be used';

    let result = `${character.name} uses ${item.name}`;

    if (item.spellId) {
      result += ` and casts ${item.spellId}`;
    }

    if (item.effects) {
      item.effects.forEach((effect) => {
        switch (effect.type) {
          case 'heal': {
            const oldHp = character.hp;
            character.heal(effect.value);
            result += ` and recovers ${character.hp - oldHp} HP`;
            break;
          }
          case 'stat':
            if (effect.target && effect.target in character.stats) {
              const statKey = effect.target;
              character.stats[statKey] += effect.value;
              result += ` and gains ${effect.value} ${effect.target}`;
            }
            break;
        }
      });
    }

    if (item.charges !== undefined && item.charges > 0) {
      item.charges--;
      if (item.charges === 0) {
        this.removeItemFromInventory(character, itemId);
        result += ' (depleted)';
      } else {
        result += ` (${item.charges} charges remaining)`;
      }
    } else if (item.type === 'consumable' && !item.maxCharges) {
      this.removeItemFromInventory(character, itemId);
    }

    return result + '!';
  }

  public tradeItem(
    fromCharacter: Character,
    toCharacter: Character,
    itemId: string
  ): boolean {
    const itemIndex = fromCharacter.inventory.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return false;

    const item = fromCharacter.inventory[itemIndex];

    const itemWeight = item.weight * item.quantity;
    const toInventoryWeight = this.getInventoryWeight(toCharacter);
    const toCarryCapacity = this.getCarryCapacity(toCharacter);
    if (toInventoryWeight + itemWeight > toCarryCapacity) {
      return false;
    }

    fromCharacter.inventory.splice(itemIndex, 1);

    const existingItem = toCharacter.inventory.find(
      (i) => i.id === itemId && i.type === 'consumable'
    );
    if (existingItem && item.type === 'consumable') {
      existingItem.quantity += item.quantity;
    } else {
      toCharacter.inventory.push(item);
    }

    return true;
  }

  public dropItem(character: Character, itemId: string): Item | null {
    const itemIndex = character.inventory.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return null;

    const item = character.inventory[itemIndex];

    if (item.equipped) {
      const equipSlot = ItemUtils.getEquipSlot(item.type);
      if (equipSlot) {
        this.unequipItem(character, equipSlot);
      }
    }

    if (item.quantity > 1) {
      item.quantity--;
      const droppedItem = { ...item, quantity: 1 };
      return droppedItem;
    } else {
      character.inventory.splice(itemIndex, 1);
      return item;
    }
  }

  public removeCurse(
    character: Character,
    equipSlot: keyof Equipment
  ): { success: boolean; message: string } {
    const item = character.equipment[equipSlot];

    if (!item) {
      return { success: false, message: 'No item equipped in that slot' };
    }

    if (!item.cursed) {
      return { success: false, message: 'This item is not cursed' };
    }

    item.cursed = false;
    return {
      success: true,
      message: `Curse removed from ${item.name}! You can now unequip it.`,
    };
  }

  private getInventoryWeight(character: Character): number {
    let weight = 0;

    character.inventory.forEach((item) => {
      weight += item.weight * item.quantity;
    });

    Object.values(character.equipment).forEach((item) => {
      if (item) {
        weight += item.weight;
      }
    });

    return weight;
  }

  private getCarryCapacity(character: Character): number {
    return character.stats.strength * 10;
  }
}
