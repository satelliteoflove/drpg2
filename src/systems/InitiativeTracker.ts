import { Character } from '../entities/Character';
import { Monster } from '../types/GameTypes';
import {
  ReadinessState,
  TurnQueueEntry,
  InitiativeSnapshot,
  CombatEntity,
  isCharacter,
  getEntityId,
  getEntityName,
  getEntityAgility,
  getEntityLevel,
} from '../types/InitiativeTypes';
import { INITIATIVE, calculateBaseSpeed } from '../config/InitiativeConstants';
import { DebugLogger } from '../utils/DebugLogger';

export class InitiativeTracker {
  private readinessStates: Map<string, ReadinessState> = new Map();
  private entities: Map<string, CombatEntity> = new Map();
  private currentTick: number = 0;
  private activeEntityId: string | null = null;

  public initialize(characters: Character[], monsters: Monster[], partySurprised: boolean = false): void {
    this.readinessStates.clear();
    this.entities.clear();
    this.currentTick = 0;
    this.activeEntityId = null;

    const allEntities: CombatEntity[] = [
      ...characters.filter(c => !c.isDead),
      ...monsters.filter(m => m.hp > 0)
    ];

    for (const entity of allEntities) {
      const id = getEntityId(entity);
      const agility = getEntityAgility(entity);
      const level = getEntityLevel(entity);
      const baseSpeed = calculateBaseSpeed(agility, level);
      const isPlayer = isCharacter(entity);

      let initialReadiness = Math.floor(Math.random() * 4);

      if (partySurprised && isPlayer) {
        initialReadiness = -10;
      } else if (partySurprised && !isPlayer) {
        initialReadiness = 16 + Math.floor(Math.random() * 4);
      }

      this.readinessStates.set(id, {
        entityId: id,
        readiness: initialReadiness,
        baseSpeed,
      });

      this.entities.set(id, entity);

      DebugLogger.debug('InitiativeTracker', 'Entity initialized', {
        id,
        name: getEntityName(entity),
        agility,
        level,
        baseSpeed,
        initialReadiness,
        partySurprised
      });
    }
  }

  public advanceToNextActor(): CombatEntity | null {
    if (this.readinessStates.size === 0) {
      return null;
    }

    let iterations = 0;
    const maxIterations = 1000;

    while (iterations < maxIterations) {
      let highestReadiness = -Infinity;
      let readyEntityId: string | null = null;

      for (const [id, state] of this.readinessStates) {
        if (state.readiness >= INITIATIVE.READINESS_THRESHOLD && state.readiness > highestReadiness) {
          highestReadiness = state.readiness;
          readyEntityId = id;
        }
      }

      if (readyEntityId) {
        this.activeEntityId = readyEntityId;
        const entity = this.entities.get(readyEntityId);

        DebugLogger.info('InitiativeTracker', 'Actor ready', {
          entityId: readyEntityId,
          entityName: entity ? getEntityName(entity) : 'unknown',
          readiness: highestReadiness,
          tick: this.currentTick
        });

        return entity || null;
      }

      this.currentTick++;
      for (const [_id, state] of this.readinessStates) {
        state.readiness += state.baseSpeed;
      }

      iterations++;
    }

    DebugLogger.error('InitiativeTracker', 'Max iterations reached in advanceToNextActor');
    return null;
  }

  public applyActionDelay(entityId: string, delay: number): void {
    const state = this.readinessStates.get(entityId);
    if (!state) {
      DebugLogger.warn('InitiativeTracker', 'Cannot apply delay - entity not found', { entityId });
      return;
    }

    state.readiness = -delay;

    DebugLogger.debug('InitiativeTracker', 'Action delay applied', {
      entityId,
      delay,
      newReadiness: state.readiness
    });

    if (this.activeEntityId === entityId) {
      this.activeEntityId = null;
    }
  }

  public removeEntity(entityId: string): void {
    this.readinessStates.delete(entityId);
    this.entities.delete(entityId);

    if (this.activeEntityId === entityId) {
      this.activeEntityId = null;
    }

    DebugLogger.debug('InitiativeTracker', 'Entity removed', { entityId });
  }

  public getSnapshot(): InitiativeSnapshot {
    return {
      currentTick: this.currentTick,
      queue: this.projectTurnQueue(),
      activeEntityId: this.activeEntityId,
    };
  }

