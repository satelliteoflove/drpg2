import { Item } from '../types/GameTypes';
import { GAME_CONFIG } from './GameConstants';

// Class equipment restrictions
export const CLASS_EQUIPMENT_RESTRICTIONS = {
  Fighter: {
    weapons: ['all'],
    armor: ['all'],
    shields: ['all'],
  },
  Mage: {
    weapons: ['dagger', 'staff', 'wand'],
    armor: ['robe'],
    shields: ['none'],
  },
  Priest: {
    weapons: ['mace', 'staff', 'flail'], // No edged weapons
    armor: ['robe', 'leather', 'chain'],
    shields: ['small', 'medium'],
  },
  Thief: {
    weapons: ['dagger', 'sword', 'bow'],
    armor: ['leather', 'studded'],
    shields: ['small'],
  },
  Bishop: {
    weapons: ['mace', 'staff', 'flail'],
    armor: ['robe', 'leather'],
    shields: ['small'],
  },
  Samurai: {
    weapons: ['all'],
    armor: ['all'],
    shields: ['all'],
  },
  Lord: {
    weapons: ['all'],
    armor: ['all'],
    shields: ['all'],
  },
  Ninja: {
    weapons: ['all'],
    armor: ['all'],
    shields: ['all'],
  },
};

// Item templates for generation - Wizardry Gaiden IV Test Items
export const ITEM_TEMPLATES: Partial<Item>[] = [
  // === WEAPONS ===
  {
    id: 'short_sword',
    name: 'Short Sword',
    unidentifiedName: '?Sword',
    type: 'weapon',
    value: 10,
    weight: 3,
    effects: [{ type: 'damage', value: 6 }],
    classRestrictions: ['Fighter', 'Thief', 'Samurai', 'Lord', 'Ninja', 'Ranger'],
    identified: true, // Starts identified for basic testing
    cursed: false,
    blessed: false,
    enchantment: 0,
  },
  {
    id: 'muramasa',
    name: 'Muramasa',
    unidentifiedName: '?Katana',
    type: 'weapon',
    value: 15000,
    weight: 5,
    effects: [{ type: 'damage', value: 18 }], // 3d5+3 average
    classRestrictions: ['Fighter', 'Samurai', 'Lord'],
    identified: false,
    cursed: true, // Always cursed - cannot unequip
    blessed: false,
    enchantment: 3,
    description: 'A legendary cursed katana that thirsts for blood',
  },
  {
    id: 'staff_of_mogref',
    name: 'Staff of Power',
    unidentifiedName: '?Staff',
    type: 'weapon',
    value: 5000,
    weight: 2,
    effects: [{ type: 'damage', value: 6 }], // 1d4+2 average
    classRestrictions: ['Mage', 'Bishop'],
    identified: false,
    cursed: false,
    blessed: false,
    enchantment: 2,
    invokable: true,
    charges: 30,
    maxCharges: 30,
    spellId: 'POWER_STRIKE',
    description: 'A magical staff imbued with a powerful offensive spell',
  },
  
  // === ARMOR ===
  {
    id: 'leather_armor',
    name: 'Leather Armor',
    unidentifiedName: '?Armor',
    type: 'armor',
    value: 20,
    weight: 8,
    effects: [{ type: 'ac', value: 2 }],
    classRestrictions: ['Fighter', 'Priest', 'Thief', 'Bishop', 'Samurai', 'Lord', 'Ninja', 'Ranger'],
    identified: false,
    cursed: false,
    blessed: false,
    enchantment: 0,
  },
  {
    id: 'robe_of_evil',
    name: 'Robe of Evil',
    unidentifiedName: '?Robe',
    type: 'armor',
    value: 10000,
    weight: 2,
    effects: [{ type: 'ac', value: 4 }],
    classRestrictions: ['Mage', 'Bishop', 'Priest', 'Thief', 'Ninja'],
    alignmentRestrictions: ['Evil'],
    identified: false,
    cursed: false,
    blessed: false,
    enchantment: 0,
    description: 'Dark robes that corrupt the wearer\'s soul',
  },
  
  // === ACCESSORIES ===
  {
    id: 'shadow_cape',
    name: 'Shadow Cape',
    unidentifiedName: '?Cape',
    type: 'accessory',
    value: 500,
    weight: 1,
    effects: [{ type: 'ac', value: 1 }],
    classRestrictions: [], // All classes can use
    identified: false,
    cursed: false,
    blessed: false,
    enchantment: 0,
    description: 'A cape that seems to absorb light',
  },
  {
    id: 'ring_of_healing',
    name: 'Ring of Healing',
    unidentifiedName: '?Ring',
    type: 'accessory',
    value: 5000,
    weight: 0,
    effects: [], // Effect is through invocation
    classRestrictions: [],
    identified: false,
    cursed: false,
    blessed: false,
    enchantment: 0,
    invokable: true,
    charges: 10,
    maxCharges: 10,
    spellId: 'DIOS',
    description: 'A ring that channels healing magic',
  },
  
  // === CONSUMABLES ===
  {
    id: 'potion',
    name: 'Potion',
    unidentifiedName: '?Potion',
    type: 'consumable',
    value: 50,
    weight: 0.5,
    effects: [{ type: 'heal', value: 5 }], // 1d8 average
    classRestrictions: [],
    identified: false,
    charges: 1,
    maxCharges: 1,
    description: 'A basic healing potion',
  },
  {
    id: 'scroll_of_sleep',
    name: 'Scroll of Sleep',
    unidentifiedName: '?Scroll',
    type: 'consumable',
    value: 100,
    weight: 0.1,
    effects: [], // Effect is spell casting
    classRestrictions: [],
    identified: false,
    charges: 1,
    maxCharges: 1,
    spellId: 'SLEEP',
    description: 'A scroll containing the sleep spell',
  },
  {
    id: 'dios_stone',
    name: 'Dios Stone',
    unidentifiedName: '?Stone',
    type: 'consumable',
    value: 2000,
    weight: 0.3,
    effects: [{ type: 'heal', value: 5 }], // 1d8 average
    classRestrictions: [],
    identified: false,
    charges: 20,
    maxCharges: 20,
    description: 'A magical stone with multiple healing charges',
  },
];

