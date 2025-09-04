import { Party } from '../entities/Party';
import { Character } from '../entities/Character';
import { Item } from '../types/GameTypes';
import { GAME_CONFIG } from '../config/GameConstants';
import { DebugLogger } from '../utils/DebugLogger';

export interface ShopTransaction {
  success: boolean;
  message: string;
  cost?: number;
}

export interface ShopInventory {
  items: Item[];
  categories: {
    weapons: Item[];
    armor: Item[];
    shields: Item[];
    accessories: Item[];
    consumables: Item[];
  };
}

export class ShopSystem {
  private static shopInventory: Item[] = [];

  static {
    this.initializeShopInventory();
  }

  private static initializeShopInventory(): void {
    // TODO: Load shop inventory from data files
    // For now, create a basic shop inventory
    this.shopInventory = [
      // Basic weapons
      {
        id: 'short_sword',
        name: 'Short Sword',
        unidentifiedName: 'Short Sword',
        type: 'weapon',
        value: 50,
        weight: 3,
        identified: true,
        cursed: false,
        blessed: false,
        enchantment: 0,
        equipped: false,
        quantity: 1,
        effects: [],
        classRestrictions: ['Fighter', 'Priest', 'Bishop', 'Samurai', 'Lord', 'Ninja'],
        alignmentRestrictions: [],
        rarity: 'common' as const
      },
      {
        id: 'leather_armor',
        name: 'Leather Armor',
        unidentifiedName: 'Leather Armor',
        type: 'armor',
        value: 30,
        weight: 5,
        identified: true,
        cursed: false,
        blessed: false,
        enchantment: 0,
        equipped: false,
        quantity: 1,
        effects: [],
        classRestrictions: [],
        alignmentRestrictions: [],
        rarity: 'common' as const
      }
    ];
  }

  public static getShopInventory(): ShopInventory {
    const categories = {
      weapons: this.shopInventory.filter(item => item.type === 'weapon'),
      armor: this.shopInventory.filter(item => item.type === 'armor'),
      shields: this.shopInventory.filter(item => item.type === 'shield'),
      accessories: this.shopInventory.filter(item => item.type === 'accessory'),
      consumables: this.shopInventory.filter(item => item.type === 'consumable')
    };

    return {
      items: [...this.shopInventory],
      categories
    };
  }

  public static buyItem(party: Party, item: Item, character: Character): ShopTransaction {
    const totalGold = party.getTotalGold();
    const cost = item.value;

    if (totalGold < cost) {
      return {
        success: false,
        message: `Not enough gold! Need ${cost} gold, but party only has ${totalGold}.`
      };
    }

    // Check if character can carry more items
    if (character.inventory.length >= GAME_CONFIG.ITEMS.INVENTORY.MAX_ITEMS_PER_CHARACTER) {
      return {
        success: false,
        message: `${character.name}'s inventory is full!`
      };
    }

    // Deduct gold from party (pooled gold system)
    this.deductGoldFromParty(party, cost);

    // Create a copy of the item for the character
    const purchasedItem: Item = {
      ...item,
      equipped: false,
      quantity: 1
    };

    character.inventory.push(purchasedItem);

    return {
      success: true,
      message: `${character.name} purchased ${item.name} for ${cost} gold.`,
      cost
    };
  }

  public static sellItem(party: Party, item: Item, character: Character): ShopTransaction {
    const itemIndex = character.inventory.indexOf(item);
    
    if (itemIndex === -1) {
      return {
        success: false,
        message: `${character.name} does not have this item.`
      };
    }

    if (item.equipped) {
      return {
        success: false,
        message: `Cannot sell equipped item. Unequip ${item.name} first.`
      };
    }

    if (item.cursed && item.equipped) {
      return {
        success: false,
        message: `Cannot sell cursed item ${item.name}. Remove curse first.`
      };
    }

    const sellPrice = Math.floor(item.value * GAME_CONFIG.ITEMS.SHOP.SELL_PRICE_MULTIPLIER);
    
    // Remove item from character's inventory
    character.inventory.splice(itemIndex, 1);

    // Distribute gold to party
    party.distributeGold(sellPrice);

    return {
      success: true,
      message: `Sold ${item.name} for ${sellPrice} gold.`,
      cost: sellPrice
    };
  }

