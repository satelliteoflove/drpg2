import { AudioCache } from './AudioCache';
import { SfxPlayOptions } from '../../types/AudioTypes';
import { AUDIO_CONFIG } from '../../config/AudioConstants';
import { DebugLogger } from '../../utils/DebugLogger';

interface ActiveSound {
  clipId: string;
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  startTime: number;
}

export class SoundEffectPlayer {
  private audioContext: AudioContext;
  private cache: AudioCache;
  private masterGainNode: GainNode;
  private activeSounds: ActiveSound[];
  private sfxVolume: number;

  constructor(audioContext: AudioContext, cache: AudioCache, masterGainNode: GainNode) {
    this.audioContext = audioContext;
    this.cache = cache;
    this.masterGainNode = masterGainNode;
    this.activeSounds = [];
    this.sfxVolume = AUDIO_CONFIG.VOLUME.SFX_DEFAULT;
    DebugLogger.info('SoundEffectPlayer', 'Initialized', { defaultVolume: this.sfxVolume });
  }

  public play(clipId: string, options: SfxPlayOptions = {}): void {
    const buffer = this.cache.getBuffer(clipId);
    if (!buffer) {
      DebugLogger.warn('SoundEffectPlayer', `Cannot play SFX: ${clipId} not loaded`);
      return;
    }

    if (this.activeSounds.length >= AUDIO_CONFIG.SFX.MAX_POLYPHONY) {
      this.removeOldestSound();
    }

    const volumeMultiplier = options.volumeMultiplier ?? 1.0;
    
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(this.masterGainNode);

    const volume = this.sfxVolume * volumeMultiplier;
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

    const activeSound: ActiveSound = {
      clipId,
      source,
      gainNode,
      startTime: this.audioContext.currentTime,
    };

    source.onended = () => {
      this.removeSound(activeSound);
    };

    source.start(0);
    this.activeSounds.push(activeSound);

    DebugLogger.debug('SoundEffectPlayer', `Playing SFX: ${clipId}`, { 
      volume,
      activeCount: this.activeSounds.length 
    });
  }

  private removeSound(sound: ActiveSound): void {
    const index = this.activeSounds.indexOf(sound);
    if (index !== -1) {
      this.activeSounds.splice(index, 1);
      try {
        sound.source.disconnect();
        sound.gainNode.disconnect();
      } catch (e) {
        DebugLogger.debug('SoundEffectPlayer', 'Sound already disconnected', { clipId: sound.clipId });
      }
    }
  }

  private removeOldestSound(): void {
    if (this.activeSounds.length === 0) {
      return;
    }

    const oldest = this.activeSounds[0];
    DebugLogger.debug('SoundEffectPlayer', `Stopping oldest SFX: ${oldest.clipId}`, {
      age: this.audioContext.currentTime - oldest.startTime
    });

    oldest.source.stop();
    this.removeSound(oldest);
  }

  public stopAll(): void {
    const count = this.activeSounds.length;
    
    this.activeSounds.forEach(sound => {
      try {
        sound.source.stop();
        sound.source.disconnect();
        sound.gainNode.disconnect();
      } catch (e) {
        DebugLogger.debug('SoundEffectPlayer', 'Error stopping sound', { 
          clipId: sound.clipId 
        });
      }
    });

    this.activeSounds = [];
    
    if (count > 0) {
      DebugLogger.info('SoundEffectPlayer', `Stopped all SFX`, { count });
    }
  }

  public setVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    
    this.activeSounds.forEach(sound => {
      sound.gainNode.gain.setValueAtTime(this.sfxVolume, this.audioContext.currentTime);
    });

    DebugLogger.info('SoundEffectPlayer', 'Volume changed', { volume: this.sfxVolume });
  }

  public getActiveCount(): number {
    return this.activeSounds.length;
  }

  public getActiveSounds(): string[] {
    return this.activeSounds.map(s => s.clipId);
  }

  public dispose(): void {
    this.stopAll();
    DebugLogger.info('SoundEffectPlayer', 'Disposed');
  }
}
