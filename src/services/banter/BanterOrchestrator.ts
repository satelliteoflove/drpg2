import { TriggerDetector } from './TriggerDetector';
import { BanterGenerator } from './BanterGenerator';
import { BanterValidator } from './BanterValidator';
import { BanterPresenter } from './BanterPresenter';
import { BanterEventTracker } from './BanterEventTracker';
import { BanterMetrics } from './BanterMetrics';
import { ContextBuilder } from './ContextBuilder';
import { BanterTrigger, BanterTriggerType } from '../../types/BanterTypes';
import { GameState } from '../../types/GameTypes';
import { GAME_CONFIG } from '../../config/GameConstants';
import { DebugLogger } from '../../utils/DebugLogger';

export class BanterOrchestrator {
  private triggerDetector: TriggerDetector;
  private generator: BanterGenerator;
  private validator: BanterValidator;
  private presenter: BanterPresenter;
  private metrics: BanterMetrics;
  private contextBuilder: ContextBuilder;

  private isGenerating: boolean = false;
  private generationQueue: BanterTrigger[] = [];

  constructor(
    triggerDetector: TriggerDetector,
    generator: BanterGenerator,
    validator: BanterValidator,
    presenter: BanterPresenter,
    _eventTracker: BanterEventTracker,
    metrics: BanterMetrics,
    contextBuilder: ContextBuilder
  ) {
    this.triggerDetector = triggerDetector;
    this.generator = generator;
    this.validator = validator;
    this.presenter = presenter;
    this.metrics = metrics;
    this.contextBuilder = contextBuilder;

    DebugLogger.info('BanterOrchestrator', 'BanterOrchestrator initialized', {
      disableBanter: GAME_CONFIG.BANTER.DISABLE_BANTER
    });
  }

  update(_deltaTime: number, gameState: GameState): void {
    if (GAME_CONFIG.BANTER.DISABLE_BANTER) {
      return;
    }

    const trigger = this.triggerDetector.checkTriggers(gameState);

    if (trigger) {
      this.generationQueue.push(trigger);
      this.triggerDetector.markTriggerFired(gameState, trigger.type);

      DebugLogger.info('BanterOrchestrator', 'Trigger added to queue', {
        triggerType: trigger.type,
        priority: trigger.priority,
        queueLength: this.generationQueue.length
      });

      if (!this.isGenerating) {
        this.processNextTrigger(gameState);
      }
    }
  }

  forceTrigger(gameState: GameState): void {
    if (GAME_CONFIG.BANTER.DISABLE_BANTER) {
      DebugLogger.warn('BanterOrchestrator', 'Cannot force trigger - banter is disabled');
      return;
    }

    const manualTrigger: BanterTrigger = {
      type: BanterTriggerType.AmbientTime,
      priority: 10,
      timestamp: Date.now(),
      details: 'Manual trigger via B key (bypasses cooldown)'
    };

    this.generationQueue.push(manualTrigger);
    this.triggerDetector.markTriggerFired(gameState, manualTrigger.type);

    DebugLogger.info('BanterOrchestrator', 'Manual trigger added to queue (bypassing cooldown)', {
      triggerType: manualTrigger.type,
      priority: manualTrigger.priority,
      queueLength: this.generationQueue.length
    });

    if (!this.isGenerating) {
      this.processNextTrigger(gameState);
    }
  }

  private async processNextTrigger(gameState: GameState): Promise<void> {
    if (this.generationQueue.length === 0) {
      this.isGenerating = false;
      return;
    }

    this.isGenerating = true;
    const trigger = this.generationQueue.shift()!;

    DebugLogger.info('BanterOrchestrator', 'Processing trigger', {
      triggerType: trigger.type,
      priority: trigger.priority
    });

    const maxAttempts = 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const context = this.buildContext(trigger, gameState);

        DebugLogger.info('BanterOrchestrator', `Generation attempt ${attempt}/${maxAttempts}`, {
          triggerType: trigger.type
        });

        const response = await this.generator.generate(context);
        const validationResult = this.validator.validate(response, context);

        if (!validationResult.valid) {
          DebugLogger.warn('BanterOrchestrator', `Validation failed on attempt ${attempt}/${maxAttempts}`, {
            triggerType: trigger.type,
            errors: validationResult.errors,
            willRetry: attempt < maxAttempts
          });

          this.metrics.recordValidationFailure();

          if (attempt < maxAttempts) {
            continue;
          } else {
            this.displayErrorMessage(gameState);
          }
        } else {
          this.metrics.recordSuccess(trigger.type as BanterTriggerType);

          const messageLog = this.getMessageLog(gameState);
          const party = gameState.party;

          if (messageLog && party) {
            this.presenter.display(response, messageLog, party);
          } else {
            DebugLogger.warn('BanterOrchestrator', 'MessageLog or Party not available', {
              hasMessageLog: !!messageLog,
              hasParty: !!party
            });
          }
          break;
        }
      } catch (error) {
        DebugLogger.error('BanterOrchestrator', `Generation failed on attempt ${attempt}/${maxAttempts}`, {
          triggerType: trigger.type,
          error: error instanceof Error ? error.message : String(error),
          willRetry: attempt < maxAttempts
        });

        if (attempt < maxAttempts) {
          continue;
        } else {
          this.metrics.recordApiFailure();
          this.displayErrorMessage(gameState);
        }
      }
    }

    this.isGenerating = false;

    if (this.generationQueue.length > 0) {
      this.processNextTrigger(gameState);
    }
  }

  private buildContext(trigger: BanterTrigger, gameState: GameState) {
    const triggerType = trigger.type as BanterTriggerType;

    switch (triggerType) {
      case BanterTriggerType.CharacterDeath:
        return this.contextBuilder.buildRichContext(trigger, gameState);

      case BanterTriggerType.LowHpWarning:
      case BanterTriggerType.DarkZoneEntry:
        return this.contextBuilder.buildStandardContext(trigger, gameState);

      case BanterTriggerType.AmbientTime:
      case BanterTriggerType.AmbientDistance:
        return this.contextBuilder.buildMinimalContext(trigger, gameState);

      default:
        return this.contextBuilder.buildMinimalContext(trigger, gameState);
    }
  }

  private getMessageLog(gameState: GameState): any {
    return gameState.messageLog;
  }

  private displayErrorMessage(gameState: GameState): void {
    const messageLog = this.getMessageLog(gameState);

    if (messageLog) {
      this.presenter.displayErrorMessage(messageLog);
    }
  }
}
