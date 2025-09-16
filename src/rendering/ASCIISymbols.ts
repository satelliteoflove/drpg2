// Central repository for all ASCII symbols used in the game
// This ensures consistency across all scenes and makes symbols easily changeable

export const ASCII_SYMBOLS = {
  // Dungeon Environment
  WALL: '#',
  WALL_CORNER: '+',
  FLOOR: '.',
  DOOR_CLOSED: '+',
  DOOR_OPEN: '/',
  DOOR_LOCKED: '*',
  STAIRS_UP: '<',
  STAIRS_DOWN: '>',
  CHEST: '=',
  CHEST_OPEN: '_',
  TRAP: '^',
  DARKNESS: ' ',

  // Entities - Player
  PLAYER: '@',
  PARTY: '@',

  // Entities - Monsters (by difficulty)
  MONSTER_WEAK: 'g', // goblins, kobolds, slimes
  MONSTER_MEDIUM: 'o', // orcs, ogres, wolves
  MONSTER_STRONG: 'D', // dragons, demons, giants
  MONSTER_UNDEAD: 'z', // zombies, skeletons, ghosts
  MONSTER_MAGIC: 'w', // wizards, witches, elementals
  MONSTER_BEAST: 'b', // bears, boars, basilisks
  MONSTER_HUMANOID: 'h', // bandits, knights, assassins
  MONSTER_FLYING: 'v', // bats, birds, vampires
  MONSTER_AQUATIC: 'f', // fish, sharks, sea serpents
  MONSTER_BOSS: 'X', // boss monsters

  // Items
  ITEM_GENERIC: '!',
  ITEM_WEAPON: ')',
  ITEM_ARMOR: ']',
  ITEM_SHIELD: '[',
  ITEM_HELMET: '^',
  ITEM_BOOTS: 'd',
  ITEM_GLOVES: 'g',
  ITEM_RING: 'o',
  ITEM_AMULET: '"',
  ITEM_POTION: '!',
  ITEM_SCROLL: '?',
  ITEM_WAND: '/',
  ITEM_GOLD: '$',
  ITEM_GEM: '*',
  ITEM_FOOD: '%',
  ITEM_KEY: 'k',

  // UI Borders and Frames
  BORDER_HORIZONTAL: '-',
  BORDER_VERTICAL: '|',
  BORDER_CORNER_TL: '+',
  BORDER_CORNER_TR: '+',
  BORDER_CORNER_BL: '+',
  BORDER_CORNER_BR: '+',
  BORDER_T_DOWN: '+',
  BORDER_T_UP: '+',
  BORDER_T_LEFT: '+',
  BORDER_T_RIGHT: '+',
  BORDER_CROSS: '+',

  // UI Elements
  MENU_CURSOR: '>',
  MENU_CURSOR_ALT: '→',
  CHECKBOX_EMPTY: '[ ]',
  CHECKBOX_CHECKED: '[X]',
  RADIO_EMPTY: '( )',
  RADIO_SELECTED: '(*)',
  BUTTON_LEFT: '[',
  BUTTON_RIGHT: ']',
  SCROLL_UP: '▲',
  SCROLL_DOWN: '▼',
  SCROLL_BAR: '█',
  SCROLL_TRACK: '░',

  // Status Indicators
  HEALTH_FULL: '♥',
  HEALTH_EMPTY: '♡',
  HEALTH_BAR_FULL: '█',
  HEALTH_BAR_EMPTY: '░',
  MANA_FULL: '♦',
  MANA_EMPTY: '♢',

  // Character Status
  STATUS_OK: 'O',
  STATUS_POISON: 'P',
  STATUS_SLEEP: 'S',
  STATUS_PARALYZED: 'Z',
  STATUS_CONFUSED: '?',
  STATUS_BLIND: 'B',
  STATUS_SILENCED: 'M',
  STATUS_DEAD: 'X',
  STATUS_STONE: '#',
  STATUS_BLESSED: '+',
  STATUS_CURSED: '-',

  // Town Locations
  TOWN_CASTLE: 'C',
  TOWN_SHOP: 'B', // Boltac's
  TOWN_TEMPLE: 'T',
  TOWN_INN: 'I',
  TOWN_TAVERN: 'A', // Adventurer's
  TOWN_EDGE: 'E',
  TOWN_TRAINING: 'G', // Grounds

  // Combat Indicators
  COMBAT_HIT: '*',
  COMBAT_MISS: '.',
  COMBAT_CRITICAL: '!',
  COMBAT_BLOCK: '#',
  COMBAT_DODGE: '~',

  // Special Effects
  EFFECT_FIRE: '*',
  EFFECT_ICE: '+',
  EFFECT_LIGHTNING: '!',
  EFFECT_POISON: '~',
  EFFECT_HOLY: '+',
  EFFECT_DARK: '#',
  EFFECT_EXPLOSION: '*',

  // Numbers and Letters (for reference)
  NUMBERS: '0123456789',
  LETTERS_UPPER: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  LETTERS_LOWER: 'abcdefghijklmnopqrstuvwxyz',

  // Misc
  EMPTY: ' ',
  UNKNOWN: '?',
  ERROR: '!',
  PLACEHOLDER: '.',
} as const;

