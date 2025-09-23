import { SpellEffectProcessor, EffectTarget, EffectResult } from '../SpellEffectProcessor';
import { Character } from '../../../entities/Character';
import { SpellData, SpellCastingContext } from '../../../types/SpellTypes';
import { DamageEffectConfig, ELEMENTAL_OPPOSITES, SpellEffectConfig } from '../../../data/spells/SpellEffectTypes';

export class DamageEffect extends SpellEffectProcessor {
  processEffect(
    caster: Character,
    spell: SpellData,
    effect: SpellEffectConfig,
    targets: EffectTarget[],
    _context: SpellCastingContext
  ): EffectResult {
    const config = effect as DamageEffectConfig;
    const result: EffectResult = {
      success: true,
      targets: [],
      messages: []
    };

    const damageFormula = config.baseDamage || (effect as any).power || '1d6';
    const baseDamage = this.evaluateFormula(damageFormula, caster.level);
    const perLevelBonus = config.damagePerLevel || 0;
    const baseAmount = baseDamage + (perLevelBonus * caster.level);

    const spellPower = this.calculateSpellPower(caster, spell);
    const totalBaseDamage = Math.floor(baseAmount * spellPower / 100);

    for (const targetInfo of targets) {
      const target = targetInfo.entity;
      const targetName = this.getEntityName(target);

      let damage = totalBaseDamage;

      const resistance = this.getEntityResistance(target, config.element);
      if (resistance > 0) {
        damage = Math.floor(damage * (100 - resistance) / 100);
      }

      const oppositeElement = ELEMENTAL_OPPOSITES[config.element];
      if (oppositeElement) {
        const weakness = this.getEntityResistance(target, oppositeElement);
        if (weakness < 0) {
          damage = Math.floor(damage * (100 - weakness) / 100);
        }
      }

      if (!config.ignoreDefense) {
        const defense = this.getDefenseValue(target);
        damage = Math.max(1, damage - defense);
      }

      if (config.canCritical && Math.random() < this.getCriticalChance(caster)) {
        damage *= 2;
        result.messages.push(`Critical hit!`);
      }

      if (this.isMonster(target) && target.magicResistance) {
        const resistRoll = Math.random() * 100;
        if (resistRoll < target.magicResistance) {
          damage = Math.floor(damage / 2);
          result.messages.push(`${targetName} resists!`);
        }
      }

      const actualDamage = this.applyDamage(target, damage);

      result.targets.push({
        target: targetInfo,
        damage: actualDamage
      });

      result.messages.push(`${targetName} takes ${actualDamage} ${config.element} damage!`);
    }

    return result;
  }

  private getDefenseValue(entity: any): number {
    if (this.isCharacter(entity)) {
      const char = entity as Character;
      return Math.floor(char.ac / 2);
    } else {
      return Math.floor((entity.ac || 0) / 2);
    }
  }

  private getCriticalChance(caster: Character): number {
    const baseCrit = 0.05;
    const luckBonus = caster.stats.luck / 200;
    const levelBonus = caster.level / 100;
    return Math.min(0.25, baseCrit + luckBonus + levelBonus);
  }
}