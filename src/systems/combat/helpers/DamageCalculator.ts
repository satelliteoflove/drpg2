import { Character } from '../../../entities/Character';
import { Monster } from '../../../types/GameTypes';
import { DebugLogger } from '../../../utils/DebugLogger';
import { EntityUtils } from '../../../utils/EntityUtils';
import { DiceRoller } from '../../../utils/DiceRoller';
import { GAME_CONFIG } from '../../../config/GameConstants';

export interface AttackResult {
  hit: boolean;
  damage: number;
  hitRoll?: number;
  threshold?: number;
}

export class DamageCalculator {
  rollToHit(attacker: Character, target: Monster): { hit: boolean; roll: number; threshold: number } {
    const accuracy = attacker.accuracy;
    const evasion = EntityUtils.getEffectiveEvasion(target);
    const threshold = GAME_CONFIG.COMBAT.HIT_ROLL.BASE_THRESHOLD + evasion;
    const roll = DiceRoller.rollInRange(1, GAME_CONFIG.COMBAT.HIT_ROLL.D20_SIDES);
    const totalRoll = roll + accuracy;
    const hit = totalRoll >= threshold;

    DebugLogger.debug('DamageCalculator', `Hit roll: d20(${roll}) + accuracy(${accuracy}) = ${totalRoll} vs threshold(10 + evasion ${evasion}) = ${threshold}`, {
      attacker: attacker.name,
      target: target.name,
      accuracy,
      evasion,
      roll,
      totalRoll,
      threshold,
      hit
    });

    return { hit, roll: totalRoll, threshold };
  }

  private calculateBaseDamage(attacker: Character): { baseDamage: number; strengthBonus: number; damageBonus: number } {
    const weapon = attacker.equipment.weapon;
    let weaponDamage: number;

    if (weapon && weapon.effects) {
      const damageEffect = weapon.effects.find((effect) => effect.type === 'damage');
      if (damageEffect && damageEffect.type === 'damage') {
        weaponDamage = DiceRoller.roll(`1d${damageEffect.value * 2}`);
        DebugLogger.debug('DamageCalculator', `${attacker.name} attacks with ${weapon.name}`, {
          weaponDice: `1d${damageEffect.value * 2}`,
          rolled: weaponDamage
        });
      } else {
        weaponDamage = DiceRoller.roll(GAME_CONFIG.COMBAT.DAMAGE.UNARMED_DICE);
      }
    } else {
      weaponDamage = DiceRoller.roll(GAME_CONFIG.COMBAT.DAMAGE.UNARMED_DICE);
    }

    const strengthBonus = Math.floor(attacker.stats.strength / GAME_CONFIG.COMBAT.DAMAGE.STRENGTH_DIVISOR);
    const damageBonus = attacker.effectiveDamage;
    const baseDamage = weaponDamage + strengthBonus + damageBonus;

    return { baseDamage, strengthBonus, damageBonus };
  }

  calculateDamage(attacker: Character, target: Monster): number {
    const hitResult = this.rollToHit(attacker, target);
    if (!hitResult.hit) {
      DebugLogger.info('DamageCalculator', `${attacker.name} misses ${target.name}!`);
      return 0;
    }

    const { baseDamage, strengthBonus, damageBonus } = this.calculateBaseDamage(attacker);
    const damageReduction = EntityUtils.getEffectiveDamageReduction(target);
    const finalDamage = Math.max(GAME_CONFIG.COMBAT.DAMAGE.MIN_DAMAGE, baseDamage - damageReduction);

    DebugLogger.info('DamageCalculator', `${attacker.name} hits ${target.name} for ${finalDamage} damage!`, {
      baseDamage,
      strengthBonus,
      damageBonus,
      damageReduction,
      finalDamage
    });

    return finalDamage;
  }

  calculateDamageWithResult(attacker: Character, target: Monster): AttackResult {
    const hitResult = this.rollToHit(attacker, target);
    if (!hitResult.hit) {
      return {
        hit: false,
        damage: 0,
        hitRoll: hitResult.roll,
        threshold: hitResult.threshold
      };
    }

    const { baseDamage } = this.calculateBaseDamage(attacker);
    const damageReduction = EntityUtils.getEffectiveDamageReduction(target);
    const finalDamage = Math.max(GAME_CONFIG.COMBAT.DAMAGE.MIN_DAMAGE, baseDamage - damageReduction);

    return {
      hit: true,
      damage: finalDamage,
      hitRoll: hitResult.roll,
      threshold: hitResult.threshold
    };
  }
}
