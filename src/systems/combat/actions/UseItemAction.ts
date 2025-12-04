import { CombatAction, CombatActionContext, CombatActionParams, CombatActionResult } from './CombatAction';
import { EntityUtils } from '../../../utils/EntityUtils';
import { INITIATIVE } from '../../../config/InitiativeConstants';

export class UseItemAction implements CombatAction {
  readonly name = 'Use Item';

  canExecute(context: CombatActionContext, _params: CombatActionParams): boolean {
    const currentUnit = context.getCurrentUnit();
    return currentUnit !== null && EntityUtils.isCharacter(currentUnit);
  }

  execute(context: CombatActionContext, params: CombatActionParams): CombatActionResult {
    const currentUnit = context.getCurrentUnit();
    if (!currentUnit || !EntityUtils.isCharacter(currentUnit)) {
      return { success: false, message: 'Invalid item user', delay: 0 };
    }

    return {
      success: true,
      message: `${currentUnit.name} uses an item!`,
      delay: this.getDelay(context, params)
    };
  }

  getDelay(_context: CombatActionContext, _params: CombatActionParams): number {
    return INITIATIVE.BASE_CHARGE_TIMES.USE_ITEM;
  }
}
