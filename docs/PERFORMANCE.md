# DRPG2 Performance Optimization Guide

## Overview

This guide covers performance optimization strategies, profiling techniques, and best practices for the DRPG2 game engine. The engine is designed with performance in mind, featuring layer-based rendering, dirty region tracking, and efficient resource management.

## Rendering Performance

### Layer-Based Rendering System

The engine supports a sophisticated layer-based rendering system that optimizes performance by:

#### Render Layers
```typescript
// Available render layers (back to front)
const LAYERS = {
  BACKGROUND: 'background',  // Static backgrounds
  DUNGEON: 'dungeon',       // Dungeon walls and floor
  ENTITIES: 'entities',     // Characters and monsters  
  EFFECTS: 'effects',       // Visual effects and animations
  UI: 'ui',                 // User interface elements
  DEBUG: 'debug'            // Debug overlays
};
```

#### Layer Optimization Benefits
- **Selective Rendering**: Only dirty layers are redrawn
- **Caching**: Static layers are cached between frames
- **Compositing**: GPU-accelerated layer compositing
- **Z-Index Management**: Proper depth sorting without manual management

### Dirty Region Tracking

The `RenderingOptimizer` implements dirty region tracking to minimize canvas operations:

```typescript
// Mark regions as dirty
optimizer.markDirtyRegion(x, y, width, height, layerName);

// Only dirty regions are redrawn
if (optimizer.shouldRender(layerName)) {
  renderLayer(layerName);
}
```

#### Benefits of Dirty Regions
- **Reduced Canvas Operations**: Only changed areas are redrawn
- **CPU Savings**: Avoid unnecessary rendering calculations
- **Memory Efficiency**: Smaller dirty regions use less memory
- **Smooth Animation**: Consistent frame rates with selective updates

### Frame Rate Management

#### Adaptive Frame Skipping
```typescript
// Configure frame skipping threshold
const SKIP_FRAME_THRESHOLD = 1000 / 30; // 30 FPS minimum

// Automatic frame skipping under pressure
if (deltaTime > SKIP_FRAME_THRESHOLD) {
  return false; // Skip this frame
}
```

#### Performance Monitoring
```typescript
class RenderStats {
  fps: number;                    // Current frames per second
  frameTime: number;              // Time per frame in ms
  skippedFrames: number;          // Frames skipped due to performance
  dirtyRegions: number;           // Number of dirty regions
  layersRendered: number;         // Layers rendered this frame
}
```

## Memory Optimization

### Sprite Caching System

The engine includes an LRU (Least Recently Used) sprite cache:

```typescript
class SpriteCache {
  private cache: Map<string, HTMLImageElement>;
  private usage: Map<string, number>;
  private maxSize: number = 100; // Configurable cache size
  
  // Automatic eviction of least-used sprites
  private evictLRU(): void {
    const lruKey = this.findLeastRecentlyUsed();
    this.cache.delete(lruKey);
    this.usage.delete(lruKey);
  }
}
```

#### Cache Benefits
- **Reduced Loading**: Frequently used sprites stay in memory
- **Faster Rendering**: No repeated image loading
- **Memory Control**: LRU eviction prevents memory bloat
- **Hit Rate Tracking**: Monitor cache effectiveness

### Object Pooling

For frequently created/destroyed objects, consider implementing object pools:

```typescript
class ParticlePool {
  private pool: Particle[] = [];
  private active: Particle[] = [];
  
  public acquire(): Particle {
    return this.pool.pop() || new Particle();
  }
  
  public release(particle: Particle): void {
    particle.reset();
    this.pool.push(particle);
  }
}
```

### Memory Leak Prevention

#### Service Cleanup
```typescript
public dispose(): void {
  // Clean up event listeners
  this.inputManager.cleanup();
  
  // Dispose of rendering resources
  this.renderManager.dispose();
  
  // Clear service references
  this.services.dispose();
}
```

#### Canvas Context Management
```typescript
// Clear canvas to prevent memory accumulation
ctx.clearRect(0, 0, canvas.width, canvas.height);

// Reset canvas state to defaults
ctx.setTransform(1, 0, 0, 1, 0, 0);
ctx.globalAlpha = 1.0;
ctx.globalCompositeOperation = 'source-over';
```

## CPU Performance

### Spatial Partitioning

For games with many entities, implement spatial partitioning:

```typescript
class SpatialPartition {
  private grid: Map<string, Entity[]>;
  private cellSize: number = 64;
  
  // Only check entities in nearby cells
  public queryRegion(x: number, y: number, width: number, height: number): Entity[] {
    const cells = this.getCellsInRegion(x, y, width, height);
    return cells.flatMap(cell => this.grid.get(cell) || []);
  }
}
```

