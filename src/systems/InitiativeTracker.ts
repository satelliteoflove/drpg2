import { Character } from '../entities/Character';
import { Monster } from '../types/GameTypes';
import {
  ChargeState,
  TurnQueueEntry,
  InitiativeSnapshot,
  GhostSimulationResult,
  CombatEntity,
  isCharacter,
  getEntityId,
  getEntityName,
  getEntityAgility,
} from '../types/InitiativeTypes';
import { calculateInitialDelay } from '../config/InitiativeConstants';
import { DebugLogger } from '../utils/DebugLogger';

export class InitiativeTracker {
  private chargeStates: Map<string, ChargeState> = new Map();
  private entities: Map<string, CombatEntity> = new Map();
  private choosingEntityId: string | null = null;

  public initialize(characters: Character[], monsters: Monster[], partySurprised: boolean = false): void {
    this.chargeStates.clear();
    this.entities.clear();
    this.choosingEntityId = null;

    const allEntities: CombatEntity[] = [
      ...characters.filter(c => !c.isDead),
      ...monsters.filter(m => m.hp > 0)
    ];

    const usedTicks = new Set<number>();

    for (const entity of allEntities) {
      const id = getEntityId(entity);
      const agility = getEntityAgility(entity);
      const isPlayer = isCharacter(entity);
      const surprised = partySurprised && isPlayer;

      let initialDelay = calculateInitialDelay(agility, surprised);
      initialDelay = this.findNextEmptySlot(initialDelay, usedTicks);
      usedTicks.add(initialDelay);

      this.chargeStates.set(id, {
        entityId: id,
        ticksRemaining: initialDelay,
        state: 'charging',
      });

      this.entities.set(id, entity);

      DebugLogger.debug('InitiativeTracker', 'Entity initialized', {
        id,
        name: getEntityName(entity),
        agility,
        initialDelay,
        surprised
      });
    }

    this.advanceUntilChoice();
  }

  private findNextEmptySlot(desiredTick: number, usedTicks: Set<number>): number {
    let tick = desiredTick;
    while (usedTicks.has(tick)) {
      tick++;
    }
    return tick;
  }

  public advanceUntilChoice(): CombatEntity | null {
    if (this.chargeStates.size === 0) {
      return null;
    }

    let iterations = 0;
    const maxIterations = 1000;

    while (iterations < maxIterations) {
      let lowestTicks = Infinity;
      let highestAgilityAtLowest = -Infinity;
      let nextEntityId: string | null = null;

      for (const [id, state] of this.chargeStates) {
        if (state.state === 'charging') {
          const entity = this.entities.get(id);
          const agility = entity ? getEntityAgility(entity) : 0;

          if (state.ticksRemaining < lowestTicks ||
              (state.ticksRemaining === lowestTicks && agility > highestAgilityAtLowest)) {
            lowestTicks = state.ticksRemaining;
            highestAgilityAtLowest = agility;
            nextEntityId = id;
          }
        }
      }

      if (nextEntityId === null) {
        DebugLogger.warn('InitiativeTracker', 'No charging entities found');
        return null;
      }

      if (lowestTicks <= 0) {
        const state = this.chargeStates.get(nextEntityId)!;
        state.state = 'choosing';
        state.ticksRemaining = 0;
        this.choosingEntityId = nextEntityId;

        const entity = this.entities.get(nextEntityId);
        DebugLogger.info('InitiativeTracker', 'Entity ready to choose', {
          entityId: nextEntityId,
          entityName: entity ? getEntityName(entity) : 'unknown',
        });

        return entity || null;
      }

      for (const state of this.chargeStates.values()) {
        if (state.state === 'charging') {
          state.ticksRemaining -= lowestTicks;
        }
      }

      iterations++;
    }

    DebugLogger.error('InitiativeTracker', 'Max iterations reached in advanceUntilChoice');
    return null;
  }