// Type for symbol keys
export type ASCIISymbolKey = keyof typeof ASCII_SYMBOLS;

// Symbol categories for easier filtering
export const SYMBOL_CATEGORIES = {
  ENVIRONMENT: ['WALL', 'FLOOR', 'DOOR_CLOSED', 'DOOR_OPEN', 'STAIRS_UP', 'STAIRS_DOWN', 'CHEST'],
  ENTITIES: ['PLAYER', 'MONSTER_WEAK', 'MONSTER_MEDIUM', 'MONSTER_STRONG', 'MONSTER_BOSS'],
  ITEMS: ['ITEM_WEAPON', 'ITEM_ARMOR', 'ITEM_POTION', 'ITEM_SCROLL', 'ITEM_GOLD'],
  UI: ['BORDER_HORIZONTAL', 'BORDER_VERTICAL', 'MENU_CURSOR', 'HEALTH_FULL', 'MANA_FULL'],
  STATUS: ['STATUS_OK', 'STATUS_POISON', 'STATUS_SLEEP', 'STATUS_DEAD'],
} as const;

// Color schemes for different symbol types
export const SYMBOL_COLORS = {
  // Environment colors
  WALL: { foreground: '#888888', background: '#000000' },
  FLOOR: { foreground: '#666666', background: '#000000' },
  DOOR_CLOSED: { foreground: '#8B4513', background: '#000000' },
  DOOR_OPEN: { foreground: '#8B4513', background: '#000000' },
  STAIRS_UP: { foreground: '#FFFF00', background: '#000000' },
  STAIRS_DOWN: { foreground: '#FFFF00', background: '#000000' },
  CHEST: { foreground: '#FFD700', background: '#000000' },

  // Entity colors
  PLAYER: { foreground: '#FFFFFF', background: '#000000' },
  MONSTER_WEAK: { foreground: '#00FF00', background: '#000000' },
  MONSTER_MEDIUM: { foreground: '#FFA500', background: '#000000' },
  MONSTER_STRONG: { foreground: '#FF0000', background: '#000000' },
  MONSTER_BOSS: { foreground: '#FF00FF', background: '#000000' },

  // Item colors
  ITEM_WEAPON: { foreground: '#C0C0C0', background: '#000000' },
  ITEM_ARMOR: { foreground: '#808080', background: '#000000' },
  ITEM_POTION: { foreground: '#FF1493', background: '#000000' },
  ITEM_SCROLL: { foreground: '#DDA0DD', background: '#000000' },
  ITEM_GOLD: { foreground: '#FFD700', background: '#000000' },

  // UI colors
  BORDER: { foreground: '#FFFFFF', background: '#000000' },
  MENU_CURSOR: { foreground: '#00FF00', background: '#000000' },
  HEALTH_FULL: { foreground: '#FF0000', background: '#000000' },
  MANA_FULL: { foreground: '#0000FF', background: '#000000' },

  // Status colors
  STATUS_OK: { foreground: '#00FF00', background: '#000000' },
  STATUS_POISON: { foreground: '#00FF00', background: '#000000' },
  STATUS_DEAD: { foreground: '#FF0000', background: '#000000' },
} as const;

// Helper functions for symbol manipulation
export class SymbolUtils {
  // Get symbol with fallback
  public static getSymbol(key: ASCIISymbolKey, fallback: string = '?'): string {
    return ASCII_SYMBOLS[key] || fallback;
  }

  // Check if a character is a valid symbol
  public static isValidSymbol(char: string): boolean {
    return Object.values(ASCII_SYMBOLS).includes(char as any);
  }

  // Get symbol key by character
  public static getSymbolKey(char: string): ASCIISymbolKey | null {
    for (const [key, value] of Object.entries(ASCII_SYMBOLS)) {
      if (value === char) {
        return key as ASCIISymbolKey;
      }
    }
    return null;
  }

  // Get color for a symbol
  public static getSymbolColor(
    key: ASCIISymbolKey
  ): (typeof SYMBOL_COLORS)[keyof typeof SYMBOL_COLORS] | null {
    return (SYMBOL_COLORS as any)[key] || null;
  }

  // Create a legend string for debugging
  public static createLegend(category?: keyof typeof SYMBOL_CATEGORIES): string {
    const lines: string[] = ['=== ASCII Symbol Legend ==='];

    if (category) {
      const symbols = SYMBOL_CATEGORIES[category];
      symbols.forEach((key) => {
        const symbol = ASCII_SYMBOLS[key as ASCIISymbolKey];
        lines.push(`${symbol} = ${key}`);
      });
    } else {
      Object.entries(ASCII_SYMBOLS).forEach(([key, value]) => {
        if (typeof value === 'string' && value.length === 1) {
          lines.push(`${value} = ${key}`);
        }
      });
    }

    return lines.join('\n');
  }
}
