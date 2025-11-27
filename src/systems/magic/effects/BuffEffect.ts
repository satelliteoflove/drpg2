import { SpellEffectProcessor, EffectTarget, EffectResult } from '../SpellEffectProcessor';
import { Character } from '../../../entities/Character';
import { SpellData, SpellCastingContext } from '../../../types/SpellTypes';
import { BuffEffectConfig, SpellEffectConfig } from '../../../data/spells/SpellEffectTypes';
import { ModifierSystem, ModifierStat } from '../../ModifierSystem';
import { DebugLogger } from '../../../utils/DebugLogger';

export class BuffEffect extends SpellEffectProcessor {
  private modifierSystem: ModifierSystem;

  constructor() {
    super();
    this.modifierSystem = ModifierSystem.getInstance();
  }

  processEffect(
    caster: Character,
    spell: SpellData,
    effect: SpellEffectConfig,
    targets: EffectTarget[],
    context: SpellCastingContext
  ): EffectResult {
    const config = effect as BuffEffectConfig;
    const result: EffectResult = {
      success: true,
      targets: [],
      messages: []
    };

    const duration = config.duration ? this.evaluateDuration(config.duration, caster.level) : undefined;
    const value = this.evaluateValue(config.value, caster.level);
    const stat = this.mapBuffToStat(config.buffType);

    if (config.partyWide && context.party) {
      for (const ally of context.party) {
        if (ally.isDead) continue;

        this.modifierSystem.applyModifier(ally, stat, value, {
          duration,
          source: spell.name,
          casterLevel: caster.level,
          countsOnlyInCombat: true
        });

        result.targets.push({
          target: { entity: ally, isAlly: true },
          buffApplied: config.buffType
        });
      }

      result.messages.push(this.getBuffMessage(spell.name, config.buffType, value, true));
      DebugLogger.info('BuffEffect', `Applied ${config.buffType} buff to party`, {
        spell: spell.name,
        stat,
        value,
        duration
      });
    } else {
      for (const targetInfo of targets) {
        const target = targetInfo.entity;
        const targetName = this.getEntityName(target);

        if (!this.isCharacter(target)) {
          result.messages.push(`${spell.name} has no effect on ${targetName}!`);
          continue;
        }

        if (target.isDead) {
          result.messages.push(`${targetName} is dead and cannot be buffed!`);
          continue;
        }

        this.modifierSystem.applyModifier(target, stat, value, {
          duration,
          source: spell.name,
          casterLevel: caster.level,
          countsOnlyInCombat: true
        });

        result.targets.push({
          target: targetInfo,
          buffApplied: config.buffType
        });

        const durationText = duration && duration > 0 ? ` for ${duration} turns` : '';
        result.messages.push(`${targetName} gains ${this.getBuffDescription(config.buffType, value)}${durationText}!`);

        DebugLogger.info('BuffEffect', `Applied ${config.buffType} buff to ${targetName}`, {
          spell: spell.name,
          stat,
          value,
          duration
        });
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

  private evaluateValue(value: number | string, level: number): number {
    if (typeof value === 'number') {
      return value;
    }

    if (value.includes('level')) {
      return this.evaluateFormula(value, level);
    }

    return parseInt(value, 10) || 0;
  }

  private mapBuffToStat(buffType: string): ModifierStat {
    const mapping: Record<string, ModifierStat> = {
      'ac_bonus': 'evasion',
      'defense_bonus': 'evasion',
      'attack_bonus': 'attack',
      'damage_bonus': 'damage',
      'speed_bonus': 'speed',
      'shield': 'damageReduction',
      'protection': 'evasion'
    };

    return mapping[buffType] || 'evasion';
  }

  private getBuffMessage(spellName: string, buffType: string, value: number, isParty: boolean): string {
    const target = isParty ? 'party' : 'target';
    const effect = this.getBuffDescription(buffType, value);
    return `${spellName} grants ${effect} to ${target}!`;
  }

  private getBuffDescription(buffType: string, value: number): string {
    const sign = value > 0 ? '+' : '';

    switch (buffType) {
      case 'ac_bonus':
      case 'defense_bonus':
      case 'protection':
        return `${sign}${value} evasion`;
      case 'shield':
        return `${sign}${value} damage reduction`;
      case 'attack_bonus':
        return `${sign}${value} attack`;
      case 'damage_bonus':
        return `${sign}${value} damage`;
      case 'speed_bonus':
        return `${sign}${value} speed`;
      case 'resistance':
        return `${sign}${value}% resistance`;
      case 'regeneration':
        return `${value} HP regeneration per turn`;
      case 'invisibility':
        return 'invisibility';
      case 'light':
        return 'light';
      case 'levitation':
        return 'levitation';
      default:
        return `${buffType} (${sign}${value})`;
    }
  }
}
