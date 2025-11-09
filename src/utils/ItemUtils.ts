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

export const EQUIPMENT_SLOTS: Array<{ key: keyof Equipment; label: string }> = [
  { key: 'weapon', label: 'Weapon' },
  { key: 'armor', label: 'Armor' },
  { key: 'shield', label: 'Shield' },
  { key: 'helmet', label: 'Helmet' },
  { key: 'gauntlets', label: 'Gauntlets' },
  { key: 'boots', label: 'Boots' },
  { key: 'accessory', label: 'Accessory' },
];

export const EQUIPMENT_SLOT_KEYS: Array<keyof Equipment> = EQUIPMENT_SLOTS.map(slot => slot.key);

export class ItemUtils {
  static getEquipSlot(itemType: string): keyof Equipment | null {
    return EQUIPMENT_SLOT_MAP[itemType] ?? null;
  }
}
