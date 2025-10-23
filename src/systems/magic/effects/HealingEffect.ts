import { SpellEffectProcessor, EffectTarget, EffectResult } from '../SpellEffectProcessor';
import { Character } from '../../../entities/Character';
import { SpellData, SpellCastingContext } from '../../../types/SpellTypes';
import { HealingEffectConfig, STATUS_CURE_GROUPS, SpellEffectConfig } from '../../../data/spells/SpellEffectTypes';

export class HealingEffect extends SpellEffectProcessor {
  processEffect(
    caster: Character,
    spell: SpellData,
    effect: SpellEffectConfig,
    targets: EffectTarget[],
    _context: SpellCastingContext
  ): EffectResult {
    const config = effect as HealingEffectConfig;
    const result: EffectResult = {
      success: true,
      targets: [],
      messages: []
    };

    for (const targetInfo of targets) {
      const target = targetInfo.entity;
      const targetName = this.getEntityName(target);

      if (!targetInfo.isAlly && !this.isCharacter(target)) {
        result.messages.push(`${spell.name} has no effect on ${targetName}!`);
        continue;
      }

      if (this.isCharacter(target) && target.isDead) {
        result.messages.push(`${targetName} is dead and cannot be healed!`);
        continue;
      }

      let healingAmount = 0;

      if (config.fullHeal) {
        const maxHP = this.getEntityMaxHP(target);
        const currentHP = this.getEntityHP(target);
        healingAmount = maxHP - currentHP;
      } else if (config.percentHeal) {
        const maxHP = this.getEntityMaxHP(target);
        healingAmount = Math.floor(maxHP * config.percentHeal / 100);
      } else {
        const healingFormula = config.baseHealing || '1d6';
        const baseHealing = this.evaluateFormula(healingFormula, caster.level);
        const perLevelBonus = config.healingPerLevel || 0;
        const baseAmount = baseHealing + (perLevelBonus * caster.level);

        const spellPower = this.calculateSpellPower(caster, spell);
        healingAmount = Math.floor(baseAmount * spellPower / 100);
      }

      const actualHealing = this.applyHealing(target, healingAmount);

      const curedStatuses: string[] = [];
      if (config.cureStatuses && this.isCharacter(target)) {
        for (const statusType of config.cureStatuses) {
          if (this.removeStatus(target, statusType)) {
            curedStatuses.push(statusType);
          }
        }
      }

      result.targets.push({
        target: targetInfo,
        healing: actualHealing,
        statusApplied: curedStatuses.length > 0 ? `cured: ${curedStatuses.join(', ')}` : undefined
      });

      if (actualHealing > 0) {
        result.messages.push(`${targetName} recovers ${actualHealing} HP!`);
      }

      if (curedStatuses.length > 0) {
        result.messages.push(`${targetName} is cured of ${curedStatuses.join(', ')}!`);
      }
    }

    return result;
  }

  private removeStatus(character: Character, statusType: string): boolean {
    const statusGroups = STATUS_CURE_GROUPS[statusType];

    const capitalizeFirst = (str: string): string => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };

    if (!statusGroups) {
      const capitalizedStatus = capitalizeFirst(statusType);
      const index = character.statuses.findIndex(s => s.type === capitalizedStatus);
      if (index !== -1) {
        character.statuses.splice(index, 1);
        return true;
      }
      return false;
    }

    let removed = false;
    for (const status of statusGroups) {
      const capitalizedStatus = capitalizeFirst(status);
      const index = character.statuses.findIndex(s => s.type === capitalizedStatus);
      if (index !== -1) {
        character.statuses.splice(index, 1);
        removed = true;
      }
    }

    return removed;
  }
}