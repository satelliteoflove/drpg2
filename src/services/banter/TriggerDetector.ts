import { BanterTrigger, BanterTriggerType, TriggerDetector as ITriggerDetector } from '../../types/BanterTypes';
import { GAME_CONFIG } from '../../config/GameConstants';
import { DebugLogger } from '../../utils/DebugLogger';
import { BanterEventTracker } from './BanterEventTracker';

interface Position {
  x: number;
  y: number;
}

export class TriggerDetector implements ITriggerDetector {
  private lastTriggerTime: number = 0;
  private lastTimeTrigger: number = 0;
  private lastPosition: Position | null = null;
  private stepCount: number = 0;
  private eventTracker: BanterEventTracker;

  constructor(eventTracker: BanterEventTracker) {
    this.eventTracker = eventTracker;
  }

  checkTriggers(gameState: any): BanterTrigger | null {
    const now = Date.now();
    const cooldownMs = GAME_CONFIG.BANTER.TRIGGERS.COOLDOWN_SECONDS * 1000;

    if (now - this.lastTriggerTime < cooldownMs) {
      return null;
    }

    this.updateStepCount(gameState);

    const triggers: BanterTrigger[] = [];

    this.checkEventTriggers(gameState, triggers);
    this.checkTimeTrigger(now, triggers);
    this.checkDistanceTrigger(triggers);

    if (triggers.length === 0) {
      return null;
    }

    triggers.sort((a, b) => b.priority - a.priority);

    const selectedTrigger = triggers[0];
    DebugLogger.info('TriggerDetector', `Trigger detected: ${selectedTrigger.type}`, {
      type: selectedTrigger.type,
      priority: selectedTrigger.priority,
      details: selectedTrigger.details,
      totalCandidates: triggers.length
    });

    return selectedTrigger;
  }

  markTriggerFired(): void {
    this.lastTriggerTime = Date.now();
    this.lastTimeTrigger = Date.now();
    this.stepCount = 0;

    DebugLogger.debug('TriggerDetector', 'Trigger marked as fired', {
      timestamp: this.lastTriggerTime,
      cooldownSeconds: GAME_CONFIG.BANTER.TRIGGERS.COOLDOWN_SECONDS
    });
  }

  private updateStepCount(gameState: any): void {
    if (!gameState.party || !gameState.dungeon) {
      return;
    }

    const currentPosition: Position = {
      x: gameState.party.x,
      y: gameState.party.y
    };

    if (this.lastPosition) {
      const moved = currentPosition.x !== this.lastPosition.x || currentPosition.y !== this.lastPosition.y;
      if (moved) {
        this.stepCount++;
        DebugLogger.debug('TriggerDetector', `Step count updated: ${this.stepCount}`, {
          stepCount: this.stepCount,
          position: currentPosition
        });
      }
    }

    this.lastPosition = currentPosition;
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
    if (!gameState.dungeon || !gameState.party) {
      return;
    }

    const currentTile = gameState.dungeon.getTile(gameState.party.x, gameState.party.y);
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

  private checkTimeTrigger(now: number, triggers: BanterTrigger[]): void {
    const timeIntervalMs = GAME_CONFIG.BANTER.TRIGGERS.TIME_INTERVAL_SECONDS * 1000;
    const timeSinceLastTime = now - this.lastTimeTrigger;

    if (timeSinceLastTime >= timeIntervalMs) {
      triggers.push({
        type: BanterTriggerType.AmbientTime,
        priority: GAME_CONFIG.BANTER.PRIORITIES.AMBIENT_TIME,
        details: `${Math.floor(timeSinceLastTime / 1000)} seconds elapsed`,
        timestamp: now
      });
    }
  }

  private checkDistanceTrigger(triggers: BanterTrigger[]): void {
    const distanceInterval = GAME_CONFIG.BANTER.TRIGGERS.DISTANCE_INTERVAL_STEPS;

    if (this.stepCount >= distanceInterval) {
      triggers.push({
        type: BanterTriggerType.AmbientDistance,
        priority: GAME_CONFIG.BANTER.PRIORITIES.AMBIENT_DISTANCE,
        details: `${this.stepCount} steps traveled`,
        timestamp: Date.now()
      });
    }
  }
}