  private projectTurnQueue(): TurnQueueEntry[] {
    const queue: TurnQueueEntry[] = [];
    const simulatedStates = new Map<string, { readiness: number; baseSpeed: number }>();
    const addedEntityIds = new Set<string>();

    for (const [id, state] of this.readinessStates) {
      simulatedStates.set(id, {
        readiness: state.readiness,
        baseSpeed: state.baseSpeed
      });
    }

    if (this.activeEntityId && simulatedStates.has(this.activeEntityId)) {
      const entity = this.entities.get(this.activeEntityId);

      queue.push({
        entityId: this.activeEntityId,
        entityName: entity ? getEntityName(entity) : 'Unknown',
        isPlayer: entity ? isCharacter(entity) : false,
        queuePosition: 0,
        isCurrentActor: true
      });

      addedEntityIds.add(this.activeEntityId);
    }

    let simTick = 0;
    const maxSimTicks = 500;

    while (queue.length < INITIATIVE.QUEUE_DISPLAY_COUNT && simTick < maxSimTicks) {
      let highestReadiness = -Infinity;
      let nextActorId: string | null = null;

      for (const [id, state] of simulatedStates) {
        if (addedEntityIds.has(id)) continue;
        if (state.readiness >= INITIATIVE.READINESS_THRESHOLD && state.readiness > highestReadiness) {
          highestReadiness = state.readiness;
          nextActorId = id;
        }
      }

      if (nextActorId) {
        const entity = this.entities.get(nextActorId);
        const state = simulatedStates.get(nextActorId)!;

        queue.push({
          entityId: nextActorId,
          entityName: entity ? getEntityName(entity) : 'Unknown',
          isPlayer: entity ? isCharacter(entity) : false,
          queuePosition: queue.length,
          isCurrentActor: false
        });

        addedEntityIds.add(nextActorId);
        state.readiness = -INITIATIVE.ACTION_DELAYS.DEFEND;
      } else {
        simTick++;
        for (const [_id, state] of simulatedStates) {
          state.readiness += state.baseSpeed;
        }
      }
    }

    return queue;
  }

  public simulateGhostPosition(actionDelay: number): number {
    if (!this.activeEntityId) return 0;

    const simulatedStates = new Map<string, { readiness: number; baseSpeed: number }>();

    for (const [id, state] of this.readinessStates) {
      simulatedStates.set(id, {
        readiness: state.readiness,
        baseSpeed: state.baseSpeed
      });
    }

    const actorState = simulatedStates.get(this.activeEntityId);
    const actorEntity = this.entities.get(this.activeEntityId);
    const actorName = actorEntity ? getEntityName(actorEntity) : 'Unknown';
    if (actorState) {
      const originalReadiness = actorState.readiness;
      actorState.readiness = -actionDelay;
      DebugLogger.debug('InitiativeTracker', 'simulateGhostPosition START', {
        actorName,
        actionDelay,
        originalReadiness,
        newReadiness: -actionDelay,
        baseSpeed: actorState.baseSpeed
      });
    }

    let queuePosition = 0;
    let simTick = 0;
    const maxSimTicks = 500;
    const addedEntities = new Set<string>();

    while (queuePosition < INITIATIVE.QUEUE_DISPLAY_COUNT && simTick < maxSimTicks) {
      let highestReadiness = -Infinity;
      let nextActorId: string | null = null;

      for (const [id, state] of simulatedStates) {
        if (addedEntities.has(id)) continue;
        if (state.readiness >= INITIATIVE.READINESS_THRESHOLD && state.readiness > highestReadiness) {
          highestReadiness = state.readiness;
          nextActorId = id;
        }
      }

      if (nextActorId) {
        if (nextActorId === this.activeEntityId) {
          DebugLogger.debug('InitiativeTracker', 'simulateGhostPosition RESULT', {
            actorName,
            actionDelay,
            queuePosition,
            foundAt: 'loop'
          });
          return queuePosition;
        }
        addedEntities.add(nextActorId);
        const state = simulatedStates.get(nextActorId)!;
        state.readiness = -INITIATIVE.ACTION_DELAYS.DEFEND;
        queuePosition++;
      } else {
        simTick++;
        for (const [_id, state] of simulatedStates) {
          state.readiness += state.baseSpeed;
        }
      }
    }

    DebugLogger.debug('InitiativeTracker', 'simulateGhostPosition RESULT', {
      actorName,
      actionDelay,
      queuePosition,
      foundAt: 'end'
    });
    return queuePosition;
  }

  public getActiveEntity(): CombatEntity | null {
    if (!this.activeEntityId) return null;
    return this.entities.get(this.activeEntityId) || null;
  }

  public getActiveEntityId(): string | null {
    return this.activeEntityId;
  }

  public getCurrentTick(): number {
    return this.currentTick;
  }

  public hasEntity(entityId: string): boolean {
    return this.entities.has(entityId);
  }

  public getEntityReadiness(entityId: string): number | null {
    const state = this.readinessStates.get(entityId);
    return state ? state.readiness : null;
  }

  public getEntityCount(): number {
    return this.entities.size;
  }

  public reset(): void {
    this.readinessStates.clear();
    this.entities.clear();
    this.currentTick = 0;
    this.activeEntityId = null;
  }
}
