import { ICharacter, CharacterStatus, Monster } from '../types/GameTypes';
import {
  ActiveStatusEffect,
  StatusEffectContext,
  StatusApplicationOptions,
  EXCLUSIVE_STATUS_GROUPS,
  RACIAL_RESISTANCES
} from '../types/StatusEffectTypes';
import { DiceRoller } from '../utils/DiceRoller';
import { DebugLogger } from '../utils/DebugLogger';
import { EquipmentModifierManager } from './EquipmentModifierManager';


export class StatusEffectSystem {
  private static instance: StatusEffectSystem;
  private equipmentManager: EquipmentModifierManager;

  constructor(equipmentManager: EquipmentModifierManager) {
    this.equipmentManager = equipmentManager;
  }

  public static getInstance(): StatusEffectSystem {
    if (!StatusEffectSystem.instance) {
      StatusEffectSystem.instance = new StatusEffectSystem(EquipmentModifierManager.getInstance());
    }
    return StatusEffectSystem.instance;
  }

  public applyStatusEffect(
    target: ICharacter | Monster,
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
      turnsRemaining: options.duration,
      source: options.source,
      power: options.power,
      casterLevel: options.casterLevel
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

    DebugLogger.info('StatusEffectSystem', `Applied ${effectType} to ${target.name}`, {
      effect,
      targetId: (target as any).id,
      statusesLength: target.statuses?.length || 0
    });

    if (effectType === 'Dead' || effectType === 'Ashed' || effectType === 'Lost') {
      target.isDead = true;
    }

    return true;
  }

