import { Character } from '../entities/Character';
import { Equipment, Item, ItemRarity, Monster } from '../types/GameTypes';
import {
  ITEM_TEMPLATES,
  canAlignmentUseItem,
  canClassEquipItem,
  generateRandomItem,
} from '../config/ItemProperties';
import { GAME_CONFIG } from '../config/GameConstants';
import { DataLoader } from '../utils/DataLoader';
import { DebugLogger } from '../utils/DebugLogger';

interface LootDebugData {
  dungeonLevel: number;
  dungeonMultiplier: number;
  luckMultiplier: number;
  totalMultiplier: number;
  lastRarityRolls: string[];
}

export class InventorySystem {
  private static items: Map<string, Item> = new Map();
  private static debugData: LootDebugData = {
    dungeonLevel: 1,
    dungeonMultiplier: 1.0,
    luckMultiplier: 1.0,
    totalMultiplier: 1.0,
    lastRarityRolls: [],
  };

  static {
    this.initializeItems();
  }

  private static initializeItems(): void {
    // Convert templates to full items with default values
    const items: Item[] = ITEM_TEMPLATES.map((template) => ({
      id: template.id || 'unknown',
      name: template.name || 'Unknown Item',
      unidentifiedName: template.unidentifiedName,
      type: template.type || 'special',
      value: template.value || 10,
      weight: template.weight || 1,
      identified: template.identified !== undefined ? template.identified : false, // Preserve template setting
      cursed: template.cursed || false,
      blessed: template.blessed || false,
      enchantment: template.enchantment || 0,
      equipped: false,
      quantity: 1,
      effects: template.effects || [],
      classRestrictions: template.classRestrictions,
      alignmentRestrictions: template.alignmentRestrictions,
      invokable: template.invokable,
      spellId: template.spellId,
      charges: template.charges,
      maxCharges: template.maxCharges,
      description: template.description,
    }));

    items.forEach((item) => {
      this.items.set(item.id, item);
    });
  }

  public static getItem(itemId: string): Item | null {
    const template = this.items.get(itemId);
    if (!template) return null;

    return { ...template };
  }

  public static addItemToInventory(character: Character, itemOrId: string | Item): boolean {
    let item: Item | null;

    if (typeof itemOrId === 'string') {
      item = this.getItem(itemOrId);
      if (!item) return false;
    } else {
      item = itemOrId;
    }

    // Only stack identified consumables with the same ID
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
      // For unidentified items or non-consumables, always add as a new inventory slot
      character.inventory.push(item);
    }

