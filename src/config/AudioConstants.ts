import { SceneAudioConfig } from '../types/AudioTypes';

export const AUDIO_CONFIG = {
  VOLUME: {
    MASTER: 1.0,
    MUSIC_DEFAULT: 0.7,
    SFX_DEFAULT: 0.8,
    VOICE_DEFAULT: 0.9,
  },
  FADE: {
    MUSIC_IN: 1000,
    MUSIC_OUT: 500,
    CROSSFADE: 1500,
  },
  DUCKING: {
    ENABLED: true,
    AMOUNT: 0.3,
    FADE_DURATION: 100,
  },
  SFX: {
    MAX_POLYPHONY: 8,
    POOL_SIZE: 16,
  },
  PATHS: {
    MUSIC: '/assets/audio/music/',
    SFX: '/assets/audio/sfx/',
    VOICE: '/assets/audio/voice/',
  },
};

export const SCENE_AUDIO: Record<string, SceneAudioConfig> = {
  mainMenu: {
    music: 'main_theme',
    musicVolume: 0.8,
    autoPlay: true,
  },
  characterCreation: {
    music: 'character_creation',
    musicVolume: 0.6,
    autoPlay: true,
  },
  town: {
    music: 'town_theme',
    ambience: ['town_chatter', 'birds'],
    musicVolume: 0.7,
    autoPlay: true,
  },
  dungeon: {
    music: 'dungeon_theme',
    ambience: ['dungeon_ambience'],
    musicVolume: 0.6,
    autoPlay: true,
  },
  combat: {
    music: 'combat_theme',
    musicVolume: 0.9,
    autoPlay: true,
  },
  shop: {
    music: 'shop_theme',
    musicVolume: 0.5,
    autoPlay: true,
  },
  inn: {
    music: 'town_theme',
    musicVolume: 0.5,
    autoPlay: true,
  },
  temple: {
    music: 'town_theme',
    musicVolume: 0.6,
    autoPlay: true,
  },
  tavern: {
    music: 'town_theme',
    musicVolume: 0.6,
    autoPlay: true,
  },
  trainingGrounds: {
    music: 'town_theme',
    musicVolume: 0.6,
    autoPlay: true,
  },
  camp: {
    autoPlay: false,
  },
  characterSheet: {
    autoPlay: false,
  },
  inventory: {
    autoPlay: false,
  },
};

export const SFX_CATALOG = {
  MENU: {
    SELECT: 'menu_select',
    CANCEL: 'menu_cancel',
    CONFIRM: 'menu_confirm',
    ERROR: 'menu_error',
    CURSOR: 'menu_cursor',
  },
  COMBAT: {
    SWORD_HIT: 'sword_hit',
    SWORD_MISS: 'sword_miss',
    SPELL_CAST: 'spell_cast',
    CRITICAL_HIT: 'critical_hit',
    ENEMY_DEATH: 'enemy_death',
    PARTY_DAMAGE: 'party_damage',
  },
  DUNGEON: {
    DOOR_OPEN: 'door_open',
    DOOR_LOCKED: 'door_locked',
    CHEST_OPEN: 'chest_open',
    TRAP_TRIGGER: 'trap_trigger',
    FOOTSTEP: 'footstep',
    ITEM_PICKUP: 'item_pickup',
  },
  SYSTEM: {
    LEVEL_UP: 'level_up',
    SAVE_GAME: 'save_game',
    LOAD_GAME: 'load_game',
  },
};
