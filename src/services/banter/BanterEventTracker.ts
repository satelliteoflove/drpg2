import { GameEvent, GameEventType, BanterEventTracker as IBanterEventTracker } from '../../types/BanterTypes';
import { DebugLogger } from '../../utils/DebugLogger';

const MAX_EVENTS = 10;
const MAX_EVENT_AGE_MS = 5 * 60 * 1000;

export class BanterEventTracker implements IBanterEventTracker {
  private events: GameEvent[] = [];

  recordEvent(event: GameEvent): void {
    this.cleanupOldEvents();

    this.events.push({ ...event, acknowledged: false });

    if (this.events.length > MAX_EVENTS) {
      this.events.shift();
    }

    DebugLogger.info('BanterEventTracker', `Event recorded: ${event.type}`, {
      type: event.type,
      characterName: event.characterName,
      details: event.details,
      totalEvents: this.events.length
    });
  }

  getRecentEvents(maxAge?: number): GameEvent[] {
    this.cleanupOldEvents();

    if (!maxAge) {
      return [...this.events];
    }

    const cutoffTime = Date.now() - maxAge;
    return this.events.filter(event => event.timestamp >= cutoffTime);
  }

  getUnacknowledgedEvents(eventType?: string): GameEvent[] {
    this.cleanupOldEvents();

    return this.events.filter(event =>
      !event.acknowledged &&
      (!eventType || event.type === eventType)
    );
  }

  markEventAcknowledged(event: GameEvent): void {
    const found = this.events.find(e =>
      e.type === event.type &&
      e.timestamp === event.timestamp &&
      e.characterName === event.characterName
    );

    if (found) {
      found.acknowledged = true;
      DebugLogger.debug('BanterEventTracker', `Event marked as acknowledged: ${event.type}`, {
        type: event.type,
        characterName: event.characterName,
        timestamp: event.timestamp
      });
    }
  }

  clearEvents(): void {
    const clearedCount = this.events.length;
    this.events = [];
    DebugLogger.info('BanterEventTracker', `Cleared ${clearedCount} events`);
  }

  recordCharacterDeath(characterName: string): void {
    const event: GameEvent = {
      type: GameEventType.CharacterDeath,
      timestamp: Date.now(),
      characterName,
      details: `${characterName} has died`
    };
    this.recordEvent(event);
  }

  recordDarkZoneEntry(): void {
    const event: GameEvent = {
      type: GameEventType.DarkZoneEntry,
      timestamp: Date.now(),
      details: 'Party entered a dark zone'
    };
    this.recordEvent(event);
  }

  recordCombatVictory(details: string): void {
    const event: GameEvent = {
      type: GameEventType.CombatVictory,
      timestamp: Date.now(),
      details
    };
    this.recordEvent(event);
  }

  recordTreasureFound(details: string): void {
    const event: GameEvent = {
      type: GameEventType.TreasureFound,
      timestamp: Date.now(),
      details
    };
    this.recordEvent(event);
  }

  private cleanupOldEvents(): void {
    const cutoffTime = Date.now() - MAX_EVENT_AGE_MS;
    const originalLength = this.events.length;
    this.events = this.events.filter(event => event.timestamp >= cutoffTime);

    const removedCount = originalLength - this.events.length;
    if (removedCount > 0) {
      DebugLogger.debug('BanterEventTracker', `Cleaned up ${removedCount} old events (older than 5 minutes)`);
    }
  }
}
