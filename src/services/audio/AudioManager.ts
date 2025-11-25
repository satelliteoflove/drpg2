import { AudioCache } from './AudioCache';
import { MusicPlayer } from './MusicPlayer';
import { SoundEffectPlayer } from './SoundEffectPlayer';
import { 
  AudioClip, 
  AudioState, 
  MusicPlayOptions, 
  MusicStopOptions, 
  SfxPlayOptions 
} from '../../types/AudioTypes';
import { AUDIO_CONFIG } from '../../config/AudioConstants';
import { getScenePreloadClips, getAudioClip } from '../../config/AudioRegistry';
import { DebugLogger } from '../../utils/DebugLogger';

export class AudioManager {
  private static instance: AudioManager | null = null;
  private audioContext: AudioContext;
  private masterGain: GainNode;
  private cache: AudioCache;
  private musicPlayer: MusicPlayer;
  private sfxPlayer: SoundEffectPlayer;
  private masterVolume: number;
  private isMuted: boolean;

  constructor() {
    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    
    this.cache = AudioCache.getInstance(this.audioContext);
    this.musicPlayer = new MusicPlayer(this.audioContext, this.cache, this.masterGain);
    this.sfxPlayer = new SoundEffectPlayer(this.audioContext, this.cache, this.masterGain);
    
    this.masterVolume = AUDIO_CONFIG.VOLUME.MASTER;
    this.isMuted = false;
    this.updateMasterGain();

    AudioManager.instance = this;
    DebugLogger.info('AudioManager', 'Initialized', { 
      sampleRate: this.audioContext.sampleRate,
      masterVolume: this.masterVolume 
    });
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public preloadAudio(clips: AudioClip[]): void {
    DebugLogger.info('AudioManager', 'Preloading audio', { count: clips.length });
    this.cache.preload(clips);
  }

  public preloadScene(sceneName: string): void {
    const clips = getScenePreloadClips(sceneName);
    DebugLogger.info('AudioManager', `Preloading scene: ${sceneName}`, { 
      count: clips.length,
      clips: clips.map(c => c.id)
    });
    this.cache.preload(clips);
  }

  public preloadClip(clipId: string): void {
    const clip = getAudioClip(clipId);
    if (clip) {
      this.cache.preload([clip]);
    } else {
      DebugLogger.warn('AudioManager', `Clip not found in registry: ${clipId}`);
    }
  }

  public playMusic(clipId: string, options: MusicPlayOptions = {}): void {
    this.resumeContext();
    this.musicPlayer.play(clipId, options);
  }

  public stopMusic(options: MusicStopOptions = {}): void {
    this.musicPlayer.stop(options);
  }

  public playSfx(clipId: string, options: SfxPlayOptions = {}): void {
    this.resumeContext();
    this.sfxPlayer.play(clipId, options);
  }

  public stopAllSfx(): void {
    this.sfxPlayer.stopAll();
  }

  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateMasterGain();
    DebugLogger.info('AudioManager', 'Master volume changed', { volume: this.masterVolume });
  }

  public setMusicVolume(volume: number): void {
    this.musicPlayer.setVolume(volume);
  }

  public setSfxVolume(volume: number): void {
    this.sfxPlayer.setVolume(volume);
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    this.updateMasterGain();
    DebugLogger.info('AudioManager', `Audio ${muted ? 'muted' : 'unmuted'}`);
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  private updateMasterGain(): void {
    const volume = this.isMuted ? 0 : this.masterVolume;
    this.masterGain.gain.setValueAtTime(volume, this.audioContext.currentTime);
  }

  private resumeContext(): void {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        DebugLogger.info('AudioManager', 'AudioContext resumed');
      });
    }
  }

  public getState(): AudioState {
    return {
      masterVolume: this.masterVolume,
      musicVolume: AUDIO_CONFIG.VOLUME.MUSIC_DEFAULT,
      sfxVolume: AUDIO_CONFIG.VOLUME.SFX_DEFAULT,
      voiceVolume: AUDIO_CONFIG.VOLUME.VOICE_DEFAULT,
      currentMusic: this.musicPlayer.getCurrentTrack(),
      activeSfx: this.sfxPlayer.getActiveSounds(),
      isMuted: this.isMuted,
    };
  }

  public dispose(): void {
    DebugLogger.info('AudioManager', 'Disposing');
    
    this.musicPlayer.dispose();
    this.sfxPlayer.dispose();
    this.cache.dispose();
    
    this.masterGain.disconnect();
    this.audioContext.close();
    
    AudioManager.instance = null;
    DebugLogger.info('AudioManager', 'Disposed');
  }
}
