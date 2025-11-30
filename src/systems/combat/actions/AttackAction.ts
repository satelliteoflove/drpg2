import { CombatAction, CombatActionContext, CombatActionParams, CombatActionResult } from './CombatAction';
import { EntityUtils } from '../../../utils/EntityUtils';
import { GameServices } from '../../../services/GameServices';
import { SFX_CATALOG } from '../../../config/AudioConstants';
import { calculateAttackDelay } from '../../../config/InitiativeConstants';
import { WeaponSpeedCategory } from '../../../types/InitiativeTypes';

export class AttackAction implements CombatAction {
  readonly name = 'Attack';

  canExecute(context: CombatActionContext, _params: CombatActionParams): boolean {
    const aliveMonsters = context.encounter.monsters.filter((m) => m.hp > 0);
    return aliveMonsters.length > 0;
  }

  execute(context: CombatActionContext, params: CombatActionParams): CombatActionResult {
    const currentUnit = context.getCurrentUnit();
    if (!currentUnit || !EntityUtils.isCharacter(currentUnit)) {
      return { success: false, message: 'Invalid attacker', delay: 0 };
    }

    const aliveMonsters = context.encounter.monsters.filter((m) => m.hp > 0);
    if (aliveMonsters.length === 0) {
      return { success: false, message: 'No targets available', delay: 0 };
    }

    const target =
      params.targetIndex !== undefined && params.targetIndex < aliveMonsters.length
        ? aliveMonsters[params.targetIndex]
        : aliveMonsters[Math.floor(Math.random() * aliveMonsters.length)];

    const damage = context.damageCalculator.calculateDamage(currentUnit, target);
    target.hp = Math.max(0, target.hp - damage);

    if (damage > 0) {
      GameServices.getInstance().getAudioManager().playSfx(SFX_CATALOG.COMBAT.SWORD_HIT);
    } else {
      GameServices.getInstance().getAudioManager().playSfx(SFX_CATALOG.COMBAT.SWORD_MISS);
    }

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
      GameServices.getInstance().getAudioManager().playSfx(SFX_CATALOG.COMBAT.ENEMY_DEATH);
      message += ` ${target.name} is defeated!`;
      context.cleanupDeadUnits();
    }

    return {
      success: true,
      message,
      delay: this.getDelay(context, params)
    };
  }

  getDelay(context: CombatActionContext, _params: CombatActionParams): number {
    const currentUnit = context.getCurrentUnit();
    if (!currentUnit || !EntityUtils.isCharacter(currentUnit)) {
      return calculateAttackDelay('unarmed');
    }

    const weapon = currentUnit.equipment.weapon;
    const speedCategory: WeaponSpeedCategory = weapon?.speedCategory || 'unarmed';
    const agility = currentUnit.stats.agility;
    return calculateAttackDelay(speedCategory, agility);
  }
}