    return true;
  }

  public static removeItemFromInventory(character: Character, itemId: string): boolean {
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

  public static equipItem(character: Character, itemId: string): boolean {
    const itemIndex = character.inventory.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return false;

    const item = character.inventory[itemIndex];
    if (item.type === 'consumable') return false;

    // Check class restrictions
    if (!canClassEquipItem(character.class, item)) {
      return false; // Character's class cannot equip this item
    }

    // Check alignment restrictions
    if (!canAlignmentUseItem(character.alignment, item)) {
      return false; // Character's alignment cannot use this item
    }

    const equipSlot = this.getEquipSlot(item.type);
    if (!equipSlot) return false;

    const currentEquipped = character.equipment[equipSlot];
    if (currentEquipped) {
      // Cannot unequip cursed items to replace them
      if (currentEquipped.cursed) {
        return false; // Cursed item blocks new equipment
      }
      this.unequipItem(character, equipSlot);
    }

    character.equipment[equipSlot] = item;
    item.equipped = true;
    character.inventory.splice(itemIndex, 1);

    // If item is cursed and unidentified, identify it upon equipping
    if (item.cursed && !item.identified) {
      item.identified = true; // Curse reveals itself when equipped
    }

    this.applyItemEffects(character, item, true);
    this.recalculateStats(character);

    return true;
  }

  public static unequipItem(character: Character, equipSlot: keyof Equipment): boolean {
    const item = character.equipment[equipSlot];
    if (!item) return false;

    // Cannot unequip cursed items
    if (item.cursed) {
      return false; // Cursed items cannot be removed
    }

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

    item.effects.forEach((effect) => {
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
    const itemIndex = character.inventory.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return 'Item not found';

    const item = character.inventory[itemIndex];
    if (item.type !== 'consumable' && !item.invokable) return 'Item cannot be used';

    let result = `${character.name} uses ${item.name}`;

    // Handle spell scrolls or invokable items
    if (item.spellId) {
      result += ` and casts ${item.spellId}`;
      // TODO: Implement spell casting logic here
    }

    // Handle regular item effects
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

    // Handle charges
    if (item.charges !== undefined && item.charges > 0) {
      item.charges--;
      if (item.charges === 0) {
        // Remove item if out of charges
        this.removeItemFromInventory(character, itemId);
        result += ' (depleted)';
      } else {
        result += ` (${item.charges} charges remaining)`;
      }
    } else if (item.type === 'consumable' && !item.maxCharges) {
      // Single-use consumables without charges
      this.removeItemFromInventory(character, itemId);
    }

    return result + '!';
  }

  private static recalculateStats(character: Character): void {
    character.stats = { ...character.baseStats };
    character.ac = 10;

    Object.values(character.equipment).forEach((item) => {
      if (item && item.effects) {
        this.applyItemEffects(character, item, true);
      }
    });
  }

  public static getItemDescription(item: Item): string {
    // If not identified, show the unidentified name
    if (!item.identified) {
      return item.unidentifiedName || '?Unknown';
    }

    // Build the full name with enchantment and properties
    let description = item.name;

    // Add rarity indicator if identified and not common
    if (item.identified && item.rarity && item.rarity !== 'common') {
      description = `[${item.rarity.toUpperCase()}] ${description}`;
    }

    // Add enchantment level
    if (item.enchantment !== 0) {
      const sign = item.enchantment > 0 ? '+' : '';
      description = description.replace(item.name, `${item.name} ${sign}${item.enchantment}`);
    }

    // Add status indicators
    const statuses = [];
    if (item.cursed) statuses.push('Cursed');
    if (item.blessed) statuses.push('Blessed');

    if (statuses.length > 0) {
      description += ` (${statuses.join(', ')})`;
    }

    // Add charges for consumables/invokables
    if (item.charges !== undefined && item.maxCharges !== undefined) {
      description += ` [${item.charges}/${item.maxCharges}]`;
    }

    if (item.effects && item.effects.length > 0) {
      description += ' - ';
      const effectDescriptions = item.effects.map((effect) => {
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

  public static getCarryCapacity(character: Character): number {
    return character.stats.strength * 10;
  }

  public static isEncumbered(character: Character): boolean {
    return this.getInventoryWeight(character) > this.getCarryCapacity(character);
  }

  public static identifyItem(
    character: Character,
    itemId: string
  ): {
    success: boolean;
    cursed?: boolean;
    message: string;
  } {
    const item = character.inventory.find((i) => i.id === itemId);

    if (!item) {
      return { success: false, message: 'Item not found' };
    }

    if (item.identified) {
      return { success: false, message: 'Item already identified' };
    }

    // Only Bishops can identify items (authentic Wizardry mechanic)
    if (character.class !== 'Bishop') {
      return {
        success: false,
        message: 'Only Bishops can identify items. Visit a shop for identification service.',
      };
    }

    // Calculate success rate using authentic Wizardry formula: (Level × 5%) + 10%
    const successRate = Math.min(
      GAME_CONFIG.ITEMS.IDENTIFICATION.MAX_CHANCE,
      character.level * GAME_CONFIG.ITEMS.IDENTIFICATION.BISHOP_LEVEL_MULTIPLIER +
        GAME_CONFIG.ITEMS.IDENTIFICATION.BISHOP_BASE_CHANCE
    );

    // Calculate curse risk using authentic Wizardry formula: 35% - (Level × 3%)
    const curseRisk = Math.max(
      0,
      GAME_CONFIG.ITEMS.IDENTIFICATION.CURSE_BASE_RISK -
        character.level * GAME_CONFIG.ITEMS.IDENTIFICATION.CURSE_LEVEL_REDUCTION
    );

    const identifyRoll = Math.random();
    const curseRoll = Math.random();

    // Check for curse risk (happens regardless of identification success)
    if (item.cursed && curseRoll < curseRisk && !item.equipped) {
      // Force equip the cursed item
      const equipped = this.equipItem(character, itemId);
      if (equipped) {
        item.identified = true; // Curse reveals itself

        if (identifyRoll < successRate) {
          // Identified successfully but still got cursed
          return {
            success: true,
            cursed: true,
            message: `Identified ${item.name} but it's cursed and bonds to ${character.name}!`,
          };
        } else {
          // Failed to identify and got cursed
          return {
            success: false,
            cursed: true,
            message: `Failed to identify, but the ${item.name} is cursed and bonds to ${character.name}!`,
          };
        }
      }
    }

    // Check identification success
    if (identifyRoll < successRate) {
      // Success!
      item.identified = true;
      return {
        success: true,
        cursed: item.cursed,
        message: `Identified: ${this.getItemDescription(item)}`,
      };
    } else {
      // Normal failure
      return {
        success: false,
        message: 'Failed to identify the item',
      };
    }
  }

  public static tradeItem(
    fromCharacter: Character,
    toCharacter: Character,
    itemId: string
  ): boolean {
    const itemIndex = fromCharacter.inventory.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return false;

    const item = fromCharacter.inventory[itemIndex];

    // Check if recipient can carry the additional weight
    const itemWeight = item.weight * item.quantity;
    if (this.getInventoryWeight(toCharacter) + itemWeight > this.getCarryCapacity(toCharacter)) {
      return false;
    }

    // Remove from sender
    fromCharacter.inventory.splice(itemIndex, 1);

    // Add to recipient (handle stacking for consumables)
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

  public static dropItem(character: Character, itemId: string): Item | null {
    const itemIndex = character.inventory.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return null;

    const item = character.inventory[itemIndex];

    // If it's equipped, unequip it first
    if (item.equipped) {
      const equipSlot = this.getEquipSlot(item.type);
      if (equipSlot) {
        this.unequipItem(character, equipSlot);
      }
    }

    // Remove from inventory
    if (item.quantity > 1) {
      item.quantity--;
      const droppedItem = { ...item, quantity: 1 };
      return droppedItem;
    } else {
      character.inventory.splice(itemIndex, 1);
      return item;
    }
  }

  public static generateRandomLoot(level: number): Item[] {
    const loot: Item[] = [];
    const numItems = 1 + Math.floor(Math.random() * 3);

    for (let i = 0; i < numItems; i++) {
      const item = generateRandomItem(level);
      loot.push(item);
    }

    return loot;
  }

  // New loot system with rarity and level scaling
  public static generateMonsterLoot(
    monsters: Monster[],
    partyLevel: number,
    dungeonLevel: number,
    partyCharacters: Character[]
  ): Item[] {
    const loot: Item[] = [];

    // Calculate loot multipliers
    const dungeonMultiplier = this.getDungeonLevelMultiplier(dungeonLevel);
    const luckMultiplier = this.calculatePartyLuckMultiplier(partyCharacters);
    const totalDropRateMultiplier = dungeonMultiplier * luckMultiplier;

    // Update debug data instead of console logging
    this.debugData = {
      dungeonLevel,
      dungeonMultiplier,
      luckMultiplier,
      totalMultiplier: totalDropRateMultiplier,
      lastRarityRolls: [],
    };

    for (const monster of monsters) {
      // Use new loot system if available, fall back to old system
      if (monster.lootDrops && monster.lootDrops.length > 0) {
        for (const drop of monster.lootDrops) {
          // Check level requirements
          if (drop.minLevel && partyLevel < drop.minLevel) continue;
          if (drop.maxLevel && partyLevel > drop.maxLevel) continue;

          // Apply multipliers to drop chance
          const modifiedChance = Math.min(1.0, drop.chance * totalDropRateMultiplier);

          // Roll for drop chance
          if (Math.random() < modifiedChance) {
            const item = this.createDroppedItem(drop.itemId, partyCharacters);
            if (item) {
              loot.push(item);
            }
          }
        }
      } else if (monster.itemDrops && monster.itemDrops.length > 0) {
        // Fall back to old system
        for (const drop of monster.itemDrops) {
          // Apply multipliers to drop chance
          const modifiedChance = Math.min(1.0, drop.chance * totalDropRateMultiplier);

          // Roll for drop chance
          if (Math.random() < modifiedChance) {
            const item = this.createDroppedItem(drop.itemId, partyCharacters);
            if (item) {
              loot.push(item);
            }
          }
        }
      }
    }

    return loot;
  }

  private static createDroppedItem(itemId: string, partyCharacters?: Character[]): Item | null {
    const baseItem = DataLoader.createItemInstance(itemId);
    if (!baseItem) return null;

    // Assign random rarity with luck bonus
    const rarity = this.rollItemRarity(partyCharacters);
    baseItem.rarity = rarity;

    // Apply rarity effects
    this.applyRarityEffects(baseItem, rarity);

    return baseItem;
  }

  private static rollItemRarity(partyCharacters?: Character[]): ItemRarity {
    const rand = Math.random();
    const baseChances = GAME_CONFIG.LOOT_SYSTEM.RARITY_CHANCES;

    // Create mutable chances object with number types
    const chances: {
      common: number;
      uncommon: number;
      rare: number;
      legendary: number;
    } = {
      common: baseChances.common,
      uncommon: baseChances.uncommon,
      rare: baseChances.rare,
      legendary: baseChances.legendary,
    };

    // Apply luck-based rarity shifting
    if (partyCharacters) {
      const totalLuck = partyCharacters.reduce((sum, char) => sum + (char.stats?.luck || 10), 0);
      const luckConfig = GAME_CONFIG.LOOT_SYSTEM.LUCK_SYSTEM;
      const luckBonus = (totalLuck - luckConfig.BASE_PARTY_LUCK) * luckConfig.RARITY_LUCK_FACTOR;
      const clampedLuckBonus = Math.max(
        -luckConfig.MAX_RARITY_SHIFT,
        Math.min(luckConfig.MAX_RARITY_SHIFT, luckBonus)
      );

      // Shift chances toward better rarities
      if (clampedLuckBonus > 0) {
        chances.common = Math.max(0.1, chances.common - clampedLuckBonus);
        chances.uncommon = Math.min(0.8, chances.uncommon + clampedLuckBonus * 0.3);
        chances.rare = Math.min(0.3, chances.rare + clampedLuckBonus * 0.4);
        chances.legendary = Math.min(0.2, chances.legendary + clampedLuckBonus * 0.3);
      }
    }

    let result: ItemRarity;
    if (rand < chances.common) {
      result = 'common';
    } else if (rand < chances.common + chances.uncommon) {
      result = 'uncommon';
    } else if (rand < chances.common + chances.uncommon + chances.rare) {
      result = 'rare';
    } else {
      result = 'legendary';
    }

    // Track rarity roll for debugging (keep only last 10)
    const totalLuck =
      partyCharacters?.reduce((sum, char) => sum + (char.stats?.luck || 10), 0) || 60;
    const rollInfo = `Roll: ${(rand * 100).toFixed(1)}% → ${result} (luck: ${totalLuck})`;
    this.debugData.lastRarityRolls.unshift(rollInfo);
    if (this.debugData.lastRarityRolls.length > 10) {
      this.debugData.lastRarityRolls.pop();
    }

    return result;
  }

  private static applyRarityEffects(item: Item, rarity: ItemRarity): void {
    const config = GAME_CONFIG.LOOT_SYSTEM;

    // Apply enchantment level based on rarity
    const enchantRange = config.RARITY_ENCHANTMENT_LEVELS[rarity];
    item.enchantment =
      enchantRange.min + Math.floor(Math.random() * (enchantRange.max - enchantRange.min + 1));

    // Apply value multiplier
    item.value = Math.floor(item.value * config.RARITY_VALUE_MULTIPLIERS[rarity]);

    // Update item name to reflect enchantment and rarity
    if (item.enchantment > 0) {
      item.name = `${item.name} +${item.enchantment}`;
    }

    // Update effects based on enchantment
    if (item.effects && item.enchantment > 0) {
      item.effects = item.effects.map((effect) => ({
        ...effect,
        value: effect.value + item.enchantment,
      }));
    }
  }

  public static getRarityColor(rarity?: ItemRarity): string {
    switch (rarity) {
      case 'uncommon':
        return '#00ff00'; // Green
      case 'rare':
        return '#0080ff'; // Blue
      case 'legendary':
        return '#ff8000'; // Orange
      default:
        return '#ffffff'; // White (common)
    }
  }

  // Helper method to get dungeon level drop rate multiplier from level data
  private static getDungeonLevelMultiplier(dungeonLevel: number): number {
    try {
      const levelData = DataLoader.loadEncounters(dungeonLevel);
      return levelData.dropRateMultiplier || 1.0; // Default to 1.0 if not specified
    } catch (error) {
      DebugLogger.warn(
        'InventorySystem',
        `Could not load drop multiplier for dungeon level ${dungeonLevel}, using default 1.0`,
        error
      );
      return 1.0;
    }
  }

  // Helper method to calculate party luck multiplier for drop rates
  private static calculatePartyLuckMultiplier(partyCharacters: Character[]): number {
    const totalLuck = partyCharacters.reduce((sum, char) => sum + (char.stats?.luck || 10), 0);
    const luckConfig = GAME_CONFIG.LOOT_SYSTEM.LUCK_SYSTEM;

    const luckDifference = totalLuck - luckConfig.BASE_PARTY_LUCK;
    const luckMultiplier = 1.0 + luckDifference * luckConfig.DROP_RATE_PER_LUCK;

    // Cap the luck multiplier at the maximum
    return Math.min(luckConfig.MAX_LUCK_BONUS, Math.max(0.1, luckMultiplier));
  }

  // Public method to get current loot debug data
  public static getLootDebugData(): LootDebugData {
    return { ...this.debugData };
  }
}
