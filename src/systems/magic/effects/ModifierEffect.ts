import { SpellEffectProcessor, EffectTarget, EffectResult } from '../SpellEffectProcessor';
import { Character } from '../../../entities/Character';
import { SpellData, SpellCastingContext } from '../../../types/SpellTypes';
import { ModifierEffectConfig, SpellEffectConfig } from '../../../data/spells/SpellEffectTypes';
import { ModifierSystem, ModifierStat, ActiveModifier } from '../../ModifierSystem';

export class ModifierEffect extends SpellEffectProcessor {
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

    if (config.affectsAllies && context.party) {
      for (const ally of context.party) {
        if (ally.isDead) continue;

        this.modifierSystem.applyModifier(ally, stat, value, {
          duration,
          source: spell.name,
          casterLevel: caster.level,
          countsOnlyInCombat: config.countsOnlyInCombat
        });

        result.targets.push({
          target: { entity: ally, isAlly: true }
        });
      }

      result.messages.push(this.getModifierMessage(spell.name, stat, value, true));
    }

    if (config.affectsEnemies && context.enemies) {
      for (const enemy of context.enemies) {
        if (enemy.hp <= 0) continue;
        if (this.isMonster(enemy) && enemy.isDead) continue;

        if (this.isCharacter(enemy)) {
          this.modifierSystem.applyModifier(enemy, stat, value, {
            duration,
            source: spell.name,
            casterLevel: caster.level,
            countsOnlyInCombat: config.countsOnlyInCombat
          });
        } else if (this.isMonster(enemy)) {
          if (!enemy.modifiers) {
            enemy.modifiers = [];
          }
          const modifier: ActiveModifier = {
            stat,
            value,
            source: spell.name,
            turnsRemaining: duration,
            casterLevel: caster.level,
            countsOnlyInCombat: config.countsOnlyInCombat
          };
          enemy.modifiers.push(modifier);
        }

        result.targets.push({
          target: { entity: enemy, isAlly: false }
        });
      }

      result.messages.push(this.getModifierMessage(spell.name, stat, value, false));
    }

    if (!config.affectsAllies && !config.affectsEnemies) {
      for (const targetInfo of targets) {
        const target = targetInfo.entity;
        const targetName = this.getEntityName(target);

        if (!this.isCharacter(target)) {
          result.messages.push(`${spell.name} has no effect on ${targetName}!`);
          continue;
        }

        if (target.isDead) {
          result.messages.push(`${targetName} is dead and cannot be affected!`);
          continue;
        }

        this.modifierSystem.applyModifier(target, stat, value, {
          duration,
          source: spell.name,
          casterLevel: caster.level,
          countsOnlyInCombat: config.countsOnlyInCombat
        });

        result.targets.push({
          target: targetInfo
        });

        const durationText = duration ? ` for ${duration} turns` : '';
        result.messages.push(`${targetName} gains ${this.getStatDescription(stat, value)}${durationText}!`);
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

  private getModifierMessage(spellName: string, stat: ModifierStat, value: number, isAlly: boolean): string {
    const target = isAlly ? 'party' : 'enemies';
    const effect = this.getStatDescription(stat, value);

    return `${spellName} grants ${effect} to ${target}!`;
  }

  private getStatDescription(stat: ModifierStat, value: number): string {
    const sign = value > 0 ? '+' : '';

    switch (stat) {
      case 'ac':
        return `${sign}${value} AC`;
      case 'attack':
        return `${sign}${value} attack`;
      case 'damage':
        return `${sign}${value} damage`;
      case 'speed':
        return `${sign}${value} speed`;
      default:
        return `${sign}${value} ${stat}`;
    }
  }
}
