import { BanterTrigger, BanterTriggerType, TriggerDetector as ITriggerDetector } from '../../types/BanterTypes';
import { GAME_CONFIG } from '../../config/GameConstants';
import { DebugLogger } from '../../utils/DebugLogger';
import { BanterEventTracker } from './BanterEventTracker';

interface Position {
  x: number;
  y: number;
}

export class TriggerDetector implements ITriggerDetector {
  private eventTracker: BanterEventTracker;

  constructor(eventTracker: BanterEventTracker) {
    this.eventTracker = eventTracker;
  }

  checkTriggers(gameState: any): BanterTrigger | null {
    const now = Date.now();
    const cooldownMs = GAME_CONFIG.BANTER.TRIGGERS.COOLDOWN_SECONDS * 1000;

    this.ensureBanterState(gameState);
    this.updateStepCount(gameState);

    const lastTriggerTime = gameState.banterState.lastTriggerTime;
    const isInCooldown = now - lastTriggerTime < cooldownMs;

    if (isInCooldown) {
      return null;
    }

    const triggers: BanterTrigger[] = [];

    this.checkEventTriggers(gameState, triggers);
    this.checkTimeTrigger(now, gameState, triggers);
    this.checkDistanceTrigger(gameState, triggers);

    if (triggers.length === 0) {
      return null;
    }

    triggers.sort((a, b) => b.priority - a.priority);

    const selectedTrigger = triggers[0];
    DebugLogger.info('TriggerDetector', `Trigger detected: ${selectedTrigger.type}`, {
      type: selectedTrigger.type,
      priority: selectedTrigger.priority,
      details: selectedTrigger.details,
      totalCandidates: triggers.length,
      stepCount: gameState.banterState.stepCount
    });

    return selectedTrigger;
  }

  markTriggerFired(gameState: any, triggerType?: string): void {
    this.ensureBanterState(gameState);
    const now = Date.now();

    gameState.banterState.lastTriggerTime = now;

    if (triggerType === 'ambient_time') {
      gameState.banterState.lastTimeTrigger = now;
    }

    if (triggerType === 'ambient_distance') {
      gameState.banterState.stepCount = 0;
    }

    DebugLogger.debug('TriggerDetector', 'Trigger marked as fired', {
      timestamp: now,
      triggerType: triggerType || 'unknown',
      cooldownSeconds: GAME_CONFIG.BANTER.TRIGGERS.COOLDOWN_SECONDS,
      stepCount: gameState.banterState.stepCount
    });
  }

  private ensureBanterState(gameState: any): void {
    if (!gameState.banterState) {
      gameState.banterState = {
        lastTriggerTime: 0,
        lastTimeTrigger: 0,
        lastPosition: null,
        stepCount: 0
      };
      DebugLogger.info('TriggerDetector', 'Initialized banterState in gameState', gameState.banterState);
    }
  }

  private updateStepCount(gameState: any): void {
    if (!gameState.party || !gameState.dungeon) {
      return;
    }

    const currentPosition: Position = {
      x: gameState.party.x,
      y: gameState.party.y
    };

    const lastPosition = gameState.banterState.lastPosition;

    if (lastPosition) {
      const moved = currentPosition.x !== lastPosition.x || currentPosition.y !== lastPosition.y;
      if (moved) {
        gameState.banterState.stepCount++;
        DebugLogger.debug('TriggerDetector', `Step count updated: ${gameState.banterState.stepCount}`, {
          stepCount: gameState.banterState.stepCount,
          position: currentPosition
        });
      }
    }

    gameState.banterState.lastPosition = currentPosition;
  }

  private checkEventTriggers(gameState: any, triggers: BanterTrigger[]): void {
    if (!gameState.party) {
      return;
    }

    this.checkCharacterDeathTrigger(gameState, triggers);
    this.checkLowHpTrigger(gameState, triggers);
    this.checkDarkZoneTrigger(gameState, triggers);
  }

  private checkCharacterDeathTrigger(_gameState: any, triggers: BanterTrigger[]): void {
    const recentEvents = this.eventTracker.getRecentEvents(60000);
    const deathEvents = recentEvents.filter(e => e.type === 'character_death');

    if (deathEvents.length > 0) {
      const latestDeath = deathEvents[deathEvents.length - 1];
      triggers.push({
        type: BanterTriggerType.CharacterDeath,
        priority: GAME_CONFIG.BANTER.PRIORITIES.CHARACTER_DEATH,
        details: latestDeath.details,
        timestamp: Date.now()
      });
    }
  }

  private checkLowHpTrigger(gameState: any, triggers: BanterTrigger[]): void {
    if (!gameState.party || !gameState.party.characters) {
      return;
    }

    const characters = gameState.party.characters;
    const lowHpCharacters = characters.filter((char: any) => {
      const hpPercent = char.currentHp / char.maxHp;
      return hpPercent <= 0.3 && hpPercent > 0;
    });

    if (lowHpCharacters.length > 0) {
      const details = lowHpCharacters.length === 1
        ? `${lowHpCharacters[0].name} is critically wounded`
        : `${lowHpCharacters.length} party members are critically wounded`;

      triggers.push({
        type: BanterTriggerType.LowHpWarning,
        priority: GAME_CONFIG.BANTER.PRIORITIES.LOW_HP_WARNING,
        details,
        timestamp: Date.now()
      });
    }
  }

  private checkDarkZoneTrigger(gameState: any, triggers: BanterTrigger[]): void {
    if (!gameState.dungeon || !gameState.party || !gameState.currentFloor) {
      return;
    }

    const currentDungeon = gameState.dungeon[gameState.currentFloor - 1];
    if (!currentDungeon || !currentDungeon.getTile) {
      return;
    }

    const currentTile = currentDungeon.getTile(gameState.party.x, gameState.party.y);
    if (currentTile && currentTile.isDark) {
      const recentEvents = this.eventTracker.getRecentEvents(60000);
      const darkZoneEvents = recentEvents.filter(e => e.type === 'dark_zone_entry');

      if (darkZoneEvents.length > 0) {
        triggers.push({
          type: BanterTriggerType.DarkZoneEntry,
          priority: GAME_CONFIG.BANTER.PRIORITIES.DARK_ZONE_ENTRY,
          details: 'Party is in a dark zone',
          timestamp: Date.now()
        });
      }
    }
  }

  private checkTimeTrigger(now: number, gameState: any, triggers: BanterTrigger[]): void {
    const timeIntervalMs = GAME_CONFIG.BANTER.TRIGGERS.TIME_INTERVAL_SECONDS * 1000;
    const lastTimeTrigger = gameState.banterState.lastTimeTrigger;
    const timeSinceLastTime = now - lastTimeTrigger;

    if (timeSinceLastTime >= timeIntervalMs) {
      triggers.push({
        type: BanterTriggerType.AmbientTime,
        priority: GAME_CONFIG.BANTER.PRIORITIES.AMBIENT_TIME,
        details: `${Math.floor(timeSinceLastTime / 1000)} seconds elapsed`,
        timestamp: now
      });
    }
  }

  private checkDistanceTrigger(gameState: any, triggers: BanterTrigger[]): void {
    const distanceInterval = GAME_CONFIG.BANTER.TRIGGERS.DISTANCE_INTERVAL_STEPS;
    const stepCount = gameState.banterState.stepCount;

    if (stepCount >= distanceInterval) {
      triggers.push({
        type: BanterTriggerType.AmbientDistance,
        priority: GAME_CONFIG.BANTER.PRIORITIES.AMBIENT_DISTANCE,
        details: `${stepCount} steps traveled`,
        timestamp: Date.now()
      });
    }
  }
}
