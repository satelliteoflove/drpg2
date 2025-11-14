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
      this.triggerDetector.markTriggerFired();

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

    try {
      const context = this.buildContext(trigger, gameState);

      const response = await this.generator.generate(context);

      const validationResult = this.validator.validate(response, context);

      if (!validationResult.valid) {
        DebugLogger.warn('BanterOrchestrator', 'Validation failed', {
          triggerType: trigger.type,
          errors: validationResult.errors
        });

        this.metrics.recordValidationFailure();
        this.displayErrorMessage(gameState);
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
      }
    } catch (error) {
      DebugLogger.error('BanterOrchestrator', 'Generation failed', {
        triggerType: trigger.type,
        error: error instanceof Error ? error.message : String(error)
      });

      this.metrics.recordApiFailure();
      this.displayErrorMessage(gameState);
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
