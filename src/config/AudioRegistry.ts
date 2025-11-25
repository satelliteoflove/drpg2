import { AudioClip } from '../types/AudioTypes';

export const MUSIC_CLIPS: Record<string, AudioClip> = {
  main_theme: {
    id: 'main_theme',
    type: 'music',
    path: 'main_theme.ogg',
  },
  character_creation: {
    id: 'character_creation',
    type: 'music',
    path: 'character_creation.ogg',
  },
  town_theme: {
    id: 'town_theme',
    type: 'music',
    path: 'town_theme.ogg',
  },
  dungeon_theme: {
    id: 'dungeon_theme',
    type: 'music',
    path: 'dungeon_theme.ogg',
  },
  dungeon_ambience: {
    id: 'dungeon_ambience',
    type: 'music',
    path: 'dungeon_ambience.ogg',
  },
  combat_theme: {
    id: 'combat_theme',
    type: 'music',
    path: 'combat_theme.ogg',
  },
  shop_theme: {
    id: 'shop_theme',
    type: 'music',
    path: 'shop_theme.ogg',
  },
  boss_theme: {
    id: 'boss_theme',
    type: 'music',
    path: 'boss_theme.ogg',
  },
  victory_theme: {
    id: 'victory_theme',
    type: 'music',
    path: 'victory_theme.ogg',
  },
};

export const SFX_CLIPS: Record<string, AudioClip> = {
  menu_select: {
    id: 'menu_select',
    type: 'sfx',
    path: 'menu/menu_select.wav',
  },
  menu_cancel: {
    id: 'menu_cancel',
    type: 'sfx',
    path: 'menu/menu_cancel.wav',
  },
  menu_confirm: {
    id: 'menu_confirm',
    type: 'sfx',
    path: 'menu/menu_confirm.wav',
  },
  menu_error: {
    id: 'menu_error',
    type: 'sfx',
    path: 'menu/menu_error.wav',
  },
  menu_cursor: {
    id: 'menu_cursor',
    type: 'sfx',
    path: 'menu/menu_cursor.wav',
  },
  sword_hit: {
    id: 'sword_hit',
    type: 'sfx',
    path: 'combat/sword_hit.ogg',
  },
  sword_miss: {
    id: 'sword_miss',
    type: 'sfx',
    path: 'combat/sword_miss.ogg',
  },
  spell_cast: {
    id: 'spell_cast',
    type: 'sfx',
    path: 'combat/spell_cast.ogg',
  },
  critical_hit: {
    id: 'critical_hit',
    type: 'sfx',
    path: 'combat/critical_hit.ogg',
  },
  enemy_death: {
    id: 'enemy_death',
    type: 'sfx',
    path: 'combat/enemy_death.ogg',
  },
  party_damage: {
    id: 'party_damage',
    type: 'sfx',
    path: 'combat/party_damage.ogg',
  },
  door_open: {
    id: 'door_open',
    type: 'sfx',
    path: 'dungeon/door_open.ogg',
  },
  door_locked: {
    id: 'door_locked',
    type: 'sfx',
    path: 'dungeon/door_locked.ogg',
  },
  chest_open: {
    id: 'chest_open',
    type: 'sfx',
    path: 'dungeon/chest_open.ogg',
  },
  trap_trigger: {
    id: 'trap_trigger',
    type: 'sfx',
    path: 'dungeon/trap_trigger.ogg',
  },
  footstep: {
    id: 'footstep',
    type: 'sfx',
    path: 'dungeon/footstep.ogg',
  },
  item_pickup: {
    id: 'item_pickup',
    type: 'sfx',
    path: 'dungeon/item_pickup.ogg',
  },
  level_up: {
    id: 'level_up',
    type: 'sfx',
    path: 'system/level_up.ogg',
  },
  save_game: {
    id: 'save_game',
    type: 'sfx',
    path: 'system/save_game.ogg',
  },
};

export const VOICE_CLIPS: Record<string, AudioClip> = {};

export const AUDIO_REGISTRY = {
  music: MUSIC_CLIPS,
  sfx: SFX_CLIPS,
  voice: VOICE_CLIPS,
};

export function getAudioClip(clipId: string): AudioClip | null {
  if (MUSIC_CLIPS[clipId]) return MUSIC_CLIPS[clipId];
  if (SFX_CLIPS[clipId]) return SFX_CLIPS[clipId];
  if (VOICE_CLIPS[clipId]) return VOICE_CLIPS[clipId];
  return null;
}

export function getAllMusicClips(): AudioClip[] {
  return Object.values(MUSIC_CLIPS);
}

export function getAllSfxClips(): AudioClip[] {
  return Object.values(SFX_CLIPS);
}

export function getAllVoiceClips(): AudioClip[] {
  return Object.values(VOICE_CLIPS);
}

export function getAllAudioClips(): AudioClip[] {
  return [...getAllMusicClips(), ...getAllSfxClips(), ...getAllVoiceClips()];
}

export const SCENE_PRELOAD_MANIFEST: Record<string, string[]> = {
  mainMenu: [
    'main_theme',
    'menu_select',
    'menu_cancel',
    'menu_confirm',
    'menu_cursor',
  ],
  characterCreation: [
    'character_creation',
    'menu_select',
    'menu_cancel',
    'menu_confirm',
    'menu_cursor',
    'menu_error',
  ],
  town: [
    'town_theme',
    'menu_select',
    'menu_cancel',
    'menu_confirm',
    'menu_cursor',
  ],
  dungeon: [
    'dungeon_theme',
    'dungeon_ambience',
    'footstep',
    'door_open',
    'door_locked',
    'chest_open',
    'item_pickup',
    'menu_cursor',
  ],
  combat: [
    'combat_theme',
    'sword_hit',
    'sword_miss',
    'spell_cast',
    'critical_hit',
    'enemy_death',
    'party_damage',
    'menu_select',
    'menu_cursor',
  ],
  shop: [
    'shop_theme',
    'menu_select',
    'menu_cancel',
    'menu_confirm',
    'menu_cursor',
    'menu_error',
  ],
  inventory: [
    'menu_select',
    'menu_cancel',
    'menu_cursor',
    'item_pickup',
  ],
};

export function getScenePreloadClips(sceneName: string): AudioClip[] {
  const clipIds = SCENE_PRELOAD_MANIFEST[sceneName] || [];
  return clipIds
    .map(id => getAudioClip(id))
    .filter(clip => clip !== null) as AudioClip[];
}
