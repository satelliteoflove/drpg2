import { Equipment } from '../types/GameTypes';

export const EQUIPMENT_SLOT_MAP: Record<string, keyof Equipment | null> = {
  weapon: 'weapon',
  armor: 'armor',
  helmet: 'helmet',
  gauntlets: 'gauntlets',
  shield: 'shield',
  boots: 'boots',
  accessory: 'accessory'
};

export class ItemUtils {
  static getEquipSlot(itemType: string): keyof Equipment | null {
    return EQUIPMENT_SLOT_MAP[itemType] ?? null;
  }
}
