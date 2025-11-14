import { BanterMetrics as IBanterMetrics, MetricsData, BanterTriggerType } from '../../types/BanterTypes';
import { DebugLogger } from '../../utils/DebugLogger';

export class BanterMetrics implements IBanterMetrics {
  private totalGenerations: number = 0;
  private successfulGenerations: number = 0;
  private failedGenerations: number = 0;
  private validationFailures: number = 0;
  private apiFailures: number = 0;
  private consecutiveFailures: number = 0;
  private generationTimes: number[] = [];
  private banterByTriggerType: Record<BanterTriggerType, number>;
  private lastLogTime: number = Date.now();
  private readonly LOG_INTERVAL_MS: number = 5 * 60 * 1000;

  constructor() {
    this.banterByTriggerType = {
      [BanterTriggerType.CharacterDeath]: 0,
      [BanterTriggerType.LowHpWarning]: 0,
      [BanterTriggerType.DarkZoneEntry]: 0,
      [BanterTriggerType.AmbientTime]: 0,
      [BanterTriggerType.AmbientDistance]: 0,
    };

    DebugLogger.info('BanterMetrics', 'BanterMetrics service initialized', {
      logIntervalMs: this.LOG_INTERVAL_MS
    });
  }

  recordGeneration(timeMs: number, success: boolean): void {
    this.totalGenerations++;
    this.generationTimes.push(timeMs);

    if (this.generationTimes.length > 100) {
      this.generationTimes.shift();
    }

    if (success) {
      this.successfulGenerations++;
      this.consecutiveFailures = 0;
      DebugLogger.info('BanterMetrics', 'Generation successful', {
        timeMs,
        totalGenerations: this.totalGenerations,
        successRate: this.getSuccessRate()
      });
    } else {
      this.failedGenerations++;
      this.consecutiveFailures++;
      DebugLogger.warn('BanterMetrics', 'Generation failed', {
        timeMs,
        consecutiveFailures: this.consecutiveFailures,
        totalGenerations: this.totalGenerations,
        successRate: this.getSuccessRate()
      });
    }

    this.checkPeriodicLogging();
  }

  recordValidationFailure(): void {
    this.validationFailures++;
    DebugLogger.warn('BanterMetrics', 'Validation failure recorded', {
      totalValidationFailures: this.validationFailures
    });
  }

  recordApiFailure(): void {
    this.apiFailures++;
    DebugLogger.error('BanterMetrics', 'API failure recorded', {
      totalApiFailures: this.apiFailures
    });
  }

  recordSuccess(triggerType: BanterTriggerType): void {
    this.banterByTriggerType[triggerType]++;
    DebugLogger.info('BanterMetrics', 'Successful banter recorded', {
      triggerType,
      count: this.banterByTriggerType[triggerType]
    });
  }

  getMetrics(): MetricsData {
    return {
      totalGenerations: this.totalGenerations,
      successfulGenerations: this.successfulGenerations,
      failedGenerations: this.failedGenerations,
      validationFailures: this.validationFailures,
      apiFailures: this.apiFailures,
      averageGenerationTimeMs: this.calculateAverage(),
      p95GenerationTimeMs: this.calculateP95(),
      consecutiveFailures: this.consecutiveFailures,
      banterByTriggerType: { ...this.banterByTriggerType }
    };
  }

  getStats(): any {
    const metrics = this.getMetrics();
    const successRate = this.getSuccessRate();

    return {
      summary: {
        totalGenerations: metrics.totalGenerations,
        successfulGenerations: metrics.successfulGenerations,
        failedGenerations: metrics.failedGenerations,
        successRate: `${successRate.toFixed(1)}%`,
        consecutiveFailures: metrics.consecutiveFailures
      },
      timing: {
        averageMs: metrics.averageGenerationTimeMs.toFixed(0),
        p95Ms: metrics.p95GenerationTimeMs.toFixed(0)
      },
      failures: {
        validationFailures: metrics.validationFailures,
        apiFailures: metrics.apiFailures
      },
      byTriggerType: metrics.banterByTriggerType
    };
  }

  private calculateAverage(): number {
    if (this.generationTimes.length === 0) {
      return 0;
    }
    const sum = this.generationTimes.reduce((acc, time) => acc + time, 0);
    return sum / this.generationTimes.length;
  }

  private calculateP95(): number {
    if (this.generationTimes.length === 0) {
      return 0;
    }
    const sorted = [...this.generationTimes].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * 0.95) - 1;
    return sorted[index];
  }

  private getSuccessRate(): number {
    if (this.totalGenerations === 0) {
      return 0;
    }
    return (this.successfulGenerations / this.totalGenerations) * 100;
  }

  private checkPeriodicLogging(): void {
    const now = Date.now();
    if (now - this.lastLogTime >= this.LOG_INTERVAL_MS) {
      this.logStats();
      this.lastLogTime = now;
    }
  }

  private logStats(): void {
    const stats = this.getStats();
    DebugLogger.info('BanterMetrics', 'Periodic metrics report', stats);
  }
}
