import { CombatAction, CombatActionContext, CombatActionParams, CombatActionResult } from './CombatAction';
import { EntityUtils } from '../../../utils/EntityUtils';

export class DefendAction implements CombatAction {
  readonly name = 'Defend';

  canExecute(context: CombatActionContext, _params: CombatActionParams): boolean {
    const currentUnit = context.getCurrentUnit();
    return currentUnit !== null && EntityUtils.isCharacter(currentUnit);
  }

  execute(context: CombatActionContext, _params: CombatActionParams): CombatActionResult {
    const currentUnit = context.getCurrentUnit();
    if (!currentUnit || !EntityUtils.isCharacter(currentUnit)) {
      return { success: false, message: 'Invalid defender' };
    }

    context.modifierSystem.applyModifier(currentUnit, 'evasion', 2, {
      duration: 1,
      source: 'Defend',
      countsOnlyInCombat: true
    });

    return {
      success: true,
      message: `${currentUnit.name} defends! (Evasion +2 for 1 turn)`
    };
  }
}
