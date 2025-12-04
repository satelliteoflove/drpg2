/**
 * UI and Layout Constants
 * Centralizes all magic numbers related to UI positioning, dimensions, and timing
 */

export const UI_CONSTANTS = {
  // Colors
  COLORS: {
    PANEL_BACKGROUND: '#2a2a2a',
    PANEL_BORDER: '#666',
    TEXT_PRIMARY: '#fff',
    TEXT_SECONDARY: '#aaa',
    TEXT_HIGHLIGHT: '#00ff00',
    TEXT_WARNING: '#ffa500',
    TEXT_ERROR: '#ff0000',
    TEXT_SUCCESS: '#00ff00',
  },

  // Layout & Positioning
  LAYOUT: {
    WINDOW_PADDING: 20,
    CONTENT_MARGIN: 50,
    HEADER_HEIGHT: 60,
    FOOTER_HEIGHT: 40,
    SIDEBAR_WIDTH: 200,

    // Common Y positions for UI elements
    TITLE_Y: 50,
    SUBTITLE_Y: 80,
    CONTENT_START_Y: 120,
    FOOTER_Y: 20, // from bottom

    // Common X positions
    LEFT_MARGIN: 50,
    RIGHT_MARGIN: 50,
    CENTER_OFFSET: 0,

    // List and menu layouts
    MENU_ITEM_HEIGHT: 40,
    MENU_ITEM_SPACING: 10,
    LIST_ITEM_HEIGHT: 30,
    LIST_ITEM_SPACING: 5,

    // Form layouts
    LABEL_WIDTH: 150,
    INPUT_WIDTH: 200,
    INPUT_HEIGHT: 30,
    FORM_ROW_HEIGHT: 40,

    // Panel padding
    PANEL_PADDING: 10,

    // Header positioning
    HEADER_TITLE_Y: 45,
    HEADER_GOLD_OFFSET: 30,

    // Status panel
    STATUS_PANEL_X: 10,
    STATUS_PANEL_Y: 80,
    STATUS_PANEL_WIDTH: 240,
    STATUS_PANEL_HEIGHT: 480,

    // Main content area (to the right of status panel)
    MAIN_CONTENT_X: 260,
    MAIN_CONTENT_Y: 80,
    MAIN_CONTENT_WIDTH: 500,
    MAIN_CONTENT_HEIGHT: 480,

    // Action menu (to the right of main content)
    ACTION_MENU_X: 770,
    ACTION_MENU_Y: 80,
    ACTION_MENU_WIDTH: 240,
    ACTION_MENU_HEIGHT: 480,
  },

  // Text Positioning
  TEXT: {
    LINE_HEIGHT: 20,
    PARAGRAPH_SPACING: 15,
    INDENT: 20,
    SMALL_LINE_HEIGHT: 15,
    LARGE_LINE_HEIGHT: 30,

    // Character limits
    MAX_NAME_LENGTH: 16,
    MAX_MESSAGE_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 200,
  },

  // Animation & Timing
  TIMING: {
    // Transitions
    FADE_DURATION: 300,
    SLIDE_DURATION: 200,

    // Delays
    MESSAGE_DISPLAY_TIME: 3000,
    TOOLTIP_DELAY: 500,
    ACTION_COOLDOWN: 200,
    TURN_DELAY: 200,

    // Movement
    MOVE_DELAY: 350,
    ROTATION_DELAY: 150,

    // Input
    KEY_REPEAT_DELAY: 150,
    DOUBLE_CLICK_TIME: 300,

    // Combat
    COMBAT_MESSAGE_DURATION: 1500,
    DAMAGE_NUMBER_DURATION: 1000,
  },

  // Windows & Panels
  WINDOWS: {
    MIN_WIDTH: 300,
    MIN_HEIGHT: 200,
    MAX_WIDTH: 800,
    MAX_HEIGHT: 600,

    // Modal windows
    MODAL_WIDTH: 400,
    MODAL_HEIGHT: 300,
    CONFIRM_WIDTH: 350,
    CONFIRM_HEIGHT: 150,

    // Specific panels
    STATUS_PANEL_WIDTH: 250,
    INVENTORY_PANEL_WIDTH: 400,
    MESSAGE_LOG_HEIGHT: 150,

    // Borders
    BORDER_WIDTH: 2,
    BORDER_RADIUS: 4,
  },

  // Combat UI
  COMBAT: {
    // Monster display
    MONSTER_SPACING: 80,
    MONSTER_START_X: 100,
    MONSTER_Y: 200,

    // Character display
    CHARACTER_SPACING: 60,
    CHARACTER_START_X: 100,
    CHARACTER_Y: 400,

    // Health bars
    HP_BAR_WIDTH: 50,
    HP_BAR_HEIGHT: 6,
    MP_BAR_WIDTH: 50,
    MP_BAR_HEIGHT: 4,

    // Action menu
    ACTION_MENU_Y: 350,
    ACTION_MENU_WIDTH: 200,
  },

  // Turn Order List (vertical list showing turn order, FFX-style)
  TURN_ORDER_LIST: {
    X: 770,
    Y: 80,
    WIDTH: 240,
    HEIGHT: 480,
    ENTRY_HEIGHT: 28,
    MAX_ENTRIES: 16,
    PADDING: 10,
    ENEMY_COLOR: '#cc4444',
    PLAYER_COLOR: '#88ff88',
    CURRENT_ACTOR_BG: '#444400',
    TARGET_HIGHLIGHT_BG: '#444400',
    GHOST_OPACITY: 0.5,
    GHOST_BG: '#333333',
    BORDER_COLOR: '#666',
    TEXT_COLOR: '#fff',
    TITLE_HEIGHT: 30,
  },

  // Combat Options (two-column layout below combat area)
  COMBAT_OPTIONS: {
    X: 260,
    Y: 490,
    WIDTH: 500,
    HEIGHT: 80,
    COLUMN_WIDTH: 240,
    COLUMN_GAP: 20,
  },

  // Inventory & Items
  INVENTORY: {
    GRID_COLUMNS: 5,
    GRID_ROWS: 4,
    SLOT_SIZE: 48,
    SLOT_SPACING: 8,

    // Item display
    ICON_SIZE: 32,
    STACK_NUMBER_OFFSET: { x: 28, y: 28 },

    // Equipment slots
    EQUIPMENT_SLOT_SIZE: 64,
    EQUIPMENT_SPACING: 16,
  },

  // Map & Dungeon
  DUNGEON: {
    // Viewport
    VIEWPORT_WIDTH: 640,
    VIEWPORT_HEIGHT: 480,

    // Minimap
    MINIMAP_SIZE: 150,
    MINIMAP_TILE_SIZE: 5,
    MINIMAP_OFFSET: { x: 10, y: 10 },

    // Tile rendering
    TILE_SIZE: 32,
    WALL_HEIGHT: 48,

    // First-person view
    CORRIDOR_WIDTH: 400,
    CORRIDOR_HEIGHT: 300,
    PERSPECTIVE_SCALE: 0.8,
  },

  // Shop & Town
  SHOP: {
    ITEM_LIST_HEIGHT: 400,
    ITEM_PREVIEW_WIDTH: 200,
    PRICE_COLUMN_WIDTH: 80,

    // Categories
    CATEGORY_BUTTON_WIDTH: 120,
    CATEGORY_BUTTON_HEIGHT: 40,
    CATEGORY_SPACING: 10,
  },

  // Debug Overlay
  DEBUG: {
    PANEL_WIDTH: 300,
    PANEL_HEIGHT: 400,
    LINE_HEIGHT: 16,
    SECTION_SPACING: 20,
    INDENT: 20,

    MAX_LOG_LINES: 50,
    SCROLL_SPEED: 20,
  },
} as const;