  public static identifyItem(party: Party, item: Item): ShopTransaction {
    if (item.identified) {
      return {
        success: false,
        message: `${item.name} is already identified.`
      };
    }

    const cost = Math.floor(item.value * GAME_CONFIG.ITEMS.SHOP.IDENTIFY_COST_MULTIPLIER);
    const totalGold = party.getTotalGold();

    if (totalGold < cost) {
      return {
        success: false,
        message: `Not enough gold! Identification costs ${cost} gold, but party only has ${totalGold}.`
      };
    }

    // Deduct gold from party
    this.deductGoldFromParty(party, cost);

    // Identify the item
    item.identified = true;

    let message = `${item.name} has been identified for ${cost} gold.`;
    
    if (item.cursed) {
      message += ` WARNING: This item is cursed!`;
    }
    
    if (item.blessed) {
      message += ` This item is blessed!`;
    }
    
    if (item.enchantment > 0) {
      message += ` Enchantment: +${item.enchantment}`;
    } else if (item.enchantment < 0) {
      message += ` Enchantment: ${item.enchantment}`;
    }

    return {
      success: true,
      message,
      cost
    };
  }

  public static uncurseItem(party: Party, item: Item): ShopTransaction {
    if (!item.cursed) {
      return {
        success: false,
        message: `${item.name} is not cursed.`
      };
    }

    const cost = Math.floor(item.value * GAME_CONFIG.ITEMS.SHOP.UNCURSE_COST_MULTIPLIER);
    const totalGold = party.getTotalGold();

    if (totalGold < cost) {
      return {
        success: false,
        message: `Not enough gold! Curse removal costs ${cost} gold, but party only has ${totalGold}.`
      };
    }

    // Deduct gold from party
    this.deductGoldFromParty(party, cost);

    // Remove curse
    item.cursed = false;

    // Unequip if currently equipped (curse removal allows this)
    if (item.equipped) {
      item.equipped = false;
    }

    return {
      success: true,
      message: `Curse removed from ${item.name} for ${cost} gold.`,
      cost
    };
  }

  public static viewGoldDistribution(party: Party): { totalGold: number; goldByCharacter: Array<{name: string, gold: number}> } {
    const goldByCharacter = party.characters.map(char => ({
      name: char.name,
      gold: char.gold
    }));

    return {
      totalGold: party.getTotalGold(),
      goldByCharacter
    };
  }

  public static poolGold(party: Party, targetCharacter?: Character): ShopTransaction {
    const totalGold = party.getTotalGold();
    
    if (totalGold === 0) {
      return {
        success: false,
        message: 'No gold to pool!'
      };
    }

    // If no target specified, pool to first character
    const recipient = targetCharacter || party.characters[0];
    
    // Collect all gold
    let collectedGold = 0;
    for (const char of party.characters) {
      if (char !== recipient) {
        collectedGold += char.gold;
        char.gold = 0;
      }
    }
    
    // Give all gold to recipient
    recipient.gold += collectedGold;
    
    return {
      success: true,
      message: `Pooled ${totalGold} gold to ${recipient.name}.`,
      cost: totalGold
    };
  }

  public static distributeGoldEvenly(party: Party): ShopTransaction {
    const totalGold = party.getTotalGold();
    const aliveChars = party.characters.filter(char => !char.isDead);
    
    if (aliveChars.length === 0) {
      return {
        success: false,
        message: 'No living characters to distribute gold to!'
      };
    }
    
    if (totalGold === 0) {
      return {
        success: false,
        message: 'No gold to distribute!'
      };
    }
    
    // Calculate even distribution
    const goldPerChar = Math.floor(totalGold / aliveChars.length);
    const remainder = totalGold % aliveChars.length;
    
    // Reset all gold
    party.characters.forEach(char => { char.gold = 0; });
    
    // Distribute evenly
    aliveChars.forEach((char, index) => {
      char.gold = goldPerChar + (index < remainder ? 1 : 0);
    });
    
    return {
      success: true,
      message: `Distributed ${totalGold} gold evenly among party members.`,
      cost: totalGold
    };
  }

  private static deductGoldFromParty(party: Party, amount: number): void {
    let remaining = amount;
    
    // Deduct from characters with gold, starting with those who have the most
    const charactersWithGold = party.characters
      .filter(char => char.gold > 0)
      .sort((a, b) => b.gold - a.gold);

    for (const character of charactersWithGold) {
      if (remaining <= 0) break;

      const deduction = Math.min(character.gold, remaining);
      character.gold -= deduction;
      remaining -= deduction;
    }

    if (remaining > 0) {
      DebugLogger.warn('ShopSystem', `Could not deduct full amount! ${remaining} gold remaining after deduction.`);
    }
  }

  public static getServiceCosts(item: Item): { identify: number; uncurse: number } {
    return {
      identify: Math.floor(item.value * GAME_CONFIG.ITEMS.SHOP.IDENTIFY_COST_MULTIPLIER),
      uncurse: Math.floor(item.value * GAME_CONFIG.ITEMS.SHOP.UNCURSE_COST_MULTIPLIER)
    };
  }
}