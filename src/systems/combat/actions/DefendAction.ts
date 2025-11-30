import { CombatAction, CombatActionContext, CombatActionParams, CombatActionResult } from './CombatAction';
import { EntityUtils } from '../../../utils/EntityUtils';
import { INITIATIVE } from '../../../config/InitiativeConstants';

export class DefendAction implements CombatAction {
  readonly name = 'Defend';

  canExecute(context: CombatActionContext, _params: CombatActionParams): boolean {
    const currentUnit = context.getCurrentUnit();
    return currentUnit !== null && EntityUtils.isCharacter(currentUnit);
  }

  execute(context: CombatActionContext, params: CombatActionParams): CombatActionResult {
    const currentUnit = context.getCurrentUnit();
    if (!currentUnit || !EntityUtils.isCharacter(currentUnit)) {
      return { success: false, message: 'Invalid defender', delay: 0 };
    }

    context.modifierSystem.applyModifier(currentUnit, 'evasion', 2, {
      duration: 1,
      source: 'Defend',
      countsOnlyInCombat: true
    });

    return {
      success: true,
      message: `${currentUnit.name} defends! (Evasion +2 for 1 turn)`,
      delay: this.getDelay(context, params)
    };
  }

  getDelay(context: CombatActionContext, _params: CombatActionParams): number {
    const currentUnit = context.getCurrentUnit();
    const baseDelay = INITIATIVE.ACTION_DELAYS.DEFEND;
    if (!currentUnit || !EntityUtils.isCharacter(currentUnit)) {
      return baseDelay;
    }
    const agilityModifier = Math.floor((currentUnit.stats.agility - 10) / 4);
    return Math.max(4, baseDelay - agilityModifier);
  }
}