/**
 * Game Mechanics Constants
 * Values that affect gameplay balance
 */
export const GAME_VALUES = {
  // Character Creation
  CHARACTER: {
    MIN_STAT_ROLL: 3,
    MAX_STAT_ROLL: 18,
    BONUS_POINTS: 5,
    MIN_AGE: 18,
    MAX_AGE: 30,

    // Inventory
    MAX_INVENTORY_SIZE: 20,
    MAX_EQUIPPED_ITEMS: 7,

    // Progression
    BASE_EXPERIENCE: 1000,
    EXPERIENCE_MULTIPLIER: 1.5,
    MAX_LEVEL: 20,
  },

  // Combat
  COMBAT: {
    BASE_HIT_CHANCE: 0.5,
    CRITICAL_HIT_CHANCE: 0.05,
    CRITICAL_DAMAGE_MULT: 2.0,

    // Escape
    BASE_ESCAPE_CHANCE: 0.4,
    ESCAPE_LEVEL_BONUS: 0.02,
    MAX_ESCAPE_CHANCE: 0.95,

    // Initiative
    BASE_INITIATIVE: 10,
    AGILITY_INITIATIVE_BONUS: 0.5,
  },

  // Items & Equipment
  ITEMS: {
    // Shop prices
    SELL_PRICE_RATIO: 0.5,
    IDENTIFY_COST_RATIO: 0.5,
    UNCURSE_COST_RATIO: 1.0,

    // Enchantment
    MAX_ENCHANTMENT: 5,
    ENCHANTMENT_PRICE_MULT: 1.5,

    // Durability (if implemented)
    MAX_DURABILITY: 100,
    REPAIR_COST_RATIO: 0.3,
  },

  // Treasure & Rewards
  TREASURE: {
    BASE_GOLD_DROP: 50,
    GOLD_LEVEL_MULTIPLIER: 20,

    // Chest rewards
    CHEST_GOLD_MIN: 10,
    CHEST_GOLD_MAX: 100,
    CHEST_ITEM_CHANCE: 0.3,
    TRAPPED_CHEST_CHANCE: 0.2,
  },

  // Party
  PARTY: {
    MAX_SIZE: 6,
    MIN_SIZE: 1,

    // Gold pooling
    GOLD_SHARE_RATIO: 1.0, // Equal distribution

    // Experience
    EXPERIENCE_SHARE_RATIO: 1.0, // Equal distribution
  },

  // Monster Scaling
  MONSTERS: {
    HP_LEVEL_MULTIPLIER: 0.2,
    DAMAGE_LEVEL_BONUS: 0.3,
    AC_LEVEL_REDUCTION: 0.5,

    // Spawning
    MIN_GROUP_SIZE: 1,
    MAX_GROUP_SIZE: 4,

    // Rewards
    EXPERIENCE_LEVEL_MULT: 0.3,
    GOLD_LEVEL_MULT: 0.25,
  },

  // Spells & Magic
  MAGIC: {
    BASE_SPELL_COST: 1,
    SPELL_LEVEL_COST_MULT: 2,

    // Ranges
    MIN_SPELL_RANGE: 1,
    MAX_SPELL_RANGE: 10,

    // Duration
    BUFF_DURATION_BASE: 5,
    DEBUFF_DURATION_BASE: 3,
  },
} as const;

/**
 * Z-Index layers for rendering order
 */
export const Z_INDEX = {
  BACKGROUND: 0,
  FLOOR: 1,
  WALLS: 2,
  OBJECTS: 3,
  ITEMS: 4,
  CHARACTERS: 5,
  EFFECTS: 6,
  UI_BACKGROUND: 7,
  UI_WINDOWS: 8,
  UI_MENUS: 9,
  UI_TOOLTIPS: 10,
  UI_MODAL: 11,
  DEBUG_OVERLAY: 99,
} as const;

/**
 * Common percentages used throughout the game
 */
export const PERCENTAGES = {
  QUARTER: 0.25,
  THIRD: 0.33,
  HALF: 0.5,
  TWO_THIRDS: 0.67,
  THREE_QUARTERS: 0.75,
  FULL: 1.0,
} as const;
