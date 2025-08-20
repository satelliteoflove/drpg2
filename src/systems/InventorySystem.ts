import { Character } from '../entities/Character';
import { Equipment, Item } from '../types/GameTypes';

export class InventorySystem {
  private static items: Map<string, Item> = new Map();

  static {
    this.initializeItems();
  }

  private static initializeItems(): void {
    const items: Item[] = [
      {
        id: 'dagger',
        name: 'Dagger',
        type: 'weapon',
        value: 50,
        weight: 1,
        identified: true,
        cursed: false,
        equipped: false,
        quantity: 1,
        effects: [{ type: 'damage', value: 4 }],
      },
      {
        id: 'sword',
        name: 'Sword',
        type: 'weapon',
        value: 200,
        weight: 3,
        identified: true,
        cursed: false,
        equipped: false,
        quantity: 1,
        effects: [{ type: 'damage', value: 8 }],
      },
      {
        id: 'leather_armor',
        name: 'Leather Armor',
        type: 'armor',
        value: 100,
        weight: 5,
        identified: true,
        cursed: false,
        equipped: false,
        quantity: 1,
        effects: [{ type: 'ac', value: 2 }],
      },
      {
        id: 'chain_mail',
        name: 'Chain Mail',
        type: 'armor',
        value: 300,
        weight: 15,
        identified: true,
        cursed: false,
        equipped: false,
        quantity: 1,
        effects: [{ type: 'ac', value: 4 }],
      },
      {
        id: 'small_shield',
        name: 'Small Shield',
        type: 'shield',
        value: 75,
        weight: 3,
        identified: true,
        cursed: false,
        equipped: false,
        quantity: 1,
        effects: [{ type: 'ac', value: 1 }],
      },
      {
        id: 'healing_potion',
        name: 'Healing Potion',
        type: 'consumable',
        value: 25,
        weight: 1,
        identified: true,
        cursed: false,
        equipped: false,
        quantity: 1,
        effects: [{ type: 'heal', value: 20 }],
      },
      {
        id: 'strength_ring',
        name: 'Ring of Strength',
        type: 'accessory',
        value: 500,
        weight: 0,
        identified: false,
        cursed: false,
        equipped: false,
        quantity: 1,
        effects: [{ type: 'stat', value: 2, target: 'strength' }],
      },
    ];

    items.forEach(item => {
      this.items.set(item.id, item);
    });
  }

  public static getItem(itemId: string): Item | null {
    const template = this.items.get(itemId);
    if (!template) return null;

    return { ...template };
  }

  public static addItemToInventory(character: Character, itemId: string): boolean {
    const item = this.getItem(itemId);
    if (!item) return false;

    const existingItem = character.inventory.find(i => i.id === itemId && i.type === 'consumable');
    if (existingItem) {
      existingItem.quantity++;
    } else {
      character.inventory.push(item);
    }

    return true;
  }

  public static removeItemFromInventory(character: Character, itemId: string): boolean {
    const itemIndex = character.inventory.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return false;

    const item = character.inventory[itemIndex];
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      character.inventory.splice(itemIndex, 1);
    }

