import { CombatAction, CombatActionContext, CombatActionParams, CombatActionResult } from './CombatAction';
import { EntityUtils } from '../../../utils/EntityUtils';

export class AttackAction implements CombatAction {
  readonly name = 'Attack';

  canExecute(context: CombatActionContext, _params: CombatActionParams): boolean {
    const aliveMonsters = context.encounter.monsters.filter((m) => m.hp > 0);
    return aliveMonsters.length > 0;
  }

  execute(context: CombatActionContext, params: CombatActionParams): CombatActionResult {
    const currentUnit = context.getCurrentUnit();
    if (!currentUnit || !EntityUtils.isCharacter(currentUnit)) {
      return { success: false, message: 'Invalid attacker' };
    }

    const aliveMonsters = context.encounter.monsters.filter((m) => m.hp > 0);
    if (aliveMonsters.length === 0) {
      return { success: false, message: 'No targets available' };
    }

    const target =
      params.targetIndex !== undefined && params.targetIndex < aliveMonsters.length
        ? aliveMonsters[params.targetIndex]
        : aliveMonsters[Math.floor(Math.random() * aliveMonsters.length)];

    const damage = context.damageCalculator.calculateDamage(currentUnit, target);
    target.hp = Math.max(0, target.hp - damage);

    let message = `${currentUnit.name} attacks ${target.name} for ${damage} damage!`;

    const weapon = currentUnit.equipment.weapon;
    if (weapon?.onHitEffect && target.hp > 0) {
      const roll = Math.random();
      if (roll < weapon.onHitEffect.chance) {
        const effectApplied = context.weaponEffectApplicator.applyWeaponEffect(
          currentUnit,
          target,
          weapon
        );
        if (effectApplied) {
          message += ` ${effectApplied}`;
        }
      }
    }

    if (target.hp === 0) {
      target.isDead = true;
      message += ` ${target.name} is defeated!`;
      context.cleanupDeadUnits();
    }

    return {
      success: true,
      message
    };
  }
}
