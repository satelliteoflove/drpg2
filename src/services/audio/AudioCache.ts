import { AudioClip, AudioClipType } from '../../types/AudioTypes';
import { AUDIO_CONFIG } from '../../config/AudioConstants';
import { DebugLogger } from '../../utils/DebugLogger';

export class AudioCache {
  private static instance: AudioCache;
  private audioContext: AudioContext;
  private cache: Map<string, AudioBuffer>;
  private loadingPromises: Map<string, Promise<AudioBuffer>>;

  private constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.cache = new Map();
    this.loadingPromises = new Map();
    DebugLogger.info('AudioCache', 'Initialized');
  }

  public static getInstance(audioContext: AudioContext): AudioCache {
    if (!AudioCache.instance) {
      AudioCache.instance = new AudioCache(audioContext);
    }
    return AudioCache.instance;
  }

  public getBuffer(clipId: string): AudioBuffer | null {
    return this.cache.get(clipId) || null;
  }

  public preload(clips: AudioClip[]): void {
    clips.forEach(clip => {
      if (!this.cache.has(clip.id) && !this.loadingPromises.has(clip.id)) {
        this.loadClip(clip);
      }
    });
  }

  private loadClip(clip: AudioClip): void {
    const fullPath = this.getFullPath(clip);
    
    const loadPromise = fetch(fullPath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load audio: ${fullPath}`);
        }
        return response.arrayBuffer();
      })
      .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        this.cache.set(clip.id, audioBuffer);
        this.loadingPromises.delete(clip.id);
        DebugLogger.info('AudioCache', `Loaded audio: ${clip.id}`, { 
          duration: audioBuffer.duration,
          channels: audioBuffer.numberOfChannels 
        });
        return audioBuffer;
      })
      .catch(error => {
        this.loadingPromises.delete(clip.id);
        DebugLogger.error('AudioCache', `Failed to load audio: ${clip.id}`, { error: error.message });
        throw error;
      });

    this.loadingPromises.set(clip.id, loadPromise);
  }

  private getFullPath(clip: AudioClip): string {
    const basePath = this.getBasePath(clip.type);
    return `${basePath}${clip.path}`;
  }

  private getBasePath(type: AudioClipType): string {
    switch (type) {
      case 'music':
        return AUDIO_CONFIG.PATHS.MUSIC;
      case 'sfx':
        return AUDIO_CONFIG.PATHS.SFX;
      case 'voice':
        return AUDIO_CONFIG.PATHS.VOICE;
    }
  }

  public clear(): void {
    this.cache.clear();
    this.loadingPromises.clear();
    DebugLogger.info('AudioCache', 'Cleared cache');
  }

  public dispose(): void {
    this.clear();
    DebugLogger.info('AudioCache', 'Disposed');
  }
}
