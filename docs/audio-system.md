# Audio System Documentation

## Overview

The game uses a comprehensive audio system built on the Web Audio API, supporting background music with seamless looping and crossfading, plus polyphonic sound effects.

## Architecture

### Components

- **AudioManager**: Main service facade, registered in DI container
- **MusicPlayer**: Handles single looping background track with crossfade
- **SoundEffectPlayer**: Polyphonic short sounds (up to 8 simultaneous)
- **AudioCache**: Loads and caches Web Audio API buffers
- **AudioRegistry**: Central manifest of all audio clips

### Configuration

All tunable values are in `src/config/AudioConstants.ts`:

- Volume levels (master, music, SFX, voice)
- Fade durations (music in/out, crossfade)
- Ducking settings
- SFX polyphony limits
- Scene audio configurations

## Folder Structure

```
src/assets/audio/
├── music/              # Background music (looping, long-form)
│   ├── main_theme.ogg
│   ├── dungeon_theme.ogg
│   └── combat_theme.ogg
├── sfx/               # Sound effects (short, one-shot)
│   ├── combat/        # Combat sounds
│   │   ├── sword_hit.ogg
│   │   └── spell_cast.ogg
│   ├── menu/          # UI sounds
│   │   ├── menu_select.ogg
│   │   └── menu_cursor.ogg
│   ├── dungeon/       # Dungeon sounds
│   │   ├── door_open.ogg
│   │   └── footstep.ogg
│   └── system/        # System sounds
│       ├── level_up.ogg
│       └── save_game.ogg
└── voice/             # Character voice clips (future)
```

## File Format Recommendations

- **Primary**: `.ogg` (Vorbis) - Best browser support, good compression
- **Fallback**: `.mp3` - Wider compatibility if needed
- **Avoid**: `.wav` - Too large for web delivery

### Audio Specifications

**Music:**
- Sample rate: 44.1kHz or 48kHz
- Bitrate: 128-192 kbps (Ogg Vorbis)
- Channels: Stereo
- Duration: Variable (loops seamlessly)

**SFX:**
- Sample rate: 44.1kHz
- Bitrate: 96-128 kbps
- Channels: Mono or Stereo
- Duration: < 3 seconds (typically)

## Adding New Audio

### Step 1: Add Audio File

Place the audio file in the appropriate directory:

```
src/assets/audio/music/new_track.ogg
src/assets/audio/sfx/combat/new_effect.ogg
```

### Step 2: Register in AudioRegistry

Edit `src/config/AudioRegistry.ts`:

```typescript
export const MUSIC_CLIPS: Record<string, AudioClip> = {
  new_track: {
    id: 'new_track',
    type: 'music',
    path: 'new_track.ogg',
  },
};

export const SFX_CLIPS: Record<string, AudioClip> = {
  new_effect: {
    id: 'new_effect',
    type: 'sfx',
    path: 'combat/new_effect.ogg',
  },
};
```

### Step 3: Add to Scene Preload Manifest (if needed)

If the audio should preload with a specific scene:

```typescript
export const SCENE_PRELOAD_MANIFEST: Record<string, string[]> = {
  combat: [
    'combat_theme',
    'new_effect',
  ],
};
```

### Step 4: Use in Code

```typescript
const audio = GameServices.getInstance().getAudioManager();

audio.playMusic('new_track');
audio.playSfx('new_effect');
```

## Usage Patterns

### Scene Integration

Scenes should handle music in `enter()` and `exit()`:

```typescript
class DungeonScene extends Scene {
  public enter(): void {
    const audio = GameServices.getInstance().getAudioManager();
    audio.preloadScene('dungeon');
    audio.playMusic('dungeon_theme');
  }

  public exit(): void {
    const audio = GameServices.getInstance().getAudioManager();
    audio.stopMusic();
  }
}
```

### Playing Music

```typescript
const audio = GameServices.getInstance().getAudioManager();

audio.playMusic('dungeon_theme');

audio.playMusic('boss_theme', {
  volumeMultiplier: 1.2,
  fadeInDuration: 2000,
  loop: true,
});

audio.stopMusic({ fadeOutDuration: 1000 });
```

