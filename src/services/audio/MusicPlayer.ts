import { AudioCache } from './AudioCache';
import { MusicPlayOptions, MusicStopOptions } from '../../types/AudioTypes';
import { AUDIO_CONFIG } from '../../config/AudioConstants';
import { DebugLogger } from '../../utils/DebugLogger';

interface ActiveTrack {
  clipId: string;
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  startTime: number;
}

export class MusicPlayer {
  private audioContext: AudioContext;
  private cache: AudioCache;
  private masterGainNode: GainNode;
  private currentTrack: ActiveTrack | null = null;
  private fadingOutTrack: ActiveTrack | null = null;
  private musicVolume: number;

  constructor(audioContext: AudioContext, cache: AudioCache, masterGainNode: GainNode) {
    this.audioContext = audioContext;
    this.cache = cache;
    this.masterGainNode = masterGainNode;
    this.musicVolume = AUDIO_CONFIG.VOLUME.MUSIC_DEFAULT;
    DebugLogger.info('MusicPlayer', 'Initialized', { defaultVolume: this.musicVolume });
  }

  public play(clipId: string, options: MusicPlayOptions = {}): void {
    const buffer = this.cache.getBuffer(clipId);
    if (!buffer) {
      DebugLogger.warn('MusicPlayer', `Cannot play music: ${clipId} not loaded`);
      return;
    }

    const volumeMultiplier = options.volumeMultiplier ?? 1.0;
    const fadeInDuration = options.fadeInDuration ?? AUDIO_CONFIG.FADE.MUSIC_IN;
    const loop = options.loop ?? true;

    if (this.currentTrack) {
      if (this.currentTrack.clipId === clipId) {
        DebugLogger.info('MusicPlayer', `Music ${clipId} already playing`);
        return;
      }
      this.crossfade(clipId, buffer, volumeMultiplier, loop);
    } else {
      this.startTrack(clipId, buffer, volumeMultiplier, fadeInDuration, loop);
    }
  }

  private startTrack(
    clipId: string, 
    buffer: AudioBuffer, 
    volumeMultiplier: number, 
    fadeInDuration: number,
    loop: boolean
  ): void {
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    source.loop = loop;
    source.connect(gainNode);
    gainNode.connect(this.masterGainNode);

    const targetVolume = this.musicVolume * volumeMultiplier;
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      targetVolume, 
      this.audioContext.currentTime + fadeInDuration / 1000
    );

    source.start(0);

    this.currentTrack = {
      clipId,
      source,
      gainNode,
      startTime: this.audioContext.currentTime,
    };

    DebugLogger.info('MusicPlayer', `Started music: ${clipId}`, { 
      volume: targetVolume, 
      fadeIn: fadeInDuration,
      loop 
    });
  }

  private crossfade(clipId: string, buffer: AudioBuffer, volumeMultiplier: number, loop: boolean): void {
    const crossfadeDuration = AUDIO_CONFIG.FADE.CROSSFADE;

    if (this.currentTrack) {
      this.fadeOut(this.currentTrack, crossfadeDuration);
      this.fadingOutTrack = this.currentTrack;
      this.currentTrack = null;
    }

    this.startTrack(clipId, buffer, volumeMultiplier, crossfadeDuration, loop);

    DebugLogger.info('MusicPlayer', `Crossfading to: ${clipId}`, { duration: crossfadeDuration });
  }

  public stop(options: MusicStopOptions = {}): void {
    if (!this.currentTrack) {
      return;
    }

    const fadeOutDuration = options.fadeOutDuration ?? AUDIO_CONFIG.FADE.MUSIC_OUT;
    
    DebugLogger.info('MusicPlayer', `Stopping music: ${this.currentTrack.clipId}`, { 
      fadeOut: fadeOutDuration 
    });

    this.fadeOut(this.currentTrack, fadeOutDuration);
    this.currentTrack = null;
  }

  private fadeOut(track: ActiveTrack, duration: number): void {
    const currentGain = track.gainNode.gain.value;
    track.gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
    track.gainNode.gain.setValueAtTime(currentGain, this.audioContext.currentTime);
    track.gainNode.gain.linearRampToValueAtTime(
      0, 
      this.audioContext.currentTime + duration / 1000
    );

    setTimeout(() => {
      track.source.stop();
      track.source.disconnect();
      track.gainNode.disconnect();
      if (this.fadingOutTrack === track) {
        this.fadingOutTrack = null;
      }
    }, duration);
  }

  public setVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    
    if (this.currentTrack) {
      const currentGain = this.currentTrack.gainNode.gain.value;
      this.currentTrack.gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
      this.currentTrack.gainNode.gain.setValueAtTime(currentGain, this.audioContext.currentTime);
      this.currentTrack.gainNode.gain.linearRampToValueAtTime(
        this.musicVolume,
        this.audioContext.currentTime + 0.1
      );
    }

    DebugLogger.info('MusicPlayer', 'Volume changed', { volume: this.musicVolume });
  }

  public getCurrentTrack(): string | null {
    return this.currentTrack?.clipId || null;
  }

  public dispose(): void {
    if (this.currentTrack) {
      this.currentTrack.source.stop();
      this.currentTrack.source.disconnect();
      this.currentTrack.gainNode.disconnect();
      this.currentTrack = null;
    }

    if (this.fadingOutTrack) {
      this.fadingOutTrack.source.stop();
      this.fadingOutTrack.source.disconnect();
      this.fadingOutTrack.gainNode.disconnect();
      this.fadingOutTrack = null;
    }

    DebugLogger.info('MusicPlayer', 'Disposed');
  }
}
