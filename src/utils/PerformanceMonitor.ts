import { DebugLogger } from './DebugLogger';

// Constants for performance thresholds
const TARGET_FPS = 60;
const MIN_ACCEPTABLE_FPS = 30;
const SAMPLE_WINDOW_SIZE = 60; // Number of frames to average
const MEMORY_SAMPLE_INTERVAL = 1000; // ms between memory samples
const PERCENTILE_95 = 0.95;
const PERCENTILE_99 = 0.99;

interface FrameMetrics {
  timestamp: number;
  deltaTime: number;
  fps: number;
  renderTime: number;
  updateTime: number;
}

interface MemoryMetrics {
  timestamp: number;
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
}

interface SceneMetrics {
  sceneName: string;
  frameMetrics: FrameMetrics[];
  memoryMetrics: MemoryMetrics[];
  startTime: number;
  endTime?: number;
  averageFPS?: number;
  minFPS?: number;
  maxFPS?: number;
  p95FPS?: number;
  p99FPS?: number;
  averageRenderTime?: number;
  averageUpdateTime?: number;
  peakMemoryUsage?: number;
}

interface PerformanceReport {
  timestamp: number;
  sessionDuration: number;
  sceneMetrics: Map<string, SceneMetrics>;
  globalMetrics: {
    overallAverageFPS: number;
    overallMinFPS: number;
    overallMaxFPS: number;
    totalFramesRendered: number;
    droppedFrames: number;
    performanceScore: number; // 0-100 score
  };
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private isMonitoring: boolean = false;
  private currentScene: string | null = null;
  private sceneMetrics: Map<string, SceneMetrics> = new Map();
  private frameBuffer: FrameMetrics[] = [];
  private lastFrameTime: number = 0;
  private sessionStartTime: number = 0;
  private memoryInterval: number | null = null;
  private lastLoggedMaxFrameTime: number = 0;

  // Timing markers for different phases
  private renderStartTime: number = 0;
  private updateStartTime: number = 0;