// Function to get unidentified name for an item type
export function getUnidentifiedName(type: string): string {
  switch (type) {
    case 'weapon': return '?Weapon';
    case 'armor': return '?Armor';
    case 'shield': return '?Shield';
    case 'helmet': return '?Helmet';
    case 'gauntlets': return '?Gloves';
    case 'boots': return '?Boots';
    case 'accessory': return '?Accessory';
    case 'consumable': return '?Item';
    case 'special': return '?Special';
    default: return '?Unknown';
  }
}

// Function to check if a class can equip an item
export function canClassEquipItem(characterClass: string, item: Item): boolean {
  // If no class restrictions, anyone can use it
  if (!item.classRestrictions || item.classRestrictions.length === 0) {
    return true;
  }
  
  // Check if character's class is in the allowed list
  return item.classRestrictions.includes(characterClass);
}

// Function to check if alignment can use item
export function canAlignmentUseItem(alignment: string, item: Item): boolean {
  // If no alignment restrictions, anyone can use it
  if (!item.alignmentRestrictions || item.alignmentRestrictions.length === 0) {
    return true;
  }
  
  // Check if character's alignment is in the allowed list
  return item.alignmentRestrictions.includes(alignment as 'Good' | 'Neutral' | 'Evil');
}

// Generate a random item with properties
export function generateRandomItem(level: number = 1): Item {
  const templates = ITEM_TEMPLATES;
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  const item: Item = {
    id: template.id + '_' + Date.now(),
    name: template.name || 'Unknown Item',
    unidentifiedName: template.unidentifiedName || getUnidentifiedName(template.type || 'special'),
    type: template.type || 'special',
    value: template.value || 10,
    weight: template.weight || 1,
    identified: false, // Items start unidentified
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
  };
  
  // Random chance for special properties based on level
  const roll = Math.random();
  
  // Check for cursed
  if (roll < GAME_CONFIG.ITEMS.GENERATION.CURSED_CHANCE && !item.blessed) {
    item.cursed = true;
    item.enchantment = -1 - Math.floor(Math.random() * level);
  }
  // Check for blessed (cursed + blessed chance)
  else if (roll < (GAME_CONFIG.ITEMS.GENERATION.CURSED_CHANCE + 
                   GAME_CONFIG.ITEMS.GENERATION.BLESSED_CHANCE) && !item.cursed) {
    item.blessed = true;
    item.enchantment = 1 + Math.floor(Math.random() * Math.min(3, level));
  }
  // Check for minor enchantment (total enchantment chance)
  else if (roll < (GAME_CONFIG.ITEMS.GENERATION.CURSED_CHANCE + 
                   GAME_CONFIG.ITEMS.GENERATION.BLESSED_CHANCE + 
                   GAME_CONFIG.ITEMS.GENERATION.ENCHANTMENT_CHANCE)) {
    item.enchantment = 1 + Math.floor(Math.random() * Math.min(2, level));
  }
  
  // Adjust value based on enchantment
  if (item.enchantment !== 0) {
    item.value = Math.floor(item.value * (1 + item.enchantment * 
                            GAME_CONFIG.ITEMS.GENERATION.ENCHANTMENT_VALUE_MULT));
  }
  
  return item;
}