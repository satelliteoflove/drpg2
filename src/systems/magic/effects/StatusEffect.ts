import { SpellEffectProcessor, EffectTarget, EffectResult } from '../SpellEffectProcessor';
import { Character } from '../../../entities/Character';
import { SpellData, SpellCastingContext } from '../../../types/SpellTypes';
import { StatusEffectConfig, SpellEffectConfig } from '../../../data/spells/SpellEffectTypes';
import { StatusEffectSystem } from '../../StatusEffectSystem';
import { CharacterStatus } from '../../../types/GameTypes';

export class StatusEffect extends SpellEffectProcessor {
  private statusEffectSystem: StatusEffectSystem;

  constructor() {
    super();
    this.statusEffectSystem = StatusEffectSystem.getInstance();
  }

  processEffect(
    caster: Character,
    spell: SpellData,
    effect: SpellEffectConfig,
    targets: EffectTarget[],
    _context: SpellCastingContext
  ): EffectResult {
    const config = effect as StatusEffectConfig;
    const result: EffectResult = {
      success: true,
      targets: [],
      messages: []
    };

    const { DebugLogger } = require('../../../utils/DebugLogger');
    DebugLogger.info('StatusEffect', `Processing status effect: ${config.statusType}`, {
      spell: spell.name,
      targetCount: targets.length,
      statusType: config.statusType,
      duration: config.duration
    });

    for (const targetInfo of targets) {
      const target = targetInfo.entity;
      const targetName = this.getEntityName(target);

      DebugLogger.debug('StatusEffect', `Processing target: ${targetName}`, {
        isDead: this.isCharacter(target) ? target.isDead : (target as any).isDead,
        isCharacter: this.isCharacter(target)
      });

      if (this.isCharacter(target) && target.isDead) {
        result.messages.push(`${targetName} is dead and cannot be affected!`);
        continue;
      }

      const saveSuccess = config.saveType && config.saveModifier !== undefined
        ? this.checkSavingThrow(target, config.saveType, config.saveModifier)
        : false;

      DebugLogger.debug('StatusEffect', `Saving throw result for ${targetName}:`, {
        saveSuccess,
        saveType: config.saveType,
        saveModifier: config.saveModifier
      });

      if (saveSuccess) {
        result.targets.push({
          target: targetInfo,
          saved: true,
          statusApplied: undefined
        });
        result.messages.push(`${targetName} resists ${spell.name}!`);
        continue;
      }

      const statusType = this.mapStatusEffectType(config.statusType);
      if (!statusType) {
        result.messages.push(`Invalid status effect type: ${config.statusType}`);
        continue;
      }

      const duration = config.duration ? this.evaluateDuration(config.duration, caster.level) : undefined;

      const ignoreResistance = config.resistanceCheck === false;

      DebugLogger.debug('StatusEffect', `Applying ${statusType} to ${targetName}`, {
        duration,
        ignoreResistance
      });

      const applied = this.statusEffectSystem.applyStatusEffect(target, statusType, {
        duration,
        ignoreResistance
      });

      DebugLogger.info('StatusEffect', `Status application result for ${targetName}:`, {
        applied,
        statusType,
        duration
      });

      if (applied) {
        result.targets.push({
          target: targetInfo,
          statusApplied: config.statusType
        });

        const durationText = duration ? ` for ${duration} turns` : '';
        const message = `${targetName} is ${this.getStatusPastTense(config.statusType)}${durationText}!`;
        result.messages.push(message);
      } else {
        result.targets.push({
          target: targetInfo,
          immune: true,
          statusApplied: undefined
        });
        const message = `${targetName} resists ${config.statusType}!`;
        result.messages.push(message);
      }
    }

    DebugLogger.info('StatusEffect', `Returning result with ${result.messages.length} message(s)`, {
      messages: result.messages,
      targetCount: result.targets?.length || 0
    });

    return result;
  }

  private evaluateDuration(durationFormula: string | number, level: number): number {
    if (typeof durationFormula === 'number') {
      return durationFormula;
    }

    if (durationFormula === 'combat') {
      return -1;
    }

    if (durationFormula.includes('d')) {
      return this.evaluateFormula(durationFormula, level);
    }

    return parseInt(durationFormula, 10) || 0;
  }

  private mapStatusEffectType(statusEffectType: string): CharacterStatus | null {
    const mapping: Record<string, CharacterStatus> = {
      'sleep': 'Sleeping',
      'paralyzed': 'Paralyzed',
      'poisoned': 'Poisoned',
      'stoned': 'Stoned',
      'silenced': 'Silenced',
      'blinded': 'Blinded',
      'confused': 'Confused',
      'afraid': 'Afraid',
      'charmed': 'Charmed',
      'berserk': 'Berserk',
      'blessed': 'Blessed',
      'cursed': 'Cursed',
      'dead': 'Dead',
      'ashed': 'Ashed'
    };

    return mapping[statusEffectType] || null;
  }

  private getStatusPastTense(statusType: string): string {
    const pastTenseMap: Record<string, string> = {
      'sleep': 'asleep',
      'paralyzed': 'paralyzed',
      'poisoned': 'poisoned',
      'silenced': 'silenced',
      'blinded': 'blinded',
      'confused': 'confused',
      'stoned': 'petrified',
      'dead': 'dead',
      'ashed': 'turned to ash',
      'lost': 'lost',
      'afraid': 'frightened',
      'charmed': 'charmed',
      'berserk': 'enraged',
      'blessed': 'blessed',
      'cursed': 'cursed'
    };

    return pastTenseMap[statusType] || statusType;
  }
}