  private constructor() {
    DebugLogger.info('PerformanceMonitor', 'Initialized');
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  public startMonitoring(sceneName: string): void {
    if (this.isMonitoring && this.currentScene === sceneName) {
      DebugLogger.warn('PerformanceMonitor', `Already monitoring scene: ${sceneName}`);
      return;
    }

    // Save previous scene metrics if switching scenes
    if (this.isMonitoring && this.currentScene) {
      this.finalizeSceneMetrics(this.currentScene);
    }

    this.currentScene = sceneName;
    this.isMonitoring = true;
    this.frameBuffer = [];
    this.lastFrameTime = performance.now();

    if (this.sessionStartTime === 0) {
      this.sessionStartTime = Date.now();
    }

    // Initialize scene metrics
    const metrics: SceneMetrics = {
      sceneName,
      frameMetrics: [],
      memoryMetrics: [],
      startTime: Date.now(),
    };
    this.sceneMetrics.set(sceneName, metrics);

    // Start memory monitoring
    this.startMemoryMonitoring(sceneName);

    DebugLogger.info('PerformanceMonitor', `Started monitoring scene: ${sceneName}`);
  }

  public stopMonitoring(): void {
    if (!this.isMonitoring || !this.currentScene) {
      return;
    }

    this.finalizeSceneMetrics(this.currentScene);
    this.stopMemoryMonitoring();
    this.isMonitoring = false;
    this.currentScene = null;
    this.frameBuffer = [];

    DebugLogger.info('PerformanceMonitor', 'Stopped monitoring');
  }

  public markRenderStart(): void {
    this.renderStartTime = performance.now();
  }

  public markRenderEnd(): void {
    if (!this.isMonitoring || !this.currentScene) return;

    const renderTime = performance.now() - this.renderStartTime;
    const metrics = this.sceneMetrics.get(this.currentScene);
    if (metrics && metrics.frameMetrics.length > 0) {
      // Use higher precision for render time
      metrics.frameMetrics[metrics.frameMetrics.length - 1].renderTime =
        Math.round(renderTime * 100) / 100;
    }
  }

  public markUpdateStart(): void {
    this.updateStartTime = performance.now();
  }

  public markUpdateEnd(): void {
    if (!this.isMonitoring || !this.currentScene) return;

    const updateTime = performance.now() - this.updateStartTime;
    const metrics = this.sceneMetrics.get(this.currentScene);
    if (metrics && metrics.frameMetrics.length > 0) {
      // Use higher precision for update time
      metrics.frameMetrics[metrics.frameMetrics.length - 1].updateTime =
        Math.round(updateTime * 100) / 100;
    }
  }

  public recordFrame(): void {
    if (!this.isMonitoring || !this.currentScene) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;

    // Prevent division by zero and unrealistic FPS values
    const fps = deltaTime > 0 ? Math.min(1000 / deltaTime, 144) : TARGET_FPS;

    const frameMetric: FrameMetrics = {
      timestamp: Date.now(),
      deltaTime,
      fps,
      renderTime: 0,
      updateTime: 0,
    };

    // Add to current scene metrics
    const metrics = this.sceneMetrics.get(this.currentScene);
    if (metrics) {
      metrics.frameMetrics.push(frameMetric);

      // Keep only recent samples to prevent memory growth
      const maxSamples = 1000;
      if (metrics.frameMetrics.length > maxSamples) {
        metrics.frameMetrics.splice(0, metrics.frameMetrics.length - maxSamples);
      }
    }

    // Add to frame buffer for rolling average
    this.frameBuffer.push(frameMetric);
    if (this.frameBuffer.length > SAMPLE_WINDOW_SIZE) {
      this.frameBuffer.shift();
    }

    this.lastFrameTime = currentTime;

    if (deltaTime > 100) {
      const devToolsOpen = /./;
      devToolsOpen.toString = function() { (this as any).opened = true; return ''; };
      DebugLogger.debug('PerformanceMonitor', 'Dev tools check', devToolsOpen);
      const devToolsStatus = (devToolsOpen as any).opened ? ' [DEV TOOLS OPEN]' : '';

      DebugLogger.warn(
        'PerformanceMonitor',
        `Frame spike: ${deltaTime.toFixed(2)}ms (${fps.toFixed(1)} FPS)${devToolsStatus}`
      );
    }
  }

  public getCurrentFPS(): number {
    if (this.frameBuffer.length === 0) return 0;

    const totalFPS = this.frameBuffer.reduce((sum, frame) => sum + frame.fps, 0);
    return totalFPS / this.frameBuffer.length;
  }

  public getAverageFPS(sceneName?: string): number {
    const scene = sceneName || this.currentScene;
    if (!scene) return 0;

    const metrics = this.sceneMetrics.get(scene);
    if (!metrics || metrics.frameMetrics.length === 0) return 0;

    const totalFPS = metrics.frameMetrics.reduce((sum, frame) => sum + frame.fps, 0);
    return totalFPS / metrics.frameMetrics.length;
  }

  public generateReport(): PerformanceReport {
    // Finalize current scene if still monitoring
    if (this.isMonitoring && this.currentScene) {
      this.finalizeSceneMetrics(this.currentScene);
    }

    let totalFrames = 0;
    let totalDroppedFrames = 0;
    const allFPSValues: number[] = [];

    // Calculate global metrics
    this.sceneMetrics.forEach((metrics) => {
      totalFrames += metrics.frameMetrics.length;
      metrics.frameMetrics.forEach((frame) => {
        if (frame.fps < TARGET_FPS) {
          totalDroppedFrames++;
        }
        allFPSValues.push(frame.fps);
      });
    });

    const overallAverageFPS =
      allFPSValues.length > 0 ? allFPSValues.reduce((a, b) => a + b, 0) / allFPSValues.length : 0;

    const overallMinFPS = allFPSValues.length > 0 ? Math.min(...allFPSValues) : 0;

    const overallMaxFPS = allFPSValues.length > 0 ? Math.max(...allFPSValues) : 0;

    // Calculate performance score (0-100)
    const fpsScore = Math.min(100, (overallAverageFPS / TARGET_FPS) * 100);
    const stabilityScore = Math.max(0, 100 - (totalDroppedFrames / Math.max(1, totalFrames)) * 100);
    const performanceScore = fpsScore * 0.7 + stabilityScore * 0.3;

    const report: PerformanceReport = {
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.sessionStartTime,
      sceneMetrics: new Map(this.sceneMetrics),
      globalMetrics: {
        overallAverageFPS,
        overallMinFPS,
        overallMaxFPS,
        totalFramesRendered: totalFrames,
        droppedFrames: totalDroppedFrames,
        performanceScore,
      },
    };

    DebugLogger.info(
      'PerformanceMonitor',
      `Generated performance report. Score: ${performanceScore.toFixed(1)}/100`
    );

    return report;
  }

  public exportReportAsMarkdown(report: PerformanceReport): string {
    const lines: string[] = [];

    lines.push('# Performance Baseline Report');
    lines.push('');
    lines.push(`Generated: ${new Date(report.timestamp).toISOString()}`);
    lines.push(`Session Duration: ${(report.sessionDuration / 1000).toFixed(1)}s`);
    lines.push('');

    lines.push('## Overall Performance');
    lines.push('');
    lines.push(`- **Performance Score**: ${report.globalMetrics.performanceScore.toFixed(1)}/100`);
    lines.push(`- **Average FPS**: ${report.globalMetrics.overallAverageFPS.toFixed(1)}`);
    lines.push(`- **Min FPS**: ${report.globalMetrics.overallMinFPS.toFixed(1)}`);
    lines.push(`- **Max FPS**: ${report.globalMetrics.overallMaxFPS.toFixed(1)}`);
    lines.push(`- **Total Frames**: ${report.globalMetrics.totalFramesRendered}`);
    lines.push(
      `- **Dropped Frames**: ${report.globalMetrics.droppedFrames} (${((report.globalMetrics.droppedFrames / report.globalMetrics.totalFramesRendered) * 100).toFixed(1)}%)`
    );

    // Add frame drop analysis
    if (report.globalMetrics.droppedFrames > 0) {
      const dropRate =
        (report.globalMetrics.droppedFrames / report.globalMetrics.totalFramesRendered) * 100;
      if (dropRate > 50) {
        lines.push(`- **⚠️ High frame drop rate detected**: Investigate stuttering causes`);
      } else if (dropRate > 20) {
        lines.push(`- **⚡ Moderate frame drops**: Some optimization needed`);
      }
    }

    lines.push('');

    lines.push('## Scene-by-Scene Breakdown');
    lines.push('');

    report.sceneMetrics.forEach((metrics) => {
      lines.push(`### ${metrics.sceneName}`);
      lines.push('');

      const duration = metrics.endTime ? (metrics.endTime - metrics.startTime) / 1000 : 0;

      lines.push(`- **Duration**: ${duration.toFixed(1)}s`);
      lines.push(`- **Frames Rendered**: ${metrics.frameMetrics.length}`);

      if (metrics.averageFPS !== undefined) {
        lines.push(`- **Average FPS**: ${metrics.averageFPS.toFixed(1)}`);
        lines.push(`- **Min FPS**: ${metrics.minFPS?.toFixed(1)}`);
        lines.push(`- **Max FPS**: ${metrics.maxFPS?.toFixed(1)}`);
        lines.push(`- **95th Percentile FPS**: ${metrics.p95FPS?.toFixed(1)}`);
        lines.push(`- **99th Percentile FPS**: ${metrics.p99FPS?.toFixed(1)}`);
      }

      if (metrics.averageRenderTime !== undefined) {
        lines.push(`- **Average Render Time**: ${metrics.averageRenderTime.toFixed(2)}ms`);
      }

      if (metrics.averageUpdateTime !== undefined) {
        lines.push(`- **Average Update Time**: ${metrics.averageUpdateTime.toFixed(2)}ms`);
      }

      if (metrics.peakMemoryUsage !== undefined) {
        lines.push(
          `- **Peak Memory Usage**: ${(metrics.peakMemoryUsage / 1024 / 1024).toFixed(1)}MB`
        );
      }

      // Add frame distribution analysis
      if (metrics.frameMetrics.length > 0) {
        const fps30to60 = metrics.frameMetrics.filter((f) => f.fps >= 30 && f.fps < 60).length;
        const fps60plus = metrics.frameMetrics.filter((f) => f.fps >= 60).length;
        const fpsBelow30 = metrics.frameMetrics.filter((f) => f.fps < 30).length;

        lines.push('');
        lines.push('**Frame Distribution:**');
        lines.push(
          `  - 60+ FPS: ${fps60plus} frames (${((fps60plus / metrics.frameMetrics.length) * 100).toFixed(1)}%)`
        );
        lines.push(
          `  - 30-60 FPS: ${fps30to60} frames (${((fps30to60 / metrics.frameMetrics.length) * 100).toFixed(1)}%)`
        );
        lines.push(
          `  - <30 FPS: ${fpsBelow30} frames (${((fpsBelow30 / metrics.frameMetrics.length) * 100).toFixed(1)}%)`
        );

        // Identify stuttering patterns
        let maxConsecutiveDrops = 0;
        let currentDropStreak = 0;
        metrics.frameMetrics.forEach((frame) => {
          if (frame.fps < TARGET_FPS) {
            currentDropStreak++;
            maxConsecutiveDrops = Math.max(maxConsecutiveDrops, currentDropStreak);
          } else {
            currentDropStreak = 0;
          }
        });

        if (maxConsecutiveDrops > 5) {
          lines.push(
            `  - **⚠️ Stuttering detected**: Max ${maxConsecutiveDrops} consecutive dropped frames`
          );
        }
      }

      lines.push('');
    });

    lines.push('## Performance Targets');
    lines.push('');
    lines.push(`- **Target FPS**: ${TARGET_FPS}`);
    lines.push(`- **Minimum Acceptable FPS**: ${MIN_ACCEPTABLE_FPS}`);
    lines.push('');

    lines.push('## Recommendations');
    lines.push('');

    if (report.globalMetrics.performanceScore < 70) {
      lines.push('- ⚠️ Performance is below acceptable levels');
      lines.push('- Consider optimizing rendering loops');
      lines.push('- Profile CPU usage to identify bottlenecks');
    } else if (report.globalMetrics.performanceScore < 85) {
      lines.push('- ⚡ Performance is acceptable but could be improved');
      lines.push('- Monitor for frame drops during complex scenes');
    } else {
      lines.push('- ✅ Performance is excellent');
      lines.push('- System is ready for additional features');
    }

    return lines.join('\n');
  }

  private startMemoryMonitoring(sceneName: string): void {
    if (!('memory' in performance)) {
      DebugLogger.warn('PerformanceMonitor', 'Memory monitoring not available in this browser');
      return;
    }

    this.stopMemoryMonitoring();

    this.memoryInterval = window.setInterval(() => {
      const metrics = this.sceneMetrics.get(sceneName);
      if (!metrics) return;

      const memory = (performance as any).memory;
      const memoryMetric: MemoryMetrics = {
        timestamp: Date.now(),
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };

      metrics.memoryMetrics.push(memoryMetric);

      // Keep only recent samples
      const maxSamples = 100;
      if (metrics.memoryMetrics.length > maxSamples) {
        metrics.memoryMetrics.splice(0, metrics.memoryMetrics.length - maxSamples);
      }
    }, MEMORY_SAMPLE_INTERVAL);
  }

  private stopMemoryMonitoring(): void {
    if (this.memoryInterval !== null) {
      clearInterval(this.memoryInterval);
      this.memoryInterval = null;
    }
  }

  private finalizeSceneMetrics(sceneName: string): void {
    const metrics = this.sceneMetrics.get(sceneName);
    if (!metrics) return;

    metrics.endTime = Date.now();

    // Calculate FPS statistics
    if (metrics.frameMetrics.length > 0) {
      const fpsValues = metrics.frameMetrics.map((f) => f.fps).sort((a, b) => a - b);

      metrics.averageFPS = fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length;
      metrics.minFPS = fpsValues[0];
      metrics.maxFPS = fpsValues[fpsValues.length - 1];

      // Calculate percentiles
      const p95Index = Math.floor(fpsValues.length * PERCENTILE_95);
      const p99Index = Math.floor(fpsValues.length * PERCENTILE_99);
      metrics.p95FPS = fpsValues[p95Index];
      metrics.p99FPS = fpsValues[p99Index];

      // Calculate average render and update times
      const renderTimes = metrics.frameMetrics.map((f) => f.renderTime).filter((t) => t > 0);
      const updateTimes = metrics.frameMetrics.map((f) => f.updateTime).filter((t) => t > 0);

      if (renderTimes.length > 0) {
        metrics.averageRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
      }

      if (updateTimes.length > 0) {
        metrics.averageUpdateTime = updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length;
      }
    }

    // Calculate peak memory usage
    if (metrics.memoryMetrics.length > 0) {
      const memoryValues = metrics.memoryMetrics
        .map((m) => m.usedJSHeapSize || 0)
        .filter((v) => v > 0);

      if (memoryValues.length > 0) {
        metrics.peakMemoryUsage = Math.max(...memoryValues);
      }
    }

    DebugLogger.info(
      'PerformanceMonitor',
      `Finalized metrics for ${sceneName}: Avg FPS=${metrics.averageFPS?.toFixed(1)}`
    );
  }

  public reset(): void {
    this.stopMonitoring();
    this.sceneMetrics.clear();
    this.frameBuffer = [];
    this.sessionStartTime = 0;
    this.lastLoggedMaxFrameTime = 0;
    DebugLogger.info('PerformanceMonitor', 'Reset all metrics');
  }

  public getMetrics(): {
    fps: number;
    frameTime: number;
    updateTime: number;
    renderTime: number;
    raycastTime: number;
    avgFrameTime: number;
    maxFrameTime: number;
    spikeCount: number;
  } {
    const currentFps = this.getCurrentFPS();

    const currentFrameMetrics = this.frameBuffer.length > 0
      ? this.frameBuffer[this.frameBuffer.length - 1]
      : { deltaTime: 0, updateTime: 0, renderTime: 0 };

    const avgFrameTime = this.frameBuffer.length > 0
      ? this.frameBuffer.reduce((sum, f) => sum + f.deltaTime, 0) / this.frameBuffer.length
      : 0;

    const maxFrameTime = this.frameBuffer.length > 0
      ? Math.max(...this.frameBuffer.map(f => f.deltaTime))
      : 0;

    if (maxFrameTime > 100 && maxFrameTime !== this.lastLoggedMaxFrameTime) {
      this.lastLoggedMaxFrameTime = maxFrameTime;
      const spikeFrame = this.frameBuffer.find(f => f.deltaTime === maxFrameTime);
      DebugLogger.warn(
        'PerformanceMonitor',
        `Frame spike detected: ${maxFrameTime.toFixed(2)}ms`,
        {
          updateTime: spikeFrame?.updateTime.toFixed(2) || 0,
          renderTime: spikeFrame?.renderTime.toFixed(2) || 0,
          frameBufferSize: this.frameBuffer.length,
          timestamp: new Date(spikeFrame?.timestamp || Date.now()).toISOString()
        }
      );
    }

    return {
      fps: currentFps,
      frameTime: currentFrameMetrics.deltaTime,
      updateTime: currentFrameMetrics.updateTime,
      renderTime: currentFrameMetrics.renderTime,
      raycastTime: (this as any).raycastTime || 0,
      avgFrameTime,
      maxFrameTime,
      spikeCount: 0,
    };
  }
}
