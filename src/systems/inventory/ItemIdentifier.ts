import { Character } from '../../entities/Character';
import { Item } from '../../types/GameTypes';
import { GAME_CONFIG } from '../../config/GameConstants';
import { ItemManager } from './ItemManager';
import { ItemDescriptionFormatter } from './ItemDescriptionFormatter';

export class ItemIdentifier {
  private static instance: ItemIdentifier | null = null;

  public static getInstance(): ItemIdentifier {
    if (!ItemIdentifier.instance) {
      ItemIdentifier.instance = new ItemIdentifier(
        ItemManager.getInstance(),
        ItemDescriptionFormatter.getInstance()
      );
    }
    return ItemIdentifier.instance;
  }

  constructor(
    private itemManager: ItemManager,
    private descriptionFormatter: ItemDescriptionFormatter
  ) {}

  public identifyItem(
    character: Character,
    itemId: string
  ): {
    success: boolean;
    cursed?: boolean;
    message: string;
  } {
    const validation = this.validateItemForIdentification(character, itemId);
    if (!validation.valid) {
      return validation.result;
    }

    const item = validation.item;
    const { successRate, curseRisk } = this.calculateIdentificationRates(character);

    const identifyRoll = Math.random();
    const curseRoll = Math.random();

    const cursedResult = this.handleCursedIdentification(
      item,
      character,
      itemId,
      identifyRoll,
      successRate,
      curseRoll,
      curseRisk
    );
    if (cursedResult) {
      return cursedResult;
    }

    if (identifyRoll < successRate) {
      item.identified = true;
      return {
        success: true,
        cursed: item.cursed,
        message: `Identified: ${this.descriptionFormatter.getItemDescription(item)}`,
      };
    } else {
      return {
        success: false,
        message: 'Failed to identify the item',
      };
    }
  }

  private validateItemForIdentification(
    character: Character,
    itemId: string
  ):
    | { valid: false; result: { success: boolean; cursed?: boolean; message: string } }
    | { valid: true; item: Item } {
    const item = character.inventory.find((i) => i.id === itemId);

    if (!item) {
      return { valid: false, result: { success: false, message: 'Item not found' } };
    }

    if (item.identified) {
      return { valid: false, result: { success: false, message: 'Item already identified' } };
    }

    if (character.class !== 'Bishop') {
      return {
        valid: false,
        result: {
          success: false,
          message: 'Only Bishops can identify items. Visit a shop for identification service.',
        },
      };
    }

    return { valid: true, item };
  }

  private calculateIdentificationRates(character: Character): {
    successRate: number;
    curseRisk: number;
  } {
    const successRate = Math.min(
      GAME_CONFIG.ITEMS.IDENTIFICATION.MAX_CHANCE,
      character.level * GAME_CONFIG.ITEMS.IDENTIFICATION.BISHOP_LEVEL_MULTIPLIER +
        GAME_CONFIG.ITEMS.IDENTIFICATION.BISHOP_BASE_CHANCE
    );

    const curseRisk = Math.max(
      0,
      GAME_CONFIG.ITEMS.IDENTIFICATION.CURSE_BASE_RISK -
        character.level * GAME_CONFIG.ITEMS.IDENTIFICATION.CURSE_LEVEL_REDUCTION
    );

    return { successRate, curseRisk };
  }

  private handleCursedIdentification(
    item: Item,
    character: Character,
    itemId: string,
    identifyRoll: number,
    successRate: number,
    curseRoll: number,
    curseRisk: number
  ): { success: boolean; cursed?: boolean; message: string } | null {
    if (!item.cursed || curseRoll >= curseRisk || item.equipped) {
      return null;
    }

    const equipped = this.itemManager.equipItem(character, itemId);
    if (!equipped) {
      return null;
    }

    item.identified = true;

    if (identifyRoll < successRate) {
      return {
        success: true,
        cursed: true,
        message: `Identified ${item.name} but it's cursed and bonds to ${character.name}!`,
      };
    } else {
      return {
        success: false,
        cursed: true,
        message: `Failed to identify, but the ${item.name} is cursed and bonds to ${character.name}!`,
      };
    }
  }
}
