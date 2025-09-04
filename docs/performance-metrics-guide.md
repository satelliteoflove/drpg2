# Performance Metrics Guide

## Understanding the Performance Report

### Key Metrics Explained

#### Performance Score (0-100)
- **85-100**: Excellent - System ready for additional features
- **70-85**: Acceptable - Some optimization opportunities exist  
- **Below 70**: Needs optimization - Performance issues affecting gameplay

The score is calculated as:
- 70% weight on FPS consistency
- 30% weight on frame stability (avoiding drops)

#### FPS Metrics
- **Average FPS**: Overall frames per second - target is 60
- **Min FPS**: Lowest recorded FPS - must stay above 30
- **Max FPS**: Highest FPS - capped at 144 to prevent unrealistic values
- **Percentiles (95th, 99th)**: Shows consistency - closer to average = more stable

#### Frame Drops
- **Dropped Frames**: Frames that rendered below 60 FPS
- **Drop Rate %**: Percentage of frames below target
  - <20%: Excellent
  - 20-50%: Some stuttering
  - >50%: Noticeable performance issues

#### Timing Metrics
- **Render Time**: Time to draw the frame (in milliseconds)
  - <5ms: Excellent
  - 5-10ms: Good
  - >10ms: May cause frame drops
- **Update Time**: Time for game logic updates
  - <5ms: Excellent
  - 5-10ms: Acceptable
  - >10ms: Logic bottleneck

### New Enhanced Metrics (v2)

#### Frame Distribution
Shows where frames are landing:
- **60+ FPS**: Smooth gameplay frames
- **30-60 FPS**: Playable but not optimal
- **<30 FPS**: Unacceptable stuttering

#### Stuttering Detection
- Tracks consecutive dropped frames
- **>5 consecutive drops**: Noticeable stutter
- **>10 consecutive drops**: Severe stuttering issue

### Actionable Insights

#### When Average FPS is Good but Drop Rate is High
**Symptom**: 60+ avg FPS with 50%+ drops
**Cause**: Intermittent performance spikes
**Actions**:
1. Check for garbage collection pauses
2. Look for periodic heavy operations
3. Review asset loading patterns
4. Check for memory leaks

#### When Render Time is High
**Symptom**: Render time >10ms
**Cause**: Complex drawing operations
**Actions**:
1. Reduce number of draw calls
2. Optimize sprite batching
3. Simplify visual effects
4. Use dirty rectangle optimization

#### When Update Time is High
**Symptom**: Update time >10ms  
**Cause**: Heavy game logic
**Actions**:
1. Optimize collision detection
2. Reduce entity update frequency
3. Cache calculated values
4. Use spatial partitioning

#### Scene-Specific Issues
**Different performance per scene** indicates:
- Scene complexity varies significantly
- Opportunity for targeted optimization
- May need scene-specific render strategies

### Using Reports for Optimization

1. **Establish Baseline**: Run report before changes
2. **Make Changes**: Implement optimization
3. **Compare Reports**: Look for:
   - Performance score change
   - Drop rate improvement
   - Render/update time reduction
4. **Validate**: Ensure no regression in other scenes

### Performance Targets for ASCII Migration

For the ASCII rendering migration to be successful:
- **Must maintain**: 60+ average FPS
- **Must maintain**: <30% frame drop rate
- **Goal**: Reduce render complexity by 40%
- **Goal**: Improve testability without canvas

### Debugging Performance Issues

1. **Generate multiple reports**: Get consistent data
2. **Test different scenarios**:
   - Fresh start vs long session
   - Simple scenes vs complex scenes
   - After specific actions
3. **Look for patterns**:
   - Degradation over time = memory leak
   - Scene-specific = rendering issue
   - Consistent stuttering = frame timing issue

### Browser Considerations

- **Chrome/Edge**: Best for memory profiling
- **Firefox**: Different GC behavior
- **Safari**: May have different canvas performance
- Test in target browsers for accurate metrics

### Command Reference

```bash
# In-game commands
Ctrl+D  # Open debug scene
p       # Generate performance report

# Browser console (if needed)
DebugLogger.exportLogs()  # Export all debug logs
```