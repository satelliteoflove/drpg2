export type AudioClipType = 'music' | 'sfx' | 'voice';

export interface AudioClip {
  id: string;
  type: AudioClipType;
  path: string;
  buffer?: AudioBuffer;
}

export interface MusicPlayOptions {
  volumeMultiplier?: number;
  fadeInDuration?: number;
  loop?: boolean;
}

export interface SfxPlayOptions {
  volumeMultiplier?: number;
}

export interface MusicStopOptions {
  fadeOutDuration?: number;
}

export interface AudioState {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  currentMusic: string | null;
  activeSfx: string[];
  isMuted: boolean;
}

export interface SceneAudioConfig {
  music?: string;
  ambience?: string[];
  musicVolume?: number;
  autoPlay?: boolean;
}