    return true;
  }

  public static equipItem(character: Character, itemId: string): boolean {
    const itemIndex = character.inventory.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return false;

    const item = character.inventory[itemIndex];
    if (item.type === 'consumable') return false;

    const equipSlot = this.getEquipSlot(item.type);
    if (!equipSlot) return false;

    const currentEquipped = character.equipment[equipSlot];
    if (currentEquipped) {
      this.unequipItem(character, equipSlot);
    }

    character.equipment[equipSlot] = item;
    item.equipped = true;
    character.inventory.splice(itemIndex, 1);

    this.applyItemEffects(character, item, true);
    this.recalculateStats(character);

    return true;
  }

  public static unequipItem(character: Character, equipSlot: keyof Equipment): boolean {
    const item = character.equipment[equipSlot];
    if (!item) return false;

    character.equipment[equipSlot] = undefined;
    item.equipped = false;
    character.inventory.push(item);

    this.applyItemEffects(character, item, false);
    this.recalculateStats(character);

    return true;
  }

  private static getEquipSlot(itemType: string): keyof Equipment | null {
    switch (itemType) {
      case 'weapon':
        return 'weapon';
      case 'armor':
        return 'armor';
      case 'shield':
        return 'shield';
      case 'helmet':
        return 'helmet';
      case 'gauntlets':
        return 'gauntlets';
      case 'boots':
        return 'boots';
      case 'accessory':
        return 'accessory';
      default:
        return null;
    }
  }

  private static applyItemEffects(character: Character, item: Item, equipping: boolean): void {
    if (!item.effects) return;

    const multiplier = equipping ? 1 : -1;

    item.effects.forEach(effect => {
      switch (effect.type) {
        case 'stat':
          if (effect.target && effect.target in character.stats) {
            const statKey = effect.target;
            character.stats[statKey] += effect.value * multiplier;
          }
          break;
        case 'ac':
          character.ac += effect.value * multiplier;
          break;
      }
    });
  }

  public static useItem(character: Character, itemId: string): string {
    const itemIndex = character.inventory.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return 'Item not found';

    const item = character.inventory[itemIndex];
    if (item.type !== 'consumable') return 'Item cannot be used';

    let result = `${character.name} uses ${item.name}`;

    if (item.effects) {
      item.effects.forEach(effect => {
        switch (effect.type) {
          case 'heal':
            const oldHp = character.hp;
            character.heal(effect.value);
            result += ` and recovers ${character.hp - oldHp} HP`;
            break;
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

    this.removeItemFromInventory(character, itemId);
    return result + '!';
  }

  private static recalculateStats(character: Character): void {
    character.stats = { ...character.baseStats };
    character.ac = 10;

    Object.values(character.equipment).forEach(item => {
      if (item && item.effects) {
        this.applyItemEffects(character, item, true);
      }
    });
  }

  public static getItemDescription(item: Item): string {
    let description = item.name;

    if (!item.identified && Math.random() < 0.5) {
      return 'Unidentified Item';
    }

    if (item.cursed) {
      description += ' (Cursed)';
    }

    if (item.effects && item.effects.length > 0) {
      description += ' - ';
      const effectDescriptions = item.effects.map(effect => {
        switch (effect.type) {
          case 'damage':
            return `+${effect.value} damage`;
          case 'ac':
            return `+${effect.value} AC`;
          case 'stat':
            return `+${effect.value} ${effect.target}`;
          case 'heal':
            return `Heals ${effect.value} HP`;
          default:
            return 'Special effect';
        }
      });
      description += effectDescriptions.join(', ');
    }

    return description;
  }

  public static getInventoryWeight(character: Character): number {
    let weight = 0;

    character.inventory.forEach(item => {
      weight += item.weight * item.quantity;
    });

    Object.values(character.equipment).forEach(item => {
      if (item) {
        weight += item.weight;
      }
    });

    return weight;
  }

  public static getCarryCapacity(character: Character): number {
    return character.stats.strength * 10;
  }

  public static isEncumbered(character: Character): boolean {
    return this.getInventoryWeight(character) > this.getCarryCapacity(character);
  }

  public static identifyItem(character: Character, itemId: string): boolean {
    const item = character.inventory.find(i => i.id === itemId);
    if (!item || item.identified) return false;

    item.identified = true;
    return true;
  }

  public static generateRandomLoot(level: number): Item[] {
    const loot: Item[] = [];
    const numItems = 1 + Math.floor(Math.random() * 3);

    const availableItems = [
      'dagger',
      'sword',
      'leather_armor',
      'chain_mail',
      'small_shield',
      'healing_potion',
      'strength_ring',
    ];

    for (let i = 0; i < numItems; i++) {
      const itemId = availableItems[Math.floor(Math.random() * availableItems.length)];
      const item = this.getItem(itemId);

      if (item) {
        if (Math.random() < 0.3) {
          item.identified = false;
        }

        if (Math.random() < 0.1) {
          item.cursed = true;
          item.identified = false;
        }

        item.value += Math.floor(Math.random() * level * 10);

        loot.push(item);
      }
    }

    return loot;
  }
}
