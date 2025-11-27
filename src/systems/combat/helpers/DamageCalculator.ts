import { Character } from '../../../entities/Character';
import { Monster } from '../../../types/GameTypes';
import { DebugLogger } from '../../../utils/DebugLogger';
import { EntityUtils } from '../../../utils/EntityUtils';

export class DamageCalculator {
  calculateDamage(attacker: Character, target: Monster): number {
    let baseDamage = Math.floor(attacker.stats.strength / 2) + Math.floor(Math.random() * 6) + 1;

    const weapon = attacker.equipment.weapon;
    if (weapon && weapon.effects) {
      const damageEffect = weapon.effects.find((effect) => effect.type === 'damage');
      if (damageEffect && damageEffect.type === 'damage') {
        baseDamage += damageEffect.value;
        DebugLogger.info(
          'DamageCalculator',
          `${attacker.name} attacks with ${weapon.name} for +${damageEffect.value} damage!`
        );
      }
    }

    const attackBonus = attacker.effectiveAttack - Math.floor(attacker.level / 2);
    const damageBonus = attacker.effectiveDamage;
    baseDamage += attackBonus + damageBonus;

    const defense = Math.floor(EntityUtils.getEffectiveAC(target) / 2);
    return Math.max(1, baseDamage - defense);
  }
}
