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
      ENABLE_SAFE_ZONES: true,
      ENABLE_BOSS_ZONES: true,
      ENABLE_SPECIAL_MOB_ZONES: true,
      ENABLE_HIGH_FREQUENCY_ZONES: true,
      ENABLE_TREASURE_ZONES: false,
      ENABLE_AMBUSH_ZONES: false,
      SAFE_ZONE_RADIUS: 3,
      SPECIAL_MOB_ZONES_PER_FLOOR: { min: 1, max: 2 },
      HIGH_FREQUENCY_ZONES_PER_FLOOR: { min: 2, max: 4 },
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
      FAERIE: 25,
      LIZMAN: 20,
      DRACON: 40,
      RAWULF: 16,
      MOOK: 15,
      FELPURR: 22,
    },
    AGE_VARIANCE: 5,
    STAT_MIN: 3,
    STAT_MAX: 18,
    LEVEL_UP_STAT_CHANCE: 0.3,
  },

  ITEMS: {
    IDENTIFICATION: {
      BISHOP_BASE_CHANCE: 0.1, // Bishop base 10% chance (authentic Wizardry)
      BISHOP_LEVEL_MULTIPLIER: 0.05, // Bishop gets 5% per level (authentic Wizardry)
      CURSE_BASE_RISK: 0.35, // Base 35% curse risk (authentic Wizardry)
      CURSE_LEVEL_REDUCTION: 0.03, // Reduce curse risk by 3% per level (authentic Wizardry)
      MAX_CHANCE: 1.0, // Max 100% chance at level 18
    },
    GENERATION: {
      CURSED_CHANCE: 0.1, // 10% chance for cursed items
      BLESSED_CHANCE: 0.05, // 5% chance for blessed items (0.10 to 0.15)
      ENCHANTMENT_CHANCE: 0.15, // 15% chance for enchantment (0.15 to 0.30)
      ENCHANTMENT_VALUE_MULT: 0.5, // Value increases by 50% per enchantment level
    },
    INVENTORY: {
      MAX_ITEMS_PER_CHARACTER: 20, // Maximum items per character
    },
    SHOP: {
      IDENTIFY_COST_MULTIPLIER: 0.5,
      SELL_PRICE_MULTIPLIER: 0.5,
      UNCURSE_COST_MULTIPLIER: 1.0,
    },
  },

  COMBAT: {
    MONSTER_TURN_DELAY: 800,
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
    VITALITY_LOSS_ON_ASH: 3,
    AGE_INCREASE_ON_DEATH: 1,
    AGE_INCREASE_ON_ASH: 10,
  },

  TEMPLE: {
    SERVICE_COSTS: {
      CURE_PARALYZED: 100,
      CURE_STONED: 100,
      RESURRECT_DEAD: 200,
      RESURRECT_ASHES: 500,
    },
    RESURRECTION: {
      DEAD_BASE_CHANCE: 0.5,
      DEAD_VITALITY_MULTIPLIER: 0.03,
      DEAD_LEVEL_BONUS: 0.02,
      ASHES_BASE_CHANCE: 0.4,
      ASHES_VITALITY_MULTIPLIER: 0.03,
      MAX_SUCCESS_CHANCE: 0.95,
      MIN_SUCCESS_CHANCE: 0.1,
      HP_RESTORED_ON_SUCCESS: 1,
    },
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
    ALCHEMIST: 4,
    BARD: 5,
    RANGER: 7,
    PSIONIC: 3,
    VALKYRIE: 7,
    MONK: 6,
  } as const,

  MP_BASE: {
    MAGE_PRIEST_BASE: 3,
    HYBRID_CLASS_BASE: 2,
  },

  SPELLCASTER_CLASSES: ['Mage', 'Priest', 'Bishop', 'Samurai', 'Lord', 'Ninja', 'Alchemist', 'Bard', 'Psionic', 'Valkyrie'] as const,

  MAGIC: {
    FIZZLE_PENALTIES: {
      PURE_CASTER: 0,        // Mage, Priest, Alchemist, Psionic
      BISHOP: 5,             // Bishop - multi-school caster
      HYBRID_CASTER: 10,     // Lord, Valkyrie, Ranger, Bard
      WARRIOR_CASTER: 15,    // Samurai, Monk, Ninja
      NON_CASTER: 20,        // Fighter, Thief - multiclass penalty
    },
    TEST_MODE: {
      DISABLE_FIZZLE: true, // Set to true in tests to disable spell fizzling
    },
  },

  DUNGEON: {
    DEFAULT_SEED: 'cannibal-king',
    DEFAULT_WIDTH: 30,
    DEFAULT_HEIGHT: 30,
    MIN_ROOMS: 5,
    MAX_EXTRA_ROOMS: 5,
    MIN_ROOM_SIZE: 3,
    MAX_ROOM_EXTRA_SIZE: 5,
    ROOM_SEPARATION: 1,
    CORRIDOR_ATTEMPTS: 10,
    MIN_SPECIAL_TILES: 3,
    MAX_EXTRA_SPECIAL_TILES: 3,
    ENABLE_TREASURE_CHESTS: false, // Generate treasure chests in dungeon
    ENABLE_DOORS: true,
    CHEST_CHANCE: 0.3,
    TRAP_CHANCE: 0.5,
    DOOR_CHANCE: 0.7,
    MIN_ENCOUNTER_ZONES: 3,
    MAX_EXTRA_ENCOUNTER_ZONES: 3,
    MIN_ZONE_SIZE: 3,
    MAX_ZONE_EXTRA_SIZE: 5,
    VIEW_DISTANCE: 3,
    TURN_ANIMATION_FRAMES: 4,
    TURN_FRAME_DURATION_MS: 50,
    MOVE_ANIMATION_FRAMES: 4,
    MOVE_FRAME_DURATION_MS: 50,
    ROOM_GENERATION: {
      LARGE: { min: 1, max: 2 },
      MEDIUM: { min: 2, max: 3 },
      SMALL: { min: 3, max: 5 },
      MIN_SPACING: 0,
    },
    DOOR_SYSTEM: {
      LOCKED_PERCENTAGE: { min: 0.10, max: 0.20 },
      ONEWAY_PERCENTAGE: { min: 0.10, max: 0.20 },
      KEYS_PER_FLOOR_EARLY: 1,
      KEYS_PER_FLOOR_MID: 2,
      KEYS_PER_FLOOR_DEEP: { min: 2, max: 3 },
    },
    ROOMS_AND_MAZES: {
      ROOM_ATTEMPTS: 50,
      WINDING_PERCENT: 60,
      EXTRA_CONNECTOR_CHANCE: 4,
      REMOVE_DEAD_ENDS: false,
    },
  },

  DUNGEON_VISUAL: {
    FOV_DEGREES: 70,
    RAY_ORIGIN_OFFSET: 0.5,
    VIEW_WIDTH: 500,
    VIEW_HEIGHT: 400,
    VIEW_X: 260,
    VIEW_Y: 80,
    INNER_VIEW_WIDTH: 460,
    INNER_VIEW_HEIGHT: 310,
    COLOR_SCHEME: 'warm' as 'warm' | 'stone' | 'dark',
    SCHEMES: {
      warm: {
        wall: '#C87533',
        mortar: '#8B5A2B',
        floor: '#A0522D',
        ceiling: '#654321',
      },
      stone: {
        wall: '#708090',
        mortar: '#4A5568',
        floor: '#556B2F',
        ceiling: '#2F4F4F',
      },
      dark: {
        wall: '#3A3A3A',
        mortar: '#1A1A1A',
        floor: '#2A2A2A',
        ceiling: '#0A0A0A',
      },
    },
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
      BASE_PARTY_LUCK: 60, // 6 characters * 10 luck = baseline
      MAX_LUCK_BONUS: 2.0, // Cap at 2x multiplier from luck

      // Rarity bonus: shifts rarity chances toward better items
      RARITY_LUCK_FACTOR: 0.002, // +0.2% rare/legendary chance per luck point
      MAX_RARITY_SHIFT: 0.15, // Max 15% shift toward better rarities
    },

    RARITY_CHANCES: {
      common: 0.7, // 70% of drops are common
      uncommon: 0.25, // 25% are uncommon
      rare: 0.04, // 4% are rare
      legendary: 0.01, // 1% are legendary
    },
    RARITY_ENCHANTMENT_LEVELS: {
      common: { min: 0, max: 0 }, // No enchantment
      uncommon: { min: 1, max: 2 }, // +1 to +2
      rare: { min: 3, max: 4 }, // +3 to +4
      legendary: { min: 5, max: 7 }, // +5 to +7
    },
    RARITY_VALUE_MULTIPLIERS: {
      common: 1.0,
      uncommon: 2.0,
      rare: 4.0,
      legendary: 8.0,
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

  BANTER: {
    TRIGGERS: {
      TIME_INTERVAL_SECONDS: 180,
      DISTANCE_INTERVAL_STEPS: 20,
      COOLDOWN_SECONDS: 60,
    },
    PRIORITIES: {
      CHARACTER_DEATH: 100,
      LOW_HP_WARNING: 75,
      DARK_ZONE_ENTRY: 50,
      AMBIENT_TIME: 10,
      AMBIENT_DISTANCE: 10,
    },
    LLM: {
      ENDPOINT: 'http://192.168.1.82:5000/v1/chat/completions',
      MODEL: 'cydonia-24b',
      MAX_INPUT_TOKENS: 2048,
      MAX_OUTPUT_TOKENS: 200,
      TEMPERATURE: 0.65,
      REPETITION_PENALTY: 1.08,
      MIN_P: 0.1,
      TOP_P: 0.95,
      TIMEOUT_MS: 5000,
    },
    DISABLE_BANTER: false,
    MAX_LINE_LENGTH: 256,
    MAX_VALIDATION_RETRIES: 3,
    EXCHANGE_DISTRIBUTION: {
      SOLO_WEIGHT: 0.4,
      TWO_PERSON_WEIGHT: 0.4,
      GROUP_WEIGHT: 0.2,
    },
  },
} as const;

export type CharacterClass = (typeof GAME_CONFIG.HP_BONUSES)[keyof typeof GAME_CONFIG.HP_BONUSES];
export type SpellcasterClass = (typeof GAME_CONFIG.SPELLCASTER_CLASSES)[number];