  public assignChargeTime(entityId: string, chargeTime: number): void {
    const state = this.chargeStates.get(entityId);
    if (!state) {
      DebugLogger.warn('InitiativeTracker', 'Cannot assign charge time - entity not found', { entityId });
      return;
    }

    state.ticksRemaining = chargeTime;
    state.state = 'charging';

    DebugLogger.debug('InitiativeTracker', 'Charge time assigned', {
      entityId,
      chargeTime,
    });

    if (this.choosingEntityId === entityId) {
      this.choosingEntityId = null;
    }
  }

  public executeAction(entityId: string): void {
    const state = this.chargeStates.get(entityId);
    if (!state) {
      DebugLogger.warn('InitiativeTracker', 'Cannot execute action - entity not found', { entityId });
      return;
    }

    state.state = 'choosing';
    state.ticksRemaining = 0;
    this.choosingEntityId = entityId;

    DebugLogger.debug('InitiativeTracker', 'Action executed, ready to choose next', { entityId });
  }

  public removeEntity(entityId: string): void {
    this.chargeStates.delete(entityId);
    this.entities.delete(entityId);

    if (this.choosingEntityId === entityId) {
      this.choosingEntityId = null;
    }

    DebugLogger.debug('InitiativeTracker', 'Entity removed', { entityId });
  }

  public getSnapshot(): InitiativeSnapshot {
    const queue: (TurnQueueEntry & { agility: number })[] = [];

    for (const [id, state] of this.chargeStates) {
      const entity = this.entities.get(id);
      if (!entity) continue;

      queue.push({
        entityId: id,
        entityName: getEntityName(entity),
        isPlayer: isCharacter(entity),
        ticksRemaining: state.ticksRemaining,
        isChoosing: state.state === 'choosing',
        agility: getEntityAgility(entity),
      });
    }

    queue.sort((a, b) => {
      if (a.ticksRemaining !== b.ticksRemaining) return a.ticksRemaining - b.ticksRemaining;
      return b.agility - a.agility;
    });

    return {
      queue: queue.map(({ agility, ...rest }) => rest),
      choosingEntityId: this.choosingEntityId,
    };
  }

  public simulateGhostPosition(chargeTime: number): GhostSimulationResult {
    if (!this.choosingEntityId) {
      return { position: 0, finalTicksRemaining: chargeTime };
    }

    const queue: { entityId: string; ticks: number; agility: number }[] = [];

    for (const [id, state] of this.chargeStates) {
      const entity = this.entities.get(id);
      const agility = entity ? getEntityAgility(entity) : 0;
      queue.push({ entityId: id, ticks: state.ticksRemaining, agility });
    }

    const existingIndex = queue.findIndex(e => e.entityId === this.choosingEntityId);
    if (existingIndex >= 0) {
      queue[existingIndex].ticks = chargeTime;
    }

    queue.sort((a, b) => {
      if (a.ticks !== b.ticks) return a.ticks - b.ticks;
      return b.agility - a.agility;
    });

    const position = queue.findIndex(e => e.entityId === this.choosingEntityId);

    DebugLogger.debug('InitiativeTracker', 'simulateGhostPosition', {
      choosingEntityId: this.choosingEntityId,
      chargeTime,
      position,
      queueLength: queue.length,
    });

    return { position, finalTicksRemaining: chargeTime };
  }

  public getChoosingEntity(): CombatEntity | null {
    if (!this.choosingEntityId) return null;
    return this.entities.get(this.choosingEntityId) || null;
  }

  public getChoosingEntityId(): string | null {
    return this.choosingEntityId;
  }

  public hasEntity(entityId: string): boolean {
    return this.entities.has(entityId);
  }

  public getEntityTicksRemaining(entityId: string): number | null {
    const state = this.chargeStates.get(entityId);
    return state ? state.ticksRemaining : null;
  }

  public getEntityCount(): number {
    return this.entities.size;
  }

  public reset(): void {
    this.chargeStates.clear();
    this.entities.clear();
    this.choosingEntityId = null;
  }
}
