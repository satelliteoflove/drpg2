import { ICharacter, CharacterStatus } from '../types/GameTypes';
import {
  ActiveStatusEffect,
  StatusEffectContext,
  StatusApplicationOptions,
  EXCLUSIVE_STATUS_GROUPS,
  RACIAL_RESISTANCES
} from '../types/StatusEffectTypes';
import { DiceRoller } from '../utils/DiceRoller';
import { DebugLogger } from '../utils/DebugLogger';

export class StatusEffectSystem {
  private static instance: StatusEffectSystem;

  constructor() {}

  public static getInstance(): StatusEffectSystem {
    if (!StatusEffectSystem.instance) {
      StatusEffectSystem.instance = new StatusEffectSystem();
    }
    return StatusEffectSystem.instance;
  }

  public applyStatusEffect(
    target: ICharacter,
    effectType: CharacterStatus,
    options: StatusApplicationOptions = {}
  ): boolean {
    if (!this.canInflict(target, effectType, options.ignoreResistance)) {
      DebugLogger.info('StatusEffectSystem', `Cannot inflict ${effectType} on ${target.name}`);
      return false;
    }

    this.handleExclusiveStatuses(target, effectType);

    const effect: ActiveStatusEffect = {
      type: effectType,
      turnsRemaining: options.duration
    };

    if (!Array.isArray(target.statuses)) {
      target.statuses = [];
    }

    const existingIndex = target.statuses.findIndex(s => s.type === effectType);
    if (existingIndex >= 0) {
      target.statuses[existingIndex] = effect;
    } else {
      target.statuses.push(effect);
    }

    DebugLogger.info('StatusEffectSystem', `Applied ${effectType} to ${target.name}`, { effect });

    if (effectType === 'Dead' || effectType === 'Ashed' || effectType === 'Lost') {
      target.isDead = true;
    }

    return true;
  }

  public removeStatusEffect(target: ICharacter, effectType: CharacterStatus): boolean {
    if (!Array.isArray(target.statuses)) {
      target.statuses = [];
      return false;
    }

    const initialLength = target.statuses.length;
    target.statuses = target.statuses.filter(s => s.type !== effectType);

    const removed = target.statuses.length < initialLength;

    if (removed) {
      DebugLogger.info('StatusEffectSystem', `Removed ${effectType} from ${target.name}`);

      if (effectType === 'Dead' || effectType === 'Ashed' || effectType === 'Lost') {
        const hasDeathStatus = target.statuses.some(s =>
          s.type === 'Dead' || s.type === 'Ashed' || s.type === 'Lost'
        );
        target.isDead = hasDeathStatus;
      }
    }

    return removed;
  }

  public canInflict(
    target: ICharacter,
    effectType: CharacterStatus,
    ignoreResistance: boolean = false
  ): boolean {
    if (ignoreResistance) {
      return true;
    }

    const resistanceChance = this.getResistanceChance(target, effectType);
    if (resistanceChance > 0) {
      const roll = DiceRoller.rollPercentile();
      if (roll <= resistanceChance) {
        DebugLogger.info('StatusEffectSystem', `${target.name} resisted ${effectType}`, {
          resistance: resistanceChance,
          roll
        });
        return false;
      }
    }

    return true;
  }

  public tick(target: ICharacter, context: StatusEffectContext): void {
    if (!Array.isArray(target.statuses)) {
      target.statuses = [];
      return;
    }

    for (let i = target.statuses.length - 1; i >= 0; i--) {
      const effect = target.statuses[i];

      this.applyEffectTick(target, effect, context);

      if (effect.turnsRemaining !== undefined) {
        effect.turnsRemaining--;
        if (effect.turnsRemaining <= 0) {
          target.statuses.splice(i, 1);
          DebugLogger.info('StatusEffectSystem', `${effect.type} expired on ${target.name}`);
        }
      }
    }
  }

  public getResistanceChance(target: ICharacter, effectType: CharacterStatus): number {
    let resistance = 0;

    const racialResistances = RACIAL_RESISTANCES[target.race];
    if (racialResistances && racialResistances.includes(effectType)) {
      resistance += 50;
    }

    return Math.min(resistance, 100);
  }

  public hasStatus(target: ICharacter, effectType: CharacterStatus): boolean {
    if (!Array.isArray(target.statuses)) {
      return false;
    }
    return target.statuses.some(s => s.type === effectType);
  }

  public getStatus(target: ICharacter, effectType: CharacterStatus): ActiveStatusEffect | undefined {
    if (!Array.isArray(target.statuses)) {
      return undefined;
    }
    return target.statuses.find(s => s.type === effectType);
  }

  public getAllStatuses(target: ICharacter): ActiveStatusEffect[] {
    if (!Array.isArray(target.statuses)) {
      return [];
    }
    return [...target.statuses];
  }

  private handleExclusiveStatuses(target: ICharacter, newEffectType: CharacterStatus): void {
    for (const group of EXCLUSIVE_STATUS_GROUPS) {
      if (group.includes(newEffectType)) {
        if (!Array.isArray(target.statuses)) {
          target.statuses = [];
          continue;
        }

        target.statuses = target.statuses.filter(s => !group.includes(s.type));
        break;
      }
    }
  }

  private applyEffectTick(target: ICharacter, effect: ActiveStatusEffect, context: StatusEffectContext): void {
    switch (effect.type) {
      case 'Poisoned':
        if (context === 'combat') {
          const damage = DiceRoller.roll('1d4');
          target.hp = Math.max(0, target.hp - damage);
          DebugLogger.info('StatusEffectSystem', `${target.name} took ${damage} poison damage`, {
            hp: target.hp
          });
        } else if (context === 'exploration') {
          const damage = DiceRoller.roll('1d4');
          target.hp = Math.max(1, target.hp - damage);
          DebugLogger.debug('StatusEffectSystem', `${target.name} took ${damage} poison damage while exploring`);
        }
        break;

      case 'Sleeping':
        if (context === 'combat') {
          const wakeChance = 20;
          const roll = DiceRoller.rollPercentile();
          if (roll <= wakeChance) {
            this.removeStatusEffect(target, 'Sleeping');
            DebugLogger.info('StatusEffectSystem', `${target.name} woke up naturally`);
          }
        }
        break;
    }
  }
}