### Playing Sound Effects

```typescript
const audio = GameServices.getInstance().getAudioManager();

audio.playSfx('sword_hit');

audio.playSfx('critical_hit', { volumeMultiplier: 1.5 });

audio.stopAllSfx();
```

### Volume Control

```typescript
const audio = GameServices.getInstance().getAudioManager();

audio.setMasterVolume(0.8);
audio.setMusicVolume(0.5);
audio.setSfxVolume(0.9);

audio.toggleMute();
audio.setMuted(true);
```

### Preloading

```typescript
const audio = GameServices.getInstance().getAudioManager();

audio.preloadScene('combat');

audio.preloadClip('boss_theme');

const clips = [getAudioClip('theme1'), getAudioClip('theme2')];
audio.preloadAudio(clips.filter(c => c !== null));
```

## Audio Registry API

```typescript
import { 
  getAudioClip, 
  getAllMusicClips,
  getAllSfxClips,
  getScenePreloadClips,
} from '../config/AudioRegistry';

const clip = getAudioClip('dungeon_theme');

const allMusic = getAllMusicClips();

const combatAudio = getScenePreloadClips('combat');
```

## Testing via AI Interface

```javascript
AI.getAudioState()

AI.playMusic('dungeon_theme')
AI.playSfx('sword_hit')

AI.setMasterVolume(0.5)
AI.setMusicVolume(0.7)
AI.setSfxVolume(0.8)

AI.toggleMute()

AI.stopMusic(500)
AI.stopAllSfx()
```

## Constants Reference

### Volume Defaults (AudioConstants.ts)

```typescript
VOLUME: {
  MASTER: 1.0,
  MUSIC_DEFAULT: 0.7,
  SFX_DEFAULT: 0.8,
  VOICE_DEFAULT: 0.9,
}
```

### Fade Settings

```typescript
FADE: {
  MUSIC_IN: 1000,      // ms
  MUSIC_OUT: 500,      // ms
  CROSSFADE: 1500,     // ms
}
```

### SFX Limits

```typescript
SFX: {
  MAX_POLYPHONY: 8,    // Max simultaneous sounds
  POOL_SIZE: 16,       // Pre-allocated audio nodes
}
```

## Best Practices

1. **Always register clips in AudioRegistry** - Don't reference files directly
2. **Use scene preloading** - Ensures audio is ready when needed
3. **Tune via constants** - Never hardcode volumes or durations
4. **Organize by category** - Keep SFX organized in subdirectories
5. **Use consistent naming** - snake_case for clip IDs
6. **Keep SFX short** - Under 3 seconds for best performance
7. **Test with AI Interface** - Verify audio behavior during development

## Naming Conventions

### Music Tracks
- `{location}_theme` - Location-based music (town_theme, dungeon_theme)
- `{event}_theme` - Event-based music (combat_theme, boss_theme)
- `{state}_music` - State-based music (victory_theme, game_over)

### Sound Effects
- `{action}_{result}` - Action-based SFX (sword_hit, sword_miss)
- `{object}_{action}` - Object-based SFX (door_open, chest_open)
- `menu_{action}` - Menu SFX (menu_select, menu_cursor)

## Performance Considerations

- Audio files are preloaded per scene (not globally)
- SFX are polyphonic up to 8 simultaneous
- Oldest SFX is auto-stopped when limit reached
- Web Audio API provides low-latency playback
- Crossfading uses gain ramping (no CPU-intensive mixing)

## Troubleshooting

### Audio not playing
1. Check browser console for loading errors
2. Verify file exists at path in AudioRegistry
3. Check if AudioContext is resumed (autoplay restrictions)
4. Verify clip is registered in AudioRegistry

### Audio stuttering
1. Reduce SFX polyphony limit
2. Compress audio files further
3. Preload audio earlier in scene lifecycle

### Volume issues
1. Check master volume and mute state
2. Verify channel volumes (music vs SFX)
3. Check volumeMultiplier in play options