### Efficient Game Loop

The game loop is optimized for consistent performance:

```typescript
private gameLoop = (currentTime: number = 0): void => {
  if (!this.isRunning) return;

  const deltaTime = currentTime - this.lastTime;
  this.lastTime = currentTime;

  // Fixed timestep for game logic
  this.update(Math.min(deltaTime, 16.67)); // Cap at 60 FPS equivalent
  
  // Variable timestep for rendering
  this.render();

  requestAnimationFrame(this.gameLoop);
};
```

## Performance Profiling

### Built-in Profiling

The engine includes basic performance monitoring:

```typescript
// Enable performance monitoring
const optimizer = new RenderingOptimizer({ enableProfiling: true });

// Access performance stats
const stats = renderManager.getStats();
console.log(`FPS: ${stats.fps}, Frame Time: ${stats.frameTime}ms`);
```

### Browser Developer Tools

#### Performance Tab
1. Open DevTools (F12)
2. Navigate to Performance tab
3. Record game session
4. Analyze frame timing, CPU usage, and memory allocation

#### Memory Tab
1. Monitor memory usage over time
2. Take heap snapshots to identify memory leaks
3. Compare snapshots to track memory growth

### Custom Profiling

Add custom performance markers:

```typescript
class PerformanceProfiler {
  public static time(label: string): void {
    performance.mark(`${label}-start`);
  }
  
  public static timeEnd(label: string): number {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
    
    const measure = performance.getEntriesByName(label)[0];
    return measure.duration;
  }
}

// Usage
PerformanceProfiler.time('render-scene');
this.renderScene();
const renderTime = PerformanceProfiler.timeEnd('render-scene');
```

## Best Practices

### Rendering Optimization

#### Do:
- Use layer-based rendering for complex scenes
- Implement dirty region tracking
- Cache static content when possible
- Minimize canvas state changes
- Use `requestAnimationFrame` for smooth animation

#### Don't:
- Create objects in render loops
- Perform expensive calculations during rendering
- Draw outside visible canvas area
- Change canvas context state unnecessarily

### Memory Management

#### Do:
- Dispose of resources properly
- Use object pooling for frequently created objects
- Monitor memory usage during development
- Implement proper cleanup in scene transitions

#### Don't:
- Hold references to disposed objects
- Create memory leaks through event listeners
- Cache unlimited amounts of data
- Ignore browser memory warnings

### Code Organization

#### Do:
- Separate rendering from game logic
- Use services for shared functionality
- Implement proper error handling
- Profile performance regularly

#### Don't:
- Mix rendering and logic code
- Create tight coupling between systems
- Ignore TypeScript type warnings
- Skip performance testing

## Performance Configuration

### Render Settings
```typescript
const PERFORMANCE_CONFIG = {
  // Frame rate management
  TARGET_FPS: 60,
  MIN_FPS: 30,
  FRAME_SKIP_THRESHOLD: 1000 / 30,
  
  // Cache settings  
  SPRITE_CACHE_SIZE: 100,
  TEXTURE_CACHE_SIZE: 50,
  
  // Rendering options
  ENABLE_LAYER_CACHING: true,
  ENABLE_DIRTY_REGIONS: true,
  ENABLE_FRAME_SKIPPING: true,
  
  // Debug settings
  SHOW_PERFORMANCE_STATS: false,
  ENABLE_PROFILING: false,
};
```

### Quality Settings
```typescript
// Adjustable quality for different devices
enum QualityLevel {
  LOW = 'low',      // Minimal effects, 30 FPS target
  MEDIUM = 'medium', // Standard effects, 60 FPS target  
  HIGH = 'high',    // Full effects, 60+ FPS target
}
```

## Performance Monitoring

### Key Metrics to Track

1. **Frame Rate (FPS)**: Target 60 FPS, minimum 30 FPS
2. **Frame Time**: Target <16.67ms for 60 FPS
3. **Memory Usage**: Monitor for memory leaks and growth
4. **CPU Usage**: Keep below 80% for smooth gameplay
5. **GPU Usage**: Monitor for rendering bottlenecks

### Performance Testing

#### Stress Testing
- Test with maximum number of entities
- Simulate worst-case rendering scenarios
- Test on low-end devices and browsers
- Monitor performance over extended play sessions

#### Regression Testing
- Benchmark key operations before optimizations
- Compare performance after changes
- Set up automated performance testing
- Track performance metrics over time

This guide provides the foundation for optimizing performance in DRPG2. Regular profiling and monitoring are essential for maintaining optimal performance as the game grows in complexity.