export const GAME_CONFIG = {
  CANVAS: {
    WIDTH: 1024,
    HEIGHT: 768,
  },

  ENCOUNTER: {
    RANDOM_RATE: 0.02,
    BASE_ZONE_RATE: 0.1,
    SURPRISE_CHANCE: 0.1,
    LEVEL_RATE_MULTIPLIER: 0.02,
    OVERRIDE_ZONE_RATES: {
      high_frequency: 0.08,
      low_frequency: 0.01,
      boss: 0.5,
      special_mobs: 0.15,
      treasure: 0.05,
      ambush: 1.0,
      safe: 0.0,
    },
    ZONE_GENERATION: {
      ENABLE_SAFE_ZONES: false,        // Safe zones around starting area
      ENABLE_BOSS_ZONES: false,       // Boss encounter zones (100% rate)
      ENABLE_SPECIAL_MOB_ZONES: false, // Special monster lairs (15% rate)
      ENABLE_HIGH_FREQUENCY_ZONES: false, // High encounter corridors (8% rate)
      ENABLE_TREASURE_ZONES: false,   // Treasure rooms with guardian encounters
      ENABLE_AMBUSH_ZONES: false,     // Guaranteed encounter traps
    },
  },

  CHARACTER: {
    MAX_PARTY_SIZE: 6,
    STARTING_GOLD_MIN: 50,
    STARTING_GOLD_MAX: 100,
    STARTING_AGE: {
      HUMAN: 18,
      ELF: 75,
      DWARF: 50,
      GNOME: 60,
      HOBBIT: 30,
    },
    AGE_VARIANCE: 5,
    STAT_MIN: 3,
    STAT_MAX: 18,
    LEVEL_UP_STAT_CHANCE: 0.3,
  },

  ITEMS: {
    IDENTIFICATION: {
      BASE_CHANCE: 0.5,                // Base 50% chance to identify
      BISHOP_BONUS: 0.25,              // Bishop gets +25% base bonus
      LEVEL_BONUS_BISHOP: 0.02,        // Bishop gets +2% per level
      LEVEL_BONUS_OTHER: 0.01,         // Other classes get +1% per level
      INT_BONUS_PER_2_POINTS: 0.05,   // +5% per 2 INT points over 10
      MAX_CHANCE: 0.95,                // Max 95% chance to identify
      CRITICAL_FAIL_THRESHOLD: 0.95,  // Roll > 95% causes curse
    },
    GENERATION: {
      CURSED_CHANCE: 0.1,              // 10% chance for cursed items
      BLESSED_CHANCE: 0.05,            // 5% chance for blessed items (0.10 to 0.15)
      ENCHANTMENT_CHANCE: 0.15,        // 15% chance for enchantment (0.15 to 0.30)
      ENCHANTMENT_VALUE_MULT: 0.5,     // Value increases by 50% per enchantment level
    },
    INVENTORY: {
      MAX_ITEMS_PER_CHARACTER: 20,     // Maximum items per character
    },
    SHOP: {
      IDENTIFY_COST_MULTIPLIER: 0.5,
      SELL_PRICE_MULTIPLIER: 0.5,
      UNCURSE_COST_MULTIPLIER: 1.0,
    },
  },

  COMBAT: {
    MONSTER_TURN_DELAY: 200, // Reduced from 1000ms to 200ms for more responsive combat
    MAX_RECURSION_DEPTH: 100,
  },

  DEATH_SYSTEM: {
    BASE_SURVIVAL_CHANCE: 0.5,
    DEATH_PENALTY_MULTIPLIER: 0.1,
    VITALITY_BONUS_DIVISOR: 2,
    LEVEL_BONUS_MULTIPLIER: 0.02,
    MIN_SURVIVAL_CHANCE: 0.1,
    ASH_CHANCE_FROM_DEATH: 0.5,
    ASH_CHANCE_MULTIPLIER: 0.15,
    LOST_CHANCE_FROM_ASH: 0.1,
    MAX_DEATHS_BEFORE_ASH: 5,
    VITALITY_LOSS_ON_DEATH: 1,
    VITALITY_LOSS_ON_ASH: 2,
    AGE_INCREASE_ON_DEATH: 1,
    AGE_INCREASE_ON_ASH: 5,
  },

  PARTY: {
    FORMATION_FRONT_SIZE: 3,
    FORMATION_BACK_SIZE: 3,
    REST_HP_HEAL_PERCENT: 0.1,
    REST_MP_HEAL_PERCENT: 0.2,
  },

  HP_BONUSES: {
    FIGHTER: 10,
    SAMURAI: 8,
    LORD: 8,
    NINJA: 6,
    PRIEST: 6,
    BISHOP: 4,
    THIEF: 4,
    MAGE: 3,
  } as const,

  MP_BASE: {
    MAGE_PRIEST_BASE: 3,
    HYBRID_CLASS_BASE: 2,
  },

  SPELLCASTER_CLASSES: ['Mage', 'Priest', 'Bishop', 'Samurai', 'Lord', 'Ninja'] as const,

  DUNGEON: {
    DEFAULT_WIDTH: 20,
    DEFAULT_HEIGHT: 20,
    MIN_ROOMS: 5,
    MAX_EXTRA_ROOMS: 5,
    MIN_ROOM_SIZE: 3,
    MAX_ROOM_EXTRA_SIZE: 5,
    ROOM_SEPARATION: 1,
    CORRIDOR_ATTEMPTS: 10,
    MIN_SPECIAL_TILES: 3,
    MAX_EXTRA_SPECIAL_TILES: 3,
    ENABLE_TREASURE_CHESTS: false,    // Generate treasure chests in dungeon
    ENABLE_DOORS: false,              // Generate doors in dungeon
    CHEST_CHANCE: 0.3,
    TRAP_CHANCE: 0.5,
    DOOR_CHANCE: 0.7,
    MIN_ENCOUNTER_ZONES: 3,
    MAX_EXTRA_ENCOUNTER_ZONES: 3,
    MIN_ZONE_SIZE: 3,
    MAX_ZONE_EXTRA_SIZE: 5,
  },

  EVENTS: {
    TRAP_BASE_DAMAGE: 5,
    TRAP_LEVEL_MULTIPLIER: 2,
    TREASURE_BASE_GOLD: 50,
    TREASURE_LEVEL_MULTIPLIER: 20,
    DARKNESS_DURATION: 10,
    SPINNER_MIN_ROTATIONS: 1,
    SPINNER_MAX_ROTATIONS: 3,
  },

  INVENTORY: {
    IDENTIFICATION_CHANCE: 0.1,
    VALUE_VARIATION: 0.1,
  },

  LOOT_SYSTEM: {
    // Party luck system configuration
    LUCK_SYSTEM: {
      // Drop rate bonus: +1% drop rate per point of total party luck above base
      DROP_RATE_PER_LUCK: 0.01,
      BASE_PARTY_LUCK: 60,     // 6 characters * 10 luck = baseline
      MAX_LUCK_BONUS: 2.0,     // Cap at 2x multiplier from luck

      // Rarity bonus: shifts rarity chances toward better items
      RARITY_LUCK_FACTOR: 0.002, // +0.2% rare/legendary chance per luck point
      MAX_RARITY_SHIFT: 0.15,     // Max 15% shift toward better rarities
    },

    RARITY_CHANCES: {
      common: 0.70,              // 70% of drops are common
      uncommon: 0.25,            // 25% are uncommon  
      rare: 0.04,                // 4% are rare
      legendary: 0.01            // 1% are legendary
    },
    RARITY_ENCHANTMENT_LEVELS: {
      common: { min: 0, max: 0 },       // No enchantment
      uncommon: { min: 1, max: 2 },     // +1 to +2
      rare: { min: 3, max: 4 },         // +3 to +4
      legendary: { min: 5, max: 7 }     // +5 to +7
    },
    RARITY_VALUE_MULTIPLIERS: {
      common: 1.0,
      uncommon: 2.0,
      rare: 4.0,
      legendary: 8.0
    },
  },

  AUTO_SAVE: {
    INTERVAL_MS: 30000,
  },

  INPUT: {
    KEY_REPEAT_DELAY: 150,
  },

  UI: {
    MESSAGE_FADE_TIME: 10000,
    MESSAGE_FADE_ENABLED: false,
    DEBUG_INFO_OFFSET: 10,
  },

  RENDERING: {
    TARGET_FPS: 60,
    MIN_FPS_THRESHOLD: 30,
    SPATIAL_PARTITION_CELL_SIZE: 32,
    MAX_SPRITE_CACHE_SIZE: 100,
    ENABLE_FRUSTUM_CULLING: true,
    ENABLE_DIRTY_RECTANGLE_TRACKING: true,
    LAYER_COMPOSITING: true,
    VSYNC: true,
  },

  COLORS: {
    BACKGROUND: '#000',
    DEBUG_TEXT: '#666',
    MAP_GRID: 'rgba(255, 255, 255, 0.1)',
    LAYER_BACKGROUND: '#111',
    PERFORMANCE_GOOD: '#0f0',
    PERFORMANCE_MODERATE: '#ff0',
    PERFORMANCE_POOR: '#f00',
  },

  DEBUG_MODE: false,
} as const;

export type CharacterClass = (typeof GAME_CONFIG.HP_BONUSES)[keyof typeof GAME_CONFIG.HP_BONUSES];
export type SpellcasterClass = (typeof GAME_CONFIG.SPELLCASTER_CLASSES)[number];
