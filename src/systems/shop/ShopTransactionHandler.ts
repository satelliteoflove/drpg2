import { GameState, Item } from '../../types/GameTypes';
import { Character } from '../../entities/Character';
import { DebugLogger } from '../../utils/DebugLogger';
import { GAME_CONFIG } from '../../config/GameConstants';

export interface TransactionResult {
  success: boolean;
  message: string;
  item?: Item;
  cost?: number;
}

export class ShopTransactionHandler {
  private gameState: GameState;
  private messageLog: any;

  constructor(gameState: GameState, messageLog: any) {
    this.gameState = gameState;
    this.messageLog = messageLog;
  }

  public buyItem(item: Item, buyer: Character): TransactionResult {
    if (!item || !buyer) {
      return {
        success: false,
        message: 'Invalid transaction parameters'
      };
    }

    if (buyer.gold < item.value) {
      return {
        success: false,
        message: `${buyer.name} doesn't have enough gold (need ${item.value}g)`
      };
    }

    const maxInventory = 10;
    if (buyer.inventory.length >= maxInventory) {
      return {
        success: false,
        message: `${buyer.name}'s inventory is full (${maxInventory} items max)`
      };
    }

    buyer.gold -= item.value;
    buyer.inventory.push({ ...item });

    DebugLogger.info('ShopTransactionHandler',
      `${buyer.name} purchased ${item.name} for ${item.value}g`);

    return {
      success: true,
      message: `${buyer.name} bought ${item.name} for ${item.value}g`,
      item: item,
      cost: item.value
    };
  }

  public sellItem(item: Item, seller: Character): TransactionResult {
    if (!item || !seller) {
      return {
        success: false,
        message: 'Invalid transaction parameters'
      };
    }

    const itemIndex = seller.inventory.indexOf(item);
    if (itemIndex === -1) {
      return {
        success: false,
        message: `${seller.name} doesn't have that item`
      };
    }

    const sellPrice = Math.floor(item.value * 0.5);

    seller.inventory.splice(itemIndex, 1);
    seller.gold += sellPrice;

    DebugLogger.info('ShopTransactionHandler',
      `${seller.name} sold ${item.name} for ${sellPrice}g`);

    return {
      success: true,
      message: `${seller.name} sold ${item.name} for ${sellPrice}g`,
      item: item,
      cost: sellPrice
    };
  }

  public identifyItem(item: Item, character: Character): TransactionResult {
    if (!item || !character) {
      return {
        success: false,
        message: 'Invalid identification parameters'
      };
    }

    const identifyCost = Math.floor(item.value * GAME_CONFIG.ITEMS.SHOP.IDENTIFY_COST_MULTIPLIER);

    if (character.gold < identifyCost) {
      return {
        success: false,
        message: `Not enough gold to identify (need ${identifyCost}g)`
      };
    }

    if (item.identified) {
      return {
        success: false,
        message: 'Item is already identified'
      };
    }

    character.gold -= identifyCost;
    item.identified = true;

    DebugLogger.info('ShopTransactionHandler',
      `Identified ${item.name} for ${identifyCost}g`);

    return {
      success: true,
      message: `Identified: ${item.name}`,
      item: item,
      cost: identifyCost
    };
  }

  public healCharacter(character: Character, healType: 'partial' | 'full'): TransactionResult {
    if (!character) {
      return {
        success: false,
        message: 'Invalid heal parameters'
      };
    }

    const healCost = healType === 'full' ? 50 : 20;
    const pooledGold = this.gameState.party.pooledGold || 0;

    if (pooledGold < healCost) {
      return {
        success: false,
        message: `Not enough pooled gold (need ${healCost}g)`
      };
    }

    const healAmount = healType === 'full'
      ? character.maxHp - character.hp
      : Math.min(20, character.maxHp - character.hp);

    if (healAmount === 0) {
      return {
        success: false,
        message: `${character.name} is already at full health`
      };
    }

    this.gameState.party.pooledGold -= healCost;
    character.hp += healAmount;

    DebugLogger.info('ShopTransactionHandler',
      `Healed ${character.name} for ${healAmount} HP (cost: ${healCost}g)`);

    return {
      success: true,
      message: `${character.name} restored ${healAmount} HP for ${healCost}g`,
      cost: healCost
    };
  }

  public resurrectCharacter(character: Character): TransactionResult {
    if (!character) {
      return {
        success: false,
        message: 'Invalid resurrection parameters'
      };
    }

    if (!character.isDead) {
      return {
        success: false,
        message: `${character.name} is not dead`
      };
    }

    const resurrectCost = 500;
    const pooledGold = this.gameState.party.pooledGold || 0;

    if (pooledGold < resurrectCost) {
      return {
        success: false,
        message: `Not enough pooled gold (need ${resurrectCost}g)`
      };
    }

    this.gameState.party.pooledGold -= resurrectCost;
    character.isDead = false;
    character.hp = 1;
    character.deathCount++;

    DebugLogger.info('ShopTransactionHandler',
      `Resurrected ${character.name} for ${resurrectCost}g`);

    return {
      success: true,
      message: `${character.name} has been resurrected for ${resurrectCost}g`,
      cost: resurrectCost
    };
  }

  public poolPartyGold(): void {
    let totalGold = 0;
    const party = this.gameState.party.characters;

    if (party.length === 0) {
      return;
    }

    for (const character of party) {
      totalGold += character.gold;
      character.gold = 0;
    }

    party[0].gold = totalGold;

    DebugLogger.info('ShopTransactionHandler',
      `Pooled ${totalGold}g to ${party[0].name}`);

    this.messageLog?.addSystemMessage(`Pooled ${totalGold}g to ${party[0].name}`);
  }

  public distributePooledGold(): void {
    const pooledGold = this.gameState.party.pooledGold || 0;
    if (pooledGold === 0) {
      this.messageLog?.addSystemMessage('No pooled gold to distribute');
      return;
    }

    const aliveCharacters = this.gameState.party.getAliveCharacters();
    if (aliveCharacters.length === 0) {
      this.messageLog?.addWarningMessage('No alive party members to distribute gold to');
      return;
    }

    const goldPerCharacter = Math.floor(pooledGold / aliveCharacters.length);
    const remainder = pooledGold % aliveCharacters.length;

    for (let i = 0; i < aliveCharacters.length; i++) {
      const character = aliveCharacters[i];
      character.gold += goldPerCharacter;
      if (i === 0) {
        character.gold += remainder;
      }
    }

    this.gameState.party.pooledGold = 0;

    DebugLogger.info('ShopTransactionHandler',
      `Distributed ${pooledGold}g to ${aliveCharacters.length} party members`);

    this.messageLog?.addSystemMessage(
      `Distributed ${pooledGold}g among ${aliveCharacters.length} party members`
    );
  }
}