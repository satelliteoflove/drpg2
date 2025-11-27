import { SpellEffectProcessor, EffectTarget, EffectResult } from '../SpellEffectProcessor';
import { Character } from '../../../entities/Character';
import { SpellData, SpellCastingContext } from '../../../types/SpellTypes';
import { ModifierEffectConfig, SpellEffectConfig } from '../../../data/spells/SpellEffectTypes';
import { ModifierSystem, ModifierStat } from '../../ModifierSystem';
import { DebugLogger } from '../../../utils/DebugLogger';

export class DebuffEffect extends SpellEffectProcessor {
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
    const config = effect as ModifierEffectConfig;
    const result: EffectResult = {
      success: true,
      targets: [],
      messages: []
    };

    const duration = config.duration ? this.evaluateDuration(config.duration, caster.level) : undefined;
    const stat = config.stat as ModifierStat;
    const value = config.value;

    if (config.affectsEnemies && context.enemies) {
      let affectedCount = 0;

      for (const enemy of context.enemies) {
        if (this.isMonster(enemy) && enemy.hp <= 0) continue;

        const saveSuccess = this.checkSavingThrow(enemy, 'magical', 0);
        if (saveSuccess) {
          continue;
        }

        if (this.isCharacter(enemy)) {
          this.modifierSystem.applyModifier(enemy, stat, value, {
            duration,
            source: spell.name,
            casterLevel: caster.level,
            countsOnlyInCombat: config.countsOnlyInCombat
          });

          result.targets.push({
            target: { entity: enemy, isAlly: false }
          });
          affectedCount++;
        }
      }

      if (affectedCount > 0) {
        result.messages.push(this.getDebuffMessage(spell.name, stat, value, affectedCount));
        DebugLogger.info('DebuffEffect', `Applied ${stat} debuff to ${affectedCount} enemies`, {
          spell: spell.name,
          stat,
          value,
          duration
        });
      } else {
        result.messages.push(`All enemies resist ${spell.name}!`);
      }
    } else {
      for (const targetInfo of targets) {
        const target = targetInfo.entity;
        const targetName = this.getEntityName(target);

        if (this.isMonster(target) && target.hp <= 0) {
          result.messages.push(`${targetName} is already defeated!`);
          continue;
        }

        const saveSuccess = this.checkSavingThrow(target, 'magical', 0);
        if (saveSuccess) {
          result.targets.push({
            target: targetInfo,
            saved: true
          });
          result.messages.push(`${targetName} resists ${spell.name}!`);
          continue;
        }

        if (this.isCharacter(target)) {
          this.modifierSystem.applyModifier(target, stat, value, {
            duration,
            source: spell.name,
            casterLevel: caster.level,
            countsOnlyInCombat: config.countsOnlyInCombat
          });

          result.targets.push({
            target: targetInfo
          });

          const durationText = duration && duration > 0 ? ` for ${duration} turns` : '';
          result.messages.push(`${targetName} suffers ${this.getDebuffDescription(stat, value)}${durationText}!`);

          DebugLogger.info('DebuffEffect', `Applied ${stat} debuff to ${targetName}`, {
            spell: spell.name,
            stat,
            value,
            duration
          });
        }
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

  private getDebuffMessage(spellName: string, stat: ModifierStat, value: number, count: number): string {
    const effect = this.getDebuffDescription(stat, value);
    const targets = count === 1 ? '1 enemy' : `${count} enemies`;
    return `${spellName} afflicts ${targets} with ${effect}!`;
  }

  private getDebuffDescription(stat: ModifierStat, value: number): string {
    const sign = value > 0 ? '+' : '';

    switch (stat) {
      case 'evasion':
        return `${sign}${value} evasion penalty`;
      case 'damageReduction':
        return `${sign}${value} DR penalty`;
      case 'attack':
        return `${sign}${value} attack penalty`;
      case 'damage':
        return `${sign}${value} damage penalty`;
      case 'speed':
        return `${sign}${value} speed penalty`;
      default:
        return `${sign}${value} ${stat} penalty`;
    }
  }
}