  public removeStatusEffect(target: ICharacter | Monster, effectType: CharacterStatus): boolean {
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
    target: ICharacter | Monster,
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

  public tick(target: ICharacter | Monster, context: StatusEffectContext): void {
    DebugLogger.debug('StatusEffectSystem', `tick() called on ${target.name}`, {
      targetId: (target as any).id,
      statusesBefore: target.statuses,
      isArray: Array.isArray(target.statuses),
      context
    });

    if (!Array.isArray(target.statuses)) {
      DebugLogger.warn('StatusEffectSystem', `tick() clearing statuses for ${target.name} - not an array!`, {
        targetId: (target as any).id,
        statusesValue: target.statuses,
        statusesType: typeof target.statuses
      });
      target.statuses = [];
      return;
    }

    for (let i = target.statuses.length - 1; i >= 0; i--) {
      const effect = target.statuses[i];

      this.applyEffectTick(target, effect, context);

      if (effect.turnsRemaining !== undefined && effect.turnsRemaining > 0) {
        effect.turnsRemaining--;
        if (effect.turnsRemaining <= 0) {
          target.statuses.splice(i, 1);
          DebugLogger.info('StatusEffectSystem', `${effect.type} expired on ${target.name}`);
        }
      }
    }

    DebugLogger.debug('StatusEffectSystem', `tick() completed on ${target.name}`, {
      targetId: (target as any).id,
      statusesAfter: target.statuses
    });
  }

  public getResistanceChance(target: ICharacter | Monster, effectType: CharacterStatus): number {
    let resistance = 0;

    if (this.isCharacter(target)) {
      const character = target as ICharacter;
      const racialResistances = RACIAL_RESISTANCES[character.race];
      if (racialResistances && racialResistances.includes(effectType)) {
        resistance += 50;
      }

      const equipmentResistance = this.equipmentManager.getEquipmentResistanceChance(character, effectType);
      resistance += equipmentResistance;
    }

    return Math.min(resistance, 100);
  }

  public hasStatus(target: ICharacter | Monster, effectType: CharacterStatus): boolean {
    if (!Array.isArray(target.statuses)) {
      return false;
    }
    return target.statuses.some(s => s.type === effectType);
  }

  public getStatus(target: ICharacter | Monster, effectType: CharacterStatus): ActiveStatusEffect | undefined {
    if (!Array.isArray(target.statuses)) {
      return undefined;
    }
    return target.statuses.find(s => s.type === effectType);
  }

  public getAllStatuses(target: ICharacter | Monster): ActiveStatusEffect[] {
    if (!Array.isArray(target.statuses)) {
      return [];
    }
    return [...target.statuses];
  }

  public getStatusesBySource(target: ICharacter | Monster, source: string): ActiveStatusEffect[] {
    if (!Array.isArray(target.statuses)) {
      return [];
    }
    return target.statuses.filter(s => s.source === source);
  }

  public removeStatusBySource(target: ICharacter | Monster, source: string): number {
    if (!Array.isArray(target.statuses)) {
      target.statuses = [];
      return 0;
    }

    const initialLength = target.statuses.length;
    target.statuses = target.statuses.filter(s => s.source !== source);
    const removedCount = initialLength - target.statuses.length;

    if (removedCount > 0) {
      DebugLogger.info('StatusEffectSystem', `Removed ${removedCount} status(es) from ${target.name} with source: ${source}`);

      const hasDeathStatus = target.statuses.some(s =>
        s.type === 'Dead' || s.type === 'Ashed' || s.type === 'Lost'
      );
      target.isDead = hasDeathStatus;
    }

    return removedCount;
  }

  public isDisabled(target: ICharacter | Monster): boolean {
    return this.hasStatus(target, 'Sleeping') ||
           this.hasStatus(target, 'Paralyzed') ||
           this.hasStatus(target, 'Stoned');
  }

  private isCharacter(target: ICharacter | Monster): target is ICharacter {
    return 'race' in target;
  }

  private handleExclusiveStatuses(target: ICharacter | Monster, newEffectType: CharacterStatus): void {
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

  private applyEffectTick(target: ICharacter | Monster, effect: ActiveStatusEffect, context: StatusEffectContext): void {
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
        break;

      case 'Silenced':
        if (context === 'combat' && effect.casterLevel && this.isCharacter(target)) {
          const character = target as ICharacter;
          const recoveryChance = Math.min(20 + character.level * 2, 60);
          const roll = DiceRoller.rollPercentile();
          if (roll <= recoveryChance) {
            this.removeStatusEffect(target, 'Silenced');
            DebugLogger.info('StatusEffectSystem', `${target.name} recovered from silence`);
          }
        }
        break;

      case 'Confused':
        if (context === 'combat') {
          const recoveryChance = 15;
          const roll = DiceRoller.rollPercentile();
          if (roll <= recoveryChance) {
            this.removeStatusEffect(target, 'Confused');
            DebugLogger.info('StatusEffectSystem', `${target.name} is no longer confused`);
          }
        }
        break;

      case 'Afraid':
        if (context === 'combat' && this.isCharacter(target)) {
          const character = target as ICharacter;
          const mpDrain = 1;
          character.mp = Math.max(0, character.mp - mpDrain);
          DebugLogger.debug('StatusEffectSystem', `${character.name} loses ${mpDrain} MP from fear`);

          const recoveryChance = 10 + character.level;
          const roll = DiceRoller.rollPercentile();
          if (roll <= recoveryChance) {
            this.removeStatusEffect(target, 'Afraid');
            DebugLogger.info('StatusEffectSystem', `${character.name} overcomes their fear`);
          }
        }
        break;

      case 'Blinded':
        if (context === 'combat') {
          const recoveryChance = 10;
          const roll = DiceRoller.rollPercentile();
          if (roll <= recoveryChance) {
            this.removeStatusEffect(target, 'Blinded');
            DebugLogger.info('StatusEffectSystem', `${target.name} can see again`);
          }
        }
        break;

      case 'Cursed':
        if (context === 'exploration') {
          const damage = DiceRoller.roll('1d2');
          target.hp = Math.max(1, target.hp - damage);
          DebugLogger.debug('StatusEffectSystem', `${target.name} takes ${damage} damage from curse while exploring`);
        }
        break;
    }
  }
}
