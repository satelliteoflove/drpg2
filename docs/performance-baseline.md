# Performance Baseline Testing Guide

## Overview

The performance monitoring system has been integrated into the game to establish baseline metrics before the ASCII rendering migration. This system tracks FPS, render times, update times, and memory usage across all scenes.

## How to Generate Performance Baseline

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Navigate Through All Scenes

To get comprehensive baseline metrics, you need to navigate through all game scenes:

1. **Main Menu Scene** - Automatically loaded on startup
2. **New Game Scene** - Select "New Game" from main menu
3. **Character Creation Scene** - Create a party with 6 characters
4. **Town Scene** - Enter the town after character creation
5. **Shop Scene** - Enter Boltac's Trading Post from town
6. **Dungeon Scene** - Enter the dungeon from town
7. **Combat Scene** - Trigger combat in the dungeon (press 'T' for test combat)
8. **Inventory Scene** - Press 'Tab' in the dungeon
9. **Debug Scene** - Press 'Ctrl+D' in the dungeon or combat scene

### 3. Generate Performance Report

1. While in the Dungeon or Combat scene, press **'Ctrl+D'** to open the Debug Scene
2. Press **'p'** (lowercase) to generate the performance report
3. The report will be:
   - **Automatically downloaded** as a markdown file
   - Logged to the Debug Logger system
   - Displayed in the game's message log with summary statistics
   - Available for export via DebugLogger.exportLogs()

### 4. Export the Report

After generating the report:
- **Automatic download**: The report is automatically saved as `performance-report-YYYY-MM-DD-HH-MM-SS.md`
- **Debug Logger**: Full report stored in the Debug Logger (can be exported via DebugLogger.exportLogs() in browser console)
- **Message log**: Performance summary appears in the game's message log
- The report is formatted as markdown for easy documentation

## Performance Metrics Tracked

### Per-Scene Metrics
- **Average FPS**: Mean frames per second
- **Min/Max FPS**: Performance boundaries
- **95th/99th Percentile FPS**: Performance consistency
- **Average Render Time**: Time spent rendering each frame
- **Average Update Time**: Time spent updating game logic
- **Peak Memory Usage**: Maximum JavaScript heap usage

### Global Metrics
- **Overall Average FPS**: Across all scenes
- **Total Frames Rendered**: Complete frame count
- **Dropped Frames**: Frames below 60 FPS target
- **Performance Score**: 0-100 rating (weighted FPS and stability)

## Performance Targets

- **Target FPS**: 60 FPS
- **Minimum Acceptable FPS**: 30 FPS
- **Performance Score Thresholds**:
  - 85-100: Excellent (ready for new features)
  - 70-85: Acceptable (monitor for improvements)
  - Below 70: Needs optimization

## Key Commands

- **Ctrl+D**: Open Debug Scene (from Dungeon or Combat scenes)
- **p**: Generate Performance Report (lowercase 'p' in Debug Scene)
- **Page Up/Down**: Scroll in Debug Scene
- **Escape**: Return to previous scene

## Performance Monitoring API

The `PerformanceMonitor` class provides:
- Scene-based performance tracking
- Automatic FPS calculation
- Memory usage monitoring (Chrome/Edge only)
- Render/Update time tracking
- Performance report generation

## Implementation Details

### Integration Points

1. **Game.ts**: 
   - Initializes PerformanceMonitor
   - Marks render/update start/end times
   - Records frame metrics

2. **Scene.ts**:
   - Notifies monitor on scene changes
   - Triggers new monitoring session per scene

3. **DebugScene.ts**:
   - Provides UI command to generate reports
   - Displays performance data

### Constants

```typescript
const TARGET_FPS = 60;
const MIN_ACCEPTABLE_FPS = 30;
const SAMPLE_WINDOW_SIZE = 60; // Rolling average window
const MEMORY_SAMPLE_INTERVAL = 1000; // ms between memory samples
```

## Baseline Establishment Process

1. **Clean Build**: Ensure fresh build with `npm run build`
2. **Browser Setup**: Use Chrome/Edge for memory monitoring
3. **Warm-up Period**: Navigate through each scene twice to warm up
4. **Recording Period**: Spend 30+ seconds in each scene
5. **Generate Report**: Create baseline report after full navigation
6. **Document Results**: Save report as `performance-baseline-YYYY-MM-DD.md`

## Notes

- Memory monitoring requires Chrome or Edge browser
- Performance may vary based on hardware
- Baseline should be established before any optimization work
- Re-run baseline after major changes for comparison