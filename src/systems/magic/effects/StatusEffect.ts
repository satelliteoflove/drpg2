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

    for (const targetInfo of targets) {
      const target = targetInfo.entity;
      const targetName = this.getEntityName(target);

      if (!this.isCharacter(target) && !targetInfo.isAlly) {
        result.messages.push(`${spell.name} has no effect on ${targetName}!`);
        continue;
      }

      if (this.isCharacter(target) && target.isDead) {
        result.messages.push(`${targetName} is dead and cannot be affected!`);
        continue;
      }

      const saveSuccess = config.saveType && config.saveModifier !== undefined
        ? this.checkSavingThrow(target, config.saveType, config.saveModifier)
        : false;

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

      const applied = this.isCharacter(target)
        ? this.statusEffectSystem.applyStatusEffect(target, statusType, {
            duration,
            ignoreResistance
          })
        : false;

      if (applied) {
        result.targets.push({
          target: targetInfo,
          statusApplied: config.statusType
        });

        const durationText = duration ? ` for ${duration} turns` : '';
        result.messages.push(`${targetName} is ${this.getStatusPastTense(config.statusType)}${durationText}!`);
      } else {
        result.targets.push({
          target: targetInfo,
          immune: true,
          statusApplied: undefined
        });
        result.messages.push(`${targetName} resists ${config.statusType}!`);
      }
    }

    return result;
  }

  private evaluateDuration(durationFormula: string, level: number): number {
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
      'stoned': 'Stoned'
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
      'berserk': 'enraged'
    };

    return pastTenseMap[statusType] || statusType;
  }
}
